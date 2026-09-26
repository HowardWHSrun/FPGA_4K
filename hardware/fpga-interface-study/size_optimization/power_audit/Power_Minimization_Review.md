# Power placement and the circled open areas

26 September 2026. Read-only inspection of the current 40 × 36 mm core PCB and the rail-revision PCB. No CAD was edited and no new DRC, routing, or thermal qualification is claimed. Coordinates are physical PCB coordinates, in millimetres, with the upper-left board corner at (0, 0). The displayed back view is mirrored.

**There is useful space to repack, but it is not an outline-trimming opportunity with the existing placement unchanged.** The two front openings can accept power circuitry after the nearby resistor rows are moved. The long blank strip on the right of the mirrored back image is physically the left side of the board, directly behind the three front-side converters. That strip is therefore not empty through the board. A smaller full-system board must also fit the two mezzanine connectors and their signal escapes; neither is present in the core PCB shown in the user's screenshot.

## Exact existing groups

These are native courtyard bounds including their outlines, measured on both current PCB files. The rail revision has identical component placement for these groups, although the rail names/circuit decisions differ. The group should move or rotate as a unit. The measurements supersede the older idealized `compact_power_motifs.json`: subsequent input-capacitor placement changes made most current groups 9.31 mm wide instead of the earlier 8.86 mm.

| Group | References that must be considered together | Current envelope x / y | Size |
|---|---|---|---|
| U2 core converter | U2, L1, C3–C6, R1, R2, R9, R10 | x29.720–39.030; y14.345–27.755 | 9.31 × 13.41 mm |
| U3 auxiliary converter | U3, L2, C7–C10, R3, R4, R11 | x1.220–10.530; y24.060–35.040 | 9.31 × 10.98 mm |
| U4 configuration converter | U4, L3, C11–C14, R5, R6, R12 | x1.220–10.530; y12.810–23.790 | 9.31 × 10.98 mm |
| U5 ASIC-bank converter | U5, L4, C15–C18, R7, R8 | x1.220–10.230; y0.810–11.790 | 9.01 × 10.98 mm |

| Role | U2 | U3 | U4 | U5 |
|---|---|---|---|---|
| Local input 10 µF / bypass | C3 / C4 | C7 / C8 | C11 / C12 | C15 / C16 |
| Switch node / inductor | SW_CORE / L1 | SW_AUX / L2 | SW_CFG / L3 | SW_ASIC / L4 |
| Local output capacitor | C5 | C9 | C13 | C17 |
| Feedback divider | R1 / R2 | R3 / R4 | R5 / R6 | R7 / R8 |
| Soft start | C6 | C10 | C14 | C18 |
| Power-good pullup | R10 | R11 | R12 | shared PGOOD_IO |

R9 separates `VCORE_REG_1V025` from `VCCINT_1V0`. The converter output capacitor and feedback pickup belong upstream of R9; FPGA core/BRAM decoupling belongs downstream. Moving the group must preserve that circuit topology. C1/C2 are input-entry capacitors, not substitutes for any converter's local input capacitor.

## What fits in the marked spaces

| Region in the screenshot | Measured opportunity | Consequence |
|---|---|---|
| Front top, between the left converter and J4 | Above the existing resistor row, usable depth is about 7.06 mm with a 0.5 mm edge allowance. Rotated existing modules need at least 9.01 mm. | A whole existing module does not fit without moving the top resistor row or other circuitry. |
| Front bottom | Below the lower resistor row, usable depth is about 6.21 mm with the same allowance. | A whole existing module does not fit unchanged. Small resistors can move into this area, allowing larger blocks to move elsewhere. |
| Mirrored back right | Physical x≈0–9 mm. Mostly free of backside parts, but directly behind U3/U4/U5 and crossed by vias/copper. | Potential backside placement area; not removable PCB area. Moving only one converter there does not remove the other two front-side edge constraints. |
| Mirrored back lower left | Physical lower-right corner. | Potential destination for the oscillator cluster, but clock routing and future mezzanine placement must be checked. |

