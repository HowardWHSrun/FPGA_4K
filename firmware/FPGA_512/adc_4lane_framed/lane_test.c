/* lane_test.c — 4-lane framed pipeline test
 *
 * The FPGA streams all 4 lanes continuously; the arbiter emits complete
 * 132-word frames, each self-labelled by SYNC pattern + LANE_ID:
 *   Lane 0: SYNC 0xFA35  LANE_ID 0xE03F  D1(B15)+D2(B16)
 *   Lane 1: SYNC 0xFB46  LANE_ID 0xE07E  D3(C15)+D4(C16)
 *   Lane 2: SYNC 0xFC57  LANE_ID 0xE0BD  D5(J15)+D6(K15)
 *   Lane 3: SYNC 0xFD68  LANE_ID 0xE0FC  D7(K14)+D8(J14)
 *
 * Frame: {F,SYNC} {E,LANE} {D,CNT} {0,DATA}x128 {C,CRC-12 over all}
 * Data word 0 = even channel; strict even/odd alternation.
 *
 * Usage: lane_test [MB]   (default 8 — shared by all 4 lanes)
 * Pass per channel: mean in (1900,2200), stddev < 100; 0 CRC errors.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <math.h>
#include "ftd3xx.h"

#define CHUNK_SIZE  (64 * 1024)
#define DEFAULT_MB  8
#define FLUSH_BYTES (512 * 1024)

static const char *pin_name[8] =
    {"B15", "B16", "C15", "C16", "J15", "K15", "K14", "J14"};

/* CRC-12 ITU-T (poly 0x80F) — must match usb_framer.
 * Table-driven: the bit-loop version stalls the read loop below the 16.5
 * MB/s production rate, backpressuring the FT600 into real FPGA-side
 * sample drops — which the LANE_ID drop nibble now flags loudly. */
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
    double sum, sum_sq;
    unsigned short vmin, vmax;
    size_t count;
} stats_t;

typedef struct {
    size_t frames, crc_err, seq_gap, lane_id_err;
    unsigned short last_cnt;
    int have_cnt;
} lane_t;

int main(int argc, char *argv[]) {
    int mb = DEFAULT_MB;
    if (argc > 1) mb = atoi(argv[1]);
    if (mb < 1) mb = 1;

    printf("4-lane framed pipeline test, %d MB total\n\n", mb);
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

    /* Flush stale */
    size_t flushed = 0;
    while (flushed < FLUSH_BYTES) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) break;
        flushed += xfer;
    }

    /* Per-lane state; per-lane CRC seeds fold SYNC + LANE_ID */
    lane_t lanes[4] = {{0}};
    stats_t ch[8];
    for (int i = 0; i < 8; i++) {
        memset(&ch[i], 0, sizeof(stats_t));
        ch[i].vmin = 0xFFFF;
    }
    unsigned short sync_word[4], lane_id_word[4], crc_seed[4];
    for (int l = 0; l < 4; l++) {
        sync_word[l] = 0xFA35 + 0x0111 * l;
        unsigned short hi = l & 0x3;                  /* {4'b0, lane[1:0]} */
        unsigned short id = (hi << 6) | ((~hi) & 0x3F);
        lane_id_word[l] = 0xE000 | id;
        crc_seed[l] = crc12(crc12(0, sync_word[l] & 0xFFF), id);
    }

    size_t total_bytes = (size_t)mb * 1024 * 1024;
    size_t total_read = 0;
    size_t hunt_drops = 0;
    int state = 0;   /* 0=HUNT, 1=FRAME */
    int wptr = 0, cur = 0;
    unsigned short crc_acc = 0;

    while (total_read < total_bytes) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
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
                    if (w != lane_id_word[cur])
                        lanes[cur].lane_id_err++;
                    /* LANE_ID already folded via seed */
                } else if (wptr == 2) {
                    crc_acc = crc12(crc_acc, val);
                    if (lanes[cur].have_cnt &&
                        ((lanes[cur].last_cnt + 1) & 0xFFF) != val)
                        lanes[cur].seq_gap++;
                    lanes[cur].last_cnt = val;
                    lanes[cur].have_cnt = 1;
                } else if (wptr <= 130) {
                    crc_acc = crc12(crc_acc, val);
                    /* wptr 3 = data word 0 = even channel */
                    int c = 2*cur + ((wptr - 3) & 1);
                    stats_t *s = &ch[c];
                    s->sum += val;
                    s->sum_sq += (double)val * val;
                    if (val < s->vmin) s->vmin = val;
                    if (val > s->vmax) s->vmax = val;
                    s->count++;
                } else {
                    /* wptr == 131: CRC */
                    if (val != crc_acc)
                        lanes[cur].crc_err++;
                    lanes[cur].frames++;
                    state = 0;
                }
                wptr++;
                if (wptr > 131) state = 0;  /* safety */
            }
        }

        printf("\r  %.1f MB, frames L0=%zu L1=%zu L2=%zu L3=%zu    ",
               total_read / 1e6, lanes[0].frames, lanes[1].frames,
               lanes[2].frames, lanes[3].frames);
        fflush(stdout);
    }
    printf("\n");

    printf("\n============================================================\n");
    printf("  4-Lane Framed Pipeline Test\n");
    printf("============================================================\n");
    printf("  %-4s %-5s %-5s %8s %8s %6s %6s %9s  %s\n",
           "Ch", "Pin", "Lane", "Mean", "StdDev", "Min", "Max", "Samples", "Result");
    printf("  ---- ----- ----- -------- -------- ------ ------ ---------  ------\n");

    int all_pass = 1;
    for (int c = 0; c < 8; c++) {
        stats_t *s = &ch[c];
        double mean = 0, sd = 0;
        if (s->count > 0) {
            mean = s->sum / s->count;
            double var = (s->sum_sq / s->count) - (mean * mean);
            sd = sqrt(var > 0 ? var : 0);
        }
        int pass = (s->count > 0 && mean > 1900 && mean < 2200 && sd < 100);
        if (!pass) all_pass = 0;
        printf("  D%-3d %-5s %-5d %8.1f %8.1f %6u %6u %9zu  %s\n",
               c + 1, pin_name[c], c / 2, mean, sd, s->vmin, s->vmax,
               s->count, pass ? "PASS" : "FAIL");
    }

    printf("  ------------------------------------------------------------\n");
    size_t tot_crc = 0;
    for (int l = 0; l < 4; l++) {
        printf("  Lane %d: frames=%zu crc=%zu seq=%zu lane_id=%zu\n",
               l, lanes[l].frames, lanes[l].crc_err, lanes[l].seq_gap,
               lanes[l].lane_id_err);
        tot_crc += lanes[l].crc_err + lanes[l].lane_id_err;
        if (lanes[l].frames == 0) all_pass = 0;
    }
    if (tot_crc > 0) all_pass = 0;
    printf("  hunt drops (non-sync words while hunting): %zu\n", hunt_drops);

    printf("============================================================\n");
    printf("  OVERALL: %s\n", all_pass ? "PASS" : "FAIL");
    printf("============================================================\n");

    FT_ClearStreamPipe(h, FALSE, FALSE, 0x82);
    FT_Close(h);
    return all_pass ? 0 : 1;
}
