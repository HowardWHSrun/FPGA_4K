/* adc_ctl.c — one-shot CLI for the running adc_daemon
 *
 * Sends argv as a single line to /tmp/adc_daemon.sock and prints the
 * reply (a reply ends with a line "ok" or "err ..."). Async "!" event
 * lines that arrive in between are printed too.
 *
 *   ./adc_ctl cmd fe-off
 *   ./adc_ctl record start /tmp/rec.wav 320-323,400
 *   ./adc_ctl stats
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

#define SOCK_PATH "/tmp/adc_daemon.sock"

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: adc_ctl <verb> [args...]   (e.g. adc_ctl stats)\n");
        return 1;
    }

    char line[1024] = "";
    for (int i = 1; i < argc; i++) {
        if (i > 1) strlcat(line, " ", sizeof line);
        strlcat(line, argv[i], sizeof line);
    }
    strlcat(line, "\n", sizeof line);

    int fd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (fd < 0) { perror("socket"); return 1; }
    struct sockaddr_un sa = { .sun_family = AF_UNIX };
    strlcpy(sa.sun_path, SOCK_PATH, sizeof sa.sun_path);
    if (connect(fd, (struct sockaddr *)&sa, sizeof sa) < 0) {
        fprintf(stderr, "connect %s: %s (daemon running?)\n",
                SOCK_PATH, strerror(errno));
        return 1;
    }
    if (write(fd, line, strlen(line)) < 0) { perror("write"); return 1; }

    /* read until the terminating "ok" / "err ..." line */
    FILE *f = fdopen(fd, "r");
    char buf[4096];
    int rc = 1;
    while (fgets(buf, sizeof buf, f)) {
        fputs(buf, stdout);
        size_t n = strlen(buf);
        if (n && buf[n - 1] == '\n') buf[n - 1] = 0;
        if (strncmp(buf, "ok", 2) == 0 && (buf[2] == 0 || buf[2] == ' ')) {
            rc = 0; break;
        }
        if (strncmp(buf, "err", 3) == 0 && (buf[3] == 0 || buf[3] == ' ')) {
            rc = 1; break;
        }
    }
    fclose(f);
    return rc;
}
