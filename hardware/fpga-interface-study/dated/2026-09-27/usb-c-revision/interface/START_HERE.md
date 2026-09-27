# USB-C interface — 27 September 2026

- [Architecture, pin assignment and receiver contract](USB_C_Link_Contract.md)
- [Integration component/pin JSON](USB_C_Interface_Components.json): 24 additions, including one unfitted copper-only programming footprint; U210.16 is intentionally NC after selecting the true-PG eFuse.
- [Custom footprint native parse](evidence/Custom_Footprint_Native_Parse.json)
- [Custom interface footprints](USB_C_Interface.pretty/): TXU0304 RUT land pattern and five-pad SWD fixture.

Circuit handoff only. Integration, routing, firmware, signal integrity and hardware verification determine subsequent status. The earlier routed micro-HDMI board remains a separate frozen checkpoint, not evidence that this USB-C revision works.

Independent evidence: [connector pad transcription](evidence/USB4081_Independent_Pad_Review.json). The [native interface audit](evidence/Native_USB_Interface_Audit.json) binds a particular export and inputs; consult its status and hashes, since integration is ongoing. [Repository publication consistency checker](https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/scripts/check_usb_revision.py) (run from a complete repository clone; the independent source-pin audit uses the original engineering workspace).

Start with [what passed and what still needs implementation](USB_C_Interface_Review_Status.md).

- [Selected powered-off-safe mux revision and exact integration](TMUXHS4446_Power_Off_Review.md). The current schematic audit includes this selected part; physical routing remains in progress.

- [Four-pair physical routing and safe bitstream contract](Differential_Routing_Contract.md).

- [Historical WSON flash package candidate](wson_candidate/U6_WSON_Candidate_Review.md): superseded by the current 64 Mbit USON selection; preserved as design history.

- [Concise current USB-C release check](USB_C_Release_Check.md): necessary parts, concrete blockers and owners.

Current selected flash: [64 Mbit USON adoption and proposed carrier contact revision](uson_flash/U6_USON_Adoption_Review.md). The 128 Mbit WSON review above is historical. Final pin and physical routing audits must use the refreshed native project.

Latest independent schematic audit: **PASS**, 179 footprint-bearing parts, 55 supplied interface/power/connector parts, all 116 digital ASIC assignments, and all 993 logical endpoints checked against the current manifest. Native XML SHA-256: `b47e43e7cbb63e69a567d0a47e6d43e93dc3a34fc8993331b3f4e6b4d4238fe9`. This does not certify unfinished PCB routes or firmware.
