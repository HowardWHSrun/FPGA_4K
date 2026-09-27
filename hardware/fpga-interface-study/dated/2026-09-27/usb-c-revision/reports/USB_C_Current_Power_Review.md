# USB-C power review — 27 September 2026

**Power routing is incomplete. This revision is not ready to energize or manufacture.** The current board retains the 33 × 36 mm outline, 179 components and 12 copper layers. The archived completed micro-HDMI board has a different status.

This readback binds to board SHA `c2bb9d1de754b65ebb3076b0b2c97529bc77afb4e5efad52e5762c3a9af2ac76`. The supplied native check reports **0 errors, 394 warnings and 268 unconnected items** across the whole USB-C PCB. Zero geometric errors does not establish complete wiring or electrical function.

## Copper continuity

| Rail | Pads in reference-connected group / actual pads | Pads outside that group |
|---|---:|---:|
| GND | 198 / 232 | 34 |
| VCCINT_1V0 | 31 / 35 | 4 |
| VCCAUX_1V8 | 28 / 51 | 23 |
| VCC_ASIC_1V5 | 26 / 41 | 15 |
| VCC_LINK_2V5 | 10 / 12 | 2 |
| USB_MAIN_VIN | 20 / 22 | 2 |
| VBUS_PROTECTED | 2 / 9 | 7 |
| USB_VBUS_RAW | 1 / 13 | 12 |
| USB_AON_3V3 | 2 / 25 | 23 |

Each physical pad is counted by UUID, including repeated connector ground and MOSFET lands. These are **pad gaps**, not independent missing wires. A connected group can still be unpowered because its upstream path is incomplete. The [pad readback](USB_C_Power_Pad_Readback.json) lists every endpoint and coordinate. There are 0 detected via overlaps with SMD lands in this readback; assembly-process qualification is separate.

## Latest bounded power changes

C59's 2.5 V bypass land has a short 0.565 mm, 0.30 mm-wide tie to an existing live rail via. All physical Q200 source/drain lands are joined to their same-function lands. Local MCU and mux exposed-pad ties are added. C204 has a short local AON pickup, whose distribution is still open. R202 moved to B(17.9,1.3),90° without changing its value or nets, clearing the connector pair field.

The explicit [new-copper ownership audit](USB_C_New_Power_Copper_Intent_Audit.json) checks all 13 retained intended additions against their actual saved geometry and net: 13 pass, 0 ownership failures. It reports 0 duplicate-geometry matches separately. The rejected mux-area stitch is absent: True. This additional check matters because refilling can reassign a newly added object's net when it overlaps existing copper.

The previously accepted main-input plane extension restores regulator-input continuity around the new connector via wall. Its 0.80 mm × 1.05 mm In5 neck uses nominal 30 µm copper; trace-only resistance is approximately 0.754 mΩ at20°C. That excludes feeder, barrel, plane-spreading and thermal resistance. No complete input-current rating is claimed.

## Remaining work

1. Complete raw VBUS contacts, TVS return, MOSFET current path and protected bus to the eFuse and always-on LDO.
2. Restore AON distribution, MCU/mux/JTAG local supplies and returns, flash power, and moved FPGA bypass pickups.
3. Complete threshold, enable, power-good and sense routing, then recheck every physical pad and filled plane group.
4. Qualify PD/Type-C firmware, attach inrush, detach/brownout, protection transients, thermal load and the mounted power-distribution network.

The preferred source is a negotiated 9 V supply. The 5 V fallback requires explicit 3 A source authorization and a verified load budget. The MCU must keep the FPGA disabled until power negotiation is valid. The main switch is a **latched circuit breaker with controlled slew**, not a continuous current regulator.

None of the protected-feeder studies v47–v60 is adopted. Native-clear routes that split existing MAIN or 2.5 V plane groups were rejected, as was an approximately 50 mm detour. The C232/USB2 arrangement remains a separate joint routing study. These open items must remain visible in the review package.

[Machine-readable status](USB_C_Current_Power_Review.json)
