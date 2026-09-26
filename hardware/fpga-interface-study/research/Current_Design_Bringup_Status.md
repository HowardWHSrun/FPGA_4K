# Current compact-design bring-up status

Neither compact board has a validated bring-up image or a released power-on procedure. Do not apply the older root `bringup/` instructions to these boards.

| Design | Intended power entry | Configuration / oscillator / target JTAG | Existing firmware material |
| --- | --- | --- | --- |
| `minimal_core` | Custom J4 contact 19, proposed 12 V | 3.3 V; no fitted LED, J2, J3 or test points | No matching validated build |
| `full_system` rail revision | Custom J4 contact 19, proposed 12 V | 1.8 V; no fitted LED, J2, J3 or test points | `bringup/core.xdc` is a constraint fragment, not a complete design/build |
| Mezzanine placement study | Inherited custom port placement | Study is not an integrated schematic | No firmware target |

All require completed copper and power qualification before power-on. The rail revision additionally changes the bank-16 supply to approximately 2.5 V for a proposed LVDS transmitter; it must not be confused with the more-routed core.

The next valid bring-up package must name an exact reviewed board hash and ordering grade; provide matching HDL/XDC and a reproducible Vivado build; define fixture access through existing pads and J4; identify the appropriate flash algorithm; and record current-limited rail, reset, JTAG and boot acceptance measurements. It must not assume a status LED or direct use of the XEM8310 module's own JTAG port. No such hardware acceptance has occurred.

Review-only artifacts and the latest blockers are presented in the [public FPGA review](https://howardwhsrun.github.io/FPGA_4K/presentation/fpga/). This status record does not authorize a power-on or manufacturing release.
