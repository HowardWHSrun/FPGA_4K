# ASIC power: recovered values and provisional capacity calculations

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

2026-09-18. This is a design calculation, not a measured power report or a released schematic. Original files were not changed.

## 1. Quantities we can calculate now

Gerald's original slide 7 specifies recording power of approximately 17.24 µW/channel, excluding external LDOs. Its diagram shows 23% LNA, 16% PGA, 13% driver, 36% ADC and 12% I/O. The target is eight 512-channel ASICs.

| Quantity | Calculation | Result |
|---|---|---:|
| One ASIC recording power | 512 × 17.24 µW | 8.827 mW |
| Eight ASICs recording power | 4096 × 17.24 µW | 70.615 mW |
| Equivalent current if all this power came from 1.5 V | 70.615 mW / 1.5 V | 47.08 mA |
| Two-times recording power allowance | 2 × 70.615 mW | 141.23 mW |

The 47.08 mA is a useful scale estimate. It is not a measured current or a budget assigned to any particular rail. The slide is a nominal recording specification, not a worst-case guarantee across voltage, temperature, clocking, output loading or stimulation.

The slide's rounded percentages give these nominal block estimates across eight chips:

| Block | Nominal power | Conditional current at 1.5 V |
|---|---:|---:|
| LNA | 16.24 mW | 10.83 mA |
| PGA | 11.30 mW | 7.53 mA |
| ADC driver | 9.18 mW | 6.12 mA |
| ADC | 25.42 mW | 16.95 mA |
| I/O | 8.47 mW | 5.65 mA |

Mapping LNA+PGA onto VDD_FE, driver onto VDD_DRIVER and I/O onto DVDD would be a working hypothesis. The sources do not establish a complete mapping, including clock-generator and reference current. Do not treat this table as a verified per-rail budget.

## 2. Actual setpoints in the supplied LDO design

A fresh KiCad netlist export of the original LDO schematic was inspected. The nine components are LT3042xMSE. Nominal output is 100 µA × RSET above the regulator's own GND node.

| Regulator | Output net | SET resistor | Nominal output reference | Input net |
|---|---|---|---|---|
| U1 | VDD_FE | R4, 15 kΩ | +1.50 V relative to AGND | 3V3 |
| U2 | VDD_ADC | R5, 15 kΩ | +1.50 V relative to DGND | 3V3 |
| U3 | VDD_DRIVER | R6, 15 kΩ | +1.50 V relative to AGND | 3V3 |
| U4 | DVDD | R3, 15 kΩ | +1.50 V relative to AGND | 3V3 |
| U5 | REF_VDD | R7, 15 kΩ | +1.50 V relative to AGND | 3V3 |
| U6 | VDD_CGEN | R2, 16 kΩ | +1.60 V relative to AGND | 3V3 |
| U7 | REF_VCM | R1, 7.5 kΩ | +0.75 V relative to AGND | 3V3 |
| U8 | VDD10 | R9, 90 kΩ | +9.00 V relative to AGND | INPUT_VDD10 |
| U9 | VSS10 | R8, 90 kΩ | INPUT_VSS10 + 9.00 V, if this floating circuit regulates | AGND |

The voltage names are not reliable numerical specifications. VDD10 is programmed to 9 V by the provided resistor. U9's own GND and exposed pad connect to INPUT_VSS10, while its IN connects to AGND. This is not a negative-voltage generator. Its topology, external negative input and ability to regulate the intended load need review. For example, INPUT_VSS10 = −10 V would imply an ideal setpoint of −1 V, not −10 V. No claim that this circuit is correct follows from the algebra.

J15 exports INPUT_VDD10 and J8 exports INPUT_VSS10. The board does not create those input supplies. AGND and DGND are separate named nets in this schematic; their intended system connection must be checked.

Further source audit found that all nine regulators use LT3042xMSE symbols but DFN-10 footprints. The MSOP and DFN manufacturer's pin maps differ. Reconcile the exact ordered package, symbol numbering and PCB pad mapping before reusing this design. This is a source-file mismatch, not a statement about how any physical board was assembled. See the Gerald question list and source diagram (local archive: `9_18_26/detail_review/gerald_questions_review.md`) for exact locations.

