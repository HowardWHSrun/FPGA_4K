# Acquisition software

The original reference code is included at **[firmware/FPGA_512](../firmware/FPGA_512/)**. A normal repository clone or ZIP download contains the Verilog, host C/Python programs, constraints, Makefiles and testbenches.

The snapshot is the earlier **512-channel ECP5/FT600** implementation at commit `767e82528780005cbcb37b3e926197755bac622e`. Its hardware assumptions require review before reuse in the 4K project. [Snapshot details](../firmware/README.md) record the source revision and packaging exclusions.

## Program entry points

| Function | Included file |
|---|---|
| Original setup and operating instructions | [README.md](../firmware/FPGA_512/README.md) |
| Four-lane acquisition top module | [top_4lane_framed.v](../firmware/FPGA_512/adc_4lane_framed/top_4lane_framed.v) |
| Acquisition build target | [adc_4lane_framed/Makefile](../firmware/FPGA_512/adc_4lane_framed/Makefile) |
| Serial alignment and sample reconstruction | [adc_auto_adjust.v](../firmware/FPGA_512/fpga/adc_auto_adjust.v) |
| Framing and lane arbitration | [pair_tdm_framer.v](../firmware/FPGA_512/fpga/pair_tdm_framer.v), [usb_framer.v](../firmware/FPGA_512/fpga/usb_framer.v), [lane_frame_arbiter.v](../firmware/FPGA_512/fpga/lane_frame_arbiter.v) |
| Buffering and transport | [async_fifo.v](../firmware/FPGA_512/fpga/async_fifo.v), [ft600_writer.v](../firmware/FPGA_512/fpga/ft600_writer.v) |
| Host decoding and control | [adc_daemon.c](../firmware/FPGA_512/adc_4lane_framed/adc_daemon.c), [adc_ctl.c](../firmware/FPGA_512/adc_4lane_framed/adc_ctl.c) |
| Live display | [adc_live.py](../firmware/FPGA_512/adc_4lane_framed/adc_live.py) |
| Original simulation sources | [sim/](../firmware/FPGA_512/sim/), [root Makefile](../firmware/FPGA_512/Makefile) |

The root Makefile and acquisition-directory Makefile build different targets. Read the selected target's source and constraints together. Hardware host programs need the devices, drivers and dependencies described in the original README; they are not the default documentation check.

## No-hardware simulation

With `make`, Icarus Verilog (`iverilog`) and its runtime (`vvp`) on PATH, run the original model test from the repository root:

```sh
make -C firmware/FPGA_512 sim
```

This explicit target compiles [ADC_Model_TB.v](../firmware/FPGA_512/sim/ADC_Model_TB.v), a stream-generator/receiver model with comparison checks. It does not exercise the complete four-lane acquisition top module. It writes `sim_tb` and `tb_adc_stream.vcd` in the reference directory; those generated files are ignored by this repository.

Read the printed comparison/error counts and `RESULT: PASS` or `RESULT: FAIL`. The bench uses `$finish`, so a zero process exit code alone is insufficient. The recipe was checked against the source; no new hardware or simulation result is claimed by including the files. Bare `make` builds a bitstream; programming and live-host commands require a compatible setup and a separate hardware task.

## Source verification

```sh
python3 scripts/check_docs.py
```

This verifies the bundled source files against their recorded hashes. It is offline and does not execute acquisition software.

For an independent Git checkout of the original project, optionally run:

```sh
python3 scripts/fetch_reference.py fpga512
python3 scripts/fetch_reference.py fpga512 --verify-only
```

These commands use ignored `external/FPGA_512`, leaving the included snapshot alone. The first may need network access; the second verifies the existing checkout's commit and tracked bytes. [The reference register](../references/repositories.json) retains both locations and the pinned revision.
