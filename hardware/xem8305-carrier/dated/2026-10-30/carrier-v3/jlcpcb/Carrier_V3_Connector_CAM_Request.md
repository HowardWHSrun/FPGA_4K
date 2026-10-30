# Carrier V3 — connector CAM request

Prepared for Howard to send with `Carrier_V3_PCB_Gerbers.zip`. No inquiry has been sent by Codex.

Please confirm fabrication and assembly of **J1/J2's 74 total manufacturer-recommended 0.20 x 0.70 mm lands at 0.40 mm pitch**, on this four-layer FR-4 / green-mask / ENIG / 1 oz outer-copper board. Please preserve these dimensions; the manufacturer specifies pad width 0.20 +/-0.02 mm.

Exact connectors:

- J1: Hirose **DF40C(2.0)-50DS-0.4V(51)**, LCSC **C3649428**.
- J2: Hirose **DF40C(2.0)-24DS-0.4V(51)**, LCSC **C6539782**.

Your general capability table lists minimum SMD pads of 0.25 x 0.25 mm. Please review the actual copper/mask/paste and confirm your process treatment for these manufacturer lands, identifying any proposed changes before production-file approval. A blind increase to 0.25 mm pad width would exceed the Hirose recommendation and is not authorized by this design package.

Manufacturer reference: **Hirose DF40 Series catalog, January 2025, page 9, 2.0 mm stacking-height pattern**: [official catalog](https://www.hirose.com/en/product/series/DF40/documents?path=%2Fapi%2Fv1%2Fseries%2FDF40%2Fdocuments%2Fproduct_series_catalog%2Fcontent%3Flang%3DEN).

Supplier identities: [J1](https://www.lcsc.com/product-detail/C3649428.html), [J2](https://www.lcsc.com/product-detail/C6539782.html). These listings identify the parts and do not themselves establish fabrication approval. [JLC capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/).

Use **JLC04161H-3313**, 1.6 mm nominal, with the specified copper weights and confirm the actual stack/impedance treatment. U2 is TLV75515PDRVR in the V2 WSON footprint; D3/D4 are the APT1608 replacements in the BOM. Use the V3 fabrication and assembly files together.
