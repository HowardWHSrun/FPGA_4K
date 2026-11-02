# HDMI Extension Board V21

Published snapshot: 2 November 2026. Open `HDMI_Extension_Board_Study_V21.kicad_pro` in KiCad 10.0.6 or newer after extracting the whole folder. Keep libraries and models beside the project.

This package contains the current six-layer HDMI Extension Board, eight Micro-HDMI links with switched 5 V feeds, USB-C JTAG, and the XEM8310 PCIe interface. It includes the complete editable project and existing JLC Gerbers, BOM, CPL and order note. Signal integrity, ESD, thermal behavior, bracket fit, factory acceptance and powered qualification remain open. V21 has not had an independent electrical/layout review.

## Check results and packaging

- Packaged PCB, saved and reloaded: **0 DRC errors, 1 footprint-library warning, 0 open connections, 0 schematic/PCB parity findings**.
- Schematic: **0 ERC errors, 190 isolated-pin-label warnings**. No ignored categories or DRC exclusions.
- The original saved PCB had **164 DRC errors from stale zone-fill geometry**. Refilling clears these. The portable PCB includes regenerated fills; original main files are preserved under `records/as-saved/` as evidence. Use the root project for editing.
- Structural comparison confirms unchanged routing, footprint/pad geometry, nets, rules and zone boundaries after excluding cached fills, model paths and generator version. Model paths were made portable; active local source files were not changed.
- 267 schematic components, 282 PCB footprints, 4,611 track/via objects, 17 copper zones. JLC BOM: 238 fitted references in 63 groups; CPL contains the same 238 references.
- Every model referenced by the active PCB is available. Retained historical footprint-library entries contain 60 unresolved model references (38 distinct paths); these do not prevent displaying the active PCB. See `records/packaging-adaptations.json`. Nominal and substitute models do not establish physical fit.

## JLC files and known limits

[JLC order note](JLC_Order/ORDER_NOTE_FOR_JLC.md) · [Gerbers and drills](JLC_Order/HDMI_Extension_Board_V21_Gerbers.zip) · [BOM](JLC_Order/HDMI_Extension_Board_V21_BOM.csv) · [CPL](JLC_Order/HDMI_Extension_Board_V21_CPL.csv)

These order files are unchanged copies from the current folder; their ZIP integrity and BOM/CPL reference consistency were checked. This publication does not establish CAM equivalence, factory acceptance, placement approval or an order. The original order settings are retained in `records/START_HERE_as_saved.txt`.

The source documentation flags J4's 5 A rating versus the 6.3 A worst-case estimate, no input fuse/reverse-polarity protection, untested x8-or-larger slot/custom-bracket fit, and incompatibility with the older 3.3 V Frontend V4. Resolve these through the recorded reviews and physical tests.

## Sources

Source folder: `HDMI_Extension_Board_From_Scratch_V1`. Native filenames and library identities are preserved. `package-manifest.json` records original hashes, packaged hashes and adaptations. Source PCB SHA-256: `8ff7cc2fdc1c479b25f2f646e52ac867289ffdf3f1772307dc79cdd43fffe3c5`. Source schematic SHA-256: `6542532a85e274cc83eeaf0e4385a54eac447f99c28cb9b57f32c31b8596b803`.

The design derives from the Opal Kelly BRK8310 and project-authored changes; engineering citations remain on the schematic. Existing third-party library/model terms continue to apply; this publication grants no new rights. [KiCad library license](https://www.kicad.org/libraries/license/).
