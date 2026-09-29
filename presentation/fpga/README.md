# FPGA board website — 28 September 2026

[Featured 50T micro-HDMI PCB](index.html) · [158 fitted parts](index.html#parts) · [native PCB viewer](viewer/?board=fpga50t) · [preserved 100T checkpoint](micro-hdmi.html) · [USB-C development revision](usb-c.html) · [50T 19-contact proposal](micro-hdmi-19.html).

The website opens with the **unrouted XC7A50T micro-HDMI review board**. Its native PCB has a 36 × 38 mm outline and 174 footprints. The [48-line grouped parts CSV](../../sources/engineering/2026-09-28/Micro_HDMI_50T_Grouped_Purchasing_Draft.csv) covers all 158 fitted buyable references for one PCB; 0 DNP items and copper-only test pads are excluded. It is a purchasing draft, not an approved cart or entire-system BOM. The J4.19 `LINK_12V` label is inherited; neither 12 V nor the earlier 5 V proposal is a qualified supply. The cable and receiver still need electrical approval; Two DF40T 60-contact connector pairs are a mechanical review candidate.

The [preserved routed 100T micro-HDMI checkpoint](micro-hdmi.html) and [separate USB-C revision](usb-c.html) remain available with their own source files and counts. The [50T 19-contact proposal](micro-hdmi-19.html) records the candidate cable plan; the current native schematic and unrouted PCB remain the engineering review. None of these boards is released for manufacture.

## Website and native files

`index.html` presents the 50T board first. `micro-hdmi.html` preserves the routed 100T checkpoint, and `usb-c.html` preserves the separate USB-C review. [viewer/boards.json](viewer/boards.json) binds each native file to its SHA-256 and parser counts; the 50T board is the first/default entry. KiCanvas is a read-only review viewer, with [documented limits](viewer/README.md).

The complete [50T KiCad ZIP](../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/FPGA50T_Two_60_Compact_Review_2026-09-28.zip) includes the PCB, 14 schematic sheets (overview + 13 detail) and local libraries. The preserved [100T micro-HDMI ZIP](../../hardware/fpga-interface-study/dated/2026-09-27/completion-checkpoint/FPGA100T_33x36_Routing.zip) and [USB-C ZIP](../../hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision/FPGA100T_USB_C_Development.zip) remain separate. Extract a whole project before opening its `.kicad_pro` file.

## Verification before publication

Freeze the complete native project. Export a fresh schematic netlist, ERC and PCB DRC with schematic parity; compare every component/pin/net to the manifest. Check all 116 ASIC assignments, actual copper gaps, placement, via/pad intersections and differential-path requirements. Bind reports and views to that exact source hash. Physical and electrical checks are separate from firmware operation and manufacturing approval.

From the repository root:

```sh
python3 scripts/check_docs.py
python3 scripts/check_hardware.py
git diff --check
```

Use the browser to verify the default 50T board, native layers, 3D switch, 48-line/158-reference parts filter, CSV downloads and mobile layout. Run the separate 100T and USB-C checks for those revisions. GitHub Pages uses the `presentation` branch. Verify deployment and deployed asset hashes after publication.

## Preserved earlier material

[Micro-HDMI presentation](micro-hdmi.html) · [125-part native checkpoint](viewer/?board=compact-routed) · [earlier pin map](pins/) · [earlier presenter notes](data/Presenter_Notes.md) · [45-page learning PDF](../../hardware/fpga-interface-study/dated/2026-09-27/completion-report/FPGA100T_Current_Learning_Review.pdf).

Those files describe the earlier 125-part / 752-endpoint board and do not cover the USB-C additions. The earlier `review-data.json`, teaching JSONs and pin-map CSVs remain bound to that historical source.

[Gerald's ASIC slide review](../../hardware/fpga-interface-study/slide_review/Gerald_ASIC_Slide_Review.md), [earlier placement studies](micro-hdmi.html#design-history), [200T/50T slides](history-2026-09-24.html) and [meeting records](../meetings/) retain their original dates and context. The newly supplied private discussion is not included in the public repository.
