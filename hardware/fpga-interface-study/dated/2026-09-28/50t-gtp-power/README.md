# XC7A50T eight-layer unrouted review — 28 September 2026

This is an unchanged copy of the 28 September GTP-power review project, except that the workstation-local `.kicad_prl` file is omitted. The [complete portable ZIP](FPGA50T_GTP_Power_Review_2026-09-28.zip) is the original handoff. The [project file](project/hardware/FPGA50T_8L_Unrouted.kicad_pro), all hierarchical sheets and [project libraries](project/libraries/) stay together under `project/`; open the project from `project/hardware` in KiCad 10.

The [13-sheet schematic PDF](output/FPGA50T_GTP_Power_Review.pdf), [native DRC](validation/GTP_Final_DRC.json) and [PCB audit](validation/GTP_PCB_Final_Audit.json) document this revision. It is a 43 × 49 mm XC7A50T-CSG325 eight-copper-layer proposal with 145 PCB footprints, zero routed tracks or vias, and 499 unrouted connections. The custom micro-HDMI J4 power net remains named `LINK_12V`; the separate 5 V proposal has not been applied to the native design. The J5 CAD footprint remains DF40C while the later DF40T direction awaits integration. This is not an order or fabrication release.

Source: `2026-09-28_FPGA_Work/02_GTP_Power_Revision/` in the FPGA PCB workspace. Its dated `START_HERE.md` contains the full engineering explanation and qualification gates.
