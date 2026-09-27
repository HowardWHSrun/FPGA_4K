# Hardware design files

## Current FPGA design

Only the **33 × 36 mm** board is active. Open the [native KiCad project](../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/hardware/FPGA100T_33x36_Routing.kicad_pro) with its complete folder, or download the [portable ZIP](../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/FPGA100T_33x36_Routing.zip). It contains 125 components, 21 schematic sheets and local libraries.

The [current audit](../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/reports/Routing_Review.md) reports **116/116 assigned ASIC digital nets connected** and **0 assigned-net gaps**, with 0 physical DRC findings and 0 schematic-parity findings. AC_IN is separately reserved for an external analog source. The [pin map](../presentation/fpga/pins/) distinguishes 83 intentional NCs from 19 interface reservations. See the [qualification summary](../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/reports/Qualification_Summary.md) for parts, stackup and open engineering requirements. No manufacturing release or demonstrated hardware operation is claimed.

Earlier revisions remain [historical checkpoints](../presentation/fpga/index.html#design-history).

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
