# Howard FPGA RevC - proposed power design inputs

> Imported dated source note; links adapted for this repository. Read [current status](../../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

This is a concrete schematic starting point, not a fabrication release. The input is proposed as 12 V; actual load currents, bank allocation and routing-board power handoff remain unconfirmed. No USB/FX3 converter is included.

## Four proposed rails

| Channel | Target | Divider top / bottom | Calculated setpoint | Inductor candidate | Sizing scenario |
|---|---:|---|---:|---|---:|
| 1 | 1 V | 2.49k / 10k, 0.1% | 0.999200 V | 3.3 uH, XAL6030-332MEC | 4 A |
| 2 | 1.8 V | 12.7k / 10.2k, 0.1% | 1.796078 V | 4.7 uH, XAL6060-472MEC | 4 A |
| 3 | 1.5 V | 8.87k / 10.2k, 0.1% | 1.495686 V | 10 uH, XAL4040-103MEC | 1.2 A |
| 4 | 3.3 V | 31.6k / 10.2k, 0.1% | 3.278431 V | 22 uH, XAL6060-223MEC | 1.2 A |

The last column is a component-sizing scenario, not measured FPGA demand or a guarantee that every output can sustain that load simultaneously. The actual load on every rail remains TBD. Feedback uses Vout = 0.8 V x (1 + Rtop/Rbottom). DC ranges in the JSON cover resistor tolerance and the PMIC reference only; ripple, transient droop and PCB drop are additional.

## Frequency and inductors

Use a proposed 68.1 kohm RT resistor: f = 298.62 kHz. At 15 V input and a provisional +10% frequency allowance, the 0.9992 V core rail requires approximately 202.8 ns on-time, above the 155 ns maximum minimum-on-time specification. A copied 600 kHz setting would not provide this margin. The 10% frequency allowance still needs verification over RT and temperature.

Inductor ripple uses Delta I = Vout x (1 - Vout/Vin)/(L x f). The calculation includes a 15 V upper analysis bound, -20% inductance and -10% frequency. It does not include further loss of inductance with DC bias/temperature; check those curves before release.

| Channel | Nominal ripple, 12 V | Corner ripple | Peak at sizing scenario | Minimum current-limit threshold |
|---|---:|---:|---:|---:|
| 1 | 0.930 A p-p | 1.314 A p-p | 4.657 A | 4.95 A |
| 2 | 1.088 A p-p | 1.565 A p-p | 4.782 A | 4.95 A |
| 3 | 0.438 A p-p | 0.626 A p-p | 1.513 A | 1.70 A |
| 4 | 0.363 A p-p | 0.542 A p-p | 1.471 A | 1.70 A |

Coilcraft Isat figures are typical 30% inductance-drop values at 25 C, not guaranteed hot current limits. The 4.7 uH and 22 uH XAL6060 choices are approximately 6 mm tall; they are conservative candidate selections rather than final size optimization.

## Exactly one dual MOSFET package

Q100 is Si7232DN-T1-GE3, PowerPAK 1212-8 Dual, approximately 3.3 x 3.3 mm. It contains the two external low-side MOSFETs for CH1/CH2. CH3/CH4 switches are internal.

The physical pinout is 1=S1, 2=G1, 3=S2, 4=G2, 5/6=D2, 7/8=D1. The installed KiCad footprint merges the drains into six logical pads: pad 5=D2 and pad 6=D1. The JSON intentionally uses this six-pad mapping; use a matching symbol. Do not connect an eight-pin symbol without explicit pad reconciliation.

## Support components and open values

The power input file contains 58 positions: 1 PMIC, 1 dual MOSFET package, 4 inductors, 27 capacitor positions and 25 resistor positions. 6 positions are explicitly DNP. These totals exclude the FPGA's UG483 network, clock/flash/DDR decoupling, the external input connector/protection and any additional link-specific supply circuitry.

Included are four 100 nF BST-to-SW bootstrap capacitors, four local 10 uF/25 V input capacitors, two 1 uF internal-supply bypass capacitors, eight feedback resistors, one RT resistor and two 22 kohm current-limit resistors. There are four series compensation resistors and capacitors plus four optional parallel pole-capacitor positions. Compensation values are deliberately marked TBD; 300 kHz reference examples are recorded separately, not represented as validated fitted values.

Nine regulator-local output-capacitor positions are reserved (2 x 100 uF, 3 x 47 uF, 4 x 22 uF). Reconcile them with FPGA capacitors on the same nets before calling them additional mandatory components. ADI's reference transient examples allow excursions larger than some FPGA rail budgets; do not equate reference component values with a verified FPGA supply.

## Proposed startup connections

A 115k/10k input divider gives about 10.092 V nominal CH1 enable threshold including the internal pulldown. CH1 PWRGD, pulled up to internal VREG, enables CH2. An AUX-fed 10k/10k divider shared by EN3/EN4 gives about 1.616 V nominal AUX threshold including both internal pulldowns. Startup/shutdown behavior still needs verification.

Both soft-start pins are pulled to ground through 0 ohm positions for 8 ms independent ramps. Two top resistor positions are DNP. The PMIC uses soft-start resistor settings, not external soft-start capacitors. Default PWRGD monitors CH1 only. Its proposed 5.1 V net must never connect directly to FPGA I/O.

Unused LDO pins EN5, FB5, VOUT5 and PVIN5 are grounded according to ADI employee guidance. PVIN5 must not receive 12 V. Internal VDD/VREG bypass nets are distinct from FPGA system supplies.

## Verification and remaining work

ADP5052 Table 7 was checked against rendered Figure 3 in the original ADI Rev D document obtained from a distributor mirror because direct manufacturer downloads timed out. The rendered drawing confirms pin 1 is BST3. Some indexed figure text incorrectly suggests pin 1 is PVIN1. The complete 48-pin map plus EPAD is in the JSON. CP-48-13 land-pattern/stencil/thermal-via validation remains open.

The Si7232DN pin drawing and installed six-pad footprint were compared directly. All four sizing scenarios pass the stated idealized peak-versus-minimum-current-limit arithmetic. No circuit simulation, PCB routing, hardware power test or thermal validation was performed.

| Open item | Owner / source to resolve it |
|---|---|
| Actual rail currents and load steps | Howard / FPGA implementation: XPE or post-implementation power analysis with activity assumptions plus measured peripheral/ASIC handoff loads |
| Input supply voltage and ASIC/routing power handoff | Howard + Zitong: Confirm source voltage/tolerance/transients, current and routing-board power responsibility |
| Total effective output capacitance and all compensation values | Howard power design: Reconcile regulator-local and UG483 per-net capacitor inventory; model DC bias/ESR and step response; calculate RC/CC/CCP, verify stability |
| PMIC and dual-FET simultaneous thermal capability | Howard power design: Dissipation/thermal model using actual loads, copper and airflow; verify on prototype |
| Hot inductor bias/saturation margin | Howard power design: Use inductance-versus-current/temperature curves and worst current-limit behavior; 25 C catalog Isat is not a guaranteed hot limit |
| ADP5052 land pattern and assembly stencil | Howard layout + fabricator/assembler: Validate CP-48-13, EP5.6, peripheral pads, paste apertures and thermal vias before release |
| FPGA bank rails, DDR VREF/VTT and GTP supplies | Howard interface design: Finalize bank map and micro-HDMI electrical link; these four bucks alone do not resolve optional transceiver/DDR support rails |
| Enable thresholds and powerdown sequence | Howard power design: Check startup, shutdown and brownout with actual capacitance/load and all connected devices |
| Final passive ordering codes | Howard procurement review: Select current stocked parts meeting values, tolerances, DC-bias capacitance and package specifications |

## Sources

- [ADI_ADP5052](https://www.analog.com/media/en/technical-documentation/data-sheets/ADP5052.PDF): Tables 3,7,9,10,12,14,15,16; Figures 3,43,55,57; component design equations
- [ADI_ADP5052_MIRROR](https://media.digikey.com/pdf/Data%20Sheets/Analog%20Devices%20PDFs/ADP5052_RevD_2017.PDF): Original Analog Devices document, rendered pages 9-10; not distributor parametric claims
- [VISHAY_DUAL](https://www.vishay.com/docs/68986/si7232dn.pdf): Page 1 pin configuration, electrical ratings, exact ordering code
- [VISHAY_PACKAGE](https://www.vishay.com/docs/71656/ppak12128.pdf): PowerPAK 1212-8 dual package dimensions
- [ADI_LDO_UNUSED](https://ez.analog.com/power/f/q-a/54153/buck-and-ldo-which-are-not-used-in-adp5052-are-safely-set-to-disable): ADI employee guidance to ground unused LDO PVIN5, EN5, VOUT5, FB5
- [ADI_EVAL](https://wiki.analog.com/resources/eval/adp5050-adp50525-channel-pmu): Reference topology, support part inventory; values not copied as a verified FPGA design
- [ADI_EVAL_IMAGE](https://wiki.analog.com/_media/resources/eval/figure_16._evaluation_board_schematic_of_the_adp5050_52.png): Visually reviewed circuit topology
- [COILCRAFT_XAL60](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xal/xal60xx/): Candidate MPNs and 25 C inductance/DCR/current data
- [COILCRAFT_XAL4040](https://www.coilcraft.com/en-us/products/power/high-voltage-inductors/xal/xal40xx/xal4040-103/): 10 uH candidate MPN and ratings
- [AMD_DS181](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet): FPGA rail requirements and recommended sequencing remain final verification input
- [AMD_UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB): FPGA decoupling must be included in total converter load/capacitance ledger

Source file hashes and exact component-to-net mappings are included in power_design_inputs.json. No Nexys Video schematic was consulted or copied for this input set.
