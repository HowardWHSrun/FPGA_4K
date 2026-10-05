# Current interactive reviews · R39 update, 5 October 2026

[35T FPGA R39](../fpga/current-35t.html) · [dated R37](../fpga/review-r37-2026-10-04.html) · [LDO adapter E5](../ldo-backup/current-e5.html) · [XEM8305 A1R2](../xem/current-a1r2.html) · [bonding fixture V6](../library/bonding-fixture.html) · [project Library](../library/).

These four previews support rotation, zoom, pan, top/bottom/side views and reset. The existing local Three.js, OrbitControls and GLTFLoader libraries are reused; no external browser service is required. The PNG fallback and library thumbnails belong to the same dated review set. Viewer geometry is centered and scaled for inspection at runtime.

R39 publishes fresh native PNG/SVG views, lightweight WebP previews, a headboard-only browser mesh and a [complete native KiCad project](../downloads/). Its public package includes ownership/model notices and excludes supplier reference collections, internal scripts/notes and private correspondence. Earlier dated browser assets remain unchanged. [provenance.json](provenance.json) records the actual included asset hashes, source revisions, transformations and omissions.

| Preview | Source and limitations |
|---|---|
| 35T R39 · current | Exact saved 41 × 41 mm headboard alone, with existing partial surface copper. All 315 placed package-model references are included from the same 34 known model assets as R37. The preview loads on request and stops drawing while idle/offscreen. Native 1.6 mm thickness remains a placeholder. No lower mating template, future routes, vias or planes are added; issued HDI construction, routing, timing and assembled qualification remain incomplete. |
| 35T R37 · preserved | XC7A35T-2CSG325I current 41 × 41 mm research placement, including the five capacitor placement changes. Headboard plus connector-only mating template, with routing hidden. The lower template is not a functional LDO board. Routing, ASIC timing, populated fit, retention and manufacturing acceptance remain open. Earlier paused R35 routing and September 29 25T placement retain separate counts and status. |
| LDO E5 | Native E5 export with the separate J4 locking JST GH power connector. J1/J19/J3 housing models and inner copper are omitted; their pad geometry remains. A local export meshing warning means surface copper graphics may be incomplete. Power stays off the signal flex, with J19 intentionally unconnected. Current requirement, analog return, cable/connector fit and powered operation remain unqualified. |
| XEM8305 A1R2 | Current carrier assembly with both physical J1/J19 mating pairs. Includes the dated E3 adapter, source LDO, nominal connector envelopes and provisional cable. The E5 adapter is a separate current review; XEM8310 protected-power schematic work is a separate project. The superseded E2 board and unknown protrusion geometry are omitted. Cable and connector fit remain provisional. |
| Bonding V6 | Exact one-piece frame mesh converted from the saved V6 STL to glTF Y-up metres. No PCB, ASIC, installed stage, seal or vacuum hardware is added. The PNG separately shows the loaded-board reference. Fit-check prototype only; vacuum sealing and bonding stability remain untested. |

## Credits

KiCad library model bodies follow the [existing KiCad library license and generated-files exception](../fpga/3d/assets/KiCad-LICENSE.md). E5 J4 uses the source model by **Frank Severinsen, © 2018**, under [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode) with the [KiCad electronic-design/generated-files exception](https://github.com/KiCad/kicad-packages3D/blob/master/LICENSE.md). It is a library geometry reference, not manufacturer fit acceptance.

The XEM8305 module visual derives from [Opal Kelly’s published 3D models](https://www.opalkelly.com/products/models/). Manufacturer geometry is retained for orientation and identified separately from the project’s carrier, adapter, cable and nominal mating envelopes. Three.js remains covered by its [included MIT license](../fpga/3d/vendor/LICENSE).
