# USB-C interface review — 27 September 2026

## What has passed

The independently exported native schematic matches the selected circuit inputs: **179 footprint-bearing components, 261 supplied pins across 55 input components (including replacement J4), all 116 digital ASIC assignments, and all four bank-16 differential pairs**. The retained endpoints changed only for the reviewed port replacement, eight formerly reserved link balls, input-supply rename, U2 enable handoff, and the explicitly adopted ASIC3_READ contact move from J5.32 to J6.59. The exact MPNs and project-local footprint copies match their sources. The native ERC now contains only the **one externally supplied AC_IN analog label; the three unused mezzanine contacts J5.32, J5.34 and J6.37 are explicit NC for this revision**.

This is a schematic/pin audit, not a complete USB-C PCB-routing result. The current merged USB2 work joins the duplicated connector contacts only. The MCU exit and both USB2 trunks remain unfinished. The isolated U215 escape candidate is held outside the integrated checkpoint until the complete USB2 path and C60 ground repair can be accepted together. [Exact inputs, source hashes and readback](evidence/Native_USB_Interface_Audit.json). Native XML SHA-256: `b47e43e7cbb63e69a567d0a47e6d43e93dc3a34fc8993331b3f4e6b4d4238fe9`.

The connector-local PCB checkpoint also passes the independent J4 readback: all **30 physical pads** match the GCT layout and their intended nets, including all six separate shell lands. Four plated slots are nominal **0.60 × 1.60 mm**; the drawing specifies ±0.05 mm for the PCB layout. Its local 5.90 mm edge datum transforms to the board's x = 33 mm edge at the selected 90° placement. Two top shell lands have nominal 0.40 mm copper-to-edge spacing, so that scoped SH rule and fabrication tolerance acceptance remain explicit. [Native connector audit](evidence/J4_Native_Physical_Review.json).

## Corrected startup wiring

TCPP01 supplies the unpowered dead-battery termination. MCU DBCC1/DBCC2 are grounded, rather than tied to CC; the latter connection belongs to the standalone-MCU circuit. TCPP_DB_N stays low while UCPD1 is configured with normal sink Rd, then the G0 UCPD1_STROBE is applied before DB_N rises. This follows ST Figure 4 / section 6.5 and avoids substituting a different STM32 family's register sequence. The grounded PA9/PA10 pins must never become driven GPIOs, and PA11/PA12 remapping stays disabled for the USB device pins. [Full circuit and firmware contract](USB_C_Link_Contract.md).

The protected-VBUS bootstrap powers the 3.3 V MCU before the FPGA. The eFuse is **TPS259474L, a latch-off circuit breaker with controlled turn-on slew**, not an indefinitely regulating current limiter. Its true PG, qualified by the switched-output divider, feeds MCU PB7 and the R212/R213 divider that drives FPGA_CORE_EN at the existing core regulator. R209 is now 47 kΩ; R212/R213 are 100 kΩ each. Main power, mux EN and JTAG OE default off. SWD fixture copper provides initial MCU programming and recovery; subsequent USB2-to-JTAG recovery does not require a configured FPGA.

## Precise remaining dependencies

| Owner | Required work | Why it remains open |
|---|---|---|
| PCB/layout | Complete the remaining routes on the packed 33 × 36 mm layout; preserve decouplers when relocating them; rerun complete native DRC/parity/endpoint audit. | Zero old ASIC-route disruption at a candidate position is not proof that its new pins can escape. The MCU's outer edge is especially constrained. |
| Firmware | Implement UCPD/TCPP handoff, supported-power gating, USB device/control/JTAG streaming, watchdog recovery, negotiated mode entry/exit, orientation and fail-closed outputs. | The circuit contract is supplied; no working MCU firmware or USB/JTAG transfer has been demonstrated. |
| FPGA/receiver | Implement the custom three-lane data and clock link and matching XEM adapter; prove serialization timing, payload capacity, lane training and error handling. | The approximate 2 Gbit/s planning target and conservative 2.56 Gbit/s raw scenario are not measured or frozen payload specifications. The XEM's existing USB port is not a USB host. |
| Power/bring-up | Measure AON startup, PD transitions, full-load startup, unplug/brownout, core droop/ripple and thermal behavior. | Analytical screens are not measured qualification; the old FPGA-PDN limits persist. |
| Fabrication/assembly | Accept the four finished plated slots, connector retention/tail seating, fine-pitch packages and applicable mask/edge constraints. | GCT gives 1.60 mm nominal tails, with the drawing's general two-decimal tolerance ±0.25 mm and no qualified PCB-thickness range. A 1.59 mm ±10% board can leave them recessed; no bottom fillet is promised. |

The **unplug/brownout test has a specific reason**: TI permits PG up to 1.0 V below the eFuse input undervoltage threshold, which could exceed the core regulator’s enable threshold. The selected R209 47 kΩ pullup and R212/R213 100 kΩ divider now reduce that core-enable level to at most about 0.510 V with 1% resistor and 100 nA input-leakage assumptions. A 3.0–3.6 V AON corner calculation including 3 µA eFuse and 70 nA MCU leakage leaves at least 0.200 V above the MCU’s 0.7 VDD high threshold and core enable at least 1.136 V. This is an analytical correction; measure the actual rail/transient sequence. MCU PG alone is not a guaranteed low during brownout, so firmware also checks VBUS ADC and fails closed. [TI TPS25947](https://www.ti.com/lit/ds/symlink/tps25947.pdf), [STM32 DS13560 Table 55](https://www.st.com/resource/en/datasheet/stm32g0b1me.pdf).

The selected **TMUXHS4446RETR** replaces HD3SS460 and explicitly specifies powered-off data-pin leakage. Its controls share MCU AON 3.3 V; C239 is the additional local bypass. All 41 mux terminals passed the current native readback. The complete channel and intermediate-voltage behavior remain unqualified. [Exact source-based mux review](TMUXHS4446_Power_Off_Review.md).

No orders were placed. No bitstream, receiver adapter, electrically operating board, certified USB mode or manufacturing release is claimed by these checks.
