# Current native routing audit

2026-09-26 · 33 × 36 mm · 129 components · 8 copper layers

**ASIC interface: 116 / 116 candidate FPGA nets plus 1 external analog contact, out of 117 ASIC contacts. ASIC copper: 49 / 116 candidate FPGA nets have no missing connection in this DRC.** Assignment and copper completion are separate. AC_IN is analog 0–1.5 V on the ASIC/routing side; J5.46 is reserved, with no FPGA GPIO connection or source circuit. IMP_TST is provisionally a 0/1.5 V digital output; polarity remains unverified. The capture assumption is eight returned clocks sampled on falling edges and four outgoing board clocks. Electrical/timing guarantees, connector mating and powered operation remain unverified.

| Check | Result |
|---|---|
| Components | 129: 38 front / 91 back |
| Native electrical endpoints compared | 760 |
| Assigned endpoints / unassigned / NC subset | 662 / 98 / 1 |
| Functional nets / native nets including unassigned and net 0 | 164 / 263 |
| Tracks / vias / zones | 1842 / 307 / 9 |
| Assigned-net missing connections | 179 |
| DRC physical findings / schematic parity findings | 0 / 0 |
| ERC open pins / other errors / warnings | 97 / 4 / 9 |
| Missing-connection evidence qualified | True |

Unassigned endpoints have no functional net; they do not create ordinary ratsnest lines. Intentional NC flags are a subset of these endpoints, not an additional count. U1.A13 is now an NC reserve after removal of the inappropriate direct AC_IN connection. A missing-connection item concerns an assigned net and is not a count of disconnected pins. Net-level status does not imply that every pad on an open net is individually isolated. The analog-reserved contact is excluded from FPGA route-completion counts; an isolated named contact can have no DRC airwire without a working source circuit. Zero reported physical findings would not establish successful power-up, legal clock implementation, thermal adequacy or fabrication readiness.

## Remaining assigned-net connections

| Net | Missing connections |
|---|---:|
| `ASIC1_DATA3` | 1 |
| `ASIC1_DATA6` | 1 |
| `ASIC1_SYNC` | 1 |
| `ASIC2_CLK32MHz_Out` | 1 |
| `ASIC2_DATA1` | 1 |
| `ASIC2_DATA3` | 1 |
| `ASIC2_DATA4` | 1 |
| `ASIC2_DATA5` | 1 |
| `ASIC2_DATA6` | 1 |
| `ASIC2_DATA7` | 1 |
| `ASIC2_READ` | 1 |
| `ASIC2_SYNC` | 1 |
| `ASIC3_DATA1` | 1 |
| `ASIC3_DATA3` | 1 |
| `ASIC3_DATA4` | 1 |
| `ASIC3_DATA5` | 1 |
| `ASIC3_DATA6` | 1 |
| `ASIC3_DATA8` | 1 |
| `ASIC3_READ` | 1 |
| `ASIC3_SYNC` | 1 |
| `ASIC4_CLK32MHz_Out` | 1 |
| `ASIC4_DATA1` | 1 |
| `ASIC4_DATA3` | 1 |
| `ASIC4_DATA5` | 1 |
| `ASIC4_DATA6` | 1 |
| `ASIC4_DATA7` | 1 |
| `ASIC4_DATA8` | 1 |
| `ASIC4_SYNC` | 1 |
| `ASIC5_DATA7` | 1 |
| `ASIC5_SYNC` | 1 |
| `ASIC6_DATA3` | 1 |
| `ASIC6_DATA4` | 1 |
| `ASIC6_DATA5` | 1 |
| `ASIC6_DATA6` | 1 |
| `ASIC6_DATA7` | 1 |
| `ASIC6_DATA8` | 1 |
| `ASIC6_READ` | 1 |
| `ASIC7_CLK32MHz_Out` | 1 |
| `ASIC7_DATA1` | 1 |
| `ASIC7_DATA4` | 1 |
| `ASIC7_DATA7` | 1 |
| `ASIC7_SYNC` | 1 |
| `ASIC8_DATA1` | 1 |
| `ASIC8_DATA2` | 1 |
| `ASIC8_DATA3` | 1 |
| `ASIC8_DATA4` | 1 |
| `ASIC8_DATA5` | 1 |
| `ASIC8_DATA6` | 1 |
| `ASIC8_DATA7` | 1 |
| `ASIC8_DATA8` | 1 |
| `ASIC8_READ` | 1 |
| `ASIC8_SYNC` | 1 |
| `BOARD1_CLK` | 1 |
| `BOARD2_SPI_CLK` | 1 |
| `BOARD4_CLK` | 1 |
| `CHIP_RESET_SHARED` | 1 |
| `FE_RESET_SHARED` | 1 |
| `GND` | 5 |
| `IMP_TST_SHARED` | 1 |
| `LINK_12V` | 5 |
| `NONSTIM_BOARD1_SPI_DL` | 1 |
| `NONSTIM_BOARD1_SPI_DR` | 1 |
| `STIM_CHIP1_SPI_DL` | 1 |
| `STIM_CHIP1_SPI_DR` | 1 |
| `STIM_CHIP2_SPI_DR` | 1 |
| `STIM_CHIP3_SPI_DL` | 1 |
| `STIM_CHIP3_SPI_DR` | 1 |
| `STIM_CHIP4_SPI_DR` | 1 |
| `STIM_START_SHARED` | 1 |
| `VAUX_REG_1V803` | 1 |
| `VCCAUX_1V8` | 41 |
| `VCCINT_1V0` | 29 |
| `VCC_ASIC_1V5` | 23 |
| `VCC_LINK_2V5` | 8 |

## Rules and exclusions

The audit does not modify rule severity, report filters, ignored checks or exclusions. These are the actual supplied values; complete rule settings and original report contents are in [Native_Readback.json](Native_Readback.json).

```json
{
  "drcIgnoredChecks": [],
  "drcExclusions": [],
  "ercIgnoredChecks": [
    {
      "description": "Global label only appears once in the schematic",
      "key": "single_global_label"
    },
    {
      "description": "Four connection points are joined together",
      "key": "four_way_junction"
    },
    {
      "description": "SPICE model issue",
      "key": "simulation_model_issue"
    },
    {
      "description": "Assigned footprint doesn't match footprint filters",
      "key": "footprint_filter"
    }
  ]
}
```

DRC included severities: error, warning. ERC included severities: error, warning.

## Inspection files

- [Measured snapshot](Routing_Snapshot.json): website-compatible counts, ASIC assignment/copper lists and all source hashes.
- [All component pins](All_Pin_Connections.csv): actual native nets and net-level copper status.
- [Component list](Component_List.csv): native placement, values, manifest part choices and limitations.
- [Net endpoints](Net_Endpoints.csv): complete assigned-net membership and missing-connection counts.
- [Native readback](Native_Readback.json): physical pad records and exact reports/settings.

Board SHA-256: `c5a312d1224f90a454a1ee3275dc211f7994f1c69d441472131f55b363e7cd03`.

Input hashes bind this audit bundle. Native DRC/ERC JSON do not embed PCB/schematic hashes; their exact-run provenance remains the caller responsibility. Source filenames and native report net references were checked.

**Release state:** full board completion, electrical operation and fabrication readiness are all false. This report makes no manufacturing release claim.
