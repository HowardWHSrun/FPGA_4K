# Full-system interface proposal — engineering development

**Current review:** [The fourth uncertainty register](fourth_check/Uncertainty_Register.md) tracks the open requirements and closure evidence. [The third independent audit](Triple_Check_Review.md) adds connector-edge and bring-up findings and qualifies the cable/JTAG and power-budget calculations below. This document remains dated development evidence; it is not a release or measured performance guarantee.

2026-09-26. The release scope is all 117 ASIC signals and an XEM8310 receiver link. This document chooses a development architecture; it does not assert implemented firmware, measured bandwidth or a manufacturing release.

## Board-to-board connection

Two 60-contact mezzanines are the user-selected connection. Proposed FPGA-side parts are Samtec QSH-030-01-L-D-A, mating with QTH-030-01-L-D-A at a nominal 5 mm board spacing. Samtec’s mated drawing gives 5.03 mm fully seated for the -01/-01 pair, with up to +0.178 mm tolerance; use that envelope for mechanical clearance. Each has 60 signal contacts plus an independent ground blade. All blade solder lands connect to GND. The 117 named signals occupy 117 of 120 contacts; three remain reserved. No ASIC power allocation is inferred from those three contacts.

[Contact-by-contact proposal](mezzanine/Mezzanine_Contact_Proposal.csv). This is a proposed connector allocation, not a frozen FPGA ball assignment. AC_IN and IMP_TST remain electrically unresolved after review of native reference boards, the ASIC tutorial and public author firmware. [Evidence](research/AC_IN_IMP_TST_Primary_Source_Review.md).

The 40 × 36 mm placement study includes both mezzanines and the corrected 1206 regulator input capacitors, with 128 components and zero native physical DRC violations. The drawing review also records a 0.02645 mm inconsistency in the manufacturer’s alignment-hole-to-first-contact dimension; the footprint remains a candidate pending resolution. Its signal contacts are unassigned and all tracks are deliberately absent: it proves a component-placement candidate, not routing or electrical completeness. The later bank-rail revision adds C92 and R122; those and input protection still need inclusion in the complete assembly and size check.

## Receiver and cable

XEM8310 is the FPGA/USB receiver. It needs a carrier to expose the custom micro-HDMI port and supply its protected power branch. Its onboard JTAG interface programs the XEM FPGA; it is not an automatic programmer for the remote 100T.

The candidate data link uses the four physical cable pairs as three FPGA-to-receiver LVDS data lanes and one forwarded clock. The 100T CSG324 bank16 has four complete differential pairs. Its proposed bank voltage is 2.5 V for LVDS_25 outputs. The receiver candidate is XEM8310 bank64 at 1.8 V, using its HP differential inputs and suitable termination; final MC1 contact selection must be checked in the Opal Kelly pin map and implemented constraints. Do not use bank67's fixed 1.2 V as though it offered the same LVDS termination capability. [Opal Kelly expansion connector specification](https://docs.opalkelly.com/xem8310/expansion-connectors/).

