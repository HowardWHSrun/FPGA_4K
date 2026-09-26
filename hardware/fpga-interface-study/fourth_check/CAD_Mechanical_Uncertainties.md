# Fourth review — CAD continuity and mechanical uncertainties

26 September 2026. **The files are consistent with the prior native checks; fabrication readiness remains false.** This pass recalculated hashes, parsed the current connector geometry numerically, rechecked archive contents and consulted current manufacturer pages. It did **not** rerun unchanged native DRC/ERC, modify CAD, or establish assembled-hardware operation.

[Source continuity and fresh measurements](Source_Continuity.json) distinguish the new checks from retained results. [Structured uncertainty entries](CAD_Mechanical_Uncertainties.json) give owners and closure evidence.

## What was independently rechecked

- All **110** source CAD/library/table files still match the third-pass SHA-256 baseline exactly. The three PCB hashes are unchanged.
- Both rail/fit ZIPs pass fresh CRC, full member-hash/size and manifest-inventory checks: **57 rail files and 29 fit-study files**. All **24 native CAD files** across those two packages still match the sources byte for byte. Packaging-only relative footprint-library mappings remain separate from source geometry. These checks apply to the archives recorded by hash in `Source_Continuity.json`.
- Each J5/J6 footprint's **66 pad records** numerically match its local library: 60 signal pads, four ground-blade lands and two alignment holes. The comparison covers pad number/type/shape, local position/rotation, dimensions, drill and copper/mask/paste layers.
- The previous mechanical readings remain applicable to the unchanged boards: J4 origin (37.6, 6.0) mm at 90°, recommended-edge datum x=39.3 mm, actual edge x=40.0 mm. J5 and J6 are separated by (+0.7, +27.0) mm, not a common x coordinate.

### Audit correction: false JSON footprint mismatch

The third-pass prose correctly described matching J5/J6 geometry, but its JSON field `mezzanine_allocation.embedded_pads_match_local_library` was false. The checker compared raw strings: `.279` versus `0.279`, and `.43` versus `0.43`. These are equal dimensions. Fresh numeric comparison finds **zero differences in all 132 records**. Layer-list order is also normalized in the new comparison. The original third-pass artifacts remain historical evidence; this report and `Source_Continuity.json` explicitly supersede that one field. No footprint correction is required for this checker defect.

## Native results retained, not rerun

| Design | Physical DRC | Schematic parity | Missing assigned-net copper connections | All-category ERC |
| --- | ---: | --- | ---: | --- |
| Most-routed core | 0 | 0 issues | 139 | 211 errors + 10 warnings |
| Separate rail revision | 0 | 0 issues | 347 | 211 errors + 10 warnings |
| Separate mezzanine fit | 0 | No integrated schematic | 383 | No integrated schematic |

The exact source continuity supports retaining the third-pass native results. These numbers **exclude unassigned application nets**, so they cannot be converted into a full-board completion percentage. The two 128-part designs are separate revisions: the rail revision adds C92/R122, while the fit study adds J5/J6. No single full-system file combines them.

## Uncertainty list and closure evidence

