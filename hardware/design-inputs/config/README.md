# Howard FPGA RevC: configuration design inputs

> Imported dated source note; links adapted for this repository. Read [current status](../../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Engineering draft. These mappings use the XC7A200T SBG484 package, not an older XC7A35T board. Application interfaces are still unassigned.

## Proposed boot architecture

- U1: XC7A200T-1SBG484C candidate. Bank 0 and bank 14 at +3V3.
- U2: S25FL256SAGMFI000, 256 Mbit configuration flash, SOIC-16W.
- CFGBVS directly to +3V3. Master SPI mode M[2:0] = 001.
- Six QSPI signals connect the flash and FPGA: clock, chip select, and four data signals.
- J4 provides independent physical JTAG access before any FPGA program loads. The custom 2x3, 1.27 mm header requires a matching adapter.
- 100 MHz oscillator remains a candidate; W19 is a verified bank-14 MRCC input, but is deliberately UNASSIGNED until the oscillator and bank plan are settled.

The 77,845,216-bit uncompressed FPGA configuration fits the 256 Mbit flash. Flash is for boot storage, not the recording buffer. The boot clock is CCLK, separate from the application oscillator. The ASIC clock remains 32 MHz.

## U1 physical configuration pins

| Ball | AMD pin function | Proposed net |
|---|---|---|
| L12 | CCLK_0 | CCLK_FPGA |
| V12 | TCK_0 | JTAG_TCK |
| T13 | TMS_0 | JTAG_TMS |
| R13 | TDI_0 | JTAG_TDI |
| U13 | TDO_0 | JTAG_TDO |
| N12 | PROGRAM_B_0 | PROGRAM_B |
| U12 | INIT_B_0 | INIT_B |
| G11 | DONE_0 | DONE |
| U8 | CFGBVS_0 | +3V3 |
| U11 | M0_0 | MODE_M0 |
| U10 | M1_0 | MODE_M1 |
| U9 | M2_0 | MODE_M2 |
| P22 | IO_L1P_T0_D00_MOSI_14 | QSPI_IO0_FPGA |
| R22 | IO_L1N_T0_D01_DIN_14 | QSPI_IO1_FPGA |
| P21 | IO_L2P_T0_D02_14 | QSPI_IO2_FPGA |
| R21 | IO_L2N_T0_D03_14 | QSPI_IO3_FPGA |
| T19 | IO_L6P_T0_FCS_B_14 | QSPI_CS_N |
| U22 | IO_L3P_T0_DQS_PUDC_B_14 | PUDC_B |
| F12 | VCCO_0 | +3V3 |
| T12 | VCCO_0 | +3V3 |
| M14 | VCCO_14 | +3V3 |
| P18 | VCCO_14 | +3V3 |
| R15 | VCCO_14 | +3V3 |
| T22 | VCCO_14 | +3V3 |
| U19 | VCCO_14 | +3V3 |
| Y20 | VCCO_14 | +3V3 |

Bank-0 supply balls F12/T12 and all six bank-14 supply balls must share the proposed +3V3 rail. Their decoupling belongs to the full power design. Bank 14 cannot simultaneously supply 1.5 V ASIC I/O in this architecture.

## U2 exact flash connections

For the exact **S25FL256SAGMFI000** ordering code, model `00` does not expose RESET# or VIO. Pins 3 and 14 are RFU. Treating these as active reset and supply pins would silently substitute a different device model.

| Pin | Exact function | Proposed connection |
|---|---|---|
| 1 | HOLD#/IO3 | QSPI_IO3 |
| 2 | VCC | +3V3 |
| 3 | RFU | Leave unconnected |
| 4 | DNU | Leave unconnected |
| 5 | DNU | Leave unconnected |
| 6 | RFU | Leave unconnected |
| 7 | CS# | QSPI_CS_N |
| 8 | SO/IO1 | QSPI_IO1 |
| 9 | WP#/IO2 | QSPI_IO2 |
| 10 | VSS | GND |
| 11 | DNU | Leave unconnected |
| 12 | DNU | Leave unconnected |
| 13 | NC | Leave unconnected |
| 14 | RFU | Leave unconnected |
| 15 | SI/IO0 | QSPI_IO0 |
| 16 | SCK | QSPI_SCK |

RFU/DNU/NC pads are not routing channels or convenient electrical tie points. The datasheet permits DNU pins to be left unconnected; that is the selected draft treatment.

## J4 custom programming header

| Pin | Signal |
|---|---|
| 1 | +3V3 target voltage reference |
| 2 | GND |
| 3 | JTAG_TCK |
| 4 | JTAG_TMS |
| 5 | JTAG_TDI |
| 6 | JTAG_TDO |

This is not the ARM or Digilent connector pinout. Clearly label pin 1 and provide an adapter drawing. The reference pin is not a board power input. The external programmer must use the same voltage as VCCO_0. No onboard USB bridge is needed for this header. The FPGA JTAG pins have internal pull-ups; additional JTAG pull-up components were not added to this draft.

## Configuration component population

| Reference | Value / item | Purpose / placement |
|---|---|---|
| SW1 | PROGRAM_B_RESET | Candidate footprint; exact switch order code must be checked against mechanical drawing. |
| R101 | 4.7k | UG470 requires external pull-up <=4.7k. |
| R102 | 4.7k | UG470 requires external pull-up <=4.7k. |
| R103 | 10k | Optional external pull-up proposed populated; DONE already has internal pull-up. No LED directly loading DONE. |
| R104 | 4.7k | UG470 FCS_B external pull-up <=4.7k. |
| R105 | 4.7k | UG470 SPI x4 pull-up; do not tie directly high. |
| R106 | 4.7k | UG470 SPI x4 pull-up; do not tie directly high. |
| R107 | 1k | M0=1; valid <=1k mode strap. |
| R108 | 1k | M1=0; valid <=1k mode strap. |
| R109 | 1k | M2=0; M[2:0]=001 Master SPI. |
| R110 | 1k | Disables internal user-I/O pull-ups during configuration. External application-specific startup pulls remain required where needed. |
| R111 | 22 | Provisional source termination; place next to U1 CCLK. Final value requires signal-integrity review, not established by a universal rule. |
| R112 | 0 | Series tuning footprint; zero-ohm initial population. |
| R113 | 0 | Series tuning footprint; zero-ohm initial population. |
| R114 | 0 | Series tuning footprint; zero-ohm initial population. |
| R115 | 0 | Series tuning footprint; zero-ohm initial population. |
| C101 | 100nF_16V_X7R | Proposed local U2 bypass, close to pin2/pin10. |
| C102 | 1uF_10V_X7R | Proposed U2 local bulk; effective capacitance/rating must be checked. |

Draft population: **1 flash, 1 JTAG header, 1 pushbutton, 15 resistors, 2 flash capacitors**. The FPGA and all power-network capacitors are counted elsewhere. R103 is an optional external DONE pull-up proposed populated, not an AMD requirement. R111 is a provisional 22 ohm source termination; R112–R115 are zero-ohm tuning footprints. These values require layout review. Exact passive, switch, and header ordering codes remain procurement work.

PUDC_B is strapped high through 1 kohm in this proposal. This disables the global configuration pull-ups. The external ASIC reset, stimulation and other control lines still need explicit safe startup biases based on ASIC requirements; this strap does not solve those requirements. SW1 pulls PROGRAM_B low for manual reconfiguration. INIT_B remains accessible to debug boot or hold configuration until supplies/flash are ready.

## Boot verification still required

- Select and confirm the flash definition in the actual installed Vivado tool; confirm quad-read/QUAD-bit handling and image-generation settings.
- Use CCLK as the SPI startup clock. Set the final configuration rate from flash timing, FPGA timing and interconnect analysis.
- Keep initial boot-image planning explicit. The flash exceeds the 16 MiB 24-bit address range; images above that range require the correct addressing mode and boot settings.
- Check flash-ready timing against FPGA initialization, including supply ramps and any warm-reconfiguration state left by application flash accesses.
- Bring up JTAG identification, volatile bitstream loading, indirect flash programming, cold boot, manual PROGRAM_B reload, INIT_B/DONE behavior, and repeat power cycles.
- No encrypted boot-key battery is assumed; E12 VCCBATT may go to GND if that requirement is confirmed.

## Full-board scope checklist

- **Power:** assign every FPGA core, BRAM, auxiliary, bank, analog and transceiver supply pin; complete decoupling, sequencing, current/thermal checks, XADC treatment and unused-GTP treatment.
- **Routing interface:** agree connector count and exact pin map, carrier revision, ASIC per-pin voltages/timing, shared versus per-chip controls, power direction/current and startup states. Leave pending signals UNASSIGNED.
- **Micro-HDMI:** select signaling method, lane/clock/return allocation, receiver interface, cable, grounding, protection and termination. A connector footprint does not complete the data path.
- **RAM:** choose recording-buffer type/capacity and controller, then assign banks/pins, supply/VREF/termination and timing constraints. Boot flash does not replace this buffer.
- **Implementation:** validate the full package/bank budget in Vivado, complete schematic/netlist and PCB, select manufacturable stackup/escape geometry, then run ERC/DRC, source-to-layout parity, timing and power checks.

## Files and evidence

- [Machine-readable configuration inputs](config_design_inputs.json)
- [All 484 FPGA pins](xc7a200tsbg484_pin_inventory.json)
- [Original AMD CSV](xc7a200tsbg484pkg.csv) and [TXT](xc7a200tsbg484pkg.txt), extracted unchanged from the archived AMD ZIP.
- [Validation record](validation.json): all 484 CSV/TXT ball names, banks and I/O types agree.
- [AMD UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config): Table 1-1; Tables 2-4/2-6; Master SPI x4; JTAG configuration. Local v1.17 dated 2023-12-05.
- [Infineon flash datasheet](https://www.infineon.com/assets/row/public/documents/10/49/infineon-s25fl128s-s25fl256s-128-mb-16-mb-256-mb-32-mb-fl-s-flash-spi-multi-io-3-v-datasheet-en.pdf): Rev. T, 2025-04-21, sections 3.1, 3.6, 3.19, 3.20 and 17.1–17.2.
- [Exact flash product](https://www.infineon.com/part/S25FL256SAGMFI000).
