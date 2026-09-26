# Global power routing for the 33 × 36 mm board

26 September 2026. Recommendations only: the parent owns the integrated copper, ground planes and the 130-part rail revision. Coordinates below come from the unchanged 128-part placement; C92/R122 positions must be read from the new integrated board. No root files were modified by this review.

## Route allocation from actual positions

| Net / source | Placement evidence | Routing recommendation |
|---|---|---|
| Input `LINK_12V` | J4.19 (26.425,7.300), C1.1 (31.100,10.825), C2.1 (29.955,15.480) | Escape the fine connector land briefly, expand promptly, and provide a low-resistance input trunk to C1 and the local converter input capacitors. J4 keepout and signal escape may require an immediate inner-layer transition; validate its position on both faces before use. Do not count the shell as an independent full-current return. |
| Four input branches | C3.1 (5.980,25.530); C7.1 (3.650,33.685); C11.1 (3.650,22.435); C15.1 (7.055,12.100) | Bring distribution into each capacitor's positive node so the already-routed capacitor-to-IC hot loop stays local. A candidate inner routing corridor is the strip between left converter groups and the FPGA, around x10–12 mm, with separate short branches. This is a corridor to investigate, not a clearance-checked final path. Avoid routing a 12 V trunk through the core power island. |
| Post-R9 `VCCINT_1V0` | R9.2 (7.3425,14.630); 16 core/BRAM balls span x18.0–21.2, y15.7–21.3 | Reserve broad copper from R9 into the central FPGA region and a central plane region feeding each ball escape. Keep the pre-R9 and post-R9 fills separate. Stitch both bulk C20.1 (10.58,32.15) and C21.1 (24.85,6.325) into this downstream rail without daisy-chaining the small capacitors through long tracks. |
| AUX/configuration after R122 | U3 local output pickup C9.1 (8.625,25.535); AUX balls include x22.0, y15.7–20.5; configuration/bank14 loads are mainly on the right/lower FPGA side | Keep C9/VOS/FB on `VAUX_REG_1V803`; route a short broad connection to R122 input, then distribute `VCCAUX_1V8` from its output. Verify the new bank14 bulk C92 and all flash/oscillator/pull-up loads are downstream. |
| `VCC_LINK_2V5` | U4 output C13.1 (8.625,14.285); bank16 power ball B10 (20.4,12.5) | Route to a separate bank16 island and its C57–C63 decouplers. Do not simply pour over the former 3.3 V net: configuration/flash/oscillator are now on AUX. |
| `VCC_ASIC_1V5` | U5 output C17.1 (2.080,3.950); the 18 bank supply balls form much of the FPGA's outer region | Consider an outer power region around the core and AUX islands, or a separate inner-layer region. The final copper must reach every supply ball and nearby bypass capacitor; a single skinny perimeter trace is insufficient evidence. |

Retain continuous ground references on the chosen ground layers. A power island must not create an unreferenced high-speed signal segment. Keep local SW nodes out of global distribution pours. These are routing decisions inferred from the saved geometry; the final filled regions and every narrowing must be checked after all signal routes are present.

## Width is a voltage-drop budget, not a fixed number

Illustrative calculation: copper resistivity 1.724×10⁻⁸ Ω·m at 20°C, uniform **35 µm** copper, `R = ρL/(wt)`. The actual fabricator stackup, plating and operating temperature are not selected here. Via/return resistance, pads, spreading resistance, thermal rise and transient droop are excluded.

| Illustrative piece | Length × width | Resistance | Drop at stated current |
|---|---:|---:|---:|
| Existing C5-positive to R9.1 local path | 3.594 × 1.20 mm | 1.475 mΩ | 4.43 mV at 3 A |
| Long narrow core feed | 13 × 1 mm | 6.403 mΩ | 19.21 mV at 3 A |
| Broad core feed example | 13 × 4 mm | 1.601 mΩ | 4.80 mV at 3 A |
| Input trunk example | 25 × 1 mm | 12.314 mΩ | 7.39 mV at 0.60 A |

