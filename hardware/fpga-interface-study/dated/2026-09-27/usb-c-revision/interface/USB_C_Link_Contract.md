# USB-C headboard link — 27 September 2026

This is the selected **circuit architecture for the USB-C revision**, not a working USB/FPGA implementation. It replaces the earlier custom micro-HDMI port. The headboard retains its 116 digital ASIC signals and separate AC_IN analog contact. The proposed four differential link pairs use only the eight previously reserved bank-16 balls; no ASIC signal is displaced.

## What the cable carries

| Path | Function | Implementation boundary |
|---|---|---|
| VBUS/GND | Negotiated power from receiver adapter to headboard | Protected sink; always-on controller supply precedes the switched FPGA supply. See the power-owner handoff. |
| CC1/CC2 | Attach, orientation, power delivery and custom Alternate Mode negotiation | STM32G0B1 UCPD plus TCPP01 protection. This needs firmware. |
| D+/D− | Real USB 2.0 Full Speed control and programming | STM32 USB device; not raw JTAG signals on USB pins. |
| Four SuperSpeed pairs | Three forward LVDS data lanes and a forwarded LVDS clock | Custom negotiated mode, not USB 3.0 signaling; serializer/receiver firmware and timing are unfinished. |
| SBU1/SBU2 | Unused | Explicit NC at the headboard connector and mux; no hidden clock or JTAG use. |

Use a **passive, full-featured USB-C to USB-C cable**; a charging/USB2-only cable omits the required pairs. Start cable characterization at a provisional 0.5 m maximum. That length is an engineering test assumption, not a certified limit. Active USB/Thunderbolt cables are outside this initial contract. Nothing may drive the high-speed pairs before a supported mode is entered. A normal PC or charger must see a safe USB2/control or power-only device, without proprietary voltage on unnegotiated signal lanes.

