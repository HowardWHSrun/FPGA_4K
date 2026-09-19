#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <math.h>
#include "ftd3xx.h"

#define CHUNK_SIZE  (64 * 1024)
#define DEFAULT_MB  1
#define N_LANES     4

/* Frame protocol constants */
#define TAG_SYNC     0xF
#define TAG_LANE_ID  0xE
#define TAG_CYCLE    0xD
#define TAG_DATA     0x0
#define TAG_CRC      0xC
#define DATA_WORDS   128
#define FRAME_WORDS  132
#define CRC_POLY     0x80F

static const unsigned short SYNC_WORDS[N_LANES] = {
    0xFA35, 0xFB46, 0xFC57, 0xFD68
};

/* CRC-12 (ITU-T 0x80F, MSB-first per-word, matches usb_framer.v) */
static unsigned short crc12_update(unsigned short crc, unsigned short word) {
    for (int i = 11; i >= 0; i--) {
        if (((word >> i) & 1) ^ ((crc >> 11) & 1))
            crc = ((crc << 1) & 0xFFF) ^ CRC_POLY;
        else
            crc = (crc << 1) & 0xFFF;
    }
    return crc;
}

/* Check if word matches any SYNC pattern, return lane or -1 */
static int match_sync(unsigned short w) {
    for (int i = 0; i < N_LANES; i++)
        if (w == SYNC_WORDS[i]) return i;
    return -1;
}

/* Per-lane decoder state */
enum { HUNT, FRAME };

