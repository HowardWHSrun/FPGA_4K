# Current hardware overview — V4

15 October 2026. [Open the original-structure overview](../../index.html) · [FPGA section](../../index.html#fpga) · [Revision sources](Source_Mapping.json).

Two approaches are developed in parallel:

- **A · Custom FPGA approach:** ASIC boards → new LDO/custom FPGA electronics → cabled XEM8305 interface → PC. Compact electronics compare FPGA V41 + separate LDO V5 with combined FPGA/shared LDO V7. The latest cabled host interposer is V4, between BRK8305 and XEM8305; it has no connection to the previous LDO board.
- **B · Direct-LDO carrier alternative:** ASIC boards → existing LDO board → carrier V17 → XEM8305 → PC. This carrier connects directly to the existing LDO board, separately from the custom FPGA/new LDO arrangement.

The overview shows two route cards and labels the current subsystem sections A or B. Navigation is a set of sections, with no arrows implying one series chain. The older XEM8310 adapter and conceptual host geometry remain explicitly historical. Both approaches still require hardware qualification.

Announcements are collected in one **Updates** button. Desktop screens at least 1100 px wide and 650 px high fit the main presentation into the viewport; long subsystem details scroll within the story panel. Smaller screens use ordinary vertical scrolling and a wrapping navigation grid. Embedded viewer controls receive a V4-only responsive stylesheet; historical viewer source files remain unchanged.

The live page retains the previous assembly-first structure: original model on Overview, viewer on the left, subsystem description on the right, six sections along the bottom, and existing camera, notes and keyboard controls. Current previews replace the outdated work inside those sections.

| Existing section | Current work | Views and scope |
|---|---|---|
| Custom FPGA | V41 · 25 × 23 mm | Current 3D, native routing, schematic and complete KiCad; partial routing, 445 opens. |
| Routing + LDO | Separate V5 · 32 × 32.5 mm | Separate FPGA/LDO 3D, native placement, schematic and complete KiCad; unrouted, 731 gaps. |
| Routing + LDO · combined option | Combined V7 · 30 × 30 mm | Current native front/back layout, schematic and complete KiCad; unrouted, 827 gaps. No V6 model relabeled V7. |
| XEM carrier | V17 · 53 × 83 mm | Current schematic/project; V16 3D/native physical geometry retained because V17 preserves copper and placement. |

ASIC carriers and the dated µHDMI adapter study remain in their existing sections. The original assembly is conceptual geometry, not a verified current mating assembly. Current sources, rail feasibility, routing, physical fit and hardware qualification retain their own limits.

The [original earlier overview](../../overview-2026-09-23.html) and [alternative V2 layout](../../overview-2026-10-14-v2.html) and [restored V3 overview](../../overview-2026-10-14-v3.html) are preserved. V4 uses scoped slide/preview scripts; the historical compact app, data and entry scripts are unchanged.

The direct drawing viewer keeps the V2 recovery behavior: default FPGA schematic, a drawing selector, and a persistent return link.
