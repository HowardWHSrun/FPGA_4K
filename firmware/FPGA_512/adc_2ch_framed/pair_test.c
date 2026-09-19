#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <math.h>
#include "ftd3xx.h"

#define CHUNK_SIZE  (64 * 1024)
#define DEFAULT_MB  2
#define FLUSH_BYTES (512 * 1024)
#define SYNC_WORD   0xFA35

static const char *pair_names[] = {"D1+D2", "D3+D4", "D5+D6", "D7+D8"};
static const char *even_pins[]  = {"B15", "C15", "J15", "K14"};
static const char *odd_pins[]   = {"B16", "C16", "K15", "J14"};

/* CRC-12 ITU-T (poly 0x80F) — must match usb_framer */
static unsigned short crc12(unsigned short crc, unsigned short word) {
    crc ^= (word & 0xFFF);
    for (int i = 0; i < 12; i++) {
        if (crc & 0x800)
            crc = ((crc << 1) ^ 0x80F) & 0xFFF;
        else
            crc = (crc << 1) & 0xFFF;
    }
    return crc;
}

typedef struct {
    double sum, sum_sq;
    unsigned short vmin, vmax;
    size_t count;
} stats_t;

typedef struct {
    size_t frames, crc_err, seq_gap;
    stats_t even, odd;
} pair_result_t;

static int send_pair(FT_HANDLE h, int pair) {
    UCHAR buf[2] = { (UCHAR)(pair & 0x3), 0 };
    ULONG wr = 0;
    FT_STATUS st = FT_WritePipe(h, 0x02, buf, 2, &wr, NULL);
    return (st == FT_OK) ? 0 : -1;
}

static pair_result_t test_pair(FT_HANDLE h, int pair, int mb) {
    pair_result_t r = {0};
    r.even.vmin = r.odd.vmin = 0xFFFF;

    if (send_pair(h, pair) < 0) return r;
    usleep(200000);

    /* Flush stale */
    UCHAR buf[CHUNK_SIZE];
    ULONG xfer;
    size_t flushed = 0;
    while (flushed < FLUSH_BYTES) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) break;
        flushed += xfer;
    }

    /* Read and decode frames */
    size_t total_bytes = (size_t)mb * 1024 * 1024;
    size_t total_read = 0;
    int state = 0;  /* 0=HUNT, 1=FRAME */
    int wptr = 0;
    unsigned short crc_acc = 0;
    unsigned short last_cnt = 0xFFFF;
    int have_cnt = 0;

    /* CRC seed: fold SYNC and LANE_ID into initial CRC */
    unsigned short crc_seed = crc12(0, 0xA35);          /* SYNC */
    unsigned short lane_id = (0x00 << 6) | (~0x00 & 0x3F);
    crc_seed = crc12(crc_seed, lane_id & 0xFFF);       /* LANE_ID */

    while (total_read < total_bytes) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        if (st != FT_OK) break;
        if (xfer == 0) { usleep(10000); continue; }
        total_read += xfer;

        int n = xfer / 2;
        for (int i = 0; i < n; i++) {
            unsigned short w = buf[i*2] | (buf[i*2+1] << 8);
            unsigned short tag = (w >> 12) & 0xF;
            unsigned short val = w & 0xFFF;

            if (state == 0) {
                /* HUNT: look for SYNC */
                if (w == SYNC_WORD) {
                    state = 1;
                    wptr = 1;
                    crc_acc = crc_seed;
                }
            } else {
                if (wptr == 1) {
                    /* LANE_ID — skip check, fold into CRC already done via seed */
                } else if (wptr == 2) {
                    /* CYCLE_CNT */
                    crc_acc = crc12(crc_acc, val);
                    if (have_cnt && ((last_cnt + 1) & 0xFFF) != val)
                        r.seq_gap++;
                    last_cnt = val;
                    have_cnt = 1;
                } else if (wptr <= 130) {
                    /* DATA */
                    crc_acc = crc12(crc_acc, val);
                    /* Even samples at odd wptr (3,5,7...), odd at even wptr (4,6,8...) */
                    stats_t *s = (wptr & 1) ? &r.even : &r.odd;
                    s->sum += val;
                    s->sum_sq += (double)val * val;
                    if (val < s->vmin) s->vmin = val;
                    if (val > s->vmax) s->vmax = val;
                    s->count++;
                } else if (wptr == 131) {
                    /* CRC */
                    if (val != crc_acc)
                        r.crc_err++;
                    r.frames++;
                    state = 0;
                }
                wptr++;
                if (wptr > 131) state = 0;  /* safety */
            }
        }

        printf("\r  Pair %d (%s): %.1f MB, %zu frames    ",
               pair, pair_names[pair], total_read / 1e6, r.frames);
        fflush(stdout);
    }
    printf("\n");
    return r;
}

