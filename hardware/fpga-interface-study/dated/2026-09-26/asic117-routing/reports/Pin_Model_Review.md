# Pin-model review: leave electrical findings visible

26 September2026. Read-only review; no symbol types or ERC settings were changed.

**FB2:** retain the generic open-collector/open-drain model. TI TPS62135 RevB page3 identifies pin4 as the drain of an internal ground switch controlled by VSEL. Page16 Figure5 shows the grounded connection for the one-divider application. The device's valid grounded use conflicts with KiCad's generic power-output versus open-collector rule; this is not evidence that the physical grounding is incorrect. Do not globally retype FB2 as passive merely to clear ERC. A later reviewer may document four narrowly scoped application-specific exceptions while retaining checks for other outputs. [TI datasheet](https://www.ti.com/lit/ds/symlink/tps62135.pdf).

**DXP/DXN:** the custom FPGA symbol's bidirectional digital type is an imprecise abstraction. AMD UG475 v1.20 Table1-12 page26 describes diode terminals and directs unused terminals to ground. A passive diode-terminal model is defensible as a future library correction; it would need consistent changes in the local library and all embedded cached symbol copies. The present warnings remain visible. [AMD package guide](https://docs.amd.com/v/u/en-US/ug475_7Series_Pkg_Pinout).

**M1:** the additional grounded mode pin in the isolated fixed-SPI candidate is a dedicated input according to AMD UG470 Table2-4 page20. Its custom bidirectional type can create another generic ERC warning. The direct-ground circuit is supported by the manufacturer. This source-based model correction can be considered with the other FPGA dedicated inputs rather than weakening the entire ERC conflict matrix. [AMD configuration guide](https://docs.amd.com/v/u/en-US/ug470_7Series_Config).

KiCad pin types control ERC compatibility; they are not a transistor-level electrical simulation. Neither broad rule suppression nor type changes establish operating voltages, currents, timing or physical ground continuity. [KiCad schematic documentation](https://docs.kicad.org/10.0/en/eeschema/eeschema.html#pin-electrical-types).

The initial post-integration ERC report records97 unassigned endpoints,4 FB2 model conflicts and7 warnings. The fixed-M1 revision requires a refreshed report; these counts must not be copied blindly to a later candidate. Four inherited ignored checks are recorded in ASIC117_ERC_Summary.json; no new exclusions or ignored checks were added by this work.
