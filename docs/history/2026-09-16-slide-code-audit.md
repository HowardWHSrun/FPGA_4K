# Gerald's Chip–FPGA Interface slides: evidence and conflicts

> Historical source note. Current XC7A200T/micro-HDMI decisions supersede older link/device proposals. See [current status](../current-status.md). Text is retained with navigation adapted; unshipped local references are marked as archive paths.

Inspected 2026-09-16, including all 28 slide renders and full-size protocol/configuration/stimulation images.

## Source preservation and validation

Original attachment: `source archive: 9_12_26 Chip Design Test /Chip_FPGA Interface.pptx`.

Preserved unchanged as `research/gerald_slides/Chip_FPGA_Interface.pptx`. The archived LibreOffice render was copied to `research/gerald_slides/Chip_FPGA_Interface_existing.pdf`; it has 28 pages, matching the PPTX's 28 slide XML files. Every extracted PPTX text line occurs on the corresponding PDF page after normalizing punctuation and whitespace. Slide order and visuals were reviewed in the renders. This validates use of the existing render for this audit; it is not a fresh PowerPoint application render.

Outputs:

- `research/gerald_slides/all_slide_text.txt`: complete native PPTX text, grouped by slide.
- `research/gerald_slides/slide_XX.txt` and `slide_XX_pdf.txt`: per-slide native text and PDF text (the PDF also exposes text inside some embedded vector diagrams).
- `research/gerald_slides/slide_inventory.json`: original image references by slide.
- `research/gerald_slides/media/`: all original embedded image assets, including vector EMFs.
- `research/gerald_slides/rendered/slide-01.png` through `slide-28.png`: 1600-pixel slide renders.
- `research/gerald_slides/rendered/contact_01.jpg`, `contact_08.jpg`, `contact_15.jpg`, `contact_22.jpg`: full-deck review contact sheets.

**Evidence status:** These slides document the supplied ASIC/interface design. They are stronger evidence of the intended chip protocol than a generic board example, but they do not establish which hardware revision or FPGA bitstream is currently connected. The inspected FPGA_512 source is commit `767e82528780005cbcb37b3e926197755bac622e`.

## Main effect on the meeting sheet

1. Prefill the recording chip as **512 recording channels and 128 stimulation channels per ASIC**, 12-bit ADC conversion and eight serial data lines. Slides 4–6 provide these explicitly.
2. Show **31.25 kS/s/channel as the slide specification**, beside **15.625 kS/s/channel in the current repository host configuration**. Do not merge them into a single confirmed answer. At the slide rate, legacy 512-channel framing would require 33 MB/s, and tentative 4096 channels would require 264 MB/s total.
3. Treat the chip's **Sync signal as functionally important to channel identification**. Slides 14–17 say Sync aligns the channel map, but current top-level RTL does not use it.
4. Preserve four configuration pins (`CLK`, `L`, `R`, `LATCH`) even for recording-only operation unless another configuration route is proven: the slides say they set amplifier gain as well as stimulation.
5. Preserve the distinction between digital control and analog stimulation. The slides' **±10 V stimulation compliance is not an FPGA I/O voltage** and does not imply adding ±10 V to the FPGA core power tree.
6. Keep MCU type/role, output-link arrangement, Artix exact ordering code, size, power budget, two-FPGA split and 4K physical ASIC arrangement open.

## Slide-by-slide evidence

