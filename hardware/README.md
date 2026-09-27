# Hardware design files

## Current FPGA design

The active design is the [USB-C revision](../presentation/fpga/index.html). Open its [native KiCad project](fpga-interface-study/dated/2026-09-27/usb-c-revision/hardware/FPGA100T_33x36_Routing.kicad_pro) from the extracted [complete ZIP](fpga-interface-study/dated/2026-09-27/usb-c-revision/FPGA100T_USB_C_Development.zip). The 100T and two ASIC mezzanines are retained. The [native audit](fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_Native_Audit.json) reports actual component/pin counts, routing gaps and checks for this exact USB-C PCB.

The [earlier micro-HDMI review](../presentation/fpga/micro-hdmi.html) and 125-component learning report remain history. Neither certifies the new circuitry. Firmware, receiver, ASIC timing, power/cable/thermal verification and manufacturing/assembly acceptance remain open. **Not released for manufacture.**

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
