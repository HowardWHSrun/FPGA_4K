# FPGA100T review snapshot — not for manufacture

Open `hardware/FPGA100T_Minimal.kicad_pro` in KiCad 10 with the complete folder intact. All hierarchical sheets and project-local libraries are included. Native CAD bytes are unchanged from the audited source snapshot; reports replace workstation paths with portable references. Views are engineering exports, not photographs or operating-hardware evidence.

The current 40 × 36 mm outline describes the core only. The release scope includes all 117 ASIC signals and the XEM8310 data/power/programming link. Their contact allocation and complete copper are not finished. Do not fabricate this snapshot. See the website's validation and release sections and `reports/Wiring_Status.json` for actual remaining work.

The fixed mode straps select SPI boot (M2:M1:M0 = 001); dedicated JTAG is taken to the custom Type-D port. J1, J2, J3, SW1, D1, R120 and test points were removed to reduce size. This custom powered port is not compatible with ordinary HDMI equipment. The XEM8310 carrier/adapter power contract is being designed and requires qualification.

Library provenance: FPGA and cached CoreSupport assets derive from KiCad 10.0.6 symbol/footprint libraries and retain their source fields. KiCad library assets use CC-BY-SA-4.0 with the KiCad libraries exception; see https://www.kicad.org/libraries/license/. PowerDraft package geometry was drawn from TI TPS62135 RGX0011A and Coilcraft XFL4020 manufacturer documentation. The custom LinkPort uses the Molex 46765 family mechanical footprint; exact orderable connector and cable remain subject to interface/DFM review. AMD's package CSV is included as a package-reference source. No additional license grant is asserted for manufacturer or lab material.

The 117-signal CSV records the corrected September 24 application count; package balls/contact fields remain unassigned. It is not a complete pinout or connector contract. The independently audited earlier connectivity snapshot is dated evidence; the current authoritative board hash and endpoint checks are in `Final_Snapshot_Audit.json` and `Wiring_Status.json`.

Excluded: personal chat/audio, rejected layout candidates, caches, routing experiments, unrelated firmware and local reference checkouts. Standard KiCad 3D models are not bundled; this does not prevent editing the project and missing 3D models do not establish mechanical fit.
