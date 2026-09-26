# 100T FPGA engineering review

[Open the current page](index.html). It describes the full-board release scope: XC7A100T CSG324, all 117 ASIC signals and the XEM8310 receiver link. The 40 × 36 mm core snapshot is incomplete and not fabrication-ready.

The page loads current counts and board identity from [review-data.json](review-data.json). The [artifact manifest](../../hardware/fpga-100t-review/manifest.json) records every packaged file's SHA-256; [the full project ZIP](../../hardware/fpga-100t-review/FPGA100T_Review_Project.zip) includes native CAD, all hierarchical sheets, local libraries, rendered views and selected evidence. The import preserves native CAD bytes. Workstation paths in reports are made portable, with original and transformed hashes retained.

## Refresh after a verified CAD revision

First regenerate the source's Wiring_Status, Final_Snapshot_Audit, Geometry, native DRC/ERC, schematic PDF and PCB SVG/PNG for the same revision. Do not reuse stale visual exports. Then, from this repository root:

```sh
python3 scripts/import_fpga_review.py --source ../FPGA_100T_CSG324/minimal_core
python3 scripts/import_fpga_interface_study.py --source ../FPGA_100T_CSG324
python3 scripts/check_fpga_review.py
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
node --check presentation/fpga/review.js
node --check scripts/check_fpga_presentation.mjs
git diff --check
```

The importer rejects disagreement between the native board, geometry, wiring status, snapshot file hashes and DRC counts. It makes a deterministic ZIP, updates the source manifest and produces the JSON used on the page. It deliberately refuses a fabrication-ready snapshot: an actual release needs a reviewed change to the page and its release gates. The package checker verifies coherence, not hardware correctness.

Review `index.html` narrative after any scope, interface, rail or validation-category change. Dynamic numbers do not make old engineering conclusions current. In particular, the ERC explanation and power-routing text must be reconciled when those areas are completed. Confirm the two 60-pin mezzanine proposal and full-board outline once their exact mapping/mechanics are validated.

## Local and published browser checks

Serve the repository root with a local HTTP server. Run the browser check with `SITE_URL` set to its root, `CHROME_PATH` set to an installed Chrome/Chromium executable, and (if needed) `PLAYWRIGHT_MODULE` set to an installed Playwright module. It checks section navigation, native views, data display, project/PDF downloads, desktop/mobile overflow, historical-page access and the system-view entry.

```sh
python3 -m http.server 8765
# Separate shell; Chrome and Playwright must be installed:
SITE_URL=http://127.0.0.1:8765/ node scripts/check_fpga_presentation.mjs
```

`fpga-browser-check/` is ignored generated evidence. `SKIP_SYSTEM_CHECK=1` can isolate the new page when the older system view's external viewer dependencies are unavailable; report this limitation rather than claiming that entry path passed.

GitHub Pages is configured to serve the `presentation` branch at its root. The FPGA detail workflow waits for live files to match the pushed revision before testing the live page. A successful local build is not deployment verification.

## Preserved history

[The earlier eight-slide review](history-2026-09-24.html) and its [manifest](history-2026-09-24-manifest.json) preserve the 200T draft and 50T evaluation. Their original app, slide and style files remain alongside the new review. [September 21](meeting-2026-09-21.md), [September 22](direction-2026-09-22.md), and the [meeting hub](../meetings/) retain their dated context. These are not the current 100T pinout or release status.

The separate [mezzanine/interface study](../../hardware/fpga-interface-study/README.md) has its own importer and manifest. It must not be represented by the current core snapshot counters. After updating its SVG/PNG/contact CSV/reports, rerun `scripts/import_fpga_interface_study.py` with the FPGA_100T_CSG324 root, then the documentation and browser checks.
