# FPGA_4K

<!-- CURRENT_FPGA_LEARNING_REPORT -->
**Preserved micro-HDMI learning report:** [PDF · 45 pages](hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.pdf) · [editable LaTeX](hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.tex). Explains the earlier 125-component / 752-endpoint checkpoint. It does not cover the USB-C additions.
<!-- /CURRENT_FPGA_LEARNING_REPORT -->


**Earlier learning report:** [Visual explanations and professor briefing · 33-page PDF](hardware/fpga-interface-study/dated/2026-09-26/learning-report/FPGA100T_Learning_And_Professor_Review.pdf). Explains the earlier snapshot; use the current native audit and pin map for the updated design.

**Earlier micro-HDMI component and pin review:** [Earlier presentation](presentation/fpga/micro-hdmi.html#architecture) · [labeled pin map](presentation/fpga/pins/) · [presenter notes](presentation/fpga/data/Presenter_Notes.md). 116 candidate digital ASIC nets have native assignments plus one external analog reservation; 83 pins are intentionally unused and 19 endpoints reserve future interfaces. Six former NC pins are assigned GND. The pin map separates assignments from current copper status.

Shared PCB development for the 4K neural-recording system: working designs, interface decisions, reference boards and acquisition software.

**Featured FPGA PCB — unrouted 50T micro-HDMI review:** [Board and purchasing list](presentation/fpga/index.html) · [native zoomable PCB](presentation/fpga/viewer/?board=fpga50t) · [48-line purchasing draft](sources/engineering/2026-09-28/Micro_HDMI_50T_Grouped_Purchasing_Draft.csv) · [complete KiCad project](hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/FPGA50T_Two_60_Compact_Review_2026-09-28.zip). The list covers 158 fitted components per board; unresolved order codes and external system items remain open. **Not for manufacture or purchase.**

**Separate 100T revisions:** [Preserved routed micro-HDMI checkpoint](presentation/fpga/micro-hdmi.html) with its [125-part list](sources/engineering/2026-09-28/Micro_HDMI_100T_Grouped_Purchasing_Draft.csv); [USB-C development revision](presentation/fpga/usb-c.html) with its [native audit](hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_Native_Audit.json). Neither replaces the featured 50T review. The [50T 19-contact proposal](presentation/fpga/micro-hdmi-19.html) is still unimplemented in its native PCB.

## Start working with the team

**[Team start page](docs/team/README.md)** · **[Setup and daily workflow](CONTRIBUTING.md)** · **[Owners and open work](docs/team/owners-and-work.md)**

| Work | Start here | Status |
|---|---|---|
| Featured FPGA review | [Open the unrouted 50T micro-HDMI board](presentation/fpga/index.html) | 158 fitted component candidates; 625 native ratsnest links; power, cable and receiver pending |
| Preserved routed 100T | [Open the earlier micro-HDMI checkpoint](presentation/fpga/micro-hdmi.html) | 125 placed parts; separate routing and population evidence |
| Separate USB-C revision | [Open the development board](presentation/fpga/usb-c.html) | 116 provisional FPGA signals + one analog reservation; unfinished routing; **not for manufacture** |
| Earlier FPGA team draft | [September 21 import](hardware/fpga-board/README.md) | Preserved earlier electrical draft; superseded device/interface choices; **not for manufacture** |
| Carrier and routing boards | [Original reference projects](hardware/README.md) | Preserved references; active baselines and owners to confirm |
| Tasks and layout ownership | [Create a PCB task](https://github.com/HowardWHSrun/FPGA_4K/issues/new?template=pcb-task.yml) | One active layout editor per board |
| Pinout / power / protocol decisions | [Create a decision](https://github.com/HowardWHSrun/FPGA_4K/issues/new?template=interface-decision.yml) | Review with owners on both sides |
| Proposed changes | [Pull requests](https://github.com/HowardWHSrun/FPGA_4K/pulls) | Branch → review → merge → pull |

Use KiCad **10.0.6** for the FPGA handoff. Clone the repository, open the project from your clone, and keep its custom libraries alongside it. Follow [CONTRIBUTING.md](CONTRIBUTING.md) before editing; uploading a draft does not approve its circuit or make `main` fabrication-ready.

## Board overview

### Overall assembly

[![Overall stacked-headboard assembly concept](hardware/assembly/stacked_headboard_labeled.png)](hardware/assembly/README.md)

The earlier assembly concept shows the four-board ASIC-carrier stack, routing section and FPGA board. **[Open the 3D model and region guide](hardware/assembly/README.md)** · [Download STL](hardware/assembly/stacked_headboard_original.stl?raw=true). The original model is preserved; dimensions are provisional and its author is unverified.

### Supplied board references

| ASIC carrier reference | LDO/routing reference |
|---|---|
| [![Overall view of the supplied two-chip carrier](hardware/previews/asic-carrier-3d.png)](hardware/overview.md#asic-carrier-pcb-5) | [![Overall view of the supplied LDO and routing board](hardware/previews/ldo-routing-3d.png)](hardware/overview.md#ldorouting-reference) |
| Approximately 22 × 17 mm; two chip footprints | Approximately 18.3 × 42 mm; regulator area and signal routing |

These are renders of the supplied reference boards; unavailable custom 3D models are omitted. Open the **[visual hardware overview](hardware/overview.md)** for the system diagram, original assembly photograph, front/back layouts and editable files. The two references do not represent a completed 4K assembly or a verified mating pair.

## Files

The files below are **included in this repository**. Click a filename to open it, or a download link to save it.

| Material | Files |
|---|---|
| Overall board and system views | [Visual overview](hardware/overview.md) · [Board images and vector layouts](hardware/previews/) · [Original assembly photograph in slide 2](sources/slides/previews/slide-02.png) |
| ASIC/interface slides — 28 slides | [PowerPoint](sources/slides/Chip_FPGA_Interface.pptx) · [Download PPTX](sources/slides/Chip_FPGA_Interface.pptx?raw=true) · [PDF](sources/slides/Chip_FPGA_Interface.pdf) · [Searchable text](docs/slides/asic-interface-text.md) |
| September 17 meeting | [PDF notes](sources/meetings/2026-09-17-notes.pdf) · [Download Word notes](sources/meetings/2026-09-17-notes.docx?raw=true) · [Read online](docs/meetings/2026-09-17.md) |
| ASIC carrier PCB | [KiCad project](hardware/references/asic-carrier/PCB.kicad_pro) · [Schematic](hardware/references/asic-carrier/PCB.kicad_sch) · [Board](hardware/references/asic-carrier/PCB.kicad_pcb) · [Pin spreadsheet](hardware/references/asic-carrier/Pins.xlsx?raw=true) |
| LDO/routing reference | [KiCad project](hardware/references/ldo-routing/PCB.kicad_pro) · [Schematic](hardware/references/ldo-routing/PCB.kicad_sch) · [Board](hardware/references/ldo-routing/PCB.kicad_pcb) |
| FPGA acquisition software | [Included source files](firmware/FPGA_512/) · [Source overview](firmware/README.md) · [Program guide](docs/software.md) |
| Project context and open questions | [Meeting questions](docs/meetings/2026-09-17.md#questions-to-resolve-in-the-next-review) · [Workstreams and interface notes](docs/meetings/2026-09-18-follow-up.md) |

For the full folder, use GitHub's **Code → Download ZIP** or clone the repository. [The document library](docs/library.md) provides a longer index.

## Project context

The featured review direction is **recording chips → routing board → XC7A50T micro-HDMI board → compatible receiver → PC**. The 50T board is unrouted; its powered cable, GTP link, receiver implementation and complete electrical pin assignments remain unfinished. The 100T/XEM8310 and earlier KR260 directions remain in dated records and separate board revisions.

The included FPGA_512 code is an earlier **ECP5/FT600** implementation. It provides acquisition RTL, host software and testbenches; it is not a completed 4K Artix-7 implementation.

## Working with the files

```sh
git clone https://github.com/HowardWHSrun/FPGA_4K.git
cd FPGA_4K
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
```

The source files come with the clone—no separate source download is needed. The check requires Python 3.9+ and Git, and verifies local links and file hashes. See the [software guide](docs/software.md) for program entry points and the [hardware guide](hardware/README.md) for KiCad files.

AI agents should start with [AGENTS.md](AGENTS.md). Source credits, versions and copy details are recorded in [provenance](sources/README.md).

## Meeting reviews

**[Open the meeting hub](presentation/meetings/index.html)** for the latest review, action items and earlier records.

### Meeting preparation — 24 September 2026 (historical)

[Preparation and review questions](presentation/meetings/2026-09-24.html) · [Original proposal PDF](sources/meetings/2026-09-24-FPGA_4K_Meeting_Choices.pdf). Proposed choices; no outcomes recorded.

### Latest meeting record — 28 September 2026

[Read the FPGA board review and actions](presentation/meetings/2026-09-28.html). The recording discusses a 50T candidate, block-by-block schematic review and an MCU link plan. Its proposed part choice and pin allocation do not supersede the active design status above; the private recording is not in this repository.

### Earlier meeting record — 23 September 2026

[Read the dated meeting and actions](presentation/meetings/2026-09-23.html) · [Original notes](sources/meetings/2026-09-23-notes.txt) · [System diagram](sources/meetings/2026-09-23-system-view.png). These are the questions recorded at that meeting; the current 100T/XEM8310 uncertainty list above supersedes them as the active status.
