# Editable LaTeX report

The report describes the frozen 33 × 36 mm native placement, SHA-256 `e2aa37d7b569608729ed44e2d7946d30d108c2124e244e9707d49e6ca25df3de`. It is not a fabrication release.

From this folder, compile the supplied `.tex` with Tectonic:

```sh
tectonic FPGA100T_Size_Components_Pinout.tex
```

Keep `figures/Compact_Placement.png` beside the source. A standard XeLaTeX installation can also compile it; run twice for the contents and page references. The checked delivery was built with Tectonic and has 31 A4 pages.

The source bundle includes `data/` with complete endpoint, component and physical-pad ledgers. `scripts/build_report.py` regenerates this LaTeX from the frozen JSON readback; run it from the extracted package root with Python 3. It deliberately asserts the reviewed board hash and dimensions. Changing the board requires fresh extraction and review, not just editing the report title.

The report distinguishes actual CAD assignment, unassigned contacts, intentional NC and physically unrouted connections. The proposed 117-signal mezzanine table is separate from the actual PCB state. Generating a PDF does not validate the circuit, BOM, copper routing or operation.
