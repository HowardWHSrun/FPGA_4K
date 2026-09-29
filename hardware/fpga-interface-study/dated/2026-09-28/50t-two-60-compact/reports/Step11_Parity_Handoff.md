# Step11: inherited pin parity repaired on active 50T review board

The checked Step10 board was saved separately, then the previously trialed `step11_inherited_parity_fix.py` was applied to the active project. It synchronized U1.F13 to GND and U5/U8 pad nets with the schematic, corrected the U6 flash footprint filter, and restored U9's physical center land and generated no-connect net. U1.F13 is the AMD CSG325 `M2_0` configuration ball; the prior PCB 1.8 V assignment was an inherited error. Four other U1 flash pin nets had already been synchronized in Step09.

Restoring U9's local library footprint enlarged its courtyard near D1. D1 was shifted **1 mm east**, from `(16.0, 12.4)` to `(17.0, 12.4) mm`, and the complete physical and parity checks were repeated. The 0.25 mm U9 center land is a provisional geometry choice against the current 0.15 mm copper-clearance rule; TI assembly land pattern approval remains open.

| Native check | Step11 result |
|---|---:|
| Physical DRC, all severities | **0 findings** |
| Schematic/PCB parity, all severities | **0 findings** |
| ERC, all severities | 6 errors, 18 warnings |
| Footprints / pads | 178 / 921 |
| Tracks / vias / top-level zones | 0 / 0 / 0 |
| Exact native unrouted count | 638 |
| Board outline | 38.5 × 43 mm |

The six ERC errors are inherited regulator `FB2` ground connections and the `MGTRREF` pin-type model. Their functional review is in the [Step10 handoff](Step10_Two_LED_Handoff.md); they will be addressed as a separate circuit step. KiCad CLI DRC lists only 499 open items on this board, so use the native 638 count for the full unrouted state.

Files: [active KiCad project](../project/hardware/FPGA50T_8L_Unrouted.kicad_pro), frozen Step11 checkpoint (local source; not included in web package), full DRC (local source; not included in web package), ERC (local source; not included in web package), native ratsnest (local source; not included in web package), [manufacturer pin audit](Manufacturer_Pin_Audit_Step11.md), verification summary (local source; not included in web package).
