# Smallest FPGA board — presenter notes

26 September 2026 · 33 × 36 mm · current 130-component routing checkpoint

These notes explain the saved circuit. They do not certify a minimum BOM or working hardware. The detailed companion [component audit](Component_Necessity.json) covers every component and all 762 numbered endpoints, with its actual pin connections, purpose and removal consequence. No PCB or schematic was changed in this audit.

## Start with this

“This small board has seven functions: the FPGA, power conversion, supply capacitors, boot memory, a clock, configuration controls and three connectors. Most of the small components support power or startup. We can simplify some of them, but empty-looking space and low component count do not by themselves establish a working minimum.”

**The audit found a real correction:** U1.L9 and U1.L10 are marked NC in the current CAD, but AMD requires those unused temperature-diode pins to connect to ground. This is separate from the 146 previously reported routing gaps. State this as an identified correction, not as a completed fix. [AMD UG475, Table 1-12, p26](https://docs.amd.com/api/khub/documents/kHyYQ6XzXnQwR2O~gaV~MQ/content)

## 1. FPGA logic — 1 part

**Say:** “U1 is the processing part. Its planned job is to collect the ASIC outputs, generate timing and control signals, and organize data for the downstream FPGA module.”

U1 is the XC7A100T in the 15 × 15 mm CSG324 package. The PCB is larger because it also needs power, connectors and support circuitry. Removing U1 removes the function of this board. We are keeping this device; its exact speed/temperature grade and application timing/resource budget remain open. The XEM8310 is another FPGA module downstream, rather than a conventional MCU.

The current PCB has 203 unassigned FPGA user-I/O balls. That does **not** mean 203 permanent spares: the ASIC and link assignments have not been applied yet. A pin name such as a clock-capable or analog-capable function describes what the silicon can do; it does not mean that function has been selected in this design.

## 2. Four power rails — 39 parts

**Say:** “The FPGA cannot run directly from the cable voltage. Four converters create the different voltages needed by its core and I/O banks. Each converter needs a small group of parts around it to store energy, set its voltage and control startup.”

| Supply | Main parts | What it powers |
|---|---|---|
| About 1.0 V core | U2, L1, R1/R2, R9 | Logic core and block RAM |
| 1.8 V auxiliary/configuration | U3, L2, R3/R4, R122 | Auxiliary circuits, configuration, bank 14, flash and oscillator |
| 2.5 V link | U4, L3, R5/R6 | Bank 16 for the proposed link |
| 1.5 V ASIC-facing I/O | U5, L4, R7/R8 | FPGA banks 15, 34 and 35; this is not evidence that the board powers external ASICs |

The 12 V input is still a custom cable/source proposal. It is not a qualified output supplied automatically by the XEM8310, and J4 is not HDMI-compatible. The current headboard lacks a completed input-protection solution.

A converter and its inductor are an energy-conversion pair. The two feedback resistors set its output. Its local input/output capacitors complete the short current loops. R10 and R11 support the current power-up chain: core good enables auxiliary; auxiliary good enables the two I/O supplies. R9 and R122 separate the local converter outputs from the distributed capacitor networks. Removing a series part opens its path; replacing it with a short can also invalidate its purpose. The converter topology and component functions were checked against [TI TPS62135](https://www.ti.com/lit/ds/symlink/tps62135.pdf).

**What is negotiable:** C6/C10/C14/C18 set soft-start timing. C2/C4/C8/C12/C16 add high-frequency input bypass. These exact values or quantities need startup/noise evidence; they are not all universally mandatory. C1 is a cable-entry reservoir, whose value depends on the source and cable. Input capacitors are not surge clamps.

**Clearest removal candidate:** R12 only pulls up `PGOOD_IO`, a status signal with no consumer in the saved circuit. It does not enable another rail. Delete that branch deliberately, or give it a real monitoring function. No deletion was made here.

The voltage limits and startup requirements belong to the FPGA specification; a geometrically connected rail does not prove that they are met. [AMD DS181](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content)

## 3. FPGA supply decoupling — 61 parts

**Say:** “These capacitors are local energy reserves. When many FPGA circuits switch together, they supply brief current pulses close to the chip. Different values and positions serve different parts of the power network.”

| Domain | References | Count |
|---|---|---:|
| Core | C20, C22–C35 | 15 |
| Block RAM | C21, C36, C37 | 3 |
| Auxiliary | C40–C46 | 7 |
| Configuration bank 0 | C50 | 1 |
| Bank 14 | C51–C56, C92 | 7 |
| Bank 16 | C57–C63 | 7 |
| Banks 15, 34, 35 | C64–C81 | 18 |
| Shared ASIC-facing bank bulk | C82 | 1 |
| XADC-related supply | C90, C91 | 2 |

The current network follows the AMD device/package capacitor baseline. Bulk parts such as C20 and C21 store more charge; smaller parts offer more local paths. They are not redundant merely because they share a net. C92 was added when bank 14 and bank 16 moved to different voltages. [AMD UG483, Table 2-2](https://docs.amd.com/api/khub/documents/6L8DUUei7ZCE78qwQafC3A/content)

**Can we remove any?** The required function is a sufficiently low-impedance power network over the operating conditions. The current audit does not prove that every individual capacitor is the unique minimum. An alternative must account for effective capacitance, resistance, inductance, placement and switching current. Removing a part can shift resonances or voltage droop. We should optimize against impedance/load-step evidence, not visually count empty spaces. The part family recorded for C21 also needs an orderable replacement reviewed before release.

## 4. Boot memory — 11 parts

**Say:** “The FPGA needs a configuration image after power-up. U6 stores that image so the board can start by itself. Its small resistors define safe startup levels and give us places to adjust fast signal edges.”

U6 is the 1.8 V MX25U12835F flash. C100/C101 support its local supply. R100 holds chip select inactive; R101 holds the WP/DQ2 pin high; R102 holds RESET/DQ3 high in the initial single-bit mode. The exact flash pin 7 is RESET/SIO3, not a generic HOLD pin. [Macronix datasheet](https://www.macronix.com/Lists/Datasheet/Attachments/8704/MX25U12835F,%201.8V,%20128Mb,%20v1.9.pdf)

R103 and R105 are draft 33 Ω signal-damping parts. R104/R106/R107 are fitted 0 Ω links. A zero-ohm link can potentially become an uninterrupted trace after review, reducing component count; leaving its footprint empty would break the connection. C101 is supplementary local bulk whose individual necessity depends on the supply network.

Removing U6 is a system-level choice: another device would have to configure the FPGA at every startup. It is not a drop-in BOM reduction while keeping autonomous SPI boot.

## 5. System clock — 4 parts

**Say:** “Y1 provides the board’s 32 MHz reference. R119 controls the edge presented to the FPGA, and C102/C103 support the oscillator supply.”

Y1 runs from 1.8 V and drives U1.P17 through R119. Without it, the current application clock disappears, even though the FPGA configuration process can have its own clock. An external reference could replace Y1 only after its voltage, startup and timing contract is defined. [Abracon ASE3](https://abracon.com/Oscillators/ASE3series.pdf)

The 33 Ω R119 value needs signal-integrity review. C102 is the 10 nF local bypass; C103 is additional 100 nF bypass and is a potential optimization after measurement. The ASE3 sheet contains a mismatched “pins 7 and 14” bypass note; its actual four-pin table clearly identifies VDD as pin 4 and ground as pin 2, which is the mapping used here.

## 6. Configuration and JTAG — 11 parts

**Say:** “These parts tell the FPGA how to start and let us program it. Some define essential logic states; some are convenience or signal-quality provisions that may become simpler.”

| Parts | Current purpose | Minimum-design judgment |
|---|---|---|
| R108, R109 | PROGRAM_B and INIT_B pull-ups | Keep the specified pull-up functions |
| R110 | Additional DONE pull-up | Candidate for removal after startup/loading review; DONE already has an internal pull-up |
| R111–R113 | M[2:0] = 001 SPI mode | Keep the logic states; fixed copper ties can replace the resistor footprints |
| R114 | PUDC_B high | Keep the chosen startup state; fixed copper tie is permitted |
| R115–R117 | External JTAG idle bias | Review against the actual adapter/cable and device pulls |
| R118 | TDO series damping | Tune or replace by copper only after signal-integrity review |

AMD permits mode and PUDC_B straps as direct ties or small resistors, while PROGRAM_B/INIT_B have explicit pull-up guidance. DONE differs: its internal pull-up and configuration behavior mean an external resistor is not unconditionally required. These are separate decisions, rather than one rule for all pull-ups. [AMD UG470, configuration pin definitions](https://docs.amd.com/v/u/en-US/ug470_7Series_Config)

JTAG is already on J4; there is no separate debug header or user LED to remove in this version.

## 7. External connections — 3 parts

**Say:** “J4 combines cable power and programming, with contacts reserved for data. J5 and J6 form our two 60-contact mezzanine connectors to the routing board.”

J5/J6 provide 120 numbered signal contacts for the proposed 117-signal interface, plus separate ground-blade lands. Dropping one would leave only 60 contacts, so it would not support the chosen interface. The three proposed spare contacts are not yet implemented as final spares: all 120 numbered contacts remain unassigned in native CAD.

J4 currently assigns power, ground, a 1.8 V target reference and JTAG. Its eight planned data contacts are unassigned. All connectors have a specific role; no J2/J3 standalone headers or test-point components remain in this design.

## Explain unused pins with four labels

| Label to show | Meaning | Current examples |
|---|---|---|
| **ASSIGN** | Interface function is planned but pin mapping is unfinished | 203 U1 user-I/O balls; all 120 numbered J5/J6 contacts; eight J4 data contacts |
| **NC / REVIEW** | Optional feature is not connected in this CAD; final tie recommendation is being checked | U2.4, U3.4, U4.4, U5.4: optional FB2 outputs. TI’s single-divider example grounds them. |
| **GND REQUIRED** | Unused function still has a mandatory electrical connection | U1.L9 DXN_0 and U1.L10 DXP_0: currently marked NC; AMD requires ground |
| **ROUTE** | Net is assigned but its copper network is incomplete | Power/ground nets, including U4.11 VSEL ground strap |

**Say:** “Unused function does not always mean leave the pin open. The label tells us whether the pin needs an assignment, a deliberate no-connect review, a ground tie or a route.”

Do not label every pin on an incomplete power net as physically isolated. The current CSV says the **net** has a remaining gap; some pads on that net are already connected. Likewise, 146 routing gaps are not 146 unused pins. The eight J4 data contacts are 3, 5, 6, 8, 9, 11, 12 and 14.

The four FB2 pins are unused optional open-drain outputs, not floating regulator control inputs. The current NC treatment is circuit interpretation; TI Figure 5 p16 shows a ground tie. Present that distinction honestly and review the tie before release. [TI TPS62135](https://www.ti.com/lit/ds/symlink/tps62135.pdf)

## If the professor asks “is every part necessary?”

“The function of every part is documented. R12 has no present consumer and is the clearest removal candidate. Some straps and zero-ohm links can become copper, and several damping, bypass and startup values need validation. The power and decoupling networks are necessary, but we have not yet demonstrated the smallest working implementation. This remains a routing and verification checkpoint.”

The classification covers **32 keep-function parts, 13 architecture-dependent parts, 84 parts to qualify before reduction and one unconsumed status pull-up**. These categories are decisions for this saved topology, not a claim that 84 parts can be removed or that exactly 32 parts would make a working board.

Native CAD still reports zero physical clearance/parity findings, 146 missing assigned-net connections and 331 unassigned endpoints. Those geometric results did not catch the two diode-pin electrical requirements identified in this review. Full ASIC pin mapping, power delivery, link definition and functional testing remain incomplete.


## Every component — complete appendix

Read the group notes first. Each entry below describes the saved board; assigned nets may still have routing gaps. NC findings above override any apparent approval implied by the raw CAD label.

### FPGA logic

#### U1 — Acquire, time and package ASIC data

**Value:** XC7A100T-CSG324. **Decision:** Keep function.

The XC7A100T is the board logic device. Its planned firmware captures the ASIC interface, supplies control/clock signals and sends data downstream.

**If removed:** There is no FPGA function.

**Review:** Keep. Speed/temperature grade, RTL resource/timing budget and full application ball map remain to be finalized.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| A1 | IO_L9N_T1_DQS_AD7N_35 | — | unassigned — interface decision required |
| A2 | GND | GND | assigned, routing incomplete on net |
| A3 | IO_L8N_T1_AD14N_35 | — | unassigned — interface decision required |
| A4 | IO_L8P_T1_AD14P_35 | — | unassigned — interface decision required |
| A5 | IO_L3N_T0_DQS_AD5N_35 | — | unassigned — interface decision required |
| A6 | IO_L3P_T0_DQS_AD5P_35 | — | unassigned — interface decision required |
| A7 | VCCO_35 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| A8 | IO_L12N_T1_MRCC_16 | — | unassigned — interface decision required |
| A9 | IO_L14N_T2_SRCC_16 | — | unassigned — interface decision required |
| A10 | IO_L14P_T2_SRCC_16 | — | unassigned — interface decision required |
| A11 | IO_L4N_T0_15 | — | unassigned — interface decision required |
| A12 | GND | GND | assigned, routing incomplete on net |
| A13 | IO_L9P_T1_DQS_AD3P_15 | — | unassigned — interface decision required |
| A14 | IO_L9N_T1_DQS_AD3N_15 | — | unassigned — interface decision required |
| A15 | IO_L8P_T1_AD10P_15 | — | unassigned — interface decision required |
| A16 | IO_L8N_T1_AD10N_15 | — | unassigned — interface decision required |
| A17 | VCCO_15 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| A18 | IO_L10N_T1_AD11N_15 | — | unassigned — interface decision required |
| B1 | IO_L9P_T1_DQS_AD7P_35 | — | unassigned — interface decision required |
| B2 | IO_L10N_T1_AD15N_35 | — | unassigned — interface decision required |
| B3 | IO_L10P_T1_AD15P_35 | — | unassigned — interface decision required |
| B4 | IO_L7N_T1_AD6N_35 | — | unassigned — interface decision required |
| B5 | GND | GND | assigned, routing incomplete on net |
| B6 | IO_L2N_T0_AD12N_35 | — | unassigned — interface decision required |
| B7 | IO_L2P_T0_AD12P_35 | — | unassigned — interface decision required |
| B8 | IO_L12P_T1_MRCC_16 | — | unassigned — interface decision required |
| B9 | IO_L11N_T1_SRCC_16 | — | unassigned — interface decision required |
| B10 | VCCO_16 | VCC_LINK_2V5 | assigned, routing incomplete on net |
| B11 | IO_L4P_T0_15 | — | unassigned — interface decision required |
| B12 | IO_L3N_T0_DQS_AD1N_15 | — | unassigned — interface decision required |
| B13 | IO_L2P_T0_AD8P_15 | — | unassigned — interface decision required |
| B14 | IO_L2N_T0_AD8N_15 | — | unassigned — interface decision required |
| B15 | GND | GND | assigned, routing incomplete on net |
| B16 | IO_L7P_T1_AD2P_15 | — | unassigned — interface decision required |
| B17 | IO_L7N_T1_AD2N_15 | — | unassigned — interface decision required |
| B18 | IO_L10P_T1_AD11P_15 | — | unassigned — interface decision required |
| C1 | IO_L16N_T2_35 | — | unassigned — interface decision required |
| C2 | IO_L16P_T2_35 | — | unassigned — interface decision required |
| C3 | VCCO_35 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| C4 | IO_L7P_T1_AD6P_35 | — | unassigned — interface decision required |
| C5 | IO_L1N_T0_AD4N_35 | — | unassigned — interface decision required |
| C6 | IO_L1P_T0_AD4P_35 | — | unassigned — interface decision required |
| C7 | IO_L4N_T0_35 | — | unassigned — interface decision required |
| C8 | GND | GND | assigned, routing incomplete on net |
| C9 | IO_L11P_T1_SRCC_16 | — | unassigned — interface decision required |
| C10 | IO_L13N_T2_MRCC_16 | — | unassigned — interface decision required |
| C11 | IO_L13P_T2_MRCC_16 | — | unassigned — interface decision required |
| C12 | IO_L3P_T0_DQS_AD1P_15 | — | unassigned — interface decision required |
| C13 | VCCO_15 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| C14 | IO_L1N_T0_AD0N_15 | — | unassigned — interface decision required |
| C15 | IO_L12N_T1_MRCC_15 | — | unassigned — interface decision required |
| C16 | IO_L20P_T3_A20_15 | — | unassigned — interface decision required |
| C17 | IO_L20N_T3_A19_15 | — | unassigned — interface decision required |
| C18 | GND | GND | assigned, routing incomplete on net |
| D1 | GND | GND | assigned, routing incomplete on net |
| D2 | IO_L14N_T2_SRCC_35 | — | unassigned — interface decision required |
| D3 | IO_L12N_T1_MRCC_35 | — | unassigned — interface decision required |
| D4 | IO_L11N_T1_SRCC_35 | — | unassigned — interface decision required |
| D5 | IO_L11P_T1_SRCC_35 | — | unassigned — interface decision required |
| D6 | VCCO_35 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| D7 | IO_L6N_T0_VREF_35 | — | unassigned — interface decision required |
| D8 | IO_L4P_T0_35 | — | unassigned — interface decision required |
| D9 | IO_L6N_T0_VREF_16 | — | unassigned — interface decision required |
| D10 | IO_L19N_T3_VREF_16 | — | unassigned — interface decision required |
| D11 | GND | GND | assigned, routing incomplete on net |
| D12 | IO_L6P_T0_15 | — | unassigned — interface decision required |
| D13 | IO_L6N_T0_VREF_15 | — | unassigned — interface decision required |
| D14 | IO_L1P_T0_AD0P_15 | — | unassigned — interface decision required |
| D15 | IO_L12P_T1_MRCC_15 | — | unassigned — interface decision required |
| D16 | VCCO_15 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| D17 | IO_L16N_T2_A27_15 | — | unassigned — interface decision required |
| D18 | IO_L21N_T3_DQS_A18_15 | — | unassigned — interface decision required |
| E1 | IO_L18N_T2_35 | — | unassigned — interface decision required |
| E2 | IO_L14P_T2_SRCC_35 | — | unassigned — interface decision required |
| E3 | IO_L12P_T1_MRCC_35 | — | unassigned — interface decision required |
| E4 | GND | GND | assigned, routing incomplete on net |
| E5 | IO_L5N_T0_AD13N_35 | — | unassigned — interface decision required |
| E6 | IO_L5P_T0_AD13P_35 | — | unassigned — interface decision required |
| E7 | IO_L6P_T0_35 | — | unassigned — interface decision required |
| E8 | VCCBATT_0 | GND | assigned, routing incomplete on net |
| E9 | CCLK_0 | FPGA_CCLK | assigned net connected in native DRC |
| E10 | TCK_0 | JTAG_TCK | assigned net connected in native DRC |
| E11 | TDI_0 | JTAG_TDI | assigned net connected in native DRC |
| E12 | TMS_0 | JTAG_TMS | assigned net connected in native DRC |
| E13 | TDO_0 | FPGA_TDO | assigned net connected in native DRC |
| E14 | GND | GND | assigned, routing incomplete on net |
| E15 | IO_L11P_T1_SRCC_15 | — | unassigned — interface decision required |
| E16 | IO_L11N_T1_SRCC_15 | — | unassigned — interface decision required |
| E17 | IO_L16P_T2_A28_15 | — | unassigned — interface decision required |
| E18 | IO_L21P_T3_DQS_15 | — | unassigned — interface decision required |
| F1 | IO_L18P_T2_35 | — | unassigned — interface decision required |
| F2 | VCCO_35 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| F3 | IO_L13N_T2_MRCC_35 | — | unassigned — interface decision required |
| F4 | IO_L13P_T2_MRCC_35 | — | unassigned — interface decision required |
| F5 | IO_0_35 | — | unassigned — interface decision required |
| F6 | IO_L19N_T3_VREF_35 | — | unassigned — interface decision required |
| F7 | GND | GND | assigned, routing incomplete on net |
| F8 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| F9 | GND | GND | assigned, routing incomplete on net |
| F10 | VCCBRAM | VCCINT_1V0 | assigned, routing incomplete on net |
| F11 | GND | GND | assigned, routing incomplete on net |
| F12 | VCCAUX | VCCAUX_1V8 | assigned, routing incomplete on net |
| F13 | IO_L5P_T0_AD9P_15 | — | unassigned — interface decision required |
| F14 | IO_L5N_T0_AD9N_15 | — | unassigned — interface decision required |
| F15 | IO_L14P_T2_SRCC_15 | — | unassigned — interface decision required |
| F16 | IO_L14N_T2_SRCC_15 | — | unassigned — interface decision required |
| F17 | GND | GND | assigned, routing incomplete on net |
| F18 | IO_L22N_T3_A16_15 | — | unassigned — interface decision required |
| G1 | IO_L17N_T2_35 | — | unassigned — interface decision required |
| G2 | IO_L15N_T2_DQS_35 | — | unassigned — interface decision required |
| G3 | IO_L20N_T3_35 | — | unassigned — interface decision required |
| G4 | IO_L20P_T3_35 | — | unassigned — interface decision required |
| G5 | VCCO_35 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| G6 | IO_L19P_T3_35 | — | unassigned — interface decision required |
| G7 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| G8 | GND | GND | assigned, routing incomplete on net |
| G9 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| G10 | GND | GND | assigned, routing incomplete on net |
| G11 | VCCBRAM | VCCINT_1V0 | assigned, routing incomplete on net |
| G12 | GND | GND | assigned, routing incomplete on net |
| G13 | IO_0_15 | — | unassigned — interface decision required |
| G14 | IO_L15N_T2_DQS_ADV_B_15 | — | unassigned — interface decision required |
| G15 | VCCO_15 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| G16 | IO_L13N_T2_MRCC_15 | — | unassigned — interface decision required |
| G17 | IO_L18N_T2_A23_15 | — | unassigned — interface decision required |
| G18 | IO_L22P_T3_A17_15 | — | unassigned — interface decision required |
| H1 | IO_L17P_T2_35 | — | unassigned — interface decision required |
| H2 | IO_L15P_T2_DQS_35 | — | unassigned — interface decision required |
| H3 | GND | GND | assigned, routing incomplete on net |
| H4 | IO_L21N_T3_DQS_35 | — | unassigned — interface decision required |
| H5 | IO_L24N_T3_35 | — | unassigned — interface decision required |
| H6 | IO_L24P_T3_35 | — | unassigned — interface decision required |
| H7 | GND | GND | assigned, routing incomplete on net |
| H8 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| H9 | GNDADC_0 | GND | assigned, routing incomplete on net |
| H10 | VCCADC_0 | VCCAUX_1V8 | assigned, routing incomplete on net |
| H11 | GND | GND | assigned, routing incomplete on net |
| H12 | VCCAUX | VCCAUX_1V8 | assigned, routing incomplete on net |
| H13 | GND | GND | assigned, routing incomplete on net |
| H14 | IO_L15P_T2_DQS_15 | — | unassigned — interface decision required |
| H15 | IO_L19N_T3_A21_VREF_15 | — | unassigned — interface decision required |
| H16 | IO_L13P_T2_MRCC_15 | — | unassigned — interface decision required |
| H17 | IO_L18P_T2_A24_15 | — | unassigned — interface decision required |
| H18 | VCCO_15 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| J1 | VCCO_35 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| J2 | IO_L22N_T3_35 | — | unassigned — interface decision required |
| J3 | IO_L22P_T3_35 | — | unassigned — interface decision required |
| J4 | IO_L21P_T3_DQS_35 | — | unassigned — interface decision required |
| J5 | IO_25_35 | — | unassigned — interface decision required |
| J6 | GND | GND | assigned, routing incomplete on net |
| J7 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| J8 | GND | GND | assigned, routing incomplete on net |
| J9 | VREFN_0 | GND | assigned, routing incomplete on net |
| J10 | VP_0 | GND | assigned, routing incomplete on net |
| J11 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| J12 | GND | GND | assigned, routing incomplete on net |
| J13 | IO_L17N_T2_A25_15 | — | unassigned — interface decision required |
| J14 | IO_L19P_T3_A22_15 | — | unassigned — interface decision required |
| J15 | IO_L24N_T3_RS0_15 | — | unassigned — interface decision required |
| J16 | GND | GND | assigned, routing incomplete on net |
| J17 | IO_L23P_T3_FOE_B_15 | — | unassigned — interface decision required |
| J18 | IO_L23N_T3_FWE_B_15 | — | unassigned — interface decision required |
| K1 | IO_L23N_T3_35 | — | unassigned — interface decision required |
| K2 | IO_L23P_T3_35 | — | unassigned — interface decision required |
| K3 | IO_L2P_T0_34 | — | unassigned — interface decision required |
| K4 | VCCO_34 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| K5 | IO_L5P_T0_34 | — | unassigned — interface decision required |
| K6 | IO_0_34 | — | unassigned — interface decision required |
| K7 | GND | GND | assigned, routing incomplete on net |
| K8 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| K9 | VN_0 | GND | assigned, routing incomplete on net |
| K10 | VREFP_0 | GND | assigned, routing incomplete on net |
| K11 | GND | GND | assigned, routing incomplete on net |
| K12 | VCCAUX | VCCAUX_1V8 | assigned, routing incomplete on net |
| K13 | IO_L17P_T2_A26_15 | — | unassigned — interface decision required |
| K14 | VCCO_15 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| K15 | IO_L24P_T3_RS1_15 | — | unassigned — interface decision required |
| K16 | IO_25_15 | — | unassigned — interface decision required |
| K17 | IO_L1P_T0_D00_MOSI_14 | FPGA_CFG_DQ0 | assigned net connected in native DRC |
| K18 | IO_L1N_T0_D01_DIN_14 | FPGA_CFG_DQ1 | assigned net connected in native DRC |
| L1 | IO_L1P_T0_34 | — | unassigned — interface decision required |
| L2 | GND | GND | assigned, routing incomplete on net |
| L3 | IO_L2N_T0_34 | — | unassigned — interface decision required |
| L4 | IO_L5N_T0_34 | — | unassigned — interface decision required |
| L5 | IO_L6N_T0_VREF_34 | — | unassigned — interface decision required |
| L6 | IO_L6P_T0_34 | — | unassigned — interface decision required |
| L7 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| L8 | GND | GND | assigned, routing incomplete on net |
| L9 | DXN_0 | — | intentional no-connect |
| L10 | DXP_0 | — | intentional no-connect |
| L11 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| L12 | GND | GND | assigned, routing incomplete on net |
| L13 | IO_L6P_T0_FCS_B_14 | FLASH_CS_B | assigned net connected in native DRC |
| L14 | IO_L2P_T0_D02_14 | FPGA_CFG_DQ2 | assigned net connected in native DRC |
| L15 | IO_L3P_T0_DQS_PUDC_B_14 | CFG_PUDC_B | assigned net connected in native DRC |
| L16 | IO_L3N_T0_DQS_EMCCLK_14 | — | unassigned — interface decision required |
| L17 | VCCO_14 | VCCAUX_1V8 | assigned, routing incomplete on net |
| L18 | IO_L4P_T0_D04_14 | — | unassigned — interface decision required |
| M1 | IO_L1N_T0_34 | — | unassigned — interface decision required |
| M2 | IO_L4N_T0_34 | — | unassigned — interface decision required |
| M3 | IO_L4P_T0_34 | — | unassigned — interface decision required |
| M4 | IO_L16P_T2_34 | — | unassigned — interface decision required |
| M5 | GND | GND | assigned, routing incomplete on net |
| M6 | IO_L18P_T2_34 | — | unassigned — interface decision required |
| M7 | GND | GND | assigned, routing incomplete on net |
| M8 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| M9 | GND | GND | assigned, routing incomplete on net |
| M10 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| M11 | GND | GND | assigned, routing incomplete on net |
| M12 | VCCAUX | VCCAUX_1V8 | assigned, routing incomplete on net |
| M13 | IO_L6N_T0_D08_VREF_14 | — | unassigned — interface decision required |
| M14 | IO_L2N_T0_D03_14 | FPGA_CFG_DQ3 | assigned net connected in native DRC |
| M15 | GND | GND | assigned, routing incomplete on net |
| M16 | IO_L10P_T1_D14_14 | — | unassigned — interface decision required |
| M17 | IO_L10N_T1_D15_14 | — | unassigned — interface decision required |
| M18 | IO_L4N_T0_D05_14 | — | unassigned — interface decision required |
| N1 | IO_L3N_T0_DQS_34 | — | unassigned — interface decision required |
| N2 | IO_L3P_T0_DQS_34 | — | unassigned — interface decision required |
| N3 | VCCO_34 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| N4 | IO_L16N_T2_34 | — | unassigned — interface decision required |
| N5 | IO_L13P_T2_MRCC_34 | — | unassigned — interface decision required |
| N6 | IO_L18N_T2_34 | — | unassigned — interface decision required |
| N7 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| N8 | GND | GND | assigned, routing incomplete on net |
| N9 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| N10 | GND | GND | assigned, routing incomplete on net |
| N11 | VCCINT | VCCINT_1V0 | assigned, routing incomplete on net |
| N12 | GND | GND | assigned, routing incomplete on net |
| N13 | VCCO_14 | VCCAUX_1V8 | assigned, routing incomplete on net |
| N14 | IO_L8P_T1_D11_14 | — | unassigned — interface decision required |
| N15 | IO_L11P_T1_SRCC_14 | — | unassigned — interface decision required |
| N16 | IO_L11N_T1_SRCC_14 | — | unassigned — interface decision required |
| N17 | IO_L9P_T1_DQS_14 | — | unassigned — interface decision required |
| N18 | GND | GND | assigned, routing incomplete on net |
| P1 | GND | GND | assigned, routing incomplete on net |
| P2 | IO_L15P_T2_DQS_34 | — | unassigned — interface decision required |
| P3 | IO_L14N_T2_SRCC_34 | — | unassigned — interface decision required |
| P4 | IO_L14P_T2_SRCC_34 | — | unassigned — interface decision required |
| P5 | IO_L13N_T2_MRCC_34 | — | unassigned — interface decision required |
| P6 | VCCO_34 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| P7 | INIT_B_0 | FPGA_INIT_B | assigned net connected in native DRC |
| P8 | CFGBVS_0 | GND | assigned, routing incomplete on net |
| P9 | PROGRAM_B_0 | FPGA_PROGRAM_B | assigned net connected in native DRC |
| P10 | DONE_0 | FPGA_DONE | assigned net connected in native DRC |
| P11 | M2_0 | CFG_M2 | assigned net connected in native DRC |
| P12 | M0_0 | CFG_M0 | assigned net connected in native DRC |
| P13 | M1_0 | CFG_M1 | assigned net connected in native DRC |
| P14 | IO_L8N_T1_D12_14 | — | unassigned — interface decision required |
| P15 | IO_L13P_T2_MRCC_14 | — | unassigned — interface decision required |
| P16 | VCCO_14 | VCCAUX_1V8 | assigned, routing incomplete on net |
| P17 | IO_L12P_T1_MRCC_14 | CLK_32MHZ | assigned net connected in native DRC |
| P18 | IO_L9N_T1_DQS_D13_14 | — | unassigned — interface decision required |
| R1 | IO_L17P_T2_34 | — | unassigned — interface decision required |
| R2 | IO_L15N_T2_DQS_34 | — | unassigned — interface decision required |
| R3 | IO_L11P_T1_SRCC_34 | — | unassigned — interface decision required |
| R4 | GND | GND | assigned, routing incomplete on net |
| R5 | IO_L19N_T3_VREF_34 | — | unassigned — interface decision required |
| R6 | IO_L19P_T3_34 | — | unassigned — interface decision required |
| R7 | IO_L23P_T3_34 | — | unassigned — interface decision required |
| R8 | IO_L24P_T3_34 | — | unassigned — interface decision required |
| R9 | VCCO_0 | VCCAUX_1V8 | assigned, routing incomplete on net |
| R10 | IO_25_14 | — | unassigned — interface decision required |
| R11 | IO_0_14 | — | unassigned — interface decision required |
| R12 | IO_L5P_T0_D06_14 | — | unassigned — interface decision required |
| R13 | IO_L5N_T0_D07_14 | — | unassigned — interface decision required |
| R14 | GND | GND | assigned, routing incomplete on net |
| R15 | IO_L13N_T2_MRCC_14 | — | unassigned — interface decision required |
| R16 | IO_L15P_T2_DQS_RDWR_B_14 | — | unassigned — interface decision required |
| R17 | IO_L12N_T1_MRCC_14 | — | unassigned — interface decision required |
| R18 | IO_L7P_T1_D09_14 | — | unassigned — interface decision required |
| T1 | IO_L17N_T2_34 | — | unassigned — interface decision required |
| T2 | VCCO_34 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| T3 | IO_L11N_T1_SRCC_34 | — | unassigned — interface decision required |
| T4 | IO_L12N_T1_MRCC_34 | — | unassigned — interface decision required |
| T5 | IO_L12P_T1_MRCC_34 | — | unassigned — interface decision required |
| T6 | IO_L23N_T3_34 | — | unassigned — interface decision required |
| T7 | GND | GND | assigned, routing incomplete on net |
| T8 | IO_L24N_T3_34 | — | unassigned — interface decision required |
| T9 | IO_L24P_T3_A01_D17_14 | — | unassigned — interface decision required |
| T10 | IO_L24N_T3_A00_D16_14 | — | unassigned — interface decision required |
| T11 | IO_L19P_T3_A10_D26_14 | — | unassigned — interface decision required |
| T12 | VCCO_14 | VCCAUX_1V8 | assigned, routing incomplete on net |
| T13 | IO_L23P_T3_A03_D19_14 | — | unassigned — interface decision required |
| T14 | IO_L14P_T2_SRCC_14 | — | unassigned — interface decision required |
| T15 | IO_L14N_T2_SRCC_14 | — | unassigned — interface decision required |
| T16 | IO_L15N_T2_DQS_DOUT_CSO_B_14 | — | unassigned — interface decision required |
| T17 | GND | GND | assigned, routing incomplete on net |
| T18 | IO_L7N_T1_D10_14 | — | unassigned — interface decision required |
| U1 | IO_L7P_T1_34 | — | unassigned — interface decision required |
| U2 | IO_L9P_T1_DQS_34 | — | unassigned — interface decision required |
| U3 | IO_L8N_T1_34 | — | unassigned — interface decision required |
| U4 | IO_L8P_T1_34 | — | unassigned — interface decision required |
| U5 | VCCO_34 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| U6 | IO_L22N_T3_34 | — | unassigned — interface decision required |
| U7 | IO_L22P_T3_34 | — | unassigned — interface decision required |
| U8 | IO_25_34 | — | unassigned — interface decision required |
| U9 | IO_L21P_T3_DQS_34 | — | unassigned — interface decision required |
| U10 | GND | GND | assigned, routing incomplete on net |
| U11 | IO_L19N_T3_A09_D25_VREF_14 | — | unassigned — interface decision required |
| U12 | IO_L20P_T3_A08_D24_14 | — | unassigned — interface decision required |
| U13 | IO_L23N_T3_A02_D18_14 | — | unassigned — interface decision required |
| U14 | IO_L22P_T3_A05_D21_14 | — | unassigned — interface decision required |
| U15 | VCCO_14 | VCCAUX_1V8 | assigned, routing incomplete on net |
| U16 | IO_L18P_T2_A12_D28_14 | — | unassigned — interface decision required |
| U17 | IO_L17P_T2_A14_D30_14 | — | unassigned — interface decision required |
| U18 | IO_L17N_T2_A13_D29_14 | — | unassigned — interface decision required |
| V1 | IO_L7N_T1_34 | — | unassigned — interface decision required |
| V2 | IO_L9N_T1_DQS_34 | — | unassigned — interface decision required |
| V3 | GND | GND | assigned, routing incomplete on net |
| V4 | IO_L10N_T1_34 | — | unassigned — interface decision required |
| V5 | IO_L10P_T1_34 | — | unassigned — interface decision required |
| V6 | IO_L20N_T3_34 | — | unassigned — interface decision required |
| V7 | IO_L20P_T3_34 | — | unassigned — interface decision required |
| V8 | VCCO_34 | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| V9 | IO_L21N_T3_DQS_34 | — | unassigned — interface decision required |
| V10 | IO_L21P_T3_DQS_14 | — | unassigned — interface decision required |
| V11 | IO_L21N_T3_DQS_A06_D22_14 | — | unassigned — interface decision required |
| V12 | IO_L20N_T3_A07_D23_14 | — | unassigned — interface decision required |
| V13 | GND | GND | assigned, routing incomplete on net |
| V14 | IO_L22N_T3_A04_D20_14 | — | unassigned — interface decision required |
| V15 | IO_L16P_T2_CSI_B_14 | — | unassigned — interface decision required |
| V16 | IO_L16N_T2_A15_D31_14 | — | unassigned — interface decision required |
| V17 | IO_L18N_T2_A11_D27_14 | — | unassigned — interface decision required |
| V18 | VCCO_14 | VCCAUX_1V8 | assigned, routing incomplete on net |

### Four power rails

#### C1 — Cable-entry bulk reservoir

**Value:** 47u 25V X5R. **Decision:** Check before reducing.

47 uF at the proposed 12 V cable entry supports slower input current changes before the individual converter input reservoirs.

**If removed:** Reduces cable-entry energy reserve; depends on cable impedance, inrush and source behavior.

**Review:** Do not call this input protection. Retain pending a source/cable transient study; optimize jointly with the carrier, not by visual whitespace.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C2 — Cable-entry high-frequency bypass

**Value:** 100n 100V X7R. **Decision:** Check before reducing.

100 nF from the cable input to GND bypasses faster voltage disturbance at entry.

**If removed:** Changes entry-node high-frequency impedance.

**Review:** Review jointly with C1 and converter input loops. It does not clamp overvoltage.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C3 — Converter input reservoir

**Value:** 22u 25V X5R. **Decision:** Keep function.

Local input reservoir from LINK_12V to GND next to U2. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C4 — High-frequency input bypass

**Value:** 100n 100V X7R. **Decision:** Check before reducing.

Small local 100 nF bypass across U2 input, alongside C3.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C5 — Converter local output capacitor

**Value:** 22u 16V X5R. **Decision:** Keep function.

Local output reservoir and voltage-sense pickup for U2; the L/C output function works with L1.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCORE_REG_1V025 | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### C6 — Soft-start timing capacitor

**Value:** 10n 50V X7R. **Decision:** Check before reducing.

10 nF from U2 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SS_CORE | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### C7 — Converter input reservoir

**Value:** 22u 25V X5R. **Decision:** Keep function.

Local input reservoir from LINK_12V to GND next to U3. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C8 — High-frequency input bypass

**Value:** 100n 100V X7R. **Decision:** Check before reducing.

Small local 100 nF bypass across U3 input, alongside C7.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C9 — Converter local output capacitor

**Value:** 22u 16V X5R. **Decision:** Keep function.

Local output reservoir and voltage-sense pickup for U3; the L/C output function works with L2.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VAUX_REG_1V803 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C10 — Soft-start timing capacitor

**Value:** 10n 50V X7R. **Decision:** Check before reducing.

10 nF from U3 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SS_AUX | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### C11 — Converter input reservoir

**Value:** 22u 25V X5R. **Decision:** Keep function.

Local input reservoir from LINK_12V to GND next to U4. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C12 — High-frequency input bypass

**Value:** 100n 100V X7R. **Decision:** Check before reducing.

Small local 100 nF bypass across U4 input, alongside C11.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C13 — Converter local output capacitor

**Value:** 22u 16V X5R. **Decision:** Keep function.

Local output reservoir and voltage-sense pickup for U4; the L/C output function works with L3.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C14 — Soft-start timing capacitor

**Value:** 10n 50V X7R. **Decision:** Check before reducing.

10 nF from U4 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SS_CFG | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### C15 — Converter input reservoir

**Value:** 22u 25V X5R. **Decision:** Keep function.

Local input reservoir from LINK_12V to GND next to U5. Supplies the converter switching loop.

**If removed:** The local current loop relies on distant capacitors and cable inductance; input ripple and unstable startup become possible.

**Review:** Keep a qualified local input-capacitance function. Actual capacitance at 12 V, tolerance, temperature and aging must meet the input requirement.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C16 — High-frequency input bypass

**Value:** 100n 100V X7R. **Decision:** Check before reducing.

Small local 100 nF bypass across U5 input, alongside C15.

**If removed:** Changes high-frequency input impedance. The larger capacitor may not behave identically at fast edges.

**Review:** A possible optimization only after checking switching-loop layout, impedance and EMI; not proven individually indispensable.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C17 — Converter local output capacitor

**Value:** 22u 16V X5R. **Decision:** Keep function.

Local output reservoir and voltage-sense pickup for U5; the L/C output function works with L4.

**If removed:** The output filter and sensed node lose their intended local capacitor; supply ripple and control behavior change.

**Review:** Keep a qualified local output capacitor. C5 and C9 remain upstream of R9 and R122 respectively.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C18 — Soft-start timing capacitor

**Value:** 10n 50V X7R. **Decision:** Check before reducing.

10 nF from U5 SS/TR to GND controls the rail rise time. It is a timing choice, not the source of rail power.

**If removed:** The converter uses its fast internal startup behavior; inrush and FPGA rail ramp/sequence change.

**Review:** Could be reduced or omitted only after measured startup remains within FPGA ramp and sequencing limits. Retain until those checks pass.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SS_ASIC | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### L1 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30%. **Decision:** Keep function.

Carries U2 switched current to its local output capacitor C5; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SW_CORE | assigned net connected in native DRC |
| 2 | — | VCORE_REG_1V025 | assigned net connected in native DRC |

#### L2 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30%. **Decision:** Keep function.

Carries U3 switched current to its local output capacitor C9; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SW_AUX | assigned net connected in native DRC |
| 2 | — | VAUX_REG_1V803 | assigned, routing incomplete on net |

#### L3 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30%. **Decision:** Keep function.

Carries U4 switched current to its local output capacitor C13; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SW_CFG | assigned net connected in native DRC |
| 2 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |

#### L4 — Buck energy-storage inductor

**Value:** 1uH 5.4A Isat30%. **Decision:** Keep function.

Carries U5 switched current to its local output capacitor C17; this is part of the conversion path.

**If removed:** Open circuit cuts power to the rail; replacing with a short exposes the load to switching pulses.

**Review:** Keep the function; verify inductance under load, saturation, heating and selected footprint.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | SW_ASIC | assigned net connected in native DRC |
| 2 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |

#### R1 — Core / block ram feedback divider

**Value:** 32.4k 0.1%. **Decision:** Keep function.

The upper resistor of U2 output-setting divider; R1/R2 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCORE_REG_1V025 | assigned net connected in native DRC |
| 2 | — | FB_CORE | assigned net connected in native DRC |

#### R2 — Core / block ram feedback divider

**Value:** 69.8k 0.1%. **Decision:** Keep function.

The lower resistor of U2 output-setting divider; R1/R2 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FB_CORE | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### R3 — Auxiliary / configuration feedback divider

**Value:** 110k 0.1%. **Decision:** Keep function.

The upper resistor of U3 output-setting divider; R3/R4 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VAUX_REG_1V803 | assigned, routing incomplete on net |
| 2 | — | FB_AUX | assigned net connected in native DRC |

#### R4 — Auxiliary / configuration feedback divider

**Value:** 69.8k 0.1%. **Decision:** Keep function.

The lower resistor of U3 output-setting divider; R3/R4 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FB_AUX | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### R5 — 2.5 v link bank feedback divider

**Value:** 180k 0.1%. **Decision:** Keep function.

The upper resistor of U4 output-setting divider; R5/R6 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | FB_CFG | assigned net connected in native DRC |

#### R6 — 2.5 v link bank feedback divider

**Value:** 69.8k 0.1%. **Decision:** Keep function.

The lower resistor of U4 output-setting divider; R5/R6 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FB_CFG | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### R7 — 1.5 v asic-facing banks feedback divider

**Value:** 80.6k 0.1%. **Decision:** Keep function.

The upper resistor of U5 output-setting divider; R7/R8 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | FB_ASIC | assigned net connected in native DRC |

#### R8 — 1.5 v asic-facing banks feedback divider

**Value:** 69.8k 0.1%. **Decision:** Keep function.

The lower resistor of U5 output-setting divider; R7/R8 determines the chosen regulated voltage.

**If removed:** The intended feedback ratio is lost; the rail may be wrong, too low or driven high.

**Review:** Keep both divider functions with required tolerance; never treat these as optional bias resistors.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FB_ASIC | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### R9 — Distributed-capacitance isolation

**Value:** 15m 1% 1W. **Decision:** Keep function.

15 milliohm series element between VCORE_REG_1V025 and VCCINT_1V0; local sensing remains upstream, distributed FPGA capacitors downstream.

**If removed:** Removing it opens the rail; shorting it defeats the deliberately separated local and distributed capacitor networks.

**Review:** Retain for this topology. Replacing it requires a demonstrated alternative series impedance and a full DC-drop/stability review.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCORE_REG_1V025 | assigned net connected in native DRC |
| 2 | — | VCCINT_1V0 | assigned, routing incomplete on net |

#### R10 — Power-up sequencing pull-up

**Value:** 100k. **Decision:** Keep function.

Pulls PG_CORE high when U2 releases its open-drain power-good output; that signal enables U3.

**If removed:** The downstream enable no longer receives its designed high level.

**Review:** Keep while this sequencing chain is used; startup and unplug waveforms still need checking.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | PG_CORE | assigned net connected in native DRC |

#### R11 — Power-up sequencing pull-up

**Value:** 100k. **Decision:** Keep function.

Pulls PG_AUX high when U3 releases its open-drain power-good output; that signal enables U4 and U5.

**If removed:** The downstream enable no longer receives its designed high level.

**Review:** Keep while this sequencing chain is used; startup and unplug waveforms still need checking.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | LINK_12V | assigned, routing incomplete on net |
| 2 | — | PG_AUX | assigned net connected in native DRC |

#### R12 — Unconsumed I/O-good status pull-up

**Value:** 100k. **Decision:** Removal candidate.

Pulls up the wired-together U4/U5 power-good outputs, but PGOOD_IO has no FPGA, connector, supervisor or other consumer.

**If removed:** No existing rail-enable or data path is removed. The status branch would lose its defined high state.

**Review:** Remove candidate: delete this status-only branch deliberately, or define a real monitor. No component has been removed in this presentation audit.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | PGOOD_IO | assigned net connected in native DRC |

#### R122 — Distributed-capacitance isolation

**Value:** 15m 1% 1W. **Decision:** Keep function.

15 milliohm series element between VAUX_REG_1V803 and VCCAUX_1V8; local sensing remains upstream, distributed FPGA capacitors downstream.

**If removed:** Removing it opens the rail; shorting it defeats the deliberately separated local and distributed capacitor networks.

**Review:** Retain for this topology. Replacing it requires a demonstrated alternative series impedance and a full DC-drop/stability review.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VAUX_REG_1V803 | assigned, routing incomplete on net |
| 2 | — | VCCAUX_1V8 | assigned, routing incomplete on net |

#### U2 — Core / block ram converter

**Value:** TPS62135RGXR. **Decision:** Keep function.

Converts the proposed 12 V input into the core / block RAM rail. Its output voltage is selected by R1/R2.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned, routing incomplete on net |
| 2 | SW | SW_CORE | assigned net connected in native DRC |
| 3 | GND | GND | assigned, routing incomplete on net |
| 4 | FB2 | — | intentional no-connect |
| 5 | FB | FB_CORE | assigned net connected in native DRC |
| 6 | VOS | VCORE_REG_1V025 | assigned net connected in native DRC |
| 7 | PG | PG_CORE | assigned net connected in native DRC |
| 8 | EN | LINK_12V | assigned, routing incomplete on net |
| 9 | SS/TR | SS_CORE | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned, routing incomplete on net |
| 11 | VSEL | GND | assigned, routing incomplete on net |

#### U3 — Auxiliary / configuration converter

**Value:** TPS62135RGXR. **Decision:** Keep function.

Converts the proposed 12 V input into the auxiliary / configuration rail. Its output voltage is selected by R3/R4.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned, routing incomplete on net |
| 2 | SW | SW_AUX | assigned net connected in native DRC |
| 3 | GND | GND | assigned, routing incomplete on net |
| 4 | FB2 | — | intentional no-connect |
| 5 | FB | FB_AUX | assigned net connected in native DRC |
| 6 | VOS | VAUX_REG_1V803 | assigned, routing incomplete on net |
| 7 | PG | PG_AUX | assigned net connected in native DRC |
| 8 | EN | PG_CORE | assigned net connected in native DRC |
| 9 | SS/TR | SS_AUX | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned, routing incomplete on net |
| 11 | VSEL | GND | assigned, routing incomplete on net |

#### U4 — 2.5 v link bank converter

**Value:** TPS62135RGXR. **Decision:** Depends on system choice.

Converts the proposed 12 V input into the 2.5 V link bank rail. Its output voltage is selected by R5/R6.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned, routing incomplete on net |
| 2 | SW | SW_CFG | assigned net connected in native DRC |
| 3 | GND | GND | assigned, routing incomplete on net |
| 4 | FB2 | — | intentional no-connect |
| 5 | FB | FB_CFG | assigned net connected in native DRC |
| 6 | VOS | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 7 | PG | PGOOD_IO | assigned net connected in native DRC |
| 8 | EN | PG_AUX | assigned net connected in native DRC |
| 9 | SS/TR | SS_CFG | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned, routing incomplete on net |
| 11 | VSEL | GND | assigned, routing incomplete on net |

#### U5 — 1.5 v asic-facing banks converter

**Value:** TPS62135RGXR. **Decision:** Depends on system choice.

Converts the proposed 12 V input into the 1.5 V ASIC-facing banks rail. Its output voltage is selected by R7/R8.

**If removed:** This rail loses its source. The connected FPGA power pins cannot simply be left open.

**Review:** Keep for this four-rail architecture. A different input or interface voltage requires redesign; the 4 A IC rating is not a validated available board current.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | VIN | LINK_12V | assigned, routing incomplete on net |
| 2 | SW | SW_ASIC | assigned net connected in native DRC |
| 3 | GND | GND | assigned, routing incomplete on net |
| 4 | FB2 | — | intentional no-connect |
| 5 | FB | FB_ASIC | assigned net connected in native DRC |
| 6 | VOS | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 7 | PG | PGOOD_IO | assigned net connected in native DRC |
| 8 | EN | PG_AUX | assigned net connected in native DRC |
| 9 | SS/TR | SS_ASIC | assigned net connected in native DRC |
| 10 | MODE | LINK_12V | assigned, routing incomplete on net |
| 11 | VSEL | GND | assigned, routing incomplete on net |

### FPGA supply decoupling

#### C20 — Bulk energy reserve

**Value:** 330u 2.5V polymer ESR25m. **Decision:** Check before reducing.

330u 2.5V polymer ESR25m bulk energy reserve for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C21 — Bulk energy reserve

**Value:** 100u 6.3V X5R. **Decision:** Check before reducing.

100u 6.3V X5R bulk energy reserve for FPGA block RAM between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence. The recorded part family is NRND; qualify an orderable alternative.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C22 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C23 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C24 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C25 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C26 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C27 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C28 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C29 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C30 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C31 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C32 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C33 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C34 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C35 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA core between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C36 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA block RAM between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C37 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA block RAM between VCCINT_1V0 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCINT_1V0 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C40 — Bulk energy reserve

**Value:** 47u 6.3V X7R. **Decision:** Check before reducing.

47u 6.3V X7R bulk energy reserve for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C41 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C42 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C43 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C44 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C45 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C46 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for FPGA auxiliary circuits between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C50 — Bulk energy reserve

**Value:** 47u 6.3V X7R. **Decision:** Check before reducing.

47u 6.3V X7R bulk energy reserve for configuration bank 0 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C51 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C52 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C53 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C54 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C55 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C56 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for configuration/user-I/O bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C57 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C58 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C59 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C60 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C61 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C62 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C63 — Bulk energy reserve

**Value:** 47u 6.3V X7R. **Decision:** Check before reducing.

47u 6.3V X7R bulk energy reserve for link bank 16 between VCC_LINK_2V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_LINK_2V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C64 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C65 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C66 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C67 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C68 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C69 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 15 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C70 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C71 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C72 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C73 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C74 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C75 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 34 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C76 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C77 — Local supply bypass

**Value:** 4.7u 10V X7R. **Decision:** Check before reducing.

4.7u 10V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C78 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C79 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C80 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C81 — Local supply bypass

**Value:** 470n 6.3V X7R. **Decision:** Check before reducing.

470n 6.3V X7R local supply bypass for ASIC-facing bank 35 between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C82 — Bulk energy reserve

**Value:** 47u 6.3V X7R. **Decision:** Check before reducing.

47u 6.3V X7R bulk energy reserve for the three ASIC-facing banks between VCC_ASIC_1V5 and GND. Supplies short current pulses locally while the regulator and plane respond.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCC_ASIC_1V5 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C90 — Local supply bypass

**Value:** 100n 16V X7R. **Decision:** Check before reducing.

100n 16V X7R local supply bypass for XADC analog supply between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond. The ADC-related supply still needs a defined electrical connection even when external temperature-diode sensing is unused.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C91 — Local supply bypass

**Value:** 1u 10V X7R. **Decision:** Check before reducing.

1u 10V X7R local supply bypass for XADC analog supply between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond. The ADC-related supply still needs a defined electrical connection even when external temperature-diode sensing is unused.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C92 — Bulk energy reserve

**Value:** 47u 6.3V X7R. **Decision:** Check before reducing.

47u 6.3V X7R bulk energy reserve for bank 14 between VCCAUX_1V8 and GND. Supplies short current pulses locally while the regulator and plane respond. Added when bank 14 and bank 16 were separated onto different voltages; it is not a duplicate on the 2.5 V rail.

**If removed:** Less local stored charge and changed power-network impedance; may cause supply noise or transient failures. Removing one is not automatically safe or automatically fatal.

**Review:** Retain the documented decoupling baseline. This individual part is not proven to be the unique minimum; reduction requires equivalent impedance, effective capacitance and load-step evidence.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

### Boot memory

#### C100 — Flash local supply bypass

**Value:** 100n. **Decision:** Keep function.

100 nF between U6 VCC and GND supports local flash switching current.

**If removed:** Removes the smallest local flash reservoir; remote rail capacitance does not guarantee an equivalent short current loop.

**Review:** Keep local bypass when U6 is fitted. Final capacitor order code remains pending.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C101 — Flash local bulk reservoir

**Value:** 1u. **Decision:** Check before reducing.

1 uF supplements C100 at the flash supply.

**If removed:** Less local reserve; flash current transients must then be met by C100 and the rail network.

**Review:** Potential reduction only after supply-noise and flash power-cycle tests.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### R100 — Flash chip-select pull-up

**Value:** 2.4k. **Decision:** Keep function.

Holds FLASH_CS_B high while FPGA control is high impedance, preventing accidental selection.

**If removed:** Flash chip select loses its external defined idle-high state during startup.

**Review:** Keep for the selected SPI boot interface.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | FLASH_CS_B | assigned net connected in native DRC |

#### R101 — Flash WP / DQ2 default high

**Value:** 4.7k. **Decision:** Depends on system choice.

Pulls U6 WP#/SIO2 high for the initial single-bit SPI interface while allowing quad-data use later.

**If removed:** The flash write-protect/data pin may lose its defined default level when FPGA outputs are undriven.

**Review:** Keep for current flash/boot strategy; simplify only with a verified reset/mode/programming contract.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | FLASH_DQ2 | assigned net connected in native DRC |

#### R102 — Flash RESET / DQ3 default high

**Value:** 4.7k. **Decision:** Depends on system choice.

Pulls U6 RESET#/SIO3 high so the selected flash is not unintentionally held in reset.

**If removed:** The reset/data pin may lose its defined default level before configuration.

**Review:** Keep for this exact flash part and mode; it is RESET#, not a generic HOLD# pin.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | FLASH_DQ3 | assigned net connected in native DRC |

#### R103 — Flash clock source damping

**Value:** 33. **Decision:** Check before reducing.

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FPGA_CCLK | assigned net connected in native DRC |
| 2 | — | FLASH_SCLK | assigned net connected in native DRC |

#### R104 — Zero-ohm flash signal link

**Value:** 0. **Decision:** Check before reducing.

Provides an editable series location in the DQ0 path. Its fitted 0 ohm value is electrically a link.

**If removed:** Depopulating it breaks the signal; a deliberate trace replacement keeps connectivity.

**Review:** Footprint-removal candidate after signal-integrity/boot-mode review; do not confuse removing the component with leaving an open circuit.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FPGA_CFG_DQ0 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ0 | assigned net connected in native DRC |

#### R105 — Flash data source damping

**Value:** 33. **Decision:** Check before reducing.

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FPGA_CFG_DQ1 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ1 | assigned net connected in native DRC |

#### R106 — Zero-ohm flash signal link

**Value:** 0. **Decision:** Check before reducing.

Provides an editable series location in the DQ2 path. Its fitted 0 ohm value is electrically a link.

**If removed:** Depopulating it breaks the signal; a deliberate trace replacement keeps connectivity.

**Review:** Footprint-removal candidate after signal-integrity/boot-mode review; do not confuse removing the component with leaving an open circuit.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FPGA_CFG_DQ2 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ2 | assigned net connected in native DRC |

#### R107 — Zero-ohm flash signal link

**Value:** 0. **Decision:** Check before reducing.

Provides an editable series location in the DQ3 path. Its fitted 0 ohm value is electrically a link.

**If removed:** Depopulating it breaks the signal; a deliberate trace replacement keeps connectivity.

**Review:** Footprint-removal candidate after signal-integrity/boot-mode review; do not confuse removing the component with leaving an open circuit.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FPGA_CFG_DQ3 | assigned net connected in native DRC |
| 2 | — | FLASH_DQ3 | assigned net connected in native DRC |

#### U6 — Nonvolatile boot image

**Value:** MX25U12835FM2I-10G. **Decision:** Depends on system choice.

Stores the configuration image for autonomous SPI boot at 1.8 V. The FPGA logic configuration must be loaded after power-up.

**If removed:** The selected SPI self-boot path is lost; an external configuration method would be required each startup.

**Review:** Keep for autonomous boot. Could be omitted only if externally supplied configuration is an accepted system requirement.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | CS# | FLASH_CS_B | assigned net connected in native DRC |
| 2 | SO / SIO1 | FLASH_DQ1 | assigned net connected in native DRC |
| 3 | WP# / SIO2 | FLASH_DQ2 | assigned net connected in native DRC |
| 4 | GND | GND | assigned, routing incomplete on net |
| 5 | SI / SIO0 | FLASH_DQ0 | assigned net connected in native DRC |
| 6 | SCLK | FLASH_SCLK | assigned net connected in native DRC |
| 7 | RESET# / SIO3 | FLASH_DQ3 | assigned net connected in native DRC |
| 8 | VCC | VCCAUX_1V8 | assigned, routing incomplete on net |

### System clock

#### C102 — Oscillator local supply bypass

**Value:** 10n. **Decision:** Keep function.

10 nF adjacent to Y1 VDD/GND follows the oscillator bypass arrangement in the selected-part documentation.

**If removed:** Removes its intended shortest bypass path.

**Review:** Keep local bypass when Y1 is fitted. ASE3 recommends 10 nF, but its note incorrectly says pins 7/14; the actual four-pin table is VDD=4 and GND=2. Use that verified mapping.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### C103 — Additional oscillator bypass

**Value:** 100n. **Decision:** Check before reducing.

100 nF supplements Y1 local supply bypass C102.

**If removed:** Less local supply filtering; consequence depends on supply impedance and clock sensitivity.

**Review:** Can be optimized after clock jitter/supply-noise evidence; do not claim two bypass parts are universally mandatory.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | GND | assigned, routing incomplete on net |

#### R119 — Oscillator output damping

**Value:** 33. **Decision:** Check before reducing.

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | OSC_32M_RAW | assigned net connected in native DRC |
| 2 | — | CLK_32MHZ | assigned net connected in native DRC |

#### Y1 — 32 MHz system reference

**Value:** ASE3 32MHz 1.8V. **Decision:** Depends on system choice.

The 1.8 V oscillator provides the application clock through R119 to U1.P17. It is separate from the FPGA configuration clock.

**If removed:** The present application clock path stops; SPI configuration may still use its own clock, but application operation requires an alternative reference.

**Review:** Keep for self-contained clocking. Remove only if another approved clock source is supplied with valid startup and timing.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | Enable | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | GND | GND | assigned, routing incomplete on net |
| 3 | Clock output | OSC_32M_RAW | assigned net connected in native DRC |
| 4 | VDD | VCCAUX_1V8 | assigned, routing incomplete on net |

### Configuration and JTAG

#### R108 — PROGRAM_B pull-up

**Value:** 4.7k. **Decision:** Keep function.

4.7 kilohm to the 1.8 V configuration rail gives PROGRAM_B the specified released/high state.

**If removed:** Configuration reset/initialization behavior can become undefined or stall.

**Review:** Keep the pull-up function required for this configuration scheme.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | FPGA_PROGRAM_B | assigned net connected in native DRC |

#### R109 — INIT_B pull-up

**Value:** 4.7k. **Decision:** Keep function.

4.7 kilohm to the 1.8 V configuration rail gives INIT_B the specified released/high state.

**If removed:** Configuration reset/initialization behavior can become undefined or stall.

**Review:** Keep the pull-up function required for this configuration scheme.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | FPGA_INIT_B | assigned net connected in native DRC |

#### R110 — Additional DONE pull-up

**Value:** 4.7k. **Decision:** Check before reducing.

4.7 kilohm supplements the FPGA internal DONE pull-up. The current DONE net has no external monitor or LED.

**If removed:** DONE retains its internal pull-up; whether its rise is acceptable depends on configuration settings and loading.

**Review:** A removal candidate after confirming DonePipe/startup settings, leakage and waveform. Do not state that every external DONE pull-up is mandatory.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | FPGA_DONE | assigned net connected in native DRC |

#### R111 — Configuration strap M0

**Value:** 1k. **Decision:** Depends on system choice.

1 kilohm sets M0 to 1.8 V / high. M[2:0]=001 chooses SPI; PUDC_B high disables configuration-time user-I/O pull-ups.

**If removed:** The deliberately fixed configuration input loses its chosen strap unless replaced by a direct connection.

**Review:** The stable logic level is needed; the separate resistor is not inherently needed. UG470 permits a direct rail/GND tie, so a later revision can replace it with copper after the pin and configuration choice is frozen.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | CFG_M0 | assigned net connected in native DRC |

#### R112 — Configuration strap M1

**Value:** 1k. **Decision:** Depends on system choice.

1 kilohm sets M1 to GND / low. M[2:0]=001 chooses SPI; PUDC_B high disables configuration-time user-I/O pull-ups.

**If removed:** The deliberately fixed configuration input loses its chosen strap unless replaced by a direct connection.

**Review:** The stable logic level is needed; the separate resistor is not inherently needed. UG470 permits a direct rail/GND tie, so a later revision can replace it with copper after the pin and configuration choice is frozen.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | CFG_M1 | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### R113 — Configuration strap M2

**Value:** 1k. **Decision:** Depends on system choice.

1 kilohm sets M2 to GND / low. M[2:0]=001 chooses SPI; PUDC_B high disables configuration-time user-I/O pull-ups.

**If removed:** The deliberately fixed configuration input loses its chosen strap unless replaced by a direct connection.

**Review:** The stable logic level is needed; the separate resistor is not inherently needed. UG470 permits a direct rail/GND tie, so a later revision can replace it with copper after the pin and configuration choice is frozen.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | CFG_M2 | assigned net connected in native DRC |
| 2 | — | GND | assigned, routing incomplete on net |

#### R114 — Configuration strap PUDC_B

**Value:** 1k. **Decision:** Depends on system choice.

1 kilohm sets PUDC_B to 1.8 V / high. M[2:0]=001 chooses SPI; PUDC_B high disables configuration-time user-I/O pull-ups.

**If removed:** The deliberately fixed configuration input loses its chosen strap unless replaced by a direct connection.

**Review:** The stable logic level is needed; the separate resistor is not inherently needed. UG470 permits a direct rail/GND tie, so a later revision can replace it with copper after the pin and configuration choice is frozen.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | CFG_PUDC_B | assigned net connected in native DRC |

#### R115 — JTAG TMS external idle bias

**Value:** 10k. **Decision:** Check before reducing.

10 kilohm to 1.8 V provides a weak external high level at JTAG TMS when the cable is undriven.

**If removed:** External idle bias disappears; behavior then depends on device internal pulls and the actual adapter/cable.

**Review:** Review with the programming-interface contract. The current direct, single-FPGA connection does not prove that all three extra resistors are mandatory.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | JTAG_TMS | assigned net connected in native DRC |

#### R116 — JTAG TDI external idle bias

**Value:** 10k. **Decision:** Check before reducing.

10 kilohm to 1.8 V provides a weak external high level at JTAG TDI when the cable is undriven.

**If removed:** External idle bias disappears; behavior then depends on device internal pulls and the actual adapter/cable.

**Review:** Review with the programming-interface contract. The current direct, single-FPGA connection does not prove that all three extra resistors are mandatory.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | JTAG_TDI | assigned net connected in native DRC |

#### R117 — JTAG TCK external idle bias

**Value:** 10k. **Decision:** Check before reducing.

10 kilohm to 1.8 V provides a weak external high level at JTAG TCK when the cable is undriven.

**If removed:** External idle bias disappears; behavior then depends on device internal pulls and the actual adapter/cable.

**Review:** Review with the programming-interface contract. The current direct, single-FPGA connection does not prove that all three extra resistors are mandatory.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | JTAG_TCK | assigned net connected in native DRC |

#### R118 — JTAG TDO source damping

**Value:** 33. **Decision:** Check before reducing.

33 ohm series element reduces fast-edge ringing in this saved signal path; its actual value depends on driver, trace/cable and load.

**If removed:** If simply depopulated, the signal path is broken. Replacing it with copper removes the damping.

**Review:** Tune or replace by a direct route only after signal-integrity evidence. The existing 33 ohm value is a draft value, not a measured optimum.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | FPGA_TDO | assigned net connected in native DRC |
| 2 | — | JTAG_TDO | assigned net connected in native DRC |

### External connections

#### J4 — Shared power / JTAG / future data cable

**Value:** CUSTOM POWER + JTAG / DATA TBD. **Decision:** Depends on system choice.

One custom Type-D connector replaces separate power and debug connectors and reserves contacts for four data pairs.

**If removed:** The selected power-entry and external programming access disappear.

**Review:** Keep one system connector. Exact cable pinout, protected source and receiver design must be qualified; this custom 12 V wiring is not HDMI compatible.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | VCCAUX_1V8 | assigned, routing incomplete on net |
| 2 | — | JTAG_TMS | assigned net connected in native DRC |
| 3 | — | — | unassigned — interface decision required |
| 4 | — | GND | assigned, routing incomplete on net |
| 5 | — | — | unassigned — interface decision required |
| 6 | — | — | unassigned — interface decision required |
| 7 | — | GND | assigned, routing incomplete on net |
| 8 | — | — | unassigned — interface decision required |
| 9 | — | — | unassigned — interface decision required |
| 10 | — | GND | assigned, routing incomplete on net |
| 11 | — | — | unassigned — interface decision required |
| 12 | — | — | unassigned — interface decision required |
| 13 | — | GND | assigned, routing incomplete on net |
| 14 | — | — | unassigned — interface decision required |
| 15 | — | JTAG_TDI | assigned net connected in native DRC |
| 16 | — | GND | assigned, routing incomplete on net |
| 17 | — | JTAG_TCK | assigned net connected in native DRC |
| 18 | — | JTAG_TDO | assigned net connected in native DRC |
| 19 | — | LINK_12V | assigned, routing incomplete on net |
| SH | — | GND | assigned, routing incomplete on net |

#### J5 — 60-contact ASIC mezzanine

**Value:** QSH-030-01-L-D-A. **Decision:** Depends on system choice.

One half of the chosen two-connector ASIC interface; together J5/J6 offer 120 numbered signal contacts plus ground-blade lands.

**If removed:** The proposed 117-contact interface no longer fits in the remaining 60 contacts.

**Review:** Keep both for the user-selected 2 x 60 arrangement. All 120 numbered contacts are still unassigned in current CAD; three are only proposed spare contacts.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | — | unassigned — interface decision required |
| 2 | — | — | unassigned — interface decision required |
| 3 | — | — | unassigned — interface decision required |
| 4 | — | — | unassigned — interface decision required |
| 5 | — | — | unassigned — interface decision required |
| 6 | — | — | unassigned — interface decision required |
| 7 | — | — | unassigned — interface decision required |
| 8 | — | — | unassigned — interface decision required |
| 9 | — | — | unassigned — interface decision required |
| 10 | — | — | unassigned — interface decision required |
| 11 | — | — | unassigned — interface decision required |
| 12 | — | — | unassigned — interface decision required |
| 13 | — | — | unassigned — interface decision required |
| 14 | — | — | unassigned — interface decision required |
| 15 | — | — | unassigned — interface decision required |
| 16 | — | — | unassigned — interface decision required |
| 17 | — | — | unassigned — interface decision required |
| 18 | — | — | unassigned — interface decision required |
| 19 | — | — | unassigned — interface decision required |
| 20 | — | — | unassigned — interface decision required |
| 21 | — | — | unassigned — interface decision required |
| 22 | — | — | unassigned — interface decision required |
| 23 | — | — | unassigned — interface decision required |
| 24 | — | — | unassigned — interface decision required |
| 25 | — | — | unassigned — interface decision required |
| 26 | — | — | unassigned — interface decision required |
| 27 | — | — | unassigned — interface decision required |
| 28 | — | — | unassigned — interface decision required |
| 29 | — | — | unassigned — interface decision required |
| 30 | — | — | unassigned — interface decision required |
| 31 | — | — | unassigned — interface decision required |
| 32 | — | — | unassigned — interface decision required |
| 33 | — | — | unassigned — interface decision required |
| 34 | — | — | unassigned — interface decision required |
| 35 | — | — | unassigned — interface decision required |
| 36 | — | — | unassigned — interface decision required |
| 37 | — | — | unassigned — interface decision required |
| 38 | — | — | unassigned — interface decision required |
| 39 | — | — | unassigned — interface decision required |
| 40 | — | — | unassigned — interface decision required |
| 41 | — | — | unassigned — interface decision required |
| 42 | — | — | unassigned — interface decision required |
| 43 | — | — | unassigned — interface decision required |
| 44 | — | — | unassigned — interface decision required |
| 45 | — | — | unassigned — interface decision required |
| 46 | — | — | unassigned — interface decision required |
| 47 | — | — | unassigned — interface decision required |
| 48 | — | — | unassigned — interface decision required |
| 49 | — | — | unassigned — interface decision required |
| 50 | — | — | unassigned — interface decision required |
| 51 | — | — | unassigned — interface decision required |
| 52 | — | — | unassigned — interface decision required |
| 53 | — | — | unassigned — interface decision required |
| 54 | — | — | unassigned — interface decision required |
| 55 | — | — | unassigned — interface decision required |
| 56 | — | — | unassigned — interface decision required |
| 57 | — | — | unassigned — interface decision required |
| 58 | — | — | unassigned — interface decision required |
| 59 | — | — | unassigned — interface decision required |
| 60 | — | — | unassigned — interface decision required |
| G | — | GND | assigned, routing incomplete on net |

#### J6 — 60-contact ASIC mezzanine

**Value:** QSH-030-01-L-D-A. **Decision:** Depends on system choice.

One half of the chosen two-connector ASIC interface; together J5/J6 offer 120 numbered signal contacts plus ground-blade lands.

**If removed:** The proposed 117-contact interface no longer fits in the remaining 60 contacts.

**Review:** Keep both for the user-selected 2 x 60 arrangement. All 120 numbered contacts are still unassigned in current CAD; three are only proposed spare contacts.

| Pin | Function | Saved net | Saved status |
|---|---|---|---|
| 1 | — | — | unassigned — interface decision required |
| 2 | — | — | unassigned — interface decision required |
| 3 | — | — | unassigned — interface decision required |
| 4 | — | — | unassigned — interface decision required |
| 5 | — | — | unassigned — interface decision required |
| 6 | — | — | unassigned — interface decision required |
| 7 | — | — | unassigned — interface decision required |
| 8 | — | — | unassigned — interface decision required |
| 9 | — | — | unassigned — interface decision required |
| 10 | — | — | unassigned — interface decision required |
| 11 | — | — | unassigned — interface decision required |
| 12 | — | — | unassigned — interface decision required |
| 13 | — | — | unassigned — interface decision required |
| 14 | — | — | unassigned — interface decision required |
| 15 | — | — | unassigned — interface decision required |
| 16 | — | — | unassigned — interface decision required |
| 17 | — | — | unassigned — interface decision required |
| 18 | — | — | unassigned — interface decision required |
| 19 | — | — | unassigned — interface decision required |
| 20 | — | — | unassigned — interface decision required |
| 21 | — | — | unassigned — interface decision required |
| 22 | — | — | unassigned — interface decision required |
| 23 | — | — | unassigned — interface decision required |
| 24 | — | — | unassigned — interface decision required |
| 25 | — | — | unassigned — interface decision required |
| 26 | — | — | unassigned — interface decision required |
| 27 | — | — | unassigned — interface decision required |
| 28 | — | — | unassigned — interface decision required |
| 29 | — | — | unassigned — interface decision required |
| 30 | — | — | unassigned — interface decision required |
| 31 | — | — | unassigned — interface decision required |
| 32 | — | — | unassigned — interface decision required |
| 33 | — | — | unassigned — interface decision required |
| 34 | — | — | unassigned — interface decision required |
| 35 | — | — | unassigned — interface decision required |
| 36 | — | — | unassigned — interface decision required |
| 37 | — | — | unassigned — interface decision required |
| 38 | — | — | unassigned — interface decision required |
| 39 | — | — | unassigned — interface decision required |
| 40 | — | — | unassigned — interface decision required |
| 41 | — | — | unassigned — interface decision required |
| 42 | — | — | unassigned — interface decision required |
| 43 | — | — | unassigned — interface decision required |
| 44 | — | — | unassigned — interface decision required |
| 45 | — | — | unassigned — interface decision required |
| 46 | — | — | unassigned — interface decision required |
| 47 | — | — | unassigned — interface decision required |
| 48 | — | — | unassigned — interface decision required |
| 49 | — | — | unassigned — interface decision required |
| 50 | — | — | unassigned — interface decision required |
| 51 | — | — | unassigned — interface decision required |
| 52 | — | — | unassigned — interface decision required |
| 53 | — | — | unassigned — interface decision required |
| 54 | — | — | unassigned — interface decision required |
| 55 | — | — | unassigned — interface decision required |
| 56 | — | — | unassigned — interface decision required |
| 57 | — | — | unassigned — interface decision required |
| 58 | — | — | unassigned — interface decision required |
| 59 | — | — | unassigned — interface decision required |
| 60 | — | — | unassigned — interface decision required |
| G | — | GND | assigned, routing incomplete on net |
