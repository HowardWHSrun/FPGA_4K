# Current pin model and intentional unused pins

2026-09-27. The integrated schematic keeps all findings visible: **19 reserved-pin errors, four FB2/GND electrical-type conflicts and one analog-reservation warning**. No ERC exclusions or severity changes were added.

The 19 reserved endpoints are eight U1 bank-16 balls (C9, B9, B8, A8, C11, C10, A10, A9), eight J4 future-data contacts (3, 5, 6, 8, 9, 11, 12, 14), and J5.34, J6.37, J6.59. They need a future interface implementation, so they are not marked intentional NC merely to silence ERC.

**83 endpoints are intentionally NC:** 81 FPGA balls and U4.7/U5.7, the two unused final power-good outputs. R12 and the unconsumed PGOOD_IO branch were removed. PG_CORE and PG_AUX retain the startup sequencing. [The exact cleanup evidence](R12_Removal.json) and [native endpoint comparison](R12_Native_Netlist_Validation.json) preserve the change. TI TPS62135 section 9.3.2 permits unused PG to be left open.

For the FPGA, [the 89-ball classification](U1_Unused_Pin_Classification.csv) distinguishes 81 unused balls from the eight future-link reservations. L14/D02 and M14/D03 are unused because the selected SPI x1 boot omits optional quad-data paths and R106/R107. Flash WP# and RESET# retain their separate 4.7 kΩ pull-ups. A13 is unused because AC_IN requires an external analog source; it must not be connected to an FPGA digital pin. Eight negative clock-pair pads are unused because the corresponding positive pads receive single-ended LVCMOS15 returned clocks. The schematic NC marker does not configure hardware: the final bitstream must explicitly set unused SelectIO behavior.

Fifteen dedicated U1 pin types are corrected in the local symbol and all cached instances: configuration mode pins P11/P12/P13, CFGBVS P8, PROGRAM_B P9, TCK E10, TDI E11 and TMS E12 are inputs; TDO E13 is tri-state; VP/VN/VREFP/VREFN are inputs; DXP/DXN are passive. CCLK, INIT_B and DONE remain bidirectional. The model/NC changes preserved all existing functional endpoint sets. Later R12 removal deleted only the status net and its AUX pull-up endpoint. R113 removal deletes its two endpoints and changes U1.P11/M2 to GND; SPI x1 removes R106/R107 and marks L14/M14 NC; the two documented connector reassignments preserve FPGA balls. Their exact deltas are preserved in the current application reports.

The four FB2 conflicts concern U2–U5.4. The unused switched-divider pin is grounded per the selected TPS62135 application; KiCad's generic open-collector type reports a conflict with the ground power pins. This application-specific discrepancy is documented, not globally suppressed. A final release reviewer must accept that interpretation or refine the symbol in a traceable way.

J5.46 carries the single-pad `AC_IN_ANALOG_RESERVED` net and therefore warns about its isolated label. This is an intentional reservation for an external 0–1.5 V analog source on the ASIC/routing side; it is not a functioning analog source or a missing FPGA route.

Sources: [AMD UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config), [UG475](https://docs.amd.com/v/u/en-US/ug475_7Series_Pkg_Pinout), [UG480](https://docs.amd.com/v/u/en-US/ug480_7Series_XADC), and [TI TPS62135](https://www.ti.com/lit/ds/symlink/tps62135.pdf). These model explanations do not qualify power, timing, assembly or operation.
