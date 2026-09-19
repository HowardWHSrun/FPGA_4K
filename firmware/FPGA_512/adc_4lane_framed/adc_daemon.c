/* adc_daemon.c — continuous receiver for the 4-lane framed ADC stream
 *
 * Owns the FT600 exclusively and runs forever:
 *
 *   [USB reader thread]  FT_ReadPipe 0x82 -> 256 MB SPSC byte ring
 *   [decoder thread]     ring -> frame decode -> 512-sample slices
 *                          -> optional WAV recording (any channel subset)
 *                          -> publish ring (last ~2 s of all 512 channels)
 *   [control server]     Unix socket /tmp/adc_daemon.sock, line-based text:
 *       cmd <name>                   board command (chip-reset, fe-on, spi, ...)
 *       record start <path> <chans>  chans = "all" | "0-63,320,384-447"
 *       record stop
 *       stats
 *       plot <chans> <decim>         switch connection to binary plot stream
 *       quit                         shut the daemon down
 *     Async events pushed to all text clients: "!drops lane=2 n=5 total=37"
 *
 * Design constraints (hardware-verified, see docs/FRAMING_SPEC.txt and
 * wave_record.c):
 *   - the read loop must never stall > ~1-2 ms or the FPGA drops samples
 *     (reported via the LANE_ID drop nibble); hence reader thread does
 *     nothing but FT_ReadPipe -> ring.
 *   - table-driven CRC-12 required to sustain 16.5 MB/s.
 *   - startup flush must tolerate empty reads (pipe is empty right after
 *     FT_SetStreamPipe).
 *
 * Frame: {F,SYNC}{E,LANE_ID}{D,CYCLE_CNT}{0,DATA}x128{C,CRC-12}
 * LANE_ID payload {hi,~hi}, hi = {drop_cnt[3:0], lane[1:0]}.
 * Channel map: wav_ch = line*64 + amp, line = 2*lane + odd (D1..D8 - 1).
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdarg.h>
#include <stdatomic.h>
#include <pthread.h>
#include <unistd.h>
#include <errno.h>
#include <signal.h>
#include <time.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/stat.h>
/* Official FTDI D3XX header (/usr/local/include) — needed for the
 * overlapped/async read API; the local minimal ftd3xx.h lacks it. */
#include <ftd3xx.h>

#define SOCK_PATH    "/tmp/adc_daemon.sock"
/* 512 KB stream/read size: reads still return partial data as it arrives,
 * but larger queued transfers let the xHCI controller keep DMA-ing through
 * multi-ms host scheduler stalls (each transfer completion is a submission
 * point where a starved D3XX worker thread would otherwise idle the bus). */
#define CHUNK_SIZE   (512 * 1024)
#define FLUSH_BYTES  (512 * 1024)
#define RING_BYTES   ((size_t)256 * 1024 * 1024)   /* ~15 s @ 16.5 MB/s */

#define N_CHANNELS   512
#define SAMPLE_RATE  15625
#define PUB_SLICES   32768        /* publish ring: ~2.1 s of all channels */

#define MAX_CLIENTS  8
#define EVQ_LEN      64
#define EV_MAXLEN    128

/* ---- CRC-12 ITU-T (poly 0x80F), table-driven (matches usb_framer) ---- */
static unsigned short crc_tab[4096];

static void crc12_init(void) {
    for (int x = 0; x < 4096; x++) {
        unsigned short crc = (unsigned short)x;
        for (int i = 0; i < 12; i++)
            crc = (crc & 0x800) ? ((crc << 1) ^ 0x80F) & 0xFFF
                                : (crc << 1) & 0xFFF;
        crc_tab[x] = crc;
    }
}

static inline unsigned short crc12(unsigned short crc, unsigned short word) {
    return crc_tab[(crc ^ word) & 0xFFF];
}

/* ======================================================================
 * Global state
 * ====================================================================== */
static FT_HANDLE ft = NULL;
static FILE     *replay_fp = NULL;   /* non-NULL = file replay mode */
static pthread_mutex_t ft_wr_mtx = PTHREAD_MUTEX_INITIALIZER; /* pipe 0x02 */
static volatile sig_atomic_t running = 1;

/* ---- SPSC byte ring: reader thread -> decoder thread ----------------- */
static uint8_t *ring;
static _Atomic size_t ring_head;   /* write index (reader)  */
static _Atomic size_t ring_tail;   /* read index  (decoder) */
static _Atomic size_t ring_overruns;

/* ---- stats (decoder-owned; read racily by control threads: counters
 * are word-sized and monotonic, so torn reads are harmless) ------------ */
typedef struct {
    size_t frames, crc_err, seq_gap, lane_id_err, drops;
    unsigned short last_cnt;
    int have_cnt;
} lane_t;
static lane_t lanes[4];
static size_t total_read_bytes, slices_total, partial_slices, filler_slices;
static size_t hunt_drops;
static struct timespec t_start;

/* ---- publish ring: last PUB_SLICES slices of all 512 channels -------- */
static int16_t (*pub_buf)[N_CHANNELS];
static _Atomic uint64_t pub_wpos;    /* total slices ever published */

/* ---- recording -------------------------------------------------------- */
static pthread_mutex_t rec_mtx = PTHREAD_MUTEX_INITIALIZER;
static FILE    *rec_file = NULL;
static char     rec_path[512];
static uint16_t rec_chans[N_CHANNELS];
static int      rec_nch = 0;
static size_t   rec_slices = 0;
static size_t   rec_err0, rec_drop0;         /* totals at record start */
static time_t   rec_start_time;

