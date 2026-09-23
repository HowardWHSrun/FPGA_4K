# FPGA board-level review

**[Open the FPGA slides](https://howardwhsrun.github.io/FPGA_4K/presentation/fpga/)** · [Return to the system FPGA section](../../index.html#fpga)

Select FPGA in the system, then **Open KiCad design & FPGA slides**. A second click on its selected label/tab also enters this page. System overview returns to the parent selection.

## Eight short slides

Current draft → Smaller FPGA → Functions → I/O + link → Power → Boot + clock → Prototype → Next steps.

Each main slide has a short explanation, three compact facts and two discussion points. Longer qualifications and dated evidence are behind **Slide notes & sources**. The [September 22 direction update](direction-2026-09-22.md) records Howard and Zitong's current work, CP SOM One attribution, the package-specific 50T candidate and the open prototyping question. The [September 21 digest](meeting-2026-09-21.md) remains a separate historical record.

**Important:** the displayed KiCad files are still the 200T working draft. The 10 × 10 mm XC7A50T / CPG236 is being evaluated; it has not been substituted into the CAD or verified for this system. Functions and components are not final.

## Inspection and editing

Front/back SVGs are the original September 21 KiCad exports; back is mirrored and inner layers are omitted. Pan, zoom and fit do not modify the source.

**Interactive KiCad** loads the native PCB or schematics using read-only [KiCanvas](https://kicanvas.org/embedding/). Its module is requested on demand from `https://kicanvas.org/kicanvas/kicanvas.js`. The document selector discovers the child sheets; **Inspect related schematic** opens the source associated with the current slide. Full desktop KiCad feature parity is not claimed. Original exports remain available if native rendering fails.

**KiCad files** links to the native PCB, project, root schematic, guide and full repository ZIP. For editing, retain all child sheets and local libraries and open the `.kicad_pro` through KiCad Project Manager. The handoff specifies KiCad 10.0.6.

Edit `slides.js` for slide content. `concise.css` changes only the board-level deck's typography. `app.js` and the native renderer are unchanged in this revision. Existing slide IDs are retained so previously shared deep links and navigation tests continue to work.

## Provenance and validation

CAD source revision: `46c3c6985bef1249170146dba927266443d8a1e8`. Integration base for this copy revision: `ee8b615ed2a4ced86b3f52f916daf5532249ca63`. See [manifest.json](manifest.json).

Native files load from the presentation branch; visible board sizes and historical completion counts retain their September 21 import date. No native CAD, compact assembly geometry or main-branch files are modified. No electrical operation, synthesis, timing closure or fresh DRC/ERC is performed for this presentation update.

`.github/workflows/fpga-detail-check.yml` and `scripts/check_fpga_presentation.mjs` check publication, drill-down/back navigation, eight slide states, actual board exports, desktop/mobile layouts and native viewing. A workflow's logs—not this README—establish a particular successful run.

## September 23 update

The [latest meeting](../meetings/2026-09-23.html) reopens FPGA/package selection: approximately 120 I/O are discussed and the 106-I/O 50T option was reported insufficient. Prioritize the complete pin map, minimum board components, procurement, USB 3.0/connector decision and EMI review. The native CAD remains the dated 200T draft.
