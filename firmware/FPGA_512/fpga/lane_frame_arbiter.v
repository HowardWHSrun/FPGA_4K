// =============================================================================
// lane_frame_arbiter.v — frame-granular round-robin arbiter for 4 lanes
//
// Each lane is a pair_tdm_framer whose usb_framer asserts fr_valid
// (= frame_ready = emitting) for the entire 132-word frame emission and
// only advances when its fifo_full input is low. The arbiter grants ONE
// lane at a time and holds the grant until that lane's whole frame has
// been emitted (fr_valid deasserts), so frames are never interleaved at
// word granularity — the stream is a sequence of complete, self-labelled
// frames (each carries its own SYNC pattern and LANE_ID) that the host
// demuxes by lane.
//
// Non-granted lanes see lane_stall high, which freezes their emit pointer
// losslessly (usb_framer stalls on fifo_full). Their sample FIFOs absorb
// input during the wait — worst case ~528 cycles (~33 samples/channel),
// hence FIFO_DEPTH=64 in the 4-lane top.
//
// Bandwidth: 4 lanes x 132 words per 1024-cycle frame period = 52% of the
// 1-word/cycle bus — sustainable with headroom.
// =============================================================================
module lane_frame_arbiter (
    input  wire        clk,
    input  wire        rst_n,

    // Per-lane framer outputs
    input  wire [3:0]  fr_valid,     // = frame_ready per lane
    input  wire [63:0] fr_words,     // {lane3, lane2, lane1, lane0}
    output wire [3:0]  lane_stall,   // per-lane fifo_full back to framers

    // Shared output FIFO
    input  wire        fifo_full,
    output wire        out_wen,
    output wire [15:0] out_word
);

    reg        granted;
    reg [1:0]  grant;

    // Round-robin next-grant selection, priority starting at grant+1
    wire [1:0] c1 = grant + 2'd1;
    wire [1:0] c2 = grant + 2'd2;
    wire [1:0] c3 = grant + 2'd3;

    reg  [1:0] nsel;
    reg        nfound;
    always @* begin
        nfound = 1'b1;
        if      (fr_valid[c1])    nsel = c1;
        else if (fr_valid[c2])    nsel = c2;
        else if (fr_valid[c3])    nsel = c3;
        else if (fr_valid[grant]) nsel = grant;
        else begin nsel = grant; nfound = 1'b0; end
    end

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            granted <= 1'b0;
            grant   <= 2'd0;
        end else if (!granted) begin
            if (nfound) begin
                grant   <= nsel;
                granted <= 1'b1;
            end
        end else if (!fr_valid[grant]) begin
            // Granted lane finished its frame — release
            granted <= 1'b0;
        end
    end

    assign lane_stall[0] = fifo_full | ~(granted & (grant == 2'd0));
    assign lane_stall[1] = fifo_full | ~(granted & (grant == 2'd1));
    assign lane_stall[2] = fifo_full | ~(granted & (grant == 2'd2));
    assign lane_stall[3] = fifo_full | ~(granted & (grant == 2'd3));

    assign out_word = fr_words[grant*16 +: 16];
    assign out_wen  = granted & fr_valid[grant] & ~fifo_full;

endmodule
