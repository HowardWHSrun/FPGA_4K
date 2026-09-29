# Step 13 — retire the disconnected 32 MHz oscillator island

**28 September 2026.** Applied to the active unrouted 50T review after an isolated trial on the frozen Step11 project. The pre-edit active Step12 project is preserved at `../checkpoints/12_erc_cleanup/project/`. The resulting complete Step13 project is preserved at `../checkpoints/13_legacy_clock_removed/project/`.

## Scope and electrical decision

Removed schematic instances and PCB footprints **Y1, R119, C102 and C103**, the 20 short island wires and ten local labels. Updated only three stale explanatory notes. The 32 MHz oscillator and R119 had already been marked DNP. The two output nets, `OSC_32M_RAW` and `LEGACY_CLK_32MHZ_DISCONNECTED`, had no FPGA, connector or other component endpoint; they disappear from the Step13 netlist. C102 (10 nF) and C103 (100 nF) connected only between `VCCAUX_1V8` and GND to support Y1. Removing them is sound as a **disconnected review-board island cleanup**, provided the remaining 1.8 V rail decoupling is assessed in the later power-integrity review.

This change **does not supply a 32 MHz source**. All eight `ASICx_CLK32MHz_Out` U1-to-J5/J7 connections remain exactly as before, but their FPGA clock generation plan is still open. `FABRIC_CLK_1V5_TBD` remains without a confirmed source. The separate 125 MHz GTP oscillator Y2, its local capacitors and the J4 GTP link were untouched; using the GTP reference for FPGA fabric or deriving 32 MHz from it is not established by this schematic.

## Guarded implementation

`../scripts/step13_retire_legacy_32mhz.py` requires explicit board and clock-sheet SHA-256 values before writing. It checks the four reference UUIDs, PCB pad-net maps, private net isolation, 20 wires, ten labels, no crossing wires or other components in the island rectangle, and zero routes/zones. It preflights every file before writing. The Step11-only trial remains at `../validation/step13_clock_retirement_trial/project/`; applying the script to frozen Step12 produced the active Step13 project.

## Native checks on active Step13

| Check | Step12 before | Step13 after |
|---|---:|---:|
| ERC errors / warnings, all severities | 0 / 18 | **0 / 17** |
| Physical DRC violations | 0 | **0** |
| Expanded schematic parity findings | 0 | **0** |
| Native pcbnew unrouted connections | 633 | **625** |
| Footprints / pads | 178 / 921 | **174 / 911** |
| Tracks, vias and zones | 0 | **0** |

The CLI DRC JSON lists only 499 unconnected items because the report is capped; 625 is the native connectivity count. Direct XML netlist comparison with the frozen Step12 export proves **every surviving net and node is identical** after filtering out the four deleted references. The only removed nets are the two private legacy nets. The eight ASIC clock output links and Y2 reference links are explicitly checked in `../validation/Step13_Final_Verification.json`.

Evidence: `../validation/Step13_Remove_Report.json`, `Step13_Final_Netlist.net`, `Step13_Final_ERC.json`, `Step13_Final_Full_DRC.json`, `Step13_Native_Ratsnest.json`, and `Step13_Final_Verification.json`. This is an unrouted schematic and placement candidate; clock architecture, decoupling/rail-noise adequacy and timing remain design-review gates.
