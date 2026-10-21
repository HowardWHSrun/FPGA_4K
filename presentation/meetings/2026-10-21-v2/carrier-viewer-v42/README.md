# Carrier V42 assembly and native routing viewer

Current V42 native routing and newly exported component geometry, with D601 on the underside at X141/Y55 mm. V41 files and viewer remain preserved.

Drag **Illustration spacing** from 0–35 mm to separate the XEM8305 and LDO reference boards above and below the carrier. 0 mm returns to inherited nominal seating; the added distance is an illustration, not a connector mating dimension. Rotate by dragging, pan with right-drag, and zoom by scrolling. Show/hide each board and use Isometric, Top, Underside or Side presets.

Layout renders the exact hash-checked public V42 native KiCad file with pinned KiCanvas: 742 segments, 313 vias, 651 pad records, 21 zones, six copper layers and 89 footprint records, including 82 fitted parts. Public PCB model omissions do not change electrical geometry. The small native/board.json is identity/configuration only.

The GLB is a fresh KiCad export of V42 with only component-model nodes appended in a separate visual copy. All 82 component bodies match native positions and sides. Stock/nominal/generic bodies are identified in assets/Model_Provenance.json and licensing is retained. The native exporter reports the same copper-wire self-interference warning as V41; use Layout/native CAD for exact copper inspection. Simplified XEM/LDO attachment envelopes and nominal seating do not establish populated mechanical fit or fabrication readiness.

## Single-ASIC PCB and 512-channel probe illustration

The assembly also shows the saved one-ASIC PCB at the LDO J2 interface and a continuous schematic probe extension, labeled **512-channel probe · schematic**. ASIC PCB and Probe visibility switches default on. Seat stack, Separate stack, rotation and Fit include the whole chain.

The board-only native export comes from the single-ASIC reference in the historical `Board-1024.zip`. Its one ASIC belongs to the reference family recorded as 512 recording / 128 stimulation, and Howard specified a 512-channel probe for this LDO. Connector/die previews and the probe extension are independently authored nominal geometry. There is no saved probe CAD, electrode layout or qualified installed die model.

The 50-contact source comparison aligns 49/50 net names after plan rotation; optional DISC_OUT faces NC. The 0.035 mm row offset and nominal 2 mm display mating height do not establish populated fit or electrical qualification. [Source and registration](assets/ASIC_Probe_Assembly_V1.json).
