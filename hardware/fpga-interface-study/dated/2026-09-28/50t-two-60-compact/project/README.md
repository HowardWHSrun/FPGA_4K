# 50T eight-layer GTP power review — R5

Open `hardware/FPGA50T_8L_Unrouted.kicad_pro` in KiCad 10. Keep the entire hardware and libraries folders together.

The integrated PDF is `../output/FPGA50T_GTP_Power_Review.pdf`. Sheet 13 now draws U7 dedicated GTP 1.0 V and the repurposed U4 GTP 1.2 V regulator, separate bead filters and local bypass capacitors. Sheet 12 shows all GTP power-ball connections, R123 and J6 manual INIT_B hold. Core U2 is not shared with the transceiver supply. The old 2.5 V rail and C57-C63 have been removed.

Read `../START_HERE.md` for the circuit changes, startup procedure, calculations, primary sources and remaining qualification gates. This is an unrouted 50T CSG325 / eight-copper-layer engineering proposal. PCB placement is provisional. Current, noise, thermal performance, shutdown, the external input/cable and GTP clock/link are not qualified. Do not fabricate or power this draft as a completed design.

Fit J6 before power only when conducting an approved later prototype test; it holds INIT_B low until all rails have been measured in tolerance and stable. Regulator PG is not precision rail qualification. J6 is not an automatic supervisor or brownout reset.

New divider values require exact 0603 0.1%, <=25 ppm/K ordering-code confirmation. No procurement or manufacturing release is implied. Earlier revisions remain in their dated folders.
