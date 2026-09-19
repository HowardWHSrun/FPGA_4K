// =============================================================================
// usb_framer.v — Word-level framer for USB transport via FT600
//
// Collects DATA_WORDS (128) 12-bit words from the TDM mux for one lane,
// then emits a 132-word framed packet as 16-bit USB words:
//
//   Word   0      {4'hF, SYNC_PATTERN}   — sync marker (unreachable by data)
//   Word   1      {4'hE, LANE_ID}        — lane number + drop count + complement
//   Word   2      {4'hD, CYCLE_CNT}      — rolling 12-bit frame counter
//   Words  3..130 {4'h0, DATA}           — 128 × 12-bit ADC samples
//   Word 131      {4'hC, CRC-12}         — CRC over data words only
//
// Tag nibble (upper 4 bits) distinguishes word types. Since ADC data is
// 12-bit (0x000–0xFFF), data words always have tag 0x0 — header/CRC tags
// (0xC–0xF) can never appear in data, giving zero false-sync probability.
//
// Same sync words, CRC, and frame structure as lane_framer so the protocol
// validated over USB is identical to what the UWB chip will receive.
//
// LANE_ID payload is {hi[5:0], ~hi[5:0]} with hi = {drop_cnt[3:0], lane[1:0]}.
// drop_cnt reports samples dropped upstream (sample-FIFO overflow) since
// this lane's previous frame, saturating at 15. With zero drops the word is
// bit-identical to the legacy constant LANE_ID, so old decoders are
// unaffected in normal operation and flag lane_id_err when drops occur —
// drops are never silent. drop_cnt is sampled on the last emit cycle of the
// PREVIOUS frame (frame_end), which is exactly when the next frame's CRC
// seed is computed; the CRC therefore covers the reported value.
//
// Parameters
//   SYNC_PATTERN — 12-bit sync (0xA35/0xB46/0xC57/0xD68 per lane)
//   LANE_NUM     — lane index (0–3)
//   DATA_WORDS   — words per frame body (default 128 = 64 amps × 2 channels)
// =============================================================================
module usb_framer #(
    parameter [11:0] SYNC_PATTERN = 12'hA35,
    parameter [3:0]  LANE_NUM     = 4'd0,
    parameter        DATA_WORDS   = 128
)(
    input  wire        clk,
    input  wire        rst_n,
    // Word input from rx_process_mux
    input  wire        in_valid,
    input  wire [11:0] in_word,
    // Upstream drop count (saturating) — sampled at frame_end
    input  wire [3:0]  drop_cnt,
    // 16-bit output to async_fifo
    output wire        out_valid,
    output wire [15:0] out_word,
    input  wire        fifo_full,
    // High when a complete frame is buffered and ready to emit
    output wire        frame_ready,
    // Pulses on the last accepted emit cycle: drop_cnt is consumed now
    output wire        frame_end
);

    localparam FRAME_WORDS = DATA_WORDS + 4;  // 132
    localparam LAST_WPTR   = FRAME_WORDS - 1; // 131

    // Data buffer
    reg [11:0] dbuf [0:DATA_WORDS-1];
    reg [$clog2(DATA_WORDS)-1:0] collect_cnt;

    // CRC-12 (ITU-T 0x80F, same as lane_framer)
    // Covers ALL frame words: SYNC, LANE_ID, CYCLE_CNT, DATA×128
    reg [11:0] crc_acc;

    // CRC seed after SYNC + LANE_ID (compile-time constant)

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

    // Emit state
    reg        emitting;
    assign     frame_ready = emitting;

    // out_valid must track emitting combinationally: a registered out_valid
    // lags emitting by one cycle, so the first emit word (SYNC) is presented
    // with out_valid low while emit_wptr advances past it — the sync word is
    // never written downstream and the host can never find a frame.
    assign     out_valid = emitting;
    reg [7:0]  emit_wptr;
    reg [11:0] cycle_cnt;

    // LANE_ID: {hi[5:0], ~hi[5:0]}, hi = {drop_cnt[3:0], lane_num[1:0]}
    // Legacy constant (drop = 0) used at reset; per-frame value latched in
    // lane_id_r at frame_end together with the matching CRC seed.
    localparam [5:0]  LID_HI   = {4'b0000, LANE_NUM[1:0]};
    localparam [11:0] LANE_ID  = {LID_HI, ~LID_HI};
    reg [11:0] lane_id_r;
    wire [11:0] lane_id = lane_id_r;

    wire [5:0]  lid_hi_next   = {drop_cnt, LANE_NUM[1:0]};
    wire [11:0] lane_id_next  = {lid_hi_next, ~lid_hi_next};

    // CRC seed after SYNC (constant); LANE_ID folded in dynamically
    localparam [11:0] CRC_SYNC_SEED = crc12_next(12'd0, SYNC_PATTERN);
    localparam [11:0] CRC_HDR_SEED  = crc12_next(CRC_SYNC_SEED, LANE_ID);
    localparam [11:0] CRC_INIT      = crc12_next(CRC_HDR_SEED, 12'd0);

    // Combinatorial word select for current emit position — drives out_word directly
    assign out_word = (emit_wptr == 8'd0)      ? {4'hF, SYNC_PATTERN} :
                      (emit_wptr == 8'd1)      ? {4'hE, lane_id}      :
                      (emit_wptr == 8'd2)      ? {4'hD, cycle_cnt}    :
                      (emit_wptr == LAST_WPTR) ? {4'hC, crc_acc}      :
                                                 {4'h0, dbuf[emit_wptr - 8'd3]};

    // Data buffer write in its own posedge-only process: a write inside an
    // async-reset process cannot be inferred as a RAM write port, so yosys
    // falls back to 128x12 FFs per framer instead of LUTRAM.
    always @(posedge clk)
        if (!emitting && in_valid)
            dbuf[collect_cnt] <= in_word;

    assign frame_end = emitting & ~fifo_full & (emit_wptr == LAST_WPTR);

    // State machine
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            emitting    <= 1'b0;
            collect_cnt <= '0;
            crc_acc     <= CRC_INIT;
            cycle_cnt   <= 12'd0;
            emit_wptr   <= 8'd0;
            lane_id_r   <= LANE_ID;
        end else if (!emitting) begin
            // ==============================================================
            // COLLECT: accept words, accumulate CRC
            // ==============================================================
            if (in_valid) begin
                crc_acc           <= crc12_next(crc_acc, in_word);
                if (collect_cnt == DATA_WORDS - 1) begin
                    collect_cnt <= '0;
                    emitting    <= 1'b1;
                    emit_wptr   <= 8'd0;
                end else begin
                    collect_cnt <= collect_cnt + 1'b1;
                end
            end
        end else begin
            // ==============================================================
            // EMIT: output 132 tagged 16-bit words, stall on fifo_full
            //
            // Drive out_word combinationally from emit_wptr (no register
            // delay). Only advance emit_wptr when fifo_full is low,
            // confirming the downstream accepted the word.
            // ==============================================================
            if (!fifo_full) begin
                if (emit_wptr == LAST_WPTR) begin
                    emitting  <= 1'b0;
                    cycle_cnt <= cycle_cnt + 1'b1;
                    // Latch next frame's LANE_ID (with current drop count)
                    // and fold it into the CRC seed alongside the counter.
                    lane_id_r <= lane_id_next;
                    crc_acc   <= crc12_next(crc12_next(CRC_SYNC_SEED, lane_id_next),
                                            cycle_cnt + 1'b1);
                end else begin
                    emit_wptr <= emit_wptr + 1'b1;
                end
            end
        end
    end

endmodule
