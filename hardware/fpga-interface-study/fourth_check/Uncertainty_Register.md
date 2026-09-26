# Fourth review: uncertainties and how to close them

26 September 2026. **18 open uncertainties; six known implementation gaps; no manufacturing release.** This is the consolidated current action list. Proposed owner roles are not accepted personal assignments.

**Slide follow-up:** [Review of Gerald’s complete deck](../slide_review/Gerald_ASIC_Slide_Review.md) refines framing, bit order, SPI direction and normal stimulation sequence. It identifies conflicting timing and channel labels. No complete uncertainty is closed.

**Size follow-up:** [Circled-space review](../size_optimization/Size_Optimization_Review.md) adds a separate 37.5 × 36 mm placement study while preserving the three baseline boards. Full circuit integration and final size remain open.

Power setup, exact pin choices, cable/component selection, receiver circuitry and firmware remain engineering tasks; the user is not being asked to design them.

## Information to obtain from the lab/system owner

- **Actual ASIC and mating-board specification:** ASIC revision and pad limits, corrected channel map and stimulation timing, complete SPI workbook/serializer and inactive states; physical eight-chip/group map; actual routing-board power and mating CAD. Tutorial framing and functional directions are now documented. A designer-approved specification or marked-up schematic can resolve the remaining points. Owner: ASIC/carrier/routing designers.
- **Operating and recording requirements:** Required acquisition/stimulation modes and command latency, maximum ambient/enclosure, intended recording duration, and permitted behavior when the PC stalls or disconnects. The actual PC/USB/storage is needed for final qualification. Owner: System/lab owner; engineering can continue with explicit provisional targets.
- **Already-purchased parts, only if applicable:** Exact FPGA marking/order code if already purchased or mandated; otherwise engineering can select and qualify the standard-voltage part. Owner: Procurement / Howard if already purchased.

## Open uncertainties

### U01 — ASIC electrical limits

**First step:** Lab/system information first. **Proposed owner:** ASIC designer + FPGA electrical design.

**Known:** The accepted count is 117. Slides 13–14 and 25–28 show recording/control directions: CLK_IN, resets, SPI L/R/CLK/LATCH and stimulation controls go FPGA to ASIC; CLK_OUT, DATA, READ and SYNC return to FPGA. The underlying table lists 1.5 V nominal supply; that row is hidden by an overlay in the visible slides.

**Uncertain:** Guaranteed logic thresholds, output drive, load/leakage, absolute limits and powered-off behavior are absent for the full interface. AC_IN and IMP_TST still lack confirmed functions and directions. A nominal supply is not a guaranteed I/O specification.