| ID | What is known / what remains uncertain | Owner needed | What closes it |
| --- | --- | --- | --- |
| M01 | **Known discrepancy:** J4 is 0.70 mm inward from the footprint edge datum. A simple outward shift leaves 0.425 mm shell-copper clearance, below the saved 0.50 mm rule. Exact connector/plug order code and current mechanical drawing are still uncommitted. | PCB designer + connector supplier + fabricator | Commit exact receptacle/plug BOM entries; review current drawings; correct placement/outline; pass agreed edge rules and an actual mated assembly clearance check. |
| M02 | **Unverified mating assembly:** QSH/QTH are listed mates, but the routing-board CAD/contact orientation, component clearance, assembly retention and tolerance stack have not been checked against the actual FPGA board. J5/J6's 0.7 mm x offset must be respected. | Routing-board owner + PCB designer | One contact-to-contact mating drawing/net map and an aligned two-board 3D/mechanical review, including ground blades, standoffs and the intended power path. |
| M03 | **Unresolved footprint dimension:** the QSH -030 table gives H=2.84 mm; the centered pitch/hole chain gives 2.81355 mm. The 0.02645 mm difference remains unexplained. Numeric equality with the local library proves transcription consistency, not manufacturer approval. | Connector supplier + PCB designer | Manufacturer-confirmed dimension/tolerance interpretation or approved part-specific land pattern, recorded against the chosen connector variant. |
| M04 | **Unselected manufacturing process:** six layers and nominal 1.6 mm thickness are saved, but dielectric/copper construction and impedance are not. Existing 0.10 mm tracks, 0.15 mm clearances and 0.40/0.20 mm vias need fabricator acceptance. | PCB designer + fabricator | Approved stackup, finished drill/plating/registration and impedance constraints; reroute/check the complete board against those rules; obtain DFM review. |
| M05 | **Unreleased assembly definition:** U1 lacks its complete speed/temperature ordering code; J4 lacks an exact MPN; J5/J6 metadata is incomplete. Reflow/stencil/paste settings, component heights, 3D completeness and assembly inspection are not qualified. | PCB designer + assembler | Exact BOM with availability checked, matching footprints/height models, reviewed stencil/paste and solder process, placement outputs, assembly drawings and inspection plan. |
| M06 | **Size is not proven minimal:** all three outlines are 40×36 mm, but one fully connected design does not yet exist. The BGA's narrow escape channels do not establish complete routability or mechanical fit after correction. | PCB/layout designer | Complete one electrically correct layout with the actual connector/assembly envelope, then compare feasible smaller outlines under the same electrical/process constraints. |
| M07 | **Known unfinished work:** the revised rails, all 117 ASIC pin assignments, cable data contacts and two mezzanines are not integrated into a single schematic/PCB. This is missing implementation, not uncertainty about whether current files are finished. | FPGA/PCB designer + receiver/carrier owner | Integrate the chosen architecture, complete copper, review all intentional unused pins and obtain clean, scoped ERC/DRC, firmware and hardware acceptance evidence. |

## Manufacturer checks and their limits

Molex currently identifies **467651001** as a top-mount, right-angle, through-hole-shell member of the 46765 family, with listed limits of **0.8 A/contact and 30 V**. It is a plausible variant to evaluate against this footprint, not a released selection. The bottom-mount and hybrid members must not be substituted by family name. Its part page says catalog information is limited. The current sales-drawing URL failed in this pass (HTTP/2 error, then an HTTP/1.1 timeout), so the third pass's inspected manufacturer A3 drawing is still the dimensional evidence; current-drawing approval remains open. Connector ratings alone do not qualify cable wire gauge, temperature rise, mating cycles, ground offset or the complete 12 V power path. [Molex part](https://www.molex.com/en-us/products/part-detail/467651001), [family variants](https://www.molex.com/en-us/products/series-chart/46765).

Samtec still lists **QTH-030-01-L-D-A** as a mate of the selected QSH part. QTH has a different land pattern and pin-1 row; using the QSH footprint on both boards would be incorrect. The manufacturer mated drawing gives the -01/-01 combination 5.03 mm nominal spacing and 0.178 mm maximum additional separation, while recommending full mating. These values do not approve the two-board assembly. [Part and mating list](https://www.samtec.com/products/qsh-030-01-l-d-a), [QTH layout](https://suddendocs.samtec.com/prints/qth-xxx-xx-x-d-xxx-footprint.pdf), [mated dimensions](https://suddendocs.samtec.com/prints/qxh%20mated%20document-mkt.pdf).

The current QSH revision-M drawing still contains the H discrepancy. Its assembly envelope is a keepout, and its separate stencil recommendation specifies 0.152 mm thickness; no mixed-component stencil/reflow process has been approved for this board. A generic footprint paste layer is not assembly-process approval. [QSH layout and stencil](https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xx-footprint.pdf).

The earlier nominal BGA calculations remain geometry screens: `0.80 − 0.40 − 2×0.15 = 0.10 mm` track channel, 0.1657 mm via-to-ball clearance for the centered 0.40 mm via, and nominal 8:1 board-thickness/drill ratio. They do not include finished-process tolerance or establish every signal's escape, return path, soldering reliability or thermal performance.

## Documentation refresh items

The active minimal-core and rail READMEs still quoted only saved/default ERC's five warnings at the start of this pass. They need the separate all-category result of ten warnings, with the reason explained. The root README's `203−117=86` arithmetic also needs the bank-voltage restriction: only 150 unassigned pins are in the three 1.5 V banks, leaving 33 there before placement/timing constraints. The main review task owns those edits and website publication. No new manufacturing-readiness claim is justified by another inspection.
