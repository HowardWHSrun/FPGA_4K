# Two indicators and edge FPGA I/O — integration candidate

**Update:** The later [staged KiCad LED/TP candidate](Two_LED_TP_Integration_Candidate.md) uses one provisional 3.3 kΩ 0603 current limit in each LED branch for the still-open 5 V/12 V input choice, a 470 kΩ gate pull-down, and the standard `DMN52D0U-7` MOSFET. Its native sandbox checks supersede the preliminary resistor and package suggestions below.

**28 September 2026. Design study only; nothing on this page is routed or assembled.** The 28 September meeting record calls for two indicators: input power and FPGA configuration. It did not request a third application LED. The present schematic already has `FPGA_DONE` pulled to `VCCAUX_1V8` by R110 = 4.7 kΩ; retain that configuration pull-up.

## Small circuit to add

| Ref | Connection and purpose | Candidate part/package |
|---|---|---|
| D1 | Red `PWR IN`: supply input → R130 → D1 anode; D1 cathode → GND. This indicates connector input voltage, not that every FPGA rail is good. | Kingbright `APTD1608LSURCK`, 0603 LED, local `CoreSupport:LED_SMD__LED_0603_1608Metric`. Verify pad 2 = anode and pad 1 = cathode on the final symbol/footprint. |
| R130 | Input LED current limit. | 5.1 kΩ for 12 V candidate; 1.5 kΩ for 5 V candidate; local 0402 resistor. |
| D2 | Green `DONE`: supply input → R131 → D2 anode; D2 cathode → Q1 drain. The light comes on after DONE rises. It does not prove the application design or ASIC link works. | Kingbright `APTD1608LZGCK`, 0603 LED, same local footprint. |
| R131 | DONE LED current limit. | 4.7 kΩ for 12 V candidate; 1.2 kΩ for 5 V candidate; local 0402 resistor. |
| Q1 | NMOS low-side LED driver: gate → existing `FPGA_DONE`; source → GND; drain → D2 cathode. No continuous LED current goes through the FPGA DONE pin. | Diodes Inc. `DMN52D0UQ-7`, SOT-23, 50 V drain rating, specified 4 Ω max at 1.8 V gate, 39 pF typical input capacitance. Make/copy a portable local SOT-23 footprint and confirm G/S/D pad mapping against the package drawing. |
| R132 | Gate pull-down Q1 gate → GND so D2 stays dark while FPGA 1.8 V/DONE is absent. | 100 kΩ, local 0402 resistor. R110 and R132 give about 1.72 V at the gate when DONE releases high; verify the high level in startup simulation/bring-up. |

At 12 V nominal, red current is about `(12−1.75)/5.1k = 2.01 mA`, green about `(12−2.65)/4.7k = 1.99 mA`. The corresponding worst resistor dissipation is roughly 22 mW. At 5 V, the alternate resistors give about 2.17 mA red and 1.96 mA green using typical LED forward voltages. These are schematic estimates; set final values after the cable voltage and LED brightness are chosen. `LINK_12V` is presently an unprotected input net. If entry protection is added, attach D1/D2 to the intended post-protection input net. Do not place a 5.5 V-only open-drain buffer directly on a 12 V LED branch.

The green low-current LED needs more than the board's 1.8 V rail for useful headroom. The MOSFET accommodates either a 5 V or 12 V input candidate and gives the DONE pull-up only a small capacitive load. AMD recommends an LED driver for DONE/INIT_B; this implements the requested DONE indicator with one transistor. Preserve R110 and its existing FPGA configuration behavior. The LED circuit remains a review candidate until input voltage and bring-up tests are settled.

## Edge I/O test access

Use **ten** presently unconnected 1.5 V FPGA I/O balls and **two** ground pads. These are accessible bare copper pads near the board edge; they are not a card-edge connector, and no plated castellation is implied. All ten are 1.5 V bank I/O: never attach a 3.3 V probe driver. Add clearly named schematic nets such as `DBG_IO_B34_0` through `_6` and `DBG_IO_B15_0` through `_2`; remove each corresponding `no_connect` marker; attach one test-point symbol to each net. The GND pads get GND test-point symbols. Set all twelve test-pad instances `in_bom no`, and exclude their PCB footprints from purchasing and placement exports.

