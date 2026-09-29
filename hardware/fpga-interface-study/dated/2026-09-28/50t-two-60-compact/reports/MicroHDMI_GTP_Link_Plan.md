# Custom micro-HDMI GTP link plan — 28 September 2026

**Status:** source-checked schematic proposal only. No CAD was changed for this report. The current J4 schematic still labels pin 19 `LINK_12V` and leaves all four differential pairs unconnected. The proposed 5 V input, three recording transmit lanes and one control receive lane are **not electrically implemented or approved**. This is a custom link using a Type-D connector; it must not be treated as an HDMI interface or plugged into ordinary HDMI equipment.

## Candidate contact and FPGA ball map

The 19-contact Molex 46765-1001 is J4. Its Type-D contacts 3/5, 6/8, 9/11 and 12/14 are the four cabled differential pair positions, each followed or flanked by a designated ground contact. The FPGA balls below were checked against AMD's `xc7a50tcsg325pkg.csv` from the official Artix-7 package pinout ZIP, as well as the present KiCad U1 netlist. Positive and negative polarity should remain straight through the entire cable and receiver.

| J4 contacts | Candidate role | XC7A50T-CSG325 balls | Board-side treatment |
|---|---|---|---|
| 3 P / 5 N | Recording TX0 | U1 H2 `MGTPTXP0_216` / H1 `MGTPTXN0_216` | One 100 nF series capacitor in each conductor between FPGA and J4. |
| 6 P / 8 N | Recording TX1 | U1 F2 `MGTPTXP1_216` / F1 `MGTPTXN1_216` | Same. |
| 9 P / 11 N | Recording TX2 | U1 D2 `MGTPTXP2_216` / D1 `MGTPTXN2_216` | Same. |
| 12 P / 14 N | Control RX candidate | U1 A4 `MGTPRXP1_216` / A3 `MGTPRXN1_216` | One 100 nF series capacitor in each conductor **if the FPGA board owns RX coupling**. Coordinate with the downstream transmitter so the link has one intentional coupling stage. |
| 4, 7, 10, 13, 16, shell | Pair shields and common return | GND | Retain connections and inspect continuity through the chosen cable and receiver. Decide shell/chassis treatment during system EMC review. |
| 1, 2, 15, 17, 18 | Existing direct JTAG access | VREF 1.8 V; TMS U1 R8; TDI U1 T9; TCK U1 F8; TDO via R118 from U1 T8 | Preserve the custom programmer adapter and target-voltage reference. JTAG access must work before FPGA configuration. |
| 19 | Proposed 5 V power input | Power path, not a GTP ball | **Unapproved** until complete FPGA + routing-board/ASIC budget, cable conductor, return, protection and thermal checks. Current CAD says 12 V. |

The RX1 choice is a **placement inference**, not a functional requirement. The current U1 GTP balls face the PCB west side. TX0, TX1 and TX2 lie at approximately y = 24.3, 22.7 and 21.1 mm in the current footprint; RX1 lies at y = 19.5 mm. A west-edge J4 rotated 270° would present the four cable pairs in the same descending y order, reducing likely crossing. RX0 at E4/E3 remains an alternate if a routing study favors it. The west corridor currently holds several regulators, inductors and capacitors, so relocation requires a full placement pass and DRC. The present northeast J4 placement is not a verified high-speed route.

The fourth transmitter TX3 (B2/B1) would remain open. The unused receiver inputs RX0 (E4/E3), RX2 (C4/C3) and RX3 (G4/G3) should connect to ground as AMD's GTP PCB checklist instructs; unused reference clock pair MGTREFCLK1P/N (B6/B5) should instead remain floating. Do not interchange these two unused-pin rules.

## Clock and AC-coupling proposal

