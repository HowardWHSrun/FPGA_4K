# Offline eight-clock placement proof

Generated26September2026 from the current116-digital-pin map. **Not acquisition firmware and never to be programmed onto hardware.** Its28 output signatures would not be valid ASIC commands. The script deliberately does not write a bitstream.

- All116 package pin/IOSTANDARD entries match the current assignment CSV.
- Eight returned clocks instantiate IBUF→BUFG;80 input bits use falling-edge registers with IOB placement requested.
- The nominal32MHz constraints test resource placement only. No ASIC input delay, output delay, timing exception or CLOCK_DEDICATED_ROUTE override is invented.
- Local Icarus passed160 captures across8 independent domains and checked that rising edges do not capture data. This tests logic, not physical clocks or timing.
- **Vivado has not run** because no local executable was found. The Tcl driver itself remains unvalidated in Vivado. Use a supported x86-64 Windows/Linux lab host with the Artix-7 device files; the exact speed-grade assumption is xc7a100tcsg324-1.

Run from this directory:

```sh
vivado -mode batch -source run_clock_proof.tcl
```

Success must retain8 BUFG and80capture-register cells, place and route with dedicated clock routing, and have no unsuppressed placement/DRC errors. Inspect `output/clock_utilization.rpt`, `io.rpt`, `route_status.rpt`, `drc.rpt`, and `pin_clock_sites.tsv`. `timing_NOT_SIGNOFF.rpt` intentionally exposes missing external interface delays; it is not a closed timing result. Then run the real acquisition design through the same process with confirmed ASIC timing.

Static pin evidence: [AMD UG472](https://docs.amd.com/v/u/en-US/ug472_7Series_Clocking), Table2-1 allows SRCC/MRCC→BUFG provided the BUFG is in the same device half; four clock-capable inputs and regional resources exist per region. The actual chip has to be placed to establish topology. [AMD Vivado supported operating systems](https://docs.amd.com/r/2025.1-English/ug973-vivado-release-notes-install-license/Supported-Operating-Systems).
