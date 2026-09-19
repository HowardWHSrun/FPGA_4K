/* wave_record.c — record the 4-lane framed stream to a 512-channel WAV file
 *
 * Channel mapping (per docs/FRAMING_SPEC.txt):
 *   Each 132-word frame carries 64 amplifier steps x 2 data lines
 *   (even/odd interleaved, data word 0 = even line, amplifier 0).
 *   8 data lines x 64 amplifiers = 512 channels.
 *     wav_channel = line*64 + amplifier,  line = 2*lane + odd  (D1..D8 order)
 *
 * Each channel yields one sample per frame period. The board delivers
 * 1.000 MS/s per data line (measured exactly via the FPGA ramp pattern,
 * pattern_check), i.e. 64 samples/channel per frame -> the per-channel
 * sample rate is exactly 15625 Hz.
 *
 * Samples are 12-bit unsigned (midscale ~2048); stored as 16-bit signed PCM:
 *   pcm = (val - 2048) << 4      (1 ADC LSB = 16 PCM counts, reversible)
 *
 * Frames from the 4 lanes run in lockstep (same CYCLE_CNT); one WAV sample
 * frame (512 samples) is flushed per cycle count. A lane missing from a
 * slice (dropped/CRC-failed frame) is filled with 0 (= midscale) and counted.
 *
 * Usage: wave_record [MB] [out.wav]   (default 8 MB -> capture.wav)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <unistd.h>
#include <time.h>
#include "ftd3xx.h"

#define CHUNK_SIZE   (64 * 1024)
#define DEFAULT_MB   8
#define FLUSH_BYTES  (512 * 1024)

#define N_CHANNELS   512
#define SAMPLE_RATE  15625          /* 1 MS/s per line / 64 samples per frame */

/* CRC-12 ITU-T (poly 0x80F) — must match usb_framer.
 * Table-driven: the bit-loop version was too slow to keep the read loop
 * fed at 16.5 MB/s, backpressuring the FT600 and causing silent FPGA-side
 * FIFO sample drops (the "staircase"). */
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

/* ---- WAV writing (16-bit PCM, sizes patched at close) ---------------- */
static void wr_u16(FILE *f, uint16_t v) { fputc(v & 0xFF, f); fputc(v >> 8, f); }
static void wr_u32(FILE *f, uint32_t v) {
    fputc(v & 0xFF, f); fputc((v >> 8) & 0xFF, f);
    fputc((v >> 16) & 0xFF, f); fputc((v >> 24) & 0xFF, f);
}

static void wav_write_header(FILE *f, uint32_t data_bytes) {
    fseek(f, 0, SEEK_SET);
    fwrite("RIFF", 1, 4, f);
    wr_u32(f, 36 + data_bytes);
    fwrite("WAVE", 1, 4, f);
    fwrite("fmt ", 1, 4, f);
    wr_u32(f, 16);
    wr_u16(f, 1);                              /* PCM */
    wr_u16(f, N_CHANNELS);
    wr_u32(f, SAMPLE_RATE);
    wr_u32(f, (uint32_t)SAMPLE_RATE * N_CHANNELS * 2);   /* byte rate */
    wr_u16(f, N_CHANNELS * 2);                 /* block align */
    wr_u16(f, 16);                             /* bits per sample */
    fwrite("data", 1, 4, f);
    wr_u32(f, data_bytes);
}

/* ---- slice assembler: one 512-sample WAV frame per cycle count ------- */
static int16_t  slice[N_CHANNELS];
static int      slice_cnt = -1;    /* CYCLE_CNT of the slice being built */
static unsigned slice_mask = 0;    /* lanes committed so far */
static int      last_flush_cnt = -1;
static size_t   slices_written = 0, partial_slices = 0, filler_slices = 0;

/* WAV data is accumulated in RAM and written to disk only after the
 * capture ends: an fwrite that hits the disk mid-capture stalls the read
 * loop past the ~1-2 ms of FPGA+FT600 buffering and causes real sample
 * drops (visible in the LANE_ID drop count). ~31 MB of RAM per 32 MB
 * captured. */
static int16_t *wav_buf = NULL;
static size_t   wav_buf_slices = 0, wav_buf_cap = 0;   /* in slices */

