# Owners and open work

Updated 2026-09-27 for **XC7A100T-1CSG324I / 116 digital ASIC nets + one analog contact / XEM8310**. Roles are proposed; no personal acceptance or review approval is implied.

The [current board review](../../presentation/fpga/index.html) and [six work areas](../../presentation/fpga/index.html#uncertainties) are the active status. The fourth-review register and previous native checkpoints remain dated history. The smallest board has 125 parts, with 116/116 assigned ASIC nets connected and 0 assigned-net gaps in its native audit. GND corrections, exact part selections and the R12 removal are integrated.

| Workstream | Remaining result | Proposed owner / reviewer |
|---|---|---|
| ASIC and carrier | Current payload/generator, chip/contact map, guaranteed pad timing/levels, ASIC supplies and analog AC_IN source | ASIC + carrier/routing designers; Howard coordinates |
| FPGA firmware | Local-clock startup, bounded SPI commands, JTAG capture transport, Vivado pin/CDC/timing proof | Jiaao / FPGA implementation, subject to agreement |
| Power | Workload estimate, final copper/return review, PDN and thermal margin, controlled-rise protected cable source | FPGA power + source/carrier design |
| Mechanical and manufacturing | Mating connectors and orientation, precision J4 slots, assembled clearances, stackup/process acceptance | Mechanical/layout + fabricator/assembler |
| XEM8310 and host | Carrier contacts/voltages, electrical receiver network, target JTAG, data format and bounded host-stall behavior | Receiver carrier / FPGA / host software |
| Prototype acceptance | Rail/JTAG/boot checks, known-pattern capture, eight-ASIC mapping, sustained acquisition and recovery | Lab integration after design release and assembly |

Finite raw capture has simulation/synthesis evidence; startup, JTAG transport and a complete bitstream are unfinished. The XEM8310 is an FPGA/USB module, not a conventional MCU or an automatic 12 V output/target programmer. The detailed [power ownership page](../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/bringup/Power_Status_And_Owners.md) separates engineering work from the few external specifications needed. No order or supplier submission has been made.

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
