# Third-pass pin and boot audit

2026-09-26. Read-only review of the saved native netlists, KiCad PCB objects, package sources and constraints. No CAD or public checkout changed; no Vivado or hardware test performed. [Machine-readable evidence](Pin_Boot_Review.json).

**Result: no package-ball or existing boot-net mismatch found. The signal count is consistent. The current release gaps are a revision-specific bring-up package, actual application/clock allocation, startup control states, and the physical ASIC/board mapping.**

## Concrete findings

**PB-01 — The runnable bring-up example belongs to the earlier board.** At inspection, root [`bringup/README.md`](../research/Current_Design_Bringup_Status.md) described 5 V input, test points, J2/J3 and an R11 LED. Root `build.tcl` builds that LED design using LVCMOS33 and 3.3 V configuration settings. Neither current derivative has the LED, headers, jumper or test points; both use the custom power/JTAG connector. `full_system/bringup/core.xdc` correctly changes P17/configuration to 1.8 V, but has no accompanying HDL/build/test package. Clearly label the root files as legacy-only and provide the current revision's procedure before bring-up. Copying root constraints into the 1.8 V design is invalid. A JTAG-readable test can replace the removed LED, but that test is not implemented here.

**PB-02 — The 117 names are logical slots, not a physical handoff.** All three baseline CSVs are identical: 117 unique names, 88 inputs, 27 output roles and two unresolved roles. The source arithmetic is `88 + 9 + 4 + 12 + 4 = 117`, including Gerald's four added SPI clocks. The tutorial expands the 88 as **64 DATA + 8 returned CLK + 8 READ + 8 SYNC**: eight sets of eleven signals, not 88 data-only wires. It does not identify which numbered recording ASIC is each `STIM_CHIP` or which pair occupies each of four board-clock domains. The twelve programming-data nets mix four chip-specific L/R pairs and two board-shared L/R pairs; mapping that topology onto eight numbered ASICs remains necessary. AC_IN/IMP_TST findings are preserved in the [second-pass evidence](../research/AC_IN_IMP_TST_Primary_Source_Review.md); no new function inferred.

**PB-03 — Startup behavior is still an application contract gap.** Both native designs pull PUDC_B high through 1 kΩ; both applicable XDC templates use `UNUSEDPIN Pullnone`. These choices deliberately avoid internal user-pin bias. They do **not** establish inactive ASIC reset/stimulation controls while FPGA or ASIC rails ramp, during configuration, after a configuration failure or during reprogramming. Define the required external idle states and power-valid interlocks before connecting the application; do not assume an unloaded HDL output supplies them before configuration. This can require resistors/interlock logic without adding another named user I/O. [AMD UG470, PUDC_B definition](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content).

