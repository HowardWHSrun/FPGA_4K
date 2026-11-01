# Direct LDO Carrier V6

31 October 2026. [Native layout and schematic](../../../../../presentation/overview/carrier-v6/) · [Direct-LDO overview](../../../../../index.html?approach=direct#overview).

V6 connects **MC2 pin 14 VREFP to pin 16 GNDADC** using one short front-copper trace, selecting the XEM8305 internal SYSMON reference with its default C168. It does not connect this net to carrier ground or MC2.18 VCCADC. The same 80 fitted parts and positions and the original input circuit are retained; the withdrawn input-protection redesign is excluded. Opal Kelly's [XEM8305 expansion-connectors / SYSMON instructions](https://docs.opalkelly.com/xem8305/expansion-connectors/) are cited beside the connector in the schematic.

| Download | Use |
|---|---|
| [V6 editable KiCad project](Carrier_V6_KiCad.zip) | Extract all of `Carrier_V6/` and open `Carrier_V6.kicad_pro` in KiCad 10.0.6 or newer. Project-local symbol and footprint libraries included. |
| [V6 Gerbers and drills](jlcpcb/Carrier_V6_PCB_Gerbers.zip) | Matching four-layer fabrication ZIP, including the MC2.14–16 copper link; all 14 member filenames use Carrier_V6. |
| [V6 assembly BOM](jlcpcb/Carrier_V6_Assembly_BOM.csv) | 42 exact-part groups / 80 fitted references; 39 public part codes, each used once. Procurement data is unchanged. |
| [V6 native placement CPL](jlcpcb/Carrier_V6_CPL.csv) | Same 80 native origins/angles, 3 Top / 77 Bottom. JLC model placement review remains pending; staged library-model adaptations are not included. |
| [V6 three-file upload bundle](jlcpcb/Carrier_V6_JLCPCB_Upload.zip) | Extract it, then upload the Gerber ZIP as PCB data and the BOM/CPL as assembly data. |
| [V6 JLCPCB guide](jlcpcb/Carrier_V6_JLCPCB_Order_Guide.md) | File set, stack, exact parts, blank EEPROM, THT and unresolved factory/placement reviews. |
| [V6 noncatalog parts](jlcpcb/Carrier_V6_Noncatalog_Parts.csv) | Exact MC1, MC2/MC3 and U1 MPNs for private-library/consigned matching; no account allocation claim. |
| [V6 connector CAM request](jlcpcb/Carrier_V6_Connector_CAM_Request.md) | Acceptance request for J1/J2's actual 0.20 × 0.70 mm manufacturer lands. |
| [V6 full schematic](review/Carrier_V6_Schematic.pdf) | Saved V6 drawing and visible circuit references. |
| [V6 MC2 schematic detail](review/MC2_SYSMON_Schematic_V6.pdf) / [copper detail](review/MC2_SYSMON_Copper_V6.pdf) | The added 14-to-16 link and adjacent source note. |
| [V6 front copper PDF](review/Carrier_V6_Front.pdf) | Native front-layer review plot. |

The board intent remains four-layer FR-4, 53 × 83 mm finished outline, 1.6 mm nominal, JLC04161H-3313 stack, ENIG, green mask and white legend. Confirm actual stack/copper, via-mask intent and assembly process with the factory. Include J3 THT/manual soldering and assemble U8 blank. Match the complete exact BOM; component availability and quantities require actual-order confirmation.

**Assembly review is pending.** Recheck every matched part, including C2, D4, J3, J4, U1, U2, U3 and U8, for terminal overlap, center, rotation and polarity. The native CPL does not claim corrected JLC library-model offsets. J1/J2 fine-pitch CAM, retained bead stencil lands, parts allocation, populated fit, power/clock/USB/provisioning and powered/thermal qualification remain open. Correct adapter choice alone does not resolve all review findings. Publishing V6 does not update or approve a JLC order.

All current download names, main native project names, Gerber member names and viewer labels use **V6**. Existing library/footprint identifiers and explanatory notes retain historical revision provenance. The BOM is the same previously corrected grouping, now delivered under the V6 filename; this is not a parts change. The native CPL preserves the same original placement data. The public Gerbers preserve all source drawing/drill data, changing only export names and project-name metadata. The public PCB removes model/embedded payload blocks only, and the schematic project-instance name is updated to Carrier_V6. Project settings and design rules retain their source bytes.

This public copy omits supplier 3D payloads, model references, editor caches and private working material. All used required libraries and the KiCad library license notice are included. The `native/` files match the ZIP and supply the viewers. The separately labelled 26 October 3D assembly remains an earlier geometry reference, not a regenerated V6 model.

Source V6 PCB SHA-256: `d9db1f01d0649196dd799c2348af74ed3c1ef6dbeda343e94275f9968d26b540`.  
Public V6 model-free PCB SHA-256: `427e3d1ca86abfd215b924f2ff1f1f39a9e9f878b861d6871a1311cf6b2cbfdd`.  
Source V6 schematic SHA-256: `4df649292623c6f09d9a7490780563356b171db6a08fbf39c0a224d0d2053627`.  
Public V6 schematic SHA-256: `043bb47c444c93f25b915c80054adb5fbccfced17dc060d2c1b58b303cdf6067`.

[Preserved V4 / grouped-BOM package](../carrier-v4-bom-v5/README.md) · [Preserved V3 package](../../2026-10-30/carrier-v3/README.md).

Engineering-review delivery; manufacturing acceptance and hardware qualification remain open.
