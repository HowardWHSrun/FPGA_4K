# Wednesday 14 October — short presenter notes

Updated 14 October. Eight slides. The interactive views provide the detailed walkthrough.

## 1. Weekly update

I will start with the carrier and the quick round of email review with Gerald, Zitong and JLCPCB. Then I will show the FPGA schematic and the initial routing.

## 2. XEM8305 / LDO carrier

The XEM8305 connects above the carrier and the existing LDO board below it. I can rotate, separate or hide the boards to explain the connectors and power path. This is a CAD assembly view.

## 3. Carrier board schematic

This page shows the circuitry on the carrier: its power path, ASIC signal pinout, programming connections and connections to the XEM8305 and LDO board. I can expand or zoom the schematic for the detailed discussion.

## 4. Carrier layout and routing

This is the current V16 carrier routing. I completed one round of email review with Gerald, Zitong and JLCPCB, then revised several issues based on the feedback. I can use the layer controls and net selection to discuss the details. Final production review and hardware testing are still ahead.

## 5. FPGA PCB schematic

Power, ASIC pinout, reference clock and configuration are shown beside the schematic. I can zoom into each circuit or expand the drawing for a closer walkthrough. The standalone FPGA and the XEM8305/LDO carrier remain separate designs.

## 6. FPGA layout and 3D

The 3D view shows the saved V41 board and its assigned component bodies. I can rotate it and inspect both faces, then switch to Routing to show layers or individual nets. All 116 mezzanine digital paths are connected; the remaining board routing and timing review continue.

## 7. FPGA and LDO boards

Compare the current combined V6 PCB with the separate FPGA V41 and LDO V5 boards. Overview shows 3D and native layout together; use the view buttons for a larger walkthrough or the complete one-page schematic. Board dimensions and a 10 mm scale reference are shown in the physical views. The combined design retains all other circuits, removes two mating connector pairs and joins the 116 digital signals on-board. Power inputs remain separate. This is a placement comparison; combined and LDO routing remain to complete, and nominal stacked fit remains under review.

## 8. Next steps

My next steps are to order the carrier, work out how the ASIC boards connect together and to the LDO board, decide whether to combine the FPGA and LDO on one PCB, then complete the LDO schematic and FPGA routing for the chosen approach.

## Source and scope reference

The saved FPGA checkpoint connects all 116 digital mezzanine paths, local VIN/GND and three ground planes. The full board still has 445 open connections and timing remains untuned. The proposed HDI process still needs exact manufacturer acceptance.

V16 applies feedback to five specific supplier questions. It has zero physical/disconnected PCB findings under the retained settings; the source schematic retains its declared ERC items. Full production approval, powered operation and populated fit remain open.

Source records are retained in the presentation topic’s source snapshots and viewer provenance files. These scope details are reference material for questions, not additional slide text.
