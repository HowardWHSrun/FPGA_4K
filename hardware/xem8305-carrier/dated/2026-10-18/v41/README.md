# XEM8305 carrier V41 — review package

18 October 2026. **Latest saved carrier revision for Gerald's review; fabrication approval is pending.** This is the carrier that connects the XEM8305 to the existing LDO board. It is separate from the standalone FPGA V41, which shares the same version number.

- [Schematic PDF](output/pdf/Carrier_V41_Schematic.pdf)
- [All six copper layers and both silkscreens](output/layers/README.md)
- [Complete public KiCad ZIP](Carrier_V41_Public_KiCad_Review.zip)
- [Native KiCad project](project/CARRIER_XEM8305_V41_Sourcing_Alternates.kicad_pro)
- [Weekend changes, checks and review questions](Review_Context.md)
- [Factory and assembly requirements](Factory_Review_Requirements.md)
- [V41 BOM: 39 groups / 82 fitted references](output/assembly/V41_JLC_BOM_Full_82_Parts_39_MPNs.csv)
- [Placement file](output/assembly/V41_JLC_CPL_Full_82_Parts_Centroids.csv) and [separate shunt accessory](output/assembly/V41_JP1_Shunt_Accessory_Separate.csv)
- [Gerbers, paste and separate PTH/NPTH drills](output/V41_JLC_Gerber_Paste_Drill_Clean.zip)
- [Verification files](verification/)

Extract the complete ZIP before opening the project in KiCad 10.0.6. Keep its project-local libraries and tables together. This public adaptation omits all 3D model references and embedded supplier STEP bodies; the original local V41 is preserved. The schematic, electrical layout, placements, copper, saved fills, stack and rules are checked against the frozen V41 source. The PCB file's complete hash therefore differs from the private source. Missing 3D bodies cannot establish mechanical clearance.

V41 updates ten references in six sourcing groups after capacitor, LED resistor and EEPROM checks. **All V40 routing remains unchanged:** 738 track sections, 312 vias, 651 pads and 21 zones. The earlier silkscreen cleanup, regulator return correction, USB TVS change and JP1 hole/mechanical adaptation are retained.

Saved-board checks report zero physical/silkscreen findings, zero opens and zero schematic/PCB parity findings under the retained settings. Fifty inherited library warnings and 210 inherited unused-connector ERC findings remain documented. Static checks do not establish powered operation, timing, SI/PI, thermal performance or factory acceptance.

Five assembled boards are being quoted. Four exact-part procurement groups, source allocation and the factory stack/via/panel/manual-assembly review remain open. No procurement, order or payment has been made. The included manufacturing files are review candidates, not an approved production release.
