# Source provenance

[Wednesday’s presentation](../presentation/meetings/2026-09-30.html) · [R12 simple connection overview](../presentation/schematic/simple.html) · [current native 3D](../presentation/adapter/assembly.html?revision=r12) · [editable R12 package and audit](../hardware/xem8310-adapter/dated/2026-09-29/r12-single-link/README.md). Current focus is one 19-contact link. All 19 contacts are mapped in a 10-sheet schematic with ERC 0; the PCB is still in progress: 10/19 contacts reach all intended copper endpoints, with 9 open connections and 11 dangling warnings. R8/R9/R10 three-port studies remain preserved. No fabrication release.

The project files are stored in this repository. Attribution and copy details are recorded here so the main documentation can focus on the system and its interfaces.

| Material | Source and representation |
|---|---|
| ASIC/interface PowerPoint | Deck supplied by Gerald; unchanged original file |
| Slide PDF, searchable text and PNG previews | Representations of the original deck; diagrams remain available in the PPTX/PDF |
| Carrier PCB-5 and Pins.xlsx | Chip-side reference files shared for the project; unchanged copies |
| LDO/routing project and connector footprints | Shared reference files; unchanged except the library-table path adaptation below |
| Overall board renders and front/back layouts | Generated directly from the included carrier and LDO/routing CAD; [rendering details](../hardware/previews/README.md). No new board design is introduced |
| Overall assembly STL and labeled preview | Original user-supplied `stacked_headboard_onebody (1).stl`, preserved unchanged as `hardware/assembly/stacked_headboard_original.stl`, plus the existing labeled preview from the September 18 review. Included at the user's explicit request; original author unverified, not attributed to Gerald. [Assembly guide](../hardware/assembly/README.md) |
| September 17 DOCX/PDF notes | Summary prepared from the recorded team meeting; not a verbatim transcript |
| September 18 follow-up | Technical summary of team messages; received date is known, individual message dates were not provided |
| FPGA_512 code | Snapshot of [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e), shared as the prior acquisition reference; [included files and packaging details](../firmware/README.md) |
| Artix-7 raw-capture engine and clock proof | New isolated development, 26 September 2026; [scope and measured tests](../firmware/artix7/2026-09-26/raw_capture/README.md). No upstream files modified; synthetic-data simulation is distinct from ASIC operation. Tool caches, compiled images and workstation paths are omitted. |

[manifest.json](manifest.json) records each imported file's origin, size and SHA-256. Origins identify source revisions or archive labels; they are not paths required on a collaborator's computer.

The LDO library table uses `${KIPRJMOD}/LDO_Board.pretty` in place of its original workstation path. `source_sha256` retains the original hash; the circuit files are unchanged. Included upstream program files retain their original bytes and notices. Upstream repository metadata and local caches are not part of the source copy.

The collection now also includes the [FPGA working draft](../hardware/fpga-board/README.md), imported at the user's request for team development. Its [baseline and snapshot evidence](fpga-draft-2026-09-21/README.md) distinguish the editable design from historical sources. Native CAD and local libraries were copied unchanged; Git tracks later edits. The immutable manifest covers the import record and selected evidence, not the evolving CAD files. Private chat/audio, unrelated personal material, experimental generators, rejected candidates, caches and hidden histories remain outside the shared package.

The photograph in the [hardware overview](../hardware/overview.md) is the complete second slide of the included interface deck, rendered from its PDF. It shows a single-chip assembly; it is not labelled as the two-chip PCB-5 CAD revision. The current functional diagram proposes three separate 25T boards, three custom µHDMI cables, an R7 logical / R10 HDI interposer study and XEM8310; their upstream ASIC/carrier partition is unresolved. The dated meeting record retains its earlier KR260 choice. The reference-board CAD views and separately supplied overall arrangement STL are distinct sources; their inclusion does not establish that the reference boards mechanically mate.

Original ownership and applicable terms are retained. No repository-wide license was found in the pinned FPGA_512 tree; this collection adds no license grant to that code or the imported lab material.

## September 23 meeting materials

