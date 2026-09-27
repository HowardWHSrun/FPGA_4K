# J4 connector and power-contact review — 26 September 2026

**Select Molex `467651001` (also formatted `46765-1001` or `0467651001`).** It is a top-mount Type-D receptacle with 19 SMT signal contacts and four through-hole shell tabs, matching the existing `MicroHDMI_46765_1xxx` mounting style. Molex lists 0.762 µm minimum mating gold, 0.4 mm pitch, 0.8 A maximum/contact and 30 V. [Exact manufacturer product](https://www.molex.com/en-us/products/part-detail/467651001), [series variants](https://www.molex.com/en-us/products/series-chart/46765).

This resolves the ordering placeholder. It does not turn the custom wiring into an HDMI interface or qualify a retail HDMI cable for power. All four future data pairs remain reserved.

## Geometry comparison

The manufacturer [SD-46765-001 D1 family drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf), sheets 2 and 5, is the reference for the through-hole-tab variant. The URL is named for a different family variant; use the sheet-2 through-hole variant, not the bottom-mount SMT footprint.

| Feature | Native footprint | Drawing nominal | Result |
|---|---:|---:|---|
| Contact pitch within each row | 0.400 mm | 0.400 mm | Matches |
| Pad width | 0.230 mm | 0.230 mm | Matches |
| Odd/even pad lengths | 0.850 / 1.000 mm | 0.850 / 1.000 mm | Matches |
| Shell slot, 4× | 0.650 × 1.700 mm | 0.650 × 1.700 mm | Matches |
| Shell copper land, 4× | 1.500 × 2.550 mm | 1.500 × 2.550 mm | Matches |
| Across-board slot-center spacing | 6.200 mm | 6.200 mm | Matches |
| Keepout width / depth | 4.700 / 4.340 mm | 4.700 / 4.340 mm minimum | Matches nominal minimum |

The native library marks its suggested board edge at local y=1.700 mm. The approved +0.10 mm X correction adopts that datum at the x=33.0 mm PCB edge. Preserve the connector/plug-overmold mating envelope in the final enclosure review; edge-datum agreement alone is not assembly approval.

### Selected board thickness and recessed shell tabs

The sheet-2 shell tail extends **0.55 ±0.15 mm** below the signal-tail seating plane. The selected **1.59 mm ±10%** board is **1.431–1.749 mm** thick, so the tab end remains **0.731–1.349 mm inside the plated slot**, before solder standoff. A backside projecting tail or bottom protruding-tail fillet must not be promised. The drawing and product specification did not establish an allowable PCB-thickness range.

This does **not** demonstrate an incompatible connector: the short projection is intentional geometry. Molex's [EE-46765-001 Rev D electrical model](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/electricalmodeldocumentpdf/467/46765/EE-46765-001-001.pdf?inline=) includes this part and a **0.8 mm** board, but identifies the model as an unvalidated simulation. That thickness is **model context, not an assembly recommendation or qualification**. Retain the selected part and stackup pending explicit assembler acceptance of soldering, inspection and retention of the short recessed tabs over our full thickness range, as well as the precision slot tolerances. The [thickness and peg review](Connector_Thickness_And_Peg_Review.md) records the sources and exact geometry.

## What the current rating permits

[Molex PS-46765-003](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf), page 1, states **0.8 A at 25 °C**. Its page-2 all-19-circuits-powered test establishes **at least 0.3 A at up to 55 °C ambient**. These are different conditions; no 0.60 A hot-ambient derating curve was obtained.

Our judgment: retain J4.19 as the sole positive power contact while routing, with 0.60 A as a **qualification target**, not a completed cable rating. It is below the 25 °C headline rating but still requires the exact plug, cable conductor, ground return, contact temperature and source current-limit tolerances to be verified. A polyfuse hold rating alone is not a hard current limiter. Laboratory first-power current limiting and measured input power must come before unrestricted operation. Do not claim that trace widening alone qualifies this interface.

If qualification cannot support 0.60 A on one positive contact, a custom harness revision could reassign J4.16 from GND to a second LINK_12V contact while retaining ground contacts 4/7/10/13 and all four data pairs. That is only a fallback study: an ordinary cable may internally bond pin16 to ground/shields, so this change would require a specifically constructed and continuity-tested harness plus current-sharing analysis. Two paralleled 0.3 A contacts do not automatically make a tolerance-proof 0.6 A supply. **No pin reassignment is proposed for immediate integration.**

The source-side adapter must provide protected DC; XEM8310's 7.5–15 V input rating is not a 12 V output rating. Cable length, conductor gauge, maximum loop resistance and current-limit implementation remain adapter deliverables.

## Integration follow-up: edge rule and slot tolerance

For the +0.1 mm J4 x shift that adopts the drawing edge datum, root reports 0.425 mm shell-land copper-to-edge clearance. A documented **0.40 mm minimum limited to J4 SH pads** is reasonable against the fabricator's published 0.20 mm routed-edge capability; keep the general 0.50 mm rule and all hole/keepout/short checks. Subtracting a 0.20 mm inward outline error leaves 0.225 mm nominal margin; this arithmetic is not an acceptance report. High-precision ±0.10 mm outline service requires at least a 50 × 50 mm manufacturing panel with its specified tooling, rather than silently claiming the bare 33 × 36 mm board qualifies. [JLC rigid outline capabilities](https://jlcpcb.com/capabilities/Capab).

**The default slot tolerance needs explicit manufacturing acceptance.** Molex's finished shell slots are nominal 0.65 ±0.05 ×1.70 ±0.05 mm; JLC's published standard plated-slot tolerance is +0.13/−0.08 mm. Thus standard process limits do not automatically fit within the connector drawing's limits. Put the required finished-slot dimensions/tolerances in fabrication notes and obtain acceptance for these exact four slots. The advertised ±0.05 mm press-fit-hole service applies to circular holes, so it cannot be assumed for these slots. Neither a nominal footprint match nor the local edge-clearance rule resolves this tolerance issue.

Current thickness basis: [twelve-layer construction](Physical_Stackup_Proposal.md) and [connector process review](Connector_Thickness_And_Peg_Review.md). The earlier eight-layer thickness calculation is superseded for this checkpoint.
