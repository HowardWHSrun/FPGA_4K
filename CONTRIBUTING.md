# Contributing

This repository should let the next person understand a decision and find its evidence without needing the original conversation.

## Add a meeting or source

1. Add a dated Markdown record under `docs/meetings/`, using [the meeting template](docs/templates/meeting.md). Keep agreed decisions, proposals, estimates, actions and unanswered questions separate.
2. Place the original shareable document under `sources/`, preserve its bytes, and record its origin and checksum in `sources/manifest.json`. Avoid duplicate exports or local backup histories.
3. Add a library entry in [docs/library.md](docs/library.md). For slides, include searchable text and point readers to the diagrams in the original deck/PDF.
4. Update [current status](docs/current-status.md), [decisions](docs/decisions.md) and [open questions](docs/open-questions.md) only where the new evidence supports a change.

For a received message without a source date, record its **received date**. Do not invent a meeting date, deadline, owner acceptance or a Slack permalink. Public technical summaries should omit unrelated private conversation and access links.

## Close a question or propose an interface

Use the existing Q identifier in the issue/PR. State the proposed answer, affected boards/programs, evidence and acceptance conditions. Keep it open until the relevant owners have agreed and the required evidence is available. An issue template is available for questions; creating an issue does not automatically assign anyone.

Use [the interface template](docs/templates/interface.md) when agreeing signals or a link. Both ends need one shared specification. A connector count or a pictured footprint is insufficient.

## Add code or test evidence

Use a branch and a pull request for collaborative changes. Describe how to run the change from a fresh clone, tool versions, expected output and limitations. Keep reference revisions explicit. Avoid committing generated bitstreams or large raw recordings as a substitute for a reproducible build.

Hardware evidence should include the board revision, FPGA ordering code, commit/bitstream identity, tool versions, wiring, clocks, stimulus, expected result, observed result and saved traces. Report a failed or unrun check directly. Simulations and bench measurements belong in separate evidence records.

## Check before sharing

```sh
python3 scripts/check_docs.py
git diff --check
```

For each manifest file entry, `sha256` and `bytes` describe the published file. `source_sha256`, when present, describes the imported source before documented link/banner adaptations. New synthesized documentation is not an unchanged original. Use Python's `hashlib.sha256` to compute checksums.
