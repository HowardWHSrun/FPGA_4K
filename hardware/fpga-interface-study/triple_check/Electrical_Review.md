# Third-pass electrical review

26 September 2026. This adversarial review challenged the previous conclusions using the current native files and manufacturer sources. It found **no new power-pin or divider error**, but several earlier statements need tighter boundaries. A directly coupled LVDS guarantee gap remains; neither LVDS nor JTAG failure has been demonstrated. No CAD, public documents or manufacturing outputs were changed.

[Reproducible arithmetic and native evidence](Electrical_Review.json). The JSON contains project-relative paths, SHA-256 hashes, native pad nets, selected components, capacitor totals and explicit calculation assumptions.

## 1. Current boards are different electrical revisions

| Evidence read again | `minimal_core` | `full_system` |
|---|---|---|
| Physical components | 126 | 128 |
| Copper | 1,010 segments, 146 vias, 4 zones | 360 segments, 25 vias, no zones |
| Bank 0 / bank 14 | 3.3 V configuration rail | AUX 1.8 V |
| Bank 16 | 3.3 V configuration rail | 2.5 V link rail |
| CFGBVS | 3.3 V | GND |
| Boot flash | MX25L12833FM2I-10G | MX25U12835FM2I-10G |
| Oscillator | ASE-32.000MHZ-L-C-T | ASE3-32.000MHZ-L-C-T |
| C92 / R122 | Absent | Present |
| Assigned endpoints compared: manifest, PCB and fresh schematic netlist | 419; zero mismatches | 423; zero mismatches |

Board hashes match the second-pass readback. The independent CAD reviewer generated the fresh third-pass netlists used here; this electrical review does not claim to rerun DRC. The more complete 3.3 V copper cannot be cited as evidence that the 1.8 V/2.5 V board has been routed. Both still identify U1's exact speed/temperature order code as TBD. The existing core voltage calculation applies to the normal 1.0 V device options, not the 0.95 V-only `-1LI` variant. [AMD DS181, Tables 2 and 16](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

## 2. P1: preserve the LVDS guarantee gap, remove any implication of observed failure

DS181 Table 11, page 11 permits Artix-7 LVDS_25 output common mode up to 1.425 V with 100 Ω differential loading. DS931's HP LVDS table permits DC input common mode up to 1.425 V with `EQ_NONE`. Thus the positive common-mode offset allowance at the guaranteed source corner is zero. [DS181](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content), [DS931 LVDS table and notes 1–5](https://docs.amd.com/r/en-US/ds931-artix-ultrascale-plus/LVDS-DC-Specifications-LVDS).

`Vcm(receiver) = Vocm(transmitter) + GND(head) − GND(carrier) + common-mode disturbance`

