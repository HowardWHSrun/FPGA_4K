# FPGA PCB design baseline after source review

> Historical source note. Current XC7A200T/micro-HDMI decisions supersede older link/device proposals. See [current status](../current-status.md). Text is retained with navigation adapted; unshipped local references are marked as archive paths.

**Current decision:** Howard has selected micro-HDMI. [Current FPGA PCB decisions](../../sources/notes/2026-09-18-current-decisions.md) supersede the later USB recommendation described below; exact signaling and receiver hardware remain open.

**Later review:** [System walkthrough and preliminary parts specification](2026-09-18-usb-parts-walkthrough.md) incorporates the subsequent memory, capacitor, power and receiver discussion. For a first functional system it recommends FX3/USB3 into KR260; the micro-HDMI preference below records the earlier discussion, not a finalized current link. The new review also reconstructs the ASIC LDO setpoints and keeps external recording RAM as a provisional design block.

Updated 2026-09-18 from Howard's six annotations, the supplied Slack conversation, Gerald's slides, FPGA_512, and AMD documentation. This records a proposed engineering baseline and its remaining unknowns; it is not a completed schematic or approved manufacturing BOM.

## Current direction and responsibilities

The latest user direction is XC7A200T, four two-ASIC carrier boards, routing PCB B+C, FPGA PCB D, and functionality ahead of minimum size. Micro-HDMI is the preferred connector under discussion; USB-C remains an alternative. Interpreting “uHDMI” as Micro-HDMI Type D is an assumption to confirm with the exact part.

The supplied Slack conversation assigns Gerald the 1,024-channel chip boards, Zitong routing and power management, Howard the FPGA PCB, Jiaao FPGA programming, and David downstream/“MCU” programming. The later messages describe ASIC boards → routing board → FPGA board → cable → MCU → SFP+ → PC. The existing meeting record identifies KR260 as that downstream platform; the pasted Slack text alone does not name the model.

Slack reports that Gerald has handed an FPGA evaluation board to Jiaao and that David will investigate high-rate reception and forwarding. It does not establish that the complete data path already works. An earlier Artix-7 + FX3 + USB 3.0 laptop test proposal appears in the same paste; treat this as a useful validation approach, not proof the newer downstream architecture still requires FX3.

The stimulation discussion establishes an unresolved control/software issue with recording immediately after stimulation. It does not establish the first new-board stimulation scope or validate simultaneous acquisition. Preserve the required control path while that behavior is resolved.

Source: [technical follow-up summary](../meetings/2026-09-18-follow-up.md). Times are present but message dates are absent, so the precise chronology cannot be independently dated.

## ASIC interface: enough evidence to start the schematic

The inspected FPGA_512 snapshot is `767e82528780005cbcb37b3e926197755bac622e`. The public repository README was checked; live remote HEAD was not independently established. Its ECP5/FT600 implementation is a reference to adapt to Artix-7 and the selected downstream link.

| Function | Source-supported baseline | Remaining qualification |
|---|---|---|
| Recorded data | Eight serial outputs per ASIC; 64 channels per output | Confirm current ASIC revision and connector/pad mapping |
| Returned timing | Returned clock, READ and SYNC; 11 outputs per ASIC including data, hence 88 for eight ASICs | Capture setup/hold, skew and guaranteed output electrical limits |
| Control/configuration | ASIC clock, chip/front-end resets, SPI clock/latch and left/right configuration data, stimulation controls | Which controls may be shared; exact configuration defaults and stimulation timing |
| Logic voltage | Legacy constraints specify LVCMOS15; ECP5 VCCIO2 is powered from +1V5 | Use 1.5 V as a provisional interface assumption, not a guaranteed ASIC specification |
| Other signals | Legacy code declares AC_IN and IMP_TEST spare inputs; the newer planning sheet has unresolved test signals | Resolve direction/use and DISC_OUT treatment |
| Synchronization | Slides define SYNC for channel alignment | Existing capture code leaves SYNC unused; verify startup/resynchronization against known channel stimuli |

