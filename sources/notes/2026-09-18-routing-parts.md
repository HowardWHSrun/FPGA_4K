# Routing PCB: provisional parts and power handoff

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

18 September 2026. This is an inferred starting inventory, not Gerald's final list or an approved new-board BOM. No finalized new-routing-board list was identified in the files reviewed. The supplied Slack assigns routing and power management to Zitong; ASIC requirements still come from Gerald/the ASIC designer.

| Item | Quantity basis | Why / next decision |
|---|---|---|
| Carrier interfaces | 4 proposed, if each of the four carriers uses one system connector | Exact carrier revision/mating arrangement from Gerald and Zitong; more than one connector per carrier would change this count. |
| FPGA-facing connector(s) | TBD | Count all data/timing/control contacts plus power and ground returns. Agree with Zitong at the next discussion. |
| Low-voltage LT3042 regulators | 7 per proposed independent supply group | Candidate reference-derived rails: VDD_FE, VDD_ADC, VDD_DRIVER, DVDD, REF_VDD = 1.5 V; VDD_CGEN = 1.6 V; REF_VCM = 0.75 V. Do not assume one group per ASIC. |
| Low-voltage SET resistors | 7 per group: 5 x 15 kohm, 1 x 16 kohm, 1 x 7.5 kohm | Nominal setpoints recovered from the original circuit, not guaranteed current-revision requirements. |
| LDO input/output/SET and load bypass capacitors | Final count TBD | Depends on chosen grouping, stability, actual loads, placement and any regulation already on the carriers. |
| Power input/distribution and ground returns | Source/interface and quantities TBD | Agree voltage/current, feed direction, sequencing and return paths with Zitong. Power could use connector contacts rather than an extra standalone socket. |
| Current links and test points | Count TBD after rail grouping | Make each actual supply measurable during bring-up. |
| Clock buffers / series damping / level translators | Conditional; quantity TBD, potentially zero | Only fit if voltage, fanout or signal-integrity analysis requires them. Routing does not merge independent ASIC data outputs. |
| Stimulation positive/negative supply circuitry | Scope/count TBD | The old VDD10/VSS10 circuit and regulator package mapping require reconciliation before reuse. |
| Mounting / strain-relief hardware | Count TBD | Geometry is flexible; choose together with mating connectors. |

If g independent low-voltage groups are used, regulator count is 7g and SET resistor count is 7g. Examples g=1,4,8 give 7,28,56 of each. These are grouping examples, not selected quantities. Confirm whether the seven reference rails all remain separate and whether any are already on the carriers before adopting this topology.

The original reference has exactly **9 regulator symbols, 9 resistor symbols and 43 capacitor symbols (34 x 10 uF and 9 x 1 uF)**, checked in PCB.kicad_sch. Two regulators are the unresolved high-voltage branches. These are old-reference counts, not the new routing-board count. Its 18 J-reference symbols comprise two 50-contact connectors and sixteen single-pin headers; they must not be promoted into an 18-connector new-board requirement. The supplied PCB-5 carrier has an 80-contact DF40 footprint, so the old 50-contact reference is not an automatically compatible mating set.

Source: Original Sources/04_LDO_Routing_Reference/LDO_Board_10SOIC (New Rigid)/PCB.kicad_sch. Detailed setpoint and package audit: detail_review/asic_power_research.md. Team assignment: Original Sources/10_Lab_Slack/Lab_Slack_Conversation_received_2026-09-18.txt.

The FPGA PCB retains the XC7A200T, its own power/configuration/clocking, potential recording RAM, and the selected micro-HDMI transmit/interface circuitry. ASIC low-noise regulation is proposed on routing/carriers, subject to the agreed power handoff.
