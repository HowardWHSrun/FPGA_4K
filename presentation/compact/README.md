# Compact assembly presentation

**[Open the live presentation](https://howardwhsrun.github.io/FPGA_4K/)**

Active root presentation, published from the `presentation` branch. This September 22 update refines the typography and layout, adds reported workstream owners and source-grounded details, combines the connecting section with routing/LDO, and adds a separately labeled schematic KR260 downstream layer. Native CAD and `main` are unchanged.

## Presentation structure

| Section | Reported responsibility | Scope |
|---|---|---|
| Overview | Team | Complete compact headboard plus schematic downstream platform |
| ASIC carriers | Gerald | Four two-chip carriers; 1,024 channels per carrier discussed |
| Routing + LDO | Zitong | Former B + C regions treated as one workstream |
| FPGA | Howard: PCB; Jiaao: programming | Hardware draft and acquisition/aggregation work |
| KR260 / control | David: downstream / “MCU” programming | Reception, intended control path and forwarding toward PC |

Assignments come from the [team follow-up received September 18](../../docs/meetings/2026-09-18-follow-up.md). They do not claim completion or replace the separately unassigned GitHub layout reservations in [owners and open work](../../docs/team/owners-and-work.md).

Each section has a concise main panel and a **Technical notes & evidence** dialog. Reference-board dimensions, September 21 draft statistics, and unresolved requirements retain their source context. No new measurements, completion status, connector protocol or finalized BOM is inferred.

## Interactions

Click the visible board geometry, its label, the owner list or the bottom navigation to select a subsystem. The camera smoothly centers and enlarges the selected part; other parts become faint contextual outlines so the selected board is not hidden. The source geometry does not move. Reduced-motion preference disables camera and text transitions.

Drag to rotate; scroll or pinch to zoom. Use 3D/Top/Side presets and Reset view. F requests fullscreen. Arrow keys and Page Up/Down navigate; 1–5 jump; Home returns to the overview. Each section has a shareable URL hash, including `#kr260`.

## Editable files

- [slides.js](slides.js): titles, owners, facts, source-context notes and source links.
- [app.js](app.js): STL parsing, schematic downstream stage, depth-buffered selection, animated camera and controls.
- [style.css](style.css): responsive layout, typography, navigation and source dialog.
- [Root index.html](../../index.html): page structure and active assets.
- [Revision manifest](review-v2.json): source and annotation provenance for this update.

Typography uses an installed-font stack: Aptos, Inter, Segoe UI, Helvetica Neue, Arial, then sans-serif. The actual face depends on the viewer's system. No font files, external JavaScript, analytics or network dependencies are embedded. The mesh is bundled in [model-source.js](../model-source.js).

## Geometry and source authority

Supplied file: `stacked_headboard_compact_B_v1(1).stl`.

SHA-256: `1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46`.

The [raw compact STL](../../hardware/assembly/stacked_headboard_compact_B_v1.stl) is unchanged. Its lossless gzip/base64 bundle is also unchanged. The renderer parses all 650 source triangles directly, with no further shrinking, part scaling or reconstruction. The runtime diagnostic compares every source-triangle coordinate against the decoded STL. Model notes permits an exact-source STL download. Physical units remain unspecified.

B and C are displayed as one routing/LDO subsystem following Howard's September 22 instruction. This is a role/color/selection change, not a native CAD edit.

KR260 is a newly added **schematic system-stage illustration**, not manufacturer CAD, a physical headstage layer, or a relative-scale claim. “MCU” is retained as the team's downstream workstream terminology. The technical distinction—K26 SOM / Zynq UltraScale+ MPSoC—and platform-capability notes are separately attributed to the [AMD KR260 product page](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html). A 10G-capable interface is not a demonstrated recording-system data rate.

## Validation

Local Chromium interaction tests passed for all five sections, geometry preservation, camera presets, keyboard navigation and the source dialog. Desktop layouts were checked at 1280×720, 1440×900 and 1920×1080 with no horizontal or vertical overflow in the overview. A 390×844 mobile layout uses vertical scrolling with no horizontal page overflow. No JavaScript page errors were observed in these tests. Local tests used an inline copy of the exact authored files; live deployment is checked separately by the existing compact-page workflow.

The published file blobs are byte-identical to the locally tested files. Repository source-integrity and packaging checks are separate from electrical, timing, clearance or acquisition validation; no hardware validation is claimed.

Legacy original-based studies in `presentation/review/` and `presentation/app.js` are not used by this root presentation.
