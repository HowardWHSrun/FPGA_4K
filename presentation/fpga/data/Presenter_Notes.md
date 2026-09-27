# Presenting the smallest FPGA board

2026-09-27 · current native ASIC117 assignment snapshot

Board SHA-256: `2975050c28c89fc96bf781cf082bffffc84189e6720ce05c4200d8552ac298fc`. 12 copper layers in this development snapshot.

**First milestone:** stable rails, JTAG programming, then a finite recording capture from one ASIC. Receiver/MCU integration can follow.

**What changed:** 116 candidate digital ASIC nets are assigned; AC_IN is a separate 0–1.5 V analog contact with no FPGA GPIO path. U1.A13 is NC. Six former NC ground pins now belong to GND. These are provisional electrical assumptions, not hardware proof.

**What is unused:** 81 FPGA balls and two unused regulator PG outputs have explicit NC markers. Separately, eight FPGA balls and eight cable contacts reserve the future data link; three mezzanine contacts remain reserved. These 102 endpoints are not missing routed ASIC signals. Missing routes on assigned nets are counted separately in the current routing audit.

**AC_IN:** analog 0–1.5 V, with its source on the routing/ASIC side still to be designed. **IMP_TST:** assumed digital 0/1.5 V; inactive polarity is unverified. **Capture assumption:** eight returned clocks sampled on falling edges; retain four outgoing board clocks.

## Explain the functions

- **FPGA logic (1 parts):** U1 captures and organizes ASIC data.
- **Four power rails (38 parts):** Four converters provide core, auxiliary/boot and interface voltages.
- **FPGA supply decoupling (61 parts):** Local capacitors supply fast current demands.
- **Boot memory (9 parts):** The flash stores the configuration for autonomous startup.
- **System clock (4 parts):** The oscillator provides the 32 MHz reference.
- **Configuration and JTAG (9 parts):** Straps and programming signals establish startup behavior.
- **External connections (3 parts):** J5/J6 carry the provisional ASIC assignments; J4 carries custom power/JTAG and future data.

## Is every component required?

The circuit functions are required by the chosen architecture; the present component count is not a proven minimum. R12 and its unconsumed status branch have been removed. R113 is omitted when M2 is directly grounded; normal JTAG remains available, while changing the fixed boot mode requires copper rework. Capacitor removal needs power-integrity evidence. Simply removing a series part opens its circuit.

## Component and pin reference

### C1 — Cable-entry bulk reservoir

**Value:** 47u 25V X5R · **Decision:** Check before reducing

47 uF at the proposed 12 V cable entry supports slower input current changes before the individual converter input reservoirs.

**If removed:** Reduces cable-entry energy reserve; depends on cable impedance, inrush and source behavior.

**Review:** Do not call this input protection. Retain pending a source/cable transient study; optimize jointly with the carrier, not by visual whitespace.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C2 — Cable-entry high-frequency bypass

**Value:** 100n 100V X7R · **Decision:** Check before reducing

100 nF from the cable input to GND bypasses faster voltage disturbance at entry.

**If removed:** Changes entry-node high-frequency impedance.

**Review:** Review jointly with C1 and converter input loops. It does not clamp overvoltage.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C3 — Converter input reservoir

**Value:** 22u 25V X5R · **Decision:** Keep function

Local input reservoir from LINK_12V to GND next to U2. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C4 — High-frequency input bypass

**Value:** 100n 100V X7R · **Decision:** Check before reducing

Small local 100 nF bypass across U2 input, alongside C3.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C5 — Converter local output capacitor

**Value:** 22u 16V X5R · **Decision:** Keep function

Local output reservoir and voltage-sense pickup for U2; the L/C output function works with L1.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCORE_REG_1V025 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C6 — Soft-start timing capacitor

**Value:** 10n 50V X7R · **Decision:** Check before reducing

10 nF from U2 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SS_CORE | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C7 — Converter input reservoir

**Value:** 22u 25V X5R · **Decision:** Keep function

Local input reservoir from LINK_12V to GND next to U3. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C8 — High-frequency input bypass

**Value:** 100n 100V X7R · **Decision:** Check before reducing

Small local 100 nF bypass across U3 input, alongside C7.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C9 — Converter local output capacitor

**Value:** 22u 16V X5R · **Decision:** Keep function

Local output reservoir and voltage-sense pickup for U3; the L/C output function works with L2.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VAUX_REG_1V803 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C10 — Soft-start timing capacitor

**Value:** 10n 50V X7R · **Decision:** Check before reducing

10 nF from U3 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SS_AUX | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C11 — Converter input reservoir

**Value:** 22u 25V X5R · **Decision:** Keep function

Local input reservoir from LINK_12V to GND next to U4. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C12 — High-frequency input bypass

**Value:** 100n 100V X7R · **Decision:** Check before reducing

Small local 100 nF bypass across U4 input, alongside C11.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C13 — Converter local output capacitor

**Value:** 22u 16V X5R · **Decision:** Keep function

Local output reservoir and voltage-sense pickup for U4; the L/C output function works with L3.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C14 — Soft-start timing capacitor

**Value:** 10n 50V X7R · **Decision:** Check before reducing

10 nF from U4 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SS_CFG | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C15 — Converter input reservoir

**Value:** 22u 25V X5R · **Decision:** Keep function

Local input reservoir from LINK_12V to GND next to U5. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C16 — High-frequency input bypass

**Value:** 100n 100V X7R · **Decision:** Check before reducing

Small local 100 nF bypass across U5 input, alongside C15.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C17 — Converter local output capacitor

**Value:** 22u 16V X5R · **Decision:** Keep function

Local output reservoir and voltage-sense pickup for U5; the L/C output function works with L4.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C18 — Soft-start timing capacitor

**Value:** 10n 50V X7R · **Decision:** Check before reducing

10 nF from U5 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SS_ASIC | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C20 — Bulk energy reserve

**Value:** 330u 2.5V POSCAP ESR9m@300kHz · **Decision:** Check before reducing

330 microfarad polarized bulk capacitor on the FPGA side of R9. Supplies slower core-current changes; local small ceramic capacitors handle faster changes. The smaller manufacturer land pattern opens connector routing space.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Keep the bulk-capacitor function. ETPE330M9GB is the compact selection: 2.5 V, 105 C category maximum, ESR specified at 300 kHz and 20 C. Its model ESL reaches about 1.2 nH, so AMD decoupling-class equivalence, mounted PDN response, ripple and thermal performance still require qualification. Pad 1 is positive core; pad 2 is GND.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C21 — Bulk energy reserve

**Value:** 100u 6.3V X5R · **Decision:** Check before reducing

100u 6.3V X5R bulk energy reserve for FPGA block RAM between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence. The recorded part family is NRND; qualify an orderable alternative.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C22 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C23 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C24 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C25 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C26 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C27 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C28 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C29 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C30 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C31 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C32 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C33 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C34 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C35 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C36 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA block RAM between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C37 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA block RAM between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C40 — Bulk energy reserve

**Value:** 47u 6.3V X7R · **Decision:** Check before reducing

47u 6.3V X7R bulk energy reserve for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C41 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C42 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C43 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C44 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C45 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C46 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C50 — Bulk energy reserve

**Value:** 47u 6.3V X7R · **Decision:** Check before reducing

47u 6.3V X7R bulk energy reserve for configuration bank 0 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C51 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C52 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C53 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C54 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C55 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C56 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C57 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C58 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C59 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C60 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C61 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C62 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C63 — Bulk energy reserve

**Value:** 47u 6.3V X7R · **Decision:** Check before reducing

47u 6.3V X7R bulk energy reserve for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C64 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C65 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C66 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C67 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C68 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C69 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C70 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C71 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C72 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C73 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C74 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C75 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C76 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C77 — Local supply bypass

**Value:** 4.7u 10V X7R · **Decision:** Check before reducing

4.7u 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C78 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C79 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C80 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C81 — Local supply bypass

**Value:** 470n 10V X7R · **Decision:** Check before reducing

470n 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C82 — Bulk energy reserve

**Value:** 47u 6.3V X7R · **Decision:** Check before reducing

47u 6.3V X7R bulk energy reserve for the three ASIC-facing banks between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C90 — Local supply bypass

**Value:** 100n 16V X7R · **Decision:** Check before reducing

100n 16V X7R local supply bypass for XADC analog supply between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond. The ADC-related supply still needs a defined electrical connection even when external temperature-diode sensing is unused.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C91 — Local supply bypass

**Value:** 1u 10V X7R · **Decision:** Check before reducing

1u 10V X7R local supply bypass for XADC analog supply between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond. The ADC-related supply still needs a defined electrical connection even when external temperature-diode sensing is unused.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C92 — Bulk energy reserve

**Value:** 47u 6.3V X7R · **Decision:** Check before reducing

47u 6.3V X7R bulk energy reserve for bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond. Added when bank 14 and bank 16 were separated onto different voltages; it is not a duplicate on the 2.5 V rail.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C100 — Flash local supply bypass

**Value:** 100n · **Decision:** Keep function

100 nF between U6 VCC and GND supports local flash switching current.

**If removed:** Removes the smallest local flash reservoir; remote rail capacitance does not guarantee an equivalent short current loop.

**Review:** The exact capacitor order code is selected. Keep its bypass function; effective capacitance and the mounted power network still need qualification.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C101 — Flash local bulk reservoir

**Value:** 1u 16V X5R · **Decision:** Check before reducing

1 uF supplements C100 at the flash supply.

**If removed:** Less local reserve; flash current transients must then be met by C100 and the rail network.

**Review:** Potential reduction only after supply-noise and flash power-cycle tests.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C102 — Oscillator local supply bypass

**Value:** 10n · **Decision:** Keep function

10 nF adjacent to Y1 VDD/GND follows the oscillator bypass arrangement in the selected-part documentation.

**If removed:** Removes its intended shortest bypass path.

**Review:** Keep local bypass when Y1 is fitted. ASE3 recommends 10 nF, but its note incorrectly says pins 7/14; the actual four-pin table is VDD=4 and GND=2. Use that verified mapping.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### C103 — Additional oscillator bypass

**Value:** 100n · **Decision:** Check before reducing

100 nF supplements Y1 local supply bypass C102.

**If removed:** Less local supply filtering; consequence depends on supply impedance and clock sensitivity.

**Review:** Can be optimized after clock jitter/supply-noise evidence; do not claim two bypass parts are universally mandatory.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### J4 — Shared power / JTAG / future data cable

**Value:** CUSTOM POWER + JTAG / DATA TBD · **Decision:** Depends on system choice

One custom Type-D connector replaces separate power and debug connectors and reserves contacts for four data pairs.

**If removed:** The selected power-entry and external programming access disappear.

**Review:** Keep one system connector. Exact cable pinout, protected source and receiver design must be qualified; this custom 12 V wiring is not HDMI compatible.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | JTAG_TMS | assigned net connected in native DRC |
| 3 | — | Unassigned | reserved — interface implementation required |
| 4 | — | GND | assigned net connected in native DRC |
| 5 | — | Unassigned | reserved — interface implementation required |
| 6 | — | Unassigned | reserved — interface implementation required |
| 7 | — | GND | assigned net connected in native DRC |
| 8 | — | Unassigned | reserved — interface implementation required |
| 9 | — | Unassigned | reserved — interface implementation required |
| 10 | — | GND | assigned net connected in native DRC |
| 11 | — | Unassigned | reserved — interface implementation required |
| 12 | — | Unassigned | reserved — interface implementation required |
| 13 | — | GND | assigned net connected in native DRC |
| 14 | — | Unassigned | reserved — interface implementation required |
| 15 | — | JTAG_TDI | assigned net connected in native DRC |
| 16 | — | GND | assigned net connected in native DRC |
| 17 | — | JTAG_TCK | assigned net connected in native DRC |
| 18 | — | JTAG_TDO | assigned net connected in native DRC |
| 19 | — | LINK_12V | assigned net connected in native DRC |
| SH | — | GND | assigned net connected in native DRC |

### J5 — 60-contact ASIC mezzanine

**Value:** QSH-030-01-L-D-A · **Decision:** Depends on system choice

One half of the chosen two-connector ASIC interface; together J5/J6 offer 120 numbered signal contacts plus ground-blade lands.

**If removed:** The proposed 117-contact interface no longer fits in the remaining 60 contacts.

**Review:** Keep both for the selected 2 x 60 interface. There are 116 candidate digital FPGA connections, one AC_IN analog contact reserved for the routing/ASIC side, and three spare contacts. Electrical compatibility, connector mating and timing are not yet approved.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | ASIC1_DATA1 | assigned net connected in native DRC |
| 2 | — | ASIC1_DATA2 | assigned net connected in native DRC |
| 3 | — | ASIC1_DATA3 | assigned net connected in native DRC |
| 4 | — | ASIC1_DATA4 | assigned net connected in native DRC |
| 5 | — | ASIC1_DATA5 | assigned net connected in native DRC |
| 6 | — | ASIC1_DATA6 | assigned net connected in native DRC |
| 7 | — | ASIC1_DATA7 | assigned net connected in native DRC |
| 8 | — | ASIC1_DATA8 | assigned net connected in native DRC |
| 9 | — | ASIC1_CLK32MHz_Out | assigned net connected in native DRC |
| 10 | — | ASIC1_READ | assigned net connected in native DRC |
| 11 | — | ASIC1_SYNC | assigned net connected in native DRC |
| 12 | — | ASIC2_DATA1 | assigned net connected in native DRC |
| 13 | — | ASIC2_DATA2 | assigned net connected in native DRC |
| 14 | — | ASIC2_DATA3 | assigned net connected in native DRC |
| 15 | — | ASIC2_DATA4 | assigned net connected in native DRC |
| 16 | — | ASIC2_DATA5 | assigned net connected in native DRC |
| 17 | — | ASIC2_DATA6 | assigned net connected in native DRC |
| 18 | — | ASIC2_DATA7 | assigned net connected in native DRC |
| 19 | — | ASIC2_DATA8 | assigned net connected in native DRC |
| 20 | — | ASIC2_CLK32MHz_Out | assigned net connected in native DRC |
| 21 | — | ASIC2_READ | assigned net connected in native DRC |
| 22 | — | ASIC2_SYNC | assigned net connected in native DRC |
| 23 | — | ASIC3_DATA1 | assigned net connected in native DRC |
| 24 | — | ASIC3_DATA2 | assigned net connected in native DRC |
| 25 | — | ASIC3_DATA3 | assigned net connected in native DRC |
| 26 | — | ASIC3_DATA4 | assigned net connected in native DRC |
| 27 | — | ASIC3_DATA5 | assigned net connected in native DRC |
| 28 | — | ASIC3_DATA6 | assigned net connected in native DRC |
| 29 | — | ASIC3_DATA7 | assigned net connected in native DRC |
| 30 | — | ASIC3_DATA8 | assigned net connected in native DRC |
| 31 | — | ASIC3_CLK32MHz_Out | assigned net connected in native DRC |
| 32 | — | ASIC3_READ | assigned net connected in native DRC |
| 33 | — | ASIC3_SYNC | assigned net connected in native DRC |
| 34 | — | Unassigned | reserved — interface implementation required |
| 35 | — | ASIC4_DATA2 | assigned net connected in native DRC |
| 36 | — | ASIC4_DATA3 | assigned net connected in native DRC |
| 37 | — | ASIC4_DATA4 | assigned net connected in native DRC |
| 38 | — | ASIC4_DATA5 | assigned net connected in native DRC |
| 39 | — | ASIC4_DATA6 | assigned net connected in native DRC |
| 40 | — | ASIC4_DATA7 | assigned net connected in native DRC |
| 41 | — | ASIC4_DATA8 | assigned net connected in native DRC |
| 42 | — | ASIC4_CLK32MHz_Out | assigned net connected in native DRC |
| 43 | — | ASIC4_READ | assigned net connected in native DRC |
| 44 | — | ASIC4_SYNC | assigned net connected in native DRC |
| 45 | — | CHIP_RESET_SHARED | assigned net connected in native DRC |
| 46 | — | AC_IN_ANALOG_RESERVED | analog reserved — external source required; no FPGA connection |
| 47 | — | IMP_TST_SHARED | assigned net connected in native DRC |
| 48 | — | FE_RESET_SHARED | assigned net connected in native DRC |
| 49 | — | SPI_LATCH_SHARED | assigned net connected in native DRC |
| 50 | — | STIM_CLK_SHARED | assigned net connected in native DRC |
| 51 | — | STIM_START_SHARED | assigned net connected in native DRC |
| 52 | — | STIM_EN_SHARED | assigned net connected in native DRC |
| 53 | — | STIM_CHB_SHARED | assigned net connected in native DRC |
| 54 | — | BOARD1_CLK | assigned net connected in native DRC |
| 55 | — | BOARD2_CLK | assigned net connected in native DRC |
| 56 | — | BOARD3_CLK | assigned net connected in native DRC |
| 57 | — | BOARD4_CLK | assigned net connected in native DRC |
| 58 | — | BOARD1_SPI_CLK | assigned net connected in native DRC |
| 59 | — | BOARD2_SPI_CLK | assigned net connected in native DRC |
| 60 | — | BOARD3_SPI_CLK | assigned net connected in native DRC |
| G | — | GND | assigned net connected in native DRC |

### J6 — 60-contact ASIC mezzanine

**Value:** QSH-030-01-L-D-A · **Decision:** Depends on system choice

One half of the chosen two-connector ASIC interface; together J5/J6 offer 120 numbered signal contacts plus ground-blade lands.

**If removed:** The proposed 117-contact interface no longer fits in the remaining 60 contacts.

**Review:** Keep both for the selected 2 x 60 interface. There are 116 candidate digital FPGA connections, one AC_IN analog contact reserved for the routing/ASIC side, and three spare contacts. Electrical compatibility, connector mating and timing are not yet approved.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | ASIC5_DATA1 | assigned net connected in native DRC |
| 2 | — | ASIC5_DATA2 | assigned net connected in native DRC |
| 3 | — | ASIC5_DATA3 | assigned net connected in native DRC |
| 4 | — | ASIC5_DATA4 | assigned net connected in native DRC |
| 5 | — | ASIC5_DATA5 | assigned net connected in native DRC |
| 6 | — | ASIC5_DATA6 | assigned net connected in native DRC |
| 7 | — | ASIC5_DATA7 | assigned net connected in native DRC |
| 8 | — | ASIC5_DATA8 | assigned net connected in native DRC |
| 9 | — | ASIC5_CLK32MHz_Out | assigned net connected in native DRC |
| 10 | — | ASIC5_READ | assigned net connected in native DRC |
| 11 | — | ASIC5_SYNC | assigned net connected in native DRC |
| 12 | — | ASIC6_DATA1 | assigned net connected in native DRC |
| 13 | — | ASIC6_DATA2 | assigned net connected in native DRC |
| 14 | — | ASIC6_DATA3 | assigned net connected in native DRC |
| 15 | — | ASIC6_DATA4 | assigned net connected in native DRC |
| 16 | — | ASIC6_DATA5 | assigned net connected in native DRC |
| 17 | — | ASIC6_DATA6 | assigned net connected in native DRC |
| 18 | — | ASIC6_DATA7 | assigned net connected in native DRC |
| 19 | — | ASIC6_DATA8 | assigned net connected in native DRC |
| 20 | — | ASIC6_CLK32MHz_Out | assigned net connected in native DRC |
| 21 | — | ASIC6_READ | assigned net connected in native DRC |
| 22 | — | ASIC6_SYNC | assigned net connected in native DRC |
| 23 | — | ASIC7_DATA1 | assigned net connected in native DRC |
| 24 | — | ASIC7_DATA2 | assigned net connected in native DRC |
| 25 | — | ASIC7_DATA3 | assigned net connected in native DRC |
| 26 | — | ASIC7_DATA4 | assigned net connected in native DRC |
| 27 | — | ASIC7_DATA5 | assigned net connected in native DRC |
| 28 | — | ASIC7_DATA6 | assigned net connected in native DRC |
| 29 | — | ASIC7_DATA7 | assigned net connected in native DRC |
| 30 | — | ASIC7_DATA8 | assigned net connected in native DRC |
| 31 | — | ASIC7_CLK32MHz_Out | assigned net connected in native DRC |
| 32 | — | ASIC7_READ | assigned net connected in native DRC |
| 33 | — | ASIC7_SYNC | assigned net connected in native DRC |
| 34 | — | ASIC8_DATA1 | assigned net connected in native DRC |
| 35 | — | ASIC8_DATA2 | assigned net connected in native DRC |
| 36 | — | ASIC8_DATA3 | assigned net connected in native DRC |
| 37 | — | Unassigned | reserved — interface implementation required |
| 38 | — | ASIC8_DATA5 | assigned net connected in native DRC |
| 39 | — | ASIC8_DATA6 | assigned net connected in native DRC |
| 40 | — | ASIC8_DATA7 | assigned net connected in native DRC |
| 41 | — | ASIC8_DATA8 | assigned net connected in native DRC |
| 42 | — | ASIC8_CLK32MHz_Out | assigned net connected in native DRC |
| 43 | — | ASIC8_READ | assigned net connected in native DRC |
| 44 | — | ASIC8_SYNC | assigned net connected in native DRC |
| 45 | — | BOARD4_SPI_CLK | assigned net connected in native DRC |
| 46 | — | STIM_CHIP1_SPI_DL | assigned net connected in native DRC |
| 47 | — | STIM_CHIP1_SPI_DR | assigned net connected in native DRC |
| 48 | — | STIM_CHIP2_SPI_DL | assigned net connected in native DRC |
| 49 | — | STIM_CHIP2_SPI_DR | assigned net connected in native DRC |
| 50 | — | STIM_CHIP3_SPI_DL | assigned net connected in native DRC |
| 51 | — | STIM_CHIP3_SPI_DR | assigned net connected in native DRC |
| 52 | — | STIM_CHIP4_SPI_DL | assigned net connected in native DRC |
| 53 | — | STIM_CHIP4_SPI_DR | assigned net connected in native DRC |
| 54 | — | NONSTIM_BOARD1_SPI_DL | assigned net connected in native DRC |
| 55 | — | NONSTIM_BOARD1_SPI_DR | assigned net connected in native DRC |
| 56 | — | NONSTIM_BOARD2_SPI_DL | assigned net connected in native DRC |
| 57 | — | NONSTIM_BOARD2_SPI_DR | assigned net connected in native DRC |
| 58 | — | ASIC8_DATA4 | assigned net connected in native DRC |
| 59 | — | Unassigned | reserved — interface implementation required |
| 60 | — | ASIC4_DATA1 | assigned net connected in native DRC |
| G | — | GND | assigned net connected in native DRC |

### L1 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30% · **Decision:** Keep function

Carries U2 switched current to its local output capacitor C5; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SW_CORE | assigned net connected in native DRC |
| 2 | — | VCORE_REG_1V025 | assigned net connected in native DRC |

### L2 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30% · **Decision:** Keep function

Carries U3 switched current to its local output capacitor C9; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SW_AUX | assigned net connected in native DRC |
| 2 | — | VAUX_REG_1V803 | assigned net connected in native DRC |

### L3 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30% · **Decision:** Keep function

Carries U4 switched current to its local output capacitor C13; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SW_CFG | assigned net connected in native DRC |
| 2 | — | VCC_LINK_2V5 | assigned net connected in native DRC |

### L4 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30% · **Decision:** Keep function

Carries U5 switched current to its local output capacitor C17; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | SW_ASIC | assigned net connected in native DRC |
| 2 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |

### R1 — Core / block ram feedback divider

**Value:** 32.4k 0.1% · **Decision:** Keep function

The upper resistor of U2 output-setting divider; R1/R2 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCORE_REG_1V025 | assigned net connected in native DRC |
| 2 | — | FB_CORE | assigned net connected in native DRC |

### R2 — Core / block ram feedback divider

**Value:** 69.8k 0.1% · **Decision:** Keep function

The lower resistor of U2 output-setting divider; R1/R2 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FB_CORE | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### R3 — Auxiliary / configuration feedback divider

**Value:** 110k 0.1% · **Decision:** Keep function

The upper resistor of U3 output-setting divider; R3/R4 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VAUX_REG_1V803 | assigned net connected in native DRC |
| 2 | — | FB_AUX | assigned net connected in native DRC |

### R4 — Auxiliary / configuration feedback divider

**Value:** 69.8k 0.1% · **Decision:** Keep function

The lower resistor of U3 output-setting divider; R3/R4 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FB_AUX | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### R5 — 2.5 v link bank feedback divider

**Value:** 180k 0.1% · **Decision:** Keep function

The upper resistor of U4 output-setting divider; R5/R6 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned net connected in native DRC |
| 2 | — | FB_CFG | assigned net connected in native DRC |

### R6 — 2.5 v link bank feedback divider

**Value:** 69.8k 0.1% · **Decision:** Keep function

The lower resistor of U4 output-setting divider; R5/R6 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FB_CFG | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### R7 — 1.5 v asic-facing banks feedback divider

**Value:** 80.6k 0.1% · **Decision:** Keep function

The upper resistor of U5 output-setting divider; R7/R8 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 2 | — | FB_ASIC | assigned net connected in native DRC |

### R8 — 1.5 v asic-facing banks feedback divider

**Value:** 69.8k 0.1% · **Decision:** Keep function

The lower resistor of U5 output-setting divider; R7/R8 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FB_ASIC | assigned net connected in native DRC |
| 2 | — | GND | assigned net connected in native DRC |

### R9 — Distributed-capacitance isolation

**Value:** 12m 1% 1W · **Decision:** Keep function

12 milliohm series element between VCORE_REG_1V025 and VCCINT_1V0; local sensing remains upstream and distributed FPGA capacitors downstream. Reduces DC loss relative to the earlier 15 milliohm selection while retaining the reviewed isolation margin.

**If removed:** Removing it opens the rail; shorting it defeats the deliberately separated local and distributed capacitor networks.

**Review:** Retain for this topology. Replacing it requires a demonstrated alternative series impedance and a full DC-drop/stability review.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCORE_REG_1V025 | assigned net connected in native DRC |
| 2 | — | VCCINT_1V0 | assigned net connected in native DRC |

### R10 — Power-up sequencing pull-up

**Value:** 100k · **Decision:** Keep function

Pulls PG_CORE high when U2 releases its open-drain power-good output; that signal enables U3.

**If removed:** The downstream enable no longer receives its designed high level.

**Review:** Keep while this sequencing chain is used; startup and unplug waveforms still need checking.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | PG_CORE | assigned net connected in native DRC |

### R11 — Power-up sequencing pull-up

**Value:** 100k · **Decision:** Keep function

Pulls PG_AUX high when U3 releases its open-drain power-good output; that signal enables U4 and U5.

**If removed:** The downstream enable no longer receives its designed high level.

**Review:** Keep while this sequencing chain is used; startup and unplug waveforms still need checking.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned net connected in native DRC |
| 2 | — | PG_AUX | assigned net connected in native DRC |

### R100 — Flash chip-select pull-up

**Value:** 2.4k · **Decision:** Keep function

Holds FLASH_CS_B high while FPGA control is high impedance, preventing accidental selection.

**If removed:** Flash chip select loses its external defined idle-high state during startup.

**Review:** Keep for the selected SPI boot interface.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | FLASH_CS_B | assigned net connected in native DRC |

### R101 — Flash WP / DQ2 default high

**Value:** 4.7k · **Decision:** Depends on system choice

Holds flash U6.3 WP#/SIO2 high for the selected single-bit SPI boot. The optional FPGA DQ2 path and R106 are removed; this resistor still supplies the required defined flash input level.

**If removed:** The flash write-protect/data pin may lose its defined default level when FPGA outputs are undriven.

**Review:** Keep the flash WP# pull-up. The image and programmer must use SPI x1; quad boot is not wired in this revision.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ2 | assigned net connected in native DRC |

### R102 — Flash RESET / DQ3 default high

**Value:** 4.7k · **Decision:** Depends on system choice

Pulls U6 RESET#/SIO3 high so the selected flash is not unintentionally held in reset.

**If removed:** The reset/data pin may lose its defined default level before configuration.

**Review:** Keep for this exact flash part and mode; it is RESET#, not a generic HOLD# pin.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ3 | assigned net connected in native DRC |

### R103 — Flash clock source damping

**Value:** 33 · **Decision:** Check before reducing

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FPGA_CCLK | assigned net connected in native DRC |
| 2 | — | FLASH_SCLK | assigned net connected in native DRC |

### R104 — Zero-ohm flash signal link

**Value:** 0 · **Decision:** Check before reducing

Provides an editable series location in the DQ0 path. Its fitted 0 ohm value is electrically a link.

**If removed:** Depopulating it breaks the signal; a deliberate trace replacement keeps connectivity.

**Review:** Footprint-removal candidate after signal-integrity/boot-mode review; do not confuse removing the component with leaving an open circuit.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FPGA_CFG_DQ0 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ0 | assigned net connected in native DRC |

### R105 — Flash data source damping

**Value:** 33 · **Decision:** Check before reducing

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FPGA_CFG_DQ1 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ1 | assigned net connected in native DRC |

### R108 — PROGRAM_B pull-up

**Value:** 4.7k · **Decision:** Keep function

4.7 kilohm to the 1.8 V configuration rail gives PROGRAM_B the specified released/high state.

**If removed:** Configuration reset/initialization behavior can become undefined or stall.

**Review:** Keep the pull-up function required for this configuration scheme.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | FPGA_PROGRAM_B | assigned net connected in native DRC |

### R109 — INIT_B pull-up

**Value:** 4.7k · **Decision:** Keep function

4.7 kilohm to the 1.8 V configuration rail gives INIT_B the specified released/high state.

**If removed:** Configuration reset/initialization behavior can become undefined or stall.

**Review:** Keep the pull-up function required for this configuration scheme.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | FPGA_INIT_B | assigned net connected in native DRC |

### R110 — Additional DONE pull-up

**Value:** 4.7k · **Decision:** Check before reducing

4.7 kilohm supplements the FPGA internal DONE pull-up. The current DONE net has no external monitor or LED.

**If removed:** DONE retains its internal pull-up; whether its rise is acceptable depends on configuration settings and loading.

**Review:** A removal candidate after confirming DonePipe/startup settings, leakage and waveform. Do not state that every external DONE pull-up is mandatory.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | FPGA_DONE | assigned net connected in native DRC |

### R111 — Configuration strap M0

**Value:** 1k · **Decision:** Depends on system choice

1 kilohm sets M0 to 1.8 V / high. M[2:0]=001 chooses SPI; PUDC_B high disables configuration-time user-I/O pull-ups.

**If removed:** The deliberately fixed configuration input loses its chosen strap unless replaced by a direct connection.

**Review:** The stable logic level is needed; the separate resistor is not inherently needed. UG470 permits a direct rail/GND tie, so a later revision can replace it with copper after the pin and configuration choice is frozen.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | CFG_M0 | assigned net connected in native DRC |

### R114 — Configuration strap PUDC_B

**Value:** 1k · **Decision:** Depends on system choice

1 kilohm sets PUDC_B to 1.8 V / high. M[2:0]=001 chooses SPI; PUDC_B high disables configuration-time user-I/O pull-ups.

**If removed:** The deliberately fixed configuration input loses its chosen strap unless replaced by a direct connection.

**Review:** The stable logic level is needed; the separate resistor is not inherently needed. UG470 permits a direct rail/GND tie, so a later revision can replace it with copper after the pin and configuration choice is frozen.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | CFG_PUDC_B | assigned net connected in native DRC |

### R115 — JTAG TMS external idle bias

**Value:** 10k · **Decision:** Check before reducing

10 kilohm to 1.8 V provides a weak external high level at JTAG TMS when the cable is undriven.

**If removed:** External idle bias disappears; behavior then depends on device internal pulls and the actual adapter/cable.

**Review:** Review with the programming-interface contract. The current direct, single-FPGA connection does not prove that all three extra resistors are mandatory.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | JTAG_TMS | assigned net connected in native DRC |

### R116 — JTAG TDI external idle bias

**Value:** 10k · **Decision:** Check before reducing

10 kilohm to 1.8 V provides a weak external high level at JTAG TDI when the cable is undriven.

**If removed:** External idle bias disappears; behavior then depends on device internal pulls and the actual adapter/cable.

**Review:** Review with the programming-interface contract. The current direct, single-FPGA connection does not prove that all three extra resistors are mandatory.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | JTAG_TDI | assigned net connected in native DRC |

### R117 — JTAG TCK external idle bias

**Value:** 10k · **Decision:** Check before reducing

10 kilohm to 1.8 V provides a weak external high level at JTAG TCK when the cable is undriven.

**If removed:** External idle bias disappears; behavior then depends on device internal pulls and the actual adapter/cable.

**Review:** Review with the programming-interface contract. The current direct, single-FPGA connection does not prove that all three extra resistors are mandatory.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | — | JTAG_TCK | assigned net connected in native DRC |

### R118 — JTAG TDO source damping

**Value:** 33 · **Decision:** Check before reducing

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | FPGA_TDO | assigned net connected in native DRC |
| 2 | — | JTAG_TDO | assigned net connected in native DRC |

### R119 — Oscillator output damping

**Value:** 33 · **Decision:** Check before reducing

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | OSC_32M_RAW | assigned net connected in native DRC |
| 2 | — | CLK_32MHZ | assigned net connected in native DRC |

### R122 — Distributed-capacitance isolation

**Value:** 15m 1% 1W · **Decision:** Keep function

15 milliohm series element between VAUX_REG_1V803 and VCCAUX_1V8; local sensing remains upstream, distributed FPGA capacitors downstream.

**If removed:** Removing it opens the rail; shorting it defeats the deliberately separated local and distributed capacitor networks.

**Review:** Retain for this topology. Replacing it requires a demonstrated alternative series impedance and a full DC-drop/stability review.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | — | VAUX_REG_1V803 | assigned net connected in native DRC |
| 2 | — | VCCAUX_1V8 | assigned net connected in native DRC |

### U1 — Acquire, time and package ASIC data

**Value:** XC7A100T-1CSG324I · **Decision:** Keep function

The XC7A100T is the board logic device. Its planned firmware captures the ASIC interface, supplies control/clock signals and sends data downstream.

**If removed:** There is no FPGA function.

**Review:** Keep XC7A100T-1CSG324I. The 116 candidate digital ASIC balls are assigned; AC_IN is external analog. Eighty-one balls are intentionally NC and eight future-link balls remain reserved. Clock placement, external timing and powered operation still require validation.

| Pin | Function | Native net | Status |
|---|---|---|---|
| A1 | IO_L9N_T1_DQS_AD7N_35 | ASIC2_DATA8 | assigned net connected in native DRC |
| A2 | GND | GND | assigned net connected in native DRC |
| A3 | IO_L8N_T1_AD14N_35 | ASIC2_DATA5 | assigned net connected in native DRC |
| A4 | IO_L8P_T1_AD14P_35 | ASIC4_DATA2 | assigned net connected in native DRC |
| A5 | IO_L3N_T0_DQS_AD5N_35 | ASIC4_DATA4 | assigned net connected in native DRC |
| A6 | IO_L3P_T0_DQS_AD5P_35 | ASIC4_DATA5 | assigned net connected in native DRC |
| A7 | VCCO_35 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| A8 | IO_L12N_T1_MRCC_16 | Unassigned | reserved — interface implementation required |
| A9 | IO_L14N_T2_SRCC_16 | Unassigned | reserved — interface implementation required |
| A10 | IO_L14P_T2_SRCC_16 | Unassigned | reserved — interface implementation required |
| A11 | IO_L4N_T0_15 | SPI_LATCH_SHARED | assigned net connected in native DRC |
| A12 | GND | GND | assigned net connected in native DRC |
| A13 | IO_L9P_T1_DQS_AD3P_15 | Unassigned | intentional no-connect |
| A14 | IO_L9N_T1_DQS_AD3N_15 | BOARD2_SPI_CLK | assigned net connected in native DRC |
| A15 | IO_L8P_T1_AD10P_15 | STIM_EN_SHARED | assigned net connected in native DRC |
| A16 | IO_L8N_T1_AD10N_15 | BOARD3_CLK | assigned net connected in native DRC |
| A17 | VCCO_15 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| A18 | IO_L10N_T1_AD11N_15 | BOARD3_SPI_CLK | assigned net connected in native DRC |
| B1 | IO_L9P_T1_DQS_AD7P_35 | ASIC1_READ | assigned net connected in native DRC |
| B2 | IO_L10N_T1_AD15N_35 | ASIC2_READ | assigned net connected in native DRC |
| B3 | IO_L10P_T1_AD15P_35 | ASIC2_DATA3 | assigned net connected in native DRC |
| B4 | IO_L7N_T1_AD6N_35 | ASIC2_SYNC | assigned net connected in native DRC |
| B5 | GND | GND | assigned net connected in native DRC |
| B6 | IO_L2N_T0_AD12N_35 | ASIC4_DATA6 | assigned net connected in native DRC |
| B7 | IO_L2P_T0_AD12P_35 | ASIC4_READ | assigned net connected in native DRC |
| B8 | IO_L12P_T1_MRCC_16 | Unassigned | reserved — interface implementation required |
| B9 | IO_L11N_T1_SRCC_16 | Unassigned | reserved — interface implementation required |
| B10 | VCCO_16 | VCC_LINK_2V5 | assigned net connected in native DRC |
| B11 | IO_L4P_T0_15 | IMP_TST_SHARED | assigned net connected in native DRC |
| B12 | IO_L3N_T0_DQS_AD1N_15 | STIM_CHB_SHARED | assigned net connected in native DRC |
| B13 | IO_L2P_T0_AD8P_15 | BOARD2_CLK | assigned net connected in native DRC |
| B14 | IO_L2N_T0_AD8N_15 | FE_RESET_SHARED | assigned net connected in native DRC |
| B15 | GND | GND | assigned net connected in native DRC |
| B16 | IO_L7P_T1_AD2P_15 | BOARD1_CLK | assigned net connected in native DRC |
| B17 | IO_L7N_T1_AD2N_15 | BOARD1_SPI_CLK | assigned net connected in native DRC |
| B18 | IO_L10P_T1_AD11P_15 | Unassigned | intentional no-connect |
| C1 | IO_L16N_T2_35 | ASIC1_DATA8 | assigned net connected in native DRC |
| C2 | IO_L16P_T2_35 | ASIC2_DATA1 | assigned net connected in native DRC |
| C3 | VCCO_35 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| C4 | IO_L7P_T1_AD6P_35 | ASIC2_DATA7 | assigned net connected in native DRC |
| C5 | IO_L1N_T0_AD4N_35 | ASIC4_DATA1 | assigned net connected in native DRC |
| C6 | IO_L1P_T0_AD4P_35 | ASIC4_DATA3 | assigned net connected in native DRC |
| C7 | IO_L4N_T0_35 | ASIC4_DATA7 | assigned net connected in native DRC |
| C8 | GND | GND | assigned net connected in native DRC |
| C9 | IO_L11P_T1_SRCC_16 | Unassigned | reserved — interface implementation required |
| C10 | IO_L13N_T2_MRCC_16 | Unassigned | reserved — interface implementation required |
| C11 | IO_L13P_T2_MRCC_16 | Unassigned | reserved — interface implementation required |
| C12 | IO_L3P_T0_DQS_AD1P_15 | STIM_START_SHARED | assigned net connected in native DRC |
| C13 | VCCO_15 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| C14 | IO_L1N_T0_AD0N_15 | BOARD4_CLK | assigned net connected in native DRC |
| C15 | IO_L12N_T1_MRCC_15 | Unassigned | intentional no-connect |
| C16 | IO_L20P_T3_A20_15 | STIM_CLK_SHARED | assigned net connected in native DRC |
| C17 | IO_L20N_T3_A19_15 | Unassigned | intentional no-connect |
| C18 | GND | GND | assigned net connected in native DRC |
| D1 | GND | GND | assigned net connected in native DRC |
| D2 | IO_L14N_T2_SRCC_35 | Unassigned | intentional no-connect |
| D3 | IO_L12N_T1_MRCC_35 | Unassigned | intentional no-connect |
| D4 | IO_L11N_T1_SRCC_35 | Unassigned | intentional no-connect |
| D5 | IO_L11P_T1_SRCC_35 | ASIC4_CLK32MHz_Out | assigned net connected in native DRC |
| D6 | VCCO_35 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| D7 | IO_L6N_T0_VREF_35 | Unassigned | intentional no-connect |
| D8 | IO_L4P_T0_35 | ASIC4_SYNC | assigned net connected in native DRC |
| D9 | IO_L6N_T0_VREF_16 | Unassigned | intentional no-connect |
| D10 | IO_L19N_T3_VREF_16 | Unassigned | intentional no-connect |
| D11 | GND | GND | assigned net connected in native DRC |
| D12 | IO_L6P_T0_15 | CHIP_RESET_SHARED | assigned net connected in native DRC |
| D13 | IO_L6N_T0_VREF_15 | Unassigned | intentional no-connect |
| D14 | IO_L1P_T0_AD0P_15 | Unassigned | intentional no-connect |
| D15 | IO_L12P_T1_MRCC_15 | Unassigned | intentional no-connect |
| D16 | VCCO_15 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| D17 | IO_L16N_T2_A27_15 | Unassigned | intentional no-connect |
| D18 | IO_L21N_T3_DQS_A18_15 | Unassigned | intentional no-connect |
| E1 | IO_L18N_T2_35 | ASIC1_DATA4 | assigned net connected in native DRC |
| E2 | IO_L14P_T2_SRCC_35 | ASIC1_CLK32MHz_Out | assigned net connected in native DRC |
| E3 | IO_L12P_T1_MRCC_35 | ASIC2_CLK32MHz_Out | assigned net connected in native DRC |
| E4 | GND | GND | assigned net connected in native DRC |
| E5 | IO_L5N_T0_AD13N_35 | ASIC3_DATA6 | assigned net connected in native DRC |
| E6 | IO_L5P_T0_AD13P_35 | ASIC3_READ | assigned net connected in native DRC |
| E7 | IO_L6P_T0_35 | ASIC4_DATA8 | assigned net connected in native DRC |
| E8 | VCCBATT_0 | GND | assigned net connected in native DRC |
| E9 | CCLK_0 | FPGA_CCLK | assigned net connected in native DRC |
| E10 | TCK_0 | JTAG_TCK | assigned net connected in native DRC |
| E11 | TDI_0 | JTAG_TDI | assigned net connected in native DRC |
| E12 | TMS_0 | JTAG_TMS | assigned net connected in native DRC |
| E13 | TDO_0 | FPGA_TDO | assigned net connected in native DRC |
| E14 | GND | GND | assigned net connected in native DRC |
| E15 | IO_L11P_T1_SRCC_15 | Unassigned | intentional no-connect |
| E16 | IO_L11N_T1_SRCC_15 | Unassigned | intentional no-connect |
| E17 | IO_L16P_T2_A28_15 | Unassigned | intentional no-connect |
| E18 | IO_L21P_T3_DQS_15 | Unassigned | intentional no-connect |
| F1 | IO_L18P_T2_35 | ASIC1_DATA2 | assigned net connected in native DRC |
| F2 | VCCO_35 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| F3 | IO_L13N_T2_MRCC_35 | Unassigned | intentional no-connect |
| F4 | IO_L13P_T2_MRCC_35 | ASIC3_CLK32MHz_Out | assigned net connected in native DRC |
| F5 | IO_0_35 | ASIC3_DATA4 | assigned net connected in native DRC |
| F6 | IO_L19N_T3_VREF_35 | Unassigned | intentional no-connect |
| F7 | GND | GND | assigned net connected in native DRC |
| F8 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| F9 | GND | GND | assigned net connected in native DRC |
| F10 | VCCBRAM | VCCINT_1V0 | assigned net connected in native DRC |
| F11 | GND | GND | assigned net connected in native DRC |
| F12 | VCCAUX | VCCAUX_1V8 | assigned net connected in native DRC |
| F13 | IO_L5P_T0_AD9P_15 | Unassigned | intentional no-connect |
| F14 | IO_L5N_T0_AD9N_15 | Unassigned | intentional no-connect |
| F15 | IO_L14P_T2_SRCC_15 | Unassigned | intentional no-connect |
| F16 | IO_L14N_T2_SRCC_15 | Unassigned | intentional no-connect |
| F17 | GND | GND | assigned net connected in native DRC |
| F18 | IO_L22N_T3_A16_15 | Unassigned | intentional no-connect |
| G1 | IO_L17N_T2_35 | ASIC1_DATA7 | assigned net connected in native DRC |
| G2 | IO_L15N_T2_DQS_35 | ASIC1_DATA6 | assigned net connected in native DRC |
| G3 | IO_L20N_T3_35 | ASIC2_DATA6 | assigned net connected in native DRC |
| G4 | IO_L20P_T3_35 | ASIC3_DATA5 | assigned net connected in native DRC |
| G5 | VCCO_35 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| G6 | IO_L19P_T3_35 | ASIC3_DATA8 | assigned net connected in native DRC |
| G7 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| G8 | GND | GND | assigned net connected in native DRC |
| G9 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| G10 | GND | GND | assigned net connected in native DRC |
| G11 | VCCBRAM | VCCINT_1V0 | assigned net connected in native DRC |
| G12 | GND | GND | assigned net connected in native DRC |
| G13 | IO_0_15 | Unassigned | intentional no-connect |
| G14 | IO_L15N_T2_DQS_ADV_B_15 | STIM_CHIP2_SPI_DL | assigned net connected in native DRC |
| G15 | VCCO_15 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| G16 | IO_L13N_T2_MRCC_15 | Unassigned | intentional no-connect |
| G17 | IO_L18N_T2_A23_15 | NONSTIM_BOARD1_SPI_DL | assigned net connected in native DRC |
| G18 | IO_L22P_T3_A17_15 | NONSTIM_BOARD2_SPI_DR | assigned net connected in native DRC |
| H1 | IO_L17P_T2_35 | ASIC1_DATA5 | assigned net connected in native DRC |
| H2 | IO_L15P_T2_DQS_35 | ASIC2_DATA2 | assigned net connected in native DRC |
| H3 | GND | GND | assigned net connected in native DRC |
| H4 | IO_L21N_T3_DQS_35 | ASIC3_DATA3 | assigned net connected in native DRC |
| H5 | IO_L24N_T3_35 | ASIC3_DATA7 | assigned net connected in native DRC |
| H6 | IO_L24P_T3_35 | ASIC3_SYNC | assigned net connected in native DRC |
| H7 | GND | GND | assigned net connected in native DRC |
| H8 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| H9 | GNDADC_0 | GND | assigned net connected in native DRC |
| H10 | VCCADC_0 | VCCAUX_1V8 | assigned net connected in native DRC |
| H11 | GND | GND | assigned net connected in native DRC |
| H12 | VCCAUX | VCCAUX_1V8 | assigned net connected in native DRC |
| H13 | GND | GND | assigned net connected in native DRC |
| H14 | IO_L15P_T2_DQS_15 | STIM_CHIP2_SPI_DR | assigned net connected in native DRC |
| H15 | IO_L19N_T3_A21_VREF_15 | Unassigned | intentional no-connect |
| H16 | IO_L13P_T2_MRCC_15 | Unassigned | intentional no-connect |
| H17 | IO_L18P_T2_A24_15 | NONSTIM_BOARD1_SPI_DR | assigned net connected in native DRC |
| H18 | VCCO_15 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| J1 | VCCO_35 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| J2 | IO_L22N_T3_35 | ASIC1_SYNC | assigned net connected in native DRC |
| J3 | IO_L22P_T3_35 | ASIC2_DATA4 | assigned net connected in native DRC |
| J4 | IO_L21P_T3_DQS_35 | ASIC3_DATA1 | assigned net connected in native DRC |
| J5 | IO_25_35 | ASIC3_DATA2 | assigned net connected in native DRC |
| J6 | GND | GND | assigned net connected in native DRC |
| J7 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| J8 | GND | GND | assigned net connected in native DRC |
| J9 | VREFN_0 | GND | assigned net connected in native DRC |
| J10 | VP_0 | GND | assigned net connected in native DRC |
| J11 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| J12 | GND | GND | assigned net connected in native DRC |
| J13 | IO_L17N_T2_A25_15 | STIM_CHIP1_SPI_DR | assigned net connected in native DRC |
| J14 | IO_L19P_T3_A22_15 | STIM_CHIP1_SPI_DL | assigned net connected in native DRC |
| J15 | IO_L24N_T3_RS0_15 | STIM_CHIP3_SPI_DL | assigned net connected in native DRC |
| J16 | GND | GND | assigned net connected in native DRC |
| J17 | IO_L23P_T3_FOE_B_15 | STIM_CHIP4_SPI_DL | assigned net connected in native DRC |
| J18 | IO_L23N_T3_FWE_B_15 | NONSTIM_BOARD2_SPI_DL | assigned net connected in native DRC |
| K1 | IO_L23N_T3_35 | ASIC1_DATA1 | assigned net connected in native DRC |
| K2 | IO_L23P_T3_35 | ASIC1_DATA3 | assigned net connected in native DRC |
| K3 | IO_L2P_T0_34 | ASIC6_DATA5 | assigned net connected in native DRC |
| K4 | VCCO_34 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| K5 | IO_L5P_T0_34 | ASIC8_DATA5 | assigned net connected in native DRC |
| K6 | IO_0_34 | ASIC8_SYNC | assigned net connected in native DRC |
| K7 | GND | GND | assigned net connected in native DRC |
| K8 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| K9 | VN_0 | GND | assigned net connected in native DRC |
| K10 | VREFP_0 | GND | assigned net connected in native DRC |
| K11 | GND | GND | assigned net connected in native DRC |
| K12 | VCCAUX | VCCAUX_1V8 | assigned net connected in native DRC |
| K13 | IO_L17P_T2_A26_15 | BOARD4_SPI_CLK | assigned net connected in native DRC |
| K14 | VCCO_15 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| K15 | IO_L24P_T3_RS1_15 | STIM_CHIP3_SPI_DR | assigned net connected in native DRC |
| K16 | IO_25_15 | STIM_CHIP4_SPI_DR | assigned net connected in native DRC |
| K17 | IO_L1P_T0_D00_MOSI_14 | FPGA_CFG_DQ0 | assigned net connected in native DRC |
| K18 | IO_L1N_T0_D01_DIN_14 | FPGA_CFG_DQ1 | assigned net connected in native DRC |
| L1 | IO_L1P_T0_34 | ASIC6_DATA6 | assigned net connected in native DRC |
| L2 | GND | GND | assigned net connected in native DRC |
| L3 | IO_L2N_T0_34 | ASIC6_READ | assigned net connected in native DRC |
| L4 | IO_L5N_T0_34 | ASIC8_DATA4 | assigned net connected in native DRC |
| L5 | IO_L6N_T0_VREF_34 | Unassigned | intentional no-connect |
| L6 | IO_L6P_T0_34 | ASIC8_DATA7 | assigned net connected in native DRC |
| L7 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| L8 | GND | GND | assigned net connected in native DRC |
| L9 | DXN_0 | GND | assigned net connected in native DRC |
| L10 | DXP_0 | GND | assigned net connected in native DRC |
| L11 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| L12 | GND | GND | assigned net connected in native DRC |
| L13 | IO_L6P_T0_FCS_B_14 | FLASH_CS_B | assigned net connected in native DRC |
| L14 | IO_L2P_T0_D02_14 | Unassigned | intentional no-connect |
| L15 | IO_L3P_T0_DQS_PUDC_B_14 | CFG_PUDC_B | assigned net connected in native DRC |
| L16 | IO_L3N_T0_DQS_EMCCLK_14 | Unassigned | intentional no-connect |
| L17 | VCCO_14 | VCCAUX_1V8 | assigned net connected in native DRC |
| L18 | IO_L4P_T0_D04_14 | Unassigned | intentional no-connect |
| M1 | IO_L1N_T0_34 | ASIC6_DATA4 | assigned net connected in native DRC |
| M2 | IO_L4N_T0_34 | ASIC6_DATA1 | assigned net connected in native DRC |
| M3 | IO_L4P_T0_34 | ASIC6_DATA3 | assigned net connected in native DRC |
| M4 | IO_L16P_T2_34 | ASIC8_DATA2 | assigned net connected in native DRC |
| M5 | GND | GND | assigned net connected in native DRC |
| M6 | IO_L18P_T2_34 | ASIC8_DATA1 | assigned net connected in native DRC |
| M7 | GND | GND | assigned net connected in native DRC |
| M8 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| M9 | GND | GND | assigned net connected in native DRC |
| M10 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| M11 | GND | GND | assigned net connected in native DRC |
| M12 | VCCAUX | VCCAUX_1V8 | assigned net connected in native DRC |
| M13 | IO_L6N_T0_D08_VREF_14 | Unassigned | intentional no-connect |
| M14 | IO_L2N_T0_D03_14 | Unassigned | intentional no-connect |
| M15 | GND | GND | assigned net connected in native DRC |
| M16 | IO_L10P_T1_D14_14 | Unassigned | intentional no-connect |
| M17 | IO_L10N_T1_D15_14 | Unassigned | intentional no-connect |
| M18 | IO_L4N_T0_D05_14 | Unassigned | intentional no-connect |
| N1 | IO_L3N_T0_DQS_34 | ASIC6_DATA2 | assigned net connected in native DRC |
| N2 | IO_L3P_T0_DQS_34 | ASIC6_DATA8 | assigned net connected in native DRC |
| N3 | VCCO_34 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| N4 | IO_L16N_T2_34 | ASIC6_DATA7 | assigned net connected in native DRC |
| N5 | IO_L13P_T2_MRCC_34 | ASIC8_CLK32MHz_Out | assigned net connected in native DRC |
| N6 | IO_L18N_T2_34 | ASIC8_DATA8 | assigned net connected in native DRC |
| N7 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| N8 | GND | GND | assigned net connected in native DRC |
| N9 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| N10 | GND | GND | assigned net connected in native DRC |
| N11 | VCCINT | VCCINT_1V0 | assigned net connected in native DRC |
| N12 | GND | GND | assigned net connected in native DRC |
| N13 | VCCO_14 | VCCAUX_1V8 | assigned net connected in native DRC |
| N14 | IO_L8P_T1_D11_14 | Unassigned | intentional no-connect |
| N15 | IO_L11P_T1_SRCC_14 | Unassigned | intentional no-connect |
| N16 | IO_L11N_T1_SRCC_14 | Unassigned | intentional no-connect |
| N17 | IO_L9P_T1_DQS_14 | Unassigned | intentional no-connect |
| N18 | GND | GND | assigned net connected in native DRC |
| P1 | GND | GND | assigned net connected in native DRC |
| P2 | IO_L15P_T2_DQS_34 | ASIC5_SYNC | assigned net connected in native DRC |
| P3 | IO_L14N_T2_SRCC_34 | Unassigned | intentional no-connect |
| P4 | IO_L14P_T2_SRCC_34 | ASIC6_CLK32MHz_Out | assigned net connected in native DRC |
| P5 | IO_L13N_T2_MRCC_34 | Unassigned | intentional no-connect |
| P6 | VCCO_34 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| P7 | INIT_B_0 | FPGA_INIT_B | assigned net connected in native DRC |
| P8 | CFGBVS_0 | GND | assigned net connected in native DRC |
| P9 | PROGRAM_B_0 | FPGA_PROGRAM_B | assigned net connected in native DRC |
| P10 | DONE_0 | FPGA_DONE | assigned net connected in native DRC |
| P11 | M2_0 | GND | assigned net connected in native DRC |
| P12 | M0_0 | CFG_M0 | assigned net connected in native DRC |
| P13 | M1_0 | GND | assigned net connected in native DRC |
| P14 | IO_L8N_T1_D12_14 | Unassigned | intentional no-connect |
| P15 | IO_L13P_T2_MRCC_14 | Unassigned | intentional no-connect |
| P16 | VCCO_14 | VCCAUX_1V8 | assigned net connected in native DRC |
| P17 | IO_L12P_T1_MRCC_14 | CLK_32MHZ | assigned net connected in native DRC |
| P18 | IO_L9N_T1_DQS_D13_14 | Unassigned | intentional no-connect |
| R1 | IO_L17P_T2_34 | ASIC5_DATA2 | assigned net connected in native DRC |
| R2 | IO_L15N_T2_DQS_34 | ASIC5_DATA6 | assigned net connected in native DRC |
| R3 | IO_L11P_T1_SRCC_34 | ASIC5_CLK32MHz_Out | assigned net connected in native DRC |
| R4 | GND | GND | assigned net connected in native DRC |
| R5 | IO_L19N_T3_VREF_34 | Unassigned | intentional no-connect |
| R6 | IO_L19P_T3_34 | ASIC6_SYNC | assigned net connected in native DRC |
| R7 | IO_L23P_T3_34 | ASIC8_DATA6 | assigned net connected in native DRC |
| R8 | IO_L24P_T3_34 | ASIC8_DATA3 | assigned net connected in native DRC |
| R9 | VCCO_0 | VCCAUX_1V8 | assigned net connected in native DRC |
| R10 | IO_25_14 | Unassigned | intentional no-connect |
| R11 | IO_0_14 | Unassigned | intentional no-connect |
| R12 | IO_L5P_T0_D06_14 | Unassigned | intentional no-connect |
| R13 | IO_L5N_T0_D07_14 | Unassigned | intentional no-connect |
| R14 | GND | GND | assigned net connected in native DRC |
| R15 | IO_L13N_T2_MRCC_14 | Unassigned | intentional no-connect |
| R16 | IO_L15P_T2_DQS_RDWR_B_14 | Unassigned | intentional no-connect |
| R17 | IO_L12N_T1_MRCC_14 | Unassigned | intentional no-connect |
| R18 | IO_L7P_T1_D09_14 | Unassigned | intentional no-connect |
| T1 | IO_L17N_T2_34 | ASIC5_DATA5 | assigned net connected in native DRC |
| T2 | VCCO_34 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| T3 | IO_L11N_T1_SRCC_34 | Unassigned | intentional no-connect |
| T4 | IO_L12N_T1_MRCC_34 | Unassigned | intentional no-connect |
| T5 | IO_L12P_T1_MRCC_34 | ASIC7_CLK32MHz_Out | assigned net connected in native DRC |
| T6 | IO_L23N_T3_34 | ASIC7_SYNC | assigned net connected in native DRC |
| T7 | GND | GND | assigned net connected in native DRC |
| T8 | IO_L24N_T3_34 | ASIC8_READ | assigned net connected in native DRC |
| T9 | IO_L24P_T3_A01_D17_14 | Unassigned | intentional no-connect |
| T10 | IO_L24N_T3_A00_D16_14 | Unassigned | intentional no-connect |
| T11 | IO_L19P_T3_A10_D26_14 | Unassigned | intentional no-connect |
| T12 | VCCO_14 | VCCAUX_1V8 | assigned net connected in native DRC |
| T13 | IO_L23P_T3_A03_D19_14 | Unassigned | intentional no-connect |
| T14 | IO_L14P_T2_SRCC_14 | Unassigned | intentional no-connect |
| T15 | IO_L14N_T2_SRCC_14 | Unassigned | intentional no-connect |
| T16 | IO_L15N_T2_DQS_DOUT_CSO_B_14 | Unassigned | intentional no-connect |
| T17 | GND | GND | assigned net connected in native DRC |
| T18 | IO_L7N_T1_D10_14 | Unassigned | intentional no-connect |
| U1 | IO_L7P_T1_34 | ASIC5_DATA3 | assigned net connected in native DRC |
| U2 | IO_L9P_T1_DQS_34 | ASIC5_DATA4 | assigned net connected in native DRC |
| U3 | IO_L8N_T1_34 | ASIC5_DATA8 | assigned net connected in native DRC |
| U4 | IO_L8P_T1_34 | ASIC7_DATA1 | assigned net connected in native DRC |
| U5 | VCCO_34 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| U6 | IO_L22N_T3_34 | ASIC7_DATA7 | assigned net connected in native DRC |
| U7 | IO_L22P_T3_34 | ASIC7_DATA4 | assigned net connected in native DRC |
| U8 | IO_25_34 | ASIC7_DATA6 | assigned net connected in native DRC |
| U9 | IO_L21P_T3_DQS_34 | ASIC7_READ | assigned net connected in native DRC |
| U10 | GND | GND | assigned net connected in native DRC |
| U11 | IO_L19N_T3_A09_D25_VREF_14 | Unassigned | intentional no-connect |
| U12 | IO_L20P_T3_A08_D24_14 | Unassigned | intentional no-connect |
| U13 | IO_L23N_T3_A02_D18_14 | Unassigned | intentional no-connect |
| U14 | IO_L22P_T3_A05_D21_14 | Unassigned | intentional no-connect |
| U15 | VCCO_14 | VCCAUX_1V8 | assigned net connected in native DRC |
| U16 | IO_L18P_T2_A12_D28_14 | Unassigned | intentional no-connect |
| U17 | IO_L17P_T2_A14_D30_14 | Unassigned | intentional no-connect |
| U18 | IO_L17N_T2_A13_D29_14 | Unassigned | intentional no-connect |
| V1 | IO_L7N_T1_34 | ASIC5_DATA1 | assigned net connected in native DRC |
| V2 | IO_L9N_T1_DQS_34 | ASIC5_DATA7 | assigned net connected in native DRC |
| V3 | GND | GND | assigned net connected in native DRC |
| V4 | IO_L10N_T1_34 | ASIC5_READ | assigned net connected in native DRC |
| V5 | IO_L10P_T1_34 | ASIC7_DATA3 | assigned net connected in native DRC |
| V6 | IO_L20N_T3_34 | ASIC7_DATA5 | assigned net connected in native DRC |
| V7 | IO_L20P_T3_34 | ASIC7_DATA2 | assigned net connected in native DRC |
| V8 | VCCO_34 | VCC_ASIC_1V5 | assigned net connected in native DRC |
| V9 | IO_L21N_T3_DQS_34 | ASIC7_DATA8 | assigned net connected in native DRC |
| V10 | IO_L21P_T3_DQS_14 | Unassigned | intentional no-connect |
| V11 | IO_L21N_T3_DQS_A06_D22_14 | Unassigned | intentional no-connect |
| V12 | IO_L20N_T3_A07_D23_14 | Unassigned | intentional no-connect |
| V13 | GND | GND | assigned net connected in native DRC |
| V14 | IO_L22N_T3_A04_D20_14 | Unassigned | intentional no-connect |
| V15 | IO_L16P_T2_CSI_B_14 | Unassigned | intentional no-connect |
| V16 | IO_L16N_T2_A15_D31_14 | Unassigned | intentional no-connect |
| V17 | IO_L18N_T2_A11_D27_14 | Unassigned | intentional no-connect |
| V18 | VCCO_14 | VCCAUX_1V8 | assigned net connected in native DRC |

### U2 — Core / block ram converter

**Value:** TPS62135RGXR · **Decision:** Keep function

Converts the proposed 12 V input into the core / block RAM rail. Its output voltage is selected by R1/R2.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned net connected in native DRC |
| 2 | SW | SW_CORE | assigned net connected in native DRC |
| 3 | GND | GND | assigned net connected in native DRC |
| 4 | FB2 | GND | assigned net connected in native DRC |
| 5 | FB | FB_CORE | assigned net connected in native DRC |
| 6 | VOS | VCORE_REG_1V025 | assigned net connected in native DRC |
| 7 | PG | PG_CORE | assigned net connected in native DRC |
| 8 | EN | LINK_12V | assigned net connected in native DRC |
| 9 | SS/TR | SS_CORE | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned net connected in native DRC |
| 11 | VSEL | GND | assigned net connected in native DRC |

### U3 — Auxiliary / configuration converter

**Value:** TPS62135RGXR · **Decision:** Keep function

Converts the proposed 12 V input into the auxiliary / configuration rail. Its output voltage is selected by R3/R4.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned net connected in native DRC |
| 2 | SW | SW_AUX | assigned net connected in native DRC |
| 3 | GND | GND | assigned net connected in native DRC |
| 4 | FB2 | GND | assigned net connected in native DRC |
| 5 | FB | FB_AUX | assigned net connected in native DRC |
| 6 | VOS | VAUX_REG_1V803 | assigned net connected in native DRC |
| 7 | PG | PG_AUX | assigned net connected in native DRC |
| 8 | EN | PG_CORE | assigned net connected in native DRC |
| 9 | SS/TR | SS_AUX | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned net connected in native DRC |
| 11 | VSEL | GND | assigned net connected in native DRC |

