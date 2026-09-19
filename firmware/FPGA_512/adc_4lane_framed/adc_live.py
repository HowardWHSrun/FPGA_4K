#!/usr/bin/env python3
"""adc_live.py — live UI for adc_daemon: scrolling plot + command terminal.

Connects two Unix sockets to /tmp/adc_daemon.sock:
  - text: terminal commands pass through (cmd fe-off, record start ..., stats)
    and async "!" events (drops/CRC) print as they arrive
  - plot: binary stream (magic "ADCP"); 4x2 panels, one per data line D1-D8,
    default amps 0/31/63 per line, ~1 s scrolling window

Local (non-daemon) terminal commands:
  chan D5:0,31,63    change the plotted amps for one line (restarts stream)
  chan all:0,31,63   same amps on every line
  ylim 2.5           fix y range to +/- mV (disables autoscale)
  ylim auto          re-enable y autoscale (default)
  win 5              set scroll window length in seconds
  single [sec]       freeze panels on a full-rate slice; no argument =
                     10 periods of the dominant frequency
  run                resume scrolling after single
  help               list verbs

Calibration: volts = PCM * 3/4096/100/16 (input-referred, zero at midscale).
"""
import socket
import struct
import sys
import threading

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

SOCK_PATH = "/tmp/adc_daemon.sock"
N_LINES = 8
SAMPLE_RATE = 15625.0
DECIM = 8
WIN_SEC = 1.0
VOLT_PER_PCM = 3.0 / 4096.0 / 100.0 / 16.0
PLOT_MAGIC = 0x41444350  # "ADCP"

rate = SAMPLE_RATE / DECIM
win = int(WIN_SEC * rate)     # scroll window in bins; "win <sec>" changes it

# amps plotted per line (index 0..7 = D1..D8)
amps = [[0, 31, 63] for _ in range(N_LINES)]
state_lock = threading.Lock()
running = True

# UI state shared between terminal thread and animate (main thread)
ui = {"auto_y": True, "frozen": False, "slice": None}


def chan_list():
    """Flat daemon channel list; columns arrive in this order."""
    return [line * 64 + a for line in range(N_LINES) for a in amps[line]]


def open_plot_socket(chans, decim, minmax=False):
    """Connect a plot-mode socket for the given channel list."""
    s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    s.connect(SOCK_PATH)
    s.sendall(("plot %s %d%s\n" % (",".join(str(c) for c in chans),
                                   decim,
                                   " minmax" if minmax else "")).encode())
    # skip any stray "!" event lines; stop at the ok/err reply
    while True:
        line = b""
        while not line.endswith(b"\n"):
            b1 = s.recv(1)
            if not b1:
                raise ConnectionError("daemon closed plot socket")
            line += b1
        t = line.decode(errors="replace").strip()
        if t.startswith("ok"):
            return s
        if t.startswith("err"):
            raise ConnectionError("daemon: " + t)


def recv_exact(s, n):
    d = b""
    while len(d) < n:
        chunk = s.recv(n - len(d))
        if not chunk:
            raise ConnectionError("plot stream closed")
        d += chunk
    return d


