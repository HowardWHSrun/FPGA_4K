# Carrier_V1 — Alternative Approach B update

26 October 2026. This is the current four-layer XEM8305/LDO carrier review, replacing the V42 view in the alternative-approach overview. Earlier dated revisions remain available in the repository.

**All 80 fitted component bodies are verified in the local native 3D assembly.** The saved CAD has 92 footprints: 80 component bodies, eight bare test pads and four mounting holes. Native DRC, unconnected-item and schematic/PCB parity checks each report zero findings under the retained rules and ignored categories. Verification covers CAD model presence, resolution and registration; powered operation, thermal performance, mechanical tolerances and fabrication remain unqualified.

- [Interactive carrier overview](../../../../../presentation/overview/carrier-v1/)
- [Model-free editable KiCad review ZIP](files/Carrier_V1_2026-10-26_Review.zip)
- [One-page schematic](schematic.svg) and [PNG preview](schematic.png)
- [Front layout](layout-front.svg) and [back layout](layout-back.svg)
- [Component inventory](components.csv) and [80-body model verification list](model-verification.csv)
- [Verification scope and results](verification.json)
- [Source and public-file hashes](source-manifest.json)

The public ZIP preserves all non-model native PCB and footprint geometry, routing, nets, fields, zones and cached fills. Supplier 3D files, model-reference expressions and embedded supplier payloads are omitted. The interactive viewer uses independently authored nominal geometry; static images show the verified local native assembly. The model-free download does not display component bodies in KiCad by itself.

The inventory records 52 explicit manufacturer-part-number fields and 74 datasheet links. The 80/80 statement concerns component-body models; it is not a claim that every purchasing part has completed qualification.
