# U6 smaller-package alternative — not adopted

27 September 2026. Renewed USB-C placement candidate; the earlier 26 September review is retained. Read-only component qualification; no CAD change, procurement or manufacturer contact.

**MX25U12835FZNI-10G is the same flash-family WSON alternative, but is not automatically easier to route.** The earlier routing study found connector escape vias in its exposed-pad exclusion area; the USB-C placement now warrants a new fit study. Keep the present SOIC unless a complete new placement clears this area and passes native checks.

## Electrical equivalence and package facts

The [Macronix PM1728 v1.9 datasheet](https://www.macronix.com/Lists/Datasheet/Attachments/8704/MX25U12835F,%201.8V,%20128Mb,%20v1.9.pdf) lists both the present MX25U12835FM2I-10G and proposed MX25U12835FZNI-10G on printed p90. Both are 128-Mbit, 104-MHz industrial −40…85 °C parts using 1.65–2.0 V. Only the package code changes. The SPI commands, power-up state, nonvolatile QE/configuration behavior and timing limits remain the same family contract; no working Artix boot image or programming flow is demonstrated by this substitution.

| Pad | Function retained |
|---|---|
| 1 | CS# |
| 2 | SO/SIO1 |
| 3 | WP#/SIO2 |
| 4 | GND |
| 5 | SI/SIO0 |
| 6 | SCLK |
| 7 | RESET#/SIO3 |
| 8 | VCC |

Printed pp7 and 93 give the mapping and outline: body 6.0×5.0 mm nominal, 6.1×5.1 mm maximum, height ≤0.8 mm, pitch 1.27 mm. The exposed metal is 3.4×4.0 mm nominal, 3.45×4.05 mm maximum. It may float or connect to device ground, never another net. The datasheet discourages vias/traces underneath.

## Land-pattern decision

[Macronix AN0159 v4, p4](https://www.macronix.com/Lists/ApplicationNote/Attachments/1997/AN0159V4-%20Recommended%20PCB%20Pad%20Layouts%20for%208-USON%20and%208-WSON%20Packages_2.pdf) shows nominal 0.60×0.40 mm outer lands on 1.27 mm pitch and recommends leaving the central metal unsoldered. Relative to the package centre, the two pad rows are X=±2.70 mm and Y=−1.905, −0.635, +0.635, +1.905 mm. Pads 1–4 progress down the left row; 8–5 down the right row, top view. These dimensions are the manufacturer's nominal pattern, not demonstrated assembly yield.

For a package-only experiment, a custom footprint with eight electrical pads, no central paste or solder land, and an explicit central surface-copper/track and through-via keepout can preserve all existing electrical endpoints. Size the keepout for the maximum exposed pad plus placement tolerance; a **3.65×4.25 mm** rectangle is a provisional 0.10 mm-per-side engineering margin, not a Macronix requirement. A **6.6×5.6 mm** rectangular courtyard preserves 0.25 mm beyond maximum body size; pad solder-mask and assembly clearances still require review. Internal buried copper is not an exposed underside short risk, but through-vias and the component-side surface are.

The installed KiCad `Package_SON:WSON-8-1EP_6x5mm_P1.27mm_EP3.4x4mm` has eight 0.775×0.50 mm lands centred at X=±2.6625 plus a ninth 3.4×4.0 mm soldered pad and four paste windows. It is an IPC-style alternative, **not the exact AN0159 pattern**. Do not use it unchanged with the existing eight-pin symbol: either remove the central electrical/paste pad for the floating implementation, or deliberately model and ground a ninth pad with matching schematic/manifest changes. A floating no-land implementation is the narrower change here.

## Adoption requirements

1. Routing owner proves the central keepout and surrounding pad/mask/courtyard geometry clear all placed parts and vias. This is presently uncertain, and the existing SOIC is still the active solution.
2. If adopted, root updates value/MPN/footprint consistently in U6 schematic, PCB and component manifest, regenerates XML/ERC/DRC and checks identical pads 1–8 net membership.
3. Keep the existing 1.8 V pull-ups, bypassing and CS/clock connections. Requalify boot timing and programming when the actual Artix configuration is implemented.

The accompanying [property delta](U6_WSON_Candidate_Delta.json) deliberately has `adopted: false`. A native eight-pad footprint is now supplied in [CoreSupport.pretty](CoreSupport.pretty/Macronix_WSON8_6x5_Floating_EP.kicad_mod), with oval nominal lands, no central copper/paste, and the stated footprint-local keepout. Placement, paste/aperture and manufacturing acceptance remain required. Source PDFs are locally retained under `evidence/`; public documentation should link the manufacturer's originals.

## Availability boundary

The [official family table](https://www.macronix.com/CachePages/zh-tw-Product-NORFlash-SerialFlash.aspx) lists MX25U12835F as Production, and [official software support](https://www.macronix.com/en-us/support/design-support/Pages/software-support.aspx) still names MX25U12835FZNI-10G. Neither proves exact-package inventory, lead time or a lifecycle commitment. Those are procurement checks for a later authorized order; no order or vendor contact was made.
