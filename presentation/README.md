# Assembly-first presentation

Starter for the September 23, 2026 PI review. Presentation changes stay on the `presentation` branch; this is not a hardware release.

## Open

- Immediate browser preview: https://raw.githack.com/HowardWHSrun/FPGA_4K/presentation/index.html
- Intended GitHub Pages address, **not live until Pages is enabled**: https://howardwhsrun.github.io/FPGA_4K/
- Repository Pages settings: https://github.com/HowardWHSrun/FPGA_4K/settings/pages

For GitHub Pages, select **Deploy from a branch**, branch **presentation**, folder **/(root)**, and save. The branch has a root `index.html` and `.nojekyll`. Do not change the default branch or merge presentation assets into `main` merely to publish the page.

The page uses relative asset paths, a bundled mesh, and a dependency-free Canvas renderer. It does not fetch third-party JavaScript, fonts, analytics, or hardware data. Clone this branch and open `index.html` to use it locally; no build step is required.

## Controls and structure

Drag to rotate; scroll or pinch to zoom. Use 3D / Top / Side camera buttons, the A / B / C / D markers, or the region cards. Arrow keys move through the four introductory views; 1–4 jump to a view; R resets the camera; F requests fullscreen. Model notes contains the provisional bridge-length control.

The four views introduce the overall assembly, ASIC carriers, routing/connection, and FPGA region. These are entry points, not completed technical sections. Add the team's board details and speaker content in the next iteration. Editable copy is in `app.js` (`sections`); layout is in `../index.html`; styling is in `style.css`.

## Important model distinction

The prior shortened-bridge file is explicitly absent from the existing assembly guide and could not be recovered from available files. This starter therefore shows a **new provisional compact visualization**, not that earlier revision. It also does not substitute a physical connector footprint.

The source is the preserved [original STL](../hardware/assembly/stacked_headboard_original.stl). The [assembly guide](../hardware/assembly/README.md) supplies the role interpretation: A = four two-ASIC carrier boards, B+C = routing PCB, D = FPGA PCB. Geometry and physical units are not final. Author of the original model: unverified.

For compact mode, with x in source-model coordinates:

- x <= 3: unchanged.
- 3 < x < 18: x' = 3 + (x - 3) * L / 15.
- x >= 18: x' = x - (15 - L).

Default L = 5 model units is an illustrative presentation assumption, adjustable from 3 to 15. The stack stays fixed; right-hand board geometry is translated without scaling. Original mode restores all source positions. No native CAD is modified. The original X envelope is 65 model units; the default compact envelope is 55. Do not relabel them as millimeters. Fit, clearance, pinout and manufacturing suitability have not been verified.

The [presentation manifest](manifest.json) records derivation and the original SHA-256. Source roles and the intended downstream path are documented in the [hardware overview](../hardware/overview.md). KR260 and PC are outside the CAD model.

## Validation

Browser smoke tests performed on the authored page at 1440x900 and 390x844: mesh loading (650 triangles), four view states, compact/original transformation, camera presets, keyboard navigation, model-notes dialog and adjustable bridge length. No JavaScript errors or horizontal page overflow in those tests. They used an in-memory HTML copy with the same local assets, not a live Pages deployment. Hardware behavior is not tested.

Run repository checks from the root: `python3 scripts/check_docs.py`, `python3 scripts/check_hardware.py`, `node --check presentation/app.js`, and `git diff --check`.
