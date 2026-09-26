# FPGA100T — 37.5 × 36 mm placement candidate

**Smaller placement study, not for fabrication.** Open [hardware/FPGA100T_37p5x36_Placement.kicad_pro](hardware/FPGA100T_37p5x36_Placement.kicad_pro) in KiCad 10. The PCB, project rules and local footprint libraries are included. No integrated schematic exists in this study.

This candidate keeps all **128 parts**, including both 60-contact mezzanine connectors, in a **37.5 × 36 mm** outline: **6.25% less area** than the 40 × 36 mm connector-fit study. It uses previously sparse back-side space by moving intact regulator groups between sides. It has 39 front-side and 89 back-side parts.

Native KiCad checking reports **0 physical violations** and **383 unconnected items**. The board has **0 tracks, 0 vias and 0 zones**. Those unconnected items exclude the still-unassigned 117 application signals. This is a promising packing result, not a functional or manufacturing-ready board.

- [Validation and remaining constraints](reports/Candidate_Validation.md)
- [Machine-readable validation](reports/Candidate_Validation.json)
- [Native DRC report](reports/Candidate_DRC.json)
- [Placement changes](reports/Placement_Plan.json)
- [Front view](output/Compact_Front.svg) and [mirrored back view](output/Compact_Back.svg)
- [Combined overview](output/Compact_Placement.svg)
- [Provisional mezzanine contacts](Mezzanine_Contact_Proposal.csv)

The ZIP is a portable copy of this project. Extract the complete folder before opening it so the relative footprint-library paths resolve. The separate most-routed core and rail-revision designs remain unchanged.
