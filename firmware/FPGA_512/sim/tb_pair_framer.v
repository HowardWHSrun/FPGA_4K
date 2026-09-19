// =============================================================================
// tb_pair_framer.v - Testbench for pair_tdm_framer (2ch TDM + usb_framer)
//
// Drives 2 serial ADC channels (even=0x800, odd=0x900) with variable leading
// zeros (11-13) through adc_auto_adjust into pair_tdm_framer. Decodes the
// emitted 16-bit frame stream and checks:
//   - SYNC word 0xFA35 present, frame length 132
//   - LANE_ID = 0xE03F
//   - CYCLE_CNT increments by 1 per frame
//   - Data parity: word index even -> even channel (0x800), odd -> 0x900
//   - CRC-12 over SYNC, LANE, CNT, DATA matches word 131
// Random fifo_full backpressure is applied to test the stall path.
//
// Run:
//   iverilog -g2012 -o sim/tb_pair_framer sim/tb_pair_framer.v \
//     fpga/adc_auto_adjust.v fpga/usb_framer.v \
//     adc_2ch_framed/top_2ch_framed.v decoder/UWB_Serial_Handler.v
//   vvp sim/tb_pair_framer
// =============================================================================

`timescale 1ns/1ps

module tb_pair_framer;

    localparam N_ADC      = 4;
    localparam ADC_BITS   = 12;
    localparam GRP_CYCLES = 64;
    localparam BASE_ZEROS = 11;

    localparam [11:0] EVEN_VAL = 12'h800;
    localparam [11:0] ODD_VAL  = 12'h900;

    reg clk = 0;
    always #15.625 clk = ~clk;

    reg rst_n = 0;

    // =========================================================================
    // Serial stimulus: 2 channels, variable leading zeros per group
    // =========================================================================
    reg [1:0] data_in;
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
                integer actual_zeros, bit_idx, which_bit;
                actual_zeros = BASE_ZEROS + (group_cnt % 3); // 11, 12, 13

                if (data_cyc >= actual_zeros &&
                    data_cyc < actual_zeros + N_ADC * ADC_BITS) begin
                    bit_idx   = data_cyc - actual_zeros;
                    which_bit = bit_idx / N_ADC;
                    data_in[0] <= EVEN_VAL[which_bit];
                    data_in[1] <= ODD_VAL[which_bit];
                end else begin
                    data_in <= 0;
                end
            end
        end
    end

    // =========================================================================
    // DUT chain: 2x adc_auto_adjust -> pair_tdm_framer
    // =========================================================================
    wire        ev_valid, od_valid;
    wire [11:0] ev_data,  od_data;

    adc_auto_adjust #(
        .N_ADC(N_ADC), .ADC_BITS(ADC_BITS),
        .GRP_CYCLES(GRP_CYCLES), .BASE_ZEROS(BASE_ZEROS)
    ) u_even (
        .clk(clk), .rst_n(rst_n),
        .data_in(data_in[0]), .next_amps(next_amps), .auto_adjust(1'b1),
        .sample_valid(ev_valid), .sample_data(ev_data),
        .sample_adc_id(), .detected_extra()
    );

    adc_auto_adjust #(
        .N_ADC(N_ADC), .ADC_BITS(ADC_BITS),
        .GRP_CYCLES(GRP_CYCLES), .BASE_ZEROS(BASE_ZEROS)
    ) u_odd (
        .clk(clk), .rst_n(rst_n),
        .data_in(data_in[1]), .next_amps(next_amps), .auto_adjust(1'b1),
        .sample_valid(od_valid), .sample_data(od_data),
        .sample_adc_id(), .detected_extra()
    );

    wire        fr_valid;
    wire [15:0] fr_word;
    reg         fifo_full = 0;

    pair_tdm_framer #(
        .SYNC_PATTERN(12'hA35),
        .LANE_NUM(4'd0)
    ) dut (
        .clk(clk), .rst_n(rst_n),
        .even_valid(ev_valid), .even_data(ev_data),
        .odd_valid(od_valid),  .odd_data(od_data),
        .fr_valid(fr_valid), .fr_word(fr_word),
        .fifo_full(fifo_full)
    );

    // Random backpressure ~25%
    always @(posedge clk)
        fifo_full <= ($random & 3) == 0;

    // =========================================================================
    // CRC-12 reference (matches host pair_test.c)
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

    // =========================================================================
    // Frame decoder / checker
    // =========================================================================
    integer wptr = -1;        // -1 = hunting for SYNC
    reg [11:0] crc_acc;
    reg [11:0] last_cnt;
    integer have_cnt = 0;

    integer frames = 0;
    integer errors = 0;
    integer settle_frames = 2;  // ignore data errors in first frames (pipeline settling)

    always @(posedge clk) begin
        if (rst_n && fr_valid && !fifo_full) begin
            if (wptr < 0) begin
                if (fr_word == 16'hFA35) begin
                    wptr    = 1;
                    crc_acc = crc12(12'd0, 12'hA35);
                end
            end else begin
                if (wptr == 1) begin
                    if (fr_word !== 16'hE03F) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: LANE_ID got %04h expected E03F", $time, fr_word);
                    end
                    crc_acc = crc12(crc_acc, fr_word[11:0]);
                end else if (wptr == 2) begin
                    if (fr_word[15:12] !== 4'hD) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: CNT tag got %04h", $time, fr_word);
                    end
                    if (have_cnt && (((last_cnt + 12'd1) & 12'hFFF) !== fr_word[11:0])) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: CNT gap got %03h expected %03h",
                                 $time, fr_word[11:0], (last_cnt + 12'd1) & 12'hFFF);
                    end
                    last_cnt = fr_word[11:0];
                    have_cnt = 1;
                    crc_acc  = crc12(crc_acc, fr_word[11:0]);
                end else if (wptr <= 130) begin
                    // Data word: index (wptr-3), even index -> even channel
                    if (fr_word[15:12] !== 4'h0) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: data tag got %04h wptr=%0d", $time, fr_word, wptr);
                    end
                    if (frames >= settle_frames) begin
                        if (((wptr - 3) % 2) == 0) begin
                            if (fr_word[11:0] !== EVEN_VAL) begin
                                errors = errors + 1;
                                if (errors <= 20)
                                    $display("ERROR t=%0t: frame %0d word %0d got %03h expected %03h (even)",
                                             $time, frames, wptr - 3, fr_word[11:0], EVEN_VAL);
                            end
                        end else begin
                            if (fr_word[11:0] !== ODD_VAL) begin
                                errors = errors + 1;
                                if (errors <= 20)
                                    $display("ERROR t=%0t: frame %0d word %0d got %03h expected %03h (odd)",
                                             $time, frames, wptr - 3, fr_word[11:0], ODD_VAL);
                            end
                        end
                    end
                    crc_acc = crc12(crc_acc, fr_word[11:0]);
                end else begin
                    // wptr == 131: CRC
                    if (fr_word[15:12] !== 4'hC) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: CRC tag got %04h", $time, fr_word);
                    end
                    if (fr_word[11:0] !== crc_acc) begin
                        errors = errors + 1;
                        $display("ERROR t=%0t: frame %0d CRC got %03h expected %03h",
                                 $time, frames, fr_word[11:0], crc_acc);
                    end
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

        // Run until 20 frames decoded (or timeout)
        fork
            wait (frames >= 20);
            #100_000_000;  // 100 ms timeout
        join_any

        $display("");
        $display("============================================================");
        $display("  Pair TDM + Framer Test: %0d frames, %0d groups", frames, group_cnt);
        $display("------------------------------------------------------------");
        $display("  TOTAL: %0d errors", errors);
        $display("============================================================");
        if (frames >= 20 && errors == 0)
            $display("  PASS");
        else
            $display("  FAIL");
        $display("============================================================");
        $finish;
    end

endmodule
