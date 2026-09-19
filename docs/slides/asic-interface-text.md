# ASIC interface slides: searchable text

[Original PowerPoint](../../sources/slides/Chip_FPGA_Interface.pptx) · [Existing PDF render](../../sources/slides/Chip_FPGA_Interface.pdf)

28 slides. Text is extracted from each original slide and its matching PDF page. Image-only labels, equations, waveforms and graphical relationships may be absent or reordered: inspect the original slide/PDF for timing and pin interpretation. Slide number means the presentation page, not a new specification revision. The 4,096-channel system is the later eight-chip plan.

## Slide 1

### PowerPoint text

```text
1
ASIC Layout
7mm
8.1 mm
7mm
8.1 mm
512 Recording Pixels128/512 Stimulating

PGA BUFFERSAR ADCs
PGA BUFFERSAR ADCs
```

### PDF text

```text
RISE
1
ASIC Layout
7mm
8.1 mm
7mm
8.1 mm
512 Recording Pixels
128/512 Stimulating
PGA
BUFFER
SAR ADCs
PGA
BUFFER
SAR ADCs
```

## Slide 2

### PowerPoint text

```text
2
Bonding Map
Bonding recipe for the ASIC-board connection
```

### PDF text

```text
RISE
2
Bonding Map
• Bonding recipe for the ASIC-board connection

```

## Slide 3

### PowerPoint text

```text
3
Chip Specifications
Gain
Programmable 3bits: (110 – 700)
Raw data bandwidth: (0.3Hz – 10kHz)
Input Referred Noise: (4 – 5uVrms)
Sampling rate: (31.25kS/s)
Stimulator
128 channels: Compliance of +/-10V
Resolution: 1.5uA
Maximum Current: 22.5uA
```

### PDF text

```text
RISE
3
Chip Specifications
• Gain
• Programmable 3bits: (110 – 700)
• Raw data bandwidth: (0.3Hz – 10kHz)
• Input Referred Noise: (4 – 5uVrms)
• Sampling rate: (31.25kS/s)
• Stimulator
– 128 channels: Compliance of +/-10V
– Resolution: 1.5uA
– Maximum Current: 22.5uA
Parameter Value
Channels 512
Gain (V/V) 110–700
Bandwidth (Hz) 0.3–10k
Input-Referred Noise 4–5 µVrms
ADC Resolution 12-bit
Reset Time < 1.5 ms
Power / Channel <20 µW
Input Impedance 13 MΩ @ 1 kHz
Sampling Rate 31.25 kS/s per channel
Stimulator
Channels 128
Compliance Voltage ±10 V
Max Stimulation Current 22.5 µA
Stimulation Resolution 1.5 µA
Stimulation Frequency < 200 Hz
Temporal Resolution 31.25 µs
Stimulation Mode Arbitrary Monopolar / Bipolar
Charge Balancing < 10 mV residual
Process Node TSMC 180nm BCD
Supply Voltage 1.5 V
Die Area 8.1 × 7 mm
Interface Custom (SpikeGadgets)
Recording
Chip
Neural Recording Chip Specifications

```

## Slide 4

### PowerPoint text

```text
4
Chip Specifications
Gain
Programmable 3bits: (110 – 700)
Raw data bandwidth: (0.3Hz – 10kHz)
Input Referred Noise: (4 – 5uVrms)
Sampling rate: (31.25kS/s)
Stimulator
128 channels: Compliance of +/-10V
Resolution: 1.5uA
Maximum Current: 22.5uA
```

### PDF text

