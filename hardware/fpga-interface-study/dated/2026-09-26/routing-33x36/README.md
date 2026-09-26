# Current 33 × 36 mm FPGA routing development

26 September 2026. Open [the complete native KiCad project](hardware/FPGA100T_33x36_Routing.kicad_pro) with this folder intact. This is the current smallest design: 130 physical parts, both mezzanines, 1.8 V configuration and 2.5 V bank 16. Earlier variants remain historical references.

[Current routing review](reports/Routing_Review.md) · [Measured snapshot](reports/Routing_Snapshot.json) · [Native DRC](reports/Native_DRC.json) · [Native ERC](reports/Native_ERC.json) · [All component pins](reports/All_Pin_Connections.csv) · [Component list](reports/Component_List.csv) · [Net endpoints](reports/Net_Endpoints.csv) · [21-sheet native schematic](output/FPGA100T_33x36_Routing_Schematic.pdf) · [Front/back view](output/FPGA100T_33x36_Routing.svg).

Saved board SHA-256: `ae601df3925e5ec5e90c8a2e747356e432d0558e820199cf7c01c6bf8a7fef96`. The frozen source reports 1139 track segments, 164 vias and 4 zones, with 146 unconnected items on assigned nets. Those counts exclude unassigned application signals. Native physical DRC and schematic parity are both zero. This is not electrical or manufacturing qualification.

The 117 ASIC signals and eight custom-link data contacts remain unassigned. All 120 numbered mezzanine contacts are open. The matching 21-page native schematic, local symbols/footprints and existing-clock XDC are included. ASIC pad limits/timing, power entry and cable, the receiver, full firmware, SI/PI/thermal and fabrication/assembly review remain unfinished. The earlier 31-page LaTeX report describes the 128-component placement-only snapshot and is not this revision's connectivity report.

[Current component and pin report (LaTeX PDF)](report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) · [Portable editable report source](report/FPGA100T_33x36_Routing_Report_Source.zip) · [Report coverage](report/Report_Coverage.json). This report describes the current 130-component board.

Library provenance: cached KiCad assets retain their original source fields and KiCad library licensing. Converter and connector footprints derive from the manufacturer documents identified in their properties. Missing standard 3D models do not prevent editing or establish mating clearance. Native CAD is copied byte-for-byte; evidence paths are made portable. Experimental candidate boards, scripts, editor state, lock files and caches are excluded. No manufacturing package is released.
