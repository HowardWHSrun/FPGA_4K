# Gerald's ASIC answers — 26 September 2026

Source: Howard relayed these answers from Gerald in this conversation. The wording below is retained verbatim; interpretations and PCB changes are separate.

## Relayed answers

> 1. AC_IN will need to be an analog voltage from 0-1.5V. The imp test is 1.5V also. Everything is 1.5
> 2. firstly you send the spi, then reset the digital and the analog and then start sending the clock for the recording.
> 3. each chip will have its individual clock, thats how Jiaao is writing the code. The data will be read in the falling edge of clk. (btw it is those answers from gerald )

## What changes in the design

- **AC_IN is an analog signal, 0–1.5 V.** The previous direct FPGA-GPIO proposal is invalid. Remove the U1.A13 GPIO connection; reserve the analog interface separately until its source and required behavior are defined. AC_IN was not copper-routed in the checked 49-signal checkpoint. No DAC or external analog source is currently implemented by that checkpoint.
- **Nominal ASIC interface voltage is 1.5 V.** This supports the intended 1.5 V ASIC I/O banks. It does not change the FPGA's separate core and auxiliary supply requirements, and does not specify thresholds, drive/loading limits or unpowered behavior.
- **Recording startup order:** send SPI configuration, then reset the digital and analog sections, then start the recording clock. The answer does not establish reset polarity, pulse widths, settling delays, SPI values or an ordering between the two resets.
- **Sample data on the falling edge of the associated chip clock.** Implement this in the capture design after identifying the exact clock source and timing. Do not invent setup/hold or input-delay numbers from the edge choice alone.
- **Each chip has an individual clock.** The current draft already has eight returned chip clocks and four outgoing recording-clock nets. Howard authorized engineering judgment for this ambiguity; the selected interpretation is described below.

## Working choices authorized by Howard

Howard replied "make your best judgement" for the clock question and "your best judgement" for IMP_TST. These choices allow design work to proceed; they are engineering assumptions, not additional statements from Gerald.

1. **Use the eight returned ASIC clocks for independent falling-edge capture.** Retain four outgoing recording-clock nets, one per board, as explicitly listed in Gerald's earlier pin count. This fits the new statement's reference to Jiaao's data-reading code without silently adding four connector signals.
2. **Treat IMP_TST provisionally as a digital 0/1.5 V test control.** Gerald explicitly described AC_IN as analog, while describing IMP_TST only by its 1.5 V level. This is the basis for the choice, not proof of its signal type. Its active polarity and safe startup state remain to be established from the ASIC design or a controlled bench test.
3. **Locate the AC_IN analog source on the routing/ASIC side.** Keep the FPGA board's J5.46 contact reserved for the analog interface with no FPGA GPIO connection. The current board does not generate this voltage. An external source remains necessary if the ASIC operating/test mode requires it.

This gives **116 proposed FPGA connections (88 returns + 28 digital controls, including the IMP_TST assumption) plus one separate analog contact** within the historical 117-signal list. If the clock interpretation changes, the connector budget must be recalculated. An FPGA-controlled analog source would require suitable external circuitry and specifications for voltage accuracy, bandwidth and loading.

## Status boundary

These answers narrow the ASIC requirements; they do not complete the FPGA power network, missing PCB routes, firmware timing checks, cable power source or bench validation. The 117-contact historical proposal must no longer be described as 117 validated FPGA digital connections. Preserve its original CSV as history and use the revised analog-aware assignment for subsequent CAD and website updates.
