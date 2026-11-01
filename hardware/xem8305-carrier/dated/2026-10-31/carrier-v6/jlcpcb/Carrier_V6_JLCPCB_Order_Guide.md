# Direct LDO Carrier V6 — JLCPCB guide

Prepared 31 October 2026 for engineering review and quotation. V6 is the current physical design: MC2.14 VREFP is connected to MC2.16 GNDADC. The original 80 parts, their placements and input circuit are retained. The Direct LDO Carrier is distinct from the standalone-FPGA companion LDO board and the XEM8310 carrier. This guide contains no account stock or order allocation claims.

Upload `Carrier_V6_PCB_Gerbers.zip` for PCB fabrication. For assembly use `Carrier_V6_Assembly_BOM.csv` and `Carrier_V6_CPL.csv`. The BOM has 42 exact-part groups / 80 fitted references, with each of the 39 public JLC codes used once. CPL contains 80 placements: three Top and 77 Bottom. The V6 Gerbers include the SYSMON link. The V6 BOM and native CPL retain the verified procurement/placement data; the export names are unified as V6. Do not upload the KiCad source ZIP as the Gerber file.

| Order setting | Requirement |
|---|---|
| Board | Four-layer FR-4; finished outline 53 × 83 mm, 1.6 mm nominal; do not rescale. Confirm any factory rails are removed to this finished outline. |
| Layer order | F.Cu / GND_1 (In1.Cu) / GND_2 (In2.Cu) / B.Cu. |
| Stack | JLC04161H-3313; confirm actual material/copper and impedance treatment. JLC's special-stack assembly route requires Standard PCBA. |
| Copper | 1 oz outer; intended nominal 0.5 oz inner, confirm actual selected stack. |
| Finish | ENIG. |
| Mask / legend | Green mask, white legend. |
| Vias | Tented on both faces as represented by the submitted mask. Resolve any unavailable/contradictory order option with factory CAM; do not silently alter mask intent. No plugging/filling/capping specified. |
| Assembly | Both sides: MC1–MC3 Top, all other 77 Bottom; include J3 THT/manual assembly. |
| Review | Manually review actual matched-part placement and production files before confirmation. |

The 76 publicly coded references are identified in the BOM. MC1, MC2/MC3 and U1 have three intentionally blank public-code cells; exact MPNs are listed in `Carrier_V6_Noncatalog_Parts.csv`. Confirm suitable private-library/consigned parts, quantities and factory loss allowance. Avoid silent connector height/plating or package substitutions. J3 PJ-102AH is the one THT part; the other 79 are SMT. H1–H4 and TP1–TP8 are bare board features.

Current V6 public selections include C2 Panasonic **EEEFTE221XAL / C1881633**; C3 TDK **C3216X5R1V226MTJ00E / C342620**; FB1/FB3/FB4 Murata **BLM18KG601SN1D / C85833**; U8 Microchip **93LC56BT-E/MS / C2061196**. Use the complete V6 BOM, not this short list, for matching. Stock and procurement lead time must be checked with the factory. U2 is **TLV75515PDRVR / C2868685**, in the 2 × 2 mm WSON footprint; TLV75515PDQNR does not fit it. D3/D4 are the selected APT1608 LEDs in the BOM.

U8 is assembled **blank**. No configured CFG001 or other EEPROM image is supplied; board-specific provisioning and powered/JTAG validation remain separate.

Review the exact current JLC model's numbered pads, pin 1, rotation, polarity and connector directions against the native design. **Placement review remains pending, including C2, D4, J3, J4, U1, U2, U3 and U8**; these files do not claim a corrected JLC machine-library origin or rotation. All other matched parts also require normal placement review. Native CPL coordinates and angles are preserved. This file does not include the staged JLC library-model adaptations; recheck all 80 placements, polarity and terminal overlap against the current matched preview before assembly approval. C2 pad 1 is positive; D3/D4 pad 1 is cathode.

J1/J2 retain Hirose's **0.20 × 0.70 mm lands at 0.40 mm pitch**. See `Carrier_V6_Connector_CAM_Request.md`; obtain the factory's explicit CAM/assembly decision and identify any proposed change before production-file approval. Retained Murata bead lands also need stencil/assembly review. Regenerate the complete fabrication/BOM/CPL set if the physical or electrical design changes.

Native CAD/export checks do not establish manufacturing acceptance, assembled fit, electrical/thermal performance or powered-hardware qualification.