This is a worst-case guarantee issue. Typical 1.25 V output common mode has appreciable allowance. Do not describe the link as inherently impossible, claim damaged inputs, or add independent maximum differential/common-mode extrema as though their simultaneous occurrence were established. Input-only operation at another VCCO without internal termination does not, by itself, expand the published common-mode window. The individual pin-voltage, overshoot and powered/unpowered limits are separate checks. [DS931 recommended conditions](https://docs.amd.com/r/en-US/ds931-artix-ultrascale-plus/Recommended-Operating-Conditions).

**Ground-topology correction:** both native J4 footprints connect contacts 4, 7, 10, 13, 16 and shell to GND. Contact 16 is the designated power return, but it cannot be modeled as the only DC return if the other grounds are bonded at the carrier. The 0.30 Ω complete-loop limit alone gives no individual return-path impedance.

| Hypothetical cable model at 0.60 A | Effective return | Ground rise | Receiver common mode at maximum / typical TX corner |
|---|---:|---:|---:|
| Previously illustrated half-loop return | 0.15 Ω | 90 mV | 1.515 / 1.340 V |
| One feed and five equal-resistance returns, total loop 0.30 Ω; shell omitted | 0.05 Ω | 30 mV | 1.455 / 1.280 V |

Neither is a measured cable model. Real shield/drain wire gauges, joints, connector contacts, shell bonding and any ASIC-carrier return paths determine current division. The parallel-return example substantially weakens a claim that 90 mV should be expected; it does not create guaranteed LVDS headroom.

Receiver-side AC coupling with a defined bias and termination remains a plausible correction without an active headboard part. It requires all four pairs, including the forwarded clock, and a complete bias/leakage/startup/high-pass analysis. External bias must use an appropriate AC receiver attribute combination; capacitors alone are not a finished solution. The lane streams must individually remain balanced through idle/training periods. [AMD UG571, AC coupling and LVDS attributes, pp123–125](https://docs.amd.com/api/khub/documents/kFbaUC5HGcXyGNauhgU6Gw/content), [UG912 DQS_BIAS](https://docs.amd.com/r/en-US/ug912-vivado-properties/DQS_BIAS).

## 3. P2: JTAG is a conditional static-margin screen, not a measured failure

The full-system TMS/TDI/TCK pullups are **10 kΩ**. Each external pullup draws roughly 0.18 mA at a near-zero LOW, plus any enabled internal pullup and input leakage. This is much lighter than the output drive/load conditions underlying the 0.45 V table bounds. Therefore 0.45 V must not be treated as a fixed transistor voltage drop. Better actual swing is plausible, but requires a supported load/drive analysis; a typical curve alone does not replace a release guarantee. Dedicated 7-series configuration outputs use the documented LVCMOS behavior and fixed drive. [UG470, configuration-bank voltage discussion, p17](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content), [DS931 HP LVCMOS18, Table 2](https://docs.amd.com/r/en-US/ds931-artix-ultrascale-plus/I/O-Levels).

For the assumed XEM 1.8 V setting, 1.71–1.89 V is an **I/O-standard operating envelope**, not a measured XEM regulator tolerance. Combining it conservatively with the calculated head rail gives carrier-to-head HIGH margin of **69.77 mV minus positive headboard ground rise**. At the two illustrative drops this becomes −20.23 mV or +39.77 mV. Returning TDO LOW margins are respectively +58.50 mV or +118.50 mV. The full four-state equations are in the JSON; their supply calculation excludes noise, copper and resistor drift.

Do not infer that every 1.8 V JTAG link fails. Do require an effective-return, signal-noise, input-clamp and TCK timing budget with the selected GPIO drive configuration. Static JTAG cannot use the LVDS AC-coupling remedy.

**A useful architecture correction:** 3.3 V `minimal_core` JTAG cannot connect directly to a 1.8 V HP assignment. However, XEM8310 also exposes HD bank 84 on VIO2 and HD banks 86/87 on VIO3, whose settings include 3.3 V. A separately assigned 3.3 V HD GPIO remote-JTAG master is possible in principle. Moving boot to 1.8 V was a rail-reuse/minimization choice, not the only legal XEM programming option. [Expansion banks](https://docs.opalkelly.com/xem8310/expansion-connectors/), [VIO settings](https://docs.opalkelly.com/xem8310/device-settings/).

## 4. P1: receiver-ready indicators do not prove the signal rail is valid

Bank 64 is HP and uses VIO1. Its supported settings are 0, 1.0, 1.2, 1.5 and 1.8 V; default is 1.0 V. The proposed link requires the stored setting `180`, a power cycle and verification. It is not a continuously programmable arbitrary-voltage source. VIO2/3 support additional 2.5/3.3 V choices. [Opal Kelly settings](https://docs.opalkelly.com/xem8310/device-settings/).

`BOARD_READY` at Y22 becomes active after firmware initialization, including adjustable rails, on firmware 1.56 or later. It then stays active, including through configuration. It is **not a continuous power-good monitor** and does not certify the stored setting is the intended one. A flash-loaded design can start beforehand. Separately, the module's PWR GOOD LED explicitly excludes VIOx supplies. [BOARD_READY behavior](https://docs.opalkelly.com/xem8310/usb-3-0-host-interface/), [power indicators](https://docs.opalkelly.com/xem8310/powering-the-xem8310/).

The receiver firmware contract must combine the expected VIO setting, initialization, target-power state and explicit link training. J4 contact 1 exports the target configuration-rail reference; it is neither a full-rail monitor nor a supply that should implicitly power XEM GPIO. Independent headboard/carrier loss of power must not leave LVDS or JTAG driving an unpowered receiver. The two CAD copies contain no completed receiver interlock or firmware. The XEM's dedicated JTAG connector does not implement this proposed remote master; fabric GPIO and BSCAN handling remain development work.

## 5. Power blocks: no new native wiring error; headroom and protection are bounded

Native U2–U5 retain the intended FB/VOS nodes, MODE high, VSEL grounded, FB2 unused and PG-to-EN sequence. In `full_system`, U2 and U3 sense their local 22 µF nodes upstream of R9/R122; the distributed networks remain downstream. Nominal totals are 462.9 µF core, 165.87 µF downstream AUX/config, 80.28 µF link and 102.84 µF ASIC I/O. The native ledger is in the JSON. The accepted four 22 µF/25 V 1206 input-cap replacements are present in both copies.

TI's effective capacitance conditions and distributed-capacitance example support this topology, subject to effective values and physical layout. PG sequencing requires input power; it does not prove shutdown order. Output discharge requires prior enable and sufficient residual VIN; its approximately 2 V sustaining threshold is typical. The device's 17 V operating limit, rather than 20 V absolute maximum, controls the intended entry envelope. [TPS62135, §§7.1–7.5, 9.3.2, 9.4.7, 10.3.2](https://www.ti.com/lit/ds/symlink/tps62135.pdf).

| Rail | Nominal upstream | Enumerated DC interval under the stated allocation |
|---|---:|---:|
| Core after 15 mΩ R9, 0–3 A | 1.02493 V | 0.96632–1.03810 V |
| AUX/config after 15 mΩ R122, 0–0.50 A | 1.80315 V | 1.76767–1.83112 V |
| Bank 16 | 2.50516 V | 2.46395–2.54647 V |
| ASIC I/O banks | 1.50831 V | 1.48599–1.53067 V |
| Older core configuration rail only | 3.31748 V | 3.26087–3.37423 V |

The intervals enumerate ±1% reference, ±0.1% divider tolerance and conservative symmetric ±70 nA feedback leakage; series resistors add ±1%. They exclude copper, temperature drift, ripple and transients. Enumerating correlated resistor corners changes the previous low limits only by a few microvolts. Core retains **16.32 mV** above 0.95 V at 3 A. That is a budget to spend, not proof that 3 A application operation is qualified. Capacitor manufacturer bias curves remain typical evidence. Inductor fault saturation and small-board temperature remain unresolved; no new conflict with the earlier audit was found.

The proposed 12 V ±5% source is within XEM8310's input range; branch the headboard supply at the carrier source. XEM input connector current ratings are not unused power-export ratings. [XEM power input](https://docs.opalkelly.com/xem8310/powering-the-xem8310/).

**P1: source protection remains absent, and its precision must not be overstated.** TPS259540 with 3.16 kΩ gives 0.67291 A by the nominal formula. Applying the headline ±7.5% plus resistor ±1% gives a conditional 0.61665–0.73025 A screen; the guaranteed current-limit table has no separate 3.16 kΩ row. It is reasonable as a candidate, not an established 0.60–0.75 A guarantee. Clamp response and current limiting are finite; a carrier clamp does not automatically suppress a cable-end plug transient. [TPS2595, electrical characteristics pp7–8 and §8.3.3](https://www.ti.com/lit/ds/symlink/tps2595.pdf).

The actual J4 is still a connector-family placeholder. No cable assembly, eFuse, UVLO network or 0.47 Ω entry resistor is implemented. The 0.60 A, 0.30 m and ≤25°C restrictions remain proposed qualification conditions. The connector's 0.8 A at 25°C is not a cable or all-temperature rating. [Molex PS-46765-003, §§4.2, 5.1](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf?inline=).

At 11.4 V and 0.60 A, with 0.30 Ω loop, 0.47 Ω damping and **53 mΩ eFuse resistance**, the assumed 80% efficiency yields **5.23498 W**, versus the earlier 5.25024 W omitting eFuse loss. Estimated availability therefore exceeds a 5.2 W load ceiling by only 35 mW before further uncounted loss under those assumptions. The stated per-rail allocations total 4.98103 W nominal upstream. Keep the lower allocation as the provisional operating budget and verify efficiency; do not advertise measured 5.2 W delivery. Startup capacitor charging is additional transient demand. The passive damping calculation does not establish converter-input stability or live-mating safety.

## 6. Throughput arithmetic survives; serial framing must preserve the premise

Three 800 Mbit/s lanes with 8b/10b provide 240 MB/s before framing. The proposed 6,165-byte frame at 31,250 frames/s consumes 192.65625 MB/s, or 80.2734%; it needs 642.1875 Mbit/s per lane before further training/idle overhead. Forwarded 800 Mbit/s DDR data uses a 400 MHz bit clock. Sixteen-bit sample padding would require 256 MB/s and does not fit.

A non-obvious implementation constraint: stripe complete input bytes among **three independent 8b/10b encoders** and retain running disparity on each physical lane, or prove an equivalent scheme. Arbitrarily distributing bits of one encoded stream across three wires does not preserve the per-lane balance required by AC coupling. Commas, lane alignment, clock restart and reset must be included in the real frame/idle format. The 20-byte metadata allocation is a proposal, not observed ASIC framing. BSCAN commands are a separate control path with no demonstrated service rate.

The candidate line rate is below DS181's listed 950 Mbit/s DDR transmitter limit for the slower relevant normal-voltage grade and DS931's 1,250 Mbit/s HP component-mode DDR receiver limit. These tables do not establish timing closure, package/PCB/cable skew, eye margin or receiver-to-PC-to-disk performance. [DS181 Table 16](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content), [DS931 LVDS component mode, Table 1 and note 1](https://docs.amd.com/r/en-US/ds931-artix-ultrascale-plus/FPGA-Logic-Performance-Characteristics).

## Corrections to carry forward now

1. Retain the LVDS **guarantee gap** wording; describe 90 mV as an illustration and include the actual parallel-ground topology.
2. Treat JTAG margins as conservative table bounds. Distinguish 3.3 V-to-1.8 V incompatibility from the XEM's separately configurable HD-bank alternative.
3. State that BOARD_READY and the PWR GOOD LED do not monitor VIO correctness continuously; design the startup/power-loss contract.
4. Keep the 4.981 W nominal rail allocation provisional, include protection losses and distinguish source protection proposals from installed circuits.
5. Preserve per-lane 8b/10b balance and account for training/command/transport behavior when implementing the link.

These corrections do not justify another speculative CAD change. Completing the receiver circuit, selected cable, application constraints and one integrated routed revision remains necessary before manufacture.
