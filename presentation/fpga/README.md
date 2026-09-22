# FPGA board-level review

**[Open the FPGA slides](https://howardwhsrun.github.io/FPGA_4K/presentation/fpga/)** · [Return to the system FPGA section](../../index.html#fpga)

This is the second presentation level. Select FPGA in the system view, then **Open KiCad design & FPGA slides**. Clicking the already-selected FPGA label/tab again, or double-clicking its selected canvas, also enters the board-level page. The return button restores the parent FPGA section.

## Slides and design inspection

The five initial slides cover PCB layout, FPGA/interfaces, power, boot/clock and bring-up. `slides.js` holds source-grounded, editable content. Reference figures and completion counts retain their September 21 import context rather than being represented as live status.

The front/back SVGs are the existing KiCad exports in `hardware/fpga-board/previews/`. Back is mirrored; both views omit inner layers. Pan, zoom and fit controls do not change the original export.

**Interactive KiCad** opens the native multilayer board in a read-only [KiCanvas](https://kicanvas.org/embedding/) viewer. The document selector discovers child sheets from the actual root schematic. **Inspect related schematic** opens the source associated with the current slide. Selecting the root schematic loads its children together.

The module is requested on demand from `https://kicanvas.org/kicanvas/kicanvas.js`. It is an external, early-stage viewer, not desktop KiCad. The original files and independent front/back exports remain available if native rendering fails. Full KiCad feature parity, editing and DRC/ERC are not claimed.

**KiCad files** provides the native PCB, project, root schematic, board guide and complete repository ZIP. For editing, keep the entire FPGA hardware folder, child sheets and custom libraries together, then open the `.kicad_pro` through KiCad Project Manager. The repository's handoff specifies KiCad 10.0.6.

## Provenance

Source revision: `46c3c6985bef1249170146dba927266443d8a1e8`. PCB blob: `ad4324809871fe300aee289dbb441b4fc6ff9dcc`. Root schematic blob: `7b013b342acbe10802a243148a1de90d852922d7`. Front export blob: `793c4f5c3439653a140552dfe4dbb43205dbe73d`.

The native files are fetched from the presentation branch when inspected; the slide text remains a dated review baseline. Regenerate exports, reports and slide status after changing the actual CAD. See [manifest.json](manifest.json) for source scope.

No native CAD, compact assembly geometry or main-branch files are modified. The parent system layout, reported owners, merged routing/LDO workstream and KR260 stage are retained. No font files are added.

## Verification

`scripts/check_fpga_presentation.mjs` and `.github/workflows/fpga-detail-check.yml` check published bytes, navigation, actual SVG loading, desktop/mobile layouts and native viewing. Workflow logs establish which checks passed for a given revision; this README does not independently claim a test result. Hardware operation is not tested.
