# Fourth-pass ASIC, pin and boot uncertainty review

26 September 2026. **No new saved boot-pin mismatch was found. The application electrical interface remains unqualified.** This pass examined what existing checks do not establish; it did not rerun unchanged native CAD checks, alter CAD or operate hardware. [Structured register and source hashes](ASIC_Boot_Uncertainties.json).

## What the previous checks establish

The accepted logical list is 117 names; 88 are **64 DATA + 8 returned CLK + 8 READ + 8 SYNC**. Prior native review verified 324 package pin definitions and saved FPGA pad/net correspondence. These are file-level results, not a complete 117-ball application map or demonstrated electrical operation.

**Clarification:** missing electrical limits apply to all ASIC interface classes, not only AC_IN/IMP_TST. A 1.5 V nominal supply is not a logic, load or powered-off specification. DS181 defines the FPGA side; it cannot supply the custom ASIC side. [AMD DS181](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

## Open items and closure conditions

### ASIC-01 — ASIC electrical limits for all 117 lines

**unresolved requirement; blocks release.**

Known: The accepted inventory is 117 logical lines. The tutorial gives a nominal 1.5 V ASIC supply, and a historical netlist wires AC_IN/IMP_TST directly to an ECP5 bank powered at 1.5 V. Custom ASIC symbol pins are passive; ERC cannot check thresholds or direction.

Open: ASIC VIH/VIL, VOH/VOL at stated load, absolute limits, leakage/clamp current, powered-off tolerance and capacitive loading. AC_IN/IMP_TST also lack an established function, direction and permitted waveform. Supply voltage alone does not establish compatibility.

Why it matters: Wrong thresholds can corrupt data; an incorrectly driven pin or active signal into an unpowered chip can cause excess current or damage.

Close when: Identify the ASIC revision and obtain a designer-approved pin electrical table or pad schematic. Calculate both directions against DS181 and actual rail/ground tolerances; resolve AC_IN/IMP_TST direction and waveform before assigning I/O standards.

Suggested owner: ASIC designer with FPGA hardware engineer (not a committed assignment).

User input: Provide the actual ASIC pad/interface specification or identify the ASIC designer who can approve one. A generic 512-channel paper cannot close this.

### ASIC-02 — Map logical slots to the physical eight ASICs and shared loads

**unresolved requirement; blocks release.**

Known: 88 returned wires expand into eight groups of eight DATA plus CLK/READ/SYNC. Other names include four recording clocks, four SPI clocks, four chip-specific L/R programming pairs and two board-shared L/R pairs.

Open: No authoritative matrix identifies each physical ASIC/carrier/channel order, which chips each clock drives, the four stimulation-chip slots, or every receiver on a shared control. Four clocks and eight ASICs do not prove physical pairing.

Why it matters: Correct contact counts can still control the wrong chip, merge independent signals, overload a shared control or mislabel channels.

Close when: A reviewed routing-board schematic/table maps every logical name to physical ASIC/pad/carrier, enumerates shared loads and matches both mezzanine sides contact by contact.

Suggested owner: ASIC/routing-board designer with FPGA hardware engineer (not a committed assignment).

User input: Provide or confirm the eight-ASIC placement/group map and which chips/boards use stimulation. A marked-up routing schematic is sufficient.

### ASIC-03 — Define inactive states and power/reset transitions

**unresolved requirement; blocks release.**

Known: PUDC_B is pulled high and the constraint fragment requests UNUSEDPIN Pullnone. Application nets have no completed external inactive-state network. The tutorial describes sequences but not a complete startup electrical contract.

Open: Reset polarity/pulse timing, inactive levels, latch behavior, stimulation inhibit and clock start/stop rules during ramp, failed configuration, reprogramming, power loss and partial-board power.

Why it matters: ASICs can start in an unknown state or see unintended reset/programming/stimulation edges before valid firmware owns the pins.

Close when: An ASIC-approved power/configuration state and timing table; necessary external pulls/interlocks calculated from leakage/load bounds; verify transitions with missing clocks and either board independently powered.

Suggested owner: ASIC designer and FPGA hardware/firmware engineers (not a committed assignment).

User input: Confirm reset/stimulation inactive states through the same ASIC interface specification requested in ASIC-01; this is not a separate user engineering task.

### ASIC-04 — Assign and constrain the application pins and eight returned clocks

**known unfinished; blocks release.**

Known: Prior package evidence found 150 positions on 1.5 V banks and 12 P-side clock groups for eight returned clocks. All 117 FPGA balls remain TBD. The full-system XDC constrains only local P17 at 32 MHz.

Open: No complete ball allocation, clock-region/tree plan, source-synchronous input delays, routing skew budget, output drive/slew/fanout analysis or CDC/reset-crossing implementation.

Why it matters: A sufficient raw pin count can still fail placement, setup/hold timing or reliable sampling.

Close when: Using actual ASIC timing, implement one complete schematic/ball/XDC contract on the selected Vivado part. Review DRC, timing, clock-use and CDC reports with no unjustified dedicated-route overrides or unconstrained external paths.

Suggested owner: FPGA implementation engineer with PCB engineer (not a committed assignment).

User input: Engineering work; the ASIC electrical/timing source above is the external dependency.

### ASIC-05 — Select the exact FPGA ordering grade

**unresolved design choice; blocks release.**

Known: U1 speed/temperature grade remains TBD. Present core power assumes a standard 1.0 V grade. DS181 specifies 0.92-0.98 V for -1LI.

Open: No exact orderable speed/temperature code, operating-temperature envelope or matching implemented Vivado target is frozen.

Why it matters: Procurement could substitute an incompatible voltage variant, or the application could exceed the selected grade's timing/temperature limits.

Close when: Freeze a traceable standard-voltage part, confirm package/temperature/availability, use its exact tool part and close timing/power/thermal checks for that grade.

Suggested owner: Hardware/FPGA engineer and procurement (not a committed assignment).

User input: Provide the marking/order code only if already purchased or mandated; otherwise engineering can propose and qualify a part.

### BOOT-01 — Prove flash cold boot and recovery on the selected revision

**unverified behavior; blocks release.**

Known: Minimal core uses 3.3 V configuration; rail revision uses 1.8 V equivalents and CFGBVS=GND. Saved boot nets passed the prior file audit. Current AMD Artix-7 programming documentation includes MX25U12835F under the mx25u12872f alias.

Open: Installed Vivado cfgmem selection/read-ID, programming through custom JTAG, flash startup versus rail ramp, brownout/QPI recovery and repeated cold boot are unverified.

Why it matters: A consistent schematic may still fail to load its image or lack recovery through the intended external port after interruption.

Close when: Board-hash-specific build/bridge; verify exact flash ID/algorithm; measure rails, INIT_B, DONE and CCLK against flash startup/reset limits; record cold/warm/brownout/reprogramming recovery and the fallback path.

Suggested owner: FPGA boot/firmware engineer with hardware engineer (not a committed assignment).

User input: No separate user answer; implementation and hardware qualification remain.

### BOOT-02 — Create a current firmware and bring-up target

**known unfinished; blocks release.**

Known: The root blink build now warns it belongs to a legacy board with the removed LED and 3.3 V constraints. minimal_core has no matching bring-up target; full_system contains only core.xdc.

Open: No current HDL/build, observable self-test using existing access, acceptance procedure or proven XEM GPIO remote-JTAG bridge. Target voltage must match the selected board.

Why it matters: The old build cannot validate these boards; the intended connector may not provide a working programming/debug path on first assembly.

Close when: Reproducible current-board HDL/XDC/part/flash build and readable test result through existing access; a reviewed power-on/recovery procedure naming board/firmware hashes and actual JTAG electrical interface.

Suggested owner: FPGA firmware engineer with bring-up/test engineer (not a committed assignment).

User input: Engineering can implement this; extra LEDs, headers and test points are not assumed mandatory.

### ASIC-06 — Prove sample identity, frame alignment and control behavior

**unverified behavior; blocks release.**

Known: The tutorial describes 1024 clocks/frame, one SYNC and 16 READ events; each data wire multiplexes four ADC groups. Link arithmetic depends on extracting/packing 12-bit samples rather than forwarding 16 bits/sample.

Open: No eight-ASIC implementation proves sample bit/order mapping, frame alignment across returned clocks, missing/extra edge detection, restart, gain/stimulation command semantics or channel identity at the PC.

Why it matters: A link can move the expected byte rate while silently mislabeling channels, losing samples or applying commands incorrectly.

Close when: ASIC-referenced golden vectors/channel map and timing contract; simulate edge cases, implement loss flags/counters/recovery, then compare controlled ASIC inputs/readback with recorded PC output for every channel and intended control.

Suggested owner: ASIC/FPGA firmware engineers with acquisition software engineer (not a committed assignment).

User input: Engineering validation using the same ASIC protocol source/designer confirmation requested above.

## Small external-input request

The external information needed is the **actual ASIC interface/pad specification** (including timing and startup states) and the **eight-chip physical/group map**. One designer-approved document or marked-up schematic can address these together. If a specific 100T is already purchased, provide its order code; otherwise part selection is engineering work. Remaining rows are implementation or qualification tasks, not questions the user must answer.

The current AMD Artix-7 table explicitly covers MX25U12835F via the `mx25u12872f` family alias. This answers whether the published tool table names the family; it does not prove the installed tool, flash ID, rail behavior or custom programming bridge. [AMD UG908, 2026.1](https://docs.amd.com/r/en-US/ug908-vivado-programming-debugging/Artix-7-Configuration-Memory-Devices).

Evidence: [third-pass pin/boot audit](../triple_check/Pin_Boot_Review.md), [ASIC source investigation](../research/AC_IN_IMP_TST_Primary_Source_Review.md), [current bring-up status](../research/Current_Design_Bringup_Status.md), [AMD configuration guide](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content). The structured register records evidence per item.