```text
RISE
4
Chip Specifications
• Gain
• Programmable 3bits: (110 – 700)
• Raw data bandwidth: (0.3Hz – 10kHz)
• Input Referred Noise: (4 – 5uVrms)
• Sampling rate: (31.25kS/s)
• Stimulator
• 128 channels: Compliance of +/-10V
• Resolution: 1.5uA
• Maximum Current: 22.5uA
Parameter Value
Channels 512
Gain (V/V) 110–700
Bandwidth (Hz) 0.3–10k
Input-Referred Noise 4–5 µVrms
ADC Resolution 12-bit
Reset Time < 1.5 ms
Power / Channel <20 µW
Input Impedance 13 MΩ @ 1 kHz
Sampling Rate 31.25 kS/s per channel
Stimulator
Channels 128
Compliance Voltage ±10 V
Max Stimulation Current 22.5 µA
Stimulation Resolution 1.5 µA
Stimulation Frequency < 200 Hz
Temporal Resolution 31.25 µs
Stimulation Mode Arbitrary Monopolar / Bipolar
Charge Balancing < 10 mV residual
Process Node TSMC 180nm BCD
Supply Voltage 1.5 V
Die Area 8.1 × 7 mm
Interface Custom (SpikeGadgets)
Recording
Chip
Neural Recording Chip Specifications

```

## Slide 5

### PowerPoint text

```text
5
3.2 mm
360µn

Recording and Stimulation
Modular concept
One module: 16 amplifiers + 4 stimulators
Arrange 32 copies to make it 512 recording + 128 stimulators
Programming interface programs the stimulators and the amplifiers
The ADCs are multiplexed to 8 data lines
```

### PDF text

```text
5
3.2 mm
360µn
Programming
Interface
8 × LNAs
8 × LNAs
4 × Stimulators
16 ×
Programmable
Gain Amplifiers
16 × ADC Drivers 12-bit ADC
Recording and Stimulation
• Modular concept
• One module: 16 amplifiers + 4 stimulators
• Arrange 32 copies to make it 512 recording +
128 stimulators
• Programming interface programs the
stimulators and the amplifiers
• The ADCs are multiplexed to 8 data lines
MUX
4-1
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
DATA<1>
MUX
4-1
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
DATA<2>
MUX
4-1
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
DATA<3>
MUX
4-1
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
ADC 16 × Amp & 4 × Stim
DATA<4>
MUX
4-1
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
DATA<8>
MUX
4-1
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
DATA<7>
MUX
4-1
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
DATA<6>
MUX
4-1
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
ADC16 × Amp & 4 × Stim
DATA<5>
```

[Timing/specification preview](../../sources/slides/previews/slide-05.png)

## Slide 6

### PowerPoint text

```text
6
From Pixel Input to ADC Output
Gain: 100 – 700 (V/V)
Bandwidth: ~0.3 Hz to 10 kHz
IRN = 4 – 5  µVrms
Sampling Rate: 31.25 kS/s per channel
3.2 mm
360µn
IRN (Input-Referred Noise): ~4.2 µVrms

Recording Mode
```

### PDF text

```text
6
• From Pixel Input to ADC Output
• Gain: 100 – 700 (V/V)
• Bandwidth: ~0.3 Hz to 10 kHz
• IRN = 4 – 5  µVrms
• Sampling Rate: 31.25 kS/s per channel
3.2 mm
360µn
Programming
Interface
8 × LNAs
8 × LNAs
4 × Stimulators
16 ×
Programmable
Gain Amplifiers
16 × ADC Drivers 12-bit ADC
IRN (Input-Referred Noise): ~4.2 µVrms
Recording Mode
```

## Slide 7

### PowerPoint text

```text
7
Recording Mode
From Pixel Input to ADC Output
Gain: 100 – 700 (V/V)
Bandwidth: ~0.3 Hz to 10 kHz
IRN = 4 – 5  µVrms
Sampling Rate: 31.25 kS/s per channel
DC Power: ~17.24 µW / channel
Not including the external LDOs
3.2 mm
360µn

```

### PDF text

```text
7
Recording Mode
• From Pixel Input to ADC Output
• Gain: 100 – 700 (V/V)
• Bandwidth: ~0.3 Hz to 10 kHz
• IRN = 4 – 5  µVrms
• Sampling Rate: 31.25 kS/s per channel
• DC Power: ~17.24 µW / channel
• Not including the external LDOs
3.2 mm
360µn
Programming
Interface
8 × LNAs
8 × LNAs
4 × Stimulators
16 ×
Programmable
Gain Amplifiers
16 × ADC Drivers 12-bit ADC

```

