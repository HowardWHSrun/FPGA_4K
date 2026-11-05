# Order note for JLCPCB

Board: HDMI Extension Board V29, 6-layer PCIe x4 add-in card, 167.65 × 114.10 mm. Please review the production file before fabrication and contact us about anything below.

Changed from V28: the two plated 3.2 mm mounting holes beside MC3 (MH3, MH4) were removed; nothing else changed.

Changed in V28 (from V27): one ground via-in-pad added at U6 pin 1 (0.35 mm pad, 0.20 mm drill) and a short L6 VIO1 track moved; a 10.5 mm ground track was removed.

Changed in V27 (from V25): the ground pours on L1 and L6 were removed, as on Opal Kelly's BRK8310; ground pads now connect by their own vias to the inner ground planes. 788 stitching vias that only tied the old pours together were removed. Parts, outline and signal routing are unchanged.

Changed in V25 (from V24): the eight Micro-HDMI connectors and their support parts moved to an even 13.1 mm pitch, and three non-plated mounting holes at the bracket end were removed.

## PCB

1. **Stackup:** JLC06161H-2116. Please confirm it is built on the laminate your impedance calculator assumes.
2. **Impedance, ±10%:** 85 Ω differential on L1/L6 (0.361/0.20 mm), 90 Ω differential on L1/L6 (0.316/0.20 mm), 100 Ω differential on L1 (0.243/0.20 mm), 100 Ω differential on L3 with L2 and L4 reference (0.177/0.20 mm). Please adjust line width in production if needed to hit target, and tell us if you do.
3. **Short necks are intentional and not impedance controlled:** PCIe 0.28 mm width, 0.22 mm gap, 1.1–9 mm long. Recording pairs 0.14 mm width, about 1.4–1.6 mm long. Command and USB pairs 0.20 mm width, about 0.7–3.7 mm long.
4. **Vias:** all through vias, epoxy filled and capped, including via-in-pad on both sides. 165 vias use a 0.15 mm drill, about 10.6:1 at 1.59 mm. They sit at fine-pitch connector pins and cannot be enlarged. Please contact us if this is not acceptable. The board has 912 plated holes in total, 641 of them 0.20 mm vias.
5. **Gold fingers:** ENIG, 30° bevel, on the card edge only (bottom edge of the outline). Finger tips are 1.40 mm from the edge, about 0.27 mm clear of the bevel. Mask windows are open to the edge. The closest via edges are 0.19–0.3 mm from the fingers on purpose; tell us if you need more.

## Assembly

1. **Edge rails:** please add rails on the left and right edges only, so the finger edge stays free for the bevel. Please remove the rails after assembly.
2. **Left edge:** the J610–J617 connector shells reach about 0.13 mm past the left board edge. Please use tabs on that edge, not V-cut, and keep the rail clear of the shells.
3. **Fiducials:** the board has four on top and three on the bottom.
4. **Consigned parts:** MC1, MC2, MC3, J500 and J610–J617 are customer-supplied. J4 is now Same Sky PJ-063AH (LCSC C22434582); please source it, or tell us if it is not available.
5. **Placement file:** Mid X and Mid Y for J4, J500 and J610–J617 are pad-centre values, because these footprints have an off-centre origin. Please confirm these placements and all rotations in your review. J4 (PJ-063AH) uses plated slots for its two contacts and two board-lock tabs, plus one 1.6 mm non-plated locating hole.
6. **Paste:** U801–U808 paste openings are 0.04 mm smaller per side on purpose, to reduce bridging.
7. **Silkscreen** is clipped at pads in the Gerbers.
