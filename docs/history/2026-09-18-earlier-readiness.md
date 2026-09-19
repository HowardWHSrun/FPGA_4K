# FPGA PCB decisions and missing information

> Historical source note. Current XC7A200T/micro-HDMI decisions supersede older link/device proposals. See [current status](../current-status.md). Text is retained with navigation adapted; unshipped local references are marked as archive paths.

**Updated assessment:** [Design baseline after Slack, slide, repository and datasheet review](2026-09-18-earlier-baseline.md). The review below is retained as the earlier question list. The new baseline fills the nominal channel/resolution/sample-rate target, records the named collaborators, treats micro-HDMI as the provisional connector preference, and prioritizes functionality over minimum size. Do not treat those items as entirely unspecified based on this older list.

Assessment: 2026-09-18. This is a requirements review, not a fabrication release. Latest user decisions supersede the older 35T reference documents. Original source files are preserved unchanged in [Original Sources](../../sources/README.md).

We can begin the XC7A200T schematic architecture and firmware experiments now. Final pin assignment, board routing and fabrication depend on resolving the interfaces, power and physical constraints below.

## Settled as project requirements

| Item | Agreed direction | Boundary |
|---|---|---|
| FPGA device | XC7A200T | Complete ordering code, package, speed and temperature grade still need selection and checking. |
| ASIC arrangement | Four carrier boards, two ASICs each; eight ASICs total | 4,096 channels is the target using the supplied 512-channel ASIC description. Confirm the actual ASIC revision. |
| Mechanical arrangement | A = ASIC carrier stack; B+C = routing PCB; D = FPGA PCB | STL dimensions/units and clearances are not manufacturing dimensions. |
| Compactness | Reduce B and aim for a compact assembly | The compact-B model is a concept; minimum routing/assembly space is unproven. |
| System path | ASICs → routing PCB → FPGA PCB → KR260 → PC; commands return toward ASICs | The FPGA–KR260 electrical interface and protocol remain open. |
| Design workflow | KiCad; FPGA power circuitry on FPGA PCB; automatic startup is wanted | Individual parts and boot implementation remain engineering choices. ASIC regulator placement remains open. |

These are decisions about the intended system, not evidence of a completed implementation. The Nexys board has previously been identified through JTAG; eight-ASIC recording and the KR260 data path have not been demonstrated.

## Information needed, in priority order

| Priority | Required answer or deliverable | Why it changes the PCB | Suggested source/owner |
|---|---|---|---|
| 1 | **Current ASIC specification:** revision, bonding/pin map, signal directions, I/O supply and electrical limits, clock/data/Read/Sync timing, reset and configuration protocol | Determines FPGA I/O-bank voltages, usable pins, capture clocks, buffers/translators, and reset circuitry | Gerald / ASIC designer |
| 2 | **Recording mode and throughput:** channels active simultaneously, samples/s/channel, wire/data-word format, recording versus stimulation/impedance scope, allowed pauses/data loss | Determines downstream bandwidth, FPGA resources, memory needs and retained signals | Howard + Gerald + firmware collaborators |
| 3 | **FPGA–KR260 interface agreement:** actual KR260 port and pins, electrical standard, protocol, sustained payload rate, clocking, commands, cable length and receiver implementation | Determines connector, FPGA banks, possible transceiver/PHY circuitry, termination and buffering | Howard + David + FPGA/KR260 collaborators |
| 4 | **Routing-board interface drawing:** every connector contact, mating part, orientation, position, stack height, ground/power contacts and shared/per-chip signals | Both boards must agree on exactly the same physical and electrical interface | Howard + Zitong, using Gerald's ASIC map |
| 5 | **Power budget:** input source/range, all ASIC rail voltages/current/noise/sequence limits, ASIC regulator location, FPGA load estimate, power/thermal limit | Determines regulator sizes, inductors, capacitors, sequencing, copper and heat dissipation | ASIC designer + Howard/Zitong + FPGA/power designer |
| 6 | **Mechanical envelope:** actual millimetres, maximum width/length/height, mounting holes, connector/cable clearance, rigid/flex construction, mass and temperature limits if head-mounted | Determines whether the chosen package, connectors, power circuitry and routing fit | Howard + Zitong / mechanical owner |
| 7 | **Build and first-test plan:** Vivado host/version/device support, programming/recovery connector, startup/update flow, available test equipment and acceptance criteria | Ensures that an assembled board can be programmed, diagnosed and tested | Howard + FPGA collaborator |
| 8 | **Fabrication constraints:** prototype quantity/budget, assembler capability for the selected BGA, permitted vias/trace spacing, stack-up and impedance | Determines realistic layers, BGA escape, cost and assembly process | PCB designer + fabricator/assembler; JLC was the earlier preference |

