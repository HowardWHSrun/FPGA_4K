# Source provenance

The project files are stored in this repository. Attribution and copy details are recorded here so the main documentation can focus on the system and its interfaces.

| Material | Source and representation |
|---|---|
| ASIC/interface PowerPoint | Deck supplied by Gerald; unchanged original file |
| Slide PDF, searchable text and PNG previews | Representations of the original deck; diagrams remain available in the PPTX/PDF |
| Carrier PCB-5 and Pins.xlsx | Chip-side reference files shared for the project; unchanged copies |
| LDO/routing project and connector footprints | Shared reference files; unchanged except the library-table path adaptation below |
| Overall board renders and front/back layouts | Generated directly from the included carrier and LDO/routing CAD; [rendering details](../hardware/previews/README.md). No new board design is introduced |
| Overall assembly STL and labeled preview | Original user-supplied `stacked_headboard_onebody (1).stl`, preserved unchanged as `hardware/assembly/stacked_headboard_original.stl`, plus the existing labeled preview from the September 18 review. Included at the user's explicit request; original author unverified, not attributed to Gerald. [Assembly guide](../hardware/assembly/README.md) |
| September 17 DOCX/PDF notes | Summary prepared from the recorded team meeting; not a verbatim transcript |
| September 18 follow-up | Technical summary of team messages; received date is known, individual message dates were not provided |
| FPGA_512 code | Snapshot of [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e), shared as the prior acquisition reference; [included files and packaging details](../firmware/README.md) |
| Artix-7 raw-capture engine and clock proof | New isolated development, 26 September 2026; [scope and measured tests](../firmware/artix7/2026-09-26/raw_capture/README.md). No upstream files modified; synthetic-data simulation is distinct from ASIC operation. Tool caches, compiled images and workstation paths are omitted. |

[manifest.json](manifest.json) records each imported file's origin, size and SHA-256. Origins identify source revisions or archive labels; they are not paths required on a collaborator's computer.

The LDO library table uses `${KIPRJMOD}/LDO_Board.pretty` in place of its original workstation path. `source_sha256` retains the original hash; the circuit files are unchanged. Included upstream program files retain their original bytes and notices. Upstream repository metadata and local caches are not part of the source copy.

The collection now also includes the [FPGA working draft](../hardware/fpga-board/README.md), imported at the user's request for team development. Its [baseline and snapshot evidence](fpga-draft-2026-09-21/README.md) distinguish the editable design from historical sources. Native CAD and local libraries were copied unchanged; Git tracks later edits. The immutable manifest covers the import record and selected evidence, not the evolving CAD files. Private chat/audio, unrelated personal material, experimental generators, rejected candidates, caches and hidden histories remain outside the shared package.

The photograph in the [hardware overview](../hardware/overview.md) is the complete second slide of the included interface deck, rendered from its PDF. It shows a single-chip assembly; it is not labelled as the two-chip PCB-5 CAD revision. The current functional diagram uses the 100T/XEM8310 direction; the dated meeting record retains its earlier KR260 choice. The reference-board CAD views and the separately supplied overall arrangement STL are distinct sources; their inclusion does not establish that the reference boards mechanically mate.

Original ownership and applicable terms are retained. No repository-wide license was found in the pinned FPGA_512 tree; this collection adds no license grant to that code or the imported lab material.

## September 23 meeting materials

Howard supplied the [notes](meetings/2026-09-23-notes.txt) and [system-view screenshot](meetings/2026-09-23-system-view.png) on September 23, 2026. Both are preserved byte for byte; the screenshot’s original author is unknown. The [meeting page](../presentation/meetings/2026-09-23.html) is a derived summary. Discussion targets and reported activity are not approved specifications or test results.

## September 24 preparation

[FPGA meeting choices PDF](meetings/2026-09-24-FPGA_4K_Meeting_Choices.pdf), credited to Howard Wang and dated September 23, supplied for the September 24 meeting. Unchanged original including embedded links. [Online summary](../presentation/meetings/2026-09-24.html) distinguishes proposals from decisions and dated supplier figures from current stock.

## September 26 100T review snapshot

