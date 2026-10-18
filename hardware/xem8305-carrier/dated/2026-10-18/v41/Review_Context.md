# Carrier V41 — weekend work and review scope

18 October 2026, America/Chicago. This package is the latest saved XEM8305 carrier revision for review. The standalone FPGA and separate LDO designs are outside this publication.

## Weekend changes retained in V41

- **Routing and return review:** retained the direct V32 interface routes; V33 joined the converter quiet ground at the intended point and revised C56. The later V36/V37 power-routing experiments were cancelled and are not the review baseline.
- **Schematic clarity:** visibly connected C34/C38 beside their connectors and retained the boxed Function and Source / changes explanations with circuit references.
- **Silkscreen:** V38 corrected an outside-board reference, thin strokes and pad-opening clearances while preserving the V33 copper.
- **USB and assembly:** V39 removed the inappropriate D500 VBUS spur, added a separate VBUS TVS and corrected four component assembly attributes. USB data and the 23 carrier interface routes were retained.
- **JP1 and construction:** V40 selected Harwin M20-9990245 with the separate M7566-05 shunt, used an explicitly adapted 1.10 mm finished-hole pattern, and improved two adjacent via clearances. Requested construction is the exact JLC06161H-2116 six-layer stack and 13 selectively epoxy-filled/copper-capped thermal vias.
- **Sourcing:** V41 changes ten references in six MPN groups: seven capacitors, two low-current LED resistors and the EEPROM tape/reel variant. Values, packages, nets, placement and every V40 track/via/pad/zone/fill are preserved. The 100 nF alternatives were compared using typical manufacturer DC-bias and impedance curves; this is not a worst-case or powered-system qualification.

## Checks and limits

The frozen V41 checks report zero physical/silkscreen findings, zero opens and zero schematic/PCB parity findings. All 606 schematic pin/net assignments were retained. Fifty inherited library warnings and 210 inherited unused-connector ERC findings remain visible in the reports; do not describe the complete DRC/ERC result as zero.

V41 preserves all 738 track sections, 312 vias, 651 pads and 21 zones with saved fills from V40. V40 and the earlier saved revisions remain local and unchanged. The public PCB derivative omits 3D model nodes and embedded supplier STEP payloads; its non-3D content is checked against the frozen source. Missing 3D models do not establish physical fit.

## Questions for Gerald

1. Review the actual routing and continuous return paths, including the converter quiet-ground join and the USB/JTAG section. Inner ground layers provide reference/return copper even where they have few direct connections.
2. Confirm the prototype's allowed 12 V source, expected 3.3 V load, and accepted limitations in reverse/overvoltage protection. These are not newly qualified by the CAD checks.
3. Review connector mating/clearances, JP1 seating and shunt access, and the assembly orientation/pin-1 drawing.
4. Confirm FTDI EEPROM provisioning, USB/JTAG and Vivado compatibility, clock assumptions and a first-board bring-up plan before powered use.

## Factory and sourcing status at publication

A separate V41 JLCPCB quote draft has the Gerbers, BOM and placement files for **five assembled boards**. Its audited rows contain 39 MPN groups / 82 fitted references: 35 selected matches and four remaining procurement groups (MC1, MC2/MC3, U10 and FB500–FB502). Exact-part distributor routes and five separate shunts were identified, but nothing has been bought or reserved.

The factory inquiry was submitted successfully; submission is not factory acceptance. The exact stack, selective 13-via fill/cap treatment, panel drawing, sourcing allocation/allowances and manual J4/JP1/shunt assembly still need confirmation. Final placement approval, full pricing and powered-board qualification also remain open. This is a review snapshot, not an approved fabrication release or order.

The public package intentionally omits account-specific draft/cart links, personal correspondence, payment information, portal screenshots, downloaded supplier datasheets and restricted 3D model bodies.
