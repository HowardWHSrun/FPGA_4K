# Native KiCad PCB viewer

[Open the viewer](index.html) · [Featured 50T micro-HDMI review](../index.html) · [USB-C development](../usb-c.html) · [Source identities](boards.json)

This page restores zoomable, selectable KiCad viewing on GitHub Pages. Each entry loads a separate native KiCad 10 snapshot with a recorded file hash. The page is a design inspection tool; it does not run KiCad DRC/ERC or establish electrical operation.

| View | Native file | Displayed design |
|---|---|---|
| [Featured unrouted 50T micro-HDMI board](index.html?board=fpga50t) | [FPGA50T_8L_Unrouted.kicad_pcb](../../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/project/hardware/FPGA50T_8L_Unrouted.kicad_pcb) | 36 × 38 mm; 174 footprints and 8 copper layers; zero tracks/vias and 625 native ratsnest links. The native J4.19 net is `LINK_12V`, but neither 12 V nor the earlier 5 V proposal is a qualified whole-headstage supply. The custom cable and power contract remain under review. |
| [Preserved 100T micro-HDMI checkpoint](index.html?board=compact-routed) | [FPGA100T_33x36_Routing.kicad_pcb](../../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/hardware/FPGA100T_33x36_Routing.kicad_pcb) | 33 × 36 mm; 21 matching schematic sheets; 116 candidate digital FPGA nets + one external analog contact; 125 components and 12 copper layers; all 116 assigned digital nets connected; zero assigned-net gaps |
| [USB-C development](index.html?board=usb-c) | [FPGA100T_33x36_Routing.kicad_pcb](../../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/hardware/FPGA100T_33x36_Routing.kicad_pcb) | 33 × 36 mm; 178 fitted parts plus one copper-only fixture; 268 assigned-net open items in its separate audit |
| [Earlier core](index.html?board=core) | [FPGA100T_Minimal.kicad_pcb](../../../hardware/fpga-100t-review/hardware/FPGA100T_Minimal.kicad_pcb) | 126 parts, 1,010 tracks, 146 vias, 4 zones; incomplete core routing |
| [Rail revision](index.html?board=rail) | [FPGA100T_Full_System.kicad_pcb](../../../hardware/fpga-interface-study/native/FPGA100T_Full_System.kicad_pcb) | 128 parts, 360 tracks, 25 vias; separate voltage revision |
| [Mezzanine fit](index.html?board=mezzanine) | [FPGA100T_Mezzanine_Fit.kicad_pcb](../../../hardware/fpga-interface-study/native/FPGA100T_Mezzanine_Fit.kicad_pcb) | 128 parts; unrouted placement study without an integrated schematic |
| [Smaller fit](index.html?board=compact) | [FPGA100T_37p5x36_Placement.kicad_pcb](../../../hardware/fpga-interface-study/size_optimization/candidate/hardware/FPGA100T_37p5x36_Placement.kicad_pcb) | 37.5 × 36 mm; separate connector-inclusive placement candidate; no tracks, vias or zones |
| [Earlier 33 × 36 mm fit](index.html?board=compact-v2) | [FPGA100T_33x36_Placement.kicad_pcb](../../../hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report/layout_v2/hardware/FPGA100T_33x36_Placement.kicad_pcb) | 33 × 36 mm; all 128 parts retained; no tracks, vias or zones; 383 unconnected items |

The 28 September 50T unrouted review opens by default. The [current native audit](../../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/validation/Website_Import_Audit.json) counts 625 ratsnest links. The DRC JSON shows only 499 unconnected items and appears capped for debug-pad nets. There are no routed tracks or vias; J5/J7 are two 60-contact DF40T review connectors. The preserved 100T routing checkpoint remains a separate selection. Its [routing audit](../../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/reports/Routing_Review.md) applies only to that checkpoint.

Five earlier placement and routing studies are preserved in the menu, alongside the separate 100T micro-HDMI and USB-C revisions. Their counts, reports and checks remain tied to their own snapshots. The preserved 100T connector uses a manufacturer board-edge datum; its inherited 0.010 mm courtyard minimum, plug access and mating clearance still require assembly qualification. No global minimum or manufacturing release is claimed.

Keep each project's ZIP together when opening KiCad; the placement-only ZIP has its PCB, project and local footprint libraries, while the core and rail projects also include hierarchical schematic sheets. The native KiCad project and its separate validation report define the scope of each snapshot.

## Controls

- **Fit board** restores the outline in view. **+ / −** zoom around the center.
- **Ctrl + scroll** zooms; plain scrolling or middle/right-button dragging pans. The upstream Preferences panel can change this behavior.
- **Layers** shows visibility controls and front/back/all-layer presets. The initial view shows front copper and silkscreen.
- **Parts** selects a footprint; **Nets** highlights an existing named net. The displayed net index is an internal viewer index, not a physical pin number.
- **Flip board** mirrors the view. Use the Layers presets to change the displayed board side.
- **Full screen** enlarges the viewer. `?board=fpga50t&embed=1` provides the compact version used by the featured review page.

The static vector view and complete native ZIP stay available when JavaScript, WebGL or an embedded browser cannot run the interactive viewer. A missing or hash-mismatched board produces a visible fallback instead of a success message.

## Native-file fidelity

Before loading, the page verifies the native PCB SHA-256 against [boards.json](boards.json). It then compares the rendered model's footprints, pads, tracks, vias, zones, FPGA pads, copper layers and net count with the recorded board. It does not rewrite source files, change their format/version declarations, or route anything.

The official KiCanvas alpha bundle supports native geometry, but its original net parser expects a numbered board-level net table. KiCad 10 stores names directly on copper items. The small [named-net compatibility function](vendor/kicad10-net-compat.js) builds the viewer's numeric index in memory before painting. The functional checker independently parses each original PCB and compares **every pad, track, via and zone net** with the viewer model, then uses the actual UI to toggle copper, select U1 and highlight CLK_32MHZ. Source SHA-256 checks ensure this test does not substitute a converted PCB.

Other KiCad 10 constructs remain unsupported by this alpha: via fabrication flags, duplicate-pad jumper flags, some pad properties and zone placement metadata produce parser warnings. The original native project remains authoritative. Net highlighting groups items by the saved net name; it does not prove the copper is connected. The preserved 100T checkpoint audit reports all 116 candidate digital nets copper-connected; the featured 50T board has 625 native ratsnest links. Neither establishes compatibility, timing or powered operation.

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

Optional environment variables: `PLAYWRIGHT_MODULE`, `CHROME_PATH`, and `VIEWER_OUTPUT_DIR`. The checker writes a JSON report and screenshots. It verifies the indexed board choices, each expected outline size, native hashes/counts, each net assignment, real view controls, desktop/mobile embedding, runtime resource availability and missing-file fallback. Browser verification does not replace KiCad checks or hardware measurements.