| Slide | What is actually shown | Meeting implication / status |
|---:|---|---|
| 1 | ASIC floorplan and die photo, 8.1 × 7 mm. Central recording/stimulation area and edge PGA/buffer/SAR-ADC regions. Label says 512 recording pixels and “128/512 stimulating.” | This is the recording ASIC, not the Artix FPGA. Use slide 4's explicit 128-stimulator specification; ask what “128/512” denotes if relevant. Die dimensions do not bound FPGA-PCB size. |
| 2 | Bonding-map board photographs, with wire-bonded die. | Confirms physical ASIC-board interface exists. It is a photo, not a readable complete connector pinout or manufacturing drawing. Request the current bonding map and routing-board schematic. |
| 3 | Recording specification table: 512 channels; gain 110–700; 0.3 Hz–10 kHz; 4–5 µVrms; 12-bit ADC; reset <1.5 ms; <20 µW/channel; 13 MΩ at 1 kHz; 31.25 kS/s/channel. | Use as chip specification with revision confirmation. No ADC chip needs to be added to CP SOM ONE if this external recording ASIC performs conversion. |
| 4 | Same recording table plus 128 stimulation channels, ±10 V compliance, 22.5 µA max, 1.5 µA step, <200 Hz, 31.25 µs temporal resolution, arbitrary monopolar/bipolar modes and <10 mV residual charge balance. | Stimulation capability is part of the chip, but whether the small unit must support it remains open. Electrical/biological validation is outside this source review. |
| 5 | One module contains 16 amplifiers + four stimulators and one 12-bit ADC; 32 modules yield 512 recording +128 stimulators. Four ADCs share each output, resulting in eight data lines. | Answers why 512 channels need eight data wires. 32 internal ADCs ×16 channels/ADC, grouped four ADCs per data line. |
| 6 | Recording signal chain, 12-bit ADC, gain 100–700, 31.25 kS/s/channel, noise example ~4.2 µVrms. | Confirms conversion is within the ASIC. Small gain-range inconsistency: 100 lower bound here versus 110 in slides 3–4. Use code-to-gain calibration table, not a guessed gain. |
| 7 | Same chain and rate; ~17.24 µW/channel DC power, excluding external LDOs; power breakdown graphic. | ASIC recording power is not FPGA-PCB power. At 512 channels this is ~8.83 mW calculated, excluding external regulator losses and other stated exclusions; do not use it to size Artix supplies. |
| 8 | ASIC/probe in saline sketch and noise histogram, mean 6.5 µVrms, SD 0.3 µVrms. | Example of system-level measurement. Noise target for the new assembled system remains an acceptance question. |
| 9 | Custom GUI with recording controls above and stimulation controls below. | Shows intended operator functions; does not identify MCU, FT600 or current software version. |
| 10 | GUI Start recording sends a sequence to the FPGA. | Need start/stop semantics. Current main RTL is continuously streaming once ready; a host WAV-record command is not equivalent to gating the ASIC clock. |
| 11 | GUI amplifier reset command. | Keep front-end reset path and define polarity/duration/recovery. |
| 12 | Left/right gain selectors and Program Gains button; sides can differ. | Two configuration streams have functional purpose. Gain changes need a validated serialization map. |
| 13 | `Chip_Reset`; FPGA sends `CLK32MHz_In` to ASIC to start recording; `FE_RESET`; gain configured by SPI. | Clock direction differs from “ADC board clock input only” simplification. Confirm actual clock frequency and gating; current RTL forwards 16 MHz. |
| 14 | ASIC returns `CLK32MHz_Out`, `Data<1:8>`, `Read` and `Sync`. One data line = four ADCs ×16 amplifiers =64 channels. | Gives the core acquisition interface and timing-source ownership. Returned clock must reach a suitable FPGA clock-capable pin. |
| 15 | Frame diagram and first highlighted amplifier group. 1024 clock cycles/frame; one Sync and16 Read events; each Read carries four amplifiers, one from each ADC. | At32 MHz, frame period32 µs and sample rate31.25 kS/s/channel. This conflicts with current host15.625 kS/s. |
| 16 | Same protocol with the next amplifier group highlighted. | Channel identity depends on group sequence, not just receiving valid12-bit words. |
| 17 | Same protocol, data-order matrix and highlight animation endpoint. Timing drawing shows16 clock slots then48 data bits per64-cycle Read group. Bits labeled A1<0>, A2<0>, A3<0>, A4<0> ... A1<11>... indicate bit-interleaved, LSB-first words. | Best single protocol illustration. Source code uses an auto-adjusted11–13-leading-zero extraction rather than directly applying16 idle slots; confirm actual electrical timing/edge alignment. Diagram's matrix has apparent duplicated/mistyped far-left labels, so it is not a substitute for an authoritative channel map. |
| 18 | Biphasic stimulation diagrams. One waveform sketch states64 clock cycles =2 ms; phase edge fields and passive balancing. | Implies32 kHz if “cycles” means full clock periods. Later slides label60 kHz, and current code toggles at16 kHz; leave timing unresolved. |
| 19 | Measured-looking biphasic current traces for4-bit current code, up to~22.5 µA with~1.5 µA resolution. | Supports chip stimulus-code semantics, not PCB power or validated settings for a new system. |
| 20 | GUI has64 stimulators on each side. |128 total agrees with slide4. |
| 21 | Per-stimulator edge, anode/cathode, polarity and amplitude controls. | A single on/off signal does not replace the configuration data path. |
| 22 | Different waveform example for another selected stimulator. | Individual settings can differ. |
| 23 | Multiple selected stimulators can be programmed together. | Whether simultaneous stimulation is required in the new unit is open. |
| 24 | GUI pulse-count selection1–254 and RUN. | Current RTL8-bit count accepts1–255; minor interface limit mismatch to resolve if reproducing GUI. |
| 25 | Four configuration pins `<CLK,L,R,LATCH>`; L/R streams contain stimulus and gain settings. Diagram has clock/data train followed by latch pulse. | Confirms four output signals and post-transfer latch, but no measured SPI clock limit or setup/hold specification. |
| 26 | Gain/STIM spreadsheets generate SPI stream. Gain image says12 bits appended to DR stream: four3-bit fields; transmission order DR_DAC, AR_DAC, Gain_Right, Gain_Left, each MSB first. | Useful configuration semantics. Exact full stimulus bitfield order/length and current generator file remain necessary. Current repository loader expects CSV rather than directly parsing spreadsheets. |
| 27 | `STIM_EN`, pulse `STIM_START`, then `STIM_CHB` after64 `STIM_CLK` cycles. Diagram labels STIM_CLK60 kHz, start-to-start5 ms and CHB1 ms. | Shows four stimulus outputs and charge-balance sequencing. Numerical clock/waveform timing conflicts across deck/code. |
| 28 | Alternate SPI sequence can load while prior stimulus runs; diagram labels5 ms between starts and1 ms CHB. | Per-pulse configuration updates are an intended possibility, not proof current single-buffer SPI RTL supports race-free continuous updates. Ask whether this feature is required. |

