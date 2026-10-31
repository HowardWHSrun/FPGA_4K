# Direct LDO Carrier V4 design / V5 BOM

Published 31 October 2026. [Inspect native layout and schematic](../../../../../presentation/overview/carrier-v4/) · [Open the direct-LDO overview](../../../../../index.html?approach=direct#overview).

V4 is the current physical design. V5 groups the same procurement parts into 42 BOM rows for the same 80 fitted references; it does not change the V4 board or placement export.

| Download | Use |
|---|---|
| [Carrier V4 KiCad project](Carrier_V4_KiCad.zip) | Complete editable project and required local symbol/footprint libraries. Extract the whole ZIP and open `Carrier_V1.kicad_pro` in KiCad 10.0.6. Native identifiers are retained. |
| [V4 Gerbers and drills](jlcpcb/Carrier_V4_PCB_Gerbers.zip) | Matching four-layer fabrication ZIP. |
| [V5 assembly BOM](jlcpcb/Carrier_V5_Assembly_BOM.csv) | 42 exact-part groups covering 80 fitted references. |
| [V4 placement CPL](jlcpcb/Carrier_V4_CPL.csv) | Native origins/angles; 3 Top and 77 Bottom. Current JLC matched-model placement review remains pending. |
| [JLCPCB order guide](jlcpcb/Carrier_V4_V5_JLCPCB_Order_Guide.md) | Exact file set, stack, finish, assembly process and remaining factory reviews. |
| [Noncatalog parts](jlcpcb/Carrier_V4_Noncatalog_Parts.csv) | Exact MC1, MC2/MC3 and U1 MPNs for private-library or consigned matching. No account allocation is implied. |
| [Hirose connector CAM request](jlcpcb/Carrier_V4_Connector_CAM_Request.md) | Request acceptance of the actual 0.20 × 0.70 mm manufacturer lands. |

The board remains four-layer FR-4, 53 × 83 mm, 1.6 mm nominal, with the JLC04161H-3313 stack, ENIG and green mask/white legend intent. V4 selects C3 TDK C3216X5R1V226MTJ00E / C342620, Murata BLM18KG601SN1D / C85833 for FB1/FB3/FB4, and Microchip 93LC56BT-E/MS / C2061196 for U8. C2 remains Panasonic EEEFTE221XAL / C1881633. Use the full BOM for matching; stock and process acceptance must be checked for the actual order.

**Assembly review is pending.** Verify every matched part's center, terminal overlap, rotation and polarity in JLC's current preview, especially J3, J4, U1, U3 and U8. The CPL has no guessed machine-library corrections. Include J3 PJ-102AH THT/manual soldering, assemble U8 blank, obtain Hirose fine-pitch CAM acceptance, review retained bead stencil lands, and resolve any order-option conflict with the intended via mask. Native CAD checks are separate from factory, populated-fit and powered qualification.

Fresh public-copy checks report DRC / opens / parity 0 / 0 / 0 and ERC 0 under the supplied project settings. The independent 109-check package review preserves all electrical/layout tokens outside removed 3D/embedded payload blocks. Schematic, project, rules and custom symbol libraries retain their source bytes. The portable ZIP contains 51 members, including 36 used footprint masters and seven symbol libraries; all required library paths are project-local.

This public package follows the existing model-free publication format. Supplier 3D bodies, embedded payloads, editor caches and private working material are omitted. The two raw files in `native/` match the ZIP and supply the interactive viewers. The 26 October 3D assembly remains a separately labelled earlier reference; it is not a new V4 model.

Source PCB SHA-256: `028ba09ae74aa1482c3d070c68390da1e267c3ecf704ac634aa2a8104a065315`.
Public model-free PCB SHA-256: `ecd94c8f134ac1082a03ab15c1d71ef4fb5491e7d7cd5eb16f28110679d7450c`.
Schematic SHA-256: `92a1d203ee8a96ffd4b001e86122f5b1536aa7cf72f1ab3b50b0ef698117d87e`.
Gerber, CPL and V5 BOM bytes are unchanged from the verified V4/V5 handoff. This publication is an engineering-review delivery, not a fabrication release.

[Preserved V3 package](../../2026-10-30/carrier-v3/README.md).
