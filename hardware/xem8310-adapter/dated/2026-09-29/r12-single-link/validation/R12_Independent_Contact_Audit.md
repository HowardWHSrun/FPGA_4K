# R12 single-link independent native copper-graph audit

**FAIL — graph scope only.**

| Check | Result |
|---|---|
| Physical component manifest | 45 PCB / 45 XML |
| Cable contacts reaching every native circuit endpoint | 10 / 19 |
| Dedicated serial conductors with correct destination and isolation | 8 / 8 |
| MC1 / MC2 matching-number pass-throughs | 160 / 160 |
| Remaining MC3 matching-number pass-throughs | 67 / 67 |
| Selected BRK contacts isolated | 13 / 13 |
| Bank67 JTAG native GPIO map | 5 / 5 |
| SYS_GND physical pads / copper components | 54 / 6 |
| Pad-net parity errors | 0 |
| Open multiple-pad nets | 5 |
| Physical copper-net conflicts | 0 |
| Stored filled copper zones / keepout rule areas | 10 / 8 |
| Source hashes unchanged | True |

The target-derived 1.8 V reference/translator supply is checked against ground, XEM 1.2 V, input 12 V and branch 12 V. Resistors, translators, eFuses and removable jumpers are circuit endpoints, not copper bridges.

Copper graph and component/pad-net parity only. No semiconductor conduction, selector position, impedance, SI/PI, current/thermal capacity, firmware or fabrication qualification.

Sources:

- PCB: `2026-09-29_FPGA_Work/22_BRK8310_Single_Link_Interposer_R12/project/BRK8310_Single_Link_Interposer_R12.kicad_pcb`
- XML: `2026-09-29_FPGA_Work/22_BRK8310_Single_Link_Interposer_R12/validation/R12_Full_Netlist.xml`

PCB SHA-256: `a1c2edf7554c58e6b5763d82b714bedd78e23a68d02884bb31c5cb4047131257`

XML SHA-256: `e0571d340fa2a3f22d49ec2255a61a708f7f97875977283bbd4d0397ace5bfab`

## Actionable failures

- `open_copper_net`: {"net": "P1_TCK", "physical_pad_count": 3, "component_count": 2, "components": [["JP123.2", "R126.1"], ["J201.17"]]}
- `open_copper_net`: {"net": "P1_TDI", "physical_pad_count": 3, "component_count": 2, "components": [["JP122.2", "R125.1"], ["J201.15"]]}
- `open_copper_net`: {"net": "P1_TDO", "physical_pad_count": 4, "component_count": 2, "components": [["J21.8", "R131.1", "U101.11"], ["J201.18"]]}
- `open_copper_net`: {"net": "P1_TMS", "physical_pad_count": 3, "component_count": 2, "components": [["JP121.2", "R124.1"], ["J201.2"]]}
- `open_copper_net`: {"net": "SYS_GND", "physical_pad_count": 54, "component_count": 6, "components": [["C121.2", "C122.2", "C311.2", "C312.2", "C313.2", "C314.2", "D300.2", "D301.2", "J10.0", "J11.0", "J12.5", "J12.6", "J12.7", "J12.8", "J13.5", "J13.6", "J13.7", "J13.8", "J201.13", "J201.16", "J21.1", "J21.11", "J21.13", "J21.3", "J21.5", "J21.7", "J21.9", "R126.2", "R129.2", "R131.2", "R312.2", "R314.2", "R315.2", "U101.10", "U101.8"], ["J201.10"], ["J201.4"], ["R132.2"], ["J201.7"], ["U301.8"]]}
- `cable_contact_destination_open`: {"contact": "J201.2", "net": "P1_TMS", "missing_destinations": ["JP121.2", "R124.1"]}
- `cable_contact_destination_open`: {"contact": "J201.4", "net": "SYS_GND", "missing_destinations": ["C121.2", "C122.2", "C311.2", "C312.2", "C313.2", "C314.2", "D300.2", "D301.2", "J10.0", "J11.0", "J12.5", "J12.6", "J12.7", "J12.8", "J13.5", "J13.6", "J13.7", "J13.8", "J201.10", "J201.13", "J201.16", "J201.7", "J21.1", "J21.11", "J21.13", "J21.3", "J21.5", "J21.7", "J21.9", "R126.2", "R129.2", "R131.2", "R132.2", "R312.2", "R314.2", "R315.2", "U101.10", "U101.8", "U301.8"]}
- `cable_contact_destination_open`: {"contact": "J201.7", "net": "SYS_GND", "missing_destinations": ["C121.2", "C122.2", "C311.2", "C312.2", "C313.2", "C314.2", "D300.2", "D301.2", "J10.0", "J11.0", "J12.5", "J12.6", "J12.7", "J12.8", "J13.5", "J13.6", "J13.7", "J13.8", "J201.10", "J201.13", "J201.16", "J201.4", "J21.1", "J21.11", "J21.13", "J21.3", "J21.5", "J21.7", "J21.9", "R126.2", "R129.2", "R131.2", "R132.2", "R312.2", "R314.2", "R315.2", "U101.10", "U101.8", "U301.8"]}
- `cable_contact_destination_open`: {"contact": "J201.10", "net": "SYS_GND", "missing_destinations": ["C121.2", "C122.2", "C311.2", "C312.2", "C313.2", "C314.2", "D300.2", "D301.2", "J10.0", "J11.0", "J12.5", "J12.6", "J12.7", "J12.8", "J13.5", "J13.6", "J13.7", "J13.8", "J201.13", "J201.16", "J201.4", "J201.7", "J21.1", "J21.11", "J21.13", "J21.3", "J21.5", "J21.7", "J21.9", "R126.2", "R129.2", "R131.2", "R132.2", "R312.2", "R314.2", "R315.2", "U101.10", "U101.8", "U301.8"]}
- `cable_contact_destination_open`: {"contact": "J201.13", "net": "SYS_GND", "missing_destinations": ["J201.10", "J201.4", "J201.7", "R132.2", "U301.8"]}
- `cable_contact_destination_open`: {"contact": "J201.15", "net": "P1_TDI", "missing_destinations": ["JP122.2", "R125.1"]}
- `cable_contact_destination_open`: {"contact": "J201.16", "net": "SYS_GND", "missing_destinations": ["J201.10", "J201.4", "J201.7", "R132.2", "U301.8"]}
- `cable_contact_destination_open`: {"contact": "J201.17", "net": "P1_TCK", "missing_destinations": ["JP123.2", "R126.1"]}
- `cable_contact_destination_open`: {"contact": "J201.18", "net": "P1_TDO", "missing_destinations": ["J21.8", "R131.1", "U101.11"]}
