# Assembly sequence · V23

20 October 2026 · [Open viewer](index.html) · [Custom Overview](../../../?approach=custom#overview) · [Model coverage and credits](model-sources.html) · [Asset manifest](Asset_Manifest.json)

The custom FPGA Overview embeds this assembly study using the existing site shell and navy/pale-blue design. The direct carrier V42 view and saved board sections remain separate. Earlier overview pages and source CAD are preserved.

One progress control connects the four same-facing ASIC concepts to the flat middle LDO V13 and FPGA V54, seats the interposer V12 onto BRK8305, then seats XEM8305 and shows the cable connection. Show sheep is off by default; enabling it adds a schematic head-approach stage. Host stack focuses the independently moving host boards. Click a part or double-click for a close-up; Other side, zoom, sketch and scene measurements remain available while scrubbing.

## Geometry and limitations

- FPGA V54 and LDO V13 retain detailed project-exported board/component meshes. The public FPGA derivative excludes only the downloaded Hirose J1/J2 bodies. Their native footprint registrations receive independently generated connector previews.
- Public DF40 previews are project-authored nominal geometry from dimensional facts/footprint centers, not copied supplier STEP triangles. Exact supplier CAD remains in the local engineering review because no public redistribution grant was identified. Preview shapes do not validate engagement or mating tolerance.
- The current interposer model is the saved **V12 placement snapshot** captured 20 October 2026. All 27 assigned bodies are included;23 packaged parts lack bodies, including U1/U2/U3, L1 and shunts. Pads/silkscreen remain. The page does not automatically follow later interposer revisions.
- BRK/XEM reuse the existing official-source geometry from [assembly V8](../assembly-v8/README.md). Explicit mask appearance and adaptive/logarithmic depth prevent the earlier BRK surface breakup without deleting source silk, copper or components.
- Original ASIC PCB-5 is separately inspectable. The proposed pass-through ASIC layout is unfinished. ASIC die regions, cable, support, probe direction guides and sheep interior remain schematic.
- The interposer retains its historical +5 mm export datum. Host gap readouts are nominal design-reference values; physical-face convention, populated tolerances and rigidity remain open. V12's 1.8 V JTAG assumption differs from unchanged FPGA V54's 1.5 V bank. This is a mechanical illustration, not qualified electrical hardware.

No native CAD or circuit was modified. The page does not qualify routing, populated clearance, electrical operation, animal fit or fabrication. [Coverage data](data/model-coverage.json) records omissions.

## Runtime and attribution

Three.js 0.160.1 and its loaders/controls are pinned locally under the [MIT license](licenses/Three_MIT.txt). The Quaternius Farm Animals Pack sheep exterior is [CC0](licenses/Quaternius_CC0.txt). KiCad library geometry retains its [library license/exception](licenses/KiCad_Libraries.md). Native interposer source models retain CADENAS/manufacturer credits and the license stated in their source STEP headers, as described in [notices](THIRD_PARTY_NOTICES.md).

Only runtime meshes, minimal public pose/picking data and source credits are packaged. Raw supplier archives, machine-specific paths, private histories and native CAD packages are not included. The [asset manifest](Asset_Manifest.json) records hashes and the two reused host dependencies. The source mesh builder documents the independent public connector previews.
