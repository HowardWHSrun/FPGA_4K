# Independent read of Gerald's timing and stimulation slides

Reviewed 2026-09-26. Scope: slides 13–28 of the original 28-slide `Chip_FPGA_Interface` deck. This report records tutorial evidence and disagreements. It does not approve FPGA pin assignments, ASIC electrical limits or a stimulation procedure.

## Sources and method

- [Original PDF](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pdf), SHA-256 `a8f6088e6d41f1e45fdae16e927656a5af1924d467fa9c2cf128d5bb4750320c`.
- [Original editable deck](https://howardwhsrun.github.io/FPGA_4K/sources/slides/Chip_FPGA_Interface.pptx), SHA-256 `7f2d6f16144337c9972da8db767505a0fbe06a94ea55ae1a7402121205dd0420`.
- Visually inspected every page from 13 through 28, checked the PPTX text and inspected original embedded waveform/channel-map images. The relevant original images are `ppt/media/image15.png` (recording waveform), `image16.png` (DATA1 channel table), `image24.png` (SPI waveform), `image29.png` and `image30.png` (stimulation sequences).
- Compared findings with fourth-pass uncertainty IDs U01–U05, U07, U14, U17 and U18. Original slides and native design files were preserved.

## What the slides explicitly establish

| Topic | Tutorial evidence | Limits of the evidence |
| --- | --- | --- |
| CHIP_RESET | Slides 13–14 say this resets the chip to a known state. | No asserted polarity, minimum pulse, clock requirement, resulting register values or power-up sequence is specified. |
| FE_RESET | Slides 13–14 associate the reset-amplifier button with resetting the amplifiers and observing very quiet channels. | No polarity, duration, release/settling interval or relation to CHIP_RESET is specified. A quiet channel is not proof of a correct digital stream. |
| Recording clock | Slides 13–14 say the FPGA sends `CLK32MHz_In` to start recording. | They do not authorize arbitrary clock stopping or specify restart, gating, phase or recovery behavior. |
| ASIC recording outputs | Slide 14 identifies returned `CLK32MHz_Out`, eight DATA lines, READ and SYNC as chip-to-FPGA signals. Each DATA line multiplexes four ADCs, each serving 16 amplifiers. | Functional directions are established. Guaranteed pad voltage/current limits, output delay and timing remain absent. |
| Frame structure | Slides 15–17 state 1,024 clock cycles per frame, one SYNC and 16 READ events. Each READ period carries four amplifier values per DATA line. The waveform labels 16 leading zero cycles and 48 payload cycles. | This gives a candidate decoder structure. It does not specify timing tolerances, first-sample validity, dropped-clock recovery or all physical channel identities. |
| Serial order shown | The waveform shows `A1<0>, A2<0>, A3<0>, A4<0>` through `A1<11>…A4<11>`, with `A61…A64` in the final illustrated group. | It depicts bit-plane interleaving, with bit 0 first. Encoding/sign convention and a reliable full chip/electrode map still require confirmation. |
| SPI function/direction | Slides 25–28 say the FPGA sends an SPI stream to the ASIC using CLK, L, R and LATCH. L/R program stimulators and amplifier gain. Slides 20–24 show 64 stimulators on each side. | This establishes two configuration data outputs, not one MOSI plus one MISO. No readback interface, SPI mode, allowable frequency or setup/hold/latch width is specified. |
| Configuration fields | Slide 26's embedded spreadsheet states that 12 chip-configuration bits append to DR: four 3-bit fields, in the order DR_DAC, AR_DAC, Gain_Right, Gain_Left. It labels bit 3 as MSB and bit 1 as LSB. | The screenshot provides useful format evidence, but the complete versioned configuration serializer and treatment of the unequal left/right stream lengths must be checked. |
| Stimulation sequence | Slides 27–28 explicitly describe loading configuration, enabling STIM_EN, sending a short STIM_START trigger, then enabling STIM_CHB after 64 STIM_CLK cycles. Their examples show a high-going START pulse, a high EN and high CHB intervals. | These drawings are examples. They do not establish safe electrical power-up defaults, guaranteed trigger width, clock phase, required waits or behavior on faults. |
| Repeat/programming example | Slide 24 lets the user choose 1–254 pulses. Slides 27–28 label a 5 ms repeat interval and 1 ms CHB intervals. Slide 28 depicts programming the next SPI sequence while stimulation uses the prior sequence. | These are shown operating examples, not proven minimum intervals or a formal atomic-update/latch contract. |

Derived recording arithmetic is consistent: at 32 MHz, 1,024 clocks imply 31,250 frames/s; 16 READ groups × 4 samples × 12 bits = 768 payload bits per DATA line per frame. The other 256 clocks are the illustrated zero overhead. Thus the tutorial supports extracting 12-bit payloads instead of forwarding every raw wire bit. This arithmetic does not validate the input sampling phase or physical channel map.

## Corrections and conflicts requiring attention

### Stimulation timing is internally inconsistent

| Location | Actual label | Arithmetic consequence |
| --- | --- | --- |
| Slide 18 | “64 Clock Cycles = 2 ms” | 32 kHz if taken exactly. |
| GUI examples in slides 21–24 | Edge settings use 32 microseconds per step; examples include 10 steps = 320 us. | 31.25 kHz if each step is one STIM_CLK cycle; 64 steps = 2.048 ms. |
| Slides 27–28 | `STIM_CLK (60kHz)` | 64 cycles = approximately 1.067 ms. |

The 2 ms versus 2.048 ms difference might be rounding; the 60 kHz label is a substantially different rate. The deck does not resolve which clock is intended or whether a step maps directly to one clock. Do not encode one of these rates as an accepted requirement without checking the actual ASIC specification and validated firmware. The 5 ms and 1 ms example annotations do not resolve the conflict.

### DATA1 channel-table labels contain apparent errors

The original embedded table used by slides 15–17 includes these entries:

- ADC2's top row repeats `A<57>` and `A<49>` already used by ADC1. The apparent sequence would suggest `A<58>` and `A<50>`.
- ADC3's top-left entry reads `A<58>`. The apparent sequence would suggest `A<59>`.

Consequently the table duplicates 57 and 49 and omits 50 and 59. The suggested replacements are pattern-based inferences, not accepted corrections to the chip map. The waveform establishes the first/final interleaving examples more clearly, but cannot prove every intermediate channel identity. Obtain a designer-approved table and verify it against known channel injections.

### Drawn edges do not establish a valid capture mode

The recording diagrams show a returned clock and data windows without numerical delay or setup/hold limits. The SPI illustration places CLK and L/R transitions at or near the same drawn times. Neither drawing provides enough evidence to select a guaranteed FPGA sampling edge, define input delays, or approve an SPI CPOL/CPHA mode. Annotated conceptual waveforms must not substitute for pad timing limits and measured skew.

## Effect on the uncertainty register

- **U01:** Record the functional signal directions now supported by the slides. Keep electrical pad limits and AC_IN/IMP_TST function open.
- **U02:** Replace a blanket “format unknown” claim with the supported 1,024/16/16+48 framing and depicted bit-plane order. Keep the full physical channel map, encoding, capture edge and guaranteed timing open. Add the explicit stimulation clock contradiction.
- **U03:** Keep chip/board identity and sharing topology open. The deck's single-chip functional examples do not define the later eight-chip/four-board grouping.
- **U04:** Record the documented normal stimulation sequence. Keep asserted reset polarity, safe preconfiguration/brownout behavior and required bias/interlocks open.
- **U05:** Slide 18's ±10 V stimulation compliance describes the analog stimulation capability. It does not approve ±10 V on digital controls or specify an FPGA-board power rail.
- **U07/U14:** Use the candidate frame/serializer structure as input to implementation. Do not call FPGA timing, interleaving, SPI updates or host packing verified until the exact protocol is implemented and checked.
- **U17/U18:** The deck supplies useful operational context but no revision-specific compact-board startup, flash recovery or measured acceptance evidence.

No required power-up settling time, guaranteed reset pulse width, safe default stimulation state, or electrical output-drive margin can be recovered from slides 13–28 alone.
