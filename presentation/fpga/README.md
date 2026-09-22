# FPGA board-level review

**[Open the FPGA slides](https://howardwhsrun.github.io/FPGA_4K/presentation/fpga/)** · [Return to the system FPGA section](../../index.html#fpga)

This is the second level of the presentation, not a replacement for the system overview.

1. Select FPGA in the overall assembly.
2. Select **Open KiCad design & FPGA slides**, or click the already-selected FPGA label/tab again. Double-clicking the selected FPGA canvas also enters this page.
3. Use this page's own slide navigation. **System overview** returns to the parent FPGA section.

## Views and slides

The five initial slides are PCB layout, FPGA/interfaces, power, boot/clock and bring-up. Each combines the actual KiCad export with a short, editable explanation grounded in dated repository sources. `slides.js` holds the content; `app.js` handles navigation, layout zoom/pan and read-only native-document inspection. Detailed presentation changes can be made independently of the parent deck.

Front/back SVGs come directly from `hardware/fpga-board/previews/` and are not altered. Back is mirrored. They show selected outer copper/fabrication layers, not every layer. Pan, wheel/pinch zoom and fit controls operate on the export without rewriting it.

**Interactive KiCad** loads the native PCB into [KiCanvas](https://kicanvas.org/embedding/), with its full inspection controls. The document selector provides the PCB, root schematic and child sheets discovered from the actual root schematic. **Inspect related schematic** opens the relevant source for the current slide. Selecting the root loads its child sheets together for hierarchical inspection.

The KiCanvas module is requested from `https://kicanvas.org/kicanvas.js` only when native inspection is opened. It is an external, early-stage, read-only viewer—not desktop KiCad. An explicit loading/failure notice and the independent front/back views remain available if the module or a native document fails. No editing, DRC, ERC, programming or acquisition is performed. Full KiCad 10 feature parity is not implied.

**KiCad files** links to the actual PCB, project, root schematic, board guide and a repository ZIP containing the hierarchical sheets and custom libraries. For desktop editing use the complete project, not an isolated `.kicad_pro`. The repository's handoff specifies KiCad 10.0.6.

## Source and status

Source revision at preparation: `46c3c6985bef1249170146dba927266443d8a1e8`.

The current editable PCB blob at this revision is `ad4324809871fe300aee289dbb441b4fc6ff9dcc`. The top-level schematic blob is `7b013b342acbe10802a243148a1de90d852922d7`. The front export is `793c4f5c3439653a140552dfe4dbb43205dbe73d`.

Board descriptions, the 42 × 40 mm outline and all completion counts refer to the September 21 import. The 270 remaining PCB connection items, 661 unresolved schematic pins and 21 undriven power pins are not live analysis. The native files are fetched at page-load time from the presentation branch, while the text remains a dated review baseline. Regenerate exports and update the dated content when changing native CAD.

See [manifest.json](manifest.json) for provenance. No native CAD or compact assembly geometry is changed by this addition. No font files are added. The original overview, reported owners, unified routing/LDO region and KR260 stage are retained.

## Verification

`node --check presentation/fpga/app.js` and `node --check presentation/fpga/slides.js` check JavaScript syntax. `scripts/check_fpga_presentation.mjs` is the browser integration test used by `.github/workflows/fpga-detail-check.yml`; it checks publication, drill-down/back-navigation, native asset loading, slide states, layouts and native inspection. Workflow logs—not this document—are the evidence of a particular successful run.
