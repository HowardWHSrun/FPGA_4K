# FPGA board — working draft

**PARTIAL DESIGN — NOT FOR MANUFACTURE.** This is the saved local FPGA draft imported for team collaboration on 2026-09-21, not an approved circuit or a fabrication release. Review and accept the baseline before extending it.

**[Open the KiCad project](hardware/Howard_FPGA_Connected_42x40.kicad_pro)** · [Main schematic](hardware/Howard_FPGA_Connected_42x40.kicad_sch) · [PCB layout](hardware/Howard_FPGA_Connected_42x40.kicad_pcb) · [Team workflow](../../CONTRIBUTING.md)

Use KiCad **10.0.6** for this handoff. Open the `.kicad_pro` through KiCad Project Manager. The complete 41-sheet hierarchy, local symbol library and local footprint library are included. Keep `hardware/` and `libraries/` together. Standard model references use KiCad's installed 3D library; complete custom mechanical models are not supplied.

## Layout at import

| Front copper and fabrication layer | Back copper and fabrication layer |
|---|---|
| ![FPGA front layout](previews/front.svg) | ![FPGA back layout mirrored](previews/back.svg) |

Generated from the imported board with KiCad 10.0.6; back view is mirrored. These dated outer-layer views omit inner copper and do not demonstrate routing completion. Regenerate previews for layout changes.

## Initial saved state

The imported PCB is 42 × 40 mm with 214 positions, 703 track segments, 128 vias and six filled zones. The 22-net programming signal scope is routed, and selected supply/ground fanouts are present. Power-converter loops, complete power delivery, application pin assignments and qualification remain unfinished.

The September 21 source reports record **270 remaining PCB connection items**, **661 unresolved schematic pins**, and **21 undriven power pins**. Their zero general DRC violations and zero schematic parity issues apply only to the enabled rules; they do not mean the design is complete. Some schematic IC pin types are generic passive and need manufacturer-pin-function review.

See the [snapshot evidence and disabled-rule list](../../sources/fpga-draft-2026-09-21/README.md), [draft BOM](../../sources/fpga-draft-2026-09-21/BOM_Draft.csv) and [unresolved pin ledger](../../sources/fpga-draft-2026-09-21/Unresolved_Pin_Ledger.csv). These are dated import artifacts. Regenerate reports and BOMs for later commits rather than treating them as live design outputs.

## Before editing

Claim layout ownership in a PCB task; see [owners and open work](../../docs/team/owners-and-work.md). Use a branch and review the change in a pull request. Edit these native files directly. Historical experimental generators and rejected routing candidates are deliberately not included: rerunning an old generator could overwrite reviewed CAD.

Current unknowns include RAM/controller, connector pin maps and IO levels, receiver protocol, oscillator, rail budgets/compensation, remaining FPGA pin treatment, stackup, impedance, mechanical fit and assembly rules. Keep each as `TBD + owner` until a reviewed decision closes it.

The 0.10 mm minimum clearance, 0.15 mm routing traces and 0.50/0.20 mm vias are draft capabilities requiring fabricator agreement. The ADP5052 footprint and power-loop design require review. The R112 near-pad via needs assembler mask/tenting review; L1 placement and the C84 analog bypass proposal also need electrical/mechanical qualification.

## Files and history

`hardware/` holds the editable KiCad project, all child sheets and project library tables. `libraries/` holds its custom symbols and footprints. The [import baseline](../../sources/fpga-draft-2026-09-21/import-baseline.json) records original paths and hashes; subsequent changes belong in Git history. This working copy is separate from the immutable supplied boards in [references](../README.md).
