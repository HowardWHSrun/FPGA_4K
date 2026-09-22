# Overall 3D assembly concept

This is the original stacked-headboard model previously supplied and reviewed for the project. The STL is included unchanged, together with the earlier labeled preview.

![Overall assembly concept with regions A, B, C and D](stacked_headboard_labeled.png)

**[Open the 3D STL](stacked_headboard_original.stl)** · **[Download the STL](stacked_headboard_original.stl?raw=true)** · [Full-size labeled image](stacked_headboard_labeled.png)

GitHub supports rotating STL previews. If the preview does not load, download the file and open it in an STL-capable CAD or mesh viewer.

## Reading the assembly

The following roles were confirmed during the earlier model discussion; the STL itself stores geometry, not electrical roles or part names.

| Region | Project role |
|---|---|
| A | Stack of four ASIC carrier boards, with two ASICs per board in the discussed arrangement |
| B + C | Routing PCB: connecting section and lower board region |
| D | FPGA PCB above the routing-board region |

The model depicts the headboard assembly portion of the project. The downstream KR260, PC and external cabling are outside this model; see the [system diagram](../overview.md#where-the-boards-fit).

## Version and limits

This is the **original supplied model**, originally named `stacked_headboard_onebody (1).stl`. For the presentation, use the separately preserved compact B v1 source described below. The original author's identity has not been verified, so this file is not attributed to Gerald.

The mesh has 650 triangles and an envelope of **65 × 24 × 15.75 model units**. STL does not encode units, and the earlier discussion treated dimensions as provisional. These numbers must not be assumed to be millimeters or final board dimensions.

Use it to understand the arrangement. It is not a detailed electrical assembly, a confirmed mechanical fit, or evidence that the two [supplied reference PCB designs](../README.md) mate exactly as shown. The block geometry does not specify an FPGA part number, connector mapping, component clearances or manufacturing tolerances.

[Source provenance](../../sources/README.md) and the [manifest](../../sources/manifest.json) record the original filename and checksums. The preview is an existing rendered representation; the underlying STL bytes are preserved.

## Presentation compact model

[Compact B v1 STL](stacked_headboard_compact_B_v1.stl) was supplied by Howard on September 22, 2026 and is preserved byte for byte, with only the filename normalized. The [HTML presentation](https://howardwhsrun.github.io/FPGA_4K/) uses this model without geometric changes. It is separate from the original model above. The compact envelope is 55 × 24 × 15.75 unspecified model units; no millimeter dimensions are inferred. See the [presentation guide](../../presentation/README.md).
