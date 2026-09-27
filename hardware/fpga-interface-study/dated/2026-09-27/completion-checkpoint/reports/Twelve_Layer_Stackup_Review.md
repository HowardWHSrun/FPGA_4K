# Twelve-layer study — independent review, 27 September 2026

**The transcribed dimensions and proposed layer roles are internally consistent.** This supports testing the12layer option; it does not adopt it, qualify it, or establish that8layers are impossible. Root observed the manufacturer’s live calculator; this review independently checked the saved transcription and its nominal geometry. [Machine-readable checks](Twelve_Layer_Stackup_Review.json).

- Copper totals **0.2516mm**, dielectrics **1.3412mm**, combined **1.5928mm**. All11 dielectric detail sums match. Copper and dielectric thicknesses are symmetric. The difference from the listed1.59mm is0.0028mm, consistent with displayed rounding; the listed finished tolerance is±10%.
- Roles are exactly **6signal /4GND /2power**. The old8→new12 mapping is one-to-one and preserves each original layer’s role. Four new layers complete the12layer set without renaming a power layer as signal.
- Each signal layer has a directly adjacent ground plane:

| Signal | Nearest adjacent ground | Nominal dielectric gap |
|---|---|---|
| L1 (F.Cu) | L2 (In1.Cu) | 0.0784mm |
| L3 (In2.Cu) | L2 (In1.Cu) | 0.1000mm |
| L4 (In3.Cu) | L5 (In4.Cu) | 0.1000mm |
| L9 (In8.Cu) | L8 (In7.Cu) | 0.1000mm |
| L10 (In9.Cu) | L11 (In10.Cu) | 0.1000mm |
| L12 (B.Cu) | L11 (In10.Cu) | 0.0784mm |

The L3/L4 and L9/L10 signal pairs are adjacent to each other across0.1748mm. Each also has its own closer ground plane across0.1000mm, but the other signal layer is not screened by intervening ground. Treat long parallel broadside overlaps as crosstalk candidates; preferentially cross those pairs and check their actual routes. A nearby plane is useful geometry, not an impedance or crosstalk result.

When signals change from a layer referencing one GND plane to a layer referencing another, provide a nearby connected ground return. Inspect actual zone continuity and stitching after filling; shared net names alone do not prove a short return path. TI’s [high-speed interface guidance](https://www.ti.com/lit/an/spraar7j/spraar7j.pdf) supports continuous reference planes and return stitching; it does not qualify this board’s dimensions or prescribe a validated spacing for its ASIC interface.

L6/L7 power planes have30µm copper and a0.10mm dielectric between the two power layers; each outer adjacent GND is0.1674mm away. Those two power layers do not form a ground/power pair. Do not count their mutual capacitance as a substitute for decoupling, and keep separate rail zones isolated. Recompute plane spreading resistance and the mounted PDN if adopted: the prior15.2µm inner-power calculation cannot be carried over unchanged. Conventional through-via lengths also change slightly; this is not a guaranteed current-margin improvement.

The new listed finished thickness range would be1.431–1.749mm. With Molex’s0.55±0.15mm shell tails, nominal recess becomes1.04mm, with0.731–1.349mm extrema before seating variation. Recessed-tab solder-process/slot acceptance is still required. A0.95mm REF Samtec peg would leave0.64mm nominal and0.481mm at minimum board thickness, but REF remains non-toleranced; this is not a mechanical-fit guarantee.

If routing warrants adoption, explicitly review all copper-layer remaps, new GND zone definitions/fills and return continuity; rerun native parity/DRC, stackup/impedance assumptions, power-drop/PDN and assembly-thickness review. The8layer active board and current public status remain unchanged until root’s decision. No order or supplier submission is involved.

Manufacturer construction source: [JLCPCB impedance calculator](https://jlcpcb.com/pcb-impedance-calculator), JLC12161H1-1080B as transcribed in the dated study. AMD design context: [UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB). These are construction/design references, not manufacturing acceptance of this PCB.
