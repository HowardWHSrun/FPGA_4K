# Carrier V41 native-plot viewer

18 October 2026. Deploy this folder to `presentation/overview/carrier-v41/` in the existing `FPGA_4K` Pages publication. Its files read the public V41 package already present at `hardware/xem8305-carrier/dated/2026-10-18/v41/`.

- Overview iframe: `presentation/overview/carrier-v41/index.html?embed=1&layer=F.Cu`
- Standalone viewer: `presentation/overview/carrier-v41/`
- Direct inner-ground view: `presentation/overview/carrier-v41/?layer=In1.Cu`
- Mirrored bottom view: `presentation/overview/carrier-v41/?layer=B.Cu&side=bottom`

All six copper plots and both optional silkscreens are native KiCad exports using the saved fills. The originals all use a top-looking, non-mirrored coordinate system. The underside toggle mirrors the whole displayed board and is labeled explicitly. No tracks, fills, pads, connector bodies or 3D models are reconstructed by this viewer. The plot frame is 52.9844 × 82.9818 mm, and the displayed scale follows that native SVG viewBox. The board's nominal outline is 53 × 83 mm.

The sections are approximate camera focus positions, not electrical net identification. SVGs do not include interactive net highlighting; use the linked native project for that inspection. Layer text is based on the actual V41 zones: In1/In4 carry DGND; In3 carries LDO_3V3, VDCIN and BUCK_3V3. L2/L5 reference planes are not described as unused routing layers. The web page retains the inherited-warning, sourcing and factory-review limits in the public review package.

Links use repository-relative URLs for PDFs, ZIPs and CSVs. Review-context Markdown links use the existing public `presentation` branch on GitHub. This is a carrier-only viewer; no standalone FPGA or other existing site assets are changed.
