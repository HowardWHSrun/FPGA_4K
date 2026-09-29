# Two 60-contact DF40T ground-return review — 28 September 2026

This is a **contact-allocation and return-path study**, not a routed or electrically qualified interface. It first read the saved Step12 PCB contacts. Step14 moved the whole connector footprints to opposite north/south corners without changing any pad/net assignment; the pad-to-pad distances on each connector therefore remain the same. See the [current Step14 layer study](Step14_Layer_By_Layer_Escape_Study.md) for their saved positions and the board-bound 116-signal map.

| Connector | Existing GND contacts | Digital contacts | Farthest digital pad from the nearest GND pad on the same connector |
|---|---:|---:|---:|
| J5 | 34 | 58 | 7.10 mm, ASIC1_DATA1 at contact 1 |
| J7 | 37, 59 | 58 | 7.83 mm, ASIC5_DATA2 at contact 2 |

The distances are straight lines between **footprint pad centers**, not trace lengths, impedance simulations or a pass/fail limit. Both connectors together also reserve J5.46 for `AC_IN_ANALOG_RESERVED`, leaving all 120 contacts occupied. There is no supply contact for the routing board.

For named clock contacts, the farthest existing same-connector ground distance is **5.70 mm** for J5.9 `ASIC1_CLK32MHz_Out` and **6.04 mm** for J5.59 `BOARD2_SPI_CLK`. These are geometric screening results only; edge rate, driver impedance, mating-board stackup and return-path measurements still determine the electrical behavior.

## Return paths to preserve

1. Keep L2, L5 and L7 as continuous ground-reference layers on **each** board while studying Gerald's staggered L1/L3/L6 FPGA escape. Add return vias near any future signal layer changes. Neither the reference planes nor those vias are drawn yet.
2. Join the two boards' reference planes **through the mating interface near the relevant signal groups**. A solid plane on one board cannot carry a signal's return across the insulating gap. The three current GND contacts are therefore a routing and signal-integrity review item, particularly for the 32 MHz ASIC clocks, SPI clocks, fast FPGA I/O edges and far-end data contacts.
3. A separate paired supply-and-GND lead remains a plausible **ASIC-LDO power feed**. Its return should be sized and kept beside that supply. It is not a substitute for local signal-return contacts in the two DF40T connectors. Bare test GND pads on the FPGA edge likewise do not provide a return path to a mated routing board unless an actual low-impedance connection is built.

## Compact allocation candidate, not a pin-map change

The least speculative contact reduction to study is one 32 MHz feed per **two-ASIC carrier** instead of one dedicated FPGA clock contact per ASIC. This would potentially release four of the eight `ASICx_CLK32MHz_Out` contacts for GND. It requires confirmation that the two chips may share phase and frequency, that the routing board can distribute the clock with suitable skew and edge quality, that the FPGA output can drive the fanout or a local buffer is added, and that Gerald accepts the altered carrier map. Until then **all eight clock signals remain present and all 116 digital contacts remain allocated**. Four added GND contacts alone would still need placement among both connector rows and a real return-path review.

The other design route is additional inter-board GND bonds dedicated to signals, positioned near both connector fields; this adds assembly and mechanical risk and is not interchangeable with a remote power lead. Do not assign a shell, mounting screw or an unspecified harness as a verified signal return. Hirose specifies **60 positions and a nonfloating design** for this receptacle; its physical reinforcement cannot be counted as an extra electrical ground without a documented mating-current path. The connector pair itself still needs rigid-board tolerance and mating approval.

**Decision gate before routing:** obtain the routing board's matching contact map and ASIC clock/fanout constraints; then choose the final GND distribution and examine high-edge-rate current return across the mating pair. Preserve the Step12 map until the changed electrical contract is approved.

## Sources

- 28 September meeting record (local source; not included in web package), which records Gerald's layer-stepping concept and asks for a reviewed board-to-board and power plan.
- [Current Step14 layer map](Step14_Layer_By_Layer_Escape_Study.md), [historical Step07 layer map](Layer_By_Layer_Escape_Study.md), and saved `Step12_Netlist.net` in `../validation/`.
- [TI AFE79xx layout guide, §10.5–10.6](https://www.ti.com/lit/an/sbaa405b/sbaa405b.pdf): a signal's high-frequency return tends to follow its adjacent ground reference and breaks in that path require attention.
- [Hirose DF40TC-60DS-0.4V(51) specification and drawing](https://www.hirose.com/en/product/p/CL0684-4270-0-51): 60 positions, 0.4 mm pitch, nonfloating mating.
- [Power-feed review](Power_To_Routing_Board_Decision.md).
