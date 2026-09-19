// =============================================================================
// pair_tdm_framer.v — 2 sample FIFOs + strict-alternation TDM + usb_framer
//
// Even/odd samples are buffered in small FIFOs, then interleaved strictly
// (even, odd, even, odd, ...) into the framer. The TDM output uses a
// valid/hold handshake: a word launched while the framer is emitting is
// HELD (not dropped) until the framer returns to COLLECT. Combined with
// strict alternation this guarantees data word 0 of every frame is the
// EVEN channel, so the host can decode channel by word position.
//
// While the framer emits (132 cycles), the TDM stalls and the sample FIFOs
// absorb the incoming samples. If the FIFOs do overflow (long downstream
// stall), drops happen at the FIFO write side on both channels together,
// so interleave parity is never corrupted.
//
// FIFO_DEPTH sizing:
//   - Standalone pair test (lane always granted): 8 is enough.
//   - 4-lane round-robin: worst-case stall = 4 x 132-word emits = 528
//     cycles = ~33 samples/channel accumulate -> use 64.
// =============================================================================
module pair_tdm_framer #(
    parameter [11:0] SYNC_PATTERN = 12'hA35,
    parameter [3:0]  LANE_NUM     = 4'd0,
    parameter        FIFO_DEPTH   = 8
)(
    input  wire        clk,
    input  wire        rst_n,

    input  wire        even_valid,
    input  wire [11:0] even_data,
    input  wire        odd_valid,
    input  wire [11:0] odd_data,

    output wire        fr_valid,
    output wire [15:0] fr_word,
    input  wire        fifo_full,
    output wire        frame_ready   // high while emitting (framer busy)
);

    // --- Per-channel sample FIFOs ---
    wire        ev_full, ev_empty, od_full, od_empty;
    wire [11:0] ev_rdata, od_rdata;
    wire        ev_ren, od_ren;

    sync_fifo #(.W(12), .D(FIFO_DEPTH)) u_ev_fifo (
        .clk(clk), .rst_n(rst_n),
        .wen(even_valid & ~ev_full), .wdata(even_data), .full(ev_full),
        .ren(ev_ren), .rdata(ev_rdata), .empty(ev_empty)
    );

    sync_fifo #(.W(12), .D(FIFO_DEPTH)) u_od_fifo (
        .clk(clk), .rst_n(rst_n),
        .wen(odd_valid & ~od_full), .wdata(odd_data), .full(od_full),
        .ren(od_ren), .rdata(od_rdata), .empty(od_empty)
    );

    // --- TDM with hold handshake ---
    // The framer accepts in_valid only when not emitting (frame_ready low).
    // tdm_accept: the word currently presented is consumed this cycle.
    // can_load:   the output register is free to take a new word this cycle.
    reg        tdm_valid;
    reg        tdm_sel;    // 0 = next word is even, 1 = next word is odd
    reg [11:0] tdm_word;

    wire tdm_accept = tdm_valid & ~frame_ready;
    wire can_load   = ~tdm_valid | tdm_accept;

    assign ev_ren = can_load & ~tdm_sel & ~ev_empty;
    assign od_ren = can_load &  tdm_sel & ~od_empty;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            tdm_valid <= 1'b0;
            tdm_sel   <= 1'b0;
            tdm_word  <= 12'd0;
        end else begin
            if (ev_ren) begin
                tdm_valid <= 1'b1;
                tdm_word  <= ev_rdata;
                tdm_sel   <= 1'b1;
            end else if (od_ren) begin
                tdm_valid <= 1'b1;
                tdm_word  <= od_rdata;
                tdm_sel   <= 1'b0;
            end else if (tdm_accept) begin
                tdm_valid <= 1'b0;
            end
        end
    end

    // --- Drop counter ---
    // Counts samples dropped at the FIFO write side (overflow), saturating
    // at 15. Even and odd always drop together (same cycle, same count), so
    // counting the even channel alone reports drops-per-channel. Cleared /
    // reloaded on frame_end — the cycle usb_framer consumes the value.
    wire frame_end;
    wire ev_drop = even_valid & ev_full;
    reg [3:0] drop_cnt;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            drop_cnt <= 4'd0;
        else if (frame_end)
            drop_cnt <= ev_drop ? 4'd1 : 4'd0;
        else if (ev_drop && drop_cnt != 4'd15)
            drop_cnt <= drop_cnt + 4'd1;
    end

    // --- Framer ---
    usb_framer #(
        .SYNC_PATTERN(SYNC_PATTERN),
        .LANE_NUM(LANE_NUM),
        .DATA_WORDS(128)
    ) u_framer (
        .clk(clk), .rst_n(rst_n),
        .in_valid(tdm_valid), .in_word(tdm_word),
        .drop_cnt(drop_cnt),
        .out_valid(fr_valid), .out_word(fr_word),
        .fifo_full(fifo_full),
        .frame_ready(frame_ready),
        .frame_end(frame_end)
    );

endmodule