class PlotStream:
    """Owns the plot socket + data buffer; reconnects on channel change.

    Uses the daemon's minmax (peak-detect) mode: each screen bin carries
    the min and max of all full-rate samples in it, so signals above the
    decimated Nyquist show their true envelope instead of aliasing.
    buf rows are [min0, max0, min1, max1, ...], length 2*win.
    """

    def __init__(self):
        self.sock = None
        self.generation = 0
        self.buf = np.zeros((len(chan_list()), 2 * win), dtype=np.float32)

    def restart(self):
        with state_lock:
            self.generation += 1
            self.buf = np.zeros((len(chan_list()), 2 * win), dtype=np.float32)
            if self.sock:
                try:
                    self.sock.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass

    def reader(self):
        while running:
            with state_lock:
                gen = self.generation
                nch = len(chan_list())
                chans = chan_list()
            try:
                s = open_plot_socket(chans, DECIM, minmax=True)
                with state_lock:
                    if gen != self.generation:
                        s.close()
                        continue
                    self.sock = s
                while running:
                    hdr = recv_exact(s, 12)
                    magic, _seq, hn, hs = struct.unpack("<IIHH", hdr)
                    if magic != PLOT_MAGIC:
                        raise ConnectionError("bad magic 0x%08x" % magic)
                    raw = recv_exact(s, hn * hs * 2)
                    d = np.frombuffer(raw, dtype="<i2").reshape(hs, hn)
                    # (hs, 2*nch) -> (nch, 2*hs): per-channel min/max pairs
                    v = (d.reshape(hs, hn // 2, 2).transpose(1, 0, 2)
                          .reshape(hn // 2, 2 * hs)
                          .astype(np.float32) * VOLT_PER_PCM)
                    with state_lock:
                        if gen != self.generation or hn != 2 * nch:
                            break
                        n = min(2 * hs, 2 * win)
                        self.buf = np.roll(self.buf, -n, axis=1)
                        self.buf[:, -n:] = v[:, -n:]
            except (OSError, ConnectionError) as e:
                if running:
                    with state_lock:
                        cur = self.generation
                    if gen == cur:  # real error, not our own restart
                        print("[plot] %s; reconnecting" % e)
                        import time
                        time.sleep(1.0)
            finally:
                with state_lock:
                    self.sock = None


def text_reader(sock):
    """Print daemon replies and async events."""
    f = sock.makefile("r")
    for line in f:
        print(line.rstrip())
    if running:
        print("[text socket closed by daemon]")


def parse_chan_cmd(arg):
    """'D5:0,31,63' -> (4, [0,31,63]) or None."""
    try:
        name, alist = arg.split(":")
        line = int(name.strip().lstrip("Dd")) - 1
        sel = [int(a) for a in alist.split(",")]
        if not 0 <= line < N_LINES or not sel:
            return None
        if any(not 0 <= a < 64 for a in sel):
            return None
        return line, sel
    except ValueError:
        return None


def do_single(sec, redraw_flag):
    """Grab a full-rate (decim=1) slice and hand it to animate to display.

    sec given  -> capture exactly that window.
    sec None   -> capture 1 s, find the dominant frequency of the strongest
                  plotted channel, show 10 periods of it.
    """
    dur = sec if sec is not None else 1.0
    need = int(dur * SAMPLE_RATE)
    with state_lock:
        chans = chan_list()
    try:
        s = open_plot_socket(chans, 1)
        parts = []
        got = 0
        while got < need:
            hdr = recv_exact(s, 12)
            magic, _seq, hn, hs = struct.unpack("<IIHH", hdr)
            if magic != PLOT_MAGIC:
                raise ConnectionError("bad magic 0x%08x" % magic)
            raw = recv_exact(s, hn * hs * 2)
            if hn != len(chans):
                raise ConnectionError("channel count changed")
            parts.append(np.frombuffer(raw, dtype="<i2").reshape(hs, hn))
            got += hs
        s.close()
    except (OSError, ConnectionError) as e:
        print("[single] %s" % e)
        return

    v = np.concatenate(parts)[:need].T.astype(np.float32) * VOLT_PER_PCM

    f0 = None
    if sec is None:
        ac = v - v.mean(axis=1, keepdims=True)
        strongest = ac[int(np.argmax(ac.std(axis=1)))]
        spec = np.abs(np.fft.rfft(strongest * np.hanning(len(strongest))))
        freqs = np.fft.rfftfreq(len(strongest), 1.0 / SAMPLE_RATE)
        spec[freqs < 2.0] = 0          # ignore DC / drift
        f0 = float(freqs[int(np.argmax(spec))])
        if f0 > 0:
            ns = min(int(round(10.0 / f0 * SAMPLE_RATE)), v.shape[1])
            v = v[:, -max(ns, 8):]
        print("[single] dominant %.1f Hz, showing %.4f s"
              % (f0, v.shape[1] / SAMPLE_RATE))
    else:
        print("[single] showing %.4f s" % (v.shape[1] / SAMPLE_RATE))

    tt = np.arange(v.shape[1]) / SAMPLE_RATE
    redraw_flag.append(("single", tt, v))


def terminal(txt_sock, stream, redraw_flag):
    global running, win
    for raw in sys.stdin:
        line = raw.strip()
        if not line:
            continue
        if line in ("exit", "q"):
            break
        if line == "help":
            print("daemon: cmd <chip-reset|fe-pulse|fe-on|fe-off|"
                  "pattern-on|pattern-off|spi>")
            print("        cmd spi-load <csv>     load arbitrary SPI bit "
                  "pattern from CSV (BIT,L,R)")
            print("        cmd stim <1-255>       run N stimulation pulses")
            print("        record start <path> <all|0-63,320>, record stop, "
                  "stats, quit")
            print("local:  chan D5:0,31,63 | chan all:0,31,63   "
                  "ylim <mV>|auto   win <sec>   single [sec]   run   exit")
            continue
        if line.startswith("chan "):
            arg = line[5:].strip()
            if arg.lower().startswith("all:"):
                p = parse_chan_cmd("D1:" + arg[4:])
                if p is None:
                    print("usage: chan all:<amp,amp,...>  (amps 0-63)")
                    continue
                _, sel = p
                with state_lock:
                    for ln in range(N_LINES):
                        amps[ln] = list(sel)
                stream.restart()
                redraw_flag.append("layout")
                print("all lines now plotting amps %s" % sel)
                continue
            p = parse_chan_cmd(arg)
            if p is None:
                print("usage: chan D<1-8>:<amp,amp,...>  (amps 0-63)")
                continue
            ln, sel = p
            with state_lock:
                amps[ln] = sel
            stream.restart()
            redraw_flag.append("layout")
            print("D%d now plotting amps %s" % (ln + 1, sel))
            continue
        if line == "ylim" or line.startswith("ylim "):
            arg = line[4:].strip()
            if arg == "auto":
                redraw_flag.append(("ylim", "auto"))
                print("y autoscale on")
                continue
            try:
                mv = float(arg)
                redraw_flag.append(("ylim", mv))
            except ValueError:
                print("usage: ylim <millivolts>|auto")
            continue
        if line == "win" or line.startswith("win "):
            arg = line[3:].strip()
            try:
                sec = float(arg)
            except ValueError:
                print("usage: win <seconds>  (0.05-60)")
                continue
            if not 0.05 <= sec <= 60.0:
                print("win: seconds must be 0.05-60")
                continue
            with state_lock:
                win = max(int(sec * rate), 8)
            stream.restart()
            redraw_flag.append("layout")
            print("scroll window now %.2f s" % (win / rate))
            continue
        if line == "single" or line.startswith("single "):
            arg = line[6:].strip()
            sec = None
            if arg:
                try:
                    sec = float(arg)
                    if not 0.0005 <= sec <= 10.0:
                        print("single: seconds must be 0.0005-10")
                        continue
                except ValueError:
                    print("usage: single [seconds]")
                    continue
            print("[single] capturing...")
            threading.Thread(target=do_single, args=(sec, redraw_flag),
                             daemon=True).start()
            continue
        if line == "run":
            redraw_flag.append("resume")
            continue
        try:
            txt_sock.sendall((line + "\n").encode())
        except OSError as e:
            print("[text] send failed: %s" % e)
    running = False
    try:
        txt_sock.shutdown(socket.SHUT_RDWR)
    except OSError:
        pass
    plt.close("all")


def main():
    global running
    txt = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        txt.connect(SOCK_PATH)
    except OSError as e:
        sys.exit("cannot connect %s: %s (is adc_daemon running?)" %
                 (SOCK_PATH, e))

    stream = PlotStream()
    redraw_flag = []  # appended by terminal thread, drained by animate

    threading.Thread(target=stream.reader, daemon=True).start()
    threading.Thread(target=text_reader, args=(txt,), daemon=True).start()
    threading.Thread(target=terminal, args=(txt, stream, redraw_flag),
                     daemon=True).start()

    fig, axes = plt.subplots(4, 2, figsize=(12, 10), sharex=True, sharey=True)
    artists = []
    xax = {}    # current scroll time axes; rebuilt on layout/window change

    def build_lines():
        artists.clear()
        t = np.arange(-win, 0) / rate
        xax["t"] = t
        xax["t2"] = np.repeat(t, 2)   # each bin has a min+max point
        col = 0
        for line in range(N_LINES):
            ax = axes[line % 4][line // 4]
            for l2d in list(ax.lines):
                l2d.remove()
            ax.set_title("D%d (chans %d-%d)" %
                         (line + 1, line * 64, line * 64 + 63), fontsize=9)
            ax.grid(alpha=0.3)
            for a in amps[line]:
                (l2d,) = ax.plot(xax["t2"], np.zeros(2 * win), lw=0.8,
                                 label="amp %d" % a)
                artists.append((l2d, col))
                col += 1
            ax.legend(fontsize=7, loc="upper right")
        axes[0][0].set_xlim(t[0], 0)

    build_lines()
    for ax in axes[3]:
        ax.set_xlabel("s")
    for row in axes:
        row[0].set_ylabel("V (input-referred)")
    axes[0][0].set_ylim(-0.0155, 0.0155)   # full scale is +/-15.36 mV
    fig.suptitle("adc_daemon live — type commands in the terminal "
                 "(help for list)")
    fig.tight_layout()

    def animate(_frame):
        while redraw_flag:
            ev = redraw_flag.pop(0)
            if ev == "layout":
                ui["frozen"] = False
                ui["slice"] = None
                build_lines()
            elif ev == "resume":
                ui["frozen"] = False
                ui["slice"] = None
                for l2d, _col in artists:
                    l2d.set_data(xax["t2"], np.zeros(2 * win))
                axes[0][0].set_xlim(xax["t"][0], 0)
            elif isinstance(ev, tuple) and ev[0] == "single":
                _, tt, sl = ev
                ui["frozen"] = True
                ui["slice"] = sl
                for l2d, col in artists:
                    if col < sl.shape[0]:
                        l2d.set_data(tt, sl[col])
                axes[0][0].set_xlim(0, tt[-1])
            elif isinstance(ev, tuple) and ev[0] == "ylim":
                if ev[1] == "auto":
                    ui["auto_y"] = True
                else:
                    ui["auto_y"] = False
                    axes[0][0].set_ylim(-ev[1] / 1e3, ev[1] / 1e3)
            fig.canvas.draw_idle()

        if ui["frozen"]:
            src = ui["slice"]
        else:
            with state_lock:
                buf = stream.buf
            src = buf
            for l2d, col in artists:
                if col < buf.shape[0]:
                    l2d.set_ydata(buf[col])

        if ui["auto_y"] and src is not None and src.size:
            m = max(float(np.max(np.abs(src))) * 1.15, 1e-4)
            hi = axes[0][0].get_ylim()[1]
            # hysteresis: rescale only on clip or large shrink
            if m > hi * 1.02 or m < hi * 0.5:
                axes[0][0].set_ylim(-m, m)
                fig.canvas.draw_idle()
        return [a for a, _ in artists]

    ani = FuncAnimation(fig, animate, interval=66, blit=True,
                        cache_frame_data=False)
    print("ready — type 'help' for commands")
    try:
        plt.show()
    except KeyboardInterrupt:
        pass
    running = False


if __name__ == "__main__":
    main()