**Close when:** Obtain a versioned ASIC pad specification or designer-approved table for all signal classes; compare limits against the selected FPGA standard and power states.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md) · [AC IN IMP TST Primary Source Review](../research/AC_IN_IMP_TST_Primary_Source_Review.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U02 — ASIC timing and sample format

**First step:** Lab/system information first. **Proposed owner:** ASIC designer + acquisition firmware.

**Known:** Slides 15–17 show 32 MHz recording, 1,024 clocks/frame, 16 READ groups, and 16 zero clocks plus 48 payload clocks/group. Samples are bit-interleaved A1 bit 0, A2 bit 0, A3 bit 0, A4 bit 0 through bit 11. Slide 26 specifies four 3-bit DR suffix fields and shows a stream ending at bit 2124.

**Uncertain:** Capture edge, setup/hold, delay/skew/jitter limits, ADC numeric coding and pause/restart behavior remain unqualified. The channel table duplicates A49/A57 and omits A50/A59. Full SPI packing is missing. Stimulation timing conflicts: 31.25 us, 32 us/step and 60 kHz; the <200 Hz limit also conflicts with a 5 ms example.

**Close when:** Obtain a corrected versioned channel map, ADC coding, full SPI serializer/workbook and stimulation timing; approve guaranteed pad timing, then constrain and verify capture against an accepted model and measured waveforms.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U03 — Which physical chip uses each signal

**First step:** Lab/system information first. **Proposed owner:** ASIC/carrier and routing designers + FPGA design.

**Known:** The 117 names have proposed contacts across two 60-contact connectors. The tutorial describes eight serial DATA outputs per ASIC and an illustrative DATA1 channel map with duplicate/missing labels.

**Uncertain:** ASIC1–8 and BOARD1–4 are logical slots; the actual stimulation-chip, non-stimulation board, clock and SPI-sharing groups are not mapped end to end.

**Close when:** Produce matching ASIC pad → carrier → routing board → mezzanine → FPGA tables, with direction and shared-net loading; review both mating sides.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U04 — Inactive states during startup and faults

**First step:** Lab/system information first. **Proposed owner:** ASIC designer + power/FPGA design.

**Known:** Slides 27–28 depict SPI load, assert STIM_EN, pulse STIM_START, then STIM_CHB after 64 STIM_CLK cycles. Chip_Reset and FE_RESET functions are described. PUDC_B is pulled high; the templates disable bias on unused pins after configuration.

**Uncertain:** Asserted reset polarity, pulse width/settling, drive ownership and safe preconfiguration, brownout and reprogramming states remain unspecified. Positive-going normal-operation drawings do not approve default bias or fault interlocks; the listed <1.5 ms reset time is not a digital pulse-width specification.

**Close when:** Approve a state table for every shared control and power state, implement required bias/interlocks, and test power-order and configuration-failure cases.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md) · [Power Link Uncertainties](Power_Link_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U05 — ASIC-board power and return paths

**First step:** Lab/system information first. **Proposed owner:** ASIC/routing power designer + system power design.

**Known:** The 120 numbered mezzanine contacts contain 117 signals plus three reserves; ground blades are separate. The tutorial gives about 17.24 uW/channel for recording, excluding LDOs, and ±10 V stimulation compliance; neither defines the assembly power tree.

**Uncertain:** ASIC analog/digital/stimulation supplies, their source, return currents and any separate power connector are not allocated in this interface. The FPGA 1.5 V I/O rail is not an approved ASIC power supply.

**Close when:** Define the complete assembly power tree and current budget; specify which board supplies every ASIC rail and its return, including powered-off cases.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md) · [CAD Mechanical Uncertainties](CAD_Mechanical_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U06 — Exact FPGA ordering code

**First step:** Engineering design/verification first. **Proposed owner:** FPGA electrical design + procurement.

**Known:** XC7A100T in 15 × 15 mm CSG324 is selected; the proposed core supply is approximately 1.0 V.

**Uncertain:** Speed and temperature grades are unselected. A low-voltage -1LI device is not interchangeable with the present core supply, and link timing depends on grade.

**Close when:** Freeze the full purchasable order code, check every supply limit and timing target, and use that exact part in the Vivado project and BOM.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md).

### U07 — Legal FPGA pin and clock allocation

**First step:** Engineering design/verification first. **Proposed owner:** FPGA hardware + timing design.

**Known:** The 324-pin inventory matches AMD; 150 pads are in the 1.5 V banks, with 12 P-side clock groups and four complete bank-16 differential pairs.

**Uncertain:** Capacity does not prove placement legality. The 117 application nets, eight link pads and eight returned-clock domains have no implemented pin/timing allocation.

**Close when:** Create complete XDC and HDL, check bank voltages and clock regions, constrain all interfaces and CDC, and obtain clean implementation/timing reports for the selected device.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md).

### U08 — Mezzanine mating and complete assembly fit

**First step:** Engineering design/verification first. **Proposed owner:** Routing/FPGA mechanical design + connector manufacturer.

**Known:** Two QSH-030-01-L-D-A candidates fit the 40 × 36 mm 2D study; QTH mates use a different land pattern.

**Uncertain:** Mating-board orientation, contact numbering, tolerance, board separation, component heights and support/fastening are unqualified. The documented H-dimension ambiguity remains open.

**Close when:** Resolve the manufacturer drawing ambiguity; build both mating PCB footprints with exact order codes, check pin-1 continuity and full 3D/tolerance/assembly clearance.

Evidence: [CAD Mechanical Uncertainties](CAD_Mechanical_Uncertainties.md).

### U09 — Micro-HDMI part, edge and cable construction

**First step:** Engineering design/verification first. **Proposed owner:** Connector/cable + PCB mechanical design.

**Known:** J4 carries a custom non-HDMI interface. Its saved edge datum is 0.70 mm inside the actual board edge.

**Uncertain:** Exact order code, plug fit, approved copper-edge clearance, wire mapping, shield/return construction, current rating and cable length qualification are not frozen.