- Add one qualified, low-jitter **differential** GTP reference oscillator, provisionally 100 or 125 MHz, to MGTREFCLK0P D6 and MGTREFCLK0N D5 through one 100 nF series capacitor per conductor. AMD specifies a 350–2000 mV differential peak-to-peak input range and an internal nominal 100 Ω differential clock input; choose the oscillator output type, jitter and any source-side bias from its actual datasheet and the GTP jitter budget. No clock part number is approved yet.
- The GTP receiver has programmable **internal** termination. Select its use mode and input swing after the downstream transmitter is defined. Do not automatically add an external 100 Ω resistor across the FPGA RX pins. Keep the existing MGTRREF-to-MGTAVTT 100 Ω calibration requirement.
- AMD UG482 recommends 100 nF AC coupling for the TX-to-receiver, external transmitter-to-FPGA-RX, and LVDS reference-clock paths. The candidate therefore needs six TX capacitors, two RX capacitors if this board owns the RX stage, and two reference-clock capacitors. Capacitor location, footprint and any ESD parts need cable/channel and placement review.
- The GTP reference clock can also be a fabric clock: AMD UG482 says `IBUFDS_GTE2.O` drives `GTPE2_COMMON` and either `O` or its divide-by-two `ODIV2` can reach a `BUFG`/`BUFH` through HROW. Only **one of O or ODIV2** can use that fabric path, and the two outputs are not phase matched. For a 100 MHz reference, ODIV2 gives 50 MHz; for 125 MHz, 62.5 MHz. If the ASIC output clock is eventually confirmed as 32 MHz, example MMCM ratios are 50 × 16 / 1 / 25 = 32 MHz or 62.5 × 64 / 5 / 25 = 32 MHz, both with an 800 MHz VCO and phase-detector inputs at 50 or 12.5 MHz. AMD's -1 limits cover those arithmetic values. Vivado Clocking Wizard placement, timing and jitter must validate the real design and the ASIC clock requirement must be confirmed. The current 32 MHz Y1 island is DNP and disconnected, so removing it does not remove a currently wired fabric clock.

The 1.25 Gb/s illustrative line rate has a legal GTP clock solution. AMD UG482 gives line rate = 2 × PLL clock / output divider: 2.5 GHz PLL and divider 4 yield 1.25 Gb/s. A 125 MHz reference with feedback factors 4 × 5, or 100 MHz with 5 × 5, gives 2.5 GHz; both factor sets are in AMD's permitted list. DS181 places 1.25 Gb/s within the -1 speed-grade range for divider 4. The actual protocol, receiver clocking and FPGA transceiver IP settings still need design and Vivado validation.

