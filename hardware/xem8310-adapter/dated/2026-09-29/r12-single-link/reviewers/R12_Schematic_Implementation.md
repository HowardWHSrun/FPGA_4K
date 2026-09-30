# R12 single-link schematic implementation

29 September 2026, America/Chicago. The new R12 study implements **one J201 19-contact link** to XEM MC3 bank 226. R11 three-port work remains in its separate dated folder; it was not changed to impersonate a single-link design.

[Native root schematic](../project/BRK8310_Single_Link_Interposer_R12.kicad_sch) · [10-sheet PDF](../R12_Full_Schematic.pdf) · [native XML netlist](../validation/R12_Full_Netlist.xml) · [component/pin manifest](../validation/R12_Component_Pin_Map.json) · [all 19 destinations](../validation/R12_All_19_Contact_Destinations.json) · [ERC](../validation/R12_ERC.json).

## Implemented circuit

| Cable contacts | Circuit destination |
|---|---|
| 3 / 5 | XEM MC3 41 / 43, bank-226 RX0 |
| 6 / 8 | XEM MC3 45 / 47, bank-226 RX1 |
| 9 / 11 | **Reserved**, XEM MC3 49 / 51 |
| 12 / 14 | XEM MC3 42 / 44, bank-226 TX0 to target control RX |
| 1 | Target-derived 1.8 V reference / translator B rail; no host rail drives it |
| 2 / 15 / 17 / 18 | TMS / TDI / TCK / TDO through translated XEM bridge and recovery-probe source selection |
| 4 / 7 / 10 / 13 / 16 | Shared SYS_GND returns |
| 19 | Separately armed, current-limited 12 V eFuse branch |
| SH, outside numbered 19 | 0-ohm SYS_GND shield-bond review option |

The JTAG bridge uses SN74AXC4T774PWR with three outputs to the target and one TDO return. Its A rail taps XEM MC3.80 **+1.2V_DDR**; this is a rail contact, not GPIO. Bank-67 GPIO contacts 57 / 59 / 61 / 63 / 65 map to TMS / TDI / TCK / TDO / OE_N. Matching lower BRK contacts are isolated. MC3 banks 224 and 225 pass through completely; MC1 and MC2 retain all 160 same-contact paths.

Three 1x3 source shunts default to **2-3 PROBE**. All three must move to **1-2 XEM** for XEM-master operation. A separate normally-open ARM shunt connects GPIO OE_N; 10 kohm holds the translator disabled when unarmed or when the GPIO is high impedance. Target reference powers the B-side bias and bypass capacitor, so it has a real load and is not a strictly zero-current sense input. The host never supplies this rail.

TPS259470LRPWR provides the single cable-power branch. The proposed current resistor is **6.49 kohm, 1%**: its 6.5549 kohm worst high value stays below the manufacturer's 6.65 kohm recommended maximum. Its approximate 0.514 A nominal threshold remains provisional. The 750k/100k EN divider defaults off without its arm shunt; 1M/90.9k sets OVLO and 4.7nF sets the nominal ramp. ITIMER/AUXOFF are intentionally NC; FLT_N is an unpulled test point. SMBJ15CA on the shared input does **not** protect the XEM against exceeding its 15 V operating maximum. Use a clean regulated 12 V entry and review upstream protection separately.

## Verification and limits

Fresh KiCad 10.0.6 exports contain **45 physical components**, **4 off-board external-power flags**, **274 nets**, **10 sheets**, and **19/19 cable contacts with a concrete second circuit node**. Native ERC reports **0 findings** after the selected ICs' pin roles were changed to actual input, output, power and open-drain-compatible roles. The four external flags assert the actual external supply origins; they are not manufactured parts. PCB routing and 3D validation are separate work and are not certified by this schematic report.

The current source, FPGA/ASIC load, cable thermal/drop/fault rating, target regulator entry and sequence, GT clock/link, USB/gateware, HDI stackup, continuous references and mechanical fit remain qualification gates. The candidate is **not a fabrication release**. Connector and passive footprint assignments are concrete PCB choices but still require final manufacturer-part, assembly and land-pattern checks.

| Artifact | SHA-256 |
|---|---|
| `project/BRK8310_Single_Link_Interposer_R12.kicad_sch` | `783fb49f5873c605a68a460356af555d684d1919b568cc7f1432f5efeb63b615` |
| `validation/R12_Full_Netlist.xml` | `e0571d340fa2a3f22d49ec2255a61a708f7f97875977283bbd4d0397ace5bfab` |
| `validation/R12_Full_Schematic.pdf` | `372839f3fa2962559a5b1a89716df1a3a9c1ddf6f2af75915bbe0d8375d2c587` |

Rebuild with `python3 scripts/export_schematic.py` from this topic. The script rebuilds native sheets, exports netlist/ERC/PDF/SVG, and writes the physical component manifest, candidate BOM and 19-contact destination record.