static void slice_out(const int16_t *s) {
    if (wav_buf_slices == wav_buf_cap) {
        wav_buf_cap = wav_buf_cap ? wav_buf_cap * 2 : 4096;
        wav_buf = realloc(wav_buf, wav_buf_cap * N_CHANNELS * sizeof(int16_t));
        if (!wav_buf) { perror("realloc"); exit(1); }
    }
    memcpy(wav_buf + wav_buf_slices * N_CHANNELS, s,
           N_CHANNELS * sizeof(int16_t));
    wav_buf_slices++;
}

static void slice_flush(void) {
    if (slice_cnt < 0) return;
    slice_out(slice);
    slices_written++;
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
        /* keep the timeline uniform: emit midscale filler slices for any
         * cycle counts skipped entirely (all 4 lanes' frames lost) */
        if (last_flush_cnt >= 0) {
            unsigned gap = (cnt - last_flush_cnt - 1) & 0xFFF;
            if (gap > 0 && gap < 2048) {   /* forward gap, not reordering */
                static const int16_t zero[N_CHANNELS];
                for (unsigned g = 0; g < gap; g++) {
                    slice_out(zero);
                    slices_written++;
                    filler_slices++;
                }
            }
        }
        slice_cnt = cnt;
        memset(slice, 0, sizeof(slice));       /* 0 = midscale fill */
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

int main(int argc, char *argv[]) {
    int mb = DEFAULT_MB;
    const char *outname = "capture.wav";
    if (argc > 1) mb = atoi(argv[1]);
    if (mb < 1) mb = 1;
    if (argc > 2) outname = argv[2];

    crc12_init();
    printf("4-lane 512-channel WAV recorder: %d MB -> %s\n", mb, outname);
    printf("  %d channels, %d Hz, 16-bit PCM (pcm = (adc-2048)<<4)\n\n",
           N_CHANNELS, SAMPLE_RATE);

    /* Preallocate the in-RAM WAV buffer: output slices <= input frames / 4
     * (1056 input bytes -> 1024 WAV bytes per slice), plus slack for
     * filler slices. Grown by slice_out() if ever exceeded. */
    wav_buf_cap = ((size_t)mb * 1024 * 1024) / 1056 + 8192;
    wav_buf = malloc(wav_buf_cap * N_CHANNELS * sizeof(int16_t));
    if (!wav_buf) { perror("malloc"); return 1; }

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

    /* Flush the startup transient: the FPGA stalls between runs (nobody
     * reading) and the first ~30 KB of a fresh stream carry stale frames
     * plus the drop reports from that stall. The pipe is usually EMPTY
     * right after FT_SetStreamPipe (previous run purged it), so an
     * xfer==0 read must NOT abort the flush — that bug made every run
     * start with the transient in the recording. */
    size_t flushed = 0;
    int empties = 0;
    while (flushed < FLUSH_BYTES && empties < 4) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) empties++;
        else { empties = 0; flushed += xfer; }
    }

    /* Per-lane state. LANE_ID is dynamic (payload {hi,~hi} with
     * hi = {drops[3:0], lane[1:0]}), so the CRC seed folds SYNC only and
     * the received LANE_ID word is folded in as it arrives. */
    lane_t lanes[4] = {{0}};
    unsigned short sync_word[4], crc_seed[4];
    for (int l = 0; l < 4; l++) {
        sync_word[l] = 0xFA35 + 0x0111 * l;
        crc_seed[l] = crc12(0, sync_word[l] & 0xFFF);
    }

    size_t total_bytes = (size_t)mb * 1024 * 1024;
    size_t total_read = 0;
    size_t hunt_drops = 0;

    struct timespec ts_prev, ts1;
    clock_gettime(CLOCK_MONOTONIC, &ts_prev);
    size_t gap_hist[4] = {0};
    double gap_max = 0;
    int state = 0;   /* 0=HUNT, 1=FRAME */
    int wptr = 0, cur = 0;
    unsigned short crc_acc = 0;
    unsigned short frame_cnt = 0;
    unsigned short frame_data[128];

    while (total_read < total_bytes) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        clock_gettime(CLOCK_MONOTONIC, &ts1);
        double gap = (ts1.tv_sec - ts_prev.tv_sec)*1e3 +
                     (ts1.tv_nsec - ts_prev.tv_nsec)*1e-6;
        ts_prev = ts1;
        if (gap > gap_max) gap_max = gap;
        if (gap > 1.5)  gap_hist[0]++;
        if (gap > 3.0)  gap_hist[1]++;
        if (gap > 6.0)  gap_hist[2]++;
        if (gap > 12.0) gap_hist[3]++;
        if (st != FT_OK) break;
        if (xfer == 0) { usleep(10000); continue; }
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
                        fprintf(stderr, "  [drop report: lane %d frame %zu "
                                "count %u]\n", cur, lanes[cur].frames, hi >> 2);
                    }
                    crc_acc = crc12(crc_acc, val);
                } else if (wptr == 2) {
                    crc_acc = crc12(crc_acc, val);
                    if (lanes[cur].have_cnt &&
                        ((lanes[cur].last_cnt + 1) & 0xFFF) != val)
                        lanes[cur].seq_gap++;
                    lanes[cur].last_cnt = val;
                    lanes[cur].have_cnt = 1;
                    frame_cnt = val;
                } else if (wptr <= 130) {
                    crc_acc = crc12(crc_acc, val);
                    frame_data[wptr - 3] = val;
                } else {
                    /* wptr == 131: CRC — commit frame only if clean */
                    if (val != crc_acc)
                        lanes[cur].crc_err++;
                    else
                        slice_commit(cur, frame_cnt, frame_data);
                    lanes[cur].frames++;
                    state = 0;
                }
                wptr++;
                if (wptr > 131) state = 0;  /* safety */
            }
        }

        /* progress print throttled to ~1/MB: 250 terminal writes/s can
         * block long enough to drop samples */
        if ((total_read & ~((size_t)1024 * 1024 - 1)) !=
            ((total_read - xfer) & ~((size_t)1024 * 1024 - 1))) {
            printf("\r  %.1f MB, %zu WAV sample frames (%.2f s of waveform)   ",
                   total_read / 1e6, slices_written,
                   (double)slices_written / SAMPLE_RATE);
            fflush(stdout);
        }
    }
    printf("\n");
    slice_flush();

    /* Capture done — now hit the disk */
    FILE *wav = fopen(outname, "wb");
    if (!wav) { perror(outname); return 1; }
    uint32_t data_bytes =
        (uint32_t)(slices_written * N_CHANNELS * sizeof(int16_t));
    wav_write_header(wav, data_bytes);
    fwrite(wav_buf, sizeof(int16_t), slices_written * N_CHANNELS, wav);
    fclose(wav);
    free(wav_buf);

    printf("\n============================================================\n");
    printf("  512-Channel WAV Recording\n");
    printf("============================================================\n");
    printf("  File:          %s\n", outname);
    printf("  Sample frames: %zu (%.3f s @ %d Hz, %u data bytes)\n",
           slices_written, (double)slices_written / SAMPLE_RATE,
           SAMPLE_RATE, data_bytes);
    printf("  Partial slices (missing lane, midscale-filled): %zu\n",
           partial_slices);
    printf("  Filler slices (whole cycle count lost, midscale): %zu\n",
           filler_slices);
    size_t tot_err = 0, tot_drops = 0;
    for (int l = 0; l < 4; l++) {
        printf("  Lane %d: frames=%zu crc=%zu seq=%zu lane_id=%zu drops=%zu\n",
               l, lanes[l].frames, lanes[l].crc_err, lanes[l].seq_gap,
               lanes[l].lane_id_err, lanes[l].drops);
        tot_err += lanes[l].crc_err + lanes[l].lane_id_err;
        tot_drops += lanes[l].drops;
    }
    if (tot_drops)
        printf("  *** %zu SAMPLES DROPPED on the FPGA (host too slow) ***\n",
               tot_drops);
    printf("  hunt drops: %zu\n", hunt_drops);
    printf("  read gaps >1.5/3/6/12ms: %zu/%zu/%zu/%zu  max %.1f ms\n",
           gap_hist[0], gap_hist[1], gap_hist[2], gap_hist[3], gap_max);
    printf("============================================================\n");
    printf("  Channel map: wav_ch = line*64 + amplifier  (line = D1..D8 - 1)\n");
    printf("  Python:  from scipy.io import wavfile\n");
    printf("           rate, d = wavfile.read('%s')  # d.shape = (N, 512)\n",
           outname);
    printf("============================================================\n");

    FT_ClearStreamPipe(h, FALSE, FALSE, 0x82);
    FT_Close(h);
    return (tot_err == 0 && tot_drops == 0 && slices_written > 0) ? 0 : 1;
}
