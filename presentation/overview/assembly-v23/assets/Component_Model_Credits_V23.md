# Component model sources and public preview scope

20 October 2026 · assembly V23

This viewer combines project PCB surfaces, saved component-library bodies and project-authored connector previews. It does not grant a new license to the upstream models or imply that every saved package is manufacturer-exact.

## Project-authored DF40 previews

The seven `df40-*-preview.glb` assets are independently generated for this project. They use simple authored open-slot housings, rails and rectangular contact legs. Contact pitch/rows and Fab extents come from the saved footprint geometry; body heights and contact bends are illustrative. No supplier STEP triangles or supplier mesh payload was used. The [builder](../model-builders/build-public-components.py) and [parameter/hash record](Connector_Preview_Provenance_V23.json) are included.

The previews identify the intended DF40 family/position count and retain the design's nominal placement. They are **not Hirose manufacturer CAD**, insertion/keying geometry, tolerance envelopes or proof of simultaneous mating. [Hirose DF40 catalog](https://www.hirose.com/en/product/document?clcode=&productname=&series=DF40&documenttype=Catalog&lang=en&documentid=en_DF40_CAT) and exact product pages remain the engineering references.

The downloaded Hirose STEP models remain outside this public package. The FPGA public GLB omits its two supplier-body nodes and removes their orphaned meshes, accessors, buffer views and binary payload; all other retained geometry is byte-preserved at accessor level. [Derivative receipt](FPGA_Public_Geometry_Receipt_V23.json). The live page supplies the independent previews at the native footprint centers.

This packaging follows the actual website constraint in [Hirose's Terms of Use, Article 1](https://www.hirose.com/corporate/en/terms/); anonymous download availability was not treated as a redistribution license. No logo or manufacturer product photograph is included in these preview assets.

## Saved component libraries and current interposer

Standard KiCad component-library data retains the [KiCad libraries license and electronic-design/generated-file exception](https://www.kicad.org/libraries/license/). The exact saved Molex micro-HDMI model has SHA-256 `f7b6f2e591a019fcac242d79fd51b1c3d86918a146933bd6b834496cc60e0625`, matching KiCad's `Connector_Video.3dshapes/HDMI_Micro-D_Molex_46765-1xxx.step`. It is a KiCad library model named for the component, not an uncredited new supplier download.

The current interposer V12's JX1/JX2/JX3 ERF6 models retain their source-header notice: **CADENAS — License CC BY-ND 4.0**. The source files name Samtec ERF6-50-03.5-L-DV-A-K-TR and ERF6-40-03.5-L-DV-A-K-TR, dated 24 May 2023. [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/). Their source component geometry is preserved through native export and material batching; this is a technical browser-format conversion, not a new proprietary connector design. The JB1/JB2/JB3 models derive from the retained Opal Kelly XEM8305 source assembly and keep that attribution. Source CAD and original archives remain local.

The interposer placement export does not invent missing package bodies. Its 27 assigned bodies and the 23 packaged-body omissions remain identified in the viewer. Nominal/drawing-derived project package models elsewhere retain that status. Ownership of the original native-board material remains with its original authors.

## Existing host and sheep sources

BRK8305 and XEM8305 meshes are reused from the already-published [assembly V8](../../assembly-v8/README.md). Their original author is **Opal Kelly**; source models are supplied for mechanical reference and integration on [Opal Kelly's 3D Models page](https://www.opalkelly.com/products/models/). No new ownership or unrestricted redistribution claim is made. The source omissions remain; a clean render does not fill missing headers or other bodies.

The stylized sheep exterior is from **Quaternius, Farm Animals Pack**, licensed **CC0 1.0**. [Author's pack page](https://quaternius.com/packs/farmanimal.html) · [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The exterior was cropped/adapted for the illustration. The skull/brain/access/support/probe context is project-authored schematic geometry, not registered anatomy.

Three.js, GLTFLoader, OrbitControls and BufferGeometryUtils are distributed under the Three.js MIT license. The pinned runtime version remains 0.160.1; upstream copyright/license notices accompany the runtime package.

No raw vendor STEP archives, local machine paths, private reviews, caches or native manufacturing release are included by this public mesh packaging.
