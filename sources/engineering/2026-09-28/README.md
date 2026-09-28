# Proposed 50T micro-HDMI contact map — 28 September 2026

The [19-contact CSV](J4_Proposed_19_Contacts.csv) is an unchanged copy of Howard's dated planning file at `2026-09-28_FPGA_Work/05_Micro_HDMI_FPGA_Board_Plan/J4_Proposed_19_Contacts.csv` in the FPGA PCB workspace. The [visual page](../../../presentation/fpga/micro-hdmi-19.html) presents this proposal for review and sharing.

This is a **custom link proposal for the unrouted XC7A50T-CSG325 board**, not the standard HDMI pinout or a verified cable/receiver design. Its eight proposed high-speed contacts are unconnected in the latest 50T native schematic. Contact 19 is proposed as an unqualified 12 V input; a normal Type-D HDMI connector uses contact 19 for +5 V. Never attach ordinary HDMI equipment to a custom-powered board or adapter.

The source for connector numbering, mating-face geometry and standard Type-D contact names is the [Molex 46765 sales drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf), especially pages 2 and 4. The manufacturer PDF remains on Molex's site; this repository does not redistribute it. The web illustration is independently drawn and links to the original document.
