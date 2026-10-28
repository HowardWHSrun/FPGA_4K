# October 28, 2026 — presenter notes V8

## 1. Weekly update

October 28, 2026. This week’s main topic is the XEM8310 breakout board: the system connections and current working schematic, layout and 3D model. The HDMI interface is the discussion point to carry forward with the group. The second update is the XEM8305/LDO carrier and its completed routing work.

## 2. Whole system assembly

This whole-system view brings the ASIC/LDO/Artix-7 stacks, XEM8310/BRK and PC into one scene. The breakout PCIe x4 link connects to the PC for data transfer. It uses the current saved breakout placement and available frontend and LDO model snapshots. The compact ASIC stack is a visual proposal in response to the thickness feedback: its board thickness and connector spacing still need electrical and mechanical selection. The cable and replication arrangement show the intended system topology; they do not establish cable bend clearance, mounting or qualified fit.

## 3. Breakout schematic and layout

This is the BRK8310-derived Custom V1, shown as a working draft. Four schematic sheets group the breakout overview, PCIe, frontend ports, and USB JTAG. The initial placement includes 247 footprints, with eight provisional HDMI ports and no routed copper. Connector spacing, CAD findings, the power module footprint, electrical design and physical fit remain under review. Some 3D bodies are generic, and the XEM module is not installed in the model. This board remains open for design.

## 4. How should we use the HDMI port?

This is a presentation redraw of the current breakout J101 contact functions, verified against fresh native breakout and frontend netlists on October 28. All eight ports use the same functional assignment. Pins 6, 8, 9 and 11 are the four unconnected reserved contacts. The shell SH is separate from the nineteen contacts; it is currently open on the breakout and grounded on the Artix-7 FPGA board, so bonding remains a discussion item. Pins 3/5 carry recording from the Artix-7 FPGA via its TX coupling capacitors. Pins 12/14 carry digital stimulation/configuration commands toward the Artix-7 FPGA; the provisional 1.5 V interface still needs power-off isolation and inhibit review. Pin 1 is target-reference sensing, and pin 19 is protected 3.3 V power toward the Artix-7 FPGA. This figure supports discussion; no circuit is changed.

## 5. XEM8305 carrier for the LDO board

This is the latest saved XEM8305 carrier for the existing LDO board. Routing was completed, power copper and ground pours were improved, and fresh KiCad DRC reports zero violations, zero unconnected items and zero schematic-PCB parity issues with no ignored PCB checks. This does not establish manufacturing approval. The JLC review identifies pad, solder-mask, hole-clearance and silkscreen questions, and CAM review remains open. Power, thermal behavior, USB impedance, mechanical fit and powered testing also remain open. Fresh schematic, layout and still 3D exports show the 27 October saved board. The orbitable assembly is a 26 October visualization, before later copper changes, and nominal mating is not a fit test.

## 6. Next steps

Next, settle the HDMI signals, cable and power requirements with the group. Continue the breakout schematic and placement review and update the Artix-7 FPGA interface as those decisions are confirmed. Thinner ASIC PCBs and lower-profile connectors are a later task.

## Reference notes

The HDMI contact map is unchanged. Only destination terminology is updated to Artix-7 FPGA. Pins 6/8/9/11 remain NC; SH is separate. The PCIe link is electrical x4 with physical x8 edge geometry. The PC and link routing are illustrative system context. Source details remain in START_HERE.md, the contact-map JSON, and assets/system-viewer/PROVENANCE.md.

## Interactive PCB layouts

The breakout and carrier Layout tabs use the same native KiCanvas viewer as the previous weekly presentation. Front/back/all-layer presets, planes, silkscreen, part inspection, net highlighting, zoom, fit and flip are available. Use Expand for a larger view, or Open full view for a separate tab. The native PCB files are byte-identical snapshots matching the existing deck exports.
