# Hardware design files

This directory contains the [current 100T review snapshots](../presentation/fpga/index.html), the [earlier FPGA import](fpga-board/README.md), and preserved ASIC-carrier/LDO references. No board in this collection is represented as an approved new-system fabrication package.

## Current FPGA review checkpoints

Start with [the 100T review](../presentation/fpga/index.html) and [uncertainty list](fpga-interface-study/fourth_check/Uncertainty_Register.md). The most-routed core is [FPGA100T_Minimal](fpga-100t-review/hardware/FPGA100T_Minimal.kicad_pro). The [rail revision](fpga-interface-study/review_projects/FPGA100T_Rail_Revision.zip) and [mezzanine study](fpga-interface-study/review_projects/FPGA100T_Mezzanine_Study.zip) are separate. Keep each complete project folder together. There is no single integrated full-system board. Use the [team workflow](../CONTRIBUTING.md) and [ownership register](../docs/team/owners-and-work.md) before choosing and editing a development baseline.

## Supplied references

Start with the **[visual hardware overview](overview.md)**: overall board views, front/back layouts, an original assembly photograph and the system signal path. [PNG and SVG files](previews/README.md) are included for viewing without KiCad.

The earlier **[overall assembly concept](assembly/README.md)** is also included as an unchanged STL with a labeled preview. It shows the carrier stack, routing section and FPGA-board arrangement; its dimensions remain provisional.

## ASIC carrier PCB-5

- [KiCad project](references/asic-carrier/PCB.kicad_pro)
- [Schematic](references/asic-carrier/PCB.kicad_sch)
- [Board](references/asic-carrier/PCB.kicad_pcb)
- [Original pin-planning spreadsheet](references/asic-carrier/Pins.xlsx)

The provided files declare KiCad 10. The saved schematic and board include embedded symbols/footprints. A complete separate custom carrier library was not supplied in this collection; obtain it from the designer if editing requires new or updated custom instances. The spreadsheet is retained as supplied, without promoting it to an approved connector specification.

## LDO/routing reference

- [KiCad project](references/ldo-routing/PCB.kicad_pro)
- [Schematic](references/ldo-routing/PCB.kicad_sch)
- [Board](references/ldo-routing/PCB.kicad_pcb)
- [Supplied connector-footprint library](references/ldo-routing/LDO_Board.pretty/)

The older source declares KiCad 9. Its circuit/project files are unchanged copies. The footprint-library table has one documented adaptation: the original workstation path points to the included local library using `${KIPRJMOD}`. Keep the directory together when opening it.

Use a compatible KiCad installation and a working copy for format migrations. The reference projects are not a verified mating pair. Authoritative pin, electrical, power and mechanical requirements must come from the designers.

The [September 17 meeting](../docs/meetings/2026-09-17.md) records the chip and older routing/LDO examples. [Source provenance](../sources/README.md) and [the manifest](../sources/manifest.json) identify their origin, preserved source paths and hashes.
