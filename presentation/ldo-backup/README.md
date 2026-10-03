# Small cabled routing-board review · C2

[Open small-board 3D](index.html?view=routing) · [Connection to Gerald's LDO](index.html?view=connection) · [Functional diagram](connection.svg) · [Source facts](provenance.json).

The current instruction is **XEM8305 through cable ↔ small routing board ↔ existing Gerald LDO J1/J19**. C1/R4 direct-mate studies are historical and unselected. This web preview is a geometric concept; it does not publish a new electrically routed PCB.

The proposed **18 × 25 mm** preview rectangle encloses the two source connector centres. Howard's size reference is the previously shared SpikeGadgets LLC Rev.2.5 board. The photo inventory provides no authoritative width or height, so this rectangle is **not a measured SpikeGadgets outline**. The illustrative board thickness is also unselected.

Gerald's audited October 2 native PCB supplies an 18.300 × 42.025 mm bounding envelope and J1/J19/J2 centres. The representation uses simplified board boxes and centre markers, with component bodies omitted. The LDO geometry is registered by x'=x−52.30, y'=84.20−y. Both J1/J19 centres coincide; the ASIC J2 centre lies outside the small rectangle. Registration does not prove mating, contact continuity, stack height or clearance.

The existing LDO contains nine LT3042 regulators. J1 has 23 ASIC signals, 3V3 on contacts 1/2 and DGND on 49/50; source VCC contacts 47/48 are isolated. J19 is a PCB-only, netless footprint with custom numbering. The new routing board's regulator/power responsibilities and cable supply/return arrangement remain unresolved. No cable contact mapping or regulator footprint has been assigned.

Before electrical CAD can proceed, identify the selected cable and both endpoint connectors with a numbered wire/return map. Before exact size matching, obtain the SpikeGadgets PCB width × height. Verify the installed LDO connector parts, mating height and J19 electrical roles.

The cable and exploded gap are illustrative. The dashed cable endpoint is not a selected footprint. Local host tools stalled during C2 preparation; **native C2 generation, ERC and DRC are not confirmed**. Earlier C1 checks do not validate this concept. Website packaging checks are reported by the associated repository check run.

Original native CAD, shared libraries, global settings and unrelated board projects remain unchanged by this website update. No fabrication files, order or hardware operation is included.
