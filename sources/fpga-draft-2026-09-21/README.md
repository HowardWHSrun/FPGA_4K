# FPGA draft import evidence — 21 September 2026

**PARTIAL DESIGN — NOT FOR MANUFACTURE.** These are historical records for the initial [working FPGA project](../../hardware/fpga-board/README.md). They do not automatically update when the CAD changes.

## Provenance and scope

Source: Howard's saved `Howard_PCB_Size_Study/FPGA_PCB_Connected` project, developed locally with AI assistance. This is an independent engineering draft, not an original board supplied or approved by another designer. Imported at Howard's request to support team PCB collaboration. Engineering review and qualification remain pending.

[import-baseline.json](import-baseline.json) records the source label, size and SHA-256 of each of the 286 native CAD and library files. All were copied byte-for-byte. The current CAD is editable; keep this initial record unchanged and use Git history for later revisions.

Selected source reports and ledgers were copied below. Workstation-specific source-directory prefixes, if present, were replaced with the relative source label; source and published hashes are recorded in the main manifest. Excluded: lock/preferences files, backups, rejected candidate boards, experimental generators, private chat/audio and unrelated personal material. The package contains the saved editable design, not its historical generation environment. Required custom symbols and footprints are included; standard 3D models depend on a normal KiCad library installation.

## Verification

Native KiCad 10.0.6 checks were rerun on the repository copy: **0 general DRC violations, 270 unconnected items, 0 schematic parity issues; ERC: 661 unconnected pins and 21 undriven power pins**. See [handoff-verification.json](handoff-verification.json). The original [DRC](routed_drc.json) and [ERC](erc.json) reports describe the same known outstanding work.

The following categories were already disabled in the source project and remain unchanged:

- DRC: `footprint_filters_mismatch`, `footprint_type_mismatch`, `missing_courtyard`, `track_not_centered_on_via`, `tuning_profile_track_geometries`.
- ERC: `footprint_filter`, `four_way_junction`, `simulation_model_issue`, `single_global_label`.

These results apply only to enabled checks. Generic passive IC pin types further limit ERC. Clear geometry does not prove correct pin functions, continuous power delivery, timing, SI/PI, thermal performance or manufacturability.

## Dated engineering ledgers

- [Draft BOM](BOM_Draft.csv): candidate values/order codes and unresolved qualification; not an approved procurement list.
- [Unresolved pin ledger](Unresolved_Pin_Ledger.csv): open pin assignments at import.
- [Filled-copper reachability](filled_connectivity_20260921.json): reaching matching plane copper does not prove every island is joined or a regulator operates.

The source board hash is `0c7fcd69af90aed69761398ca1ac4edc06444f5968559bccd5eedfdd4ae280b3`. Regenerate evidence for subsequent commits. No fabrication output is included.
