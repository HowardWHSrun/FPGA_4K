# Open questions and closure evidence

Status: 19 September 2026, based on the available records through 18 September. Stable IDs identify questions across reviews. Every item below remains **OPEN** unless an answer and its supporting artifact are recorded here. A discussion, placed footprint or successful tool run alone does not close an electrical requirement.

“Recorded responsibility” comes from the supplied team discussion or current handoff. “Suggested coordination” identifies useful reviewers without assigning them new work. See [reported roles](current-status.md#team-responsibilities-reported-in-the-supplied-discussion). When closing a question, record the decision, source/date, reviewer or owner confirmation, and affected documents/design files; retain the ID.

## Q-01 — What are the authoritative ASIC and carrier revisions?

**Status:** OPEN. **Recorded responsibility:** Gerald—ASIC/carriers; Zitong and Howard coordinate their board interfaces.

**Needed closure evidence:** Current revision identifier, authoritative schematic/bonding or pin table, signal directions, and a revision-controlled connector-to-ASIC mapping. Reconcile retained test functions such as AC_IN, IMP_TEST and DISC_OUT. Older carrier and LDO connector counts do not establish a mating pair.

## Q-02 — What electrical and timing limits apply at the FPGA-facing interface?

**Status:** OPEN. **Recorded responsibility:** Gerald/ASIC design requirements. **Suggested coordination:** Howard and Jiaao for bank selection and capture implementation.

**Already known:** Nominal reference 1.5 V and intended ASIC clock 32 MHz are confirmed; do not reopen these as unanswered nominal-value questions.

**Needed closure evidence:** Per-pin voltage range, input/output thresholds and drive/loading limits; clock duty/jitter limits; data-change edge and clock-to-data/setup/hold/skew specifications at the relevant connector. Clearly distinguish source specifications from measured characterization.

## Q-03 — Which controls are shared, and what startup states are required?

**Status:** OPEN. **Recorded responsibility:** Gerald supplies ASIC requirements; Howard/Zitong coordinate connectivity. **Suggested coordination:** Jiaao for implementation.

**Needed closure evidence:** Table of shared versus independent clocks, resets, programming and stimulation controls; required pull-ups/down or other safe biases; reset/configuration/startup sequence; behavior on stopped clock, lost configuration, reset and disconnected cable. Retain enough contacts for the approved allocation.

## Q-04 — What is the complete routing-to-FPGA connection?

**Status:** OPEN. **Recorded responsibility:** Howard + Zitong, with ASIC/carrier information from Gerald.

**Needed closure evidence:** One agreed drawing/table naming every signal, power and ground contact; exact mating parts; pin numbering and orientation; clock-capable pin needs; ground-return allocation; connector placement and mating height. The 88 acquisition outputs exclude controls, power and grounds. Two 80-contact footprints are a spatial allowance, not an approved pin map.

## Q-05 — How are routing/carrier supplies generated and handed off?

**Status:** OPEN. **Recorded responsibility:** Zitong—routing/power, Howard—FPGA PCB; Gerald supplies ASIC load and supply requirements.

**Needed closure evidence:** Regulation already present on carriers; required independent rails and number of supply groups; power feed direction; source range and transient limits; maximum continuous/peak current, ripple/noise and sequencing requirements. Identify the current routing schematic/parts list. Seven low-voltage regulators per group is reference-derived, not a selected new-board BOM. Resolve high-voltage stimulation branches and symbol/package discrepancies before reuse.

## Q-06 — What implements the micro-HDMI link and the KR260 receiver?

**Status:** OPEN. **Recorded responsibility:** Howard coordinates the FPGA hardware interface; David has downstream programming responsibility. The receiving-interface hardware designer has not been named in the supplied record.

**Needed closure evidence:** Named receiver hardware owner; actual KR260 port/adapter and schematic; exact connector/cable; pin and lane allocation; signaling levels/standard; clocking; return commands; protection/termination; framing, integrity checks and flow-control behavior. Provide the sustained bandwidth calculation including chosen overhead/margin, then measured transmitter-to-receiver performance against agreed criteria. Micro-HDMI selection alone does not answer this question.

## Q-07 — What clock plan and FPGA bank allocation are feasible?

**Status:** OPEN. **Recorded responsibility:** Howard—PCB, Jiaao—FPGA programming. **Suggested coordination:** Receiver designer once identified.

**Needed closure evidence:** Exact FPGA ordering code; complete bank-voltage and pin map; capture/derived/output clocks and clock-capable pins; oscillator frequency/output/jitter requirements; implementation-tool checks for the selected package, interfaces and constraints. The ASIC target is 32 MHz; the physical FPGA oscillator remains TBD. 100 MHz is not an accepted requirement.

## Q-08 — What buffering and data-loss behavior must recording support?

**Status:** OPEN. **Recorded responsibility:** Howard's hardware design retains the buffer dependency. **Suggested coordination:** Jiaao, David and the experiment requirements owner; the latter is not explicitly named in the supplied record.

**Needed closure evidence:** Agreed recording mode/run duration, output packet format, permitted pauses or loss, measured/bounded downstream stalls, overflow/backpressure behavior and capacity calculation. Select RAM part/type, usable capacity and controller with legal bank/pin/supply allocation and timing constraints. Boot flash does not satisfy recording-buffer needs.

## Q-09 — How will channel identity, synchronization and stimulation behavior be verified?

**Status:** OPEN. **Recorded responsibility:** Gerald supplies ASIC behavior; Jiaao handles FPGA programming; David handles downstream programming. **Suggested coordination:** Howard for hardware test access and experiment scope.

**Needed closure evidence:** Startup/resynchronization method, explicit SYNC handling, chip/channel ordering and frame identity; known-pattern or channel-stimulus tests; discontinuity detection; agreed first-prototype stimulation/impedance scope and post-stimulation invalid-data/recovery behavior. Demonstrate the intended 32 MHz mode; reference code at 16 MHz and unused SYNC are porting/validation items, not current full-rate proof.

## Q-10 — What completes FPGA power, configuration and recovery?

**Status:** OPEN. **Recorded responsibility:** Howard—FPGA PCB. **Suggested coordination:** Jiaao for tool/bitstream/flash settings and a power-design reviewer to be identified.

**Needed closure evidence:** Actual estimated/measured rail currents and load steps; final regulators/passives, effective capacitance and compensation; startup/shutdown/brownout and thermal checks; exact flash/configuration settings; dedicated JTAG connector, voltage reference, pinout and adapter. Reconcile the 1.27 mm RevC-header proposal with the 2.54 mm placement candidate. Validate JTAG, flash programming, cold boot and recovery on the resulting hardware; automatic recovery is not established by flash capacity alone.

## Q-11 — What physical and fabrication constraints govern the boards?

**Status:** OPEN. **Recorded responsibility:** Howard + Zitong for board interfaces. **Suggested coordination:** Layout/mechanical reviewer and fabricator/assembler; identities remain TBD.

**Needed closure evidence:** Agreed mechanical envelope, mating heights, mounting/clearances, carrier overhang, cable access and cooling; manufacturable BGA escape, layer stackup, impedance, via/trace rules and assembly constraints; exact package/land-pattern review. Resolve the Rev2 internal footprint DRC errors. A 60 × 70 mm placement fit is not a minimum-size proof or fabrication approval.

## Q-12 — What evidence defines a successful first system demonstration?

**Status:** OPEN. **Recorded responsibility:** No single acceptance owner is named. **Suggested coordination:** Howard, Gerald, Zitong, Jiaao and David agree scope and ownership.

**Needed closure evidence:** Test plan identifying equipment, implementation/build environment and source revisions; safe first-power sequence; staged power/configuration/capture/link/PC checks; target channel count, rate, duration and allowed discontinuities; stimulus and channel-identity checks; saved logs/results. Distinguish simulation, replay, programming detection, timing closure and live hardware tests. Do not claim eight-ASIC end-to-end operation until its defined test is demonstrated.

## Sources and updates

The register consolidates [current PCB questions](../sources/notes/2026-09-18-current-questions.md), [current decisions](../sources/notes/2026-09-18-current-decisions.md), [routing handoff](../sources/notes/2026-09-18-routing-handoff.md), [component proposal](../sources/notes/2026-09-18-component-proposal.md), [technical follow-up](meetings/2026-09-18-follow-up.md), [ASIC slide text](slides/asic-interface-text.md) and [Rev2 limitations](../hardware/placement/FPGA_PCB_Rev2/README.md). Its suggested reviews and closure artifacts are organizational recommendations, not claims that collaborators accepted new assignments.

To add a question, append the next unused Q ID. To close one, retain its heading and record the evidence instead of deleting the historical question. If a later decision supersedes an answer, mark it reopened and link the new entry in [the decision record](decisions.md).
