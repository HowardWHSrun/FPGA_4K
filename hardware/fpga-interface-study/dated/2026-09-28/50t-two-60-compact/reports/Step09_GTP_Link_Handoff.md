# Step 09 — custom micro-HDMI GTP and 125 MHz reference candidate

**28 September 2026.** Native KiCad schematic and placement review. The active project and a portable copy at `../checkpoints/09_gtp_link/project/` include the project file, all hierarchical sheets, symbol tables, and local footprints. No traces, vias, or zones have been added. The outline remains 38.5 × 43.0 mm; J4 pin 19 remains the existing `LINK_12V` candidate. The two DF40T-60 connectors and JTAG contacts remain in place.

## Implemented contact chain

| Direction | U1 XC7A50T-CSG325 ball | 100 nF series part | J4 Type-D contact |
|---|---|---|---|
| TX0 P / N | H2 / H1 | C137 / C138 | 3 / 5 |
| TX1 P / N | F2 / F1 | C139 / C140 | 6 / 8 |
| TX2 P / N | D2 / D1 | C141 / C142 | 9 / 11 |
| RX1 P / N | A4 / A3 | C143 / C144 | 12 / 14 |
| 125 MHz LVDS reference P / N | D6 / D5 | C145 / C146 | Y2 pins 4 / 5 |

Each capacitor is one **series** capacitor per conductor, so FPGA and cable/source side nets have distinct names. The native netlist proves all ten chains. The chosen RX coupling ownership is this FPGA board; the downstream control transmitter must not add a second unreviewed coupling stage. RX0, RX2 and RX3 are grounded; TX3 and MGTREFCLK1 remain open, per [AMD UG482 Table 5-14](https://docs.amd.com/v/u/en-US/ug482_7Series_GTP_Transceivers). J4 contacts 1, 2, 15, 17 and 18 retain JTAG and target reference. This is a custom cable; ordinary HDMI equipment is incompatible.

## Added purchase candidates

| References | Quantity | Exact part / purpose |
|---|---:|---|
| C137–C147 | 11 | [Murata GRM155R71C104KA88D](https://www.murata.com/products/productdetail?partno=GRM155R71C104KA88%23), 100 nF, 16 V X7R, 0402. Ten are AC coupling; C147 is the oscillator's required local bypass. |
| C148 | 1 | [Murata GRM188R61A106MAALD](https://www.murata.com/products/productdetail?partno=GRM188R61A106MAAL%23), 10 µF, 10 V X5R, 0603, added for SiTime's best phase-jitter recommendation. Effective capacitance at 1.8 V remains to be checked. |
| Y2 | 1 | [SiTime SiT9396AA-02A3-1800-125.000000](https://www.sitime.com/parts/sit9396aa-02a3-1800-125000000), 125 MHz LVDS, 1.8 V, 6-pin 2.5 × 2.0 mm. |

Y2 uses VCCAUX_1V8 and GND. The ordered feature makes pin 1 NF, so it is open; pin 2 is NF and tied to GND for the thermal practice recommended by [SiTime Rev 1.05, page 14](https://www.sitime.com/api/gated/SiT9396-datasheet.pdf). The local `GTPLink` footprint follows SiTime's page-27 recommended lands: outer pads 1.00 × 0.63 mm, middle pads 1.00 × 0.48 mm, columns ±0.70 mm, outer rows ±0.975 mm, rotated to the page-14 top-view numbering. The land/stencil design still needs assembler approval. The 125 MHz jitter, supply noise and GTP receiver channel are **not** approved for procurement or fabrication.

## Native checks

- `Step09_Final_Netlist.net` and `Step09_Final_Verification.json`: ten conductor chains, six grounded RX pins, five deliberate open pads, 12 V J4 input and four flash pins checked directly.
- `Step09_Final_ERC.json`: 6 errors and 18 warnings. The errors are inherited pin-type/power-rule findings; six of the warnings are expected from directly grounding unused bidirectional RX balls. There are no dangling-label, footprint-link or multiple-net-name findings.
- `Step09_Final_Full_DRC.json` with `--schematic-parity --severity-all`: **0 physical violations** and **30 inherited parity warnings**. All Step09 components and J4 are parity clean. The four previously unsynced U1 flash pads E8, K16, L15 and L17 were synced to the native schematic netlist. Remaining parity includes the important inherited U1 F13 PCB VCCAUX_1V8 versus schematic GND conflict, plus U5/U8/U9 and earlier edge-pad field/filter discrepancies. Repair separately before routing.
- KiCad CLI lists 499 unrouted items because its list is capped; native `pcbnew.GetUnconnectedCount(False)` reports **627**. The PCB has 172 footprints, 907 pads, and **zero** tracks, vias or zones.
- Visual exports: `../validation/Step09_Sheet14.png`, `Step09_J4_Sheet.png`, and `Step09_GTP_Pin_Sheet.png`. Human placement review views are `Step09_Board_Top_Review.png` and `Step09_Board_Bottom_Review.png`; native SVG exports are also present. The placement images show Step09 before the two testing LEDs and inherited parity repairs.

## Gates before routing

Confirm the receiver's actual GTP-compatible pinout, selected lane/protocol rates, polarity and cable conductor/return geometry. Run a real serial-link and reference-clock jitter budget, verify the 1.8 V oscillator rail noise/current and the cable/power path, and validate the GTP-to-fabric clock and ASIC output clock in Vivado. Gerald's ball-escape advice should guide layer allocation and keep SelectIO from adjacent GTP layers as UG482 directs. Current placement only passes geometric DRC; it does not establish controlled impedance, eye opening, crosstalk or a routable escape. The disconnected legacy Y1/R119/C102/C103 32 MHz island remains for a separate checked cleanup step.
