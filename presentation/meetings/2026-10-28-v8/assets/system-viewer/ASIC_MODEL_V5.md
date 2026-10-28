# ASIC PCB visual update V5

The overview now represents each ASIC board with the retained PCB-5 outline, actual footprint-derived ASIC bondout-pad centers and dimensions, and two separate nominal die bodies. This replaces the earlier two large dark rectangles that filled the entire ASIC reserved regions.

- Native source: `Old Stuff/Original Sources/03_ASIC_Carrier_PCB/PCB-5/PCB.kicad_pcb`, SHA-256 `e01ee641cc00da3444fd627c6c97862ffc8918c8b2c98165f73696500e251757`. The older indexed `Original Sources/` path is absent in this checkout; the original source now resides under `Old Stuff/`.
- Outline and pad coordinates: retained from the existing `asic-layout.json`, derived from this same PCB-5 source. The source outline is approximately 21.968 × 17.032 mm. Native configured substrate thickness is 1.6 mm.
- Die area: the original ASIC specification summary reports 8.1 × 7 mm (`2026-10-04_FPGA_Work/08_ASIC_Reference/ASIC_REFERENCE.md`, section 1, source table B25). This is a summary specification, not a mechanical package drawing.
- The die bodies are centered in the original reserved ASIC regions for presentation. The 0.12 mm visible body height is an illustrative rendering value. Exact die placement, orientation, height, bond wires, encapsulation and assembled clearance remain unverified.
- The thinner 0.8 mm PCB profile and low-profile connector concept remain presentation assumptions. They are not a revised routed ASIC PCB or selected stack hardware. The 1.6 mm mode provides the original substrate-thickness comparison.
- Capacitors and J1 are not copied into the revised stacking concept. The original populated PCB-5 has 50 capacitor sites and a side header; its unchanged placement conflicts with proposed pass-through connector regions. The 19 October connector-fit study identified 38 capacitor sites requiring relocation. An exact capacitor relocation/routing and native ASIC-PCB revision remain future design work. Omitting them here must not be interpreted as their electrical removal.

The detailed original populated source model remains available at `2026-10-20_FPGA_Work/17_Wednesday_Meeting_Slides_V2/site/assembly-v23/assets/asic-pcb5-source.glb`, SHA-256 `4593af56843499d14e25489022d2dc3c358a003a5a53579eaddddbd38e0a1c68`. It is suitable as an original reference, but is not a completed pass-through stacking PCB.

No native CAD, component placement, connector contract or electrical netlist was edited for this visual update.
