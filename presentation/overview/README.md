# Current hardware overview — V3

14 October 2026. [Open the original-structure overview](../../index.html) · [FPGA section](../../index.html#fpga) · [Revision sources](Source_Mapping.json).

The live page retains the previous assembly-first structure: original model on Overview, viewer on the left, subsystem description on the right, six sections along the bottom, and existing camera, notes and keyboard controls. Current previews replace the outdated work inside those sections.

| Existing section | Current work | Views and scope |
|---|---|---|
| Custom FPGA | V41 · 25 × 23 mm | Current 3D, native routing, schematic and complete KiCad; partial routing, 445 opens. |
| Routing + LDO | Separate V5 · 32 × 32.5 mm | Separate FPGA/LDO 3D, native placement, schematic and complete KiCad; unrouted, 731 gaps. |
| Routing + LDO · combined option | Combined V7 · 30 × 30 mm | Current native front/back layout, schematic and complete KiCad; unrouted, 827 gaps. No V6 model relabeled V7. |
| XEM carrier | V17 · 53 × 83 mm | Current schematic/project; V16 3D/native physical geometry retained because V17 preserves copper and placement. |

ASIC carriers and the dated µHDMI adapter study remain in their existing sections. The original assembly is conceptual geometry, not a verified current mating assembly. Current sources, rail feasibility, routing, physical fit and hardware qualification retain their own limits.

The [original earlier overview](../../overview-2026-09-23.html) and [alternative V2 layout](../../overview-2026-10-14-v2.html) are preserved. V3 uses scoped slide/preview scripts; the historical compact app, data and entry scripts are unchanged.

The direct drawing viewer keeps the V2 recovery behavior: default FPGA schematic, a drawing selector, and a persistent return link.
