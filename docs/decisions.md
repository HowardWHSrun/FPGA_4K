# Decision record and document precedence

Prepared 19 September 2026 from records available through 18 September. Dates below describe the available record, not necessarily the original date of every discussion. These summaries preserve accepted direction while keeping proposals and unresolved requirements separate. See [current status](current-status.md) and [the question register](open-questions.md).

## Current decisions and confirmations

| ID | Decision or confirmation | Status and boundary | Source |
|---|---|---|---|
| D-01 | Use XC7A200T for the custom FPGA PCB | Selected device; exact ordering code/package/grade remains proposed | [Current decision note](../sources/notes/2026-09-18-current-decisions.md) |
| D-02 | Target eight ASICs on four two-ASIC carriers | Intended arrangement, 4,096 recording channels; verify current carrier/ASIC revisions | [Current decision note](../sources/notes/2026-09-18-current-decisions.md), [ASIC slides](slides/asic-interface-text.md) |
| D-03 | Use micro-HDMI as the downstream connector direction | Selected connector direction; electrical standard, protocol, pinout, cable and receiver remain open | [Current decision note](../sources/notes/2026-09-18-current-decisions.md) |
| D-04 | Nominal reference is 1.5 V; intended ASIC clock is 32 MHz | Gerald's confirmation; not a complete electrical specification or physical FPGA oscillator requirement | [Technical follow-up](meetings/2026-09-18-follow-up.md) |
| D-05 | FPGA oscillator frequency remains TBD | 100 MHz was a candidate; select after acquisition/output clock requirements | [Rev2 guide](../hardware/placement/FPGA_PCB_Rev2/README.md) |
| D-06 | Retain automatic startup and a dedicated JTAG programming/debug connector | Boot-flash implementation and exact connector/adapter remain proposed; historical pitch variants need reconciliation | [Meeting record](meetings/2026-09-17.md), [component proposal](../sources/notes/2026-09-18-component-proposal.md) |
| D-07 | Nexys Video serves development/testing | It is not mounted on the custom FPGA PCB; its use does not demonstrate the whole target system | [Current decision note](../sources/notes/2026-09-18-current-decisions.md) |
| D-08 | Coordinate routing/power and FPGA PCB as separate design responsibilities | Full power/contact/mechanical handoff remains to be agreed; functional progress takes priority over treating an unvalidated outline as fixed | [Routing handoff](../sources/notes/2026-09-18-routing-handoff.md), [current questions](../sources/notes/2026-09-18-current-questions.md) |

## Current proposals, not frozen requirements

| Proposal | Present qualification | Related questions |
|---|---|---|
| XC7A200T-1SBG484C | Candidate exact FPGA ordering code | Q-07, Q-11 |
| S25FL256SAGMFI000, 256 Mbit boot flash | Candidate part; boot/update settings and recovery behavior need implementation and validation | Q-10 |
| External recording RAM | Provisional block; type/capacity/controller and actual stall budget remain open | Q-08 |
| ADP5052, four inductors and one dual-MOSFET package | Proposed power implementation; rail plan, loads, values, compensation and thermal behavior unresolved | Q-05, Q-10 |
| Two routing connectors and a separate power-input allowance in placement studies | Physical allowances; complete contacts, mates and power feed direction unapproved | Q-04, Q-05 |
| Seven low-voltage regulators per independent routing supply group | Reference-derived proposal; group count and existing carrier regulation unknown | Q-05 |
| 60 × 70 mm FPGA Rev2 outline | Placement candidate with no schematic/nets/routing and unresolved native DRC footprint errors | Q-11 |

Sources: [component proposal](../sources/notes/2026-09-18-component-proposal.md), [routing handoff](../sources/notes/2026-09-18-routing-handoff.md), [Rev2 guide](../hardware/placement/FPGA_PCB_Rev2/README.md). Question IDs refer to [open questions](open-questions.md).

## Superseded plans and unresolved differences

| Earlier material | Current interpretation |
|---|---|
| XC7A35T RevA/RevB drafts and CP SOM ONE examples | Historical reference designs; they are not an XC7A200T implementation. Device/package/power assumptions must not be transferred silently. |
| USB/FX3 acquisition proposal and its system guide | Superseded by micro-HDMI selection. FX3, USB receptacle, FX3 clock/boot support and FX3-only converter are removed from the current proposed path. Link-specific bank allocation, support quantities and power totals require recalculation. |
| The broad 24-question Gerald checklist | Historical requirements review. The current short questions already acknowledge the confirmed nominal 1.5 V and 32 MHz. |
| 100 MHz FPGA oscillator | Earlier candidate only. Current frequency is TBD; it is distinct from the 32 MHz ASIC clock target. |
| JTAG pads or JTAG over micro-HDMI | Earlier options do not replace the latest dedicated JTAG connector proposal. No simultaneous recording/debug cable-sharing design has been validated. |
| RevC configuration header versus Rev2 placement header | Drafts differ between 2×3 1.27 mm and 2×3 2.54 mm. Exact part, pitch and adapter remain open; neither candidate is silently authoritative. |
| FPGA_512 at 16 MHz / 15.625 kS/s/channel | Existing lower-rate ECP5/FT600 reference; adaptation and validation are required for Artix-7 and the intended full-rate system. |
| 88 acquisition signals or 160 gross placeholder contacts | Useful inventory/space figures, not a final connector requirement or validated pin allocation. |
| Older carrier/LDO reference designs | Not a verified mating pair or approved new-routing BOM. In particular, high-voltage branches and symbol/footprint mapping need reconciliation. |

Sources: [current decision note](../sources/notes/2026-09-18-current-decisions.md), [current questions](../sources/notes/2026-09-18-current-questions.md), [routing handoff](../sources/notes/2026-09-18-routing-handoff.md), [component proposal](../sources/notes/2026-09-18-component-proposal.md), [Rev2 guide](../hardware/placement/FPGA_PCB_Rev2/README.md). The JTAG pitch difference was found by comparing the [RevC configuration-input draft](../hardware/design-inputs/config/README.md) with the [Rev2 native-readback record](../hardware/placement/FPGA_PCB_Rev2/reports/native_readback.json); it remains an unresolved design choice.

## Reading and updating evidence

1. Use the canonical current summaries to identify the latest recorded direction and unresolved questions. Follow their source links for the underlying evidence.
2. Treat original slides, meeting records and supplied technical confirmations as evidence with their own dates and limits. A received date does not establish the original date of a pasted message.
3. Treat generated CAD studies, calculations and component lists according to their stated validation level. Do not upgrade a proposal because a footprint or script exists.
4. Preserve older records and label what superseded them. Do not rewrite an old source to make it appear it always reflected the current plan.
5. When a decision changes, add a dated entry with source and owner/reviewer confirmation, update affected summaries and Q IDs, and identify the files or assumptions superseded.

This record does not create new assignments, approve procurement or authorize fabrication. It makes the current shared understanding and its evidence explicit for collaborators and AI agents.
