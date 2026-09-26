# FPGA_4K

Shared PCB development for the 4K neural-recording system: working designs, interface decisions, reference boards and acquisition software.

**Current FPGA review — September 26:** [100T / 117-signal / XEM8310 engineering review](presentation/fpga/index.html) · [current core KiCad review ZIP](hardware/fpga-100t-review/FPGA100T_Review_Project.zip) · [fourth review and uncertainties](hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) · [interface studies](hardware/fpga-interface-study/README.md). The core routing, bank-rail revision and mezzanine placements remain separate development work. The new [37.5 × 36 mm placement](presentation/fpga/index.html#size-study) retains both ASIC connectors and reduces study area 6.25%. **No complete or manufacturing-ready board is released.**

## Start working with the team

**[Team start page](docs/team/README.md)** · **[Setup and daily workflow](CONTRIBUTING.md)** · **[Owners and open work](docs/team/owners-and-work.md)**

| Work | Start here | Status |
|---|---|---|
| Current FPGA review | [Open the 100T review](presentation/fpga/index.html) | 117 ASIC signals and XEM8310 required; partial core routing; **not for manufacture** |
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

The current direction is **recording chips → routing board → XC7A100T board → XEM8310 receiver → PC**. Complete electrical pin assignments, the powered cable and receiver implementation remain unfinished. Earlier meeting records retain their original **KR260** direction as dated history; they do not override the current review.

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

### Latest meeting record — 23 September 2026

[Read the dated meeting and actions](presentation/meetings/2026-09-23.html) · [Original notes](sources/meetings/2026-09-23-notes.txt) · [System diagram](sources/meetings/2026-09-23-system-view.png). These are the questions recorded at that meeting; the current 100T/XEM8310 uncertainty list above supersedes them as the active status.
