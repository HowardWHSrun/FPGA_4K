# FPGA PCB and LDO review

Howard Wang and Zitong · Wednesday, 7 October 2026

This meeting package presents a custom 35T FPGA prototype, the existing ASIC LDO board, and a newly received XEM8305 connector carrier. They are separate designs and revisions. Native KiCad layouts and 3D views support design review; routing, system timing, power behavior and assembled fit remain open.

## Zitong's component update and the M1 implementation

The [original component slide](Zitong_1007_Original.pptx) reports the following parts. M1 implements the choices shown in the last column.

| Function | Exact part in Zitong's slide | M1 decision |
| --- | --- | --- |
| FPGA | XC7A35T-2CSG325I | Retain the selected 35T |
| 125 MHz LVDS oscillator | AX3DCF1-125.0000T3 | Adopt on 1.8 V with the AC-coupling pair |
| LVDS clock splitter | LMK1D2102LRGTR | Omit provisionally while the GTP ODIV2 fabric-clock path awaits Vivado verification |
| 128 Mbit SPI flash | IS25WP128F-JKLE | Adopt on 1.8 V, SPI x1 |
| Flash level translator | NVT4858HKZ | Adopt with adapted boot holds and idle biases; physical boot validation remains open |

Zitong reports 150 FPGA user I/Os and four GTP lanes, with 117 user I/Os required for eight ASICs, four of which stimulate. The reported 122-unit FPGA stock is a dated source statement, rather than a current purchasing check. M1 retains separate power and configuration-DONE indicators.

The slide asks for better than ±20 ppm oscillator stability but lists a ±25 ppm part. Its quoted 186 fs RMS phase jitter does not establish the requested <10 ps peak-to-peak cycle-to-cycle jitter; the quoted characterization also uses 3.3 V rather than M1's 1.8 V. The NVT4858 originates from an SD/SDIO application. The SPI adaptation needs boot and brownout testing.

## Custom 35T board

Fresh native measurement corrects the older M1 README: **the outline is 41 × 41 mm**, with 287 components and **1,091 unrouted connections**. The edge drawing's stroke-inclusive bounds are 41.05 × 41.05 mm. The CLI's displayed 499-item list is a cap, rather than the total connection count. M1 has no tracks, vias or copper planes. Native ERC, physical DRC and schematic parity checks report zero findings.

M1 removes all 15 ASIC bus buffers and 56 parts overall, reducing the previous 343 components to 287. It preserves all 116 ASIC function paths and retains outgoing 33 Ω damping arrays, passive defaults and stimulation permission logic. Twenty-two receive-default arrays remain fitted. The direct nominal 1.5 V interface requires controlled power sequencing and qualification of ASIC pad levels, shared-control loading, timing and rail ramps. Freed placement area does not establish a smaller board.

Review the [complete M1 KiCad project](FPGA35T_M1_KiCad.zip) and [two-sheet schematic](FPGA35T_M1_Two_Sheet.pdf). R39 remains a preserved earlier reference.

## Gerald's recorded design advice

Howard's saved, relayed October 4 and October 6 directions attribute the following advice to Gerald: improve routing quality and placement regularity, match related clock/data timing, check power distribution and ground returns, keep bypass loops local, use manufacturable FPGA escapes, preserve compact functions and bottom mezzanine connectors, and provide a clear overall schematic. Gerald's suggested 1–2, 1–3 and 1–4 blind-via spans require a fabricator-supported construction.

The engineering application is to place by signal flow and actual pad order, remove avoidable detours before tuning, compare complete signal delays, and preserve continuous return references. These recorded directions do not supply guaranteed ASIC timing limits or factory approval.

## LDO and carrier revisions

The [original LDO project](LDO_Original_KiCad.zip) contains nine regulator/reference stages and 23 direct digital signal paths. J1 and J19 form the intended carrier mating pair; J19 has 24 electrically unassigned contacts. Rail names and nominal programming do not establish actual fitted rails, signed high-stage loads, return bonding or accepted power order.

The [new Board_Howard carrier snapshot](Board_Howard_KiCad.zip) differs from the saved October 6 Step 8 baseline. Its source authorship is unconfirmed.

| Native carrier result | Newly received Board_Howard | Saved Step 8 baseline |
| --- | --- | --- |
| Copper layers | 2 | 4 |
| Track segments / vias | 140 / 19 | 242 / 105 |
| Copper zones | 0 | 1 dedicated inner DGND plane |
| Native DRC findings | 38 errors + 21 dangling-track warnings | 0 |
| Assigned unconnected items | 20 | 0 |
| Schematic parity warnings | 204 | 204 |

Step 8 connects 54 common-ground contacts and retains 234 unassigned contacts. Its returned data/clock paths span 48.547–63.830 mm, a 15.283 mm geometric spread without an accepted skew limit. Those measurements and passing baseline checks do not transfer to the changed Desktop board. Both connector-foundation versions still lack the complete carrier power/startup circuit and operating FPGA/host workflow. The older R3 carrier retains its manufacturing hold.

The 3D previews show native placement geometry, with nominal bodies identified where applicable. They do not establish simultaneous connector seating or qualified XEM/LDO assembly clearance.

The original LDO render includes the native generic header bodies, with actual installed population unverified. Its Hirose J1/J19 housing models are absent, as they are in the connector-foundation carrier previews.
