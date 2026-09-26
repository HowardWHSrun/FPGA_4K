# Connector constraints for the circled-space review

26 September 2026. Read-only geometry review of the unchanged 40 × 36 mm core and mezzanine placement study. This report does not change the KiCad design, prove complete routability, or identify a global minimum board size.

## What the screenshot leaves out

The screenshot shows the **126-component core**, without the two 60-contact ASIC connectors. In the separate 128-component mezzanine placement study, **J5 fills the circled front-top space and J6 fills the circled front-bottom space**. Both are required by the current two-connector interface proposal. There are 120 numbered contacts, allocated provisionally to 117 signals and three spares; the ground-blade lands are additional contacts. The contact map is not a finished FPGA pin allocation, and the 117 signals are not routed.

The back image is mirrored. Its large empty right-hand strip is the physical board's **left-hand strip**, behind the three front regulator islands. The existing front regulator courtyards occupy x = 1.22–10.53 mm, spread almost across the full board height. This is an opportunity to move and repack parts between sides; it cannot be removed by cropping only the back view. The drawing's other back-side circle likewise must be compared with front-side parts and through holes at the same physical coordinates.

## Readback of the saved placement

All coordinates below use the unmirrored board coordinate system, with its top-left corner at (0, 0). Dimensions include the 0.05 mm courtyard-line stroke; this is why they are 0.05 mm larger than the courtyard centerline dimensions.

| Part | Center / rotation | Courtyard extents x | Courtyard extents y | Size including stroke |
| --- | --- | --- | --- | --- |
| U1 FPGA | (20.0, 18.5), 0° | 11.475–28.525 | 9.975–27.025 | 17.05 × 17.05 mm |
| J5 QSH | (20.8, 4.5), 0° | 9.870–31.730 | 0.225–8.775 | 21.86 × 8.55 mm |
| J6 QSH | (21.5, 31.5), 0° | 10.570–32.430 | 27.225–35.775 | 21.86 × 8.55 mm |
| J4 micro-HDMI footprint | (37.6, 6.0), 90° | 31.875–40.525 | 1.575–10.425 | 8.65 × 8.85 mm |

The current top QSH-to-FPGA courtyard gap is 1.20 mm, and the bottom gap is only 0.20 mm. QSH top/bottom courtyard edge margins are each 0.225 mm. A connector ground plane and trace escape still have to be routed through this arrangement.

J5's alignment holes are at (10.735, 1.830) and (30.865, 1.830) mm; J6's are at (11.435, 28.830) and (31.565, 28.830) mm. All four are Ø1.02 mm NPTH. They constrain both board sides. The prior placement review measured only 0.265 mm from J6's left hole edge to the nearest back-side courtyard. Repacking must recompute those distances rather than checking only same-side component overlap.

The two connectors have a relative center transform of **(+0.7, +27.0) mm**. Moving or rotating them is possible during design, but requires matching changes to the routing board's connector positions and contact orientation.

## Candidate arrangements to test

These are simple non-overlapping rectangle calculations for **U1 + J5 + J6 only**. They deliberately exclude J4, every regulator, every decoupling capacitor, routing, holes outside these envelopes, protection, assembly access and mechanical retention. The assumed 0.20 mm separation between courtyard strokes and 0.50 mm courtyard-to-board margin are screening choices, not accepted manufacturing rules.

| Arrangement | Geometric rectangle for those three parts | Consequence |
| --- | --- | --- |
| Existing horizontal top/FPGA/bottom sandwich | 22.86 × 35.55 mm | Reducing board width is the more plausible first move. Very little height remains to remove with this arrangement. |
| Entire sandwich turned 90° | 35.55 × 22.86 mm | Trades width for height; it does not improve the three-part area. |
| One QSH above, the other vertical at the FPGA's right | 26.80 × 31.61 mm | Worth testing for a squarer 32–34 mm design, but J4, power and decoupling are still absent from this arithmetic. |
| Both connectors moved to the back | No complete-board dimension established | Can overlap the FPGA in projection, but displaces dense back-side decoupling/flash and changes the mating assembly. This needs a new placement and routing review. |

For the horizontal sandwich, the height calculation is `8.55 + 0.20 + 17.05 + 0.20 + 8.55 + 2×0.50 = 35.55 mm`. Thus a claim that the **unchanged same-face arrangement** fits in 32 mm height would contradict its saved courtyards. It may become possible only by changing the arrangement, side, connector choice or independently reviewed clearance assumptions.

For the perpendicular example, put the FPGA's courtyard at (0.50, 9.25), the horizontal QSH at (0.50, 0.50), and the vertical QSH at (17.75, 9.25), using top-left courtyard coordinates. The bounding box plus the far-edge margin is 26.80 × 31.61 mm. These coordinates are an illustrative packing construction, **not a proposed final connector center map**.

## Manufacturer and assembly constraints

Samtec's revision-M QSH drawing specifies a **21.31 × 7.24 mm assembly envelope** for the -030/-A option and identifies it as a keepout for other components. The custom library uses a larger 21.81 × 8.50 mm courtyard centerline around the body and lands. Its pad-row/hole dimension-chain discrepancy of 0.02645 mm remains unresolved; shrinking the courtyard does not resolve that discrepancy. [QSH footprint drawing](https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xx-footprint.pdf).