## Signal map to existing code

Directions are relative to the FPGA. Names reflect the slides and the closest current code signals; a name match does not prove pin-level electrical equivalence.

| Slide name | Direction | Current FPGA_512 name | What is known / open |
|---|---|---|---|
| `Data<1:8>` | Input,8 wires | `cb_d[8:1]` | Serial12-bit samples, four interleaved ADCs per line; total512 channels. |
| `CLK32MHz_Out` | Input | `cb_clk32mhz` | Returned ASIC clock used for capture/framing. Current LPF specifies32 MHz, LVCMOS15. |
| `Read` | Input | `cb_read` | Group boundary. `adc_auto_adjust` extracts4 words per event. Confirm pulse width and capture edge. |
| `Sync` | Input | `cb_sync` | Slides require it for channel alignment; current main top marks it unused. **Do not remove from PCB based on current RTL.** |
| `CLK32MHz_In` | Output | closest: `cb_clkh` | Current source assigns `cb_clkh = clk_16m`;32 MHz versus16 MHz mismatch remains open. |
| `Chip_Reset` | Output | `cb_chip_reset` | Current source asserts during boot reset counter and supports host pulse. Exact ASIC required pulse/recovery needs verification. |
| `FE_RESET` | Output | `cb_fe_reset` | Host reset/test-mode and stimulation controller combine into this output. Startup/recording policy remains open. |
| `CLK,L,R,LATCH` | Output,4 wires | `cb_spi_clk`, `cb_spi_dinl`, `cb_spi_dinr`, `cb_spi_latch` | Four-wire custom configuration, not a conventional bidirectional MOSI/MISO SPI link. |
| `STIM_EN,STIM_CLK,STIM_START,STIM_CHB` | Output,4 wires | matching `cb_stim_*` | Needed if stimulation retained. Timing conflicts must be resolved before reuse. |
| No slide equivalent | Input,2 wires | `cb_ac_in`, `cb_imp_test` | Present as spares in the top. Function/necessity remain open. |