The 88 lines are not the total connector contact count. Per-chip programming, shared controls, any retained test outputs, grounds and supplies must be added. Passive routing does not merge eight digital outputs into one; the FPGA performs data aggregation.

Sources: [RTL interface](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L34-L60), [ASIC-side constraints](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_4lane_framed.lpf#L23-L82), and [reference netlist](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/FPGA%20board.net#L3199-L3231).

## Recording requirements recovered from the slides

Use the slide specification as the proposed full-rate design target:

- 512 recording channels per ASIC; eight ASICs give 4,096 channels.
- 12-bit conversion and 31.25 kS/s/channel.
- Eight serial data outputs per ASIC, with the 32 MHz / 1,024-cycle frame timing described in the deck.
- The ASIC also supports 128 stimulation channels, but capability does not by itself define first-prototype stimulation requirements.

The existing code sends a 16 MHz clock to the ASIC and the host declares 15,625 samples/s/channel. This is a useful lower-rate reference mode. Do not describe the existing implementation as already demonstrating full-rate eight-chip operation.

| Data representation | Full target, 31.25 kS/s/channel | Existing reference-rate case, 15.625 kS/s/channel |
|---|---:|---:|
| Packed 12-bit payload | 192 MB/s | 96 MB/s |
| 16-bit sample words | 256 MB/s | 128 MB/s |
| 16-bit words with old 132/128 framing ratio | 264 MB/s | 132 MB/s |

These are calculated decimal rates, not measurements. Physical-link encoding, additional headers and operating margin are extra. For now, budget for at least the higher legacy-framed case plus the selected transport's overhead/margin unless Jiaao and David agree a different format.

Sources: [original slide deck](../../sources/slides/Chip_FPGA_Interface.pptx), especially slides 5/7 and 13–17; [actual ASIC clock drive](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L86-L95); [host sample-rate constant](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_daemon.c#L59).

## Micro-HDMI versus USB-C

Keep Micro-HDMI Type D as the provisional choice for a custom short differential FPGA-to-receiver link if David has a compatible receiving interface. If no such receiver exists, the previously proposed FX3/USB 3.0 evaluation path is the more direct functional demonstration. Choosing the final connector requires this receiving-side decision.

| Choice | Required hardware/software | Assessment |
|---|---|---|
| Micro-HDMI with custom differential data | Cable/receiver adapter, compatible FPGA I/O, transmit/receive logic, framing, return commands and validated timing | Potentially compact; requires a custom receiving interface |
| USB-C with standard USB 3.0 | USB controller/PHY such as FX3, associated power/clock, Type-C connection/orientation circuitry, device firmware and host software | Adds board circuitry but can use a standard KR260 USB host port |
| USB-C with a custom non-USB link | Custom receiving interface, controlled cable wiring and orientation/lane handling | Does not gain ordinary USB interoperability; not a simpler footprint swap |

KR260 has no HDMI input. Its listed interfaces include DisplayPort output, USB 3.0 host ports, Pmod/HAT, SLVS-EC and SFP+. A custom micro-HDMI cable cannot be plugged into an arbitrary KR260 port. An adapter cannot create high-speed capability that the selected port does not have.

Illustrative custom-link budget: using three high-speed pairs for data and one for a forwarded clock requires 704 Mb/s per data pair for 264 MB/s, before further overhead. The corresponding packed 192 MB/s case requires 512 Mb/s/pair. These are feasibility requirements, not evidence of a working link; check the actual cable, chosen FPGA I/O and receiving port. Reserve a return-command path and decide error detection/backpressure behavior.

Sources: [AMD KR260 interfaces](https://docs.amd.com/r/en-US/ug1092-kr260-starter-kit/Interfaces), [Infineon FX3](https://www.infineon.com/products/universal-serial-bus/usb-3-2-peripheral-controllers/ez-usb-fx3-usb-5gbps-peripheral-controller), [Microchip USB Type-C application note](https://www.microchip.com/content/dam/mchp/documents/OTH/ApplicationNotes/ApplicationNotes/00002051A.pdf), [TI HDMI design guide](https://e2e.ti.com/cfs-file/__key/communityserver-discussions-components-files/138/5684.Texas-Instruments-HDMI-Design-Guide.pdf).

## Proposed component division

This is a functional inventory; final quantities and manufacturer part numbers remain to be calculated and reconciled with the real pin map.

| Routing/power PCB — Zitong | Purpose / status |
|---|---|
| Connections to four ASIC carriers and connector(s) to the FPGA PCB | Bring the four carrier assemblies into one agreed pin map; exact mates, contact counts and positions remain open |
| Signal traces and ground returns | Carry separate data, clocks, resets, configuration and stimulation controls without passive data aggregation |
| ASIC power regulation and reference/bias distribution | Proposed default consistent with the routing/power assignment and older LDO board; jointly confirm rail placement |
| Regulator setting resistors, input/output capacitors and appropriate filtering | Set supply voltages, maintain regulator stability and reduce noise |
| Power-entry/distribution connections, protection appropriate to the actual supply, and test points | Make ASIC supplies deliverable, measurable and controllable during testing |
| Optional buffers, series resistors or translators | Only where clock/control fan-out or voltage/signal-integrity analysis requires them |
| Optional stimulation supply circuitry | Only after voltage, polarity, current, reference and operating requirements are known |

The old LDO schematic contains nine LT3042 regulator circuits, 43 capacitors and nine resistors. Those are reference counts, not the new eight-chip BOM. The net names include VDD_FE, VDD_ADC, DVDD, VDD_DRIVER, VDD_CGEN and reference/stimulation-related nets; names do not guarantee numerical rail specifications. Passive routing is conceptually simpler than FPGA processing, but multi-board wiring, eight-chip control loading and low-noise supplies still require engineering.

| FPGA PCB — Howard | Purpose / status |
|---|---|
| XC7A200T | Capture/configure ASICs, maintain channel/frame identity, aggregate and transmit data |
| FPGA regulators, inductors, capacitors, setting resistors and startup control | Supply core, auxiliary, configuration and selected I/O banks |
| Package/rail-specific decoupling capacitors | Supply fast local current demands and keep rails inside limits |
| Configuration flash | Proposed automatic power-on loading; a supported 128-Mbit device is a one-image capacity baseline, not a finalized flash part |
| JTAG connector or test pads, voltage reference and grounds | Initial programming, debugging and recovery; an onboard USB-JTAG bridge is optional |
| Configuration mode/CFGBVS wiring, PROGRAM_B/INIT_B/DONE support and reset/status access | Define boot voltage/mode and observable startup behavior |
| Oscillator or validated external clock arrangement | Run capture/processing/transmission with appropriate clock routing and FPGA clock management |
| Routing-board connector(s) | Receive ASIC data/timing and send control/configuration |
| Downstream connector, protection and required termination/interface circuitry | Implement the link actually agreed with David; FX3 belongs here only for the USB option |
| Power connector, current/rail test points, test access and mechanical support | Board bring-up and integration |
| Optional external RAM | Only if the defined downstream stall/buffering requirement exceeds usable FPGA memory |
| Optional GTP power/filter/reference-clock circuitry | Only if the chosen link uses the dedicated transceivers; follow manufacturer unused-pin guidance otherwise |

Gerald's carrier boards retain the ASICs and their local support components. The routing PCB is not proposed to duplicate those ASICs or add a separate ADC merely because an ASIC rail is named VDD_ADC.

## FPGA power values that the datasheet does establish

For a standard-voltage XC7A200T grade such as the Nexys Video's -1 device, DS181 Table 2 specifies:

| Supply/function | Baseline | Status |
|---|---:|---|
| VCCINT core | 1.00 V nominal; 0.95–1.05 V operating range | Manufacturer requirement for the specified grade |
| VCCBRAM internal memory | 1.00 V nominal; 0.95–1.05 V | Connect to the same supply as VCCINT when operated at the same voltage |
| VCCAUX | 1.80 V nominal; 1.71–1.89 V | Manufacturer requirement |
| VCCADC for XADC operation | 1.80 V nominal; 1.71–1.89 V | Implement analog supply/reference/unused-pin treatment from UG480 |
| Configuration/flash domain | 3.3 V proposed | Coordinate bank voltages, flash voltage and CFGBVS; this is our proposed implementation |
| ASIC-facing I/O banks | 1.5 V proposed | Supported by legacy LVCMOS15 interface evidence; needs current ASIC confirmation |
| Downstream I/O banks | Depends on selected electrical interface; 2.5 V is a possible LVDS_25 transmit-bank choice | Do not select independently of the actual receiver and pin plan |
| GTP supplies when used | MGTAVCC 1.0 V; MGTAVTT 1.2 V, with specified filtering | Conditional on using GTP; no assumption that an HDMI connector implies GTP |

Lower-power speed grades have different voltage rules; retain the exact chosen ordering code throughout schematic, footprint, constraints and BOM. The Nexys Video ordering code XC7A200T-1SBG484C is a useful candidate to match the development hardware, not an already-approved procurement selection.

Regulator output currents cannot be read as one universal “XC7A200T current.” Estimate resources, clocks, switching, I/O loads and transceivers using XPE/Vivado, then include startup/transient requirements and regulator thermal/stability margins. A quiescent-current table is not a regulator-sizing table.

### Capacitor baseline already available

UG483 Table 2-2, page 16, gives the following starting network for XC7A200T in SBG484. Preserve its assumptions and capacitor specifications; this is not a proven minimum or a final purchasing list.

| Rail | Published network |
|---|---|
| VCCINT | 1 × 680 µF; 12 × 4.7 µF; 14 × 0.47 µF |
| VCCBRAM | 1 × 100 µF; 3 × 0.47 µF |
| VCCAUX | 1 × 47 µF; 3 × 4.7 µF; 5 × 0.47 µF |
| VCCO bank 0 | 1 × 47 µF |
| Other VCCO banks | 2 × 4.7 µF and 4 × 0.47 µF per bank; bulk 47 µF or 100 µF as specified in the table note |

The bulk VCCO note permits one 47 µF or 100 µF capacitor for up to four banks powered at the same voltage. This does not eliminate the per-bank smaller capacitors. Regulators must independently meet their own output-capacitance/stability requirements. Alternative decoupling networks are permitted when their performance meets the guide; GTP supply decoupling is specified separately.

UG470 lists a 77,845,216-bit XC7A200T configuration stream and a 128-Mbit configuration-memory capacity. Multiple fallback/update images require a separate capacity calculation.

Sources: [DS181](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet), [UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB), [UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config); local manufacturer PDFs are preserved in Original Sources/09_Manufacturer_Documentation/Datasheets/AMD. DS181 pages 2–3 and UG483 page 16 were visually checked for this review.

## ASIC power: useful estimates, still incomplete requirements

The reference FPGA netlist sends +2 V to its inter-board connector and powers its ASIC-facing ECP5 I/O bank at +1.5 V. These are two different functions. Do not label +2 V as every ASIC's internal rail or use the ECP5 core supplies for the Artix design.

Slide 7 reports about 17.24 µW per recording channel excluding external LDOs. Across 4,096 channels that is approximately 70.6 mW for the described recording circuitry. It excludes FPGA/interface power, regulator losses and stimulation operation, and does not provide each rail's maximum current. Stimulation compliance of ±10 V is not, by itself, an instruction to build particular ±10 V rails.

## What I still do not know

1. The current ASIC revision's guaranteed electrical/timing limits, complete rail requirements and current/sequence/noise limits.
2. Gerald's final carrier revision and the connector map agreed with Zitong, including shared controls and optional test/stimulation connections.
3. David's specific KR260 receiving port/adapter, protocol, lane rate, software and proven throughput. This is the largest remaining downstream design dependency.
4. Jiaao's measured full-rate implementation behavior and resource/power estimate. The full-rate slide specification is a design target, not a passed system test.
5. First-prototype stimulation/impedance scope and required recording recovery time after stimulation.

Functionality now takes priority over minimum dimensions. The next layout should allow practical power, programming and debug access, then shrink after the electrical design and connector arrangement are established. The original and compact STL remain conceptual geometry. Existing 35T RevA/RevB drafts still need reworking for the selected 200T device/package and interfaces.
