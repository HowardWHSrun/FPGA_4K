# XC7A50T CSG325 manufacturer pin audit

- AMD CSV package balls: **324**; KiCad symbol numbered pins: **324**.
- Pin-name differences: **0**.
- Schematic power-pin net discrepancies against this board's rail map: **0**.
- This check uses the saved schematic netlist only. Native schematic-to-PCB parity remains mandatory.

## Configuration hazard found in PCB parity

- F13 is **M2_0** in the AMD CSV, and its schematic net is **GND**. The frozen Step08 PCB had F13 on `VCCAUX_1V8`; that PCB pad must be synchronized to GND for the proposed Master SPI mode before release.

## Schematic rail assignments

| Manufacturer pin function | Schematic net | Ball count |
|---|---|---:|
| `GND` | `GND` | 75 |
| `GNDADC_0` | `GND` | 1 |
| `MGTAVCC` | `MGTAVCC_1V0` | 4 |
| `MGTAVTT` | `MGTAVTT_1V2` | 5 |
| `VCCADC_0` | `VCCAUX_1V8` | 1 |
| `VCCAUX` | `VCCAUX_1V8` | 5 |
| `VCCBRAM` | `VCCINT_1V0` | 3 |
| `VCCINT` | `VCCINT_1V0` | 18 |
| `VCCO_0` | `VCCAUX_1V8` | 2 |
| `VCCO_14` | `VCC_ASIC_1V5` | 7 |
| `VCCO_15` | `VCC_ASIC_1V5` | 7 |
| `VCCO_34` | `VCC_ASIC_1V5` | 6 |

## Scope and source

AMD `xc7a50tcsg325pkg.csv` was archived in the 27 September eight-layer review's `source_evidence/` folder. The CSV's built-in timestamp is 3 December 2013. Check the exact orderable device and current AMD package file again before fabrication.
