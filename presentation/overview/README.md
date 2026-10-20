# Current shared hardware overview — V11

## Assembly sequence V23 · 20 October 2026

The custom FPGA Overview now embeds [assembly V23](assembly-v23/index.html): one timeline for ASIC/LDO/FPGA and BRK/interposer/XEM assembly, with optional sheep context and board/component inspection. [Coverage](assembly-v23/model-sources.html) distinguishes the V54/V13/V12 snapshots, missing source bodies and nominal public connector previews. Existing subsystem checkpoints and direct V42 are preserved. [Earlier root V11](../../overview-2026-10-20-v11.html) retains the previous overview.

18 October 2026. [Public direct-LDO carrier overview](https://howardwhsrun.github.io/FPGA_4K/?approach=direct#overview) · [V42 assembly](carrier-viewer-v42/index.html) · [V42 native layout](carrier-viewer-v42/native/index.html) · [V42 review files](../../hardware/xem8305-carrier/dated/2026-10-18/v42/README.md).

The same assembly-first layout now uses **carrier V42**. D601 has moved to the underside at (141, 55) mm so all three rail-presence LEDs can be viewed from the exposed side of the nominal stack. Its indicator branch and local clearances are the only routing changes; unrelated routing and every other fitted placement remain unchanged from V41. The exact native board contains 742 segments, 313 vias, 651 pads, 21 zones and 89 footprints. The schematic drawing is freshly exported from the saved V42 native schematic.

**Illustration spacing** is visible and draggable in both Overview and the Direct-LDO carrier section. It separates the XEM8305 and existing LDO attachment from the carrier for inspection. **0 mm means nominal seating**; added distance is illustrative and does not change CAD, connector specifications or qualified stack height. Board visibility and camera presets remain accessible. The 3D, Layout and Schematic tabs and current KiCad/PDF/BOM/CPL downloads remain available.

The separate custom FPGA path stays at its existing FPGA V41 checkpoint. [The V10 page](../../overview-2026-10-18-v10.html), its V41 viewer, schematic and dated package remain preserved. V11 uses new entry, slide, interaction, drawing-viewer and embedded-control files; it does not rewrite historical scripts or assets.

The saved JLC five-board quote remains **V41** and has not been updated by this publication. Four procurement groups, exact stackup, 13 selected filled/capped thermal vias, panel/assembly acceptance and powered validation remain open. This publication is a review candidate; no order or payment.

# Preserved overview V10 record

18 October 2026. [Public direct-LDO carrier overview](https://howardwhsrun.github.io/FPGA_4K/?approach=direct#overview) · [V41 layer viewer](carrier-v41/index.html) · [V41 review files](../../hardware/xem8305-carrier/dated/2026-10-18/v41/README.md).

The direct-LDO route restores the earlier rotatable XEM8305/carrier/LDO assembly view, updated with freshly derived **V41** carrier copper, placement and component representations. Layout opens the exact current native KiCad board with net highlighting and layer controls; Schematic and current download links remain available. The V41 sourcing substitutions preserve all V40 routing. Three passive indicators show the nominal 12 V input, BUCK_3V3 before JP1 and LDO_3V3 after JP1; they assist power diagnosis rather than providing precision power-good detection. Supplier 3D bodies are omitted from the public CAD; exact non-3D equivalence is recorded. The old V16 physical viewer is historical and is not relabeled V41.

Five assembled boards are being quoted. Four procurement groups and factory approval of the exact stack, 13 selectively filled/capped thermal vias, panel and manual assembly remain open. Native physical/silk/open/parity results and inherited ERC/library findings are recorded; static checks do not qualify powered hardware. No order or payment.

The original two-approach layout, navigation and custom FPGA path are retained. [The prior V8 page](../../overview-2026-10-18-v8.html) and its scripts remain preserved. The notes below describe that earlier V8 publication.

# Preserved overview V8 record

15 October 2026. [Open the original-structure overview](../../index.html) · [FPGA section](../../index.html#fpga) · [Revision sources](Source_Mapping.json).

Two approaches are developed in parallel:

- **A · Custom FPGA approach:** ASIC boards → new LDO/custom FPGA electronics → cabled XEM8305 interface → PC. Compact electronics compare FPGA V41 + separate LDO V5 with combined FPGA/shared LDO V7. The latest cabled host interposer is V4, between BRK8305 and XEM8305; it has no connection to the previous LDO board.
- **B · Direct-LDO carrier alternative:** ASIC boards → existing LDO board → carrier V17 → XEM8305 → PC. This carrier connects directly to the existing LDO board, separately from the custom FPGA/new LDO arrangement.

Choose A or B with the persistent approach switch. Only the selected route card, overview content and relevant board sections are visible. Previous/Next, page counts and keyboard navigation use the selected sequence. The selection stays in the URL; deep links select their matching route, and Back/Forward restores it. Direct-LDO Overview shows the carrier assembly; its ASIC section shows the isolated PCB-5 source preview rather than the custom FPGA concept. The A overview now combines four native ASIC PCB-5 copies, FPGA V41 + LDO V5 (or combined V7), and the current BRK8305/interposer V4/XEM8305 stack. Focus controls inspect each group; the host section opens current V4. The compact FPGA/LDO and complete host stack are separated using full source bounds and connected by a visible illustrative micro-HDMI cable. Part descriptions use board names/revisions without individual assignments. The old XEM8310 adapter and conceptual assembly remain in the V5 archive. Both approaches still require hardware qualification.

V8 replaces the host's simplified display meshes with full registered BRK8305/XEM8305 geometry and a richer native V4 interposer export. All 52 interposer component groups remain present, with native pads, top/bottom silkscreen and soldermask surfaces. **Interposer** focus hides the surrounding boards and opens its top view; **Bottom** exposes its underside connectors. The preserved V4 PCB is unrouted, with zero tracks, vias and zones. No extra parts or routing are invented, and official-model omissions remain recorded in the source guide.

Announcements are collected in one **Updates** button. Desktop screens at least 1100 px wide and 650 px high fit the main presentation into the viewport; long subsystem details scroll within the story panel. Smaller screens use ordinary vertical scrolling and a wrapping navigation grid. Embedded viewer controls receive a scoped responsive stylesheet; historical viewer source files remain unchanged.

The live page retains the previous assembly-first structure: selected assembly on Overview, viewer on the left, subsystem description on the right, and relevant sections along the bottom, and existing camera, notes and keyboard controls. Current previews replace the outdated work inside those sections.

| Existing section | Current work | Views and scope |
|---|---|---|
| Custom FPGA | V41 · 25 × 23 mm | Current 3D, native routing, schematic and complete KiCad; partial routing, 445 opens. |
| Routing + LDO | Separate V5 · 32 × 32.5 mm | Separate FPGA/LDO 3D, native placement, schematic and complete KiCad; unrouted, 731 gaps. |
| Routing + LDO · combined option | Combined V7 · 30 × 30 mm | Current native 3D, front/back layout, schematic and complete KiCad; unrouted, 827 gaps. |
| XEM carrier | V17 · 53 × 83 mm | Current schematic/project; V16 3D/native physical geometry retained because V17 preserves copper and placement. |

ASIC carriers and the current XEM8305 host interposer retain their existing section positions. [Current composite model sources, transforms and omissions](assembly-v8/README.md) distinguish source geometry from illustrative overall assembly positions. Current sources, rail feasibility, routing, physical fit and hardware qualification retain their own limits.

The [original earlier overview](../../overview-2026-09-23.html), [alternative V2 layout](../../overview-2026-10-14-v2.html), [restored V3 overview](../../overview-2026-10-14-v3.html), [V4 comparison overview](../../overview-2026-10-15-v4.html), [V5 selected-route overview](../../overview-2026-10-15-v5.html), [V6 composite overview](../../overview-2026-10-15-v6.html) and [V7 cabled overview](../../overview-2026-10-15-v7.html) are preserved. V8 uses scoped slide/preview scripts; the historical compact app, data and entry scripts are unchanged.

The direct drawing viewer keeps the V2 recovery behavior: default FPGA schematic, a drawing selector, and a persistent return link.
