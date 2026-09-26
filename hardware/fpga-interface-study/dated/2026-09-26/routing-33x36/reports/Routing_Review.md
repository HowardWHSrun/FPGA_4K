# 33 × 36 mm FPGA board — routing review

**26 September 2026 · America/Chicago. This is the only active size.** Earlier designs are historical checkpoints. This package is an editable routing revision, not a manufacturing release or a verified working board.

## What changed

- Integrated the rail revision and both 60-contact mezzanines into one **130-part, 21-sheet** KiCad project, still **33 × 36 mm**.
- Configuration, bank 14, boot flash and oscillator now use 1.8 V; CFGBVS is grounded. Bank 16 is supplied at 2.5 V for the proposed LVDS link. ASIC banks remain at 1.5 V. This voltage arrangement does not validate the complete cable or receiver.
- U6 is the 1.8 V MX25U12835FM2I-10G flash; Y1 is ASE3-32.000MHZ-L-C-T. U4 feedback R5 is 180 kΩ. Added C92 (47 µF bank-14 bulk) and R122 (15 mΩ auxiliary isolation); the latter keeps distributed bypass capacitance downstream of the regulator sense/output node.
- Routed all **25 boot, clock and JTAG nets**, and **three power-good nets** (two sequencing nets and one status net without a consumer). Regulator switch/feedback/soft-start/output loops and local ground returns are routed. Two inner ground-reference zones and two local outer ground zones are present.
- Moved C30 by **0.15 mm** to open a legal DONE escape. No other existing component was moved. The outline and saved clearances are unchanged.

## What the saved file proves

| Check | Result |
|---|---|
| Board outline | 33 × 36 mm |
| Parts | 130 (39 front / 91 back) |
| Native copper | 1139 trace segments / 164 through-vias / 4 zones |
| Physical DRC | 0 violations |
| Schematic ↔ PCB parity | 0 issues |
| Pin readback | 762 numbered endpoints; 425 assigned; 331 unassigned; six intentional no-connects |
| Assigned-net connections still missing | **146** (corrected starting base: 386; 240 fewer) |
| ERC | 331 open-pin errors and 5 symbol-type warnings |
| Suppressed checks / DRC exclusions | 0 / 0 |

The 331 ERC open pins are **203 unassigned FPGA user-I/O pads, 120 mezzanine contacts and eight reserved J4 lane contacts**. The five warnings concern the imported bidirectional symbol types on CFGBVS and unused XADC inputs tied to ground. These remain visible. They are not silently excluded to make a clean-looking ERC report.

A low unconnected count is not full-board completion: **the 117 ASIC connections and four cable pairs have not been assigned in the netlist**, so they are outside this count. There is no claim of electrical operation, timing closure, power integrity, thermal qualification or manufacturing readiness.

### Missing copper, by assigned net

| Net | Native unconnected items |
|---|---:|
| `GND` | 8 |
| `LINK_12V` | 9 |
| `VAUX_REG_1V803` | 1 |
| `VCCAUX_1V8` | 49 |
| `VCCINT_1V0` | 34 |
| `VCC_ASIC_1V5` | 37 |
| `VCC_LINK_2V5` | 8 |

See [Native_DRC.json](Native_DRC.json) for the exact objects. Ground islands, where listed, are electrically unjoined copper despite their ground labels. They must be connected before release.

## How to inspect each component and pin

- [Component_List.csv](Component_List.csv): all 130 parts, values, locations, part numbers, purpose/qualification notes and datasheet links.
- [All_Pin_Connections.csv](All_Pin_Connections.csv): all 762 numbered endpoints, native/schematic net agreement, functions and bank numbers where available, and assigned/open/no-connect status.
- [Net_Endpoints.csv](Net_Endpoints.csv): every endpoint on each of the 48 functional nets and its remaining native connection count.
- [Native_Readback.json](Native_Readback.json): physical pad records and the complete comparison. Duplicate connector ground pads share one electrical pin number; paste apertures and mechanical holes are not electrical pins.
- [Native_ERC.json](Native_ERC.json): unsuppressed schematic findings. [Routing_Snapshot.json](Routing_Snapshot.json) drives the website counts.

The [current LaTeX PDF](../report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) and [editable source](../report/FPGA100T_33x36_Routing_Component_Pin_Report.tex) explain this 130-part revision and include every numbered endpoint. The earlier 128-part report remains a historical placement checkpoint.

## Remaining engineering decisions

1. **Finish supply distribution and ground continuity.** Reserve broad core-rail copper, account for both supply and return resistance, and provide suitable multiple vias. A visually connected thin line would not establish adequate current delivery. TI's DCS-Control output-sense and isolation topology must remain intact; no bypass around R9/R122. The [power audit](Power_Routing_Review.md) gives specific resistance estimates and source references.
2. **Finalize ASIC electrical and timing limits, then assign/routable FPGA balls.** The 117 logical names and Gerald's slide timing are verified as source information. AC_IN/IMP_TST voltage/analog behavior, input thresholds, output loading, reset defaults, sampling edge and corrected channel map still need authoritative confirmation. All 120 mezzanine contacts remain open in native CAD.
3. **Complete the custom XEM8310 carrier/cable contract.** Exact contacts, lane protocol, bandwidth/RTL, impedance/termination, common-mode/ground-offset budget, target-JTAG voltage handling and protection are unqualified. The XEM8310 is an FPGA module. An ordinary HDMI port or cable connection is not an approved power/programming interface.
4. **Qualify input power and protection.** 12 V through J4 is a proposal; source current, cable resistance/length, inrush, fault protection and hot-plug behavior need hardware verification. There is no fitted D2/TVS in this board. Regulator current ratings are not a system power budget.
5. **Select exact FPGA order code and manufacturing stack-up.** Standard 1.0 V core is assumed; speed and temperature grade are unselected. Six copper layers, 0.10 mm traces and 0.40/0.20 mm through-vias are draft rules; no HDI or filled via-in-pad assumption is hidden. Assembly tolerances, mated mezzanine space, J4 plug insertion, thermal behavior and PDN/SI checks remain open.
6. **Resolve one nonessential status branch.** PGOOD_IO currently joins U4.PG, U5.PG and R12 but has no FPGA or external consumer. R12 is not essential to the present observed function. Remove this branch or assign a defined monitoring function before freezing a minimal BOM. No extra testpoints or optional programming headers were added.

## Source and check boundaries

The package pin map was checked against the original AMD CSG324 CSV, not inferred from another FPGA board. The power review uses AMD DS181/UG483 and TI TPS62135 datasheet sections 9.3–9.4 and 10.3.2. Gerald's ASIC slides establish useful protocol behavior but do not supply complete pad limits. CP SOM ONE informs the power architecture; its different package/layout is not a drop-in routed design.

Board SHA-256: `ae601df3925e5ec5e90c8a2e747356e432d0558e820199cf7c01c6bf8a7fef96`. All facts above refer to this saved native snapshot. The [final independent power review](Final_Power_Review.md) checks 76 rail/pin invariants and explicitly records the open U4.11 VSEL ground strap and absent input protection. The [independent routing audit](Final_Independent_Audit.md) separately checks continuity and preservation of the two mezzanines. Two bounded ground-first rerouting trials disconnected required flash/configuration branches; they were rejected. [Ground escape analysis](Ground_Escape_Review.md) records the retained open balls and why a wider escape/placement revision is required.
