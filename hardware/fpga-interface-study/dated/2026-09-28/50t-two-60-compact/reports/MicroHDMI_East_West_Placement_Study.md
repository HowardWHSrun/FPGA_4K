# Micro-HDMI placement comparison — no routing

The checked Step09 review board is **38.5 × 43 mm**, with J4 on the east edge at 90°. Its eight selected FPGA GTP data balls have straight-line distances of **17.57–19.60 mm** to their assigned J4 contacts, **18.52 mm mean**. Those are geometrical lower bounds, not routed pair lengths.

An independent copy of the Step09 project at `validation/west_edge_trial/project/` moved only J4 to the west edge at `(6.2, 24.5) mm`, rotation 270°. This makes the eight straight-line distances **7.32–12.12 mm**, **9.24 mm mean**, but native KiCad DRC reports **81 physical findings**: 26 shorts, 24 solder-mask bridges, 9 keepout breaches, 7 through-hole pads inside other courtyards, 6 clearance errors, 6 courtyard overlaps and 3 silk-to-copper warnings. The trial is intentionally invalid because the existing left-side regulator cluster and other parts were not moved. It is **not** the active project.

The west candidate would require a separate power-stage placement redesign, then renewed buck hot-loop, heat, connector-mechanical, differential-pair escape, and return-path checks. The current east placement has zero physical DRC findings but leaves GTP route feasibility unproven. Neither placement has tracks, vias or qualified impedance.

**Decision open:** choose whether to keep the smaller currently checked east fit for a first review, or spend another placement iteration on west J4 and compare area after moving the power circuits. The right choice requires the actual receiver/cable design and fabrication stackup.
