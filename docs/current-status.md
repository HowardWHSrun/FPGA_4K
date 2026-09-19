# Current project status

Prepared 19 September 2026 from the available meeting record, source slides, technical follow-up and design studies through 18 September. This page describes the intended system and the evidence currently available; it is not a fabrication release or a report of a working eight-ASIC acquisition system.

Start here, then read [the architecture](architecture.md), [open questions](open-questions.md) and [decision record](decisions.md). The [17 September meeting record](meetings/2026-09-17.md) and [18 September follow-up](meetings/2026-09-18-follow-up.md) explain the source context.

## Current direction

| Item | Current state | Evidence boundary |
|---|---|---|
| System | Eight ASICs on four carriers → routing/power board → custom FPGA PCB → micro-HDMI link → receiver interface for KR260 → PC | Intended architecture; end-to-end operation has not been demonstrated by the supplied evidence. |
| FPGA | XC7A200T selected | Exact package, speed and temperature ordering code remains to be approved. XC7A200T-1SBG484C is a candidate. |
| Recording target | 4,096 channels, 12-bit conversion, 31.25 kS/s/channel | Source-slide design target, not measured eight-chip performance. |
| ASIC reference and clock | Gerald confirmed a nominal 1.5 V reference and intended 32 MHz ASIC clock | This does not specify every ASIC supply, complete pin electrical limits, or the FPGA reference oscillator frequency. |
| Output connection | Micro-HDMI selected | Connector selection does not select HDMI video, TMDS, LVDS or another protocol. Cable, pinout, signaling and receiver remain open. |
| FPGA oscillator | Frequency TBD | 100 MHz was a candidate. Selection depends on acquisition and output-link requirements. |
| Startup and recovery | Automatic startup is wanted; retain a dedicated JTAG connector | QSPI flash and its exact part are proposed. JTAG pitch, pinout and adapter remain to be reconciled. |
| Development equipment | Nexys Video is for development and testing | It is not a component mounted on the custom PCB. |

Sources: [current decision note](../sources/notes/2026-09-18-current-decisions.md), [technical follow-up](meetings/2026-09-18-follow-up.md), [component proposal](../sources/notes/2026-09-18-component-proposal.md), [ASIC slide text](slides/asic-interface-text.md), [latest placement guide](../hardware/placement/FPGA_PCB_Rev2/README.md).

## What exists today

| Work product | What it establishes | What it does not establish |
|---|---|---|
| Source slides, meeting notes and prior repository links | Available ASIC description, reported decisions and reference implementation context | A complete current ASIC electrical specification or a verified current hardware configuration |
| [FPGA Rev2 placement study](../hardware/placement/FPGA_PCB_Rev2/README.md) | Editable 60 × 70 mm candidate with 203 footprint objects: 34 top and 169 underneath | No schematic, assigned nets or routing; not a completed board or proven minimum size |
| Rev2 geometry and native checks | Placement checks report no component/label/reserve overlaps; native DRC records 69 internal pad-clearance errors, 52 in U4 and 17 in J3, with zero warnings | A clean fabrication DRC, electrical completeness, BGA escape, timing closure or hardware function |
| [Routing placement scenarios](../hardware/placement/Routing_PCB/README.md) | Physical allowances for alternative supply-group arrangements | A selected regulator topology, connector mating scheme or mechanically validated stack |
| Earlier FPGA_512 implementation | ECP5/FT600 acquisition/control reference to study and adapt | Ready-to-load Artix-7 firmware or full-rate eight-ASIC validation |

Some footprints and 3D bodies are visual proxies. Heights, connector mating, land patterns and assembly tolerances need their own review. A component count includes holes, test points and provisional support positions; it is not an approved purchasing BOM. See the [Rev2 limitations and reports](../hardware/placement/FPGA_PCB_Rev2/README.md).

## Team responsibilities reported in the supplied discussion

These are the responsibilities recorded in the source discussion, not new assignments or proof of completed work. The source was received on 18 September; its pasted messages do not establish their original calendar dates.

| Collaborator | Reported responsibility | Main interface to coordinate |
|---|---|---|
| Gerald | ASIC and carrier boards | Current ASIC/carrier specification, timing, electrical limits, control and power requirements |
| Zitong | Routing and power management | Carrier connections, regulation, power handoff and routing-to-FPGA interface |
| Howard | FPGA PCB | FPGA hardware, configuration, power, memory and board interfaces |
| Jiaao | FPGA programming | Capture/control implementation, clocking, channel identity and data delivery |
| David | Downstream/“MCU” programming | Receiving and forwarding data; receiver implementation must be coordinated explicitly |

Source: [technical follow-up and provenance caveat](meetings/2026-09-18-follow-up.md). Detailed question ownership distinguishes recorded responsibility from suggested reviewers in [the question register](open-questions.md).

## What must be resolved next

1. Close ASIC electrical/timing limits and shared-control/startup behavior with Gerald; the nominal 1.5 V and 32 MHz are already confirmed.
2. Agree the full signal, ground and power contact map with Zitong, including actual mates and power feed direction.
3. Define both ends of the micro-HDMI link, including the actual KR260 receiver path and a sustained bandwidth budget.
4. Select the recording buffer, oscillator/clock plan, bank allocation and complete power/configuration design from those requirements.
5. Complete the electrical design and layout, reconcile the BOM and footprints, and perform implementation and hardware validation before fabrication release.

Each unresolved item, its coordinating responsibility and the evidence needed to close it appears in [open questions](open-questions.md). Drafting and isolated firmware experiments can proceed while these interfaces are being settled.

## How to read older material

The current direction uses **XC7A200T and micro-HDMI**. Older XC7A35T RevA/RevB work and the USB/FX3 system guide are historical references. Their link-specific parts, bank allocation and power totals are not current requirements. Older JTAG pads or cable-sharing concepts do not replace the latest dedicated-connector proposal. Preserve useful reference evidence, but resolve conflicts using [the decision record](decisions.md) and the linked current sources.