[Timing/specification preview](../../sources/slides/previews/slide-07.png)

## Slide 8

### PowerPoint text

```text
8
Recording Mode

Integrated ASIC + Probe noise
µ = 6.5µVRMS and σ = 0.3µVRMS
```

### PDF text

```text
8
Recording Mode
• Integrated ASIC + Probe noise
• µ = 6.5µVRMS and σ = 0.3µVRMS
```

## Slide 9

### PowerPoint text

```text
9
Reading Mode – How?
Custom GUI
Recording on the top
Stimulation on the bottom

```

### PDF text

```text
RISE
9
Reading Mode – How?
• Custom GUI
– Recording on the top
– Stimulation on the bottom

```

## Slide 10

### PowerPoint text

```text
10
Reading Mode – How?
Custom GUI
Recording on the top
Stimulation on the bottom
Start recording
Sends a sequence to FPGA to trigger the recording

```

### PDF text

```text
RISE
10
Reading Mode – How?
• Custom GUI
– Recording on the top
– Stimulation on the bottom
• Start recording
– Sends a sequence to FPGA to
trigger the recording

```

## Slide 11

### PowerPoint text

```text
11
Reading Mode – How?
Custom GUI
Recording on the top
Stimulation on the bottom
Start recording
Sends a sequence to FPGA to trigger the recording
Reset amplifier
It sends a sequence to FPGA to trigger the reset the amplifiers

```

### PDF text

```text
RISE
11
Reading Mode – How?
• Custom GUI
– Recording on the top
– Stimulation on the bottom
• Start recording
– Sends a sequence to FPGA to
trigger the recording
• Reset amplifier
– It sends a sequence to FPGA to
trigger the reset the amplifiers

```

## Slide 12

### PowerPoint text

```text
12
Reading Mode – How?
Custom GUI
Recording on the top
Stimulation on the bottom
Start recording
Sends a sequence to FPGA to trigger the recording
Reset amplifier
It sends a sequence to FPGA to trigger the reset the amplifiers
Left and Right Gain
They control the gains of the two sides of the chip (they can be different if needed)
Gain will be programmed only if Program Gains is pressed


```

### PDF text

```text
RISE
12
Reading Mode – How?
• Custom GUI
– Recording on the top
– Stimulation on the bottom
• Start recording
– Sends a sequence to FPGA to
trigger the recording
• Reset amplifier
– It sends a sequence to FPGA to
trigger the reset the amplifiers
• Left and Right Gain
– They control the gains of the two
sides of the chip (they can be
different if needed)
– Gain will be programmed only if
Program Gains is pressed

```

## Slide 13

### PowerPoint text

```text
13
What happens in the background
Recording Related Pins
Chip_Reset: We use this pin to reset the chip to a known state
CLK32MHz_In: If we press start recording button, the FPGA sends this clock to the ASIC to start the recording
FE_RESET: If we press reset amplifier button, the FPGA resets the amplifiers we should see very silent channels
Amplifier Gain: Amplifier gain is set by a Serial Peripheral Interface (SPI will talk more about this later)


```

### PDF text

```text
RISE
13
What happens in the background
• Recording Related Pins
– Chip_Reset: We use this pin to reset the chip to a known state
– CLK32MHz_In: If we press start recording button, the FPGA sends this clock to the ASIC to start the recording
– FE_RESET: If we press reset amplifier button, the FPGA resets the amplifiers we should see very silent channels
– Amplifier Gain: Amplifier gain is set by a Serial Peripheral Interface (SPI will talk more about this later)

```

[Timing/specification preview](../../sources/slides/previews/slide-13.png)

## Slide 14

### PowerPoint text

