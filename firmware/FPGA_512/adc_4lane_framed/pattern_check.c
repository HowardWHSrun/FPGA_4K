/* pattern_check.c — verify sample-exact time advancement over the full
 * hardware chain using the FPGA's injected ramp pattern (board_cmd
 * pattern-on, opcode 0x31).
 *
 * With the pattern enabled, every channel's data is a free-running
 * +1-per-sample 12-bit ramp counted at that channel's own ch_valid, so a
 * channel's consecutive data words — within a frame and across consecutive
 * frames of its lane — must advance by exactly +1 (mod 4096). Any hold
 * (delta 0), duplicate, skip, or corruption anywhere in
 * pair_tdm_framer -> arbiter -> async_fifo -> FT600 -> USB -> host decode
 * is counted per channel.
 *
 * A channel "locks" after 16 consecutive +1 advances; errors are counted
 * only while locked. A lane's CRC error or sequence gap unlocks both of
 * its channels (the discontinuity is expected, and is already counted as
 * crc/seq).
 *
 * The LANE_ID word carries a per-lane drop count: payload {hi[5:0],~hi[5:0]}
 * with hi = {drops[3:0], lane[1:0]} (saturating at 15, drops since that
 * lane's previous frame). Zero drops is bit-identical to the legacy
 * constant. Reported drops are summed per lane; any drops in normal mode
 * fail the run.
 *
 * Usage: pattern_check [MB] [throttle_us]
 *   MB          capture size (default 8; run board_cmd pattern-on first)
 *   throttle_us if >0, usleep() this long after every chunk to deliberately
 *               backpressure the FPGA. Then PASS means drops were REPORTED
 *               (loud), ramp/CRC errors are expected and not counted.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/time.h>
#include "ftd3xx.h"

#define CHUNK_SIZE   (64 * 1024)
#define DEFAULT_MB   8
#define FLUSH_BYTES  (512 * 1024)
#define LOCK_RUN     16

/* CRC-12 ITU-T (poly 0x80F) — must match usb_framer.
 * Table-driven: crc12(crc, word) == crc_tab[(crc ^ word) & 0xFFF].
 * The bit-loop version at 8.25 Mwords/s stalled the read loop enough to
 * backpressure the FT600 and cause FPGA-side FIFO drops. */
static unsigned short crc_tab[4096];

static void crc12_init(void) {
    for (int x = 0; x < 4096; x++) {
        unsigned short crc = (unsigned short)x;
        for (int i = 0; i < 12; i++) {
            if (crc & 0x800)
                crc = ((crc << 1) ^ 0x80F) & 0xFFF;
            else
                crc = (crc << 1) & 0xFFF;
        }
        crc_tab[x] = crc;
    }
}

static inline unsigned short crc12(unsigned short crc, unsigned short word) {
    return crc_tab[(crc ^ word) & 0xFFF];
}

typedef struct {
    size_t frames, crc_err, seq_gap, lane_id_err, drops;
    unsigned short last_cnt;
    int have_cnt;
} lane_t;

typedef struct {
    unsigned short last;
    int have, run, locked;
    size_t checked, holds, skips, others;
    size_t ramp_adv;             /* total ramp advance (production proxy) */
} chan_t;

static double now_s(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec + tv.tv_usec * 1e-6;
}

static lane_t lanes[4];
static chan_t chans[8];

/* diagnostics: delta histogram, event word position, ch0 event spacing */
static size_t delta_hist[4096];
static size_t wordpos_hist[128];
static size_t ch0_last_evt_frame = 0;
static size_t ch0_evt_spacing[64];   /* spacing in frames, capped at 63 */
static size_t events_logged = 0;
#define LOG_EVENTS 24

static void unlock_lane(int lane) {
    for (int p = 0; p < 2; p++) {
        chan_t *c = &chans[2 * lane + p];
        c->have = 0; c->run = 0; c->locked = 0;
    }
}

/* check the 128 data words of a CRC-clean frame */
static void check_frame(int lane, const unsigned short data[128]) {
    for (int w = 0; w < 128; w++) {
        chan_t *c = &chans[2 * lane + (w & 1)];
        unsigned short val = data[w];
        if (c->have) {
            unsigned short exp = (c->last + 1) & 0xFFF;
            c->ramp_adv += (unsigned short)((val - c->last) & 0xFFF);
            if (val == exp) {
                if (++c->run >= LOCK_RUN) c->locked = 1;
                if (c->locked) c->checked++;
            } else {
                c->run = 0;
                if (c->locked) {
                    unsigned short delta = (val - c->last) & 0xFFF;
                    if (delta == 0)        c->holds++;
                    else if (delta <= 16)  c->skips++;
                    else                   c->others++;
                    delta_hist[delta]++;
                    wordpos_hist[w]++;
                    if (2 * lane + (w & 1) == 0) {
                        size_t sp = lanes[lane].frames - ch0_last_evt_frame;
                        ch0_evt_spacing[sp > 63 ? 63 : sp]++;
                        ch0_last_evt_frame = lanes[lane].frames;
                    }
                    if (events_logged < LOG_EVENTS) {
                        events_logged++;
                        printf("\n  EVT ch%d frame %zu word %d: %03X -> %03X (delta %d)",
                               2 * lane + (w & 1), lanes[lane].frames, w,
                               c->last, val, delta);
                    }
                }
            }
        }
        c->last = val;
        c->have = 1;
    }
}

