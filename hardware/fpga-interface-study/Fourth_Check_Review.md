# Fourth review — uncertainties, source continuity and current status

26 September 2026. **Review complete; the board remains incomplete and not released for manufacture.** The current action list is [18 uncertainties and their closure criteria](fourth_check/Uncertainty_Register.md), with six known implementation gaps recorded separately. [Structured register](fourth_check/Uncertainty_Register.json).

## What this pass actually checked

Three independent reviews challenged the ASIC/boot, power/receiver, and CAD/mechanical assumptions. All **110 native CAD/library/table files** still match the third-pass baseline. The two additional review ZIPs were rechecked: **57 rail-revision files, 29 mezzanine-study files**, including **24 native CAD files** identical to their sources. All **132 J5/J6 pad records** match the library numerically. [Continuity evidence](fourth_check/Source_Continuity.json).

The third-pass physical DRC/continuity results still describe these unchanged files: core **139** missing connections, rail revision **347**, mezzanine placement **383**, with zero physical-rule violations. Both schematics had **211 open-pin errors and ten warnings** with all ERC categories enabled. Native DRC/ERC was **not rerun in this pass**; it would add no new evidence without changed CAD or rules. These counts exclude the unassigned ASIC application nets. No hardware was powered, programmed or tested.

## Findings and corrections

1. **The ASIC electrical gap covers every interface class.** The nominal 1.5 V reference does not supply guaranteed thresholds, loading, output drive or powered-off limits. AC_IN/IMP_TST also have unknown functions. A custom-ASIC specification or designer-approved equivalent is required; a generic Internet datasheet cannot resolve it. [ASIC/boot detail](fourth_check/ASIC_Boot_Uncertainties.md).
2. **The USB transport needs a packing rule.** The proposed 6,165-byte link frame is neither a four-byte word multiple nor a sixteen-byte USB3 Pipe transfer multiple. Continuous aggregation/repacking or deliberate receiver padding can solve this without changing the physical link frame, but that implementation is absent. [Opal Kelly API requirements](https://docs.opalkelly.com/fpsdk/frontpanel-api/fpga-communication/).
3. **Host stalls require an explicit buffer/overflow contract.** All four proposed fast pairs travel toward XEM8310; USB throttling does not stop ASIC data. At the proposed 192.65625 MB/s framed rate, a 100 ms no-drain interval needs 19.27 MB. The complete nominal 2 GiB would represent only 11.15 seconds as an ideal upper bound, before reserves or bandwidth limits. Compact framing produces about 693.56 GB/hour before storage overhead. These are calculations, not demonstrated recording performance. [Power/link detail](fourth_check/Power_Link_Uncertainties.md).
4. **An earlier audit flag was a text-comparison error.** Third-pass CAD prose said the mezzanine pads matched, but its JSON flag was false because `.279` and `0.279` were compared as strings. Fresh numeric comparison resolves that inconsistency: all 132 records match dimensions, shape, layers and drills. The old evidence is preserved and explicitly corrected here; no footprint modification was needed. [Mechanical detail](fourth_check/CAD_Mechanical_Uncertainties.md).
5. **Component research narrowed a candidate but did not close its qualification.** Molex's [467651001 page](https://www.molex.com/en-us/products/part-detail/467651001) identifies a top-mount through-hole-shell option. The exact BOM selection, current drawing, cable qualification and J4's 0.70 mm edge-placement discrepancy remain open. Naming a family member does not resolve the mechanical conflict.
6. **Active documentation had drifted behind the review page.** Team setup/ownership and hardware guides still pointed to the earlier 200T/KR260 import. Current entry guides now point to the 100T/XEM8310 review and distinguish the three separate design revisions. Source guides now disclose all-category ERC, the 1.5 V bank-specific pin budget and unverified JTAG operation. Dated meetings and native historical designs retain their original content.

## What remains open

The register covers ASIC electrical limits, timing, physical mapping, inactive states and power; exact FPGA grade and legal pin/clock allocation; both connector interfaces; actual power/thermal demand and protection; XEM contacts/voltage behavior; LVDS/JTAG margins; packet/USB/command handling; buffering and host stalls; fabrication/size; boot recovery; and measured end-to-end operation.

The known unfinished work is separate: no integrated full-board file, unassigned application pins, missing copper, absent complete firmware/receiver implementation, no released fabrication outputs, and no prototype acceptance record. These are not speculative risks that another documentation check can eliminate.

## Information needed versus engineering work

The lab/ASIC/routing designers need to supply the actual ASIC interface and physical grouping/power/mating specification. The system owner needs to define operating conditions, recording duration and acceptable behavior during host interruption. An exact FPGA order code is needed from the user only if already purchased or mandated.

Power architecture, detailed pin selection, component/cable choice, receiver circuits and firmware remain delegated engineering work. The register assigns **proposed roles**, not personal commitments. Every row names concrete evidence required for closure; none is silently marked complete.

Current downloadable CAD remains frozen to its reviewed source hashes. The updated uncertainty list is an accompanying live document; it does not retroactively change the dates or scope of the included historical checks. Publication status and deployed-file verification are recorded in the local handoff after deployment.
