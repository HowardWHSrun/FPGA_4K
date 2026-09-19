# Eight-ASIC acquisition system: walkthrough and preliminary parts specification

> Historical source note. Current XC7A200T/micro-HDMI decisions supersede older link/device proposals. See [current status](../current-status.md). Text is retained with navigation adapted; unshipped local references are marked as archive paths.

**Superseded link proposal:** Howard has now selected micro-HDMI. Read [Current FPGA PCB decisions](../../sources/notes/2026-09-18-current-decisions.md) and [Current PCB-only questions](../../sources/notes/2026-09-18-current-questions.md) first. The USB/FX3 architecture, bank allocation and associated parts/power totals below are historical proposals pending replacement, not current procurement instructions.

**Expanded PDF review:** [27-page system and quantified parts guide](2026-09-18-superseded-usb-parts-guide.pdf) and [24-question Gerald checklist](2026-09-18-earlier-questions.pdf). The PDF adds exact USB path/contact counts, a physical-package count for the dual MOSFET, regulator support positions, and the original LDO circuit/package discrepancy.

Updated 18 September 2026. This guide incorporates the original ASIC slides, supplied Slack text, FPGA_512 reference, the 17 September meeting record, and current manufacturer documentation. It describes an engineering proposal with explicit calculations. It is not a fabrication release, an orderable final BOM, a measured power report, or evidence that the complete system already works.

## 1. Proposed system and why

```
4 carrier boards, each with 2 ASICs: 8 × 512 = 4,096 recording channels
           │ serial samples, returned timing; commands in the other direction
Routing/power PCB B+C: interconnect, quiet ASIC supplies, test access
           │ all required ASIC signals, power and ground returns
FPGA PCB D: XC7A200T capture → alignment → buffering → packet assembly
           │ 32-bit parallel GPIF II interface
FX3 USB controller → standard USB 3.0 cable → KR260 USB host
           │ KR260 receiver buffers, verifies, forwards
Configured 10 GbE / SFP+ link → PC records complete data and displays selected channels
```

Use **FX3 plus standard USB 3.0 for the first functional system**. KR260 already has USB host ports. Micro-HDMI could carry a custom digital link, but it would require a designed receiver adapter and a defined electrical/protocol implementation; a connector is not a protocol. It is a later size-optimization option. USB-C is a possible future USB connector and does not itself replace FX3.