int main(int argc, char *argv[]) {
    int mb = DEFAULT_MB;
    if (argc > 1) mb = atoi(argv[1]);
    if (mb < 1) mb = 1;
    int throttle_us = (argc > 2) ? atoi(argv[2]) : 0;

    printf("4-lane ramp-pattern checker: %d MB (run board_cmd pattern-on first)\n", mb);
    if (throttle_us)
        printf("THROTTLE MODE: %d us/chunk — inducing drops, expecting them REPORTED\n",
               throttle_us);
    printf("\n");
    crc12_init();

    FT_HANDLE h = NULL;
    DWORD devcnt = 0;
    FT_CreateDeviceInfoList(&devcnt);
    if (devcnt == 0) { printf("No devices\n"); return 1; }
    if (FT_Create(0, FT_OPEN_BY_INDEX, &h) != FT_OK) {
        printf("FT_Create failed\n"); return 1;
    }
    FT_SetPipeTimeout(h, 0x82, 3000);
    if (FT_SetStreamPipe(h, FALSE, FALSE, 0x82, CHUNK_SIZE) != FT_OK) {
        printf("SetStreamPipe failed\n"); FT_Close(h); return 1;
    }

    static UCHAR buf[CHUNK_SIZE];
    ULONG xfer;

    /* Flush the startup transient (stale frames + drop reports from the
     * between-runs stall). The pipe is usually EMPTY right after
     * FT_SetStreamPipe, so an xfer==0 read must NOT abort the flush. */
    size_t flushed = 0;
    int empties = 0;
    while (flushed < FLUSH_BYTES && empties < 4) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) empties++;
        else { empties = 0; flushed += xfer; }
    }

    /* Per-lane sync/CRC constants. LANE_ID is dynamic (carries the drop
     * count) so the seed folds SYNC only; the received LANE_ID word is
     * folded into the CRC as it arrives. */
    unsigned short sync_word[4], crc_seed[4];
    for (int l = 0; l < 4; l++) {
        sync_word[l] = 0xFA35 + 0x0111 * l;
        crc_seed[l] = crc12(0, sync_word[l] & 0xFFF);
    }

    size_t total_bytes = (size_t)mb * 1024 * 1024;
    size_t total_read = 0;
    size_t hunt_drops = 0;
    double t_first = 0, t_last = 0;
    int state = 0;   /* 0=HUNT, 1=FRAME */
    int wptr = 0, cur = 0;
    unsigned short crc_acc = 0;
    unsigned short frame_data[128];

    while (total_read < total_bytes) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        if (st != FT_OK) break;
        if (xfer == 0) { usleep(10000); continue; }
        if (throttle_us) usleep(throttle_us);
        if (t_first == 0) t_first = now_s();
        t_last = now_s();
        total_read += xfer;

        int n = xfer / 2;
        for (int i = 0; i < n; i++) {
            unsigned short w = buf[i*2] | (buf[i*2+1] << 8);
            unsigned short val = w & 0xFFF;

            if (state == 0) {
                int found = -1;
                for (int l = 0; l < 4; l++)
                    if (w == sync_word[l]) { found = l; break; }
                if (found >= 0) {
                    cur = found;
                    state = 1;
                    wptr = 1;
                    crc_acc = crc_seed[cur];
                } else {
                    hunt_drops++;
                }
            } else {
                if (wptr == 1) {
                    /* {4'hE, hi[5:0], ~hi[5:0]}, hi = {drops[3:0], lane[1:0]} */
                    unsigned hi = (w >> 6) & 0x3F, lo = w & 0x3F;
                    if ((w >> 12) != 0xE || lo != ((~hi) & 0x3F) ||
                        (int)(hi & 0x3) != cur) {
                        lanes[cur].lane_id_err++;
                    } else if (hi >> 2) {
                        lanes[cur].drops += hi >> 2;
                        unlock_lane(cur);   /* ramp gap expected nearby */
                    }
                    crc_acc = crc12(crc_acc, val);
                } else if (wptr == 2) {
                    crc_acc = crc12(crc_acc, val);
                    if (lanes[cur].have_cnt &&
                        ((lanes[cur].last_cnt + 1) & 0xFFF) != val) {
                        lanes[cur].seq_gap++;
                        unlock_lane(cur);
                    }
                    lanes[cur].last_cnt = val;
                    lanes[cur].have_cnt = 1;
                } else if (wptr <= 130) {
                    crc_acc = crc12(crc_acc, val);
                    frame_data[wptr - 3] = val;
                } else {
                    /* wptr == 131: CRC — check ramp only if clean */
                    if (val != crc_acc) {
                        lanes[cur].crc_err++;
                        unlock_lane(cur);
                    } else {
                        check_frame(cur, frame_data);
                    }
                    lanes[cur].frames++;
                    state = 0;
                }
                wptr++;
                if (wptr > 131) state = 0;  /* safety */
            }
        }

        printf("\r  %.1f MB...", total_read / 1e6);
        fflush(stdout);
    }
    printf("\n");

    printf("\n============================================================\n");
    printf("  Ramp Pattern Check (sample-exact time advancement)\n");
    printf("============================================================\n");
    size_t tot_err = 0, tot_checked = 0, tot_drops = 0;
    for (int l = 0; l < 4; l++) {
        printf("  Lane %d: frames=%zu crc=%zu seq=%zu lane_id=%zu drops=%zu\n",
               l, lanes[l].frames, lanes[l].crc_err, lanes[l].seq_gap,
               lanes[l].lane_id_err, lanes[l].drops);
        tot_err += lanes[l].crc_err + lanes[l].seq_gap + lanes[l].lane_id_err
                   + lanes[l].drops;
        tot_drops += lanes[l].drops;
    }
    printf("  hunt drops: %zu\n", hunt_drops);
    printf("------------------------------------------------------------\n");
    for (int c = 0; c < 8; c++) {
        printf("  ch %d (lane %d %s): checked=%zu holds=%zu skips=%zu other=%zu%s\n",
               c, c / 2, (c & 1) ? "odd " : "even",
               chans[c].checked, chans[c].holds, chans[c].skips,
               chans[c].others, chans[c].locked ? "" : "  [NEVER LOCKED]");
        tot_err += chans[c].holds + chans[c].skips + chans[c].others;
        tot_checked += chans[c].checked;
        if (!chans[c].locked) tot_err++;
    }
    printf("------------------------------------------------------------\n");
    double dur = t_last - t_first;
    printf("  pipe: %.1f MB in %.3f s = %.2f MB/s sustained\n",
           total_read / 1e6, dur, total_read / 1e6 / dur);
    printf("  production (ramp advance): ch0 %.4f MS/s, ch7 %.4f MS/s\n",
           chans[0].ramp_adv / dur / 1e6, chans[7].ramp_adv / dur / 1e6);
    printf("  framed output: ch0 %.4f MS/s -> dropped %.1f%%\n",
           (lanes[0].frames * 64.0) / dur / 1e6,
           100.0 * (1.0 - (lanes[0].frames * 64.0) / chans[0].ramp_adv));
    printf("------------------------------------------------------------\n");
    printf("  delta histogram (top):\n");
    for (int pass = 0; pass < 12; pass++) {
        size_t best = 0; int bd = -1;
        for (int d = 1; d < 4096; d++)
            if (delta_hist[d] > best) { best = delta_hist[d]; bd = d; }
        if (bd < 0 || best == 0) break;
        printf("    delta %4d x %zu\n", bd, best);
        delta_hist[bd] = 0;
    }
    printf("  event word position mod 128 (top):\n");
    for (int pass = 0; pass < 8; pass++) {
        size_t best = 0; int bw = -1;
        for (int w = 0; w < 128; w++)
            if (wordpos_hist[w] > best) { best = wordpos_hist[w]; bw = w; }
        if (bw < 0 || best == 0) break;
        printf("    word %3d x %zu\n", bw, best);
        wordpos_hist[bw] = 0;
    }
    printf("  ch0 event spacing (frames, top):\n");
    for (int pass = 0; pass < 8; pass++) {
        size_t best = 0; int bs = -1;
        for (int s = 0; s < 64; s++)
            if (ch0_evt_spacing[s] > best) { best = ch0_evt_spacing[s]; bs = s; }
        if (bs < 0 || best == 0) break;
        printf("    %2d%s frames x %zu\n", bs, bs == 63 ? "+" : "", best);
        ch0_evt_spacing[bs] = 0;
    }
    printf("============================================================\n");
    int pass;
    if (throttle_us) {
        /* throttle mode: the run is a success iff the induced drops were
         * loudly reported in the LANE_ID drop nibble on every lane */
        pass = 1;
        for (int l = 0; l < 4; l++)
            if (lanes[l].drops == 0) pass = 0;
        printf("  %s (throttle mode: drops reported = %zu total, all lanes %s)\n",
               pass ? "PASS" : "FAIL", tot_drops,
               pass ? "reporting" : "NOT reporting");
    } else {
        pass = (tot_err == 0 && tot_checked > 0);
        printf("  %s (%zu errors, %zu samples checked, %zu drops reported)\n",
               pass ? "PASS" : "FAIL", tot_err, tot_checked, tot_drops);
    }
    printf("============================================================\n");

    FT_ClearStreamPipe(h, FALSE, FALSE, 0x82);
    FT_Close(h);
    return pass ? 0 : 1;
}
