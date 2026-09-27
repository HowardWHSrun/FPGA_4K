# USB-C revision — engineering development

27 September 2026. **33 × 36 mm PCB, 178 fitted parts, 1 copper-only fixture, 12 copper layers.** Not released for manufacture.

Open [the native KiCad project](hardware/FPGA100T_33x36_Routing.kicad_pro) after extracting the complete folder. Keep its libraries and sheets together. The basename is retained to preserve project dependencies.

The current PCB has **268 assigned-net unconnected items**, **0 DRC errors / 394 DRC warnings** and **0 schematic/PCB parity findings**. All 116 FPGA ball assignments are retained; ASIC3_READ uses proposed carrier contact J6.59 instead of J5.32; 91/116 FPGA-to-connector paths are connected, while 88/116 nets have no open items anywhere (three connected nets retain isolated old copper). AC_IN remains an external 0–1.5 V analog contact. The reserved contacts J5.32, J5.34 and J6.37 are explicitly marked not connected in this revision. ERC has zero errors and one single-ended-label warning on the external AC_IN reservation.

[Front/back PCB](output/FPGA100T_33x36_Routing.svg) · [Schematic PDF](reports/USB_C_Schematics.pdf) · [Component list](reports/USB_C_Component_List.csv) · [All pin connections](reports/USB_C_All_Pin_Connections.csv) · [Native audit](reports/USB_C_Native_Audit.json) · [Circuit explanation](USB_C_Design_Explanation.md) · [Power routing status](reports/USB_C_Current_Power_Review.md) · [Power circuit review](power/Power_Design_Review.md) · [Cable and receiver contract](interface/USB_C_Link_Contract.md).

This revision adds a real USB-PD sink and USB2 control/programming device. Four cable pairs are proposed for three custom recording lanes plus a forwarded clock. That mode needs firmware and a matching source/host/receiver adapter; the XEM8310's existing USB port remains its PC link. No working controller firmware or qualified receiver adapter is delivered here.

Before release: complete copper and return-path review, ASIC timing/electrical contracts, startup/shutdown and fault tests, power/thermal/cable qualification, differential timing and impedance validation, manufacturing and mating-assembly acceptance. The twelve-layer stack and dense placement remain proposals. The earlier micro-HDMI checkpoint and its report are preserved separately and do not certify this revision.

PCB SHA-256: `c2bb9d1de754b65ebb3076b0b2c97529bc77afb4e5efad52e5762c3a9af2ac76`. Source/private discussions are excluded. No order has been placed.
