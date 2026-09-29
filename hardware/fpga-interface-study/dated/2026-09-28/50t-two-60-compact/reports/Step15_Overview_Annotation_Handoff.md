# Step15 overview annotation correction — 28 September 2026

**Status:** text-only clarification in the root schematic. The 36 × 38 mm PCB remains unrouted, and no component, pin, wire, net, symbol ID, footprint, or library file changed from the Step14 checkpoint.

The [active KiCad project](../project/hardware/FPGA50T_8L_Unrouted.kicad_pro) and complete Step15 checkpoint (local source; not included in web package) are byte-identical across **all 69 portable project files**. The [per-file SHA-256 manifest](../validation/Step15_Project_SHA256_Manifest.json) and [CSV](../validation/Step15_Project_SHA256_Manifest.csv) compare the active, Step14 and Step15 project folders. Exactly **one** file differs between Steps 14 and 15: `hardware/FPGA50T_8L_Unrouted.kicad_sch`, the overview sheet. The Step14 and Step15 PCB files are byte-identical, SHA-256 `6bafa7f2b19bca1b78f083b53e7d6f9c46c5619e1202761e4f698e362bb01a54`.

| Overview annotation | Step14 text | Step15 text | Reason |
|---|---|---|---|
| J4 supply caption | `Custom 12 V input / GND` | `Custom J4 supply / GND; voltage TBD` | Cable/input supply voltage is not yet confirmed. The inherited PCB/net label `LINK_12V` remains unchanged and must not be mistaken for an approved 12 V requirement. |
| Sheet navigation | `one overview plus twelve direct detail sheets` | `one overview plus thirteen direct detail sheets` | Corrects the count of direct detail sheets. |
| Board caption | `38.5 x 43 mm` with old mounting wording | `Board outline 36 x 38 mm; J4 courtyard overhang 1.245 mm` with no holes/no routed copper | Matches the frozen Step14 PCB outline and flags the real edge-mounted J4 mechanical envelope. |

Independent comparison of the saved schematic files shows exactly these three text literals changed. The [Step14 baseline netlist](../validation/Step15_Baseline_Step14_Netlist.net) and [Step15 exported netlist](../validation/Step15_Final_Netlist.net) differ only in the tool's absolute `(source ...)` file path; their electrical body lines are identical. KiCad [ERC](../validation/Step15_ERC.json) reports **0 errors and 17 warnings**. Full-severity [PCB DRC](../validation/Step15_DRC.json) reports **0 physical and 0 schematic/PCB parity findings**. Its 499 CLI unconnected items are a reporting subset; the unchanged PCB's [native connectivity readback](../validation/Step14_Final_Native_Ratsnest.json) remains **625 open connections**, with zero tracks, vias and zones.

The [Step14 geometry handoff](Step14_Compact_Geometry_Handoff.md) is preserved as a dated snapshot. Its statement that all non-PCB files match Step13 is now explicitly historical for Step14; it is not a description of the active Step15 project. The current [Step14 layer escape map](Step14_Layer_By_Layer_Escape_Study.md) remains valid because every PCB byte and all 116 ASIC contact-to-FPGA-ball identities are unchanged.

**Review still needed:** assign and verify the J4 supply voltage/current, cable and receiver plan, the routing-board power/ground connection, both DF40T mechanical mates, and representative layer-by-layer breakout. A corrected caption does not resolve any of those electrical or physical decisions.
