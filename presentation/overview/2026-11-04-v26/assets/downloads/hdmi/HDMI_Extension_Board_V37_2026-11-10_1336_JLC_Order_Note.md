# Order note for JLCPCB: HDMI Extension Board V37

Board: HDMI Extension Board V37 (10 Nov 2026), a 6-layer PCIe add-in card, 167.65 × 114.10 mm, PCB plus assembly.
- Electrically x4: PRSNT2# is at B31.
- Physically an x8 edge with 98 fingers.

Please review the production files before fabrication and contact us about anything below.

Coordinates in this note are X, Y in mm as in the Gerber, drill and placement files (Y is negative).

## Unpopulated holes (no part fitted, not in the BOM or placement file)

- J900–J911: 115 header holes, 0.8 mm drill, 1.3 mm pad, plated.
- J920: nine test holes, 1.651 mm drill, 2.54 mm pad, 3.25 mm pitch, plated.
- MH2 (223.33, -131.15) and MH3 (147.83, -69.15): 3.2 mm unplated holes for M3 standoffs.

## PCB

1. **Stackup:** JLC06161H-2116 (1.594 mm), six copper layers in this order: L1 Top (.gtl), L2 GND (.g1), L3 Signal (.g2), L4 Power (.g3), L5 GND (.g4), L6 Bottom (.gbl). Outer copper 1 oz finished (35 µm), inner copper 0.5 oz (15.2 µm). All copper files are positive.
   - L1–L2: 2116 0.127 mm + 2313 0.0964 mm; L2–L3: core 0.30; L3–L4: 2 × 7628 0.2084; L4–L5: core 0.30; L5–L6: 2313 + 2116.
   - Please confirm it is built on the laminate your impedance calculator assumes.

2. **Impedance, ±10%:**

   | Target | Layers | Width / gap | Reference |
   |---|---|---|---|
   | 85 Ω differential | L1/L6 | 0.361 / 0.20 mm | L1: L2 · L6: L5 |
   | 85 Ω differential | L1/L6 | 0.33 / 0.17 mm (PCIe pin field, 0.5 mm pitch) | L1: L2 · L6: L5 |
   | 90 Ω differential | L1/L6 | 0.316 / 0.20 mm | L1: L2 · L6: L5 |
   | 100 Ω differential | L1/L6 | 0.243 / 0.20 mm (recording L1: 0.243 / 0.207) | L1: L2 · L6: L5 |
   | 100 Ω differential | L1 | 0.27 / 0.23 mm (recording at MC3) | L2 |
   | 100 Ω differential | L3 | 0.177 / 0.20 mm | L2 and L4 |

   - Please adjust line width in production if needed to hit target, and tell us if you do.
   - **Copper thieving:** do not add any within 1.0 mm of an impedance-controlled pair, on any layer. The routing layers L1/L3/L6 are lightly filled (about 13 / 9 / 14 %; L6 has a local ground pour of about 530 mm² under and around U700, in the top-left corner) against about 93 % on L2/L4/L5. If balancing copper is needed for flatness, please propose it before production.

3. **Short sections that are intentionally not at the impedance target:**
   - PCIe pin-field necks beside the ground return-via row: 0.28 mm width, 0.22 mm gap. Every off-target stretch is 2.5 mm or shorter.
   - PCIe finger-side stubs at 1.0 mm pitch: 0.361 mm, 1.9 mm or shorter (about 101 Ω).
   - PCIe reference-clock breakout on L6: 0.48 mm width, 3.0 mm in total.
   - Recording pairs at the HDMI pins: 0.14 mm width, about 1.7 mm per line (0.65–1.05 mm run plus a 0.6 mm diagonal).
   - Command pairs between each HDMI pin and its ESD array: 0.15 mm width for about 3.5 mm per line.
   - Command pairs through the U801–U816 pads on L1: 0.20 mm width, 0.30 mm gap, 40 pieces of 0.77 mm.
   - Command pairs in the MC1 pin field on L1: 0.243 mm width at 0.56 mm gap (connector pitch), 54.5 mm in total.
   - USB pair: 0.20 mm width, about 0.7–3.7 mm long.

4. **Vias and holes:**
   - All vias are through vias, epoxy filled and capped (POFV), including via-in-pad on both sides. 340 vias have their centre in an SMD pad. The board file marks all vias filled and capped.
   - 1163 plated holes: 991 vias and 172 component holes (0.65 mm × 32, 0.80 mm × 115, 1.00 mm × 14, 1.651 mm × 10, 3.50 mm × 1). 36 of the component holes are plated slots: 32 × 0.65 × 1.70 mm (J610–J617) and 4 × 1.0 mm wide (J4).
   - 11 unplated holes: 2 × 0.65 mm (J500), 6 × 1.02 mm (MC1–MC3), 1 × 1.60 mm (J4), 2 × 3.20 mm (MH2, MH3).
   - Via drills: 210 × 0.15 mm, 722 × 0.20 mm, 59 × 0.30 mm.
   - The 0.15 mm drills (about 10.6:1 at 1.59 mm) are at the Micro-HDMI pins (104), the U801–U816 ESD arrays (40), U501 (3), C508 (1) and 62 other fine-pitch escapes.
   - **Please confirm in writing at file review that 0.15 mm drills are acceptable;** your guide cites 6–8:1 for 1.6 mm.

