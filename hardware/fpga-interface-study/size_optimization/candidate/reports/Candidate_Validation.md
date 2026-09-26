# Native validation — 37.5 × 36 mm candidate

26 September 2026. **Placement-only; fabrication readiness is false.**

The candidate reduces board area from 1,440 to **1,350 mm²**, a **6.25% reduction**, while retaining the source connector-fit study's entire 128-part inventory. It has both QSH-030-01-L-D-A connectors and the existing micro-HDMI footprint. The original core and connector-fit files were not edited.

| Check | Result |
| --- | --- |
| Native Edge.Cuts dimensions | 37.5 × 36.0 mm |
| Parts | 128: 39 front, 89 back |
| FPGA | 324 pads; 15 × 15 mm package |
| All native pad records | 807; every pad number, net name and UUID retained |
| Net-name count | 265 distinct names including the empty/unassigned entry |
| Copper layers | Six, as in the source project |
| Copper implementation | 0 tracks, 0 vias, 0 zones |
| Fresh-process geometry readback | All 807 pad records and all courtyards match the prescribed transformation; maximum numeric coordinate difference is 0.000001 mm |
| Native DRC, all severities | **0 physical violations; 383 unconnected items** |
| Schematic parity | Not run: this placement study has no integrated schematic |
| Project design rules | Source design rules retained; project filename metadata updated |

The native PCB SHA-256 is `2487779b7b0b612c0452388cd41be21a51cf6b1594e8a389b0c38f23de733865`. The source connector-fit PCB SHA-256 is `186018ad28d31eb3d8fee4193a32731632a9bf9cab2c4652414a9bad40169750`. [Structured result](Candidate_Validation.json), [native DRC](Candidate_DRC.json), [native geometry](Geometry.json).

## What moved

The eight-part ASIC-bank regulator and ten-part core regulator groups move to the sparse back-left area using rigid reflections and translations. Their relative component/pad positions remain intact. The four-part clock group and C82 move to the front. J4, J5, C1, R110 and R111 shift inward. U1, J6 and the remaining parts keep their prior positions. In total, 28 component placements/sides change. [Exact placement plan](Placement_Plan.json).

The first DRC pass found one silkscreen warning: the existing board text `CUSTOM / NOT HDMI` clipped the narrowed edge. Moving only that board-level label 1.25 mm left cleared the warning. Fresh readback and DRC were then repeated. No footprints, copper or nets were removed to obtain the result.

## What still prevents release

- The 383 missing assigned-net connections remain, and the 117 application signals are still unassigned. A clean physical placement check does not measure full-board completion.
- The separate rail revision's C92/R122 and required input protection are absent from this source inventory. One complete system still has to be integrated and routed.
- Moving regulators to the opposite face requires new copper, vias, return paths and thermal verification. Preserved local placement does not prove power integrity.
- The J5-to-J6 mating-center transform becomes **(+2.8, +27.0) mm**. The routing-board connectors must match the chosen arrangement and contact orientation.
- J4's suggested-edge datum remains **0.10 mm inward** from the new right edge. Its shell-copper clearance is approximately 0.525 mm. Exact connector/plug selection, insertion access and assembly tolerances remain unqualified.
- The narrowest mezzanine courtyard edge margin remains **0.225 mm**. This is a geometric result, not assembler approval.
- The QSH footprint dimension-chain discrepancy, actual mating-board/part heights, retention, manufacturer stackup and electrical/firmware acceptance remain open.

This is one smaller, independently checkable placement candidate. It is not proof of the smallest possible complete board, and it must not be submitted as a manufacturing release.
