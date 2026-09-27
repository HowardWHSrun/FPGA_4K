# USB-C interface review — 27 September 2026

## What has passed

The independently exported native schematic matches the selected circuit inputs: **176 footprint-bearing components, 245 supplied pins across 52 input components (including replacement J4), all 116 digital ASIC assignments, and all four bank-16 differential pairs**. The retained endpoints changed only for the reviewed port replacement, eight formerly reserved link balls, input-supply rename, and U2 enable handoff. The exact MPNs and project-local footprint copies match their sources. The native ERC now contains only the **three deliberately reserved mezzanine contacts and one externally supplied analog label**.

This is a schematic/pin audit, not a complete USB-C PCB-routing result. Historical source-audit evidence is not packaged with this superseded note. Native XML SHA-256: `82b7b1d35e3dbf3e499da440f9f34e5053176042df4ee05b969e58617c45d052`.

The connector-local PCB checkpoint also passes the independent J4 readback: all **30 physical pads** match the GCT layout and their intended nets, including all six separate shell lands. Four plated slots are nominal **0.60×1.60 mm**; the drawing specifies ±0.05 mm for the PCB layout. Its local 5.90 mm edge datum transforms to the board's x = 33 mm edge at the selected 90° placement. Two top shell lands have nominal 0.40 mm copper-to-edge spacing, so that scoped SH rule and fabrication tolerance acceptance remain explicit. Historical connector-audit evidence is not packaged with this superseded note.

## Corrected startup wiring

TCPP01 supplies the unpowered dead-battery termination. MCU DBCC1/DBCC2 are grounded, rather than tied to CC; the latter connection belongs to the standalone-MCU circuit. TCPP_DB_N stays low while UCPD1 is configured with normal sink Rd, then the G0 UCPD1_STROBE is applied before DB_N rises. This follows ST Figure 4 / section 6.5 and avoids substituting a different STM32 family's register sequence. The grounded PA9/PA10 pins must never become driven GPIOs, and PA11/PA12 remapping stays disabled for the USB device pins. [Full circuit and firmware contract](USB_C_Link_Contract.md).

The protected-VBUS bootstrap powers the 3.3 V MCU before the FPGA. The eFuse is **TPS259474L, a latch-off circuit breaker with controlled turn-on slew**, not an indefinitely regulating current limiter. Its true PG, qualified by the switched-output divider, enables the existing core regulator. Main power, mux EN and JTAG OE default off. SWD fixture copper provides initial MCU programming and recovery; subsequent USB2-to-JTAG recovery does not require a configured FPGA.

## Precise remaining dependencies

| Owner | Required work | Why it remains open |
|---|---|---|
| PCB/layout | Pack, escape and route all added ICs/passives; preserve decouplers when relocating them; rerun complete native DRC/parity/endpoint audit. | Zero old ASIC-route disruption at a candidate position is not proof that its new pins can escape. The MCU's outer edge is especially constrained. |
| Firmware | Implement UCPD/TCPP handoff, supported-power gating, USB device/control/JTAG streaming, watchdog recovery, negotiated mode entry/exit, orientation and fail-closed outputs. | The circuit contract is supplied; no working MCU firmware or USB/JTAG transfer has been demonstrated. |
| FPGA/receiver | Implement the custom three-lane data and clock link and matching XEM adapter; prove serialization timing, payload capacity, lane training and error handling. | 900 Mbit/s and 64b/66b remain candidate calculations, not achieved performance. The XEM's existing USB port is not a USB host. |
| Power/bring-up | Measure AON startup, PD transitions, full-load startup, unplug/brownout, core droop/ripple and thermal behavior. | Analytical screens are not measured qualification; the old FPGA-PDN limits persist. |
| Fabrication/assembly | Accept the four finished plated slots, connector retention/tail seating, fine-pitch packages and applicable mask/edge constraints. | GCT gives 1.60 mm nominal tails, with the drawing's general two-decimal tolerance ±0.25 mm and no qualified PCB-thickness range. A 1.59 mm ±10% board can leave them recessed; no bottom fillet is promised. |

The **unplug/brownout test has a specific reason**: TPS25947 section 7.3.11 says PG has no active pull-down when its input is completely unpowered. Downstream AON capacitors can briefly retain 3.3 V while protected VBUS collapses. The selected 100 kΩ PG pull-up minimizes the sink demand, as TI recommends, but does not constitute a guaranteed unpowered-low voltage. Measure PG and U2.EN while ramping/removing VBUS with representative stored energy and verify output shutdown/rail order. MCU firmware must reject invalid VBUS and PG, lower FPGA_PWR_EN/MUX_EN/JTAG_OE, and deliberately re-arm a latched fault. This is a bounded qualification item; it is not evidence that the normal powered PG connection is wrong. [TI TPS25947 section 7.3.11](https://www.ti.com/lit/ds/symlink/tps25947.pdf).

No orders were placed. No bitstream, receiver adapter, electrically operating board, certified USB mode or manufacturing release is claimed by these checks.
