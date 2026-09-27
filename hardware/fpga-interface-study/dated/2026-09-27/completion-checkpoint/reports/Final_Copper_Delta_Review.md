# Root review of final copper and endpoints

27 September 2026. Scope: acceptance of the documented CAD delta, not fabrication release or electrical qualification.

The frozen final board is 2975050c28c89fc96bf781cf082bffffc84189e6720ce05c4200d8552ac298fc; the immutable comparison is 7db8944f46e592aa31432101cd6ac02b91897155b3c7962f09dbd57118a8dba7.

I reviewed the exact before/after measurements against the already reviewed C52/C92 AUX feed repairs, 0.05 mm ground-via shift, fixed M2 ground intent, two mezzanine contact moves and fixed SPI x1 endpoint group. Only the two M2 fanout objects change electrical ownership, CFG_M2 to GND. Eleven VCC_LINK_2V5 segments preserve their coordinates/widths and move from old In5 to new In9 with the selected twelve-layer mapping.

The eleven retained zone changes comprise three fill-only regenerations and eight changed definitions. Seven definitions change only their layer according to the selected stack. The eighth preserves net, priority, clearance and connection settings and extends the Bank16 bulk region from x21.4 to22.95 mm over y7.2–10.6 mm, then follows the prior boundary. Two added GND zones on In4/In7 reproduce the 0.5 mm-inset board rectangle with 0.15 mm clearance and solid connections; no zone is removed. The all-zero native physical DRC and independent all-pad connectivity readback cover the resulting saved fills, but do not prove PDN impedance or signal return quality.

Added copper implements the assigned ASIC and support nets; no added copper has unexpected net ownership. Removed copper contains the superseded repairs, redundant vias/stubs and optional SPI quad-data branches. The source routing owner's full ledger preserves these UUID deltas and the twelve-layer via spans. U1 data-ball ownership, analog reservation and all other contact assignments are unchanged.

The accepted endpoint set is the exact union of three independently documented groups: R113 removal/direct M2 ground, the two data-contact swaps, and R106/R107 removal with L14/M14 intentional NC for SPI x1. The separate saved application reports and final netlist establish implementation. Flash WP#/RESET# pull-ups remain.

This review accepts the exact retained signatures and endpoint changes for a checked design checkpoint. It does not close source/cable design, mounted PDN (including shared capacitor mounting vias), SI/PI/timing, connector assembly, bitstream or powered tests. The manufacturing-readiness flag remains false.
