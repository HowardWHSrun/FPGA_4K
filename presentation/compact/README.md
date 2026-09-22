# Compact assembly presentation

**[Open the live presentation](https://howardwhsrun.github.io/FPGA_4K/)**

This is the active presentation at the repository root. GitHub Pages serves the `presentation` branch, configured by Howard. Keep these edits on that branch; `main` and native PCB designs are not changed.

## Current content

The opening view shows the exact compact B v1 assembly supplied by Howard on September 22, 2026. Three section placeholders highlight the ASIC-carrier stack, routing/connection, and FPGA board. Detailed slide content is intentionally reserved for the team's next instructions.

The review date shown is September 23, 2026.

## Controls

Drag to rotate; scroll or pinch to zoom. Select the A/B/C/D markers or section cards to highlight regions. Camera presets offer 3D, Top, and Side views. Present or F toggles fullscreen. Arrow keys and Page Up/Down navigate; 1–4 jump; Home returns to the overview; R resets the camera.

## Editing

[slides.js](slides.js) holds slide titles, copy, URL IDs, and region highlights. Add slide objects here for further content. [app.js](app.js) holds presentation controls and the depth-buffered Canvas viewer. [style.css](style.css) defines the layout. The root [index.html](../../index.html) loads these assets and the shared compact source. No external scripts, fonts, analytics, or build step are required.

## Model source

Original supplied filename: `stacked_headboard_compact_B_v1(1).stl`.

SHA-256: `1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46`.

The raw compact STL is preserved in [hardware/assembly](../../hardware/assembly/stacked_headboard_compact_B_v1.stl). [model-source.js](../model-source.js) is a lossless gzip/base64 representation of those same bytes. The browser parses all 650 source triangles directly, with no extra shortening or individual-part scaling. Model notes offers an exact-byte STL download. Physical units are unspecified; this is not a manufacturing drawing or electrical validation.

A/B/C/D role labels follow the [assembly guide](../../hardware/assembly/README.md). Colors and label positions are presentational annotations. The original long-bridge model remains separate and unchanged.

Earlier original-based visualization studies remain in `presentation/app.js` and `presentation/review/` as legacy work. They are not the supplied compact model and are not used by this root presentation.

## Validation

Local Chromium tests at 1440×900, 1280×720, and 390×844 checked loading, 650 triangles, bounds, navigation, camera presets, labels, notes, and exact-byte STL download. Desktop fullscreen entry and exit were checked. No JavaScript page errors or horizontal overflow were found. The independent download checksum matched the attachment. These tests used local in-memory HTML, not hosted Pages.

The import workflow also ran repository document and hardware-file integrity checks before committing the compact source. The compact-page workflow separately checks public HTTP assets and headless browser rendering after deployment. Its actual result is available in GitHub Actions; a workflow definition alone is not evidence of a passed check. None of these checks validate physical hardware.
