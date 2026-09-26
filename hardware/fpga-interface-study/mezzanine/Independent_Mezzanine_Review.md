# Independent two-mezzanine placement review

2026-09-26. **A valid placement study, not a completed or fabrication-qualified board.** Read-only native-file comparison and manufacturer-drawing review. No CAD changes or hardware tests were performed by this review.

Native board SHA-256: `186018ad28d31eb3d8fee4193a32731632a9bf9cab2c4652414a9bad40169750`. Local QSH footprint SHA-256: `3ef6bd78877855d6d0f5de32395f8b6c01367e6839d2f04881ff9fe96d1e0953`.

## Native readback

- 128 components = all 126 source components plus J5/J6. All retained component pad-number/net pairs match the recorded source. C3/C7/C11/C15 retain the corrected MSAST31LBB5226MTNA01 capacitor MPNs.
- The board has **zero tracks, vias and copper zones**. Every one of the new 120 signal pads is unassigned. The four ground-blade lands on each connector are assigned GND but are unrouted.
- Saved native DRC reports 0 physical violations and 383 unconnected items. No corresponding full-system schematic exists in this study, so empty parity-result fields are not a schematic-parity validation.
- Both connector courtyards fit inside the 40 × 36 mm outline. Nearest edge margin is 0.225 mm including courtyard stroke. This margin is not a manufacturing tolerance allowance or a guarantee of edge-component assembly access.
- J5 center is (20.8, 4.5) mm; J6 is (21.5, 31.5) mm; both rotations are 0°. Their intentional relative offset is **(+0.7, +27.0) mm**. The mating routing board must preserve that transform; do not center both mating connectors on one x coordinate.
- The four new NPTH holes do not intersect any back-side courtyard bounding box. Minimum hole-edge-to-back-courtyard distance is **0.265 mm**, J6 left hole to C71. Other minima: J5 left/R101 0.310 mm; J5 right/C21 4.714 mm; J6 right/C63 0.845 mm. These are geometric checks, not 3D body/tolerance verification.
- Contact CSV has 120 unique numbered connector contacts plus two ground-blade records. Exactly 117 unique accepted signal names appear once, with three reserved contacts. All FPGA balls remain TBD. AC_IN and IMP_TST retain unresolved electrical roles.

The machine-readable [review result](Independent_Mezzanine_Review.json) contains the checks and native geometry.

## QSH footprint against manufacturer drawing

Compared directly with [Samtec QSH PCB layout, revision M, sheet 1](https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xx-footprint.pdf), including the -030 and -A table entries. Drawing landmarks were read visually; no dimensions were inferred from image scaling.

| Feature | Native footprint | Result |
|---|---|---|
| Signal pads | 60, odd row at +2.865 mm; even row at −2.865 mm | Matches numbered-row orientation |
| Pitch / signal land | 0.5001 mm / 0.279 × 2.27 mm | Matches drawing labels |
| Ground blade | Four lands: outer 2.54 × 0.43 mm, inner 4.70 × 0.43 mm | Matches one-bank pattern |
| Blade centers | x = ±8.065 and ±3.175 mm | Matches 16.13 / 6.35 mm separations |
| Alignment holes | Ø1.02 mm NPTH at x = ±10.065, y = −2.67 mm | Matches -A diameter and B = 20.13 mm |
| Assembly envelope | 21.31 × 7.24 mm | Matches -030 envelope |
| Courtyard | 21.81 × 8.5 mm | Project choice: 0.25 mm per side around the widest body/land extent; not a Samtec-specified courtyard |

**One dimension-chain discrepancy remains:** the -030 table lists H = 2.84 mm. The centered pad row in the native footprint yields `(20.13 − 29 × 0.5001) / 2 = 2.81355 mm`, a **0.02645 mm difference**. The 29-pitch bank span also agrees with the drawing's nominal 14.504 mm to rounding. Those dimensions cannot all be satisfied exactly by the current centered construction. This small mismatch is recorded for reconciliation with Samtec's exact -030 CAD/manufacturing tolerance before release; the review did not silently change pad positions or declare the footprint approved.

## Mating height and pin orientation

[Samtec’s QSH page](https://www.samtec.com/products/qsh-030-01-l-d-a) lists QTH-030-01-L-D-A as a mating product. The [QTH part page](https://www.samtec.com/products/qth-030-01-l-d-a) uses the nominal 5 mm designation. The [QXH mated drawing, revision C, sheet 1, tables 1–2](https://suddendocs.samtec.com/prints/qxh%20mated%20document-mkt.pdf) specifies **5.03 mm fully mated board spacing for -01/-01**, with a maximum board separation 0.178 mm above that value. Full mating is recommended. Do not use exactly 5.000 mm as a proven enclosure clearance.

The [QTH footprint, revision M, sheet 1](https://suddendocs.samtec.com/prints/qth-xxx-xx-x-d-xxx-footprint.pdf) places contact 1 at the **upper left** and 2 at the **lower left** in its top-view PCB drawing. QSH's drawing has 2 upper left and 1 lower left. The QTH land sizes, row spacing, hole spacing and body also differ. **Do not reuse the QSH footprint for QTH or infer a board-to-board pin map by visual mirroring.** A routing-board QTH footprint and common assembled coordinate view must demonstrate named contact-to-contact continuity and both connector transforms. No mating-board CAD was supplied to this placement study, so that check remains open.

## Figure review and release limits

The original “core bulk moved” annotation crossed the back-board dimension rule; this was reported and the parent regenerated the figure with the callout in the free right margin. The figure is a placement view and does not show routed connections.

The added C92/R122 bank-rail revision, cable input damping/protection, final 117 application routing, receiver link copper, full assembly retention/3D clearance, fabrication stackup and SI/PI are outside this study. In particular, a zero physical DRC count does not prove that all routes and supply components can be implemented within the same outline. The current 40 × 36 mm result should be published as a promising connector-inclusive **placement candidate**, not the final complete-board size or a manufacturing release.
