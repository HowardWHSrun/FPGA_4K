# Gerald ASIC slide review

Reviewed 26 September 2026. All 28 existing PDF pages were rendered and visually read, alongside the original PowerPoint text, image media and notes. Original files remain unchanged. This review narrows the uncertainty list but closes none of the complete electrical or manufacturing requirements.

[Original PowerPoint](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pptx) · [Original PDF](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf)

## Information available from the slides

| Topic | What the source establishes | Reference |
|---|---|---|
| Chip and recording scale | The visible deck describes 512 recording channels and 128 stimulation channels per ASIC, with 32 modules of 16 amplifiers and four stimulators, a 12-bit ADC per module, and eight recording DATA outputs per chip. | [slide 1](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=1), [slide 3](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=3), [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4) |
| Recording speed | The tutorial states 31.25 kS/s per channel and a 32 MHz clock input. It describes a frame of 1024 returned-clock cycles with one SYNC and 16 READ intervals. | [slide 3](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=3), [slide 13](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=13), [slide 14](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=14) |
| Recording signal directions | The FPGA sends CLK32MHz_In, Chip_Reset and FE_RESET to the ASIC. The ASIC transmits CLK32MHz_Out, DATA[1:8], READ and SYNC to the FPGA. | [slide 13](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=13), [slide 14](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=14) |
| Recording multiplexing | Each DATA output carries four ADCs, each of which serves 16 amplifiers, giving 64 amplifier channels per serial output. A READ interval carries one amplifier position from each of its four ADCs. | [slide 5](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=5), [slide 14](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=14), [slide 15](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=15) |
| Padding and bit order shown | The waveform labels each READ interval as 16 clock cycles of zeros followed by 48 payload cycles. It shows A1<0>, A2<0>, A3<0>, A4<0> through A1<11>, A2<11>, A3<11>, A4<11>, and the final interval A61 through A64. This establishes a diagrammed bit-interleaved, least-significant-index-first candidate stream, not four contiguous 12-bit words. | [slide 14](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=14), [slide 15](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=15), [slide 16](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=16) |
| Reset functions | Chip_Reset resets the chip to a known state; FE_RESET resets the front-end amplifiers. The recording table lists reset time below 1.5 ms. | [slide 3](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=3), [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4), [slide 11](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=11) |
| SPI wires and destination | The FPGA sends programming information over SPI CLK, L, R and LATCH. L and R program stimulators and amplifier gains. The diagram shows clock idle low and a positive LATCH pulse after the transfer. | [slide 25](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=25), [slide 26](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=26), [slide 27](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=27) |
| Chip configuration suffix | The slide 26 spreadsheet screenshot states that 12 chip-configuration bits are appended to the DR stream. It gives four 3-bit fields in transmission order DR_DAC[3:1], AR_DAC[3:1], Gain_Right[3:1], Gain_Left[3:1], with bit 3 as MSB, bit 1 as LSB, and DR_DAC bit 3 sent first. | [slide 26](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=26) |
| SPI length evidence | The visible stream screenshot reaches final bit_index 2124, with blank rows below it. The stimulus configuration screenshot has separate DL_Config and DR_Config tabs, 64-channel configuration, ENABLED, four EDGE fields, CATHODIC_AMP, ANODIC_AMP and POLARITY. | [slide 26](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=26) |
| Stimulation capability | The tutorial describes biphasic monopolar/bipolar stimulation, passive charge balancing, 128 stimulators (64 left and 64 right), four-bit current magnitude up to approximately 22.5 microamps in approximately 1.5-microamp steps, and ±10 V compliance. | [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4), [slide 18](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=18), [slide 19](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=19) |
| Stimulation waveform fields | The waveform diagram labels four EDGE[6:1] times and ANODIC[4:1]/CATHODIC[4:1] magnitudes. GUI screenshots permit either initial polarity and multiple stimulator selections. The tutorial GUI permits pulse counts 1–254. | [slide 18](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=18), [slide 21](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=21), [slide 22](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=22) |
| Stimulation sequencing | After loading SPI, the tutorial asserts STIM_EN, sends a short STIM_START pulse, and asserts STIM_CHB after 64 STIM_CLK cycles. Diagrams draw STIM_EN, STIM_START and STIM_CHB as positive-going controls; STIM_CHB is shown for 1 ms. | [slide 27](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=27), [slide 28](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=28) |
| Recording power estimate | Slide 7 reports approximately 17.24 microwatts per recording channel, excluding external LDOs. For 512 channels this is approximately 8.827 mW; for 4096 channels approximately 70.615 mW. The recording table also states less than 20 microwatts per channel. | [slide 3](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=3), [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4), [slide 7](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=7) |
| AC_IN and IMP_TST coverage | Neither AC_IN nor IMP_TST is defined in the 28 slides, visible diagrams, extracted text or speaker notes. The deck gives no electrical specification or test sequence for these two signals. | [complete deck](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf) |