**Close when:** Choose a specific connector and custom cable; reconcile its current drawing with the PCB edge, verify continuity/orientation, mating access and loaded cable behavior.

Evidence: [CAD Mechanical Uncertainties](CAD_Mechanical_Uncertainties.md) · [Power Link Uncertainties](Power_Link_Uncertainties.md).

### U10 — Actual FPGA power and temperature

**First step:** Engineering design/verification first. **Proposed owner:** FPGA power/thermal design.

**Known:** The rail allocations and tolerance calculations are provisional; no workload-based power estimate or assembled-board measurement exists.

**Uncertain:** Worst-case rail current, converter efficiency/stability, voltage droop and device/inductor temperature are unknown at the real acquisition workload and operating environment.

**Close when:** Complete a workload/activity-based power model, allocate rail margins and capacitor bias/temperature effects, then test load steps, rails and thermal rise on the completed assembly.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md).

### U11 — Power-entry protection and power ordering

**First step:** Engineering design/verification first. **Proposed owner:** Carrier and FPGA power design.

**Known:** Protected 12 V, 0.60 A continuous and a cable up to 0.30 m are design proposals; the proposed protection and damping are not installed.

**Uncertain:** Source tolerances, inrush, current limiting, hot-plug overshoot, ESD, shutdown order and back-powering across independently powered boards are unqualified.

**Close when:** Implement a complete protected source/entry and power-state design with actual cable/load values, then verify startup, faults, cable events and power loss against component limits.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md).

### U12 — XEM8310 contacts and voltage/ready contract

**First step:** Engineering design/verification first. **Proposed owner:** Receiver carrier + receiver firmware.

**Known:** XEM8310 is an FPGA/USB receiver module. Bank64 VIO1 defaults to 1.0 V; BOARD_READY is initialization status, not continuous rail monitoring.

**Uncertain:** Exact module contacts, bank selection, stored VIO settings, target-JTAG GPIOs and startup/loss-of-power interlock are not implemented.

**Close when:** Freeze the carrier schematic and pin map; verify stored voltages and compatible I/O standards, explicit training/readiness and behavior through reconfiguration and power loss.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md).

### U13 — LVDS and JTAG electrical margins

**First step:** Engineering design/verification first. **Proposed owner:** FPGA/receiver signal-integrity design.

**Known:** A direct DC LVDS connection lacks guaranteed positive ground-offset allowance at published corners; this is not proof every cable fails.

**Uncertain:** Receiver bias/termination or AC coupling, per-lane balance, return-path offset, jitter/skew and static JTAG levels/timing are not qualified.

**Close when:** Choose and implement the receiver network and JTAG voltage scheme; analyze worst-case levels and transients, then measure link eye/error margin and JTAG over the actual cable.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md).

### U14 — Data packing, USB boundaries and control protocol

**First step:** Engineering design/verification first. **Proposed owner:** FPGA/receiver/host firmware.

**Known:** Each READ group has 16 zero clocks followed by 48 payload clocks (25% padding), carrying interleaved 12-bit samples needing deinterleaving. Three proposed 800 Mbit/s lanes provide 240 MB/s after 8b/10b; packed 12-bit samples fit the arithmetic budget, 16-bit sample padding does not.

**Uncertain:** ADC coding, complete SPI serialization and corrected stimulation timing remain unapproved. Lane alignment, encoding, frame/CRC metadata, USB boundaries, commands and remote programming have no implemented contract. The proposed 6,165-byte frame does not itself meet 32-bit word / 16-byte USB boundaries.

**Close when:** Specify continuous repacking or padding/aggregation, byte/channel order, lane training and command handling; simulate and verify the exact wire-to-USB-to-file format.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U15 — Buffering and data loss during host stalls

**First step:** Lab/system information first. **Proposed owner:** Receiver memory + host acquisition design.

**Known:** The proposed four LVDS pairs all travel toward the receiver. USB throttling alone does not stop incoming ASIC data. At the proposed framed rate, a 100 ms no-drain interval needs about 19.27 MB; this is arithmetic, not tested buffering.

**Uncertain:** Allowed host stall, usable buffer depth/bandwidth, reverse flow control, and overrun/recovery policy are undefined. The tutorial starts recording with CLK_IN but does not authorize stopping or restarting it as lossless backpressure.

