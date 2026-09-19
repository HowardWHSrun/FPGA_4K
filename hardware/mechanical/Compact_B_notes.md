# Compact routing-board bridge concept

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Date: 2026-09-18

The user confirmed the overall interpretation of the supplied assembly: A is the four-board ASIC-carrier stack with two ASICs per board, B+C is the routing PCB, and D is the FPGA PCB. XC7A200T was selected earlier in this conversation. The user stated that dimensions may be inaccurate and authorized reducing section B for a smaller form factor.

## Proposed geometry

`stacked_headboard_compact_B_v1.stl` keeps the ASIC-carrier stack in place and moves C and D together 10 model units toward it. The exposed longitudinal span between A's right edge and C/D's left edge reduces from 15 to 5 units. Overall length falls from 65 to 55 units (15.4%). Width remains 24 and total height 15.75. STL units are unspecified; none of these numbers are confirmed millimeters.

The new 5-unit spacing is a reviewable proposal, not a specified connector clearance or a proven minimum. B retains its modeled width and thickness. This revision does not narrow its available routing corridor.

The original file in Downloads is unchanged. The model's A carrier geometry, C main routing-board area, D FPGA-board area, vertical spacing and placeholder component envelopes remain unchanged. C/D are translated as one group. The old 35T electrical CAD has not been migrated by this mechanical edit.

## Open engineering inputs

- Actual XC7A200T package/speed/temperature ordering code, real component outlines and routing/assembly clearances.
- Updated ASIC bonding map, carrier arrangement dimensions and current power/interface specifications.
- Board-to-board connector selection, mating height, insertion clearance and mechanical support.
- Whether the connecting section is rigid PCB, flex, or another construction; this STL edit preserves only its existing geometric representation.
- ASIC power-regulator location, external power entry and downstream KR260 connector/cable placement.
- Required weight, thermal limits and assembled envelope, if used as a head-mounted assembly.

Mesh checks are recorded in `compact_B_validation.json`. They cover binary STL consistency, triangle nondegeneracy, edge topology, dimensions and rigid preservation of the retained regions; they do not establish electrical routability, assembly fit or manufacturing readiness.
