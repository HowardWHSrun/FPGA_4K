// =============================================================================
// tb_auto_adjust.v - Testbench for adc_auto_adjust module
//
// Tests auto-adjust zero detection with variable leading zeros (11, 12, 13).
// Drives 8 independent channels with unique test values and verifies that
// the detected offset and extracted samples are correct.
//
// Run:
//   iverilog -g2012 -o sim/tb_auto_adjust sim/tb_auto_adjust.v fpga/adc_auto_adjust.v
//   vvp sim/tb_auto_adjust
// =============================================================================

`timescale 1ns/1ps

module tb_auto_adjust;

    localparam N_CH       = 8;
    localparam N_ADC      = 4;
    localparam ADC_BITS   = 12;
    localparam GRP_CYCLES = 64;
    localparam BASE_ZEROS = 11;

    // Clock: 32 MHz
    reg clk = 0;
    always #15.625 clk = ~clk;

    reg rst_n = 0;

    // Per-channel signals
    reg  [N_CH-1:0] data_in;
    reg              next_amps = 0;

    wire             sample_valid [0:N_CH-1];
    wire [ADC_BITS-1:0] sample_data [0:N_CH-1];
    wire [1:0]       sample_adc_id [0:N_CH-1];
    wire [1:0]       detected_extra [0:N_CH-1];

    // Instantiate 8 channels
    genvar gi;
    generate
        for (gi = 0; gi < N_CH; gi = gi + 1) begin : g_ch
            adc_auto_adjust #(
                .N_ADC      (N_ADC),
                .ADC_BITS   (ADC_BITS),
                .GRP_CYCLES (GRP_CYCLES),
                .BASE_ZEROS (BASE_ZEROS)
            ) uut (
                .clk           (clk),
                .rst_n         (rst_n),
                .data_in       (data_in[gi]),
                .next_amps     (next_amps),
                .auto_adjust   (1'b1),
                .sample_valid  (sample_valid[gi]),
                .sample_data   (sample_data[gi]),
                .sample_adc_id (sample_adc_id[gi]),
                .detected_extra(detected_extra[gi])
            );
        end
    endgenerate

    // =========================================================================
    // Test values: unique per channel, all 4 ADCs within a channel get same value
    // =========================================================================
    wire [ADC_BITS-1:0] test_val [0:N_CH-1];
    assign test_val[0] = 12'h800;  // 2048 - midscale
    assign test_val[1] = 12'h801;
    assign test_val[2] = 12'h802;
    assign test_val[3] = 12'h803;
    assign test_val[4] = 12'h804;
    assign test_val[5] = 12'h805;
    assign test_val[6] = 12'h806;
    assign test_val[7] = 12'h807;

    // =========================================================================
    // Drive data: bit-interleaved, 4 ADCs, LSB-first, variable leading zeros
    // =========================================================================
    reg [5:0] data_cyc = 0;
    integer group_cnt = 0;

    always @(posedge clk) begin
        if (!rst_n) begin
            data_cyc <= 0;
            group_cnt <= 0;
            next_amps <= 0;
            data_in <= 0;
        end else begin
            next_amps <= 0;

            if (data_cyc == GRP_CYCLES - 1) begin
                data_cyc <= 0;
                next_amps <= 1;
                group_cnt <= group_cnt + 1;
            end else begin
                data_cyc <= data_cyc + 1;
            end

            // Drive data with variable leading zeros per group
            begin
                integer actual_zeros, ch_i;
                actual_zeros = BASE_ZEROS + (group_cnt % 3); // 11, 12, 13

                if (data_cyc >= actual_zeros &&
                    data_cyc < actual_zeros + N_ADC * ADC_BITS) begin
                    integer bit_idx, which_bit;
                    bit_idx = data_cyc - actual_zeros;
                    which_bit = bit_idx / N_ADC;  // 0..11
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
    // Monitor outputs and check correctness
    // =========================================================================
    integer total_samples = 0;
    integer errors = 0;
    integer settle_groups = 3;  // skip first 3 groups for settling
    integer ch_words [0:N_CH-1];
    integer ch_errors [0:N_CH-1];

    initial begin
        integer ii;
        for (ii = 0; ii < N_CH; ii = ii + 1) begin
            ch_words[ii] = 0;
            ch_errors[ii] = 0;
        end
    end

    always @(posedge clk) begin
        integer ch_i;
        reg [ADC_BITS-1:0] got, expected;

        for (ch_i = 0; ch_i < N_CH; ch_i = ch_i + 1) begin
            if (sample_valid[ch_i]) begin
                got = sample_data[ch_i];
                expected = test_val[ch_i]; // all 4 ADCs have same value

                ch_words[ch_i] = ch_words[ch_i] + 1;
                total_samples = total_samples + 1;

                if (group_cnt > settle_groups && got !== expected) begin
                    errors = errors + 1;
                    ch_errors[ch_i] = ch_errors[ch_i] + 1;
                    if (errors <= 20)
                        $display("ERROR: t=%0t ch=%0d adc=%0d got=0x%03h expected=0x%03h group=%0d zeros=%0d",
                                 $time, ch_i, sample_adc_id[ch_i], got, expected,
                                 group_cnt, BASE_ZEROS + (group_cnt % 3));
                end
            end
        end
    end

    // =========================================================================
    // Test sequence
    // =========================================================================
    initial begin
        $dumpfile("sim/tb_auto_adjust.vcd");
        $dumpvars(0, tb_auto_adjust);

        rst_n = 0;
        #200;
        @(posedge clk);
        rst_n = 1;

        // Run 100 groups
        wait (group_cnt >= 100);
        #1000;

        $display("");
        $display("============================================================");
        $display("  Auto-Adjust Test: %0d groups, %0d total samples", group_cnt, total_samples);
        $display("============================================================");
        begin
            integer ci;
            for (ci = 0; ci < N_CH; ci = ci + 1) begin
                $display("  Ch %0d: %0d samples, %0d errors, detected_extra=%0d",
                         ci, ch_words[ci], ch_errors[ci], detected_extra[ci]);
            end
        end
        $display("------------------------------------------------------------");
        $display("  TOTAL: %0d errors / %0d samples (after settling)", errors, total_samples);
        $display("============================================================");

        if (errors == 0)
            $display("  PASS");
        else
            $display("  FAIL - %0d mismatches", errors);

        $display("============================================================");
        $finish;
    end

endmodule
