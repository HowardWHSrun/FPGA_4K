# Power path to the routing/LDO board — review decision

The two proposed 60-contact DF40T connectors are fully allocated: 116 digital ASIC signals, one `AC_IN` analog reservation and three grounds. They contain **no supply contact for the routing board**. Gerald's 28 September meeting asked for a clean feed to the routing board's ASIC LDOs, but did not approve a voltage, current or physical link. The separate [connector ground-return assessment](DF40T_Ground_Return_Review.md) explains why an additional power return cannot replace local signal returns at the mating contacts.

## What a short internal lead would mean

The external custom micro-HDMI cable would enter the FPGA board at J4. A separate **short, two-conductor board-to-board lead** would carry a supply and its return from a power output on the FPGA board to the routing board's ASIC-LDO input. Those are two physically different connections: the micro-HDMI cable connects to the downstream box; the short lead stays inside the headstage. Small labeled edge pads on both boards are a compact candidate; a keyed two-pin connector is more serviceable but larger. Both require strain relief, polarity and assembly review. The ASIC LDOs would still regulate locally on the routing board.

## Cable power ceiling

Molex rates one contact of the proposed 46765 micro-HDMI receptacle at **0.8 A at 25 °C**. If only J4.19 carries supply, the ideal contact-level ceiling is 5 V × 0.8 A = **4.0 W** for a 5 V candidate, or 12 V × 0.8 A = **9.6 W** for a 12 V candidate. This arithmetic is not a usable continuous system budget: cable loss, temperature derating, connector heating, buck efficiency, FPGA activity and eight ASIC/LDO currents remain unknown. The existing five FPGA/GTP buck circuits cannot be claimed to power the routing board from 5 V until measured/estimated current fits with margin.

| Option | What the schematic can reserve now | Decision still needed |
|---|---|---|
| 5 V custom micro-HDMI + internal lead | J4.19 input, common return, protected output to the routing board | FPGA + GTP + ASIC power budget below qualified contact/cable limit. |
| 12 V custom micro-HDMI + internal lead | Same physical plan; buck regulators accept the higher candidate input | Source/cable qualification, output LDO input ratings and dissipation. |
| Separate high-current supply | Additional input/output power connector or pads | Headstage wiring and size acceptance. |

No option should be marked purchase-ready or powered from standard HDMI equipment. The Type-D shell is used as a **custom connector**, not an HDMI electrical interface. J4's separate high-speed pair, JTAG and return maps need receiver and cable approval. The candidate two-connector rigid-board mating also needs Hirose mechanical approval or a split mating board.

## Sources

- 28 September meeting summary (local source; not included in web package).
- [Molex 46765 product specification, current rating](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf).
- [TI TPS62135 regulator datasheet](https://www.ti.com/lit/ds/symlink/tps62135.pdf), 3–17 V input range; power and layout still need checking for the chosen cable supply.