Start with the [Infineon CYUSB3KIT-003 SuperSpeed Explorer Kit](https://www.infineon.com/evaluation-board/CYUSB3KIT-003). Its acquisition connector is standard USB 3.0 **Type-B**. A SuperSpeed Type-A-to-Type-B cable connects it to KR260 USB-A or a suitable computer. The separate USB2 connection is for debug.

The bench chain is Nexys Video FMC → verified interconnect PCB → Explorer Kit → USB host. The two boards do not mate directly. Infineon's [FMC interconnect reference](https://community.infineon.com/t5/Knowledge-Base-Articles/FMC-Interconnect-Board-for-FX3/ta-p/259818) is a starting reference, not verified Nexys compatibility. Check pin mapping, clock pins, power isolation, I/O voltage and timing. Nexys FMC VADJ defaults to 1.2 V; it must be deliberately configured to match the selected FX3 interface voltage before connection.

The custom-board proposal integrates FX3 alongside the FPGA. For this design, begin pin planning with GPIF at 3.3 V. The kit can instead use 1.8 V for relevant I/O domains, but both ends and the bank plan must match. GPIF cannot directly share a bank powered for 1.5 V ASIC I/O.

KR260 reception is part of this project, not an external assumption: configure its Linux USB receiver, queue bulk transfers, buffer data, detect discontinuities and forward through an implemented 10 GbE path. An SFP+ cage alone is not a functioning network link. KR260 and PC need compatible interfaces/cables and sufficient processing/storage bandwidth. KR260's four USB ports share two controllers; validate the topology and avoid competing traffic on the acquisition controller.

Sources: [KR260 interfaces](https://docs.amd.com/r/en-US/ug1092-kr260-starter-kit/Interfaces), [Explorer Kit guide](https://www.infineon.com/assets/row/public/documents/24/44/infineon-superspeed-explorer-kit-user-guide-usermanual-en.pdf?fileId=8ac78c8c7d0d8da4017d0ef82cf70d57), [Nexys Video manual](https://digilent.com/reference/_media/reference/programmable-logic/nexys-video/nexys-video_rm.pdf).

## 2. Data budget defines the transport and memory

Gerald's slide target is 31,250 samples/s/channel and 12 bits/sample. The existing reference code instead uses a 16 MHz ASIC clock and 15,625 samples/s/channel; it is a lower-rate reference, not proof of full-rate eight-chip operation.

| Full-rate quantity | Calculation | Result |
|---|---|---:|
| Samples | 8 × 512 × 31,250 | 128 million/s |
| Packed ADC payload | samples × 12/8 | 192 MB/s |
| Samples in 16-bit words | samples × 2 | 256 MB/s |
| Legacy-style framing estimate | 256 × 132/128 | 264 MB/s = 2.112 Gb/s |
| Proposed throughput test target | 264 × 1.20 | 316.8 MB/s sustained |
| 16-bit GPIF at 100 MHz | 16 × 100 MHz / 8 | 200 MB/s theoretical: insufficient |
| 32-bit GPIF at 100 MHz | 32 × 100 MHz / 8 | 400 MB/s theoretical |
| One hour stored at 264 MB/s | 264 × 3,600 | 950.4 GB decimal |

264 MB/s assumes the legacy overhead ratio and continuous full-rate recording. A new packet format with timestamps, sequence numbers and CRC must be recounted. USB/network overhead is additional. The 20% test margin is an engineering proposal. Neither USB's 5 Gb/s label nor the 400 MB/s GPIF arithmetic proves sustained acquisition. A 1 Gb/s Ethernet connection is insufficient for this stream.

The FPGA_512 implementation targets ECP5 plus FT600; port its capture/control concepts and verified protocol, not its device-specific FIFO/PLL/USB implementation unchanged. [Reference repository](https://github.com/gt-ic/FPGA_512), [FX3 slave FIFO design, AN65974](https://www.infineon.com/dgdl/Infineon-AN65974_Designing_with_the_EZ-USB_FX3_Slave_FIFO_Interface-ApplicationNotes-v17_00-EN.pdf?fileId=8ac78c8c7cdc391c017d07396c095deb).

## 3. Three kinds of memory

**FPGA boot flash is required for the agreed automatic-startup behavior.** The meeting discussed retaining the FPGA program after power-off. The XC7A200T full bitstream is 77,845,216 bits, or 9,730,652 bytes. A 128 Mbit / 16 MiB QSPI device fits one image. Propose **256 Mbit / 32 MiB** for space for a normal and recovery image. Recovery needs an implemented flash layout and boot/update procedure; capacity alone does not implement it. Densities above 128 Mbit require the appropriate addressing/opcode settings.

A concrete candidate is the **Infineon S25FL256S family**, with S25FL256SAGMFI000 as an example full order code for package review. Confirm the exact package/footprint, sector organization, voltage, Vivado alias and lifecycle before ordering. AMD's current Artix-7 configuration-memory table lists the S25FL256S variants. Do not assume a generic eight-pin flash footprint: serial-flash packages vary.

**Recording RAM holds temporary samples.** Internal FPGA BRAM is 1,681,920 bytes raw, including parity-capable bits. A conventional data/parity arrangement supplies 1,495,040 data bytes. At 264 MB/s that is only 6.37 ms raw or 5.66 ms conventional, before other consumers. No finite buffer fixes an output that is permanently slower than the input.

| Complete downstream pause | Minimum buffer at 264 MB/s, before margin |
|---|---:|
| 1 ms | 264 kB |
| 10 ms | 2.64 MB |
| 100 ms | 26.4 MB |

32 MiB holds approximately 127 ms; 64 MiB approximately 254 ms. **For continuous recording, carry external DDR RAM as a provisional design block and prove its required size using measured host stalls.** Start by using the Nexys Video's existing 512 MiB DDR3; it avoids designing the memory circuit before the need is measured. A 64 MiB usable buffer is a useful planning target, not a selected DDR part or lossless guarantee. A larger physical device may be easier to source. External DDR adds I/O, supply/reference/termination circuits, a controller, calibration and constrained routing. Reserve it during pin planning even if later evidence permits removal.

**FX3 firmware storage is separate again.** The kit can receive firmware from the host. An integrated board must deliberately choose host-loaded firmware at every boot, or a compatible dedicated boot EEPROM/SPI flash. Do not assume it can share the FPGA's QSPI flash without an explicit shared-bus design.

Sources: [AMD UG470](https://docs.amd.com/v/u/en-US/ug470_7Series_Config), [supported configuration memories](https://docs.amd.com/r/en-US/ug908-vivado-programming-debugging/Artix-7-Configuration-Memory-Devices), [S25FL256SAGMFI000](https://www.infineon.com/part/S25FL256SAGMFI000), [DS180 resources](https://docs.amd.com/v/u/en-US/ds180_7Series_Overview), local meeting record `9_17_26/FPGA_PCB_Meeting_Notes_2026-09-17.docx`.

## 4. Routing PCB: what belongs here

The routing board does not combine data streams. It carries the individual signals between carriers and FPGA and distributes clean power. Combining data happens inside the FPGA.

| Function / proposed parts | Quantity baseline | Purpose and remaining work |
|---|---:|---|
| Carrier connectors | 4 if each carrier has one system connector | Bring in four two-ASIC boards; verify exact connector, mating part, pin numbering and stacking height against actual carriers |
| FPGA-facing connector(s) | Contact count not frozen | Carry the full signal inventory plus grounds and power; choose after pin mapping and mechanical review |
| Low-noise ASIC LDOs, LT3042 class | 7 per shared low-voltage group | Five 1.5 V rails, one 1.6 V rail, one 0.75 V rail in the supplied reference; sharing/groups need current and noise measurements |
| LDO SET resistors | 5 × 15 kΩ; 1 × 16 kΩ; 1 × 7.5 kΩ per group | Set the seven nominal voltages using LT3042's 100 µA SET current |
| LDO input/output/SET capacitors | Per actual circuit and datasheet | Stability, filtering, startup and noise; include capacitors close to load/connector where appropriate |
| Current-measurement links and test points | Every rail plus grounds and key timing signals | Measure the real ASIC load, voltage drop and ripple; removable links should not interrupt normal high-speed returns |
| Clock distribution/series damping footprints | Conditional | Eight ASIC loads and board interconnect may require a buffer or source termination; calculate loading and verify edges first |
| Stimulation supply interface | Separate unresolved block | Establish actual positive/negative rail requirements before choosing supply generation and regulation |
| Mounting/strain relief and return paths | Mechanical design dependent | Protect fine-pitch connectors and provide predictable electrical returns |

These rails may already partly exist on a carrier. Reconcile that before duplicating regulators. A switching preregulator can feed the quiet LDO group; keep switching-current loops away from sensitive recording circuitry. Decide the system ground/reference connections deliberately rather than copying isolated AGND/DGND labels.

Eight ASICs have 64 serial data outputs plus 24 returned clock/READ/SYNC signals: **88 acquisition outputs**, before command lines, test signals, grounds and power contacts. Verify the current ASIC revision. An approximately 100-pin connector is not justified by an approximate 88-line figure.

### Recovered power setpoints and the important discrepancy

| Supplied net | Nominal voltage from actual SET resistor | Evidence status |
|---|---:|---|
| VDD_FE, VDD_ADC, VDD_DRIVER, DVDD, REF_VDD | 1.50 V each | Five 15 kΩ resistors in original LDO schematic |
| VDD_CGEN | 1.60 V | 16 kΩ |
| REF_VCM | 0.75 V | 7.5 kΩ |
| VDD10 | 9.00 V relative to AGND | 90 kΩ; name does not mean 10 V |
| VSS10 | INPUT_VSS10 + 9.00 V, if the floating circuit regulates | Regulator GND is connected to negative input; not a negative-voltage generator |

**The last two rails must not be copied as a verified ±10 V supply.** The reference expects external high-voltage inputs, and its negative circuit needs review. Also, FPGA_512 exports a +2 V feed whereas the supplied LDO board names a 3V3 input; these designs are not automatically interchangeable.

From slide 7: 4,096 × 17.24 µW/channel = **70.615 mW nominal recording power**, excluding external LDOs. Dividing by 1.5 V gives an equivalent 47.08 mA for scale, not per-rail maxima. One shared group of seven LT3042s adds approximately 14 mA typical light-load overhead, or 46.2 mW at 3.3 V. Eight duplicated groups would add about 369.6 mW before ASIC load. This is a reason to investigate sensible sharing, not proof all rails can be shared.

A provisional **0.5 A allocation from the 3.3 V rail for the ASIC low-voltage section** is reasonable under the explicit estimate of twice nominal recording power on rails at least 0.75 V, plus LDO overhead. It excludes stimulation and unmeasured startup/output-loading additions. LT3042's 200 mA rating is each regulator's capacity, not its expected load. At 200 mA, dropping 3.3 V to 1.5 V dissipates 0.36 W plus operating losses.

Sources: [original slides](../../sources/slides/Chip_FPGA_Interface.pptx), [original LDO schematic](../../hardware/references/ldo-routing/PCB.kicad_sch), [LT3042 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/lt3042.pdf). Detailed derivations: [ASIC power audit](../../sources/notes/2026-09-18-asic-power-audit.md).

## 5. FPGA PCB: component blocks and reasons

The accepted device is XC7A200T. Propose **XC7A200T-1SBG484C**, the Nexys Video device, as the package/speed/temperature baseline to validate. It is not interchangeable with an older XC7A35T-FGG484 design solely because both have 484 balls.

| Part/block | Preliminary quantity or candidate | Why needed / what closes the choice |
|---|---|---|
| Main FPGA | 1 × XC7A200T-1SBG484C candidate | Capture 8 ASICs, align samples, buffer and control transport; confirm timing, package availability and thermal range |
| FPGA boot flash | 1 × 256 Mbit QSPI; S25FL256S candidate | Automatic startup plus capacity for recovery; check exact order code and configuration settings |
| FX3 USB bridge | 1 × CYUSB3014-BZXC candidate; BZXI if industrial range required | Convert 32-bit GPIF stream to USB3; includes 512 KB internal RAM but is not a replacement for a large acquisition buffer |
| Four-output switching power stage | 1 × ADP5052 candidate | Generate 1.0, 1.8, 1.5 and 3.3 V from a planned 12 V feed |
| ADP5052 power components | 4 inductors; 2 low-side NMOS; associated feedback/compensation/soft-start/input/output parts | Ch1/2 require external low-side MOSFETs; exact values depend on load, switching frequency, ripple and layout |
| Additional FX3 1.2 V converter | 1 × TPS62160-class 1 A buck, plus inductor/support parts | Separate FX3 core/USB supply; transient response must handle PHY startup, not just average current |
| FPGA decoupling network | 79 parts for the illustrated bank plan | Local charge supply and controlled supply impedance; detailed table below |
| Peripheral decoupling/filtering | Separate parts for flash, clocks, FX3 and any DDR | The 79 count is not the complete PCB capacitor count |
| FPGA reference oscillator | 1 × 100 MHz candidate with bank-compatible output | Stable reference; FPGA clock management generates required internal/ASIC clocks; jitter and pin placement need constraints |
| FX3 reference clock | Crystal/oscillator plus load/support components per FX3 reference | Required USB/GPIF clock generation; finalize supported frequency and boot configuration together |
| Configuration and reset parts | JTAG header, PROGRAM_B control, required pull-ups, mode/CFGBVS/PUDC_B settings, status test points | JTAG debug and reliable boot; hold ASIC controls in a safe reset state until ready |
| USB3 receptacle and protection | Type-B for simple prototype, or Type-C with proper CC/orientation implementation | Physical data link; add specified AC coupling, low-capacitance ESD, VBUS detection and controlled-impedance routing |
| FX3 boot/reset circuitry | Boot straps/reset plus selected host-loading or dedicated NVM scheme | Ensure repeatable startup without manually launching an unexplained firmware download |
| External acquisition RAM | Provisional DDR block; part/capacity after prototype measurements | Absorb host stalls; adds controller, VREF/termination/supply circuits and DDR layout constraints |
| Routing-board connector(s) | Derived from full signal and ground inventory | Join the ASIC system without guessing pin count |
| Power input/measurement hardware | Connector, input protection, rail measurement links, power-good/reset sequencing | Controlled bring-up, current measurement, no USB backfeed |
| Mounting, probe access, optional indicators | Mechanical design dependent | Allow assembly and fault isolation; thermal provision depends on measured/estimated heat |

ADP5052's optional internal LDO is only 200 mA and is not the proposed 0.5 A ASIC feed. The latter is an allocation within the 3.3 V buck output. ADP5052 input is rated to 15 V, so account for tolerance/transients on a nominal 12 V source. Simultaneous thermal capability of all four channels must be checked. Its minimum on-time also constrains frequency: 12 V to 1 V at 1.4 MHz would require approximately 60 ns, below the specified channel 1/2 minimum on-time. Select switching frequency for worst-case input and timing limits, and include bootstrap components; do not choose the highest frequency merely to reduce inductor size. [ADP5052](https://www.analog.com/en/products/adp5052.html), [TPS62160](https://www.ti.com/product/TPS62160), [FX3 controller](https://www.infineon.com/part/CYUSB3014-BZXC).

JTAG programming writes a bitstream into volatile FPGA configuration memory. Programming QSPI enables automatic reload at power-up. Neither requires an on-board USB-JTAG bridge: an external programmer and header can save board space. Nexys Video's PROG port serves this purpose; it is not the proposed high-rate acquisition USB connection.

### Bank plan to check in Vivado before drawing final connectors

SBG484 exposes six user-I/O banks: bank 13 has 35 I/O; banks 14/15/16/34/35 have 50 each, totaling 285. Start with banks 13 and 14 at **3.3 V** for FX3 and QSPI-compatible functions, and banks 15/16/34/35 at **1.5 V** for the provisional ASIC interface and possible DDR allocation. Bank 14 contains QSPI data/chip select; bank 0 contains dedicated configuration controls and also uses the compatible configuration voltage.

The 32-bit GPIF bus plus controls and clock will not fit entirely in bank 13. Distribute pins deliberately and validate clock reach, timing and simultaneous-switching constraints. External DDR needs its own compatible pin plan; unused pin totals do not guarantee a legal MIG implementation. The 1.5 V ASIC interface remains inferred from the reference design, not a replacement for ASIC limits.

The Nexys Video FMC does not expose all 285 chip I/O. Use it first for generated-data USB testing, and separately for a feasible subset of ASIC capture. Do not promise all eight ASICs and FX3 fit its expansion connectors simultaneously without a pin audit.

## 6. Exact AMD capacitor baseline for XC7A200T/SBG484

UG483 Table 2-2 was checked for this package; Table 2-5 supplies electrical/component guidance.

| FPGA supply | Recommended capacitors |
|---|---|
| VCCINT | 1 × 680 µF; 12 × 4.7 µF; 14 × 0.47 µF |
| VCCBRAM | 1 × 100 µF; 3 × 0.47 µF |
| VCCAUX | 1 × 47 µF; 3 × 4.7 µF; 5 × 0.47 µF |
| VCCO bank 0 | 1 × 47 µF |
| Each of six other VCCO banks | 2 × 4.7 µF; 4 × 0.47 µF |
| Shared nonzero-bank bulk | 1 × 47 or 100 µF per up to four banks sharing the same voltage |

Using 47 µF for the two shared bulk capacitors in the proposed four-bank/ two-bank grouping gives:

| Value | Quantity | AMD reference body/type | Maximum component ESL | ESR interval |
|---|---:|---|---:|---|
| 680 µF | 1 | 2917 / D / 7343 tantalum | 2 nH | 5 < ESR < 40 mΩ |
| 100 µF | 1 | 1210 tantalum or X5R/X7R ceramic | 1 nH | 1 < ESR < 40 mΩ |
| 47 µF | 4 | 1210 X5R/X7R ceramic | 1 nH | 1 < ESR < 40 mΩ |
| 4.7 µF | 27 | 0805 X5R/X7R ceramic | 0.5 nH | 1 < ESR < 20 mΩ |
| 0.47 µF | 46 | 0603 X5R/X7R ceramic | 0.5 nH | 1 < ESR < 20 mΩ |
| Total | **79** | FPGA supply network only | | |

Reference voltage ratings are 2.5 V for the first two rows and 6.3 V for the remaining rows. Historical AMD examples are T530X687M006ATE018, GRM32ER60J107ME20L, GRM32ER70J476ME20L, GRM21BR71A475KA73 and GRM188R70J474KA01, respectively. Those examples are not a checked purchasing list. Higher voltage ratings and smaller bodies can be appropriate, but effective capacitance, tolerance, DC bias, ESR/ESL and layout must be checked; these are not interchangeable merely by printed µF value.

This is a high-utilization manufacturer starting network, not a universal minimum or the total board count. It excludes regulator requirements and FX3/flash/oscillator/ASIC/DDR/XADC/GTP support. Core and BRAM sharing a regulator does not automatically delete their separate recommended capacitors. Unused GTP/XADC connections follow AMD's respective guidance; they must not be improvised. The USB/FX3 route does not require using FPGA GTP transceivers.

Source and detailed audit: [AMD UG483](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB), capacitor and memory audit (local archive: `9_18_26/detail_review/capacitor_memory_research.md`).

## 7. Preliminary regulator ratings, with the assumptions visible

Data rate does not determine FPGA current by itself. Dynamic power also depends on implemented logic, clock frequencies, switching activity, capacitance, I/O loads, voltage and temperature. Use the same-device Nexys design as a sensible provision, then replace the estimates with AMD power analysis and measurements.

| Rail | Preliminary regulator capacity | Consumers / basis |
|---|---:|---|
| 1.0 V | 4 A | VCCINT + VCCBRAM; same-device Nexys provisioning anchor |
| 1.8 V | 1.2 A | FPGA auxiliary and properly filtered analog support where used |
| 1.5 V | 1.2 A | ASIC-facing FPGA I/O; conditional DDR load requires a revised budget |
| 3.3 V | 1.2 A | Config/GPIF I/O, flash, FX3 support; includes the provisional 0.5 A ASIC LDO allocation |
| 1.2 V | 1 A | FX3 core/USB PHY; startup transient still needs validation |

These capacities sum to **13.12 W at the outputs**. They are not a prediction that this headboard dissipates 13.12 W. Assuming 85% overall conversion efficiency and adding 25% supply margin gives 13.12 / 0.85 / 12 × 1.25 = **1.608 A at 12 V**. Thus a **12 V, 2 A planning source** is reasonable for the defined low-voltage envelope. This excludes KR260, stimulation high-voltage generation, and later loads beyond these allocations. Exact efficiency and power-stage thermals remain unverified.

Use a self-powered custom headboard with proper USB VBUS detection and no backfeeding. A standard USB3 port's nominal 4.5 W allocation does not cover the provisioned envelope. A development kit can be USB powered while the FPGA board uses its own supply; that does not mean the integrated system can all be powered by the same USB port.

### Startup arithmetic demonstrates why nominal current alone is insufficient

DS181 lists typical XC7A200T quiescent currents of 328 mA core, 11 mA BRAM and 73 mA auxiliary for the standard 1 V grades. Table 5 specifies nominal voltage, 85 °C junction temperature and a blank configured device without output-current loads. These are typical, not guaranteed worst-case values. Evaluating Table 6's minimum power-on-current expressions using these Table 5 typical values gives 328 + 340 + 11 + 80 = **759 mA** for combined core/BRAM before the simple PCB-capacitor charging calculation. This is not a measured or maximum startup current.

The recommended core/BRAM network totals **844.39 µF**. Charging it linearly from 0 to 1.0 V in 5 ms requires approximately CΔV/Δt = **168.9 mA**. Combining those illustrative figures gives about **0.928 A**. Charging through the full 1.0 V in 0.2 ms would require **4.22 A** for those nominal capacitors alone. Therefore a fast ramp can overrun an apparently adequate supply. These full-swing examples differ from DS181's ramp-time definition, which measures 0 to 90% of the nominal voltage. This is illustrative arithmetic, not a guaranteed startup bound; add actual regulator capacitors, capacitance tolerances and the actual ramp/load/current-limit behavior.

DS181 specifies 0.2–50 ms supply ramp times and recommends core/BRAM, then auxiliary, then I/O sequencing, with compatible same-voltage supplies allowed to ramp together. Confirm the complete design against its requirements. FX3 also presents a brief USB PHY startup surge; its average supply current is not enough to select decoupling.

What remains to close power: a Vivado/XPE estimate using the actual capture/GPIF/DDR implementation, realistic switching/activity and I/O capacitance; regulator stability/thermal analysis; actual per-rail current in reset, 16 MHz recording, 32 MHz recording, and selected stimulation states; startup/ripple/load-step measurements. [DS181](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet), [Nexys manual](https://digilent.com/reference/_media/reference/programmable-logic/nexys-video/nexys-video_rm.pdf), FX3 supply/inrush research (local archive: `9_18_26/detail_review/connector_research.md`).

## 8. Software and FPGA work you need to own

| Layer | What is implemented | How we show it works |
|---|---|---|
| ASIC control in FPGA | Clocks, resets, SPI programming, gain/stimulation settings, defined startup state | Check actual waveforms and register/configuration behavior against the current ASIC revision |
| ASIC capture in FPGA | Serial-to-parallel capture, returned-clock timing, READ/SYNC use, channel alignment, eight-chip synchronization | Known channel patterns; one chip first, then scaling; verify physical setup/hold and channel identity |
| FPGA data path | Clock-domain crossing FIFOs, timestamps, packet format, counters/CRC, optional DDR ring buffer, GPIF flags | Simulation with stalls/errors, then timing closure and hardware sequence checking |
| FX3 firmware, usually C | GPIF state machine, DMA, USB descriptors/endpoints, flow control and command forwarding | Generated FPGA data at required rate without lost/duplicated words |
| KR260 program, C/C++ suitable for high-rate path | Asynchronous queued USB reception, buffer management, parsing/error counters and network forwarding | Sustained capture with measured CPU use, queue depth, maximum stalls and no counter gaps |
| KR260 network hardware/system | Configure supported 10 GbE/SFP+ path, driver/device tree as required, link setup | Measure host-to-host throughput and loss while USB receive runs concurrently |
| PC recorder and viewer | Validate packets, write all selected recording data, show a downsampled/subset view, log metadata/errors | Compare generated source patterns to saved files; verify storage speed and capacity |
| Boot/update and diagnostics | FPGA flash, FX3 firmware startup, software launch, version IDs, power/error reporting | Power-cycle repeatedly and identify which layer failed without guessing |

Commands travel back from PC/KR260 through USB OUT/control messages, FX3 and FPGA to the ASICs. Do not confuse successful host USB submission with proof that an ASIC accepted or executed the command; add acknowledgements/status where hardware permits.

The receiver is manageable but must be measured. Owning it means understanding its queues and failure behavior, rather than assuming a cable or Linux driver makes continuous recording automatic.

## 9. Work sequence and what is actually settled

1. **Freeze a written interface table.** Inventory every carrier contact: direction, voltage, reference ground, signal name, ASIC identity, timing and allowed sharing. Resolve the high-voltage discrepancy and exact connector mating parts. This is the main missing electrical evidence.
2. **Prove transport with generated data.** Map Nexys-to-FX3 properly, start on a computer, then KR260, then the complete KR260-to-PC path. Target at least 316.8 MB/s for the current framing assumption; verify counters/CRC and measure stalls. The existing PROG/JTAG connection does not prove acquisition bandwidth.
3. **Prove real capture separately.** Use a feasible ASIC subset, validate clock/READ/SYNC/channel order and real power. Work up to the full design; do not assume all necessary I/O fit on Nexys expansion headers.
4. **Choose buffer policy and lock pins.** Decide maximum tolerated stalls and what happens on overflow; demonstrate the DDR controller if needed. Build a Vivado pin/clock skeleton covering ASICs, GPIF, configuration and memory before committing to PCB routing.
5. **Complete schematic and orderable BOM.** Assign exact footprints/ratings and component values; calculate regulator components; inspect every power/configuration pin. Add voltage/current/boot test access. The older 35T drafts are reference material, not a completed 200T PCB.
6. **Lay out and review the PCB.** Choose fabricator-supported BGA escape, layers/stackup and impedance; route clocks, GPIF, USB and optional DDR to their constraints. Complete ERC/DRC, pin-to-connector checks, power-network/thermal review and assembly checks before fabrication.
7. **Bring up in stages.** Verify rails/sequencing first, then JTAG/flash/clocks, then generated transport, then one ASIC, then all eight. Validate the agreed recording duration and stimulation/recovery behavior; preserve error counts in the output files.

Settled by user direction: XC7A200T; eight 512-channel ASICs across four carriers; carrier → routing → FPGA → KR260 → PC structure; compactness is secondary to function; automatic boot storage belongs in the design.

Proposed here, not silently promoted to user decisions: SBG484/-1/C exact FPGA variant; FX3/USB3 first link; 256 Mbit flash; preliminary rail capacities and bank plan; external DDR planning block and 64 MiB usable-buffer target; a 20% throughput margin.

Still unknown: authoritative current ASIC electrical/timing limits and revision mapping; exact per-rail peak currents; stimulation supply/concurrency and immediate post-stimulation behavior; measured link stalls and sustained full-chain throughput; final timing-legal pin map and package; exact regulator/DDR/connector/orderable passive choices. We can make and test engineering choices for these; they do not depend on waiting for one named collaborator to own the receiving end.

## Supporting records

- Connector and FX3 research (local archive: `9_18_26/detail_review/connector_research.md`)
- [ASIC supply reconstruction](../../sources/notes/2026-09-18-asic-power-audit.md)
- Capacitor, package and memory audit (local archive: `9_18_26/detail_review/capacitor_memory_research.md`)
- Reproducible calculation results (local archive: `9_18_26/detail_review/design_calculations.json`)
- [Earlier source baseline](2026-09-18-earlier-baseline.md)
- Original sources remain in `Original Sources/`; reference schematics and slides were not edited.
