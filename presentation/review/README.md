# PI review presentation — assembly-first starter

**[Open the presentation](https://howardwhsrun.github.io/FPGA_4K/presentation/review/)**

Prepared for the September 23, 2026 review. This independent presentation lives on the `presentation` branch in `presentation/review/`. The existing root landing page and its JavaScript/CSS were preserved when concurrent work appeared. This directory does not change `main` or any native PCB files.

## Presenting

Drag the model to rotate; scroll or use +/− to zoom. Click a model region or its side-panel button to highlight it. Use the isometric, top and side camera presets. Left/right arrows navigate the three stages, F toggles fullscreen where supported, and R resets the camera.

1. Assembly: the complete headboard concept and A/B/C/D region map.
2. Connector study: an adjustable shortened free bridge, original/compact toggle and original board-envelope overlay.
3. Next sections: reserved places for the team's ASIC, routing/power, FPGA, receiver/MCU and integration material. No progress or measurement is invented.

## Model provenance and limits

Source: [preserved original STL](../../hardware/assembly/stacked_headboard_original.stl), through the existing [indexed browser mesh](../model-data.js). Source SHA-256: `543bb3c98b3e6a4db8d65c7bf94b99972a0242de1b9183b6188adbb45d2fc23a`.

The [assembly guide](../../hardware/assembly/README.md) identifies A as four ASIC carrier boards with two ASICs per board in the discussion, B+C as the routing PCB, and D as the FPGA PCB. The original has 650 triangles; units and final dimensions are unspecified, and the original author is unverified. Colors and region classification in this renderer are presentational, not component metadata.

**The previously generated shortened STL was not present in the repository or available files. The compact view here is a new, explicitly provisional visualization, not the recovered or approved shortened revision.**

At the default retained-span ratio `r = 0.5`, only the free span x in [3,18] is shortened. The map is:

- x <= 3: unchanged.
- 3 < x < 18: x' = 3 + r(x - 3).
- x >= 18: x' = x - 15(1 - r).

Y and Z remain unchanged. Triangles crossing cut planes are clipped before mapping so the fixed ASIC side is not distorted. Right-side boards translate rigidly rather than being scaled. The slider permits 25–100%; 50% is an illustrative starting point, not a specified connector dimension. No connector footprint is redesigned, and no mechanical clearance or electrical compatibility is validated. Original mode is the identity map. The source mesh is never mutated.

## Files

| File | Role |
|---|---|
| [index.html](index.html) | Presentation content, controls and source notes |
| [style.css](style.css) | Responsive/fullscreen-oriented layout |
| [app.js](app.js) | Canvas 3D projection, depth buffering, model transforms and interaction |
| [../model-data.js](../model-data.js) | Shared preserved-source indexed mesh; not changed by this view |

The renderer uses browser Canvas and contains no external dependencies. For an offline folder copy, retain `presentation/model-data.js` and this `review/` directory together, then open `review/index.html` in a modern browser. A self-contained HTML backup was also supplied in the conversation.

## Validation performed

Local Chromium tests covered 1440x900 desktop and 390-pixel mobile layouts, camera presets, region selection, original/compact switching, bridge slider, source dialog and stage navigation, with no JavaScript page errors or mobile horizontal overflow. Runtime geometry checks passed for source immutability, fixed-side preservation, downstream rigid translation and original identity mapping. Node syntax validation passed. The native source mesh was checked as watertight with consistent winding.

GitHub repository checks, presentation checks and Pages deployment succeeded for commit `3146377e89a9a8be249f5b5b58be1495be03919a`. These are presentation/source-integrity checks, not physical acquisition, timing closure, electrical validation or fabrication readiness.
