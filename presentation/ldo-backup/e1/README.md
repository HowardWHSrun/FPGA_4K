# E1 compact source-to-cable review · 3 October 2026

[Interactive pins](../pin-review.html) · [schematic PDF](schematic-review.pdf) · [schematic image](schematic-review.png) · [23-signal CSV](pin-map-proposal.csv) · [proposal JSON](interface-proposal.json).

The separate E1 study routes a proposed passive digital interface within the provisional 18 × 25 mm outline. Regulators stay on Gerald’s LDO board. The routing board connects its 23 J1 signals and DGND to a candidate custom-FPC port; it exports no analog ground, high rail or cable power. Original CAD and the earlier C2 shape are preserved.

Fresh source tracing finds 116 external electrical-pin matches with no net mismatch and 148 physical pads. The workbook and slides identify 12 FPGA→ASIC controls and 11 ASIC→FPGA outputs. All 23 source net names and ASIC J2 endpoints agree with the existing carrier R6 Bank 64 proposal. Returned CLK32MHZ→MC1.56/AD20 is clock-capable. R6 still describes a rigid interposer, so its cable landing is unresolved. Legacy RTL’s IMP_TEST input declaration conflicts with the primary ASIC control classification.

The candidate is legacy FH26-51S-0.3SHW(05): 51 contacts and a custom staggered-tip FPC. It is discontinued; its current FH26W replacement is not a verified substitution. Signals occupy contacts 2,4,…46; 27 DGND contacts occupy 1,3,…45 plus 47/49/50/51; contact 48 stays open. Local exposed copper faces the PCB. Far-end face, contact crossing, length, strain relief and carrier endpoint remain unselected.

The native E1 netlist has exactly two endpoints per signal, 29 DGND endpoints (2 LDO + 27 cable), and 48 individually isolated unused or unknown contacts. 3V3_LDO_IN stays at J1.1/2, separate from the cable. ERC reports one error for the missing qualified 3V3 source, zero warnings, zero exclusions and zero ignored checks. No power flag masks it. PCB DRC reports zero errors/warnings/unconnected items and zero schematic parity issues, with no ignored checks or exclusions. The four-layer study has 180 tracks, 46 vias and a continuous In2.Cu DGND plane. Independent logical and PCB audits pass 41 and 43 checks. All 23 signal paths in the original LDO CAD also have native copper continuity. These are CAD checks, not measurements of assembled hardware. See [checks](checks.json), [DRC](drc.json) and [ERC](erc.json).

Complete native CAD, libraries, models, retained initial findings and source audits stay in the local dated LDO project. This website publishes review views and derived pin evidence. Original LDO ERC reports 35 errors/127 warnings with inherited ignored categories; its fresh DRC aborted. New adapter checks do not qualify the original regulator board.

Powered use still requires guaranteed ASIC logic limits/reference, ground topology, installed Hirose orientation and unpowered continuity, an agreed FPC/carrier endpoint, LDO input/load qualification, XEM VCCO sequencing and thermal budget, capture timing and safe control states. The original U9 regulator/load-direction concern remains separate. No hardware was connected, powered or fabricated.

Source PCB SHA256: `74ed99fa1a91cc73ad9b93946fd1b386a5a99355ad15efb51276b0db660e3425`. Source schematic: `1435f5a0c444256892675297babb13f4116c4f72da660e4780b21b3f60ad5915`. E1 schematic: `98edef39eb4a031cf739e5866d0e964a1b5c5cfd04ac89f81a39394303a76879`.

[Native routing image](../assets/routing-cabled-e1.png) and [3D](../index.html?view=routing) derive from E1 PCB SHA256 `d428793ec0317867c8ed0d94078234d60daba9b948e055a7650dd8280f9aa978`. The GLB may omit part of underside silk; no complete mesh claim is made. J1/J19 housing models are unavailable.
