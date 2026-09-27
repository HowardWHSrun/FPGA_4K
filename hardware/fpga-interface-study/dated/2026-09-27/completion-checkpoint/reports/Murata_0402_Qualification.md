# Smaller local bypass capacitors: independent source check

26 September 2026. Candidate geometry/rating review, **not PDN qualification**. Exact placements and reference list belong to the power-routing candidate; this review does not alter the canonical project.

| Candidate | Nominal value | Rating | Body |
|---|---|---|---|
| GRT155R71A474KE01D | 470 nF ±10% | 10 V, X7R | 1.0 ±0.05 × 0.5 ±0.05 × 0.5 ±0.05 mm |
| GRT155R71C104KE01D | 100 nF ±10% | 16 V, X7R | Same |

Sources: [470 nF Murata reference sheet, revision 01A](https://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRT155R71A474KE01-01A.pdf), nominal ratings page2 and reflow lands page27; [100 nF Murata reference sheet](https://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRT155R71C104KE01-01.pdf), ratings page1 and reflow lands page26. The 100 nF source is an older manufacturer sheet; current [Murata product information](https://www.murata.com/products/productdetail?partno=GRT155R71C104KE01%23) confirms these nominal dimensions/ratings. The D suffix is packaging, not a different dielectric/body.

## Manufacturer-compatible candidate footprint

Both sheets' GRT15, 1.0 × 0.5 mm, within ±0.10 mm row gives the following reflow land ranges. Choose the same geometry for both parts:

| Dimension | Murata range | Candidate |
|---|---:|---:|
| Inner land gap a | 0.30–0.50 mm | 0.40 mm |
| Each land length b | 0.35–0.45 mm | 0.45 mm |
| Land width c | 0.40–0.60 mm | 0.55 mm |
| Pad centers | Derived | x = ±0.425 mm, y = 0 |
| Overall copper length | Derived | 1.30 mm |

This reduces pad extent compared with the generic KiCad 0402 trial's 0.56 × 0.62 mm pads. It does not justify shrinking the assembly courtyard below maximum component/pad tolerance. Recheck pad numbering, solder mask, paste, copper balance and all nearby through-vias after replacement. Murata explicitly asks the actual PCB/assembly process to be evaluated; the tabulated lands are a design starting point.

## 35-part replacement audit

The [replacement manifest](0402_Replacement_Manifest.json) and resolved component manifest agree on all 35 parts and both pins. The [per-reference audit](evidence/0402_Decoupler_Audit.csv) records the actual supply net; [machine-readable results](evidence/0402_Decoupler_Audit.json) preserve the input hash. These are candidate schematic/manifest checks, not a claim that all physical routes are closed.

| Function | Supply | 470 nF replacements | Count |
|---|---|---|---:|
| Core | 1.0 V | C28–C35 | 8 |
| Block RAM | 1.0 V | C36–C37 | 2 |
| Auxiliary | 1.8 V | C43–C46 | 4 |
| Bank 14 | 1.8 V | C53–C56 | 4 |
| Bank 16 | 2.5 V | C59–C62 | 4 |
| Bank 15 | 1.5 V | C66–C69 | 4 |
| Bank 34 | 1.5 V | C72–C75 | 4 |
| Bank 35 | 1.5 V | C78–C81 | 4 |

C90 is the separate 100 nF auxiliary/XADC bypass. C91 remains 1 µF in 0603. Converter input/output capacitors, 4.7 µF devices and bulk capacitors are unchanged. Do not apply the 0402 substitution to those parts by association.

**AMD comparison:** [UG483 v1.14](https://docs.amd.com/v/u/en-US/ug483_7Series_PCB), Table 2-2, CSG324/XC7A100T row, matches the 34-capacitor nominal distribution above. Table 2-5 explicitly permits smaller bodies and higher voltage ratings. Its 0.47 µF class lists ESL ≤0.5 nH and ESR between 1 and 20 mΩ. Departing from the ESR range needs impedance/resonance analysis. The table lists a capacitance selection range above 0.47 µF; it does not supply a guaranteed worst-case effective-capacitance value for this Murata replacement. Quantities alone do not qualify substitutions. The guide's supply-noise criterion refers to the device data-sheet rail limits. Its decoupling coverage extends down to about 100 kHz; regulator behavior also matters below that range.

The 0402 package is therefore not a reason to reject the candidate. In this design it makes room for BGA escape vias without deleting bypass functions. Smaller nominal body size also does not prove the required ESR, ESL or assembled loop impedance.

## DC-bias result and decision

The primary sheets establish ratings and warn that capacitance decreases with DC bias, changes with AC test level and temperature, and ages. They do **not** provide guaranteed effective capacitance at 1.0, 1.5, 1.8 or 2.5 V. No numeric remaining-capacitance values at those voltages have been verified in this review. Do not count all 470 nF or100 nF as effective operating capacitance merely because rail voltage is below rated voltage.

A [manufacturer-authored 2020 product-search sheet mirrored by Farnell](https://www.farnell.com/datasheets/3158809.pdf) includes typical characteristic graphs, but the figures could not be independently rendered here: the public PDF download timed out. No numeric readings from those graphs are claimed. The current [Murata reference sheet](https://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRT155R71A474KE01-01A.pdf) is dated 18 April 2026 and specifies capacitance measurement at 25°C, 1 kHz and 1 Vrms. That test amplitude is much larger than normal rail ripple. Its dissipation-factor limit at 1 kHz cannot establish the required MHz ESR.

The current [SimSurfing site](https://ds.murata.com/simsurfing/mlcc.html?lcid=en-us) presents a software-license acceptance step before curve access. That agreement was not accepted. Public nominal information was readable, but no current bias curve/model was exported. This is an optional research-path limitation, not evidence of an unsuitable component and not a reason to suspend independent routing work.

For acceptance, obtain the selected part's small-signal capacitance and impedance at 1.0, 1.5, 1.8 and 2.5 V, then include temperature, tolerance, aging, plane/via parasitics and the actual load transient. Record either a supplier-backed minimum effective C or a conservatively supported model; a typical curve alone is not that minimum. The necessary effective C follows from the load and allowed rail excursion, with ESR/inductive excursions included. The simple check C ≥ ΔI·Δt/ΔV is only a charge-storage bound, not a broadband PDN result. A rail can have enough summed capacitance and still fail at an anti-resonance.

**Decision:** retain all 35 parts as the routing candidate. No measured or sourced incompatibility currently justifies a particular part swap. Do not mark their electrical equivalence or whole-board PDN as passed. If the assembled/modelled impedance or droop fails, first compare a same-footprint part with demonstrably better effective C/ESR and recheck resonances; increasing nominal capacitance without that evidence is not a qualified fix.

Keep regulator bulk/output capacitors unchanged until their stability/effective-capacitance requirements are separately checked. The retained C21 100 µF part already carries an NRND lifecycle note in the power manifest; that procurement issue is separate from this 35-part electrical substitution.
