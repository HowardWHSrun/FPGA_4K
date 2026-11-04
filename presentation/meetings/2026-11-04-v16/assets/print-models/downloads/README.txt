Printable actual-size models, 4 November 2026
=============================================

Units: millimetres. Print at 100 % scale. STL for printing, STEP for CAD.
Frame: X right, Y toward each board's north edge (as in KiCad's 3D viewer), Z up.

What they are
- Board outline and thickness from each saved KiCad board (Edge.Cuts).
- Parts that set the outer size (FPGA, connectors, regulators, inductors, large capacitors) as simple
  boxes around each part's KiCad 3D body. Small resistors/capacitors and test points are left out.
- These are fit mock-ups, not manufacturing models.

On the head (custom FPGA approach)
- Frontend_FPGA_Board_V29 (edited 4 Nov 2026, 00:07 CST): 22.59 x 25.42 x 1.62 mm board.
- FPGA_LDO_PCB_V17 (edited 4 Nov 2026, 06:55 CST): 22.59 x 42.50 x 1.6 mm board. Latest saved layout;
  the "one column under the Frontend" plan is not drawn yet. DF40 connectors and U1 are nominal bodies.
- ASIC_Board_PCB5 (edited 3 Nov 2026, 00:51 CST): 21.97 x 17.03 x 1.6 mm board. Print four.
- Head_Stack_Real_Gaps: the stack as the saved CAD connects it. Frontend on the FPGA-LDO J1/J2,
  two ASIC boards above the FPGA-LDO J3 and two below its J4, 1.5 mm Hirose DF40C mated gaps,
  plus a nominal Micro-HDMI cable plug (11 x 5.5 x 20 mm overmold, 4.5 mm cable, 15 mm stub).
  Without the plug: 24.1 x 43.6 x 16.8 mm.
- Head_Stack_Printable_Solid: same outer shape with the gaps filled, prints as one piece, no supports
  between boards.
- Micro_HDMI_Plug_Nominal: the plug alone, in stack coordinates. Size is nominal, not a vendor drawing.

Bench (not on the head)
- HDMI_Extension_Board_V25 (edited 3 Nov 2026, 23:11 CST), without the XEM8310 module.
- Direct_LDO_Carrier_V6 (edited 1 Nov 2026, 20:34 CST), without the XEM8305 module.
- Existing_LDO_Board (source baseline, edited 2 Oct 2026, 11:37 CDT); parts are nominal boxes.

Printing tips
- Single boards have parts on both sides: print top side up with supports under the board, or lay the
  bottom-side parts aside if only the outline matters.
- The printable stack block needs supports only under the overhanging plug/cable stub.

Check found in the stack
- PCB-5 J1 (the single AC_IN pin) reaches 1.27 mm above and 0.9 mm below its board. With 1.5 mm DF40
  gaps, J1 of two stacked ASIC boards overlap by 0.67 mm, if J1 is fitted as drawn.
