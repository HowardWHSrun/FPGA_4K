# Full system assembly — meeting V2

20 October 2026 · FPGA V60 / LDO V13 / active six-layer interposer V20.

- [Assembly animation](index.html?fullscene=1&progress=0).
- [Full assembly overview](index.html?fullscene=1&progress=100).
- [Model sources and limitations](model-sources.html).

The initial view includes all nine boards: four ASIC concepts, LDO, FPGA, BRK, interposer and XEM. Assembly progress, orbit, zoom, board inspection, other side, sheep, sketch and measurement controls remain available. FPGA close-up frames the PCB; the selector and double-click inspection retain all 144 component references. Overview restores the full scene.

FPGA V60 retains native partial copper, pads, mask, silk and 142 native component bodies. Two independently authored nominal J1/J2 connector previews replace excluded supplier payloads and remain selectable. TP1–TP13 are copper-only. Native U1/J1/J2/J3 poses retain the earlier registration, including the +0.5/+1.5 mm FPGA-to-LDO offset.

Interposer V20 preserves the six connector datums, outline and 2.4 mm thickness, so the existing host registration remains. The public model includes 20 stock bodies and six nominal Samtec previews. Twenty-two packaged components lack assigned solid bodies, including Yamaichi J1. Mounts and test pads have no separate body. The cable anchor uses the J1 footprint and remains schematic.

ASIC pass-through, cable and animal fit are conceptual. Static checks and visual models do not qualify construction, populated mating, electrical operation, thermal performance or animal placement. FPGA routing remains partial. Interposer checks retain six NPTH/courtyard errors and secondary reference misses.

[Coverage](data/model-coverage.json) · [FPGA registration and coverage](data/fpga-v60-coverage.json) · [Interposer registration](data/interposer-v20.json) · [Third-party notices](THIRD_PARTY_NOTICES.md)
