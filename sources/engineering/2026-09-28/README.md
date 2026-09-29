# 50T micro-HDMI board parts and contact maps — 28 September 2026

## Featured 50T fitted-parts inventory

The [50T grouped purchasing draft](Micro_HDMI_50T_Grouped_Purchasing_Draft.csv) is regenerated from the compact [native 50T board](../../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/manifest.json). Its 48 grouped lines cover 158 fitted buyable references, with each reference counted once. 0 schematic DNP items and copper-only test pads are excluded. J5/J7 are two 60-contact DF40T receptacles; their mating geometry awaits approval. Power, cable and receiver remain open, and this is not an approved purchase cart.

## Separate 100T placed-parts inventory

The [100T grouped purchasing draft](Micro_HDMI_100T_Grouped_Purchasing_Draft.csv) is an unchanged copy of the dated 28 September handoff. It groups the preserved 100T micro-HDMI board's [125 placed-component rows](../../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/reports/Component_List.csv) into 36 value + manufacturer part number + footprint lines. Quantities are per board, with every physical reference included once. The [preserved 100T page](../../../presentation/fpga/micro-hdmi.html#purchase-list) displays every line. This population list is separate from the 50T proposal below and excludes the cable, carrier, power source, receiver, PCB fabrication, spares and build yield. It does not authorize ordering.

The [R3 19-contact CSV](J4_Proposed_19_Contacts_R3_3TX_1RX_5V.csv) is an unchanged copy of Howard's dated `2026-09-28_FPGA_Work/05_Micro_HDMI_FPGA_Board_Plan/J4_Proposed_19_Contacts_R3_3TX_1RX_5V.csv`. It records the current working proposal: high-speed recording TX0 on 3/5, TX1 on 6/8, TX2 on 9/11, and high-speed control RX0 on 12/14. J4.19 remains a proposed protected **5 V input**. The [R2 CSV](J4_Proposed_19_Contacts_R2_5V.csv) preserves the earlier two-TX/two-RX split with 5 V, and the [R1 CSV](J4_Proposed_19_Contacts.csv) preserves the earlier 12 V candidate. The [visual page](../../../presentation/fpga/micro-hdmi-19.html) displays R3.

The R1 and R2 contact maps are preserved candidate history. The current native 50T schematic and PCB show the latest assignment state, but no high-speed copper is routed. Neither map is a verified cable or receiver design. A normal Type-D HDMI device must not be connected to this custom interface.

The source for connector numbering, mating-face geometry and standard Type-D contact names is the [Molex 46765 sales drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf), especially pages 2 and 4. The manufacturer PDF remains on Molex's site; this repository does not redistribute it. The web illustration is independently drawn and links to the original document.
