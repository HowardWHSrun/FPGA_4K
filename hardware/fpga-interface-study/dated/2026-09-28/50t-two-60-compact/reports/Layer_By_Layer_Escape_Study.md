# Layer-by-layer FPGA escape study — 28 September 2026

**Historical Step07 placement only.** This file describes the earlier 38.5 × 43 mm board with both DF40T connectors on the north edge. The current frozen 36 × 38 mm north/south board, its exact 116-contact map and its changed east/west corridor tradeoff are in [Step14 Layer-by-Layer Escape Study](Step14_Layer_By_Layer_Escape_Study.md). Do not apply the Step07 connector positions or 39/116 east/west result to the Step14 board.

**Status:** placement and routing plan only. The PCB has zero tracks and vias. This document interprets Gerald's 28 September suggestion to fan different BGA rows toward the two ASIC connectors on different signal layers. The transcript is an automatic, uncorrected record, so the plan needs Gerald and the fabricator to review it before routing.

## What the existing eight layers mean

| Copper layer | Present role | Proposed escape use |
|---|---|---|
| L1 / F.Cu | Signal and components | Outer BGA balls, short ASIC connector fanout, GTP pairs to J4 if its position permits. |
| L2 / In1.Cu | Ground | Keep a continuous near-surface return plane. A signal via can pass through its antipad, but **no signal trace is routed on L2**. |
| L3 / In2.Cu | Signal | Stagger the next BGA rows into north/west ASIC connector corridors; reference the adjacent L2 ground plane. |
| L4 / In3.Cu | Power | Localized supply shapes, each with a defined adjacent ground return. No signal escape here. |
| L5 / In4.Cu | Ground | Preserve the return plane for L6 and power shapes. |
| L6 / In5.Cu | Signal | Stagger deeper BGA rows into the other ASIC connector corridor; reference L5/L7 ground. |
| L7 / In6.Cu | Ground | Preserve the return plane for L6/L8. |
| L8 / B.Cu | Signal and components | Short local low-speed, JTAG and spare test-pad access; keep sensitive GTP pairs away from switching stages. |

Gerald's spoken “layer two / layer three” example conveys the stepped routing idea. In this board's named stack, L2 is ground. The corresponding signal-layer sequence to study is **L1 → L3 → L6 (and L8 for local access)**. The first and second arrow indicate distinct escape depths, not copper already drawn. Whether blind, buried, through or via-in-pad transitions are practical depends on the actual CSG325 ball map, 0.4 mm connector pad field, fabricator drill/registration rules, impedance stack, and return-via plan.

## Placement tied to those escapes

1. Keep U1 central. Preserve short bypass connections around and under its rail groups before moving decouplers to fit a smaller outline.
2. Place J5 and J7 side by side on the north edge in the next placement iteration, so neither 60-contact connector shadows the other. Put **J5 east and J7 west**: the actual U1 ball map sends 44 of J5's 58 digital contacts from the eastern half, while 33 of J7's 58 originate from the western half. Keep J5 for ASIC1–4 and J7 for ASIC5–8; the routing-board owner must approve any contact permutation.
3. Put J4 near the middle of a side edge and reserve three TX pairs plus one RX pair. The checked Step07 fit uses the **east** edge because the west edge contains regulator switching clusters. U1's GTP balls are on the **west** side, so this fit creates a long prospective path across or around the BGA. It must pass a later differential-pair escape and return-path study before its compact outline can be accepted.
4. Put the 32 Mbit flash and 1.5/1.8 V translation close to the configuration pins. Edge I/O test pads and the two status LEDs must not push GTP or configuration traces into long detours.
5. Cluster each buck regulator, inductor and input/output capacitors as a verified switching loop. Do not use the present compact visual placement as proof of loop area, power integrity or thermal adequacy.

## Checks before a single route

- Overlay the actual U1 ball names and physical pad coordinates with the J5/J7 contact list. Assign each required ASIC timing group an intended layer and corridor; do not equalize unrelated pins merely for appearance.
- Obtain the carrier/routing-board mating orientation, pin map, three-ground return assessment, connector alignment solution, ASIC supply input voltage/current and stack height.
- Ask the board fabricator for an eight-layer stackup with finished dielectric thickness, trace/space, via spans and diameters, fill/cap, pad/antipad and impedance rules. AMD's general BGA layer-count guidance says pad pitch, escape trace width and fabrication technology determine achievable layers.
- Route and inspect one dense ASIC group, one GTP pair and one power/ground via pair as representative feasibility checks before committing to a smaller board. Confirm return continuity at layer transitions.
- Re-run native KiCad ERC, DRC, schematic/PCB pad parity and unrouted count after any pin or placement change. Passing placement DRC does not establish electrical or signal-integrity readiness.

## Contact-by-contact stepped escape allocation

The [board-scale overview](Escape_Corridor_Overview.png) colors the 116 assigned ASIC-facing FPGA balls by proposed signal layer. It is a planning view, with no copper paths drawn.

The [reproducible escape map](Escape_Corridor_Map.csv) enumerates **all 116 digital FPGA-to-ASIC contacts** by J5/J7 contact, U1 ball, physical ball position and candidate signal layer. Its [machine-readable summary](Escape_Corridor_Map.json) was generated from the saved Step07 board by `scripts/step07_escape_map.py`; rerun it after any further placement or pin-map change. The rule is a starting point for route feasibility, not an electrical or fabrication constraint:

| BGA ball ring from outer edge | Candidate signal layer | Assigned digital contacts |
|---|---|---:|
| 0 | L1 / F.Cu | 23 |
| 1–2 | L3 / In2.Cu | 55 |
| 3–5 | L6 / In5.Cu | 38 |

The proposed J5-east/J7-west split still has **39 nets** whose U1 balls originate on the opposite half (14 on J5 and 25 on J7). The corresponding rows are flagged in the CSV. Stepped layers alone do not remove those crossovers; before routing, review whether a legal FPGA-pin or mating-board pin permutation can reduce them without violating bank, ASIC timing and return-path needs. The present PCB has no traces or vias, so no ball is actually assigned to a copper layer yet. L2/L5/L7 remain ground planes and L4 is power.

## Current measured envelope

The first no-move outline trim reduced the drawn PCB from **43 × 49 mm** to **38.5 × 43 mm** (21.43% less area). It removed obsolete H1–H4 construction graphics. Step07 put J7 west and J5 east along the north edge, and shifted J4 to the east edge midpoint. That placement passed native KiCad DRC with zero physical findings. KiCad's native connectivity calculation gave **578 open connections** for Step07; its DRC JSON listed only 499, apparently capped. Step08's twelve edge pads increased the exact native count to **590**. This is a geometric envelope, not the minimum routable size. The reduced outline and new parts still require a complete route-feasibility and mechanical study.

## Sources

- Local: 28 September meeting summary (local source; not included in web package) and private original recording/transcript in that dated folder (not for public distribution).
- Local: 27 September eight-layer review (local source; not included in web package) (Gerald's prior blind-via and length-matching comments).
- Manufacturer: [AMD 7 Series PCB Design Guide UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB), [AMD BGA Design Rules UG1099](https://docs.amd.com/r/en-US/ug1099-bga-device-design-rules/Layer-Count-Optimization), [AMD GTP User Guide UG482](https://docs.amd.com/v/u/en-US/ug482_7Series_GTP_Transceivers).
