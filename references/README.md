# External references

## Previous repositories

| Reference | Why to read it | Revision / boundary |
|---|---|---|
| [Gerald's FPGA_512](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e) | Acquisition RTL, framing, FT600 transport and host software | Pinned ECP5 reference, not Artix-7 firmware |
| [512channels repository](https://github.com/HowardWHSrun/512channels) and [learning site](https://howardwhsrun.github.io/512channels/) | Existing walkthroughs, programming explanations, browser exercises and native simulations | Separate evolving educational project; simulation and lab operation are distinct |
| [CP SOM ONE](https://github.com/controlpaths/cp_som_one/tree/b272899d62ac2e454f85c413d64d62271137da27) | Earlier Artix-7 support-circuit and PCB reference | Pinned earlier 35T/75T reference, not the selected XC7A200T board |
| [CP SOM ONE design article](https://www.controlpaths.com/2023/10/28/designing-a-fpga-som/) | Author's explanation of the reference design | Review together with the actual schematic/BOM |

Exact commits and fetch locations are in [repositories.json](repositories.json). Use [the software guide](../docs/software.md) to retrieve and verify them. CP SOM ONE's saved BOM names XC7A75T while its schematic/PCB baseline names XC7A35T; reconcile this if reusing it. These are intentionally pinned sources, not claims about today's upstream HEAD.

## Development board and receiver

- [Nexys Video product](https://digilent.com/shop/nexys-video-amd-artix-7-fpga-trainer-board-for-multimedia-applications/), [official manual](https://digilent.com/reference/_media/reference/programmable-logic/nexys-video/nexys-video_rm.pdf), and [master constraints](https://github.com/Digilent/digilent-xdc/blob/master/Nexys-Video-Master.xdc).
- [Digilent GPIO demonstration](https://github.com/Digilent/Nexys-Video-GPIO) and [saved-version release v2018.2-1](https://github.com/Digilent/Nexys-Video-GPIO/releases/tag/v2018.2-1). It is an I/O demonstration, not a neural-acquisition design.
- [openFPGALoader documentation](https://trabucayre.github.io/openFPGALoader/). A programmer loads a built bitstream; it does not replace synthesis/place-and-route.
- [AMD KR260 interfaces](https://docs.amd.com/r/en-US/ug1092-kr260-starter-kit/Interfaces). The custom receiver must be specified against the actual receiving port and its electrical capabilities.
- [Vivado supported operating systems](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Supported-Operating-Systems). Select a supported build machine and exact tool/device version for the implementation work.

## Manufacturer documents

These official links are the shared access point. Saved local PDFs used in earlier audits date to September 16–18, 2026; revisions must be checked when selecting parts. Full vendor PDF collections are not duplicated here.

| Document | Use |
|---|---|
| [DS180: 7 Series overview](https://docs.amd.com/v/u/en-US/ds180_7Series_Overview) | Device resources and device/package choices |
| [DS181: Artix-7 electrical data](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet) | Supply, I/O and operating limits for the exact grade |
| [UG475: packaging and pinout](https://docs.amd.com/v/u/en-US/ug475_7Series_Pkg_Pinout) | Package dimensions and pin allocation |
| [UG470: configuration](https://docs.amd.com/v/u/en-US/ug470_7Series_Config) | Boot mode, configuration pins and flash support |
| [UG471: SelectIO](https://docs.amd.com/v/u/en-US/ug471_7Series_SelectIO) | I/O standards, banks and electrical constraints |
| [UG480: XADC](https://docs.amd.com/v/u/en-US/ug480_7Series_XADC) | Analog supply/reference and unused-pin handling |
| [UG482: GTP transceivers](https://docs.amd.com/v/u/en-US/ug482_7Series_GTP_Transceivers) | Dedicated transceivers, when actually used |
| [UG483: PCB design](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB) | Power distribution, decoupling and board design |
| [AMD Artix-7 package pinouts](https://www.amd.com/en/developer/resources/adaptive-socs-and-fpgas/package-pinout-files/artix-7-package-device-pinout-files.html) | Official device/package tables; compare with the exact selected device |
| [ADP5052](https://www.analog.com/en/products/adp5052.html) | Proposed FPGA power-controller reference |
| [LT3042](https://www.analog.com/en/products/lt3042.html) | Older ASIC routing/power reference regulator |

The selected-package TXT/CSV and proposed configuration inputs are included under [hardware/design-inputs/config](../hardware/design-inputs/config/README.md). They are a starting point for pin planning, not an approved board pinout.
