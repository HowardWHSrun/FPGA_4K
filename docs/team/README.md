# Team start page

This repository is the shared working location for PCB design, interface decisions and reference material. Begin with the [contribution guide](../../CONTRIBUTING.md).

| I want to… | Open |
|---|---|
| Get the files and make a change | [Setup and daily workflow](../../CONTRIBUTING.md) |
| Open the active FPGA CAD | [FPGA working draft](../../hardware/fpga-board/README.md) |
| Find who owns a board or a decision | [Owners and open work](owners-and-work.md) |
| Propose a task or claim layout work | [New PCB task](https://github.com/HowardWHSrun/FPGA_4K/issues/new?template=pcb-task.yml) |
| Record a pinout, power or protocol decision | [Interface decision template](https://github.com/HowardWHSrun/FPGA_4K/issues/new?template=interface-decision.yml) |
| Review a proposed change | [Pull requests](https://github.com/HowardWHSrun/FPGA_4K/pulls) |
| See the original boards and meeting material | [Document library](../library.md) |

## Administrator setup

The repository is public. Collaborators need an invitation for push access: open [Settings → Collaborators](https://github.com/HowardWHSrun/FPGA_4K/settings/access), choose **Add people**, and enter each teammate's GitHub username. Usernames and accepted responsibilities have not yet been supplied; the ownership table intentionally leaves them TBD.

Use one approving review and the `documentation` repository check for `main`; block force pushes and branch deletion. This check covers documentation and CAD packaging, not electrical correctness. Repository protection does not assign engineering responsibility. Keep administrative bypass available for repository recovery, not routine design review.

## First team session

1. Assign the FPGA layout owner and reviewer, plus owners for carrier, routing/power, receiver and firmware work.
2. Confirm the imported FPGA draft is the starting candidate or record the agreed replacement. Importing it does not constitute engineering approval.
3. Each teammate clones and opens the project successfully with the agreed KiCad version.
4. Put the next concrete task in an issue. Run one small change through branch, pull request, review and handoff.

There is one integrated FPGA working copy here. The earlier local study is the import source; edits to that external folder will not automatically appear in GitHub. New team work should use the cloned repository project.
