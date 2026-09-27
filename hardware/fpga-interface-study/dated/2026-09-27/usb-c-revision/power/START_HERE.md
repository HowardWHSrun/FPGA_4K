# USB-C power handoff — 27 September 2026

This folder defines the proposed USB-C input circuit for the existing four-rail FPGA board. It contains the pin-level design and source-bound physical routing candidates. The USB-C board is not yet a tested device or fabrication release.

- [Exact components and pin/net map](USB_C_Power_Components.json)
- [Design explanation and remaining qualification](Power_Design_Review.md)
- [Hardware enable divider and worst-case margins](PG_Enable_Divider_Review.json)
- [Calculated thresholds, loading and ramps](Power_Design_Screening.json)
- [Custom TCPP, eFuse and compact MOSFET footprints](USBPower.pretty/) and [native footprint readback](Footprint_Readback.json)
- [Compact MOSFET physical-land readback](Q200_Compact_Footprint_Readback.json)
- [Primary-document inventory and hashes](evidence/Accepted_Source_Inventory.json)

The existing 135.5 µF nominal FPGA input capacitor bank stays behind the new eFuse. The MCU starts from a separate 3.3 V supply and must authorize the main load only after power negotiation. USB-C data/mux/JTAG and firmware are documented by the interface owner. The layout owner integrates these isolated candidates after source and native-rule checks; do not replace the latest integrated board with an earlier power-only copy.

Current physical results: [integrated native audit](../reports/USB_C_Native_Audit.json). Intermediate isolated routing candidates remain in the local engineering workspace; this package contains the current integrated project.
