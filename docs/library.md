# Project files and documents

The original files are stored in this repository. Use the editable formats for further work and the PDFs or searchable notes for a quick review.

## Team workflow and editable design

- [Team start page](team/README.md), [contribution guide](../CONTRIBUTING.md), [owners and open work](team/owners-and-work.md).
- [FPGA working draft](../hardware/fpga-board/README.md): complete editable KiCad project and local libraries; not for manufacture.
- [Initial FPGA import evidence](../sources/fpga-draft-2026-09-21/README.md): provenance, original hashes and dated check reports.

## ASIC/interface slides

- [Original 28-slide PowerPoint](../sources/slides/Chip_FPGA_Interface.pptx)
- [Existing PDF representation](../sources/slides/Chip_FPGA_Interface.pdf)
- [Searchable slide text](slides/asic-interface-text.md) and [selected slide previews](../sources/slides/previews/)

Use the original slide diagrams for timing relationships that text extraction cannot preserve. The PDF, extracted text and PNGs are representations of the same deck.

## Team meeting records

- September 17: [searchable notes](meetings/2026-09-17.md), [Word](../sources/meetings/2026-09-17-notes.docx), [PDF](../sources/meetings/2026-09-17-notes.pdf).
- [Team follow-up received September 18](meetings/2026-09-18-follow-up.md): workstream assignments, development sequence, voltage/clock clarification and unresolved behavior.
- [September 21 FPGA digest](../presentation/fpga/meeting-2026-09-21.md): presentation-focused meeting summary, not an approved specification.
- [September 22 FPGA direction](../presentation/fpga/direction-2026-09-22.md): Howard and Zitong's current work, CP SOM One reference, smaller-package evaluation and proposed prototyping approach.

These records summarize team discussions. The September 17 [questions for the next review](meetings/2026-09-17.md#questions-to-resolve-in-the-next-review) retain their dated context; they are not a current approved specification.

## Supplied hardware references

The earlier [overall 3D assembly](../hardware/assembly/README.md) includes the original [STL](../hardware/assembly/stacked_headboard_original.stl) and its labeled preview, showing the ASIC-carrier stack, routing section and FPGA-board arrangement. Model dimensions are provisional; source authorship is unverified.

The **[visual hardware overview](../hardware/overview.md)** brings together the system diagram, original assembly photograph, overall board renders and front/back layouts. [Downloadable PNG/SVG views](../hardware/previews/README.md) accompany the editable originals below.

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

The source files are included at a pinned upstream revision for repeatable reading and use. This is the earlier ECP5/FT600 project; it does not establish compatibility with the proposed Artix-7 path or complete 4K operation. The separately labeled FPGA working draft is now included for team development; it does not change the status of this historical firmware.

[Source provenance and checksums](../sources/README.md) describe what is original, what is a faithful representation and the one library-path adaptation.

## Assembly-first presentation

[Open the browser presentation](../index.html) · [Presentation guide](../presentation/compact/README.md) · [Model provenance](../presentation/compact/manifest.json).

The active root presentation uses the compact B v1 STL supplied by Howard on September 22, with unchanged geometry. Older original-based visualization studies remain separate and are not used by the root page. This is not a fabrication release.

## HTML presentation

[Open the presentation](https://howardwhsrun.github.io/FPGA_4K/) · [Editing guide](../presentation/compact/README.md) · [Supplied compact STL](../hardware/assembly/stacked_headboard_compact_B_v1.stl).

The presentation branch uses the compact B v1 assembly supplied on September 22. The original STL is preserved separately.

## FPGA board-level presentation

[Open the FPGA slide deck](../presentation/fpga/index.html) · [Navigation and editing guide](../presentation/fpga/README.md) · [Source manifest](../presentation/fpga/manifest.json).

Select FPGA in the system view, then open its KiCad design and dedicated slides. Eight short slides cover the current draft/reference, smaller FPGA, functions, I/O/link, power, boot/clock, prototype and next steps. The original exports and read-only native PCB/schematic viewer remain available. The CAD still uses the 200T draft; the 10 × 10 mm 50T/CPG236 is an evaluation candidate, not an implemented replacement. Board-completion figures retain their September 21 import date.

## September 23 meeting

[Meeting page and actions](../presentation/meetings/2026-09-23.html) · [Unchanged notes](../sources/meetings/2026-09-23-notes.txt) · [Original diagram](../sources/meetings/2026-09-23-system-view.png). Includes current priorities and discrepancies needing confirmation.

## Recurring PCB reviews

[Meeting hub](../presentation/meetings/index.html) · [Review template](../presentation/meetings/template.html) · [Editing guide](../presentation/meetings/README.md). Fixed review order and dated records keep each meeting easy to find.
