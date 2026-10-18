# V42 independent preservation review

PASS against the frozen V41 source.

- V41 source manifest: 249 files checked.
- The only moved component is D601; all 88 other footprints remain byte-identical.
- D601 is now on B.Cu at (141, 55) mm; its component, pad, and net definitions are preserved.
- Every retained original track and via is byte-identical, including the original D601 anode trace. Only its obsolete ground stub and via were removed.
- Added copper: five indicator-branch segments and two vias. No unrelated routed net changed.
- All 21 zone definitions are preserved. Only In1 DGND, In4 DGND, and In3 VDCIN native fill caches changed; locality is verified in the separate fill audit. The earlier implementation note naming the In3 zone as LDO_3V3 was corrected from the actual saved zone/net evidence.
- Native schematic net memberships are unchanged; the schematic circuit/notes, rules, settings, and libraries are preserved.
- Revision titles and the Dwgs.User board version annotation identify V42; the latter is a drawing annotation, not fabricated silkscreen.

## Checks

- PASS: V41_frozen_manifest
- PASS: audited_final_PCB_identity
- PASS: unrelated_footprints_byte_exact
- PASS: D601_pad_electrical_and_manufacturing_properties_preserved
- PASS: D601_component_properties_preserved
- PASS: D601_bottom_position
- PASS: segment_original_objects_exact
- PASS: via_original_objects_exact
- PASS: only_old_D601_ground_objects_removed
- PASS: original_D601_anode_segment_retained_exactly
- PASS: new_copper_only_indicator_branch
- PASS: board_text_only_D601_label_and_revision
- PASS: D601_label_moved_to_bottom
- PASS: all_zone_definitions_preserved
- PASS: only_expected_zone_fill_caches_changed
- PASS: separate_native_fill_geometry_locality_receipt_matches_final_board
- PASS: all_other_board_nodes_byte_exact
- PASS: schematic_circuit_and_notes_byte_exact
- PASS: project_settings_preserved_except_name
- PASS: design_rules_byte_exact
- PASS: libraries_models_and_reference_sources_preserved
- PASS: native_netlist_membership_unchanged

Preservation and native netlist comparison; local copper-fill geometry locality and manufacturing/visibility checks are separate receipts. Does not establish working hardware.
