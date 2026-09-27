# Core supply DC-drop review — 26 September 2026

**Adopt R9 = 12 mΩ, WSLP1206R0120FEA, as a useful margin improvement. Keep R122 at 15 mΩ. The present design does not establish 3 A core operation.** The 12 mΩ choice recovers approximately 9.1 mV at 3 A without changing geometry. It does not eliminate PCB resistance or qualify load transients. A 2 A / 85°C example below is a screening scenario, not a guaranteed operating limit.

Read-only review of the intermediate `Integrated_Fanout.kicad_pcb` (not the current routed PCB), with native geometry and board hash saved in [Core_DC_Geometry.json](evidence/Core_DC_Geometry.json). Calculations use the [selected physical stackup](Physical_Stackup_Proposal.md), not the intermediate board's unspecified material properties. No copper or schematic was edited by this review. The property-only proposal is [R9_Property_Delta.json](R9_Property_Delta.json).

## What the actual copper contributes

Use copper resistivity 1.724 × 10⁻⁸ Ω·m at 20°C as an engineering assumption: 35 µm outer copper is **0.493 mΩ/square** and 15.2 µm inner copper is **1.134 mΩ/square**. R = sheet resistance × length/width. Width/thickness manufacturing variation, solder and package resistance are not included in these nominal geometric estimates.

| Section from feedback sense point toward the FPGA | Native geometry | Estimated resistance at 20°C |
|---|---|---:|
| C5.1 → R9.1 | B.Cu: 2.881 + 0.713 mm long, 1.20 mm wide | 1.48 mΩ |
| R9.2 → first core-plane via | B.Cu: 1.118 mm long, 0.80 mm wide | 0.69 mΩ |
| First and second source vias | Two 0.40/0.20 mm through-vias; second reached by 0.50 × 0.30 mm spur | 0.65–0.79 mΩ together |
| Fixed feeder subtotal, excluding R9 | Above three rows | **2.82–2.95 mΩ** |
| Core plane spreading | In3.Cu, source near (7.54,15.73)/(7.54,16.23), load cluster approximately x18–21.2/y15.7–21.3 mm | **2–4 mΩ screening allowance** |
| BGA power escape | Sixteen core/BRAM balls, ten plane-entry vias, 0.10 mm outer traces | **0.3–1 mΩ screening allowance** |
| Ground reference/return | Two perforated ground planes, FPGA ground escapes and converter/feedback ground locations | **0.7–2 mΩ screening allowance** |
| Rounded PCB supply-and-return scenario | No R9, no package model | **6–10 mΩ at 20°C** |

The vias are at (7.5425,15.729999) and (7.5425,16.229999) mm. The selected stackup makes the B.Cu-to-In3.Cu center distance about 0.927 mm. The via calculation assumes **0.20 mm finished bore and 20–25 µm copper plating**, neither yet vendor-guaranteed. The thin-wall formula R ≈ ρL/(πdt) gives 1.02–1.27 mΩ per barrel segment. The second via's 0.82 mΩ spur means these are not two ideal identical branches: the equivalent is Rvia in parallel with Rvia + Rspur. Full board thickness is not the current's travel length to this power plane. No claimed current rating is inferred from this resistance.

The plane allowance is deliberately approximate. Native filled-copper samples in the y13–25 mm band range from about 5.2 to 12 mm aggregate copper width at the inspected x coordinates; [cross-section evidence](evidence/Core_Plane_Cross_Sections.json) shows the perforations. These disconnected cross-section widths are not a uniform conducting strip. A simple 12 mm-long strip with 4–8 mm effective width gives roughly 1.7–3.4 mΩ; edge injection and current crowding motivate the 2–4 mΩ scenario. This is not a rigorous upper/lower bound or a substitute for solving the actual plane geometry. New signal vias can change it.

A separate resistor-network calculation of the exact sixteen BGA escape traces, assuming equal current per ball and an ideal equipotential plane, gives 0.40 mΩ weighted average and about 0.23–0.88 mV ball drop per total ampere. Actual VCCINT/BRAM loads are unequal, so the average is not a guarantee for every ball. Ground sharing with the other rails adds uncertainty. [Reproducible calculation and assumptions](evidence/Core_DC_Scenarios.json) preserve these distinctions; the model is an ohmic network, not finite-element simulation.

The L1-to-C5 output path is upstream of the C5/feedback sense point, so its DC drop is compensated while the regulator is regulating. It is not added a second time to the downstream loss. Regulator switch/inductor heating and saturation remain separate checks. The feedback and VOS tracks carry sensing current, not the FPGA's load current.

## Source-voltage corners and remaining margin

