/* pair_dump.c — select a pair, dump raw USB stream to file (no decode)
 * Usage: pair_dump <pair 0-3> <MB> <outfile> [flushKB]
 */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "ftd3xx.h"

#define CHUNK_SIZE (64 * 1024)

int main(int argc, char *argv[]) {
    if (argc < 4) {
        printf("usage: %s <pair 0-3> <MB> <outfile> [flushKB]\n", argv[0]);
        return 1;
    }
    int pair = atoi(argv[1]);
    size_t total = (size_t)atoi(argv[2]) * 1024 * 1024;
    const char *path = argv[3];
    size_t flush_bytes = (argc > 4) ? (size_t)atoi(argv[4]) * 1024 : 0;

    FT_HANDLE h = NULL;
    DWORD cnt = 0;
    FT_CreateDeviceInfoList(&cnt);
    if (cnt == 0) { printf("No devices\n"); return 1; }
    if (FT_Create(0, FT_OPEN_BY_INDEX, &h) != FT_OK) { printf("FT_Create failed\n"); return 1; }
    FT_SetPipeTimeout(h, 0x82, 3000);
    if (FT_SetStreamPipe(h, FALSE, FALSE, 0x82, CHUNK_SIZE) != FT_OK) {
        printf("SetStreamPipe failed\n"); FT_Close(h); return 1;
    }

    static UCHAR buf[CHUNK_SIZE];
    ULONG xfer;

    /* Optional pre-command flush */
    size_t flushed = 0;
    while (flushed < flush_bytes) {
        xfer = 0;
        FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 500);
        if (xfer == 0) break;
        flushed += xfer;
    }

    /* Send pair command */
    UCHAR cmd[2] = { (UCHAR)(pair & 3), 0 };
    ULONG wr = 0;
    if (FT_WritePipe(h, 0x02, cmd, 2, &wr, NULL) != FT_OK) {
        printf("command write failed\n"); FT_Close(h); return 1;
    }

    FILE *f = fopen(path, "wb");
    if (!f) { perror("fopen"); FT_Close(h); return 1; }

    size_t got = 0;
    while (got < total) {
        xfer = 0;
        FT_STATUS st = FT_ReadPipe(h, 0x82, buf, CHUNK_SIZE, &xfer, 3000);
        if (st != FT_OK) break;
        if (xfer == 0) { usleep(10000); continue; }
        fwrite(buf, 1, xfer, f);
        got += xfer;
    }
    fclose(f);
    printf("wrote %zu bytes of pair %d to %s (pre-flush %zu)\n", got, pair, path, flushed);

    FT_ClearStreamPipe(h, FALSE, FALSE, 0x82);
    FT_Close(h);
    return 0;
}
