# Smallest FPGA board — qualification summary

27 September 2026 · 33 × 36 mm board · design selection and review evidence

**Selected boot simplification:** fixed SPI x1 removes R106/R107 and marks U1.L14/M14 NC; the flash WP#/RESET# pull-ups remain. The resulting design has **125 components, 752 numbered endpoints, 83 intentional NC and 19 reserved endpoints**. One-bit boot is slower than quad at the same clock; ASIC capture bandwidth is unchanged. See the [source review and boot constraints](SPIx1_Boot_Review.md).

**This is the selected compact design and its verification boundary. It is not yet a demonstrated working acquisition board or a manufacturing release.** Final integration owns the matching CAD, BOM and native checks; intermediate routing files and historical reports are not release artifacts.

## Selected hardware

| Function | Exact selection | Why it is present |
|---|---|---|
| U1 FPGA | **XC7A100T-1CSG324I** | Artix-7 100T, 15 × 15 mm CSG324; standard 1.0 V core, industrial temperature grade |
| U2–U5 converters | **TPS62135RGXR** | Separate core, auxiliary/configuration, ASIC I/O and reserved-link supply rails |
| U6 boot flash | **MX25U12835FM2I-10G** | Stores the FPGA configuration at the selected 1.8 V interface |
| Y1 reference | **ASE3-32.000MHZ-L-C-T** | 32 MHz, 1.8 V reference for the FPGA's own logic |
| R9 core isolation | **WSLP1206R0120FEA** | 12 mΩ ±1%, 1206, 1 W at 70°C; lowers DC loss while preserving isolation resistance |
| Local bypasses | **34 × GRT155R71A474KE01D**, **C90 GRT155R71C104KE01D** | 470 nF/10 V and 100 nF/16 V X7R 0402 parts retain local bypass functions while opening BGA escape space |
| J4 custom cable port | **Molex 467651001** | Power and JTAG contacts; eight contacts reserved for a future data link; electrically incompatible with ordinary HDMI |
| J5/J6 carrier interface | **Samtec QSH-030-01-L-D-A** | Two 60-contact mezzanine connectors with separate ground blades |

U1's exact ordering selection is [source checked](U1_Order_Code_Selection.md); timing for that part still requires Vivado. The intended final inventory is **125 components and 752 numbered endpoints**, including 83 intentional NC and 19 reserved endpoints. Final native readback must verify those counts; this source note is not a substitute. The full exact passive BOM belongs to the integrated project. An exact MPN does not imply inventory, assembly acceptance or measured performance.

## Construction and assembly acceptance

The current twelve-layer integration uses **JLC12161H1-1080B**: planned nominal 1.6 mm ordering thickness, **1.59 mm ±10%** listed finished thickness, six signal layers, four GND layers and two power layers. Outer copper is 35 µm; L6/L7 power copper is 30 µm; the other eight inner layers are 15.2 µm. The [physical stackup](Physical_Stackup_Proposal.md) gives the exact construction and qualification limits. ENIG and conventional through-vias are proposed; no microvias, filled via-in-pad process or controlled-impedance guarantee is assumed. The [independent construction review](Twelve_Layer_Stackup_Review.md) records the arithmetic and reference-plane geometry; the final hash-bound [physical application](Physical_Stackup_Application.json) records actual CAD application. Neither replaces final routing/native checks.

The earlier **JLC08161H-3313 eight-layer / 1.57 mm** proposal is historical and must not be used to fabricate the twelve-layer PCB. Generic published Dk values support only pure 1080/core nominal metadata; mixed 1080/2313 effective Dk and all loss tangents remain unqualified.

J4 requires **four finished plated slots, 0.65 ±0.05 × 1.70 ±0.05 mm**. The fabricator's standard slot tolerance does not guarantee these limits. Obtain explicit acceptance of both finished dimensions before release. The **0.40 mm edge-clearance rule is confined to J4's four SH shell pads**; other copper retains the general 0.50 mm rule. Keep the connector edge routed and retain hole/short/keepout checks. The [fabrication notes](Fabrication_Notes.md) explain the Molex datum, nominal 0.425 mm clearance, outline tolerance and assembly requirements.

J4's **0.55 ±0.15 mm** shell tabs remain recessed inside the **1.431–1.749 mm** board. This is not a demonstrated fit mismatch, but the assembler must accept soldering, inspection and retention of these short tabs; a bottom projecting-tail fillet is not available. Molex's 0.8 mm signal-model board is not an assembly thickness recommendation. Samtec's **0.95 mm REF** alignment pegs and **Ø1.02 mm NPTH** holes pass an intermediate geometric screen without backside component overlap; REF dimensions and final placement still limit that screen. See the [connector thickness review](Connector_Thickness_And_Peg_Review.md).

