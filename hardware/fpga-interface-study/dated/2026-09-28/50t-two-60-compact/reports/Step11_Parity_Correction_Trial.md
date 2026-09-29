# Inherited parity correction trial

**Scope:** This is a checked trial on a frozen Step08 project copy, not an edit to the active GTP work. The script is `scripts/step11_inherited_parity_fix.py`. Apply it to the active project only after the GTP and LED stages have saved and released their own checkpoints.

## Manufacturer pin check

The local XC7A50T CSG325 symbol has 324/324 numbered ball names matching the archived AMD package CSV. F13 is `M2_0`, not a supply ball. Its schematic GND strap is consistent with the proposed Master SPI `M[2:0]=001` mode; the inherited PCB assignment to `VCCAUX_1V8` was wrong. The repair assigns F13 to GND on the PCB and synchronizes U1 E8/K16/L15/L17 flash pins, U5 PG, and U8's two generated no-connect nets to their schematic nets.

## U9 supervisor center land

U9's symbol includes pin 3 (`PAD`, no connection). The previous local footprint had no copper pad 3, creating a parity warning. The trial restores a numbered center land and assigns its generated no-connect net. KiCad's stock 0.35 mm land gives only 0.107 mm clearance to corner pads against the present 0.15 mm board rule. A **provisional 0.25 mm** center land clears that rule while preserving a physical solder land. This differs from TI's example land pattern and still requires assembly/fabricator approval. The part is a low-current supervisor; the design does not claim a thermal qualification from this trial.

## Trial result

On the frozen Step08 copy after the script: KiCad `pcb drc --severity-all --schematic-parity` reports **zero physical violations** and **24 remaining parity warnings**, all from the new edge test-pad symbol metadata that the independent LED/test-pad stage fixes. The script is idempotent on the trial copy. Copper remains unrouted; KiCad CLI prints 499 unconnected items due its report cap, not the exact native ratsnest total.

The two stages together must be rechecked on the **same final active project**. Passing parity does not qualify rail current, GTP signal integrity, power-input protection, connector alignment, or the smaller board for fabrication.

## Sources

- [AMD package-file download index](https://www.amd.com/en/support/downloads/adaptive-socs-and-fpgas/device-models/board-and-system-design.html); archived `xc7a50tcsg325pkg.csv` in the 27 September eight-layer review.
- [TI TLV803E data sheet](https://www.ti.com/lit/ds/symlink/tlv803e.pdf), X2SON DPW package and example board land pattern.
