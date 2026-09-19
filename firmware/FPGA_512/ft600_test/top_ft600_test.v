// =============================================================================
// top_ft600_test.v  —  Standalone async FIFO CDC test
//
// Isolates the async_fifo + ft600_writer path from the ADC pipeline:
//   16-bit counter (32 MHz, PLL from crystal) -> async_fifo (32->100 MHz CDC)
//   -> ft600_writer -> FT600 -> host.
//
// Host sees a monotonically incrementing uint16 stream (mod 65536).  Any
// duplicate/skip is a FIFO CDC error.  Counter writes at 64 MB/s, USB drains
// at ~35 MB/s, so the FIFO constantly exercises full/backpressure boundaries.
// =============================================================================

module top (
    input  wire        clk_16m,      // 16 MHz crystal (A7)

    // FT600 USB FIFO (U1)
    input  wire        ft600_clk,    // G1  — 100 MHz clock from FT600
    input  wire        ft600_txe_n,  // C1  — TX buffer not full (low = can write)
    input  wire        ft600_rxf_n,  // C2  — RX data available
    output wire        ft600_wr_n,   // C3  — write strobe (active low)
    output wire        ft600_rd_n,   // B1  — read strobe (active low)
    output wire        ft600_oe_n,   // B2  — output enable (active low)
    output wire        ft600_be0,    // E3  — byte enable 0
    output wire        ft600_be1,    // D3  — byte enable 1
    inout  wire [15:0] ft600_d,      // 16-bit bidirectional data bus

    // Status LEDs
    output wire        led_power,    // P16 — solid on = PLL locked
    output wire        led_data      // M13 — latches ON once TXE_N seen low
);

    // -------------------------------------------------------------------------
    // 1. 32 MHz write clock — same PLL as the real design
    // -------------------------------------------------------------------------
    wire clk32, pll_locked;
    pll_16to32 u_pll (
        .clk_in (clk_16m),
        .clk_out(clk32),
        .locked (pll_locked)
    );

    // Reset synchronizer in 32 MHz write domain (held until PLL locks)
    reg [3:0] w_rst_pipe = 4'hF;
    always @(posedge clk32)
        w_rst_pipe <= {w_rst_pipe[2:0], ~pll_locked};
    wire w_rst_n = ~w_rst_pipe[3];

    // Reset synchronizer in ft600_clk domain
    reg [3:0] ft_rst_pipe = 4'hF;
    always @(posedge ft600_clk)
        ft_rst_pipe <= {ft_rst_pipe[2:0], 1'b0};
    wire ft_rst_n = ~ft_rst_pipe[3];

    // -------------------------------------------------------------------------
    // 2. Write side: incrementing counter, one word every 8th cycle (8 MB/s),
    //    matching the real pipeline rate. FIFO runs near-empty, stressing the
    //    empty/almost_empty boundary and the writer's look-ahead path.
    // -------------------------------------------------------------------------
    wire        fifo_full;
    reg  [2:0]  wdiv = 3'd0;
    wire        fifo_wen = (wdiv == 3'd0) & ~fifo_full;
    reg  [15:0] wcnt = 16'd0;

    always @(posedge clk32 or negedge w_rst_n) begin
        if (!w_rst_n) begin
            wdiv <= 3'd0;
            wcnt <= 16'd0;
        end else begin
            wdiv <= wdiv + 1'b1;
            if (fifo_wen)
                wcnt <= wcnt + 1'b1;
        end
    end

    // -------------------------------------------------------------------------
    // 3. Async FIFO under test: 32 MHz -> 100 MHz, same config as real design
    // -------------------------------------------------------------------------
    wire        fifo_ren;
    wire [15:0] fifo_rdata;
    wire [15:0] fifo_rdata_next;
    wire        fifo_empty;
    wire        fifo_almost_empty;

    async_fifo #(.W(16), .D(4096)) u_fifo (
        .wclk         (clk32),
        .wrst_n       (w_rst_n),
        .wen          (fifo_wen),
        .wdata        (wcnt),
        .full         (fifo_full),
        .rclk         (ft600_clk),
        .rrst_n       (ft_rst_n),
        .ren          (fifo_ren),
        .rdata        (fifo_rdata),
        .rdata_next   (fifo_rdata_next),
        .empty        (fifo_empty),
        .almost_empty (fifo_almost_empty)
    );

    // -------------------------------------------------------------------------
    // 4. FT600 writer (100 MHz) — identical instantiation to the real design
    // -------------------------------------------------------------------------
    wire [15:0] ft_data_out;
    wire        ft_data_oe;
    wire [1:0]  ft_be;

    ft600_writer u_ft600 (
        .clk              (ft600_clk),
        .rst_n            (ft_rst_n),
        .txe_n            (ft600_txe_n),
        .rxf_n            (ft600_rxf_n),
        .wr_n             (ft600_wr_n),
        .rd_n             (ft600_rd_n),
        .oe_n             (ft600_oe_n),
        .be               (ft_be),
        .data_out         (ft_data_out),
        .data_oe          (ft_data_oe),
        .ft_data_in       (ft600_d),
        .cmd_valid        (),
        .cmd_data         (),
        .fifo_ren         (fifo_ren),
        .fifo_rdata       (fifo_rdata),
        .fifo_rdata_next  (fifo_rdata_next),
        .fifo_empty       (fifo_empty),
        .fifo_almost_empty(fifo_almost_empty)
    );

    assign ft600_be0 = ft_be[0];
    assign ft600_be1 = ft_be[1];
    assign ft600_d   = ft_data_oe ? ft_data_out : 16'bz;

    // -------------------------------------------------------------------------
    // 5. Status LEDs
    // -------------------------------------------------------------------------
    assign led_power = pll_locked;

    reg txe_seen = 1'b0;
    always @(posedge ft600_clk)
        if (~ft600_txe_n) txe_seen <= 1'b1;
    assign led_data = txe_seen;

endmodule

// =============================================================================
// PLL: 16 MHz -> 32 MHz (copy of pll_16to32 from fpga/top_custom.v)
//   CLKI_DIV=1, CLKFB_DIV=2, CLKOP_DIV=15
//   PFD = 16 MHz, VCO = 480 MHz, CLKOP = 32 MHz
// =============================================================================
module pll_16to32 (
    input  wire clk_in,
    output wire clk_out,
    output wire locked
);
    wire vcc = 1'b1;
    wire gnd = 1'b0;
    wire clk_fb;

    EHXPLLL #(
        .CLKI_DIV        (1),
        .CLKFB_DIV       (2),
        .CLKOP_DIV       (15),
        .CLKOP_ENABLE    ("ENABLED"),
        .CLKOS_ENABLE    ("DISABLED"),
        .CLKOS2_ENABLE   ("DISABLED"),
        .CLKOS3_ENABLE   ("DISABLED"),
        .OUTDIVIDER_MUXA ("DIVA"),
        .FEEDBK_PATH     ("CLKOP"),
        .PLLRST_ENA      ("DISABLED")
    ) pll_macro (
        .CLKI        (clk_in),
        .CLKFB       (clk_fb),
        .PHASESEL1   (gnd), .PHASESEL0(gnd),
        .PHASEDIR    (gnd), .PHASESTEP(gnd),
        .PHASELOADREG(gnd), .STDBY    (gnd),
        .RST         (gnd),
        .ENCLKOP     (vcc), .ENCLKOS(gnd), .ENCLKOS2(gnd), .ENCLKOS3(gnd),
        .CLKOP       (clk_fb),
        .LOCK        (locked)
    );

    assign clk_out = clk_fb;
endmodule
