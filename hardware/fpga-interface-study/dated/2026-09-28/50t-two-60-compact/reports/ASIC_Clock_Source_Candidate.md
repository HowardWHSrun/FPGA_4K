# ASIC 32 MHz clock source candidate after Step 13

**28 September 2026 — read-only calculation and source review.** This is a firmware and timing proposal for the **unrouted** XC7A50T-CSG325 board. It is not an implemented FPGA design, a validated clock route, or an ASIC timing approval.

## What the present schematic actually connects

The Step 13 exported netlist (local source; not included in web package) shows `Y2` (SiT9396AA-02A3-1800-125.000000) through separate 100 nF AC-coupling capacitors `C145/C146` to `U1.D6/D5`, respectively `MGTREFCLK0P/N_216`. The AMD XC7A50T-CSG325 package CSV (local source; not included in web package) independently identifies D6 and D5 as that reference-clock pair. The exact [SiTime part page](https://www.sitime.com/parts/sit9396aa-02a3-1800-125000000) identifies a 125 MHz, 1.8 V LVDS oscillator with ±50 ppm stability.

All eight `ASICx_CLK32MHz_Out` nets still run directly from U1 I/O balls to the 60-contact connectors. The U1 ball/contact pairs are ASIC1 P14/J5.9, ASIC2 T14/J5.20, ASIC3 P15/J5.31, ASIC4 E13/J5.42, ASIC5 E15/J7.9, ASIC6 D13/J7.20, ASIC7 P4/J7.31 and ASIC8 R2/J7.42. No schematic component yet produces 32 MHz. The separate `FABRIC_CLK_1V5_TBD` net is an external U1.N3 contact and has no selected source. Step 13 removed only the **disconnected** Y1/R119/C102/C103 island; it did not remove a previously functioning ASIC clock source.

## Plausible single-oscillator firmware topology

```text
Y2 125 MHz LVDS -> C145/C146 -> U1 D6/D5 -> IBUFDS_GTE2
                                             | O -> GTP reference
                                             ` O -> BUFG -> MMCME2 -> BUFG 32 MHz
                                                                -> 8 x ODDR -> I/O pads -> J5/J7
```

[AMD UG482 Table 2-1](https://docs.amd.com/api/khub/documents/Xk_zMbXsJj92suJ4_0Akkg/content) permits the `IBUFDS_GTE2` **O** output to feed the GTP reference and a BUFG/BUFH through HROW; only one of O or ODIV2 can enter fabric. Use O at 125 MHz for the candidate. [AMD UG472 Table 1-1 and MMCM input description](https://docs.amd.com/api/khub/documents/1kFbRqzm2fhwGy~cLQG2yA/content) show the reference can reach BUFG, and BUFG can feed an MMCM. The MMCM does **not** compensate input-path delay when fed by BUFG. A direct same-region reference-to-CMT path may be possible, but actual XC7A50T placement/connectivity must be proved by Vivado; this proposal relies on the BUFG path and does not assume the direct one.

An **integer-only** MMCM solution is:

| Setting | Value | Calculation |
| --- | ---: | --- |
| `CLKIN1_PERIOD` | 8.000 ns | 125 MHz input |
| `DIVCLK_DIVIDE` (`D`) | 5 | phase detector = 125 / 5 = **25 MHz** |
| `CLKFBOUT_MULT_F` (`M`) | 32.000 | VCO = 125 × 32 / 5 = **800 MHz** |
| `CLKOUT0_DIVIDE_F` (`O`) | 25.000 | output = 800 / 25 = **32 MHz**, period 31.25 ns |

These counter settings are within [UG472 Table 3-7](https://docs.amd.com/api/khub/documents/1kFbRqzm2fhwGy~cLQG2yA/content). The 125 MHz input, 25 MHz PFD, 800 MHz VCO and 32 MHz output lie within the conservative **-1** limits in [DS181 Table 37](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content): input 10–800 MHz, PFD 10–450 MHz, VCO 600–1200 MHz and output 4.69–800 MHz. The exact U1 **speed grade is not yet specified** in the schematic value, so selection and implementation must still be checked. Frequency stability inherited from a ±50 ppm Y2 would nominally make 32 MHz vary by ±1.6 kHz; MMCM output **phase jitter and I/O edge jitter cannot be inferred from ppm** and need tool data and measurements.

One `CLKOUT0` could feed a global 32 MHz network and eight I/O `ODDR` instances (constant D1=1, D2=0) for clock forwarding. [AMD's 7-series ODDR description](https://docs.amd.com/r/en-US/ug953-vivado-7series-libraries/ODDR) and [UG903 forwarded-clock guidance](https://docs.amd.com/r/en-US/ug903-vivado-using-constraints/Forwarded-Clocks) support this architecture in principle. The eight outputs are **frequency related**, but matching their connector-edge phase, duty cycle, drive, termination, return path and timing at each ASIC remains a separate SI/timing task. The existing nets span I/O banks 14, 15 and 34; use one clock tree and per-output timing constraints, not eight unconstrained fabric counters.

## Boot and test implications

Y2 can become electrically active when its 1.8 V supply is valid, but these eight **FPGA I/O** outputs cannot be counted on as clocks during FPGA configuration. The 7-series global three-state control holds user I/O drivers off through configuration/startup; [UG470 startup timing](https://docs.amd.com/api/khub/documents/FOs3lXmlcWxBhTIFxVKyGA/content) also makes clear that `DONE` can assert before startup is wholly finished. Therefore the new **DONE LED reports configuration**, not a valid 32 MHz ASIC clock. After startup, firmware should wait for MMCM `LOCKED`, synchronize reset release and hold ASICs inactive until the clock is stable. [UG472](https://docs.amd.com/api/khub/documents/1kFbRqzm2fhwGy~cLQG2yA/content) says clock outputs should not be used before `LOCKED` and prescribes reset when lock is lost. The MMCM startup lock time upper bound in [DS181 Table 37](https://docs.amd.com/api/khub/documents/iAkxxTOk96ANLJqYf2hgrQ/content) is 100 µs **after its valid input and startup conditions**; it is not a total power-to-clock guarantee.

The currently proposed flash boot still works conceptually without a discrete 32 MHz oscillator because its master-SPI configuration path uses CCLK, not these ASIC output clocks. Confirm in Vivado/bench that the selected bitstream and power sequence make the eight clocks available at the required time. If an ASIC **must** see 32 MHz before FPGA configuration or while FPGA is unprogrammed/faulted, this Y2→FPGA solution cannot satisfy it; that requirement would justify a separate always-on clock generator and a revised reset/power plan.

## Gate before removing the clock question from review

1. Gerald/ASIC owner confirms frequency tolerance, startup deadline, duty-cycle and per-ASIC skew/phase requirement, and whether clocks are required before FPGA `DONE`.
2. Select the exact XC7A50T speed grade. In Vivado, instantiate the chosen `IBUFDS_GTE2` shared with the GTP, BUFG, `MMCME2`, output BUFG and eight ODDRs; run synthesis, place/route, DRC and timing for the **actual CSG325 pins**. Resolve any clock-resource route failure there before treating Y1 removal as a final architecture choice.
3. Constrain the generated 32 MHz clock and all eight forwarded-clock ports; check output skew/drive/1.5 V receiver compatibility, connector ground returns, impedance and routing lengths after PCB routing exists.
4. Check Y2 supply/startup and GTP jitter budgets independently. `±50 ppm` frequency stability does not validate the 125 MHz serial reference or the generated 32 MHz clock's phase noise.

**Recommendation:** keep the Step 13 compact hardware as an **unrouted review candidate** with no replacement Y1 footprint, and record this integer MMCM topology as the first Vivado experiment. Do not mark the eight ASIC clocks implemented or guaranteed until the gates above pass. If ASIC operation before FPGA configuration is required, reinstate a **connected** always-on oscillator in a new dated revision.