The project's conservative static core envelope left only about 16 mV above 0.95 V before copper and transients. Consequently, the 13 × 1 mm example fails that **illustrative static budget** even before return and vias; it is not a viable default core feed. A 4 mm region improves the arithmetic but is still not a signoff. Broaden the pre-R9 path where possible and use multiple transition vias, then calculate the resistance of the actual joined copper and return. The input trunk's smaller relative voltage drop does not certify heating or connector capability.

For other rails, determine allowable copper drop from the minimum regulated voltage, series-isolation drop, required FPGA/flash/oscillator supply minimum, peak current and transient reserve. The core feed warrants first priority because its absolute margin is tightest. Do not select a global power-track width using only the converter's advertised current capability.

## Primary-source check and stability interpretation

Directly rechecked TI SLVSBH3B (April 2017), not only prior project notes:

- §10.3.2, pp32–33: VOS needs AC ripple; large low-ESR distributed loads use at least 10 mΩ isolation.
- §12.1, p36: short local current loops; VOS at Cout; quiet FB/SS; supply straps at Cin.
- §7.5, p5: PG rising threshold spans 93–98% of the regulated output.
- §9.3.2, p9: PG-low behavior requires VIN to remain present.
- §9.4.7, p12: discharge needs prior enable and approximately 2 V VIN; hiccup does not activate it.
- §10.3.4, pp34–35: ground noise can shorten soft-start above approximately 1 A startup load.

[TI TPS62135 data sheet](https://www.ti.com/lit/ds/symlink/tps62135.pdf).

**Design inference:** R9/R122 deliberately separate the local regulator/Cout/sense node from the distributed capacitors. Place each resistor so every distributed load lies downstream, while the upstream connection remains short/broad. Moving the resistor nearer the FPGA may lengthen that unsensed upstream connection; moving it nearer Cout may lengthen the downstream feed. Neither placement removes total unsensed copper loss. Kelvin-style voltage pickup remains at the local capacitor, not after the isolation resistor. Do not rely on an uncontrolled narrow trace to provide the required isolation resistance.

The explicit resistors make the intended separation reviewable, but they do not prove stability of this component mix or geometry. The core network includes polymer and ceramic bulk, parasitic ESR/ESL and distributed planes. The AUX/configuration network adds multiple kinds of load and two power-up domains. Mounted impedance, converter-loop behavior, load-step droop/ringing, startup and thermal behavior remain unresolved; native DRC cannot establish them.

## Sequencing and reset constraints still open

AMD DS181 v1.27.1 (3 July 2024), p8 recommends core/BRAM → AUX → VCCO and reverse power-off order. Equal-voltage core/BRAM or AUX/VCCO may share and ramp together. Table7, p9 specifies 0.2–50 ms rail ramps. [AMD DS181](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content).

The existing net chain is U2 PG → U3 EN and U3 PG → U4/U5 EN. It is appropriate as a cold-start topology to evaluate, but the PG comparators see the local upstream regulator nodes. **PG assertion does not by itself prove that every downstream FPGA ball has entered its full operating range.** Isolation/copper drop and ramp current must be included. Likewise, the chain does not implement guaranteed reverse order after hard cable removal; independently different bulk capacitance and loads determine rail decay.

Check cold start, slow input ramp, brownout, abrupt power removal and quick re-plug with the real cable/current limit. Verify rail ramps at the FPGA, configuration/reset timing, oscillator/flash readiness and the absence of power through JTAG/ASIC pins while target rails are down. The actual configured load is needed before the 3 A core and other provisional current ceilings can be treated as adequate.

AMD UG483 v1.14, p24 and pp29–30 directs attention to mounting/current-path inductance, nearby capacitor vias, and power/ground plane geometry. This supports adjacent supply/return transitions and continuous references rather than long capacitor pigtails. [AMD UG483](https://docs.amd.com/api/khub/documents/6L8DUUei7ZCE78qwQafC3A/content).

The two source PDFs were also read locally from the retained manufacturer-document folder, and the TPS62135 PDF from `FPGA_100T_CSG324/reports/power_TI_TPS62135.pdf`. Recommendations above are separate from the verified 132-track local delta.