Howard supplied the [notes](meetings/2026-09-23-notes.txt) and [system-view screenshot](meetings/2026-09-23-system-view.png) on September 23, 2026. Both are preserved byte for byte; the screenshot’s original author is unknown. The [meeting page](../presentation/meetings/2026-09-23.html) is a derived summary. Discussion targets and reported activity are not approved specifications or test results.

## September 24 preparation

[FPGA meeting choices PDF](meetings/2026-09-24-FPGA_4K_Meeting_Choices.pdf), credited to Howard Wang and dated September 23, supplied for the September 24 meeting. Unchanged original including embedded links. [Online summary](../presentation/meetings/2026-09-24.html) distinguishes proposals from decisions and dated supplier figures from current stock.

## September 26 100T review snapshot

The [earlier minimal-core checkpoint](../hardware/fpga-100t-review/README.md) is a curated, explicitly unqualified copy of the locally developed FPGA100T minimal core. [Its manifest](../hardware/fpga-100t-review/manifest.json) records the original and packaged hashes. Native KiCad and library files retain exact source bytes; only workstation paths in selected report representations are made portable. The ZIP includes the complete project hierarchy, local libraries, exported schematic PDF, PCB views, logical 117-signal CSV and selected validation evidence. Private messages/audio, caches, earlier rejected candidates and routing experiments are excluded. [Package notes](../hardware/fpga-100t-review/README.md) retain attribution and limits.

The current full-board scope includes all 117 ASIC signals and the XEM8310 link. Core-only dimensions and passing geometric checks do not establish fabrication readiness. The existing 200T/50T page and its source material are preserved as history.

The [separate interface-study package](../hardware/fpga-interface-study/README.md) preserves selected local engineering reports and placement views. Its [manifest](../hardware/fpga-interface-study/manifest.json) distinguishes original bytes from Markdown link-only adaptations. It is not the current core copper revision or a full-system release.

## September 26 smaller placement and pin report

The [dated 33 × 36 mm study](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/START_HERE.md) is newly generated engineering work from the preserved 37.5 × 36 mm placement. Its 66-file import manifest records byte correspondence and evidence-path normalization. Native CAD and local footprint library bytes are unchanged in the portable publication copy; workstation-specific automation scripts and editor state are omitted from its 49-file ZIP. The 31-page PDF and editable LaTeX source cover all 128 components and 758 electrical endpoints. These remain an unrouted, unqualified proposal; earlier source files and original slides are unchanged.

### Historical 33 × 36 mm routing — 26 September 2026

The [earlier review](../presentation/fpga/micro-hdmi.html) and [dated routing package](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/README.md) publish one 130-part board with matching 21-sheet schematic, corrected rails, native pin/component ledgers and unsuppressed checks. The [import manifest](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/manifest.json) binds exact CAD/library bytes to the frozen source. Experiments and failed candidate boards are excluded. Earlier source snapshots, ASIC slides and placement reports remain unchanged; routing progress is not a fabrication or functional qualification.

## 26 September: component necessity and pin labels

[The dated audit](../hardware/fpga-interface-study/dated/2026-09-26/presentation-and-pin-labels/README.md) derives all 130 component explanations and 762 endpoint labels from the frozen 33 × 36 mm native snapshot. Manufacturer requirements are linked individually in the audit, including AMD UG475 for U1.L9/L10 ground ties and TI TPS62135 for the FB2 review. The interactive maps use actual native pad centers viewed from the front; they are not mating-face drawings. Native CAD and earlier PDF bytes are unchanged. The new audit explicitly corrects the interpretation of six saved NC markers and documents the R12 removal candidate.

## 26 September learning and professor report

The [33-page learning report](../hardware/fpga-interface-study/dated/2026-09-26/learning-report/README.md) is a new, self-contained LaTeX explanation of the frozen 130-part, 33 × 36 mm board. It combines native-derived component/pin ledgers with the later manufacturer-grounded NC review, visual maps and presentation notes. All 762 numbered endpoints are covered. Native CAD and all earlier reports retain their original bytes; this document records corrections and unfinished work rather than implementing them. The dated manifest records the PDF, source and coverage hashes.

## 27 September USB-C revision

