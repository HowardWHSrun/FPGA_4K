# Project files and documents

The original files are stored in this repository. Use the editable formats for further work and the PDFs or searchable notes for a quick review.

## ASIC/interface slides

- [Original 28-slide PowerPoint](../sources/slides/Chip_FPGA_Interface.pptx)
- [Existing PDF representation](../sources/slides/Chip_FPGA_Interface.pdf)
- [Searchable slide text](slides/asic-interface-text.md) and [selected slide previews](../sources/slides/previews/)

Use the original slide diagrams for timing relationships that text extraction cannot preserve. The PDF, extracted text and PNGs are representations of the same deck.

## Team meeting records

- September 17: [searchable notes](meetings/2026-09-17.md), [Word](../sources/meetings/2026-09-17-notes.docx), [PDF](../sources/meetings/2026-09-17-notes.pdf).
- [Team follow-up received September 18](meetings/2026-09-18-follow-up.md): workstream assignments, development sequence, voltage/clock clarification and unresolved behavior.

These records summarize team discussions. The September 17 [questions for the next review](meetings/2026-09-17.md#questions-to-resolve-in-the-next-review) retain their dated context; they are not a current approved specification.

## Supplied hardware references

| Reference | Original files | Opening notes |
|---|---|---|
| ASIC carrier PCB-5 | [KiCad project](../hardware/references/asic-carrier/PCB.kicad_pro), [schematic](../hardware/references/asic-carrier/PCB.kicad_sch), [PCB](../hardware/references/asic-carrier/PCB.kicad_pcb), [pin spreadsheet](../hardware/references/asic-carrier/Pins.xlsx) | [Carrier notes](../hardware/README.md#asic-carrier-pcb-5) |
| Older LDO/routing design | [KiCad project](../hardware/references/ldo-routing/PCB.kicad_pro), [schematic](../hardware/references/ldo-routing/PCB.kicad_sch), [PCB](../hardware/references/ldo-routing/PCB.kicad_pcb), [footprint library](../hardware/references/ldo-routing/LDO_Board.pretty/) | [LDO/routing notes](../hardware/README.md#ldorouting-reference) |

These are supplied examples. Their presence does not establish final mating compatibility, an approved new-board BOM or fabrication readiness.

## Previous acquisition code

- [Included FPGA_512 source and revision](../firmware/README.md)
- [Original project README](../firmware/FPGA_512/README.md)
- [FPGA top-level Verilog](../firmware/FPGA_512/fpga/top.v) and [FT600 host test in C](../firmware/FPGA_512/ft600_test/test_d3xx.c)
- [Original-program and run guide](software.md)
- [Upstream repository register](../references/README.md)

The source files are included at a pinned upstream revision for repeatable reading and use. This is the earlier ECP5/FT600 project; it does not establish compatibility with the proposed Artix-7 path or complete 4K operation. Personal studies and independently developed board proposals are excluded.

[Source provenance and checksums](../sources/README.md) describe what is original, what is a faithful representation and the one library-path adaptation.
