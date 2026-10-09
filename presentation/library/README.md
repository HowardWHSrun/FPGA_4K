# Searchable project library

[The homepage](../../index.html#overview) opens with the system overview. Its top **Library** link opens this separate archive; the **Overview** link in the library returns to the homepage overview.

The overview and library use [shared navigation styles](../shared/project-navigation.css), with the same six links and an underline on the current page. Edit that stylesheet to keep both headers consistent.

[Open the library](index.html). This is the public index of dated FPGA illustrations, meeting records, board revisions, reports, native packages and viewer entry points. Search matches titles, dates, revisions, types, topics, source filenames and status notes. Material, topic and source-date filters combine, and their URL parameters can be shared.

The gallery creates 24 cards at a time and uses 560 × 350 WebP previews. Full source images load only after a preview is opened; closing it removes the original image. Interactive board viewers open from explicit links. The delivered HTML also contains a complete source-link list for readers without JavaScript or if catalog loading fails. No browser libraries, third-party fonts, WebGL, model files or outside services load on this page.

<!-- LIBRARY_STATS_START -->
The generated catalog contains **444 records**, including **201 illustrations** and **15 3D viewer entry points**. All **99 figures** from the original September 30 index are retained. The **195 previews** total **3.20 MB**, compared with **107.35 MB** of original image files (**97.02% smaller**); only 24 cards are created initially. Exact counts, byte totals and source-date policy are recorded in [build-report.json](build-report.json).
<!-- LIBRARY_STATS_END -->

## Source coverage and dates

- The October 3–4 reviews link to current 35T R37, LDO E5, XEM8305 A1R2 and the V6 bonding fixture, with interactive previews. Native CAD, schematic PDFs and complete local source folders from these revisions are not included. The A1R2 assembly depicts adapter E3, distinct from the current E5 adapter; its provisional cable and connector envelopes remain unqualified.

- Every figure from [the existing September 30 visual index](../meetings/assets/2026-09-30/visual-index.json) is preserved, with its original title/date/status/links/hash under `provenance`. Where the original index chooses a full SVG for a PNG preview, that original format is still used in the dialog and source link.
- Other published illustrations are included, especially the R12 schematic sheets and simple connection diagrams. UI icons and vendor sprites are excluded.
- The October 2 meeting, its public notes and the J1/J19 connector drawing are included. The meeting records a one-chip XEM8305 backup and a 35T direction for further review; it does not replace historical 25T native CAD or record a completed hardware test.
- [entries.json](entries.json) records the selected public meeting, revision, schematic, firmware and viewer entry points. The builder adds project PDFs, ZIPs, slide/Word originals, assembly STL files and public engineering report notes. Manufacturer evidence remains reachable through its engineering reports rather than filling the primary library with vendor files.
- Additional source dates come from dated published paths, not filesystem modification times. Undated materials are labeled **Preserved reference**. The September 30 index retains its own source-date labels, even when an underlying older figure is undated.
- A date, visual or file package does not change engineering status. Three-board/three-cable and older FPGA-device proposals are labeled as dated history. Original source bytes are unchanged. Markdown reading links point to the repository's `presentation` branch so they open as rendered documents.

## Rebuild

From the repository root:

```sh
python3 scripts/build_library.py
python3 scripts/build_library.py --check
```

The builder uses Python's standard library and Node.js with `sharp` for thumbnail rendering, discovering the bundled Codex runtime when available. Else provide `--node /path/to/node --sharp-module /path/to/sharp`, or use an installed `node` and `sharp`. The browser page itself has no dependencies.

Generated outputs are [catalog.json](catalog.json), [build-report.json](build-report.json), [index.html](index.html), `thumbs/*.webp` and the marked catalog-totals paragraph in this guide. Edit [index.template.html](index.template.html), [library.css](library.css), [library.js](library.js) or the curated entry list, then rebuild. Rebuild after changing any indexed source page so its recorded hash matches. Each thumbnail filename includes its source path identity and content hash; stale generator-owned previews are pruned. The builder never edits original figures or hardware files.

`--check` verifies required fields, unique IDs, original-source hashes, full-source hashes, thumbnail existence, all 99 source-index figures, and every local source/viewer/image URL. Source and URL paths must stay within the repository.

## Browser behavior check

[browser-check.cjs](browser-check.cjs) checks combined search and filters, deep-link reload, load more, empty state, preservation of full SVG choice, on-demand original-image requests, Escape and image removal, mobile width, the complete no-JavaScript fallback and browser errors. It uses Playwright and an existing Chromium installation. Serve the repository at `http://127.0.0.1:8781/`, then run:

```sh
NODE_PATH=/path/to/node_modules CHROME_PATH=/path/to/chromium node presentation/library/browser-check.cjs
```

Set `LIBRARY_URL` to use another server. The check creates an isolated browser context and does not use a personal browser profile. No hardware operation or rendering proves circuit, timing, mechanical or fabrication readiness.
