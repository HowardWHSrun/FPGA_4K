# Order note for JLCPCB (V35 draft, not yet used for an order)

V35 (8 Nov 2026, 12:07) is V34 (8 Nov 2026, 08:19; the released name of working revision V46) plus nine voltage test holes. The working revisions V34–V46 of 7 Nov were steps between V33 and V34; the history below keeps their numbers.

Board: HDMI Extension Board V35, a 6-layer PCIe add-in card, 167.65 × 114.10 mm.
- Electrically x4: PRSNT2# is at B31.
- Physically an x8 edge with 98 fingers.

Please review the production file before fabrication and contact us about anything below.

## What changed

**From V34 to V35:**
- J920: nine bare test holes (1.651 mm drill, 2.54 mm pad, 3.25 mm pitch) in a row below MC1, each named on both silkscreens. **No part fitted**: not in the BOM or placement file.
- 9 new vias (0.45 mm pad, 0.20 mm drill) and 37 new 0.2 mm tracks feed the holes. No existing copper moved.
- The bottom "JLCJLCJLCJLC" order-number marker moved to a clear area at (175, 131); the R10 reference text moved to the left of R10.
- BOM and placement file are the same as V34 (270 parts; KiCad's position export matches every row).

**From V33 to V34** (working revisions V34–V46 of 7 Nov 2026):
- Copper and silkscreen only. V42 changed the silkscreen only. V43 removed the unused HDMI 12/14 escapes on ports 1, 2, 7, 8 (16 vias, 62.6 mm of track); V44 added 10 ground vias in the lower MC3 ground bars. **V45 changed parts:** added 2.00 mm header positions J900–J911 (115 holes, 0.8 mm drills), moved SW601 and R600 to the left of SW600, removes the two right-hand BRK mounting pads (3.5 mm plated) and the two XEM standoff holes MH1/MH2 (3.2 mm plated). **V46:** J900–J911 are bare header holes like BRK8310 (0.8 mm drill, 1.3 mm pad), **no part fitted**: excluded from the BOM and placement file. Every hole is named on the back silkscreen in 0.8 mm text (below JLC's 1.0 mm recommendation, at Howard's request). Fiducials FID3 (top) and FID5 (back) are at (230.5, 104.0). The V34 BOM is the V33 BOM (same 270 parts); the V34 placement file updates SW601 and R600 from the saved board, every other row is unchanged from V33 (checked against KiCad's position export). Please check the SW601 and R600 rotations in the placement preview.
- R700 and R702: the schematic fields now carry the LCSC numbers already in the BOM: C137723 (40.2 kΩ) and C22797 (13 kΩ).
- MC1–MC3 now carry their LCSC numbers in the design files (C2914307, C2914307, C7330812), the same parts as the V33 BOM.
- MH1/MH2 and the BRK test points TP9–TP16/TP20/TP21 are marked "exclude from BOM and placement" (they are not placed parts).
- Copper changes:
  - 4 more 100 Ω LVDS pairs from the HDMI connectors to MC1.
  - Small re-spacing near MC1.
  - Added return and feed vias. V39's 243 loose ground stitching vias are not in V40; instead V40 adds 109 vias on ground and power pins (inside the pad or on a short neck) and gives each PCIe ground finger its own via (all 10 top/bottom shared finger vias split; V41 moved the REFCLK finger-breakout jog 1.4 mm toward C7/C8 to make room at B13). V39's 20 power vias stay.
  - Width corrections: PCIe pin-field necks widened to 85 Ω where clear.
  - P/N delay compensation on PCIe TX3 and REFCLK (one 45° bump / dogleg each).
- Earlier history: see the V33 note.

## PCB

1. **Stackup:** JLC06161H-2116 (1.594 mm).
   - L1–L2: 2116 0.127 mm + 2313 0.0964 mm; L2–L3: core 0.30; L3–L4: 2 × 7628 0.2084; L4–L5: core 0.30; L5–L6: 2313 + 2116.
   - Please confirm it is built on the laminate your impedance calculator assumes.

2. **Impedance, ±10%:**

   | Target | Layers | Width / gap | Reference |
   |---|---|---|---|
   | 85 Ω differential | L1/L6 | 0.361 / 0.20 mm | |
   | 85 Ω differential | L1/L6 | 0.33 / 0.17 mm (PCIe pin field, 0.5 mm pitch) | |
   | 85 Ω differential | L6 | 0.48 / 0.52 mm (refclk breakout, 1.0 mm pitch) | |
   | 90 Ω differential | L1/L6 | 0.316 / 0.20 mm | |
   | 100 Ω differential | L1/L6 | 0.243 / 0.20 mm (recording L1: 0.243 / 0.207) | |
   | 100 Ω differential | L1 | 0.27 / 0.23 mm (recording at MC3) | |
   | 100 Ω differential | L3 | 0.177 / 0.20 mm | L2 and L4 |

   - Please adjust line width in production if needed to hit target, and tell us if you do.
   - **Copper thieving:** do not add any within 1.0 mm of an impedance-controlled pair, on any layer. The routing layers L1/L3/L6 are lightly filled (≈8–10 %) against near-solid L2/L4/L5. If balancing copper is needed for flatness, please propose it before production.

3. **Short sections that are intentionally not at the impedance target:**
   - PCIe pin-field necks beside the ground return-via row: 0.28 mm width, 0.22 mm gap. Every off-target stretch is 2.5 mm or shorter.
   - PCIe finger-side stubs at 1.0 mm pitch: 0.361 mm, 1.9 mm or shorter (about 101 Ω).
   - Recording pairs at the HDMI pins: 0.14 mm width, about 1.7 mm per line (0.65–1.05 mm run plus a 0.6 mm diagonal).
   - Command pairs at each HDMI connector: 0.15 mm, in pieces of 1.1 mm or shorter.
   - USB pair: 0.20 mm width, about 0.7–3.7 mm long.

4. **Vias:**
   - All are through vias, epoxy filled and capped (POFV), including via-in-pad on both sides. 303 via centres sit in SMD pads (V39 added 4 in the MC2 +VDCIN pins; V40 added 72 in ground and power pins; V43 removed 16).
   - 1161 plated holes in total: 989 vias and 172 PTH (V44: 52 PTH; +115 header holes, −2 BRK mounting pads, −2 MH1/MH2; V35: +9 J920 test holes, 1.651 mm).
   - Via drills: 210 × 0.15 mm, 722 × 0.20 mm (V35 +9), 57 × 0.30 mm.
   - The 0.15 mm drills (about 10.6:1 at 1.59 mm) are at the Micro-HDMI pins (104), the U801–U816 ESD arrays (40), U501 (3), C508 (1) and 45 other fine-pitch escapes. V40/V41 added 16 on ground pins (9 at the PCIe ground-finger tops); V43 removed 16 at the unused port 1, 2, 7, 8 HDMI 12/14 escapes; V44 added 5 in the MC3 ground bars; V45 added 12 (header-routing and switch-line vias, 0.25 mm pad); V46 and V35 added none.
   - Please confirm in writing at file review that 0.15 mm drills are acceptable; your guide cites 6–8:1 for 1.6 mm.
   - The board file marks all vias filled and capped.

5. **Gold fingers:**
   - ENIG, 30° bevel, on the card edge only (bottom edge of the outline).
   - Finger tips are 1.40 mm from the edge. Mask windows are open to the edge.
   - **Please use precision routing (±0.1 mm) on the card-edge tongue and key notch.** Pads A11/B11/A12/B12 are 0.20 mm from the notch edge, and A1/B1/A49/B49 are 0.30 mm from the tongue sides. This is the PCIe CEM geometry, so please do not trim the pads.
   - Board thickness at the fingers must stay within 1.44–1.70 mm (PCIe 1.57 ± 0.13).

## Silkscreen

- **Order number:** the bottom silkscreen has a "JLCJLCJLCJLC" marker in a clear area. Please print the order number there ("Specify a location"), not on top.
- Silk text (including the V35 J920 names) is 1.0 mm or larger with 0.15 mm or thicker strokes, except the header-hole names (0.8 mm, 0.15 mm strokes, on the back, requested small). All text is at least 0.15 mm from every pad (checked on the saved board).

## Assembly

1. **Edge rails:** left and right edges only, so the finger edge stays free for the bevel. Please remove them after assembly.
   - The J610–J617 shells reach about 0.13 mm past the left edge; use tabs on that edge, not V-cut.
   - J500 overhangs the top edge by 1.18 mm and J4 by 0.35 mm; keep the top edge free.
2. **Fiducials:** four on top, three on the bottom.
3. **Connectors sourced by JLC:**
   - MC1/MC2 Samtec BTE-040-01-F-D-A (C2914307).
   - MC3 Samtec QTH-040-01-F-D-DP-A (C7330812, pre-ordered).
   - J500 USB4110-GF-A (C5143397).
   - J610–J617 Molex 46765-1001 (C563878).
   - J4 Same Sky PJ-063AH (C22434582).
4. **J610–J617 shell tabs:** these are 32 plated slots with no paste.
   - Please solder them: pin-in-paste, selective wave or hand.
   - C721–C728 on the bottom side sit 0.3–1.5 mm from the tabs.
5. **J4:** pad 2 has a solid connection to the inner planes, on purpose, for current. Please allow for the heat needed to solder it.
6. **Placement file:** Mid X / Mid Y for J4, J500 and J610–J617 are pad-centre values, because these footprints have an off-centre origin. Please show the placement preview so we can approve every polarized part.
7. **Paste and stencil:** the U801–U816 apertures are 0.22 × 0.47 mm. Please use a 0.10 mm stencil, or tell us your stencil thickness.
8. **Silkscreen:** minimum line 0.15 mm, text 0.8 mm (header-hole names; everything else 1.0 mm). Silkscreen is clipped at the mask openings in the Gerbers.

## Files

- **BOM:** every line carries its JLC/LCSC number; there are no consigned parts.
- **Rotations:** KiCad-native.