/* ---- control clients --------------------------------------------------
 * Each text-mode client has an event queue drained by its own thread. */
typedef struct {
    int  fd;
    int  in_use;
    int  plot_mode;                  /* binary stream: no text events */
    char evq[EVQ_LEN][EV_MAXLEN];
    int  ev_head, ev_tail;           /* head=write, tail=read */
    pthread_mutex_t mtx;
    pthread_cond_t  cond;
} client_t;
static client_t clients[MAX_CLIENTS];
static pthread_mutex_t clients_mtx = PTHREAD_MUTEX_INITIALIZER;

static void event_broadcast(const char *fmt, ...)
    __attribute__((format(printf, 1, 2)));

static void event_broadcast(const char *fmt, ...) {
    char line[EV_MAXLEN];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(line, sizeof line, fmt, ap);
    va_end(ap);

    pthread_mutex_lock(&clients_mtx);
    for (int i = 0; i < MAX_CLIENTS; i++) {
        client_t *c = &clients[i];
        if (!c->in_use || c->plot_mode) continue;
        pthread_mutex_lock(&c->mtx);
        int next = (c->ev_head + 1) % EVQ_LEN;
        if (next != c->ev_tail) {              /* drop event if queue full */
            snprintf(c->evq[c->ev_head], EV_MAXLEN, "%s", line);
            c->ev_head = next;
            pthread_cond_signal(&c->cond);
        }
        pthread_mutex_unlock(&c->mtx);
    }
    pthread_mutex_unlock(&clients_mtx);
}

/* ======================================================================
 * Thread 1: USB reader — FT_ReadPipe -> ring, nothing else
 * ====================================================================== */
static void ring_push(const UCHAR *buf, size_t xfer) {
    size_t head = atomic_load_explicit(&ring_head, memory_order_relaxed);
    size_t tail = atomic_load_explicit(&ring_tail, memory_order_acquire);
    if (RING_BYTES - (head - tail) < xfer) {
        /* host-side overrun: decoder fell > RING_BYTES behind */
        atomic_fetch_add_explicit(&ring_overruns, 1, memory_order_relaxed);
        return;
    }
    size_t off = head % RING_BYTES;
    size_t first = RING_BYTES - off;
    if (first > xfer) first = xfer;
    memcpy(ring + off, buf, first);
    if (xfer > first) memcpy(ring, buf + first, xfer - first);
    atomic_store_explicit(&ring_head, head + xfer, memory_order_release);
    total_read_bytes += xfer;
}

/* ---- reader gap instrumentation (reader-owned; read racily by stats).
 * A 64 KB chunk completes every ~3.97 ms at 16.5 MB/s; a much larger
 * completion-to-completion gap means the bus went idle and the FPGA may
 * have dropped.  out_ms = time spent outside FT_ReadPipe (ring_push +
 * loop overhead) — separates our stalls from library/USB stalls. */
#define GAP_LOG_LEN 32
typedef struct { double t_s, gap_ms, out_ms; unsigned xfer; } gap_rec_t;
static gap_rec_t gap_log[GAP_LOG_LEN];
static unsigned  gap_log_n;                       /* total logged */
static size_t    gap_cnt[4];                      /* >1.5, >3, >6, >12 ms */
static double    gap_max_ms, out_max_ms;

