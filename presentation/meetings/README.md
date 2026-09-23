# Recurring PCB meeting reviews

[Meeting hub](index.html) · [Latest recorded review](2026-09-23.html) · [Reusable template](template.html)

Use the same six sections for each dated review: Overview, PCB status, Interfaces, Decisions, Actions, Sources. Keep subsystem order ASIC/carriers, routing/LDO, FPGA, downstream/PC.

For a new meeting, copy `template.html` to `YYYY-MM-DD.html`, fill the dated sections, link the preceding review, and update the latest entry in `index.html`. Move the previous latest into the archive; do not overwrite its meeting record. The template is not a scheduled meeting.

Keep the section IDs `overview`, `pcb`, `interfaces`, `decisions`, `actions`, `sources` so direct links remain predictable. Use the shared `meetings.css`. Summarize changes and decisions first; place full original notes and supporting detail under Sources. Preserve source bytes under `sources/meetings/` and add imports to `sources/manifest.json` and `sources/README.md`.

Show explicit evidence dates and CAD revision. Distinguish discussion targets, proposals, approved decisions, reported work and verified tests. Carry open actions forward with owner, original date, due date (TBD if absent), status and evidence; do not infer completion.

The site header links to this permanent hub, so it does not need a new date-specific link each meeting. Update the relevant system/FPGA slide copy only where new evidence changes it. Keep dated CAD previews clearly labeled.

Validation: run `python3 scripts/check_docs.py`, `python3 scripts/check_hardware.py` and `git diff --check` from the repo root, verify local HTML assets, then confirm Pages deployment and published file bytes.

Upcoming review: [September 24 preparation](2026-09-24.html), based on the supplied September 23 proposal PDF. Keep upcoming preparation distinct from completed meeting records; record outcomes only when supplied.
