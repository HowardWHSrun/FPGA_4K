# FPGA board-level review

**[Open the FPGA slides](https://howardwhsrun.github.io/FPGA_4K/presentation/fpga/)** · [Return to the system FPGA section](../../index.html#fpga)

This is the second presentation level. Select FPGA in the system view, then **Open KiCad design & FPGA slides**. Clicking the already-selected FPGA label/tab again, or double-clicking its selected canvas, also enters the board-level page. The return button restores the parent FPGA section.

## Slides and design inspection

Eight slides cover PCB layout, FPGA/I/O, recording and stimulation data paths, the cable link, power, boot/memory/clock, open issues and proposed next decisions. `slides.js` holds source-grounded content; `refinements.css` reduces visual clutter. Additional detail is in each slide's source notes rather than crowding the main view.

The front/back SVGs are the existing KiCad exports in `hardware/fpga-board/previews/`. Back is mirrored; both views omit inner layers. Pan, zoom and fit controls do not change the original export.

**Interactive KiCad** opens the native multilayer board in a read-only [KiCanvas](https://kicanvas.org/embedding/) viewer. The document selector discovers child sheets from the actual root schematic. **Inspect related schematic** opens the source associated with the current slide. Selecting the root schematic loads its children together.

The module is requested on demand from `https://kicanvas.org/kicanvas/kicanvas.js`. It is an external, early-stage viewer, not desktop KiCad. The original files and independent front/back exports remain available if native rendering fails. Full KiCad feature parity, editing and DRC/ERC are not claimed.

**KiCad files** provides the native PCB, project, root schematic, board guide and complete repository ZIP. For editing, keep the entire FPGA hardware folder, child sheets and custom libraries together, then open the `.kicad_pro` through KiCad Project Manager. The handoff specifies KiCad 10.0.6.

## Provenance

Source CAD revision: `46c3c6985bef1249170146dba927266443d8a1e8`. PCB blob: `ad4324809871fe300aee289dbb441b4fc6ff9dcc`. Root schematic: `7b013b342acbe10802a243148a1de90d852922d7`. Front export: `793c4f5c3439653a140552dfe4dbb43205dbe73d`.

The native files are fetched from the presentation branch when inspected; slide counts, layout dimensions and DRC/ERC figures retain their September 21 import context. Regenerate exports and reports after changing CAD. The 270 unconnected PCB items, 661 unresolved schematic pins and 21 undriven power pins are not live results.

The [September 21 meeting digest](meeting-2026-09-21.md) is a project-only paraphrase of the user-supplied transcript. Raw conversation is not published. Recording/stimulation separation, downstream waveform storage, cable/adapter proposals and programming through the cable are directions or open questions, not demonstrated implementations. Tentative rates, voltage remarks and AI suggestions are not presented as verified specifications. Next-step coordination and tests are proposals, not assigned or completed work.

See [manifest.json](manifest.json) for scope. No native CAD, compact assembly geometry or main-branch files are modified. The parent system layout, reported owners, unified routing/LDO workstream, KR260 stage and concurrent native-viewer fixes are retained.

## Verification

`scripts/check_fpga_presentation.mjs` and `.github/workflows/fpga-detail-check.yml` check published bytes, drill-down/back-navigation, actual SVG loading, eight slide states, desktop/mobile layouts and native viewing. Workflow logs establish which checks passed for a given revision. Hardware operation is not tested.
