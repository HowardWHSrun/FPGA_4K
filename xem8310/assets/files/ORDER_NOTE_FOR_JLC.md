# Order note for JLCPCB

Board: HDMI Extension Board V21, 6-layer PCIe x4 add-in card, 167.7 × 114.15 mm. Please review the production file before fabrication and contact us about anything below.

## PCB

1. **Stackup:** JLC06161H-2116. Please confirm it is built on the laminate your impedance calculator assumes.
2. **Impedance, ±10%:** 85 Ω differential on L1/L6 (0.361/0.20 mm), 90 Ω differential on L1/L6 (0.316/0.20 mm), 100 Ω differential on L1 (0.243/0.20 mm), 100 Ω differential on L3 with L2 and L4 reference (0.177/0.20 mm). Please adjust line width in production if needed to hit target, and tell us if you do.
3. **Short PCIe necks** of 0.28 mm width, 0.22 mm gap and 3–9 mm length are intentional. They are not impedance controlled.
4. **Vias:** all through vias, epoxy filled and capped, including via-in-pad on both sides. 171 vias use a 0.15 mm drill, about 10.6:1 at 1.59 mm. They sit at fine-pitch connector pins and cannot be enlarged. Please contact us if this is not acceptable.
5. **Gold fingers:** ENIG, 30° bevel, on the card edge only (bottom edge of the outline). Finger tips are 1.43 mm from the edge, about 0.30 mm clear of the bevel. Mask windows are open to the edge. Via edges are 0.3–0.4 mm from the finger tops on purpose; tell us if you need more.

## Assembly

1. **Edge rails:** please add rails on the left and right edges only, so the finger edge stays free for the bevel. Please remove the rails after assembly.
2. **Fiducials:** the board has four on top and three on the bottom.
3. **Consigned parts:** MC1, MC2, MC3, J500, J610–J617 and J4 are customer-supplied.
4. **Silkscreen** is clipped at pads in the Gerbers.
