# U6 compact flash adoption — 27 September 2026

**Historical USB-C intermediate selection. Superseded by the [64 Mbit USON revision](../uson_flash/U6_USON_Adoption_Review.md).**

The selected USB-C development circuit now uses **MX25U12835FZNI-10G** in the manufacturer-defined 6 × 5 mm WSON package, replacing the same-family SOIC part. The FPGA boot mode remains SPI x1. The eight numbered signals and supply connections are unchanged.

The concrete all-179-component placement candidate places U6 on **B.Cu at (15.00, 4.15) mm, 0°**. Its source is `power/placement/USB_Power_All179_Placed.kicad_pcb`, SHA-256 `545eed49dce4baa80437060bcdc666a794319d082b9ffbe538104ed27a01fad4`. This is placement evidence, not a completed USB-C routing checkpoint. The root agent authorized synchronizing the development schematic and component manifest to this part; final native XML readback follows that export.

Use the exact eight-pad [project-local footprint](CoreSupport.pretty/Macronix_WSON8_6x5_Floating_EP.kicad_mod) and the [primary-source review](U6_WSON_Candidate_Review.md). The central metal remains **unsoldered**, with no exposed-pad copper or paste. The embedded keepout forbids component-side tracks, pads and copper pours as well as through-vias under the central metal plus the documented provisional margin.

Required before release: restore all eight flash connections at the adopted placement; prove the central-metal keepout after zone refill and native DRC; confirm paste/stencil and unsoldered central-metal assembly acceptance; verify initial blank-flash programming, SPI x1 boot and recovery on hardware. Package inventory and lead time remain unverified. No order or manufacturing submission was made.

The earlier candidate files remain preserved as source and decision history; adoption does not retroactively make their placement or routing qualified.
