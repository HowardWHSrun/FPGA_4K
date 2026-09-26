# Circled space audit — 26 September 2026

The marked spaces reveal useful placement opportunities, especially on the back. They do **not** establish a smaller complete-board outline yet. Both front circles coincide with the two mezzanine connectors in the separate 117-signal connector-fit study.

## Source and scope

- Read-only native source: `minimal_core/hardware/FPGA100T_Minimal.kicad_pcb`.
- SHA-256: `3844c24f88697bec091e872c117a7889586df9be4053b912ec79253738d337c0`.
- Native readback: nominal 40 × 36 mm outline, 126 components, 1,010 track segments, 146 vias and four GND zones. KiCad's bounding box includes the 0.10 mm outline stroke and therefore reads −0.05 to 40.05 / −0.05 to 36.05; this is not a 40.1 × 36.1 mm board-size revision.
- The screenshot's circles were approximated by rectangular inspection windows. No claim is made that these are exact traced circle areas.
- All coordinates below are native top-view millimetres, with nominal top-left at (0, 0). The displayed back is mirrored: **back-display x = 40 − native x**. The long circle on the displayed back's right is behind the front's left-hand regulators.
- `native_geometry.json` records native courtyard/body/pad envelopes and copper item metadata. `Circled_Area_Measurements.json` contains the window measurements; `extract.py` and `analyze.py` reproduce them. The extraction never saves CAD.

## What occupies the circles

| Circle | Approximate native review window (mm) | Visible-side courtyard area / window area | What the picture does not make obvious |
|---|---|---:|---|
| A: front upper centre | x 10.5–35.5; y 0–8.5 | 38.67 / 212.50 mm² | Rear flash U6, R100–R107 and C21/C57/C58/C100/C101 occupy the other side. There are 16 vias in this window, plus boot/config/JTAG routes. |
| B: front lower centre | x 12.5–34.5; y 26–36 | 33.57 / 220.00 mm² | Rear C20 (330 µF polymer), C50 (47 µF), and other decoupling occupy the other side. Eight vias intersect this window. |
| C: mirrored-back right strip | x 0–8.75; y 0–31.8 | 7.56 / 278.25 mm² | Almost no back components except part of C82, but the opposite side holds U3/U4/U5 and L2/L3/L4. Nineteen vias and regulator feedback/switch/soft-start/power routes intersect the window. |
| D: mirrored-back lower left | x 21.25–39.5; y 24–35 | 51.20 / 200.75 mm² | It includes the edge of rear decoupling C25/C27/C41/C50/C51/C52/C53/C55/C63 and lies partly behind U2 and its support parts. Fifteen vias intersect it. |

The courtyard areas are an exact union of their axis-aligned bounding rectangles clipped to the approximate windows, not usable routing area. Track counts in the JSON use track bounding-box intersection, so a diagonal track can contribute even when its centreline misses a window corner. Via counts include the via diameter.

## Largest rectangles without same-side component courtyards

These are geometric opportunities **before** board-edge allowance, through-holes, vias, copper clearance, power-loop constraints, tolerances or new connectors. They must not be labelled free routing/placement rectangles.

| Window | Rectangle (native mm) | Width × height |
|---|---|---:|
| A | x 10.500–30.045; y 0.000–7.555 | 19.545 × 7.555 mm |
| B | x 12.500–34.500; y 29.295–36.000 | 22.000 × 6.705 mm |
| C | x 0.000–7.125; y 0.000–31.800 | 7.125 × 31.800 mm |
| D | x 23.175–39.500; y 29.205–35.000 | 16.325 × 5.795 mm |

## Useful next placement changes

1. **Repack the lower-left auxiliary regulator group.** The bottom edge is currently constrained by C8's courtyard to y = 35.040 mm, C7 to 34.860 mm, and R11 to 34.440 mm. Moving/repacking this group is necessary to reduce height. The present U3/L2/support-group envelope is x 1.220–10.530, y 24.060–35.040: 9.310 × 10.980 mm. It cannot simply be moved intact into the 6.705 mm-high front lower strip, even after a 90° rotation. A new arrangement and local routing are required.
2. **Consider moving rear bulk capacitors into the rear lower-left space.** C20's courtyard is 8.870 × 4.850 mm; C50's is 4.650 × 3.250 mm. Each individually fits the 16.325 × 5.795 mm courtyard-only rectangle D, but this is not a validated simultaneous placement or electrical recommendation. Their supply/return paths, capacitor polarity, assembly clearance, mezzanine holes and the revised power circuit must be checked before moving them.
3. **Use the rear right strip selectively.** This is a candidate for relocating low-profile parts after a power-placement review. It is directly behind switching regulators. Moving switching/feedback circuitry or cutting into their current-return paths can make a geometrically smaller board electrically worse. The 7.125 mm-wide courtyard-only strip cannot hold the present 9.310 × 10.980 mm U3 group intact.
4. **Re-plan both mezzanine connectors with the routing board.** In the current separate connector-fit study, J5 is centred at (20.8, 4.5) mm and J6 at (21.5, 31.5) mm, both 0°. They occupy circles A and B. The mating-board transform is (+0.7, +27.0) mm; moving either requires a corresponding mating-board change. The existing study reports only 0.225 mm nearest courtyard-to-edge space and 0.265 mm minimum NPTH-hole-edge-to-back-courtyard distance. These are geometry results, not toleranced assembly approval.

## Why cropping the picture is insufficient

Top, bottom and side outline reductions affect all components and copper along an entire edge, not just the marked local gap. Front L4 reaches y = 0.810 mm, rear U6 reaches y = 0.875 mm, front C8 reaches y = 35.040 mm, and rear C20/C50 reach y = 33.275 mm. The front leftmost courtyard is x = 1.220 mm; rear oscillator Y1 reaches x = 38.825 mm. J4's courtyard extends to x = 40.525 mm as an edge connector, and its exact edge/cable fit is still unqualified. Two internal ground zones currently run from (0.5, 0.5) to (39.5, 35.5) mm.

The core drawing omits the 117-signal mezzanine connectors and does not complete the application/link routing or power circuit. A smaller core-only fit cannot be represented as the size of the full requested board. The next credible milestone is a combined connector-inclusive placement candidate, followed by complete routing, DRC, power/thermal review and assembly verification. No native CAD, routing, outline or website was changed by this independent audit.
