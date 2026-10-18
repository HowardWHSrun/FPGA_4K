# V32 power routing lesson · Website V1

17 October 2026. Read-only learning view of the selected XEM8305 / existing-LDO carrier V32. This is a routing review, not a fabrication release.

- [Open the interactive lesson](index.html).
- [Derived geometry and verified bypass corridors](board.json).
- Source board: `CARRIER_XEM8305_V32_Clean_Bundle.kicad_pcb`.
- Source SHA-256: `826c920c326aea4fe5ac9465879b7a415d76e4a039fc9fd1770912a5d4ae0f45`.
- Selected LDO A remains unchanged. Separate V27 capacitor and V28 USB work are not merged into this snapshot.

## What was generated

The website uses native KiCad component, pad, trace, via and filled-zone geometry extracted from the saved V32 board. Display polygons are simplified by at most 0.008 mm and coordinates rounded to 0.001 mm. Bottom copper uses an unmirrored top view. Inner-layer component bodies are projected for orientation; bottom surface pads are not shown on inner layers. This generated explanatory interface and its concept diagrams were designed by Codex from native evidence and the references below. Concept diagrams are not manufacturer reference-design drawings or current-density simulations.

The 17 October read-only review checked connectivity for 13 selected power/control net groups, matched 88 pad/net display anchors, and checked 30 local DGND vias against both saved ground planes. A finite-width native Boolean test showed two 0.10 mm-wide corridors from R78/C55 to ground-via annuli entirely within saved B.Cu fill, with zero area outside the fill. Each via had 32/32 sampled annular contacts to each ground plane. This establishes bypass connectivity, not current magnitude, noise or instability. The pink display paths are those tested corridors.

## Primary engineering sources

- [TI TPS54429E datasheet, SLVSAS0, February 2011](https://www.ti.com/lit/gpn/TPS54429E): p.5 RSA/PWP pin mapping, p.15 nominal bypass guidance and p.16 layout items 1–14. The manufacturer layout figure uses PWP; V32 uses RSA.
- [TI TPS54429E EVM, SLVU444A, revised August 2021](https://www.ti.com/lit/ug/slvu444a/slvu444a.pdf): section 6.1 p.14 grounding and p.18 C6 capacitor example. Adapt by pin function and package geometry, not by copying PWP pin numbers.
- [Diodes SMBJ series datasheet](https://www.diodes.com/datasheet/download/SMBJ5.0%28C%29A-SMBJ170%28C%29A.pdf): p.3 SMBJ15CA specified clamp of 24.4 V at 24 A. This does not establish a clamp below U10's 20 V absolute maximum for an unspecified fault.

## Current findings and proposals

The input rail, regulator and reviewed local returns are connected. SW and bootstrap routes are short and via-free. The clear local-ground departure is the two verified R78/C55 bypass exits. Input-capacitor geometry deserves a complete-loop comparison; 6.36/5.75 mm pad-center separations are descriptive, not a failure criterion. The output sense uses shared distribution copper; a deliberate output-capacitor pickup is proposed.

V32 C56 remains 1 µF / 10 V / X5R / 0402 with a 2.025746 mm VREG5 trace. The separate V27 1 µF / 25 V / X7R / 0603 candidate has a 3.603553 mm trace in its old placement. These are explicit trace centerline lengths, not complete bypass-loop lengths or measured inductance. A new placement is still needed.

No copper, schematic or native design files were edited for this lesson. There is no new DRC or powered-board qualification claim. Exact adapter, polarity, source fault energy, load budget and startup/ripple/thermal behavior remain open. Future edits require native refill/connectivity/DRC/parity review and defined bench validation. The main overview's older board downloads and earlier dated pages remain preserved.
