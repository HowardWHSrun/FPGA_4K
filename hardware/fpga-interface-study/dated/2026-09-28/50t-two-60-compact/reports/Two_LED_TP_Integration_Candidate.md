# Two LED indicators and edge-pad parity — staged CAD candidate

**28 September 2026.** This is a reproducible, unrouted Step08 sandbox candidate. The active KiCad project was not edited for this stage. The staging script (local source; not included in web package) refuses the active project unless an operator supplies `--allow-active` after CAD ownership is released. It also refuses preserved checkpoints.

## Circuit and purchase delta

| Ref | Part | Circuit role |
|---|---|---|
| D1 | Kingbright `APTD1608LSURCK`, red 0603 | Raw J4 input present |
| D2 | Kingbright `APTD1608LZGCK`, green 0603 | FPGA configuration DONE |
| R130, R131 | Vishay `CRCW06033K30FKEA`, 3.3 kΩ 0603, one each | Separate LED current limits, provisionally compatible with 5 V or 12 V input |
| Q1 | Diodes `DMN52D0U-7`, 50 V SOT-23 NMOS | Low-side buffer so LED current does not flow through FPGA DONE |
| R132 | Vishay `CRCW0402470KFKED`, 470 kΩ 0402 | Gate pull-down; keeps green dark without 1.8 V/DONE |

`LINK_12V` remains the *current raw J4 input net name*, even though 5 V versus 12 V and entry protection are still under review. The red path is `J4.19/LINK_12V → R130 → D1 anode → D1 cathode → GND`. The green path is `LINK_12V → R131 → D2 anode → D2 cathode → Q1 drain → Q1 source → GND`. Q1 gate and R132 top connect to `FPGA_DONE`; R132 bottom connects to GND. The existing R110 = 4.7 kΩ DONE pull-up remains in place. The input LED confirms connector power only; the DONE LED confirms configuration indication only.

With typical 2 mA LED forward voltages, the 3.3 kΩ branch gives approximately **0.98 mA red / 0.71 mA green at 5 V**, and **3.11 mA red / 2.83 mA green at 12 V**. At an assumed 13.2 V input and minimum specified red forward voltage of 1.5 V, R130 would dissipate about **41.5 mW**, below the Vishay 0603's 0.1 W rating at 70 °C. At an assumed 4.5 V input and maximum green forward voltage of 3.1 V, green current may fall to roughly **0.42 mA**; visible brightness still needs bench review. R110 and R132 set the released DONE gate near **1.782 V nominal**, giving a low-current drive candidate for the MOSFET. Startup timing and voltage margin have not been measured.

If an entry-protection component is added, both LED branches may need to move from raw J4 to its protected output. That is an explicit power-path review item. The legacy `LINK_12V` label must be reconciled with the chosen input voltage before release.

## Native Step08 sandbox verification

The script was run on a copy of `checkpoints/08_edge_io/project/` at `/tmp/fpga50t-step08-led-candidate`. Native KiCad readback after each correction gave:

| Check | Baseline Step08 | Staged candidate |
|---|---:|---:|
| Board size | 38.5 × 43 mm | 38.5 × 43 mm |
| Board footprints | 159 | 165 |
| Tracks, vias, zones | 0 | 0 |
| ERC | 14 errors / 32 warnings | 14 errors / 32 warnings |
| Physical DRC violations, all severities | 0 | 0 |
| Schematic/PCB parity warnings, all severities | 34 | 10 inherited |
| Native pcbnew open connections | 590 | 600 |

The 24 cleared parity warnings were the twelve TP128–TP139 PCB Value mismatches and twelve local TestPoint symbol footprint-filter mismatches. The script sets each PCB Value to the exact schematic Value and extends the portable `CoreSupport:Connector__TestPoint` filter to `EdgeProbePad*` in the library and every cached sheet copy. It did not change any TP net or geometry.

The ten remaining full-severity parity findings predate this candidate: U1 E8/F13/K16/L15/L17 net conflicts, U5 pin 7, U8 pins 4 and 8, missing U9 pad 3, and U6's filter. A separate owner is correcting these against the native netlist and manufacturer package drawings. The DRC JSON itself lists only 499 open items on this board; the native pcbnew connectivity API gives the complete 600-count ratsnest. This candidate is still wholly unrouted.

The frozen full-severity DRC JSON (local source; not included in web package), ERC JSON (local source; not included in web package), and exact native ratsnest JSON (local source; not included in web package) capture the Step08 sandbox check.

Schematic netlist assertions passed: `PWR_LED_A` joins exactly R130.2 and D1.2; `DONE_LED_A` joins R131.2 and D2.2; `DONE_LED_K` joins D2.1 and Q1.3; `FPGA_DONE` contains R110.2, Q1.1, and R132.1; GND contains D1.1, Q1.2, and R132.2. J4.19, R130.1, and R131.1 share `LINK_12V`. The two front-side silk labels are `PWR` and `DONE`; the former large connector warning is retained on `Dwgs.User` to clear their visible area.

The component footprints and symbol pins agree in the candidate: LEDs use pad 1 cathode and pad 2 anode, and Q1 SOT-23 uses pin/pad 1 gate, 2 source, 3 drain. The latter matches the manufacturer top-view orientation but should still be checked against the assembler's final land-pattern drawing. Package and lens height, emitted brightness, mechanical sight line, and protected-power selection remain review gates.

## Apply after active CAD release

Copy the current complete active KiCad project to a dated checkpoint, then run the script against a copy of that current project first. The Step08 test proves the script against the frozen Step08 baseline; subsequent GTP/flash placements may occupy the proposed LED coordinates. Repeat native netlist, ERC, `pcb drc --schematic-parity --severity-all`, pad-to-symbol parity, exact ratsnest, and a front-side visual before allowing the active edit. The script contains no routing command.

## Manufacturer sources

- [Kingbright red APTD1608LSURCK](https://www.kingbrightusa.com/images/catalog/SPEC/APTD1608LSURCK.pdf) and [green APTD1608LZGCK](https://www.kingbrightusa.com/images/catalog/SPEC/APTD1608LZGCK.pdf): 0603 low-current LEDs and forward-voltage ranges.
- [Diodes DMN52D0U datasheet](https://www.diodes.com/datasheet/download/DMN52D0U.pdf): SOT-23 top view, 50 V drain rating, and 1.8 V gate on-resistance test.
- [Vishay CRCW series datasheet](https://www.vishay.com/docs/20035/dcrcwe3.pdf): 0603 and 0402 ratings and derating.
- [AMD UG949 board design tips](https://docs.amd.com/r/2024.2-English/ug949-vivado-design-methodology/Board-Design-Tips?contentId=nEa6Pem_nCPVlrE160coEw): configuration-indicator driver guidance.
