# LDO carrier V3 — JLCPCB upload guide

Prepared 30 October 2026 for engineering review/quotation. Obtain JLC's decision on the included Hirose connector CAM request before approving production. No fabrication approval or parts reservation is implied.

Upload `Carrier_V3_PCB_Gerbers.zip` for PCB fabrication. For assembly also upload `Carrier_V3_Assembly_BOM.csv` and `Carrier_V3_CPL.csv` from this same V3 set. The BOM has 52 groups / 80 physical parts; CPL has 80 placements: 3 Top and 77 Bottom. Do not upload the KiCad source ZIP as the Gerber file.

| Order setting | V3 requirement |
|---|---|
| Board | Four-layer FR-4, 53 × 83 mm nominal outline, 1.6 mm nominal thickness; do not rescale |
| Layer order | F.Cu / GND_1 (In1.Cu) / GND_2 (In2.Cu) / B.Cu |
| Stack | JLC04161H-3313; confirm actual material/copper and impedance treatment with JLC |
| Copper | 1 oz outer; intended nominal 0.5 oz inner, confirm selected stack |
| Finish | ENIG |
| Mask/legend | Green mask, white legend |
| Vias | Front/back tented; no plugging/filling/capping specified |
| Assembly | Both sides; MC1–MC3 Top, other 77 Bottom; include the J3 through-hole process |

76 references have catalog codes. Arrange the remaining four references using `Global_Sourcing_or_Consignment_V3.csv`: MC1 Samtec ERF6-50-03.5-L-DV-A-K-TR; MC2/MC3 Samtec ERF6-40-03.5-L-DV-A-K-TR; U1 TI TPS54429ERSAR. Confirm private-library matching, consignment/global sourcing and quantities/attrition before assembly. J3 (PJ-102AH) is included in both files and needs THT/hand assembly; the other 79 parts are SMT. H1–H4 and TP1–TP8 are bare board features.

C2 is Panasonic **EEEFTE221XAL**, supplier alias EEE-FTE221XAL, **C1881633**. Confirm preorder/account allocation and lead time. The 30 October public snapshot showed 56 upstream / 52 presale units and 12 minimum preorder; these are dated observations, not reserved stock. [JLC part/preorder page](https://jlcpcb.com/partdetail/Panasonic-EEEFTE221XAL/C1881633).

U2 is **TLV75515PDRVR / C2868685**, in the 2 × 2 mm WSON footprint. Previously purchased TLV75515PDQNR does not fit this footprint. D3/D4 are the selected APT1608 LEDs in the BOM. U8 is standard 93LC56B-E/MS, assembled **blank**; no unverified EEPROM image is supplied.

Review JLC's actual matched-part placement preview for rotation, pin 1 and polarity. C2 pad 1 is positive; D3/D4 pad 1 is cathode. J1/J2 retain Hirose's 0.20 × 0.70 mm lands at 0.40 mm pitch; see the separate CAM request. Approve any factory-proposed changes explicitly. Regenerate the complete fabrication/BOM/CPL set if the electrical/layout design changes.