The [USB-C revision](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/README.md) preserves the 100T and ASIC assignment while replacing the cable interface and adding its supporting circuitry. Native CAD and local libraries are exact copies of the frozen working revision. Reports bind to the native hash; portable report metadata omits local workstation prefixes, with source and published hashes retained. Views and the schematic PDF are native KiCad exports.

The full newly supplied private discussion, downloaded manufacturer documents, intermediate placements and rejected routing candidates are excluded. The earlier micro-HDMI reports remain separate. Zero native errors, if reported, do not demonstrate firmware, powered operation, cable performance or manufacturing acceptance. No order has been placed.

The USB-C project carries a [library attribution note](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/libraries/README.md) and the unchanged upstream KiCad library license with its bundled library subset. Manufacturer references remain linked to their original publishers.

## 28 September 50T micro-HDMI board and contact proposal

The website's [historical 50T parts list](../presentation/fpga/index.html#parts) derives from the 28 September unrouted native PCB and is copied as a [48-line CSV](engineering/2026-09-28/Micro_HDMI_50T_Grouped_Purchasing_Draft.csv) covering 158 fitted parts. The [preserved 100T checkpoint](../presentation/fpga/micro-hdmi.html#purchase-list) has a separate [36-line CSV](engineering/2026-09-28/Micro_HDMI_100T_Grouped_Purchasing_Draft.csv) covering 125 placed parts. Both are per-board sourcing drafts, not a 25T BOM, full-system BOM or order approval. Their grouping and exclusions are described in the [dated engineering notes](engineering/2026-09-28/README.md).

The [R1, R2 and R3 contact CSVs with provenance](engineering/2026-09-28/README.md) preserve Howard's dated planning maps for the unrouted XC7A50T-CSG325 review board. R3 records his working three-recording-TX/one-control-RX allocation and proposed 5 V at J4.19 after the [meeting raised those options and questioned the inherited 12 V label](../presentation/meetings/2026-09-28.html#interfaces). The meeting did not approve a final pinout or supply voltage. The [website diagram](../presentation/fpga/micro-hdmi-19.html) displays R3 and places an independently drawn connector view beside links to the original [Molex 46765 sales drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf), which remains hosted by Molex. Native 50T CAD still names J4.19 `LINK_12V`, and the proposal establishes neither data-lane wiring, a qualified 5 V power path nor standard HDMI compatibility.

## 29 September XEM8310 receiver adapter snapshots

The current [R7 three-port schematic and portable KiCad ZIP](../hardware/xem8310-adapter/dated/2026-09-29/r7-three-port/README.md) map three µHDMI cables to XEM MC3 GTY banks 226, 225 and 224 while isolating corresponding lower BRK GTY contacts. The [selected 25T section](../presentation/fpga/current-25t.html) uses a native-derived unrouted PCB preview. The [R8 native interposer PCB](../hardware/xem8310-adapter/dated/2026-09-29/r8-partial-pcb/README.md) is a partial routing study with 119 unconnected items and rule-dependent DRC findings; its portable project-only ZIP, placement image and 3D export are linked on the [adapter page](../presentation/adapter/). BRK J6 PCIe is an alternate future configuration, not concurrent with the three links. The [R4 clear one-port diagram](../hardware/xem8310-adapter/dated/2026-09-29/r4-clean-diagram/README.md), [R3 detailed one-port study](../hardware/xem8310-adapter/dated/2026-09-29/r3-interposer-candidate/README.md) and [R2 direct-XEM KiCad draft](../hardware/xem8310-adapter/dated/2026-09-29/r2-12v/README.md) remain historical. Hashes and transformations of preserved files are in [manifest.json](manifest.json).

The [adapter 3D page](../presentation/adapter/) loads browser meshes derived from Opal Kelly's [official XEM8310 and BRK8310 STEP models](https://www.opalkelly.com/products/models/), a native KiCad export of the selected unrouted 25T board, and separate native KiCad exports of R9, preserved R8 and the optional R10 HDI feasibility interposer. The original Opal Kelly STEP archives remain outside this public repository. Exploded spacing, cable paths and copied 25T board positions are illustrative. The original mesh XY axes are reconciled in [viewer provenance](../presentation/adapter/assets/provenance.json); no interposer mating/clearance, cable power, PCIe integrity, clocking or complete link is qualified.