## Recording interpretation

The waveform carries four amplifier samples interleaved by bit position. The shown order is A1 bit 0, A2 bit 0, A3 bit 0, A4 bit 0, then the next bit of those four samples, continuing to bit 11. The last READ interval similarly names A61–A64. Each interval has 16 zero clocks and 48 payload clocks. This is more specific than merely saying “12-bit serial data.” Do not implement four consecutive 12-bit words from this drawing.

At 32 MHz, one 1024-clock frame lasts 32 µs, and one 64-clock READ interval lasts 2 µs. Across the later eight-ASIC plan, 64 physical DATA lines at 32 Mbit/s total 2.048 Gbit/s of raw clocked data. Removing the illustrated 25% padding gives 1.536 Gbit/s, or 192 MB/s of 12-bit samples, before packet/USB overhead. These calculations assume the tutorial format applies to the chosen ASIC revision.

The drawing suggests DATA changes around the rising returned-clock edge and could be sampled at the falling edge. It supplies no minimum/maximum propagation delay, setup/hold, board skew or jitter limits. Final capture edge and input-delay constraints still require an accepted specification and implementation checks. [Slides 15–17](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=15)

## Conflicts and limits that must remain visible

### C01: Stimulation clock/time values disagree

- Slide 4 says 31.25 microseconds temporal resolution, corresponding to 32 kHz.
- Slide 18 says 64 clock cycles = 2 ms, also corresponding to 32 kHz.
- The GUI in slides 21–24 computes each edge step as 32 microseconds, corresponding to 31.25 kHz and 2.048 ms for 64 steps.
- Slides 27–28 label STIM_CLK as 60 kHz, for which 64 clocks last approximately 1.067 ms.

Do not select a stimulation clock or pulse duration from these inconsistent values. Ask for the current intended STIM_CLK and event timing. [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4), [slide 18](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=18), [slide 21](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=21), [slide 22](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=22), [slide 23](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=23), [slide 24](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=24), [slide 27](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=27), [slide 28](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=28).

### C02: Frequency boundary differs from example

- Slide 4 gives stimulation frequency <200 Hz.
- Slides 27–28 show 5 ms between starts, which equals 200 Hz.

The accepted repetition-rate limit and boundary conditions need confirmation. [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4), [slide 27](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=27), [slide 28](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=28).

### C03: Channel matrix has duplicated and missing labels

- In the DATA1 matrix, ADC2 top row repeats A57 and A49 from ADC1.
- ADC3 top-left cell reads A58.
- Across the displayed 64 entries, A49 and A57 occur twice, and A50 and A59 are absent.
- Regular numbering suggests ADC2 top-left values A58/A50 and ADC3 top-left A59, but these are inferred corrections, not accepted channel mapping.

Use the first/last interval waveform to build a proposed decoder, but obtain a corrected complete channel/electrode map before claiming channel identity. [slide 15](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=15), [slide 16](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=16), [slide 17](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=17).

### C04: Gain range differs slightly

- Slides 3–4 show gain 110–700 V/V.
- Slides 6–7 show gain 100–700 V/V.

Request the gain-code calibration table if conversion to input volts is required; do not treat either lower endpoint as an exact code map. [slide 3](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=3), [slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4), [slide 6](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=6), [slide 7](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=7).

### Underlying table versus visible slide

