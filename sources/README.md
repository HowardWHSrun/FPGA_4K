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

[Current engineering review](../presentation/fpga/index.html) publishes a curated, explicitly unqualified copy of the locally developed FPGA100T minimal core. [Its manifest](../hardware/fpga-100t-review/manifest.json) records the original and packaged hashes. Native KiCad and library files retain exact source bytes; only workstation paths in selected report representations are made portable. The ZIP includes the complete project hierarchy, local libraries, exported schematic PDF, PCB views, logical 117-signal CSV and selected validation evidence. Private messages/audio, caches, earlier rejected candidates and routing experiments are excluded. [Package notes](../hardware/fpga-100t-review/README.md) retain attribution and limits.

The current full-board scope includes all 117 ASIC signals and the XEM8310 link. Core-only dimensions and passing geometric checks do not establish fabrication readiness. The existing 200T/50T page and its source material are preserved as history.

The [separate interface-study package](../hardware/fpga-interface-study/README.md) preserves selected local engineering reports and placement views. Its [manifest](../hardware/fpga-interface-study/manifest.json) distinguishes original bytes from Markdown link-only adaptations. It is not the current core copper revision or a full-system release.
