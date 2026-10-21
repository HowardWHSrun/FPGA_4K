# V42 change and review context

18 October 2026. V41 is preserved. V42 changes the LDO-feed LED position to make all three rail-presence LEDs observable together from the underside of the nominal stacked assembly.

| Indicator | Meaning | V42 native placement |
|---|---|---|
| D600 | 12 V input presence | B.Cu (103.5,51.5 mm), 90°, unchanged |
| D601 | 3.3 V feed to LDO board after JP1; not an LDO output | B.Cu (141,55 mm), 90°, moved from F.Cu (142.5,39.5 mm) |
| D602 | Buck 3.3 V output presence | B.Cu (133,67.5 mm), 180°, unchanged |

D601's “LDO 3V3” label also moves to the back. R601 remains F.Cu (142.5,36 mm). LED values, polarity, MPNs, schematic nets, masks/pad geometry and the 606 schematic pin/net memberships are retained. Rail-presence LEDs are not precision power-good monitors.

## Preserved routing and component evidence

The independent audit passes all 22 checks: 88 unrelated footprints are byte-identical, 737 old segments and 311 old vias are retained byte-for-byte. Only the obsolete D601 ground segment/via are removed; five indicator segments and two ordinary indicator vias are added. Total V42 geometry: 742 segments, 313 vias, 651 pads and 21 zones. All zone definitions remain exact. Three saved plane fill caches change only in native Boolean-verified 2 × 2 mm windows surrounding the old/new indicator vias; the other 18 zone records remain byte-identical. All other board nodes, circuit drawing/notes, rules and libraries are preserved except revision/project identity text.

See [preservation audit](verification/V42_Independent_Preservation_Review.md), [machine-readable receipt](verification/V42_Independent_Preservation_Receipt.json) and [native fill locality receipt](verification/V42_Native_Fill_Locality.json).

## Visibility scope

The [diagram](output/figures/V42_LED_Stack_Visibility.png) projects the registered LDO outline onto the carrier underside using full native Fab/courtyard geometry. All three LED bodies are outside that outline. D601 body bounds are X140.6–141.4, Y54.2–55.8 mm, with 5.6323 mm nearest distance to the projected LDO outline. Native D601/J4 courtyard gap is 2.00 mm (1.95 mm including graphic strokes). This is nominal source geometry, with simplified mating heights; enclosure, cables, fixture, standoff and tolerance fit remain to inspect on hardware. The diagram arrow shows relocation, not trace routing.

## Checks and open gates

Saved-source and model-free public DRC report zero physical/silkscreen findings, opens and schematic parity findings. Fifty inherited library warnings remain; 210 inherited unused-connector ERC findings remain. Review [native check receipt](verification/Public_V42_Native_Checks.json). Library/ERC counts are disclosed limitations, not a claim of electrically clean or working hardware.

The 13 selected filled/capped thermal vias are unchanged (nine U10, four U501). D601's two new ordinary vias are excluded from that process. All other sourcing, panel/rail, stack, selective via, THT/manual assembly, final placement/polarity, FTDI programming and first-board electrical/thermal/fit reviews remain open. Use V42 PCB, Gerbers/drills and CPL together; a V41 portal draft must be replaced before any V42 order. No order, procurement or payment is made by this publication.
