// =============================================================================
// serial_framer.v — Streaming serial framer for UWB output
//
// Serializes 12-bit words MSB-first at 1 bit per clock with the same frame
// structure and CRC as usb_framer:
//
//   Word   0      SYNC_PATTERN  (12b)
//   Word   1      LANE_ID       (12b) — {drop_cnt[3:0],lane[1:0], complement}
//   Word   2      CYCLE_CNT     (12b)
//   Words  3..130 DATA          (12b × 128)
//   Word 131      CRC-12        (12b) — covers SYNC+LID+CNT+DATA
//
// Unlike usb_framer / lane_framer, this module does NOT buffer a full frame
// before emitting. Words are serialized as they arrive from a FIFO, so the
// downstream never stalls and there are no sample drops. The serial bit rate
// (32 Mbit/s) exceeds the data rate (~24.75 Mbit/s at 15625 frames/s), so
// the FIFO stays shallow in steady state.
//
// Interface: connects to a sync_fifo read port (combinational rdata).
// =============================================================================
module serial_framer #(
    parameter [11:0] SYNC_PATTERN = 12'hA35,
    parameter [3:0]  LANE_NUM     = 4'd0,
    parameter        DATA_WORDS   = 128
)(
    input  wire        clk,
    input  wire        rst_n,

    // FIFO read port (TDM-interleaved data)
    input  wire        fifo_empty,
    input  wire [11:0] fifo_rdata,
    output wire        fifo_ren,

    // Upstream drop count (saturating nibble)
    input  wire [3:0]  drop_cnt,

    // Serial output
    output reg         serial_out,

    // Pulses when frame completes (for drop_cnt bookkeeping)
    output wire        frame_end
);

    localparam FRAME_WORDS = DATA_WORDS + 4;  // 132
    localparam LAST_WPOS   = FRAME_WORDS - 1; // 131

    // CRC-12 — identical to usb_framer
    function automatic [11:0] crc12_next;
        input [11:0] crc_in;
        input [11:0] data;
        reg [11:0] c;
        integer i;
        begin
            c = crc_in;
            for (i = 11; i >= 0; i = i - 1) begin
                if (data[i] ^ c[11])
                    c = {c[10:0], 1'b0} ^ 12'h80F;
                else
                    c = {c[10:0], 1'b0};
            end
            crc12_next = c;
        end
    endfunction

    // LANE_ID constants
    localparam [5:0]  LID_HI  = {4'b0000, LANE_NUM[1:0]};
    localparam [11:0] LANE_ID = {LID_HI, ~LID_HI};

    // CRC seed after SYNC (compile-time constant)
    localparam [11:0] CRC_SYNC_SEED = crc12_next(12'd0, SYNC_PATTERN);

    // Dynamic LANE_ID with drop count
    wire [5:0]  lid_hi_next  = {drop_cnt, LANE_NUM[1:0]};
    wire [11:0] lane_id_next = {lid_hi_next, ~lid_hi_next};

    // State
    reg [11:0] shift_reg;
    reg [3:0]  bit_cnt;      // 11 down to 0
    reg [7:0]  word_pos;     // 0..131 within frame
    reg [11:0] crc_acc;
    reg [11:0] cycle_cnt;
    reg [11:0] lane_id_r;
    reg        started;      // first frame has begun

    // Load logic: when bit_cnt == 0, the current word's last bit is being
    // output and we simultaneously load the next word into shift_reg.
    // For DATA words, this requires a combinational read from the FIFO.
    wire loading = (bit_cnt == 4'd0) && started;
    wire next_is_data = (word_pos >= 8'd2) && (word_pos < LAST_WPOS - 1);
    // word_pos is the CURRENT word being finished; word_pos+1 is what we load.
    // data positions: 3..130. So we load data when word_pos+1 is in 3..130,
    // i.e., word_pos is in 2..129.

    assign fifo_ren  = loading && next_is_data && !fifo_empty;
    assign frame_end = loading && (word_pos == LAST_WPOS);

    // Next word selection (combinational)
    reg [11:0] next_word;
    reg        next_ready;
    always @* begin
        next_ready = 1'b1;
        // word_pos is current; we're loading word_pos+1 (or 0 if wrapping)
        if (word_pos == LAST_WPOS) begin
            next_word = SYNC_PATTERN;  // start of next frame
        end else begin
            case (word_pos + 8'd1)
                8'd1:     next_word = lane_id_r;
                8'd2:     next_word = cycle_cnt;
                default: begin
                    if (word_pos + 8'd1 == LAST_WPOS) begin
                        next_word = crc_acc;
                    end else begin
                        // DATA word — read from FIFO
                        next_word  = fifo_rdata;
                        next_ready = !fifo_empty;
                    end
                end
            endcase
        end
    end

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            shift_reg  <= 12'd0;
            bit_cnt    <= 4'd0;
            word_pos   <= 8'd0;
            crc_acc    <= 12'd0;
            cycle_cnt  <= 12'd0;
            lane_id_r  <= LANE_ID;
            started    <= 1'b0;
            serial_out <= 1'b0;
        end else if (!started) begin
            // Wait for first data word before starting
            serial_out <= 1'b0;
            if (!fifo_empty) begin
                started   <= 1'b1;
                shift_reg <= SYNC_PATTERN;
                bit_cnt   <= 4'd11;
                word_pos  <= 8'd0;
                crc_acc   <= CRC_SYNC_SEED;
            end
        end else if (bit_cnt != 4'd0) begin
            // Shifting: output MSB, shift left
            serial_out <= shift_reg[11];
            shift_reg  <= {shift_reg[10:0], 1'b0};
            bit_cnt    <= bit_cnt - 4'd1;
        end else begin
            // bit_cnt == 0: output last bit of current word AND load next
            serial_out <= shift_reg[11];

            if (next_ready) begin
                shift_reg <= next_word;
                bit_cnt   <= 4'd11;

                // CRC update for the word being loaded
                if (word_pos == LAST_WPOS) begin
                    // Wrapping to next frame's SYNC
                    cycle_cnt <= cycle_cnt + 12'd1;
                    lane_id_r <= lane_id_next;
                    word_pos  <= 8'd0;
                    crc_acc   <= CRC_SYNC_SEED;
                end else begin
                    word_pos <= word_pos + 8'd1;
                    case (word_pos + 8'd1)
                        8'd1:    crc_acc <= crc12_next(crc_acc, lane_id_r);
                        8'd2:    crc_acc <= crc12_next(crc_acc, cycle_cnt);
                        default: begin
                            if (word_pos + 8'd1 != LAST_WPOS)
                                crc_acc <= crc12_next(crc_acc, fifo_rdata);
                        end
                    endcase
                end
            end
            // else: stall — hold serial_out at last bit, wait for FIFO data
        end
    end

endmodule
