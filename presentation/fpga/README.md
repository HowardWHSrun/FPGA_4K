# Current 33 × 36 mm FPGA review

[Open the presentation](index.html) or [inspect the native PCB](viewer/index.html?board=compact-routed). The current page shows the smallest board and an explicitly partial routing checkpoint. 116 candidate digital ASIC nets have native assignments; AC_IN is one separate external analog reservation; the measured snapshot separately reports how many have completed copper. Electrical limits, connector mating, capture timing and powered operation remain unverified.

[Complete KiCad project](../../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/FPGA100T_33x36_Routing.zip) · [21-sheet schematic PDF](../../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/output/FPGA100T_33x36_Routing_Schematic.pdf) · [Routing audit](../../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/reports/Routing_Review.md) · [All component pins](../../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/reports/All_Pin_Connections.csv) · [Bringup facts needed](../../hardware/fpga-interface-study/dated/2026-09-26/asic117-routing/bringup/Bringup_Requirements.md).

The first milestone is FPGA power-up, JTAG programming and a finite recording capture. XEM8310 receiver work can follow. AC_IN is analog 0–1.5 V and has no FPGA GPIO path. IMP_TST is provisionally digital 0/1.5 V; its inactive polarity remains open.

## Data and explanation

[review-data.json](review-data.json) supplies measured counts. [viewer/boards.json](viewer/boards.json) identifies each native PCB by its byte hash and renderer counts. Static views come from the same frozen board; only color, viewport and overview labels change. KiCanvas is a review viewer; native KiCad remains authoritative. See [viewer limits](viewer/README.md).

[Presenter notes](data/Presenter_Notes.md), [component explanations](data/Component_Necessity.json) and [the pin map](pins/) describe the current component population and native pin nets. Detailed tables and earlier evidence open on demand. The UI rejects component data from a different board hash.

The six previous NC pins, U1.L9/L10 and U2–U5.4, now belong to GND. Their net-level copper status comes from the current DRC. There are 98 unassigned endpoints: 87 FPGA user I/O (including the deliberate A13 NC reserve), three mezzanine reserves and eight cable contacts. These are different from missing connections on assigned nets. R112 is removed in this checkpoint; U1.P13/M1 is directly grounded. R12 remains a possible simplification requiring circuit review.

## Refresh and verify

Freeze the complete canonical project, all 21 sheets and local libraries. Export fresh schematic XML, DRC and ERC for that exact source. The dated `10_ASIC117_Routing/scripts/audit_snapshot.py` reads actual components, pins, nets and rules; `package_web_checkpoint.py` stages a hash-selected checkpoint, exports native views/PDF, regenerates teaching data and refreshes the local website. It does not commit, push or release manufacturing files.

The package contains one canonical PCB/project, all linked sheets, libraries, bringup notes and measured reports. Candidate boards, scripts, caches, editor state and private message drafts are excluded. Native CAD bytes are unchanged. Any portable evidence-path edits retain original and imported hashes in the manifest.

From the repository root:

```sh
python3 scripts/check_fpga_review.py
python3 scripts/check_fpga_teaching.py
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
git diff --check
```

Serve the repository root to run `scripts/check_fpga_presentation.mjs` and `scripts/check_fpga_viewer.mjs`. Set `SITE_URL`, an installed `CHROME_PATH`, and `PLAYWRIGHT_MODULE` as needed; keep browser reports and screenshots in the dated work folder. The presentation check covers component/pin inspection, live counts, tabs, downloads and responsive layout. The native viewer check independently compares native pad/copper nets and hashes and exercises layers, selection, zoom and pan.

Older importers target historical revisions and must not be used to refresh the current ASIC routing checkpoint. GitHub Pages uses the `presentation` branch at its root. Local preparation does not confirm deployment; deployed file hashes and browser checks must follow any authorized publication.

## Preserved sources and history

[Gerald’s slide review](../../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md) establishes useful framing and SPI behavior while retaining timing/channel conflicts. The [fourth-review uncertainty register](../../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) is dated background, superseded by current native evidence where assignments have changed.

The [earlier component/pin PDF](../../hardware/fpga-interface-study/dated/2026-09-26/routing-33x36/report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) and [learning PDF](../../hardware/fpga-interface-study/dated/2026-09-26/learning-report/FPGA100T_Learning_And_Professor_Review.pdf) explain previous snapshots, not current connectivity. Earlier [placement studies](index.html#design-history), [200T/50T slides](history-2026-09-24.html) and [meeting records](../meetings/) retain their original context.
