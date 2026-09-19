# Document and source library

Read [current status](current-status.md) first. This index distinguishes current summaries, original inputs and historical proposals. The [manifest](../sources/manifest.json) records the imported files, origins, transformations, sizes and SHA-256 checksums.

## Current shared understanding

- [Architecture and rate budget](architecture.md)
- [Twelve open questions, owners and closure evidence](open-questions.md)
- [Decision and supersession record](decisions.md)
- [Current-decision source note](../sources/notes/2026-09-18-current-decisions.md)
- [Current Gerald/Zitong handoff questions](../sources/notes/2026-09-18-current-questions.md)
- [Routing-board handoff](../sources/notes/2026-09-18-routing-handoff.md) and [provisional routing parts](../sources/notes/2026-09-18-routing-parts.md)
- [Howard's component proposal](../sources/notes/2026-09-18-component-proposal.md). Its 100 MHz candidate is superseded by oscillator frequency TBD.
- [ASIC power reference audit](../sources/notes/2026-09-18-asic-power-audit.md). Recovered setpoints are not newly approved ASIC supply requirements.

## Meetings and slides

| Record | Read/search | Original or rendered files |
|---|---|---|
| September 17 project meeting | [Searchable final notes](meetings/2026-09-17.md) | [DOCX](../sources/meetings/2026-09-17-notes.docx), [PDF](../sources/meetings/2026-09-17-notes.pdf) |
| Technical clarifications received September 18 | [Technical summary, roles and date caveat](meetings/2026-09-18-follow-up.md) | Reflected in dated engineering notes; raw chat remains in the owner's local archive |
| Gerald's 28-slide ASIC/interface deck | [Page-by-page extracted text](slides/asic-interface-text.md) | [PPTX](../sources/slides/Chip_FPGA_Interface.pptx), [existing PDF render](../sources/slides/Chip_FPGA_Interface.pdf) |

Important slide diagrams also have [PNG previews](../sources/slides/previews/). Text extraction cannot preserve timing-waveform relationships; read the slide image/PDF before interpreting them. The source notes preserve the historical meeting statements even where a later decision supersedes them.

## Programs, CAD and supporting references

- [Software guide and reproducible reference simulations](software.md)
- [Previous GitHub repositories, learning website and manufacturer documents](../references/README.md)
- [Hardware guide](../hardware/README.md): latest FPGA/routing placement studies; original carrier and LDO projects; original and compact mechanical concepts; proposed power/configuration inputs.
- [Source scope and attribution](../sources/README.md)

## Historical engineering material

These files explain earlier work. They do **not** override current decisions.

| Record | Why it is retained | Superseded or limited scope |
|---|---|---|
| [September 16 meeting preparation PDF](history/2026-09-16-meeting-preparation.pdf) | Requirements-first discussion framework | Earlier FPGA/device/interface choices |
| [September 17 meeting answers guide PDF](history/2026-09-17-meeting-answers-guide.pdf) | Detailed explanations and diagrams | Earlier reference-board direction |
| [Gerald's two reference boards](history/2026-09-17-reference-board-guide.md) | Carrier versus regulator/routing roles; connector discrepancies | Old 35T discussion and unapproved interface counts |
| [Slide/code comparison](history/2026-09-16-slide-code-audit.md), [FPGA_512 connection audit](history/2026-09-16-fpga512-audit.md) | Interface and clock discrepancies in the prior code | Does not validate the new 4K hardware |
| [Earlier September 18 baseline](history/2026-09-18-earlier-baseline.md), [readiness review](history/2026-09-18-earlier-readiness.md) | Requirements and source reconciliation | Later current-decision note takes precedence |
| [USB parts walkthrough](history/2026-09-18-usb-parts-walkthrough.md), [PDF guide](history/2026-09-18-superseded-usb-parts-guide.pdf) | Power/boot/clock background and old design calculations | USB/FX3 transport and its BOM/power totals are superseded |
| [Broad earlier question list](history/2026-09-18-earlier-questions.md), [PDF](history/2026-09-18-earlier-questions.pdf) | Original broad requirements review | Current short handoff already incorporates 1.5 V/32 MHz confirmation |

Local-only references inside imported historical text are marked as archive references rather than broken workstation links. The earlier [512channels project](https://github.com/HowardWHSrun/512channels) carries additional educational guides and programs.
