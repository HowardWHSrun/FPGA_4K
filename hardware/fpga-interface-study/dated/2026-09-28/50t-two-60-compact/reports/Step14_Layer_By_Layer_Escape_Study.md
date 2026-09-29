# Step14 layer-by-layer escape study — 28 September 2026

**Engineering status:** reproducible BGA pad and connector corridor study for the **unrouted** 36 × 38 mm XC7A50T board. The board contains zero tracks, vias, and copper zones. The layer assignments below are candidates for Gerald's stepped escape idea, not actual copper or a proof that the compact board can be routed.

**Exact source:** [active KiCad PCB](../project/hardware/FPGA50T_8L_Unrouted.kicad_pcb), byte-identical to Step14 checkpoint (local source; not included in web package), SHA-256 `6bafa7f2b19bca1b78f083b53e7d6f9c46c5619e1202761e4f698e362bb01a54`. The [116-row map](Step14_North_South_Escape_Map.csv), [JSON summary](Step14_North_South_Escape_Map.json), and [board-scale figure](Step14_North_South_Escape_Overview.png) were regenerated from this exact saved board by `scripts/step14_north_south_escape_map.py` and `scripts/plot_step14_escape_map.py`. The map compares every `(connector, contact, net, U1 ball)` tuple with the earlier Step07 map: **116/116 unchanged**. It excludes the one reserved analog contact and three GND contacts.

## Saved placement and what changed

| Item | Saved position or result |
|---|---|
| Board Edge.Cuts | x 4.5–40.5 mm, y 4.5–42.5 mm; **36 × 38 mm = 1,368 mm²**. |
| U1 | (23.8, 25.5) mm, 0°; 15 × 15 mm F.Fab body inside a 17 × 17 mm courtyard. |
| J5, ASIC1–4 | Southwest, (13.0, 39.3) mm; 60 contacts, including 58 digital ASIC contacts. |
| J7, ASIC5–8 | Northeast, (30.5, 8.0) mm; 60 contacts, including 58 digital ASIC contacts. |
| J4 | East edge, (38.8, 24.5) mm; custom micro-HDMI assignment. |
| Native validation | Zero physical DRC findings, zero schematic/PCB pad-parity findings, ERC **0 errors / 17 warnings**, **625** exact KiCad open connections; 174 footprints and 911 pads. See the [final DRC](../validation/Step14_Final_Full_DRC.json), [ERC](../validation/Step14_Final_ERC.json), and [native ratsnest count](../validation/Step14_Final_Native_Ratsnest.json). |

The north/south placement reduces ASIC source balls on the opposite **north/south** half from **72 to 44 of 116** compared with the unrotated north-J5/south-J7 compact trial. It increases the **east/west** opposite-half count from **39 to 77 of 116**, because J5 is now west and J7 east while their electrical contact maps stayed fixed. An opposite-half ball is a warning about possible detours; it is not a routed crossing count. This tradeoff must stay visible in any review of the compact form factor.

| Connector | Digital contacts | Opposite north/south half | Opposite east/west half | Mean ball-to-contact straight-line lower bound |
|---|---:|---:|---:|---:|
| J5 southwest | 58 | 16 | 44 | 18.922 mm |
| J7 northeast | 58 | 28 | 33 | 18.907 mm |
| **Total** | **116** | **44** | **77** | — |

The eight active GTP ball-to-J4 contact straight-line lower bounds average **17.245 mm** (16.269–18.304 mm). These omit the required AC coupling capacitors and physical obstacles. They are not pair-length, impedance, or signal-integrity results. The physically tested 180° U1 alternative shortened this geometric GTP bound, but it was rejected because the MGT power feed/bypass placement became too long; see the historical orientation comparison (local source; not included in web package).

## Candidate signal escape by physical BGA ring

The CSV uses the saved U1 pad coordinates. Ring 0 is the outermost physical ball ring; the ring number rises inward. All U1 and connector pin identities remain fixed. Layer names below indicate an **intended assignment** only.

| Copper layer | Intended role in an eventual eight-layer stack | Step14 ASIC contact allocation |
|---|---|---:|
| L1 / F.Cu | Outer-ring ASIC source balls, short top-layer breakout and component access; keep GTP launch/return geometry separate. | 23: J5 17, J7 6. |
| L2 / In1.Cu | Reserve for continuous near-surface GND return; only via antipads through it. | 0 signals. |
| L3 / In2.Cu | Next two BGA rings, staggered toward the appropriate connector corridor while referencing L2. | 55: J5 24, J7 31. |
| L4 / In3.Cu | Reserve for shaped power distribution with adjacent return. | 0 signals. |
| L5 / In4.Cu | Reserve for GND return near L6 and power shapes. | 0 signals. |
| L6 / In5.Cu | Deeper BGA rings, after a fabricator-approved via breakout and return-via plan. | 38: J5 17, J7 21. |
| L7 / In6.Cu | Reserve for GND return near L6/L8. | 0 signals. |
| L8 / B.Cu | Candidate local low-speed support, JTAG and edge test-pad access; verify its reference plane and switching-loop separation. | No ASIC contacts assigned in this first map. |

Gerald's idea of escaping successive FPGA layers toward the rest of the circuit is represented by the **L1 → L3 → L6** sequence because this board reserves L2/L5/L7 for GND and L4 for power. No plane fill is present yet. The map deliberately does not choose via spans, trace widths, differential pair dimensions, length targets, or final connector pin swaps.

## Remaining route-feasibility and mechanical gates

1. Review the **77 east/west source-half warnings** with Gerald and the ASIC/routing-board owner. Determine whether legal FPGA bank pin or mating-board contact permutations can reduce long detours without changing ASIC timing groups. The present checked design does **not** reassign signals.
2. Obtain an eight-layer fabricator stackup and verified CSG325 breakout/via geometry. Test one dense ASIC group, one GTP pair through its coupling caps, and a power/ground transition before considering further outline cuts or claiming routability.
3. Preserve continuous GND returns around each layer transition. J5/J7 presently contain only **three GND contacts total** and no spare supply contact; the routing-board supply and additional shared return path require a separate reviewed connection. Internal FPGA-board GND planes alone cannot provide a return across two boards.
4. Check the rigid two-connector DF40T alignment, stack height, tolerances, keepouts, and routing-board mate orientation. Passing this footprint DRC is not mechanical approval.
5. Keep the 32 Mbit flash, two diagnostic LEDs, ten spare 1.5 V FPGA edge I/O pads, two edge GND pads, and the regulator bypass network when testing any additional reduction.

This **36 × 38 mm** board is 17.37% smaller in area than the earlier 38.5 × 43 mm unrouted placement. It is still **180 mm² (15.15%) larger** than the older 33 × 36 mm routed micro-HDMI checkpoint. Physical placement validation does not establish the minimum routable size or manufacturing readiness. No routing was done in Step14.

## Sources and reproducibility

- Gerald's 28 September meeting summary (local source; not included in web package) and prior 27 September eight-layer review (local source; not included in web package). The original audio/transcript remains private and is not part of the portable website package.
- KiCad Step14 saved placement and native checks (local source; not included in web package). The final 0.1 mm silkscreen change and final hash are recorded in [Step14b](../validation/Step14b_Silk_Change.json).
- [Historical Step07 east/west study](Layer_By_Layer_Escape_Study.md), retained separately to show the earlier placement and its 39/116 east/west metric.
