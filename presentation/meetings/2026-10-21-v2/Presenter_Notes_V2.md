# Wednesday 21 October 2026 — presenter notes V2

Prepared 20 October. Same concise interactive format as 14 October V17. Four topics follow Howard’s requested order.

## 1. Weekly update

The carrier board design is ready for manufacturing. We are globally sourcing its components through JLCPCB first. The interposer schematic and connected routing are complete for review with Gerald and Zitong. I have started sourcing its components ahead of our target to manufacture this week, so we can reduce the wait once the board is ready. I will also show the full assembly animation and the FPGA oscillator and schematic updates.

Sources:
- Howard’s 20 October meeting outline and clarification that interposer routing is expected to finish by 21 October.
- 2026-10-19_FPGA_Work/11_Carrier_V42_JLC_Final_Draft_Check_V1/START_HERE.md
- 2026-10-20_FPGA_Work/13_XEM_Interposer_Routing_V16/START_HERE.md
- Howard’s 20 October evening slide instructions and supplied JLC screenshot.
- 2026-10-20_FPGA_Work/17_XEM_Interposer_Power_Width_Review_V20/START_HERE.md

## 2. LDO carrier board progress

The LDO carrier board design is ready for manufacturing. Our first step is global sourcing through JLCPCB. This screenshot shows the parts in Purchasing. I can switch to the assembly, schematic or routed PCB for the hardware discussion. Production-file approval, component arrival and powered testing remain separate from the board-design status.

Sources:
- Howard’s 20 October carrier sourcing/production update.
- 2026-10-18_FPGA_Work/15_Carrier_LED_Visibility_V42/START_HERE.md
- 2026-10-19_FPGA_Work/11_Carrier_V42_JLC_Final_Draft_Check_V1/START_HERE.md
- build/Asset_Staging_Receipt.json
- Howard-provided Screenshot 2026-10-20 at 8.44.50 PM.png, retained unchanged.

## 3. System assembly overview

This is the overview animation I worked on today. It shows the separate boards coming together, with independent assembly stages for the ASIC/LDO/FPGA stack and the BRK/interposer/XEM host. I can play the sequence, inspect a board or pause at an interface before going through the interposer schematic.

Sources:
- 2026-10-20_FPGA_Work/09_Assembly_Overview_Publication_V23/START_HERE.md
- build/Assembly_Update_V2.json

## 4. XEM to FPGA interposer schematic

The interposer schematic and connected prototype routing are complete. It provides protected power, three data pairs toward XEM, one command pair back and reuse of BRK USB JTAG. I will go through the circuit and routing with Gerald and Zitong. I have already started global sourcing for its components through JLCPCB so that they can arrive sooner when we are ready to manufacture. Manufacturing is targeted for this week, after the design review.

Sources:
- Howard’s 20 October evening update.
- 2026-10-20_FPGA_Work/17_XEM_Interposer_Power_Width_Review_V20/START_HERE.md

## 5. Separate FPGA and LDO boards

The overview keeps the ASIC boards, LDO, custom FPGA and XEM host together. The two direct 60-contact pairs connect the separate FPGA and LDO boards. I can choose FPGA from the board selector or use the FPGA close-up button, then select or double-click a component for a closer look. The updated FPGA model uses V60 and retains the assigned component bodies, with clearly labeled nominal connector previews for public sharing. ASIC stack revisions, cable and mounting remain conceptual; the view supports the board-arrangement discussion. The host interposer uses the current V20 saved layout. Components without assigned source 3D models remain identified in model coverage.

Sources:
- 2026-10-20_FPGA_Work/01_Two_60_Interface_Final_Handoff_V1/START_HERE.md
- 2026-10-20_FPGA_Work/10_FPGA_Routing_Placement_V57/START_HERE.md
- 2026-10-20_FPGA_Work/09_Assembly_Overview_Publication_V23/START_HERE.md
- build/Assembly_Update_V2.json
- 2026-10-20_FPGA_Work/14_FPGA_Regulator_Power_Routing_V60/START_HERE.md
- 2026-10-20_FPGA_Work/17_XEM_Interposer_Power_Width_Review_V20/START_HERE.md

## 6. Interposer layout and 3D

The 3D model and routing view show the same active six-layer V20 interposer checkpoint. It widens the BRK power path and buck-output throat, adds parallel supply/return access, and repairs the R8 quiet return. Native checks report no open connections, ERC errors or schematic parity findings. Six inherited NPTH/courtyard errors and 512 secondary In3 reference misses remain disclosed in the engineering review. Current/thermal behavior, the retained construction, signal integrity and powered operation still need qualification. The stopped four-layer V21 trial is not used.

Sources:
- 2026-10-20_FPGA_Work/17_XEM_Interposer_Power_Width_Review_V20/START_HERE.md
- build/Interposer_Refresh_V2.json

## 7. FPGA schematic updates

The main circuit change moves Bank 0, JTAG and flash to a common 1.8 V supply, while all ASIC-facing banks stay at 1.5 V. The boot circuit uses fixed-direction SPIx1 translation and separately holds PROGRAM_B and INIT_B during startup. The 125 MHz GTP reference and separate 25 MHz fabric clock are both retained. I also redrew support parts with visible wires beside the circuits they serve, keeping the complete netlist unchanged during that drawing cleanup. These are adaptations based on the cited reference designs, and boot, startup and signal integrity still need validation.

Sources:
- 2026-10-20_FPGA_Work/08_FPGA_1V8_JTAG_Boot_V55/START_HERE.md
- 2026-10-20_FPGA_Work/09_FPGA_Connected_Schematic_V56/START_HERE.md
- 2026-10-20_FPGA_Work/12_FPGA_Escape_Study_V58/START_HERE.md
- build/Native_Asset_Receipt.json
- 2026-10-20_FPGA_Work/14_FPGA_Regulator_Power_Routing_V60/START_HERE.md

## 8. FPGA oscillators and layout

Y1 supplies the 125 MHz differential GTP reference. Y2 supplies a separate 25 MHz, 1.5 V CMOS fabric clock. The current V60 3D model and native routing view use the same saved board. V60 adds local regulator power cells, wider feeds, parallel accesses and power distribution. This remains a partial routing checkpoint; ordinary signal buses and remaining power/control routes are still open.

Sources:
- 2026-10-20_FPGA_Work/14_FPGA_Regulator_Power_Routing_V60/START_HERE.md
- build/FPGA_Views_Update_V2.json

## 9. Next steps

The carrier board design is ready for manufacturing, with JLCPCB component sourcing first. Next, I will review the interposer with Gerald and Zitong and continue sourcing its parts ahead of our manufacturing target this week. We will also settle the separate FPGA/LDO arrangement and continue the FPGA layout and routing.

Sources:
- Howard’s 20 October meeting outline.
- 2026-10-20_FPGA_Work/11_XEM_Interposer_Routing_Placement_V15/Questions_For_Link_Owner.md

## Source snapshots

Carrier readiness and interposer sourcing/manufacturing plans follow Howard’s 20 October update. The carrier JLC screenshot is a saved observation. Interposer schematic, native routing and 3D use the connected V20 checkpoint. FPGA schematic and routing use V60, which remains partially routed. Public 3D uses labeled nominal connector previews where supplier meshes are excluded. Saved static checks and the visualization do not establish fabrication or powered qualification.
