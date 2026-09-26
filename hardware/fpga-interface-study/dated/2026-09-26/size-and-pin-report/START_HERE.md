# Smaller FPGA PCB and complete pin report — 2026-09-26

**33 × 36 mm PCB: 12% less area than the earlier 37.5 × 36 mm placement and 17.5% less than 40 × 36 mm.** All 128 components and both 60-contact mezzanines remain. This is a new, unrouted placement revision, not a manufacturing release.

| Open | What it contains |
| --- | --- |
| [31-page LaTeX PDF report](output/pdf/FPGA100T_Size_Components_Pinout.pdf) | Size comparison, front/back figure, each component's purpose, every electrical endpoint, all 47 assigned nets, and unresolved work |
| [Editable LaTeX source bundle](FPGA100T_LaTeX_Report_Source.zip) | `.tex`, figure, all CSV/JSON ledgers, generator and build instructions |
| [Complete smaller KiCad project](layout_v2/FPGA100T_33x36_Placement.zip) | Native PCB/project, local footprint libraries and geometry/DRC evidence |
| [Open extracted KiCad project](layout_v2/hardware/FPGA100T_33x36_Placement.kicad_pro) | Keep its surrounding project/library folders together |
| [Front/back PCB view](layout_v2/output/Compact_Placement.png) | Actual 33 × 36 mm placement, not routed copper |
| [Component list](data/All_128_Components.csv) | All 128 components, values, saved order codes, side, position and purpose |
| [Every electrical endpoint](data/All_758_Electrical_Endpoints.csv) | 758 distinct pins, actual net/state, and separate mezzanine proposal |
| [Every physical pad](data/All_807_Physical_Pads.csv) | 807 native records, including duplicate ground/shell lands, paste apertures and locating holes |
| [Net peer lists](data/All_47_Assigned_Nets.csv) | Every member of every assigned net |
| [Validation](data/Final_Verification.json) | Exact board/PDF hashes, endpoint coverage, source comparison and independent DRC |

## What the result establishes

- Fresh native readback preserves 128 parts and 807 physical pad records. All 324 FPGA functions/banks match the original AMD package CSV.
- Independent KiCad 10.0.6 DRC: **0 physical violations; 383 unconnected items; no ignored checks**. Tracks/vias/zones: **0/0/0**. No integrated schematic exists for this placement.
- Report coverage: **758 of 758** distinct electrical endpoints, no duplicates or missing rows; all 128 components and 47 functional nets included. Of those endpoints, 421 are assigned, 331 unassigned and six intentional NC.
- LaTeX compiled with no overflow/underflow, missing-character or undefined-reference warnings. All 31 pages were rendered and visually inspected; the final five pages changed by order-code wrapping were re-inspected. PDF text checks confirm every component reference and assigned net.

**Important limits:** all 120 mezzanine signal contacts remain unassigned. The 117-signal contact proposal is not a completed FPGA-ball map. The 88 ASIC output/interface signals comprise 64 data lines plus 24 clock/read/sync lines. The inherited 3.3 V core circuit has not been reconciled with the separate rail revision, required protection or receiver implementation.

The smallest measured courtyard gap is approximately **0.010 mm**. J4's drawn body extends **0.65 mm** beyond the PCB, making the approximate board-plus-body envelope **33.65 × 36 mm**. Neither this tight packing nor the full mating/plug envelope is assembly-qualified. See [mechanical evidence](layout_v2/reports/Candidate_Validation.md).

Native board SHA-256: `e2aa37d7b569608729ed44e2d7946d30d108c2124e244e9707d49e6ca25df3de`.

The intermediate 34 × 36 mm candidate is retained inside `layout_v2`; the earlier 37.5 × 36 mm project remains in today's first KiCad delivery. No previous CAD source was overwritten.