static void *reader_thread(void *arg) {
    (void)arg;
    static UCHAR buf[CHUNK_SIZE];
    ULONG xfer;

    /* ---- File replay mode ---- */
    if (replay_fp) {
        while (running) {
            size_t n = fread(buf, 1, CHUNK_SIZE, replay_fp);
            if (n == 0) {
                rewind(replay_fp);       /* loop forever */
                continue;
            }
            ring_push(buf, n);
            /* Pace to ~16.5 MB/s so the decoder/UI run at real-time */
            usleep((unsigned)(n / 16.5));
        }
        return NULL;
    }

    /* ---- Hardware mode ---- */
#ifdef __APPLE__
    /* The FPGA drops samples if this thread stalls > ~1-2 ms; keep it out
     * of the background/utility QoS bands under load. */
    pthread_set_qos_class_self_np(QOS_CLASS_USER_INTERACTIVE, 0);
#endif

    /* Startup flush: pipe may be empty right after FT_SetStreamPipe, so
     * tolerate empty reads instead of breaking on the first xfer==0. */
    size_t flushed = 0;
    int empties = 0;
    while (running && flushed < FLUSH_BYTES && empties < 4) {
        xfer = 0;
        FT_ReadPipe(ft, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) empties++;
        else { empties = 0; flushed += xfer; }
    }

    /* Synchronous stream loop, as hardware-proven in wave_record. (The
     * library's async API — FT_ReadPipeAsync/FT_GetOverlappedResult — was
     * tried and is broken in libftd3xx 1.1.7 on macOS: completions return
     * FT_IO_ERROR with valid data, then the pipe wedges. The inter-call
     * bus-idle gap costs ~1 dropped sample/s/lane at 16.5 MB/s line rate;
     * drops are counted and reported, never silent.) */
    struct timespec ts_prev, ts0, ts1;
    clock_gettime(CLOCK_MONOTONIC, &ts_prev);
    while (running) {
        clock_gettime(CLOCK_MONOTONIC, &ts0);
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(ft, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        clock_gettime(CLOCK_MONOTONIC, &ts1);

        double out_ms = (ts0.tv_sec - ts_prev.tv_sec) * 1e3 +
                        (ts0.tv_nsec - ts_prev.tv_nsec) * 1e-6;
        double gap_ms = (ts1.tv_sec - ts_prev.tv_sec) * 1e3 +
                        (ts1.tv_nsec - ts_prev.tv_nsec) * 1e-6;
        ts_prev = ts1;
        if (out_ms > out_max_ms) out_max_ms = out_ms;
        if (gap_ms > gap_max_ms) gap_max_ms = gap_ms;
        if (gap_ms > 1.5) {
            gap_cnt[0]++;
            if (gap_ms > 3.0)  gap_cnt[1]++;
            if (gap_ms > 6.0)  gap_cnt[2]++;
            if (gap_ms > 12.0) gap_cnt[3]++;
            gap_rec_t *g = &gap_log[gap_log_n % GAP_LOG_LEN];
            g->t_s = (ts1.tv_sec - t_start.tv_sec) +
                     (ts1.tv_nsec - t_start.tv_nsec) * 1e-9;
            g->gap_ms = gap_ms;
            g->out_ms = out_ms;
            g->xfer = (unsigned)xfer;
            gap_log_n++;
        }

        if (st != FT_OK && st != FT_TIMEOUT) {
            event_broadcast("!usb read error status=%d", (int)st);
            usleep(100000);
            continue;
        }
        if (xfer) ring_push(buf, xfer);
    }
    return NULL;
}

/* ======================================================================
 * Thread 2: decoder — ring -> frames -> slices -> record/publish
 * ====================================================================== */
static int16_t  slice[N_CHANNELS];
static int      slice_cnt = -1;
static unsigned slice_mask = 0;
static int      last_flush_cnt = -1;

static void slice_publish(const int16_t *s) {
    uint64_t w = atomic_load_explicit(&pub_wpos, memory_order_relaxed);
    memcpy(pub_buf[w % PUB_SLICES], s, N_CHANNELS * sizeof(int16_t));
    atomic_store_explicit(&pub_wpos, w + 1, memory_order_release);

    pthread_mutex_lock(&rec_mtx);
    if (rec_file) {
        int16_t row[N_CHANNELS];
        for (int i = 0; i < rec_nch; i++)
            row[i] = s[rec_chans[i]];
        fwrite(row, sizeof(int16_t), rec_nch, rec_file);
        rec_slices++;
    }
    pthread_mutex_unlock(&rec_mtx);
    slices_total++;
}

static void slice_flush(void) {
    if (slice_cnt < 0) return;
    slice_publish(slice);
    if (slice_mask != 0xF) partial_slices++;
    last_flush_cnt = slice_cnt;
    slice_cnt = -1;
    slice_mask = 0;
}

static void slice_commit(int lane, unsigned short cnt,
                         const unsigned short data[128]) {
    if (slice_cnt >= 0 && cnt != (unsigned short)slice_cnt)
        slice_flush();
    if (slice_cnt < 0) {
        if (last_flush_cnt >= 0) {
            unsigned gap = (cnt - last_flush_cnt - 1) & 0xFFF;
            if (gap > 0 && gap < 2048) {
                static const int16_t zero[N_CHANNELS];
                for (unsigned g = 0; g < gap; g++) {
                    slice_publish(zero);
                    filler_slices++;
                }
            }
        }
        slice_cnt = cnt;
        memset(slice, 0, sizeof(slice));     /* 0 = midscale fill */
    }
    for (int w = 0; w < 128; w++) {
        int line = 2 * lane + (w & 1);
        int amp  = w >> 1;
        slice[line * 64 + amp] = (int16_t)(((int)data[w] - 2048) << 4);
    }
    slice_mask |= 1u << lane;
    if (slice_mask == 0xF)
        slice_flush();
}

static void *decoder_thread(void *arg) {
    (void)arg;
    unsigned short sync_word[4], crc_seed[4];
    for (int l = 0; l < 4; l++) {
        sync_word[l] = 0xFA35 + 0x0111 * l;
        crc_seed[l]  = crc12(0, sync_word[l] & 0xFFF);
    }

    int state = 0;                 /* 0=HUNT, 1=FRAME */
    int wptr = 0, cur = 0;
    unsigned short crc_acc = 0, frame_cnt = 0;
    unsigned short frame_data[128];
    uint8_t carry = 0;             /* odd trailing byte between chunks */
    int have_carry = 0;

    while (running) {
        size_t head = atomic_load_explicit(&ring_head, memory_order_acquire);
        size_t tail = atomic_load_explicit(&ring_tail, memory_order_relaxed);
        size_t avail = head - tail;
        if (avail == 0) { usleep(1000); continue; }
        if (avail > CHUNK_SIZE) avail = CHUNK_SIZE;

        static uint8_t buf[CHUNK_SIZE + 1];
        size_t n = 0;
        if (have_carry) { buf[n++] = carry; have_carry = 0; }
        size_t off = tail % RING_BYTES;
        size_t first = RING_BYTES - off;
        if (first > avail) first = avail;
        memcpy(buf + n, ring + off, first);
        if (avail > first) memcpy(buf + n + first, ring, avail - first);
        n += avail;
        atomic_store_explicit(&ring_tail, tail + avail, memory_order_release);

        if (n & 1) { carry = buf[n - 1]; have_carry = 1; n--; }

        size_t nw = n / 2;
        for (size_t i = 0; i < nw; i++) {
            unsigned short w = buf[i*2] | (buf[i*2+1] << 8);
            unsigned short val = w & 0xFFF;

            if (state == 0) {
                int found = -1;
                for (int l = 0; l < 4; l++)
                    if (w == sync_word[l]) { found = l; break; }
                if (found >= 0) {
                    cur = found; state = 1; wptr = 1;
                    crc_acc = crc_seed[cur];
                } else {
                    hunt_drops++;
                }
            } else {
                if (wptr == 1) {
                    /* {4'hE, hi[5:0], ~hi[5:0]}, hi = {drops, lane} */
                    unsigned hi = (w >> 6) & 0x3F, lo = w & 0x3F;
                    if ((w >> 12) != 0xE || lo != ((~hi) & 0x3F) ||
                        (int)(hi & 0x3) != cur) {
                        lanes[cur].lane_id_err++;
                        event_broadcast("!lane_id lane=%d total=%zu",
                                        cur, lanes[cur].lane_id_err);
                    } else if (hi >> 2) {
                        lanes[cur].drops += hi >> 2;
                        event_broadcast("!drops lane=%d n=%u total=%zu",
                                        cur, hi >> 2, lanes[cur].drops);
                    }
                    crc_acc = crc12(crc_acc, val);
                } else if (wptr == 2) {
                    crc_acc = crc12(crc_acc, val);
                    if (lanes[cur].have_cnt &&
                        ((lanes[cur].last_cnt + 1) & 0xFFF) != val) {
                        lanes[cur].seq_gap++;
                        event_broadcast("!seq lane=%d total=%zu",
                                        cur, lanes[cur].seq_gap);
                    }
                    lanes[cur].last_cnt = val;
                    lanes[cur].have_cnt = 1;
                    frame_cnt = val;
                } else if (wptr <= 130) {
                    crc_acc = crc12(crc_acc, val);
                    frame_data[wptr - 3] = val;
                } else {
                    /* wptr == 131: CRC — commit only if clean */
                    if (val != crc_acc) {
                        lanes[cur].crc_err++;
                        event_broadcast("!crc lane=%d total=%zu",
                                        cur, lanes[cur].crc_err);
                    } else {
                        slice_commit(cur, frame_cnt, frame_data);
                    }
                    lanes[cur].frames++;
                    state = 0;
                }
                wptr++;
                if (wptr > 131) state = 0;
            }
        }
    }
    return NULL;
}

/* ======================================================================
 * WAV recording (header layout as wave_record.c, N channels)
 * ====================================================================== */
static void wr_u16(FILE *f, uint16_t v) { fputc(v & 0xFF, f); fputc(v >> 8, f); }
static void wr_u32(FILE *f, uint32_t v) {
    fputc(v & 0xFF, f); fputc((v >> 8) & 0xFF, f);
    fputc((v >> 16) & 0xFF, f); fputc((v >> 24) & 0xFF, f);
}

static void wav_write_header(FILE *f, int nch, uint32_t data_bytes) {
    fseek(f, 0, SEEK_SET);
    fwrite("RIFF", 1, 4, f);
    wr_u32(f, 36 + data_bytes);
    fwrite("WAVE", 1, 4, f);
    fwrite("fmt ", 1, 4, f);
    wr_u32(f, 16);
    wr_u16(f, 1);                               /* PCM */
    wr_u16(f, (uint16_t)nch);
    wr_u32(f, SAMPLE_RATE);
    wr_u32(f, (uint32_t)SAMPLE_RATE * nch * 2);
    wr_u16(f, (uint16_t)(nch * 2));
    wr_u16(f, 16);
    fwrite("data", 1, 4, f);
    wr_u32(f, data_bytes);
}

/* Parse "all" or "3,5-9,320" into rec-style channel array. Returns count
 * or -1 on syntax error. Channels are clamped/validated to 0..511. */
static int parse_chans(const char *s, uint16_t *out, int max) {
    if (strcmp(s, "all") == 0) {
        for (int i = 0; i < N_CHANNELS && i < max; i++) out[i] = (uint16_t)i;
        return N_CHANNELS < max ? N_CHANNELS : max;
    }
    int n = 0;
    const char *p = s;
    while (*p) {
        char *end;
        long a = strtol(p, &end, 10);
        if (end == p || a < 0 || a >= N_CHANNELS) return -1;
        long b = a;
        p = end;
        if (*p == '-') {
            b = strtol(p + 1, &end, 10);
            if (end == p + 1 || b < a || b >= N_CHANNELS) return -1;
            p = end;
        }
        for (long c = a; c <= b; c++) {
            if (n >= max) return -1;
            out[n++] = (uint16_t)c;
        }
        if (*p == ',') p++;
        else if (*p) return -1;
    }
    return n > 0 ? n : -1;
}

static size_t err_total(void) {
    size_t t = 0;
    for (int l = 0; l < 4; l++)
        t += lanes[l].crc_err + lanes[l].seq_gap + lanes[l].lane_id_err;
    return t;
}

static size_t drop_total(void) {
    size_t t = 0;
    for (int l = 0; l < 4; l++) t += lanes[l].drops;
    return t;
}

static int record_start(const char *path, const char *chans, char *err,
                        size_t errlen) {
    uint16_t tmp[N_CHANNELS];
    int n = parse_chans(chans, tmp, N_CHANNELS);
    if (n < 0) { snprintf(err, errlen, "bad channel list"); return -1; }

    pthread_mutex_lock(&rec_mtx);
    if (rec_file) {
        pthread_mutex_unlock(&rec_mtx);
        snprintf(err, errlen, "already recording to %s", rec_path);
        return -1;
    }
    FILE *f = fopen(path, "wb");
    if (!f) {
        pthread_mutex_unlock(&rec_mtx);
        snprintf(err, errlen, "open %s: %s", path, strerror(errno));
        return -1;
    }
    wav_write_header(f, n, 0);
    memcpy(rec_chans, tmp, n * sizeof(uint16_t));
    rec_nch = n;
    rec_slices = 0;
    rec_err0 = err_total();
    rec_drop0 = drop_total();
    rec_start_time = time(NULL);
    snprintf(rec_path, sizeof rec_path, "%s", path);
    rec_file = f;
    pthread_mutex_unlock(&rec_mtx);
    return n;
}

static int record_stop(char *msg, size_t msglen) {
    pthread_mutex_lock(&rec_mtx);
    if (!rec_file) {
        pthread_mutex_unlock(&rec_mtx);
        snprintf(msg, msglen, "not recording");
        return -1;
    }
    FILE *f = rec_file;
    rec_file = NULL;                 /* decoder stops writing immediately */
    size_t slices = rec_slices;
    int nch = rec_nch;
    char path[512];
    snprintf(path, sizeof path, "%s", rec_path);
    size_t errs  = err_total()  - rec_err0;
    size_t drops = drop_total() - rec_drop0;
    time_t t0 = rec_start_time;
    pthread_mutex_unlock(&rec_mtx);

    uint32_t data_bytes = (uint32_t)(slices * nch * sizeof(int16_t));
    wav_write_header(f, nch, data_bytes);
    fclose(f);

    /* sidecar metadata */
    char side[560];
    snprintf(side, sizeof side, "%s.json", path);
    FILE *js = fopen(side, "w");
    if (js) {
        fprintf(js, "{\n  \"wav\": \"%s\",\n  \"sample_rate\": %d,\n"
                    "  \"slices\": %zu,\n  \"duration_s\": %.3f,\n"
                    "  \"start_unix\": %ld,\n"
                    "  \"errors_during\": %zu,\n  \"drops_during\": %zu,\n"
                    "  \"volts_per_count\": %.9g,\n  \"channels\": [",
                path, SAMPLE_RATE, slices, (double)slices / SAMPLE_RATE,
                (long)t0, errs, drops, 3.0 / 4096.0 / 100.0 / 16.0);
        pthread_mutex_lock(&rec_mtx);
        for (int i = 0; i < nch; i++)
            fprintf(js, "%s%u", i ? "," : "", rec_chans[i]);
        pthread_mutex_unlock(&rec_mtx);
        fprintf(js, "]\n}\n");
        fclose(js);
    }
    snprintf(msg, msglen,
             "recorded %zu slices (%.3f s, %d ch) -> %s (errors=%zu drops=%zu)",
             slices, (double)slices / SAMPLE_RATE, nch, path, errs, drops);
    return 0;
}

/* ======================================================================
 * Board commands (pipe 0x02)
 * ====================================================================== */
static const struct { const char *name; unsigned char op; } board_cmds[] = {
    { "chip-reset",  0x11 }, { "fe-pulse", 0x21 }, { "fe-on", 0x22 },
    { "fe-off",      0x23 }, { "pattern-on", 0x31 }, { "pattern-off", 0x32 },
};
#define N_BOARD_CMDS (sizeof(board_cmds) / sizeof(board_cmds[0]))

/* Send a 2-byte command: {opcode, payload} */
static int board_cmd_send2(unsigned char op, unsigned char payload) {
    UCHAR b[2] = { op, payload };
    ULONG wr = 0;
    pthread_mutex_lock(&ft_wr_mtx);
    FT_STATUS st = FT_WritePipe(ft, 0x02, b, 2, &wr, 1000);
    pthread_mutex_unlock(&ft_wr_mtx);
    return (st == FT_OK && wr == 2) ? 0 : -1;
}

static int board_cmd_send(const char *name) {
    unsigned char op = 0;
    for (size_t i = 0; i < N_BOARD_CMDS; i++)
        if (strcmp(name, board_cmds[i].name) == 0) op = board_cmds[i].op;
    if (op == 0) return -2;
    return board_cmd_send2(op, 0);
}

/* Default SPI: 4096 zero-data clocks + latch (BRAM powers up to 0) */
static int board_cmd_spi_default(void) {
    int rc = board_cmd_send2(0x45, 0x00);       /* bit count lo = 0 */
    if (rc) return rc;
    rc = board_cmd_send2(0x46, 0x10);           /* bit count hi = 0x10 → 4096 */
    if (rc) return rc;
    return board_cmd_send2(0x41, 0x00);         /* execute */
}

/* SPI CSV loader — parse CSV, load BRAM, execute */
#define SPI_MAX_BITS 4096
#define SPI_MAX_BYTES (SPI_MAX_BITS / 8)

static int board_cmd_spi_load(const char *csv_path) {
    FILE *f = fopen(csv_path, "r");
    if (!f) return -1;

    unsigned char l_data[SPI_MAX_BYTES], r_data[SPI_MAX_BYTES];
    memset(l_data, 0, sizeof l_data);
    memset(r_data, 0, sizeof r_data);

    char line[256];
    int max_bit = -1;
    if (!fgets(line, sizeof line, f)) { fclose(f); return -1; } /* skip header */
    while (fgets(line, sizeof line, f)) {
        int bit, lv, rv;
        if (sscanf(line, "%d,%d,%d", &bit, &lv, &rv) != 3) continue;
        if (bit < 0 || bit >= SPI_MAX_BITS) continue;
        int byte_idx = bit / 8;
        int bit_pos  = 7 - (bit % 8);
        if (lv) l_data[byte_idx] |= (unsigned char)(1 << bit_pos);
        if (rv) r_data[byte_idx] |= (unsigned char)(1 << bit_pos);
        if (bit > max_bit) max_bit = bit;
    }
    fclose(f);
    if (max_bit < 0) return -1;

    int total_bits = max_bit + 1;
    int n_bytes = (total_bits + 7) / 8;
    int rc;

    rc = board_cmd_send2(0x42, 0);              /* reset pointers */
    if (rc) return rc;
    for (int i = 0; i < n_bytes; i++) {         /* L channel */
        rc = board_cmd_send2(0x43, l_data[i]);
        if (rc) return rc;
    }
    for (int i = 0; i < n_bytes; i++) {         /* R channel */
        rc = board_cmd_send2(0x44, r_data[i]);
        if (rc) return rc;
    }
    rc = board_cmd_send2(0x45, total_bits & 0xFF);
    if (rc) return rc;
    rc = board_cmd_send2(0x46, (total_bits >> 8) & 0xFF);
    if (rc) return rc;
    return board_cmd_send2(0x41, 0);            /* execute */
}

/* ======================================================================
 * Control server
 * ====================================================================== */
static void dprint(int fd, const char *fmt, ...)
    __attribute__((format(printf, 2, 3)));

static void dprint(int fd, const char *fmt, ...) {
    char out[1024];
    va_list ap;
    va_start(ap, fmt);
    int n = vsnprintf(out, sizeof out, fmt, ap);
    va_end(ap);
    if (n > 0) {
        ssize_t w = write(fd, out, (size_t)n);
        (void)w;
    }
}

static void stats_reply(int fd) {
    struct timespec now;
    clock_gettime(CLOCK_MONOTONIC, &now);
    double up = (now.tv_sec - t_start.tv_sec) +
                (now.tv_nsec - t_start.tv_nsec) * 1e-9;
    size_t head = atomic_load(&ring_head), tail = atomic_load(&ring_tail);
    dprint(fd, "up %.1f s  in %.1f MB (%.2f MB/s)  slices %zu (%.1f s)  "
               "ring %.1f%%  overruns %zu  hunt %zu\n",
           up, total_read_bytes / 1e6, total_read_bytes / 1e6 / (up > 0 ? up : 1),
           slices_total, (double)slices_total / SAMPLE_RATE,
           100.0 * (head - tail) / RING_BYTES,
           atomic_load(&ring_overruns), hunt_drops);
    for (int l = 0; l < 4; l++)
        dprint(fd, "lane %d: frames=%zu crc=%zu seq=%zu lane_id=%zu drops=%zu\n",
               l, lanes[l].frames, lanes[l].crc_err, lanes[l].seq_gap,
               lanes[l].lane_id_err, lanes[l].drops);
    dprint(fd, "read gaps >1.5/3/6/12ms: %zu/%zu/%zu/%zu  max %.2f ms  "
               "out-max %.3f ms\n",
           gap_cnt[0], gap_cnt[1], gap_cnt[2], gap_cnt[3],
           gap_max_ms, out_max_ms);
    unsigned gn = gap_log_n;
    unsigned lo = gn > 8 ? gn - 8 : 0;
    if (gn > GAP_LOG_LEN && lo < gn - GAP_LOG_LEN) lo = gn - GAP_LOG_LEN;
    for (unsigned i = lo; i < gn; i++) {
        const gap_rec_t *g = &gap_log[i % GAP_LOG_LEN];
        dprint(fd, "  gap %7.2f ms (out %.3f ms, xfer %u) at %.1f s\n",
               g->gap_ms, g->out_ms, g->xfer, g->t_s);
    }
    dprint(fd, "partial %zu  filler %zu", partial_slices, filler_slices);
    pthread_mutex_lock(&rec_mtx);
    if (rec_file)
        dprint(fd, "  RECORDING %s (%d ch, %.1f s)",
               rec_path, rec_nch, (double)rec_slices / SAMPLE_RATE);
    pthread_mutex_unlock(&rec_mtx);
    dprint(fd, "\nok\n");
}

/* Binary plot mode: push decimated slices of the selected channels until
 * the client disconnects. Packet: u32 magic, u32 seq, u16 n_ch,
 * u16 n_slices, int16 data[n_slices][n_ch].
 *
 * minmax mode ("plot <chans> <decim> minmax"): each output bin scans all
 * decim input slices and emits {min,max} per channel (peak detect — no
 * aliasing in the scroll view). n_ch in the header doubles. */
#define PLOT_MAGIC 0x41444350u    /* "ADCP" */
#define PLOT_MAX_SLICES 256

static void plot_loop(int fd, const uint16_t *chs, int nch, int decim,
                      int minmax) {
    uint64_t rpos = atomic_load_explicit(&pub_wpos, memory_order_acquire);
    rpos -= rpos % (unsigned)decim;
    uint32_t seq = 0;
    int ow = minmax ? nch * 2 : nch;      /* int16 words per output bin */

    for (;;) {
        uint64_t w = atomic_load_explicit(&pub_wpos, memory_order_acquire);
        if (w < rpos + (unsigned)decim) { usleep(5000); continue; }
        /* fell behind the ring? skip ahead (drop plot data, never block) */
        if (w - rpos > PUB_SLICES / 2) {
            rpos = w - PUB_SLICES / 4;
            rpos -= rpos % (unsigned)decim;
        }
        uint64_t nsl = (w - rpos) / (unsigned)decim;
        if (nsl > PLOT_MAX_SLICES) nsl = PLOT_MAX_SLICES;

        static int16_t out[PLOT_MAX_SLICES * N_CHANNELS * 2];
        for (uint64_t s = 0; s < nsl; s++) {
            int16_t *dst = out + s * ow;
            if (!minmax) {
                const int16_t *src =
                    pub_buf[(rpos + s * (unsigned)decim) % PUB_SLICES];
                for (int c = 0; c < nch; c++)
                    dst[c] = src[chs[c]];
            } else {
                for (int c = 0; c < nch; c++) {
                    dst[2 * c]     = INT16_MAX;
                    dst[2 * c + 1] = INT16_MIN;
                }
                for (int k = 0; k < decim; k++) {
                    const int16_t *src =
                        pub_buf[(rpos + s * (unsigned)decim + k) % PUB_SLICES];
                    for (int c = 0; c < nch; c++) {
                        int16_t v = src[chs[c]];
                        if (v < dst[2 * c])     dst[2 * c]     = v;
                        if (v > dst[2 * c + 1]) dst[2 * c + 1] = v;
                    }
                }
            }
        }
        rpos += nsl * (unsigned)decim;

        uint8_t hdr[12];
        uint32_t magic = PLOT_MAGIC, sq = seq++;
        uint16_t hn = (uint16_t)ow, hs = (uint16_t)nsl;
        memcpy(hdr, &magic, 4); memcpy(hdr + 4, &sq, 4);
        memcpy(hdr + 8, &hn, 2); memcpy(hdr + 10, &hs, 2);
        if (write(fd, hdr, 12) != 12) return;
        size_t bytes = nsl * (size_t)ow * sizeof(int16_t);
        if (write(fd, out, bytes) != (ssize_t)bytes) return;
    }
}

/* Event pusher thread: drains a client's event queue to its socket. */
static void *event_pusher(void *arg) {
    client_t *c = arg;
    for (;;) {
        pthread_mutex_lock(&c->mtx);
        while (c->in_use && !c->plot_mode && c->ev_tail == c->ev_head)
            pthread_cond_wait(&c->cond, &c->mtx);
        if (!c->in_use || c->plot_mode) { pthread_mutex_unlock(&c->mtx); return NULL; }
        char line[EV_MAXLEN];
        snprintf(line, sizeof line, "%s", c->evq[c->ev_tail]);
        c->ev_tail = (c->ev_tail + 1) % EVQ_LEN;
        pthread_mutex_unlock(&c->mtx);
        dprint(c->fd, "%s\n", line);
    }
}

static void *client_thread(void *arg) {
    client_t *c = arg;
    int fd = c->fd;
    pthread_t pusher;
    int pusher_joined = 0;
    pthread_create(&pusher, NULL, event_pusher, c);

    char line[1024];
    size_t len = 0;
    for (;;) {
        ssize_t r = read(fd, line + len, sizeof line - 1 - len);
        if (r <= 0) break;
        len += (size_t)r;
        char *nl;
        while ((nl = memchr(line, '\n', len))) {
            *nl = 0;
            if (nl > line && nl[-1] == '\r') nl[-1] = 0;

            if (strncmp(line, "cmd spi-load ", 13) == 0) {
                char path[512];
                if (sscanf(line + 13, "%511s", path) == 1) {
                    int rc = board_cmd_spi_load(path);
                    if (rc == 0) dprint(fd, "ok spi loaded from %s\n", path);
                    else         dprint(fd, "err spi-load failed\n");
                } else dprint(fd, "err usage: cmd spi-load <csv_path>\n");
            } else if (strcmp(line, "cmd spi") == 0) {
                int rc = board_cmd_spi_default();
                if (rc == 0) dprint(fd, "ok spi default\n");
                else         dprint(fd, "err usb write failed\n");
            } else if (strncmp(line, "cmd stim ", 9) == 0) {
                int n = atoi(line + 9);
                if (n < 1 || n > 255)
                    dprint(fd, "err stim count must be 1..255\n");
                else {
                    int rc = board_cmd_send2(0x60, (unsigned char)n);
                    if (rc == 0) dprint(fd, "ok stim %d\n", n);
                    else         dprint(fd, "err usb write failed\n");
                }
            } else if (strncmp(line, "cmd ", 4) == 0) {
                int rc = board_cmd_send(line + 4);
                if (rc == 0)       dprint(fd, "ok\n");
                else if (rc == -2) dprint(fd, "err unknown command '%s'\n", line + 4);
                else               dprint(fd, "err usb write failed\n");
            } else if (strncmp(line, "record start ", 13) == 0) {
                char path[512], chans[512];
                if (sscanf(line + 13, "%511s %511s", path, chans) == 2) {
                    char err[256];
                    int n = record_start(path, chans, err, sizeof err);
                    if (n > 0) dprint(fd, "ok recording %d channels -> %s\n", n, path);
                    else       dprint(fd, "err %s\n", err);
                } else dprint(fd, "err usage: record start <path> <chans>\n");
            } else if (strcmp(line, "record stop") == 0) {
                char msg[700];
                if (record_stop(msg, sizeof msg) == 0) dprint(fd, "ok %s\n", msg);
                else dprint(fd, "err %s\n", msg);
            } else if (strcmp(line, "stats") == 0) {
                stats_reply(fd);
            } else if (strncmp(line, "plot ", 5) == 0) {
                char chans[512], mode[16] = "";
                int decim = 8;
                if (sscanf(line + 5, "%511s %d %15s", chans, &decim, mode) >= 1) {
                    int minmax = (strcmp(mode, "minmax") == 0);
                    static _Thread_local uint16_t chs[N_CHANNELS];
                    int n = parse_chans(chans, chs, N_CHANNELS);
                    if (n > 0 && decim >= 1 && (!minmax || n <= N_CHANNELS / 2)) {
                        /* stop the event pusher first: text events must
                         * never interleave with the binary stream */
                        pthread_mutex_lock(&c->mtx);
                        c->plot_mode = 1;
                        pthread_cond_signal(&c->cond);
                        pthread_mutex_unlock(&c->mtx);
                        pthread_join(pusher, NULL);
                        pusher_joined = 1;
                        dprint(fd, "ok plot %d channels decim %d%s\n",
                               n, decim, minmax ? " minmax" : "");
                        plot_loop(fd, chs, n, decim, minmax);
                        goto done;                  /* returns on disconnect */
                    }
                }
                dprint(fd, "err usage: plot <chans> [decim>=1] [minmax]\n");
            } else if (strcmp(line, "quit") == 0) {
                dprint(fd, "ok shutting down\n");
                running = 0;
                goto done;
            } else if (line[0]) {
                dprint(fd, "err unknown verb (cmd/record/stats/plot/quit)\n");
            }

            size_t rest = len - (size_t)(nl + 1 - line);
            memmove(line, nl + 1, rest);
            len = rest;
        }
        if (len >= sizeof line - 1) break;   /* oversized line */
    }
done:
    pthread_mutex_lock(&clients_mtx);
    pthread_mutex_lock(&c->mtx);
    c->in_use = 0;
    pthread_cond_signal(&c->cond);
    pthread_mutex_unlock(&c->mtx);
    pthread_mutex_unlock(&clients_mtx);
    if (!pusher_joined) pthread_join(pusher, NULL);
    close(fd);
    return NULL;
}

static void *server_thread(void *arg) {
    int srv = *(int *)arg;
    while (running) {
        int fd = accept(srv, NULL, NULL);
        if (fd < 0) {
            if (running) usleep(100000);
            continue;
        }
        pthread_mutex_lock(&clients_mtx);
        client_t *slot = NULL;
        for (int i = 0; i < MAX_CLIENTS; i++)
            if (!clients[i].in_use) { slot = &clients[i]; break; }
        if (slot) {
            slot->fd = fd;
            slot->ev_head = slot->ev_tail = 0;
            slot->plot_mode = 0;
            slot->in_use = 1;
        }
        pthread_mutex_unlock(&clients_mtx);
        if (!slot) {
            dprint(fd, "err too many clients\n");
            close(fd);
            continue;
        }
        pthread_t t;
        pthread_create(&t, NULL, client_thread, slot);
        pthread_detach(t);
    }
    return NULL;
}

static void on_signal(int sig) { (void)sig; running = 0; }

/* ====================================================================== */
int main(int argc, char *argv[]) {
    crc12_init();
    signal(SIGINT, on_signal);
    signal(SIGTERM, on_signal);
    signal(SIGPIPE, SIG_IGN);

    /* --file <path>: replay a raw USB capture instead of live hardware */
    const char *replay_path = NULL;
    for (int i = 1; i < argc - 1; i++) {
        if (strcmp(argv[i], "--file") == 0)
            replay_path = argv[++i];
    }

    ring = malloc(RING_BYTES);
    pub_buf = malloc((size_t)PUB_SLICES * N_CHANNELS * sizeof(int16_t));
    if (!ring || !pub_buf) { perror("malloc"); return 1; }
    memset(pub_buf, 0, (size_t)PUB_SLICES * N_CHANNELS * sizeof(int16_t));

    for (int i = 0; i < MAX_CLIENTS; i++) {
        pthread_mutex_init(&clients[i].mtx, NULL);
        pthread_cond_init(&clients[i].cond, NULL);
    }

    if (replay_path) {
        replay_fp = fopen(replay_path, "rb");
        if (!replay_fp) { perror(replay_path); return 1; }
        printf("adc_daemon: replay mode from %s\n", replay_path);
    } else {
        /* FT600 */
        DWORD devcnt = 0;
        FT_CreateDeviceInfoList(&devcnt);
        if (devcnt == 0) { fprintf(stderr, "No FT600 devices\n"); return 1; }
        if (FT_Create(0, FT_OPEN_BY_INDEX, &ft) != FT_OK) {
            fprintf(stderr, "FT_Create failed (device busy?)\n"); return 1;
        }
        FT_SetPipeTimeout(ft, 0x82, 3000);
        if (FT_SetStreamPipe(ft, FALSE, FALSE, 0x82, CHUNK_SIZE) != FT_OK) {
            fprintf(stderr, "SetStreamPipe failed\n");
            FT_Close(ft);
            return 1;
        }
    }

    /* control socket */
    unlink(SOCK_PATH);
    int srv = socket(AF_UNIX, SOCK_STREAM, 0);
    struct sockaddr_un addr = { .sun_family = AF_UNIX };
    snprintf(addr.sun_path, sizeof addr.sun_path, "%s", SOCK_PATH);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0 ||
        listen(srv, 8) < 0) {
        perror(SOCK_PATH);
        return 1;
    }

    clock_gettime(CLOCK_MONOTONIC, &t_start);
    printf("adc_daemon: streaming on %s (512 ch @ %d Hz)\n",
           SOCK_PATH, SAMPLE_RATE);
    fflush(stdout);

    pthread_t th_rd, th_dec, th_srv;
    pthread_create(&th_rd, NULL, reader_thread, NULL);
    pthread_create(&th_dec, NULL, decoder_thread, NULL);
    pthread_create(&th_srv, NULL, server_thread, &srv);

    while (running) usleep(200000);

    /* shutdown: stop recording cleanly, release USB */
    char msg[700];
    record_stop(msg, sizeof msg);
    close(srv);
    unlink(SOCK_PATH);
    pthread_join(th_rd, NULL);
    pthread_join(th_dec, NULL);
    if (replay_fp) {
        fclose(replay_fp);
    } else {
        FT_ClearStreamPipe(ft, FALSE, FALSE, 0x82);
        FT_Close(ft);
    }
    printf("adc_daemon: stopped\n");
    return 0;
}
