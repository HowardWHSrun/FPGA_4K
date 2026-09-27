# C20 compact bulk-capacitor qualification

26 September 2026 · qualification review retained with the integrated selection; see [integration evidence](C20_Compact_Bulk_Application.json). Electrical equivalence remains unqualified.

**Use Panasonic ETPE330M9GB as the compact C20 candidate, subject to final placement and the existing power-integrity/thermal qualification.** It preserves 330 µF while reducing nominal body area from 7.3 × 4.3 mm to 3.5 × 2.8 mm, approximately 69% less. The full mounting pattern is larger than the body: two manufacturer-specified lands span 4.6 × 2.7 mm. No board enlargement or extra component is required by this candidate.

The initially suggested **ETLE330MCGB is discontinued**: Panasonic lists April 2024 EOL and recommends **ETPE330M9GB**. The older part's 125°C / 2,000-hour specification must not be copied into the replacement's BOM. [Panasonic EOL model page](https://industrial.panasonic.com/jp/eol/pt/poscap/models/ETLE330MCGB), [current replacement page](https://industrial.panasonic.com/ww/products/pt/poscap/models/ETPE330M9GB).

## Electrical comparison and limits

| Attribute | Candidate ETPE330M9GB |
|---|---|
| Type / capacitance | Polarized tantalum polymer POSCAP; 330 µF ±20%, specified at 120 Hz / 20°C |
| Rated / category voltage | 2.5 V at 105°C; the approximately 1.0 V core uses roughly 40% of this voltage |
| Category temperature | −55 to +105°C; this does not establish system ambient operation at 105°C |
| Endurance | 1,000 h at 105°C, rated voltage applied; not a service-life prediction |
| ESR limit | **9 mΩ maximum at 300 kHz / 20°C**; the row-specific frequency overrides the table's generic 100 kHz footnote |
| Ripple rating | **3.2 Arms at 100 kHz / 45°C**; not a rating at every temperature |
| Leakage | 165 µA maximum after five minutes |
| Dissipation factor | 0.08 maximum, 120 Hz / 20°C |
| Package | B2, 3.5 ±0.2 × 2.8 ±0.2 × 1.9 ±0.1 mm |

These exact limits come from the [TPE B-size datasheet, pages 1–2](https://industrial.panasonic.com/cdbs/www-data/pdf/AAA8000/AAA8000C36.pdf), dated 24 April 2026. The specific ETPE330M9GB row is not marked “not recommended for new design”; that page also contains other rows that are.

The manufacturer's [characteristic tool](https://util01.industrial.panasonic.com/ea/utilities/ds/chr-vw/iframe/ETPE330M9GB) provides model-derived ESR of approximately **9.5 mΩ near 100 kHz** and **8.0 mΩ near 300 kHz**. Its downloadable [SPICE model](https://industrial.panasonic.com/content/data/CP/files/ETPE330M9GB.zip) states **20°C and zero DC bias**. These support engineering modeling, **not a guaranteed 100 kHz maximum or performance at operating bias/cold temperature**. The tool supplies no capacitance-versus-temperature or ESR-versus-temperature data for this exact part. [Archived numerical screen](evidence/Panasonic_ETPE330M9GB_Characteristic_Screen.json).

No numerical ambient-temperature ripple derating table was obtained. Panasonic requires current to remain within the allowed ripple rating and the capacitor's top-surface temperature to remain below its rated temperature. Therefore the final design must evaluate actual capacitor ripple and temperature; it must not carry “3.2 A at 85°C” into a specification. The −55°C category limit is not an ESR guarantee at −55°C. These are existing PDN/thermal qualification limits, not evidence that this part must be rejected. [Panasonic application precautions](https://industrial.panasonic.com/cdbs/www-data/pdf/AAA8000/AAA8000COL27.pdf).

## AMD substitution boundary

[AMD UG483 Table 2-5 and PCB Bulk Capacitors](https://docs.amd.com/api/khub/documents/6L8DUUei7ZCE78qwQafC3A/content) specify the 330 µF tantalum class with **5 < ESR < 40 mΩ**, **ESL ≤1 nH** and 2.5 V rating; smaller bodies are permitted. The candidate model ESR fits that band, but a 9 mΩ maximum specification alone does not guarantee the 5 mΩ minimum. Its model-derived ESL is approximately **1.11 nH at 1.02 MHz** and **1.20 nH at 2.02 MHz**, so it must **not** be labeled a demonstrated match to the ≤1 nH class. These frequency-dependent model readings are not a guaranteed constant package ESL, but they are a concrete reason to retain the qualification gate.

The guide requires alternate bulk parts to be evaluated by simulation, extracted parasitics or bench work, and allows ESR-range changes only with impedance/resonance analysis. The isolated candidate may be used for the routing study, but claiming exact AMD decoupling equivalence requires the integrated PDN evaluation, including mount inductance. Reduced body area and preserved nominal capacitance do not settle that comparison. This qualification boundary is separate from the TI regulator-isolation check below.

## Exact footprint and polarity

The [Panasonic mounting specification](https://industrial.panasonic.com/cdbs/www-data/pdf/AAA8000/ast-ind-139507.pdf), 24 April 2026, gives B2 pattern **a=1.6, b=2.7, c=1.4 mm**, where a is each land's length, b its width and c the inner gap.

- Two rectangular copper pads: **1.6 × 2.7 mm**, centers **(−1.5,0)** and **(+1.5,0)**; inner gap **1.4 mm**.
- **Pad 1 is positive**, mapped to `VCCINT_1V0`; pad 2 is negative, mapped to `GND`. The body polarity mark identifies **positive**, as shown in the manufacturer marking diagram. Preserve the net mapping when flipping the footprint onto the back face.
- Maximum body envelope: **3.7 × 3.0 × 2.0 mm**. Candidate courtyard **5.1 × 3.5 mm** uses the larger of pad/body extents plus 0.25 mm each edge; that is an engineering clearance, not a manufacturer spacing guarantee.
- Reflow: the TPE profile permits at most two reflow cycles, within the specified temperature/time profile. The exact row specifies floor-life level 3 for ≤250°C and ≤260°C profiles. Do not silently use the three-cycle profile belonging to other series. Stencil/process approval remains part of the mixed assembly review.

The isolated [candidate footprint](../libraries/CoreSupport.pretty/Panasonic_POSCAP_B2_Recommended.kicad_mod) was loaded by native KiCad and its two pad centers/sizes checked. [Readback](evidence/C20_Footprint_Readback.json). It has no invented 3D model. The [property delta](C20_Compact_Bulk_Property_Delta.json) includes exact before/after C20 properties and unchanged pin/net requirements. Integration must update schematic, BOM/manifest, board instance, footprint library and any geometry report together, then reroute/refill/check; it is not a same-footprint substitution.

## Why lower ESR does not remove R9 or invalidate the topology

C20 remains on the **FPGA side of R9**, separate from the converter's local C5 and upstream VOS/FB sensing. [TPS62135 §10.3.2](https://www.ti.com/lit/ds/symlink/tps62135.pdf) permits large distributed capacitance with at least **10 mΩ total series trace resistance**. The selected R9 = **WSLP1206R0120FEA, 12 mΩ ±1%** has a reviewed minimum of approximately **11.764 mΩ** with tolerance/temperature allowance, before positive trace resistance. This isolation exists independently of C20's ESR; replacing a 25 mΩ bulk capacitor with this lower-ESR part does not eliminate it. Keep R9, local C5 and sensing topology unchanged. [R9/DC review](Core_DC_Drop_Review.md).

This is a defensible candidate selection, **not proof of transient stability**. Updated layout/model/load-step checks must examine converter ripple, startup, PDN ringing, load transients and capacitor heating. Neither a 3 A core-load rating nor cold-start success follows from nominal capacitance or ESR alone.

## Source archive

- [TPE datasheet](evidence/Panasonic_TPE_AAA8000C36.pdf), SHA-256 `1511fbc08146cc852fa6a9b1158340d4e48a895b12fed57c19bb58fc87cd7173`.
- [Manufacturer land pattern/reflow sheet](evidence/Panasonic_POSCAP_Mounting_2026.pdf), SHA-256 `9e702f03e833f50ca84d672af655f115ddbdf9b6f19716980069ff35a7a72789`.
- [Manufacturer model archive](evidence/Panasonic_ETPE330M9GB_Model.zip); all archived source hashes are in the property delta. The HTML characteristic page and extracted data are preserved separately.

No order, supplier contact, electrical test or active-project mutation was performed by this qualification task.
