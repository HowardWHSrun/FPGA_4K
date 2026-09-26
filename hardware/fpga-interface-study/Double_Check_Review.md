# Second independent check — 26 September 2026

**The check found an electrical margin gap and corrected an incomplete source review. The board remains unfinished and is not released for manufacture.** Three separate reviews rechecked native CAD, power/receiver limits, and original ASIC evidence. Source CAD was kept unchanged so the results refer to the same downloadable checkpoint.

## 1. Powered-cable interface needs correction

The proposed direct LVDS cable has no guaranteed positive ground-offset margin at the datasheet corner: the Artix-7 transmitter's maximum common-mode voltage and XEM8310 HP receiver's DC input limit are both **1.425 V**. Power-return voltage drop adds to the signal's common mode at the receiver. The existing total cable-resistance limit does not resolve this. This is a missing guarantee, not a claim that every physical unit fails. [AMD DS181 Table 11](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content), [AMD DS931 LVDS limits](https://docs.amd.com/r/en-US/ds931-artix-ultrascale-plus/LVDS-DC-Specifications-LVDS).

Carrier-side AC coupling with defined receiver bias and termination is a candidate that preserves headboard space. It must cover the clock as well as the three data lanes and define idle/training, startup and clock-loss behavior. No completed coupling circuit is claimed. The static JTAG wires need a separate return/noise or buffering solution; they cannot use that AC-coupling remedy. The conservative proposed 1.8 V JTAG HIGH allowance is only **69.8 mV before ground drop and noise**.

XEM8310's relevant VIO1 rail also defaults to **1.0 V**, so the proposed 1.8 V link needs an explicit setting, power cycle and startup interlock. [Opal Kelly settings](https://docs.opalkelly.com/xem8310/device-settings/), [BOARD_READY behavior](https://docs.opalkelly.com/xem8310/usb-3-0-host-interface/).

These requirements are now in the [interface proposal](Full_System_Interface_Proposal.md) and [electrical audit](Power_Electrical_Release_Audit.md). No new converter-pin, divider or 1.8 V boot-rail mismatch was found in native readback. The previously corrected input capacitors remain present.

## 2. AC_IN / IMP_TST: stronger evidence, still missing limits

The first report missed the historical custom FPGA netlist. It connects **CN1.16 to ECP5 D16 for AC_IN**, and **CN1.18 to E15 for IMP_TEST**; both FPGA pins belong to a **1.5 V bank**. This supports an intended FPGA interface. [Original netlist](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/FPGA%20board.net#L3326).

However, the supplied routing schematic leaves **J1.16 unconnected** and brings AC_IN to separate terminal J18. If those connectors mate by matching numbers, the AC_IN path stops there. Matching board revisions/orientation are not established. The older acquisition tests do not demonstrate either test-pin function, and no ASIC pad circuit, drive limits or operating sequence was found in the reviewed slides, netlists or 60 reachable public commits.

The corrected [source review](research/AC_IN_IMP_TST_Primary_Source_Review.md) separates this wiring precedent, unused firmware inputs and author-reported acquisition results. **117 remains the accepted named-signal count; it is not 117 electrically qualified FPGA connections.**

## 3. Fresh native KiCad results

| Check | Routed core checkpoint | Separate two-mezzanine study |
|---|---:|---:|
| Outline | 40 × 36 mm | 40 × 36 mm |
| Parts | 126 | 128 |
| Physical DRC violations | 0 | 0 |
| Missing copper connections | **139** | **383** |
| Schematic parity | 0 issues | No integrated study schematic |
| New mezzanine signal-pad nets | Connectors absent | **All 120 unassigned** |

All **636 numbered core endpoints** match the fresh native schematic export, including all **419 intended connected endpoints**. J2/J3, test points and the other removed optional access parts remain absent. All ground connections are present in the current core connectivity check.

Saved-project ERC reports **211 open pins + 5 pin-type warnings**. Enabling its four normally ignored categories in a scratch project gives **211 errors + 10 warnings**: five additional four-way-junction warnings. Those five were traced to intended power/ground intersections with no netlist mismatch; staggering the branches would improve drawing clarity. Zero ignored checks applies to the saved **DRC**, not its ERC configuration.

The study's 383 missing connections do **not** include its 120 unassigned signal contacts. Likewise, the core's 139 missing connections do not count the not-yet-created 117 ASIC routes. Neither number is a completion percentage. The connector footprint still has the documented 0.02645 mm manufacturer-drawing ambiguity and lacks confirmed mating-board/3D assembly clearance.

Fresh evidence: [CAD readback and check summary](double_check/CAD_Independent_Double_Check.json), [all-category ERC](double_check/CAD_Core_ERC_All_Categories.json). The source board hashes remain `3844c24f…` for the core and `186018ad…` for the placement study.

## What was corrected

The public research now acknowledges historical direct FPGA wiring and the conditional routing discontinuity. The power/interface documents now require signal-reference margins and receiver startup handling. The review page discloses the stricter ERC result. Start-page links distinguish the current 100T/XEM8310 work from the earlier draft.

No copper, component or production file was changed by this audit. The routed core, separate 1.8 V/2.5 V rail revision and two-mezzanine placement still require integration into one full board, followed by completed routing, FPGA/receiver firmware, manufacturing-rule review and functional qualification.
