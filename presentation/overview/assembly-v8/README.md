# Current cabled assembly · V8

15 October 2026. [Open interactive scene](index.html) · [Main overview](../../../index.html?approach=custom#overview) · [Asset hashes, layout and cable anchors](Scene_Manifest.json).

The compact FPGA/LDO electronics sit separately from the BRK8305 / interposer V4 / XEM8305 host stack. A visible curved **micro-HDMI cable** connects FPGA V41's J3—or the combined V7 J3—to the interposer's J600. It does not attach the LDO directly to BRK. Four ASIC PCB-5 source references remain in a separate recording-side group. The separate and combined compact options remain exclusive; the main A/B switch retains the separate direct-LDO carrier V17 approach.

The viewer places the two complete assemblies using their full visible bounds, including the larger BRK board, with a 70 mm display gap. Both assemblies have rigid 180-degree Z display rotations so the source micro-HDMI openings face the gap. Internal FPGA/LDO and BRK/interposer/XEM registrations and all native board meshes remain unchanged. Stack separation changes inspection offsets within each group while preserving the gap and cable endpoints.

The cable jacket is an illustrative mesh. Source anchors are the FPGA V41 J3 connector bounds, combined V7 J3 source-model point, and interposer V4 J600 connector bounds. No particular physical cable length, plug mating datum or bend radius is established. Overall placement and ASIC distribution remain illustrative.

The host now uses full registered BRK8305 and XEM8305 tessellations, replacing the simplified V7 display models. The interposer is a fresh read-only KiCad 10.0.6 export of the unchanged V4 PCB, retaining every assigned component body, native pads, both silkscreens and both soldermask surfaces. Its **52 component-reference groups** contain the same component triangles and registered bounds as the earlier full export; the additional surface layers bring the asset to 271,492 triangles. Native triangle positions, normals and material assignments are retained without mesh reduction, clustering or quantization. The viewer renders the interposer substrate, mask and silkscreen as opaque surfaces to prevent transparency sorting from washing out components; the GLB bytes and real surface openings remain unchanged.

Choose **Interposer only** to hide the other boards and inspect its top surface. **Bottom** exposes its underside connectors; the other focus controls restore the assembly. This makes the small power and programming parts visible without the XEM above them. The native V4 placement prototype has **zero tracks, vias and zones**; no routing or component bodies were invented. The newer Power Foundation V1 remains separate schematic work and is not represented as placed V4 hardware.

| Host asset | Source and geometry | Retained limits |
|---|---|---|
| BRK8305 | Full registered tessellation of Opal Kelly's official STEP; all 190 physical leaves and 447,234 unique triangles | The official model omits MC4–MC9 headers and S1/J2/J6 bodies. |
| Interposer V4 | Unchanged native PCB; 52 component groups, native pad mesh, two silkscreen meshes and two soldermask meshes | Existing shapes mix vendor geometry, generic packages and dimension-derived nominal envelopes. The PCB is unrouted. |
| XEM8305 | Full registered official-model derivative; 335,232 unique triangles | Upstream STEP conversion omits decorative silk, prepreg and K-DOT pickup subtrees. |

The [scene manifest](Scene_Manifest.json) records exact file hashes, native export flags, source registration and omissions. Host preparation is preserved in the dated workspace topics `2026-10-15_FPGA_Work/02_XEM_Interposer_Stack_View_V4/` and `2026-10-15_FPGA_Work/07_Website_Detailed_Models_V8/`. Official BRK/XEM geometry is authored by Opal Kelly. The ASIC PCB-5, FPGA V41, LDO V5 and combined V7 source GLBs are reused without byte changes from the [V6 asset manifest](../assembly-v6/Scene_Manifest.json); [native provenance](../assembly-v6/assets/Native_Assets_Provenance_V6.json) retains their source hashes and omissions. ASIC die bodies and the unavailable PCB-5 J3 body remain omitted. The cable does not fill missing board bodies.

Current component descriptions use board names and revision labels without assigning individuals. Earlier pages, historical sources and native CAD remain preserved, including the [V7 cabled overview](../../../overview-2026-10-15-v7.html) and its [simplified scene](../assembly-v7/index.html). This richer rendering does not establish physical mating or electrical, thermal, routing or fabrication readiness.
