# Questions for Gerald: FPGA PCB

> Historical source note. Current XC7A200T/micro-HDMI decisions supersede older link/device proposals. See [current status](../current-status.md). Text is retained with navigation adapted; unshipped local references are marked as archive paths.

Prepared 18 September 2026.

## G01. Which exact ASIC and carrier revisions are current, and which files are authoritative?
- Bring / answer: Revision/date, released schematic, pin map, known changes from slides/repository.
- Why: Avoid designing to an old revision.
- Owner / source: Gerald / ASIC designer; versioned design archive.
- Answer / next step:

## G02. Can we get the connector-to-ASIC contact table and exact mating connector/orientation?
- Bring / answer: Contact number, signal, ASIC identity, direction, power/ground role, part numbers and pin-1 drawing.
- Why: Closes connector and routing correctness.
- Owner / source: Gerald + carrier designer; CAD/pin sheet, then continuity check.
- Answer / next step:

## G03. Is 1.5 V digital I/O correct for this ASIC revision, and what are its guaranteed limits?
- Bring / answer: Nominal/tolerance, VIH/VIL, VOH/VOL, absolute maximum, behavior while unpowered.
- Why: Selects FPGA bank voltage and any level translation/isolation.
- Owner / source: ASIC designer specification; Gerald identifies the source.
- Answer / next step:

## G04. What clock-to-data, setup/hold, edge and duty-cycle limits apply at the carrier connector?
- Bring / answer: Timing diagram with minimum/maximum values and returned-clock relationship.
- Why: Enables FPGA timing constraints and PCB skew budget.
- Owner / source: ASIC specification/characterization; our team measures the implementation.
- Answer / next step:

## G05. Has this ASIC/carrier been validated at 32 MHz / 31.25 kS/s/channel, and why is reference code at 16 MHz?
- Bring / answer: Tested modes, measured sample rates and reason for lower-rate code.
- Why: Separates target bandwidth from already-demonstrated silicon operation.
- Owner / source: Gerald / hardware-test owner; test logs and reference firmware.
- Answer / next step:

## G06. What reset, clock-start and gain-programming sequence is required?
- Bring / answer: Polarities, pulse lengths, startup order, settling delay and known-working configuration.
- Why: Determines boot logic and safe pull levels.
- Owner / source: Gerald / ASIC designer; operating procedure plus bench verification.
- Answer / next step:

## G07. Which clocks/resets/programming/stimulation signals can be shared across eight ASICs?
- Bring / answer: Mark each shared/per-chip; fanout limit and inter-chip synchronization tolerance.
- Why: Closes total signal count and clock buffering requirements.
- Owner / source: Gerald for experiment; ASIC designer for electrical limits; we design buffers.
- Answer / next step:

## G08. Where are the left/right programming map, gain calibration and AC_IN/IMP_TEST pin specifications?
- Bring / answer: Bit/register tables, legal defaults, gain table, auxiliary pin role/range/unused termination.
- Why: Prevents sending correctly timed but semantically wrong settings.
- Owner / source: Gerald / ASIC designer; configuration files and pin specifications.
- Answer / next step:

## G09. Are five 1.5 V rails, VDD_CGEN=1.6 V and REF_VCM=0.75 V correct for the current chip?
- Bring / answer: Each rail name, approved voltage/tolerance and load served.
- Why: Confirms the resistor-derived setpoints before reuse.
- Owner / source: Gerald / ASIC designer; validated schematic and specification.
- Answer / next step:

## G10. Do we have typical and peak current per rail in reset, recording and stimulation?
- Bring / answer: Per-ASIC table with clock, channels and operating condition; if absent, identify board/test points.
- Why: Allows regulators, traces and thermal estimates to be sized.
- Owner / source: Existing characterization/simulation, or measurements our team performs.
- Answer / next step:

## G11. What noise/ripple, startup ramp/order and shutdown requirements apply?
- Bring / answer: Numerical noise limit and bandwidth; allowed rail differences, sequencing and ramp limits.
- Why: Defines regulator/filter design and a measurable acceptance test.
- Owner / source: ASIC designer requirements; our team verifies the power system.
- Answer / next step:

## G12. Should VDD10 be +9 V or +10 V, and is R9 really 90 kohm on the tested board?
- Bring / answer: Approved VDD10 and INPUT_VDD10 values, assembled R9 value and tested revision.
- Why: The provided U8 SET calculation gives +9 V despite its name.
- Owner / source: Gerald / regulator-board designer; actual measurement and released files.
- Answer / next step:

## G13. What should INPUT_VSS10 and VSS10 be, and is U9/R8 the validated topology?
- Bring / answer: Input/output voltages, current direction, known-working schematic and measured output.
- Why: The floating positive LDO does not simply create -10 V.
- Owner / source: Gerald / regulator designer; LT3042 analysis and bench check.
- Answer / next step:

## G14. Which exact LT3042 package was assembled, and is there a corrected symbol-to-pad map?
- Bring / answer: Complete part number, MSOP/DFN package, pin 1-10/EP mapping, released PCB/BOM.
- Why: Old symbols use MSE numbering while footprint fields specify DFN.
- Owner / source: Gerald / board designer; assembly records and ADI package pinouts.
- Answer / next step:

## G15. Which input feed is intended, and where are AGND/DGND/shields joined?
- Bring / answer: Resolve old +2 V versus 3V3 input; give voltage tolerance and exact ground junction/location.
- Why: Avoids combining incompatible references or incomplete return paths.
- Owner / source: Gerald identifies working pairing; we check full schematic and continuity.
- Answer / next step:

## G16. Which rails must be local/per-chip, and which may share regulators?
- Bring / answer: Allowed groups, supporting noise/crosstalk results and an agreed test if unknown.
- Why: Determines whether 7, 28 or 56 low-voltage LDOs are needed and their overhead.
- Owner / source: Gerald for signal-quality goals; ASIC designer and our measurements for sharing.
- Answer / next step:

## G17. What concurrent stimulation must the first board support?
- Bring / answer: Active outputs per chip/stack, maximum current, pulse duration, repetition and duty cycle.
- Why: Defines peak and average supply load; chip capability alone is insufficient.
- Owner / source: Gerald / experiment owner; we calculate and test resulting power.
- Answer / next step:

## G18. Which configuration files and STIM_EN/CLK/START/CHB waveforms are known to work?
- Bring / answer: Example bitstreams/spreadsheets, pulse count and expected timing traces.
- Why: Verifies actual control semantics rather than relying on comments.
- Owner / source: Gerald / original control author; our FPGA implementation reproduces it.
- Answer / next step:

## G19. What samples are invalid during/after stimulation, and how long until recovery?
- Bring / answer: Reset/blanking timing, valid-data delay and required metadata marking.
- Why: A continuous USB stream does not mean continuously valid neural data.
- Owner / source: Gerald / ASIC characterization; our firmware marks and verifies data.
- Answer / next step:

## G20. What states are required at power-up, lost configuration, stopped clock, cable disconnect and reset?
- Bring / answer: Control levels, electrode/stimulation state and charge-balance requirements.
- Why: Determines pull resistors and interlocks; validate on dummy loads.
- Owner / source: Gerald / ASIC designer operating procedure; our team tests behavior.
- Answer / next step:

## G21. Which carrier dimensions and keep-outs must remain despite flexible board size?
- Bring / answer: Connector position/height, wire-bond clearance, thickness, mounts and flex bend limits.
- Why: Keeps the new board compatible with the existing stack.
- Owner / source: Carrier designer/Zitong + Gerald; CAD and measured hardware.
- Answer / next step:

## G22. How long must a recording run, and what should happen if a downstream stall fills the buffer?
- Bring / answer: Required run duration; permitted losses if any; stop/flag/drop behavior and maximum tolerated gap.
- Why: Determines RAM capacity, error handling and storage requirements.
- Owner / source: Gerald/experiment owner defines behavior; our team measures actual stalls.
- Answer / next step:

## G23. How accurately must all ASICs and any external experiment trigger be aligned?
- Bring / answer: Allowed inter-chip/time-stamp error, trigger voltage/direction and event timing requirements.
- Why: Determines clock/trigger connectors, synchronization logic and timestamp format.
- Owner / source: Gerald/experiment owner; ASIC timing sources and our implementation tests.
- Answer / next step:

## G24. What measurable results define a successful eight-ASIC bench demonstration?
- Bring / answer: Full-rate duration, allowed frame errors, gain/channel/noise checks and required stimulation tests.
- Why: Turns completion into a repeatable test rather than a subjective impression.
- Owner / source: Gerald agrees experiment criteria; our team supplies test results.
- Answer / next step:
