# Routing-board handoff for Howard FPGA RevC

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

18 September 2026. This document defines the proposed division between the new FPGA PCB and Zitong's routing PCB. It does not turn the older routing/LDO reference into an approved design.

The system direction is **8 ASICs across 4 carrier boards → routing/power PCB → XC7A200T FPGA PCB → micro-HDMI link → receiver interface for KR260 → PC**. The FPGA board combines the ASIC data. The routing board distributes individual signals and supplies; its exact conditioning and regulation remain to be selected.

Gerald confirmed: “The reference voltage is 1.5V and the clock should 32MHz.” These are the nominal reference and intended ASIC clock. They are not a complete per-pin electrical specification, nor a requirement that the FPGA's physical reference oscillator itself be 32 MHz.

## Proposed routing-board inventory

| Item | Proposed quantity | Meaning and remaining decision |
|---|---:|---|
| Carrier interfaces | 4 provisional | Assumes one mating interface per carrier. Confirm actual carrier revision, connector identity and orientation. |
| FPGA-facing connector(s) | TBD | Both ends must use an agreed mating pair and pin map. Count independent data, clocks, synchronization, control, power and ground returns before selecting a count. |
| Low-voltage regulators | 7 per independent supply group | Reference-derived proposal. Confirm which rails need separate regulation and which already exist on the carriers. One supply group per ASIC is not assumed. |
| Regulator setting resistors | 7 per group | 5 × 15 kΩ, 1 × 16 kΩ, 1 × 7.5 kΩ. These are nominal recovered reference values, subject to the selected regulator and verified rail requirements. |
| Input/output/setting and load-filter capacitors | TBD | Choose from regulator stability requirements, load transients and physical load locations. |
| Power handoff and ground-return connections | TBD | Decide which board receives external power and what, if any, power passes between boards. A dedicated power connector is not yet a fixed requirement. |
| Rail test points and current-measurement links | TBD | Provide access for each implemented rail and relevant current path. |
| Clock buffers, series damping and level translation | Conditional; TBD, potentially 0 | Add only where electrical compatibility, fanout or signal integrity requires them. |
| Stimulation-supply circuitry | TBD | Confirm required rails, voltage/current limits, topology and board location. |
| Mounting and connector strain relief | TBD | Agree with carrier stacking and cable access; functionality currently takes priority over the smallest outline. |

For **g** independent supply groups, the proposal contains **7g regulators** and **7g setting resistors**: **5g × 15 kΩ, g × 16 kΩ and g × 7.5 kΩ**. The selected value of **g is unknown**. For example, 1 group would use 7 regulators; 4 groups would use 28; 8 groups would use 56. These examples do not select a topology or prove acceptable noise/current performance.

The reference-derived nominal setpoints are five 1.5 V rails (VDD_FE, VDD_ADC, VDD_DRIVER, DVDD and REF_VDD), one 1.6 V rail (VDD_CGEN) and one 0.75 V rail (REF_VCM). Confirm that these remain the current ASIC's required and independent supplies before adoption.

## Handoff items that affect the FPGA PCB

| Required item | Owner / evidence | PCB decision it closes |
|---|---|---|
| Carrier revision and complete routing-to-FPGA pin map, including grounds and power | Zitong + Howard; Gerald supplies ASIC/carrier requirements | Connector pairing, contact count, FPGA pins and clock-capable pin allocation. |
| Per-pin voltage limits, output levels, clock/data timing, shared versus per-ASIC controls, and startup states | Gerald / ASIC design documentation | Bank voltages, capture timing, level translation, buffering and pull-up/down circuits. Do not re-ask the confirmed nominal 1.5 V and 32 MHz values. |
| Power direction, input voltage range, continuous and peak current, regulation already present, and sequencing | Zitong + Howard; ASIC current requirements from Gerald/design evidence | FPGA-board power input, converter capacity, power contacts, copper and startup design. |
| Number of independent supply groups and which seven reference rails remain applicable | Zitong + Gerald | Routing regulator/passive quantities and any power load presented to the FPGA PCB. |
| Micro-HDMI lane assignment, signaling levels, clocking, commands and physical KR260 receiver path | Howard + receiver engineer | FPGA bank/pin allocation, connector pinout, termination, protection and any interface ICs. The cable/connector selection alone does not select the electrical protocol. |
| Recording-buffer capacity/type and complete FPGA power/boot design | Howard | RAM footprint and signals, flash and JTAG connections, own-board regulators and support parts. |

These items can be closed alongside FPGA power, programming, clock and placement work. They are requirements for finishing the affected circuits and releasing a manufacturable board, rather than reasons to stop all drafting.

## Reference boundaries

- The older LDO board is an example, not a validated new-routing-board BOM. Its regulator package/footprint pin mapping and the high-voltage branches require reconciliation before reuse.
- In particular, do not approve or copy the old VDD10/VSS10 branches as a verified ±10 V supply. The earlier audit recovered a +9 V setpoint in the positive branch; the negative branch did not establish a verified −10 V supply. This is a reference-document concern, not a measured claim about assembled hardware.
- Do not approve an LT3042 MSE-symbol/DFN-footprint combination until the exact ordering code, manufacturer pinout, symbol and footprint agree.
- The provided carrier's 80-contact interface and the old LDO reference's 50-contact connector do not establish a matching pair. Connector counts from either old board are not automatically RevC requirements.
- Provisional routing connector footprints in an area study reserve space; their presence does not freeze the electrical handoff.

## Sources and related documents

- [Howard's latest proposed component list](2026-09-18-component-proposal.md).
- [Current project decisions](2026-09-18-current-decisions.md).
- [Routing inventory and previous source audit](2026-09-18-routing-parts.md).
- [Detailed ASIC power reference audit](2026-09-18-asic-power-audit.md).
- [technical follow-up summary](../../docs/meetings/2026-09-18-follow-up.md).
- Original reference: `Original Sources/04_LDO_Routing_Reference/LDO_Board_10SOIC (New Rigid)/PCB.kicad_sch`.
