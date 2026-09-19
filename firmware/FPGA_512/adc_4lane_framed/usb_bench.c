/* usb_bench.c — raw FT600 read throughput benchmark (no decode)
 *
 * Reads the data pipe as fast as possible with a given chunk size and
 * reports sustained MB/s. Distinguishes a USB/driver ceiling from a
 * host-decode CPU ceiling.
 *
 * Usage: usb_bench [MB] [chunk_kb]    (default 64 MB, 64 KB chunks)
 */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/time.h>
#include "ftd3xx.h"

static double now_s(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec + tv.tv_usec * 1e-6;
}

int main(int argc, char *argv[]) {
    int mb = 64;
    int chunk_kb = 64;
    if (argc > 1) mb = atoi(argv[1]);
    if (argc > 2) chunk_kb = atoi(argv[2]);
    if (mb < 1) mb = 1;
    if (chunk_kb < 4) chunk_kb = 4;
    size_t chunk = (size_t)chunk_kb * 1024;

    FT_HANDLE h = NULL;
    DWORD devcnt = 0;
    FT_CreateDeviceInfoList(&devcnt);
    if (devcnt == 0) { printf("No devices\n"); return 1; }
    if (FT_Create(0, FT_OPEN_BY_INDEX, &h) != FT_OK) {
        printf("FT_Create failed\n"); return 1;
    }
    FT_SetPipeTimeout(h, 0x82, 3000);
    if (FT_SetStreamPipe(h, FALSE, FALSE, 0x82, (ULONG)chunk) != FT_OK) {
        printf("SetStreamPipe failed\n"); FT_Close(h); return 1;
    }

    UCHAR *buf = malloc(chunk);
    if (!buf) { printf("malloc failed\n"); return 1; }
    ULONG xfer;

    /* flush + warm up */
    for (int i = 0; i < 8; i++) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, (ULONG)chunk, &xfer, 500);
    }

    size_t total = 0, goal = (size_t)mb * 1024 * 1024;
    size_t short_reads = 0, zero_reads = 0;
    double t0 = now_s();
    while (total < goal) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, (ULONG)chunk, &xfer, 3000);
        if (st != FT_OK) { printf("ReadPipe status %d\n", (int)st); break; }
        if (xfer == 0) { zero_reads++; continue; }
        if (xfer < chunk) short_reads++;
        total += xfer;
    }
    double dur = now_s() - t0;

    printf("chunk %4d KB: %.1f MB in %.3f s = %.2f MB/s  (short reads %zu, zero %zu)\n",
           chunk_kb, total / 1e6, dur, total / 1e6 / dur, short_reads, zero_reads);

    FT_ClearStreamPipe(h, FALSE, FALSE, 0x82);
    FT_Close(h);
    free(buf);
    return 0;
}