The FPGA_512 netlist instead exports +2 V through CN1 pins 1 and 2. Therefore the older FPGA board and this 3V3-input LDO design must not be assumed to be an electrically interchangeable pair.

## 3. Regulator capacity we can provision

The LT3042 is a 200 mA regulator. Its typical quiescent current is around 2 mA at light load and rises with output current. Its thermal limits still apply. The supplied design grounds ILIM, using internal current limiting rather than a user-selected precision current limit. [ADI LT3042 datasheet, pages 1, 3 and 19](https://www.analog.com/media/en/technical-documentation/data-sheets/lt3042.pdf).

**A 200 mA LDO output class per low-voltage rail is a defensible first-prototype provision**, consistent with the existing reference and much larger than the slide-derived nominal block currents. This is a component-capacity choice, not a claim that each rail consumes 200 mA. Noise and trace voltage drop might motivate several local regulator groups instead of one shared group.

An explicit conservative arithmetic example for one shared low-voltage group is:

- Assume all recording power is drawn from positive rails of at least 0.75 V and reserve twice the slide's nominal recording power.
- Aggregate output current is then at most 141.23 mW / 0.75 V = 188.3 mA under those assumptions. This is a bound on the assumed load model, not a guaranteed ASIC maximum.
- Seven enabled LDOs add around 14 mA of typical light-load overhead; current-dependent overhead must be included in the final budget.
- A **0.5 A-class 3.3 V pre-regulator allocation for the ASIC low-voltage section** is a reasonable provisional starting capacity for this scenario. It does not include FPGA power, high-voltage stimulation, startup inrush or extra I/O loading, and the number of regulator groups must be decided before freezing it.

One 200 mA LDO dropping 3.3 V to 1.5 V would dissipate approximately 0.36 W at full load, plus its own operating losses. Multiply actual loads rather than all regulator nameplate ratings to estimate board heat. Thermals, transient droop and effective capacitor value under bias still need validation.

The low-voltage LDO count matters even with tiny ASIC loads:

| Low-voltage regulator arrangement | Typical overhead current | Input power at 3.3 V, before ASIC load |
|---|---:|---:|
| One shared group of seven | 14 mA | 46.2 mW |
| Four groups of seven | 56 mA | 184.8 mW |
| Eight groups of seven | 112 mA | 369.6 mW |

These are light-load estimates using 2 mA/device, not guaranteed maxima. High-voltage LDOs have different input rails and are excluded from this table. Blindly duplicating every reference regulator per ASIC can make regulator overhead exceed the ASIC recording power.

## 4. Stimulation and remaining measurements

Slides 18–19 specify up to 22.5 µA per stimulator and ±10 V compliance. If all 8 × 128 stimulators were simultaneously active at maximum magnitude, the sum of output-current magnitudes would be 23.04 mA. At an assumed 10 V magnitude per active output that corresponds to 230.4 mW of output power; multiply by actual duty factor for average output power. These assumptions do not establish actual allowed concurrency, rail current, supply efficiency or ASIC internal dissipation. Compliance voltage is not a power-supply specification.

Additional digital output power can be estimated with P = C × V² × f × a for each switched load, where a counts charging events per clock cycle. For example, 10 pF at 1.5 V with one charging event per 32 MHz cycle is 0.72 mW per line. The 10 pF and activity are illustrative; actual connector, trace and receiver capacitance must replace them, and existing I/O consumption must not be counted twice.

The required next evidence is a short per-rail current/voltage measurement table for the actual ASIC/carrier revision: reset, recording at 16 MHz and 32 MHz, and the intended stimulation patterns. Combined with startup current and ripple/transient measurements, it closes the capacity budget. No authoritative per-rail maximum-current table was found in the reviewed slides, FPGA code or LDO schematic.

## Original evidence

- [Gerald's original slides](../slides/Chip_FPGA_Interface.pptx), slide 7 and slides 18–19.
- [Original LDO schematic](../../hardware/references/ldo-routing/PCB.kicad_sch), U1–U9 and R1–R9.
- [FPGA_512 historical power netlist](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/FPGA%20board.net#L3199-L3231).
- [ADI LT3042 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/lt3042.pdf).
