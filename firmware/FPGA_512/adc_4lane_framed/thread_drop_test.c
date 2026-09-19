/* thread_drop_test.c — minimal multi-threaded reproducer for drop investigation
 *
 * Reader thread: FT_ReadPipe → ring_push (identical to adc_daemon)
 * Worker thread: configurable busy work (spin, sleep, or decode)
 *
 * Usage: ./thread_drop_test [MB] [mode]
 *   mode: 0 = reader only (single-threaded baseline)
 *         1 = reader + spinning worker (pure CPU contention)
 *         2 = reader + sleeping worker (thread exists but idle)
 *         3 = reader + decoding worker (mimics daemon decoder load)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdatomic.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>
#include "ftd3xx.h"

#define CHUNK_SIZE   (64 * 1024)
#define FLUSH_BYTES  (512 * 1024)
#define RING_BYTES   ((size_t)64 * 1024 * 1024)

static FT_HANDLE ft = NULL;
static volatile int running = 1;
static uint8_t *ring;
static _Atomic size_t ring_head = 0, ring_tail = 0;
static size_t total_bytes = 0;

/* Gap instrumentation (same as adc_daemon) */
static size_t gap_cnt[4] = {0};   /* >1.5, >3, >6, >12 ms */
static double gap_max_ms = 0;

static void ring_push(const uint8_t *buf, size_t n) {
    size_t h = atomic_load_explicit(&ring_head, memory_order_relaxed);
    size_t t = atomic_load_explicit(&ring_tail, memory_order_acquire);
    if (RING_BYTES - (h - t) < n) return;
    size_t off = h % RING_BYTES;
    size_t first = RING_BYTES - off;
    if (first > n) first = n;
    memcpy(ring + off, buf, first);
    if (n > first) memcpy(ring, buf + first, n - first);
    atomic_store_explicit(&ring_head, h + n, memory_order_release);
    total_bytes += n;
}

/* Drop counting: scan for SYNC words and check LANE_ID drop nibble */
static size_t drop_total[4] = {0};
static size_t frame_total[4] = {0};

static void scan_drops(const uint8_t *buf, size_t n) {
    const uint16_t *w = (const uint16_t *)buf;
    size_t nw = n / 2;
    uint16_t syncs[4] = {0xFA35, 0xFB46, 0xFC57, 0xFD68};
    for (size_t i = 0; i + 131 < nw; ) {
        int lane = -1;
        for (int l = 0; l < 4; l++)
            if (w[i] == syncs[l]) { lane = l; break; }
        if (lane < 0) { i++; continue; }
        frame_total[lane]++;
        uint16_t lid = w[i + 1];
        int drop_n = (lid >> 12) == 0xE ? ((lid >> 8) & 0xF) : 0;
        if (drop_n) drop_total[lane] += drop_n;
        i += 132;
    }
}

static void *worker_spin(void *arg) {
    (void)arg;
    while (running) { /* burn CPU */ }
    return NULL;
}

static void *worker_sleep(void *arg) {
    (void)arg;
    while (running) usleep(10000);
    return NULL;
}

static void *worker_decode(void *arg) {
    (void)arg;
    /* Simulate decoder: drain ring, scan for drops */
    while (running) {
        size_t h = atomic_load_explicit(&ring_head, memory_order_acquire);
        size_t t = atomic_load_explicit(&ring_tail, memory_order_relaxed);
        if (h == t) { usleep(100); continue; }
        size_t avail = h - t;
        if (avail > CHUNK_SIZE) avail = CHUNK_SIZE;
        size_t off = t % RING_BYTES;
        size_t first = RING_BYTES - off;
        if (first > avail) first = avail;
        /* Just scan the linear portion for simplicity */
        scan_drops(ring + off, first & ~1u);
        atomic_store_explicit(&ring_tail, t + avail, memory_order_release);
    }
    return NULL;
}

