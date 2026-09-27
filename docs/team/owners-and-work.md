# Owners and open work

Updated 2026-09-27 for **XC7A100T-1CSG324I / 116 digital ASIC nets + one analog contact / XEM8310**. Roles are proposed; no personal acceptance or review approval is implied.

The [current USB-C review](../../presentation/fpga/index.html) and [remaining work](../../presentation/fpga/index.html#release) are the active status. The new revision preserves the ASIC assignment and adds negotiated/protected power, USB2 control/JTAG and a reversible four-pair custom link. Its own native audit reports actual copper and findings. The earlier micro-HDMI zero-gap result and all older checkpoints remain historical.

| Workstream | Remaining result | Proposed owner / reviewer |
|---|---|---|
| ASIC and carrier | Current payload/generator, chip/contact map, guaranteed pad timing/levels, ASIC supplies and analog AC_IN source | ASIC + carrier/routing designers; Howard coordinates |
| FPGA firmware | Local-clock startup, bounded SPI commands, JTAG capture transport, Vivado pin/CDC/timing proof | Jiaao / FPGA implementation, subject to agreement |
| Power | PD source/sink contract, workload estimate, final copper/return review, PDN, startup/fault and thermal margin | FPGA power + source/carrier design |
| Mechanical and manufacturing | Mating connectors and orientation, precision J4 slots, assembled clearances, stackup/process acceptance | Mechanical/layout + fabricator/assembler |
| XEM8310 and host | Matching USB-C source/USB2-host adapter, lane orientation/training, receiver contacts/voltages, data format and bounded host-stall behavior | Receiver carrier / FPGA / host software |
| Prototype acceptance | Rail/JTAG/boot checks, known-pattern capture, eight-ASIC mapping, sustained acquisition and recovery | Lab integration after design release and assembly |

Finite raw capture has simulation/synthesis evidence; startup, JTAG transport and a complete bitstream are unfinished. The XEM8310 is an FPGA/USB module, not a conventional MCU or an automatic PD source/USB host. The [USB-C circuit explanation](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/USB_C_Design_Explanation.md) separates the headboard revision from required receiver and firmware work. No order or supplier submission has been made.

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
