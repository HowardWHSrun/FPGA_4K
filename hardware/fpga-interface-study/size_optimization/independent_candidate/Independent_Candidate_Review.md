# Independent review of the smaller placement study

26 September 2026. This review checks component preservation and physical placement only. It does not qualify power, signal routing, thermal behavior, assembly yield, or the complete ASIC-to-XEM8310 system.

**The 37.5 × 36 mm candidate retains the 128 components from the 40 × 36 mm mezzanine study and uses both PCB faces more fully.** Its outline area is 1,350 mm², a reduction of 90 mm², or **6.25%**. The tightest courtyard gap is **0.030 mm** and the nearest locating-hole-to-opposite-courtyard gap is **0.225 mm**. These geometry checks do not establish an assembly allowance. This is a tested placement candidate, not a proven global minimum or a routed board. Its source is the mezzanine fit study, which already had no tracks or zones; it is not a compacted copy of the partially routed core PCB.

## What was checked independently

A separate process loaded both native PCB files directly, without saving either one. It compared every component and pad against the source and the declared placement transforms. There were **3,198 passing assertions** and no inventory, transform, or envelope-screen failures.

| Check | Result |
|---|---|
| Component references, values, library IDs and UUIDs | All 128 retained |
| All native pad records, including paste apertures and mechanical holes | All 807 retained |
| Numbered pad records | 767 retained; 647 have a net name |
| Moved footprints | 28; all other footprint positions retained |
| Final component distribution | 39 front, 89 back |
| Pad numbers, nets, sizes, drill dimensions, shape and attribute | Preserved for every pad |
| Mirrored positions and front/back layer sets | Match the declared transform for every pad |
| Fabrication/courtyard geometry | All 128 envelopes match their translated/reflected originals |
| Same-face component courtyards | No bounding-rectangle overlap |
| Through-hole pad envelopes against opposite-face component courtyards | No overlap |
| Tracks, vias and copper zones | Zero; the candidate remains unrouted |

The test compares pad UUIDs individually, so duplicate shell-pad names and unnamed mechanical features are not collapsed into one record. Numeric coordinate tolerance for preservation was **0.000002 mm** (2 nm), solely to accommodate serialization arithmetic; this is not a manufacturing tolerance.

## Both power groups stay together

The **U2 core group** (U2, L1, C3–C6, R1, R2, R9, R10) moves from front to back with `x′ = 39.5 − x`, `y′ = y − 2.0`. The **U5 ASIC-bank group** (U5, L4, C15–C18, R7, R8) moves from front to back with `x′ = 10.6 − x`, `y′ = y − 0.3`. Every member and every pad follows its group's identical rigid transform. The inductor/IC/capacitor relationships and R9 rail separation are preserved as placed; no electrical routes exist in this source to preserve.

This uses the blank backside strip highlighted by the user. The two required mezzanine connectors remain present. The oscillator cluster and C82 move to the front, allowing the right edge to move inward. The connector placement and both board faces were checked together, rather than inferring a complete-board size from the core-only screenshot.

## Tight margins that remain

| Measured candidate feature | Clearance / extent | Meaning |
|---|---:|---|
| Smallest same-face courtyard gap | 0.030 mm, J5 to R109 | Disjoint CAD courtyards; additional assembly allowance has not been qualified. |
| Closest through-hole pad envelope to an opposite-face courtyard | 0.225 mm, J5 locating hole to L4 | The backside inductor avoids the locating hole in the checked geometry. |
| Minimum copper-to-edge distance | 0.500 mm, J6 signal pads | Exactly the saved design-rule threshold; fabricator routing tolerance is not established by this equality. |
| J4 front body extent | x38.150 mm on a 37.500 mm outline | 0.650 mm body overhang. Mating plug/enclosure clearance still requires qualification. |
| J4 courtyard extent | x38.625 mm | Courtyard overhang is deliberate connector clearance, not hidden PCB area. |

All eight through-hole features were included: four J4 shell slots and two locating holes on each of J5/J6. Same-side and opposite-side checks use native pad/courtyard rectangles. They are conservative placement screens, not a three-dimensional mating or component-height check.

## Native DRC and rule scope

The saved candidate **design settings are identical to the source**. There are no DRC exclusions, no rules set to ignore, and no candidate custom-rule file. The saved minimum copper clearance is 0.15 mm; minimum copper-to-edge is 0.50 mm; maximum geometry approximation error is 0.005 mm. Courtyard, PTH-in-courtyard, NPTH-in-courtyard, copper-edge and unconnected-item checks remain enabled. A DRC result must still report the unconnected items separately from physical violations.

The final native DRC reports **zero physical violations and 383 unconnected items**, with error, warning and exclusion severities included and no ignored checks. This is not a globally error-free board. Schematic parity was **not** checked: no integrated schematic exists for this candidate. The first run found an existing board text label crossing the new right edge; the builder moved that label left by 1.25 mm. This independent review then loaded the final saved PCB again and repeated all 3,198 assertions successfully.

## What this candidate does not resolve

The saved PCB still uses the mezzanine study's earlier **3.3 V configuration/flash/oscillator circuit**. It has not absorbed the separate rail revision's 1.8 V configuration changes. **C92 and R122 are absent**. The local protection functions and the protected external source/cable hardware are not added or qualified here. J5/J6's 120 numbered signal contacts still have no net assignments; the 117-signal proposal has not become an integrated schematic or FPGA ball allocation.

No component has been deleted to get this area reduction. That does not mean every necessary final-system component is already present. Final power revisions, protection, connector mating, thermal copper, BGA escape, the full 117-signal routing, receiver link and firmware can change the achievable outline. Source preservation plus a clean physical DRC is therefore a limited geometry result, not an electrical or fabrication release.

## Evidence

- [Combined independent preservation, geometry, DRC-rule and source-hash evidence](Independent_Candidate_Review.json)
- Source PCB SHA-256: `186018ad28d31eb3d8fee4193a32731632a9bf9cab2c4652414a9bad40169750`
- Final candidate PCB SHA-256: `2487779b7b0b612c0452388cd41be21a51cf6b1594e8a389b0c38f23de733865`

The source core and rail-revision PCB files were also rehashed against their pre-review identities. All three original PCB files remain unchanged. Inspection scripts in this folder perform read-only checks; they do not call SaveBoard.