The 32.4 kΩ / 69.8 kΩ divider gives nominal 1.02493 V. For this screening, use PWM feedback accuracy ±1%, divider initial tolerance ±0.1%, selected divider TCR ±25 ppm/°C, and a conservative ±70 nA leakage allowance through the upper resistor. TI provides the accuracy and leakage specifications in [TPS62135 Rev B, section 7.5](https://www.ti.com/lit/ds/symlink/tps62135.pdf); the selected divider parts are documented in [Passive_Part_Selections.json](Passive_Part_Selections.json) and the [Vishay TNPW sheet](https://www.vishay.com/docs/28758/tnpw_e3.pdf). The leakage sign allowance is deliberately conservative. Typical line/load-regulation curves are not additional guaranteed limits.

The calculated source corner is approximately **1.01177–1.03810 V at 25°C** and **1.01080–1.03910 V at 85°C**, with independent worst-direction divider drift. The selected standard -1 FPGA needs VCCINT and VCCBRAM within **0.95–1.05 V**, per [AMD DS181 Table 2](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet). Thus increasing the nominal setting is not a free fix: the upper corner already leaves only about 11 mV at 85°C for positive excursions.

For the following scenarios, copper resistance scales with assumed α = 0.00393/°C from 20°C; R9 uses its +1% tolerance and +75 ppm/°C drift from 25°C. The 6–10 mΩ range is the PCB scenario above, not a qualified tolerance interval. Voltages are rounded to the nearest millivolt.

| Temperature / total core+BRAM load | R9 = 15 mΩ, low-source corner | R9 = 12 mΩ, low-source corner | Interpretation |
|---|---:|---:|---|
| 25°C / 2 A | 0.961–0.969 V | 0.967–0.975 V | DC-only margin; transients still consume it |
| 25°C / 3 A | 0.936–0.948 V | 0.945–0.957 V | 3 A is not established by this estimate |
| 85°C / 2 A | 0.955–0.965 V | **0.961–0.971 V** | 12 mΩ leaves about 11–21 mV before ripple/transients |
| 85°C / 2.5 A | 0.941–0.954 V | 0.949–0.962 V | Thin or negative DC margin in the higher-loss scenario |
| 85°C / 3 A | 0.927–0.943 V | 0.937–0.952 V | Cannot advertise 3 A capability |

This table does not imply every assembled board will exhibit those extrema. It demonstrates that the prior resistor-only approximately 16 mV margin at 3 A can be consumed by ordinary copper loss. It also shows why the 12 mΩ change is worth making. The 2 A / 85°C scenario has no guaranteed transient allowance until the actual supply-and-return resistance, load waveform and rail ripple are measured or validated. Copper process variation, aging, solder/package loss and unequal thermal conditions need separate treatment.

## Why the 12 mΩ part is a defensible substitution

[Vishay WSLP, document 30122](https://www.vishay.com/docs/30122/wslp.pdf), supports WSLP1206, 1 W at 70°C, ±1% option, component TCR ±75 ppm/°C over −55…155°C for this resistance range. Its ordering syntax yields **WSLP1206R0120FEA**; the linked [standard decade table](https://www.vishay.com/doc?30117) includes 12. The 12 and 15 mΩ selections occupy the same 6–50 mΩ dimensional group, preserving the existing footprint/body selection. This verifies the ordering configuration; it is not an inventory or assembly approval.

Conservative minimum including initial tolerance and the largest 130°C excursion from 25°C is:

**12 mΩ × 0.99 × (1 − 75×10⁻⁶ × 130) = 11.764 mΩ.**

This is above the 10 mΩ distributed-load resistance criterion in [TI section 10.3.2](https://www.ti.com/lit/ds/symlink/tps62135.pdf), even before adding positive PCB resistance. That application example supports retaining isolation; it does not prove complete loop stability for our particular capacitance distribution. Keep C5, VOS and feedback upstream of R9 and all FPGA bulk downstream. Do not remove or short R9.

At 3 A the 12 mΩ part dissipates approximately 0.109 W including +1% tolerance; at 85°C with TCR it is about 0.110 W. This is comfortably below the family's temperature-derated nominal power rating, but actual solder/board thermal conditions still determine resistor temperature. Save about 9.1 mV and 27 mW compared with 15 mΩ at 3 A. Long-term drift is not included in the minimum above.

## Actions without delaying the routing work

1. Apply only the R9 Value/MPN/Status delta to matching native schematic, PCB and manifest. Keep topology, 1.02493 V setting and R122 unchanged.
2. Preserve the two existing core injection vias. If easy in the final source area, wider C5→R9 copper and additional short parallel source vias can recover a few more millivolts. They are incremental improvements; no specific new coordinates are asserted collision-free here.
3. After all copper is integrated, recheck the supply/ground plane connections and perforations, then quantify the actual resistance or measure voltage at the FPGA against nearby FPGA ground under load. Do not measure only at C5 and call that FPGA voltage.
4. Use the actual implemented bitstream's current estimate and a load-step test to establish the operating envelope. Verify both 0.95 V minimum at load and 1.05 V maximum at light load/startup/load removal. Retain **3 A unqualified** and **2 A / 85°C screening only** in user-facing status until this evidence exists.