### Specific source conflicts to resolve

- The slides describe **31.25 kS/s/channel** and a 32 MHz clock; the old firmware/host path uses a **15.625 kS/s/channel** assumption with a 16 MHz forwarded clock. Neither should silently become the new specification.
- At 4,096 channels and 12 bits/sample, those two sample rates correspond to **192 MB/s** and **96 MB/s** of raw payload respectively. The old 16-bit word/framing scheme instead gives **264 MB/s** and **132 MB/s**, before further link overhead. These are calculations, not measured throughput or a mandatory new encoding.
- **88 signals is only the eight sets of eight data outputs plus returned clock, Read and Sync.** It does not include all configuration/control signals, power or grounds. The final connector count is not settled.
- Historical `LVCMOS15` constraints suggest a previous 1.5 V interface; they do not supply the current ASIC's full electrical limits. Stimulation compliance voltage is a separate analog specification.
- `AC_IN`, impedance-test and `DISC_OUT` behavior/direction still need clarification. Confirm which controls can safely be shared by all eight chips.
- The older PCB-5 and LDO connectors have different contact counts. They are references, not a verified mating pair.
- The slide protocol uses Sync for channel alignment, while the reviewed legacy capture implementation leaves it unused. Define startup/resynchronization and verify electrode/channel identity.

Evidence: [ASIC slide/code audit](2026-09-16-slide-code-audit.md) and [carrier/routing/pin audit](2026-09-17-reference-board-guide.md). Older architecture suggestions in those audits are superseded by the latest user-confirmed eight-ASIC / XC7A200T arrangement.

## What this means for the component list

| Function | Current status |
|---|---|
| XC7A200T FPGA | Device selected; full ordering code and validated symbol/footprint/pin map remain open. |
| Power regulators and support parts | Needed. Exact rail partition, regulator count/ratings, inductors and capacitors follow the power and interface budgets. Do not reuse the old 35T power design without recalculation. |
| Local decoupling and power/ground distribution | Needed. Exact values, quantity and placement require device/package and power-integrity review. |
| Application clock | A clock plan is needed; local oscillator versus incoming reference, frequency, jitter and reset/lock behavior remain open. |
| Configuration and recovery | An accessible programming/recovery path is needed. JTAG plus local configuration flash is a practical proposal for automatic startup, not a frozen part selection. An onboard USB programmer is optional if an external programmer is used. |
| ASIC-side and downstream connectors | Needed; exact mating parts and pin assignments depend on the interface agreements. |
| Test points and reset/status access | Plan these into the board so power, programming and links can be checked. Exact implementation is an engineering choice. |
| External RAM, translators, clock buffers, PHYs and termination | Conditional. Add them only when buffering, electrical compatibility, loading and link requirements justify them. Boot flash is not recording-data RAM. |

Power/PCB implementation is governed by [AMD UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB); configuration options are covered by [AMD UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config). A connector shape alone does not select a data protocol: choosing USB-C would not, by itself, implement USB.

## What can proceed now and what must precede ordering

Now: prepare a current requirements/pin table, develop the 200T schematic blocks, investigate a feasible bank/clock allocation, and test capture/link building blocks on Nexys with suitable stimulus and electrically compatible adapters. Verify expected throughput and frame/channel identity, not just successful JTAG detection.

Before layout is finalized: close the ASIC and KR260 interface definitions, power budgets, complete FPGA ordering code, connector pinout and physical envelope. Check the selected FPGA pin/clock/bank plan in Vivado and agree the stack-up with the fabricator.

Before ordering: complete routing; review electrical rules, clearances, timing/signal integrity and power; reconcile exact BOM/footprints and assembly files; prepare programming images, test access and first-power procedures. The existing RevB is still an old **35T** engineering draft with incomplete routing according to its saved PCB status (local archive: `Lab_FPGA_RevB_Compact/docs/PCB_status.md`). Its checks do not validate a new 200T board.

The Mac loader can load existing bitstreams. Creating a custom implementation requires a working Vivado build environment; AMD currently supports Vivado on specified **x86-64 Windows/Linux** systems, so identify a suitable local or remote build machine. See [AMD supported operating systems](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Supported-Operating-Systems).

## The first information to collect

1. From Gerald: one authoritative ASIC pin/electrical/timing/power package, the correct ASIC revision, and the intended recording mode.
2. With Zitong: one shared routing-to-FPGA connector drawing and measured mechanical envelope.
3. With David and the firmware collaborator: one agreed FPGA-to-KR260 interface with a throughput budget and receiver plan.
4. From Howard: prototype scope (recording only versus additional functions), physical/use limits, and acceptable cost/quantity.

After those inputs, selecting and validating most individual supporting components is PCB/FPGA engineering work; Howard does not need to supply every resistor or capacitor value.
