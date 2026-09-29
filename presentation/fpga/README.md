# Custom FPGA board website — 29 September 2026

[Selected XC7A25T board](current-25t.html) · [three-port adapter and exact MC3 map](../adapter/) · [XEM8310 / BRK8310 receiver](../xem/) · [earlier XC7A50T review](index.html).

The selected device is **XC7A25T-2CSG325I**. The proposed system uses **three separate custom FPGA PCBs and three custom 19-contact µHDMI cables** to one XEM8310 receiver. The current 25T native PCB is an unrouted 36 × 38 mm placement; its inherited DF40 interface is under redesign. The ASIC/carrier partition across these three boards is unresolved. The [25T section](current-25t.html) shows three copies of its native-derived 3D placement, with missing package bodies clearly simplified.

The [28 September 50T board and 158-part purchasing draft](index.html) remain an **earlier review**, not the selected device, current BOM or a manufacturing release. The [routed 100T micro-HDMI checkpoint](micro-hdmi.html), [USB-C development revision](usb-c.html) and [28 September 5 V contact proposal](micro-hdmi-19.html) are separate historical studies. The 29 September R7/R8 interface study selects 12 V on each cable contact 19, but the protected receiver-side source, current budget and power branch hardware are not implemented.

## Website and native files

`current-25t.html` presents the selected 25T direction. `index.html` preserves the historical 50T board and its native parts review. `micro-hdmi.html` preserves the routed 100T checkpoint, and `usb-c.html` preserves the separate USB-C review. [viewer/boards.json](viewer/boards.json) binds each native file to its SHA-256 and parser counts; the 50T board is the first/default entry. KiCanvas is a read-only review viewer, with [documented limits](viewer/README.md).

The complete [50T KiCad ZIP](../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/FPGA50T_Two_60_Compact_Review_2026-09-28.zip) includes the PCB, 14 schematic sheets (overview + 13 detail) and local libraries. The preserved [100T micro-HDMI ZIP](../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/FPGA100T_33x36_Routing.zip) and [USB-C ZIP](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/FPGA100T_USB_C_Development.zip) remain separate. Extract a whole project before opening its `.kicad_pro` file.

## Verification before publication

Freeze the complete native project. Export a fresh schematic netlist, ERC and PCB DRC with schematic parity; compare every component/pin/net to the manifest. Check all 116 ASIC assignments, actual copper gaps, placement, via/pad intersections and differential-path requirements. Bind reports and views to that exact source hash. Physical and electrical checks are separate from firmware operation and manufacturing approval.

From the repository root:

```sh
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
git diff --check
```

Use the browser to verify the current 25T section and R8 adapter view. The earlier 50T page retains its native layers, 3D switch, 48-line/158-reference historical parts filter, CSV downloads and mobile layout. Run the separate 100T and USB-C checks for those revisions. GitHub Pages uses the `presentation` branch. Verify deployment and deployed asset hashes after publication.

## Preserved earlier material

[Micro-HDMI presentation](micro-hdmi.html) · [125-part native checkpoint](viewer/?board=compact-routed) · [earlier pin map](pins/) · [earlier presenter notes](data/Presenter_Notes.md) · [45-page learning PDF](../../hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.pdf).

Those files describe the earlier 125-part / 752-endpoint board and do not cover the USB-C additions. The earlier `review-data.json`, teaching JSONs and pin-map CSVs remain bound to that historical source.

[Gerald's ASIC slide review](../../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md), [earlier placement studies](micro-hdmi.html#design-history), [200T/50T slides](history-2026-09-24.html) and [meeting records](../meetings/) retain their original dates and context. The newly supplied private discussion is not included in the public repository.
