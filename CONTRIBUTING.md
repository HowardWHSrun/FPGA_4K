# Working together on the PCB

Start with [team setup](docs/team/README.md), [owners and open work](docs/team/owners-and-work.md), and the [FPGA working draft](hardware/fpga-board/README.md).

## One-time setup

1. Accept the repository collaborator invitation and sign in to GitHub Desktop. Reading/cloning this public repository does not give write access.
2. Install KiCad **10.0.6**, including its standard symbol, footprint and optional 3D libraries. Coordinate any version upgrade in a separate pull request. The historical routing reference remains in its original KiCad 9 format.
3. Clone `https://github.com/HowardWHSrun/FPGA_4K.git` with GitHub Desktop into a normal local folder outside iCloud/Dropbox/OneDrive synchronization. Do not use downloaded ZIPs as working copies.
4. Open `hardware/fpga-board/hardware/Howard_FPGA_Connected_42x40.kicad_pro`. Keep the neighboring `libraries` folder: the project tables use relative paths.
5. Run the checks below. Verify the schematic hierarchy and board open on your computer. Standard 3D assets are installed with KiCad; absent custom models do not establish mechanical clearance.

## Every change

1. Find or create an issue with the PCB task template. Name the board, files, owner, reviewer and acceptance criteria. Claim layout ownership before changing the PCB; one person edits each board at a time.
2. Save and close KiCad. In GitHub Desktop, switch to `main`, **Fetch origin**, then **Pull origin**. Commit unfinished work on its branch before changing branches; do not discard it.
3. Create a short-lived branch, for example `fpga/jtag-header` or `docs/connector-decisions`.
4. Edit one focused change. Different board projects and separate schematic sheets can be handled concurrently. Coordinate root-sheet edits, annotation, library updates and schematic-to-PCB updates with the layout owner.
5. Save and close KiCad. Inspect the changed files, commit with a useful message, and **Push origin** (or **Publish branch**).
6. Open a pull request. Describe the change, attach relevant before/after views, report ERC/DRC and outstanding findings, and identify pinout/power/BOM impacts. Request review from a teammate; changes across a connector need both sides reviewed.
7. After approval and passing repository checks, merge. The next layout owner pulls the merged state before opening KiCad and records the handoff in the issue.

A pushed branch is shared work in progress. `main` is the integrated working baseline; neither is a fabrication release. A commit stays local until pushed, and teammates receive merged updates only after pulling.

## Checks

From the repository root (Python 3.9+ and Git):

```sh
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
git diff --check
```

These checks verify packaging, project dependencies, documentation and preserved-source integrity. They do not approve circuits. For a CAD change, also run KiCad's schematic ERC and PCB DRC with schematic parity, inspect the result in the editors, and report every remaining issue. The initial draft has known failures; report changes from the prior revision and do not suppress findings to obtain a green check.

Optional terminal equivalents, once `kicad-cli` is on PATH:

```sh
mkdir -p build/review
kicad-cli sch erc --format json --output build/review/erc.json hardware/fpga-board/hardware/Howard_FPGA_Connected_42x40.kicad_sch
kicad-cli pcb drc --schematic-parity --format json --output build/review/drc.json hardware/fpga-board/hardware/Howard_FPGA_Connected_42x40.kicad_pcb
```

These commands export findings; their default exit code does not mean the design is error-free. Review the reports. For a release gate, use `--exit-code-violations` and review disabled rules and exclusions as well.

## CAD conflicts and handoff

Git is not a live shared PCB editor. `.gitattributes` deliberately prevents automatic content merging of board, schematic and project files when both branches change the same file. Different sheets can still merge as separate files. For a conflict, preserve both branches, agree which complete revision is the starting point, and reapply the other change in KiCad. Never open files containing Git conflict markers in KiCad or blindly accept one side.

Finish a handoff by recording the merged commit, remaining work, affected interfaces and next layout owner. Close the old KiCad session before the next person starts. Ownership in an issue is a team agreement, not an enforced file lock.

## Files and sources

Commit the native project, every child sheet, custom rules, project library tables and required custom libraries. Use project-relative paths. Keep editor preferences, locks, automatic backups and scratch outputs out of Git. Do not add credentials, private chat/audio or unrelated personal material.

Edit the working design under `hardware/fpga-board/`. Preserve originals under `hardware/references/`. Before another board becomes active, agree on its baseline and copy its complete project into a separately named working folder with provenance. Do not edit the historical sources in place.

`sources/manifest.json` protects immutable supplied files and snapshot evidence. The FPGA import baseline records the initial CAD hashes; it does not freeze the editable working design. Git history records subsequent engineering changes. Update the status and ownership documents when a decision changes.

## Fabrication releases

Use a reviewed tag such as `fpga-revA-fab1` only after electrical, interface, mechanical and manufacturing reviews. Attach Gerbers, drill files, BOM, placement data, stackup and check reports generated from that exact commit to the corresponding GitHub release. Record approved exceptions and reviewers. The current draft is **not released for manufacture**.
