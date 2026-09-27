# USB-C power design review

27 September 2026. Status: concrete schematic handoff; physical integration, firmware and hardware qualification remain in progress.

## Power path and why the parts are present

`USB_VBUS_RAW → Q200/TCPP01 protection → VBUS_PROTECTED → U202 eFuse → USB_MAIN_VIN → existing four TPS62135 rails`.

U201 derives an independent `USB_AON_3V3` supply from `VBUS_PROTECTED`. It powers the USB/PD MCU, orientation mux and JTAG control side before the FPGA is powered or programmed. It does not depend on an FPGA bitstream.

U200 (TCPP01-M12) provides the connector CC protection, its own initial dead-battery Rd termination, VBUS overvoltage detection and Q200 gate driver. Q200 interrupts the incoming high-current path. D200 and C201 form the reference circuit's diode-isolated IN_GD bias/ESD reservoir. Their actual polarity and connections were visually verified against ST DS12900 Rev7 Figure4, then independently against ST's UM2773 reference schematic. C202/C203 are on the **connector side** of CC protection. The STM32 DBCC pins must be grounded in this TCPP arrangement; tying them to CC as in an unprotected MCU-only example would be the wrong reference topology. [ST datasheet, pp2,4,12–13](https://www.st.com/resource/en/datasheet/tcpp01-m12.pdf), [current reference schematic](https://www.st.com/resource/en/schematic_pack/x-nucleo-snk1m1_schematic.pdf).

D201 is the ST reference family's 22 V standoff raw-port TVS. It must be very close to connector VBUS/ground. It is not a claim that all downstream parts see a voltage below their DC absolute maximum during every ESD or surge. The complete protection path and the chosen external FET require a transient test. Q200 uses **STL6N3LLH6**, the2×2 mm FET explicitly listed by ST's UM2773 Rev5 Table1 for this protection circuit. The current ST product page lists it as Active. It has30 V drain and±20 V gate ratings, with40 mΩ maximum resistance at4.5 V gate drive. Root accepted this smaller reference-supported choice on27 September. The manufacturer's top-side PCB land pattern contains six numbered outer terminals plus separate exposed drain/source lands, represented by repeated pad1/pad4; all eight physical lands are retained. [ST MOSFET data](https://www.st.com/resource/en/datasheet/stl6n3llh6.pdf), [ST reference user manual](https://www.stmcu.jp/wp/wp-content/uploads/2021/05/UM2773_Rev5.pdf), [TVS family data, Table10](https://www.st.com/resource/en/datasheet/esda15p60-1u1m.pdf).

U201 (TPS70933DRVR, 2×2 mm WSON) produces 3.3 V. Its EN pin is deliberately open, as permitted for always-on operation; connecting that pin to the 9 V input would exceed its pin rating. Its output must retain at least 1.5 µF effective capacitance after voltage, tolerance, temperature and aging. C206 provides local nominal4.7 µF; MCU/mux capacitors are additional and must be included in attach tests. [TI TPS709](https://www.ti.com/lit/ds/symlink/tps709.pdf).

U202 is **TPS259474LRPWR**, the circuit-breaker/latch-off variant with true output-voltage PG. It is not TPS259470L: the latter's AUXOFF stays high on several load faults and is not an equivalent power-good monitor. R203 holds the main enable low while the MCU is blank, reset or not authorizing power. R204/R205 set overvoltage rejection, R206 sets the overload threshold, C207 controls the initial main-input ramp, and R207/R208 measure the output. ITIMER is intentionally unconnected for the shortest overload delay. There is no FLT pin on this selected variant; the MCU observes loss of PG and controls recovery. [TI TPS25947, Table5-1 and §§7.3.5,7.3.8,7.3.11](https://www.ti.com/lit/ds/symlink/tps25947.pdf).

The eFuse `FPGA_PWR_GOOD` output is pulled up to the independent 3.3 V rail through R209 (47 kΩ). R212/R213 (100 kΩ each) divide it into `FPGA_CORE_EN`, which replaces the old raw-input connection on U2.8. This distinction matters: TI specifies up to 1.0 V on unpowered PG, which can exceed the buck’s 0.77–0.83 V enable threshold. The divider keeps core EN at or below 0.510 V in that condition, below the 0.67 V minimum falling threshold. With AON screened over 3.2–3.4 V, resistor tolerances and worst documented pin leakage, normal core EN is at least 1.216 V and the MCU’s PG input is at least 2.462 V, giving at least 0.222 V margin above its 0.7×VDD high threshold. The MCU retains the undivided PG input and disables its internal pull resistors. [Divider review and corner calculations](PG_Enable_Divider_Review.json). Existing `PG_CORE → AUX EN → PG_AUX → both I/O EN` sequencing remains unchanged. The old R10/R11 PG pull-ups remain inside the 5/9 V regulator domain; do not connect them directly to STM32 GPIOs. All four buck feedback networks, inductors and output capacitors are retained.

## Design values and operating policy

| Item | Proposed value / result | Meaning |
|---|---:|---|
| Preferred input | 9 V PD, contract ≥2.5 A; adapter target9 V3 A | Enough allowance for the hardware breaker maximum plus bootstrap current. This is source capability, not measured consumption. |
| Fallback input | 5 V only with explicitly detected3 A capability and verified load budget | Default USB power does not enable the FPGA. |
| TCPP OVP divider | 100 kΩ /13.7 kΩ | 10.54 V nominal; threshold/resistor screening9.786–11.319 V. |
| eFuse OVP divider | 82.5 kΩ /10 kΩ | 11.10 V nominal; screening10.749–11.517 V. |
| eFuse PG divider | 24.9 kΩ /10 kΩ | Rising4.188 V nominal, screening4.070–4.330 V; falling3.804 V nominal. PG also requires the internal switch to complete startup. |
| Overload resistor | 1.65 kΩ ±1% | 2.028 A nominal; approximately1.782–2.222 A including resistor tolerance. It trips/latches; it is not a 2 A continuous-current regulator. |
| Main soft-start | 3.3 nF | Approximately0.606 V/ms; 135.5 µF nominal charges at82 mA, 8.25 ms to5 V or14.85 ms to9 V. These are nominal capacitor-only estimates. |
| Always-on budget | 50 mA at3.3 V | Conservative architecture allocation, not measured MCU/mux/USB/JTAG draw. |
| LDO at9 V/50 mA | 0.285 W | About20.8 °C rise using73.1 °C/W JEDEC thermal resistance; actual compact-board temperature requires measurement. |
| MCU VBUS ADC | 220 kΩ /27.4 kΩ +1 nF | About0.997 V at9 V. Configure a suitably long ADC acquisition time for the24.4 kΩ source impedance. |

The tabulated threshold bounds include comparator limits and nominal1% resistor tolerance, but are screening values rather than a complete correlated temperature/transient guarantee. Pin leakage and resistor temperature coefficients must be included in firmware guard bands. No 12 V PDO is assumed; no 15/20 V operating contract is allowed. TPS62135's 17 V recommended-input ceiling is not permission to use a nominal15 V USB input without adequate transient margin.

## Required startup and shutdown behavior

1. With the MCU and FPGA unpowered, TCPP presents Rd and accepts initial source5 V in either plug orientation. Its VBUS-derived gate driver powers Q200 without waiting for the MCU.
2. The LDO boots the MCU. Keep `FPGA_PWR_EN=0`, mux disabled and JTAG outputs isolated. Configure UCPD and then hand off TCPP's dead-battery termination through `TCPP_DB_N` in the documented order.
3. Detect orientation and source capability. Prefer a9 V contract; enable a5 V path only under the explicitly allowed3 A fallback policy and load budget. Check the measured protected VBUS and real PD contract; voltage alone is not authorization.
4. Assert main enable. The eFuse ramps the existing input bulk while core EN stays low. Only true PG releases the original FPGA rail sequence.
5. Monitor CC fault, PG, PD events and bank-0 rail voltage. On detach, hard reset, fault or lost contract, disable main load and mux safely. A latched eFuse requires an intentional EN-low reset after the fault is cleared. Watchdog/reset must return main enable to its hardware low state.

## What is not yet proven

- **Firmware and paired adapter:** no working PD state machine, vendor mode, recovery programmer or source adapter is delivered by a component list. The XEM8310 PC-facing USB device port is not a substitute for the custom host/source adapter.
- **Attach inrush:** direct raw/protected input capacitors total about4.6 µF nominal; the LDO additionally charges about15.7 µF nominal on3.3 V. Do not infer compliance from the raw VBUS capacitance alone. Test charge/current waveform, source droop, cold start, bounce, orientation, USB default-current sources and worst PVT. If the bootstrap peak/charge fails, add a controlled bootstrap ramp or reconsider the duplicate bulk placement before release.
- **Protection coordination:** test 20 V mistaken-source exposure, CC-to-VBUS shorts, ESD/hot-plug waveforms and the actual FET gate/drain stress. ST's CC system pairing is the reference basis, but its transient curves do not establish that the MCU pins always remain below a5.5 V DC absolute limit. The raw TVS also has clamp levels above the FET's30 V DC rating under some specified surges. Do not mark this immunity-qualified from the BOM alone.
- **Power-good during supply loss:** the AON pull-up can remain charged after eFuse input disappears. Verify PG stays valid or safely low during detach, source hard reset, reverse discharge and brownout; the divider now prevents the documented static 1.0 V PG condition from enabling the core. The MCU’s undivided PG-low reading can still be indeterminate near its lower supply corner, so PG alone is not source authorization. The MCU must treat its own brownout/reset, VBUS sense and contract loss as immediate reasons to keep main EN low. Test the relative decay and hold-up of AON, eFuse input/output and FPGA rails before declaring fail-safe shutdown.
- **Main-load qualification:** source9 V/5 V, cable loss, inductor/converter current limits, eFuse trip margin, FPGA configuration current and worst workload power all need measurement. The previous compact board's PDN/DC-bias/mounted-decoupling limitations persist.
- **Capacitor effective values and thermal performance:** local bulk capacitance, converter transient behavior and the shared compact-board temperature remain design-release gates.
- **Manufacturing:** the RPW footprint intentionally uses overlapping same-number rectangles to reproduce its corner lands. These are not extra electrical pins. No drills or via-in-pad are present in any of the three custom footprints. Native footprint parsing passed, but final placed-board DRC, paste-mask/courtyard review and assembly acceptance remain necessary.

The earlier fully routed board remains preserved. This circuit is an authorized revision under development and must not inherit its routing/DRC status until the revised native project is independently checked.
