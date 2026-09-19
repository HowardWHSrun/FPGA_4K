#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <math.h>
#include "ftd3xx.h"

/*
 * channel_verify — Per-channel diagnostics from 4-lane framed USB stream.
 *
 * Reads the same bitstream as usb_frame_reader (4-lane, through async FIFO),
 * decodes frames, and reports per-channel (D1–D8) stats with per-amplifier
 * position breakdown for any channel that looks anomalous.
 *
 * Usage:
 *   ./channel_verify              — 1 MB, summary only
 *   ./channel_verify 10           — 10 MB
 *   ./channel_verify 10 --detail  — show per-amp breakdown for all channels
 *
 * Cross-check with adc_channel_test (no FIFO path):
 *   cd ../adc_channel_test && make flash && ./channel_test all 1
 */

#define CHUNK_SIZE   (64 * 1024)
#define N_LANES      4
#define DATA_WORDS   128
#define N_AMPS       64
#define CRC_POLY     0x80F
#define OUTLIER_DIST 500  /* flag samples > this distance from 2048 */
#define SD_THRESH    20.0
#define OUTLIER_PCT  1.0

static const unsigned short SYNC_WORDS[N_LANES] = {
    0xFA35, 0xFB46, 0xFC57, 0xFD68
};

static unsigned short crc12_update(unsigned short crc, unsigned short word) {
    for (int i = 11; i >= 0; i--) {
        if (((word >> i) & 1) ^ ((crc >> 11) & 1))
            crc = ((crc << 1) & 0xFFF) ^ CRC_POLY;
        else
            crc = (crc << 1) & 0xFFF;
    }
    return crc;
}

static int match_sync(unsigned short w) {
    for (int i = 0; i < N_LANES; i++)
        if (w == SYNC_WORDS[i]) return i;
    return -1;
}

/* Per-channel stats: 8 channels (lane*2 + is_odd) */
typedef struct {
    double sum, sum_sq;
    size_t count;
    unsigned short vmin, vmax;
    size_t outliers;
    /* Per-amplifier position breakdown (64 positions) */
    double amp_sum[N_AMPS];
    double amp_sum_sq[N_AMPS];
    size_t amp_count[N_AMPS];
    size_t amp_outliers[N_AMPS];
} ch_stats_t;

int main(int argc, char *argv[]) {
    int total_mb = 1;
    int detail = 0;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--detail") == 0)
            detail = 1;
        else
            total_mb = atoi(argv[i]);
    }
    if (total_mb < 1) total_mb = 1;

    FT_STATUS st;
    FT_HANDLE handle = NULL;
    DWORD count = 0;

    st = FT_CreateDeviceInfoList(&count);
    if (count == 0) { printf("No devices\n"); return 1; }

    st = FT_Create(0, FT_OPEN_BY_INDEX, &handle);
    if (st != FT_OK) { printf("FT_Create failed: %d\n", st); return 1; }

    FT_SetPipeTimeout(handle, 0x82, 3000);
    st = FT_SetStreamPipe(handle, FALSE, FALSE, 0x82, CHUNK_SIZE);
    if (st != FT_OK) {
        printf("SetStreamPipe failed: %d\n", st);
        FT_Close(handle);
        return 1;
    }

    /* Flush stale data */
    {
        UCHAR fb[CHUNK_SIZE]; ULONG fx; size_t fl = 0;
        while (fl < 512 * 1024) {
            fx = 0;
            if (FT_ReadPipe(handle, 0x82, fb, CHUNK_SIZE, &fx, 500) != FT_OK || fx == 0) break;
            fl += fx;
        }
    }

    printf("Reading %d MB, per-channel diagnostics...\n\n", total_mb);

    /* 8 channels: D1=lane0 even, D2=lane0 odd, D3=lane1 even, ... */
    ch_stats_t ch[8];
    memset(ch, 0, sizeof(ch));
    for (int i = 0; i < 8; i++) { ch[i].vmin = 0xFFFF; }

    /* Decoder state */
    int state = 0; /* HUNT */
    int frame_pos = 0, cur_lane = 0;
    unsigned short crc_acc = 0;
    unsigned short frame_data[DATA_WORDS];
    size_t total_frames = 0, crc_errors = 0;

    UCHAR buf[CHUNK_SIZE];
    ULONG transferred;
    size_t total_read = 0;
    size_t total_bytes = (size_t)total_mb * 1024 * 1024;

    struct timespec t_start, t_now;
    clock_gettime(CLOCK_MONOTONIC, &t_start);

    while (total_read < total_bytes) {
        transferred = 0;
        st = FT_ReadPipe(handle, 0x82, buf, CHUNK_SIZE, &transferred, 3000);
        if (st != FT_OK) break;
        if (transferred == 0) { usleep(10000); continue; }
        total_read += transferred;

        int n_words = transferred / 2;
        for (int i = 0; i < n_words; i++) {
            unsigned short w = buf[i*2] | (buf[i*2+1] << 8);
            unsigned short tag = (w >> 12) & 0xF;
            unsigned short val = w & 0x0FFF;

            if (state == 0) {
                int lane = match_sync(w);
                if (lane >= 0) {
                    state = 1; frame_pos = 1; cur_lane = lane;
                    crc_acc = crc12_update(0, val);
                }
            } else {
                if (frame_pos == 1) {
                    if (tag != 0xE) { state = 0; continue; }
                    crc_acc = crc12_update(crc_acc, val);
                    frame_pos = 2;
                } else if (frame_pos == 2) {
                    if (tag != 0xD) { state = 0; continue; }
                    crc_acc = crc12_update(crc_acc, val);
                    frame_pos = 3;
                } else if (frame_pos >= 3 && frame_pos <= 130) {
                    if (tag != 0x0) { state = 0; continue; }
                    frame_data[frame_pos - 3] = val;
                    crc_acc = crc12_update(crc_acc, val);
                    frame_pos++;
                } else if (frame_pos == 131) {
                    if (tag != 0xC || val != crc_acc) { crc_errors++; state = 0; continue; }

                    /* Valid frame — accumulate per-channel stats */
                    total_frames++;
                    int ch_even = cur_lane * 2;      /* D1,D3,D5,D7 */
                    int ch_odd  = cur_lane * 2 + 1;  /* D2,D4,D6,D8 */

                    for (int d = 0; d < DATA_WORDS; d++) {
                        int is_odd = d % 2;
                        int amp = d / 2;
                        int c = is_odd ? ch_odd : ch_even;
                        unsigned short v = frame_data[d];

                        ch[c].sum += v;
                        ch[c].sum_sq += (double)v * v;
                        ch[c].count++;
                        if (v < ch[c].vmin) ch[c].vmin = v;
                        if (v > ch[c].vmax) ch[c].vmax = v;
                        if (abs((int)v - 2048) > OUTLIER_DIST) ch[c].outliers++;

                        ch[c].amp_sum[amp] += v;
                        ch[c].amp_sum_sq[amp] += (double)v * v;
                        ch[c].amp_count[amp]++;
                        if (abs((int)v - 2048) > OUTLIER_DIST) ch[c].amp_outliers[amp]++;
                    }

                    state = 0;
                }
            }
        }

        clock_gettime(CLOCK_MONOTONIC, &t_now);
        double elapsed = (t_now.tv_sec - t_start.tv_sec) +
                         (t_now.tv_nsec - t_start.tv_nsec) / 1e9;
        printf("\r  %.1f MB, %zu frames, %.1f MB/s    ",
               total_read / 1e6, total_frames, (total_read / 1e6) / elapsed);
        fflush(stdout);
    }

    printf("\n\n");

    /* Summary */
    static const char *pin_names[] = {"B15","B16","C15","C16","J15","K15","K14","J14"};
    static const char *lane_labels[] = {
        "D1 L0 even", "D2 L0 odd ", "D3 L1 even", "D4 L1 odd ",
        "D5 L2 even", "D6 L2 odd ", "D7 L3 even", "D8 L3 odd "
    };

    printf("============================================================\n");
    printf("  %zu frames decoded, %zu CRC errors\n", total_frames, crc_errors);
    printf("============================================================\n\n");

    printf("%-13s %-4s %8s %8s %6s %6s %8s %7s  %s\n",
           "Channel", "Pin", "Mean", "StdDev", "Min", "Max", "Outliers", "Out%%", "Status");
    printf("------------- ---- -------- -------- ------ ------ -------- -------  ------\n");

    int flagged[8] = {0};

    for (int c = 0; c < 8; c++) {
        if (ch[c].count == 0) continue;
        double mean = ch[c].sum / ch[c].count;
        double var = (ch[c].sum_sq / ch[c].count) - (mean * mean);
        double sd = sqrt(var > 0 ? var : 0);
        double out_pct = 100.0 * ch[c].outliers / ch[c].count;

        int pass = (sd < SD_THRESH && out_pct < OUTLIER_PCT);
        if (!pass) flagged[c] = 1;

        printf("%-13s %-4s %8.1f %8.1f %6u %6u %8zu %6.2f%%  %s\n",
               lane_labels[c], pin_names[c],
               mean, sd, ch[c].vmin, ch[c].vmax,
               ch[c].outliers, out_pct,
               pass ? "PASS" : "FLAG");
    }

    /* Per-amp breakdown for flagged channels (or all if --detail) */
    int any_flagged = 0;
    for (int c = 0; c < 8; c++) if (flagged[c] || detail) any_flagged = 1;

    if (any_flagged) {
        printf("\n============================================================\n");
        printf("  Per-amplifier position breakdown\n");
        printf("============================================================\n");

        for (int c = 0; c < 8; c++) {
            if (!flagged[c] && !detail) continue;
            printf("\n  %s (%s)%s:\n", lane_labels[c], pin_names[c],
                   flagged[c] ? " [FLAGGED]" : "");
            printf("  %4s %8s %8s %8s %7s\n", "Amp", "Mean", "StdDev", "Count", "Out%");
            printf("  ---- -------- -------- -------- -------\n");
            for (int a = 0; a < N_AMPS; a++) {
                if (ch[c].amp_count[a] == 0) continue;
                double m = ch[c].amp_sum[a] / ch[c].amp_count[a];
                double v = (ch[c].amp_sum_sq[a] / ch[c].amp_count[a]) - (m * m);
                double s = sqrt(v > 0 ? v : 0);
                double op = 100.0 * ch[c].amp_outliers[a] / ch[c].amp_count[a];
                printf("  %4d %8.1f %8.1f %8zu %6.2f%%\n",
                       a, m, s, ch[c].amp_count[a], op);
            }
        }
    }

    printf("\n============================================================\n");
    int all_pass = 1;
    for (int c = 0; c < 8; c++) if (flagged[c]) all_pass = 0;
    if (all_pass)
        printf("  PASS — all 8 channels within tolerance\n");
    else {
        printf("  FLAGGED channels detected — cross-check without FIFO:\n");
        printf("    cd ../adc_channel_test && make flash && make channel_test\n");
        for (int c = 0; c < 8; c++)
            if (flagged[c])
                printf("    ./channel_test %d 1    # test %s (%s)\n",
                       c + 1, lane_labels[c], pin_names[c]);
    }
    printf("============================================================\n");

    FT_ClearStreamPipe(handle, FALSE, FALSE, 0x82);
    FT_Close(handle);
    return 0;
}
