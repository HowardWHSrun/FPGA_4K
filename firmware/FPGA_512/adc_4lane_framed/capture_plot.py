#!/usr/bin/env python3
"""capture_plot.py — capture the 4-lane stream and plot the 512 channels.

Runs ./wave_record (FPGA -> 512-channel WAV at 15625 Hz/channel), then
plots a 60 ms window (3 cycles at 50 Hz) starting 100 ms in: one panel
per data line (D1-D8), three amplifier channels per panel.
Values are input-referred volts: (counts - 2048) * 3 / 4096 / 100.

Usage: capture_plot.py [MB] [wav] [png]
       defaults: 32 MB, /tmp/sine512.wav, /tmp/sine512.png
"""
import subprocess
import sys
import os

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile

mb = sys.argv[1] if len(sys.argv) > 1 else "32"
wav = sys.argv[2] if len(sys.argv) > 2 else "/tmp/sine512.wav"
png = sys.argv[3] if len(sys.argv) > 3 else "/tmp/sine512.png"

here = os.path.dirname(os.path.abspath(__file__))
r = subprocess.run([os.path.join(here, "wave_record"), mb, wav])
if r.returncode != 0:
    sys.exit("wave_record failed")

rate, d = wavfile.read(wav)
# 12-bit counts -> input-referred volts: zero at midscale (2048),
# 3 V full scale / 4096 counts / gain 100
adc = (d.astype(np.int32) >> 4) * (3.0 / 4096.0 / 100.0)

off = int(0.100 * rate)          # start 100 ms in
n = int(0.060 * rate)            # 60 ms = 3 cycles at 50 Hz
t = (np.arange(n) + off) / rate * 1e3

fig, axes = plt.subplots(4, 2, figsize=(12, 10), sharex=True, sharey=True)
for line in range(8):
    ax = axes[line % 4][line // 4]
    for amp in (0, 31, 63):
        ax.plot(t, adc[off:off + n, line * 64 + amp], lw=0.8,
                label="amp %d" % amp)
    ax.set_title("D%d (chans %d-%d)" % (line + 1, line * 64, line * 64 + 63),
                 fontsize=9)
    ax.grid(alpha=0.3)
    if line == 0:
        ax.legend(fontsize=7)
for ax in axes[3]:
    ax.set_xlabel("ms")
for row in axes:
    row[0].set_ylabel("V (input-referred)")
fig.suptitle("512-channel capture, 60 ms window at 100 ms")
fig.tight_layout()
fig.savefig(png, dpi=110)
print("saved %s" % png)
