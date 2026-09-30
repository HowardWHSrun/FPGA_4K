# R12 single-link interposer study

29 September 2026. One custom 19-contact link through J201 to XEM MC3 bank 226. **Schematic implemented; layout in progress. Not for fabrication.**

[Wednesday's three slides](../../../../../presentation/meetings/2026-09-30.html) · [Full 10-sheet schematic PDF](R12_Full_Schematic.pdf) · [Interactive sheets](../../../../../presentation/schematic/?board=adapter-r12) · [Current 3D](../../../../../presentation/adapter/assembly.html?revision=r12) · [Complete editable KiCad ZIP](R12_Single_Link_Interposer_Public_Study.zip)

All 19 numbered contacts have concrete native schematic destinations. The circuit includes fixed-direction 1.2 V / target-1.8 V JTAG translation, recovery-probe selectors, separately armed TPS259470LRPWR power, five ground returns and a shield-bond option. Contacts 9/11 are **Reserved**. Target VTREF powers the translator B-side bias. The shared external regulated 12 V source feeds XEM through MC2; a separate eFuse branch feeds cable contact 19.

## Current native evidence

| Check | Result |
|---|---|
| Schematic contacts / sheets / physical components | 19 / 10 / 45 |
| Native schematic ERC | 0 findings |
| Cable contacts reaching all intended native copper endpoints | 10 / 19 |
| Selected serial conductors | 8 / 8 |
| MC1 / MC2 same-contact pass-throughs | 160 / 160 |
| Remaining MC3 pass-throughs | 67 / 67 |
| Selected BRK contacts isolated | 13 / 13 |
| Native physical DRC errors / dangling warnings | 0 / 11 |
| Native open connections / schematic parity findings | 9 / 0 |
| Independent physical net conflicts | 0 |

[Independent copper audit](validation/R12_Independent_Contact_Audit.md) · [19-contact CSV](validation/R12_Independent_Contact_Audit_19_Contacts.csv) · [Native DRC](validation/R12_Current_Layout_DRC.json) · [Schematic implementation](reviewers/R12_Schematic_Implementation.md).

The four cable JTAG nets (2/15/17/18) remain physically open. Ground comprises six copper components: the main return plus isolated J201.4/.7/.10, U301.8 and R132.2. **The eFuse ground is open, so the 12 V branch is not electrically completed.** The [ground-gap visual](figures/R12_Independent_Ground_Continuity.svg) shows this from the native copper graph. All 10 copper zones are filled; eight connector keepout areas are intentional.

## Power and review limits

The [power-flow visual](figures/R12_2W_FPGA_Allowance_Power_Flow.svg) records a roughly 0.24–0.32 A 12 V scenario with a chosen 2 W FPGA rail allowance, eight ASICs and estimated conversion losses. This is a planning calculation, not a measured or XPE-backed maximum. The 6.49 kohm eFuse resistor gives roughly 0.514 A nominal; current-limit, startup and cable thermal/drop/fault behavior remain provisional. The common SMBJ15CA TVS does not hold XEM below its 15 V maximum; source and upstream overvoltage protection need review.

The 8-layer HDI stackup, impedance, pair geometry, returns, supply widths/thermal capacity, clock/link, firmware/USB, component footprints, connector mating and service-wing fit remain unqualified. Default selectors use the recovery probe; XEM-master mode requires explicit gateware and arming. Nothing has been powered or released for manufacture.

## Package and geometry provenance

`project/` contains exact native CAD and project-relative library bytes, with unchanged used KiCad standard footprints added for portability. Editor state, private history, caches and routing experiments are omitted. Report text copies normalize workstation prefixes; original and public hashes are recorded in [manifest.json](manifest.json). Standard 3D bodies require installed KiCad libraries; six custom stack connector bodies are absent.

The interposer browser GLB is exported from this saved PCB with native copper/pads/zones/silkscreen. Official XEM/BRK meshes come from [Opal Kelly's models](https://www.opalkelly.com/products/models/). Exploded separation and cable curves are illustrative. The service-wing centering transform was checked against actual world-transformed mesh bounds; this is not a fit or collision qualification. [Viewer provenance](../../../../../presentation/adapter/assets/provenance.json).
