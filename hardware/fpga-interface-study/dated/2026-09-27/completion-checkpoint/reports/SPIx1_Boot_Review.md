# Fixed SPI x1 boot — selected minimum-parts change

27 September 2026 · selected by integration; source qualification and isolated schematic validation

**Normal flash boot does not require the two quad-data connections.** Select fixed one-bit Master SPI, remove R106/R107 and make U1.L14/M14 intentional NC. This reduces the planned compact design to **125 components / 752 numbered endpoints**, with **83 intentional NC and 19 reserved endpoints**. The 116 digital ASIC connections, external AC_IN contact and eight returned ASIC clocks are unchanged. Boot transfers fewer bits per clock than quad mode; acquisition bandwidth after configuration is unaffected.

AMD's 7-series guide assigns D00/D01 to standard SPI and requires D02/D03 only for x4. It documents a four-wire x1 interface, 0Bh fast read, CCLK startup and 24-bit addressing for flash up to 128 Mbit. Unused data pins are high impedance during configuration; JTAG remains independently available. [UG470 v1.17, printed pp26,46,48–53](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content).

The exact **MX25U12835FM2I-10G** supports 1.65–2.0 V and ordinary SPI 0Bh reads with a three-byte address/eight dummy clocks. Pin 3 is WP#/SIO2; **pin 7 is RESET#/SIO3, not HOLD#**. QE is nonvolatile, defaults to zero, and disables those alternate controls when enabled. Preserve normal SPI command mode, QE=0 and the existing CS/WP/RESET pull-ups. The flash requires at least 800 µs from valid VCC to CS assertion; power-cycle reset requires VCC below 0.9 V for at least 300 µs. These are pre-existing startup requirements, not new components demanded by x1. [Macronix PM1728 v1.9, pp7,15,31,38–39,79–80,88–90](https://www.macronix.com/Lists/Datasheet/Attachments/8704/MX25U12835F,%201.8V,%20128Mb,%20v1.9.pdf).

## Exact circuit change

| Item | Before | Selected result |
|---|---|---|
| R106, 0 Ω | FPGA_CFG_DQ2 ↔ FLASH_DQ2 | Remove both pads/component and only its obsolete connection copper |
| R107, 0 Ω | FPGA_CFG_DQ3 ↔ FLASH_DQ3 | Remove both pads/component and only its obsolete connection copper |
| U1.L14 / D02 | FPGA_CFG_DQ2 | Intentional NC, marker at (158.75, 101.60) on fpga_unit_01 |
| U1.M14 / D03 | FPGA_CFG_DQ3 | Intentional NC, marker at (158.75, 104.14) on fpga_unit_01 |
| R101, 4.7 kΩ | VCCAUX_1V8 → FLASH_DQ2 → U6.3 | Retain; now used solely as WP# pull-up |
| R102, 4.7 kΩ | VCCAUX_1V8 → FLASH_DQ3 → U6.7 | Retain; now used solely as RESET# pull-up |

R100/2.4 kΩ CS pull-up, R103/33 Ω CCLK path, R104/0 Ω DQ0 path, R105/33 Ω DQ1 path, U6 power/decoupling and every other endpoint remain. The retained `FLASH_DQ2`/`FLASH_DQ3` names identify local pull-up nets; neither flash control pin becomes NC. The change does not add an external flash-reset driver. Series termination on the essential clock/data paths remains subject to signal-integrity validation.

The manifest loses two components/four endpoints and gains two NC classifications. The original 87-row FPGA-unused list becomes **89 rows: 81 FPGA NC plus eight future-link reservations**; U4.7/U5.7 account for the other two board NCs. See the [current classification](U1_Unused_Pin_Classification.csv) and [exact delta](SPIx1_Endpoint_Delta.json).

## Build and programming contract

Use the [review-only configuration template](SPIx1_Boot_Constraints_REVIEW_ONLY.tcl): CONFIG_MODE SPIx1, SPI_BUSWIDTH=1, SPI_32BIT_ADDR=No, STARTUPCLK=Cclk and EXTMASTERCCLK_EN=Disable. Start with the documented 3 MHz nominal configuration rate and default rising-edge capture. This is deliberately a starting setting, not timing closure. Keep the fixed M[2:0]=001 straps and 1.8 V configuration-bank declarations. Select unused-pin behavior explicitly and leave L14/M14 out of functional top-level ports. [AMD 7-series property table](https://docs.amd.com/r/en-US/ug908-vivado-programming-debugging/7-Series-Bitstream-Settings), [CONFIG_MODE definition](https://docs.amd.com/r/2024.1-English/ug912-vivado-properties/CONFIG_MODE).

Generate an SPIx1 image for the actual 16 MiB flash, normally at address zero. Use a flash programmer/indirect JTAG loader that supports the exact device through ordinary SPI; its loader must not depend on DQ2/DQ3. Do not enter QPI, issue quad-program/read operations, or leave the device in deep power-down/busy state before FPGA configuration. Read back identification/status and the programmed image; preserve protection/OTP bits rather than blindly clearing registers. Check QE and normal command mode after programming. A selected flash MPN is not proof that an installed Vivado version has a matching programming algorithm. [AMD SPIx1 memory-file example](https://docs.amd.com/api/khub/documents/5P~3UdOsly0vpmX42taDfg/content).

The explicit SPIx1 choice must be consistent in every boot, update and fallback image. After configuration, application logic must keep flash CS inactive except during intentional SPI access. A new bitstream must not drive quad traffic into pulled-up disconnected pins. Ordinary direct JTAG FPGA programming remains available while flash-programmer integration is completed.

## Verification boundary

[Native trial validation](SPIx1_Native_Validation.json) confirms all 752 endpoints and the exact six-endpoint change in an isolated complete schematic project. ERC stays at 19 reserved-pin errors, four documented FB2/GND type conflicts and one analog-reservation warning. The trial is **not** final PCB evidence. Root's `SPIx1_Removal_Applied.json`, final matching XML/manifest and independent final PCB readback must establish integration.

The final physical BGA NC nets must match the native XML names:

- `unconnected-(U1A-IO_L2P_T0_D02_14-PadL14)`
- `unconnected-(U1A-IO_L2N_T0_D03_14-PadM14)`

No Vivado implementation, working image, flash-programming demonstration, assembled boot, acquisition run or manufacturing release is claimed. Cold power-up, warm reconfiguration, startup/flash readiness and signal integrity remain measurements for bring-up; removing optional quad paths does not substitute for them.
