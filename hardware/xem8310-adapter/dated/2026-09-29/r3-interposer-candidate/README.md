# XEM8310–BRK8310 interposer, R3 candidate

29 September 2026 · **connection study, not an editable KiCad schematic, routed PCB or fabrication release**

The purchased XEM8310 currently plugs directly into its separate BRK8310 breakout board. R3 studies a new board between them, with a custom micro-HDMI receptacle; no adapter route has been selected. Access through BRK J1 Bulls Eye while keeping the current stack is another option, but needs specialized mating/test hardware. This package is a byte-for-byte copy of the dated local R3 SVG, rendered PNG and 19-contact CSV, plus this website-specific explanation. The earlier [R2 direct-XEM KiCad schematic](../r2-12v/README.md) remains available as history.

- [Full-size visual connection schematic](BRK8310_Interposer_R3_Candidate.svg)
- [PNG preview](BRK8310_Interposer_R3_Candidate.png)
- [19 cable contacts and shield](Pinout_R3_Interposer_Candidate.csv)
- [Interactive adapter page](../../../../../presentation/adapter/)

Three custom-FPGA recording pairs enter XEM GTY bank-226 RX0/RX1/RX2 at MC3 41/43, 45/47 and 49/51. XEM TX0 leaves MC3 42/44 and returns commands to the custom FPGA on cable contacts 12/14. The selected eight high-speed conductors go **only** to the cable. Their matching BRK-facing MC3 contacts are isolated so BRK J1 Bulls Eye does not become a high-speed stub. Other connector contacts are planned as pass-through, including the bank-224/225 PCIe path to BRK J6 and XEM JTAG path to BRK J3.

Cable contact 19 is allocated to 12 V for the custom FPGA, routing board and ASIC assembly, but no protected power circuit or qualified current budget exists. A custom-FPGA JTAG probe connection is planned separately from XEM JTAG. A USB-to-custom-FPGA JTAG bridge and the four-lane XEM/custom-FPGA link remain implementation tasks. Clock selection, mirrored top/bottom connector pin numbering, stack height, PCIe performance, cable quality and signal integrity are unverified.

The pin map is based on the [official XEM8310 pin list](https://pins.opalkelly.com/pin_list/XEM8310.pdf), [XEM expansion-connector details](https://docs.opalkelly.com/xem8310/expansion-connectors/), [BRK8310 interface description](https://docs.opalkelly.com/xem8310/brk8310-breakout-board/) and the custom 50T netlist in the dated local review. The source paths and SHA-256 hashes for the published copies are recorded in [the manifest](../../../../../sources/manifest.json).
