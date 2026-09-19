// =============================================================================
// adc_auto_adjust.v - Per-channel ADC deserializer with auto-adjust zero detection
//
// Captures an entire 64-cycle group in a shift register, detects the actual
// number of leading zeros (11, 12, or 13), and extracts 4 x 12-bit ADC
// samples at the correct offset.
//
// Detection uses trailing-edge check: at midscale (0x800), the MSB (=1)
// appears at the last data cycles. Different offsets push the MSB to
// different group positions:
//   O=11: last data at cycle 58, sr[59]=0 (trailing zero)
//   O=12: last data at cycle 59, sr[59]=1 (ADC3 MSB)
//   O=13: last data at cycle 60, sr[60]=1 (ADC3 MSB)
//
// Uses sr_full = {data_in, sr[63:1]} at the next_amps boundary to get the
// complete group including the current clock's data_in (which the non-blocking
// shift hasn't incorporated yet).
// =============================================================================

module adc_auto_adjust #(
    parameter N_ADC      = 4,
    parameter ADC_BITS   = 12,
    parameter GRP_CYCLES = 64,
    parameter BASE_ZEROS = 11     // minimum leading zeros
)(
    input  wire                clk,
    input  wire                rst_n,
    input  wire                data_in,       // 1-bit serial from one ADC channel
    input  wire                next_amps,     // group boundary pulse (cb_read)
    input  wire                auto_adjust,   // 1=detect offset, 0=fixed at BASE_ZEROS

    output reg                 sample_valid,  // pulses N_ADC times per group
    output reg  [ADC_BITS-1:0] sample_data,
    output reg  [1:0]          sample_adc_id, // which of 4 ADCs (0-3)
    output wire [1:0]          detected_extra // 0/1/2 extra zeros beyond BASE_ZEROS
);

    // =========================================================================
    // 64-bit shift register: captures one complete group
    // sr[0] = oldest cycle (cycle 0), sr[63] = newest (cycle 63)
    // =========================================================================
    reg [GRP_CYCLES-1:0] sr;

    // Combinational "post-shift" view: includes the data_in bit that is about
    // to be shifted in on this clock edge.  At the next_amps boundary, sr is
    // 1 bit behind (the non-blocking shift hasn't taken effect yet), but
    // sr_full already incorporates data_in and gives the complete group.
    wire [GRP_CYCLES-1:0] sr_full = {data_in, sr[GRP_CYCLES-1:1]};

    // =========================================================================
    // Trailing-edge detection: OR-accumulated across groups
    //
    // At group boundary, sr_full contains the complete previous group:
    //   sr_full[59] = cycle 59: trailing zero for O=11, ADC MSB for O>=12
    //   sr_full[60] = cycle 60: trailing zero for O<=12, ADC MSB for O=13
    //
    // Accumulate with OR so even rare nonzero values are captured.
    // =========================================================================
    reg [1:0] accum_detect;

    assign detected_extra = accum_detect[1] ? 2'd2 :
                            accum_detect[0] ? 2'd1 : 2'd0;

    // Per-group offset: uses sr_full for per-group detection (works at midscale)
    wire [5:0] grp_offset = auto_adjust ?
        (sr_full[60] ? (BASE_ZEROS[5:0] + 6'd2) :
         sr_full[59] ? (BASE_ZEROS[5:0] + 6'd1) :
                        BASE_ZEROS[5:0]) :
        BASE_ZEROS[5:0];

    // =========================================================================
    // Sample extraction: pick every N_ADC-th bit from sr_full at detected offset
    //
    // ADC k, bit b = sr_full[offset + N_ADC*b + k]
    // Since offset is only 11, 12, or 13: 3-way mux per output bit.
    // =========================================================================
    wire [ADC_BITS-1:0] ext [0:N_ADC-1];

    genvar k, b;
    generate
        for (k = 0; k < N_ADC; k = k + 1) begin : g_adc
            for (b = 0; b < ADC_BITS; b = b + 1) begin : g_bit
                assign ext[k][b] =
                    (grp_offset == BASE_ZEROS[5:0] + 6'd2) ? sr_full[BASE_ZEROS + 2 + N_ADC*b + k] :
                    (grp_offset == BASE_ZEROS[5:0] + 6'd1) ? sr_full[BASE_ZEROS + 1 + N_ADC*b + k] :
                                                              sr_full[BASE_ZEROS     + N_ADC*b + k];
            end
        end
    endgenerate

    // =========================================================================
    // Latched samples and sequential emit
    //
    // On next_amps: detect offset, extract 4 samples, latch into samp[].
    // Then emit one sample per clock for the next 4 clocks.
    // =========================================================================
    reg [ADC_BITS-1:0] samp0, samp1, samp2, samp3;
    reg [2:0] emit_cnt;  // 0=idle, 1..4=emitting ADC 0..3

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            sr           <= {GRP_CYCLES{1'b0}};
            accum_detect <= 2'd0;
            samp0        <= {ADC_BITS{1'b0}};
            samp1        <= {ADC_BITS{1'b0}};
            samp2        <= {ADC_BITS{1'b0}};
            samp3        <= {ADC_BITS{1'b0}};
            emit_cnt     <= 3'd0;
            sample_valid <= 1'b0;
            sample_data  <= {ADC_BITS{1'b0}};
            sample_adc_id <= 2'd0;
        end else begin
            // Shift register: always shifts, 1 bit per clock
            sr <= {data_in, sr[GRP_CYCLES-1:1]};

            // Default: no output
            sample_valid <= 1'b0;

            if (next_amps) begin
                // --- Detection: accumulate trailing-edge probes ---
                if (auto_adjust)
                    accum_detect <= accum_detect | {sr_full[60], sr_full[59]};

                // --- Extraction: latch 4 samples from sr_full ---
                samp0 <= ext[0];
                samp1 <= ext[1];
                samp2 <= ext[2];
                samp3 <= ext[3];

                // Start emit sequence on next clock
                emit_cnt <= 3'd1;

            end else if (emit_cnt != 3'd0) begin
                sample_valid <= 1'b1;
                case (emit_cnt)
                    3'd1: begin sample_data <= samp0; sample_adc_id <= 2'd0; end
                    3'd2: begin sample_data <= samp1; sample_adc_id <= 2'd1; end
                    3'd3: begin sample_data <= samp2; sample_adc_id <= 2'd2; end
                    3'd4: begin sample_data <= samp3; sample_adc_id <= 2'd3; end
                    default: sample_valid <= 1'b0;
                endcase

                if (emit_cnt == 3'd4)
                    emit_cnt <= 3'd0;
                else
                    emit_cnt <= emit_cnt + 3'd1;
            end
        end
    end

endmodule
