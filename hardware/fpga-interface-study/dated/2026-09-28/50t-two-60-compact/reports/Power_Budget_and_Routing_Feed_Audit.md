# 50T and routing-board power budget — evidence and decision gate

**28 September 2026; independent read-only audit.** This is a budget framework for the unrouted two-DF40T board. It is not a measured load, approved input voltage, or released power circuit.

## What the meeting and CAD actually say

- In the 28 September meeting record (local source; not included in web package), Gerald requested a clean feed from the FPGA board to the routing board's ASIC LDOs. At 15:58–17:26 of the saved automatic transcript he also raised **two separate conductors, supply and ground, in a future cable/battery plan if cable power or cleanliness proves insufficient**. The transcript is uncorrected, so verify ambiguous words against audio before an electrical commitment. The meeting did not establish ASIC current, routing-LDO input voltage, external source voltage, or cable rating.
- The current 50T schematic netlist (local source; not included in web package) has five TPS62135 regulator inputs U2/U3/U4/U5/U7 on `LINK_12V` at J4.19. Its rail purposes are core/BRAM 1.0 V, AUX and configuration bank 0 at 1.8 V, three user I/O banks at 1.5 V, and dedicated GTP analog supplies at 1.0 and 1.2 V. The `LINK_12V` label is inherited; the meeting questioned it. J4.19 is wired directly to the buck input capacitors and regulators without a series input limiter or hot-plug switch in this snapshot.
- The [two-connector pin budget](Power_To_Routing_Board_Decision.md) uses all 120 DF40T contacts: 116 digital ASIC signals, one analog reservation, three grounds. There is **no allocated supply pin**. If the FPGA board supplies the routing-board ASIC LDOs and this contact map is retained, a physically separate supply-and-return connection is necessary. That can be compact paired edge pads and a short secured lead or a keyed 2-pin connector; the exact mechanical design is unresolved. A dedicated return is needed; the three signal-ground contacts must not be assumed to carry the ASIC power return.
- The old supplied `LDO_Board_10SOIC` schematic has nine `LT3042xMSE` regulators U1–U9 fed by `3V3` (independently exported `/tmp/legacy-ldo-power.net`). This is a **historical ten-SOIC reference**, not an eight-ASIC load measurement or an approved revised routing board.

## Numbers that can be defended now

| Quantity | Calculation | Meaning and limit |
|---|---:|---|
| J4.19 at proposed 5 V | 5 V × 0.8 A = **4.0 W** | Absolute arithmetic from Molex's **0.8 A per contact at 25 °C**. Not a system allowance; the cable, source, return contacts, temperature, contact heating, startup, and protective margin may all lower it. |
| J4.19 at inherited 12 V | 12 V × 0.8 A = **9.6 W** | Same contact-only ceiling. A normal HDMI source does not supply this custom 12 V; the external supply/adapter would have to be defined. |
| XC7A50T startup rail-source capacity | 1.0 V×(215+62) mA + 1.8 V×62 mA + 1.8 V×41 mA + 3×1.5 V×41 mA = **0.647 W** | Derived from AMD DS181 Table 5 quiescent currents plus Table 6 **minimum source current required during power-on/configuration**, for core, BRAM, AUX, bank 0 and banks 14/15/34. It is **not** typical active power, a maximum, or contact input power. It excludes GTP, oscillator, flash, LEDs, loaded I/O and converter loss. |
| J4.19 input capacitance in Step06 | 47 µF + 5×22 µF + 6×0.1 µF = **157.6 µF nominal** | C1, C3/C7/C11/C15/C124 and C2/C4/C8/C12/C16/C125 in the native netlist. Actual effective ceramic capacitance varies with DC bias/temperature. An illustrative 1 ms linear rail rise gives `C×dV/dt` ≈0.79 A at 5 V or 1.89 A at 12 V *average capacitor-charging current*, before converter start. A real hot-plug transient is not defined by this calculation. |
| Old LT3042 capacity stress test | 9×0.2 A×3.3 V = **5.94 W** at the old board's 3.3 V LDO inputs if every regulator delivered its full 200 mA rating | **Not** an ASIC power estimate; rated simultaneous full load is neither established nor expected. It demonstrates that the 5 V single-contact ceiling cannot guarantee all historical LDOs at full rating, even before FPGA draw and conversion loss. |

