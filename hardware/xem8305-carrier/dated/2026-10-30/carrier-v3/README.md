# Direct LDO Carrier V3 — 30 October 2026

[Inspect native layout and schematic](../../../../../presentation/overview/carrier-v3/) · [Open in the main page](../../../../../index.html?approach=direct#overview)

| Download | Use |
|---|---|
| [Direct LDO Carrier V3 KiCad ZIP](Carrier_V3_KiCad.zip) | Editable PCB, schematic, project, rules and required project-local libraries. Extract the whole folder and open `Carrier_V1.kicad_pro` with KiCad10.0.6. Visible revision is V3. |
| [Gerbers and drills](jlcpcb/Carrier_V3_PCB_Gerbers.zip) | Upload this ZIP to JLCPCB for the four-layer PCB. |
| [Assembly BOM](jlcpcb/Carrier_V3_Assembly_BOM.csv) | 52 groups covering80 fitted parts, including76 catalog-coded references. |
| [Placement CPL](jlcpcb/Carrier_V3_CPL.csv) | Matching80 placements:3Top/77Bottom. Native KiCad origins/angles; verify JLC's matched-part preview. |
| [Order guide](jlcpcb/Carrier_V3_JLCPCB_Order_Guide.md) | Stack, finish, assembly process, C2 preorder, EEPROM and remaining sourcing. |
| [Private-sourcing list](jlcpcb/Global_Sourcing_or_Consignment_V3.csv) | MC1, MC2, MC3 and U1. |
| [Connector CAM question](jlcpcb/Carrier_V3_Connector_CAM_Request.md) | Obtain JLC acceptance of the manufacturer Hirose0.20mm lands before production. |

C2 is Panasonic EEEFTE221XAL/C1881633, the halogen-free FT configuration with unchanged220µF/25V ratings and D8 pads. V2's TLV75515PDRVR U2 and APT1608 D3/D4 selections and local manufacturing fixes remain. Previously purchased TLV75515PDQNR does not fit U2's2×2mm footprint.

Checked CAD: zero DRC, opens, schematic/PCB parity and reported ERC findings; all602 pin/net entries match V2. ERC retains the documented single-global-label, four-way-junction and SPICE-model categories. The publication copy also passes native checks after removing3D model blocks; all electrical/layout tokens are preserved. These are CAD checks, not factory or powered qualification.

This public download omits3D model bodies, embedded model payloads, editor caches, unused libraries, pictures and internal research/history. All required PCB/schematic libraries are included. The two raw native files under `native/` are the exact same files as in the ZIP and power the interactive viewer; they are not extra fabrication uploads. The26October3D assembly is an earlier reference.

Source: the frozen30October Direct LDO Carrier V3 local project, PCB SHA-256 `fe45d77ec0ef33c40660fcb0f68ed85daa38d3468264f7bbc36fc5da2bce8cd2`. Public model-free PCB SHA-256 `e6525809d89d9661421273a0604793b412734b5d2d8585cf06480fa11ede7fbf`. Schematic SHA-256 `b35c700964fcace594003090f4bcb6474756a6d22c49ff308f670a8a5473236c`. Gerber/BOM/CPL bytes are unchanged from the checked local V3 handoff. No fabrication approval, reserved parts or vendor order is implied.
