# Independent power review of the frozen 33 × 36 mm routing board

26 September 2026. Reviewed canonical file: `hardware/FPGA100T_33x36_Routing.kicad_pcb`.

**SHA-256: `ae601df3925e5ec5e90c8a2e747356e432d0558e820199cf7c01c6bf8a7fef96`.** The canonical file differs from the independently checked v3 integration candidate only in two non-electrical drawing labels. Exact reversal of those two strings restores the entire earlier file byte-for-byte (Board_Annotation_Update.json); all copper, nets, geometry and pad assignments are preserved. No CAD files were modified during this final audit.

## Confirmed

- **76 critical rail/pin invariants pass** in fresh native KiCad readback. Regulator VIN/GND/EN/MODE/PG/SS/FB/VOS/VSEL assignments match the intended four-converter circuit.
- R9 separates `VCORE_REG_1V025` from `VCCINT_1V0`. R122 separates `VAUX_REG_1V803` from `VCCAUX_1V8`; U3 local Cout/VOS/feedback remain upstream of R122.
- Configuration/bank14/flash/oscillator use the 1.8 V AUX domain; bank16 and C57–C63 use 2.5 V; CFGBVS is grounded. R5 is 180 kΩ, 0.1%.
- The native MPN fields contain the 1.8 V flash MX25U12835FM2I-10G, 1.8 V oscillator ASE3-32.000MHZ-L-C-T, and all four corrected 22 µF/25 V 1206 converter input capacitors.
- Integration preservation checks retain all 130 footprints and 811 pad records, all 1,223 unrelated copper objects, four ground-zone definitions and the saved design-rule settings. Only the previous local ground-return contribution was replaced.
- Local power contribution comprises 132 converter-loop/control traces and the accepted v3 ground-return replacement of 40 traces plus 40 vias. The final complete board contains 1,139 tracks and 164 vias; the other copper was produced and checked by the parallel routing work.
- Our filled-zone DRC: **0 physical violations, 146 unconnected items**. The parent independently reports the same result with all-track-error checking and 0 schematic-parity issues. This is a partial routing milestone, not fabrication release.

## Specific unfinished connection

**U4 pin 11, VSEL, is assigned to GND but still lacks a physical copper connection.** It is one of the eight remaining GND unconnected items. The short through-via approaches were obstructed by the new PG routes and adjacent power copper. A bounded 0.10 mm logic-only strap was tested and rejected because it violated clearance to PG_AUX. No smaller clearance, removed signal connection or unreviewed via technology was accepted.

The remaining seven GND opens and all global rail-distribution opens must also be resolved. Counts in this exact snapshot are:

| Net | Native unconnected items |
|---|---:|
| GND | 8 |
| LINK_12V | 9 |
| VCCAUX_1V8 | 49 |
| VCC_LINK_2V5 | 8 |
| VCC_ASIC_1V5 | 37 |
| VCCINT_1V0 | 34 |
| VAUX_REG_1V803 | 1 |
| **Total** | **146** |

## Electrical qualification still required

The assigned power topology and local copper do not guarantee that the board will start or sustain application load. D2/input protection is absent. The external 12 V branch/cable protection and power-off mating contract remain dependencies. The application current estimate, regulator stability, complete rail/return voltage drop, load-transient behavior, startup/shutdown/reset timing and thermal performance remain unqualified.

The core feed is particularly sensitive to copper loss. Under an explicitly illustrative 35 µm copper assumption, the retained 3.594 mm × 1.20 mm pre-R9 path contributes about 1.475 mΩ; a further 13 mm × 1 mm feed would contribute about 6.403 mΩ. At 3 A the latter alone exceeds the previously calculated approximately 16 mV static margin. Broad final copper and actual stackup/return/via calculations are needed; this arithmetic is not a current-capacity rating.

Primary documents were rechecked: TI TPS62135 SLVSBH3B §§7.5, 9.3.2, 9.4.7, 10.3.2, 10.3.4 and 12.1; AMD DS181 v1.27.1 pp8–9; AMD UG483 v1.14 p24 and pp29–30. The separate routing-recommendations report distinguishes those source requirements from geometry-based design recommendations.

Evidence: `Final_Rail_Invariant_Check.json`, `Final_Power_Readback.json`, `Power_Ground_DRC_v3.json`, `Power_Ground_Verification_v3.json`, `Global_Power_Routing_Recommendations.md`.
