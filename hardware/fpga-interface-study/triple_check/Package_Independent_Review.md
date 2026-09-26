# Independent review-package audit

Packaging integrity: **PASS**. Both archives remain review-only. No native KiCad CLI was run and no CAD/source files were modified.

| Check | Rail revision | Mezzanine study |
| --- | --- | --- |
| ZIP files | 57 | 29 |
| Placed footprints | 128 | 128 |
| Unique footprint definitions used | 15 | 16 |
| Byte-identical native CAD files | 22 | 2 |
| Schematic sheets included and reachable | 20 | 0 |

The rail hierarchy contains its root plus all 19 referenced sheets (five FPGA units and fourteen support-circuit sheets). All used custom footprints resolve through included project-relative tables; all used rail custom symbols resolve to the included libraries and are embedded in their sheets. The mezzanine study is intentionally PCB-only. The rail PDF has 20 pages and no embedded attachments; its metadata and extracted text contain no home-directory/private-source paths.

Every native project, PCB, and schematic byte matches the original source revision. Every manifest hash and file size was recalculated from the ZIP; source hashes were separately recalculated from current source files. ZIP CRC, member names, complete manifest coverage, duplicate checks, and symlink checks pass.

The mezzanine footprint table differs from the source only in its library URI fields, now `${KIPRJMOD}/../libraries/...`. All other table fields are unchanged. No archive includes absolute home/library paths, original private ASIC/carrier/source documents, repository internals, credentials, or working-session/backup files in the audited inventory. The provided design files and documentation remain traceable to the manifest sources.

Standard `${KICAD10_3DMODEL_DIR}` assets are referenced but not bundled; the README discloses the dependency on the KiCad installation. This affects optional 3D rendering, not the included footprint geometry.

Archive hashes:

- `FPGA100T_Rail_Revision.zip`: `572095bb6d01cc64c407c1c23d586329a099563b0649d7cec378f6092cdfdf6e`
- `FPGA100T_Mezzanine_Study.zip`: `78021a553d5dd36503554068878f7c244d406b589a2b2c17983c313a523ec4fb`

PCB source hashes:

- `full_system/hardware/FPGA100T_Full_System.kicad_pcb`: `c71578d3e72d22d84c3cf635c6935c736940c9ae5b3f8de2a5dd404a9f00a547`
- `release_audit/mezzanine/FPGA100T_Mezzanine_Fit.kicad_pcb`: `186018ad28d31eb3d8fee4193a32731632a9bf9cab2c4652414a9bad40169750`

See [machine-readable evidence](Package_Independent_Review.json) for each source/file hash, every footprint/symbol resolution, and hierarchy edge. This packaging check does not approve electrical operation or fabrication.
