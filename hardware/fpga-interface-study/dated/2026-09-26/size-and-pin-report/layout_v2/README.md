# FPGA100T — smaller placement, 26 September 2026

**33 × 36 mm; all 128 parts retained; 12% less board area than 37.5 × 36 mm.** This is a placement study: 0 tracks, 0 vias, 0 zones. Native DRC finds 0 physical violations and 383 unconnected items. It is not ready for fabrication.

Open [the KiCad project](hardware/FPGA100T_33x36_Placement.kicad_pro) from the extracted complete folder. Its PCB, saved design rules and local footprint libraries are included. Standard KiCad 10 3D-model paths are retained; optional 3D rendering depends on the corresponding standard model installation. No integrated schematic exists.

- [Front/back figure](output/Compact_Placement.png)
- [Measured validation and constraints](reports/Candidate_Validation.md)
- [Native DRC](reports/Candidate_DRC.json)
- [Mechanical measures](reports/Mechanical_Measures.json)
- [Portable ZIP](FPGA100T_33x36_Placement.zip)

The 33 mm dimension is the board outline. J4's drawn body overhang makes the visible board-plus-body width about 33.65 mm; insertion and mating-board clearances are not established. The full routing and electrical design remain open. Earlier 34 × 36 mm files are kept as a separate revision.
