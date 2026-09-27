# USB-C FPGA review — 27 September 2026

[Open the presentation](index.html) · [inspect the native PCB](viewer/?board=usb-c) · [complete KiCad ZIP](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/FPGA100T_USB_C_Development.zip) · [26-sheet schematic](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_Schematics.pdf).

The active revision replaces micro-HDMI with a full-featured USB-C connector, negotiated/protected power, a USB2 control/JTAG device and a four-pair orientation switch. The 100T, two ASIC mezzanines and 116 digital ASIC assignments are retained. AC_IN remains a separate external 0–1.5 V analog source requirement.

**Engineering development, not for manufacture.** The page loads the exact [native audit](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_Native_Audit.json); it displays actual open connections and native findings instead of inheriting the earlier board's results. [Every numbered pin](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/reports/USB_C_All_Pin_Connections.csv) and [the circuit explanation](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/USB_C_Design_Explanation.md) accompany the project. Firmware, the matching source/host/receiver adapter, power and cable qualification, ASIC timing and manufacturing acceptance remain unfinished.

## Website and native files

`index.html` and `usb-c.html` present the USB-C revision. `usb-c.js` reads its audit and supports front/back pan/zoom plus a native viewer. [viewer/boards.json](viewer/boards.json) binds each native file to its SHA-256 and parser counts. Static views use the same frozen CAD; only display colors, viewport and overview annotations change. KiCanvas is a read-only review viewer, with [documented limits](viewer/README.md).

The complete native folder includes its project, PCB, 26 schematic sheets and local libraries. Extract the entire ZIP before opening the `.kicad_pro` file. The native basename remains stable to preserve dependencies.

## Verification before publication

Freeze the complete native project. Export a fresh schematic netlist, ERC and PCB DRC with schematic parity; compare every component/pin/net to the manifest. Check all 116 ASIC assignments, actual copper gaps, placement, via/pad intersections and differential-path requirements. Bind reports and views to that exact source hash. Physical and electrical checks are separate from firmware operation and manufacturing approval.

From the repository root:

```sh
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
git diff --check
```

Use the browser to verify current data loading, front/back selection, zoom/fit, native layer inspection, downloads and mobile layout. The older teaching/presentation check scripts target the preserved micro-HDMI page and data; their success does not validate the USB-C design. GitHub Pages uses the `presentation` branch. Verify deployment and deployed asset hashes after publication.

## Preserved earlier material

[Micro-HDMI presentation](micro-hdmi.html) · [125-part native checkpoint](viewer/?board=compact-routed) · [earlier pin map](pins/) · [earlier presenter notes](data/Presenter_Notes.md) · [45-page learning PDF](../../hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.pdf).

Those files describe the earlier 125-part / 752-endpoint board and do not cover the USB-C additions. The earlier `review-data.json`, teaching JSONs and pin-map CSVs remain bound to that historical source.

[Gerald's ASIC slide review](../../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md), [earlier placement studies](micro-hdmi.html#design-history), [200T/50T slides](history-2026-09-24.html) and [meeting records](../meetings/) retain their original dates and context. The newly supplied private discussion is not included in the public repository.
