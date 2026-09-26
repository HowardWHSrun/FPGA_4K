# Third independent review — 100T FPGA board

**Current action list:** [Fourth review](Fourth_Check_Review.md) and [uncertainty register](fourth_check/Uncertainty_Register.md). This third-pass record retains the original native-check scope; later source continuity and the pad-flag correction are documented separately.

2026-09-26. **Review completed; manufacturing release remains closed.** Three independent review tracks checked package/boot, electrical assumptions, and native CAD. This is an audit of design files and public component specifications, not measured hardware operation. No source PCB, schematic, footprint geometry or fabrication rule was changed during this pass.

## What passed

- All **324 FPGA symbol pin names** match AMD's CSG324 package records, and all 324 U1 pad/net assignments match each current schematic netlist.
- **117 unique ASIC signals** reconcile: 9 shared controls + 4 recording clocks + 12 SPI data + 88 ASIC outputs + 4 added SPI clocks. The 88 outputs contain 64 DATA, 8 returned CLK, 8 READ and 8 SYNC lines.
- The two mezzanines provide **120 numbered contacts**, with each accepted signal proposed once and three contacts reserved. Their ground blades are separate. Application pads and FPGA balls are still unassigned in CAD.
- The current core reserves **seven user I/O** for flash, oscillator and PUDC_B. Of the other 203, only 150 are on the three 1.5 V ASIC banks. Assigning 117 there leaves 33 voltage-compatible spare positions, before detailed placement constraints.
- Eight returned clocks fit the **12 bonded P-side clock groups** in raw capacity. Four complete bank-16 differential pairs fit the proposed three data lanes plus clock. Neither observation establishes a legal Vivado design.

Detailed evidence: [pin and boot audit](triple_check/Pin_Boot_Review.md), [electrical audit](triple_check/Electrical_Review.md), [native CAD audit](triple_check/CAD_Review.md).

## New findings and corrections

**1. J4 board-edge placement needs a mechanical correction.** Its footprint's manufacturer edge marker lies at x=39.3 mm, while the actual board edge is x=40.0 mm: the connector is 0.70 mm inward relative to the recommended edge. Moving J4 outward by 0.70 mm would leave only 0.425 mm from its nearest shell copper to the edge, below the current 0.50 mm rule. Resolve connector position, plug access, local outline and fabricator-approved clearances together. A zero physical-DRC count did not verify this interface. No rule was relaxed to hide the discrepancy. The inspected source is Molex drawing A3; the exact order code and current drawing still need confirmation.

**2. The older bring-up guide was wrong for the compact designs.** The root guide and build still assumed a 5 V input, J2/J3, test points and an R11 LED. Those files are now explicitly marked **legacy-only**, with a build-time warning. The compact core uses proposed custom 12 V entry and 3.3 V configuration; the separate rail revision uses 1.8 V configuration and only an XDC fragment. Neither has a matching validated firmware build or released power-on procedure. See [current bring-up status](research/Current_Design_Bringup_Status.md).

**3. Startup control states remain undefined.** PUDC_B is pulled high and the constraints request no internal bias on unused pins. ASIC reset/stimulation inactive levels and interlocks before/during configuration, after a fault and during reprogramming must be established externally where required. The eight physical ASICs also need an explicit mapping to the four stimulation-chip and two board-shared programming groups.

**4. Earlier cable calculations needed qualification.** The published LVDS transmitter/receiver common-mode limits leave no guaranteed positive ground-offset allowance at their extreme values, so a direct DC link is unqualified. The earlier 90 mV example was illustrative, not a prediction for this cable. Multiple ground contacts can reduce the drop; actual cable construction and current split are unknown. JTAG's conservative output-level table screen is also not a prediction of its actual lightly loaded output voltage. A receiver/common-mode solution, a JTAG voltage budget and startup behavior remain design work. Including the candidate eFuse loss leaves only about 35 mW of estimated supply headroom above the earlier 5.2 W load ceiling, before other uncounted losses, at assumed 80% efficiency; keep the lower 4.981 W nominal rail allocation provisional. Per-lane 8b/10b balance must also be preserved for any AC-coupled implementation.

**5. XEM8310 has more than one possible JTAG-bank choice.** Its proposed 1.8 V HP receiver bank is not the only exposed bank. A separately verified 3.3 V HD-bank GPIO bridge could support the earlier core's 3.3 V target JTAG; moving boot to 1.8 V is not the only possible programming architecture. BOARD_READY remains an initialization indicator, and PWR GOOD excludes VIOx; neither continuously proves receiver I/O voltage. The rail revision, firmware interlock and carrier pin map still require integration.

**6. Downloadable variants are now self-contained for review.** The rail revision and mezzanine study have their own ZIPs with native CAD and local libraries. The source study's footprint table contained workstation-specific absolute paths; only the packaging copy was changed to relative paths. Native PCB/project/schematic bytes are unchanged. [Archive verification](triple_check/Package_Independent_Review.md) checks hierarchy, libraries and source correspondence. These archives do not supply a fabrication package or 3D assembly clearance validation.

## Fresh native checks: three different designs

| Design | Parts | Physical DRC | Schematic parity | Unconnected items | All-category schematic ERC |
| --- | ---: | ---: | --- | ---: | --- |
| Most-routed minimal core | 126 | 0 | 0 issues | 139 | 211 open-pin errors + 10 warnings |
| Separate rail revision | 128 | 0 | 0 issues | 347 | 211 open-pin errors + 10 warnings |
| Separate mezzanine placement | 128 | 0 | Not applicable: no integrated schematic | 383 | Not applicable |

Native checks were run on scratch copies with zone refill where applicable. The source files remained unchanged. The saved schematic settings suppress four ERC categories; the all-category run discloses five additional four-way-junction warnings beyond the five saved symbol-type warnings. No DRC exclusions or ignored physical DRC types were used. The [CAD report](triple_check/CAD_Review.md) records source hashes, rule coverage and endpoint readback.

These missing-connection numbers cover assigned nets only. They exclude the unassigned 117 ASIC signals and eight cable data contacts; they are not a completion percentage. All three outlines remain **40 × 36 mm**; the final complete-board minimum is unproved.

## Remaining release work

1. Close ASIC electrical limits, physical-slot mapping, startup states, mating connector orientation/power and exact FPGA ordering code.
2. Integrate the bank-rail revision, mezzanines, connector-edge correction and carrier/cable protection into one complete schematic and PCB.
3. Assign application pins and receiver contacts, implement packed-sample capture/link/JTAG firmware, and close Vivado placement and timing. At the proposed link rate, 12-bit packed samples fit the arithmetic budget; 16-bit-per-sample transport does not.
4. Complete all copper with an approved stackup and manufacturing rules; qualify regulator stability, load/transient/thermal margins, cable return paths, receiver common-mode handling and unpowered/hot-plug behavior.
5. Independently inspect fabrication/assembly outputs only after design closure, then validate assembled hardware from power-up through sustained ASIC → XEM8310 → PC → disk capture.

The earlier [second-pass report](Double_Check_Review.md) remains dated evidence. This third review adds the mechanical/bring-up findings and refines its electrical interpretations; it does not establish finished or functional hardware.
