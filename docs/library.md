# Project files and documents

The original files are stored in this repository. Use the editable formats for further work and the PDFs or searchable notes for a quick review.

## Team workflow and editable design

<!-- CURRENT_FPGA_ROUTING -->
- [Current 33 × 36 mm routing board](../presentation/fpga/index.html): [complete 130-component native KiCad project](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/FPGA100T_33x36_Routing.zip) and [measured routing review](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/reports/Routing_Review.md). Corrected rails and both mezzanines are integrated; full routing, application interfaces and qualification remain unfinished. Earlier checkpoints are preserved in the collapsed history section.
<!-- /CURRENT_FPGA_ROUTING -->

- [Team start page](team/README.md), [contribution guide](../CONTRIBUTING.md), [owners and open work](team/owners-and-work.md).
- [Earlier native checkpoints](../presentation/fpga/index.html#design-history) and [fourth-review uncertainty list](../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) remain dated reference evidence.
- [September 21 FPGA import](../hardware/fpga-board/README.md): preserved earlier design and local libraries; not the current device/interface baseline.
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

[Current 33 × 36 mm engineering review](../presentation/fpga/index.html) · [Interactive native board](../presentation/fpga/viewer/index.html?board=compact-routed) · [Complete current KiCad ZIP](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/FPGA100T_33x36_Routing.zip) · [21-sheet schematic PDF](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/output/FPGA100T_33x36_Routing_Schematic.pdf) · [Routing audit](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/reports/Routing_Review.md) · [Refresh guide](../presentation/fpga/README.md).

[Current component and pin PDF](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) · [Editable LaTeX source](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/report/FPGA100T_33x36_Routing_Report_Source.zip). All 130 components and 762 numbered endpoints are documented.

This is the only active size: the 130-part board integrates the rail corrections and both mezzanines. Boot/clock/JTAG and sequencing routing have progressed; supply distribution, ground continuity, the 117 ASIC assignments, the XEM8310 data interface and qualification remain unfinished. The current audit and pin/component tables describe this snapshot. It is not a manufacturing release.

[Gerald's complete slide review](../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md) documents tutorial framing and conflicting timing/channel labels. The [fourth-review uncertainty register](../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) remains dated evidence; current integration observations are stated on the current page.

[Earlier design checkpoints](../presentation/fpga/index.html#design-history) preserve the 40 × 36 mm core, separate rail revision, mezzanine fit, and smaller placements. Their original native files, PDFs and hashes remain historical references. [Third-pass native checks](../hardware/fpga-interface-study/Triple_Check_Review.md) apply only to their recorded hashes. [The eight-slide 200T / 50T review](../presentation/fpga/history-2026-09-24.html) also remains history; earlier KR260 and 132-signal proposals do not supersede the 100T / 117 / XEM8310 direction.

## September 23 meeting

[Meeting page and actions](../presentation/meetings/2026-09-23.html) · [Unchanged notes](../sources/meetings/2026-09-23-notes.txt) · [Original diagram](../sources/meetings/2026-09-23-system-view.png). Includes current priorities and discrepancies needing confirmation.

## Recurring PCB reviews

[Meeting hub](../presentation/meetings/index.html) · [Review template](../presentation/meetings/template.html) · [Editing guide](../presentation/meetings/README.md). Fixed review order and dated records keep each meeting easy to find.

## September 24 meeting preparation

[Review page](../presentation/meetings/2026-09-24.html) · [Original choices PDF](../sources/meetings/2026-09-24-FPGA_4K_Meeting_Choices.pdf). Proposal dated September 23, supplied for the September 24 meeting; no outcomes recorded.

## Circled-space size follow-up

[37.5 × 36 mm placement review](../hardware/fpga-interface-study/size_optimization/Size_Optimization_Review.md) retains all 128 existing mezzanine-study parts and both connectors, reducing area 6.25%. [Inspect its native PCB](../presentation/fpga/viewer/index.html?board=compact) or download the [portable smaller study](../hardware/fpga-interface-study/size_optimization/candidate/FPGA100T_Compact_Study.zip). The core and earlier studies are preserved. Full rail/protection integration, application assignment, routing, assembly and thermal checks remain required; this is not the final complete-board size.

## 26 September: historical smaller placement and pin report

[Earlier 33 × 36 mm placement](../presentation/fpga/index.html#placement-history) · [Native viewer](../presentation/fpga/viewer/index.html?board=compact-v2) · [Complete KiCad ZIP](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/layout_v2/FPGA100T_33x36_Placement.zip) · [Component and pin report PDF](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/output/pdf/FPGA100T_Size_Components_Pinout.pdf) · [Editable LaTeX source ZIP](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/FPGA100T_LaTeX_Report_Source.zip). All 128 parts / 807 pad records are retained. Placement only: 0 tracks, vias or zones; 383 unconnected items; all 120 mezzanine signal contacts unassigned. The 0.010 mm courtyard minimum and J4 body overhang of 0.65 mm require assembly qualification; the drawn board-plus-body envelope is 33.65 × 36 mm. Earlier 37.5 × 36 and 40 × 36 mm studies remain separate.