[AMD DS181](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content) gives the startup current terms and says to use XPE after configuration. The typical quiescent entries apply to a **blank configured FPGA with floating three-stated I/O**, so they cannot predict this active 3-TX/1-RX recorder. [AMD UG440](https://docs.amd.com/r/en-US/ug440-xilinx-power-estimator/Supported-Device-Families) identifies XPE for Artix-7 and provides transceiver input settings. The historical LDO current rating is from [ADI LT3042](https://www.analog.com/en/products/lt3042.html). The connector limit is from [Molex 46765](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf).

## Budget equation and next measurement

For the chosen cable input voltage `V_IN`, calculate and measure

`I_J4 = {sum_over_FPGA_rails(V_RAIL × I_RAIL / η_BUCK) + V_ROUTING_LDO_IN × I_ROUTING_LDO_IN / η_FEED + P_DIRECT}/V_IN`.

`I_ROUTING_LDO_IN` includes all eight ASIC-side LDO loads and their own supply current. The `η_FEED` factor is 1 only for a direct already-qualified branch; it is the preceding buck efficiency if an intermediate clean rail is created. Add startup/inrush and transients separately. Do **not** add rail output currents and compare that sum directly to the cable's input current. The maximum permitted `I_J4` is the **lowest qualified** limit among J4.19, the return path, mating connector, cable conductors, source, protection and thermal condition, with engineering margin.

No defensible typical or worst-case full-system wattage is possible from the saved material: the ASIC supply currents and duty cycles, revised eight-ASIC LDO count/input voltage, implemented FPGA logic/toggle rate, GTP lane settings and analog-rail currents, actual cable/return construction, buck efficiencies at load, ambient/stack temperature, and expected stimulation peaks are missing. Run an Artix-7 XPE with the actual 50T part and 3TX+1RX configuration; update it from Vivado `report_power` after firmware exists. Measure each rail and the routing-board feed during simultaneous recording, stimulation, flash programming and boot.

## Startup, cleanliness, and schematic implications

- AMD DS181 recommends core/BRAM then AUX then VCCO, with GTP core/MGTAVCC before MGTAVTT; the wrong GTP order can transiently add **460 mA per transceiver** to MGTAVTT under the stated voltage conditions. This is a sequencing fault case, not normal current. Ensure GTP rail PG/enable ordering and configuration hold-off are verified before using a tight cable budget.
- The five TPS62135 buck soft-start circuits control their *outputs*; they do not by themselves limit hot-plug charging of the common input capacitors. [TI's datasheet](https://www.ti.com/lit/ds/symlink/tps62135.pdf) specifies 3–17 V input and adjustable soft-start, but its 4 A output rating does not enlarge a 0.8 A connector contact. Add a power-entry and branch design only after the input voltage/source are selected: current limiting/inrush control, reverse/hot-plug and transient handling, and a controlled quiet feed to the routing LDOs.
- Supplying the old LT3042 bank directly from 12 V would waste `(12 V − V_OUT) × I` in each LDO. If 12 V is chosen for connector current headroom, step it down near the FPGA board before the routing LDOs, then check converter noise, headroom and heat. A 5 V feed may also need an intermediate rail depending on the LDO's required voltage and power dissipation. Keep the analog supply return paired with its supply and assess coupling from the FPGA buck loops and GTP.
- Both 5 V and 12 V are *review candidates*. A 5 V pin-19 plan is physically familiar but has only 4 W contact arithmetic; 12 V increases the power arithmetic to 9.6 W but needs a custom source and stronger voltage/heat/hot-plug review. Neither is qualified by the present schematic. A separate auxiliary power pair in the external cable remains a valid fallback if the measured/estimated budget or analog-noise test fails.

## Minimal owner questions

1. Zitong/ASIC owner: What are the **maximum and typical currents of all eight chips**, including recording, stimulation and boot, and what LDO input voltage/headroom is required?
2. Downstream/cable owner: What exact custom source voltage, current limit, wire gauge/length, return allocation and hot-plug behavior can the receiver provide?
3. FPGA firmware owner: What LUT/BRAM/clock use, I/O toggle/loads and 3TX+1RX GTP settings should be entered into XPE?

Until those answers are available, the schematic can reserve a separate two-conductor routing-board feed and a power-entry protection block, but should not label a 5 V single-contact solution as sufficient for the whole headstage.