The deck identifies22 recording/control/stimulation wires (8data+4clock/markers+2resets+4configuration+4stimulation), matching the current24-wire group minus its two named spares. It does not prove all22 are mandatory for recording-only operation. If stimulation is removed, its four controls become candidates for removal; gain configuration still uses SPI.

**Voltage:** The visible slides do not provide a complete digital I/O electrical table. Extracted text from the embedded specification graphic contains “Supply Voltage1.5 V,” but its lower chip-information rows are masked/cropped in the visible slide3/4 render. A chip supply label would not establish VIH/VIL/VOH/VOL anyway. Use source LPF LVCMOS15 as the historical interface choice and ask for the ASIC I/O limits and current board rails. Stimulation ±10 V is a separate analog specification.

## Source conflicts requiring explicit answers

### 1. Recording clock/rate

Slides3–7:31.25 kS/s/channel. Slides15–17:32 MHz /1024 =31,250 frames/s. Current host: `N_CHANNELS512`, `SAMPLE_RATE15625`; `wave_record.c` comments report1 MS/s per data line. Current top sends16 MHz to `cb_clkh` and receives a clock named32 MHz.

Ask: **Which chip revision and bitstream are installed, what are the measured ASIC input clock, output clock, Read and Sync frequencies, and is the intended new recording rate15.625 or31.25 kS/s/channel?** Slowing a clock could explain a factor of two, but that is a hypothesis, not a confirmed explanation.

For source logic generating four samples per Read and64 channels per data line, samples/channel/s = Read-events/s ÷16. At31.25 kS/s that requires500,000 Read events/s; at15.625 kS/s,250,000 events/s. These are useful logic-analyzer cross-checks, not assumed observations.

### 2. Channel-map synchronization

Slides14–17 say Sync aligns the amplifier map. Main RTL deserializes against `cb_read` but assigns `cb_sync` to `_unused`. Host maps incoming word order to fixed line/amp indices. Clean CRC validates transport consistency, not that sample0 is physically electrode0. Request startup/resynchronization tests against known ASIC channel stimulus and define multi-ASIC/multi-FPGA alignment.

### 3. Stimulation clocks and timing

- Slide18:64 cycles =2 ms implies32 kHz.
- Slides27–28 diagrams: STIM_CLK label60 kHz,5 ms repetition and1 ms CHB.
- Current `stim_controller.v`: tick every1000 cycles of32 MHz =32 kHz; toggles `stim_clk` on every tick, giving a **16 kHz square wave**, despite comments saying32 kHz. State timing waits128 ticks =4 ms before CHB; CHB lasts32 ticks =1 ms; reset tail48 ticks =1.5 ms. No hardware waveform was measured here.

Ask for the authoritative edge-based timing specification and measured waveform. Do not silently select one diagram or code comment as correct.

### 4. Configuration data and update rate

Deck25–26 confirms parallel L/R data with one shared clock and latch; gain configuration remains necessary for recording. Active code stores512 bytes per side (4096 bits) and shifts at nominal500 kHz from a32 MHz clock, with brief read-load gaps between bytes. A full4096-bit transfer takes at least8.192 ms before gaps/latch, longer than the5 ms inter-stim interval drawn in slide28. Actual stream length, maximum allowed ASIC SPI speed and required update cadence must be confirmed before promising per-pulse changes. Current SPI `busy` output is not connected by the top, and writes share the same memory arrays, so safe overlap cannot be assumed.

