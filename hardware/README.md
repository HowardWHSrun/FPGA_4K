# Hardware documents and editable studies

**No board in this repository is released for fabrication.** Start with [current status](../docs/current-status.md) and the [open questions](../docs/open-questions.md).

## Latest placement studies

| Artifact | Open | Evidence and limitation |
|---|---|---|
| FPGA Rev2, 60 × 70 mm | [Guide](placement/FPGA_PCB_Rev2/README.md), [KiCad board](placement/FPGA_PCB_Rev2/hardware/Howard_FPGA_Rev2_60x70.kicad_pcb), [3D preview](placement/FPGA_PCB_Rev2/previews/FPGA_3D.png) | 203 footprint objects, 34 top/169 bottom. No schematic, nets or routing; 69 native pad-clearance errors remain. |
| Routing, one versus four regulator groups | [Guide](placement/Routing_PCB/README.md), [one-group board](placement/Routing_PCB/Routing_1_Group_Size_Study.kicad_pcb), [four-group board](placement/Routing_PCB/Routing_4_Group_Size_Study.kicad_pcb) | Alternative placement scenarios. Number of supply groups and final dimensions are unresolved. |

Keep each complete study directory together: local footprint libraries and relative visual-model paths are part of the editable package. Body-only 3D proxies do not validate leads, balls, heights or mating. Some other models depend on an installed KiCad library. These files were previously inspected using KiCad 10; this documentation upload did not rerun a native electrical or layout validation.

The copied reports record earlier checks. They are evidence of their stated scope, not fresh hardware tests. The previous 35T RevA/RevB drafts and earlier placement alternatives remain in the source owner's local archive; the latest study is the shared starting point.

## ASIC-side reference projects

- **Carrier PCB-5:** [project](references/asic-carrier/PCB.kicad_pro), [schematic](references/asic-carrier/PCB.kicad_sch), [board](references/asic-carrier/PCB.kicad_pcb), [Pins.xlsx](references/asic-carrier/Pins.xlsx). It contains two ASIC instances and an 80-contact connector. The spreadsheet is a planning list, not a final approved pinout.
- **Earlier LDO/routing board:** [project](references/ldo-routing/PCB.kicad_pro), [schematic](references/ldo-routing/PCB.kicad_sch), [board](references/ldo-routing/PCB.kicad_pcb), with its supplied local connector footprint library. Its 50-contact connectors do not establish mating compatibility with the carrier.
- [Reference-board walkthrough](../docs/history/2026-09-17-reference-board-guide.md) and [ASIC-power audit](../sources/notes/2026-09-18-asic-power-audit.md) describe the useful structure and unresolved package, rail-label and high-voltage concerns.

The carrier source declares KiCad 10 and the older LDO source KiCad 9. Use a compatible installation and work on a copy when migrating formats. The source trees did not supply a complete separate carrier symbol/footprint library; saved schematic symbols and board footprints are embedded, but adding/updating custom instances may require the original libraries from Gerald. CAD opening or embedded footprints do not establish a complete BOM.

Original packaged ZIPs, backup archives, stale fabrication exports and hidden local histories are not duplicated. The source project/schematic/board files are copied unchanged. The LDO footprint-library table is adapted to a repository-relative path so it finds the included connector footprint on another computer; both original and published hashes are identified in [the manifest](../sources/manifest.json).

## Proposed power and configuration inputs

- [Configuration review](design-inputs/config/README.md), [configuration inputs](design-inputs/config/config_design_inputs.json), [484-pin inventory](design-inputs/config/xc7a200tsbg484_pin_inventory.json), [official package TXT](design-inputs/config/xc7a200tsbg484pkg.txt) and [CSV](design-inputs/config/xc7a200tsbg484pkg.csv).
- [Power review](design-inputs/power/POWER_DESIGN_REVIEW.md) and [proposed power inputs](design-inputs/power/power_design_inputs.json).

These were created under a local directory called **Howard_FPGA_RevC**. That name does not signify a completed RevC board: the available files are draft design inputs, not an assembled schematic/layout. Configuration and power generator scripts remain local unfinished work. The configuration header proposal uses 1.27 mm pitch; the latest placement uses 2.54 mm. Exact JTAG part and adapter remain TBD.

## Mechanical concepts

[Original supplied STL](mechanical/stacked-headboard-original.stl), [generated compact-B STL](mechanical/stacked_headboard_compact_B_v1.stl), [comparison](mechanical/compact_B_comparison.png) and [notes](mechanical/Compact_B_notes.md) are conceptual arrangement references. Confirm units, dimensions, cable/mating clearances and the complete assembled envelope before using them for manufacturing.

## Moving toward a build

Agree both interfaces and the power handoff; select exact devices; complete schematics and validated footprints; check banks/clocks and implementation; route the board; review electrical/physical/thermal/manufacturing evidence; then record the release decision. A placed component or successful document check is not a release gate.
