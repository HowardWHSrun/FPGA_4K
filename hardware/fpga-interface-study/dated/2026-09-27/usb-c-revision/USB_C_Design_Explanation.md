# What changes with USB-C

The board still uses one XC7A100T and the two 60-contact ASIC connectors. USB-C replaces the cable interface. It does not replace the FPGA, add a direct USB 3 acquisition bridge, or turn the XEM8310’s PC-facing USB port into a host.

## The three paths in the cable

| Path | Purpose | Circuit on the FPGA board |
|---|---|---|
| VBUS and CC | Detect attachment, agree on power and monitor the cable | STM32 UCPD controller, CC protection, independent 3.3 V supply and protected main-power switch |
| USB 2 D+/D− | Programming, status and return commands | Real USB device firmware in the controller; level translation to the FPGA’s 1.8 V JTAG pins |
| Four high-speed differential pairs | Proposed three recording-data lanes plus a forwarded clock | Orientation switch, ESD protection and eight previously reserved FPGA bank-16 pins |

The four high-speed pairs remain disconnected until the matching receiver adapter negotiates the custom mode. A USB 2-only cable cannot carry those pairs. SBU1 and SBU2 are intentionally unused and labeled accordingly.

## Why the new parts are needed

- **USB-C receptacle:** carries power and the signals in a reversible connector. All four VBUS contacts, four ground contacts and every physical shell land must be connected.
- **Control microcontroller:** negotiates power and cable orientation, enables the high-speed switch and bridges USB control traffic to JTAG. It operates before the main FPGA is powered or configured.
- **Always-on 3.3 V regulator:** lets that controller start from the initial 5 V attachment voltage. This prevents a circular dependency in which the FPGA must already run before power can be negotiated.
- **CC protection and power FET:** protect the controller’s lower-voltage configuration-channel pins and provide the manufacturer-supported protected power-entry arrangement.
- **Main eFuse:** keeps the existing input bulk capacitance behind controlled startup, trips and latches off on overload, and blocks reverse current. Its power-good signal delays the core regulator until the main input has risen. A two-resistor divider holds the regulator below its off threshold even at the specified worst-case unpowered PG voltage.
- **Orientation switch:** the selected TMUXHS4446 has a specified powered-off data-pin leakage limit. It maps the four differential pairs correctly in either connector orientation and disconnects them when the custom data mode is inactive.
- **1.8 V JTAG translator:** prevents the 3.3 V controller from directly driving the FPGA’s 1.8 V programming pins.
- **ESD arrays, bypass capacitors and bias resistors:** protect the exposed data pins, supply local switching current and hold power/data drivers off while the controller resets.
- **Five fixture contacts:** provide initial controller programming and recovery through SWD. These are bare copper contacts, with no fitted header. A blank or damaged controller application must not leave the board unrecoverable.

## How the layout fits

The target outline remains **33 × 36 mm**, with the 15 × 15 mm FPGA and both ASIC connectors retained. The selected 64 Mbit, 4 × 3 mm USON flash frees space for the power-entry circuit. It is a different flash generation with half the earlier capacity; a single XC7A100T image fits by bit count, while programming and startup still need testing. Its central exposed metal is left unsoldered, with a component-side copper and through-via keepout. Selected control bypass capacitors use manufacturer-specified compact lands; local capacitors are not simply deleted to create space. The revised board has 178 fitted components and a five-contact bare-copper recovery fixture. These are board-outline dimensions; the USB-C body protrusion and mating assembly need separate clearance checks. Fit is separate from route continuity and assembly acceptance.

C26 retains a nominal 4.7 µF local core bypass in a smaller TDK 0603 package, freeing two conventional BGA escape vias. The selected 16 V X5R part replaces the former 10 V X7R 0805 part. Its typical curve gives about 4.45 µF at the 1.0 V core rail; this is not a guaranteed minimum. Its 85 °C temperature class, FPGA power-distribution behavior and assembly still require review. The previous micro-HDMI design keeps its original part.

C201 uses the exact Yageo 100 nF, 50 V X7R 0402 part listed by ST for the USB-C protection chip’s charge pump. It replaces the earlier 0603 capacitor while retaining the same two connections. The smaller package frees the bank-16 FPGA escapes; it still needs final charge-pump and assembly testing.

## Expected startup order

1. Attach the cable: the low-power controller supply starts from 5 V; FPGA main power, JTAG outputs and high-speed switch remain off.
2. Run verified controller firmware. Request a supported 9 V PD contract; a 5 V fallback requires an explicitly adequate source-current advertisement and budget.
3. Enable the protected main input and wait for the eFuse’s power-good output. Retain the existing core → auxiliary → I/O rail sequence.
4. Once 1.8 V is valid, permit FPGA JTAG and load a known FPGA image.
5. Enter the proposed custom cable mode, once both sides implement and agree to it with the receiver adapter, set orientation, and start the recording link only after both ends are ready.
6. For ASIC acquisition, use the confirmed high-level SPI → digital/analog reset → recording-clock order. Detailed words, pulse widths and clock assignments still require the ASIC and firmware contract.

This is the intended behavior to implement and test. A schematic or copper route does not establish that the firmware already performs it.

## What USB-C does not finish

The XEM8310 needs a matching expansion-board adapter that supplies power, negotiates the cable mode, receives the differential data and hosts the USB control device. Its existing USB connection remains the path to the PC. The complete receiver adapter, controller firmware, capture timing, cable signal integrity, power/thermal validation and manufacturing/assembly acceptance remain separate release requirements. AC_IN is still a separate external 0–1.5 V analog source requirement; it is not tied to an FPGA GPIO.

The current revision’s measured PCB/ERC/DRC status is reported separately. Earlier micro-HDMI zero-error results do not certify this USB-C revision.
