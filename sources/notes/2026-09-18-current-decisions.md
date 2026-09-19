# Current FPGA PCB decisions

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Updated 18 September 2026 after Howard selected micro-HDMI and supplied Gerald's voltage/clock confirmation.

## Accepted direction

- One custom XC7A200T FPGA board serving eight ASICs across four carriers.
- Carrier boards -> routing/power board -> FPGA PCB -> micro-HDMI cable -> receiver interface for KR260 -> PC.
- Micro-HDMI is the selected connector direction. Exact connector part, cable, electrical standard, protocol and receiver adapter are not yet frozen.
- Nexys Video is development/test equipment only, not a component mounted on the custom PCB.
- Questions for Gerald are limited to information that changes FPGA PCB components, pins, supplies, connectors or layout.

## Gerald's voltage and clock confirmation

Gerald's supplied 6:09 PM reply states: "The reference voltage is 1.5V and the clock should 32MHz".

- **Confirmed nominal reference voltage: 1.5 V**, in response to the ASIC-interface question. Retain the original wording; it does not supply a complete pin-level electrical specification or redefine every ASIC/FPGA supply rail.
- **Confirmed intended ASIC clock: 32 MHz.** This specifies the ASIC clock target; it does not require the FPGA's physical reference oscillator itself to be 32 MHz.
- Do not ask Gerald again to confirm these two nominal values. Remaining electrical evidence is the allowed voltage range/input-output thresholds and clock/data timing limits, plus shared-control and startup requirements.
- The statement specifies the intended clock, not a measured full-rate acquisition result. The older reference code's 16 MHz drive remains a porting/test item.

Source: [technical follow-up summary](../../docs/meetings/2026-09-18-follow-up.md).

## Changes to the previous USB proposal

The following USB-path parts are removed from the current proposed custom-board BOM:

- 1 FX3 CYUSB3014 controller.
- 1 USB3 Type-B receptacle and its USB-specific interface components.
- 1 FX3 19.2 MHz crystal and its 2 load capacitors.
- FX3 boot memory/straps/reset support that existed only for that controller.
- 1 FX3-only TPS62160 1.2 V converter and its dedicated support components, including 1 inductor. A selected high-speed receiver/transmitter implementation may require a new supply design; removing this converter does not establish that the entire system needs no 1.2 V rail.
- USB-C CC/orientation parts are not part of this micro-HDMI selection.

Include 1 micro-HDMI receptacle on the FPGA PCB and 1 cable per proposed link. Exact connector orientation, pin assignment, number of active data pairs, clock scheme, command return path, protection, termination and any interface ICs must follow the selected electrical implementation. Do not equate choosing the connector with choosing standard HDMI video/TMDS or a validated custom LVDS link.

FPGA configuration flash, JTAG access, an appropriate FPGA reference clock, FPGA supplies/decoupling, routing-board connection and the recording-buffer requirement remain. The previously proposed 3.3 V GPIF bank allocation, 79-capacitor grouping, complete converter/passive quantities and 13.12 W provisioned envelope were tied to the USB proposal and must be reconciled with the new bank/power plan. The package-specific UG483 capacitor recommendations remain useful source data.

## Receiver and bandwidth work

KR260 has no native HDMI input. Its actual receiving port/adapter and supported electrical interface must be selected together with the custom board pinout; the cable choice alone does not complete that connection. Source: [AMD KR260 interfaces](https://docs.amd.com/r/en-US/ug1092-kr260-starter-kit/Interfaces).

The recording-rate calculations still apply: 192 MB/s packed 12-bit payload, 256 MB/s with 16-bit sample words, and approximately 264 MB/s using the previous framing ratio. The custom link must additionally budget its own encoding/control overhead and selected margin. No lane rate or number of active pairs is finalized by this decision.

If the team already has a receiver schematic/pinout, obtain it before choosing the transmitter circuit. Otherwise, Howard can define the two ends with the receiver designer and verify the physical path and bandwidth; this does not require Gerald to guarantee generic interface performance.

## Document status

A separate XC7A200T area study (local archive: `XC7A200T_Area_Study/README.md`) now places candidate/proxy footprints on a 60 x 70 mm outline. It includes two proposed routing connectors, one micro-HDMI, one separate power connector and JTAG programming pads. This is a physical-fit experiment with no assigned nets or routing; its quantities, connector topology and outline are not new accepted electrical requirements.

The earlier `output/pdf/FPGA_System_Design_and_Parts_Guide.pdf` contains the superseded USB/FX3 proposal and is not the current link-specific BOM. It has not been regenerated by this decision note. The earlier 24-question PDF is a broad reference; use [the current PCB-only questions](2026-09-18-current-questions.md) for the next message.