int main(int argc, char *argv[]) {
    int mb = 990;
    int mode = 1;
    if (argc > 1) mb = atoi(argv[1]);
    if (argc > 2) mode = atoi(argv[2]);

    setbuf(stdout, NULL);
    const char *mode_name[] = {
        "single-threaded (no worker)",
        "reader + spinning worker",
        "reader + sleeping worker",
        "reader + decoding worker"
    };
    printf("Drop test: %d MB, mode %d (%s)\n", mb, mode,
           mode < 4 ? mode_name[mode] : "?");

    ring = malloc(RING_BYTES);
    if (!ring) { perror("malloc"); return 1; }

    DWORD devcnt = 0;
    FT_CreateDeviceInfoList(&devcnt);
    if (devcnt == 0) { printf("No devices\n"); return 1; }
    if (FT_Create(0, FT_OPEN_BY_INDEX, &ft) != FT_OK) {
        printf("FT_Create failed\n"); return 1;
    }
    FT_SetPipeTimeout(ft, 0x82, 3000);
    if (FT_SetStreamPipe(ft, FALSE, FALSE, 0x82, CHUNK_SIZE) != FT_OK) {
        printf("SetStreamPipe failed\n"); FT_Close(ft); return 1;
    }

    /* Flush */
    static uint8_t buf[CHUNK_SIZE];
    ULONG xfer;
    size_t flushed = 0;
    int empties = 0;
    while (flushed < FLUSH_BYTES && empties < 4) {
        xfer = 0;
        FT_ReadPipe(ft, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) empties++;
        else { empties = 0; flushed += xfer; }
    }

    /* Start worker thread */
    pthread_t th_worker;
    if (mode == 1) pthread_create(&th_worker, NULL, worker_spin, NULL);
    else if (mode == 2) pthread_create(&th_worker, NULL, worker_sleep, NULL);
    else if (mode == 3) pthread_create(&th_worker, NULL, worker_decode, NULL);

    /* Reader loop (runs on main thread, same as if it were a pthread) */
    size_t target = (size_t)mb * 1024 * 1024;
    struct timespec t0, ts_prev, ts0, ts1;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    ts_prev = t0;

#ifdef __APPLE__
    pthread_set_qos_class_self_np(QOS_CLASS_USER_INTERACTIVE, 0);
#endif

    while (total_bytes < target) {
        clock_gettime(CLOCK_MONOTONIC, &ts0);
        xfer = 0;
        FT_ReadPipe(ft, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        clock_gettime(CLOCK_MONOTONIC, &ts1);

        double gap_ms = (ts1.tv_sec - ts_prev.tv_sec) * 1e3 +
                        (ts1.tv_nsec - ts_prev.tv_nsec) * 1e-6;
        ts_prev = ts1;
        if (gap_ms > gap_max_ms) gap_max_ms = gap_ms;
        if (gap_ms > 1.5) gap_cnt[0]++;
        if (gap_ms > 3.0) gap_cnt[1]++;
        if (gap_ms > 6.0) gap_cnt[2]++;
        if (gap_ms > 12.0) gap_cnt[3]++;

        if (xfer) {
            scan_drops(buf, xfer);
            if (mode >= 1) ring_push(buf, xfer);
        }
    }

    running = 0;
    struct timespec t1;
    clock_gettime(CLOCK_MONOTONIC, &t1);
    double elapsed = (t1.tv_sec - t0.tv_sec) + (t1.tv_nsec - t0.tv_nsec) / 1e9;

    if (mode >= 1) pthread_join(th_worker, NULL);

    FT_ClearStreamPipe(ft, FALSE, FALSE, 0x82);
    FT_Close(ft);

    printf("\nResults: %.1f MB in %.2f s (%.1f MB/s)\n",
           total_bytes / (1024.0*1024.0), elapsed,
           total_bytes / (1024.0*1024.0) / elapsed);
    printf("Gaps >1.5/3/6/12 ms: %zu/%zu/%zu/%zu  max %.1f ms\n",
           gap_cnt[0], gap_cnt[1], gap_cnt[2], gap_cnt[3], gap_max_ms);
    printf("Lane  Frames       Drops\n");
    size_t total_drops = 0;
    for (int l = 0; l < 4; l++) {
        printf("  %d   %9zu   %5zu\n", l, frame_total[l], drop_total[l]);
        total_drops += drop_total[l];
    }
    printf("Total drops: %zu\n", total_drops);
    return 0;
}
