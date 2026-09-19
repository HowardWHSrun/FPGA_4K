# Hardware design files

This directory contains the supplied ASIC carrier and older LDO/routing references. These are source examples, not a completed new FPGA board or an approved fabrication package.

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
