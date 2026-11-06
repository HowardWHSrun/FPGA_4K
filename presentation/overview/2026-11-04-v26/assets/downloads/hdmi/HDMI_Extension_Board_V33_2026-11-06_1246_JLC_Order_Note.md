# Order note for JLCPCB

Board: HDMI Extension Board V33, 6-layer PCIe add-in card (electrically x4: PRSNT2# at B31; physically an x8 edge with 98 fingers), 167.65 × 114.10 mm. Please review the production file before fabrication and contact us about anything below.

Changed from V32: new cable signal map on the eight Micro-HDMI ports. 24 parts added on the top side: U809-U816 (TI TPD4E02B04DQAR, LCSC C106794, USON-10, the same part as U801-U808), one beside each HDMI connector, and C745-C760 (Samsung CL05B104KO5NNNC 100 nF, LCSC C1525, 0402) in series with the recording pairs near MC3. Eight more 100 Ω pairs on L3 run from the HDMI connectors to MC1, and the existing L3 pairs were re-spaced. The BOM and placement file include the new parts; no existing part moved.

Changed from V31 to V32: the plated 3.18 mm bracket hole beside the HDMI connectors at (72.18, 152.70) was removed, and one In2 track (PRSNT1#) was straightened. Parts and placement are unchanged.

Changed in V31 (from V30): eight 1 µF output capacitors added on the bottom side, C721-C728 (Samsung CL10A105KB8NNNC, LCSC C15849, 0603), one beside each HDMI connector, each with one new ground via; three JTAG tracks beside U611 redrawn. The BOM and placement file include the new parts; nothing else moved.

Changed in V30 (from V29): routing cleanup only, with the same outline, stack, parts list and placement except the moves listed. Vias were cut from 859 to 729 (signal and power vias where a single layer works, duplicate ground vias), duplicated and off-angle copper was redrawn, and the PCIe pair spacing was widened, with return vias added at two PCIe layer changes. Ten bypass capacitors moved next to their pins: C509, C510 and C711-C718; the placement file is updated. C13-C20 (PCIe TX AC coupling) changed from 100 nF to 220 nF (Samsung CL05B224KO5NNNC, LCSC C16772), same 0402 footprint. J4.2 now has a solid plane connection, and J4 silkscreen lines are 0.15 mm.

Changed in V29 (from V28): the two plated 3.2 mm mounting holes beside MC3 (MH3, MH4) were removed.

Changed in V28 (from V27): one ground via-in-pad added at U6 pin 1 (0.35 mm pad, 0.20 mm drill) and a short L6 VIO1 track moved; a 10.5 mm ground track was removed.

Changed in V27 (from V25): the ground pours on L1 and L6 were removed, as on Opal Kelly's BRK8310; ground pads now connect by their own vias to the inner ground planes. 788 stitching vias that only tied the old pours together were removed. Parts, outline and signal routing are unchanged.

Changed in V25 (from V24): the eight Micro-HDMI connectors and their support parts moved to an even 13.1 mm pitch, and three non-plated mounting holes at the bracket end were removed.

## PCB

1. **Stackup:** JLC06161H-2116. Please confirm it is built on the laminate your impedance calculator assumes.
2. **Impedance, ±10%:** 85 Ω differential on L1/L6 (0.361/0.20 mm), 90 Ω differential on L1/L6 (0.316/0.20 mm), 100 Ω differential on L1 (0.243/0.20 mm), 100 Ω differential on L3 with L2 and L4 reference (0.177/0.20 mm). Please adjust line width in production if needed to hit target, and tell us if you do.
3. **Short necks are intentional and not impedance controlled:** PCIe 0.28 mm width, 0.22 mm gap, 1.1–9 mm long. Recording pairs 0.14 mm width, about 1.4–1.6 mm long. Command pairs 0.15 mm width, about 3.5 mm long at each HDMI connector; USB pair 0.20 mm width, about 0.7–3.7 mm long.
4. **Vias:** all through vias, epoxy filled and capped, including via-in-pad on both sides. 193 vias use a 0.15 mm drill, about 10.6:1 at 1.59 mm. They sit at fine-pitch connector pins and cannot be enlarged. Please contact us if this is not acceptable. The board has 847 plated holes in total, 552 of them 0.20 mm vias. Please confirm in writing at the file-review stage that the 0.15 mm drills (about 10.6:1) are acceptable; JLC's guide cites 6-8:1 for 1.6 mm.
5. **Gold fingers:** ENIG, 30° bevel, on the card edge only (bottom edge of the outline). Finger tips are 1.40 mm from the edge, about 0.27 mm clear of the bevel. Mask windows are open to the edge. The closest via edges are 0.19–0.3 mm from the fingers on purpose; tell us if you need more.

## Assembly

1. **Edge rails:** please add rails on the left and right edges only, so the finger edge stays free for the bevel. Please remove the rails after assembly.
2. **Left edge:** the J610–J617 connector shells reach about 0.13 mm past the left board edge. Please use tabs on that edge, not V-cut, and keep the rail clear of the shells.
3. **Fiducials:** the board has four on top and three on the bottom.
4. **Connectors sourced by JLC:** MC1/MC2 Samtec BTE-040-01-F-D-A (C2914307), MC3 Samtec QTH-040-01-F-D-DP-A (C7330812, pre-ordered), J500 USB4110-GF-A (C5143397), J610–J617 Molex 46765-1001 (C563878), J4 Same Sky PJ-063AH (C22434582). Please place all of them; tell us if any is unavailable.
5. **Placement file:** Mid X and Mid Y for J4, J500 and J610–J617 are pad-centre values, because these footprints have an off-centre origin. Please confirm these placements and all rotations in your review. J4 (PJ-063AH) uses plated slots for its two contacts and two board-lock tabs, plus one 1.6 mm non-plated locating hole.
6. **Paste:** U801–U808 paste openings are 0.04 mm smaller per side on purpose, to reduce bridging.
7. **Silkscreen** is clipped at pads in the Gerbers.

## Files

1. **Gerber job file:** not included; the zip holds the 16 layer, paste, mask, silk, outline and drill files only.
2. **BOM:** every line carries its JLC/LCSC number; there are no consigned parts.
3. **Rotations** in the placement file are KiCad-native. Please show the placement preview so we can approve every polarized part, bottom side especially: U610-U618, U701-U708, U801-U816, U501, U505, U602, U603, U605, D500 and the LEDs D701-D708.