The PDF text and underlying table embedded in slides 3/4 contain the nominal 1.5 V supply, process and die-size rows. The original white overlay hides those lower rows in the normal slide render. The extracted text therefore contains more than the visible slide. Preserve this source distinction, and never interpret the nominal supply as a pad threshold/absolute-maximum specification. [Original slide 4](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf#page=4)

### SPI and startup information still missing

The screenshot ending at bit 2124 is consistent with 64 × 33 + 12, and 33 is consistent with four six-bit edges, two four-bit amplitudes and one polarity bit. Those are arithmetic consistency checks. The deck does not establish the serializer order for those 33 bits, what ENABLED changes, whether the left stream is padded during the DR suffix, or the exact workbook/generator revision. Its SPI picture also lacks a qualified sampling edge and timing limits.

The normal-operation stimulation diagram shows low levels between STIM_START and STIM_CHB pulses and a positive STIM_EN assertion. It does not approve resistor pulls or guarantee safe states before FPGA configuration, during power faults or after partial resets. The “reset time <1.5 ms” table entry is not a digital reset-pulse specification.

The 17.24 µW/channel estimate covers recording ASIC operation and excludes external LDOs. It gives about 8.827 mW per 512-channel ASIC and 70.615 mW for 4096 channels. It cannot replace a complete per-rail current budget, FPGA workload estimate, stimulation supply budget or thermal qualification.

## Changes proposed for the uncertainty register

| Item | Refined known information | Still unresolved |
|---|---|---|
| U01 | Functional directions are shown for recording clocks, DATA/READ/SYNC and the named reset/SPI/stimulation controls. Underlying table reports a nominal 1.5 V supply. | Guaranteed electrical limits and all power-state behavior remain absent. AC_IN/IMP_TST functions/directions remain unknown. |
| U02 | 32 MHz recording, 1024 clocks/frame, 16 READ intervals, 16 zero clocks + 48 payload clocks/interval, and bit-interleaved A1–A4, bit 0 through bit 11 order are shown. A 12-bit DR configuration suffix and screenshot ending at 2124 bits are available. | Need actual timing limits/capture phase/ADC coding, complete corrected channel map, full SPI serialization/workbook and stimulation timing correction. Pause/restart behavior remains unknown. |
| U03 | The tutorial describes one ASIC as 32 modules with 8 serial outputs. A DATA1 map is illustrated. | The matrix contains duplicate/missing channel labels; physical eight-chip/board/shared-clock/shared-SPI grouping remains unspecified. |
| U04 | Tutorial sequence is SPI load, assert STIM_EN, pulse STIM_START, then STIM_CHB after 64 STIM_CLK cycles; diagrams show positive-going controls. Reset functions are described. | Reset polarity/width and power-on/fault states remain unprovided. Tutorial low levels between pulses do not approve power-on pulls or brownout behavior. |
| U05 | Recording ASIC estimate 17.24 µW/channel excludes LDOs; stimulation compliance is ±10 V; underlying table lists 1.5 V nominal. | No complete analog/digital/stimulation supply tree, per-rail currents or board return allocation. |
| U07 | Eight ASIC returned clock domains correspond to the tutorial output clock; 32 MHz nominal is source-supported. | No guaranteed input timing or complete XDC/pin allocation. Diagram-suggested falling-edge capture needs confirmation and implementation timing. |
| U10 | ASIC recording-only estimate can inform the assembly budget; 4096 × 17.24 µW ≈ 70.615 mW. | This does not change unqualified FPGA workload power, FPGA converter margins or complete assembly thermal budget. |
| U14 | ASIC wire stream includes 25 percent padding clocks. Its shown 12-bit payload needs deinterleaving, then downstream packing. SPI suffix field order is available. | ADC numeric coding, full SPI packing, stimulation timing and the complete command/USB/frame contract remain open. No firmware implementation is established. |
| U15 | The deck associates start-recording with the FPGA clock sent to ASIC. | It does not specify whether stopping that clock is permitted as lossless backpressure or how to resume channel alignment. |
| U17 | Chip_Reset and FE_RESET functions are explained; a <1.5 ms reset-time entry is present. | No reset pulse/sequence or compact-board bring-up is defined by the deck. |
| U18 | The deck shows earlier ASIC/GUI examples and nominal data/power performance. | This supplies no operating evidence for the compact Artix-7 board, eight-chip capture, XEM8310 link or sustained disk recording. |

U06, U08, U09, U11, U12, U13 and U16 receive no new closure evidence from this ASIC tutorial. All 18 register items remain open at their full stated scope.

## Focused follow-up for the team

- **Gerald / ASIC designer:** Please confirm the current STIM_CLK frequency and edge-time unit: the deck gives 31.25 µs, 32 µs, and 60 kHz. Is 200 Hz permitted, and what STIM_START/CHB timing is required?
- **Gerald / acquisition firmware:** Please share the current SPI workbook/generator and corrected full channel map. Slide 26 gives the 12-bit DR suffix and 2124-bit example; we still need the 33-bit stimulus packing, ENABLED treatment, left/right suffix behavior, ADC numeric coding and corrected A49/A57 duplicates.
- **ASIC designer / carrier designer:** Please provide a versioned pad/timing table, including AC_IN and IMP_TST, reset polarity/width, input/output limits, clock/data delay and power-on/off states. Can acquisition clocking pause and restart without losing framing?
- **ASIC/routing designer:** Please map the actual eight chips and shared clock/SPI/reset groups to the routing-board contacts, and identify who supplies every ASIC analog/digital/stimulation rail and its return.

## Source integrity

| File | SHA-256 |
|---|---|
| Chip_FPGA_Interface.pdf | `a8f6088e6d41f1e45fdae16e927656a5af1924d467fa9c2cf128d5bb4750320c` |
| Chip_FPGA_Interface.pptx | `7f2d6f16144337c9972da8db767505a0fbe06a94ea55ae1a7402121205dd0420` |

The structured companion includes every source-specific fact, its evidence type, exact slide references, uncertainty mappings and limitations: [Gerald_ASIC_Slide_Review.json](Gerald_ASIC_Slide_Review.json). Rendered inspection images and extracted original media remain local review evidence; no illustration was redrawn or inferred as measured hardware.
