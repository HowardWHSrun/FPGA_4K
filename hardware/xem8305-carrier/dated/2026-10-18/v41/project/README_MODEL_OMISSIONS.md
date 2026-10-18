# Model-free V41 engineering review copy

Open `CARRIER_XEM8305_V41_Sourcing_Alternates.kicad_pro` in this folder.

The editable schematic, PCB, project settings, rules, eight symbol libraries and eight footprint-library directories are included. All tables use project-relative paths. This is a single-page schematic; there are no omitted hierarchical sheets.

This publication copy omits every 3D model assignment and embedded-file payload from the PCB and footprint libraries. No supplier STEP/STP files or model collections are distributed. The authoritative local V41 source remains unchanged and retains its original model assignments. Therefore the PCB file hash differs here while all non-3D content is equivalent. Do not expect complete 3D visualisation from this public copy.

The original PCB SHA-256 is `8241aee58b92798491cf6bcd8d16272a8f4049487a1b2fd2bd17fa9332b6ecf7`. The public-copy hashes and exact scope of omissions are recorded in `../verification/Public_Review_Non3D_Equivalence.json`.

Routing, pad geometry, placement, nets, stack/rules, schematic electrical content, masks, silkscreen and all saved fills are preserved. No geometry was redrawn and the file was not reserialized. Only complete `(model ...)` and `(embedded_files ...)` S-expression spans were removed from PCB/footprint source text. The schematic/settings/rules/symbols are byte-identical copies.

The schematic PDF, CAM ZIP, BOM, CPL, shunt CSV and via CSV/map are byte-identical exports from the authoritative source. The stack contract removes only its broken local source_excerpt field; its official source_url and every physical specification are retained. This review copy is not production authorization; factory acceptance and prototype bench qualification remain separate gates. Existing vendor/source citations in the schematic and component fields are retained. No blanket license is asserted over third-party design data.
