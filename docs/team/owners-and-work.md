# Owners and open work

Updated 2026-09-26 for **XC7A100T CSG324 / 117 ASIC signals / XEM8310**. Roles below are proposed; no personal ownership or review approval is implied. The earlier 200T/KR260 direction remains in dated historical records.

The [fourth-review uncertainty register](../../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) is the detailed current action list, with closure criteria and evidence. There are four separate [native review checkpoints](../../presentation/fpga/index.html); no integrated full-system board or fabrication release exists.

| Workstream | Current work | Owner / reviewer |
| --- | --- | --- |
| ASIC electrical/timing and physical mapping | Obtain authoritative pad limits, startup/control rules and eight-chip/group map (U01–U05) | ASIC/carrier/routing + FPGA, TBD |
| FPGA part, pins and clocks | Exact standard-voltage order code, legal ball/clock allocation, XDC/CDC/timing (U06–U07) | FPGA hardware/implementation, TBD |
| Connector and assembly | Mezzanine mating, J4 part/edge/cable, mechanical tolerances (U08–U09) | Mechanical/routing/FPGA, TBD |
| Power and protection | Actual load/thermal budget, protected source, sequencing and shared returns (U10–U11) | Power/carrier/FPGA, TBD |
| XEM8310 receiver and cable | Module contacts, VIO/interlocks, LVDS/JTAG margins (U12–U13) | Receiver carrier/FPGA, TBD |
| Firmware, buffering and host | Packet/USB packing, commands, DDR buffering and explicit overflow policy (U14–U15) | FPGA/receiver/host; system owner for required behavior, TBD |
| Layout and manufacturing | One integrated schematic/PCB, all copper, stackup, exact BOM and DFM (U16) | Layout + fabricator/assembler, TBD |
| Boot and acceptance | Revision-specific bring-up, recovery, known-channel capture and sustained disk recording (U17–U18) | Bring-up + lab integration, TBD |

The user has delegated power setup and wants optional headers/test points removed. Circuit design, pin selection and firmware are engineering tasks. External inputs are the actual ASIC/mating-board specification and system operating/recording requirements; ask for a purchased FPGA code only if one is already mandated. XEM8310 is an FPGA/USB receiver module, not a conventional MCU or an automatic target-JTAG programmer.

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
