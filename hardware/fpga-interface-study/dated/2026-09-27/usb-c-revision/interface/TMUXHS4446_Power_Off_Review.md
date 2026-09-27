# Selected mux revision — 27 September 2026

**Select U211 TMUXHS4446RETR in place of HD3SS460IRNHR.** This addresses a real missing specification: HD3SS460 recommends external isolation when its ports carry voltage while it is unpowered. Its shutdown supply-current entry does not prove I/O isolation. The selected device instead specifies high-speed failsafe leakage of **10 µA maximum with VCC = 0 V and a data pin at 1.8 V**. It is not a surge protector and is not guaranteed functional during undervoltage. [TI TMUXHS4446, §5.5](https://www.ti.com/lit/ds/symlink/tmuxhs4446.pdf), [earlier TI HD3SS460 reference schematics](https://www.ti.com/lit/ds/symlink/hd3ss460.pdf).

## Electrical decision

The selected mux permits common mode 0–1.8 V, differential swing 0–1.8 Vpp and 12 mA through a high-speed switch. The Artix LVDS_25 nominal envelope (common mode at most 1.425 V, differential magnitude at most 0.6 V) implies a conservative single-ended high of 1.725 V, below the 1.8 V failsafe test point. Differential current into 100 Ω is at most 6 mA before path resistance. **DC LVDS use is an engineering inference from these specified passive-switch voltage/current ranges; this is not manufacturer validation of our complete DC link.** AMD's separately specified VOH maximum is also below 1.8 V. [AMD DS181 Table11](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

The datasheet's 10 Gbit/s operating-rate entry and USB/DP eye tests concern AC-coupled interfaces. They do not qualify our LVDS rate, cable or receiver. Preserve the DC path with a single receiver termination and the FPGA-provided common-mode bias. Do not add AC capacitors without redesigning receiver bias and encoding/run-length behavior.

Use the same always-on 3.3 V net for MCU and mux. Control pins have a VCC+0.4 V absolute limit: **the data-pin failsafe specification does not extend to independently powered control pins**. Keep those GPIOs low during startup/shutdown and do not drive the unpowered board from the fixture. TI specifies a 0.1–100 ms VCC ramp; the regulator/capacitance combination and brownout transients still require measurement. The shutdown defaults protect routing state; firmware must not enable the lanes until supply and protocol state are valid.

When attached to an ordinary USB source with no agreed mode, the switch remains open and FPGA outputs remain inactive. Ordinary USB high-speed signals are AC-coupled small signals; this architecture intentionally avoids placing a proprietary 3.3/5/9 V DC signal on them. That does **not** certify arbitrary cable faults, short-to-VBUS, ground offset or surge immunity. Connector-side high-speed absolute input limits remain −0.5 to 2.4 V, and the selected ESD clamps do not constitute a DC overvoltage disconnect.

## Exact integration

- U211: **TMUXHS4446RETR**, `Package_DFN_QFN:Texas_WQFN-40-1EP_3x6mm_P0.4mm_EP1.7x4.5mm`. Use the stock version **without thermal vias**. Source body is 3×6 mm; numbered EP41 is 1.7×4.5 mm and must be soldered to GND. TI §7.4 explicitly allows no thermal vias on a high-K board; maintain a short GND connection.
- MODE0.1 = GND for GPIO control; MODE1.13 and A0.14 = GND; CONF2.38 = GND; CONF1.36 = `USB_MUX_EN`; CONF0.35 = `USB_MUX_POL`. Existing R230/R231 remain 100 kΩ pulldowns. CONF=000: open/powerdown;001: open/powered;010: four lanes normal;011: four lanes reversed. Always set EN=0 before changing orientation, then enable only after the receiver agrees.
- VCC pins4,7,10,23,26,29,32 = `USB_AON_3V3`; GND15,18,37,41 = GND.
- DP0 pins39/40 = D0 P/N; DP1 2/3 = D1; DP2 5/6 = D2; DP3 8/9 = clock.
- CRX1 25/24 = USB_RX1 P/N; CTX1 28/27 = USB_TX1; CTX2 31/30 = USB_TX2; CRX2 34/33 = USB_RX2.
- Spare terminals11,12,16,17,19,20,21,22 remain explicit NC.
- C234100n remains at the left supply cluster; add **C239100n 16V X7R GRT155R71C104KE01D**, same 0402 as existing bypasses, at the right supply cluster. Retain C2351µF local bulk. This is a layout prescription to meet TI's ample-near-pin bypass guidance, not a proven PDN result.

The transmitter/source mapping of TI Table6-3 is unchanged from the earlier selected switch: normal D0→RX2, D1→TX2, D2→TX1, clock→RX1; flipped D0→RX1, D1→TX1, D2→TX2, clock→RX2. Source here denotes signal direction, independently of the headboard's USB-PD **power-sink** role. The receiver must implement the cable crossover and orientation contract, rather than copying this table under different lane names.

[Component input](USB_C_Interface_Components.json) contains all41 numbered pins and pin types. [Native land/readback and exact component delta](evidence/TMUXHS4446_Native_Footprint_And_Delta.json) verifies source land dimensions, numbering, no drill and the limited U211/C234-purpose/C239 change. Earlier inputs are preserved in [historical evidence](historical/HD3SS460_before_power_off_review/USB_C_Interface_Components.json). The new footprint, routes, ERC and full-board DRC still require root integration and independent readback.
