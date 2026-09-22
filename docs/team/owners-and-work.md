# Owners and open work

Updated for the initial team handoff on 2026-09-21. Responsibilities below are roles to assign, not confirmed personal assignments. Record a GitHub username once the person accepts ownership.

| Workstream | Working source | Owner / reviewer | Next step |
|---|---|---|---|
| FPGA schematic and layout | [Working draft](../../hardware/fpga-board/README.md) | TBD / TBD | Review the baseline; claim exclusive board editing in an issue |
| ASIC carrier | [Preserved reference](../../hardware/references/asic-carrier/PCB.kicad_pro) | TBD / TBD | Confirm the authoritative editable project before creating a working copy |
| Routing and power board | [Historical reference](../../hardware/references/ldo-routing/PCB.kicad_pro) | TBD / TBD | Confirm topology and baseline; do not assume this example mates with the carrier |
| Receiver / KR260 interface | [Recorded context](../meetings/2026-09-18-follow-up.md) | TBD / TBD | Specify actual receiver hardware and electrical link |
| FPGA firmware / host software | [Earlier ECP5/FT600 code](../../firmware/README.md) | TBD / TBD | Identify reusable pieces and new Artix-7 work |

## Decisions blocking electrical completion

| Decision | Required owners | Evidence to close it |
|---|---|---|
| Carrier → routing → FPGA connector map | Carrier + routing + FPGA | Matching pin tables, directions, IO voltages, grounds, mating parts and mechanics |
| ASIC timing and startup | ASIC + FPGA | Reviewed timing diagrams, voltage limits and reset/startup behavior |
| Rail currents, compensation and sequencing | Power + FPGA | Reviewed power budget, regulator calculations and startup requirements |
| RAM part/controller and bank assignments | FPGA + firmware | Chosen part, ballout, VCCO/VREF/VTT and timing constraints |
| FPGA oscillator and clock architecture | FPGA + receiver | Frequency, jitter, voltage and acquisition/link clock plan |
| Custom micro-HDMI link and receiver | FPGA + receiver | Protocol, signaling, pin map, termination/protection and end-to-end receiver path |
| BGA escape and stackup | Layout + fabricator | Approved layers, dielectric, impedance and trace/via/assembly capabilities |
| FPGA unused/analog/transceiver/battery pins | FPGA | Manufacturer-grounded used/unused pin treatment and bank supplies |

The micro-HDMI connector choice does not specify HDMI signaling or direct KR260 compatibility. The FPGA device direction is XC7A200T; package/speed/temperature fields in the draft still require procurement qualification.

## Layout ownership record

Before starting layout, open a PCB task and record:

```text
Board:
Owner GitHub username:
Reviewer GitHub username:
Branch and starting commit:
Files / schematic sheets in scope:
Interface changes:
Handoff commit and remaining work:
Next owner:
```

Use one open ownership task per board and close or hand it off explicitly. A separate branch alone does not reserve the layout. Until an owner accepts the task, layout ownership remains unassigned.
