# Proposed FPGA board components · 29 September 2026

Zitong Xu’s proposed parts, supplied by Howard for Wednesday’s presentation. This is a component review, not a purchasing or fabrication release. Native CAD and the existing BOM are unchanged. [Supplied proposal](Zitong_Component_Proposal.txt) · [presentation slide](../../../presentation/meetings/2026-09-30.html#component-proposal).

| Role | Candidate | Verified short specification |
|---|---|---|
| FPGA | XC7A25T-2CSG325I | Artix-7; −2 speed grade; industrial grade; CSG325, 15 × 15 mm / 0.8 mm pitch |
| Status | Two LEDs | Proposed power and FPGA configuration indicators |
| Fabric clock | Abracon AX3-0006-T | 100 MHz; 1.8 V; HCSL; 3.2 × 2.5 mm |
| Boot flash | Macronix MX25U1632FZUI02 | 16 Mbit (2 MiB); 1.65–2.0 V; 2 × 3 mm USON-8 |
| GTP reference clock | SiT9507AI-02P1-1800-125.000000 | 125 MHz; 1.8 V; LVDS; 2.0 × 1.6 mm |
| Support | Connectors, micro-HDMI, power parts and test points | Exact choices and quantities remain open |

The FPGA’s package and ordering suffix are supported by [AMD DS180](https://docs.amd.com/api/khub/documents/2LByHkO~nSZXcei2D55fTg/content). Other component specifications come from the primary manufacturer sources below.

## Flash capacity and bank voltages

[AMD UG470, Table 1-1](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content) lists a 9,934,432-bit uncompressed XC7A25T bitstream and 16 Mbit minimum flash. One such image fits; two uncompressed images do not fit in 16 Mbit.

A level shifter is conditional on the configuration-bank plan. A compatible 1.8 V configuration interface can use direct signalling; reconcile that with the current 1.5 V ASIC-bank allocation, flash-connected balls, VCCO and [CFGBVS](https://docs.amd.com/r/2023.1-English/ug912-vivado-properties/CFGBVS) before selecting translation. Capacity alone does not verify Vivado programming support, boot timing or startup.

The [Macronix datasheet](https://www.macronix.com/Lists/Datasheet/Attachments/9050/MX25U1632F,%201.8V,%2016Mb,%20v1.2.pdf) identifies the exact package and voltage. Its 133 MHz fast-read capability requires the specified 10 dummy cycles; default 8 dummy cycles are limited to 104 MHz. That headline is not an established FPGA configuration-clock frequency.

## Clock outputs and jitter

The [Abracon AX3-0006-T datasheet](https://abracon.com/datasheets/AX3-0006-T.pdf) specifies **HCSL**. Its RMS phase jitter is 95 fs typical / 120 fs maximum over 12 kHz–20 MHz; the separately quoted 350 fs cycle-to-cycle metric is not the same measurement.

[SiTime’s exact 125 MHz part page](https://www.sitime.com/parts/sit9507ai-02p1-1800-125000000) specifies LVDS, 1.8 V, ±20 ppm and the 2.0 × 1.6 mm package. Its 29 fs typical headline is a family phase-jitter claim; exact 125 MHz test conditions and guaranteed limits require its detailed vendor datasheet. The slide therefore omits jitter comparisons.

The GTP MGTREFCLK input uses IBUFDS_GTE2 with external AC coupling and internal differential termination. Fabric HCSL input compatibility, selected clock-capable pins, bank voltage, I/O standard, bias and termination require their own interface plan. Also verify that 125 MHz supports the intended GTP PLL and line-rate settings. See [AMD UG482](https://docs.amd.com/v/u/en-US/ug482_7Series_GTP_Transceivers) and [UG471](https://docs.amd.com/v/u/en-US/ug471_7Series_SelectIO).

These checks define the next component decisions. No hardware operation is claimed.