5. **Gold fingers:**
   - ENIG, 30° bevel, on the card edge only (bottom edge of the outline).
   - Finger tips are 1.40 mm from the edge. Mask windows are open to the edge.
   - **Please use precision routing (±0.1 mm) on the card-edge tongue and key notch.** Pads A11/B11/A12/B12 are 0.20 mm from the notch edge, and A1/B1/A49/B49 are 0.30 mm from the tongue sides. This is the PCIe CEM geometry, so please do not trim the pads.
   - If ±0.1 mm routing needs tooling holes, three unplated holes are available: MH2 3.2 mm (223.33, -131.15), MH3 3.2 mm (147.83, -69.15) and the J4 peg hole 1.6 mm (109.08, -50.65); holes in the edge rails are also fine. Please tell us before production if this tolerance cannot be held.
   - Board thickness at the fingers must stay within 1.44–1.70 mm (PCIe 1.57 ± 0.13).

## Silkscreen

- **Order number:** the bottom silkscreen has a "JLCJLCJLCJLC" marker in a clear area at (175, -131). Please print the order number there ("Specify a location"), not on top.
- Silk text is 1.0 mm or larger with 0.15 mm or thicker strokes, except the header-hole names on the back (0.8 mm, 0.15 mm strokes, small on purpose). All text is at least 0.15 mm from every pad. Silkscreen is clipped at the mask openings in the Gerbers.

## Assembly

1. **Edge rails:** left and right edges only, so the finger edge stays free for the bevel. Please remove them after assembly.
   - The J610–J617 connector mouths are flush with the left edge (within 0.13 mm), and a cable plug is wider than the connector. **No tab stub or burr may stand proud of the board outline anywhere on the left edge.**
   - Use tabs on the left edge, not V-cut, only between the connector shells: tab centres at Y = -60.15, -73.25, -86.35, -99.45, -112.55, -125.65 and -138.75, each 5 mm wide (5 mouse-bite holes), centred within ±0.3 mm (the free gap between shells is 6.3 mm).
   - Mouse-bite hole centres 0 to 0.10 mm inside the board outline. The L2/L4/L5 ground planes are 0.50 mm from this edge; you may pull that copper back locally at the tabs.
   - J500 overhangs the top edge by 1.18 mm and J4 by 0.35 mm; keep the top edge free.
2. **Fiducials:** four on top, three on the bottom.
3. **Connectors sourced by JLC:**
   - MC1/MC2 Samtec BTE-040-01-F-D-A (C2914307).
   - MC3 Samtec QTH-040-01-F-D-DP-A (C7330812, pre-ordered).
   - J500 USB4110-GF-A (C5143397).
   - J610–J617 Molex 46765-1001 (C563878).
   - J4 Same Sky PJ-063AH (C22434582).
4. **J610–J617 shell tabs are pin-in-paste.** 32 plated slots (0.65 × 1.70 mm) hold the connectors against cable force.
   - **Please keep the 32 top-paste apertures over the plated slots in the stencil exactly as in the Gerber (do not delete or shrink them), and confirm at file review.** Each is the 2.55 × 1.50 mm slot pad plus a drawn 1.0 mm overprint on the side away from the connector centre-line (about 2.55 × 2.5 mm in total).
   - The tabs are only 0.4–0.7 mm long and do not reach the bottom side of the 1.59 mm board, so they must be soldered from the top.
   - Please touch up by hand from the top where a tab has no fillet.
   - Do not solder the tabs from the bottom: C721–C728 are 0.28–1.1 mm from the slot pads.
5. **J4:** pad 2 has a solid connection to the inner planes, on purpose, for current. Please allow for the heat needed to solder it.
6. **Placement file:** Mid X / Mid Y for J4, J500 and J610–J617 are pad-centre values, because these footprints have an off-centre origin. Your library origin for J610–J617 and J500 may differ from these by up to 0.45 mm: please align those parts on their pads. Please show the placement preview ("Confirm Parts Placement") so we can approve every polarized part against the pin-1 table under Files.
7. **Paste and stencil:** the U801–U816 apertures are 0.22 × 0.47 mm. Please use a 0.10 mm stencil, or tell us your stencil thickness.

## Files

