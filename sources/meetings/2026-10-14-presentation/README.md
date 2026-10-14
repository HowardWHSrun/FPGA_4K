# Wednesday 14 October 2026 presentation · V16

[Open the eight-page deck](../../../presentation/meetings/2026-10-14-v16/index.html) · [presenter notes](../../../presentation/meetings/2026-10-14-v16/notes.md) · [runtime file hashes](../../../presentation/meetings/2026-10-14-v16/File_Manifest.json) · [source mapping](../../../presentation/meetings/2026-10-14-v16/Source_Mapping.json).

Howard Wang requested this weekly FPGA/LDO presentation and its revisions. Current board sources are the XEM8305/LDO carrier V16, standalone FPGA V41, separate LT3046 LDO V5 and combined FPGA/LDO V6. Original historical native R/S identifiers are preserved in source bytes; display versions use V. The FPGA pages precede the single FPGA + LDO comparison page. This is presentation preparation; no meeting outcome is inferred.

The bundle contains the exact native PCB snapshots needed by the layout viewers, source-backed browser meshes, complete one-page schematic exports and third-party viewer dependencies/licenses. Paths and metadata are packaged for a self-contained static host; local workstation paths and redirects are removed. No unrelated private history, source project/library trees, raw supplier model archives or CAD edits are included. Runtime mesh/source checksums identify the corresponding saved CAD.

The combined PCB retains all 323 other component/copper records from the separate 135 + 192-site boards, removing four footprints across two mating mezzanine pairs and joining 116 digital signals internally. FPGA, ASIC and stimulation power entries remain independent. Separate-board schematics retain all 327 records. Dimensions are FPGA 25 × 23 mm, LDO 32 × 32.5 mm and combined 35 × 35 mm.

The separate assembly uses a nominal 1.5 mm mating gap; populated fit remains under review. Combined and LDO placement are unrouted, while the standalone FPGA retains its saved routing checkpoint. Browser illustrations and static native checks do not establish electrical operation, full routing/timing closure, manufacturing readiness or qualified assembled fit.
