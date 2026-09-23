# Compact assembly presentation

**[Open the live presentation](https://howardwhsrun.github.io/FPGA_4K/)**

Active root presentation, published from the `presentation` branch. The review uses the exact supplied compact headboard, reported workstream owners and source-grounded details. The connecting section and lower routing/LDO board are one subsystem. KR260 is a separately labeled schematic downstream stage. Native CAD and `main` are unchanged.

## Sections and responsibilities

| Section | Reported responsibility | Scope |
|---|---|---|
| Overview | Team | Complete compact headboard and schematic downstream platform |
| ASIC carriers | Gerald | Four two-chip carriers; 1,024 channels per carrier discussed |
| Routing + LDO | Zitong | Former B + C regions treated as one routing/power board |
| FPGA | Howard: PCB; Jiaao: programming | Acquisition, aggregation and the partial hardware draft |
| KR260 / control | David: downstream / “MCU” programming | Reception, intended control path and forwarding toward PC |

Assignments come from the [team follow-up received September 18](../../docs/meetings/2026-09-18-follow-up.md). They do not claim completion or replace the unassigned GitHub layout reservations in [owners and open work](../../docs/team/owners-and-work.md).

Each section has its owner, function, key facts and unresolved interface questions. **Technical notes & evidence** retains reference-board dimensions and source dates. The FPGA section also links to the existing [board-level review](../fpga/index.html); this continuation preserves that presentation.

## Interactions

Click a visible board, model label, owner entry or bottom-navigation section. The camera centers and enlarges the selected part; other regions remain as faint contextual outlines. The geometry itself does not move. The bridge and LDO region share one color, selection and owner.

Drag to rotate; scroll or pinch to zoom. Use 3D/Top/Side and Reset view. F requests fullscreen. Arrow keys and Page Up/Down navigate; 1–5 jump; Home returns to the overview. Escape returns to the overview when no dialog or fullscreen session is active. Each section has a shareable URL hash, including `#kr260`.

The finishing layer removes duplicate headings, links hovered/focused labels and navigation entries visually, adds owner-aware accessible labels, announces section changes, and keeps mobile navigation centered on the selected section.

## Editable files

[slides.js](slides.js) contains owners, facts, details and source links. [app.js](app.js) contains the exact-STL renderer and camera controls. [style.css](style.css) defines the base layout. [refinements.css](refinements.css) and [interaction.js](interaction.js) apply the review-v2.1 finishing layer. [Root index.html](../../index.html) loads them. The [revision manifest](review-v2.json) records source and annotation provenance.

Typography prioritizes Inter and Aptos when installed, then platform system fonts, Segoe UI, Helvetica Neue and Arial. The face depends on the viewer's system. No fonts, analytics or external rendering libraries are bundled or downloaded.

## Geometry and source authority

Supplied file: `stacked_headboard_compact_B_v1(1).stl`.

SHA-256: `1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46`.

The [raw compact STL](../../hardware/assembly/stacked_headboard_compact_B_v1.stl) and lossless [model-source.js](../model-source.js) are unchanged. The renderer uses all 650 source triangles without extra shrinking, part scaling or reconstruction. Its diagnostic checks every source-triangle coordinate. Model notes offers an exact-source STL download. Physical units remain unspecified.

KR260 is a schematic system-stage illustration, not manufacturer CAD, a physical headstage layer, or a relative-scale claim. “MCU” is the team's downstream-workstream terminology. The distinction between that label and the K26 SOM / Zynq UltraScale+ MPSoC platform is attributed to the [AMD KR260 specification](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html). Platform capabilities are not demonstrated recording-system throughput.

## Validation

Local Chromium tests used the exact authored scripts and styles in an inline document. They passed four model-label selections and four actual mesh selections, owner display, source dialogs, keyboard navigation, camera presets, hover cross-highlighting and mobile navigation. All five sections fit 1280×720; 1440×900 and 1920×1080 layouts also had no page overflow. At 390×844 the page scrolls vertically without horizontal overflow. No JavaScript page errors were observed. All source STL bytes and triangle coordinates were preserved.

The live compact-page workflow separately verifies deployed file bytes and renders the public page, including the finishing-layer revision marker. Repository checks validate source integrity and CAD packaging, not electrical behavior, timing, clearance, acquisition or fabrication readiness.

Legacy original-based studies in `presentation/review/` and `presentation/app.js` are not used by the root presentation.
