# Project files and documents

- [Current XEM8305 / LDO carrier R11 · 9 October](../presentation/xem/carrier-r11-2026-10-09.html): draggable routing and rotatable 3D, six layers, 53 × 83 mm and all 75 fitted component bodies. The overview carrier selection opens this revision. Schematic and checks are included; EEPROM programming and hardware qualification remain open.

- [Earlier XEM8305 / LDO carrier C4.8-R5 files · 9 October](../presentation/downloads/#carrier-c4-8-r5): editable KiCad, four-layer Gerbers and drills, routing views and check summary. The 53 × 83 mm routing review has zero saved-board DRC, opens and parity findings; inherited schematic ERC cleanup and qualification remain open. Not a fabrication release.

- [7 October weekly FPGA PCB and LDO presentation](../presentation/meetings/2026-10-07.html): eight-slide weekly update, Zitong’s complete list, interactive native schematics/layouts/3D and downloadable projects.

[Current R39 project download](../presentation/downloads/#fpga35t-r39) includes the complete native hierarchy, rules, libraries and component models. [R37 is preserved separately](../presentation/fpga/review-r37-2026-10-04.html). R39 has applied pre-routing corrections and 1,413 connections awaiting copper; issued HDI construction and qualification remain incomplete.

## Current reviews · 5 October 2026

[XEM8305 direct carrier R3 · 5 October](../presentation/xem/direct-all-connectors-2026-10-05.html) provides [all files, KiCad, Gerbers and the eight-sheet schematic](../presentation/downloads/#xem8305-direct-r3), scalable native views and rotatable carrier 3D. Local CAD/CAM checks pass. Factory, assembly and first-board qualification remain open. [R2](../presentation/xem/direct-r2-2026-10-05.html) retains its historical files.

[Search the project Library](../presentation/library/) · [35T FPGA PCB R39](../presentation/fpga/current-35t.html) · [LDO routing adapter E5](../presentation/ldo-backup/current-e5.html) · [XEM8305 carrier A1R2](../presentation/xem/current-a1r2.html) · [bonding fixture V6](../presentation/library/bonding-fixture.html). These dated reviews record weekend progress and remaining checks. The 35T research board, earlier paused routing work and historical 25T placement retain separate status. The A1R2 assembly contains adapter E3; the E5 separate-power-header adapter and XEM8310 carrier power path are separate revisions.

## Small cabled routing board · 2 October

[Small-board 3D](../presentation/ldo-backup/?view=routing) · [connection to the current Gerald LDO](../presentation/ldo-backup/?view=connection) · [review notes](../presentation/ldo-backup/README.md). XEM8305 connects through a cable. The 18 × 25 mm geometric preview is a provisional socket envelope, not a measured SpikeGadgets outline. Cable connector/pinout, exact dimensions and electrical routing remain open. Original CAD is preserved.

## Shared questions and answers

[Open questions and answers](https://fpga-team-questions.hwr.chatgpt.site) directly from the overview or meetings header. The shared decision register opens to resolved items; filters also expose pending questions and the full history. Teammates enter their names, raise questions, reply in the same thread and record outcomes. Questions, responses and status history are saved on the board. [Workflow guidance](../presentation/questions/index.html) remains available. [Confirmed decisions · 30 September 2026](team/current-decisions-2026-09-30.md) preserves 12 owner-confirmed choices and their remaining implementation or qualification limits.

[Wednesday’s presentation](../presentation/meetings/2026-09-30.html) · [R12 simple connection overview](../presentation/schematic/simple.html) · [current native 3D](../presentation/adapter/assembly.html?revision=r12) · [editable R12 package and audit](../hardware/xem8310-adapter/dated/2026-09-29/r12-single-link/README.md). Current focus is one 19-contact link. All 19 contacts are mapped in a 10-sheet schematic with ERC 0; the PCB is still in progress: 10/19 contacts reach all intended copper endpoints, with 9 open connections and 11 dangling warnings. R8/R9/R10 three-port studies remain preserved. No fabrication release.

## Preserved three-port architecture · 29 September

[Current three-port adapter overview, pin map and 3D](../presentation/adapter/) · [R7 five-page schematic PDF](../hardware/xem8310-adapter/dated/2026-09-29/r7-three-port/BRK8310_Three_Port_Adapter_R7_Candidate.pdf) · [complete R7 KiCad project](../hardware/xem8310-adapter/dated/2026-09-29/r7-three-port/BRK8310_Three_Port_Adapter_R7_KiCad_Project.zip) · [dated 25T board section](../presentation/fpga/current-25t.html). The XEM8310 currently plugs directly into BRK8310. The proposed interposer would sit between them and connect three custom FPGA cables to XEM MC3 GTY banks 226, 225 and 224 at the same time. Matching BRK GTY contacts are isolated in R7; BRK J6 PCIe cannot operate concurrently and remains an alternate future mode. The [R9 native PCB study and editable ZIP](../hardware/xem8310-adapter/dated/2026-09-29/r9-six-pair/README.md) physically route TX0 and reserved TX2 on each cable while preserving all 160 MC1/MC2 pass-throughs. Its trial-rule physical DRC is clear, but 109 items, including TX1 and control on every cable, remain open; no complete link exists. The [earlier R8 one-pair PCB study](../hardware/xem8310-adapter/dated/2026-09-29/r8-partial-pcb/README.md) is retained separately. The protected 12 V branches, reference clock, connector stack, high-speed paths and USB-to-custom-FPGA JTAG bridge remain unqualified. The browser view uses [Opal Kelly-derived XEM/BRK meshes](https://www.opalkelly.com/products/models/) and native-derived but unrouted 25T placement, while the interposer shape is labeled as a candidate. [Earlier R3/R4 one-port studies](../hardware/xem8310-adapter/dated/2026-09-29/r3-interposer-candidate/README.md) and [R2 direct-XEM route](../hardware/xem8310-adapter/dated/2026-09-29/r2-12v/README.md) remain history.

## 28 September · PCB 3D review

[Inspect the dated 25T placement in 3D](../presentation/fpga/current-25t.html) · [browser geometry provenance](../presentation/adapter/assets/provenance.json). The 25T board uses the inherited 36 × 38 mm unrouted placement, with its DF40 interface under redesign. [Rotate the earlier 50T and both 100T revisions](../presentation/fpga/3d/index.html) · [historical geometry notes](../presentation/fpga/3d/README.md). Missing package bodies are identified as simplified.

<!-- CURRENT_FPGA_LEARNING_REPORT -->
**Preserved micro-HDMI learning report:** [PDF · 45 pages](../hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.pdf) · [editable LaTeX](../hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.tex). Explains the earlier 125-component / 752-endpoint checkpoint. It does not cover the USB-C additions.
<!-- /CURRENT_FPGA_LEARNING_REPORT -->


The original files are stored in this repository. Use the editable formats for further work and the PDFs or searchable notes for a quick review.

## Team workflow and editable design

**Historical 28 September 50T connector proposal, R3:** [interactive view of all 19 micro-HDMI contacts](../presentation/fpga/micro-hdmi-19.html) · [three-TX/one-RX, 5 V candidate contact CSV](../sources/engineering/2026-09-28/J4_Proposed_19_Contacts_R3_3TX_1RX_5V.csv) · [provenance and R1/R2 history](../sources/engineering/2026-09-28/README.md). This records Howard's earlier allocation and 5 V candidate. The 29 September interposer plan above selects 12 V on contact 19; the native unrouted 50T CAD still labels J4.19 `LINK_12V`, while no protected receiver-side cable source has been designed.

<!-- CURRENT_FPGA_ROUTING -->
- [Historical 25T custom FPGA section](../presentation/fpga/current-25t.html): native-derived 3D placement and the dated three-board cable allocation; unrouted and not a manufacturing release. The full 25T native project is in the 29 September local dated handoff and is not yet copied into this public presentation branch.
- [Historical unrouted 50T micro-HDMI review](../presentation/fpga/index.html): 158 fitted parts, [48-line historical purchasing draft](../sources/engineering/2026-09-28/Micro_HDMI_50T_Grouped_Purchasing_Draft.csv), [complete historical KiCad project](../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/FPGA50T_Two_60_Compact_Review_2026-09-28.zip) and 625 native ratsnest links. Its parts list is not a 25T order list.
- [Preserved routed 100T micro-HDMI checkpoint](../presentation/fpga/micro-hdmi.html): [separate 125-part purchasing draft](../sources/engineering/2026-09-28/Micro_HDMI_100T_Grouped_Purchasing_Draft.csv) and its own source files.
- [Separate USB-C development revision](../presentation/fpga/usb-c.html): [complete KiCad project](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/FPGA100T_USB_C_Development.zip), [native audit](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_Native_Audit.json) and [every pin](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_All_Pin_Connections.csv). Its unfinished routing and receiver remain separate from the micro-HDMI checkpoint.
<!-- /CURRENT_FPGA_ROUTING -->

- [Team start page](team/README.md), [contribution guide](../CONTRIBUTING.md), [owners and open work](team/owners-and-work.md).
- [Earlier native checkpoints](../presentation/fpga/micro-hdmi.html#design-history) and [fourth-review uncertainty list](../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) remain dated reference evidence.
- [September 21 FPGA import](../hardware/fpga-board/README.md): preserved earlier design and local libraries; not the current device/interface baseline.
- [Initial FPGA import evidence](../sources/fpga-draft-2026-09-21/README.md): provenance, original hashes and dated check reports.

## ASIC/interface slides

- [Original 28-slide PowerPoint](../sources/slides/Chip_FPGA_Interface.pptx)
- [Existing PDF representation](../sources/slides/Chip_FPGA_Interface.pdf)
- [Searchable slide text](slides/asic-interface-text.md) and [selected slide previews](../sources/slides/previews/)

Use the original slide diagrams for timing relationships that text extraction cannot preserve. The PDF, extracted text and PNGs are representations of the same deck.

## Team meeting records

- September 17: [searchable notes](meetings/2026-09-17.md), [Word](../sources/meetings/2026-09-17-notes.docx), [PDF](../sources/meetings/2026-09-17-notes.pdf).
- [Team follow-up received September 18](meetings/2026-09-18-follow-up.md): workstream assignments, development sequence, voltage/clock clarification and unresolved behavior.
- [September 21 FPGA digest](../presentation/fpga/meeting-2026-09-21.md): presentation-focused meeting summary, not an approved specification.
- [September 22 FPGA direction](../presentation/fpga/direction-2026-09-22.md): Howard and Zitong's current work, CP SOM One reference, smaller-package evaluation and proposed prototyping approach.

These records summarize team discussions. The September 17 [questions for the next review](meetings/2026-09-17.md#questions-to-resolve-in-the-next-review) retain their dated context; they are not a current approved specification.

## Supplied hardware references

The earlier [overall 3D assembly](../hardware/assembly/README.md) includes the original [STL](../hardware/assembly/stacked_headboard_original.stl) and its labeled preview, showing the ASIC-carrier stack, routing section and FPGA-board arrangement. Model dimensions are provisional; source authorship is unverified.

The **[visual hardware overview](../hardware/overview.md)** brings together the system diagram, original assembly photograph, overall board renders and front/back layouts. [Downloadable PNG/SVG views](../hardware/previews/README.md) accompany the editable originals below.

| Reference | Original files | Opening notes |
|---|---|---|
| ASIC carrier PCB-5 | [KiCad project](../hardware/references/asic-carrier/PCB.kicad_pro), [schematic](../hardware/references/asic-carrier/PCB.kicad_sch), [PCB](../hardware/references/asic-carrier/PCB.kicad_pcb), [pin spreadsheet](../hardware/references/asic-carrier/Pins.xlsx) | [Carrier notes](../hardware/README.md#asic-carrier-pcb-5) |
| Older LDO/routing design | [KiCad project](../hardware/references/ldo-routing/PCB.kicad_pro), [schematic](../hardware/references/ldo-routing/PCB.kicad_sch), [PCB](../hardware/references/ldo-routing/PCB.kicad_pcb), [footprint library](../hardware/references/ldo-routing/LDO_Board.pretty/) | [LDO/routing notes](../hardware/README.md#ldorouting-reference) |

These are supplied examples. Their presence does not establish final mating compatibility, an approved new-board BOM or fabrication readiness.

## Previous acquisition code

- [Included FPGA_512 source and revision](../firmware/README.md)
- [26 September Artix-7 raw-capture engine and tests](../firmware/artix7/2026-09-26/raw_capture/README.md): eight falling-edge buffers; simulation and XC7 synthesis verified; startup and host transport remain separate.
- [Eight-clock FPGA implementation proof](../firmware/artix7/2026-09-26/clock_pin_proof/README.md): development source for Vivado placement review; no hardware bitstream.
- [Original project README](../firmware/FPGA_512/README.md)
- [FPGA top-level Verilog](../firmware/FPGA_512/fpga/top.v) and [FT600 host test in C](../firmware/FPGA_512/ft600_test/test_d3xx.c)
- [Original-program and run guide](software.md)
- [Upstream repository register](../references/README.md)

The source files are included at a pinned upstream revision for repeatable reading and use. This is the earlier ECP5/FT600 project; it does not establish compatibility with the proposed Artix-7 path or complete 4K operation. The separately labeled FPGA working draft is now included for team development; it does not change the status of this historical firmware.

[Source provenance and checksums](../sources/README.md) describe what is original, what is a faithful representation and the one library-path adaptation.

## Assembly-first presentation

[Open the browser presentation](../index.html) · [Presentation guide](../presentation/compact/README.md) · [Model provenance](../presentation/compact/manifest.json).

The active root presentation uses the compact B v1 STL supplied by Howard on September 22, with unchanged geometry. Older original-based visualization studies remain separate and are not used by the root page. This is not a fabrication release.

## HTML presentation

[Open the presentation](https://howardwhsrun.github.io/FPGA_4K/) · [Editing guide](../presentation/compact/README.md) · [Supplied compact STL](../hardware/assembly/stacked_headboard_compact_B_v1.stl).

The presentation branch uses the compact B v1 assembly supplied on September 22. The original STL is preserved separately.

## Earlier micro-HDMI teaching material

[Component explanations](../presentation/fpga/micro-hdmi.html#architecture) · [every labeled pin](../presentation/fpga/pins/) · [earlier presenter notes](../presentation/fpga/data/Presenter_Notes.md) · [dated audit](../hardware/fpga-interface-study/dated/2026-09-26/presentation-and-pin-labels/README.md). 116 candidate digital ASIC nets are assigned, with one separate external analog contact; the six former NC pins are assigned GND. These earlier pin labels report actual native nets and separate copper status. The dated original audit remains historical.

[Preserved micro-HDMI engineering review](../presentation/fpga/micro-hdmi.html) · [Preserved native board](../presentation/fpga/viewer/index.html?board=compact-routed) · [Historical September 26 KiCad ZIP](../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/FPGA100T_33x36_Routing.zip) · [21-sheet schematic PDF](../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/output/FPGA100T_33x36_Routing_Schematic.pdf) · [Routing audit](../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/reports/Routing_Review.md) · [Refresh guide](../presentation/fpga/README.md).

[Learning and professor report · 33-page PDF](../hardware/fpga-interface-study/dated/2026-09-26/learning-report/FPGA100T_Learning_And_Professor_Review.pdf) · [Editable LaTeX and source ledgers](../hardware/fpga-interface-study/dated/2026-09-26/learning-report/FPGA100T_Learning_Report_Source.zip) · [Report provenance](../hardware/fpga-interface-study/dated/2026-09-26/learning-report/README.md). Historical visual explanations, professor questions and a 130-component / 762-endpoint reference explain the previous snapshot and its then-required NC corrections. They do not report current routing. The [earlier 26-page report](../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) remains historical evidence.

The linked September 26 material describes earlier 33 × 36 mm micro-HDMI work. Its pin tables, open-copper counts and proposed receiver sequence are historical. For the USB-C development circuit, its own routing counts and required receiver adapter, use the [USB-C review](../presentation/fpga/usb-c.html) and [dated USB-C package](../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/README.md). Neither connector version is a manufacturing release.

[Gerald's complete slide review](../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md) documents tutorial framing and conflicting timing/channel labels. The [fourth-review uncertainty register](../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) remains dated evidence; current integration observations are stated on the current page.

[Earlier design checkpoints](../presentation/fpga/micro-hdmi.html#design-history) preserve the 40 × 36 mm core, separate rail revision, mezzanine fit, and smaller placements. Their original native files, PDFs and hashes remain historical references. [Third-pass native checks](../hardware/fpga-interface-study/Triple_Check_Review.md) apply only to their recorded hashes. [The eight-slide 200T / 50T review](../presentation/fpga/history-2026-09-24.html) also remains history; earlier KR260 and 132-signal proposals do not supersede the 100T / 117 / XEM8310 direction.

## September 23 meeting

[Meeting page and actions](../presentation/meetings/2026-09-23.html) · [Unchanged notes](../sources/meetings/2026-09-23-notes.txt) · [Original diagram](../sources/meetings/2026-09-23-system-view.png). Includes current priorities and discrepancies needing confirmation.

## Recurring PCB reviews

[Meeting hub](../presentation/meetings/index.html) · [Review template](../presentation/meetings/template.html) · [Editing guide](../presentation/meetings/README.md). Fixed review order and dated records keep each meeting easy to find.

## September 28 recorded review

[FPGA board meeting summary and actions](../presentation/meetings/2026-09-28.html). The private Voice Memo was summarized; the source audio and automatic transcript are retained only in the local dated handoff. Procurement, micro-HDMI pin allocation and manufacturing remain open.

## September 24 meeting preparation

[Review page](../presentation/meetings/2026-09-24.html) · [Original choices PDF](../sources/meetings/2026-09-24-FPGA_4K_Meeting_Choices.pdf). Proposal dated September 23, supplied for the September 24 meeting; no outcomes recorded.

## Circled-space size follow-up

[37.5 × 36 mm placement review](../hardware/fpga-interface-study/size_optimization/Size_Optimization_Review.md) retains all 128 existing mezzanine-study parts and both connectors, reducing area 6.25%. [Inspect its native PCB](../presentation/fpga/viewer/index.html?board=compact) or download the [portable smaller study](../hardware/fpga-interface-study/size_optimization/candidate/FPGA100T_Compact_Study.zip). The core and earlier studies are preserved. Full rail/protection integration, application assignment, routing, assembly and thermal checks remain required; this is not the final complete-board size.

## 26 September: historical smaller placement and pin report

[Earlier 33 × 36 mm placement](../presentation/fpga/micro-hdmi.html#placement-history) · [Native viewer](../presentation/fpga/viewer/index.html?board=compact-v2) · [Complete KiCad ZIP](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/layout_v2/FPGA100T_33x36_Placement.zip) · [Component and pin report PDF](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/output/pdf/FPGA100T_Size_Components_Pinout.pdf) · [Editable LaTeX source ZIP](../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/FPGA100T_LaTeX_Report_Source.zip). All 128 parts / 807 pad records are retained. Placement only: 0 tracks, vias or zones; 383 unconnected items; all 120 mezzanine signal contacts unassigned. The 0.010 mm courtyard minimum and J4 body overhang of 0.65 mm require assembly qualification; the drawn board-plus-body envelope is 33.65 × 36 mm. Earlier 37.5 × 36 and 40 × 36 mm studies remain separate.

## Wednesday presentation - September 30, 2026

[Dedicated presentation](../presentation/meetings/2026-09-30.html): four slides. The first groups the 117 ASIC interface positions; the second lists all 19 custom micro-HDMI contacts with a colour-matched socket contact diagram and schematic link; the third presents Zitong’s proposed FPGA components; the last shows the proposed three-FPGA + XEM + BRK assembly, with a short note that the current R12 one-link layout is in progress and a link to that native layout. Preparation only; meeting outcomes pending.

[Wednesday visual library](../presentation/meetings/2026-09-30-visuals.html): 99 existing figures, 22 native schematic sheets, dated layout and adapter progress, pin maps and interactive model links.

## Simple interposer schematic view · 29 September

[Easy connection overview](../presentation/schematic/simple.html) separates recording/commands, programming and 12 V power into three selectable diagrams. It labels cable contacts and signal directions, and links each view to its native KiCad sheet. The Wednesday deck opens this overview from its schematic links; native circuit files and audits retain their separate engineering status.

## Wednesday slide 2 · connector contact view

The [19-contact slide](../presentation/meetings/2026-09-30.html#cable-pins) now uses an enlarged, colour-matched [micro-HDMI receptacle contact diagram](../presentation/meetings/assets/2026-09-30/R6_Micro_HDMI_Contacts.svg). Its front-view numbering follows Molex sheet 2; electrical functions retain the current R12 list. The full system assembly remains on slide 3.

## Proposed FPGA board components · 29 September

[Slide 3](../presentation/meetings/2026-09-30.html#component-proposal) presents Zitong’s proposed FPGA, two status LEDs, 100 MHz fabric clock, boot flash, 125 MHz GTP reference clock and support parts. [Part review](../sources/meetings/2026-09-30-review/Component_Proposal_Review.md) separates manufacturer specifications from remaining clock/bank/boot qualification. Full assembly follows as slide 4. Proposal status remains pending review.

## 2 October meeting — current working sequence

[Backup adapter and main FPGA review](../presentation/meetings/2026-10-02.html) · [public notes and provenance](../sources/meetings/2026-10-02-review/Meeting_Notes.md) · [confirmed J1/J19 connector illustration](../presentation/meetings/assets/2026-10-02/LDO_connector_identification.png). One-chip backup first, existing LDO reused, direct rigid adapter to XEM8305, main FPGA retained as primary, and 35T exact-part review pending. Meeting decisions and subsequent CAD/module-power findings are labelled separately. Private conversation and native CAD are excluded from this publication.
