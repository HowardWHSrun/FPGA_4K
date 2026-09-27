# Native PCB 3D review · 27 September 2026

[Open the viewer](index.html) · [USB-C](index.html?board=usb-c) · [Preserved micro-HDMI](index.html?board=micro-hdmi) · [Source hashes and coverage](assets/provenance.json)

The native PCB exports show the current **33 × 36 mm** board, exterior pads, soldermask and silkscreen. Select a component to see its reference and value; rotate, zoom or choose Front / Back / Side. The main system's FPGA section displays this viewer; the original supplied assembly STL remains unchanged in the other sections.

| Revision | KiCad library component models | Simplified component bodies | Bare fixture |
|---|---:|---:|---:|
| USB-C development | 151 | 27 | 1 |
| Preserved micro-HDMI | 112 | 13 | 0 |

Simplified bodies use the exact saved footprint's fabrication-outline bounding box and placement. Their heights, BGA balls, connector interiors and material colors are presentation approximations. **They are not manufacturer mechanical models or clearance evidence.** The viewer identifies every simplified reference in Model details and lets you hide these bodies. Library models are the referenced KiCad library packages, not independently qualified manufacturer models.

KiCad reports self-intersecting surface shapes during export; some mask/silkscreen graphics may be omitted. Internal copper and tracks are intentionally excluded from this exterior model: use Interactive KiCad for routing inspection. Missing copper is not repaired by a 3D export. The native schematic and PCB bytes are unchanged.

## Reproduction and attribution

Exports: KiCad 10.0.6 `pcb export glb`, with `--include-pads --include-soldermask --include-silkscreen --user-origin 0x0mm`, and `KICAD10_3DMODEL_DIR` pointing to the matching downloaded packages listed in the provenance file. No `SaveBoard` or zone refill was performed. Web-only soldermask color/opacity and material lighting are adjusted for clarity.

Geometry comes from the [USB-C PCB](../../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/hardware/FPGA100T_33x36_Routing.kicad_pcb) and [micro-HDMI PCB](../../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/hardware/FPGA100T_33x36_Routing.kicad_pcb). The source paths and SHA-256 values are in the provenance file and per-board JSON metadata.

- [KiCad official 3D library](https://gitlab.com/kicad/libraries/kicad-packages3D), with its [license and design exception](assets/KiCad-LICENSE.md). Download URLs and individual SHA-256 values are recorded. Only generated board geometry is published, not a redistributed standalone model collection.
- [Three.js 0.180.0](https://www.npmjs.com/package/three/v/0.180.0), locally bundled with its [MIT license](vendor/LICENSE). Uses the official [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) and [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html). No external runtime CDN is needed.

This is a visual design review. Neither revision is released for manufacture.
