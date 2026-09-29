# Step 14 — compact 50T placement handoff (28 September 2026)

**Historical Step14 project snapshot.** Step15 subsequently changed three text annotations in the overview schematic. Statements below that all non-PCB files match Step13, or that all active project files match this checkpoint, apply only to the frozen Step14 snapshot. See the [Step15 annotation handoff](Step15_Overview_Annotation_Handoff.md) and [complete file hash manifest](../validation/Step15_Project_SHA256_Manifest.json) for the current active project.

## Result and exact status

The active board is a **36 × 38 mm placement study**, 1,368 mm². This reduces the Step 13 38.5 × 43 mm outline (1,655.5 mm²) by 287.5 mm², or **17.37%**. It is still 180 mm² (15.15%) larger than the older routed Micro HDMI board's nominal 33 × 36 mm outline. No claim is made that either board can be routed with the current 50T signal map. The Step 14 board has **zero tracks, zero vias, zero copper zones, and 625 native ratsnest connections open**. KiCad DRC separately reports 499 unconnected items because its reporting unit is different.

The two 60-contact DF40T footprints are on the top face at opposite corners: **J7 north/east (30.5, 8.0 mm)** and **J5 south/west (13.0, 39.3 mm)**, both at 0°. U1 stays at (23.8, 25.5 mm), 0°. The custom Micro HDMI J4 remains on the east edge at (38.8, 24.5 mm). The board still has the single-image 32-Mbit configuration flash, Y2 GTP clock candidate, two test LEDs (`PWR` and `DONE`), ten 1.5-V FPGA test I/O pads and two grounds along the west edge, and no H1–H4 mounting holes. The twelve edge contacts are identified by a grouped silk legend in top-to-bottom order; individual tiny pad labels were not forced into the component clearances.

The Step14 board SHA-256 is `6bafa7f2b19bca1b78f083b53e7d6f9c46c5619e1202761e4f698e362bb01a54`. The full 69-file Step14 portable project is frozen in checkpoint 14 (local source; not included in web package). **At Step14 only**, its hashes matched the then-active project, all non-PCB files matched Step13 byte-for-byte, and the only project-file changes from Step13 were PCB placement, outline, and drawing/silk annotation. The 174 footprint references and all **911 physical pad/net assignments** still match Step13. Step15's annotation-only schematic update does not alter the PCB hash or those pad/net assignments.

## Clearance and mechanical check

KiCad 10.0.6 full-severity DRC reports **0 physical violations and 0 schematic parity violations**. The hierarchy ERC reports **0 errors, 17 warnings**. The native readback reports 174 footprints, 911 physical pads, no copper, and 625 open connections. See the exact [DRC JSON](../validation/Step14_Final_Full_DRC.json), [ERC JSON](../validation/Step14_Final_ERC.json), [native readback](../validation/Step14_Final_Native_Ratsnest.json), [pad/net comparison](../validation/Step14_Pad_Net_And_Placement.json), and [project hash manifest](../validation/Step14_Complete_Project_Hashes.json).

The nominal outline is x = 4.5–40.5 and y = 4.5–42.5 mm. J7's courtyard occupies x = 22.655–38.345, y = 5.565–10.435 mm (1.065 mm from the north edge). J5's courtyard occupies x = 5.155–20.845, y = 36.865–41.735 mm (0.655 mm from the west and 0.765 mm from the south). The Micro HDMI **J4 courtyard extends to x = 41.745 mm, 1.245 mm past the nominal east edge**. Its edge-mount overhang is intentional but the mating shell, panel/cable access, board fabrication outline, and keep-out need mechanical sign-off. The diagonal pair of rigid DF40T connectors also requires a mating-board fit and tolerance check; a 2-D courtyard pass alone cannot validate both pairs mating simultaneously.

