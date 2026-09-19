# Software and reproducible reference checks

The runnable starting point is the **earlier 512-channel ECP5 + FT600 reference**. It teaches capture, framing, buffering and host decoding. It is not firmware for the team's Artix-7/KR260 direction, and the passing checks below do not establish a working 4K system.

## Repositories and ownership

| Project | Use here | Reproducible version |
|---|---|---|
| [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e) | Prior acquisition RTL, host software and original testbenches | `767e82528780005cbcb37b3e926197755bac622e` — source ID `fpga512-pinned` |
| [controlpaths/cp_som_one](https://github.com/controlpaths/cp_som_one/tree/b272899d62ac2e454f85c413d64d62271137da27) | Artix-7 board-design reference | `b272899d62ac2e454f85c413d64d62271137da27` — source ID `cpsom-pinned` |
| [HowardWHSrun/512channels](https://github.com/HowardWHSrun/512channels) | Prior educational guides, browser Verilog practice and optional native experiments | Separate evolving project; not a pinned 4K release |

The machine-readable register is [repositories.json](../references/repositories.json). FPGA_512 has no repository-wide license file in the reviewed commit; we link and fetch it separately rather than copying it into this repository or assigning it a license. CP SOM ONE includes an MIT license, copyright 2024 Pablo Trujillo. These references do not identify the currently fitted lab hardware or guarantee board compatibility.

## First run: no hardware needed

Install **Python 3.9 or newer**, **Git**, and **Icarus Verilog** (`iverilog` and `vvp`). These scripts need only the Python standard library. Follow [Icarus installation instructions](https://steveicarus.github.io/iverilog/usage/installation.html), or obtain [OSS CAD Suite](https://github.com/YosysHQ/oss-cad-suite-build) for your OS and CPU. An FTDI SDK, Vivado, USB driver and physical board are unnecessary for these checks.

From this repository's root:

```sh
python3 --version
git --version
iverilog -V
vvp -V
python3 scripts/fetch_reference.py fpga512
python3 scripts/run_reference_checks.py
```

The fetch step needs network access. It creates `external/FPGA_512` at the exact registered commit. An existing checkout is only verified; it is never reset, cleaned, overwritten or fetched into. An interrupted new download may leave a partial directory: inspect or rename it before retrying. `external/` is ignored by Git and is not part of the documentation upload.

If using OSS CAD Suite without putting its tools on your PATH, set its extracted location first:

```sh
export OSS_CAD_SUITE="/path/to/oss-cad-suite"
python3 scripts/run_reference_checks.py
```

Each test compiles in a temporary folder. Logs, compiler-version output and a JSON report are kept in a new `build/reference-checks/run-*/` folder. Results return exit code 0 only when all requested checks pass; 1 means a checked test failed and 2 means setup or verification could not complete. The runner compares every tracked reference file's bytes with the pinned Git tree before and after execution. It never calls a Makefile, programs hardware, opens USB, launches a UI or builds a bitstream.

Run one bench or verify a previously saved checkout without downloading:

```sh
python3 scripts/run_reference_checks.py tb_auto_adjust
python3 scripts/fetch_reference.py fpga512 --verify-only
python3 scripts/run_reference_checks.py --reference "/path/to/FPGA_512"
```

A local override must match the pinned commit and all of its file contents. Untracked files are left alone and are not compiled. To obtain the PCB reference separately:

```sh
python3 scripts/fetch_reference.py cpsom
```

## What these tests check

| Original bench | Evidence required by this runner | Scope |
|---|---|---|
| `tb_auto_adjust` | At least 3,200 reconstructed samples, zero mismatches and explicit PASS | Eight serial deserializers and the supplied alignment scenarios |
| `tb_4lane_framed` | At least 10 frames per lane, zero checker errors and explicit PASS | Lane tags, framed sample order, counters and CRC under intermittent output pauses |
| `tb_4lane_counter` | More than 1,000 checked samples on each of eight inputs, no hold/skip/other errors, successful drop reconciliation and explicit PASS | Sample progression plus intentional lane-FIFO overflow and drop reporting |

The upstream benches print PASS/FAIL and can exit zero even when they print FAIL. The wrapper checks their text, completion markers, nonzero sample/frame counts and exit status. Inspect the saved logs when diagnosing a failure.

All three checks were run successfully from a freshly fetched pinned checkout on September 19, 2026. The [saved validation record](validation/2026-09-19/README.md) includes logs, tool versions and the JSON result. GitHub Actions repeats the documentation check and these reference simulations on pushes and pull requests.

These benches cover selected behavioral modules. They **exclude** the top-level PLL, asynchronous USB FIFO, FT600, live USB/host software, electrical timing, metastability, synthesis/fit, analog ASIC behavior, physical electrode mapping, UWB, stimulation and 4K integration. The counter bench deliberately forces sample bit 11 high because the deserializer's alignment detection depends on it; arbitrary 12-bit ADC codes are not validated. Do not translate a PASS into physical throughput or fabrication readiness.

## How to read the reference

Start with the [active top module](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v) and its [Makefile](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/Makefile). Then trace:

1. `fpga/adc_auto_adjust.v`: serial bits to 12-bit samples.
2. `fpga/pair_tdm_framer.v` and `fpga/usb_framer.v`: paired data and 132-word frames.
3. `fpga/lane_frame_arbiter.v`: four lanes sharing an output.
4. The asynchronous FIFO and `fpga/ft600_writer.v`: transport toward the USB bridge.
5. `adc_4lane_framed/adc_daemon.c`, `adc_ctl.c` and `adc_live.py`: host decoding, control and plotting.

The root Makefile builds a different evaluation-board target; it is not the same as the active `adc_4lane_framed` build. Some older overview text describes other revisions, so reconcile claims with the pinned active source. The host's 512-channel/15,625 Hz constants and the slide deck's 31,250 Hz should remain a question about configuration and clock timing until the team resolves them.

## Earlier teaching material and extended simulations

Open the [512channels practice bench](https://howardwhsrun.github.io/512channels/) for browser Verilog exercises, or its [reference library](https://howardwhsrun.github.io/512channels/lab.html) for tutorials and guides. The browser's “load” operation loads a simulation; it is not physical FPGA programming. The control exercise does not validate acquisition throughput.

The separate project's [native simulation guide](https://github.com/HowardWHSrun/512channels/blob/main/learning/README.md) explains its additional `normal`, `host_pause` and `control` scenarios. Those execute the reference top-level with a synthetic ASIC, ideal PLL stand-in and modeled FT600 parallel pins, using an independent Python checker. They do not execute the FTDI driver or the original C host decoder. Use that project's current instructions and attach fresh reports when relying on its results.

Legacy local replay launchers used generated captures and an explicit no-USB link shim for the original C decoder. They are not shipped as a live acquisition path here. A real recording matching the exact firmware, physical channel map and hardware revision is still needed before claiming a reproduced lab acquisition.

For an AI-assisted contribution, read [AGENTS.md](../AGENTS.md), state the source IDs and commit used, run the relevant checks, and keep each unresolved hardware requirement open with its owner. Simulator success does not resolve a meeting question.
