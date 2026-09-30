# Recurring PCB meeting reviews

[Meeting hub](index.html) · [Latest recorded review](2026-09-28.html) · [Reusable template](template.html)

Use the same six sections for each dated review: Overview, PCB status, Interfaces, Decisions, Actions, Sources. Keep subsystem order ASIC/carriers, routing/LDO, FPGA, downstream/PC.

For a new meeting, copy `template.html` to `YYYY-MM-DD.html`, fill the dated sections, link the preceding review, and update the latest entry in `index.html`. Move the previous latest into the archive; do not overwrite its meeting record. The template is not a scheduled meeting.

Keep the section IDs `overview`, `pcb`, `interfaces`, `decisions`, `actions`, `sources` so direct links remain predictable. Use the shared `meetings.css`. Summarize changes and decisions first; place full original notes and supporting detail under Sources. Preserve publishable source bytes under `sources/meetings/` and add imports to `sources/manifest.json` and `sources/README.md`. Keep private audio and transcripts outside the repository and identify them without a public link.

Show explicit evidence dates and CAD revision. Distinguish discussion targets, proposals, approved decisions, reported work and verified tests. Carry open actions forward with owner, original date, due date (TBD if absent), status and evidence; do not infer completion.

The site header links to this permanent hub, so it does not need a new date-specific link each meeting. Update the relevant system/FPGA slide copy only where new evidence changes it. Keep dated CAD previews clearly labeled.

Validation: run `python3 scripts/check_docs.py`, `python3 scripts/check_hardware.py` and `git diff --check` from the repo root, verify local HTML assets, then confirm Pages deployment and published file bytes.

Historical preparation: [September 24 proposal](2026-09-24.html), based on the supplied September 23 PDF. No outcome was supplied for that page. The [September 28 recording summary](2026-09-28.html) is a separate dated review.

## Wednesday presentation - September 30

[Open the preparation page](2026-09-30.html). The seven presentation slides focus on the 19-contact cable: contact allocation, purpose, three XEM MC3 banks and next work. The final slide shows three custom FPGA boards with XEM, interposer and BRK. Use Present, arrow keys and Escape; click individual contacts to highlight their functional group. The six existing section IDs remain available, with an additional power-plan slide. Pins 9/11 are labeled Reserved without a proposed future use; historical native sources retain their original net names. September 28 remains the latest recorded meeting. The new page records no meeting outcome.

The [Wednesday visual library](2026-09-30-visuals.html) gathers 99 existing figures, including all 22 current native schematic sheets, previous layouts, adapter revisions, pin diagrams and manufacturer-derived 3D previews. Filters, figure enlargement and detail links preserve revision context.