### 5. Calibration and recording start

Slides present programmable gain (110–700, or100–700 elsewhere); current host voltage conversion hardcodes100 V/V via `3.0/4096/100/16`. Ask how actual gain/reference codes are stored with each recording. Start recording in the deck gates/starts the ASIC clock; current host recording command starts writing WAV while RTL normally streams continuously. Define intended acquisition/record-to-disk state transitions separately.

## Pinned code evidence

All links use the inspected current commit:

- [Clock forwarding, reset and capture](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L87-L119)
- [Read-driven deserialization](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L293-L329)
- [Unused Sync](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L535-L538)
- [1.5 V ADC-side historical constraints](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_4lane_framed.lpf#L23-L82)
- [Host512/15625 constants](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_daemon.c#L58-L60)
- [Host rate measurement comment](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/wave_record.c#L9-L19)
- [SPI storage and clock divider](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/fpga/spi_programmer.v#L39-L81)
- [SPI shift/latch logic](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/fpga/spi_programmer.v#L115-L177)
- [SPI CSV loader](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_daemon.c#L622-L668)
- [Stimulation tick generator and clock toggle](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/fpga/stim_controller.v#L64-L103)
- [Stimulation state timing](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/fpga/stim_controller.v#L143-L207)
- [Disconnected SPI/stim busy outputs](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/top_4lane_framed.v#L269-L289)
- [Hardcoded calibration metadata](https://github.com/gt-ic/FPGA_512/blob/767e82528780005cbcb37b3e926197755bac622e/adc_4lane_framed/adc_daemon.c#L561-L572)

## What can now be filled versus kept open

**Filled from the supplied design:**512-channel ASIC;128 stimulators;12-bit ADC;32 ADC modules;8 digital outputs;4 ADCs/line;16 amplifiers/ADC;Read/Sync roles;four configuration pins;configuration includes gain;four stimulation-control pins;nominal31.25 kS/s chip specification;ASIC and FPGA are separate blocks.

**Still open or conflicting:**Actual target sampling rate;input/output clock values and gating;channel-map alignment implementation;ASIC/routing-board revisions and electrical limits;which stimulation features are required;authoritative stimulation timings;SPI stream generator and exact bit count;MCU model and role;USB/UWB/other transport;pause/loss requirements;storage duration;power/thermal budget;retained Artix ordering code;single/two-FPGA4K architecture.

**4K update:** The slides now make “eight copies of this512-channel ASIC yields4096” a source-grounded arithmetic option, but no slide chooses eight ASICs as the new hardware architecture. An equal two-FPGA split would serve four ASICs each only if that option is selected. At the slide rate31.25 kS/s, use264 MB/s total framed transport,132 MB/s per FPGA for a2048/2048 split. Host and framing changes, bank/pin planning, synchronization and measured throughput remain necessary.

## Recommended original images for the revised packet

1. `research/gerald_slides/rendered/slide-05.png`: ASIC modular layout and8-line grouping; best explanation of512 channels versus8 wires.
2. `research/gerald_slides/rendered/slide-17.png`: readout protocol,1024 cycles andchannel map; best full slide for Gerald questions.
3. `research/gerald_slides/media/image15.png`: original clean timing diagram; use with a note identifying slide15–17 andrate conflict.
4. `research/gerald_slides/media/image16.png`: original channel grouping diagram; do not copy questionable far-left labels into a new authoritative map.
5. `research/gerald_slides/rendered/slide-26.png`: configuration/gain/SPI connection.
6. `research/gerald_slides/rendered/slide-27.png`: stimulus-control signals, with explicit unresolved-timing note.
7. `research/gerald_slides/media/image25.png`: readable original gain-configuration field image.

Avoid shrinking full-slide screenshots until their tiny timing labels become unreadable. Pair one original diagram with a short plain-language explanation and the relevant open question.