```text
14
What happens in the background
Recording Related Pins
Chip_Reset: We use this pin to reset the chip to a known state
CLK32MHz_In: If we press start recording button, the FPGA sends this clock to the ASIC to start the recording
FE_RESET: If we press reset amplifier button, the FPGA resets the amplifiers we should see very silent channels
Amplifier Gain: Amplifier gain is set by a Serial Peripheral Interface (SPI will talk more about this later)
When recording starts: Chip will transmit these signals
CLK32MHz_Out: Used by FPGA to readout the correct data
Data<1:8>: Contains the recording data
Each data line contains the information of 4 ADC (time multiplexed)
One ADC  16amps, then 1 Data  64 amps.
Read: Used to let the FPGA know that a new amplifier’s data is being streamed
Sync: Used to let the FPGA know which amplifier’s data is being streamed

```

### PDF text

```text
RISE
14
What happens in the background
• Recording Related Pins
– Chip_Reset: We use this pin to reset the chip to a known state
– CLK32MHz_In: If we press start recording button, the FPGA sends this clock to the ASIC to start the recording
– FE_RESET: If we press reset amplifier button, the FPGA resets the amplifiers we should see very silent channels
– Amplifier Gain: Amplifier gain is set by a Serial Peripheral Interface (SPI will talk more about this later)
• When recording starts: Chip will transmit these signals
– CLK32MHz_Out: Used by FPGA to readout the correct data
– Data<1:8>: Contains the recording data
• Each data line contains the information of 4 ADC (time multiplexed)
• One ADC  16amps, then 1 Data  64 amps.
– Read: Used to let the FPGA know that a new amplifier’s data is being streamed
– Sync: Used to let the FPGA know which amplifier’s data is being streamed

```

[Timing/specification preview](../../sources/slides/previews/slide-14.png)

## Slide 15

### PowerPoint text

```text
15
Communication Protocol
1 Frame = 1024 clock cycles
Within each frame, there is one Sync and 16 Read
Sync, signals when the FPGA should start streaming the data  aligns the channel map
Read signals a new amplifier is being streamed
Within each Read period, DATA streams information about 4 amplifiers (from 4 different ADCs which share the same data line)
They all have the same location in a group of 16






```

### PDF text

```text
RISE
15
Communication Protocol
• 1 Frame = 1024 clock cycles
• Within each frame, there is one Sync and 16 Read
• Sync, signals when the FPGA should start streaming the data  aligns the channel map
• Read signals a new amplifier is being streamed
– Within each Read period, DATA streams information about 4 amplifiers (from 4 different ADCs which share
the same data line)
– They all have the same location in a group of 16

```

[Timing/specification preview](../../sources/slides/previews/slide-15.png)

## Slide 16

### PowerPoint text

```text
16
Communication Protocol
1 Frame = 1024 clock cycles
Within each frame, there is one Sync and 16 Read
Sync, signals when the FPGA should start streaming the data  aligns the channel map
Read signals a new amplifier is being streamed
Within each Read period, DATA streams information about 4 amplifiers (from 4 different ADCs which share the same data line)
They all have the same location in a group of 16






```

### PDF text

```text
RISE
16
Communication Protocol
• 1 Frame = 1024 clock cycles
• Within each frame, there is one Sync and 16 Read
• Sync, signals when the FPGA should start streaming the data  aligns the channel map
• Read signals a new amplifier is being streamed
– Within each Read period, DATA streams information about 4 amplifiers (from 4 different ADCs which share
the same data line)
– They all have the same location in a group of 16

```

[Timing/specification preview](../../sources/slides/previews/slide-16.png)

## Slide 17

### PowerPoint text

```text
17
Communication Protocol
1 Frame = 1024 clock cycles
Within each frame, there is one Sync and 16 Read
Sync, signals when the FPGA should start streaming the data  aligns the channel map
Read signals a new amplifier is being streamed
Within each Read period, DATA streams information about 4 amplifiers (from 4 different ADCs which share the same data line)
They all have the same location in a group of 16





```

### PDF text