### U4 — 2.5 v link bank converter

**Value:** TPS62135RGXR · **Decision:** Depends on system choice

Converts the proposed 12 V input into the 2.5 V link bank rail. Its output voltage is selected by R5/R6.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned net connected in native DRC |
| 2 | SW | SW_CFG | assigned net connected in native DRC |
| 3 | GND | GND | assigned net connected in native DRC |
| 4 | FB2 | GND | assigned net connected in native DRC |
| 5 | FB | FB_CFG | assigned net connected in native DRC |
| 6 | VOS | VCC_LINK_2V5 | assigned net connected in native DRC |
| 7 | PG | Unassigned | intentional no-connect |
| 8 | EN | PG_AUX | assigned net connected in native DRC |
| 9 | SS/TR | SS_CFG | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned net connected in native DRC |
| 11 | VSEL | GND | assigned net connected in native DRC |

### U5 — 1.5 v asic-facing banks converter

**Value:** TPS62135RGXR · **Decision:** Depends on system choice

Converts the proposed 12 V input into the 1.5 V ASIC-facing banks rail. Its output voltage is selected by R7/R8.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned net connected in native DRC |
| 2 | SW | SW_ASIC | assigned net connected in native DRC |
| 3 | GND | GND | assigned net connected in native DRC |
| 4 | FB2 | GND | assigned net connected in native DRC |
| 5 | FB | FB_ASIC | assigned net connected in native DRC |
| 6 | VOS | VCC_ASIC_1V5 | assigned net connected in native DRC |
| 7 | PG | Unassigned | intentional no-connect |
| 8 | EN | PG_AUX | assigned net connected in native DRC |
| 9 | SS/TR | SS_ASIC | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned net connected in native DRC |
| 11 | VSEL | GND | assigned net connected in native DRC |

