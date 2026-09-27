# Current physical stackup — twelve-layer compact board

27 September 2026 · 33 × 36 mm finished outline · construction selection, not a manufacturing order

**Selected boot simplification:** fixed SPI x1 removes R106/R107 and marks U1.L14/M14 NC; the flash WP#/RESET# pull-ups remain. The resulting design has **125 components, 752 numbered endpoints, 83 intentional NC and 19 reserved endpoints**. One-bit boot is slower than quad at the same clock; ASIC capture bandwidth is unchanged. See the [source review and boot constraints](SPIx1_Boot_Review.md).

**The current twelve-layer integration uses JLC12161H1-1080B.** The planned nominal ordering thickness and native board thickness are **1.6 mm**; the calculator lists **1.59 mm ±10%** finished thickness. Copper plus dielectric constituent dimensions sum to **1.5928 mm**, consistent with the rounded listing. They are nominal construction values, not independent tolerance guarantees. ENIG remains the proposed finish.

The earlier **JLC08161H-3313, eight-layer, 1.57 mm ±10%** proposal is preserved as historical evidence. It must not be used for fabrication or impedance assumptions on this twelve-layer design. No conclusion that eight-layer routing is impossible is implied.

## Copper and dielectric construction

| Layer | Native name | Role | Copper | Dielectric to next copper layer |
|---|---|---|---:|---|
| L1 | F.Cu | Signal / components | 35 µm | 0.0784 mm, 1080 RC69% |
| L2 | In1.Cu | GND | 15.2 µm | 0.1000 mm, H/HOZ core |
| L3 | In2.Cu | Signal | 15.2 µm | 0.1748 mm, 1080 0.0784 + 2313 0.0964 |
| L4 | In3.Cu | Signal | 15.2 µm | 0.1000 mm, H/HOZ core |
| L5 | In4.Cu | GND | 15.2 µm | 0.1674 mm, 2313 0.0964 + 1080 0.0710 |
| L6 | In5.Cu | Power regions | 30 µm | 0.1000 mm, 1/1OZ core |
| L7 | In6.Cu | Power regions | 30 µm | 0.1674 mm, 1080 0.0710 + 2313 0.0964 |
| L8 | In7.Cu | GND | 15.2 µm | 0.1000 mm, H/HOZ core |
| L9 | In8.Cu | Signal | 15.2 µm | 0.1748 mm, 2313 0.0964 + 1080 0.0784 |
| L10 | In9.Cu | Signal | 15.2 µm | 0.1000 mm, H/HOZ core |
| L11 | In10.Cu | GND | 15.2 µm | 0.0784 mm, 1080 RC69% |
| L12 | B.Cu | Signal / components | 35 µm | — |

All 1080 plies use RC69% and all 2313 plies RC58% in the observed listing. Core dimensions exclude copper. Copper totals **0.2516 mm** and dielectrics **1.3412 mm**. The six signal layers each have adjacent GND: outer signal-to-ground gaps are 0.0784 mm; inner signal-to-ground gaps are 0.1000 mm. L3/L4 and L9/L10 face another signal layer across 0.1748 mm, so long parallel broadside coupling still needs review. The two central power layers face each other, not GND; their mutual capacitance is not a substitute for bypassing.

The old-to-new copper mapping is F→F, In1→In1, In2→In2, In3→In5, In4→In6, In5→In9, In6→In10, B→B. New signal layers are In3/In8 and new GND layers In4/In7. That mapping and all new zone definitions/fills require separate final review; a stackup metadata helper does not authorize copper transformations.

## Material model boundary

JLC's published generic nominal parameters are **Dk 3.91 for 1080**, **4.6 for core** and **3.8 for solder mask**. These are not exact laminate, frequency, temperature or lot guarantees. The source supplies no usable 2313 Dk or loss-tangent qualification for this construction. Consequently:

- Pure 1080 and core entries may carry those source-based nominal Dk values.
- Mixed 1080/2313 effective Dk is **unqualified and omitted**, not averaged or guessed.
- Every dielectric and mask loss tangent is **unqualified and omitted**.
- The mask metadata uses JLC's 0.6 mil (0.01524 mm) above-trace C2 model per side. Treating this as two planar layers gives 1.62328 mm with the copper/dielectric sum; it does not model real mask topography or supersede the 1.59 mm ±10% finished listing.

Native KiCad can insert software defaults during a subsequent save: Dk 4.5 in unspecified mixed regions, dielectric Df 0.02 and mask Df 0. Those values are **not manufacturer evidence**. The prepared application helper omits them, retains qualification labels and checks native readability without writing its diagnostic round-trip copy. A later native save requires reviewing or reapplying those metadata fields.

## Final evidence and unresolved qualification

The integrator must retain [physical application](Physical_Stackup_Application.json) from the actual final PCB application. Its before/after SHA values, exact dimensions and source hash bind metadata to the PCB; final native audit provenance must in turn bind the checked board hash. Readability and correct metadata do not establish impedance, continuous returns, PDN performance, allowable core current, assembly acceptance or hardware operation.

Conventional through-vias and the existing compact outline remain intended. Final CAM/drill tables determine actual minima. The 30 µm power copper changes the earlier eight-layer spreading-resistance estimate; use a current-geometry power review. The [fabrication notes](Fabrication_Notes.md) specify J4's precision plated slots and recessed-tab assembly requirement on the 1.431–1.749 mm finished-thickness range.

Sources: [manufacturer calculator](https://jlcpcb.com/pcb-impedance-calculator), [published nominal material parameters](https://jlcpcb.com/impedance), [observed construction JSON](JLC12161H1_1080B_Observed.json), [independent arithmetic/reference-plane review](Twelve_Layer_Stackup_Review.md), and [source-based dielectric parameter record](Primary_Dielectric_Parameters.json). The observed JSON and independent review were created during the isolated feasibility study; their historical non-adoption status is preserved. Selection/application of the final twelve-layer board is established by the current integrator's hash-bound records, not retroactively by changing that history.

**No order, supplier submission, acceptance, bitstream or assembled-board electrical-operation evidence is claimed.**
