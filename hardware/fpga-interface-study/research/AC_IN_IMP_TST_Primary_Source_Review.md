# AC_IN and IMP_TST: primary-source review

Reviewed and expanded in a second pass on 2026-09-26. Read-only source inspection; no pin assignment or CAD change.

**Result: a historical custom-board netlist connects both signals directly to FPGA pins, supporting an intended FPGA interface. Their ASIC function, electrical limits and permitted drive behavior remain unspecified.** This netlist was missed in the first report and is included below as a correction. Keep both in the accepted 117-line budget; the wiring precedent alone does not establish an electrically qualified output assignment for the new FPGA.

The sources show two different reference arrangements: the custom ECP5 netlist connects both to FPGA I/O, while the older LDO/routing board exposes AC_IN at a separate one-pin terminal and passes IMP_TEST between connectors. These are real topology observations, not proof of a permitted analog waveform or digital drive sequence.

## Identifying the actual ASIC

The supplied `FPGA_4K/sources/slides/Chip_FPGA_Interface.pptx` and matching PDF describe a RISE/Rice chip with 512 recording channels, 128 stimulators, 12-bit ADCs, 31.25 kS/s per channel, TSMC 180 nm BCD, a 1.5 V supply and 8.1 × 7 mm die. See PDF pages 1, 3–5. Page 5 shows 32 modules of 16 amplifiers and four stimulators, multiplexed to eight output lines. Page 2 shows the wire-bonded ASIC/carrier. These are consistent with the local custom KiCad symbol named `U01_BCD_OFF_CHIP` and board references `U01_BCD1` / `U01_BCD2`.

This establishes the project’s own identification, not a public manufacturer part number. No matching published ASIC pin manual was located.

Do not substitute either similarly named public platform:

- [Fan et al., 2026, 5,376-channel platform](https://www.nature.com/articles/s44385-026-00103-8) is a 5,376-channel system; the [RISE chip gallery](https://chilab-rise.github.io/chip-gallery/) identifies that chip as TSMC 65 nm CMOS, October 2020, designer Yingying Fan. It is not established as this 512-channel BCD chip.
- [The 2024 modular 512-channel acquisition ASIC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11207344/) has 14-bit conversion, 1.8 V CMOS and two LVDS outputs, differing from the supplied 12-bit / 1.5 V / eight-output source. A shared channel count is not a pin-specification match.

## Direct local electrical evidence

All paths below are repository-relative within the preserved `FPGA_4K` reference collection. The same files were inspected in isolated presentation checkout `FPGA_4K_Professor_Review`, at base revision `eae49dd07c7c69cf1f3392da7075320ba3ac54cf`.

| Source | Exact observation | What it does and does not prove |
|---|---|---|
| `hardware/references/asic-carrier/PCB.kicad_pcb` | `/AC_IN`: U01_BCD1.AC_IN, U01_BCD2.AC_IN, J3.69 only | Shared wire to two chips and connector. No analog buffer, divider, DAC or logic driver on that net. Function and allowable input waveform remain unknown. |
| Same native PCB | `/IMP_TEST`: U01_BCD1.IMP_TST, U01_BCD2.IMP_TST, J3.67 only | Confirms that symbol `IMP_TST` and external net spelling `IMP_TEST` correspond in this board. No electrical pin specification. |
| `hardware/references/asic-carrier/PCB.kicad_sch`, symbol declarations near lines 2795 and 3353 | All 176 pins in the custom ASIC symbol, including these two, are declared `passive` | The symbol does not distinguish signal direction; `passive` is not evidence that these particular pins are analog. ERC cannot validate direct digital drive from this symbol. |
| `hardware/references/ldo-routing/PCB.kicad_pcb` | `/AC_IN`: J18.1 (`Conn_01x01_Pin`) and J2.39 only | AC_IN is brought out as a separate external terminal. It does not pass through the same J1 connector as IMP_TEST in this reference. Could support an external source, but the source type is not documented. |
| Same native PCB | `/IMP_TEST`: J1.18 and J2.37 only | Passive pass-through between connectors; no local conditioning or driver establishing its function. |
| `hardware/references/asic-carrier/Pins.xlsx`, Sheet1 B5/B6 | AC_IN and IMP_TST names only | Inventory, with no direction, unit, voltage range or function column populated for these entries. |
| Supplied interface PDF pages 13–14 | Describes CHIP_RESET, CLK32MHz_In, FE_RESET, gain SPI and returned data/CLK/READ/SYNC | Does not specify AC_IN or IMP_TST. |
| Supplied interface PDF pages 25–28 | Describes SPI CLK/L/R/LATCH and STIM_EN/START/CLK/CHB | Does not specify AC_IN or IMP_TST. |

Native PCB endpoint extraction is saved as [AC_IN_IMP_TST_Reference_Endpoints.json](AC_IN_IMP_TST_Reference_Endpoints.json). It enumerates every footprint pad on both relevant nets rather than relying on labels alone.

## Public author repository

Live GitHub read on 2026-09-26 verified [gt-ic/FPGA_512](https://github.com/gt-ic/FPGA_512) default branch `master`, current SHA `767e82528780005cbcb37b3e926197755bac622e` (same revision as the bundled reference). The public repository file tree contains no matching ASIC datasheet or ASIC circuit schematic; its supplied PDF is the ECP5 evaluation-board guide.

### Correction: historical custom-board netlist

[`FPGA board.net`](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/FPGA%20board.net#L3326), exported June 29, 2026 by Eeschema 9.0.2, declares U2 as **LFE5U-25F-7BG256I**, a 256-ball ECP5. Its nets contain:

| Net | Connector | FPGA pad/function | Other endpoints on that net |
|---|---|---|---|
| CB_AC_IN | CN1.16 | U2.D16 / PR8A | None |
| CB_IMP_TEST | CN1.18 | U2.E15 / PR8B | None |

See lines 1938–1941, 3326–3328 and 3365–3367. This is stronger evidence than the unused HDL declarations: an earlier custom-board design did provide direct FPGA wiring. The netlist labels the pin types `unspecified`, includes no ASIC pad circuit, and does not demonstrate which direction or voltage waveform was exercised. It is a different FPGA/package and board pin map from the evaluation-board firmware's J33 C2/B2 assignment. Do not combine their ball coordinates or treat the netlist as a passed hardware test.

The [official Lattice ECP5U-25 pin table](https://www.latticesemi.com/view_document?document_id=50485) places D16/PR8A and E15/PR8B in bank2; the historical netlist connects bank2's H11/J11 VCCIO pins to `+1V5` (lines 3199–3206). Thus **direct wiring to a 1.5 V FPGA bank is documented**, while the ASIC drive specification remains absent.

There is a further continuity limit: fresh export of the supplied routing schematic marks **J1.16 unconnected**, with AC_IN instead on J18.1 ↔ J2.39. If the historical FPGA's CN1 mates to routing J1 by equal contact numbers, its AC_IN wire stops at that unconnected contact. That mating assumption is not confirmed, so the sources must not be presented as a verified continuous FPGA-to-ASIC AC_IN path. The repository records custom-board acquisition tests, but no AC_IN/IMP_TEST functional exercise or electrical measurement was found.

### Firmware behavior

- [`fpga/top.v`, lines 61–62 and 133–143](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/fpga/top.v#L61): `j33_ac_in` and `j33_imp_test` are input wires placed in an unused-input expression. The adjacent FE_RESET and SPI pins are also unused inputs in this acquisition design, even though the interface tutorial describes controls driven toward the ASIC. Therefore top-level Verilog direction here is not evidence of ASIC direction.
- [`fpga/clock.lpf`, lines 80–81 and 95–96](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/fpga/clock.lpf#L80): assigns C2/B2 (J33.5/.6) and requests `LVCMOS15 PULLMODE=DOWN`. These are source constraints; no implemented-cell audit established that archived bitstreams retained these unused buffers/pulls. They do not specify the ASIC transfer function or establish that driving a square wave is valid.
- [`adc_4lane_framed/top_4lane_framed.v`, lines 53–54 and 538](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L53) and [its LPF lines 59–62](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_4lane_framed.lpf#L59) repeat unused input / 1.5 V pull-down handling. There is no functional AC stimulus or impedance-test sequence in these endpoints.

The [public RISE gallery source](https://github.com/chilab-rise/chilab-rise.github.io/blob/main/chip-gallery/index.html) was read through GitHub’s contents API because the browser extractor failed on the gallery URL. It lists the 5,376-channel device and other chips; it supplies no 512-channel BCD AC_IN/IMP_TST pin circuit. Targeted web searches for both spellings and for the supplied ASIC characteristics did not locate a matching primary pin specification. This is a bounded search result, not proof that no specification exists.

## Design consequence

1. Preserve both names and their shared topology in the application allocation ledger; explicitly mark electrical type/direction as **unresolved**.
2. Do not apply an output I/O standard or a fixed driving waveform merely because older FPGA input constraints used LVCMOS15.
3. Record the historical direct FPGA wiring as supporting design intent. Do not claim AC_IN is an analog injection input, IMP_TST is a digital enable, or either has qualified 100T output-drive limits without its ASIC circuit/specification. The separate AC_IN terminal and differing reference-board maps still need reconciliation.
4. Closure requires the actual ASIC pin/pad schematic or pin electrical specification with function, direction, allowed voltage/common-mode range, source impedance/load, idle state and test waveform/sequence. The existing documents cannot supply those numeric requirements.
5. The full-board manufacturing release gate remains open even if an unqualified provisional connector-to-ball map is generated. Such a map would not resolve this electrical ambiguity.

## Source integrity

- Supplied slide PDF SHA-256: `a8f6088e6d41f1e45fdae16e927656a5af1924d467fa9c2cf128d5bb4750320c`.
- Supplied PPTX: `7f2d6f16144337c9972da8db767505a0fbe06a94ea55ae1a7402121205dd0420`.
- Carrier schematic: `8d0b550316333a8f5fea1bd8d032baccb8046b9feb5322c6534fde23156cfefb`.
- LDO/routing schematic: `68b77107c583f9ec2a5a026e05779155baf43ff84b495b7848e5c9f434d13597`.
- Pins.xlsx: `fe4725de11ea453c70b9a5e25ef1f43ea5f6cf0ac84c57d5ccc677c94d0e4064`.
- Historical `FPGA board.net`: `e2cafdcdd51bb21bad90c66e849bfa87f3a5063200705a2b629d68c85def7e39`.

No instrument, FPGA programming, stimulation, power-up or hardware experiment was run.
