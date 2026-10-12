# Carrier R15 public KiCad review

Open `project/CARRIER_XEM8305_R15_Wider_Power.kicad_pro`. This portable project retains the saved R15 schematic, project rules, board outline, all 81 footprint placements and pad nets, 720 track sections, 298 vias and 26 saved filled polygons. The only PCB/footprint changes in this public adaptation concern 3D model references and removal of supplier embedded model payloads.

All 75 component bodies have local public representations. J1, J19, MC1–MC3 and J4 use independently authored generic primitives; cavities, contacts and body detail are simplified. The other 69 assignments use KiCad stock package or original dimension-derived representations, with the included KiCad library notice. MH1–MH4 and TP19/TP20 are intentionally bare. Original supplier STEP and embedded vendor geometry are excluded. Exact purchased header/shunt identity, powered operation and mechanical tolerance qualification remain open.

The source R15 PCB SHA256 is `61e693734a11f87cc2719fc4030975bb590dee46df228db0d5de3316b03ea035`. This is a routed review candidate, not a fabrication release. The separate interactive routing SVG preserves exact saved native copper for layer inspection.
