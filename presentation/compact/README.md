# Compact assembly presentation

**[Open the live presentation](https://howardwhsrun.github.io/FPGA_4K/)**

The homepage opens with the system overview. Its top **Library** link opens the [separate searchable archive](../library/), where previous work and illustrations can be found by topic, date and revision.

The preserved September assembly review uses the exact supplied compact headboard, reported workstream owners and source-grounded details. The connecting section and lower routing/LDO board are one subsystem. Its dated [XC7A25T board](../fpga/current-25t.html), [three-port interposer proposal](../adapter/) and [XEM8310-on-BRK8310 receiver](../xem/) are separate sections. The adapter view combines manufacturer-derived XEM/BRK 3D geometry with a native-derived 25T placement and an R8 PCB candidate; exploded spacing and cables are illustrative. The older 50T board page is a historical review. No displayed PCB is released for fabrication.

## Sections and responsibilities

| Section | Reported responsibility | Scope |
|---|---|---|
| Overview | Team | Complete compact headboard and schematic downstream platform |
| ASIC carriers | Gerald | Four two-chip carriers; 1,024 channels per carrier discussed |
| Routing + LDO | Zitong | Former B + C regions treated as one routing/power board |
| FPGA | Howard: PCB; Jiaao: programming | Three selected XC7A25T boards; two planned active recording pairs and one reverse command pair per cable; unrouted native placement |
| XEM8310 interposer | Adapter assignment pending | Three ports using MC3 GTY banks 226, 225 and 224 at once; BRK J6 PCIe is an alternate configuration |

Assignments come from the [team follow-up received September 18](../../docs/meetings/2026-09-18-follow-up.md). They do not claim completion or replace the unassigned GitHub layout reservations in [owners and open work](../../docs/team/owners-and-work.md).

Each section has its owner, function, key facts and unresolved interface questions. **Technical notes & evidence** retains reference-board dimensions and source dates. The FPGA section links to the [selected 25T section](../fpga/current-25t.html); the [earlier 50T board review](../fpga/index.html) remains historical.

## Interactions

Click a visible board, model label, owner entry or bottom-navigation section. The camera centers and enlarges the selected part; other regions remain as faint contextual outlines. The geometry itself does not move. The bridge and LDO region share one color, selection and owner.

Drag to rotate; scroll or pinch to zoom. Use 3D/Top/Side and Reset view. F requests fullscreen. Arrow keys and Page Up/Down navigate; 1–6 jump; Home returns to the overview. Escape returns to the overview when no dialog or fullscreen session is active. Each section has a shareable URL hash, including `#adapter`.

The finishing layer removes duplicate headings, links hovered/focused labels and navigation entries visually, adds owner-aware accessible labels, announces section changes, and keeps mobile navigation centered on the selected section.

## Editable files

[slides.js](slides.js) contains owners, facts, details and source links. [app.js](app.js) contains the exact-STL renderer and camera controls. [style.css](style.css) defines the base layout. [refinements.css](refinements.css) and [interaction.js](interaction.js) apply the review-v2.1 finishing layer. [Root index.html](../../index.html) loads these scripts and hosts the overview and its top Library link. The [revision manifest](review-v2.json) records source and annotation provenance.

Typography prioritizes Inter and Aptos when installed, then platform system fonts, Segoe UI, Helvetica Neue and Arial. The face depends on the viewer's system. No fonts, analytics or external rendering libraries are bundled or downloaded.

## Geometry and source authority

Supplied file: `stacked_headboard_compact_B_v1(1).stl`.

SHA-256: `1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46`.

The [raw compact STL](../../hardware/assembly/stacked_headboard_compact_B_v1.stl) and lossless [model-source.js](../model-source.js) are unchanged. The renderer uses all 650 source triangles without extra shrinking, part scaling or reconstruction. Its diagnostic checks every source-triangle coordinate. Model notes offers an exact-source STL download. Physical units remain unspecified.

The root compact STL stage is a schematic assembly view, not a physical model of the receiver stack. The dedicated [adapter 3D viewer](../adapter/assembly.html) uses geometry derived from [Opal Kelly's XEM8310 and BRK8310 STEP models](https://www.opalkelly.com/products/models/), a native KiCad export of the selected but unrouted 25T board, and a labeled R8 interposer candidate. The separated board heights and cable curves are visual aids, not a verified mating assembly. XEM8310 is an FPGA module serving the downstream controller role rather than a conventional MCU. The earlier KR260 option remains in [dated review history](../fpga/history-2026-09-24.html).

## Validation

The original compact-review validation covered the initial five sections and supplied STL. The 29 September revision adds separate custom FPGA, adapter and XEM/BRK sections and was checked in a browser; this visual check does not establish hardware fit or operation. The supplied STL bytes and source triangle coordinates are preserved.

The live compact-page workflow separately verifies deployed file bytes and renders the public page, including the finishing-layer revision marker. Repository checks validate source integrity and CAD packaging, not electrical behavior, timing, clearance, acquisition or fabrication readiness.

Legacy original-based studies in `presentation/review/` and `presentation/app.js` are not used by the root presentation.