Rendered [top](Step14_Top_Review.png) and [bottom](Step14_Bottom_Review.png) views were inspected. All moved edge legends and the two LED labels are within the board outline, and stale `43 × 49 mm / four holes` drafting text was replaced. The grouped Bank 34 silk approaches U1's courtyard within about **0.076 mm** after the final 0.1-mm adjustment; DRC is clean, but actual silk print readability and assembly tolerance need review. J4's *electrical* Type-D pin map remains a custom link, not standard HDMI equipment.

## Connector placement tradeoff for Gerald's layer-by-layer routing objective

The prior **clean 36 × 38 mm, U1 0° alternative** is preserved at the original trial (local source; not included in web package), with J5 north/east and J7 south/west. Moving the connector *footprints* to the opposite corners in Step 14 preserves every contact/net mapping and the nearby MGT bypass placement. A geometric screen of the 116 assigned ASIC digital nets finds:

| Metric | Original 36 × 38 | Step 14 connector swap |
|---|---:|---:|
| Source balls on opposite north/south half from target connector | 72/116 | **44/116** |
| Mean FPGA ball-to-contact straight distance | 19.44 mm | **18.91 mm** |
| Source balls on opposite east/west half | **39/116** | 77/116 |

This is a routing **tradeoff**, not a proved route improvement. The extra east/west crossings could consume layer transitions or congest the FPGA escape despite shorter north/south travel. The older `Escape_Corridor_Map.csv` and its J5-east/J7-west narrative are stale for Step 14. Use the new north/south ball-to-contact map and then route representative BGA escape, connector, GTP and supply nets before deciding whether Step 14 or the preserved original placement is preferable. Actual differential-pair return paths and simultaneous contact escape require review. The two DF40T connectors currently allocate 116 digital contacts, one `AC_IN`, and just three ground contacts; a separate power/ground lead to the routing board does **not** replace local high-speed return contacts. The ASIC team must confirm signal use and return allocation before claiming routing closure.

## Smaller and rotated trials

- A direct **36 × 36 mm cut** from the clean 36 × 38 placement produced 49 physical DRC violations, including 42 copper-to-edge violations. Moving J7 north by 1.5 mm still left 37 violations, including bottom-edge components/testpoints; J7-to-U1 courtyard channel would shrink to about 1.32 mm. A 36 × 36 board might be possible only after a larger power/connector repack, and has not been validated.
- A y-only J5/J7 swap, meant to preserve the east/west distribution, yielded **187 physical DRC violations**: J7 collides with the upper-left L2 stage and edge pads, while J5 collides with the lower-right GTP regulator/J6/testpoints. It was not promoted.
- Rotating U1 by 180° would reduce the eight selected GTP ball-to-J4 straight mean from 17.25 to 7.06 mm and north/south opposite-half ASIC signals from 72 to 44. A bare rotation, however, moves MGTAVCC ball-to-nearest bypass median/max from 1.33/2.43 to 11.49/13.17 mm and MGTAVTT from 1.72/4.83 to 10.77/13.49 mm. Repositioning six B-side bypass capacitors in an isolated trial repaired capacitor proximity (MGTAVCC median/max 1.64/1.88 mm; MGTAVTT 2.04/2.35 mm), but the MGT ferrite beads remained approximately 15+ mm from the moved ball/capacitor cluster. It needs a power-distribution redesign and was **not** promoted.

No isolated failure trial changed the active board. The promotion and final silk adjustment are reproducible with promotion script (local source; not included in web package) and silk script (local source; not included in web package), subject to their guard hashes. All trials remain under `validation/compact_geometry_trial/`.

## Next design gates

Route a representative layer-by-layer escape before committing to the 36 × 38 connector ordering or shrinking further. Validate both DF40T mating locations and J4 overhang in 3-D against the routing board and enclosure. Decide connector signal-return allocation with Gerald and the ASIC team. Resolve the custom Micro HDMI supply/cable budget and routing-board power feed, MGT power integrity, and the confirmed GTP line/ref-clock rates. Full-route DRC, SI/PI, thermals, mechanical assembly, and fabrication review remain open.
