# Owners and open work

Updated 2026-09-29 for the proposed **three XC7A25T boards → three custom µHDMI cables → XEM8310–BRK8310 interposer → XEM8310 receiver** plan. Roles are proposed; no personal acceptance or review approval is implied.

The website features the [selected 25T board section](../../presentation/fpga/current-25t.html) and [R7 three-port connection map with an R8 PCB study](../../presentation/adapter/). The 25T native PCB is unrouted and its DF40 interface is under redesign; R8 has incomplete routing and unresolved DRC. The [28 September 50T parts draft](../../presentation/fpga/index.html), one-port R3, direct-XEM R2, 100T [USB-C development revision](../../presentation/fpga/usb-c.html), and [routed micro-HDMI checkpoint](../../presentation/fpga/micro-hdmi.html) remain historical paths.

| Workstream | Remaining result | Proposed owner / reviewer |
|---|---|---|
| ASIC and carrier | Authoritative chip/contact map and timing; resolve 12 FPGA data outputs versus 16 carrier data-input contacts; ASIC supplies and analog AC_IN source | Gerald / ASIC team with Zitong and Howard, subject to agreement |
| Custom FPGA firmware | Two planned active recording TX streams plus one assigned spare per board, one reverse command RX stream, local ASIC CLK/DATA/LATCH generation, startup/JTAG and Vivado pin/CDC/timing proof for all three boards | FPGA implementation assignment pending |
| Power | Three protected 12 V cable sources and contact/return budgets; XEM/BRK input, FPGA conversion, ASIC rail/feed design, startup/fault and thermal margin | FPGA power + receiver carrier + ASIC routing team |
| Mechanical and manufacturing | XEM-facing and BRK-facing MC1/MC2/MC3 footprints, mirrored connector numbering, three cable fits and retention, increased stack height, assembled clearances, high-speed integrity and R8 DRC closure | Adapter/layout designer + fabricator/assembler |
| XEM8310 and host | MC3 banks 226/225/224 GTY lane clock/IP/polarity, point-to-point diversion away from BRK GTY contacts, framed command paths, aggregate FrontPanel USB capture, XEM USB-to-custom-FPGA JTAG bridge or separate probe | Interposer / FPGA / host software assignment pending |
| After-fab acceptance | Rail/JTAG/boot checks, known-pattern link capture, eight-ASIC mapping, sustained acquisition and recovery | Lab integration after design review, fabrication and assembly |

Finite raw capture has simulation/synthesis evidence in a separate earlier 100T study; startup, the 25T/XEM transceiver build, JTAG transport and a complete three-link bitstream are unfinished. The XEM8310 is an FPGA/USB module serving the downstream controller role, not a conventional MCU. R7 is a logical schematic; R8 is a partially routed physical study. Neither implements a qualified three-branch 12 V path. The three-link mode and BRK J6 PCIe cannot operate simultaneously on the assigned GTY lanes. No order or supplier submission has been made.

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
