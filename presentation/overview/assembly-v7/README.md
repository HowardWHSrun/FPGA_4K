# Current cabled assembly · V7

15 October 2026. [Open interactive scene](index.html) · [Main overview](../../../index.html?approach=custom#overview) · [Asset hashes, layout and cable anchors](Scene_Manifest.json).

The compact FPGA/LDO electronics sit separately from the BRK8305 / interposer V4 / XEM8305 host stack. A visible curved **micro-HDMI cable** connects FPGA V41's J3—or the combined V7 J3—to the interposer's J600. It does not attach the LDO directly to BRK. Four ASIC PCB-5 source references remain in a separate recording-side group. The separate and combined compact options remain exclusive; the main A/B switch retains the separate direct-LDO carrier V17 approach.

The viewer places the two complete assemblies using their full visible bounds, including the larger BRK board, with a 70 mm display gap. Both assemblies have rigid 180-degree Z display rotations so the source micro-HDMI openings face the gap. Internal FPGA/LDO and BRK/interposer/XEM registrations and all native board meshes remain unchanged. Stack separation changes inspection offsets within each group while preserving the gap and cable endpoints.

The cable jacket is an illustrative mesh. Source anchors are the FPGA V41 J3 connector bounds, combined V7 J3 source-model point, and interposer V4 J600 connector bounds. No particular physical cable length, plug mating datum or bend radius is established. Overall placement and ASIC distribution remain illustrative.

All seven source GLBs are reused without byte changes from the [V6 asset manifest](../assembly-v6/Scene_Manifest.json). [Native export and exact-triangle repack provenance](../assembly-v6/assets/Native_Assets_Provenance_V6.json) and [host source provenance](../assembly-v6/assets/Host_Asset_Provenance.json) retain the source hashes and omissions. ASIC die bodies and the unavailable PCB-5 J3 body remain omitted; some host connector/decorative bodies are absent from the official sources. The cable does not fill those missing board bodies.

Current component descriptions use board names and revision labels without assigning individuals. Earlier pages, historical sources and native CAD remain preserved, including the [V6 overview](../../../overview-2026-10-15-v6.html). Design review status and hardware qualification are unchanged.
