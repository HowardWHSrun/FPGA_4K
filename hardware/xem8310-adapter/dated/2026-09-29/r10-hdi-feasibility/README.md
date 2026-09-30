# R10 three-port interposer — HDI feasibility

**29 September 2026 — all twelve selected signal pairs traced; board incomplete and not for fabrication.** R10 is an optional manufacturing study. The [3D viewer](../../../../../presentation/adapter/assembly.html?revision=r10) can show this native board beside the official XEM8310 and BRK8310 models; R9 remains its default revision.

Open the [complete native KiCad project ZIP](R10_Three_Port_Interposer_Public_Study.zip), [copper image](R10_twelve_pair_copper_review.png), [scalable copper](R10_copper_all_layers.svg), [copper PDF](R10_twelve_pair_copper.pdf), or [unchanged eight-sheet logical schematic PDF](R10_logical_schematic_unchanged_from_R8.pdf). The [schematic browser](../../../../../presentation/schematic/?board=adapter) displays that same logical circuit. The ZIP contains the complete project, hierarchical sheets and custom libraries; local failed trials and STEP exports are omitted.

## What is connected

All 24 selected GTY conductors reach their intended MC3 and Type-D contacts with no P/N swap. All 160 MC1/MC2 contact paths remain connected, with their 480 copper objects unchanged from R9. TX0, TX1, reserved TX2 and reverse control exist at all three ports; TX2 remains reserved in the logical design. The selected lower BRK GTY contacts remain isolated, so BRK J6 PCIe cannot operate during three-link acquisition.

The [independent audit](independent_copper_audit.json) and [fresh DRC](independent_drc.txt) confirm connectivity and no inner-row GTY copper crossing the Type-D keepout rectangles on any layer. Native DRC reports **0 physical violations under the R10 trial rules, 97 unconnected items and 19 preexisting schematic-parity findings**. See the [parity report](independent_drc_with_parity.txt).

## Manufacturing assumptions and remaining work

R10 requires twelve **0.25 mm pad / 0.10 mm laser F.Cu–In1 microvias** and 24 new **0.45/0.20 mm through-vias**. Trace/clearance minimum is a provisional **0.15 mm**, annular width **0.075 mm**, and hole-to-copper clearance **0.20 mm**. Adjacent microvia copper clearance is exactly 0.15 mm nominal; the fabricator must qualify registration, plating, dielectric thickness and the final stackup. Under R9's coarser rules, this identical copper has 84 process-rule violations. No fabricator or HDI stackup is selected.

These tracks were routed individually for clearance. They have **no qualified differential coupling, impedance, reference planes or length matching**. [Planar P/N differences](planar_pair_lengths_unqualified.csv) reach 4.0849 mm and exclude via depth. Signal-layer assignment is a trial and may change when reference planes are designed.

Power/JTAG/protection, ground and shield returns, remaining MC3 pass-throughs, cable current, clocking, link operation and mechanical mating remain incomplete. The thin MC1/MC2 trial traces are not qualified for XEM or remote load current. The 97 remaining opens prevent using this as a finished adapter.

The [GLB provenance](R10_3D_Provenance.json) records the frozen native board and derived model hashes. Its export includes tracks, pads, inner copper, silkscreen and Type-D solids. Six custom stack connector bodies and cable plug solids are absent. Exploded spacing and cable curves in the viewer are illustrative. R8 and R9 remain preserved separately.
