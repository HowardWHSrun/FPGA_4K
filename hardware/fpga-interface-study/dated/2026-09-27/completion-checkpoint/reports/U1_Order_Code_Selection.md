# U1 ordering-code selection — 26 September 2026

**Select `XC7A100T-1CSG324I`.** This resolves the previous speed/temperature placeholder while retaining the present 15 × 15 mm package and standard 1.0 V core assumption. This note does not modify the canonical CAD.

| Field | Selected meaning |
|---|---|
| XC7A100T | Artix-7 100T device |
| -1 | Standard speed grade; use this grade for timing implementation |
| CSG324 | 324-position, 15 × 15 mm, 0.8 mm pitch package; 210 user I/O, no bonded GTPs |
| I | Industrial junction-temperature grade, −40 to +100 °C |
| Nominal VCCINT/VCCBRAM | 1.0 V; do not substitute the distinct -L1 grade under this selection |

AMD [DS180 v2.6.1](https://docs.amd.com/v/u/en-US/ds180_7Series_Overview), Table 5 (page 3), Table 12 (page 15) and Figure 2 (page 16), establish the package, standard -1 industrial voltage/temperature combination and ordering syntax. AMD's newer [XMP100 v2.6](https://docs.amd.com/v/u/en-US/cost-optimized-product-selection-guide), Artix-7 table (page 7) and ordering diagram (page 13), independently retain these options. The exact code is assembled from these manufacturer tables; inventory was not checked.

[U1_Property_Delta.json](U1_Property_Delta.json) gives exact old/new values. Apply `Value`, `MPN` and the updated first clause of `Status` to every U1 schematic unit, its PCB instance and the authoritative component manifest. Keep the generic symbol identifier, footprint, pin map and all nets unchanged. Regenerate the BOM/reports from native CAD and verify one U1 with the same full order code everywhere. Historical reports need not be rewritten.

The Vivado implementation device remains `xc7a100tcsg324-1`; the purchased industrial temperature range also needs the appropriate timing operating conditions. This selection establishes neither timing closure nor a thermal solution. Retain the source-derived input constraints, power estimate and regulator/transient validation as release work.