**PB-04 — FPGA ordering code remains incomplete.** Both BOMs still say speed/temperature grade TBD. A 15 × 15 mm CSG324 package alone does not establish core voltage or 800 Mbit/s timing. Standard 1.0 V operation is consistent with the present rail design; -1LI requires 0.92–0.98 V and is not interchangeable. The old build guard excludes low-voltage variants appropriately, but neither the purchased part nor a full-system build is established. [DS181 recommended conditions](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

## Pin and connector accounting

All **324** official CSV/TXT records agree, all 324 symbol pin names match them in each saved native netlist, and all **324 physical U1 pad/net assignments** match the corresponding netlist in each PCB. The package has **210 user I/O**: banks 14/15/34/35 each 50, bank16 10; there are no bonded GTP pins in this package. [Official AMD package source](https://www.amd.com/en/developer/resources/adaptive-socs-and-fpgas/package-pinout-files/artix-7-package-device-pinout-files.html).

The seven physically reserved user I/O are K17/K18/L14/M14 (four flash data), L13 (flash CS), L15 (PUDC_B), P17 (oscillator). CCLK, mode pins, JTAG, PROGRAM_B, INIT_B and DONE are dedicated pins. Hence **203 unassigned user I/O** is correct; nine was the supplied reference-board estimate and eight belonged to the earlier one-LED draft.

With the proposed eight-pad differential link, `210 − 7 − 117 − 8 = 78`. Voltage-specific headroom matters: **150** I/O in banks15/34/35 are on 1.5 V, giving **33** spare after reserving all 117. The other 45 are 43 bank14 pins plus two unmatched bank16 pins; they are not another 45 interchangeable 1.5 V outputs.

The connector proposal contains exactly **120 unique numbered contacts**, 117 baseline names once each, three reserved contacts and two separate blade records. Native J5/J6 each have 60 numbered pads and four GND blade solder lands; all application pads remain unassigned. Four lands belong to one blade, not four extra signal contacts. The manufacturer identifies QSH-030-D as 60 contacts with an integrated plane. Neither the three spare contacts nor the ground blades currently allocate ASIC supplies, analog references or high-voltage stimulation rails. [Samtec QSH/QTH catalog](https://suddendocs.samtec.com/catalog_english/qth.pdf). The connector proposal therefore establishes contact capacity, not a complete carrier power/interface contract.

## Eight returned clocks: bonded-pin capacity passes

| Proposed 1.5 V bank | SRCC P/N groups | MRCC P/N groups | Usable single-ended clock inputs |
|---|---|---|---:|
| 15 | E15/E16, F15/F16 | D15/C15, H16/G16 | 4 |
| 34 | R3/T3, P4/P3 | T5/T4, N5/P5 | 4 |
| 35 | D5/D4, E2/D2 | E3/D3, F4/F3 | 4 |

There are **12 groups**, sufficient in raw pin count for eight returned clocks. AMD requires a single-ended clock on the **P side**; its N partner can be ordinary I/O but not a second dedicated single-ended clock. A *capacity illustration*, three/three/two eleven-wire ASIC groups per bank, uses 33/33/22 pins and leaves 62 places before the other 29 controls. This is not a committed assignment. [UG472 clock-capable inputs](https://docs.amd.com/api/khub/documents/1kFbRqzm2fhwGy~cLQG2yA/content).

Actual legality still depends on bank/clock-region placement of each associated DATA/READ/SYNC group, BUFIO/BUFR/BUFG/CMT use, clock relationships, CDC and input delays. The existing XDC defines **only the local 32 MHz reference**; it does not constrain the eight returned clocks or their data. No Vivado placement/timing evidence exists for that capture design. Do not mask an illegal clock allocation with `CLOCK_DEDICATED_ROUTE FALSE`.

Bank16's four complete pairs are **C9/B9, B8/A8, C11/C10, A10/A9**. D9 and D10 are unmatched N-side I/O, not a fifth differential pair. These four pairs accommodate the proposed three data lanes and forwarded clock at the pin-count level. The full-system revision supplies bank16 at 2.5 V, consistent with HR-bank LVDS_25 output requirements; the minimal core's 3.3 V bank16 is not that transmitter configuration. No pair-to-J4 net or link constraints are implemented. [UG471 I/O-standard supply requirements](https://docs.amd.com/api/khub/documents/IbGcnPFe6eF19RHma_Y~IA/content).

## Existing boot contract: consistent, not tested

| Item | Minimal core | Full-system development |
|---|---|---|
| VCCO_0 / bank14 / target JTAG reference | 3.3 V | 1.8 V |
| CFGBVS P8 | VCCO_0 | GND |
| Flash | MX25L12833FM2I-10G | MX25U12835FM2I-10G |
| Oscillator | ASE-32.000MHZ-L-C-T | ASE3-32.000MHZ-L-C-T |
| Mode M2/M1/M0 | Fixed 001 | Fixed 001 |
| Local oscillator P17 | 32 MHz, bank14 MRCC | Same ball, LVCMOS18 |

M0 is pulled high; M1/M2 low. Flash pin order is CS, DQ1, DQ2, GND, DQ0, CCLK, DQ3/RESET, VCC; CS/DQ2/DQ3 and PROGRAM_B/INIT_B/DONE have pull-ups to their own configuration supply. PUDC_B references bank14 correctly. Grounded VCCBATT and unused XADC inputs/references, powered VCCADC, and unused DXP/DXN are unchanged. No new mandatory reset header or mode jumper is needed: JTAG remains available in SPI mode. J4 exports its four signals, GND and target voltage reference. [AMD UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config), [UG480 pin treatment](https://docs.amd.com/r/en-US/ug480_7Series_XADC/XADC-Pinout-Requirements).

The changed flash is a documented **1.65–2.0 V, 128 Mbit, 200 mil SOP8** order code. AMD's current Artix-7 programmer table includes MX25U12835F under the **mx25u12872f** alias; installed Vivado selection/read-ID verification is still required. Its power-up wait is **800 µs after reaching minimum supply**; a power reset requires below **0.9 V for at least 300 µs**. A JPROGRAM/PROGRAM_B event does not itself reset the flash. The x1/nominal-3-MHz template is a conservative initial intent; rail-ramp/brownout/QPI recovery and actual cold boot remain untested. [Macronix PM1728 §§3, 13, 16](https://www.macronix.com/Lists/Datasheet/Attachments/8704/MX25U12835F,%201.8V,%20128Mb,%20v1.9.pdf), [AMD supported memories](https://docs.amd.com/r/en-US/ug908-vivado-programming-debugging/Artix-7-Configuration-Memory-Devices).

The ASE3 order options specify 32 MHz, −40…85 °C, ±50 ppm and tape/reel; 1.71–1.89 V matches the proposed rail. Pin 1 is enable tied high, 4 supply, 2 ground, and 3 output through R119 to P17. The oscillator's maximum startup at this frequency is 5 ms; firmware reset/recovery still needs a defined clock-ready scheme. [Abracon ASE3](https://abracon.com/Oscillators/ASE3series.pdf).

Evidence board hashes: minimal `3844c24f88697bec091e872c117a7889586df9be4053b912ec79253738d337c0`; full-system `c71578d3e72d22d84c3cf635c6935c736940c9ae5b3f8de2a5dd404a9f00a547`. This audit establishes identities, counts and saved net connectivity. It does not establish completed copper, fabric timing, electrical performance or manufacturing readiness.
