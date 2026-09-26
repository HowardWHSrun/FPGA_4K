# Ground escape review — 26 September 2026

The selected final board, SHA-256 `ae601df3925e5ec5e90c8a2e747356e432d0558e820199cf7c01c6bf8a7fef96`, was independently rechecked without saving it. Native DRC confirms **eight GND missing connections: the seven BGA-area groups below plus U4.11**, the VSEL strap assigned to ground. U4.3 is the regulator ground pin. All 25 boot/configuration/clock/JTAG nets and all three sequencing nets remain complete. See [independent final audit](Final_Independent_Audit.md).

The 33 × 36 mm board still needs a coordinated BGA escape plan. The bounded repairs below were **rejected** because they reopened configuration/flash signals. They are not part of the selected PCB. No component was moved, no design rule was relaxed, and no via-in-pad, microvia or HDI construction was introduced.

## Exact congested ground connections

| Ground connection | Position / members | Main nearby routing constraints |
|---|---|---|
| U1.A2 | (14.0, 11.7) mm | FPGA_CFG_DQ2 / FPGA_CFG_DQ3 front routes; C26/C79 and FPGA_CFG_DQ0 on the back |
| U1.F11 | (21.2, 15.7) mm | JTAG_TCK via/inner routing, FPGA_CCLK routes, C90/C36 |
| U1.J9 | (19.6, 18.1) mm | FPGA_CFG_DQ2 / DQ3, CFG_M1 / M2; C90/C91 and FPGA_CFG_DQ1 on the back |
| U1.K10 | (20.4, 18.9) mm | FPGA_CFG_DQ2 / DQ3, CFG_M1 / M2; C90/C45 and FPGA_CFG_DQ1 |
| U1.M11 | (21.2, 20.5) mm | FPGA_CFG_DQ2 / DQ3, CFG_M1 / M2 and FPGA_PROGRAM_B; C43/C45 |
| U1.N12 | (22.0, 21.3) mm | FPGA_CFG_DQ3 and CFG_M1; C43 |
| Back-side ground island | C79.2, C33.2, C91.2 | Dense capacitor pads and crossing routes restrict conventional through-via sites |

These are seven geometrically identified problem groups. A zone can contain several disconnected filled polygons, so simply finding a via somewhere in the zone does not prove that a particular ground ball is connected. Native DRC is authoritative for the selected revision's actual remaining connection count.

## Bounded repair evidence

The source checkpoint was `FPGA100T_33x36_Checked.kicad_pcb`, SHA-256 `d68d8cc1fd6d9556cccaac31bfd364e2f556a79f2d765c8cad1e7b24e6ddf264`. Its native report contained nine GND missing-connection items: one at the left-side power circuitry and eight involving the local BGA ground zones. Subsequent power-ground corrections may change this count; use the final selected board's fresh report, not this historical trial count.

Fixed-route searches found no legal conventional escape within an 8 mm surface search radius for the listed isolated pads. Native shape checks identified the obstacles around their four nearest diagonal via sites.

Two ground-first trials temporarily removed only `FPGA_CFG_DQ2`, `FPGA_CFG_DQ3`, `FPGA_CCLK`, `CFG_M1` and `CFG_M2`. Explicit ground escapes were added first, then those five signal nets were rebuilt:

| Trial | GND missing connections after refill | Signal regressions | Decision |
|---|---:|---|---|
| 1 | 2 | FPGA_CFG_DQ2 and FPGA_CFG_DQ3 open | Rejected |
| 2 | 4 | FPGA_CFG_DQ2 and CFG_M2 open | Rejected |

Each trial added eight ground vias and escaped nine targeted pads, but changed surface signal paths could strand other ground copper. For example, trial 1 left a new isolated U1.C8 ground region. Neither lower total unconnected counts nor a locally successful ground via justified sacrificing complete signal nets.

The trials retained every component position and all power/left-side ground copper. Full native reporting also exposed additional hole-clearance messages involving unchanged left-side PG/GND objects already present in the source; these were separate from the BGA repair and handled by the power-ground correction.

## Required next engineering step

Plan the BGA ground, supply and signal escapes together, reserving conventional via sites and explicit return connections before completing nearby flash/configuration routes. A broader local placement or escape-path revision may be required. The bounded search does not prove that 33 × 36 mm is impossible; it demonstrates that the present local routing cannot be declared complete by adding isolated stitches or moving one capacitor alone.

Only the selected complete-signal checkpoint should be published. Failed trial CAD must remain private engineering evidence. The final board must retain all 25 boot/configuration/clock/JTAG nets and all three sequencing nets while its remaining ground connections are resolved.
