# Working together with personal branches

**Please create and publish your own branch before editing PCB designs.** Use `First-Last` (hyphens instead of spaces). Howard's branch is [Howard-Wang](https://github.com/HowardWHSrun/FPGA_4K/tree/Howard-Wang). The [branch directory](docs/team/owners-and-work.md) helps everyone find each person's work.

`main` holds shared references, onboarding and reviewed team material. Each personal branch holds that person's evolving design. Publishing a personal branch makes the work visible without merging it into `main`. Branches in this public repository are public, and their names do not restrict access to individual collaborators.

## Create your personal branch

1. Accept the collaborator invitation and sign in to GitHub Desktop. Clone `https://github.com/HowardWHSrun/FPGA_4K.git` into a local folder outside cloud-folder syncing.
2. Save and close KiCad. Commit any unfinished work before switching branches.
3. In GitHub Desktop select `main`, **Fetch origin**, then **Pull origin**.
4. Choose **Current Branch → New Branch**, enter `First-Last` using your actual name, and create it from `main`.
5. Choose **Publish branch**. Keep your PCB project and all its custom libraries together on this branch.
6. Add your name, branch link, board/project path and KiCad version to the branch directory through a small documentation pull request. Do not include your whole design just to register the branch.

Terminal equivalent (replace `First-Last`):

```sh
git clone https://github.com/HowardWHSrun/FPGA_4K.git
cd FPGA_4K
git switch main
git pull --ff-only origin main
git switch -c First-Last
git push -u origin First-Last
```

A branch created from `main` contains shared references, not Howard's current personal draft. To intentionally build on Howard's draft, create your branch from the latest `origin/Howard-Wang` instead and record that starting commit. Do not use another person's branch for your independent edits.

## Open Howard's design

In GitHub Desktop fetch, select `Howard-Wang`, and pull. Use **KiCad 10.0.6** and open `hardware/fpga-board/hardware/Howard_FPGA_Connected_42x40.kicad_pro`. Its `libraries` folder must remain alongside `hardware`. Standard 3D models depend on the installed KiCad libraries.

For an existing local clone without a local Howard branch:

```sh
git fetch origin
git switch --track origin/Howard-Wang
```

If the branch already exists locally, use `git switch Howard-Wang`, then `git pull --ff-only`. Always save and close KiCad before pulling or switching. Switching the same checkout changes its files on disk; reopen the project afterward.

## Daily work

1. Switch to your personal branch, fetch, and pull that branch's latest changes.
2. Make a focused change, save and close KiCad, inspect the diff, and commit with a useful message.
3. Push your branch. Share its link or commit when asking for feedback. Your changes remain on your branch; there is no need to merge every commit into `main`.
4. Keep your design README current: scope, source revision, KiCad version, open decisions and ERC/DRC findings. Drafts are not fabrication releases.

Different people may explore separate PCB versions on their own branches. If people intentionally edit the same branch and board, agree on one active layout editor and an explicit handoff. Personal branches prevent accidental mixing during work; they do not make different layouts automatically mergeable.

## Share selected work with the team

For a shared reference, interface decision, documentation update or design explicitly selected for integration, create a focused integration branch from current `main` and bring across only the agreed change. Open a pull request with before/after views, affected interfaces and checks. Require one reviewer and passing repository checks; interface changes need review by both sides.

Avoid opening a pull request from an entire personal branch when only a small shared change is intended. Personal branches may contain different project choices. Similarly, do not blindly merge `main` into a personal branch: the separation commit removes Howard's draft from `main`. Bring in shared-document updates selectively, or resolve the merge deliberately while retaining your design. Preserve both versions before resolving CAD conflicts.

The `.gitattributes` rules prevent automatic content merging when both branches change the same native CAD file. Reapply conflicting engineering changes in KiCad and inspect the result; never accept text conflict markers as a valid board.

## Checks and sources

```sh
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
git diff --check
```

The first check validates links and preserved-source hashes. The hardware check follows `hardware/project-scope.json`: `false` intentionally excludes Howard's personal project on `main`; `true` requires its complete local CAD hierarchy and libraries. Do not change it to `false` to hide a broken project. Other projects need their own dependency and native checks; a pass here does not validate unregistered PCB designs.

For CAD changes, run native ERC and DRC with schematic parity in the project's agreed KiCad version. Review all findings, disabled rules and exclusions. Howard's draft has known open connections; a green repository check is not an electrical approval.

Commit all native project files, child sheets, rules and required libraries with relative paths. Preserve originals under `hardware/references/`; make working copies on your own branch. Exclude editor locks/preferences, backups, credentials and private chat/audio. Keep source provenance with each imported design. Howard's dated import record remains with his branch; subsequent design edits are tracked in Git.

## Fabrication releases

Use a reviewed tag such as `fpga-revA-fab1` only after electrical, interface, mechanical and manufacturing reviews. Generate Gerbers, drills, BOM, placement data, stackup and reports from that exact commit and attach them to the release. Record reviewers and approved exceptions. Personal-branch publication and merge approval do not authorize manufacture.
