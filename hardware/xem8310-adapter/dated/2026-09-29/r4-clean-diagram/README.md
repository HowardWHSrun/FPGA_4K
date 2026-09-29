# R4 receiver-adapter connection diagram · 29 September 2026

[Open the clear SVG diagram](BRK8310_Adapter_R4_Overview.svg) or [PNG preview](BRK8310_Adapter_R4_Overview.png). These are unchanged copies of the local dated R4 study in `2026-09-29_FPGA_Work/05_BRK8310_Adapter_R4_Diagram/`.

The drawing distinguishes the present XEM8310-on-BRK8310 assembly from a proposed third-board interposer. It assigns three recording pairs and one reverse control pair to XEM GTY bank 226, illustrates selected BRK J1 contacts left isolated, and shows the intended pass-through to BRK J6 for a later PCIe option. The alternate BRK J1 Bulls Eye route remains open.

This is a **connection diagram**, not a released electrical schematic, pin-complete pass-through netlist, PCB, assembly model or fabrication package. Connector orientation and height, reference clock, 12 V source/protection/return, JTAG probe access, controlled-impedance routing and signal integrity still require engineering checks. The [R3 detailed candidate map](../r3-interposer-candidate/README.md) and [older direct-XEM R2 schematic](../r2-12v/README.md) remain separate.
