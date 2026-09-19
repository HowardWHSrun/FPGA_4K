/* board_cmd.c — send commands to the 4-lane FPGA board
 *
 * Writes 2-byte commands on pipe 0x02 (byte 0 = opcode, byte 1 = payload):
 *
 * Simple commands (payload = 0):
 *   chip-reset  0x11  pulse CB_CHIP_RESET (~62 ns)
 *   fe-pulse    0x21  pulse CB_FE_RESET   (~62 ns)
 *   fe-on       0x22  hold CB_FE_RESET high (test mode -> ~2048 midscale)
 *   fe-off      0x23  CB_FE_RESET low (normal operation — the boot default)
 *   pattern-on  0x31  replace ADC data with per-channel +1 ramp
 *   pattern-off 0x32  back to real ADC data
 *
 * Multi-step commands:
 *   spi-load <csv>    load L/R SPI data from CSV, then execute (500 kHz)
 *   stim <N>          run N stimulation cycles (STIM_EN + CLK + CHB sequence)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "ftd3xx.h"

static const struct { const char *name; unsigned char op; const char *desc; } cmds[] = {
    { "chip-reset", 0x11, "pulse CB_CHIP_RESET" },
    { "fe-pulse",   0x21, "pulse CB_FE_RESET" },
    { "fe-on",      0x22, "CB_FE_RESET = 1 (test mode, midscale)" },
    { "fe-off",     0x23, "CB_FE_RESET = 0 (normal operation)" },
    { "pattern-on", 0x31, "inject +1 ramp in place of ADC data" },
    { "pattern-off",0x32, "real ADC data (normal)" },
};
#define N_CMDS (sizeof(cmds) / sizeof(cmds[0]))

static void usage(void) {
    printf("Usage: board_cmd <command> [args]\n\n");
    printf("Simple commands:\n");
    for (size_t i = 0; i < N_CMDS; i++)
        printf("  %-11s %s\n", cmds[i].name, cmds[i].desc);
    printf("\nSPI commands:\n");
    printf("  spi              default SPI init (4096 zero-data clocks + latch)\n");
    printf("  spi-load <csv>   load L/R SPI config from CSV and execute\n");
    printf("\nSTIM commands:\n");
    printf("  stim <N>         run N stimulation cycles\n");
}

/* Send a 2-byte command: {opcode, payload} */
static int send_cmd(FT_HANDLE h, unsigned char op, unsigned char payload) {
    UCHAR buf[2] = { op, payload };
    ULONG wr = 0;
    FT_STATUS st = FT_WritePipe(h, 0x02, buf, 2, &wr, NULL);
    return (st == FT_OK && wr == 2) ? 0 : -1;
}

/* ======================================================================
 * SPI CSV loader
 *
 * CSV format: BIT,L,R  (header line, then one row per bit)
 * BIT = bit index (0-based), L = 0|1, R = 0|1
 * Packs bits MSB-first into bytes: BIT 0 → byte 0 bit 7.
 * ====================================================================== */
#define SPI_MAX_BITS 4096
#define SPI_MAX_BYTES (SPI_MAX_BITS / 8)

