// =============================================================================
// tb_rx_mux.v — Testbench for rx_process_mux with N_CH=8
//
// Drives all 8 data_in lines with a known 12-bit value (per-channel unique),
// bit-interleaved across 4 ADCs per the serial format.  Checks every output
// word from all 4 TDM lanes for correctness.
//
// Run:  iverilog -g2012 -o sim/tb_rx_mux sim/tb_rx_mux.v decoder/UWB_Serial_Handler.v
//       vvp sim/tb_rx_mux
// =============================================================================

`timescale 1ns/1ps

module tb_rx_mux;

    localparam N_CH          = 8;
    localparam N_ADC_PER_GP  = 4;
    localparam ADC_BITS      = 12;
    localparam ZERO_CYCLES   = 11;
    localparam GROUP_CYCLES  = 64;
    localparam N_GROUPS      = 16;
    localparam SAMPS_PER_FR  = N_GROUPS * N_ADC_PER_GP;

    // Clock: 32 MHz = 31.25 ns period
    reg clk = 0;
    always #15.625 clk = ~clk;

    reg rst_n = 0;
    reg [N_CH-1:0] data_in = 0;
    reg [N_CH-1:0] next_amps_in = 0;

    wire [3:0]  out_valid;
    wire [47:0] out_word;
    wire [3:0]  out_chsel;

    rx_process_mux #(
        .N_CH         (N_CH),
        .N_ADC_PER_GP (N_ADC_PER_GP),
        .ADC_BITS     (ADC_BITS),
        .ZERO_CYCLES  (ZERO_CYCLES),
        .GROUP_CYCLES (GROUP_CYCLES),
        .N_GROUPS     (N_GROUPS),
        .SAMPS_PER_FR (SAMPS_PER_FR),
        .RX_FIFO_DEPTH(16),
        .TX_FIFO_DEPTH(16)
    ) uut (
        .clk          (clk),
        .rst_n        (rst_n),
        .data_in      (data_in),
        .sync_in      ({N_CH{1'b0}}),
        .next_amps_in (next_amps_in),
        .out_valid    (out_valid),
        .out_word     (out_word),
        .out_chsel    (out_chsel)
    );

    // =========================================================================
    // Test values: each channel gets a unique 12-bit value so we can identify
    // cross-channel contamination.  All 4 ADCs within a channel get the same
    // value (midscale test — real hardware sends same value for all ADCs).
    // =========================================================================
    wire [11:0] test_val [0:N_CH-1];
    assign test_val[0] = 12'h800;  // 2048 — channel 0 (D1/B15)
    assign test_val[1] = 12'h801;  // 2049 — channel 1 (D2/B16)
    assign test_val[2] = 12'h802;  // 2050 — channel 2 (D3/C15)
    assign test_val[3] = 12'h803;  // 2051 — channel 3 (D4/C16)
    assign test_val[4] = 12'h804;  // 2052 — channel 4 (D5/J15)
    assign test_val[5] = 12'h805;  // 2053 — channel 5 (D6/K15)
    assign test_val[6] = 12'h806;  // 2054 — channel 6 (D7/K14)
    assign test_val[7] = 12'h807;  // 2055 — channel 7 (D8/J14)

    // =========================================================================
    // Drive data_in: bit-interleaved serial, 4 ADCs, LSB-first per ADC word.
    // During the data phase (cycles 11..58), bit_idx = cyc - 11.
    //   which_adc = bit_idx % 4
    //   which_bit = bit_idx / 4
    // The shift register does {data_in, sr[11:1]} so bit0 arrives first.
    // =========================================================================
    // Two independent counters: data_cyc tracks TRUE data timing (fixed
    // 64-cycle period), ctrl_cyc drives next_amps_in and can be offset
    // by 1 cycle to simulate cb_read jitter on hardware.
    reg [5:0] data_cyc = 0;
    reg [5:0] ctrl_cyc = 0;
    integer group_cnt = 0;
    reg [31:0] jitter_lfsr = 32'hDEADBEEF;

    always @(posedge clk) begin
        if (!rst_n) begin
            data_cyc <= 0;
            ctrl_cyc <= 0;
            group_cnt <= 0;
            next_amps_in <= 0;
            data_in <= 0;
        end else begin
            next_amps_in <= 0;

            // Data counter — always perfect 64-cycle period
            if (data_cyc == GROUP_CYCLES - 1)
                data_cyc <= 0;
            else
                data_cyc <= data_cyc + 1;

            // Control counter — drives next_amps_in, perfectly aligned
            if (ctrl_cyc == GROUP_CYCLES - 1) begin
                ctrl_cyc <= 0;
                next_amps_in <= {N_CH{1'b1}};
                group_cnt <= group_cnt + 1;
            end else begin
                ctrl_cyc <= ctrl_cyc + 1;
            end

            // Drive data_in — variable leading zeros (11, 12, or 13)
            // to match real ADC hardware behavior
            begin
                integer actual_zeros, ch_i;
                // Vary zero count per group: 11, 12, or 13
                actual_zeros = 11 + (group_cnt % 3);  // cycles through 11,12,13
                if (data_cyc >= actual_zeros && data_cyc < actual_zeros + N_ADC_PER_GP * ADC_BITS) begin
                    integer bit_idx, which_bit;
                    bit_idx = data_cyc - actual_zeros;
                    which_bit = bit_idx / 4;
                    for (ch_i = 0; ch_i < N_CH; ch_i = ch_i + 1) begin
                        data_in[ch_i] <= test_val[ch_i][which_bit];
                    end
                end else begin
                    data_in <= 0;
                end
            end
        end
    end

    // =========================================================================
    // Monitor outputs: check every valid word against expected value
    // =========================================================================
    integer total_words = 0;
    integer errors = 0;
    integer lane_errors [0:3];
    integer lane_words [0:3];

    initial begin
        lane_errors[0] = 0; lane_errors[1] = 0;
        lane_errors[2] = 0; lane_errors[3] = 0;
        lane_words[0] = 0; lane_words[1] = 0;
        lane_words[2] = 0; lane_words[3] = 0;
    end

    always @(posedge clk) begin
        integer lane, ch_idx;
        reg [11:0] got, expected;

        for (lane = 0; lane < 4; lane = lane + 1) begin
            if (out_valid[lane]) begin
                got = out_word[lane*12 +: 12];
                // Determine which channel: lane*2 + out_chsel[lane]
                ch_idx = lane * 2 + out_chsel[lane];
                expected = test_val[ch_idx];

                lane_words[lane] = lane_words[lane] + 1;
                total_words = total_words + 1;

                if (got !== expected) begin
                    errors = errors + 1;
                    lane_errors[lane] = lane_errors[lane] + 1;
                    if (errors <= 20)
                        $display("ERROR: t=%0t lane=%0d ch=%0d chsel=%0d got=0x%03h expected=0x%03h group=%0d cyc=%0d",
                                 $time, lane, ch_idx, out_chsel[lane], got, expected, group_cnt, data_cyc);
                end
            end
        end
    end

    // =========================================================================
    // Test sequence
    // =========================================================================
    initial begin
        $dumpfile("sim/tb_rx_mux.vcd");
        $dumpvars(0, tb_rx_mux);

        // Reset
        rst_n = 0;
        #200;
        @(posedge clk);
        rst_n = 1;

        // Run for 100 groups (6400 cycles) — produces ~100 × 4 ADCs × 8 ch = 3200 words
        // Actually 100 groups × 4 ADCs per group = 400 words per channel
        // Through TDM: 400 words × 2 ch per lane = 800 words per lane
        wait (group_cnt >= 100);

        #1000;

        $display("");
        $display("============================================================");
        $display("  Simulation complete: %0d groups, %0d total output words", group_cnt, total_words);
        $display("============================================================");
        $display("  Lane 0: %0d words, %0d errors", lane_words[0], lane_errors[0]);
        $display("  Lane 1: %0d words, %0d errors", lane_words[1], lane_errors[1]);
        $display("  Lane 2: %0d words, %0d errors", lane_words[2], lane_errors[2]);
        $display("  Lane 3: %0d words, %0d errors", lane_words[3], lane_errors[3]);
        $display("  TOTAL:  %0d errors / %0d words", errors, total_words);
        $display("============================================================");

        if (errors == 0)
            $display("  PASS — all output words match expected values");
        else
            $display("  FAIL — %0d mismatches detected", errors);

        $display("============================================================");
        $finish;
    end

endmodule