The USB-IF functional specification requires structured VDM discovery and mode entry for Alternate Mode implementations. Use a legitimately assigned institutional/vendor SVID and USB VID/PID; this package deliberately invents none. Implement discovery, Enter/Exit Mode, orientation handling, detach, hard-reset and unsupported-mode behavior. A protocol/USB compliance review must decide the required Billboard behavior. [USB-IF functional test specification](https://www.usb.org/sites/default/files/USB%20Type%20C%20Functional%20Test%20Specification%202024%2003%2003.pdf).

## Headboard circuit

[USB_C_Interface_Components.json](USB_C_Interface_Components.json) is the complete component/pin input for integration. It includes:

- **U210 STM32G0B1KEU6N**: 5×5 mm UFQFPN32, the **N** pinout with UCPD CC and dead-battery pins, a genuine USB device interface, and GPIO-driven JTAG. Both MCU supplies use always-on 3.3 V. Its USB device clock uses the supported HSI48/CRS path. No MCU crystal or USB external pull-up is added in this proposal. Preserve SWD, reset, and the factory-programmed option-byte profile. Pin 16 and six other unused GPIOs are explicit NC; unused GPIOs must remain analog/disabled in firmware. [ST DS13560, Fig. 4/Table 12 and USB/UCPD sections](https://www.st.com/resource/en/datasheet/stm32g0b1me.pdf).
- **U211 TMUXHS4446RETR**: 3×6 mm four-pair orientation switch with explicit powered-off high-speed I/O leakage specification. MODE0, MODE1, A0 and CONF2 are grounded; CONF1/CONF0 reuse EN/POL with low defaults. Spare USB3/SBU switch terminals remain NC. The proposed paths are DC-coupled within its stated voltage/current ranges; full-channel validation remains pending. See the [selection and exact pin review](TMUXHS4446_Power_Off_Review.md).
- **U212 TXU0304RUTR**: three MCU→FPGA paths for TCK/TMS/TDI and one FPGA→MCU TDO path. A-side supply is 3.3 V, B-side is existing 1.8 V. Default OE is low; enable only after main-power and 1.8 V checks. Its supply-disconnect isolation avoids driving the unpowered FPGA through JTAG. R234–236 add source damping; existing R118 remains the FPGA TDO source resistor. [TI TXU0304, Table 6-1 and §§9.3.4–9.3.7](https://www.ti.com/lit/ds/symlink/txu0304.pdf).
- **U213/U214 TPD4E05U06DQAR** protect the eight exposed differential conductors; **U215 TPD2EUSB30DRTR** protects USB2. These are low-capacitance ESD devices, not sustained overvoltage disconnect switches. Final cable/ESD testing remains necessary. Place them close to the connector with short ground returns. U213/U214 use external straight-through copper 10–1, 9–2, 7–4, 6–5: pins 10/9/7/6 are internally unbonded routing lands, not internal connections. [TI SS protection](https://www.ti.com/lit/ds/symlink/tpd4e05u06.pdf), [TI USB2 protection](https://www.ti.com/lit/ds/symlink/tpd2eusb30.pdf).
- **J210** is five copper-only fixture pads for 3.3 V reference, GND, SWDIO, SWCLK and NRST. It is excluded from purchase and placement BOMs. This is the independent initial-MCU programming/recovery path; no header is fitted. The fixture uses the board outline for alignment. The programmer senses VTREF and must not back-power the board.

Power-controller names are deliberately shared with the power-owner JSON: USB_AON_3V3, USB_CC1/2 (protected side), TCPP_DB_N, VBUS_SENSE, FPGA_PWR_EN, FPGA_PWR_GOOD and CC_FAULT_N. There is **no PWR_FAULT_N** because the selected eFuse variant has true PG instead. Monitor loss of PG after enabling and deliberately turn the load off. U210 PA1 monitors existing 1.8 V through R233=10 kΩ; use a sufficiently long ADC acquisition interval. This monitor and PG do not prove that all FPGA rails meet startup/ripple limits.

The always-on budget reserves **50 mA at 3.3 V** for controller, mux, translation, protection bias and margin. It is a design allowance, not a measured current. ST's 64 MHz core figure excludes enabled peripherals and external switching loads; TI's mux maximum active current is 0.53 mA. The interface adds roughly 11 µF nominal of downstream 3.3 V bypass/bulk; the power design must include its startup charging, not just raw-VBUS capacitance. C231 and C233 remain separate nominal 4.7 µF capacitors (TDK C1608X5R1C475K080AC); the manufacturer’s typical DC-bias curve gives approximately 2.5069 µF per part at 3.3 V. That curve is not a minimum across tolerance and temperature, and 9.4 µF must not be presented as their effective combined capacitance. Both use the reviewed 0.70 × 0.70 mm TDK reflow lands; placement and startup/transient performance still need validation.

## Dead-battery attachment and handoff

The selected TCPP01 circuit supplies the unpowered dead-battery termination. **U210 DBCC1/PA9 (pin 19) and DBCC2/PA10 (pin 21) are tied to GND**, exactly as ST DS12900 Rev 7 Figure 4 shows. The MCU-only AN5225 arrangement that ties DBCC to CC must not be substituted. PA9/PA10 remain analog/high impedance in application firmware; do not drive these grounded pins. TCPP holds its CC switches open while its own dead-battery clamp is active, isolating the controller-side CC pins.

At reset, keep TCPP_DB_N low/high impedance, main power disabled, and both mux and JTAG OE low. Bootstrap VBUS powers the LDO and controller. Configure UCPD1 as a sink and enable its normal Rd on both CC pins while TCPP still isolates them. Apply the STM32G0 UCPD1 dead-battery-disable strobe only after its sink analog state is configured; on G0 this is the SYSCFG UCPD1_STROBE mechanism, not a copied G4 PWR register name. **Only after the controller termination is active may firmware raise TCPP_DB_N**, which removes TCPP's dead-battery clamp and closes its CC protection switches. This avoids relying on two parallel external Rd paths or briefly advertising no sink. Reset/watchdog must return TCPP_DB_N low before reinitialization. This sequence is a firmware requirement; no working implementation is supplied here. [ST TCPP01 Fig. 4 and §6.5](https://www.st.com/resource/en/datasheet/tcpp01-m12.pdf), [ST STM32G0 low-level system driver](https://github.com/STMicroelectronics/stm32g0xx-hal-driver/blob/master/Inc/stm32g0xx_ll_system.h).

## Four pair assignment and orientation

| Logical path | U1 positive / negative | TMUXHS4446 local pair and pins | Bank |
|---|---|---|---|
| LINK_D0 | C9 / B9 | DP0: 39 / 40 | 16, 2.5 V |
| LINK_D1 | B8 / A8 | DP1: 2 / 3 | 16, 2.5 V |
| LINK_D2 | C11 / C10 | DP2: 5 / 6 | 16, 2.5 V |
| LINK_CLK | A10 / A9 | DP3: 8 / 9 | 16, 2.5 V |

With MODE0=0, CONF2=0 and CONF1/EN=1, TI Table 6-3 gives:

| CONF0/POL | DP0 | DP1 | DP2 | DP3 |
|---|---|---|---|---|
| L | CRX2 | CTX2 | CTX1 | CRX1 |
| H | CRX1 | CTX1 | CTX2 | CRX2 |

Connector-side CRX1 is B11/B10; CTX1 is A2/A3; CTX2 is B2/B3; CRX2 is A11/A10, positive/negative respectively. CONF1/EN=0 selects open paths (000 powered down or 001 powered); at zero supply the separate failsafe I/O specification applies. The receiver must account for the actual standard cable pair crossover and its own orientation; do not assume equal mux-lane letters at each end are connected. Verify all four plug-orientation combinations by continuity and receiver training before freezing receiver constraints.

Use for custom DC LVDS is an engineering inference from the passive switch’s voltage and current limits, rather than a validated USB/DP application. Its 0–1.8 V common-mode and 1.8 Vpp differential range accommodates the **nominal** LVDS_25 envelope, which AMD specifies at 1.0–1.425 V common-mode and up to ±600 mV differential into 100 Ω. The mux supplies no common-mode bias: the transmitting FPGA provides it. Do not insert AC coupling without separately designing receiver bias and run-length behavior. Terminate at the receiver, normally once at approximately 100 Ω differential; do not add a second headboard termination. Two muxes, cable impedance/loss, ESD capacitance and return discontinuities require an eye/BER and common-mode analysis. Component bandwidth alone does not establish a reliable system rate. [AMD DS181 Table 11](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

## Data-rate boundary

The project discussion gives an approximate **2 Gbit/s aggregate data planning target**. This is not a measured payload rate or a complete ASIC timing specification. Reverse stimulation commands are also required; the discussion of delays of a few tens of milliseconds is planning context, not a verified worst-case latency requirement or guarantee.

As a conservative planning scenario, sampling every one of the 80 non-clock raw ASIC input bits on every 32 MHz edge would require **2.56 Gbit/s** before framing. This is an upper-bound hypothesis, not a measured stream requirement.

AMD's -1 grade DDR OSERDES LVDS figure is **950 Mbit/s per pair**; it is not a guarantee for this cable and layout. A proposed 3×900 Mbit/s link would carry 2.618 Gbit/s after 64b/66b overhead, leaving only 58.2 Mbit/s (2.27% of the hypothesized raw demand) for packet overhead/training/idles. Three lanes with 8b/10b at that rate are insufficient for that scenario. Thus **900 Mbit/s and 64b/66b are not frozen or claimed sufficient**. Actual ASIC valid-data rate, packet overhead, elastic buffers, lane training, forwarded-clock frequency and error handling must determine the implemented rate. A 450 MHz serializer clock is also subject to actual MMCM/clock-buffer limits and full placement/timing proof. [AMD DS181 Table 15](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

## Receiver adapter contract

The XEM8310 is an FPGA/USB module. Its existing USB3 port connects it to the PC; it is **not** an assumed USB host for the new headboard. A custom receiver adapter must supply these functions:

1. A USB-PD **source** and a real USB2 **host** controller. A larger STM32G0B1 N-package plus an accurate host clock is a practical candidate, not a finished receiver BOM. Its firmware forwards commands/status between the XEM FPGA through SPI and the headboard USB2 device.
2. The matching mode-negotiated orientation switch and four LVDS receive channels. Use XEM MC1 bank 64 with VIO1 set to 1.8 V if selecting its internal LVDS termination, and a clock-capable pair for LINK_CLK. Final specific XEM balls/contact order and timing must be generated from the official pin reference. MC3 bank 67 is fixed at 1.2 V and is not interchangeable with this choice.
3. An adequately rated external source, a controlled 5 V attach state and negotiated higher operating voltage where requested, protection and cable-current enforcement. Do not assume XEM's USB connector or GPIO supplies can provide this power.
4. XEM HDL for lane training, deserialization, framing/CRC, buffering, backpressure/overflow accounting and FrontPanel transfer to the PC. Reverse commands travel via USB2/JTAG mailbox, so no fifth differential pair is needed. JTAG mailbox latency is not a real-time stimulation guarantee.

These are receiver requirements, not receiver CAD delivered in this headboard revision. [Opal Kelly expansion connector/voltage documentation](https://docs.opalkelly.com/xem8310/expansion-connectors/).

## Startup and recovery sequence to implement

- With no controller firmware, dead-battery termination allows initial default 5 V attachment and the protected bootstrap supply powers the controller. Main FPGA power, JTAG translation and the lane mux remain disabled by hardware defaults. Factory SWD can program or recover the MCU.
- With valid MCU firmware, enumerate the genuine USB2 control interface, negotiate adequate source power, validate VBUS, enable the slew-controlled, circuit-breaker-protected main path, check PG and 1.8 V, then enable JTAG translation. The FPGA may still be blank.
- Stream JTAG programming chunks through the MCU; the whole FPGA image does not need to fit MCU flash/RAM. Check IDCODE/configuration status. Programming the external boot flash requires an implemented FPGA-assisted or supported JTAG flash algorithm, not merely a TCK waveform.
- Enter the agreed custom mode and configure both orientation switches. Keep FPGA data outputs inactive until receiver-ready negotiation, configuration and training succeed. Expose stop/start and error status through the USB2/BSCAN command channel.
- On detach, protocol failure, CC fault, invalid power or watchdog recovery, disable the mux/JTAG outputs and shut down main power as appropriate. Reset recovery must not depend on a configured 100T. MCU ROM USB-DFU is secondary convenience only; it is not this design's sole recovery path.

Firmware must be implemented and tested for both ends; no placeholder program or bitstream is represented as functional. The original ASIC SPI words, reset pulse widths, analog controls and falling-edge capture timing remain a separate ASIC firmware contract.

## Routing and bitstream constraint

Use the [paired routing contract](Differential_Routing_Contract.md). All eight bank 16 link pins must use LVDS_25 or remain inactive/high impedance with no pull-up; never drive LVCMOS25 because the mux absolute input limit is 2.4 V. Preserve R114 1 kΩ to 1.8 V/PUDC_B to disable configuration-time pullups. The paired route, timing and receiver proof remains required.
