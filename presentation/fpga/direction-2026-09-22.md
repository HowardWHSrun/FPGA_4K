# FPGA direction update — September 22, 2026

## Current project direction, reported by Howard

Howard and Zitong are currently working together on the board. They are using [Controlpaths’ CP SOM One](https://github.com/controlpaths/cp_som_one/blob/main/README.md) as the main power and schematic/layout reference. Board functions and component choices are still being finalized.

The next step is to evaluate a smaller Artix-7 XC7A50T package, determine whether the required system can fit, and revise the schematic/layout accordingly. A practical prototyping route is an open question. This is a working direction, not a component selection or a completed redesign.

## Checked external information — separate from meeting decisions

### Package-specific, not a family-wide size

The [AMD XMP101 v1.8 product-selection guide](https://docs.amd.com/v/u/en-US/7-series-product-selection-guide), Artix-7 table on page 3, lists the following package combinations. The table was checked on September 22, 2026.

| Combination | Body | Pitch | User I/O | GTP |
|---|---|---|---|---|
| XC7A200T / SBG484 — current draft package | 19 × 19 mm | 0.8 mm | 285 | 4 |
| XC7A50T / CPG236 — evaluation candidate | 10 × 10 mm | 0.5 mm | 106 | 2 |

These are package-body dimensions, not PCB outlines. The full speed/temperature ordering code remains undecided. The same guide reports 52,160 logic cells and 2,700 Kb block RAM for 50T; it does not establish that this project's logic fits. Consult [UG475](https://docs.amd.com/v/u/en-US/ug475_7Series_Pkg_Pinout) for the exact pinout.

The meeting's 88 recording lines leave a gross arithmetic difference of 18 relative to 106 user I/O. This is not a count of usable spare pins: the complete control, clock and configuration requirements and bank constraints have not been assigned. Dedicated GTP/JTAG signals should be accounted for separately from GPIO. A package/RTL fit check must precede committing to the small footprint.

### What the reference establishes

The [CP SOM One design article](https://www.controlpaths.com/2023/10/28/designing-a-fpga-som/) describes an FGG484-based SOM using three TLV62565 converters for logic supplies. It distinguishes extra DDR/transceiver supply requirements. Howard's saved [BOM](../../sources/fpga-draft-2026-09-21/BOM_Draft.csv) instead contains an ADP5052 candidate. Thus, reference-based development is not the same as electrical equivalence, and regulator selection remains open.

Attribution is retained here and in slide notes. No upstream artwork or native reference CAD is copied into this update. No percentage of circuit reuse or independently verified schematic equivalence is claimed.

## Proposed prototyping path — engineering guidance, not a completed test

Use an available development board or FPGA module plus an adapter PCB for early logic/interface tests. Confirm exposed pins, bank voltages, clock resources and the actual link capability. A bare 0.5 mm-pitch BGA is not a solderless-breadboard component. Full-bandwidth signals and power need an appropriately designed PCB/interconnect; a module experiment does not validate the custom board's power or layout.

A breadboardable module can help with reduced-scope tests: [Digilent's Cmod A7](https://digilent.com/shop/cmod-a7-35t-breadboardable-artix-7-fpga-module/) exposes 44 digital I/O on DIP pins plus eight on Pmod. Even 52 is below the discussed 88 recording lines, so it is an example of the method, not a suitable full-system choice established here. It is also not the candidate 50T device. No board purchase or lab inventory is assumed.

Suggested progression: simulate and synthesize for the exact candidate; test generated recording data and return commands on suitable development hardware; then build an assembled test PCB for custom power, startup and layout checks. [AMD UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB) is the PCB-design reference. This is not evidence of passed tests or approval of a stackup.

## Presentation and CAD status

The eight slides are shortened; detail is retained in their source notes. The displayed CAD is still the [200T draft](../../hardware/fpga-board/README.md), not a new 50T layout. The native CAD, compact STL and dated import reports are unchanged. The [September 21 digest](meeting-2026-09-21.md) remains a separate historical record; today's update is not retroactively attributed to that meeting.

Historical unresolved counts remain in the notes: 270 PCB connection items, 661 schematic pins and 21 undriven power pins. They have not been rerun. The slide update performs no synthesis, electrical validation, programming or hardware operation.