static void print_stats(const char *label, const char *pin, stats_t *s) {
    double mean = 0, sd = 0;
    if (s->count > 0) {
        mean = s->sum / s->count;
        double var = (s->sum_sq / s->count) - (mean * mean);
        sd = sqrt(var > 0 ? var : 0);
    }
    int pass = (s->count > 0 && mean > 1900 && mean < 2200 && sd < 100);
    printf("  %-5s %-5s %8.1f %8.1f %6u %6u %8zu  %s\n",
           label, pin, mean, sd, s->vmin, s->vmax, s->count,
           pass ? "PASS" : "FAIL");
}

int main(int argc, char *argv[]) {
    int mb = DEFAULT_MB;
    if (argc > 1) mb = atoi(argv[1]);
    if (mb < 1) mb = 1;

    printf("Pair-at-a-time pipeline test, %d MB per pair\n\n", mb);

    FT_STATUS st;
    FT_HANDLE h = NULL;
    DWORD cnt = 0;
    st = FT_CreateDeviceInfoList(&cnt);
    if (cnt == 0) { printf("No devices\n"); return 1; }
    st = FT_Create(0, FT_OPEN_BY_INDEX, &h);
    if (st != FT_OK) { printf("FT_Create failed: %d\n", st); return 1; }
    FT_SetPipeTimeout(h, 0x82, 3000);
    st = FT_SetStreamPipe(h, FALSE, FALSE, 0x82, CHUNK_SIZE);
    if (st != FT_OK) { printf("SetStreamPipe failed: %d\n", st); FT_Close(h); return 1; }

    pair_result_t results[4];
    int all_pass = 1;

    for (int p = 0; p < 4; p++)
        results[p] = test_pair(h, p, mb);

    printf("\n============================================================\n");
    printf("  Pair-at-a-Time Pipeline Test\n");
    printf("============================================================\n");
    printf("  %-5s %-5s %8s %8s %6s %6s %8s  %s\n",
           "Ch", "Pin", "Mean", "StdDev", "Min", "Max", "Samples", "Result");
    printf("  ----- ----- -------- -------- ------ ------ --------  ------\n");

    for (int p = 0; p < 4; p++) {
        pair_result_t *r = &results[p];
        char even_label[8], odd_label[8];
        snprintf(even_label, sizeof(even_label), "D%d", p*2+1);
        snprintf(odd_label,  sizeof(odd_label),  "D%d", p*2+2);
        print_stats(even_label, even_pins[p], &r->even);
        print_stats(odd_label,  odd_pins[p],  &r->odd);

        double emean = r->even.count ? r->even.sum / r->even.count : 0;
        double omean = r->odd.count  ? r->odd.sum  / r->odd.count  : 0;
        double evar = r->even.count ? (r->even.sum_sq/r->even.count) - emean*emean : 0;
        double ovar = r->odd.count  ? (r->odd.sum_sq /r->odd.count)  - omean*omean : 0;
        double esd = sqrt(evar > 0 ? evar : 0);
        double osd = sqrt(ovar > 0 ? ovar : 0);

        int ep = (r->even.count > 0 && emean > 1900 && emean < 2200 && esd < 100);
        int op = (r->odd.count  > 0 && omean > 1900 && omean < 2200 && osd < 100);
        if (!ep || !op) all_pass = 0;

        printf("         frames=%zu  crc=%zu  seq=%zu\n",
               r->frames, r->crc_err, r->seq_gap);
    }

    printf("============================================================\n");
    printf("  OVERALL: %s\n", all_pass ? "PASS" : "FAIL");
    printf("============================================================\n");

    FT_ClearStreamPipe(h, FALSE, FALSE, 0x82);
    FT_Close(h);
    return all_pass ? 0 : 1;
}
