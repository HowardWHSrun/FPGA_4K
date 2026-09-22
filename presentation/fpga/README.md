# FPGA board-level review

**[Open the FPGA slides](https://howardwhsrun.github.io/FPGA_4K/presentation/fpga/)** · [Return to the system FPGA section](../../index.html#fpga)

This is the second level of the presentation, not a replacement for the system overview.

1. Select FPGA in the overall assembly.
2. Select **Open KiCad design & FPGA slides**, or click the already-selected FPGA label/tab again. Double-clicking the selected FPGA canvas also enters this page.
3. Use this page's own slide navigation. **System overview** returns to the parent FPGA section.

## Views and slides

Eight slides cover PCB layout, FPGA/I/O, recording and stimulation data paths, cable interface, power, boot/memory/clock, open issues and proposed next decisions. Each combines the actual KiCad view with a short explanation. Source notes hold the additional detail without crowding the main view.

`slides.js` holds the content; `app.js` handles navigation, layout pan/zoom and native-document inspection. `refinements.css` reduces visual clutter in both levels. Detailed changes can be made independently of the parent deck.

Front/back SVGs come directly from `hardware/fpga-board/previews/` and are not altered. Back is mirrored. They show selected outer copper/fabrication layers, not every layer. Pan, wheel/pinch zoom and fit controls operate on the export without rewriting it.

**Interactive KiCad** loads the native PCB into [KiCanvas](https://kicanvas.org/embedding/), with inspection controls. The document selector provides the PCB, root schematic and child sheets discovered from the actual root schematic. **Inspect related schematic** opens the relevant source for the current slide. Selecting the root loads its child sheets together for hierarchical inspection.

The KiCanvas module is requested from `https://kicanvas.org/kicanvas.js` only when native inspection is opened. It is an external, early-stage, read-only viewer—not desktop KiCad. Loading/failure notices and independent front/back views remain available if a module or native document fails. No editing, DRC, ERC, programming or acquisition is performed. Full KiCad 10 feature parity is not implied.

**KiCad files** links to the PCB, project, root schematic, board guide and a repository ZIP containing the hierarchical sheets and custom libraries. For desktop editing use the complete project, not an isolated `.kicad_pro`. The repository's handoff specifies KiCad 10.0.6.

## Source and status

Source CAD revision: `46c3c6985bef1249170146dba927266443d8a1e8`. This update preserves the board-level viewer added through `fd518f1739e369fbbc8d966aca7b77893593dc8e`.

The PCB blob at that source revision is `ad4324809871fe300aee289dbb441b4fc6ff9dcc`; top-level schematic `7b013b342acbe10802a243148a1de90d852922d7`; front export `793c4f5c3439653a140552dfe4dbb43205dbe73d`.

All layout sizes and completion counts refer to the September 21 import. The 270 unconnected PCB items, 661 unresolved schematic pins and 21 undriven power pins are not live analysis. The native files are fetched at page-load time from the presentation branch, while the text remains a dated baseline. Regenerate exports and update dated content when changing native CAD.

The [September 21 meeting digest](meeting-2026-09-21.md) is a project-only paraphrase of the user-supplied transcript. Raw conversation is not published. Recording/stimulation separation, downstream waveform storage, the cable/adapter proposal and cable-based programming questions are meeting directions—not validated specifications. Tentative rates, voltage remarks and AI suggestions are not silently promoted to facts. Proposed owner pairings and validation steps are labeled as suggestions, not assigned/completed work.

See [manifest.json](manifest.json) for provenance. No native CAD or compact assembly geometry is changed. The system overview, reported owners, unified routing/LDO region and KR260 stage are retained.

## Verification

Run `node --check presentation/fpga/app.js` and `node --check presentation/fpga/slides.js` for syntax. `scripts/check_fpga_presentation.mjs`, used by `.github/workflows/fpga-detail-check.yml`, checks drill-down/back-navigation, actual assets, all eight slide states, layouts and native inspection. Workflow logs are the evidence of a particular successful run; they are not hardware-validation results.
