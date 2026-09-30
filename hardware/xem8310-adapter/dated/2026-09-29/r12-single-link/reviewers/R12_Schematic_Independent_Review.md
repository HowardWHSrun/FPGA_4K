# R12 single-link independent schematic review

PASS: 64 native XML structural checks; 45 physical components; native ERC reports 0 violations.

This validates the exported schematic allocation and component pin connections. The final PCB graph audit confirms all serial/pass-through routes, but four JTAG cable routes and five ground connections remain open; see `../validation/R12_Independent_Contact_Audit.md`.

| Cable contact(s) | Purpose / native endpoint |
|---|---|
| 1 | Target-derived 1.8 V reference and translator B-rail supply; U101.15 and probe J21.2 |
| 2 / 15 / 17 | TMS / TDI / TCK: center of three source selectors; 1.2 V XEM GPIO through fixed-direction translator or external probe |
| 18 | Target TDO to translator input U101.11 and probe J21.8 |
| 3 / 5 | Recording TX0 P/N to XEM MC3 41 / 43 |
| 6 / 8 | Recording TX1 P/N to XEM MC3 45 / 47 |
| 9 / 11 | Reserved P/N to XEM MC3 49 / 51 |
| 12 / 14 | Control RX P/N to XEM MC3 42 / 44 |
| 4 / 7 / 10 / 13 / 16 | SYS_GND common return |
| 19 | Protected 12 V branch output U301.6 |

Five Bank67 GPIOs are MC3 57/59/61/63/65 for TMS/TDI/TCK/TDO/OE_N. MC3.80 carries XEM 1.2 V DDR power and remains a matching-number pass-through. All 160 MC1/MC2 contacts and 67 remaining MC3 contacts are logically preserved; 13 diverted lower BRK contacts are intentionally isolated.

Essential remaining gates:

- Source is regulated 12 V. The SMBJ15CA candidate can clamp above the XEM 15 V maximum; separate qualified upstream overvoltage protection/source selection remains unresolved.
- R315 6.49 kΩ gives about 0.514 A nominal. The 0.24–0.32 A head demand is a selected 2 W FPGA allowance scenario, not a measured load or an XPE result. Cable/contact current, thermal limits and actual FPGA/ASIC activity must be qualified.
- Target-derived VTREF supplies translator VCCB, so the target must budget that current. It is never driven by the host.
- Physical source selectors must all select the same source; default recovery-probe selection and open ARM/branch-enable jumpers must be reflected during assembly.
- Copper connectivity, signal-reference geometry, SI/PI, stacked connector mechanics, firmware and hardware bring-up remain separate checks.

Native XML SHA-256: `e0571d340fa2a3f22d49ec2255a61a708f7f97875977283bbd4d0397ace5bfab`
