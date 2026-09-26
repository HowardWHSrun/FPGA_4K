# Current 33 × 36 mm FPGA review

[Open the current page](index.html) or [inspect the native PCB](viewer/index.html?board=compact-routed). The front/back/interactive panel opens the **130-part routing revision**, the only active size. Earlier checkpoints are collapsed into history; their existing viewer URLs remain valid.

The current project integrates 1.8 V configuration, a 2.5 V link bank, both mezzanines and 21 schematic sheets. Boot/clock/JTAG and sequencing nets have complete copper. Supply distribution, ground continuity, application assignments and qualification remain unfinished. The page deliberately does not claim a working or fabrication-ready board.

[Complete current project ZIP](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/FPGA100T_33x36_Routing.zip) · [21-sheet native schematic PDF](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/output/FPGA100T_33x36_Routing_Schematic.pdf) · [Routing review](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/reports/Routing_Review.md) · [Every component pin](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/reports/All_Pin_Connections.csv) · [Artifact manifest](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/manifest.json).

[Current LaTeX component and pin PDF](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) · [Portable editable LaTeX source](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/report/FPGA100T_33x36_Routing_Report_Source.zip). The report documents all 130 components, 762 numbered endpoints and 48 functional nets for this current board.

[review-data.json](review-data.json) supplies the measured counts and identity. [viewer/boards.json](viewer/boards.json) pins each unchanged native PCB by SHA-256 and expected renderer counts. Static views are exported from the same frozen board; only color, viewport and labeled overview composition change. KiCanvas is a review viewer; native KiCad remains authoritative. See [viewer provenance and limits](viewer/README.md).

## Component explanations and labeled pins

[Presenter notes](data/Presenter_Notes.md) explain all 130 components; [the pin map](pins/) labels all 762 electrical endpoints using native pad positions. The default page keeps seven functional groups and short summaries visible. Detailed pin tables, sources and historical evidence open on demand.

The audit identifies **U1.L9/L10 requiring ground** and **U2–U5.4 FB2 requiring a grounding review**. The native board and the earlier PDF are unchanged; six saved NC markers must not be presented as six approved unused pins. R12 is the clearest current removal candidate.

`data/Component_Necessity.json` and `pins/pin_status.json` are pinned to the current board hash. Any electrical revision requires regenerated explanations, pad maps, counts, CSVs and audit findings from that same revision. Update both the standalone JSON and the embedded dataset in `pins/pin_map.js`; do not carry forward stale pin labels. `scripts/check_fpga_teaching.py` compares every component/pin against the frozen native evidence. The UI refuses component data with a different board hash.

## Refresh the current design

First freeze the canonical source `current/hardware/FPGA100T_33x36_Routing` project and all 21 sheets, local libraries and bring-up files together. Generate a fresh native DRC/ERC, `Routing_Snapshot.json`, readback, three CSV ledgers, placement-change log and routing/power/ground reviews for that exact board. Export front/back SVG and the schematic PDF without modifying the CAD; retain `Current_View_Provenance.json` with source and output hashes. Do not reuse older board views or reports.

From the repository root:

```sh
python3 scripts/import_fpga_routing.py --source ../2026-09-26_FPGA_Work/06_33x36_Routing
python3 scripts/check_fpga_review.py
python3 scripts/check_fpga_teaching.py
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
node --check presentation/fpga/review.js
node --check presentation/fpga/review-board.js
node --check presentation/fpga/presenter.js
node --check presentation/fpga/pins/pin_map.js
node --check presentation/fpga/viewer/viewer.js
node --check scripts/check_fpga_presentation.mjs
node --check scripts/check_fpga_viewer.mjs
git diff --check
```

The importer whitelists the canonical PCB/project, linked schematic sheets, library tables and local libraries. Candidate boards, scripts, caches, locks and editor state are excluded. It builds a deterministic ZIP and records unchanged CAD hashes; report paths are made portable with both source and published hashes. It refuses physical/parity errors or a manufacturing-ready claim. This is packaging verification, not electrical or manufacturing approval.

The checker preserves historical hash checks and additionally verifies current native counts, all assigned PCB/schematic endpoints, the 762-pin CSV, component/net tables, local library resolution, ERC/DRC agreement, PDF/view hashes and ZIP contents. Reconcile the human narrative after every interface or status change; dynamic numbers cannot correct old engineering conclusions.

The older `import_fpga_review.py` and `import_fpga_interface_study.py` are historical importers. Running them can replace the current review data or regenerate obsolete narrative. Do not use them to refresh this current routing board.

## Local and published browser verification

Serve the repository root. Supply `SITE_URL`, an installed `CHROME_PATH` and, where necessary, `PLAYWRIGHT_MODULE`. Save generated browser evidence in the dated work folder.

```sh
python3 -m http.server 8765
# Separate shell, from the dated evidence directory:
SITE_URL=http://127.0.0.1:8765/ node /path/to/repository/scripts/check_fpga_presentation.mjs
SITE_URL=http://127.0.0.1:8765/ node /path/to/repository/scripts/check_fpga_viewer.mjs
```

The presentation check covers navigation, current SVG and embedded native views, downloads, mobile/desktop overflow, history and entry from the system view. The native-viewer check independently compares every pad/copper net and byte hash, outline and counts across current and historical boards, then exercises selection, layers, zoom, pan, flip, fullscreen and failure fallback.

GitHub Pages serves the `presentation` branch at its root. Verify deployed file hashes and live browser checks after publishing; local checks alone do not confirm deployment. No manufacturing files are released by this workflow.

## Sources and preserved history

[Gerald's 28-slide review](../../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md) documents framing and SPI direction while retaining timing/channel conflicts. The [fourth-review register](../../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) is dated evidence, supplemented by the current routing audit. ASIC electrical limits and the complete receiver/cable contract remain unresolved.

The historical [33 × 36 mm, 128-part placement](viewer/index.html?board=compact-v2) and [31-page LaTeX report](../../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/output/pdf/FPGA100T_Size_Components_Pinout.pdf) describe the unrouted placement. They are not the current 130-part circuit or pin report. The [37.5 × 36 mm placement](viewer/index.html?board=compact), [earlier 40 × 36 mm studies](index.html#design-history), [200T/50T slide deck](history-2026-09-24.html) and [meeting hub](../meetings/) retain their original context.
