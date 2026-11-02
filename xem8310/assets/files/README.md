# HDMI Extension Board — 1 November 2026

- [View the current design](../../index.html)
- [V5 one-page schematic PDF](../HDMI_Extension_Board_Schematic_V5.pdf)
- [V5 schematic KiCad project and local libraries](HDMI_Extension_Board_Schematic_V5_KiCad.zip)
- [V3 placement KiCad project, paired earlier schematic, rules and local libraries](HDMI_Extension_Board_Placement_V3_KiCad.zip)
- [V3 3D placement preview](../hdmi-extension-placement-v3.glb)
- [Component CSV](../components.csv)
- [Source hashes](source-manifest.json)
- [Native check summary](../publication-status.json)

Open the project file inside each extracted folder in KiCad 10.0.6 or newer. V5 is the current circuit source; V3 is the latest saved placement study. The V3 paired schematic predates TP710–TP713, and these four footprints are not placed. All 1,423 existing named pin/net memberships agree with current V5. These are separate revision tracks; V3 does not supersede the V5 schematic version.

The V3 board has 269 footprints, six layers, no routed tracks/vias and no copper pours. The included layer stack and design rules are working assumptions, not fabrication-approved impedance constraints. DRC remains open; inspect the saved reports and ignored checks. The earlier V2 review is not a full review or approval of V3. Bracket and plug fit, support holes, silkscreen, power/clock placement, cable power, routing and hardware qualification remain open.

Both KiCad packages include editable native content and project-local 2D dependencies. Supplier 3D payloads and their references are omitted; no broken native 3D paths are left. A separate GLB provides native PCB surfaces with 238 independently authored nominal component bodies. This does not model the assembled XEM, cables, bracket or enclosure and does not qualify fit. No Gerbers or fabrication release is supplied for this unrouted study.

The product name is HDMI Extension Board. Historical BRK8310 source identifiers and existing library names remain for attribution and compatibility. The archived V10 page remains available separately. Other board projects and historical meeting assets are unchanged.
