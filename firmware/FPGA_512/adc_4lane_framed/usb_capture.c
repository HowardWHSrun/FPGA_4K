/* usb_capture.c — dump raw USB stream from pipe 0x82 to a binary file
 *
 * The output file contains the exact byte stream from the FT600: sequential
 * little-endian 16-bit words with the 4-bit tag nibble framing used by
 * usb_framer. Self-synchronizing via SYNC words (0xFA35/0xFB46/0xFC57/0xFD68).
 *
 * Frame format (132 consecutive 16-bit words per lane, 4 lanes interleaved
 * frame-granularly by the round-robin arbiter):
 *
 *   Word  0      {0xF, SYNC}       sync marker
 *   Word  1      {0xE, LANE_ID}    {drop_cnt[3:0], lane[1:0], ~complement}
 *   Word  2      {0xD, CYCLE_CNT}  rolling 12-bit frame counter
 *   Words 3-130  {0x0, DATA}       128 x 12-bit ADC samples (even/odd interleaved)
 *   Word  131    {0xC, CRC-12}     ITU-T 0x80F over SYNC+LID+CNT+DATA
 *
 * Usage: ./usb_capture [MB] [output.bin]   (default 165 MB -> capture.bin)
 *        165 MB ≈ 10 seconds at 16.5 MB/s
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <time.h>
#include "ftd3xx.h"

#define CHUNK_SIZE   (512 * 1024)
#define FLUSH_BYTES  (512 * 1024)
#define DEFAULT_MB   165

int main(int argc, char *argv[]) {
    int mb = DEFAULT_MB;
    const char *outname = "capture.bin";
    if (argc > 1) mb = atoi(argv[1]);
    if (mb < 1) mb = 1;
    if (argc > 2) outname = argv[2];

    size_t target = (size_t)mb * 1024 * 1024;
    printf("Raw USB capture: %d MB -> %s\n", mb, outname);

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

    static unsigned char buf[CHUNK_SIZE];
    ULONG xfer;

    /* Flush startup transient (stale frames + drop reports from idle period).
     * Pipe may be empty right after SetStreamPipe, so tolerate xfer==0. */
    size_t flushed = 0;
    int empties = 0;
    while (flushed < FLUSH_BYTES && empties < 4) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) empties++;
        else { empties = 0; flushed += xfer; }
    }
    printf("Flushed %zu bytes, capturing...\n", flushed);

    FILE *fp = fopen(outname, "wb");
    if (!fp) { perror(outname); FT_Close(h); return 1; }

    struct timespec t0;
    clock_gettime(CLOCK_MONOTONIC, &t0);

    size_t captured = 0;
    while (captured < target) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        if (st != FT_OK && xfer == 0) {
            printf("FT_ReadPipe error %d\n", st);
            break;
        }
        if (xfer > 0) {
            fwrite(buf, 1, xfer, fp);
            captured += xfer;
        }
    }

    struct timespec t1;
    clock_gettime(CLOCK_MONOTONIC, &t1);
    double elapsed = (t1.tv_sec - t0.tv_sec) + (t1.tv_nsec - t0.tv_nsec) / 1e9;

    fclose(fp);
    FT_Close(h);

    printf("Captured %zu bytes (%.1f MB) in %.2f s (%.1f MB/s)\n",
           captured, captured / (1024.0 * 1024.0), elapsed,
           captured / (1024.0 * 1024.0) / elapsed);
    printf("Duration: ~%.1f seconds of ADC data\n", captured / 16.5e6);
    return 0;
}
