# Third independent CAD review — 26 September 2026

**Fourth-pass erratum:** The historical JSON pad-match flag compared numeric strings and reported a false mismatch. [Fresh numeric comparison](../fourth_check/CAD_Mechanical_Uncertainties.md) confirms all 132 J5/J6 records match. Native CAD is unchanged; the original JSON is retained as dated evidence.

**All three files pass their configured physical checks; none is a manufacturing release.** This pass found a concrete micro-HDMI placement discrepancy, confirmed incomplete order-code/library metadata, and separately measured the remaining electrical work. Zero physical violations does not mean zero missing connections, complete application wiring, or approved fabrication geometry.

No source CAD or public file was changed. Native KiCad 10.0.6 ran sequentially on isolated copies, with zone refill in memory, all physical-rule severities including exclusions, schematic parity where a schematic exists, fresh XML netlist export, and all ERC categories enabled. All **110 source CAD/library/table hashes** remained unchanged.

## Three distinct checkpoints

| Native result | Minimal core | Full-system rail revision | Mezzanine placement study |
| --- | ---: | ---: | ---: |
| Board size | 40 × 36 mm | 40 × 36 mm | 40 × 36 mm |
| Components | 126 | 128 | 128 |
| Tracks / vias / zones | 1,010 / 146 / 4 | 360 / 25 / 0 | 0 / 0 / 0 |
| Physical DRC violations | 0 | 0 | 0 |
| Missing copper connections | **139** | **347** | **383** |
| Schematic parity issues | 0 | 0 | **Not applicable: no integrated schematic** |
| Fresh XML pin/pad endpoints checked | 636 | 640 | No corresponding integrated netlist |
| Intended connected endpoints checked | 419 | 423 | Retained core pad assignments checked |
| All-enabled ERC | **211 errors + 10 warnings** | **211 errors + 10 warnings** | No integrated schematic |
| Ignored DRC checks / DRC exclusions | 0 / 0 | 0 / 0 | 0 / 0 |

Every fresh schematic endpoint matches its PCB pad, including singleton unconnected nets. Both component manifests match their boards. All three contain the full 324-ball FPGA and have the exact four-corner 40 × 36 mm outline. J1/J2/J3, SW1, D1, R120 and all TP-prefixed components are absent.

The two 128-component designs are **different branches of engineering work**. The rail revision adds C92 and R122 and implements the revised bank/configuration rails, but has no J5/J6. The mezzanine study adds J5/J6 to the earlier core placement, but does not contain those two rail-revision additions or the integrated new rail design. Their counts must not be combined into a completed full board.

Exact PCB hashes:

- `minimal_core/hardware/FPGA100T_Minimal.kicad_pcb`: `3844c24f88697bec091e872c117a7889586df9be4053b912ec79253738d337c0`
- `full_system/hardware/FPGA100T_Full_System.kicad_pcb`: `c71578d3e72d22d84c3cf635c6935c736940c9ae5b3f8de2a5dd404a9f00a547`
- `release_audit/mezzanine/FPGA100T_Mezzanine_Fit.kicad_pcb`: `186018ad28d31eb3d8fee4193a32731632a9bf9cab2c4652414a9bad40169750`

Paths are relative to the design folder. Compact measured results and source hashes are in `CAD_Review.json`; native results are retained in the local third-review evidence folder.

## Actionable discrepancies

### J4 sits 0.70 mm inward from its recommended board edge

This is present in **all three boards**. J4 is at (37.6, 6.0) mm, rotated 90°. Its actual footprint includes a recommended PCB-edge datum at local y = 1.70 mm and a connector front interface at local y = 2.40 mm. Transformed into board coordinates:

| Feature | x coordinate |
| --- | ---: |
| Footprint's recommended PCB-edge line | 39.30 mm |
| Actual board edge | 40.00 mm |
| Connector front interface | 40.00 mm |

The PCB therefore extends **0.70 mm farther toward the mating face** than the footprint/manufacturer layout recommends. The connector mouth is flush with the board edge. Whether a particular plug/enclosure clears this geometry has not been established.

[Native-coordinate J4 edge diagram](J4_Edge_Review.svg) shows the saved placement and the unimplemented 0.70 mm shift. It is an x-axis projection, not a finalized correction or a complete plug drawing.

Moving J4 outward by 0.70 mm would align the recommended edge, but the nearest shell copper would then be **0.425 mm** from the board edge, below the saved **0.50 mm** rule. Resolve placement, exact connector/plug geometry and fabricator edge clearance together; do not silently move the connector and relax the rule to obtain a pass.

Evidence: the embedded footprint datum agrees with Molex **SD-46765-001, revision A3, sheet 5 left**, for the through-hole-shell variant identified on sheet 2. The [manufacturer's newer D1 family drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf) was identified, but direct downloads timed out. Visual dimensional inspection used the [archived manufacturer drawing hosted by a distributor](https://datasheet.octopart.com/46765-0001-Molex-datasheet-8818586.pdf), with its revision explicitly recorded. The chosen order code/current drawing still needs final confirmation.

### Procurement and source-library metadata are incomplete

- **J4 is not an orderable BOM entry:** its MPN is `Molex46765 family; exact order code pending`. The actual footprint is for the top-mount, four through-hole-shell-tab variant: 19 staggered signal pads, 0.40 mm same-row pitch, 0.23 mm pad width, 0.85/1.00 mm pad lengths, four 0.65 × 1.70 mm plated slots and 1.50 × 2.55 mm shell lands. These agree with the inspected A3 through-hole layout; they do not authorize substituting any 46765-family member. Molex lists distinct bottom-mount, through-hole-shell and hybrid variants. [Molex series table](https://www.molex.com/en-us/products/series-chart/46765)
- **J5/J6 identify `QSH-030-01-L-D-A` in Value**, but have blank Datasheet and no explicit MPN fields, and no integrated schematic/assembly BOM. Populate those fields and the mating-board order codes when the study becomes the actual board.
- The original mezzanine `fp-lib-table` uses absolute workstation paths, including a dependency on the earlier regulator-routing library. It is not independently portable as-is. A self-contained package needs relative mappings plus the exact referenced libraries. A package-only correction is being audited separately; this review did not alter the source table.
- U1 also retains a family/package description rather than a complete speed/temperature-grade ordering code. It is not a released procurement BOM.

## Unassigned pins are different from unrouted connections

Both schematics still contain **203 open U1 pins and eight open J4 data contacts**. They remain visible as 211 ERC errors. All-enabled ERC additionally reports five pin-type warnings and five four-way-junction warnings: **221 findings in each schematic**, versus 216 with effective default settings. All four default-disabled categories were enabled only in scratch copies, and the resulting reports have no ignored categories or excluded findings.

The five junction warnings identify intended GND/VCCAUX/VCCINT bus joins; the earlier wire-by-wire tracing and this pass's exact endpoint agreement show no netlist mismatch. They are drawing-clarity improvements, not newly demonstrated shorts. The five original pin-type warnings concern CFGBVS and four XADC pins against power-output flags; their symbol typing and intended ties still require explicit review.

The connector CSV allocates **117 unique ASIC signals + three reserved numbered contacts**, with two additional ground-blade records. Every numbered FPGA ball remains `TBD`. In the actual mezzanine PCB, **all 120 numbered J5/J6 contacts are unassigned**. Their 117 intended signal connections therefore do **not** appear in the 383-unconnected-item count. Using that count alone as a full-board completion metric would understate the remaining design work.

## Samtec footprint and mating checks

The embedded J5/J6 pads match the local QSH footprint: each has 60 unique signal pads, four lands for its common ground blade, and two 1.02 mm nonplated alignment holes. Across both connectors there are eight grounded blade lands and four alignment holes. Native physical DRC checks include the holes and opposite-side courtyards.

The [QSH revision-M recommended layout](https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xx-footprint.pdf), page 1, confirms the main transcription: 0.5001 mm pitch, 0.279 × 2.27 mm signal lands, row centers ±2.865 mm, alignment holes x = ±10.065/y = −2.67 mm, and the four ground-blade lands. The body is 21.31 × 7.24 mm; the project adds a 21.81 × 8.50 mm courtyard.

The previously documented dimensional ambiguity remains: the -030 table gives H = 2.84 mm, whereas the centered pitch/hole chain gives 2.81355 mm, differing by **0.02645 mm**. Obtain manufacturer dimensional/tolerance confirmation before footprint release; this pass did not quietly change the geometry.

[QTH-030-01-L-D-A is a listed mating part](https://www.samtec.com/products/qsh-030-01-l-d-a), but its [recommended footprint](https://suddendocs.samtec.com/prints/qth-xxx-xx-x-d-xxx-footprint.pdf) is different: pin 1 is on the opposite row in the top view, its signal lands are 0.305 × 1.45 mm, and alignment-hole spacing differs. Copying the QSH land pattern/number orientation onto the mating board would be incorrect. The actual mating-board CAD and contact-to-contact assembly have not been checked. The manufacturer's [mated-dimension document](https://suddendocs.samtec.com/prints/qxh%20mated%20document-mkt.pdf) gives 5.03 mm fully mated nominal spacing with up to 0.178 mm additional spacing for this combination; the advertised 5 mm designation is not a complete mechanical stack specification.

## Fabrication constraints behind the zero-violation result

| Measured/configured item | Result and implication |
| --- | --- |
| BGA geometry | 0.80 mm pitch, 0.40 mm copper lands, +0.05 mm mask expansion: nominal 0.50 mm mask openings and 0.30 mm mask webs. |
| BGA track channel | At 0.15 mm clearance, the available single-track width is `0.80 − 0.40 − 2×0.15 = 0.10 mm`, exactly the minimum track rule. There is no extra nominal channel allowance. |
| Small interstitial via | A centered 0.40 mm via between four 0.40 mm BGA lands has 0.1657 mm nominal copper clearance, only 0.0157 mm above the 0.15 mm rule. Conventional escape is geometrically possible, but complete escape and production tolerance are not proven. |
| Actual through vias | Core: 127 at 0.40/0.20 mm and 19 at 0.60/0.30 mm. Rail revision: 25 at 0.40/0.20 mm. No microvias are used. |
| Drill/annulus | Minimum 0.20 mm hole, 0.10 mm radial annulus; 1.60 mm nominal board gives an 8:1 small-hole thickness/drill ratio. The selected fabricator must accept the actual finished-hole, plating and registration requirements. |
| Via-in-pad | No actual through-via drill intersects a BGA copper land in either routed checkpoint. No via-fill/cap process should be assumed merely from the existence of small vias. |
| Layers/impedance | Six copper layers are declared, but no explicit dielectric/copper stackup is saved. The 0.10 mm trace rule alone does not define impedance. |
| Copper zones | Core has four GND zones on F.Cu/B.Cu/In1.Cu/In4.Cu, with solid pad connections and 0.10 mm minimum fill width. The rail revision and connector study have no zones. All were refilled in scratch before checking. |
| Mask/silkscreen | General mask expansion is zero except footprint overrides such as the BGA. The physical-rule minimum silk clearance is zero. These defaults are not a fabricator/assembler-approved mask-registration, mask-web or silkscreen specification. |

The escape calculations are nominal geometry checks, not a declaration that the entire board can be routed at those dimensions. AMD's [7-series PCB guide](https://www.amd.com/content/dam/xilinx/support/documents/user_guides/ug483_7Series_PCB.pdf) separates layout geometries from process/DFM constraints; the actual board needs a selected stackup and fabrication/assembly review. Power-plane effectiveness, return paths, solderability, thermal behavior, controlled impedance and final 117-signal breakout remain unqualified.

## Release interpretation

**Fixable discrepancies:** resolve the J4 edge placement and associated copper-edge requirement; commit exact connector/FPGA order codes and proper connector metadata; make the standalone study package resolve its exact local libraries.

**Not yet designed/integrated:** combine the revised rails, all 117 FPGA ball assignments and the two mezzanine connectors into one schematic/PCB; complete the core rails and link wiring; include the receiver/carrier and input-protection/damping design.

**Not yet qualified:** connector tolerance/mating geometry, custom cable electrical contract, complete BGA breakout, fabricator stackup/rules, SI/PI, thermal/assembly behavior, and physical power-up/data-path tests. These cannot be replaced by another run of the same DRC.
