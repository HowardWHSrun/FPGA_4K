# Routing PCB: provisional size study

> Imported dated source note; links adapted for this repository. Read [current status](../../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Two editable KiCad placement boards visualize the consequences of the proposed component list. They contain real native KiCad footprints, board outlines and labels. They deliberately contain **no schematic, assigned nets, tracks, vias or copper zones**. Open the `.kicad_pcb` file directly in KiCad PCB Editor.

| Study | Outline | Supply interpretation | Placed footprints |
|---|---|---|---|
| `Routing_1_Group_Size_Study.kicad_pcb` | **70 × 70 mm**, 49 cm² | One shared set of seven regulators | 53 |
| `Routing_4_Group_Size_Study.kicad_pcb` | **100 × 90 mm**, 90 cm² | One seven-regulator set for each of four carriers | 158 |

These are comfortable candidate floorplans for discussion, **not minimum possible sizes or final electrical designs**. The larger layout has about 84% more board area and 21 additional regulator cells. A regulator cell includes a regulator, setting resistor, and three capacitor footprints. A final design might be smaller or larger, depending on carrier alignment, current, heat, connectors, grounding, stimulation circuits and the signal map.

## How the list was interpreted

- Four carrier interfaces use native **Hirose DF40C-80DP-0.4V** plug footprints as size proxies. The original `PCB-5` carrier has an 80-contact DF40C-80DS socket footprint. The corresponding 80-contact plug family therefore provides a more relevant physical allowance than an arbitrary pin header. Connector variant, stack height, orientation, pin mapping and compatibility are **TBD with Zitong**.
- Two FPGA-facing connectors also use 80-contact plug footprints. This gives **160 gross contacts**, matching the contact-count assumption in the separate FPGA size study. It does **not** establish that all signals, power and grounds fit, or that the final boards mechanically mate.
- Each group contains seven **3 × 3 mm LT3042 DD-package DFN size proxies**, plus the proposed setting resistors: **five 15 kΩ, one 16 kΩ and one 7.5 kΩ**. Their placement order is arbitrary and assigns no rails.
- Twenty-one 0603 capacitor footprints per group allow one input, output and SET capacitor per regulator. Values, voltage ratings, actual quantities, control components and thermal copper remain **TBD**. No values were silently selected.
- One 2-pin power header, seven test pads, and four M2 mounting holes are provisional space allowances. They are not an approved interface or mechanical specification.
- Clock buffering, damping, stimulation supplies and any additional filtering are **not designed or allocated a proven sufficient area**. They may enlarge the board.

## Carrier space and stacked assembly limitations

On `Dwgs.User`, each carrier gets an illustrative **23 × 20 mm rectangle**. The source PCB-5's outline bounding box measures approximately **22.07 × 17.13 mm**, including the Edge.Cuts line width. The rectangles are deliberately rounded allowances. They are **not** imported carrier outlines and do not reproduce the source connector-to-outline transform. No mounted-carrier collision, standoff, cable clearance, stacking height or mating alignment has been verified. Connector placement is editable after that mechanical relationship is known.

The 70 × 70 mm study arranges four carrier envelopes in a 2 × 2 block with the regulator group on the right. The 100 × 90 mm study arranges carriers across the top and gives each a regulator column below. This explains the example outlines; it does not prove that either arrangement matches the actual carrier.

## Source details and one package discrepancy

Source files were read without modification:

- `Original Sources/03_ASIC_Carrier_PCB/PCB-5/PCB.kicad_pcb`: native J3 has 80 contact pads and a DF40C-80DS footprint.
- `Original Sources/04_LDO_Routing_Reference/LDO_Board_10SOIC (New Rigid)/PCB.kicad_pcb`: regulator footprints are `DFN-10-1EP_3x3mm_P0.5mm_EP1.65x2.38mm`; the reference values say `LT3042xMSE`. **MSE and DD are different package variants.** This study explicitly names its DFN proxy “LT3042 DD” and does not copy the mismatched value.
- Native KiCad library dimensions for the 80-contact plug: courtyard approximately **18.54 × 4.38 mm**; body approximately **17.52 × 1.85 mm**. Pads and courtyard are embedded in the board and cached under `RoutingSize.pretty`.

Primary sources checked for package and connector-family context:

- [Analog Devices LT3042 product page](https://www.analog.com/en/products/lt3042.html): distinguishes 10-lead MSOP and 3 × 3 mm DFN packages.
- [Analog Devices LT3042 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/lt3042.pdf): DD and MSE orderable package designations.
- [Hirose DF40C-80DP-0.4V(51)](https://www.hirose.com/en/product/p/CL0684-4001-8-51) and [DF40C-80DS-0.4V(51)](https://www.hirose.com/en/product/p/CL0684-4002-0-51): connector-family context only; no design-specific mating approval.

## Validation and files

`validation/` contains native KiCad DRC reports and a geometry summary. Geometry checks assess the drawn outline and placed footprint courtyards. The DRC uses an explicit **0.15 mm geometry-study clearance**, compatible with the native DF40 footprint's 0.17 mm adjacent-pad gap; this is not a manufacturer capability or electrical spacing approval. No-net DRC cannot find missing circuit connections, validate supply capacity, or establish functional readiness. A result with zero unconnected pads is expected because **no electrical nets exist**.

Final checks for both boards: **zero native DRC violations, zero courtyard bounding-box overlaps, zero missing courtyards, and zero courtyards outside the outline**. These results apply only to the placed routing-board footprints. The illustrative carrier rectangles have no physical or electrical validation and are not treated as mounted components in DRC.

An additional independent overlay review (`validation/overlap_review.json`) checked **81 visible labels on the one-group board and 210 on the four-group board**, including footprint fabrication annotations, against unrelated component courtyards and other labels. It found **zero label collisions, zero mounting-hole conflicts on either face, and zero conflicts between the provisional carrier rectangles and unrelated components or holes**. Both boards currently have components on the front face only. Each carrier rectangle deliberately contains its own connector and its descriptive labels; fabrication references inside their own component bodies are also intentional. No native-board edits were needed after this review, so the existing previews and DRC reports still describe the exact checked boards.

The native mounting footprint reserves a **4.9 mm diameter courtyard**, reviewed against both faces. The smallest conservative box gap to another component courtyard is **0.1875 mm** on the one-group board and **0.7075 mm** on the four-group board. Final screw, washer, standoff and tool-access dimensions are still open; this check does not approve larger mounting hardware. The rounded carrier rectangles have at least **2.0037 mm** and **3.0037 mm**, respectively, to unrelated component courtyards, but they still require the actual carrier outline and connector alignment before validating an assembled stack.

`previews/` contains a top-view SVG and 3D render for each board. The `Dwgs.User` carrier envelopes are visible in the SVG, not in the 3D render. The installed KiCad library lacks the DF40 connector 3D model, so those connectors appear as pads and silkscreen outlines in the render. The 3D render shows only the routing-board proxies; it is not a complete stacked assembly.

`*_placements.csv` records every footprint and its provisional role. `build_routing_study.py` is an original local generator reference and is not included in this shared snapshot. No fabrication package is supplied because the electrical design is still open.
