# Source provenance

The project files are stored in this repository. Attribution and copy details are recorded here so the main documentation can focus on the system and its interfaces.

| Material | Source and representation |
|---|---|
| ASIC/interface PowerPoint | Deck supplied by Gerald; unchanged original file |
| Slide PDF, searchable text and PNG previews | Representations of the original deck; diagrams remain available in the PPTX/PDF |
| Carrier PCB-5 and Pins.xlsx | Chip-side reference files shared for the project; unchanged copies |
| LDO/routing project and connector footprints | Shared reference files; unchanged except the library-table path adaptation below |
| September 17 DOCX/PDF notes | Summary prepared from the recorded team meeting; not a verbatim transcript |
| September 18 follow-up | Technical summary of team messages; received date is known, individual message dates were not provided |
| FPGA_512 code | Snapshot of [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512/tree/767e82528780005cbcb37b3e926197755bac622e), shared as the prior acquisition reference; [included files and packaging details](../firmware/README.md) |

[manifest.json](manifest.json) records each imported file's origin, size and SHA-256. Origins identify source revisions or archive labels; they are not paths required on a collaborator's computer.

The LDO library table uses `${KIPRJMOD}/LDO_Board.pretty` in place of its original workstation path. `source_sha256` retains the original hash; the circuit files are unchanged. Included upstream program files retain their original bytes and notices. Upstream repository metadata and local caches are not part of the source copy.

The collection covers shared project files and faithful representations, with minimal navigation/checking support. Independent personal studies and design proposals, private chat/audio, local caches and hidden histories remain outside it.

Original ownership and applicable terms are retained. No repository-wide license was found in the pinned FPGA_512 tree; this collection adds no license grant to that code or the imported lab material.
