# R15 public visual sources

The carrier views are freshly generated from the saved R15 PCB. The routing SVG and JSON preserve all 720 native track sections, 298 vias, 81 footprint placements, 635 pad records and 26 saved filled polygons. An independent raw-file check verifies every native segment width, endpoint, via, pad transform and filled-polygon point sequence. Back copper is shown in top-view coordinates, without mirroring.

The 3D model contains all 75 component bodies. J1, J19, MC1–MC3 and J4 use independently authored generic box, cylinder and annulus geometry, using native contact positions and nominal mechanical dimensions. Supplier production STEP, embedded vendor geometry, logos and drawing images are excluded. The remaining 69 assignments use KiCad stock packages or original dimension-derived nominal bodies from the prior model provenance. KiCad's library notice is included in the public native download. MH1–MH4 and TP19/TP20 intentionally have no invented component body. JP1's actual purchased header and removable shunt remain to be confirmed.

The GLB is standard glTF 2.0 with 75 named component groups and eight PCB groups, with no external files or decoder dependency. Native triangles and materials are retained while faces are packed per component/material for browser efficiency. Coordinates use metres and Y-up, with an explicit native export origin of 0,0 mm. Carrier_R15_Frame.json gives the exact exported surface levels and coordinate mapping. Component shapes are illustrative and do not establish exact mechanical fit.

Nativeexportreportedwire selfinterference at z1.5994mm,x105.790898..107.008146,y86.001335..86.832516. A small local exported surface may be incomplete. This web mesh is a visualization; exactroutingviews shoulduse nativePCB SVG, not this tessellation.

Four native renders retain their original 1768 × 1488 RGBA pixels and transparency. They were inspected on both board sides. The schematic SVG is a fresh one-page native KiCad export of the unchanged R15 schematic.

Carrier_R15_Public_KiCad_Review.zip is a complete portable review project. Its schematic, project rules, outline, electrical endpoints, track widths, saved copper fills and placements are preserved. PCB and footprint-library changes are limited to model references and removal of embedded supplier payloads. All 99 PCB/library model references and 12 local library-table entries resolve within the download. No supplier CAD collection, private messages or LDO source project is packaged.

The saved original R15 remains untouched. These are review assets; static checks do not establish powered operation, manufacturing readiness or toleranced mating. Exact source and model hashes are in Interactive_Model_Provenance.json and Routing_Independent_Geometry_Check.json; published download hashes are in the site manifests.
