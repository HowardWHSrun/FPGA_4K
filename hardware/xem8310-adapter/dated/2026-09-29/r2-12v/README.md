# XEM8310 µHDMI receiver adapter — R2 connection draft

29 September 2026. This is a portable publication snapshot of the local R2 handoff, not a new CAD revision or a manufacturing release. It was copied from the dated FPGA PCB workspace after Howard selected 12 V on cable contact 19.

> **Historical direct-XEM route:** R2 would mate to the XEM connectors in place of BRK8310. The XEM is currently seated on BRK8310, and the [R3 interposer candidate](../r3-interposer-candidate/README.md) is the current architecture under review. This R2 project remains an editable record of the earlier electrical mapping.

- [Complete editable KiCad project ZIP](XEM8310_MicroHDMI_Adapter_R2_12V.zip): root and two child schematic sheets, local symbol library and table, project settings and README. Optional KiCad `.kicad_prl` editor preferences are excluded.
- [Three-page connection schematic](Adapter_R2_12V.pdf)
- [All 19 cable contacts and shell](Pinout_R2_12V.csv)
- [R1-to-R2 voltage revision check](Voltage_Revision_Check.json)
- [Website explanation of the current R3 architecture](../../../../../presentation/adapter/)

R2 wires three recording pairs into XEM8310 GTY RX0–RX2 and one command pair from GTY TX0 to the custom FPGA. It has separate XEM and custom-FPGA JTAG probe headers. Cable pin 19 is named `CABLE_12V_RESERVED` but has **no source, protection or current limit** in this schematic. No PCB or connector footprints are included. The XEM-to-custom-FPGA USB/JTAG bridge and the single-input 12 V distribution are plans for a later revision.

Howard subsequently chose to send ASIC programming commands over the existing reverse high-speed pair and generate CLK, DATA and LATCH in the custom FPGA. That decision changes the intended logic, not the R2 connector nets. The FPGA-to-routing-to-ASIC data fanout and power feed remain open.

The copied PDF, CSV and JSON retain their source bytes. The ZIP is a portable package of the source project, excluding only editor preferences. Source provenance and hashes are recorded in [the repository manifest](../../../../../sources/manifest.json).
