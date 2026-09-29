# Step10: two status LEDs and edge-pad metadata

The active 50T KiCad review project now includes two diagnostic lights. The board stays **38.5 × 43 mm and unrouted**. This is a placement and schematic review, not a fabrication release.

## Native CAD changes

- **D1 red input-present:** J4 raw `LINK_12V` → R130 3.3 kΩ 0603 → D1 → GND. R130 is Vishay `CRCW06033K30FKEA`; D1 is Kingbright `APTD1608LSURCK` (0603). J4 supply voltage and protection position remain under review; `LINK_12V` is the inherited net name, not a settled 12 V requirement.
- **D2 green configuration DONE:** `LINK_12V` → R131 3.3 kΩ 0603 → D2 → Q1 drain; Q1 source → GND. FPGA `DONE` at U1.F12 drives Q1 gate through the existing `FPGA_DONE` net. R132 470 kΩ 0402 pulls the gate to GND. D2 is Kingbright `APTD1608LZGCK`; Q1 is Diodes `DMN52D0U-7` SOT-23; R131 is `CRCW06033K30FKEA`; R132 is `CRCW0402470KFKED`. This keeps LED current off the FPGA pin. LED brightness and turn-on margin require bench verification with the chosen cable supply.
- Repaired `TP128–TP139` board `Value` fields to match the schematic and admitted the local edge probe footprint through the TestPoint symbol filter. These 12 pads are no-purchase copper features.
- Both LEDs and their resistors/FET are placed at the upper board edge with `PWR` and `DONE` silk labels. No mounting holes or copper routes were added.

## Readback

| Check | Step10 result |
| --- | ---: |
| Native KiCad footprints | 178 (up from Step09's 172) |
| Native pads | 920 |
| Physical DRC, all severities | 0 |
| Schematic parity, all severities | 6 inherited warnings; no new Step10 issues |
| ERC, all severities | 6 errors and 18 warnings, unchanged from Step09 |
| Tracks / vias / zones | 0 / 0 / 0 |
| Native pcbnew unrouted connections | 637 (Step09: 627) |

KiCad CLI DRC lists only 499 open items on this board; the 637 count comes from native `pcbnew.GetConnectivity().RecalculateRatsnest()` and `GetUnconnectedCount(False)`. The native schematic netlist confirms all six new references and their intended nets. The six parity warnings are inherited U1.F13, U5.PG, U6 flash footprint filter, U8 pads 4/8, and U9 pad 3. These are reserved for the next cleanup step.

Files: [active KiCad project](../project/hardware/FPGA50T_8L_Unrouted.kicad_pro), complete Step10 checkpoint (local source; not included in web package), ERC (local source; not included in web package), full DRC and parity (local source; not included in web package), native ratsnest (local source; not included in web package), native netlist (local source; not included in web package). The guarded replay script is step_led_tp_candidate.py (local source; not included in web package).

## Separate ERC audit for the next step

Five ERC errors concern TPS62135 regulator pin 4 (`FB2`) on U2, U3, U4, U5, and U7, currently hardwired to GND. [TI's datasheet](https://www.ti.com/lit/ds/symlink/tps62135.pdf) identifies FB2 as the open-drain internal switch output for an optional second feedback resistor, enabled when VSEL is high. All five VSEL pins are low, and no second feedback resistor is used. Remove each FB2-to-GND horizontal and vertical stub, remove the now-unused junction at the GND bus, and mark pin 4 intentionally unconnected. Update each matching PCB pad net from `GND` to KiCad's generated `unconnected-(U?-FB2-Pad4)` net. Keep `FB2` typed as open collector and retain the existing VSEL and main feedback circuits; do not silence ERC by retyping an output as passive.

The sixth ERC error is U1.A6 `MGTRREF` modeled as a KiCad `power_in` pin, even though its correct circuit is already a 100 Ω 1% R123 connection to MGTAVTT. [AMD UG482, Table 5-1 and its board design section](https://docs.amd.com/api/khub/documents/Xk_zMbXsJj92suJ4_0Akkg/content) call MGTRREF a calibration-resistor **input** and require that resistor to MGTAVTT. Update the portable FPGA symbol and cached copies of U1.A6 to `input`; keep R123 and its actual rail connection. A PWR_FLAG on the `GTP_RREF` node would obscure the pin's real function.

Neither ERC audit recommendation was applied in Step10.

An **isolated copy** of Step10 was edited solely to test these six recommendations. Its native KiCad ERC fell from 6 errors/18 warnings to **0 errors/18 warnings**. Updating the five matching PCB pad nets kept physical DRC at 0 and schematic parity at the same 6 inherited warnings. See the trial ERC (local source; not included in web package) and trial full-severity DRC (local source; not included in web package). This trial did not change active CAD or the preserved Step10 checkpoint.
