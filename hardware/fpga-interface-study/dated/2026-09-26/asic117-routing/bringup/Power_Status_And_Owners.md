# Power status and what Howard needs to do

26 September 2026 · smallest 33 × 36 mm FPGA-board revision

**Power is not complete.** The regulator circuits and rail assignments are present, but required supply and ground connections still need PCB routing. A clean clearance report on a partial board does not mean its power network is connected or that the board will start.

| Remaining work | Owner |
|---|---|
| Finish FPGA supply/ground routing, check current capacity, voltage drop, startup order, decoupling and heat; reconcile schematic and PCB | FPGA PCB design work — not information Howard must supply |
| Reconcile the mating pinout and implement Gerald's new answers; establish detailed SPI values, reset pulse/polarity and clock/data margins | FPGA/ASIC integration work; [Gerald's answers are now recorded](Gerald_Answers_2026-09-26.md) |
| Confirm which board supplies the ASIC rails, expected current, ground returns and both mating connector views | Routing-board designer, coordinated by Howard |
| Define the actual external input supply and custom cable/breakout rating and pinout | FPGA/routing-board integration work; the XEM8310 does not automatically establish the supply |
| Build the FPGA startup and short-capture firmware with real timing constraints | FPGA firmware work, using Gerald's specifications |
| After design release and assembly, measure rail levels, startup, current and heating; then test JTAG and one ASIC before all eight | Lab bring-up, with an appropriate supply and programmer |

**Howard's remaining coordination:** obtain the routing-board designer's power/contact-map confirmation and, when available, Jiaao's current acquisition code or timing constraints. Gerald has answered the earlier three-question draft; there is no need to send that same request again. Howard authorized engineering assumptions for the clock interpretation and IMP_TST type; see the recorded choices. The MCU data protocol can follow the first finite ASIC capture; its deferred status does not make the input-power fixture optional.

The bench-power plan is provisional. A custom micro-HDMI connector is not an HDMI-compatible power interface. No assembled-board measurements or fabrication approval are claimed. See [bring-up requirements](Bringup_Requirements.md) for the technical details and the current [routing audit](../reports/Routing_Review.md) for measured CAD status.
