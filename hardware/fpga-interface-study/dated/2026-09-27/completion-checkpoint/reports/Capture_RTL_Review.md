# Independent finite-capture RTL review

26 September 2026. Reviewed `raw_capture_bank.sv`, `raw_capture_array.sv`, `tb_raw_capture.sv`, the test runner and their documented interface. This review does not modify RTL. The three source hashes match [Verification.json](https://howardwhsrun.github.io/FPGA_4K/firmware/artix7/2026-09-26/raw_capture/Verification.json), checked at 2026-09-27 02:32:11 UTC.

**Result: no demonstrated CDC-protocol or functional defect was found in the current finite-capture engine under its intended synchronous-control interface.** This is source/test review, not a metastability analysis or physical timing sign-off.

| Mechanism | Review result |
|---|---|
| Request crossing | A persistent toggle crosses three registers in each falling-edge ASIC clock domain. The control side cannot issue another accepted request while any bank is unfinished. This avoids losing a short command pulse. |
| Buffer boundaries | Each bank writes addresses 0 through depth−1 exactly once, then stops. The completion toggle changes at the same edge as the last write and crosses three control-clock registers before the wrapper exposes the capture. |
| RAM read safety | The wrapper accepts reads only after all eight buffers are stable. A new accepted arm suppresses a coincident read and invalidates the old capture before writes restart. Chip selection and RAM output advance on the same synchronous reader edge. |
| Reset | Bank handshake state asserts reset asynchronously; local reset release waits for local clock edges. A stopped bank cannot retain a prior completed toggle through reset. Control logic consumes the asynchronously asserted reset pipeline on its clock. RAM contents intentionally are not reset. |
| Held/rejected arm | Arm is edge-detected. Holding it high cannot retrigger; new edges during busy are rejected rather than queued. Rearming intentionally discards an unread prior capture. |
| Missing clock | The engine remains busy rather than announcing a partial capture as complete. `chip_done` supports diagnosis; clock resumption or reset is needed. No timeout exists. |

The tests use eight distinct periods/phases and check every stored word against the data actually present at the falling edge, in reverse chip/address read order. They exercise both request-toggle phases, reset during acquisition, a missing clock through reset, read rejection and held arm. Their scoreboard observes the internal write-enable condition, so it strongly checks stored data/address integrity but is not a separate specification of command-to-first-sample latency. That latency is intentionally clock-dependent, and the design does not claim simultaneous starts across chips.

## Integration conditions that must remain explicit

1. `arm`, `read_enable`, `read_chip` and `read_address` must be synchronous to `control_clk`, or pass through a suitable transaction adapter. The current engine does not synchronize an asynchronous host bus. A future JTAG transport must honor this contract.
2. ASIC data is source-synchronous, not an arbitrary asynchronous bus. Falling-edge capture still needs actual external clock/data setup/hold limits, input-delay constraints and implemented timing closure.
3. Keep the request/completion synchronizer stages and their `ASYNC_REG` intent. Review CDC and reset recovery/removal in Vivado with the actual nine clock resources and I-grade timing conditions. Do not mask physical clock-placement errors using unrestricted dedicated-route overrides.
4. The final memory write precedes an accepted read by the completion handshake latency. Preserve this stable-buffer protocol when adding JTAG readout; do not expose a live bank or permit overlapping rearm/read access.
5. No ASIC clocks, SPI commands, resets, stimulation controls or analog outputs are generated here. The top-level startup sequence and inactive ASIC states still need implementation.

The existing simulations use ideal digital edges and cannot model metastability, PCB timing, analog thresholds, power sequencing or clock quality. Generic XC7 synthesis supports RAM inference and structural consistency; it does not establish place-and-route legality or produce the board's bitstream. No new defect-driven RTL change is recommended by this review.
