# 2 October 2026 — backup adapter and main FPGA review

Participants: Howard, Zitong and Gerald. This is a concise summary of the conversation supplied by Howard, not a verbatim transcript. The private conversation is not published.

## Agreed work order

1. Build the one-chip backup first, using Gerald's existing LDO/routing board and existing single-chip setup. Do not design a new LDO or full eight-chip routing board for the first test.
2. Design a rigid adapter from the existing LDO board to XEM8305, replacing the SpikeGadgets FPGA layer. Howard subsequently confirmed J1 and J19 as the two adapter-facing connectors. No interboard cable is proposed for this first version.
3. Keep the custom FPGA board as the primary architecture. Continue reviewing its V11 schematic and component explanations while the backup is prepared. Fabricate it only after schematic, routing and release checks are complete.
4. After the backup returns, test one chip and develop the eight-chip version while the main FPGA board is being fabricated. A successful one-chip test does not establish eight-chip performance.

## Main FPGA direction

- Use a 35T candidate in the CSG325 package rather than the previous 25T candidate, subject to the exact part number, speed/temperature grade and procurement confirmation. Stock was discussed; it has not been independently verified for this record.
- Plan one 125 MHz differential LVDS oscillator. Check the actual receiver pin type, electrical compatibility, clock generation and Vivado timing. Phase jitter and cycle-to-cycle jitter are different specifications.
- Keep the 128 Mbit boot-flash proposal: 16 MB, not 128 MB. Confirm the exact flash, configuration-bank voltage and translation requirements from both datasheets.
- Review the main schematic over the weekend of 3–4 October and bring the connector/pinout proposal to the next review on Tuesday, 6 October. Component and regulator choices remain subject to review.

## Control link and stimulation

Review the reverse FPGA command protocol with Jiao. A serialized command stream may carry configuration data, but the local FPGA must still generate the required ASIC clocks, data, latches and a defined stimulation trigger. Verify trigger timing and safe startup/loss-of-link behavior. The meeting did not finalize micro-HDMI pin 1's new use or the programming/reference arrangement.

## Technical audit after the meeting

These findings come from CAD and manufacturer documentation, not statements that the meeting hardware was tested:

- J1, J19 and J2 are all on B.Cu in the supplied LDO PCB. J1 carries 23 ASIC signal nets, 3V3 supply input on pins 1/2 and DGND on pins 49/50.
- J19 is present only in the PCB and every pad is netless. Preserve it as the confirmed second connector without inventing electrical functions.
- J1 pins 47/48 form an unused VCC net. The source does not connect it to the LDO input. AGND and DGND are separate source nets; the actual supply/return arrangement must be reviewed.
- XEM8305 requires externally supplied VCCO rails, sequenced after its onboard power is good. 1.5 V is a supported bank supply option. A carrier supply circuit or reviewed existing supply arrangement is needed even when the ASIC signal path is direct routing.
- Connector mating/contact orientation, installed heights, ASIC levels/defaults, required LDO inputs, sustained capture and eight-chip scaling are still implementation and test work. No fabrication release was created by this record.

## Immediate actions

| Action | Working owner/reviewer | Target | Status |
|---|---|---|---|
| Check J1/J19 mating footprints and the one-chip signal map; place XEM8305 connectors from its official drawing | Howard and Zitong; Gerald reviews existing-board interface | Proposal for 6 October | In progress; pair confirmed, mating verification open |
| Define XEM8305 VCCO sequence and LDO supply/return path | Howard and Zitong; Gerald supplies existing setup details | Before routing release | Open |
| Review V11, 35T exact part, oscillator/flash interfaces and regulator choices | Howard and Zitong | Weekend of 3–4 October; review 6 October | Open |
| Review command serialization, ASIC control generation and stimulation trigger | FPGA implementation owner with Jiao and Gerald | Before protocol/pin-map closure | Open; assignment to confirm |
| Build and test one-chip backup, then assess eight-chip scaling | Integration team; Gerald reviews ASIC operation | After fabrication/assembly | Planned; no hardware result recorded |

Owner labels express the working follow-up from this conversation; they do not establish accepted layout ownership or review approval.

## Source and references

Source date: 2 October 2026. Source: Howard-provided conversation with Zitong and Gerald, plus Howard's subsequent J1/J19 confirmation. Technical audit source: the LDO ZIP shared in the 2 October workspace. Native CAD is retained locally and is not republished with this meeting update. The generated connector illustration uses native pad/outline coordinates; it is not a photograph or a fabrication drawing.

Primary module reference: [Opal Kelly — Powering XEM8305](https://docs.opalkelly.com/xem8305/powering-the-xem8305/), [expansion connectors](https://docs.opalkelly.com/xem8305/expansion-connectors/) and [specifications](https://docs.opalkelly.com/xem8305/specifications/).
