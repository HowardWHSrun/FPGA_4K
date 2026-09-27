# What we need for first power-up and ASIC capture

26 September 2026 · 33 × 36 mm FPGA board · receiver/MCU deferred

**The first milestone can be FPGA power-up, JTAG programming and a short ASIC recording capture.** The XEM8310 link is not required for that milestone. A small capture can be stored in FPGA block RAM or an Integrated Logic Analyzer (ILA), then inspected through JTAG. This requires a working capture bitstream and timing constraints; JTAG alone does not capture ASIC data. AMD documents this debug path in [UG908](https://docs.amd.com/r/2024.1-English/ug908-vivado-programming-debugging/Using-Vivado-Logic-Analyzer-to-Debug-the-Design).

## The information we still need from the ASIC/routing-board team

Gerald's answers now establish nominal 1.5 V ASIC signaling, analog AC_IN, the SPI → reset → recording-clock sequence, and falling-edge sampling. [His relayed wording and Howard-authorized engineering assumptions](Gerald_Answers_2026-09-26.md) are recorded separately. The PCB designer owns finishing the FPGA power circuit and copper; those jobs do not require waiting for Gerald.

| Ask for this | Why it is needed | Owner |
|---|---|---|
| **Current ASIC/carrier schematic and mating contact map**, identifying the physical eight chips and which chip shares each clock/reset/SPI connection | A correct FPGA ball map can still connect to the wrong physical ASIC or a mirrored connector | Gerald + routing-board designer |
| **Detailed digital pad limits:** thresholds, absolute limits, loading and behavior when either board is unpowered | Nominal 1.5 V is confirmed by Gerald's relayed answer; it is not a complete electrical specification. IMP_TST is provisionally treated as digital under Howard's instruction | ASIC designer / FPGA integration |
| **Recording timing margins:** returned-clock frequency/tolerance, data-to-clock minimum/maximum delay and READ/SYNC timing | Falling-edge sampling is now specified. Real input-delay constraints still need timing margins, ideally from Jiaao's current code/constraints and ASIC timing data | ASIC / FPGA designer |
| **Startup implementation details:** reset polarity and pulse/settling times, SPI values, and unused stimulation controls' inactive states | The accepted order is SPI, then digital/analog resets, then recording clock. Exact waveforms and configuration values are still needed | Existing acquisition design / FPGA implementation |
| **Carrier/ASIC supply arrangement and expected current per rail**, with the required ground-return connection | The two mezzanine headers do not currently allocate ASIC power contacts. The FPGA input supply is not automatically the ASIC supply | Routing-board designer |

For a first raw waveform test, the full electrode map and gain calibration can follow later. For a demonstration that claims correct channel values, also obtain the corrected channel map, ADC numeric coding and a known test-pattern trace. The tutorial’s DATA1 matrix contains duplicated/missing channel labels, so those identities should not be invented.

## Working bench assumptions — provisional choices

- **Power the FPGA board from a regulated, current-limited bench supply through a dedicated breakout for the custom J4 cable map.** Use the board’s nominal 12 V input plan after the converter review. Choose the current limit from the FPGA power estimate and verified startup demand; no arbitrary limit is approved here. The breakout is a fixture, not an additional connector on the compact PCB.
- **Use a JTAG adapter compatible with the board’s 1.8 V programming interface.** In the frozen J4 map, pin 19 is `LINK_12V`, pin 1 is `VCCAUX_1V8`, pins 2/15/17/18 are TMS/TDI/TCK/TDO, and ground has separate contacts. Treat pin 1 as a voltage reference where appropriate, not as a supply-output invitation. Verify the fixture from both mating views before connection; this is not an HDMI electrical interface.
- **Begin with recording only and one ASIC.** AC_IN uses an analog source on the routing/ASIC side; the FPGA board does not generate it. IMP_TST is provisionally a 0/1.5 V digital test control, with its inactive polarity still to establish. No stimulation program or continuous-streaming claim is included. High impedance alone does not establish an inactive ASIC state.
- **Use eight returned-clock capture domains, each sampling on its falling edge, and retain four outgoing board clocks.** This is the chosen interpretation of Gerald's statement about each chip having its own clock, consistent with his earlier four-board clock count.
- **Use the tutorial’s 32 MHz, 1024-cycle frame, 16 READ intervals and 16-padding/48-payload-cycle pattern as a decoder hypothesis.** Preserve raw captured bits so that the hypothesis can be checked. Falling-edge capture is specified, but its timing margin and the final bit/channel map remain unverified. See the [review of Gerald’s slides](https://howardwhsrun.github.io/FPGA_4K/hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md).
- **Use finite captures with an explicit “capture full” indication.** JTAG readout may be slow, and block RAM is finite. Stopping capture is acceptable for this test; stopping the ASIC clock is not assumed permissible.

## The actual bring-up sequence

1. Complete and verify FPGA power/ground routing and required pin corrections. Check the assembled board for supply shorts before power. Power it with the ASIC carrier disconnected; measure rail levels, startup and heating.
2. Confirm JTAG device identification and load a minimal internal-clock counter/debug design. Confirm the 32 MHz reference is running. No ASIC controls need to toggle for this check.
3. Verify one capture bank with a known compatible test signal if available; establish the capture buffer/JTAG workflow.
4. Attach one approved, powered ASIC/carrier; send the specified SPI configuration, reset the digital and analog sections, then start the recording clock. Capture raw DATA/READ/SYNC on the falling edge of that chip's returned clock. Compare framing and a known pattern before decoding samples.
5. Expand to eight ASICs only after each returned-clock domain and clock-domain transfer has been checked. Record loss/overflow and frame errors; a plausible waveform is not by itself evidence of correct acquisition.

The historical 117-signal list now comprises **116 proposed FPGA connections plus a separate analog AC_IN contact**. It does not replace ASIC startup firmware, a legal eight-clock FPGA implementation, input timing or power integrity. [AMD UG903 explains why input delays must reference the actual external clock/data relationship](https://docs.amd.com/r/en-US/ug903-vivado-using-constraints/Input-Delay).

## Pin-map template prepared for the FPGA developer

The revised template must reserve **116 FPGA pins**, with AC_IN absent. IMP_TST remains a documented digital-signal assumption. The previous 117-pin template is historical and must not be used as an active build input. AMD lists LVCMOS15 for 7-series HR banks in [UG471](https://docs.amd.com/v/u/en-US/ug471_7Series_SelectIO).

The review template must not invent input/output timing, drive strengths or timing exceptions. XDC does not enforce high impedance or define RTL direction; a pin template is not a working bitstream. Do not suppress unconstrained-port checks to force a build. Routing and template validation belong to their current audit files, not this requirements page.
