# FPGA acquisition reference

The actual [FPGA_512 source files](FPGA_512/) are included here so a clone of this repository contains the original RTL, host programs, testbenches, constraints, reference documents and archived bitstreams. Start with the [original README](FPGA_512/README.md), [system overview](FPGA_512/docs/SYSTEM_OVERVIEW.md), and [software guide](../docs/software.md).

This reference targets the 512-channel ECP5/FT600 acquisition system. It provides an implementation to inspect and reuse where appropriate; it does not establish a completed 4K design or Artix-7 compatibility. Performance and hardware-validation statements inside the original files describe their original system and have not been independently revalidated by packaging this copy.

## Included source

| Material | Files |
|---|---|
| Main acquisition design and host software | [adc_4lane_framed](FPGA_512/adc_4lane_framed/) |
| RTL modules and pin constraints | [fpga](FPGA_512/fpga/), [decoder](FPGA_512/decoder/) |
| Simulation models, testbenches and supplied stimulus | [sim](FPGA_512/sim/) |
| Data framing and board documentation | [docs](FPGA_512/docs/) |
| Archived original bitstreams | [golden_bitstreams](FPGA_512/golden_bitstreams/) |
| UWB SPI programs and supplied MCC examples | [UWB_SPI](FPGA_512/UWB_SPI/) |

The original tree also includes earlier acquisition variants, bring-up projects, capture-analysis files and a board netlist. These are parts of the upstream reference, not new personal study projects.

## Revision and integrity

- Upstream repository: [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512).
- Pinned revision: [`767e82528780005cbcb37b3e926197755bac622e`](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e).
- Included: 195 original tracked files, totaling 8,155,891 bytes. Their contents and executable modes are unchanged. Per-file provenance and SHA-256 hashes are recorded in the [source manifest](../sources/manifest.json).
- Omitted: Git history, local untracked files, and the three upstream Python cache files listed below. All other tracked files at the pinned revision are included.

```text
UWB_SPI/examples/__pycache__/__init__.cpython-314.pyc
UWB_SPI/examples/console/__pycache__/__init__.cpython-314.pyc
UWB_SPI/examples/console/__pycache__/console_examples_util.cpython-314.pyc
```

Original authorship, copyright notices, and third-party license material remain in their supplied files and archives. No repository-wide license was present in the pinned upstream tree; this collection adds none. Original Markdown and build files are preserved, including references to dependencies and local paths used in the original environment.

## Dependencies and limits

Icarus Verilog (`iverilog` and `vvp`) is required for the no-hardware RTL simulations described in the [software guide](../docs/software.md). Building FPGA images requires the ECP5 toolchain specified in the original Makefiles: Yosys, nextpnr-ecp5 and ecppack. Their default tool path is `/opt/oss-cad-suite/bin`.

The live USB host programs require compatible hardware, a C compiler, and the separately installed FTDI D3XX driver/header/library. The live Python interface uses NumPy and Matplotlib. The UWB SPI programs use MCC's `mcculw` package and compatible DAQ hardware; original example/library archives are included, but drivers still need installation in the appropriate environment.

Raw `sine-all-5.h5` and replay captures are not present in the pinned upstream tree. The existing hex stimulus is included, but regenerating it requires the missing HDF5 capture plus `h5py` and NumPy. The original `make sim-h5` target declares the missing capture as a prerequisite, so it does not run from this package without that input. Use the documented self-contained simulations first.

Read the relevant Makefile before running a target. Programming, USB-control and stimulation commands require a compatible connected setup and explicit task authorization. Simulation results alone do not verify electrical interfaces, timing closure, or live acquisition.
