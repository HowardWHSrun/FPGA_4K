# Step12: regulator FB2 and FPGA MGTRREF ERC cleanup

This checkpoint builds on the preserved Step11 project. The board remains **38.5 × 43 mm and unrouted**.

## Changes

- U2, U3, U4, U5, and U7 are TPS62135 converters with VSEL tied low and no optional second feedback resistor. Their FB2 pin 4 was wired to GND. Each FB2-to-GND branch is now removed from the schematic, the pin is marked intentionally unconnected, and PCB pad 4 carries its matching KiCad generated `unconnected-(U?-FB2-Pad4)` net. The FB2 symbol type stays `open_collector`; the main feedback and VSEL circuits stay intact. [TI defines FB2 as an open-drain internal switch output for the optional second feedback resistor.](https://www.ti.com/lit/ds/symlink/tps62135.pdf)
- U1.A6 `MGTRREF_216` is modeled as an `input` pin in the portable FPGA symbol and its four cached schematic symbols. The actual R123 `100R 1%` path from U1.A6 to `MGTAVTT_1V2` is unchanged. [AMD UG482 describes MGTRREF as a calibration-resistor input and specifies 100 Ω to MGTAVTT.](https://docs.amd.com/api/khub/documents/Xk_zMbXsJj92suJ4_0Akkg/content)
- No oscillator, LED, connector, or other footprint placement changed. Y1 remains at (9.96, 18.000001) mm and D1 at (17, 12.4) mm.

## Native KiCad readback

| Check | Step12 |
| --- | ---: |
| ERC errors / warnings | 0 / 18 |
| Physical DRC violations, all severities | 0 |
| Schematic parity issues, all severities | 0 |
| Footprints / pads | 178 / 921 |
| Tracks / vias / zones | 0 / 0 / 0 |
| Native pcbnew open connections | 633 |

The Step11 native open count was 638; each intentionally isolated FB2 removes one open connection. The KiCad CLI DRC JSON shows only 499 open items due to its reported-item cap, so 633 is the full native connectivity count. All 18 remaining ERC findings are warnings: 15 pin-type pair warnings and 3 isolated-label warnings. They are retained for later engineering review rather than suppressed.

Readback confirms R123 remains `100R 1%`, `GTP_RREF` contains U1.A6 and R123.1, and `MGTAVTT_1V2` contains R123.2. The five FB2 generated NC nets each contain only their intended regulator pad.

Files: [active project](../project/hardware/FPGA50T_8L_Unrouted.kicad_pro), complete Step12 checkpoint (local source; not included in web package), ERC (local source; not included in web package), full DRC and parity (local source; not included in web package), netlist (local source; not included in web package), native ratsnest (local source; not included in web package), and replay script (local source; not included in web package).
