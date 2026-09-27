# Independent power review — 27 September 2026

**Every audited physical power and ground pad is connected on the fully routed SPI x1 checkpoint. The mounted power network still requires qualification before its current limit or reliable hardware operation can be promised.**

Board SHA-256: `2975050c28c89fc96bf781cf082bffffc84189e6720ce05c4200d8552ac298fc`. The native board identity, source hashes and all counts are in [Final_Power_Review.json](Final_Power_Review.json). This review covers the saved 33 × 36 mm, twelve-layer board, not earlier eight-layer or partially routed drafts.

## Native checks

Native DRC has **zero unconnected items and zero error-severity violations**. Independent connected-component readback retains every physical pad UUID, including all repeated mezzanine ground blades and connector shield lands. No SMD land overlaps a through-via annulus. [Physical readback](Physical_Pad_Readback.json) · [Native DRC](Native_DRC.json).

| Network | Connected physical pads | Logical endpoint count |
|---|---:|---:|
| GND | 176 / 176 | 167 |
| VCCINT_1V0 | 35 / 35 | 35 |
| VCCAUX_1V8 | 49 / 49 | 49 |
| VCC_ASIC_1V5 | 41 / 41 | 41 |
| VCC_LINK_2V5 | 12 / 12 | 12 |
| LINK_12V | 22 / 22 | 22 |
| VAUX_REG_1V803 | 5 / 5 | 5 |

The difference between 176 physical ground lands and 167 logical endpoints comes from repeated connector land numbers. An earlier audit collapsed those repeated numbers; this audit supersedes its physical-overlap claim. The C20 ground via was moved by 0.2305 mm to clear the first J6.G land, preserving its two ground connections. C78 now has an explicit 2.319 mm return at 0.20–0.30 mm width, avoiding dependence on a fragile surface-pour neck.

## Saved component and stackup checks

- R9 = WSLP1206R0120FEA, 12 mΩ: **verified in saved PCB**.
- R122 = WSLP1206R0150FEA, 15 mΩ: **verified in saved PCB**.
- U1 = XC7A100T-1CSG324I: **verified in saved PCB**.
- Native In5/In6 copper thickness = 30 µm: **verified in saved PCB**.

The layer roles are S/G/S/S/G/P/P/G/S/S/G/S. Old In3/In4 power regions map to In5/In6; the original ground references map to In1/In10, with additional ground references on In4/In7. No signal track uses either power layer. This is a manufacturer-derived stackup selection, not manufacturer approval of this particular board.

All eleven saved dielectric thicknesses also match the manufacturer-observed stackup. Copper plus dielectric thickness sums to 1.5928 mm, before modeled mask layers; nominal board thickness is not an as-built guarantee. Unknown loss tangent and mixed-prepreg effective dielectric constant remain unqualified. [Native stackup readback](Native_Stackup_Readback.json).

## Mounted bypass limitations

