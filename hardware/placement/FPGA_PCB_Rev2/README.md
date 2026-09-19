# Howard FPGA PCB — Rev 2 placement study

> Imported dated source note; links adapted for this repository. Read [current status](../../../docs/current-status.md) for subsequent qualifications, including oscillator frequency TBD. Unshipped local references are marked as archive paths.

Rev 2 reorganizes the proposed component list on a **60 × 70 mm board (42 cm²)**. It contains **203 footprint objects: 34 on top and 169 underneath**, including mounting holes, test points and provisional support positions. The original placement is preserved in FPGA_PCB (local archive: `Howard_PCB_Size_Study/FPGA_PCB`).

**This is an editable size and placement study. It has no circuit schematic, assigned signal netlist or copper routing, and is not ready for fabrication.** The outline is a candidate for further design, not a proven minimum or a guarantee that routing will fit.

## Open and inspect

- Open [the KiCad project](hardware/Howard_FPGA_Rev2_60x70.kicad_pro), then its PCB Editor; alternatively open [the board directly](hardware/Howard_FPGA_Rev2_60x70.kicad_pcb).
- Review front and back separately so underside capacitors do not obscure top-side parts. Native function labels identify the major areas. KiCad groups collect related footprints for selection and editing; their membership does not define electrical connections.
- See [the 3D preview](previews/FPGA_3D.png) and other files in [previews](previews/). The saved KiCad board is the authoritative editable artifact.

## What changed

- **Connections and mounting:** both routing connectors align along the top edge; micro-HDMI faces out through the right edge. Four M2 mounting-hole centres form a symmetric rectangle, at (3.5, 3.5), (56.5, 3.5), (3.5, 66.5) and (56.5, 66.5) mm. JTAG remains accessible from the left, with test pads along the bottom.
- **FPGA, flash and recording memory:** the FPGA occupies the centre, boot flash sits to its left, and the RAM package and reference/termination allowance sit to its right. The oscillator and PROGRAM_B switch occupy the upper area.
- **Power:** the lower section groups the ADP5052 proxy, four inductors and **one dual-MOSFET package**. Input power and protection are together at lower left. Three power-capacitor allowances moved to the top; remaining support parts are grouped underneath by function.
- **Reserved space:** outlined areas preserve room beside micro-HDMI for link/protection circuitry, at lower right for additional rail/filter/clock requirements, and around the JTAG header for cable access. These are space reservations, not selected circuits.

Native groups cover FPGA/configuration, FPGA decoupling, recording memory, power, connectors/debug, clock/controls and mounting. Under-FPGA and regulator-support positions still require pin-specific electrical layout; tidy grouping alone does not validate decoupling or switching-current paths.

## Open decisions

**The oscillator frequency remains TBD.** Per Gerald's feedback, the required clock depends on FPGA-to-MCU output width, data rate and protocol. **100 MHz was an initial candidate**, not an accepted requirement. Choose the source and any derived clocks after the acquisition and output-link requirements are resolved.

The exact RAM part/capacity and controller, FPGA bank assignments, rail plan, component values/ratings, micro-HDMI signaling and receiver, connector pinouts/mating heights, and thermal design remain open. The 256 Mbit flash candidate is boot storage; it does not replace recording RAM. Cable plugs, carrier overhang, enclosure and cooling hardware are outside this PCB-outline estimate.

## Checks and model limitations

See [native readback](reports/native_readback.json), [placement geometry](reports/geometry_check.json), [independent review](reports/independent_geometry_review.json) and [native DRC](reports/native_drc.json). The native outline centreline is 60 × 70 mm; a stroke-inclusive bounding box may read 60.1 × 70.1 mm. The micro-HDMI courtyard intentionally projects about 0.5 mm beyond the right edge.

Final checks found **zero component, label, mounting-hole, opposite-face drill or reserved-area overlaps**. The independent review checked all 203 footprints and 221 visible labels. Native KiCad DRC reports **69 internal pad-clearance errors** (52 inside U4 and 17 inside J3), with **zero warnings**; these errors remain unresolved and are not hidden by rule changes. This is not a clean fabrication DRC, and a successful placement check does not establish electrical completeness.

Footprints are embedded in the board and also supplied in a local library. Core 3D models—FPGA, RAM, PMIC, dual MOSFET, oscillator and routing connectors—are **body-only visual proxies**, with assumed heights/standoffs; see [the model manifest](libraries/models/visual_body_proxies.json). Other models reference the local KiCad installation and may need relinking on another computer. The render cannot validate connector mating, balls/leads, assembly height or package tolerances.

Individual component assumptions are recorded in [the placement CSV](reports/component_placement_allowance.csv).

The board was loaded, rendered and checked with native KiCad tools. The open PCB Editor stopped responding to window controls during the final handoff, so opening Rev2 in that window was not confirmed. The prior in-memory board was preserved as `FPGA_PCB/hardware/Howard_FPGA_Before_Rev2_User_Snapshot.kicad_pcb`.
