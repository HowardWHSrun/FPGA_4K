#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <math.h>
#include "ftd3xx.h"

#define CHUNK_SIZE  (64 * 1024)
#define DEFAULT_MB  1
#define FLUSH_BYTES (512 * 1024)

static const char *pin_names[] = {
    "", "B15", "B16", "C15", "C16", "J15", "K15", "K14", "J14"
};

typedef struct {
    double sum_val;
    double sum_sq;
    unsigned short vmin;
    unsigned short vmax;
    size_t total;
    size_t zeros;
} ch_stats_t;

static int send_cmd(FT_HANDLE handle, unsigned short cmd) {
    UCHAR buf[2] = { (UCHAR)(cmd & 0xFF), (UCHAR)((cmd >> 8) & 0xFF) };
    ULONG written = 0;
    FT_STATUS st = FT_WritePipe(handle, 0x02, buf, 2, &written, NULL);
    if (st != FT_OK) {
        printf("FT_WritePipe failed: %d\n", st);
        return -1;
    }
    return 0;
}

int main(int argc, char *argv[]) {
    int total_mb = DEFAULT_MB;
    if (argc > 1) total_mb = atoi(argv[1]);
    if (total_mb < 1) total_mb = 1;

    printf("ADC Auto-Adjust Diagnostic Test\n");
    printf("Reading %d MB from all 8 channels...\n\n", total_mb);

    /* Open device */
    FT_STATUS st;
    FT_HANDLE handle = NULL;
    DWORD count = 0;

    st = FT_CreateDeviceInfoList(&count);
    if (count == 0) { printf("No devices found\n"); return 1; }

    st = FT_Create(0, FT_OPEN_BY_INDEX, &handle);
    if (st != FT_OK) { printf("FT_Create failed: %d\n", st); return 1; }

    FT_SetPipeTimeout(handle, 0x82, 3000);
    st = FT_SetStreamPipe(handle, FALSE, FALSE, 0x82, CHUNK_SIZE);
    if (st != FT_OK) {
        printf("SetStreamPipe failed: %d\n", st);
        FT_Close(handle);
        return 1;
    }

    /* Send start command (0x0100) */
    if (send_cmd(handle, 0x0100) < 0) {
        FT_Close(handle);
        return 1;
    }
    usleep(200000);  /* let auto-adjust settle */

    /* Flush stale data */
    UCHAR buf[CHUNK_SIZE];
    ULONG transferred;
    size_t flushed = 0;
    while (flushed < FLUSH_BYTES) {
        transferred = 0;
        st = FT_ReadPipe(handle, 0x82, buf, CHUNK_SIZE, &transferred, 500);
        if (st != FT_OK || transferred == 0) break;
        flushed += transferred;
    }

    /* Per-channel stats (channels 1-8) */
    ch_stats_t stats[9];
    memset(stats, 0, sizeof(stats));
    for (int i = 1; i <= 8; i++) {
        stats[i].vmin = 0xFFFF;
    }

    size_t total_bytes = (size_t)total_mb * 1024 * 1024;
    size_t total_read = 0;
    size_t total_words = 0;
    size_t unknown_ch = 0;

    struct timespec t_start, t_now;
    clock_gettime(CLOCK_MONOTONIC, &t_start);

    while (total_read < total_bytes) {
        transferred = 0;
        st = FT_ReadPipe(handle, 0x82, buf, CHUNK_SIZE, &transferred, 3000);
        if (st != FT_OK) {
            printf("\nFT_ReadPipe error: %d\n", st);
            break;
        }
        if (transferred == 0) { usleep(10000); continue; }
        total_read += transferred;

        int n_words = transferred / 2;
        for (int i = 0; i < n_words; i++) {
            unsigned short w = buf[i*2] | (buf[i*2+1] << 8);
            unsigned short ch_id = (w >> 12) & 0xF;
            unsigned short val   = w & 0x0FFF;

            if (ch_id < 1 || ch_id > 8) {
                unknown_ch++;
                continue;
            }

            ch_stats_t *s = &stats[ch_id];
            s->sum_val += val;
            s->sum_sq  += (double)val * val;
            if (val < s->vmin) s->vmin = val;
            if (val > s->vmax) s->vmax = val;
            if (val == 0) s->zeros++;
            s->total++;
            total_words++;
        }

        clock_gettime(CLOCK_MONOTONIC, &t_now);
        double elapsed = (t_now.tv_sec - t_start.tv_sec) +
                         (t_now.tv_nsec - t_start.tv_nsec) / 1e9;
        double rate = (total_read / 1e6) / elapsed;
        printf("\r  %.1f MB read, %zu words, %.1f MB/s    ",
               total_read / 1e6, total_words, rate);
        fflush(stdout);
    }
    printf("\n\n");

    /* Send stop command (0x0200) */
    send_cmd(handle, 0x0200);

    /* Print results */
    clock_gettime(CLOCK_MONOTONIC, &t_now);
    double elapsed = (t_now.tv_sec - t_start.tv_sec) +
                     (t_now.tv_nsec - t_start.tv_nsec) / 1e9;

    printf("============================================================\n");
    printf("  ADC Auto-Adjust Diagnostic Test\n");
    printf("  Read: %.2f MB in %.2f s (%.1f MB/s)\n",
           total_read / 1e6, elapsed, (total_read / 1e6) / elapsed);
    printf("============================================================\n");

    printf("%-4s %-5s %8s %8s %6s %6s %8s %8s  %s\n",
           "Ch", "Pin", "Mean", "StdDev", "Min", "Max", "Zeros", "Samples", "Result");
    printf("---- ----- -------- -------- ------ ------ -------- --------  ------\n");

    int all_pass = 1;
    for (int ch = 1; ch <= 8; ch++) {
        ch_stats_t *s = &stats[ch];
        double mean = 0, stddev = 0;
        int pass = 0;

        if (s->total > 0) {
            mean = s->sum_val / s->total;
            double variance = (s->sum_sq / s->total) - (mean * mean);
            stddev = sqrt(variance > 0 ? variance : 0);
        }

        pass = (s->total > 0 &&
                mean > 1900 && mean < 2200 &&
                stddev < 100 &&
                s->zeros < s->total / 100);

        if (!pass) all_pass = 0;

        printf("%-4d %-5s %8.1f %8.1f %6u %6u %8zu %8zu  %s\n",
               ch, pin_names[ch],
               mean, stddev, s->vmin, s->vmax,
               s->zeros, s->total,
               pass ? "PASS" : "FAIL");
    }

    printf("============================================================\n");
    if (unknown_ch > 0)
        printf("  Warning: %zu words with unknown channel ID (stale buffer)\n", unknown_ch);
    printf("  OVERALL: %s\n", all_pass ? "PASS" : "FAIL");
    printf("============================================================\n");

    FT_ClearStreamPipe(handle, FALSE, FALSE, 0x82);
    FT_Close(handle);
    return all_pass ? 0 : 1;
}
