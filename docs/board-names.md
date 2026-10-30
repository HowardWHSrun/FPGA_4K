# PCB board names

Use these names for the project's four board families, confirmed 30 October 2026.

| Name | Role | Open the board |
|---|---|---|
| **Direct LDO Carrier** | Alternative carrier board connecting the XEM8305 to the existing LDO board. | [Carrier V3](../index.html?approach=direct#receiver) |
| **Frontend FPGA Board** | FPGA PCB containing the Artix-7 35T FPGA. | [Saved V41 view](../index.html?approach=custom#fpga) · [35T review files](../presentation/fpga/current-35t.html) |
| **FPGA-LDO PCB** | LDO power-supply board supporting the Artix-7 Frontend FPGA Board. | [Separate power-board view](../index.html?approach=custom#routing) |
| **HDMI Extension Board** | XEM8310 breakout board connecting to eight FPGA boards through HDMI cables. | [Eight-port board view](../xem8310/) |

Revision numbers and dated snapshots still identify the actual design being viewed. The separate power-board checkpoints V5/V13 belong to the FPGA-LDO PCB family; the older combined FPGA/shared-LDO V7 is a distinct study. The older XEM8305 host interposer is a separate historical design from the XEM8310 HDMI Extension Board.

Native project filenames, component references and source identifiers remain the matching CAD identities. This naming update does not change circuitry, routing, manufacturing status or qualification.