The nominal -01/-01 QSH/QTH stack is **5.03 mm** fully mated, with up to 0.178 mm additional separation in the manufacturer's drawing. This is not an allowance to place arbitrary parts beneath the mating routing board. Connector bodies, both boards' component heights, solder tolerances and retention must be checked in one assembled coordinate system. QTH has a different land pattern and pin-row orientation; the routing board must not reuse the QSH footprint. [Mated drawing](https://suddendocs.samtec.com/prints/qxh%20mated%20document-mkt.pdf), [QTH footprint drawing](https://suddendocs.samtec.com/prints/qth-xxx-xx-x-d-xxx-footprint.pdf).

J4 has an existing placement discrepancy: its suggested edge datum is x = 39.30 mm while the board edge is x = 40.00 mm. An outward translation alone was previously measured to leave only 0.425 mm shell-copper edge clearance against the project's 0.50 mm rule. Exact receptacle and plug selection, their mechanical drawing, and this edge conflict must be resolved in any smaller candidate. J4's protruding courtyard must not be used as evidence that every other courtyard may cross the edge.

## Recommended next layout comparison

1. Start with the concrete **37.5 × 36 mm placement screen** below. It retains both mezzanines and all 128 existing components. A later 34 × 36 mm comparison would require further work; it is a target to test, not a verified fit in this report.
2. Compare an orthogonal-connector candidate around **32–34 mm square** under the same rules and component inventory. Its value is changing the height constraint, not merely making the render look denser.
3. Include C92/R122 and required input protection in the inventory used to judge final size; neither the core nor the connector-fit file currently contains the entire intended full-system design.
4. Select a smaller outline only after native placement/DRC readback, opposite-face hole checks, full copper routing and a matched routing-board assembly review. Track removal or relocation during a placement study must be reported explicitly.

The reusable geometry and source hashes are in [Connector_Size_Constraints.json](Connector_Size_Constraints.json). The baseline sources remain unchanged.

## Bounded 37.5 × 36 mm placement screen

A subsequent bounded search found a **1,350 mm² candidate**, 6.25% below the current 1,440 mm² outline. It retains all **128** existing footprints, including both QSH connectors; it changes 28 part placements/sides. All coordinates were taken from the actual mezzanine study, including its taller 14.81 mm core-power group, rather than the earlier core layout.

| Rigid group / part | Transformation of baseline physical coordinates | New side |
| --- | --- | --- |
| Eight-part ASIC-bank regulator group | x′ = 10.60 − x; y′ = y − 0.30 | Back |
| Ten-part core regulator group | x′ = 39.50 − x; y′ = y − 2.00 | Back |
| Four-part reference-clock group | x′ = 71.25 − x; y′ = y | Front |
| C82 bulk capacitor | x′ = 44.00 − x; y′ = y | Front |
| J4 | x′ = x − 1.90; y unchanged | Front |
| J5 | x′ = x − 2.10; y unchanged | Front |
| C1 | x′ = x − 2.05; y unchanged | Front |
| R110, R111 | x′ = x − 1.00; y unchanged | Front |

U1, J6, the other two regulator groups and all remaining parts keep their baseline placement. The rigid mirror moves preserve each moved group's relative component and pad geometry. The candidate has 39 front-side and 89 back-side parts. This is useful evidence that some of the back-side empty space can shrink the outline without deleting support components.

The [compact placement plan](Placement_37p5x36_Plan.json) lists every changed part's new absolute position and transform. The [full geometric screen](Placement_37p5x36_Screen.json) retains the transformed courtyard and pad geometry, and `search_placement.py` (retained in the local engineering evidence) reproduces the bounded search without editing CAD. The mirrored transform, **not the retained source-angle field**, defines the intended pad geometry; a native builder must verify KiCad's flip-axis/rotation convention by comparing pad-number coordinates after transformation.

The screen found **zero same-side courtyard or opposite-side through-pad/courtyard intersections**. Moved groups were tested using a 0.01 mm courtyard separation and a 0.05 mm margin around opposite-side through-pad bounding boxes. Courtyards other than J4 remain at least 0.225 mm inside the outline, matching the baseline's tight mezzanine edge margin. These screening choices are not assembler acceptance. The unchanged internal group clearances were retained.

J4's current suggested-edge discrepancy falls from 0.70 mm to **0.10 mm inward**, with approximately **0.525 mm** shell-copper clearance at the proposed right edge, calculated from the footprint. The discrepancy is reduced, not resolved. The new J5-to-J6 center transform is (+2.8, +27.0) mm and must be implemented on the mating routing board if this candidate is adopted. Through-hole lands and the four QSH alignment holes were included as opposite-face obstacles.

This is an input to native KiCad placement and DRC verification, **not a routed board or fabrication release**. C92/R122, input protection and the complete 117-signal/receiver implementation are still absent from this source inventory. The regulators need new copper and return paths on their new sides; their preserved placement geometry alone does not establish electrical or thermal performance. No claim is made that 37.5 × 36 mm is the smallest feasible complete design.
