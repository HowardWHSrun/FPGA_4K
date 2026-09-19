// =============================================================================
// tb_4lane_framed.v - Testbench for the 4-lane framed pipeline
//                     (8x adc_auto_adjust -> 4x pair_tdm_framer ->
//                      lane_frame_arbiter), i.e. everything in
//                      top_4lane_framed.v except IO/PLL/FT600.
//
// Drives 8 serial ADC channels, each with a distinct value
// (ch i = 0x800 + i*0x10) and variable leading zeros (11-13). Decodes the
// arbitrated single-stream output and checks, per lane:
//   - SYNC word 0xFA35/0xFB46/0xFC57/0xFD68, frame length 132
//   - LANE_ID = 0xE03F/0xE07E/0xE0BD/0xE0FC
//   - CYCLE_CNT increments by 1 per frame (per lane)
//   - Data: even word index -> ch 2L value, odd -> ch 2L+1 value
//   - CRC-12 over SYNC, LANE, CNT, DATA matches word 131
// Frames must never interleave (a frame runs to completion once started).
// Random fifo_full backpressure (~25%) exercises the stall path.
//
// Run:
//   iverilog -g2012 -s tb_4lane_framed -o sim/tb_4lane_framed \
//     sim/tb_4lane_framed.v fpga/adc_auto_adjust.v fpga/usb_framer.v \
//     fpga/pair_tdm_framer.v fpga/lane_frame_arbiter.v \
//     decoder/UWB_Serial_Handler.v
//   vvp sim/tb_4lane_framed
// =============================================================================

`timescale 1ns/1ps

module tb_4lane_framed;

    localparam N_ADC      = 4;
    localparam ADC_BITS   = 12;
    localparam GRP_CYCLES = 64;
    localparam BASE_ZEROS = 11;

    function [11:0] ch_val;
        input integer ch;
        ch_val = 12'h800 + ch * 12'h010;
    endfunction

    reg clk = 0;
    always #15.625 clk = ~clk;

    reg rst_n = 0;

    // =========================================================================
    // Serial stimulus: 8 channels, variable leading zeros per group
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
                integer actual_zeros, bit_idx, which_bit, c;
                reg [11:0] v;
                actual_zeros = BASE_ZEROS + (group_cnt % 3); // 11, 12, 13

                if (data_cyc >= actual_zeros &&
                    data_cyc < actual_zeros + N_ADC * ADC_BITS) begin
                    bit_idx   = data_cyc - actual_zeros;
                    which_bit = bit_idx / N_ADC;
                    for (c = 0; c < 8; c = c + 1) begin
                        v = ch_val(c);
                        data_in[c] <= v[which_bit];
                    end
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

    // Random backpressure ~25%
    always @(posedge clk)
        fifo_full <= ($random & 3) == 0;

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

    // Expected per-lane constants
    function [15:0] sync_of;
        input integer l;
        sync_of = 16'hFA35 + 16'h0111 * l;
    endfunction

    function [15:0] laneid_of;
        input integer l;
        reg [5:0] hi;
        begin
            hi = {4'b0000, l[1:0]};
            laneid_of = {4'hE, hi, ~hi};
        end
    endfunction

    // =========================================================================
    // Frame decoder / checker
    // =========================================================================
    integer wptr = -1;        // -1 = hunting for SYNC
    integer cur_lane = 0;
    reg [11:0] crc_acc;
    reg [11:0] last_cnt [0:3];
    integer have_cnt [0:3];
    integer lane_frames [0:3];
    integer settle_frames [0:3];   // ignore data mismatch in first frames

    integer frames = 0;
    integer errors = 0;
    integer k;
    initial for (k = 0; k < 4; k = k + 1) begin
        have_cnt[k] = 0; lane_frames[k] = 0; settle_frames[k] = 2;
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
                        $display("ERROR t=%0t: expected SYNC got %04h (frames never interleave)",
                                 $time, out_word);
                end
            end else begin
                if (wptr == 1) begin
                    if (out_word !== laneid_of(cur_lane)) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: lane %0d LANE_ID got %04h expected %04h",
                                 $time, cur_lane, out_word, laneid_of(cur_lane));
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
                    if (lane_frames[cur_lane] >= settle_frames[cur_lane]) begin
                        if (out_word[11:0] !== ch_val(2*cur_lane + ((wptr - 3) % 2))) begin
                            errors = errors + 1;
                            if (errors <= 20)
                                $display("ERROR t=%0t: lane %0d frame %0d word %0d got %03h expected %03h",
                                         $time, cur_lane, lane_frames[cur_lane], wptr - 3,
                                         out_word[11:0],
                                         ch_val(2*cur_lane + ((wptr - 3) % 2)));
                        end
                    end
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
    initial begin
        rst_n = 0;
        #200;
        @(posedge clk);
        rst_n = 1;

        // Run until every lane has decoded 10 frames (or timeout)
        fork
            wait (lane_frames[0] >= 10 && lane_frames[1] >= 10 &&
                  lane_frames[2] >= 10 && lane_frames[3] >= 10);
            #100_000_000;  // 100 ms timeout
        join_any

        $display("");
        $display("============================================================");
        $display("  4-Lane Framed Pipeline Test: %0d frames, %0d groups", frames, group_cnt);
        $display("  per lane: L0=%0d L1=%0d L2=%0d L3=%0d",
                 lane_frames[0], lane_frames[1], lane_frames[2], lane_frames[3]);
        $display("------------------------------------------------------------");
        $display("  TOTAL: %0d errors", errors);
        $display("============================================================");
        if (lane_frames[0] >= 10 && lane_frames[1] >= 10 &&
            lane_frames[2] >= 10 && lane_frames[3] >= 10 && errors == 0)
            $display("  PASS");
        else
            $display("  FAIL");
        $display("============================================================");
        $finish;
    end

endmodule