```text
RISE
17
Communication Protocol
• 1 Frame = 1024 clock cycles
• Within each frame, there is one Sync and 16 Read
• Sync, signals when the FPGA should start streaming the data  aligns the channel map
• Read signals a new amplifier is being streamed
– Within each Read period, DATA streams information about 4 amplifiers (from 4 different ADCs which share
the same data line)
– They all have the same location in a group of 16

```

[Timing/specification preview](../../sources/slides/previews/slide-17.png)

## Slide 18

### PowerPoint text

```text
18
Stimulation Mode
Biphasic stimulation (monopolar/bipolar)
Fully programmable arbitrary waveform
±10V stimulation compliance
Passive charge balancing




```

### PDF text

```text
RISE
18
Stimulation Mode
• Biphasic stimulation (monopolar/bipolar)
• Fully programmable arbitrary waveform
• ±10V stimulation compliance
• Passive charge balancing

```

## Slide 19

### PowerPoint text

```text
19
Stimulation Mode - How
Up to ~22.5µA (4-bit control) with a resolution of ~1.5 µA




```

### PDF text

```text
RISE
19
Stimulation Mode - How
• Up to ~22.5µA (4-bit control) with a resolution of ~1.5 µA

```

## Slide 20

### PowerPoint text

```text
20
Stimulation Mode - How
There are 64 stimulator in each side,left and right







```

### PDF text

```text
RISE
20
Stimulation Mode - How
• There are 64 stimulator in each side,
left and right

```

## Slide 21

### PowerPoint text

```text
21
Stimulation Mode - How
There are 64 stimulator in each side,left and right
Select the stimulator
Fill the edge information based
Fill the anode and cathode information
Polarity
Stimulators can have different setting








```

### PDF text

```text
RISE
21
Stimulation Mode - How
• There are 64 stimulator in each side,
left and right
• Select the stimulator
– Fill the edge information based
– Fill the anode and cathode
information
– Polarity
• Stimulators can have different
setting

```

## Slide 22

### PowerPoint text

```text
22
Stimulation Mode - How
There are 64 stimulator in each side,left and right
Select the stimulator
Fill the edge information based
Fill the anode and cathode information
Polarity
Stimulators can have different setting








```

### PDF text

```text
RISE
22
Stimulation Mode - How
• There are 64 stimulator in each side,
left and right
• Select the stimulator
– Fill the edge information based
– Fill the anode and cathode
information
– Polarity
• Stimulators can have different
setting
```

## Slide 23

### PowerPoint text

```text
23
Stimulation Mode - How
There are 64 stimulator in each side,left and right
Select the stimulator
Fill the edge information based
Fill the anode and cathode information
Polarity
Stimulators can have different setting
Can program multiple of these stimulators at the same time







```

### PDF text

```text
RISE
23
Stimulation Mode - How
• There are 64 stimulator in each side,
left and right
• Select the stimulator
– Fill the edge information based
– Fill the anode and cathode
information
– Polarity
• Stimulators can have different
setting
• Can program multiple of these
stimulators at the same time

```

## Slide 24

### PowerPoint text

```text
24
Stimulation Mode - How
There are 64 stimulator in each side,left and right
Select the stimulator
Fill the edge information based
Fill the anode and cathode information
Polarity
Stimulators can have different setting
Can program multiple of these stimulators at the same time
Last we select the number of pulses we want to send (1-254) and click RUN







```

### PDF text

```text
RISE
24
Stimulation Mode - How
• There are 64 stimulator in each side,
left and right
• Select the stimulator
– Fill the edge information based
– Fill the anode and cathode
information
– Polarity
• Stimulators can have different
setting
• Can program multiple of these
stimulators at the same time
• Last we select the number of pulses
we want to send (1-254) and click
RUN

```

## Slide 25

### PowerPoint text

```text
25
What happens in the background
Firstly, an SPI excel file is loaded to the FPGA which then sends the data to the ASIC
The SPI has 4 data pins <CLK, L, R, LATCH>
L and R contains information for the stimulators programming and the gain of the amplifiers.





```

