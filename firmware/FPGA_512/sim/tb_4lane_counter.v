// =============================================================================
// tb_4lane_counter.v - Sample-exact time-advancement test for the 4-lane
//                      framed pipeline (8x adc_auto_adjust -> 4x
//                      pair_tdm_framer -> lane_frame_arbiter).
//
// Unlike tb_4lane_framed.v (static per-channel values, blind to holds and
// duplicates), every channel here carries a per-group incrementing ramp:
//
//   value(group, adc) = 0x800 | ((group*4 + adc) & 0x7FF), adc cycling 0-3
//
// MSB is forced to 1 because adc_auto_adjust's offset detection probes
// sr_full[59]/[60] = ADC3's MSB for offsets 12/13 — detection only works
// with MSB=1 data (midscale-like). An unconstrained ramp exposes that
// data-dependence (all channels misalign), which is a separate, real
// fragility — but this bench targets time-advancement, so we keep MSB=1.
//
// Each line's sample stream is then a +1 ramp in the low 11 bits: a
// channel's consecutive data words (amp k -> group g0+k/4, adc k%4 ->
// value 4*g0+k) differ by exactly +1 (mod 2048), seamlessly across frame
// boundaries. Any hold (delta 0), duplicate, skip, or reorder anywhere in
// adc_auto_adjust -> pair_tdm_framer (sync_fifos + TDM handshake) ->
// lane_frame_arbiter fails loudly with lane/frame/word position.
//
// Serial stimulus keeps the cycling 11/12/13 leading zeros of the original
// testbench; random fifo_full backpressure (~25%) exercises stalls.
//
// After the normal phase, two forced-stall episodes (fifo_full held ~1150
// then ~3200 cycles) overflow the 64-deep lane sample FIFOs on purpose.
// The LANE_ID drop nibble (payload {hi,~hi}, hi = {drop[3:0], lane[1:0]})
// must then reconcile with the ramp gaps actually observed: equal when no
// nibble saturated at 15, otherwise 0 < reported <= missing. Drops must
// never be reported outside the stress phases, and holds are always errors.
//
// Run:
//   iverilog -g2012 -s tb_4lane_counter -o sim/tb_4lane_counter \
//     sim/tb_4lane_counter.v fpga/adc_auto_adjust.v fpga/usb_framer.v \
//     fpga/pair_tdm_framer.v fpga/lane_frame_arbiter.v \
//     decoder/UWB_Serial_Handler.v
//   vvp sim/tb_4lane_counter
// =============================================================================

