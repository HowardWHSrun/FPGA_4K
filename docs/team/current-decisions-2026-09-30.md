# Current decisions · 30 September 2026

These 12 items record confirmed scope, function boundaries and component choices. **Resolved means the stated decision is confirmed.** It does not mean CAD implementation, timing closure, link qualification or hardware testing is complete.

Use the [shared questions and answers board](https://fpga-team-questions.hwr.chatgpt.site) for the current decision register, pending questions, named replies and saved status history. This dated record preserves the confirmations and remaining limits from the source records named below.

## 1. Which FPGA is the active device?

Use XC7A25T-2CSG325I. Earlier 50T, 100T and 200T designs are historical revisions. This resolves device selection; full recording/configuration/stimulation resource fit, timing and hardware validation remain outstanding.

**Confirmed by:** Howard Wang — direct confirmation recorded on 30 September 2026.

**Source:** `Current_Confirmed_Scope.md`.

## 2. What is the current XEM-to-FPGA topology?

One XEM8310 communicates with one 25T through the single-link XEM adapter board. Older three-FPGA assembly figures describe earlier review context. This is the selected topology, not proof that the adapter or complete link is qualified.

**Confirmed by:** Howard Wang — direct confirmation recorded on 30 September 2026.

**Source:** `Current_Confirmed_Scope.md`.

## 3. Which functions must the 25T retain?

Retain recording, ASIC configuration and stimulation. Recording-only operation is not the selected first-revision scope. The complete implementation must still demonstrate resource and timing fit.

**Confirmed by:** Howard Wang — direct confirmation recorded on 30 September 2026.

**Source:** `Current_Confirmed_Scope.md`.

## 4. Where are ASIC clock, data, latch and control generated?

The 25T generates ASIC clock, data, latch and control signals locally after receiving XEM commands. The proposed cable control pair carries configuration/stimulation commands; the 25T-to-ASIC interface carries the local GPIO waveforms. The command protocol and gateware remain to be implemented. This decision does not approve removing or reassigning cable VTREF.

**Confirmed by:** Howard Wang — runtime boundary explicitly confirmed in the current scope record.

**Source:** `Current_Confirmed_Scope.md`.

## 5. Does one external cable carry both power and data?

One external cable carries both power and data. The input voltage, available source/current, protection and cable qualification remain open, as does the internal ASIC power-feed arrangement. This requirement does not select 5 V, 12 V or the proposed pin-19 supply range.

**Confirmed by:** Howard Wang — retained in the current confirmed choices and schematic checklist.

**Source:** `Schematic_Plan_And_Decisions.md`.

## 6. Which configuration flash has been selected?

Use the CP SOM ONE 128 Mbit reference flash, identified in the current plan as MX25L12833FZNI-10G. The selected part needs a 3.3 V supply and revised SPI translation including CCLK. The native CAD still contains the older 1.8 V, 32 Mbit flash circuit, so this is a selected component awaiting implementation.

**Confirmed by:** Howard Wang — selected 128 Mbit CP reference flash; matching full MPN documented in the current scope record.

**Source:** `Current_Confirmed_Scope.md`.

## 7. What is the first-revision boot and recovery policy?

Store one normal FPGA program in flash and recover through JTAG. Automatic fallback to a separate program is outside the selected first-revision policy. Contact pads versus a header, the lab programmer and its supported target voltage, and the actual recovery procedure remain open.

**Confirmed by:** Howard Wang — recovery policy selected on 30 September 2026.

**Source:** `Current_Confirmed_Scope.md`.

## 8. What is the ASIC connector requirement?

Use two 60-contact floating connectors, with the smallest practical form factor. Earlier four-30-contact planning is superseded as a contact-count requirement. Exact make, mating parts, board gap and any extra power contacts remain open; neither the rigid native placeholders nor the FX23L candidate is an approved final selection.

**Confirmed by:** Howard Wang — two 60-contact floating connectors confirmed in the current scope record.

**Source:** `Current_Confirmed_Scope.md`.

## 9. What is the mechanical design priority?

Minimize the complete board and assembly size: the smaller the better, while meeting the electrical and mechanical requirements. The existing 36 × 38 mm outline and eight-layer concept are study references, not selected dimensions or construction.

**Confirmed by:** Howard Wang — mechanical priority directly confirmed on 30 September 2026.

**Source:** `Current_Confirmed_Scope.md`.

## 10. What is the confirmed ASIC interface count?

The ASIC interface has 117 functional positions, including analog AC_IN. Gerald added four SPI_CLK signals and agreed to 117 in the September 24 correction. The analog-aware allocation is 116 FPGA-linked signals plus the separate AC_IN position; grounds and supply paths are additional.

**Confirmed by:** Gerald Topalli — explicit September 24 correction, preserved and reviewed in the current source record.

**Source:** `ASIC_Source_Confirmed_Requirements.md`.

## 11. Which recording level, clock and capture edge are already confirmed?

Use nominal 1.5 V ASIC signaling, a 32 MHz recording clock, and falling-edge recording capture in each chip's returned clock/data domain. These facts are confirmed; guaranteed pad thresholds, loading and numeric timing limits remain outstanding. They do not determine STIM_CLK, whose frequency remains unresolved.

**Confirmed by:** Gerald Topalli — nominal voltage/recording-clock source from September 18; falling-edge capture confirmed September 26.

**Source:** `ASIC_Source_Confirmed_Requirements.md`.

## 12. What is the confirmed high-level recording startup order?

Configure the ASIC through SPI, perform the digital and analog resets, then start the recording clock. The relative order of the two resets, pulse widths, settling delays and any clock needed during configuration/reset remain to be specified. The high-level sequence is confirmed; a complete startup implementation has not been verified.

**Confirmed by:** Gerald Topalli — explicit September 26 answer, preserved in the current source record.

**Source:** `ASIC_Source_Confirmed_Requirements.md`.