**Second-pass finding: direct DC coupling is not qualified by these bank voltages.** The Artix-7 transmitter's maximum output common-mode voltage is 1.425 V, equal to the receiver's maximum DC input common mode. Positive headboard ground offset therefore has no guaranteed margin at that output corner. For example, 0.60 A through a 0.15 Ω effective return adds 90 mV; the existing 0.30 Ω total-loop bound does not prevent this. This is a missing worst-case guarantee, not evidence that every physical unit would fail. [DS181 Table 11, page 11](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content), [DS931 LVDS limits and footnotes](https://docs.amd.com/r/en-US/ds931-artix-ultrascale-plus/LVDS-DC-Specifications-LVDS).

The link needs an explicit common-mode solution. A candidate is carrier-side AC coupling of all four pairs with defined receiver bias and termination, continuous balanced data/clock activity, and receiver reset during startup or clock loss. This could retain a small headboard, but capacitor values, bias/equalization settings, signal amplitude, baseline wander, startup transients and timing still need design and verification. Adding capacitors alone is not a completed fix. [AMD UG571](https://docs.amd.com/api/khub/documents/kFbaUC5HGcXyGNauhgU6Gw/content).

Runtime commands could use a BSCAN user chain over the already-present JTAG wires. XEM8310 user GPIO would implement the remote JTAG master; its own configuration JTAG pins do not provide that function. This requires new receiver/head FPGA firmware and host command handling and remains a proposal.

Receiver startup must be explicit: XEM8310 VIO1 defaults to 1.0 V. The proposed 1.8 V bank64 operation requires the `XEM8310_VIO1_VOLTAGE` setting of `180`, a power cycle, and rail verification. Firmware must respect `BOARD_READY`, establish a receiver-ready/training handshake and disable drive toward an unpowered target. Neither these interlocks nor the receiver firmware is implemented here. JTAG needs its own guaranteed logic-level/return-drop budget; it cannot use AC coupling. [Device settings](https://docs.opalkelly.com/xem8310/device-settings/), [BOARD_READY](https://docs.opalkelly.com/xem8310/usb-3-0-host-interface/).

At a candidate 800 Mbit/s per data lane with 8b/10b coding, three lanes provide 1.92 Gbit/s payload capacity before framing. The ASIC tutorial's 4096 channels × 31,250 samples/s × 12 bits is 1.536 Gbit/s (192 MB/s). A 6144-byte packed-sample frame plus 20 bytes of metadata/CRC and one byte of three-lane alignment padding would use 192.65625 MB/s, about 80.3% of the 240 MB/s coding-limited link capacity. This is arithmetic, not achieved throughput.

This architecture requires packing the 12-bit samples. Forwarding 16 bits per sample would need 2.048 Gbit/s before framing and would not fit this candidate. The ASIC's raw serial framing, returned clocks, valid sample selection, loss detection and stimulation metadata must be implemented and verified. Both FPGA timing closure and sustained receiver-to-PC-to-disk testing remain mandatory. Exact speed grade and line rate are not released.

## Power path

The development choice is a regulated 12 V ±5% carrier supply, split before XEM8310. A separately current-limited custom cable branch powers the small FPGA board. The XEM8310 itself accepts 7.5–15 V; its GPIO/VIO pins must not be treated as the head-board supply. [Opal Kelly power specification](https://docs.opalkelly.com/xem8310/powering-the-xem8310/).

Proposed qualification limits: 0.60 A continuous cable load, maximum 0.30 m custom cable, finished power/return loop resistance ≤0.30 Ω, and connector/cable current qualification at the actual ambient temperature. D19 carries supply and D16 is the designated return. D1 is target JTAG reference, not a power input. Pair shields and shell grounds remain connected. An ordinary HDMI cable or host is not a defined substitute.

[Power audit](Power_Electrical_Release_Audit.md) defines source protection, local damping proposal, effective capacitor checks, rail-current ceilings and unresolved hot-plug qualification. The approximately 5.2 W rail-output allowance is an engineering budget with assumed converter efficiency, not a measured requirement or guaranteed operating envelope. No PCB power-up, stimulation or hardware experiment has been performed.

## Remaining release work

- Actual ASIC electrical definitions for AC_IN/IMP_TST and input/output limits, clock relationships and reset/test behavior.
- Complete 117-signal schematic/netlist and FPGA bank/clock allocation, with constraints checked by Vivado.
- Receiver carrier, custom cable drawing and contact continuity map; power protection, common-mode treatment, receiver bias and termination circuit.
- Full-board copper, ground-return and power-distribution checks; connector alignment, stack clearance and final manufacturer stackup/impedance rules.
- Synthesis/timing, boot/programming and end-to-end acquisition firmware; electrical, thermal, throughput and recovery tests.
- Exact orderable BOM, assembly orientation, paste/gerber/drill/job outputs, supplier DFM and release archive. No fabrication-ready package is issued by this proposal.
