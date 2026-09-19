# Source provenance and scope

The documentation collection was assembled on **September 19, 2026**, from project materials available through September 18. Current summaries are new documentation; the meeting documents, slide deck and native source designs retain their original content.

## What is included

- Final September 17 meeting notes in DOCX and PDF, plus searchable Markdown extracted from that final DOCX.
- Gerald's original 28-slide ASIC/interface PPTX, its existing PDF render, searchable page text and selected rendered diagram previews.
- Dated current-decision/component/handoff notes and source audits, with repository-relative links.
- Selected historical guides, visibly separated from current decisions.
- Editable original carrier/LDO reference files, the latest FPGA and routing placement studies, related local libraries/reports, current draft power/configuration inputs and mechanical concepts.
- Pinned prior repository links and reproducible fetch/simulation scripts; official manufacturer and board-document links.

The [manifest](manifest.json) includes origin labels relative to the source project, published byte lengths and SHA-256 values. For adapted Markdown, the original hash is retained as `source_sha256`, and `transformation` explains the added status banner and rebased links. Original binary files are unchanged copies. `origin` records provenance; it is not a promised path in a clone of this repository.

## What remains in the local source archive

| Category | Shared replacement or reason |
|---|---|
| Raw meeting audio and private chat exports | [Meeting notes](../docs/meetings/2026-09-17.md) and [technical follow-up](../docs/meetings/2026-09-18-follow-up.md) carry project content; unrelated personal/logistical chat is omitted. |
| Hidden Git histories, KiCad backups, cache files, tool installations and duplicate ZIP packages | Current native source files, manifests and pinned upstream revisions are the shared inputs. |
| Old fabrication exports and incomplete older 35T board drafts | [Historical guides](../docs/library.md) preserve context; these are not current 200T fabrication files. |
| Earlier alternative area/placement models and temporary screenshots | [Latest placement studies](../hardware/README.md) and retained result reports provide the current comparison point. |
| Large manufacturer PDF collections and downloaded release/tool archives | [Official source links](../references/README.md) identify the documents and versions to retrieve. |
| Unfinished local CAD generator scripts and build intermediates | Proposed inputs are included; no portable generator or complete new electrical design is claimed. |

This is the available project documentation set, not a claim that every collaborator's latest work has been collected. Jiaao's current 4K/Artix-7 firmware, David's receiver/forwarding implementation, Zitong's current routing schematic and Gerald's final ASIC/carrier specifications still need to be added or linked by their owners. Track these gaps in [open questions](../docs/open-questions.md).

## Attribution and reuse

Gerald supplied the ASIC/interface slides, prior acquisition reference and ASIC-side design examples. Howard's project archive supplied the meeting documents, generated reviews and proposed FPGA studies. The [external register](../references/repositories.json) identifies upstream projects and known license status. Imported files retain their own authorship and applicable terms; this upload does not apply a blanket open-source license to them.

Manufacturer documents remain available through their official publishers. KiCad footprint/model files retain embedded attribution and license text where provided. Confirm rights and intended distribution when adding further lab or third-party material.