## Wednesday review preparation - September 30, 2026

The [meeting presentation](../presentation/meetings/2026-09-30.html) uses five unchanged September 29 evidence files in `sources/meetings/2026-09-30-review/`: the 25T interface audit, cable allocation, 86-check endpoint report, manufacturer ball migration table and dedicated GTP/GTY recheck. Their original local paths and hashes are in the manifest. Markdown audit sources use `.txt` extensions; original relative links remain context. Functional 117-signal grouping is derived from the fresh native 25T netlist and retained bank assignments. No private audio or chat was imported.

Existing visuals are reused through the [Wednesday visual library](../presentation/meetings/2026-09-30-visuals.html). Thirteen additional unchanged visual files are copied from dated local delivery folders into `presentation/meetings/assets/2026-09-30/` and hashed in the manifest. Existing repository figures stay at their original paths; the visual index records all 99 gallery paths and hashes.


### R10 all-contact and power review

[57-contact copper audit](meetings/2026-09-30-review/R10_All_Contacts_Audit.txt) · [Contact rows CSV](meetings/2026-09-30-review/R10_All_Contacts_Audit.csv) · [Power and shield review](meetings/2026-09-30-review/Power_Shield_Review.txt). Unchanged 29 September read-only reports against the preserved R10 PCB: eight numbered contacts per port have copper routes, totaling 24 of 57. The remaining 33 numbered contacts and all three shield bonds are unfinished. The Wednesday presentation uses plain Reserved labels for 9/11 while original native net names remain preserved in the evidence. The single-input 12 V distribution is a proposed circuit path; branch protection, source/return budget and power routing are not complete.

## R12 single-link study and Wednesday presentation

The current work narrows the earlier three-port proposal to one 19-contact link on XEM bank 226. [R12 package](../hardware/xem8310-adapter/dated/2026-09-29/r12-single-link/README.md) contains exact native CAD and project-relative library copies, 10 freshly exported native schematic sheets, PDF, normalized audit reports and a downloadable complete project. The [package manifest](../hardware/xem8310-adapter/dated/2026-09-29/r12-single-link/manifest.json) binds source and public bytes. Installed KiCad standard footprints are copied unchanged with their library license; custom stack footprints retain the source-derived study status.

The current browser GLB comes from the saved R12 PCB; [viewer provenance](../presentation/adapter/assets/provenance.json) records its source/export hashes and checked centering transform. Official XEM/BRK and the selected 25T assets remain unchanged. Schematic contacts are 19/19 with ERC 0; current copper completion is 10/19 to all required endpoints, 9 opens, 11 dangling warnings, 0 physical errors and 0 parity issues under provisional study rules. Ground and four JTAG nets remain incomplete, including the eFuse ground. These exports establish neither powered operation nor fabrication acceptance.

