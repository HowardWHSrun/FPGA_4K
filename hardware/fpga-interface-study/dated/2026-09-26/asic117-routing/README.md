# Partial ASIC-routing checkpoint — not a manufacturing release

26 September 2026 · **33 × 36 mm · 129 components · 8 copper layers**.

The layer count describes this development CAD checkpoint. Manufacturer stackup, impedance and fabrication capability are not qualified. Power routing and validation remain FPGA design work; Howard's external inputs are ASIC specifications/startup/timing and the carrier supply/contact map.

Open [the KiCad project](hardware/FPGA100T_33x36_Routing.kicad_pro) with this complete folder intact. The 117 ASIC contacts comprise **116 candidate FPGA signals plus one external analog reservation**; **49 / 116 candidate FPGA nets have completed copper according to this DRC**. There are **179 assigned-net missing connections** and 98 unassigned endpoints. The A13 NC reserve is a subset of the unassigned endpoints, not an additional count. The six former NC ground pins are assigned GND; see the audit for physical continuity. R112 is removed in this checkpoint and U1.P13/M1 is directly tied to GND.

[Routing audit](reports/Routing_Review.md) · [All pins](reports/All_Pin_Connections.csv) · [Components](reports/Component_List.csv) · [Net endpoints](reports/Net_Endpoints.csv) · [21-sheet schematic PDF](output/FPGA100T_33x36_Routing_Schematic.pdf) · [Front/back PCB](output/FPGA100T_33x36_Routing.svg) · [Bringup facts needed](bringup/Bringup_Requirements.md).

Native physical DRC: 0; schematic parity: 0. ERC: 97 open pins, 4 other errors, 9 warnings. The other errors and warnings remain visible; [pin-model review](reports/Pin_Model_Review.md). Inspect the exact [DRC](reports/Native_DRC.json), [ERC](reports/Native_ERC.json), and [snapshot](reports/Routing_Snapshot.json).

The first target is FPGA power-up and finite ASIC capture through JTAG. Receiver integration can follow. ASIC electrical limits, connector mating, startup firmware, capture timing, power integrity, thermal behavior, and physical routing remain unfinished. AC_IN is analog 0–1.5 V: J5.46 is reserved for an external source and has no FPGA path. U1.A13 is NC. IMP_TST is provisionally digital 0/1.5 V; inactive polarity remains unverified. Capture assumes eight independent returned clocks sampled on falling edges and four outgoing board clocks. Startup order is SPI, digital/analog resets, then recording clock; exact waveforms remain to be implemented. No validated bitstream or fabrication package is included.

PCB, project, schematic and library contents are unchanged copies of the measured checkpoint. Library-table URIs and evidence metadata paths are made portable; referenced library contents are verified identical. Custom library provenance remains in its source fields. Standard 3D-model availability does not establish assembly or mating clearance. Editor state, lock files, experiments, private tool inventories and message drafts are excluded.

Board SHA-256: `c5a312d1224f90a454a1ee3275dc211f7994f1c69d441472131f55b363e7cd03`. Earlier learning PDFs describe earlier snapshots and are kept outside this current package.
