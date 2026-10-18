# V42 factory and assembly review requirements

18 October 2026. Review preparation only; no production or payment authorization.

## Construction

- Six layers, 53 × 83 mm individual board, nominal 1.6 mm, ENIG, 1 oz outer / 0.5 oz inner copper.
- Exact **JLC06161H-2116** stack, no suffix. Native/Gerber mapping from top to bottom: F.Cu, In1.Cu, In2.Cu, In3.Cu, In4.Cu, B.Cu. Dielectric gaps: 0.2234 / 0.3000 / 0.4168 / 0.3000 / 0.2234 mm. Published nominal construction does not establish the factory's pressed stack or an impedance guarantee.
- Exactly **13 selected thermal vias**: nine beneath U10, four beneath U501. Nonconductive epoxy fill, planarization and copper cap, IPC-4761 Type VII process intent. Use the [coordinate/UUID list](output/manufacturing/Thermal_Vias_Epoxy_Filled_Capped.csv) and [map](output/manufacturing/Stackup_And_13_Thermal_Vias.png). Do not identify all 0.30 mm holes as fill targets. The other 300 vias retain the submitted mask intent.
- Keep every component PTH and NPTH open, including JP1 and J4. Confirm production CAM before fabrication; no stack or geometry substitution without review.
- The JLC quote uses a 71 × 83 mm factory envelope. Obtain the actual panel/rail drawing and verify connector access; this is not a change to the individual 53 × 83 mm board.

See the [stack specification](output/manufacturing/JLC06161H-2116_Stackup_Contract.json). Official reference pages: [stack selector](https://jlcpcb.com/impedance), [via covering](https://jlcpcb.com/help/article/pcb-via-covering), [PCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/). A submitted inquiry is not acceptance of the supplied production files.

## Assembly

Five assembled boards; 82 fitted references per board, including 80 SMT-classified parts and two THT parts (J4/JP1). J500 is a hybrid USB connector requiring the quoted special processing. The full CPL has 75 bottom / 7 top references, including the THT records. Manual insertion/soldering and orientation must be approved by the assembler. The J4/JP1 body-center corrections in the placement export do not change their native PCB placement.

JP1 is Harwin M20-9990245, two 1.10 mm nominal finished plated holes at 2.54 mm pitch with 1.70 mm copper pads. Ordinary +0.13 / -0.08 mm component-hole tolerance was requested. This is a deliberate manual-solder adaptation of Harwin's recommended 1.02 ±0.05 mm pattern. Verify free seating, solder fill, stack clearances and access on the assembled first article. Supply **five individual Harwin M7566-05 shunts**, one per board, and fit after soldering. The quoted quantity is not five packs. Remove JP1 before external 3.3 V operation.

Confirm pin 1, polarity and all placements in the assembler's preview, and reconcile each exact MPN with the full BOM. U505 is blank and still requires FTDI configuration programming.

## Sourcing and release gate

The existing V41 draft has 35 selected MPN groups and four remaining procurement groups: Samtec MC1; Samtec MC2/MC3; TI U10; and Laird FB500–FB502. Exact-part distributor routes were identified; distributor offers are neither reservations nor parts received in JLC inventory. Confirm source allocation, complete quantities, cut-tape/feeder acceptance, attrition, and shunt unit conversion before procurement.

Obtain written acknowledgment of the complete factory review package, the exact stack and selective via treatment, panel and manual assembly plan, then the final placement approval and full pricing. Prior prototype limitations and first-board electrical/firmware/mechanical qualification remain open. No manufacturing release is created by publishing this package.

## V42 candidate replacement

D601 moves to B.Cu (141,55 mm), 90°. The V42 CPL contains 75 bottom / 7 top fitted references, including THT records. V42 has 313 total vias: exactly 13 selected thermal vias and 300 ordinary vias. The two new D601 vias retain ordinary treatment. The existing V41 JLC draft is not updated by publishing V42. Replace all Gerber, drill and CPL inputs together and re-review placement/polarity before ordering. V41 remains preserved.
