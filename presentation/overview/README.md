# Current hardware overview — V1

14 October 2026. [Open the overview](../../index.html) · [Standalone FPGA](../../index.html#fpga) · [Revision sources](Source_Mapping.json).

| Design | Current revision | Outline | Review status |
|---|---|---|---|
| XEM8305 carrier | V17 | 53 × 83 mm | Grid-aligned schematic; V16 copper/placement preserved. Factory and powered qualification open. |
| Standalone FPGA | V41 | 25 × 23 mm | 116/116 mezzanine paths and 125 MHz clock routed; 445 board opens remain. |
| Separate ASIC LDO | V5 | 32 × 32.5 mm | 32 LT3046 stages; unrouted, 731 gaps; canonical DRC is not clean. |
| Combined FPGA/shared LDO | V7 | 30 × 30 mm | Eight shared LT3046 stages; unrouted, 827 gaps; canonical DRC and supply feasibility remain open. |

The current views reuse the published V41 FPGA and V5 LDO models and native viewers. Carrier 3D/layout retain V16 geometry because the V17 update preserves the physical design. The complete carrier schematic and downloadable project are V17. V7 has native front/back placement and a complete schematic; no earlier V6 model is labeled V7.

All four complete native KiCad ZIPs are linked from the current board selection. Exact sources, hashes and transformations are in the revision mapping. The [V7 canonical DRC](assets/Combined_V7_Canonical_DRC.json), [V7 placement geometry audit](assets/Combined_V7_Placement_Audit.json) and [V17 check summary](assets/Carrier_V17_Check_Summary.json) retain their original scopes.

These are design reviews and nominal 3D illustrations. They do not establish fabrication acceptance, populated mating, thermal performance or powered acquisition. The separate and combined compact paths still need ASIC distribution/stack-adapter design.

The [previous root overview](../../overview-2026-09-23.html) is preserved byte for byte, with its existing dependent files. Earlier meeting pages and native source projects are unchanged.
