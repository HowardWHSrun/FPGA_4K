# Full system assembly — meeting V2

21 October 2026 · FPGA V60 / LDO V13 / active six-layer interposer V23.

- [Assembly animation](index.html?fullscene=1&progress=0).
- [Full assembly overview](index.html?fullscene=1&progress=100).
- [Model sources and limitations](model-sources.html).

The initial view includes all nine boards: four ASIC concepts, LDO, FPGA, BRK, interposer and XEM. Assembly progress, orbit, zoom, board inspection, other side, sheep, sketch and measurement controls remain available. FPGA close-up frames the PCB; the selector and double-click inspection retain all 144 component references. Overview restores the full scene.

FPGA V60 retains native partial copper, pads, mask, silk and 142 native component bodies. Two independently authored nominal J1/J2 connector previews replace excluded supplier payloads and remain selectable. TP1–TP13 are copper-only. Native U1/J1/J2/J3 poses retain the earlier registration, including the +0.5/+1.5 mm FPGA-to-LDO offset.

Interposer V23 preserves the six stack connector datums, outline and2.4 mm thickness, so host registration remains. All 49 fitted parts are represented:21 stock bodies including PCM12 SW1, six nominal stack connectors and 22 nominal package envelopes from saved Fab/pad geometry. Four mounts and four test pads remain PCB features. The cable anchor uses the J1 footprint and remains schematic; its new body is a nominal envelope.

ASIC pass-through, cable and animal fit are conceptual. Static checks and visual models do not qualify construction, populated mating, electrical operation, thermal performance or animal placement. FPGA routing remains partial. Interposer checks retain six NPTH/courtyard errors and secondary reference misses.

[Coverage](data/model-coverage.json) · [FPGA registration and coverage](data/fpga-v60-coverage.json) · [Interposer registration](data/interposer-v23.json) · [Third-party notices](THIRD_PARTY_NOTICES.md)