typedef struct {
    size_t frames_decoded;
    size_t crc_errors;
    size_t seq_gaps;
    size_t lane_id_errors;
    size_t tag_errors;

    /* Per-channel stats (even=0, odd=1) */
    double sum[2], sum_sq[2];
    size_t count[2];
    unsigned short vmin[2], vmax[2];

    unsigned short exp_cycle;
    int have_exp_cycle;
} lane_stats_t;

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage:\n");
        printf("  ./usb_frame_reader <MB>            — capture and decode\n");
        printf("  ./usb_frame_reader <MB> -o out.csv  — also write CSV\n");
        return 1;
    }

    int total_mb = atoi(argv[1]);
    if (total_mb < 1) total_mb = DEFAULT_MB;

    const char *csv_path = NULL;
    if (argc >= 4 && strcmp(argv[2], "-o") == 0)
        csv_path = argv[3];

    /* Open device */
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

    /* Flush stale data in FT600 TX buffer */
    {
        UCHAR flush_buf[CHUNK_SIZE];
        ULONG flush_xfer;
        size_t flushed = 0;
        while (flushed < 512 * 1024) {
            flush_xfer = 0;
            FT_STATUS fst = FT_ReadPipe(handle, 0x82, flush_buf, CHUNK_SIZE, &flush_xfer, 500);
            if (fst != FT_OK || flush_xfer == 0) break;
            flushed += flush_xfer;
        }
    }

    printf("Reading %d MB, decoding 4-lane frames...\n\n", total_mb);

    /* Decoder state */
    int state = HUNT;
    int frame_pos = 0;
    int cur_lane = 0;
    unsigned short rx_cycle = 0;
    unsigned short crc_acc = 0;
    unsigned short frame_data[DATA_WORDS];

    lane_stats_t lanes[N_LANES];
    memset(lanes, 0, sizeof(lanes));
    for (int l = 0; l < N_LANES; l++)
        lanes[l].vmin[0] = lanes[l].vmin[1] = 0xFFFF;

    FILE *csv_fp = NULL;
    if (csv_path) {
        csv_fp = fopen(csv_path, "w");
        if (!csv_fp) { printf("Cannot open %s\n", csv_path); return 1; }
        fprintf(csv_fp, "lane,cycle_cnt");
        for (int i = 0; i < DATA_WORDS; i++) {
            int is_odd = i % 2;
            fprintf(csv_fp, ",ch%s_amp%d", is_odd ? "odd" : "even", i / 2);
        }
        fprintf(csv_fp, "\n");
    }

    UCHAR buf[CHUNK_SIZE];
    ULONG transferred;
    size_t total_read = 0;
    size_t total_bytes = (size_t)total_mb * 1024 * 1024;

    struct timespec t_start, t_now;
    clock_gettime(CLOCK_MONOTONIC, &t_start);

    while (total_read < total_bytes) {
        transferred = 0;
        st = FT_ReadPipe(handle, 0x82, buf, CHUNK_SIZE, &transferred, 3000);
        if (st != FT_OK) { printf("\nRead error: %d\n", st); break; }
        if (transferred == 0) { usleep(10000); continue; }
        total_read += transferred;

        int n_words = transferred / 2;
        for (int i = 0; i < n_words; i++) {
            unsigned short w = buf[i*2] | (buf[i*2+1] << 8);
            unsigned short tag = (w >> 12) & 0xF;
            unsigned short val = w & 0x0FFF;

            if (state == HUNT) {
                int lane = match_sync(w);
                if (lane >= 0) {
                    state = FRAME;
                    frame_pos = 1;
                    cur_lane = lane;
                    crc_acc = crc12_update(0, val);
                }
            } else {
                lane_stats_t *ls = &lanes[cur_lane];

                if (frame_pos == 1) {
                    /* LANE_ID */
                    if (tag != TAG_LANE_ID) {
                        ls->tag_errors++;
                        state = HUNT;
                        continue;
                    }
                    unsigned short hi = (val >> 6) & 0x3F;
                    unsigned short lo = val & 0x3F;
                    if (lo != (~hi & 0x3F)) {
                        ls->lane_id_errors++;
                        state = HUNT;
                        continue;
                    }
                    if ((hi & 0x3) != (unsigned short)cur_lane) {
                        ls->lane_id_errors++;
                        state = HUNT;
                        continue;
                    }
                    crc_acc = crc12_update(crc_acc, val);
                    frame_pos = 2;
                } else if (frame_pos == 2) {
                    /* CYCLE_CNT */
                    if (tag != TAG_CYCLE) {
                        ls->tag_errors++;
                        state = HUNT;
                        continue;
                    }
                    rx_cycle = val;
                    if (ls->have_exp_cycle && rx_cycle != ls->exp_cycle)
                        ls->seq_gaps++;
                    crc_acc = crc12_update(crc_acc, val);
                    frame_pos = 3;
                } else if (frame_pos >= 3 && frame_pos <= 130) {
                    /* DATA */
                    if (tag != TAG_DATA) {
                        ls->tag_errors++;
                        state = HUNT;
                        continue;
                    }
                    frame_data[frame_pos - 3] = val;
                    crc_acc = crc12_update(crc_acc, val);
                    frame_pos++;
                } else if (frame_pos == 131) {
                    /* CRC */
                    if (tag != TAG_CRC) {
                        ls->tag_errors++;
                        state = HUNT;
                        continue;
                    }
                    if (val != crc_acc) {
                        ls->crc_errors++;
                        state = HUNT;
                        continue;
                    }

                    /* Frame valid */
                    ls->frames_decoded++;
                    ls->exp_cycle = (rx_cycle + 1) & 0xFFF;
                    ls->have_exp_cycle = 1;

                    for (int d = 0; d < DATA_WORDS; d++) {
                        int ch = d % 2;
                        unsigned short v = frame_data[d];
                        ls->sum[ch] += v;
                        ls->sum_sq[ch] += (double)v * v;
                        ls->count[ch]++;
                        if (v < ls->vmin[ch]) ls->vmin[ch] = v;
                        if (v > ls->vmax[ch]) ls->vmax[ch] = v;
                    }

                    if (csv_fp) {
                        fprintf(csv_fp, "%d,%u", cur_lane, rx_cycle);
                        for (int d = 0; d < DATA_WORDS; d++)
                            fprintf(csv_fp, ",%u", frame_data[d]);
                        fprintf(csv_fp, "\n");
                    }

                    state = HUNT;
                }
            }
        }

        clock_gettime(CLOCK_MONOTONIC, &t_now);
        double elapsed = (t_now.tv_sec - t_start.tv_sec) +
                         (t_now.tv_nsec - t_start.tv_nsec) / 1e9;
        double rate = (total_read / 1e6) / elapsed;
        size_t total_frames = 0;
        for (int l = 0; l < N_LANES; l++) total_frames += lanes[l].frames_decoded;
        printf("\r  %.1f MB, %zu frames, %.1f MB/s    ",
               total_read / 1e6, total_frames, rate);
        fflush(stdout);
    }

    if (csv_fp) fclose(csv_fp);

    clock_gettime(CLOCK_MONOTONIC, &t_now);
    double elapsed = (t_now.tv_sec - t_start.tv_sec) +
                     (t_now.tv_nsec - t_start.tv_nsec) / 1e9;

    size_t total_frames = 0, total_crc = 0, total_seq = 0;
    size_t total_lid = 0, total_tag = 0;
    for (int l = 0; l < N_LANES; l++) {
        total_frames += lanes[l].frames_decoded;
        total_crc    += lanes[l].crc_errors;
        total_seq    += lanes[l].seq_gaps;
        total_lid    += lanes[l].lane_id_errors;
        total_tag    += lanes[l].tag_errors;
    }

    printf("\n\n============================================================\n");
    printf("  Read:           %.2f MB in %.2f s (%.1f MB/s)\n",
           total_read / 1e6, elapsed, (total_read / 1e6) / elapsed);
    printf("  Frames decoded: %zu  (total across 4 lanes)\n", total_frames);
    printf("============================================================\n");

    const char *lane_names[] = {"L0 (D1/D2)", "L1 (D3/D4)", "L2 (D5/D6)", "L3 (D7/D8)"};
    for (int l = 0; l < N_LANES; l++) {
        lane_stats_t *ls = &lanes[l];
        printf("\n  %-12s  frames=%zu  crc=%zu  seq=%zu  lid=%zu  tag=%zu\n",
               lane_names[l], ls->frames_decoded, ls->crc_errors,
               ls->seq_gaps, ls->lane_id_errors, ls->tag_errors);
        for (int ch = 0; ch < 2; ch++) {
            if (ls->count[ch] == 0) continue;
            double mean = ls->sum[ch] / ls->count[ch];
            double var  = (ls->sum_sq[ch] / ls->count[ch]) - (mean * mean);
            double sd   = sqrt(var > 0 ? var : 0);
            printf("    %s: mean=%.1f  sd=%.1f  min=%u  max=%u  (%zu samples)\n",
                   ch == 0 ? "even" : "odd ", mean, sd,
                   ls->vmin[ch], ls->vmax[ch], ls->count[ch]);
        }
    }

    printf("\n============================================================\n");
    printf("  TOTALS:  frames=%zu  crc=%zu  seq=%zu  lid=%zu  tag=%zu\n",
           total_frames, total_crc, total_seq, total_lid, total_tag);

    if (total_crc == 0 && total_seq == 0 && total_lid == 0 && total_tag == 0)
        printf("  PASS — all frames decoded with zero errors\n");
    else
        printf("  WARN — errors detected\n");
    printf("============================================================\n");

    if (csv_path)
        printf("  CSV: %s (%zu rows)\n", csv_path, total_frames);

    FT_ClearStreamPipe(handle, FALSE, FALSE, 0x82);
    FT_Close(handle);
    return 0;
}