`timescale 1ns/1ps

module tb_4lane_counter;

    localparam N_ADC      = 4;
    localparam ADC_BITS   = 12;
    localparam GRP_CYCLES = 64;
    localparam BASE_ZEROS = 11;
    localparam FRAMES_REQ = 20;    // frames per lane before stopping

    reg clk = 0;
    always #15.625 clk = ~clk;

    reg rst_n = 0;

    // =========================================================================
    // Serial stimulus: per-group ramp, serialized bit-interleaved like the
    // real front-end (bit order: ADC0.b0 ADC1.b0 ADC2.b0 ADC3.b0 ADC0.b1 ...)
    // All 8 lines carry the same ramp: sample(group, adc) = group*4 + adc.
    // =========================================================================
    reg [7:0] data_in;
    reg       next_amps = 0;
    reg [5:0] data_cyc = 0;
    integer   group_cnt = 0;

    always @(posedge clk) begin
        if (!rst_n) begin
            data_cyc  <= 0;
            group_cnt <= 0;
            next_amps <= 0;
            data_in   <= 0;
        end else begin
            next_amps <= 0;

            if (data_cyc == GRP_CYCLES - 1) begin
                data_cyc  <= 0;
                next_amps <= 1;
                group_cnt <= group_cnt + 1;
            end else begin
                data_cyc <= data_cyc + 1;
            end

            begin
                integer actual_zeros, bit_idx, which_bit, which_adc, c;
                reg [11:0] v;
                actual_zeros = BASE_ZEROS + (group_cnt % 3); // 11, 12, 13

                if (data_cyc >= actual_zeros &&
                    data_cyc < actual_zeros + N_ADC * ADC_BITS) begin
                    bit_idx   = data_cyc - actual_zeros;
                    which_bit = bit_idx / N_ADC;
                    which_adc = bit_idx % N_ADC;
                    v = 12'h800 | ((group_cnt * 4 + which_adc) & 12'h7FF);
                    for (c = 0; c < 8; c = c + 1)
                        data_in[c] <= v[which_bit];
                end else begin
                    data_in <= 0;
                end
            end
        end
    end

    // =========================================================================
    // DUT chain: 8x adc_auto_adjust -> 4x pair_tdm_framer -> arbiter
    // =========================================================================
    wire [7:0]  chv;
    wire [11:0] chd [0:7];

    genvar gi;
    generate
        for (gi = 0; gi < 8; gi = gi + 1) begin : g_deser
            adc_auto_adjust #(
                .N_ADC(N_ADC), .ADC_BITS(ADC_BITS),
                .GRP_CYCLES(GRP_CYCLES), .BASE_ZEROS(BASE_ZEROS)
            ) u_deser (
                .clk(clk), .rst_n(rst_n),
                .data_in(data_in[gi]), .next_amps(next_amps),
                .auto_adjust(1'b1),
                .sample_valid(chv[gi]), .sample_data(chd[gi]),
                .sample_adc_id(), .detected_extra()
            );
        end
    endgenerate

    wire [3:0]  lane_fr_valid;
    wire [63:0] lane_fr_words;
    wire [3:0]  lane_stall;

    genvar li;
    generate
        for (li = 0; li < 4; li = li + 1) begin : g_lane
            pair_tdm_framer #(
                .SYNC_PATTERN(12'hA35 + 12'h111 * li),
                .LANE_NUM(li[3:0]),
                .FIFO_DEPTH(64)
            ) u_lane (
                .clk(clk), .rst_n(rst_n),
                .even_valid(chv[2*li]),   .even_data(chd[2*li]),
                .odd_valid (chv[2*li+1]), .odd_data (chd[2*li+1]),
                .fr_valid(lane_fr_valid[li]),
                .fr_word (lane_fr_words[li*16 +: 16]),
                .fifo_full(lane_stall[li]),
                .frame_ready()
            );
        end
    endgenerate

    reg         fifo_full = 0;
    wire        out_wen;
    wire [15:0] out_word;

    lane_frame_arbiter dut (
        .clk(clk), .rst_n(rst_n),
        .fr_valid(lane_fr_valid),
        .fr_words(lane_fr_words),
        .lane_stall(lane_stall),
        .fifo_full(fifo_full),
        .out_wen(out_wen),
        .out_word(out_word)
    );

    // Random backpressure ~25%; stress_mode forces a continuous stall
    reg stress_mode = 0;
    always @(posedge clk)
        fifo_full <= stress_mode | (($random & 3) == 0);

    // =========================================================================
    // CRC-12 reference (matches host lane_test.c)
    // =========================================================================
    function [11:0] crc12;
        input [11:0] crc_in;
        input [11:0] word;
        reg [11:0] c;
        integer i;
        begin
            c = crc_in ^ word;
            for (i = 0; i < 12; i = i + 1) begin
                if (c[11]) c = {c[10:0], 1'b0} ^ 12'h80F;
                else       c = {c[10:0], 1'b0};
            end
            crc12 = c;
        end
    endfunction

    function [15:0] sync_of;
        input integer l;
        sync_of = 16'hFA35 + 16'h0111 * l;
    endfunction


    // =========================================================================
    // Frame decoder / sample-advancement checker
    //
    // Per channel (8 = 4 lanes x even/odd), track the last decoded sample.
    // Consecutive data words of one channel are consecutive line samples,
    // so every sample must be 0x800 | ((last+1) mod 2048) — including
    // across frame boundaries. Holds (delta 0), skips (2..16), garbage fail.
    // =========================================================================
    integer wptr = -1;
    integer cur_lane = 0;
    reg [11:0] crc_acc;
    reg [11:0] last_cnt [0:3];
    integer have_cnt [0:3];
    integer lane_frames [0:3];

    reg [11:0] last_val [0:7];     // per channel
    integer    have_val [0:7];
    integer    holds [0:7];
    integer    skips [0:7];
    integer    others [0:7];
    integer    checked [0:7];
    integer    gaps [0:7];         // expected gaps during/after stress

    // Drop-report bookkeeping (fix 2)
    reg        gap_ok = 0;                 // set once stress begins
    integer    reported_drops [0:3];       // sum of LANE_ID drop nibbles
    integer    missing_ev [0:3];           // ramp samples missing, even ch
    integer    saturated [0:3];            // any nibble hit 15
    reg [3:0]  drop_nib;

    integer frames = 0;
    integer errors = 0;
    integer k, ch;
    reg [11:0] exp_v, delta;
    initial for (k = 0; k < 8; k = k + 1) begin
        have_val[k] = 0; holds[k] = 0; skips[k] = 0; others[k] = 0;
        checked[k] = 0; gaps[k] = 0;
        if (k < 4) begin
            have_cnt[k] = 0; lane_frames[k] = 0;
            reported_drops[k] = 0; missing_ev[k] = 0; saturated[k] = 0;
        end
    end

    always @(posedge clk) begin
        if (rst_n && out_wen) begin
            if (wptr < 0) begin
                for (k = 0; k < 4; k = k + 1)
                    if (out_word == sync_of(k)) begin
                        cur_lane = k;
                        wptr     = 1;
                        crc_acc  = crc12(12'd0, out_word[11:0]);
                    end
                if (wptr < 0) begin
                    errors = errors + 1;
                    if (errors <= 20)
                        $display("ERROR t=%0t: expected SYNC got %04h", $time, out_word);
                end
            end else begin
                if (wptr == 1) begin
                    // {4'hE, hi[5:0], ~hi[5:0]}, hi = {drop[3:0], lane[1:0]}
                    if (out_word[15:12] !== 4'hE ||
                        out_word[5:0] !== ~out_word[11:6] ||
                        out_word[7:6] != (cur_lane & 3)) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d LANE_ID malformed: %04h",
                                 $time, cur_lane, out_word);
                    end else begin
                        drop_nib = out_word[11:8];
                        if (drop_nib != 4'd0) begin
                            reported_drops[cur_lane] = reported_drops[cur_lane] + drop_nib;
                            if (drop_nib == 4'd15) saturated[cur_lane] = 1;
                            if (!gap_ok) begin
                                errors = errors + 1;
                                $display("ERROR t=%0t: lane %0d reports %0d drops outside stress phase",
                                         $time, cur_lane, drop_nib);
                            end
                        end
                    end
                    crc_acc = crc12(crc_acc, out_word[11:0]);
                end else if (wptr == 2) begin
                    if (out_word[15:12] !== 4'hD) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d CNT tag got %04h", $time, cur_lane, out_word);
                    end
                    if (have_cnt[cur_lane] &&
                        (((last_cnt[cur_lane] + 12'd1) & 12'hFFF) !== out_word[11:0])) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d CNT gap got %03h expected %03h",
                                 $time, cur_lane, out_word[11:0],
                                 (last_cnt[cur_lane] + 12'd1) & 12'hFFF);
                    end
                    last_cnt[cur_lane] = out_word[11:0];
                    have_cnt[cur_lane] = 1;
                    crc_acc = crc12(crc_acc, out_word[11:0]);
                end else if (wptr <= 130) begin
                    if (out_word[15:12] !== 4'h0) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d data tag got %04h wptr=%0d",
                                 $time, cur_lane, out_word, wptr);
                    end
                    // --- sample-advancement check ---
                    ch = 2*cur_lane + ((wptr - 3) % 2);
                    if (have_val[ch]) begin
                        exp_v = 12'h800 | ((last_val[ch] + 12'd1) & 12'h7FF);
                        if (out_word[11:0] !== exp_v) begin
                            delta = (out_word[11:0] - last_val[ch]) & 12'h7FF;
                            if (gap_ok && delta > 12'd1) begin
                                // expected drop gap during/after stress
                                gaps[ch] = gaps[ch] + 1;
                                if ((ch & 1) == 0)
                                    missing_ev[cur_lane] = missing_ev[cur_lane]
                                                           + (delta - 12'd1);
                            end else begin
                                errors = errors + 1;
                                if (delta == 12'd0) holds[ch] = holds[ch] + 1;
                                else if (delta <= 12'd16) skips[ch] = skips[ch] + 1;
                                else others[ch] = others[ch] + 1;
                                if (errors <= 20)
                                    $display("ERROR t=%0t: ch %0d (lane %0d word %0d frame %0d): got %03h expected %03h (delta %0d)",
                                             $time, ch, cur_lane, wptr - 3,
                                             lane_frames[cur_lane], out_word[11:0],
                                             exp_v, delta);
                            end
                        end else begin
                            checked[ch] = checked[ch] + 1;
                        end
                    end
                    last_val[ch] = out_word[11:0];
                    have_val[ch] = 1;
                    crc_acc = crc12(crc_acc, out_word[11:0]);
                end else begin
                    // wptr == 131: CRC
                    if (out_word[15:12] !== 4'hC) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d CRC tag got %04h", $time, cur_lane, out_word);
                    end
                    if (out_word[11:0] !== crc_acc) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d frame %0d CRC got %03h expected %03h",
                                 $time, cur_lane, lane_frames[cur_lane], out_word[11:0], crc_acc);
                    end
                    lane_frames[cur_lane] = lane_frames[cur_lane] + 1;
                    frames = frames + 1;
                    wptr = -1;
                end
                if (wptr > 0) wptr = wptr + 1;
            end
        end
    end

    // =========================================================================
    // Test sequence
    // =========================================================================
    task wait_more_frames;
        input integer n;
        integer b0, b1, b2, b3;
        begin
            b0 = lane_frames[0]; b1 = lane_frames[1];
            b2 = lane_frames[2]; b3 = lane_frames[3];
            wait (lane_frames[0] >= b0+n && lane_frames[1] >= b1+n &&
                  lane_frames[2] >= b2+n && lane_frames[3] >= b3+n);
        end
    endtask

    // Watchdog
    initial begin
        #300_000_000;
        $display("TIMEOUT");
        $display("  FAIL");
        $finish;
    end

    integer l, drops_ok;
    initial begin
        rst_n = 0;
        #200;
        @(posedge clk);
        rst_n = 1;

        // ---- Phase 1: normal run, no drops allowed ----
        wait (lane_frames[0] >= FRAMES_REQ && lane_frames[1] >= FRAMES_REQ &&
              lane_frames[2] >= FRAMES_REQ && lane_frames[3] >= FRAMES_REQ);

        // ---- Phase 2a: medium stall ----
        // Absorb capacity per channel = 64 (sample FIFO) + up to 64 (share of
        // the framer dbuf if it was collecting) = 1024..2048 cycles at 1
        // sample/16 cycles. 2250 cycles guarantees >=12 drops on every lane,
        // possibly below nibble saturation.
        gap_ok = 1;
        @(posedge clk); stress_mode = 1;
        repeat (2250) @(posedge clk);
        stress_mode = 0;
        wait_more_frames(6);   // flush the drop report

        // ---- Phase 2b: long stall (saturates the 4-bit drop nibble) ----
        @(posedge clk); stress_mode = 1;
        repeat (3200) @(posedge clk);
        stress_mode = 0;
        wait_more_frames(6);

        // ---- Reconcile reported drops vs observed ramp gaps ----
        drops_ok = 1;
        for (l = 0; l < 4; l = l + 1) begin
            $display("  lane %0d: reported=%0d missing(even ch)=%0d saturated=%0d",
                     l, reported_drops[l], missing_ev[l], saturated[l]);
            if (reported_drops[l] == 0 || missing_ev[l] == 0) drops_ok = 0;
            if (saturated[l]) begin
                if (reported_drops[l] > missing_ev[l]) drops_ok = 0;
            end else begin
                if (reported_drops[l] != missing_ev[l]) drops_ok = 0;
            end
        end

        $display("");
        $display("============================================================");
        $display("  4-Lane Counter (sample-advancement) Test: %0d frames, %0d groups",
                 frames, group_cnt);
        $display("  per lane: L0=%0d L1=%0d L2=%0d L3=%0d",
                 lane_frames[0], lane_frames[1], lane_frames[2], lane_frames[3]);
        $display("------------------------------------------------------------");
        for (k = 0; k < 8; k = k + 1)
            $display("  ch %0d: %0d samples checked, holds=%0d skips=%0d other=%0d gaps=%0d",
                     k, checked[k], holds[k], skips[k], others[k], gaps[k]);
        $display("------------------------------------------------------------");
        $display("  TOTAL: %0d errors, drop reconciliation %s",
                 errors, drops_ok ? "OK" : "FAILED");
        $display("============================================================");
        if (lane_frames[0] >= FRAMES_REQ && lane_frames[1] >= FRAMES_REQ &&
            lane_frames[2] >= FRAMES_REQ && lane_frames[3] >= FRAMES_REQ &&
            errors == 0 && checked[0] > 1000 && drops_ok)
            $display("  PASS");
        else
            $display("  FAIL");
        $display("============================================================");
        $finish;
    end

endmodule
