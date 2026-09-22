# Owners and open work

Updated 2026-09-22 for the personal-branch workflow. Personal draft ownership does not assign responsibility for the final team design.

## Personal branch directory

| Person | Branch | Project | KiCad version |
|---|---|---|---|
| Howard Wang | [Howard-Wang](https://github.com/HowardWHSrun/FPGA_4K/tree/Howard-Wang) | [FPGA PCB draft](https://github.com/HowardWHSrun/FPGA_4K/tree/Howard-Wang/hardware/fpga-board) | 10.0.6 |

Please create your own `First-Last` branch and add a row here through a focused documentation pull request. Other teammates' names and branch choices have not yet been supplied; no personal branch has been created on their behalf.

## Team workstreams

Final engineering owners and reviewers remain to be confirmed.

| Workstream | Working source | Owner / reviewer | Next step |
|---|---|---|---|
| FPGA schematic and layout | [Howard’s personal draft](https://github.com/HowardWHSrun/FPGA_4K/blob/Howard-Wang/hardware/fpga-board/README.md) | Team owner TBD / reviewer TBD | Evaluate candidates; Howard’s branch is his independent draft |
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

The micro-HDMI connector choice does not specify HDMI signaling or direct KR260 compatibility. Howard’s saved draft uses XC7A200T; this does not establish a final team device choice. Package/speed/temperature fields still require procurement qualification.

## Layout ownership record

When multiple people collaborate on the same branch and board, open a PCB task and record:

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

Use one active layout editor per shared branch/board and hand it off explicitly. Independent personal branches can contain different layouts; their changes still require engineering review before integration.
