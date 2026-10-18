# XEM8305 carrier V42 — LED visibility review

18 October 2026. **Latest saved carrier revision for review; not a fabrication release.** This is the XEM8305 carrier connecting to the existing LDO board, separate from the standalone FPGA design.

- [Editable public KiCad ZIP](Carrier_V42_Public_KiCad_Review.zip) · [native project](project/CARRIER_XEM8305_V42_LED_Visibility.kicad_pro)
- [Schematic PDF](output/pdf/Carrier_V42_Schematic.pdf)
- [All six copper layers and both silkscreens](output/layers/README.md)
- [LED stacked-board visibility diagram](output/figures/V42_LED_Stack_Visibility.png) · [vector SVG](output/figures/V42_LED_Stack_Visibility.svg)
- [Change scope, evidence and review questions](Review_Context.md)
- [Factory and assembly review requirements](Factory_Review_Requirements.md)
- [BOM: 82 fitted references / 39 MPN groups](output/assembly/V42_JLC_BOM_Full_82_Parts_39_MPNs.csv) · [CPL](output/assembly/V42_JLC_CPL_Full_82_Parts_Centroids.csv) · [separate shunt accessory](output/assembly/V42_JP1_Shunt_Accessory_Separate.csv)
- [Gerber, paste and separate plated/nonplated drill review candidate](output/V42_JLC_Gerber_Paste_Drill_Clean.zip)
- [Public native check receipt](verification/Public_V42_Native_Checks.json) · [non-3D source equivalence](verification/Public_Review_Non3D_Equivalence.json) · [independent preservation audit](verification/V42_Independent_Preservation_Review.md)

**V42 moves only D601** from F.Cu (142.5,39.5 mm) to B.Cu (141,55 mm), 90° native rotation. It makes the 3.3 V LDO-feed indicator visible with D600 and D602 from the common carrier underside while the boards remain stacked. R601 and all other component placements remain unchanged. Only D601's indicator branch, its ground connection and local via clearances change; all unrelated routing and zone definitions are preserved. V41 is retained separately.

Native saved-board checks report zero physical/silkscreen findings, zero opens and zero schematic/PCB parity findings under retained settings. Fifty inherited library warnings and 210 inherited unused-connector ERC findings remain documented. Static checks do not establish powered operation, timing, SI/PI, thermal performance or factory acceptance. The populated stack remains a nominal geometry review.

Extract the complete ZIP before opening KiCad. This publication copy removes all model references and embedded supplier 3D payloads; every non-3D source token is verified against V42. The manufacturing files are candidates for review. The existing JLC draft remains V41; publishing this package does not update an order or authorize fabrication/payment.
