# R15 assembly visualization sources

The carrier is freshly exported from saved R15 PCB SHA256 `61e693734a11f87cc2719fc4030975bb590dee46df228db0d5de3316b03ea035`. All 75 fitted carrier bodies are represented; four mounting holes and two test pads are bare. J1/J19, MC1–MC3 and the barrel jack use independent generic bodies. Other bodies use KiCad stock or dimension-derived models. Component positions and native copper are preserved. The routing SVG is independently checked against native segments, vias, pads and saved fills.

The blue XEM board uses source outline, hole and connector datums with ten independently drawn package envelope boxes. Small passives and exact terminal/plastic shapes are omitted. The nominal 5 mm mating gap follows [Opal Kelly expansion connector documentation](https://docs.opalkelly.com/xem8305/expansion-connectors/). The measured source-model board thickness has no qualified production tolerance.

The amber LDO board uses the matching Gerald native PCB outline and intended J1/J19 registration, with a nominal 2 mm mating gap. It includes nine regulator bodies and 52 fitted passive envelope boxes; 17 source-BOM DNP connectors/headers are omitted. The narrow tail's 18.425 mm overhang is retained. Capacitor/resistor heights are illustrative. J19 is mechanical only in the matching source. LDO source hashes and coordinate reflection are documented in LDO_Attachment_Geometry.json. No ASIC die or other unprovided assembly has been invented.

No supplier XEM/LDO/connector mesh, artwork or logo is redistributed. KiCad stock models retain the [KiCad library license and electronic-design/generated-file exception](https://www.kicad.org/libraries/license/); no new blanket design license is applied. Public native carrier files change model references only and omit supplier embedded payloads.

Native GLB export reports a small wire self-interference near MC2 (x105.791–107.008, y86.001–86.833, z1.5994 mm); a local tessellated surface may be incomplete. Use the exact routing SVG or editable PCB for copper inspection. No native geometry repair was performed for visualization.

At slider 0 mm, both attachment positions are nominal. Exact terminal seating, actual fitted parts, fasteners, dual-connector tolerance, populated clearances, current/thermal/timing limits and manufacturing qualification remain open. This is a design review, not a fabrication release.