static int spi_load(FT_HANDLE h, const char *csv_path) {
    FILE *f = fopen(csv_path, "r");
    if (!f) { perror(csv_path); return -1; }

    unsigned char l_data[SPI_MAX_BYTES];
    unsigned char r_data[SPI_MAX_BYTES];
    memset(l_data, 0, sizeof l_data);
    memset(r_data, 0, sizeof r_data);

    char line[256];
    int max_bit = -1;

    /* Skip header */
    if (!fgets(line, sizeof line, f)) { fclose(f); return -1; }

    while (fgets(line, sizeof line, f)) {
        int bit, lv, rv;
        if (sscanf(line, "%d,%d,%d", &bit, &lv, &rv) != 3) continue;
        if (bit < 0 || bit >= SPI_MAX_BITS) continue;
        int byte_idx = bit / 8;
        int bit_pos  = 7 - (bit % 8);   /* MSB-first packing */
        if (lv) l_data[byte_idx] |= (1 << bit_pos);
        if (rv) r_data[byte_idx] |= (1 << bit_pos);
        if (bit > max_bit) max_bit = bit;
    }
    fclose(f);

    if (max_bit < 0) {
        printf("No valid rows in %s\n", csv_path);
        return -1;
    }
    int total_bits = max_bit + 1;
    int n_bytes = (total_bits + 7) / 8;
    printf("Loaded %d bits from %s (%d bytes per channel)\n",
           total_bits, csv_path, n_bytes);

    /* Reset BRAM write pointers */
    if (send_cmd(h, 0x42, 0) < 0) return -1;

    /* Load L channel */
    for (int i = 0; i < n_bytes; i++)
        if (send_cmd(h, 0x43, l_data[i]) < 0) return -1;

    /* Load R channel */
    for (int i = 0; i < n_bytes; i++)
        if (send_cmd(h, 0x44, r_data[i]) < 0) return -1;

    /* Set bit count (low byte first, then high byte latches both) */
    if (send_cmd(h, 0x45, total_bits & 0xFF) < 0) return -1;
    if (send_cmd(h, 0x46, (total_bits >> 8) & 0xFF) < 0) return -1;

    /* Execute SPI sequence */
    if (send_cmd(h, 0x41, 0) < 0) return -1;

    printf("SPI programming started (%d bits @ 500 kHz = %.1f ms)\n",
           total_bits, total_bits * 2.0 / 1000.0);
    return 0;
}

/* ======================================================================
 * Main
 * ====================================================================== */
int main(int argc, char *argv[]) {
    if (argc < 2) { usage(); return 1; }

    /* Check for simple commands first */
    unsigned char op = 0;
    for (size_t i = 0; i < N_CMDS; i++)
        if (strcmp(argv[1], cmds[i].name) == 0) op = cmds[i].op;

    int is_spi      = (strcmp(argv[1], "spi") == 0);
    int is_spi_load = (strcmp(argv[1], "spi-load") == 0);
    int is_stim     = (strcmp(argv[1], "stim") == 0);

    if (op == 0 && !is_spi && !is_spi_load && !is_stim) { usage(); return 1; }
    if (is_spi_load && argc < 3) {
        printf("Usage: board_cmd spi-load <csv_file>\n"); return 1;
    }
    if (is_stim && argc < 3) {
        printf("Usage: board_cmd stim <N>  (N = 1..255)\n"); return 1;
    }

    DWORD devcnt = 0;
    FT_CreateDeviceInfoList(&devcnt);
    if (devcnt == 0) { printf("No devices\n"); return 1; }

    FT_HANDLE h = NULL;
    if (FT_Create(0, FT_OPEN_BY_INDEX, &h) != FT_OK) {
        printf("FT_Create failed\n");
        return 1;
    }

    int rc = 0;
    if (op != 0) {
        /* Simple command */
        rc = send_cmd(h, op, 0);
        if (rc == 0) printf("Sent %s (0x%02X)\n", argv[1], op);
        else         printf("Command write failed\n");
    } else if (is_spi) {
        /* Default SPI: 4096 zero-data clocks + latch (BRAM powers up to 0) */
        rc = send_cmd(h, 0x45, 0x00);           /* bit count [7:0] = 0 */
        if (rc == 0) rc = send_cmd(h, 0x46, 0x10); /* bit count [11:8] = 0x10 → 4096 */
        if (rc == 0) rc = send_cmd(h, 0x41, 0x00); /* execute */
        if (rc == 0) printf("Default SPI init started (4096 clocks @ 500 kHz)\n");
        else         printf("Command write failed\n");
    } else if (is_spi_load) {
        rc = spi_load(h, argv[2]);
    } else if (is_stim) {
        int n = atoi(argv[2]);
        if (n < 1 || n > 255) {
            printf("Stim count must be 1..255\n"); rc = 1;
        } else {
            rc = send_cmd(h, 0x60, (unsigned char)n);
            if (rc == 0) printf("Started stim sequence (%d reps)\n", n);
            else         printf("Command write failed\n");
        }
    }

    FT_Close(h);
    return rc ? 1 : 0;
}
