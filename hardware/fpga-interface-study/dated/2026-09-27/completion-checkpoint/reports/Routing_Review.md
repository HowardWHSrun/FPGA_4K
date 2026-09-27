# Current native routing audit

2026-09-27 · 33 × 36 mm · 125 components · 12 copper layers

**ASIC interface: 116 / 116 candidate FPGA nets plus 1 external analog contact, out of 117 ASIC contacts. ASIC copper: 116 / 116 candidate FPGA nets have no missing connection in this DRC.** Assignment and copper completion are separate. AC_IN is analog 0–1.5 V on the ASIC/routing side; J5.46 is reserved, with no FPGA GPIO connection or source circuit. IMP_TST is provisionally a 0/1.5 V digital output; polarity remains unverified. The capture assumption is eight returned clocks sampled on falling edges and four outgoing board clocks. Electrical/timing guarantees, connector mating and powered operation remain unverified.

| Check | Result |
|---|---|
| Components | 125: 36 front / 89 back |
| Native electrical endpoints compared | 752 |
| Assigned endpoints / unassigned / NC subset | 650 / 102 / 83 |
| Functional nets / native nets including unassigned and net 0 | 160 / 263 |
| Tracks / vias / zones | 3123 / 546 / 13 |
| Assigned-net missing connections | 0 |
| DRC physical findings / schematic parity findings | 0 / 0 |
| ERC open pins / other errors / warnings | 19 / 4 / 1 |
| Missing-connection evidence qualified | True |

Unassigned endpoints have no functional net; they do not create ordinary ratsnest lines. Intentional NC flags are a subset of these endpoints, not an additional count. U1.A13 is now an NC reserve after removal of the inappropriate direct AC_IN connection. A missing-connection item concerns an assigned net and is not a count of disconnected pins. Net-level status does not imply that every pad on an open net is individually isolated. The analog-reserved contact is excluded from FPGA route-completion counts; an isolated named contact can have no DRC airwire without a working source circuit. Zero reported physical findings would not establish successful power-up, legal clock implementation, thermal adequacy or fabrication readiness.

## Remaining assigned-net connections

| Net | Missing connections |
|---|---:|
| None reported | 0 |

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

DRC included severities: error, warning, exclusion. ERC included severities: error, warning, exclusion.

## Inspection files

- [Measured snapshot](Routing_Snapshot.json): website-compatible counts, ASIC assignment/copper lists and all source hashes.
- [All component pins](All_Pin_Connections.csv): actual native nets and net-level copper status.
- [Component list](Component_List.csv): native placement, values, manifest part choices and limitations.
- [Net endpoints](Net_Endpoints.csv): complete assigned-net membership and missing-connection counts.
- [Native readback](Native_Readback.json): physical pad records and exact reports/settings.

Board SHA-256: `2975050c28c89fc96bf781cf082bffffc84189e6720ce05c4200d8552ac298fc`.

The sequential native-run provenance binds this saved PCB, every schematic, project rules, libraries, manifest and native report by SHA-256. This audit verifies those hashes before readback. See [Native_Run_Provenance.json](Native_Run_Provenance.json). The portable package manifest records any path-only metadata transformation separately.

**Release state:** full board completion, electrical operation and fabrication readiness are all false. This report makes no manufacturing release claim.
