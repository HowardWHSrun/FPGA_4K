# FPGA_512 — 512-Channel ADC Acquisition Pipeline

A Lattice ECP5 FPGA design plus host software that streams **512 neural-probe
channels at 15,625 Hz** off an ADC board, over USB 3.0 (FT600), into a host
daemon that decodes, records, and plots the data live.

---

# Part 1 — The Live Visualizer

The visualizer is a real-time 8-panel scope with an attached command terminal.
`adc_daemon` (C) owns the USB device and decodes frames; `adc_live.py` (Python)
connects to it over a Unix socket and draws the scrolling plot.

```
FT600 USB ──► adc_daemon ──► /tmp/adc_daemon.sock ──► adc_live.py (plot + terminal)
                    │                              └─► adc_ctl (one-shot CLI)
                    └──► WAV recording
```

## Prerequisites

| Dependency | Purpose | Install |
|------------|---------|---------|
| libftd3xx  | FT600 USB driver | [FTDI D3XX](https://ftdichip.com/drivers/d3xx-drivers/) — put `libftd3xx.dylib` in `/usr/local/lib`, `ftd3xx.h` in `/usr/local/include` |
| gcc/clang  | C compiler | Xcode CLI tools (macOS) / `build-essential` (Linux) |
| Python 3 + numpy + matplotlib | Live UI | `pip3 install numpy matplotlib` |

## Build and launch

```bash
cd adc_4lane_framed
make adc_daemon adc_ctl

./live.sh            # starts the daemon, launches the UI, cleans up on exit
```

`live.sh` kills any stale daemon, starts a fresh one, waits for it to come up,
then runs `adc_live.py`. Closing the plot window shuts the daemon down.

To run the two halves separately (useful when debugging):

```bash
./adc_daemon &                 # live hardware
./adc_daemon --file cap.bin    # or: replay a raw capture in a loop, no hardware
python3 adc_live.py
```

**No hardware?** See [`adc_4lane_framed/FRONTEND_DEV.md`](adc_4lane_framed/FRONTEND_DEV.md)
— the daemon replays a recorded capture at real-time pace and serves the exact
same socket API, so the UI and any other frontend work unchanged.

## What you see

A 4x2 grid of panels, one per data line **D1–D8**. Each line carries 64
amplifiers (electrodes); by default amps **0, 31, 63** are plotted per line, so
8 panels x 3 traces = 24 of the 512 channels at once.

- **X axis** — seconds, scrolling right-to-left, 1 s window by default.
- **Y axis** — volts, input-referred (`volts = pcm * 4.5776e-6`), full scale
  ±15.36 mV. Autoscales with hysteresis unless you pin it with `ylim`.
- Traces use the daemon's **peak-detect (minmax) mode**: each screen pixel shows
  the min *and* max of every full-rate sample behind it, so fast signals show
  their true envelope instead of aliasing into nonsense.

## Terminal commands

Type in the terminal that launched the UI. `help` lists everything.

### Local (change what the plot shows)

| Command | Effect |
|---------|--------|
| `chan D5:0,31,63` | Set which amplifiers (0–63) are plotted for line D5 |
| `chan all:0,16,32,48` | Same amp selection on every line |
| `ylim 2.5` | Pin the y range to ±2.5 mV (disables autoscale) |
| `ylim auto` | Re-enable y autoscale (default) |
| `win 5` | Scroll window length in seconds (0.05–60) |
| `single` | Freeze on a full-rate slice: finds the dominant frequency and shows 10 periods of it |
| `single 0.01` | Freeze on exactly 10 ms of full-rate data |
| `run` | Resume scrolling after `single` |
| `exit` / `q` | Quit UI and daemon |

`single` is the "stop scrolling and actually look at the waveform" command — the
scroll view is decimated 8x, `single` pulls undecimated samples.

### Passed through to the daemon

| Command | Effect |
|---------|--------|
| `cmd chip-reset` | Pulse ADC chip reset |
| `cmd fe-pulse` / `fe-on` / `fe-off` | Front-end reset: pulse / hold high (test mode, outputs midscale) / release to normal |
| `cmd pattern-on` / `pattern-off` | Swap real ADC data for a +1 ramp test pattern, and back |
| `cmd spi` | Run the built-in SPI init sequence |
| `cmd spi-load <csv>` | Load an arbitrary SPI bit pattern from CSV (`BIT,L,R`) |
| `cmd stim <1-255>` | Fire N stimulation pulses |
| `record start <path> <chans>` | Record to WAV; `chans` = `all` or `0-63,320,384-447` |
| `record stop` | Stop and report slices / errors / drops |
| `stats` | Throughput, ring fill, per-lane frame/CRC/seq/drop counters |
| `quit` | Shut the daemon down |

Async events print as they arrive, prefixed with `!`:

```
!drops lane=2 n=5 total=37     FPGA-side FIFO overflow (host fell behind)
!crc lane=0 total=3            CRC-12 mismatch
!seq lane=1 total=2            Missing frame
```

Anything the daemon accepts can also be sent one-shot without the UI:

```bash
./adc_ctl stats
./adc_ctl cmd fe-off
./adc_ctl record start /tmp/rec.wav 320-383
```

## Channel numbering

```
channel = line * 64 + amplifier          line = D1..D8 minus 1, amp = 0..63

D1 →   0- 63   D2 →  64-127   D3 → 128-191   D4 → 192-255
D5 → 256-319   D6 → 320-383   D7 → 384-447   D8 → 448-511
```

One *slice* = one sample from all 512 channels = one full amplifier sweep,
delivered 15,625 times per second.

## Writing your own frontend

The daemon is UI-agnostic. Send `plot <chans> <decim> [minmax]` on the socket
and the connection switches to a binary stream of `"ADCP"`-tagged packets.
Full protocol, packet layout, and a Python parsing example are in
[`adc_4lane_framed/FRONTEND_DEV.md`](adc_4lane_framed/FRONTEND_DEV.md).

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| `cannot connect /tmp/adc_daemon.sock` | Daemon isn't running — start `./adc_daemon` or use `live.sh` |
| `FT_Create failed (device busy?)` | Another tool holds the FT600. Only one process at a time |
| Flat lines at 0 V | Front end held in reset — send `cmd fe-off` |
| Staircase-looking waveforms | Host isn't keeping up; check `stats` for nonzero `drops` |
| `!seq` events once per loop in replay mode | Normal — the capture file wrapped |

---

# Part 2 — The Repository

## Signal path

```
ADC board ──8 serial lines + 32 MHz clock──► ECP5 FPGA ──USB 3.0──► host
                                                  │
   deserialize → 4 framed lanes → arbiter → USB framer → async FIFO → FT600
                                                  └──► UWB serial mirror (J6)
```

The FPGA deserializes 8 bit-interleaved ADC streams, packs them into four
132-word framed lanes (SYNC / LANE_ID / CYCLE_CNT / 128 data words / CRC-12),
round-robins the lanes into one USB stream, and buffers through a 64 KB BRAM
elastic FIFO into the FT600. Sustained rate is **16.5 MB/s**.

## Layout

| Path | Contents |
|------|----------|
| `fpga/` | Verilog modules: `adc_auto_adjust`, `pair_tdm_framer`, `lane_frame_arbiter`, `usb_framer`, `async_fifo`, `ft600_writer`, `spi_programmer`, `stim_controller`, `serial_framer`, top levels, `.lpf` constraint files |
| `decoder/` | `UWB_Serial_Handler.v` — downstream serial output handler |
| `adc_4lane_framed/` | **Main design.** Top level `top_4lane_framed.v` + all host tools (daemon, live UI, recorders, benchmarks) |
| `adc_2ch_framed/` | Earlier 2-channel framed design, kept as a reference point |
| `adc_channel_test/`, `adc_auto_adjust_test/`, `pll_test/`, `led_blink/`, `ft600_test/`, `spi/`, `bringup/` | Bring-up and unit-test designs, each with its own Makefile |
| `FPGA_UWB/`, `FPGA_UWB_STATIC/` | Standalone UWB-header designs: 16→64 MHz ECP5 PLL driving a 4-bit output, either free-running (`FPGA_UWB`) or fixed at build time (`FPGA_UWB_STATIC`, `make VALUE=9`) |
| `UWB_SPI/` | Host-side bit-banged SPI to the UWB chip over an MCC DAQ device, plus the vendored `mcculw` examples it depends on |
| `sim/`, `sim_tb*` | Icarus testbenches, ADC models, waveform-comparison scripts |
| `docs/` | `SYSTEM_OVERVIEW.md` (full data path, stage by stage), `FRAMING_SPEC.txt` (wire format), board pinouts |
| `golden_bitstreams/` | Hardware-verified `.bit` files, archived deliberately (rest of the build output is gitignored) |
| `analysis/`, `scripts/`, `receiver/` | Capture analysis, HDF5 → pattern-generator conversion, Python receiver |

## Host tools (`adc_4lane_framed/`)

| Tool | Purpose |
|------|---------|
| `adc_daemon` | Continuous receiver. USB reader thread → 256 MB ring → decoder thread → WAV recording + publish ring + socket server |
| `adc_ctl` | One-shot CLI for a running daemon |
| `adc_live.py` | Live scope UI (Part 1) |
| `live.sh` | Launcher for daemon + UI |
| `wave_record` | Standalone WAV recorder with frame validation and read-gap histogram |
| `usb_capture` | Dumps the raw USB byte stream to a file (feeds `--file` replay) |
| `pattern_check` | Validates the ramp test pattern end to end |
| `lane_test`, `board_cmd`, `usb_bench`, `thread_drop_test` | Lane decode check, board opcodes, throughput benchmark, drop reproducer |
| `capture_plot.py` | Offline plotting of recorded captures |

## Building the bitstream

Requires [oss-cad-suite](https://github.com/YosysHQ/oss-cad-suite-build) at
`/opt/oss-cad-suite` (Yosys → nextpnr-ecp5 → ecppack).

```bash
cd adc_4lane_framed
make synth      # bitstream only
make flash      # program SPI flash via dirtyJtag (LFE5U-25F)
```

Synthesis is split around `opt -undriven` because that pass removes the DP16KD
block-RAM cells the FIFOs depend on — see the comment in the Makefile before
changing it.

**Target:** LFE5U-25F-7BG256I, CABGA256, speed grade 7. Use `make flash`, not
SRAM programming.

## Key numbers

```
Sample rate     15,625 Hz per channel        Channels        512 (8 lines x 64 amps)
Resolution      12-bit ADC → 16-bit PCM      USB throughput  16.5 MB/s
PCM encoding    pcm = (adc - 2048) << 4      Volts/count     4.5776e-6
Full scale      ±15.36 mV input-referred     CRC             CRC-12 ITU-T, poly 0x80F
Frame           132 words (128 data)         Lanes           4, frame-interleaved
```
