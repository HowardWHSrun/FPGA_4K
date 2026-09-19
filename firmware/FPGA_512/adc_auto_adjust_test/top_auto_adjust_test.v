// =============================================================================
// top_auto_adjust_test.v — 8-channel ADC auto-adjust diagnostic test
//
// All 8 ADC data channels are independently deserialized with auto-adjust
// zero detection.  Results streamed as {ch_id[3:0], sample[11:0]} over USB.
//
// Default state: idle (no output).
// USB command 0x0100 → start test (auto_adjust enabled, streaming begins).
// USB command 0x0200 → stop test.
//
// cb_fe_reset held HIGH → amplifier reset → ADC outputs ~2048 midscale.
// =============================================================================

module top (
    input  wire        clk_16m,       // A7  — 16 MHz crystal

    // CN1 — ADC board interface
    input  wire [8:1]  cb_d,          // 8 serial data channels
    input  wire        cb_clk32mhz,   // K16 — 32 MHz clock from ADC board
    input  wire        cb_read,       // J13 — group boundary pulse
    input  wire        cb_sync,       // H14 — frame sync (unused)
    output wire        cb_clkh,       // J16 — clock to ADC board

    // CN1 — control outputs
    output wire        cb_chip_reset, // D14 — boot pulse
    output wire        cb_fe_reset,   // E16 — amplifier reset (held HIGH)
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
    input  wire        btn_trigger,   // N13 — active-low

    // FT600 USB FIFO
    input  wire        ft600_clk,     // G1  — 100 MHz
    input  wire        ft600_txe_n,   // C1
    input  wire        ft600_rxf_n,   // C2
    output wire        ft600_wr_n,    // C3
    output wire        ft600_rd_n,    // B1
    output wire        ft600_oe_n,    // B2
    output wire        ft600_be0,     // E3
    output wire        ft600_be1,     // D3
    inout  wire [15:0] ft600_d,       // 16-bit data bus

    // LEDs
    output wire        led_spi,       // P16 — SPI done
    output wire        led_data,      // M13 — ADC data flowing
    output wire        led_usb        // N14 — USB active
);

    // =====================================================================
    // PLL — 16 → 32 MHz (for pll_locked gating only)
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
    assign cb_fe_reset   = 1'b1;  // amplifier reset HIGH → midscale
    assign cb_stim_en    = 1'b0;
    assign cb_stim_clk   = 1'b0;
    assign cb_stim_start = 1'b0;
    assign cb_stim_chb   = 1'b0;

    // Chip reset: 65 ms high pulse on boot
    reg [20:0] reset_ctr = 21'd0;
    wire reset_done = reset_ctr[20];
    always @(posedge clk_16m)
        if (!reset_done)
            reset_ctr <= reset_ctr + 1'b1;
    assign cb_chip_reset = ~reset_done;

    // =====================================================================
    // SPI trigger
    // =====================================================================
    wire spi_done;
    spi_trigger #(.CLK_DIVIDER(16)) u_spi (
        .clk       (clk_16m),
        .btn_n     (btn_trigger),
        .spi_sig1  (cb_spi_dinl),
        .spi_sig2  (cb_spi_dinr),
        .spi_clk_o (cb_spi_clk),
        .spi_latch (cb_spi_latch),
        .done      (spi_done)
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
        .cmd_valid        (cmd_valid),
        .cmd_data         (cmd_data),
        .fifo_ren         (fifo_ren),
        .fifo_rdata       (fifo_rdata),
        .fifo_rdata_next  (fifo_rdata_next),
        .fifo_empty       (fifo_empty),
        .fifo_almost_empty(fifo_almost_empty)
    );

    assign ft600_be0 = ft_be[0];
    assign ft600_be1 = ft_be[1];
    assign ft600_d   = ft_data_oe ? ft_data_out : 16'bz;

    // =====================================================================
    // CDC: command from ft600_clk → cb_clk32mhz
    // =====================================================================
    reg [7:0]  cmd_byte_ft = 8'd0;
    reg        cmd_toggle_ft = 1'b0;

    always @(posedge ft600_clk or negedge ft_rst_n) begin
        if (!ft_rst_n) begin
            cmd_byte_ft   <= 8'd0;
            cmd_toggle_ft <= 1'b0;
        end else if (cmd_valid) begin
            cmd_byte_ft   <= cmd_data[7:0];
            cmd_toggle_ft <= ~cmd_toggle_ft;
        end
    end

    reg [2:0] toggle_sync = 3'b0;
    always @(posedge cb_clk32mhz)
        toggle_sync <= {toggle_sync[1:0], cmd_toggle_ft};
    wire cmd_valid_adc = (toggle_sync[2] != toggle_sync[1]);

    // =====================================================================
    // Test control: start/stop via USB commands
    // cmd_data[15:8] = 0x01 → start test (test_active = 1)
    // cmd_data[15:8] = 0x02 → stop test  (test_active = 0)
    // =====================================================================
    reg test_active = 1'b0;

    // CDC for upper byte (command type)
    reg [7:0] cmd_upper_ft = 8'd0;
    always @(posedge ft600_clk or negedge ft_rst_n) begin
        if (!ft_rst_n)
            cmd_upper_ft <= 8'd0;
        else if (cmd_valid)
            cmd_upper_ft <= cmd_data[15:8];
    end

    // Synchronize to ADC domain
    reg [7:0] cmd_upper_sync;
    reg [7:0] cmd_byte_sync;
    always @(posedge cb_clk32mhz) begin
        cmd_upper_sync <= cmd_upper_ft;
        cmd_byte_sync  <= cmd_byte_ft;
    end

    always @(posedge cb_clk32mhz or negedge rst_n) begin
        if (!rst_n)
            test_active <= 1'b0;
        else if (cmd_valid_adc) begin
            if (cmd_upper_sync == 8'h01)
                test_active <= 1'b1;
            else if (cmd_upper_sync == 8'h02)
                test_active <= 1'b0;
        end
    end

    // =====================================================================
    // 8 independent auto-adjust deserializers
    // =====================================================================
    wire        ch_sample_valid [0:7];
    wire [11:0] ch_sample_data  [0:7];
    wire [1:0]  ch_sample_adc   [0:7];
    wire [1:0]  ch_detected     [0:7];

    genvar gi;
    generate
        for (gi = 0; gi < 8; gi = gi + 1) begin : g_deser
            adc_auto_adjust #(
                .N_ADC      (4),
                .ADC_BITS   (12),
                .GRP_CYCLES (64),
                .BASE_ZEROS (11)
            ) u_deser (
                .clk           (cb_clk32mhz),
                .rst_n         (rst_n),
                .data_in       (cb_d[gi + 1]),
                .next_amps     (cb_read),
                .auto_adjust   (test_active),
                .sample_valid  (ch_sample_valid[gi]),
                .sample_data   (ch_sample_data[gi]),
                .sample_adc_id (ch_sample_adc[gi]),
                .detected_extra(ch_detected[gi])
            );
        end
    endgenerate

    // =====================================================================
    // Per-channel sample buffers (sync_fifo, depth 8)
    // =====================================================================
    wire        buf_wen   [0:7];
    wire [11:0] buf_wdata [0:7];
    wire        buf_full  [0:7];
    wire        buf_ren   [0:7];
    wire [11:0] buf_rdata [0:7];
    wire        buf_empty [0:7];

    generate
        for (gi = 0; gi < 8; gi = gi + 1) begin : g_buf
            assign buf_wen[gi]   = ch_sample_valid[gi] & test_active & ~buf_full[gi];
            assign buf_wdata[gi] = ch_sample_data[gi];

            sync_fifo #(.W(12), .D(8)) u_buf (
                .clk  (cb_clk32mhz),
                .rst_n(rst_n),
                .wen  (buf_wen[gi]),
                .wdata(buf_wdata[gi]),
                .full (buf_full[gi]),
                .ren  (buf_ren[gi]),
                .rdata(buf_rdata[gi]),
                .empty(buf_empty[gi])
            );
        end
    endgenerate

    // =====================================================================
    // Round-robin arbiter: drain 8 FIFOs into async FIFO
    //
    // Format: {ch_id[3:0], sample[11:0]} where ch_id = 1..8
    // =====================================================================
    wire        afifo_full;
    reg         arb_wen = 1'b0;
    reg  [15:0] arb_wdata = 16'd0;
    reg  [2:0]  arb_ptr = 3'd0;  // current channel 0..7

    // Only the selected channel gets ren
    wire [7:0] arb_ren_vec;
    generate
        for (gi = 0; gi < 8; gi = gi + 1) begin : g_ren
            assign buf_ren[gi] = arb_ren_vec[gi];
        end
    endgenerate

    // Read from current arb_ptr if its FIFO is not empty
    wire arb_has_data = ~buf_empty[arb_ptr];
    assign arb_ren_vec = (arb_has_data && !afifo_full && test_active)
                         ? (8'd1 << arb_ptr) : 8'd0;

    always @(posedge cb_clk32mhz or negedge rst_n) begin
        if (!rst_n) begin
            arb_wen   <= 1'b0;
            arb_wdata <= 16'd0;
            arb_ptr   <= 3'd0;
        end else begin
            arb_wen <= 1'b0;

            if (test_active) begin
                if (arb_has_data && !afifo_full) begin
                    // Pack: ch_id (1-indexed) in upper nibble, sample in lower 12
                    arb_wen   <= 1'b1;
                    arb_wdata <= {arb_ptr[2:0] + 4'd1, buf_rdata[arb_ptr]};
                end
                // Always advance pointer (round-robin)
                arb_ptr <= arb_ptr + 3'd1;
            end
        end
    end

    // =====================================================================
    // Async FIFO: 32 MHz → 100 MHz
    // =====================================================================
    async_fifo #(.W(16), .D(4096)) u_fifo (
        .wclk         (cb_clk32mhz),
        .wrst_n       (rst_n),
        .wen          (arb_wen),
        .wdata        (arb_wdata),
        .full         (afifo_full),
        .rclk         (ft600_clk),
        .rrst_n       (ft_rst_n),
        .ren          (fifo_ren),
        .rdata        (fifo_rdata),
        .rdata_next   (fifo_rdata_next),
        .empty        (fifo_empty),
        .almost_empty (fifo_almost_empty)
    );

    // =====================================================================
    // LEDs
    // =====================================================================
    assign led_spi = spi_done;

    reg [21:0] data_stretch = 22'd0;
    always @(posedge cb_clk32mhz) begin
        if (arb_wen)
            data_stretch <= 22'h3FFFFF;
        else if (data_stretch != 0)
            data_stretch <= data_stretch - 1'b1;
    end
    assign led_data = (data_stretch != 0);

    reg [21:0] usb_stretch = 22'd0;
    always @(posedge ft600_clk) begin
        if (~ft600_wr_n)
            usb_stretch <= 22'h3FFFFF;
        else if (usb_stretch != 0)
            usb_stretch <= usb_stretch - 1'b1;
    end
    assign led_usb = (usb_stretch != 0);

    // =====================================================================
    // Unused input anchors
    // =====================================================================
    wire _unused = &{1'b0, cb_ac_in, cb_imp_test, cb_sync, clk32M};

endmodule


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
        .CLKI_DIV     (1),
        .CLKFB_DIV    (2),
        .CLKOP_DIV    (15),
        .CLKOP_ENABLE ("ENABLED"),
        .CLKOS_ENABLE ("DISABLED"),
        .CLKOS2_ENABLE("DISABLED"),
        .CLKOS3_ENABLE("DISABLED"),
        .OUTDIVIDER_MUXA("DIVA"),
        .FEEDBK_PATH  ("CLKOP"),
        .PLLRST_ENA   ("DISABLED")
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