**Close when:** Set a bounded stall requirement; size and implement buffering with sustained read/write bandwidth, define loss/backpressure policy, and stress-test a stalled host with sequence/error counters.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U16 — Manufacturing process and final minimum size

**First step:** Engineering design/verification first. **Proposed owner:** PCB layout + fabricator/assembler.

**Known:** The three baseline studies retain 40 × 36 mm outlines and six copper layers. A separate 128-part 37.5 × 36 mm placement candidate retains both mezzanines and reduces area 6.25%; it has no routed copper or integrated schematic. Final minimum size remains unverified.

**Uncertain:** No approved dielectric stackup, impedance, full BGA escape, fabrication/assembly process, final BOM or integrated smallest board exists.

**Close when:** Select an achievable fabricator stackup/process, integrate all required circuits/connectors, route and review SI/PI/DFM and assembly tolerances; derive the final outline from that completed design.

Evidence: [CAD Mechanical Uncertainties](CAD_Mechanical_Uncertainties.md) · [Size review](../size_optimization/Size_Optimization_Review.md).

### U17 — Boot recovery and test access without headers

**First step:** Engineering design/verification first. **Proposed owner:** FPGA bring-up + test fixture design.

**Known:** Optional LED, debug headers and test points are removed. The older blink procedure is legacy-only; compact revisions have different configuration voltages. Tutorial ASIC reset functions do not define this compact FPGA board’s bring-up sequence.

**Uncertain:** No matching validated build, power-on procedure, fixture access plan or demonstrated flash brownout/reset/recovery exists for either compact revision.

**Close when:** Create a revision-specific HDL/XDC/build and test procedure, select supported flash programming, identify accessible existing pads/J4, and verify JTAG, rail ramps, clock and cold-boot recovery.

Evidence: [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md) · [Gerald ASIC Slide Review](../slide_review/Gerald_ASIC_Slide_Review.md) · [Independent Timing Read](../slide_review/Independent_Timing_Read.md).

### U18 — Measured full-system operation

**First step:** Prototype measurement required. **Proposed owner:** System integration + lab validation.

**Known:** No assembled instance of this design has demonstrated power-up or acquisition; earlier ECP5 tests concern another system.

**Uncertain:** Functional correctness, all-channel mapping, sustained throughput to disk, error rate, thermal margin and repeatable recovery remain unmeasured. The intended PC/storage and required recording duration are not fixed; compact framing produces about 693.56 GB/hour before storage overhead.

**Close when:** After engineering closure, run a documented prototype acceptance plan with known channel patterns and real ASIC data, power cycling, fault recovery and sustained disk capture with error counters.

Evidence: [Power Link Uncertainties](Power_Link_Uncertainties.md) · [ASIC Boot Uncertainties](ASIC_Boot_Uncertainties.md).

## Known unfinished work — not uncertain findings

- **G01 · No single integrated full-board design:** The core, rail revision and mezzanine fit are separate. Integrate the selected rails, both mezzanines and required headboard circuitry into one complete headboard schematic/PCB; provide a matching separate carrier/cable interface design.
- **G02 · Application pins are unassigned:** Both schematics have 203 unassigned FPGA user I/O and eight unassigned J4 data contacts. The mezzanine study has 120 unassigned numbered contacts; the 117 signal CSV is only a proposal.
- **G03 · Assigned copper is unfinished:** Third-pass native DRC records 139 missing items in the core, 347 in the rail revision and 383 in the placement study. These counts exclude unassigned application signals.
- **G04 · Full firmware and receiver are not implemented:** No complete application HDL/XDC, carrier, packet/USB path or matched compact-board build has been validated.
- **G05 · Manufacturing outputs are not released:** The exact BOM, stackup, Gerbers, drills and assembly files have not been released from one completed reviewed design.
- **G06 · Prototype acceptance has not happened:** No operating hardware evidence exists for these compact revisions. File checks and repeated reviews cannot replace measured acceptance.

[Fourth-review summary](../Fourth_Check_Review.md) · [Structured register](Uncertainty_Register.json) · [Unchanged-source evidence](Source_Continuity.json).

Older DRC/ERC results retain their original third-pass scope and hashes. The slide review does not connect unassigned nets, qualify an electrical interface, or demonstrate a working prototype.
