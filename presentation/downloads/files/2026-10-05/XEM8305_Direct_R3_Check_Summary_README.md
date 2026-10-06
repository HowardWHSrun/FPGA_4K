# XEM8305 direct R3 prototype status

The R3 carrier has complete native routing and passes the final local CAD and manufacturing-file reviews. It is a prototype handoff: factory DFM approval, assembly readiness and qualified system operation remain open.

The six-layer finished carrier is 53 × 83 mm. The one-up assembly panel is 73 × 83 mm, with removable 10 mm side rails. The order profile is nominal 1.6 mm with candidate construction JLC06161H-3313. Factory acceptance of the score lines, filled/capped vias, fine-pitch lands and assembly process is still required. The archive contains one design; the physical order quantity is selected separately.

The final Gerber/drill ZIP is `LDO_to_XEM8305_Direct_R3_Gerbers_Drill.zip`, SHA-256 `ccb6021ca363950c4829001fa65eb042e14e8c2d0b7a53d43d415e96542411ba` (271,792 bytes; 17 members).

Local checks report zero ERC, DRC, unconnected and schematic-parity issues, with no ignored rules or exclusions. All 144 CAM export checks and 766 actual Gerber aperture/datum checks pass. Independent reviews also pass 1,678 electrical/copper checks, 1,275 interface checks, 119 mechanical/paste checks, 28 panel checks, 26 local buck checks and five reference-plane checks. The schematic PDF has eight pages. These review groups overlap and do not establish physical or operating qualification.

All 260 XEM contacts are accounted for: MC1 has 100, MC2 has 80 and MC3 has 80. MC3 retains 28 connected grounds and 52 reserved NC contacts; no MC3 high-speed link is implemented. The 23 digital paths pass their switched copper mapping checks. CLKH is supplied FPGA → ASIC; CLK32MHZ is returned ASIC → FPGA. The returned clock and D1–D8 have 37.806 mm full-path copper spread; ASIC timing is unqualified.

R5 ARM remains unpopulated and OFF for initial commissioning. Keep the ASIC disconnected while checking power, PG and default-OFF behavior. Aggregate VCCO is limited to 50 mA, including the bleeder and all supplied banks, pending measured bank voltages of 1.425–1.575 V and branch loads. The 150 mA ASIC feed is a planning ceiling, not a known ASIC demand. Original LDO rail/AGND/inrush behavior, actual fit, power-loss behavior, timing and thermal performance remain open.

The [check summary](XEM8305_Direct_R3_Check_Summary.json) binds the exact source and receipt hashes. The [260-contact register](XEM8305_Direct_R3_260_Contacts.csv) gives the reviewed contact dispositions. Neither file includes private paths, vendor model payloads or source-document collections.
