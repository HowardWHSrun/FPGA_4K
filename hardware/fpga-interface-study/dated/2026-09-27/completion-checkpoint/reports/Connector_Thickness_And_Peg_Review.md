# Connector thickness and alignment-peg review

27 September 2026 · current twelve-layer thickness review; historical placement evidence · no procurement or CAD changes

**Selected boot simplification:** fixed SPI x1 removes R106/R107 and marks U1.L14/M14 NC; the flash WP#/RESET# pull-ups remain. The resulting design has **125 components, 752 numbered endpoints, 83 intentional NC and 19 reserved endpoints**. One-bit boot is slower than quad at the same clock; ASIC capture bandwidth is unchanged. See the [source review and boot constraints](SPIx1_Boot_Review.md).

**No demonstrated thickness mismatch requires changing the selected connectors or stackup. J4 does, however, require acceptance of soldering and retaining short shell tabs inside a thick plated slot. The mezzanine alignment-hole geometry matched the manufacturer in the identified earlier intermediate PCB. Its placement screen does not certify the final twelve-layer layout.**

## J4: short shell tabs, not projecting pins

Molex **467651001 / 46765-1001** is the through-hole-shell, top-mount version. The official **SD-46765-001 Rev D1**, sheet 2, gives a shell-tail projection of **0.55 ±0.15 mm** below the signal-tail seating plane. The selected JLC12161H1-1080B construction is **1.59 mm ±10%**, or **1.431–1.749 mm**. At the drawing seating plane, the tab end therefore lies **0.731–1.349 mm short of the opposite PCB surface**; the nominal difference is **1.040 mm**. A solder standoff reduces insertion further. The tabs cannot be expected to emerge on the back of this PCB. [Molex sales drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf), [selected construction](Physical_Stackup_Proposal.md).

No allowed PCB-thickness range was found in that drawing or **PS-46765-003 Rev 9**. Molex's **EE-46765-001 Rev D** uses a **0.8 mm** receptacle board and includes this part number, but explicitly describes an unvalidated simulation. That thickness is an electrical-model fixture, **not a recommended thickness, allowable limit or assembly qualification**. Even 0.8 mm exceeds the maximum 0.70 mm tail projection. This supports treating short insertion as intentional geometry, while providing no proof that our 1.59 mm construction is qualified. [Product specification](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf), [electrical-model documentation, page 1](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/electricalmodeldocumentpdf/467/46765/EE-46765-001-001.pdf?inline=).

**Required acceptance, owned by fabrication/assembly integration:** retain four **finished plated 0.65 ±0.05 × 1.70 ±0.05 mm slots**, and obtain a process acceptance covering recessed shell tabs, upper-barrel/land wetting, inspection and mechanical retention on the **1.431–1.749 mm** finished-thickness range. Do not promise a bottom protruding-tail fillet or assume an ordinary bottom-side through-hole soldering process. Nominal fit is not disproved; neither slot tolerance nor solder-joint strength is yet accepted. No connector or stackup substitution is justified solely by the absence of backside protrusion.

## J5/J6: alignment pegs and backside clearance

For **QSH-030-01-L-D-A**, the Samtec Rev BJ drawing shows the **-A alignment-pin option**, **Ø0.89 mm REF**, and **0.95 mm REF** peg length below the housing underside. These are reference dimensions. The 0.95 mm datum is the housing underside, not a guaranteed insertion depth below the PCB seating plane. The drawing separately gives housing height 3.05 mm REF and contact seating height 3.251 mm (+0.076/−0.025). [Samtec series drawing, page 1](https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xxx-x-xx-mkt.pdf).

Using the whole **0.95 mm reference peg length** as a conservative nominal insertion envelope leaves **0.640 mm** of nominal 1.59 mm board thickness, or **0.481 mm** at the 1.431 mm thickness minimum. Actual nominal insertion is smaller because the solder-tail seating plane is below the housing underside. These are geometry screens, **not a guaranteed peg-length tolerance or worst-case fit certification**: do not apply the drawing's general numeric tolerance to a REF dimension or infer a manufacturer maximum from it.

Samtec's Rev M footprint specifies **two Ø1.02 mm NPTH alignment holes**, **20.13 mm apart**, at **2.67 mm** transverse offset for the 030-position version. All four J5/J6 native holes matched those nominal dimensions in the historical board identified below. That board had no opposite-side footprint bounding box overlapping a nominal hole disk. The table is historical placement evidence, not a final twelve-layer result. [Samtec footprint, page 1 and table 3](https://suddendocs.samtec.com/prints/qsh-xxx-01-x-d-xx-footprint.pdf).

| Hole | Native center (mm) | Nearest opposite-side footprint | Hole edge to footprint bounding box (mm) |
|---|---|---|---:|
| J5, left | 4.135, 1.830 | L4 | 0.135 |
| J5, right | 24.265, 1.830 | R102 | 0.210 |
| J6, left | 11.435, 28.830 | C71 | 0.265 |
| J6, right | 31.565, 28.830 | C63 | 0.135 |

This conservative footprint-box check includes artwork/courtyards, rather than only physical bodies; it excludes text and does not account for placement/drill tolerances or maximum body dimensions. **Repeat it on the final frozen layout.** Only final hash-bound readback can determine whether current backside components require relocation for peg collision. The carrier's mating connector, stack height, orientation and opposing-board component envelope remain a separate mechanical design dependency.

## Evidence and provenance

- Historical native eight-layer board: immutable `reference_before_final_routes/FPGA100T_33x36_Routing.kicad_pcb`, SHA-256 `7db8944f46e592aa31432101cd6ac02b91897155b3c7962f09dbd57118a8dba7`. Native nominal thickness was 1.6 mm; its older physical proposal was **JLC08161H-3313, 1.57 mm ±10%**. The [historical hole readback](evidence/Connector_Hole_Thickness_Readback.json) supplies the table above and must not be relabeled as the final PCB.
- Current thickness arithmetic uses **JLC12161H1-1080B, 1.59 mm ±10%**. See the [independent construction review](Twelve_Layer_Stackup_Review.md) and final hash-bound [physical application](Physical_Stackup_Application.json). Final hole/body/mask checks remain bound to the final native board, independently of this nominal dimension calculation.
- Molex Rev D1 dimension and exact 46765-1001 variant were checked against the official indexed drawing. A local archival **Rev A3** manufacturer drawing was visually cross-checked for the same 0.55 ±0.15 mm datum; it is not mislabeled as the current D1 PDF. Direct download of D1 timed out, so no new local D1 copy is claimed.
- [Local Samtec Rev BJ drawing](evidence/Samtec_QSH_Series_BJ.pdf), SHA-256 `13c81965b23fbc78ba311f1d9b69a2f50b5803e60d08b73c82785454ac58631d`.
- [Local Samtec Rev M footprint](evidence/Samtec_QSH_01_Footprint_RevM.pdf), SHA-256 `a2527b2574184254dd059d63c053980949e60a910b87eca43bb506edb794eea2`.

No manufacturer was contacted. No order, process approval, pull test or physical assembly inspection is implied.
