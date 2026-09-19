# FPGA_4K

Shared project documentation for a **4,096-channel neural recording system**: ASIC carriers, routing and power, a custom FPGA board, and data delivery through KR260 to a PC.

**Start here:** [Current status](docs/current-status.md) · [Open questions and owners](docs/open-questions.md) · [System architecture](docs/architecture.md)

## Where we are

As of **September 19, 2026**, the documented direction is **eight ASICs on four carriers → routing/power board → XC7A200T FPGA board → micro-HDMI cable → receiver interface for KR260 → PC**. Micro-HDMI is the chosen connector direction; its signaling, pinout and receiving circuit remain open. The reference voltage is nominally 1.5 V and the intended ASIC clock is 32 MHz. The FPGA reference oscillator frequency is still TBD.

The latest FPGA board artifact is an editable **60 × 70 mm placement study**, with no schematic, assigned nets or routing. Its saved native DRC has 69 unresolved pad-clearance errors. Full-rate eight-ASIC acquisition and the complete KR260 link have not been demonstrated by the materials in this repository. See [current status](docs/current-status.md) for evidence and boundaries.

## Find what you need

| I want to… | Open |
|---|---|
| Understand the plan and who handles each part | [Current status](docs/current-status.md), [architecture](docs/architecture.md) |
| Prepare for the next discussion | [Numbered open questions](docs/open-questions.md), [decision history](docs/decisions.md) |
| Read the meeting | [September 17 notes](docs/meetings/2026-09-17.md), [PDF](sources/meetings/2026-09-17-notes.pdf), [Word](sources/meetings/2026-09-17-notes.docx), [subsequent clarifications](docs/meetings/2026-09-18-follow-up.md) |
| Review Gerald's ASIC slides | [PowerPoint](sources/slides/Chip_FPGA_Interface.pptx), [PDF](sources/slides/Chip_FPGA_Interface.pdf), [searchable slide text](docs/slides/asic-interface-text.md) |
| Understand or run the previous programs | [Software guide](docs/software.md), [previous repositories](references/README.md) |
| Inspect board files and component proposals | [Hardware guide](hardware/README.md) |
| Find an original document or an older guide | [Document library](docs/library.md), [source manifest](sources/manifest.json) |

## For AI agents and new contributors

Read [AGENTS.md](AGENTS.md), then [current status](docs/current-status.md) and [open questions](docs/open-questions.md). The originals, dated engineering notes and historical proposals have different authority; a file's presence does not make it an accepted requirement.

Clone this repository and check the documentation with **Python 3.9 or newer**:

```sh
git clone https://github.com/HowardWHSrun/FPGA_4K.git
cd FPGA_4K
python3 scripts/check_docs.py
```

This offline check verifies local links and source-file hashes. For pinned reference code and simulations without connected hardware, follow [the software guide](docs/software.md). This repository does not yet contain a complete 4K Artix-7 firmware implementation.

The earlier projects remain available: [Gerald's FPGA_512 source](https://github.com/gt-ic/FPGA_512), [512channels learning repository](https://github.com/HowardWHSrun/512channels), and [interactive learning site](https://howardwhsrun.github.io/512channels/). FPGA_512 targets ECP5/FT600; its bitstreams cannot be loaded onto Artix-7.

## Keeping this useful

Use [CONTRIBUTING.md](CONTRIBUTING.md) when adding meeting notes, closing a question or changing an interface. Record the evidence and update the current summary alongside the change. Keep historical records dated. New measured results should identify the hardware, code revision, test conditions and what passed.

Original lab material and third-party files retain their authorship; see [source and reuse notes](sources/README.md). This repository is a shared working record, not a fabrication release.
