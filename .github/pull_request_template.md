## Change and reason

Describe the selected change intended for the shared baseline; keep unrelated personal PCB work on its owner’s branch. Describe the problem and resulting behavior. Link the task/decision issue. Identify the board, sheets and layout owner when applicable.

## Review evidence

- Before/after schematic or layout views:
- Connector, pinout, voltage, timing, BOM or mechanical impacts:
- Required reviewers (both sides for an interface change):

## Verification

- [ ] `python3 scripts/check_docs.py`
- [ ] `python3 scripts/check_hardware.py`
- [ ] `git diff --check`
- [ ] CAD changes: ERC/DRC with schematic parity inspected; remaining findings and changes reported below (or explain not applicable).
- [ ] New supplied sources: provenance and immutable-source manifest updated (or not applicable).

Results, known failures, disabled rules and limits:

## Handoff

Remaining work / next layout owner:

A merged change is a working revision, not a fabrication release.
