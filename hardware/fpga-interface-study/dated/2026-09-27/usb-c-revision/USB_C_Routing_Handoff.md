# USB-C routing handoff — 27 September 2026

**Development checkpoint. Routing is unfinished; do not manufacture this revision.**

The design keeps the 33 × 36mm outline, XC7A100T CSG324 and two 60-contact ASIC connectors. The separate micro-HDMI project remains unchanged. This report describes the exact native PCB with SHA-256 `c2bb9d1de754b65ebb3076b0b2c97529bc77afb4e5efad52e5762c3a9af2ac76`.

## What the checks establish

| Check | Saved result |
|---|---|
| Schematic electrical rules | 0 errors; 1 warning on the external AC_IN reservation |
| PCB physical design rules | 0 errors; 394 warnings |
| Schematic/PCB correspondence | 0 findings; 993 logical numbered endpoints checked |
| Intentional unused pins | 107, identified separately from missing routes |
| Digital ASIC assignments | 116/116 present; 91/116 FPGA-to-connector paths connected; 88/116 nets free of all open items |
| Missing PCB connections | 268 native unconnected items across the design |

Three endpoint-connected nets retain isolated old copper: ASIC3_DATA8, ASIC4_DATA1 and ASIC4_DATA3. These fragments explain the 91-versus-88 count and must be cleaned up.

Zero clearance errors means the existing copper meets the checked spacing rules. It does not mean the board is completely wired. Dangling-track/via and other warnings remain visible in the attached native report; no manufacturing approval is implied.

## Changes accepted in this checkpoint

- The USB-C power, control, protection and reversible custom-data circuitry is represented in the real schematic and PCB, with 178 fitted parts and a bare five-pad SWD recovery fixture.
- The dense regional escape study connects 67 selected FPGA balls to conventional through-vias, including eight new bank-16 link pins. This is a regional check, not a claim that every FPGA pin has a completed escape or route.
- Four long orientation-switch-to-ESD pair trunks are routed and length-matched within those sections. Short connector-side fanouts and FPGA-side paths remain incomplete; no end-to-end impedance, skew or signal-integrity qualification is claimed.
- The two duplicated USB2 contact pairs are joined at the connector. The protection-to-controller path is still unfinished.
- The wider main-input plane and accepted local power pickups are retained. Raw/protected power distribution, several rail pickups and local return paths still need completion.
- Compact source-checked flash and capacitor packages release routing space. The 64Mbit flash is a different part with half the earlier capacity; startup/programming and power-distribution qualification remain open.

## What to do next

1. Finish the 25 ASIC nets left after the regional rebuild, including missing endpoint escapes where needed; use the current netlist and native open-item list rather than assuming the older checkpoint is current.
2. Complete the four connector-to-protection pairs, FPGA-to-switch pairs and USB2 protection/controller routes. Check return paths, via stubs, end-to-end skew and impedance on the selected manufactured stack.
3. Complete raw, protected and always-on power, local ground returns, JTAG/programming and control routes. Refill zones and compare every power pad’s connectivity before accepting a new route.
4. Remove redundant dangling copper, correct silkscreen and finish native ERC/DRC/parity plus mating and assembly review.
5. Implement and verify the PD/USB control firmware and the matching source/host/receiver adapter. The XEM8310’s existing USB port remains its PC link; this cable interface is not a drop-in USB3 peripheral.
6. Confirm ASIC timing, resets and test-signal behavior with the carrier/firmware owners. AC_IN still requires an external 0–1.5V analog source; the carrier-contact move for ASIC3_READ to J6.59 remains a proposal.

The no-new-hardware checks above do not establish power-up, data capture, sustained transfer rate or manufacturing yield. No order has been placed.

[Complete pin list](reports/USB_C_All_Pin_Connections.csv) · [Native audit](reports/USB_C_Native_Audit.json) · [Circuit explanation](USB_C_Design_Explanation.md) · [Schematic PDF](reports/USB_C_Schematics.pdf)
