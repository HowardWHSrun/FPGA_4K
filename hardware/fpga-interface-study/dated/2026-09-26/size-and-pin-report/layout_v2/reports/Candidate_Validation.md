# 33 × 36 mm placement: measured result

**All 128 components fit in a 33 × 36 mm board outline.** This is an unrouted placement study, not fabrication-ready and not a proven global minimum. Both 60-contact Samtec QSH connectors and the custom J4 cable connector remain present. The 117 application signals remain a provisional contact proposal, not completed signal routing or an approved net allocation.

| Native check | Result |
|---|---:|
| Outline / area | 33 × 36 mm / 1,188 mm² |
| Area reduction from 37.5 × 36 mm | 12.0% (162 mm²) |
| Area reduction from 40 × 36 mm | 17.5% (252 mm²) |
| Components | 128: 39 front, 89 back |
| Preserved pad records | 807, including number, net and UUID |
| Native DRC physical violations | 0 |
| Native DRC unconnected items | 383 |
| Tracks / vias / zones | 0 / 0 / 0 |
| Moved footprints from 37.5 × 36 | 38 |

## What changed

The top mezzanine connector J5 shifts left by 4.5 mm. J4 shifts left by 4.5 mm and upward by 0.5 mm, preserving its intended edge opening. The back-side ASIC and core regulator groups translate intact; their relative inductor, controller, feedback and capacitor arrangements remain unchanged. The complete four-part clock group rotates into the front upper-left space. Input/bulk capacitors and configuration resistors fill smaller available pockets. U1, J6, and the two front regulator groups stay fixed. No part, decoupler, footprint or pad is removed or resized; sides remain 39 front / 89 back.

## Physical clearances and space

Fresh KiCad readback reproduces the planned courtyards and all 807 transformed pads (maximum coordinate difference 0.000001 mm). A separate rectangle screen finds zero same-face courtyard conflicts and zero opposite-face conflicts against every PTH/NPTH pad, including all four J4 shell pads and all four Samtec locating holes. The screen targets 0.01 mm between same-face courtyard bounding boxes (native minimum 0.009999 mm after coordinate rounding, with 0.000003 mm numeric tolerance), 0.05 mm around opposite-face through-pad bounding boxes, and at least 0.225 mm courtyard-to-board margin except the intentional J4 opening. Exact measured minima are 0.360 mm between same-face fabrication-layer boxes, 0.090 mm between an opposite-face courtyard and a through-pad box (C21–J4 shell pad), 0.500 mm from copper-pad bounding boxes to the board edge (J5), and 0.599999 mm fabrication-box-to-edge excluding J4 (C82). Native DRC additionally enforces the saved 0.5 mm copper-edge rule; the project settings are identical to the baseline apart from the project filename, and the footprint libraries are byte-identical.

J4's fabrication-layer body outline extends **0.65 mm beyond the right board edge**; its courtyard extends **1.125 mm**. Thus the board is 33 × 36 mm, while board plus drawn component-body envelope is approximately **33.65 × 36 mm**. This is not a verified full assembly envelope: plug insertion, mated daughterboard, component height, enclosure and cable clearance remain unverified.

Courtyard bounding boxes, clipped to the board, occupy approximately **80.6% of the front** and **52.7% of the back**. These are conservative 2D footprint-area measures, not copper or route utilization. Remaining spaces are fragmented around decouplers and through holes; some will be needed for BGA escape, power distribution, connector routing and assembly. This bounded placement search demonstrated 34 × 36 mm and then 33 × 36 mm; it does not establish that no smaller arrangement exists.

## Verification and remaining work

The 33 × 36 mm board was saved and reopened in a separate KiCad Python process. Its entire pad/net/UUID inventory was compared with the baseline native PCB, its outline was read from Edge.Cuts, and native KiCad CLI DRC completed with 0 physical violations and 383 unconnected items. The DRC count excludes still-unassigned application-signal nets. No integrated schematic exists in this placement package, so schematic parity is unverified. Routing, rail qualification, protection, startup/blank-device recovery, thermal/SI/PI design, mating hardware and electrical function remain open.

The source board and its separate most-routed core, rail revision, and mezzanine studies are unchanged. The validated intermediate 34 × 36 mm revision remains in `hardware/` with its audit results under `reports/revision_34x36/`.

- Final project: `hardware/FPGA100T_33x36_Placement.kicad_pro`
- Editable board: `hardware/FPGA100T_33x36_Placement.kicad_pcb`
- Native front/back figure: `output/Compact_Placement.png` and `.svg`
- Native geometry: `reports/Geometry.json`
- DRC: `reports/Candidate_DRC.json`
- Preserved-pad evidence: `reports/Build_Inventory.json`
- Placement plan: `reports/Placement_33p0x36.json`
- Mechanical measurements: `reports/Mechanical_Measures.json`
