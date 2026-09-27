# MCU programming and recovery fixture

The board has five exposed copper contacts for initial MCU programming and recovery. **No assembled header is required.** A custom pogo fixture aligns to the 33 × 36 mm board outline and accesses the back of the board. Contact 5 is offset inward to avoid the opposite-side mezzanine lands and existing ASIC wiring; its electrical role is unchanged.

| Contact | Function | Board centre, back side (mm) |
|---|---|---|
| 1 | 3.3 V voltage reference, programmer input only | 9.96, 34.75 |
| 2 | Ground | 11.23, 34.75 |
| 3 | SWDIO | 12.50, 34.75 |
| 4 | SWCLK | 13.77, 34.75 |
| 5 | MCU reset | 9.75, 28.25 |

Each contact is 1 × 1 mm with no paste or drilled via in the land. Use the exact [staggered fixture footprint](USB_C_Interface.pretty/SWD_Fixture_5Pads_Staggered_1mm.kicad_mod), preserve backside component clearance and derive jig coordinates from the final released PCB. The table uses the board coordinate system; do not mirror its numbers a second time when building the physical fixture.

Power the board through its controlled USB-C input. Contact 1 lets the programmer detect the MCU I/O voltage; it must not back-power the board. Use an appropriate 3.3 V SWD programmer, begin at a conservative low SWD clock and validate the actual pogo contact, reset timing and programming operation.

Native KiCad connectivity verifies the five programming connections in the isolated routing candidate, including the reset capacitor's ground return. Final merged-board validation, physical jig mating and an actual programming/recovery demonstration remain required. MCU firmware and USB-to-JTAG recovery are separate unfinished deliverables; the hardware fixture permits programming before that firmware exists.
