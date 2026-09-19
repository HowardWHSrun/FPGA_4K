# FPGA_4K — shared team sources

This repository collects material received from **Gerald and the project team** for the 4K recording project. It contains original slides and hardware reference files, meeting records, and the previous FPGA source link.

## Start here

| Material | Open |
|---|---|
| Gerald's ASIC/interface slides | [Original PowerPoint](sources/slides/Chip_FPGA_Interface.pptx), [PDF](sources/slides/Chip_FPGA_Interface.pdf), [searchable slide text](docs/slides/asic-interface-text.md) |
| September 17 team meeting | [Notes and open questions](docs/meetings/2026-09-17.md), [Word](sources/meetings/2026-09-17-notes.docx), [PDF](sources/meetings/2026-09-17-notes.pdf) |
| Subsequent team context | [Reported roles, progress and Gerald's clarification](docs/meetings/2026-09-18-follow-up.md) |
| Supplied carrier and LDO/routing designs | [Original KiCad files and pin spreadsheet](hardware/README.md) |
| Previous FPGA repository | [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512), [source access and program guide](docs/software.md) |
| Full source index | [Document library](docs/library.md), [provenance](sources/README.md) |

The team meeting describes **recording chips → routing board → FPGA board → KR260 → PC**, with the FPGA-to-receiver interface still to be defined in that record. Read dated statements as dated statements; the collection does not establish a finalized current circuit or prove a working 4K system. The [meeting's open questions](docs/meetings/2026-09-17.md#questions-to-resolve-in-the-next-review) are retained with their original context.

## For AI agents

Read [AGENTS.md](AGENTS.md), then the original sources relevant to the task. Minimal tools retrieve the unchanged reference code and check the source collection:

```sh
git clone https://github.com/HowardWHSrun/FPGA_4K.git
cd FPGA_4K
python3 scripts/check_docs.py
python3 scripts/fetch_reference.py fpga512
```

Python 3.9+ and Git are needed. Fetching the reference needs network access; checking documents is offline. [Program instructions](docs/software.md) point to the upstream programs and original simulation targets. FPGA_512 is an ECP5/FT600 reference, not an Artix-7 bitstream.

Howard's independent study guides, design proposals, placement experiments and learning projects are outside this collection. Meeting summaries and searchable slide representations are labeled as derivatives of team sources; navigation and checking tools are repository support, not project design evidence.
