# Current questions: FPGA PCB dependencies

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Updated 18 September 2026 from Howard's edits. Zitong uses she/her. Micro-HDMI remains selected. Connector mapping can be discussed next time; connector height, mounts and clearances are not fixed.

## Message to Gerald

Hey Gerald, thanks for confirming the 1.5 V reference and 32 MHz ASIC clock. The remaining ASIC-interface details for the FPGA PCB are:

1. **Electrical limits and timing:** Could you point me to the allowed pin-voltage levels and clock/data timing requirements, including which clock edge the data changes on and the setup/hold limits?
2. **Control connections:** Which clocks, resets, programming and stimulation-control signals can be shared across ASICs, and which need independent connections? Are specific pull-up/down or startup states required?

We can confirm the carrier version and routing-to-FPGA pin map with Zitong at the next discussion. I will coordinate the board-to-board power handoff with her.

## Message to Zitong

Hi Zitong, could we align on the routing-board/FPGA-board power connection?

1. Which ASIC supplies will be generated on your routing board, and are any already generated on the carriers?
2. If the FPGA board supplies the routing board, what input voltage, maximum continuous/peak current and startup requirements should I design for? Or will the routing board have a separate power input?
3. Gerald mentioned a routing-board parts list. Do you have the current list or schematic we should use? I have a provisional list from the older LDO reference that we can compare with it.

We can agree on the connector pin map and mechanical arrangement together at our next discussion.

## Ownership and deferred work

- Gerald / ASIC designer: source ASIC voltage, timing, supply and startup requirements; current revision identity.
- Zitong + Howard: decide power generation and feed direction, rail/current handoff, connector contact map, grounding, physical interfaces and regulator placement.
- Howard + receiving-interface designer: define the selected micro-HDMI link pinout, signaling, termination and receiver circuit. This is not implicitly assigned to Gerald.
- Mechanical dimensions are flexible, not an unanswered question about an already-fixed drawing.
- Recording-buffer requirement remains a design dependency; it is deferred from this short message, not resolved or deleted from the FPGA design.

See [the provisional routing-board list](2026-09-18-routing-parts.md).
