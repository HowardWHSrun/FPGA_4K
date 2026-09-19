// =============================================================================
// top_2ch_framed.v — Pair-at-a-time ADC pipeline test
//
// All 8 ADC channels are deserialized with auto-adjust. USB command selects
// which pair (0-3) is active. The selected pair feeds a 2-channel TDM mux
// into a single usb_framer, producing framed 16-bit words over USB.
//
// Pair mapping (matches production lane assignment):
//   Pair 0: D1(B15) + D2(B16)   — Lane 0
//   Pair 1: D3(C15) + D4(C16)   — Lane 1
//   Pair 2: D5(J15) + D6(K15)   — Lane 2
//   Pair 3: D7(K14) + D8(J14)   — Lane 3
//
// USB command: lower 2 bits = pair number (0-3). Selects pair and starts.
// Frame: {F,SYNC} {E,LANE} {D,CNT} {0,DATA}×128 {C,CRC}
//
// cb_fe_reset held HIGH → amplifier reset → ADC outputs ~2048 midscale.
// =============================================================================

module top (
    input  wire        clk_16m,

    // CN1 — ADC board interface
    input  wire [8:1]  cb_d,
    input  wire        cb_clk32mhz,
    input  wire        cb_read,
    input  wire        cb_sync,
    output wire        cb_clkh,

    // CN1 — control outputs
    output wire        cb_chip_reset,
    output wire        cb_fe_reset,
    output wire        cb_stim_en,
    output wire        cb_stim_clk,
    output wire        cb_stim_start,
    output wire        cb_stim_chb,

    // CN1 — spare inputs
    input  wire        cb_ac_in,
    input  wire        cb_imp_test,

    // CN1 — SPI outputs
    output wire        cb_spi_clk,
    output wire        cb_spi_latch,
    output wire        cb_spi_dinr,
    output wire        cb_spi_dinl,

    // Button
    input  wire        btn_trigger,

    // FT600 USB FIFO
    input  wire        ft600_clk,
    input  wire        ft600_txe_n,
    input  wire        ft600_rxf_n,
    output wire        ft600_wr_n,
    output wire        ft600_rd_n,
    output wire        ft600_oe_n,
    output wire        ft600_be0,
    output wire        ft600_be1,
    inout  wire [15:0] ft600_d,

    // LEDs
    output wire        led_spi,
    output wire        led_data,
    output wire        led_usb
);

    // =====================================================================
    // PLL — 16 → 32 MHz
    // =====================================================================
    wire clk32M, pll_locked;
    pll_16to32 pll_inst (
        .clk_in (clk_16m),
        .clk_out(clk32M),
        .locked (pll_locked)
    );
    assign cb_clkh = clk_16m;

    // =====================================================================
    // Control outputs
    // =====================================================================
    assign cb_fe_reset   = 1'b1;
    assign cb_stim_en    = 1'b0;
    assign cb_stim_clk   = 1'b0;
    assign cb_stim_start = 1'b0;
    assign cb_stim_chb   = 1'b0;

    reg [20:0] reset_ctr = 21'd0;
    wire reset_done = reset_ctr[20];
    always @(posedge clk_16m)
        if (!reset_done) reset_ctr <= reset_ctr + 1'b1;
    assign cb_chip_reset = ~reset_done;

    // =====================================================================
    // SPI trigger
    // =====================================================================
    wire spi_done;
    spi_trigger #(.CLK_DIVIDER(16)) u_spi (
        .clk(clk_16m), .btn_n(btn_trigger),
        .spi_sig1(cb_spi_dinl), .spi_sig2(cb_spi_dinr),
        .spi_clk_o(cb_spi_clk), .spi_latch(cb_spi_latch),
        .done(spi_done)
    );

    // =====================================================================
    // Reset synchronizers
    // =====================================================================
    reg [3:0] rst_pipe = 4'hF;
    always @(posedge cb_clk32mhz)
        rst_pipe <= {rst_pipe[2:0], ~pll_locked};
    wire rst_n = ~rst_pipe[3];

    reg [3:0] ft_rst_pipe = 4'hF;
    always @(posedge ft600_clk)
        ft_rst_pipe <= {ft_rst_pipe[2:0], 1'b0};
    wire ft_rst_n = ~ft_rst_pipe[3];

    // =====================================================================
    // FT600 bidirectional — write data, read commands
    // =====================================================================
    wire [15:0] ft_data_out;
    wire        ft_data_oe;
    wire [1:0]  ft_be;
    wire        cmd_valid;
    wire [15:0] cmd_data;

    wire        fifo_ren;
    wire [15:0] fifo_rdata;
    wire [15:0] fifo_rdata_next;
    wire        fifo_empty;
    wire        fifo_almost_empty;

    ft600_writer u_ft600 (
        .clk(ft600_clk), .rst_n(ft_rst_n),
        .txe_n(ft600_txe_n), .rxf_n(ft600_rxf_n),
        .wr_n(ft600_wr_n), .rd_n(ft600_rd_n), .oe_n(ft600_oe_n),
        .be(ft_be), .data_out(ft_data_out), .data_oe(ft_data_oe),
        .ft_data_in(ft600_d),
        .cmd_valid(cmd_valid), .cmd_data(cmd_data),
        .fifo_ren(fifo_ren), .fifo_rdata(fifo_rdata),
        .fifo_rdata_next(fifo_rdata_next),
        .fifo_empty(fifo_empty), .fifo_almost_empty(fifo_almost_empty)
    );
    assign ft600_be0 = ft_be[0];
    assign ft600_be1 = ft_be[1];
    assign ft600_d   = ft_data_oe ? ft_data_out : 16'bz;

    // =====================================================================
    // CDC: pair select command from ft600_clk → cb_clk32mhz
    // =====================================================================
    reg [1:0]  cmd_pair_ft = 2'd0;
    reg        cmd_toggle_ft = 1'b0;

    always @(posedge ft600_clk or negedge ft_rst_n) begin
        if (!ft_rst_n) begin
            cmd_pair_ft   <= 2'd0;
            cmd_toggle_ft <= 1'b0;
        end else if (cmd_valid) begin
            cmd_pair_ft   <= cmd_data[1:0];
            cmd_toggle_ft <= ~cmd_toggle_ft;
        end
    end

    reg [2:0] toggle_sync = 3'b0;
    always @(posedge cb_clk32mhz)
        toggle_sync <= {toggle_sync[1:0], cmd_toggle_ft};
    wire cmd_valid_adc = (toggle_sync[2] != toggle_sync[1]);

    reg [1:0] pair_sel = 2'd0;
    reg       streaming = 1'b1;  // start streaming pair 0 on boot

    always @(posedge cb_clk32mhz or negedge rst_n) begin
        if (!rst_n) begin
            pair_sel  <= 2'd0;
            streaming <= 1'b1;
        end else if (cmd_valid_adc) begin
            pair_sel  <= cmd_pair_ft;
            streaming <= 1'b1;
        end
    end

    // =====================================================================
    // Half-cycle input capture: sample ADC serial data and cb_read on the
    // FALLING edge of cb_clk32mhz. At midscale the only data transitions in
    // a group are the ADC0-ADC3 MSB edges; posedge sampling lands close to
    // those transitions in some placements (seen as MSB drops on ADC0/ADC3,
    // channel B16 worst). Falling-edge capture puts the sample point half a
    // period (15.6 ns) from the transitions — robust to placement variation.
    // cb_read is delayed identically so group alignment is preserved (the
    // constant offset is absorbed by auto-adjust).
    // =====================================================================
    reg [8:1] cb_d_n;
    reg       cb_read_n;
    always @(negedge cb_clk32mhz) begin
        cb_d_n    <= cb_d;
        cb_read_n <= cb_read;
    end

    // =====================================================================
    // 8 auto-adjust deserializers (always running)
    // =====================================================================
    wire        ch_valid [0:7];
    wire [11:0] ch_data  [0:7];

    genvar gi;
    generate
        for (gi = 0; gi < 8; gi = gi + 1) begin : g_deser
            adc_auto_adjust #(
                .N_ADC(4), .ADC_BITS(12), .GRP_CYCLES(64), .BASE_ZEROS(11)
            ) u_deser (
                .clk(cb_clk32mhz), .rst_n(rst_n),
                .data_in(cb_d_n[gi + 1]),
                .next_amps(cb_read_n),
                .auto_adjust(1'b1),
                .sample_valid(ch_valid[gi]),
                .sample_data(ch_data[gi]),
                .sample_adc_id(),
                .detected_extra()
            );
        end
    endgenerate

    // =====================================================================
    // Pair select at the FIFO WRITE side — only 2 sample FIFOs total.
    // All 8 deserializers run; pair_sel picks which pair feeds the pipeline.
    // =====================================================================
    wire [2:0] even_ch = {pair_sel, 1'b0};  // 0, 2, 4, 6
    wire [2:0] odd_ch  = {pair_sel, 1'b1};  // 1, 3, 5, 7

    // Blank capture while the framer is emitting: the FT600 burst that
    // drains each finished frame injects noise into the LVCMOS15 ADC data
    // inputs (B15/B16 worst), corrupting samples captured during the burst.
    // Those samples were lost to sample-FIFO overflow anyway, so discarding
    // them at the source costs nothing and keeps frames clean.
    wire frame_ready;

    wire        even_valid = streaming & ch_valid[even_ch] & ~frame_ready;
    wire [11:0] even_data  = ch_data[even_ch];
    wire        odd_valid  = streaming & ch_valid[odd_ch] & ~frame_ready;
    wire [11:0] odd_data   = ch_data[odd_ch];

    // =====================================================================
    // TDM mux + framer: strict even/odd alternation with hold handshake
    // =====================================================================
    wire        fifo_full;
    wire        fr_valid;
    wire [15:0] fr_word;

    pair_tdm_framer #(
        .SYNC_PATTERN(12'hA35),
        .LANE_NUM(4'd0)
    ) u_pipe (
        .clk(cb_clk32mhz), .rst_n(rst_n),
        .even_valid(even_valid), .even_data(even_data),
        .odd_valid(odd_valid),   .odd_data(odd_data),
        .fr_valid(fr_valid), .fr_word(fr_word),
        .fifo_full(fifo_full),
        .frame_ready(frame_ready)
    );

    // =====================================================================
    // Async FIFO: 32 MHz → 100 MHz
    // =====================================================================
    async_fifo #(.W(16), .D(4096)) u_fifo (
        .wclk(cb_clk32mhz), .wrst_n(rst_n),
        .wen(fr_valid & ~fifo_full), .wdata(fr_word),
        .full(fifo_full),
        .rclk(ft600_clk), .rrst_n(ft_rst_n),
        .ren(fifo_ren), .rdata(fifo_rdata),
        .rdata_next(fifo_rdata_next),
        .empty(fifo_empty), .almost_empty(fifo_almost_empty)
    );

    // =====================================================================
    // LEDs
    // =====================================================================
    assign led_spi = spi_done;

    reg [21:0] data_stretch = 22'd0;
    always @(posedge cb_clk32mhz) begin
        if (even_valid | odd_valid) data_stretch <= 22'h3FFFFF;
        else if (data_stretch != 0) data_stretch <= data_stretch - 1'b1;
    end
    assign led_data = (data_stretch != 0);

    reg [21:0] usb_stretch = 22'd0;
    always @(posedge ft600_clk) begin
        if (~ft600_wr_n) usb_stretch <= 22'h3FFFFF;
        else if (usb_stretch != 0) usb_stretch <= usb_stretch - 1'b1;
    end
    assign led_usb = (usb_stretch != 0);

    // =====================================================================
    // Unused
    // =====================================================================
    wire _unused = &{1'b0, cb_ac_in, cb_imp_test, cb_sync, clk32M};

endmodule


// =============================================================================
// pair_tdm_framer lives in fpga/pair_tdm_framer.v (shared with 4-lane top)
// =============================================================================


// =============================================================================
// PLL: 16 MHz → 32 MHz
// =============================================================================
module pll_16to32 (
    input  wire clk_in,
    output wire clk_out,
    output wire locked
);
    wire vcc = 1'b1, gnd = 1'b0, clk_fb;
    EHXPLLL #(
        .CLKI_DIV(1), .CLKFB_DIV(2), .CLKOP_DIV(15),
        .CLKOP_ENABLE("ENABLED"), .CLKOS_ENABLE("DISABLED"),
        .CLKOS2_ENABLE("DISABLED"), .CLKOS3_ENABLE("DISABLED"),
        .OUTDIVIDER_MUXA("DIVA"), .FEEDBK_PATH("CLKOP"),
        .PLLRST_ENA("DISABLED")
    ) pll_macro (
        .CLKI(clk_in), .CLKFB(clk_fb),
        .PHASESEL1(gnd), .PHASESEL0(gnd),
        .PHASEDIR(gnd), .PHASESTEP(gnd),
        .PHASELOADREG(gnd), .STDBY(gnd), .RST(gnd),
        .ENCLKOP(vcc), .ENCLKOS(gnd), .ENCLKOS2(gnd), .ENCLKOS3(gnd),
        .CLKOP(clk_fb), .LOCK(locked)
    );
    assign clk_out = clk_fb;
endmodule
