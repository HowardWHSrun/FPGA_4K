# Current custom FPGA assembly · V6

15 October 2026. [Open interactive scene](index.html) · [Main overview](../../../index.html?approach=custom#overview) · [Exact asset hashes and transforms](Scene_Manifest.json).

The scene brings the current source boards into the original overview structure. Four copies of the original two-ASIC PCB-5 reference sit beside **FPGA V41 + separate LDO V5**, or **combined FPGA/shared LDO V7**. The cabled host stack contains **BRK8305 → interposer V4 → XEM8305**. The separate and combined compact options are mutually exclusive. The main page's B switch opens the separate direct-LDO carrier V17 route.

Drag to rotate, scroll to zoom, use 3D/Top/Side, and focus ASICs, FPGA/LDO or the host stack. Labels open the matching section. “Separate stacks” adds inspection offsets; turning it off restores the documented nominal board positions within each registered stack. Overall board spacing and the dashed logical link illustrate the architecture. No physical cable plug, distribution adapter or standoff is modeled.

| Board | Geometry source | Scope |
|---|---|---|
| Four ASIC boards | [Original PCB-5 KiCad](../../../hardware/references/asic-carrier/PCB.kicad_pcb), native export on 15 October | Four copies of one approximately 22 × 17 mm two-ASIC reference. ASIC die bodies have no source assignment and the custom J3 model is unavailable; those bodies are omitted. Exact copper, pads, mask and available parts are retained. Distribution and mating are unverified. |
| Standalone FPGA V41 | [Current complete native project](../assets/FPGA_V41_Complete_KiCad_2026-10-14.zip); existing source-derived GLB | 25 × 23 mm routing checkpoint. 445 whole-board opens remain. |
| Separate LDO V5 | [Current complete native project](../assets/Separate_LDO_V5_Complete_KiCad_2026-10-14.zip); existing source-derived GLB | 32 × 32.5 mm placement; 731 gaps. Nominal registration to FPGA uses the documented two-connector alignment. |
| Combined V7 | [Current complete native project](../assets/Combined_FPGA_Shared_LDO_V7_KiCad.zip); actual V7 native GLB | 30 × 30 mm placement, all 181 assigned component groups, 827 gaps. Shared-rail feasibility remains open. The older 35 × 35 mm V6 model is separate. |
| BRK8305 | Official Opal Kelly STEP, registered display derivative | The source omits MC4–MC9 header bodies and S1/J2/J6 bodies. |
| Interposer V4 | Current 15 October physical placement export | 83 × 53 mm, unrouted, 435 opens and 18 physical DRC findings at the checkpoint. No connection to the previous LDO board. The newer power-foundation schematic does not replace this physical placement. Some component bodies are nominal package/drawing envelopes. |
| XEM8305 | Official Opal Kelly model, registered display derivative | Decorative silk, prepreg and pick-cap geometry omitted. Nominal stack registration is retained. |

[Native asset provenance](assets/Native_Assets_Provenance_V6.json) records PCB hashes, export commands, units, counts and missing models. ASIC and combined GLBs are repacked by original material to reduce draw calls: all 266,453 ASIC triangles and 317,965 V7 triangles are retained. Material tables and oriented world-space float32 triangle sets match their native exports; maximum transform rounding is below 0.00000745 mm. Verification: [ASIC receipt](assets/ASIC_PCB5_Repack_Receipt_V6.json), [V7 receipt](assets/Combined_V7_Repack_Receipt_V6.json).

[Host asset provenance](assets/Host_Asset_Provenance.json) records exact registered display copies. Host source preparation is preserved in the dated workspace `2026-10-15_FPGA_Work/02_XEM_Interposer_Stack_View_V4/`; official model authorship belongs to Opal Kelly. The displayed native ASIC project is the repository's PCB-5 source, not the differently configured single-ASIC Board-1024 extraction.

Source GLBs retain their dimensions. Native KiCad metres are converted to scene millimetres by scale 1000 and X rotation +90 degrees. The FPGA/LDO nominal transforms come from the [existing stack manifest](../../meetings/2026-10-14-v16/stack_viewer/assets/Scene_Manifest.json). The three host display models already share a registered Z-up/mm frame. Inspection offsets are display transforms only.

These are design and source-reference models. They do not establish populated connector fit, retention, powered ASIC operation, complete routing or fabrication readiness. [V5](../../../overview-2026-10-15-v5.html) preserves the earlier conceptual assembly and September XEM8310 adapter study unchanged.
