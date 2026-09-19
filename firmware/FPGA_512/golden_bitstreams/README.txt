Golden (known-good) bitstreams
==============================

adc_auto_adjust_test_KNOWN_GOOD.bit
-----------------------------------
Per-data-line independent test with automatic leading-zero detection (11-13).
8x adc_auto_adjust (sr_full version) -> 8x sync_fifo -> round-robin arbiter
-> {ch_id[3:0], sample[11:0]} raw words over FT600.

Built:    2026-07-21 16:41 from adc_auto_adjust_test/ (sr_full adc_auto_adjust.v)
Verified: all 8 channels PASS at midscale (mean ~2048, stddev 7-9) on hardware
          after ADC board power cycle.
SHA1:     5050228b878c83211bf9874444753967f1911624

Flash:
  /opt/oss-cad-suite/bin/openFPGALoader -c dirtyJtag --fpga-part LFE5U-25F -f \
      golden_bitstreams/adc_auto_adjust_test_KNOWN_GOOD.bit

Test (host reader sends start cmd 0x0100, reads N MB, per-channel stats):
  cd adc_auto_adjust_test && ./auto_adjust_test 5

Pass criteria per channel: mean in [1900,2200], stddev < 100.

Failure signature of a bad ADC-board state (NOT the FPGA/bitstream):
  all channels min=0 / max=4094, stddev > 1000 -> power cycle the ADC board.

adc_2ch_framed_KNOWN_GOOD.bit
-----------------------------
Pair-at-a-time framed pipeline: 8x adc_auto_adjust (all running) -> USB
command selects pair (0-3) -> 2ch strict-alternation TDM with valid/hold
handshake -> usb_framer (SYNC=0xA35, LANE=0, 132-word frames, CRC-12)
-> async_fifo -> FT600. Full production frame protocol over one lane.

Key fixes baked in (vs earlier failing builds):
  - usb_framer out_valid is combinational (= emitting); a registered
    out_valid drops the SYNC word and the host finds 0 frames.
  - Negedge first-stage capture of cb_d/cb_read: posedge sampling lands on
    the midscale MSB transitions (ADC0/ADC3 slots) in some placements,
    causing MSB drops on those slots only.

Built:    2026-07-22 from adc_2ch_framed/ (top_2ch_framed.v)
Verified: all 4 pairs / 8 channels PASS on hardware (stddev 7.0-8.8,
          0 CRC errors, 0 sequence gaps, ~7944 frames per pair).
SHA1:     7378e303a9c51ca9558f31bf7048b218910e801e

Flash:
  /opt/oss-cad-suite/bin/openFPGALoader -c dirtyJtag --fpga-part LFE5U-25F -f \
      golden_bitstreams/adc_2ch_framed_KNOWN_GOOD.bit

Test (cycles all 4 pairs, N MB each, frame decode + CRC + per-channel stats):
  cd adc_2ch_framed && ./pair_test 2

Pass criteria per channel: mean in (1900,2200), stddev < 100, 0 CRC errors.

adc_4lane_framed_KNOWN_GOOD.bit
-------------------------------
Full 4-lane production pipeline: 8x adc_auto_adjust -> 4x pair_tdm_framer
(SYNC 0xA35/0xB46/0xC57/0xD68, LANE 0-3, sample FIFO depth 64) ->
frame-granular round-robin arbiter -> async_fifo -> FT600. All 8 channels
stream continuously; every frame self-labelled by SYNC + LANE_ID, host
demuxes by lane. 33 MB/s sustained over USB.

Key fix beyond the pair build: memory writes moved out of async-reset
processes (sync_fifo mem, usb_framer dbuf) so yosys infers LUTRAM instead
of one-FF-per-bit — utilization dropped from 98% (unplaceable; also the
root cause of the old "93% LUT" full-pipeline failures) to ~13%.

Built:    2026-07-22 from adc_4lane_framed/ (top_4lane_framed.v)
Verified: all 4 lanes / 8 channels PASS simultaneously on hardware
          (stddev 7.0-8.7, 0 CRC / 0 seq / 0 lane_id errors,
          ~7950 frames per lane over 8 MB).
SHA1:     420d958c00ab63456e2851cc236bdb4916964e44

Flash:
  /opt/oss-cad-suite/bin/openFPGALoader -c dirtyJtag --fpga-part LFE5U-25F -f \
      golden_bitstreams/adc_4lane_framed_KNOWN_GOOD.bit

Test (reads N MB, demuxes 4 lanes, CRC + per-channel stats):
  cd adc_4lane_framed && ./lane_test 8

Pass criteria per channel: mean in (1900,2200), stddev < 100, 0 CRC errors.

adc_4lane_cmd_KNOWN_GOOD.bit
----------------------------
Same 4-lane pipeline as adc_4lane_framed_KNOWN_GOOD.bit, plus host-
controlled resets. BOOTS IN REAL-DATA MODE (CB_FE_RESET low), so a fresh
power-up reads live amplifier data, NOT midscale. Command byte on pipe
0x02 (send with adc_4lane_framed/board_cmd):
  0x11 chip-reset : pulse CB_CHIP_RESET (~62 ns)
  0x21 fe-pulse   : pulse CB_FE_RESET
  0x22 fe-on      : hold CB_FE_RESET high (test mode -> ~2048 midscale)
  0x23 fe-off     : CB_FE_RESET low (normal operation, boot default)

Built:    2026-07-23 from adc_4lane_framed/ (top_4lane_framed.v)
Verified: fe-on reproduces the golden midscale PASS (all 8 channels,
          stddev 7.0-8.7); fe-off streams real data with framing clean
          (0 CRC / 0 seq / 0 lane_id on all lanes); streaming resumes
          cleanly after chip-reset and fe-pulse.
SHA1:     43c2f4dfaabac358bd0e2f2facb4221993a7f1bc

Flash:
  /opt/oss-cad-suite/bin/openFPGALoader -c dirtyJtag --fpga-part LFE5U-25F -f \
      golden_bitstreams/adc_4lane_cmd_KNOWN_GOOD.bit

Midscale check (test mode must be enabled first):
  cd adc_4lane_framed && ./board_cmd fe-on && ./lane_test 8
