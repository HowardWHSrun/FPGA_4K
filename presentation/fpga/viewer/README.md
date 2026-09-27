# Native KiCad PCB viewer

[Open the viewer](index.html) · [Return to the current FPGA review](../index.html) · [Source identities](boards.json)

This page restores zoomable, selectable KiCad viewing on GitHub Pages. Each entry loads a separate native KiCad 10 snapshot with a recorded file hash. The page is a design inspection tool; it does not run KiCad DRC/ERC or establish electrical operation.

| View | Native file | Displayed design |
|---|---|---|
| [Current smallest board](index.html?board=compact-routed) | [FPGA100T_33x36_Routing.kicad_pcb](../../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/hardware/FPGA100T_33x36_Routing.kicad_pcb) | 33 × 36 mm; 21 matching schematic sheets; 116 candidate digital FPGA nets + one external analog contact; 125 components and 12 copper layers; all 116 assigned digital nets connected; zero assigned-net gaps |
| [Earlier core](index.html?board=core) | [FPGA100T_Minimal.kicad_pcb](../../../hardware/fpga-100t-review/hardware/FPGA100T_Minimal.kicad_pcb) | 126 parts, 1,010 tracks, 146 vias, 4 zones; incomplete core routing |
| [Rail revision](index.html?board=rail) | [FPGA100T_Full_System.kicad_pcb](../../../hardware/fpga-interface-study/native/FPGA100T_Full_System.kicad_pcb) | 128 parts, 360 tracks, 25 vias; separate voltage revision |
| [Mezzanine fit](index.html?board=mezzanine) | [FPGA100T_Mezzanine_Fit.kicad_pcb](../../../hardware/fpga-interface-study/native/FPGA100T_Mezzanine_Fit.kicad_pcb) | 128 parts; unrouted placement study without an integrated schematic |
| [Smaller fit](index.html?board=compact) | [FPGA100T_37p5x36_Placement.kicad_pcb](../../../hardware/fpga-interface-study/size_optimization/candidate/hardware/FPGA100T_37p5x36_Placement.kicad_pcb) | 37.5 × 36 mm; separate connector-inclusive placement candidate; no tracks, vias or zones |
| [Earlier 33 × 36 mm fit](index.html?board=compact-v2) | [FPGA100T_33x36_Placement.kicad_pcb](../../../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/layout_v2/hardware/FPGA100T_33x36_Placement.kicad_pcb) | 33 × 36 mm; all 128 parts retained; no tracks, vias or zones; 383 unconnected items |

The current 33 × 36 mm routing checkpoint opens by default. It integrates revised 1.8 V flash/clock/configuration, the 2.5 V link bank, and both mezzanines. 116 candidate digital ASIC nets are provisionally assigned; all 116 digital nets are copper-connected. AC_IN is separately reserved for an external analog source. The [current routing audit](../../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/reports/Routing_Review.md) distinguishes assignment, measured missing connections and unresolved electrical/timing requirements. Three mezzanine reserves and eight cable contacts remain unassigned. Receiver integration is deferred for the first finite JTAG capture milestone.

The five earlier snapshots are preserved in the history menu: three 40 × 36 mm studies and the 37.5 × 36 mm and 33 × 36 mm placements. Their 128-part placement counts, reports and independent checks remain historical. The earlier placement had a 33.65 × 36 mm drawn body envelope. The current connector uses the manufacturer board-edge datum; its inherited 0.010 mm courtyard minimum, plug access and mating clearance still require assembly qualification. No global minimum or manufacturing release is claimed.

Keep each project's ZIP together when opening KiCad; the placement-only ZIP has its PCB, project and local footprint libraries, while the core and rail projects also include hierarchical schematic sheets. The native KiCad project and its separate validation report define the scope of each snapshot.

## Controls

- **Fit board** restores the outline in view. **+ / −** zoom around the center.
- **Ctrl + scroll** zooms; plain scrolling or middle/right-button dragging pans. The upstream Preferences panel can change this behavior.
- **Layers** shows visibility controls and front/back/all-layer presets. The initial view shows front copper and silkscreen.
- **Parts** selects a footprint; **Nets** highlights an existing named net. The displayed net index is an internal viewer index, not a physical pin number.
- **Flip board** mirrors the view. Use the Layers presets to change the displayed board side.
- **Full screen** enlarges the viewer. `?board=compact-routed&embed=1` provides the compact version used by the main review page.

The static vector view and complete native ZIP stay available when JavaScript, WebGL or an embedded browser cannot run the interactive viewer. A missing or hash-mismatched board produces a visible fallback instead of a success message.

## Native-file fidelity

Before loading, the page verifies the native PCB SHA-256 against [boards.json](boards.json). It then compares the rendered model's footprints, pads, tracks, vias, zones, FPGA pads, copper layers and net count with the recorded board. It does not rewrite source files, change their format/version declarations, or route anything.

The official KiCanvas alpha bundle supports native geometry, but its original net parser expects a numbered board-level net table. KiCad 10 stores names directly on copper items. The small [named-net compatibility function](vendor/kicad10-net-compat.js) builds the viewer's numeric index in memory before painting. The functional checker independently parses each original PCB and compares **every pad, track, via and zone net** with the viewer model, then uses the actual UI to toggle copper, select U1 and highlight CLK_32MHZ. Source SHA-256 checks ensure this test does not substitute a converted PCB.

Other KiCad 10 constructs remain unsupported by this alpha: via fabrication flags, duplicate-pad jumper flags, some pad properties and zone placement metadata produce parser warnings. The original native project remains authoritative. Net highlighting groups items by the saved net name; it does not prove the copper is connected. The native audit reports all 116 digital nets copper-connected. Their candidate assignments and the separate analog reservation remain provisional and do not establish compatibility, timing or powered operation.

## Viewer version, licenses and local adaptations

The bundle comes from the [official KiCanvas embedding distribution](https://kicanvas.org/embedding/) and is pinned by its SHA-256, because that URL does not provide a release version. [vendor/manifest.json](vendor/manifest.json) records the original and published hashes, supplemental asset URLs, and the upstream source commit used for icons and notices. That source commit is **not** claimed as the deployed bundle's build revision.

KiCanvas is by Alethea Katherine Flowers under the [MIT license](vendor/LICENSE.md), with third-party notices included for Earcut, Newstroke, Material Symbols and Nunito. The local package serves scripts, icon sprites and fonts from this repository, with no external runtime requests required.

The exact bounded modifications are reproduced by [vendor/patch-bundle.py](vendor/patch-bundle.py): remove the external font-link injection; create the icon SVG URL directly to fix a template placeholder bug; accept named pad/copper nets; build the internal named-net index. Native geometry and KiCad source bytes are untouched. The wrapper uses methods from this pinned bundle to fit the outline, set the initial layer view and drive the toolbar. Test those adapters when changing the bundle.

To reproduce the published bundle from the recorded upstream bytes:

```sh
python3 presentation/fpga/viewer/vendor/patch-bundle.py /path/to/upstream-kicanvas.js /tmp/reproduced-kicanvas.js
```

## Verification

Run from the repository root with Playwright and Chromium available:

```sh
SITE_URL=http://127.0.0.1:8765/ node scripts/check_fpga_viewer.mjs
```

Optional environment variables: `PLAYWRIGHT_MODULE`, `CHROME_PATH`, and `VIEWER_OUTPUT_DIR`. The checker writes a JSON report and screenshots. It verifies the current board and five historical variants, each expected outline size, native hashes/counts, each net assignment, real view controls, desktop/mobile embedding, runtime resource availability and missing-file fallback. Browser verification does not replace KiCad checks or hardware measurements.
