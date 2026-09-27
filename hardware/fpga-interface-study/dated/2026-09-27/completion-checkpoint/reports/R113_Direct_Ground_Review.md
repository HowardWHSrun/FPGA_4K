# R113 / fixed M2 ground review — 2026-09-26

**Direct grounding of U1.P11/M2 is electrically defensible for this fixed Master SPI design.** This source review accompanies the integrated removal. The [application record](R113_Removal_Applied.json) and current native netlist preserve the exact change; physical ground continuity is covered by the current DRC and independent readback.

AMD UG470 v1.17 (5 December 2023), printed pages 7 and 20/Table 2-4, explicitly permits M[2:0] either directly connected to GND/VCCO_0 or connected through a resistor no larger than 1 kΩ. They are dedicated inputs, so M2 does not later become an application-driven output. Table 2-1, page 17, defines Master SPI as 001. Pages 8 and 67 state that JTAG configuration remains available independent of the mode-pin settings. Page 82 describes sampling on INIT_B rising. A permanent low is stable through that event and afterward.

The meaningful tradeoff is serviceability: page 62 recommends a mode-selection option for JTAG-only debugging without interference from other configuration modes. With M2 directly grounded, changing 001 to 101 would require PCB rework. This removes convenient strap rework flexibility; it does not remove JTAG access. The existing 1 kΩ resistor was an allowed strap choice, not a mandatory isolation, sequencing or timing element. [AMD UG470](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content).

DS181 v1.27.1 (3 July 2024), pages 8–9 and 58/Table 66, retains the normal supply sequencing, power-on reset and configuration timing requirements. Direct M2 grounding neither bypasses POR nor changes the source of configuration clocking. It introduces no new powered source into bank 0. These supply/timing requirements must still be met; deleting a strap resistor is not power-up validation. [AMD DS181](https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet).

Exact intended changes:

| Endpoint | Before | After |
|---|---|---|
| R113.1 | CFG_M2 | Component removed |
| R113.2 | GND | Component removed |
| U1.P11 / M2 | CFG_M2 | GND directly |

U1.P12/M0 remains high on CFG_M0, and U1.P13/M1 remains directly grounded. No NC marker replaces M2. Expected physical count is **128 → 127 components; 758 → 756 numbered endpoints**. The six virtual manifest symbols, all ASIC assignments, all other numbered endpoint nets, and existing NC/reserved classification stay unchanged.

The [exact endpoint/source delta](R113_Direct_Ground_Delta.json) defines the permitted schematic change. The [application record](R113_Removal_Applied.json) records the actual files and hashes. The current native schematic contains no R113 or CFG_M2 net; U1.P11 belongs to GND. The separate connector reassignment is recorded in [Contact_Reassignment_Applied.json](Contact_Reassignment_Applied.json).

These changes do not establish power integrity, assembly acceptance or operation. No manufacturing release or order is implied.
