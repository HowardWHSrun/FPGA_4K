# Weekly update · 4 November 2026 · V17

Seven slides: weekly update, probes assembled this week, board names and the two approaches (clickable 3D with downloads, plus printable actual-size models), HDMI Extension Board, Frontend FPGA Board, ASIC board, next steps.

- Board views are exported with KiCad 10 from the saved projects. Each label gives the version and when its saved file was last edited:
  - HDMI Extension Board V25, edited 3 Nov 2026, 23:11 CST.
  - Frontend FPGA Board V36, edited 4 Nov 2026, 21:37 CST.
  - ASIC board PCB-5, edited 3 Nov 2026, 00:51 CST.
- Downloads are in `assets/downloads/`; HDMI and Frontend file names carry the same date and time.
- Probe figures are unchanged outputs of the GChip sine-test pipeline (recordings of 2 November 2026).
- The 3D overview follows the system assembly overview. Positions and cable paths are illustrative. The DF40 connectors, the Frontend WLCSP flash U7 and the ASIC dies are drawn as nominal bodies because no manufacturer model was available.
- Frontend V36 update (4 Nov 2026, late evening): the Frontend slide, layout viewer and downloads (KiCad, schematic PDF and the fab package awaiting JLC review) moved from V29 to V36. V36's saved project does not carry its project-local 3D model files, so its renders use KiCad 10 stock models of the same packages, plus nominal bodies for U2, U3, U4, U13, U16 (MPM3834C) and U8. The printable models and 3D overview still use V29, which has the same outline.
- V17 (4 Nov 2026) replaced HDMI V24 and Frontend V21 with the overnight revisions; V16 is in this folder's git history.
- Printable models (added 4 Nov 2026): slide 3's third button opens `assets/print-models/`, simplified actual-size STL/STEP models of the parts that go on the head (Frontend V29, FPGA-LDO V17, ASIC PCB-5 and the stacked head assembly with a nominal Micro-HDMI plug), plus the bench boards. Board outlines and thickness come from the saved KiCad boards; the parts that set the outer size are boxes around their KiCad 3D bodies; small passives are left out. Fit mock-ups only, not manufacturing models.