| Pad | U1 ball | Bank | Schematic `review_02_fpga_io.kicad_sch` no-connect coordinate (mm) | PCB U1 ball center (mm) | Candidate PCB pad center (mm) |
|---|---|---:|---|---|---|
| TP128 | GND | — | — | — | (12.5, 46.2), south edge |
| TP129 | V2 | 34 | (378.46, 170.18) | (19.0, 32.3) | (14.0, 46.2) |
| TP130 | V3 | 34 | (378.46, 167.64) | (19.8, 32.3) | (15.5, 46.2) |
| TP131 | V4 | 34 | (378.46, 180.34) | (20.6, 32.3) | (17.0, 46.2) |
| TP132 | V6 | 34 | (378.46, 205.74) | (22.2, 32.3) | (18.5, 46.2) |
| TP133 | U7 | 34 | (378.46, 203.20) | (23.0, 31.5) | (20.0, 46.2) |
| TP134 | V7 | 34 | (378.46, 210.82) | (23.0, 32.3) | (21.5, 46.2) |
| TP135 | V8 | 34 | (378.46, 208.28) | (23.8, 32.3) | (23.0, 46.2) |
| TP136 | GND | — | — | — | (41.7, 35.0), east edge |
| TP137 | G16 | 15 | (210.82, 190.50) | (30.2, 23.5) | (41.7, 36.5) |
| TP138 | H16 | 15 | (210.82, 187.96) | (30.2, 24.3) | (41.7, 38.0) |
| TP139 | G17 | 15 | (210.82, 182.88) | (31.0, 23.5) | (41.7, 39.5) |

The active outline is x = 4.5…43, y = 4.5…47.5 mm. The edge locations leave 0.8 mm or more from a 1 mm copper pad to the corresponding cut edge. The existing local `CoreSupport:TestPoint__TestPoint_Pad_D1_0mm` uses a 2 mm diameter courtyard, so it **cannot** be repeated at 1.5 mm pitch without courtyard DRC errors. Create a distinct local `EdgeProbePad_1.0mm_P1.5mm` footprint: 1.0 mm round F.Cu/F.Mask pad, no F.Silk circle, and 1.2 mm courtyard; labels in F.Fab and a keyed board map with small legible F.Silk labels placed outside the pad strip. Check probe fixture pitch, mask expansion, copper-to-edge clearance, and pad/silk DRC against the final fabricator rules. These coordinates are placement candidates, not a passed DRC result.

The bank-34 group exits the south side of U1 near the south test strip. The bank-15 group exits U1's east side toward the east strip. Reserve L2/L5/L7 as ground planes and maintain the L1/L3/L6 stepped ASIC escapes from Gerald's layer study. No test-pad route is included in this revision.

## Native integration checks

1. Add D1/D2, Q1, R130–R132 to a small diagnostics block, with exact net labels and local symbol/footprint libraries. The LED footprint's pad orientation and the SOT-23 G/S/D pin numbers must match datasheets.
2. Export a fresh schematic netlist. Confirm R110 remains on `FPGA_DONE`, Q1 gate is only on DONE and R132, Q1 drain only on D2 cathode, and D1/D2 anodes reach the chosen input net through their own resistors.
3. Add TP128–TP139 only after rechecking the ten balls still have `unconnected-...` PCB nets. Export netlist again and compare every U1 ball → TP pad mapping. Count ten I/O + two GND pads and zero extra purchased components for pads.
4. Place LEDs where visible and pads where a probe can reach them; rerun native KiCad ERC, DRC and schematic/PCB pad parity. Record unrouted count separately and inspect the pad strip visual. Do not interpret a placement DRC pass as a route or production approval.

## Sources

- Local 28 September meeting notes (local source; not included in web package) and [stepped-layer study](Layer_By_Layer_Escape_Study.md).
- [AMD UG949, Board Design Tips](https://docs.amd.com/r/2024.2-English/ug949-vivado-design-methodology/Board-Design-Tips?contentId=nEa6Pem_nCPVlrE160coEw) and [AMD UG470](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content): LED drivers for configuration indicators.
- [Kingbright low-current red LED](https://www.kingbrightusa.com/images/catalog/SPEC/APTD1608LSURCK.pdf), [green LED](https://www.kingbrightusa.com/images/catalog/SPEC/APTD1608LZGCK.pdf): 0603 packages, 2 mA forward voltage and brightness data.
- [Diodes DMN52D0UQ datasheet](https://www.diodes.com/datasheet/download/DMN52D0UQ.pdf): 50 V SOT-23 NMOS and 1.8 V gate specification.
