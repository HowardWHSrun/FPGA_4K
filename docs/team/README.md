# Team start page

**Everyone: please create your own named branch for PCB work.** Use `First-Last` with hyphens; keep your evolving design there and publish the branch so the team can inspect it.

| I want to… | Open |
|---|---|
| Create my own branch | [Setup and copyable commands](../../CONTRIBUTING.md#create-your-personal-branch) |
| Open Howard Wang's PCB | [Howard-Wang branch](https://github.com/HowardWHSrun/FPGA_4K/tree/Howard-Wang) · [Design guide](https://github.com/HowardWHSrun/FPGA_4K/blob/Howard-Wang/hardware/fpga-board/README.md) |
| Find other people's work | [Branch directory and open work](owners-and-work.md) |
| Propose a design task | [New PCB task](https://github.com/HowardWHSrun/FPGA_4K/issues/new?template=pcb-task.yml) |
| Record an interface decision | [Decision template](https://github.com/HowardWHSrun/FPGA_4K/issues/new?template=interface-decision.yml) |
| Propose selected work for main | [Pull requests](https://github.com/HowardWHSrun/FPGA_4K/pulls) |
| Find original boards and meeting material | [Document library](../library.md) |

`main` is the shared starting point for references and reviewed team material. Howard's personal CAD, draft BOM and reports live on `Howard-Wang`. They were previously published on `main` and remain accessible in Git history; this organization change does not erase history or make them private.

## First steps

1. Clone and create your personal branch from `main`; publish it.
2. Add your name, branch link, project location and KiCad version to the directory through a focused documentation pull request.
3. Keep your README and design status current. Push your personal branch whenever there is useful progress to share.
4. Coordinate connector/power/protocol decisions across the relevant owners. Use pull requests only for selected changes intended for the team baseline.

## Access and review

This is a public repository. Invite teammates for write access through [Settings → Collaborators](https://github.com/HowardWHSrun/FPGA_4K/settings/access). A branch name is an organizational convention, not an access restriction.

`main` requires one approving review and the `documentation` repository check, with force pushes and deletion blocked. Administrative bypass is retained. Personal branches allow ordinary work-in-progress pushes. Do not edit another person's branch without agreeing with them first.

GitHub stores pushed commits; local CAD edits do not sync until committed and pushed. Close KiCad before switching branches or pulling changes.