The assembler must review maximum component-body clearances, two-sided 0402 placement, the BGA, regulator packages and mezzanine connectors together. A small courtyard gap alone is not proof of manufacturability. BGA X-ray inspection, connector mating height and stencil/panel choices remain process requirements.

## Electrical evidence and limits

**Power:** the [12 mΩ R9 review](Core_DC_Drop_Review.md) includes resistor tolerance, temperature and estimated copper/via/return loss. That earlier calculation used eight-layer intermediate geometry. The new 30 µm power layers change plane spreading resistance, so its numerical margin must not be carried over as a final-board result. The 12 mΩ selection improves headroom; it does not establish a 3 A core load rating or replace load-step and startup testing. R122 remains 15 mΩ. R12 is removed by the approved minimum-parts change because its two final power-good outputs have no consumer; both PG pins are explicitly unused, while upstream rail sequencing is retained.

**Bypasses:** the [0402 audit](Murata_0402_Qualification.md) preserves AMD's nominal 34-part 470 nF rail distribution and verifies Murata-compatible lands: 0.45 × 0.55 mm at centers ±0.425 mm. Smaller package size is allowed by AMD's guidance. DC-bias effective capacitance and the assembled broadband PDN have not been qualified; nominal capacitance is not a guaranteed operating value. No sourced incompatibility currently warrants rejecting these selected parts. Bulk and converter capacitors are separate qualifications.

**Fixed boot mode:** R113 is removed and U1.P11/M2 is directly grounded, like M1/P13; M0/P12 retains its 1 kΩ pull-up. Fixed Master SPI mode 001 and normal JTAG access remain. Alternate isolated-JTAG mode requires a copper modification. See the [source review](R113_Direct_Ground_Review.md).

**Core bulk:** C20 is **ETPE330M9GB**, 330 µF / 2.5 V, 3.5 × 2.8 mm nominal body. ESR is 9 mΩ maximum at **300 kHz and 20°C**; the category rating is 105°C. The manufacturer's model indicates about 1.2 nH ESL, so compliance with AMD's ≤1 nH 330 µF example class is not demonstrated. R9 still exceeds TI's minimum 10 mΩ distributed-load isolation resistance. Mounted PDN, effective capacitance, temperature/ripple and load transients remain unqualified. See the [part review](C20_Compact_Bulk_Review.md).

**ASIC contacts:** the historical 117-contact allocation means **116 FPGA digital connections plus the J5.46 analog AC_IN reservation**. AC_IN requires an external 0–1.5 V source where needed; it must not connect to FPGA GPIO. IMP_TST is provisionally digital 0/1.5 V. J5.34, J6.37, J6.59 and the future J4 link contacts remain reserved, not falsely declared completed functions. The final native checks must establish ground-blade plane continuity; that is not an assembled return-impedance measurement. ASIC4_DATA1 uses J6.60 and ASIC8_DATA4 uses J6.58; their FPGA balls are unchanged. Use the current hash-matched assignment CSV for every contact. The carrier's mating/contact map and supply arrangement remain essential.

**Firmware:** [Verification.json](https://howardwhsrun.github.io/FPGA_4K/firmware/artix7/2026-09-26/raw_capture/Verification.json) records successful four-capture synthetic tests at 16 and 4,096 ten-bit words per ASIC, including 131,072 checked words at full depth. XC7 synthesis reports 24 RAMB18E1 and nine BUFG resources. These results support the finite raw-capture engine, not clock placement, timing closure, metastability performance, JTAG transport or an acquisition bitstream. The independent [RTL review](Capture_RTL_Review.md) found no demonstrated functional defect within its stated synchronous-control contract.

## What is still needed

The [power/bring-up ownership page](../bringup/Power_Status_And_Owners.md) assigns the remaining tasks: integrated native checks and PDN work to PCB design; mating/ASIC power/analog-source details to the carrier designer; startup/timing/Vivado/JTAG integration to Jiaao and the FPGA developer; ASIC limits and waveforms to Gerald; and measured startup/capture to the lab team. Finite JTAG readout is the proposed first bench path. The full XEM8310 link needs its own endpoint, protocol, pin/cable mapping and implementation afterward.

**No order has been placed or supplier submission made. No board bitstream has been produced, and no assembled board or ASIC was electrically operated for this review.**

Final independent checks: [power and every physical ground land](power_review/Final_Power_Review.md) · [pins and geometry](Final_Geometry_Pin_Audit.json) · [reviewed copper delta](Final_Copper_Delta_Review.md).

Current schematic changes: [R113 removal](R113_Removal_Applied.json) · [two contact reassignments](Contact_Reassignment_Applied.json) · [SPI x1 application](SPIx1_Removal_Applied.json). [Boot requirements and constraints](SPIx1_Boot_Review.md).