The [earlier minimal-core checkpoint](../hardware/fpga-100t-review/README.md) is a curated, explicitly unqualified copy of the locally developed FPGA100T minimal core. [Its manifest](../hardware/fpga-100t-review/manifest.json) records the original and packaged hashes. Native KiCad and library files retain exact source bytes; only workstation paths in selected report representations are made portable. The ZIP includes the complete project hierarchy, local libraries, exported schematic PDF, PCB views, logical 117-signal CSV and selected validation evidence. Private messages/audio, caches, earlier rejected candidates and routing experiments are excluded. [Package notes](../hardware/fpga-100t-review/README.md) retain attribution and limits.

The current full-board scope includes all 117 ASIC signals and the XEM8310 link. Core-only dimensions and passing geometric checks do not establish fabrication readiness. The existing 200T/50T page and its source material are preserved as history.

The [separate interface-study package](../hardware/fpga-interface-study/README.md) preserves selected local engineering reports and placement views. Its [manifest](../hardware/fpga-interface-study/manifest.json) distinguishes original bytes from Markdown link-only adaptations. It is not the current core copper revision or a full-system release.

## September 26 smaller placement and pin report

The [dated 33 × 36 mm study](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/START_HERE.md) is newly generated engineering work from the preserved 37.5 × 36 mm placement. Its 66-file import manifest records byte correspondence and evidence-path normalization. Native CAD and local footprint library bytes are unchanged in the portable publication copy; workstation-specific automation scripts and editor state are omitted from its 49-file ZIP. The 31-page PDF and editable LaTeX source cover all 128 components and 758 electrical endpoints. These remain an unrouted, unqualified proposal; earlier source files and original slides are unchanged.

### Historical 33 × 36 mm routing — 26 September 2026

The [earlier review](../presentation/fpga/micro-hdmi.html) and [dated routing package](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/README.md) publish one 130-part board with matching 21-sheet schematic, corrected rails, native pin/component ledgers and unsuppressed checks. The [import manifest](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/manifest.json) binds exact CAD/library bytes to the frozen source. Experiments and failed candidate boards are excluded. Earlier source snapshots, ASIC slides and placement reports remain unchanged; routing progress is not a fabrication or functional qualification.

## 26 September: component necessity and pin labels

[The dated audit](../hardware/fpga-interface-study/dated/2026-09-26/presentation-and-pin-labels/README.md) derives all 130 component explanations and 762 endpoint labels from the frozen 33 × 36 mm native snapshot. Manufacturer requirements are linked individually in the audit, including AMD UG475 for U1.L9/L10 ground ties and TI TPS62135 for the FB2 review. The interactive maps use actual native pad centers viewed from the front; they are not mating-face drawings. Native CAD and earlier PDF bytes are unchanged. The new audit explicitly corrects the interpretation of six saved NC markers and documents the R12 removal candidate.

## 26 September learning and professor report

The [33-page learning report](../hardware/fpga-interface-study/dated/2026-09-26/learning-report/README.md) is a new, self-contained LaTeX explanation of the frozen 130-part, 33 × 36 mm board. It combines native-derived component/pin ledgers with the later manufacturer-grounded NC review, visual maps and presentation notes. All 762 numbered endpoints are covered. Native CAD and all earlier reports retain their original bytes; this document records corrections and unfinished work rather than implementing them. The dated manifest records the PDF, source and coverage hashes.

## 27 September USB-C revision

The [USB-C revision](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/README.md) preserves the 100T and ASIC assignment while replacing the cable interface and adding its supporting circuitry. Native CAD and local libraries are exact copies of the frozen working revision. Reports bind to the native hash; portable report metadata omits local workstation prefixes, with source and published hashes retained. Views and the schematic PDF are native KiCad exports.

The full newly supplied private discussion, downloaded manufacturer documents, intermediate placements and rejected routing candidates are excluded. The earlier micro-HDMI reports remain separate. Zero native errors, if reported, do not demonstrate firmware, powered operation, cable performance or manufacturing acceptance. No order has been placed.

The USB-C project carries a [library attribution note](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/libraries/README.md) and the unchanged upstream KiCad library license with its bundled library subset. Manufacturer references remain linked to their original publishers.
