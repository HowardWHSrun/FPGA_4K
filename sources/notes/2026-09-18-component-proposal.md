# Howard's proposed component list

> Imported dated source note; links adapted for this repository. Read [current status](../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Source: Howard's message requesting a new KiCad PCB design, 18 September 2026. The component proposal below is preserved in substance; typography and spacing have been normalized. Words such as “candidate,” “provisionally,” and “TBD” remain design qualifications, not approvals.

## FPGA PCB

- **1 × XC7A200T FPGA.**
- **1 × 256 Mbit / 32 MiB QSPI boot-flash chip.** Candidate: S25FL256SAGMFI000, for automatic FPGA startup.
- **1 × micro-HDMI receptacle**, plus **1 cable per system**. Exact connector, pinout and signaling depend on the receiver design.
- **1 × JTAG programming/debug connector.**
- **1 × FPGA reference oscillator.** Currently considering 100 MHz; confirm against the acquisition and output-link clock requirements.
- **1 × ADP5052 power-controller IC**, provisionally. Its four-buck arrangement uses **4 inductors and 1 dual-MOSFET package containing 2 switches**. Rail assignments and component values still need calculation.
- **FPGA and peripheral capacitors, feedback resistors and startup components:** quantities TBD after the micro-HDMI bank-voltage and power plan is fixed.
- **1 external recording-RAM device provisionally**, with capacity and exact part TBD. This is separate from boot flash.
- **Routing-board connector(s):** quantity and contact count TBD from the complete signal/power map.
- **Micro-HDMI interface support:** protection, termination and any required driver/receiver components; quantities TBD once the electrical interface is selected.

## Routing PCB, to review with Zitong

- **4 carrier interfaces provisionally**, assuming one connector per carrier.
- **FPGA-facing connector(s):** quantity/contact count TBD.
- **7 low-voltage regulators per proposed supply group**, with **7 setting resistors: 5 × 15 kΩ, 1 × 16 kΩ and 1 × 7.5 kΩ**. The number of groups and any existing carrier regulation need confirmation.
- **Filtering capacitors, power connections and test points:** quantities TBD from the final supply arrangement.
- **Clock buffers/damping and stimulation-supply circuitry:** include where required; implementation and quantities remain open.

## How this proposal is used in RevC

This list is the input requirement for a new FPGA-board draft. Exact footprints and quantities instantiated for a placement experiment must be identified as implementation candidates or reserved space until their electrical design is settled. The routing PCB is a separate design to coordinate with Zitong; its regulators and four carrier interfaces do not automatically belong on the FPGA PCB.

The latest list requests a dedicated JTAG connector. Earlier discussion of JTAG pads or sending programming signals through micro-HDMI does not replace that request. A shared micro-HDMI/JTAG scheme would require a later explicit pin-allocation and electrical design decision.

Related files: [routing handoff](2026-09-18-routing-handoff.md) and [current project decisions](2026-09-18-current-decisions.md).