[Wednesday's presentation](../presentation/meetings/2026-09-30.html) now has four slides: 117 ASIC interface positions,19 custom cable contacts, Zitong’s proposed components and the full three-FPGA + XEM + BRK system plan. The final slide uses the preserved R10 three-port architecture view to match the requested assembly framing, while explicitly linking the current R12 one-link layout and saying one link is being completed first. The 117 groups are64 data+24 returned timing+9 shared+4 recording clocks+8 stimulation programming+4 nonstim programming+4 SPI clocks, totaling 116 FPGA assignments plus external analog AC_IN. The second slide links the implemented 19-contact schematic. Existing 99-figure history remains in its separate gallery; unnecessary presentation diagrams were removed. Private history, routing experiments and editor state remain outside the public package.

## Simplified R12 schematic explanation · 29 September

The [simple connection overview](../presentation/schematic/simple.html) and its three authored vector diagrams derive from the current R12 native contact map, translated-JTAG/source-selector circuit and protected-power schematic. They omit component values and individual pass-through contacts for readability. They distinguish target-derived VTREF, the recovery-probe default, the planned XEM fabric-GPIO bridge, and the shared external 12 V supply with a separate eFuse branch. Reserved contacts 9/11 have no future-use explanation.

The overview represents schematic topology, not completed copper or a hardware measurement. Native CAD, original PDFs/SVG sheets, pin manifests and the previous 99-figure library are unchanged. Source/transformation hashes are recorded in the manifest; this change adds no fabrication release.

## 29 September · slide 2 connector contact diagram

The [R6 diagram](../presentation/meetings/assets/2026-09-30/R6_Micro_HDMI_Contacts.svg) is an authored, enlarged explanatory redraw of the board receptacle mating face. Contact orientation follows [Molex SD-46765-001, sheet 2](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf#page=2): upper row 19 through 1, lower row 18 through 2, descending by two and staggered. It is not a dimensional or fabrication drawing. Colour assignments derive from [R12 J201 destinations](../hardware/xem8310-adapter/dated/2026-09-29/r12-single-link/validation/R12_All_19_Contact_Destinations.json); contacts 9/11 say only Reserved. Native circuits and previous board 3D assets retain their bytes and status.

## 29 September · Zitong’s component proposal

The supplied team proposal is preserved in [the source note](meetings/2026-09-30-review/Zitong_Component_Proposal.txt). The new slide condenses its six component groups and clearly marks review pending. The [part review](meetings/2026-09-30-review/Component_Proposal_Review.md) links primary AMD, Abracon, Macronix and SiTime sources; it identifies HCSL versus LVDS, distinguishes jitter metrics, and makes flash level translation conditional on the configuration-bank plan. No CAD or BOM part selection is silently replaced.

## 2 October meeting and connector confirmation

[Public meeting notes](meetings/2026-10-02-review/Meeting_Notes.md) derive from Howard's supplied conversation with Zitong and Gerald and his subsequent confirmation of J1/J19. This is a concise authored summary, not a verbatim transcript. The full private conversation is not imported. The [connector illustration](../presentation/meetings/assets/2026-10-02/LDO_connector_identification.png) derives from the native board coordinates in the newly shared LDO ZIP; all three connectors are on B.Cu and J19 is electrically netless in that source. Its roles are confirmed separately from terminal mating verification. No native CAD or existing source evidence is replaced. Official Opal Kelly power/connector/specification sources are linked in the meeting page; carrier-power requirements are technical audit findings, not a recorded hardware test.

## Small cabled backup preview · 2 October 2026

The [C2 review](../presentation/ldo-backup/README.md) implements the current cabled-XEM scope as a geometric illustration. The shared SpikeGadgets LLC Rev.2.5 photo inventory identifies the size reference but supplies no verified PCB dimensions. The provisional 18 × 25 mm rectangle is proposed around the audited October 2 Gerald LDO J1/J19 centres; it is not a measured SpikeGadgets outline. Source native PCB SHA-256 and the registration transform are recorded in [provenance](../presentation/ldo-backup/provenance.json). The older LDO native snapshot in this repository remains unchanged and is not relabelled as the October 2 revision.

The browser loads native KiCad meshes for the separate C2 mechanical study and the October 2 Gerald LDO source, including source copper and available component models. Missing connector bodies, selected cable hardware and all C2 electrical routes are omitted. The cable and exploded gap are illustrative. C2 keeps only the two socket footprints with 74 exact source pad geometries and cleared net assignments. Its mechanical DRC is 0 errors/0 warnings with no ignored categories or exclusions; zero netless airwires does not prove electrical completion, and ERC/parity are inapplicable. Exact local footprints are packaged in the local C2 review project; native CAD itself is not imported into this web update. C1/R4 direct-mate studies remain historical and unselected; their checks do not validate C2.

## Current interactive reviews · 3–4 October 2026

The overview now links the [35T R37 FPGA board](../presentation/fpga/current-35t.html), [E5 LDO routing adapter](../presentation/ldo-backup/current-e5.html) and [XEM8305 A1R2 carrier](../presentation/xem/current-a1r2.html); the [V6 bonding fixture](../presentation/library/bonding-fixture.html) is included in the [searchable Library](../presentation/library/?q=bonding). The approved weekend progress is preserved. Older 25T, C2, E3 and XEM8310 materials retain their dated scope.

The requested interactive visuals publish derived GLB viewer assets and four dated review PNGs only. [Asset notes and credits](../presentation/reviews/README.md) and [geometry provenance](../presentation/reviews/provenance.json) record source revisions, transformations, hashes and omissions. Native CAD, schematic PDFs, STL/3MF originals and private source folders for these revisions remain outside the public repository. Mechanical previews and reported DRC/connectivity checks do not establish qualified power, timing, cable fit, fabrication or bonding operation.

## Current FPGA R39 update · 5 October 2026

[R39 review](../presentation/fpga/current-35t.html) publishes current native renders, copper views and a separately prepared [complete KiCad project](../presentation/downloads/). The project is a research revision with partial routing; 1,413 connections await copper. The generic narrow-pad diagnosis was reconciled with exact supplier/factory-library evidence, retaining accurate TI/Hirose patterns. Physical DRC, ERC and parity pass under the delivered settings; ignored checks are listed in the public summary. The issued factory construction, full routing, FPGA timing and assembled qualification remain incomplete.

Native CAD/library/model files preserve exact R39 source bytes. The public ZIP contains the hierarchy, rules, libraries, 34 known model files and ownership/KiCad notices. All model hashes match the earlier R37 package provenance. Supplier reference PDF/HTML collections, internal engineering scripts/notes, private correspondence and machine paths are excluded. Existing R37 views remain a dated review; the lower mating template is not added to the R39 headboard model. No new manufacturer acceptance or model-fit claim is made.

## Direct XEM8305 R2 · 5 October 2026

The [preserved direct R2 review](../presentation/xem/direct-r2-2026-10-05.html) publishes matching native top/bottom vectors, a carrier-only 3D derivative, all four schematic pages, a complete native project and sanitized contact/check receipts. The frozen PCB hash is recorded in the [public summary](../presentation/downloads/files/2026-10-05/XEM8305_Direct_R2_Check_Summary.json). All 260 connector contacts are accounted for; MC3 has 28 DGND and 52 explicitly reserved no-connects. Native checks on a fresh public extraction report zero ERC, DRC, opens and parity with no ignored/excluded checks.

The public native derivative omits embedded Samtec ERF6 model payloads and documents relative external model references; all electrical, pad, placement, rule, schematic and copper semantics are retained. The 3D model uses actual native board/pad/surface copper and five original nominal socket boxes, omitting manufacturer bodies and the assembled stack. Vendor datasheets, raw reference collections, private reports, internal scripts and local machine paths are not imported. Exact fit, ASIC/FPGA timing, power/load/thermal, factory DFM, firmware and operation remain unqualified. R39 and earlier dated sources retain their original bytes.

## Direct XEM8305 R3 · 5 October 2026

The [current R3 website review](../presentation/xem/direct-all-connectors-2026-10-05.html) publishes the user-requested eight-sheet schematic, complete editable KiCad derivative, native board vectors, carrier 3D, exact checked Gerber/drill ZIP and combined download. Source PCB SHA256 is 6e1cde48c3a146e691005f6e76434e98ce9298ac09ed0b13a128e490fa048e78. Full public extracted native checks pass; 144 CAM and 766 aperture checks are bound to the delivered Gerber ZIP.

The native derivative removes embedded Samtec model payloads only, documents external/standard KiCad model dependencies and includes ownership/KiCad notices. The public 3D uses exact native board/pad/outer-copper geometry plus 63 project-authored nominal component envelopes, with no supplied manufacturer model payload or assembled-stack geometry. The PDF uses a documented print-only layout adjustment; all 67 components and 296 nets match the source. Private machine paths, correspondence, vendor datasheet collections and internal tools are excluded.

The carrier is a prototype package. Factory, sourcing/placement/process and first-board power/fit/ASIC acceptance remain open. Nominal order thickness is 1.6 mm; CAD geometry does not measure an actual manufactured board. The separate original LDO, earlier R2 and 35T R39 remain separate unchanged engineering records.
