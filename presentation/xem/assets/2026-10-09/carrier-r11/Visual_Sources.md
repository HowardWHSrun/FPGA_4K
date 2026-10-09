# Carrier R11 public 3D previews

These four native KiCad renders show the R11 carrier, with 75 component bodies across its two faces. MH1–MH4 and TP19–TP20 remain bare holes and copper pads.

- [Bottom, angled](Carrier_R11_Bottom_3D.png)
- [Top, angled](Carrier_R11_Top_3D.png)
- [Bottom, straight](Carrier_R11_Bottom.png)
- [Top, straight](Carrier_R11_Top.png)

For public display, J1/J19, MC1/MC2/MC3 and J4 use independently created generic socket/jack shapes. These six substitutes use simple geometric primitives and factual package dimensions; their cavities, contacts and styling are simplified. No Hirose, Samtec or Same Sky supplier STEP geometry, embedded payload, logos or supplier drawing images were used in the rendered model set. These are illustrative package representations, not exact mating or tolerance models.

Other bodies use KiCad package models and the documented R11 dimension-derived models. KiCad library assets retain their [CC BY-SA 4.0 license with the electronic-design/generated-file exception](https://www.kicad.org/libraries/license/). The project and renders receive no new blanket license through this note.

The public render copy preserves the native R11 footprint positions, pad nets, copper, outline and rules. The saved native R11 design remains unchanged, with PCB SHA-256 `e36b77df37f73f4b4baed6676943037ce2c1ec2c742145e32dd0cc0a5a4883e9`. Its private manufacturer model collection remains separate from these public images.

## Interactive routing and 3D

The routing SVG retains native millimetre coordinates, all six copper layers, saved track/pad/via geometry and filled-zone contours. Layer toggles change visibility only. Ground/power fills are hidden initially so the tracks remain readable. All layers use top-view coordinates. The optimized interactive GLB retains all 75 component groups, material definitions and native triangles; six connector/jack bodies use the same independently authored public primitives. See [interactive model provenance](Interactive_Model_Provenance.json) for mesh/source hashes and the native export warning. The native PCB remains unchanged.
