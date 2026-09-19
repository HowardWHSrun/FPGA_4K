# Board preview files

Open the [visual hardware overview](../overview.md) for captions, the system diagram and links to the original designs.

| Supplied design | Overall view | Front layout | Back layout |
|---|---|---|---|
| ASIC carrier PCB-5 | [3D PNG](asic-carrier-3d.png) | [PNG](asic-carrier-front.png) · [SVG](asic-carrier-front.svg) | [PNG](asic-carrier-back.png) · [SVG](asic-carrier-back.svg) |
| LDO/routing reference | [3D PNG](ldo-routing-3d.png) | [PNG](ldo-routing-front.png) · [SVG](ldo-routing-front.svg) | [PNG](ldo-routing-back.png) · [SVG](ldo-routing-back.svg) |

## What the images contain

These views were generated on September 19, 2026 from the unchanged [carrier PCB](../references/asic-carrier/PCB.kicad_pcb) and [LDO/routing PCB](../references/ldo-routing/PCB.kicad_pcb), using KiCad 10.0.6. Input and output hashes are recorded in the [source manifest](../../sources/manifest.json).

- **3D views:** complete board outline and the component models available to KiCad, viewed from the front at an angle. Missing custom models, including the ASIC bodies, are not invented. These are visualizations of the saved CAD, not assembly photographs or a validated bill of materials.
- **Front/back layouts:** the selected outer copper layer, silkscreen and board outline. Carrier views also include fabrication-layer footprint outlines. LDO fabrication text is omitted because overlapping value labels obscure the layout. Internal copper layers are available in the original CAD.
- **Orientation:** back layouts are mirrored so they are viewed from the back of the board. Front copper is red, back copper is blue. Images of different boards are independently fitted and are not to a common scale.
- **Original photograph:** [slide 2](../../sources/slides/previews/slide-02.png) preserves the full presentation page, including the assembled single-chip carrier and bond-wire close-up. It is a different source example from the two-chip PCB-5 reference.

## Reproducing the views

Run from the repository root with `kicad-cli` on your path. The example below writes to an ignored local folder, preserving the published images and original CAD:

```sh
mkdir -p tmp/board-previews
for board in asic-carrier ldo-routing; do
  kicad-cli pcb render \
    --width 1600 --height 1200 --side top \
    --background transparent --quality high \
    --rotate '335,0,25' --zoom 0.65 \
    --output "tmp/board-previews/$board-3d.png" \
    "hardware/references/$board/PCB.kicad_pcb"

  front_layers='F.Cu,F.Silkscreen,Edge.Cuts'
  back_layers='B.Cu,B.Silkscreen,Edge.Cuts'
  if [ "$board" = asic-carrier ]; then
    front_layers='F.Cu,F.Silkscreen,F.Fab,Edge.Cuts'
    back_layers='B.Cu,B.Silkscreen,B.Fab,Edge.Cuts'
  fi
  kicad-cli pcb export svg --layers "$front_layers" \
    --mode-single --page-size-mode 2 --exclude-drawing-sheet \
    --output "tmp/board-previews/$board-front.svg" \
    "hardware/references/$board/PCB.kicad_pcb"
  kicad-cli pcb export svg --layers "$back_layers" --mirror \
    --mode-single --page-size-mode 2 --exclude-drawing-sheet \
    --output "tmp/board-previews/$board-back.svg" \
    "hardware/references/$board/PCB.kicad_pcb"
done
```

KiCad's installed model libraries, color theme and version affect appearance. No zone refill, source migration or circuit edit was performed. The saved SVGs retain the native vector output. PNG layout previews were rasterized using Sharp 0.35.4, fitted within 1800 × 2400 pixels, with a `#17212b` background and a 40-pixel border. They can be reproduced with Sharp available to Node.js:

```js
const sharp = require('sharp');

async function renderLayouts() {
  for (const board of ['asic-carrier', 'ldo-routing']) {
    for (const side of ['front', 'back']) {
      const base = `tmp/board-previews/${board}-${side}`;
      await sharp(`${base}.svg`)
        .resize({ width: 1800, height: 2400, fit: 'inside' })
        .flatten({ background: '#17212b' })
        .extend({ top: 40, bottom: 40, left: 40, right: 40,
                  background: '#17212b' })
        .png().toFile(`${base}.png`);
    }
  }
}
renderLayouts().catch(error => { console.error(error); process.exitCode = 1; });
```

The full-slide photograph preview was rendered with Poppler 26.05.0:

```sh
pdftoppm -f 2 -singlefile -scale-to 1400 -png \
  sources/slides/Chip_FPGA_Interface.pdf tmp/board-previews/slide-02
```

Re-rendering supports documentation. It does not run an electrical, fabrication or hardware validation.