**Manufacturer-verified 1.8 V oscillator candidate:** [SiTime SiT9396AA-02A3-1800-125.000000](https://www.sitime.com/parts/sit9396aa-02a3-1800-125000000) is an exact, production-family 125 MHz, 1.8 V, LVDS, 2.5 × 2.0 mm part. Its [datasheet](https://www.sitime.com/datasheet/SiT9396) specifies a 1.71–1.89 V supply, 48–52% duty cycle, 250–450 mV differential output voltage under its load condition, and up to 42 mA when enabled with termination. A balanced LVDS waveform with that differential voltage has approximately 500–900 mV differential peak-to-peak excursion, inside AMD DS181's 350–2000 mV GTP refclock input range after the required AC coupling. SiTime reports 150 fs typical RMS phase jitter over 12 kHz–20 MHz **at 155.52 MHz**, so that number is evidence of the family’s low-jitter class rather than a verified 125 MHz result. This candidate can use the existing 1.8 V rail **if** its tolerance, startup current and noise are proven; provide SiTime's required local 0.1 µF bypass (and its suggested 10 µF for best jitter). It is **not approved for ordering** until the 125 MHz phase-noise/jitter budget and power-noise behavior are checked for the selected GTP link. The data sheet's 20–80% LVDS edge time is 290 ps typical/340 ps maximum, while DS181 lists 200 ps as a typical GTP reference-clock edge time without a stated maximum; this difference should be evaluated rather than silently declared compliant.

## Recording throughput envelope

The planning input of 4,096 channels × 31,250 samples/s equals **128,000,000 samples/s**. These are link budgets, not measured traffic.

| Payload assumption | Raw payload | With illustrative 8b/10b and 132/128 framing | Per TX lane across three lanes | With additional illustrative 20% rate reserve |
|---|---:|---:|---:|---:|
| Packed 12-bit samples | 1.536 Gb/s | 1.980 Gb/s | 0.660 Gb/s | 0.792 Gb/s |
| Padded 16-bit samples | 2.048 Gb/s | 2.640 Gb/s | 0.880 Gb/s | 1.056 Gb/s |

Three 1.25 Gb/s transmit lanes have 3.75 Gb/s encoded line capacity, or **2.909 Gb/s** after the two stated overhead assumptions. Two such lanes would yield only 1.939 Gb/s after those overheads, below the 16-bit raw payload case. This supports the three-lane candidate, but packet headers, timestamps, CRC, idles, retries, link training, lane alignment and actual sample formatting must be included in the protocol owner’s budget. The control RX rate can be different only if the shared quad PLL and receiver design support it.

## Decision and verification boundaries

1. **Downstream receiver owner:** confirm its physical GTP-capable pins, lane count/rates, receiver protocol, control transmitter rate, polarity, clock tolerance, AC-coupling ownership, lane alignment and complete J4-to-receiver cable pin map. Standard HDMI TMDS logic is not a GTP receiver.
2. **System power owner:** choose 5 V or another external feed only after measured/estimated FPGA, GTP, ASIC and routing-board LDO currents, transients and efficiency, the cable conductor/return rating, connector temperature and input protection are checked. Molex rates 0.8 A at 25 °C for the connector contact, which is an **ideal contact-level ceiling**, not usable power approval; 5 V × 0.8 A = 4 W before all losses. The single contact and cable could be insufficient.
3. **FPGA/firmware owner:** confirm ASIC output clock frequency/tolerance, GTP clock jitter and frequency, configuration and transceiver bring-up order, JTAG adapter voltage, and a Vivado implementation of the three-TX/one-RX plus shared fabric-clock topology.
4. **PCB/fabricator owner:** settle J4 position, pair escape, 100 Ω differential target with actual stackup, return continuity, ESD/channel model and cable strain relief. The Molex specification uses a 100 Ω differential fixture and permits connector-region impedance variation; a passing placement DRC is not an eye-diagram or cable qualification.

## Primary sources and local evidence

- [AMD XC7A50T CSG325 package pinout ZIP entry point](https://www.amd.com/en/developer/resources/adaptive-socs-and-fpgas/package-pinout-files/artix-7-package-device-pinout-files.html), file `a7all/xc7a50tcsg325pkg.csv`.
- [AMD 7 Series GTP Transceivers User Guide UG482](https://docs.amd.com/v/u/en-US/ug482_7Series_GTP_Transceivers), especially reference clock input, PLL equation/dividers, and Chapter 5 GTP PCB checklist.
- [AMD Artix-7 DS181](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet), Tables 37 and 51–58 for MMCM, GTP refclock and line-rate limits.
- [AMD Clocking Resources UG472](https://docs.amd.com/v/u/en-US/ug472_7Series_Clocking), MMCM arithmetic and GTP-to-fabric clock access.
- [AMD 7 Series PCB Design Guide UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB), differential impedance and return-path principles.
- [Molex 46765 micro-HDMI product specification](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf), current limit and 100 Ω differential connector environment.
- [Molex 46765-1001 sales drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467651001_sd.pdf?inline=), physical contact numbering and PCB pattern; [Molex Type-D cable pin assignment](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/106/106413/1064133001-000.pdf?inline=), differential-pair and ground groupings.
- [SiTime exact 125 MHz/1.8 V LVDS oscillator part](https://www.sitime.com/parts/sit9396aa-02a3-1800-125000000) and [SiT9396 manufacturer datasheet](https://www.sitime.com/datasheet/SiT9396); checked as a candidate only.
- Local schematic netlist: `../validation/Step03a.net`; local PCB: `../project/hardware/FPGA50T_8L_Unrouted.kicad_pcb`. The contact map and footprint coordinates above are checked against these present files, not against a downstream receiver or fabricated cable.
