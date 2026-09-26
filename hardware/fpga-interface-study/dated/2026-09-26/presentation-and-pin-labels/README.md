# 26 September — component explanations and labeled pins

Current scope: the smallest **33 × 36 mm, 130-component** board only.

- [Presentation and component explorer](../../../../../presentation/fpga/#architecture)
- [Interactive labeled pin map](../../../../../presentation/fpga/pins/)
- [Detailed presenter notes and all-component appendix](Presenter_Notes.md)
- [Machine-readable necessity audit](Component_Necessity.json)
- [Manufacturer evidence for the diode-pin correction](UG475_Diode_Pin_Evidence.txt)

Every component has a stated purpose, removal consequence and actual saved pin map. Seven functional groups cover all 130 components and all 762 numbered electrical endpoints. Labels distinguish 331 unassigned endpoints from the six NC markers in the saved CAD.

**New correction:** U1.L9/L10 require GND per AMD UG475. U2–U5.4 FB2 are unused outputs, but the TI single-divider example grounds them; review those ties. The six CAD NC markers are not six approved unused connections. R12 is the clearest component-removal candidate because its status net has no consumer.

No native CAD, routing or earlier PDF was changed. The audit is an explicit erratum to the saved snapshot, not a corrected electrical revision. The source PCB hash is `ae601df3925e5ec5e90c8a2e747356e432d0558e820199cf7c01c6bf8a7fef96`. The 146 missing assigned-net connections and 331 unassigned endpoints remain. No manufacturing release is provided.
