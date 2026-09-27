# First-capture engine — 26 September 2026

This new, separate RTL captures raw ASIC interface bits for later inspection. It does not modify the bundled ECP5 acquisition reference.

**Scope:** eight independent falling-edge capture domains, each storing 4,096 ten-bit words: `{SYNC, READ, DATA8, ..., DATA1}`. At a nominal 32 MHz returned clock this is 128 microseconds per chip. Capture-start times differ between chips because each command crosses into that chip's own clock domain; the data is not represented as simultaneously sampled across all eight chips.

All control inputs (`arm`, `read_enable`, `read_chip` and `read_address`) must be synchronous to `control_clk`; a future JTAG adapter must provide the host clock-domain crossing. The engine does not contain that adapter.

The control interface accepts a rising edge on `arm` while idle. It reports `arm_accepted` or `arm_rejected` for one control-clock cycle. Holding `arm` high cannot retrigger. An accepted arm invalidates the previous buffer; the caller must finish reading it first. Additional arm edges while busy are rejected and are not queued.

Each buffer stops writing when full. Completion crosses three synchronizer stages into the reader clock domain before any data can be read. Once all eight chips finish, `capture_valid` is asserted. `read_chip`, `read_address`, and `read_enable` request one synchronous read; `read_valid` and `read_data` give the response after that clock edge. Read requests during capture or coincident with accepted rearming are rejected. Memory contents before valid capture are unspecified.

A missing or stopped ASIC clock leaves `busy` asserted. `chip_done` identifies completed chips; the controller may resume the clock or assert reset to abort. There is no automatic timeout. Reset clears the completion handshake even if an ASIC clock is stopped, preventing stale data from being mistaken for a fresh capture. The RAM itself is not reset.

## Checks

[Verification.json](Verification.json) records source hashes and actual test results. The testbench uses eight distinct clock periods and phases, checks every stored word against the data present at the falling edge, exercises rearming, reset during capture, reset with a missing clock, read rejection, and a held arm input. Tests run at both 16 and 4,096 words per chip. XC7 synthesis checks block-RAM inference and structural consistency; it does not replace Vivado implementation.

Run `python3 verify_capture.py --tools /path/to/oss-cad-suite/bin` from an environment with Icarus Verilog and Yosys. [OSS CAD Suite](https://github.com/YosysHQ/oss-cad-suite-build) provides both. Generated outputs and tool caches are not FPGA deliverables.

## Still needed for a working board demonstration

This is **not a complete acquisition bitstream**. It has no ASIC output controls, SPI/reset sequencer, JTAG readout adapter or XEM8310 link. A top-level integration must provide those interfaces, bind the checked package pins, implement the ASIC startup data and safe control states, and constrain actual clock/data timing. The separate [clock-pin proof](../clock_pin_proof/) tests candidate FPGA resources without claiming those timings.

There is no hardware-programming command in this package. Simulation and generic XC7 synthesis do not verify board power, FPGA placement, timing closure, analog AC_IN, ASIC compatibility, or physical acquisition.
