# Gerald's original FPGA_512 software reference

The shared software source is [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e), pinned to commit `767e82528780005cbcb37b3e926197755bac622e` (source ID `fpga512-pinned`). It contains the earlier 512-channel **ECP5/FT600** acquisition RTL and host software. It is a reference for the team's work; this repository does not contain a completed 4K or Artix-7/KR260 implementation.

## Fetch and verify the original source

From this repository's root, using Python 3.9+ and Git:

```sh
python3 scripts/fetch_reference.py fpga512
python3 scripts/fetch_reference.py fpga512 --verify-only
```

The first command downloads the registered revision into ignored `external/FPGA_512`. An existing checkout is verified without resetting or cleaning it. Verification checks the commit and every tracked file's bytes against its pinned Git blob. The second command only verifies and needs no network access. Interrupted downloads may leave a partial directory; inspect it before retrying.

The machine-readable revision and provenance are in [repositories.json](../references/repositories.json). Keep the fetched originals unchanged and put any future adaptations in a separate directory with their upstream revision recorded.

## Code map

Paths below are relative to the fetched `external/FPGA_512` directory.

| Original path | What to read |
|---|---|
| `README.md` | Upstream host setup, recording format, controls and operational instructions |
| `adc_4lane_framed/top_4lane_framed.v` and `Makefile` | Four-lane acquisition top module and ECP5 build inputs |
| `fpga/adc_auto_adjust.v` | Serial input alignment and sample reconstruction |
| `fpga/pair_tdm_framer.v`, `fpga/usb_framer.v`, `fpga/lane_frame_arbiter.v` | Paired data, framing and lane arbitration |
| `fpga/async_fifo.v`, `fpga/ft600_writer.v` | Buffering and the FT600 output interface |
| `adc_4lane_framed/adc_daemon.c`, `adc_ctl.c`, `adc_live.py` | Host decoding, control and display |
| `sim/` and the root `Makefile` | Original models and testbenches; inspect the target's actual inputs before running it |

The root Makefile and `adc_4lane_framed/Makefile` describe different targets. Read the selected target's source and constraints together. The prior repository's hardware assumptions do not establish compatibility with the new system.

## Original no-hardware simulation entry point

With `make`, Icarus Verilog (`iverilog`) and its runtime (`vvp`) on PATH, the upstream root Makefile provides this explicit simulation target:

```sh
make -C external/FPGA_512 sim
```

At the pinned commit, this target compiles only `sim/ADC_Model_TB.v` and runs it with `vvp`. That file contains a stream generator, receiver model and comparison testbench; it does not exercise the complete four-lane acquisition top module. It writes `sim_tb` and `tb_adc_stream.vcd` inside the fetched checkout. The recipe was checked against the pinned source; no new simulation result is claimed in this documentation revision.

Read the printed frame/comparison counts, error count and `RESULT: PASS` or `RESULT: FAIL`. The bench uses `$finish`, so a zero process exit code alone is not a passing result. A model simulation does not establish physical capture, electrical timing, USB throughput or a working 4K system.

Use the explicit `sim` target for this step. Bare `make` builds a bitstream; programming, flash and live-host commands require a separate hardware task and a confirmed compatible setup.

## Contributing with an AI agent

Read [AGENTS.md](../AGENTS.md), identify the source revision used, and keep source statements distinct from proposed changes and observed test results. Run `python3 scripts/check_docs.py` for documentation changes. This repository's helper scripts provide source retrieval and documentation checks; the acquisition programs and testbenches remain in their original upstream repository.
