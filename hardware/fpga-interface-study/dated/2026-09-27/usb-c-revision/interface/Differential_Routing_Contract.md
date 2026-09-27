# Four-pair routing contract — 27 September 2026

This constrains layout work; it does not certify channel performance. Route the four FPGA pairs and four cable pairs as **coupled differential paths**, with matched P/N topology and recorded length/skew. Do not count eight arbitrary independent traces as a qualified link. The TMUX selection and source pin table are in [the mux review](TMUXHS4446_Power_Off_Review.md).

## Assigned paths

| Path | FPGA P / N | U211 P / N |
|---|---|---|
| D0 | C9 / B9 |39 /40|
| D1 | B8 / A8 |2 /3|
| D2 | C11 / C10 |5 /6|
| Forwarded clock | A10 / A9 |8 /9|

| Cable pair | U211 P / N | J4 P / N | ESD signal / external flow-through land P,N |
|---|---|---|---|
| RX1 |25 /24|B11 /B10|U213.4/7, U213.5/6|
| TX1 |28 /27|A2 /A3|U213.1/10, U213.2/9|
| TX2 |31 /30|B2 /B3|U214.1/10, U214.2/9|
| RX2 |34 /33|A11 /A10|U214.4/7, U214.5/6|

The two ESD pads for each conductor **must be joined by board copper**; no internal wire joins them. Route continuously through the protective land, avoiding a long branch. Do not substitute the unbonded land for the protective land. Ground each ESD package locally with short, wide copper and nearby ground vias. [TI TPD4E05U06 Table 4-2 and Figure 7-11](https://www.ti.com/lit/ds/symlink/tpd4e05u06.pdf).

## Layout prescription

- Prefer the two outer signal layers with the adjacent continuous ground layers: F.Cu→In1.Cu and B.Cu→In10.Cu. A matched F-to-B pair transition can use the full through-via barrel without an unused long barrel section. Where an inner signal layer is necessary, record the signal/reference layers and the unused via stub; check the filled reference beneath the whole path. Do not route the link through power-plane splits or use the two power layers as signal shortcuts.
- Keep P/N beside one another, equal in via count and transition locations, and use the same trace cross-section except for a short, symmetric pad escape. Add adjacent symmetric ground-return vias when changing reference layers. Keep regulator switch nodes and magnetics away from the corridor. No testpoint stubs are proposed.
- Use **100 Ω differential as the candidate custom-LVDS board target**, and one approximately 100 Ω termination at the receiver. USB2 remains its separate 90 Ω target. A standard full-featured cable's channel and connector impedance need modelling with both board transitions; do not declare the entire path 100 Ω because a PCB netclass says so.
- **Trace width and pair gap are not yet impedance-qualified.** The selected JLC12161H1-1080B construction has known physical layer thicknesses but incomplete exact laminate Dk/Df and no accepted field-solver/coupon result. Reserve enough corridor to adjust width/gap, then record the manufacturer's impedance geometry rather than silently retaining a general 0.10 mm routing width.
- A provisional layout objective is P/N mismatch ≤ 0.127 mm per board segment, inspired by TI's 5 mil USB/DP layout guidance; it is not a derived LVDS pass/fail timing limit. Record package escape and via delays separately. Clock-to-data skew must be budgeted across FPGA, mux, PCB, cable, receiver and training; USB's lack of an inter-pair skew requirement does not apply to this source-synchronous design.
- TI's general high-speed guidance recommends 5W separation from other pairs, additional clearance from periodic aggressors, solid reference and short stubs. This 33 × 36 mm board may require explicitly reviewed departures near packages/edges. List those actual departures, rather than claiming compliance or arbitrarily enlarging the board. Eye/BER tests and extracted-channel review determine whether the chosen rate is viable.

The mux datasheet points to [TI SLLA414A](https://www.ti.com/lit/pdf/slla414) for these general layout practices. Its USB/DP numeric examples are context, not a USB3 claim for our custom LVDS protocol.

## Electrical/configuration conditions

All eight bank 16 endpoints must remain LVDS_25 or disabled/high impedance with no pull-up. **Never drive them as LVCMOS25**: the mux's high-speed absolute limit is 2.4 V even when the crossbar is disabled. The native R114 1 kΩ pull-up of PUDC_B to bank 14’s 1.8 V rail disables configuration-time SelectIO pullups and must be retained. A bitstream that does not use these balls must also leave them high impedance or safely pulled down. [AMD UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config).

MODE0/CONF2 stay grounded; EN/POL share the mux's always-on 3.3 V supply. Keep EN=0 during orientation changes, reset and invalid power. Only an accepted custom mode, configured FPGA and trained receiver permit data output and EN=1. No validated FPGA/MCU/receiver implementation is supplied yet.

The receiver must explicitly resolve the standard cable's crossovers and both plug orientations. Test all four orientation combinations with identifiable lane patterns; train clock phase and per-lane alignment, check CRC/errors and do not silently swap P/N or lane order to make traces easier. An RX-end pair permutation is allowable only as a documented contract/HDL change, not an undocumented CAD shortcut. No 900 Mbit/s, 64b/66b or end-to-end sustained-throughput guarantee is made.

## Required routing handoff evidence

The final route report should bind the exact PCB SHA and enumerate each pair's endpoints, layer sequence, via count, total P/N lengths, mismatch, uncoupled escape length, closest aggressors and reference-plane continuity. It must distinguish geometry compliance from signal-integrity qualification. Native zero-open/zero-DRC checks remain necessary but do not establish impedance, eye margin or throughput.