- **BOM:** every line carries its JLC/LCSC number; there are no consigned parts. 270 parts.
- **Rotations:** the placement file carries JLC-library angles for the parts in the table (bottom side: 180° − KiCad angle + library offset); every other row is the KiCad angle. Angle conventions differ between tools, so **please place by pin 1, not by angle**: the table gives where pin 1 must sit. U2, U6, U501 and Q1 have symmetric pad patterns and little silkscreen marking; SW600 is hand-fitted and fits both ways round. Please check those in particular.

| Part | Side | Pin 1 at X, Y | Placement-file angle | KiCad angle |
|---|---|---|---|---|
| Q1 | Top | 105.93, -140.53 | 0 | 180 |
| U2 | Top | 113.70, -137.68 | 90 | 270 |
| U6 | Top | 122.43, -137.68 | 90 | 270 |
| U501 | Top | 157.97, -54.25 | 270 | 0 |
| U505 | Top | 173.53, -54.09 | 270 | 0 |
| U5 | Top | 116.83, -152.52 | 0 | 90 |
| D500 | Top | 149.05, -58.74 | 0 | 90 |
| U4 | Top | 117.85, -138.13 | 180 | 180 |
| U700 | Top | 122.00, -57.83 | 0 | 0 |
| Y500 | Top | 153.45, -58.52 | 0 | 0 |
| C5 | Top | 108.21, -66.03 ("+" pad) | 0 | 0 |
| J4 | Top | 109.08, -59.65 (centre-pin slot) | 0 | 180 |
| SW600 | Top | 202.00, -51.50 (terminal 1, square pad) | 0 | 0 |
| U801 | Top | 75.78, -146.30 | 90 | 180 |
| U802 | Top | 75.78, -133.20 | 90 | 180 |
| U803 | Top | 75.78, -120.10 | 90 | 180 |
| U804 | Top | 75.78, -107.00 | 90 | 180 |
| U805 | Top | 75.78, -93.90 | 90 | 180 |
| U806 | Top | 75.78, -80.80 | 90 | 180 |
| U807 | Top | 75.78, -67.70 | 90 | 180 |
| U808 | Top | 75.78, -54.60 | 90 | 180 |
| U809 | Top | 75.02, -141.28 | 270 | 0 |
| U810 | Top | 75.02, -128.18 | 270 | 0 |
| U811 | Top | 75.02, -115.08 | 270 | 0 |
| U812 | Top | 75.02, -101.98 | 270 | 0 |
| U813 | Top | 75.02, -88.88 | 270 | 0 |
| U814 | Top | 75.02, -75.78 | 270 | 0 |
| U815 | Top | 75.02, -62.68 | 270 | 0 |
| U816 | Top | 75.02, -49.58 | 270 | 0 |
| U602 | Bottom | 143.14, -77.70 | 90 | 0 |
| U603 | Bottom | 154.86, -70.95 | 90 | 0 |
| U605 | Bottom | 161.86, -70.95 | 0 | 0 |
| U610 | Bottom | 169.57, -81.86 | 0 | 90 |
| U611 | Bottom | 95.98, -140.80 | 270 | 180 |
| U612 | Bottom | 84.06, -128.62 | 270 | 180 |
| U613 | Bottom | 84.06, -115.53 | 270 | 180 |
| U614 | Bottom | 84.06, -102.42 | 270 | 180 |
| U615 | Bottom | 84.06, -89.33 | 270 | 180 |
| U616 | Bottom | 84.06, -76.22 | 270 | 180 |
| U617 | Bottom | 84.06, -63.12 | 270 | 180 |
| U618 | Bottom | 84.06, -50.02 | 270 | 180 |
| U701 | Bottom | 102.96, -146.25 | 0 | 0 |
| U702 | Bottom | 90.66, -133.15 | 0 | 0 |
| U703 | Bottom | 90.66, -120.05 | 0 | 0 |
| U704 | Bottom | 90.66, -106.95 | 0 | 0 |
| U705 | Bottom | 90.66, -93.85 | 0 | 0 |
| U706 | Bottom | 90.66, -80.75 | 0 | 0 |
| U707 | Bottom | 90.66, -67.65 | 0 | 0 |
| U708 | Bottom | 90.66, -54.55 | 0 | 0 |
| D701 | Bottom | 108.20, -143.89 (cathode) | 90 | 90 |
| D702 | Bottom | 95.90, -129.21 (cathode) | 270 | 270 |
| D703 | Bottom | 95.90, -116.11 (cathode) | 270 | 270 |
| D704 | Bottom | 95.90, -104.59 (cathode) | 90 | 90 |
| D705 | Bottom | 95.90, -91.49 (cathode) | 90 | 90 |
| D706 | Bottom | 95.90, -78.39 (cathode) | 90 | 90 |
| D707 | Bottom | 95.90, -65.29 (cathode) | 90 | 90 |
| D708 | Bottom | 95.90, -52.19 (cathode) | 90 | 90 |