### PDF text

```text
RISE
25
What happens in the background
• Firstly, an SPI excel file is loaded to the FPGA
which then sends the data to the ASIC
– The SPI has 4 data pins <CLK, L, R, LATCH>
– L and R contains information for the stimulators
programming and the gain of the amplifiers.

```

## Slide 26

### PowerPoint text

```text
26
What happens in the background
Firstly, an SPI excel file is loaded to the FPGA which then sends the data to the ASIC
The SPI has 4 data pins <CLK, L, R, LATCH>
L and R contains information for the stimulators programming and the gain of the amplifiers.
Another patch reads the data in these two excel files and generates the right SPI stream file that downloads to the FPGA





SPI Stream
STIM Config
Gain Config
```

### PDF text

```text
RISE
26
What happens in the background
• Firstly, an SPI excel file is loaded to the FPGA
which then sends the data to the ASIC
– The SPI has 4 data pins <CLK, L, R, LATCH>
– L and R contains information for the
stimulators programming and the gain of the
amplifiers.
– Another patch reads the data in these two
excel files and generates the right SPI stream
file that downloads to the FPGA
SPI StreamSTIM ConfigGain Config
```

## Slide 27

### PowerPoint text

```text
27
What happens in the background
Firstly, an SPI excel file is loaded to the FPGA which then sends the data to the ASIC
The SPI has 4 data pins <CLK, L, R, LATCH>
L and R contains information for the stimulators programming and the gain of the amplifiers.
Another patch reads the data in these two excel files and generates the right SPI stream file that downloads to the FPGA
How does the stimulator start working?
Firstly, we enable the stims via STIM_EN
Then we send a short pulse to trigger the stims  STIM_START
After 64 STIM_CLK cycles, we enable STIM_CHB which does the charge balancing






```

### PDF text

```text
RISE
27
What happens in the background
• Firstly, an SPI excel file is loaded to the FPGA
which then sends the data to the ASIC
– The SPI has 4 data pins <CLK, L, R, LATCH>
– L and R contains information for the
stimulators programming and the gain of the
amplifiers.
– Another patch reads the data in these two
excel files and generates the right SPI stream
file that downloads to the FPGA
• How does the stimulator start working?
– Firstly, we enable the stims via STIM_EN
– Then we send a short pulse to trigger the
stims  STIM_START
– After 64 STIM_CLK cycles, we enable
STIM_CHB which does the charge balancing

```

## Slide 28

### PowerPoint text

```text
28
Different Stim patterns each cycle?
Firstly, an SPI excel file is loaded to the FPGA which then sends the data to the ASIC
The SPI has 4 data pins <CLK, L, R, LATCH>
L and R contains information for the stimulators programming and the gain of the amplifiers.
Another patch reads the data in these two excel files and generates the right SPI stream file that downloads to the FPGA
How does the stimulator start working?
Firstly, we enable the stims via STIM_EN
Then we send a short pulse to trigger the stims  STIM_START
After 64 STIM_CLK cycles, we enable STIM_CHB which does the charge balancing
Different stimulation sequence is possible as long as we can generate the timing diagram shown in the right






```

### PDF text

```text
RISE
28
Different Stim patterns each cycle?
• Firstly, an SPI excel file is loaded to the FPGA
which then sends the data to the ASIC
– The SPI has 4 data pins <CLK, L, R, LATCH>
– L and R contains information for the
stimulators programming and the gain of the
amplifiers.
– Another patch reads the data in these two
excel files and generates the right SPI stream
file that downloads to the FPGA
• How does the stimulator start working?
– Firstly, we enable the stims via STIM_EN
– Then we send a short pulse to trigger the
stims  STIM_START
– After 64 STIM_CLK cycles, we enable
STIM_CHB which does the charge balancing
• Different stimulation sequence is possible as
long as we can generate the timing diagram
shown in the right

```