### U6 — Nonvolatile boot image

**Value:** MX25U12835FM2I-10G · **Decision:** Depends on system choice

Stores the configuration image for autonomous SPI boot at 1.8 V. The FPGA logic configuration must be loaded after power-up.

**If removed:** The selected SPI self-boot path is lost; an external configuration method would be required each startup.

**Review:** Keep for autonomous Master SPI x1 boot at 1.8 V. R106/R107 and FPGA DQ2/DQ3 paths are omitted. Use a compatible SPI x1 image and validated flash-programming procedure; quad configuration is not supported by this wiring.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | CS# | FLASH_CS_B | assigned net connected in native DRC |
| 2 | SO / SIO1 | FLASH_DQ1 | assigned net connected in native DRC |
| 3 | WP# / SIO2 | FLASH_DQ2 | assigned net connected in native DRC |
| 4 | GND | GND | assigned net connected in native DRC |
| 5 | SI / SIO0 | FLASH_DQ0 | assigned net connected in native DRC |
| 6 | SCLK | FLASH_SCLK | assigned net connected in native DRC |
| 7 | RESET# / SIO3 | FLASH_DQ3 | assigned net connected in native DRC |
| 8 | VCC | VCCAUX_1V8 | assigned net connected in native DRC |

### Y1 — 32 MHz system reference

**Value:** ASE3 32MHz 1.8V · **Decision:** Depends on system choice

The 1.8 V oscillator provides the application clock through R119 to U1.P17. It is separate from the FPGA configuration clock.

**If removed:** The present application clock path stops; SPI configuration may still use its own clock, but application operation requires an alternative reference.

**Review:** Keep for self-contained clocking. Remove only if another approved clock source is supplied with valid startup and timing.

| Pin | Function | Native net | Status |
|---|---|---|---|
| 1 | Enable | VCCAUX_1V8 | assigned net connected in native DRC |
| 2 | GND | GND | assigned net connected in native DRC |
| 3 | Clock output | OSC_32M_RAW | assigned net connected in native DRC |
| 4 | VDD | VCCAUX_1V8 | assigned net connected in native DRC |

## Evidence and limits

All 752 electrical endpoints were compared with the supplied native XML and PCB. Package assignments and physical copper status are separate. The current routing audit owns routing counts; all ASIC timing, electrical and bench claims remain unverified.