The exact zones-removed trace audit finds **13 single-via groups shared by multiple capacitor lands**. These are actual shared mounting paths, not merely capacitors connected to the same plane. AMD UG483 recommends short, wide connections, small loop area and separate mounting vias for capacitor lands; it does not prescribe a universal 0.30 mm trace width. The layout therefore must not be advertised as demonstrated compliance with that mounting recommendation. [AMD UG483, printed pp. 24 and 29–30](https://docs.amd.com/api/khub/documents/6L8DUUei7ZCE78qwQafC3A/content) · [Exact groups](Mounting_Via_Groups.json).

| Capacitor lands | Network | Shared via, mm |
|---|---|---|
| C22.2, C78.2 | GND | 11.150, 18.325 |
| C30.2, C41.2 | GND | 20.000, 24.900 |
| C62.2, C81.2 | GND | 16.950, 10.675 |
| C102.1, C103.1 | VCCAUX_1V8 | 12.640, 8.850 |
| C43.1, C44.1, C45.1 | VCCAUX_1V8 | 23.200, 20.900 |
| C51.1, C53.1 | VCCAUX_1V8 | 26.400, 26.500 |
| C90.1, C91.1 | VCCAUX_1V8 | 20.800, 18.500 |
| C28.1, C32.1 | VCCINT_1V0 | 16.800, 21.700 |
| C29.1, C34.1 | VCCINT_1V0 | 18.400, 20.100 |
| C30.1, C35.1 | VCCINT_1V0 | 21.600, 21.700 |
| C31.1, C33.1 | VCCINT_1V0 | 17.600, 16.100 |
| C64.1, C69.1 | VCC_ASIC_1V5 | 29.780, 12.150 |
| C73.1, C74.1 | VCC_ASIC_1V5 | 15.200, 24.100 |

Prioritize C29/C34 and C31/C33 core mounting paths, then C43/C44/C45 AUX. The retained C34 and C61 additions contain approximately 2.471 and 1.610 mm of copper narrower than 0.25 mm. Short C31/C33/C44 necks are each about 0.55 mm. These are provisional geometry tradeoffs; low calculated DC resistance does not establish low transient impedance. C78 shares a ground mounting via with C22, which is explicitly included above.

All 89 refined branch segments retain their original UUID, net, layer, width and endpoints in this final PCB. [Retained neck geometry](Retained_Capacitor_Necks.json).

| Capacitor | Screened positive + ground surface path | Selected via separation |
|---|---:|---:|
| C20 | 3.314 mm | 1.451 mm |
| C29 | 3.104 mm | 2.53 mm |
| C31 | Ground path not resolved by sampler | — |
| C33 | 2.745 mm | 2.884 mm |
| C34 | 4.784 mm | 4.525 mm |
| C44 | 3.053 mm | 3.2 mm |
| C61 | 5.104 mm | 3.298 mm |
| C78 | 3.519 mm | 3.255 mm |

The surface-path sampler cannot resolve the ground-pour paths for C31, C40, C73, C75; **native connectivity confirms those pads are connected**. This is a limitation of the path model, not an electrical open. The screening excludes via depth and plane spreading, and a first via may only be a layer transition. C63's long remote-bulk feed must not be interpreted as local high-frequency bypass. [Mounting paths](Capacitor_Mounting_Paths.json).

The 0402 Murata substitutions preserve nominal capacitance and manufacturer-supported lands, but effective capacitance, ESR and mounted ESL still need actual bias/model validation. [Murata 470 nF reference sheet](https://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRT155R71A474KE01-01A.pdf). C20 is Panasonic ETPE330M9GB, 330 µF/2.5 V. Its 9 mΩ maximum is specified at 300 kHz; its model-derived ESL around 1.2 nH does not demonstrate AMD’s ≤1 nH bulk class. Neither package shrink nor nominal capacitance establishes equivalent PDN behavior. [Panasonic datasheet](https://industrial.panasonic.com/cdbs/www-data/pdf/AAA8000/AAA8000C36.pdf) · [Panasonic model archive](https://industrial.panasonic.com/content/data/CP/files/ETPE330M9GB.zip).

## Plane and DC-drop screening

The core source feeder is unchanged after normalizing layer roles. Routing and cleanup change the plane perforations. The following samples compare the pre-trunk eight-layer checkpoint with the present filled core plane over y = 13–25 mm.

| Section x | Earlier aggregate copper | Current aggregate copper |
|---|---:|---:|
| 8 mm | 11.550 mm | 10.825 mm |
| 10 mm | 12.025 mm | 11.350 mm |
| 12 mm | 7.525 mm | 8.450 mm |
| 20 mm | 7.200 mm | 7.925 mm |

These sums include separate intervals and **are not a connected minimum width or resistance bound**. Added ground planes improve available reference coverage, but continuity alone does not prove every signal transition has a low-inductance return.

Nominal 30 µm copper has 0.575 mΩ/square at 20°C, versus 1.134 mΩ/square for 15.2 µm copper. With the twelve-layer plane depth, the unchanged fixed source feeder screens at roughly **2.77–2.89 mΩ**, before R9, plane spreading, ball escapes and return. This assumes 20–25 µm barrel plating and nominal 35 µm outer copper; neither is a guaranteed as-built bound. Earlier 2 A/85°C or 3 A voltage margins must not be carried forward unchanged after routing. [Layer-normalized evidence](Plane_Role_Comparison.json).

The TPS62135 is a **4 A-rated converter IC**. The board’s 3 A core-load scenario remains unqualified. R9 = 12 mΩ retains TI’s distributed-capacitance isolation rationale and improves DC margin, but measured rail voltage at the FPGA, actual bitstream load, ripple, load steps and temperatures determine the operating envelope. [TI TPS62135, §§7.5 and 10.3.2](https://www.ti.com/lit/ds/symlink/tps62135.pdf).

## Source and fabrication boundaries

Use a controlled-rise, current-limited **custom 12 V adapter and custom cable**. Ordinary HDMI is invalid. The proposed source-side eFuse/damping is not populated on this PCB. The 0.60 A source/cable target and input overshoot still need qualification with the actual cable, load and connector temperature. Do not rely on live plugging an unspecified stiff source.

The smallest screened nominal drill-edge-to-pad-mask-opening gap is **0.121248 mm**, at C101.1 near via (24.100, 5.280) mm; C100/C101 have the same limiting geometry. Actual local pad mask overrides are included. This is a geometric measurement, not a universal manufacturing threshold: mask registration, expansion, tenting and assembly acceptance remain supplier/process checks. [Mask margin evidence](Via_Mask_Margins.json).

Before a functional hardware claim, complete the source/cable check, final mounted-PDN analysis or corrective layout, FPGA-voltage startup/load-step tests, and actual firmware/ASIC capture and receiver-link validation. No hardware was ordered or tested by this review.