**Concrete core-only packing direction:** rotating U2's complete group by −90° from its current placement gives a 13.41 × 9.31 mm envelope. An envelope at **x10.600–24.010, y0.500–9.810** (U2 centre **15.155, 4.405**, new IC angle 0°) clears the current U5 and U1 courtyards after moving **R116, R112, R109, R113 and R117** out of the top band. Those five resistors could be studied as a second front-bottom row. This removes the large right-side converter block without a BOM change. J4, C1/C2 and the backside Y1/R119/C102/C103 cluster would then be the remaining right-edge placement obstacles. Their move would require rerouting; this is not a routed or DRC-approved candidate.

**This top-band proposal is not a smaller full-system solution:** the current mezzanine study places **J5 in the top band and J6 in the bottom band**. It therefore competes directly with the connectors required for all 117 ASIC signals. It must not be promoted as a new board size unless a combined placement moves the connectors or power blocks elsewhere, preserves mating clearances and demonstrates their routing space. No manufacturing-ready size is established by this power-only review.

## Copper that cannot be left behind

The core PCB now has real local converter routes. The old `Power_Layout_Readiness.md` describes an earlier zero-power-copper snapshot and is not evidence that today's converters can simply be dragged into open space.

| Exclusive local nets | Current track/via objects in the core PCB |
|---|---:|
| U2: FB_CORE, SS_CORE, SW_CORE, VCORE_REG_1V025 | 21 |
| U3: FB_AUX, SS_AUX, SW_AUX, VCCAUX_1V8 | 19 |
| U4: FB_CFG, SS_CFG, SW_CFG, VCC_CFG_3V3 | 19 |
| U5: FB_ASIC, SS_ASIC, SW_ASIC, VCC_ASIC_1V5 | 19 |

These 78 objects are local-net inventory, not a count of every object needing a move. Shared LINK_12V distribution has 50 objects, and the two sequencing nets PG_CORE/PG_AUX have nine each. Ground has 622 objects across the board, plus filled zones; only the appropriate local objects should move. A rigid transform can preserve a group's internal routes if all attached vias/copper are included and clear of the destination. External power, ground, sequencing, and FPGA connections then need deliberate reconnection. Moving a whole group to the back additionally needs a layer/mirror transform and a new via/plane review. The rail revision has no routes on these converter-local nets, so it has less power copper to preserve, but it still is not a completed system.

## Layout constraints to retain while repacking

TI's layout guidance requires local input capacitance at VIN/GND, short wide switched-current paths, output sensing at the output capacitor, and short feedback/soft-start connections kept away from SW. EN/MODE ties to VIN originate at the input capacitor. The package dissipates heat through its pins; thermal vias and connected copper must remain available. Reducing outline area cannot remove those paths merely because a component courtyard fits. [TPS62135 datasheet, §§12.1–12.3, pp.36–37](https://www.ti.com/lit/ds/symlink/tps62135.pdf#page=36).

For this board specifically, keep each L/C/IC group local and keep the switch connection out from under FPGA signal escapes. Preserve the short VOS route to C5/C9/C13/C17, the R9 rail separation, and a usable ground-reference region. A backside converter beneath another converter needs a combined thermal and return-path assessment; the screenshot cannot establish that it is thermally acceptable. The current four-rail circuit provides no basis for deleting a regulator or its required capacitors merely to save area.

## Reproducible readback

- [Native geometry, footprint pads and track inventory](power_geometry.json)
- Read-only inspection script `inspect_power.py` (retained in the local engineering evidence)
- Core PCB SHA-256: `3844c24f88697bec091e872c117a7889586df9be4053b912ec79253738d337c0`
- Rail revision PCB SHA-256: `c71578d3e72d22d84c3cf635c6935c736940c9ae5b3f8de2a5dd404a9f00a547`

The script never calls SaveBoard. KiCad emitted nonfatal initialization/duplicate-image-handler messages, recorded in `native_readback_stderr.txt`; both native files loaded, the report was produced, and their hashes remain the expected values. No dimensions here constitute a thermal clearance, route-width prescription, or approved fabrication rule.
