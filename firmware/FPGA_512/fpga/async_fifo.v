// =============================================================================
// async_fifo.v  —  Dual-clock asynchronous FIFO with output buffer
//
// Gray-coded pointers for safe CDC (Cummings SNUG 2002).
//
// The memory uses registered reads to enable Block RAM inference (ECP5
// DP16KD), eliminating dual-clock metastability on the data path.  A small
// output buffer in the read-clock domain hides the 1-cycle BRAM latency
// and provides combinational outputs identical to the original interface.
//
// Parameters:
//   W — data width (bits)
//   D — FIFO depth (must be power of 2)
// =============================================================================

module async_fifo #(
    parameter W = 16,
    parameter D = 1024
)(
    // Write side (producer clock)
    input  wire         wclk,
    input  wire         wrst_n,
    input  wire         wen,
    input  wire [W-1:0] wdata,
    output wire         full,

    // Read side (consumer clock)
    input  wire         rclk,
    input  wire         rrst_n,
    input  wire         ren,
    output wire [W-1:0] rdata,
    output wire [W-1:0] rdata_next,     // look-ahead: next word after current
    output wire         empty,
    output wire         almost_empty    // will be empty after 1 more read
);

    localparam AW = $clog2(D);

    // -----------------------------------------------------------------------
    // Memory — registered reads force Block RAM inference (ECP5 DP16KD)
    // -----------------------------------------------------------------------
    (* ram_style = "block" *)
    reg [W-1:0] mem [0:D-1];

    reg [W-1:0] mem_rdata;

    // -----------------------------------------------------------------------
    // Write-side pointers (binary and Gray)
    // -----------------------------------------------------------------------
    reg  [AW:0] wptr_bin  = 0;
    wire [AW:0] wptr_gray = wptr_bin ^ (wptr_bin >> 1);

    // -----------------------------------------------------------------------
    // Internal read pointer — advanced by pre-fetch FSM, not external ren
    // -----------------------------------------------------------------------
    reg  [AW:0] iptr_bin  = 0;
    wire [AW:0] iptr_gray = iptr_bin ^ (iptr_bin >> 1);

    // -----------------------------------------------------------------------
    // CDC synchronizers (2-stage, Gray-coded)
    // -----------------------------------------------------------------------
    reg [AW:0] wptr_gray_r1 = 0, wptr_gray_r2 = 0;   // wptr synced to rclk
    reg [AW:0] iptr_gray_r1 = 0, iptr_gray_r2 = 0;   // iptr synced to wclk

    // -----------------------------------------------------------------------
    // Write logic
    // -----------------------------------------------------------------------
    wire w_en = wen & ~full;

    always @(posedge wclk or negedge wrst_n) begin
        if (!wrst_n)
            wptr_bin <= 0;
        else if (w_en)
            wptr_bin <= wptr_bin + 1;
    end

    always @(posedge wclk) begin
        if (w_en)
            mem[wptr_bin[AW-1:0]] <= wdata;
    end

    // Sync iptr (Gray) into write domain for full detection
    always @(posedge wclk or negedge wrst_n) begin
        if (!wrst_n) begin
            iptr_gray_r1 <= 0;
            iptr_gray_r2 <= 0;
        end else begin
            iptr_gray_r1 <= iptr_gray;
            iptr_gray_r2 <= iptr_gray_r1;
        end
    end

    // Full: MSBs differ, rest equal (in Gray code)
    assign full = (wptr_gray == {~iptr_gray_r2[AW:AW-1], iptr_gray_r2[AW-2:0]});

    // -----------------------------------------------------------------------
    // Read side: registered BRAM → pre-fetch pipeline → output buffer
    // -----------------------------------------------------------------------

    // Sync wptr (Gray) into read domain
    always @(posedge rclk or negedge rrst_n) begin
        if (!rrst_n) begin
            wptr_gray_r1 <= 0;
            wptr_gray_r2 <= 0;
        end else begin
            wptr_gray_r1 <= wptr_gray;
            wptr_gray_r2 <= wptr_gray_r1;
        end
    end

    // Internal empty: pre-fetch pointer caught up with synchronized wptr
    wire fifo_int_empty = (iptr_gray == wptr_gray_r2);

    // --- Registered Block RAM read (1-cycle latency) ---
    always @(posedge rclk)
        mem_rdata <= mem[iptr_bin[AW-1:0]];

    // --- 4-entry output buffer (register-based, single rclk domain) ---
    localparam OB_DEPTH = 4;
    localparam OB_AW    = 2;

    reg [W-1:0]   ob [0:OB_DEPTH-1];
    reg [OB_AW:0] ob_wptr = 0;
    reg [OB_AW:0] ob_rptr = 0;

    wire [OB_AW:0] ob_count = ob_wptr - ob_rptr;
    wire            ob_full  = (ob_count == OB_DEPTH);
    wire            ob_empty = (ob_count == 0);

    // --- Pre-fetch pipeline ---
    //   Reads from Block RAM whenever FIFO has data and output buffer has
    //   room (accounting for the in-flight read).  Data arrives 1 rclk cycle
    //   after iptr advances.  Sustains 1 word/cycle throughput.
    reg pf_valid = 0;

    // Room for in-flight word (pf_valid) plus the new read we're about to issue
    wire can_prefetch = ~fifo_int_empty & (ob_count + pf_valid < OB_DEPTH);

    always @(posedge rclk or negedge rrst_n) begin
        if (!rrst_n) begin
            iptr_bin <= 0;
            pf_valid <= 1'b0;
        end else begin
            pf_valid <= can_prefetch;
            if (can_prefetch)
                iptr_bin <= iptr_bin + 1;
        end
    end

    // Push pre-fetched data into output buffer
    always @(posedge rclk or negedge rrst_n) begin
        if (!rrst_n)
            ob_wptr <= 0;
        else if (pf_valid) begin
            ob[ob_wptr[OB_AW-1:0]] <= mem_rdata;
            ob_wptr <= ob_wptr + 1;
        end
    end

    // External consumer pops from output buffer
    wire ob_ren = ren & ~ob_empty;

    always @(posedge rclk or negedge rrst_n) begin
        if (!rrst_n)
            ob_rptr <= 0;
        else if (ob_ren)
            ob_rptr <= ob_rptr + 1;
    end

    // --- Combinational outputs from output buffer (single clock, safe) ---
    assign rdata        = ob[ob_rptr[OB_AW-1:0]];
    assign rdata_next   = ob[ob_rptr[OB_AW-1:0] + 1'b1];
    assign empty        = ob_empty;
    assign almost_empty = (ob_count == 1);

endmodule
