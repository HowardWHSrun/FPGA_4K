// =============================================================================
// top_4lane_framed.v — Full 4-lane framed ADC pipeline
//
// All 8 ADC channels are deserialized with auto-adjust and stream
// continuously through 4 independent pair_tdm_framer lanes. A frame-
// granular round-robin arbiter interleaves complete 132-word frames from
// the 4 lanes into one async FIFO -> FT600. Every frame is self-labelled
// (per-lane SYNC pattern + LANE_ID), so the host demuxes by lane.
//
// Lane mapping (matches production):
//   Lane 0: D1(B15) + D2(B16)   SYNC 0xA35  LANE_ID 0x03F
//   Lane 1: D3(C15) + D4(C16)   SYNC 0xB46  LANE_ID 0x07E
//   Lane 2: D5(J15) + D6(K15)   SYNC 0xC57  LANE_ID 0x0BD
//   Lane 3: D7(K14) + D8(J14)   SYNC 0xD68  LANE_ID 0x0FC
//
// Frame: {F,SYNC} {E,LANE} {D,CNT} {0,DATA}x128 {C,CRC}
// Rate: 4 lanes x 132 words / 32 us = 16.5 Mwords/s = 33 MB/s over USB.
//
// Proven fixes carried over from the pair-at-a-time bring-up:
//   - negedge capture of cb_d / cb_read (placement-robust input sampling)
//   - usb_framer combinational out_valid (SYNC word never dropped)
//   - strict-alternation TDM with valid/hold handshake (parity-safe)
// New for 4 lanes: sample FIFO depth 64 (absorbs the worst-case 528-cycle
// round-robin wait, ~33 samples/channel) — zero drops in steady state.
//
// cb_fe_reset boots LOW (real-data mode). Host commands on pipe 0x02
// (byte 0 = opcode):
//   0x11 pulse CB_CHIP_RESET   0x21 pulse CB_FE_RESET
//   0x22 CB_FE_RESET = 1 (test mode: amplifier reset -> ~2048 midscale)
//   0x23 CB_FE_RESET = 0 (normal operation)
//   0x41 run SPI init sequence (4096 clocks + latch; button disabled)
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

    // J6 — UWB serial output (4 lanes + bit clock)
    output wire [3:0]  serial_out,
    output wire        serial_clk,

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
    // cb_fe_reset / cb_chip_reset are command-driven — see decoder below.
    // =====================================================================
    // cb_stim_* driven by stim_controller — see below

    reg [20:0] reset_ctr = 21'd0;
    wire reset_done = reset_ctr[20];
    always @(posedge clk_16m)
        if (!reset_done) reset_ctr <= reset_ctr + 1'b1;

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
    // FT600 bidirectional — write data (commands ignored; always streaming)
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
    // CDC: command word from ft600_clk → cb_clk32mhz (toggle handshake).
    // cmd_word_ft is stable long before the toggle edge is observed on the
    // other side (3-FF sync), so it can be sampled directly.
    // Full 16 bits: [7:0]=opcode, [15:8]=payload.
    // =====================================================================
    reg [15:0] cmd_word_ft   = 16'd0;
    reg        cmd_toggle_ft = 1'b0;

    always @(posedge ft600_clk or negedge ft_rst_n) begin
        if (!ft_rst_n) begin
            cmd_word_ft   <= 16'd0;
            cmd_toggle_ft <= 1'b0;
        end else if (cmd_valid) begin
            cmd_word_ft   <= cmd_data;
            cmd_toggle_ft <= ~cmd_toggle_ft;
        end
    end

    reg [2:0] toggle_sync = 3'b0;
    always @(posedge cb_clk32mhz)
        toggle_sync <= {toggle_sync[1:0], cmd_toggle_ft};
    wire cmd_strobe = (toggle_sync[2] != toggle_sync[1]);

    wire [7:0] cmd_opcode  = cmd_word_ft[7:0];
    wire [7:0] cmd_payload = cmd_word_ft[15:8];

    // =====================================================================
    // Command decoder (32 MHz domain)
    //   0x11: pulse CB_CHIP_RESET      0x21: pulse CB_FE_RESET
    //   0x22: CB_FE_RESET = 1          0x23: CB_FE_RESET = 0
    //   0x31: pattern on               0x32: pattern off
    //   0x41: execute SPI              0x42: reset SPI BRAM pointers
    //   0x43+data: SPI L byte          0x44+data: SPI R byte
    //   0x45+lo: bit count [7:0]       0x46+hi: bit count [11:8]
    //   0x60+N: STIM with N reps
    // =====================================================================
    localparam [1:0] PULSE_CYCLES = 2'd2;   // ~62 ns @ 32 MHz

    reg       fe_level = 1'b0;
    reg [1:0] fe_pulse_ctr   = 2'd0;
    reg [1:0] chip_pulse_ctr = 2'd0;
    reg       pattern_en = 1'b0;

    // SPI programmer interface
    reg        spi_wr_en   = 1'b0;
    reg        spi_wr_sel  = 1'b0;   // 0=L, 1=R
    reg [7:0]  spi_wr_data = 8'd0;
    reg        spi_ptr_rst = 1'b0;
    reg [12:0] spi_bit_count = 13'd0;
    reg [7:0]  spi_bc_lo   = 8'd0;
    reg        spi_start   = 1'b0;

    // STIM controller interface
    reg        stim_go    = 1'b0;
    reg [7:0]  stim_count = 8'd0;

    always @(posedge cb_clk32mhz or negedge rst_n) begin
        if (!rst_n) begin
            fe_level       <= 1'b0;
            fe_pulse_ctr   <= 2'd0;
            chip_pulse_ctr <= 2'd0;
            pattern_en     <= 1'b0;
            spi_wr_en      <= 1'b0;
            spi_ptr_rst    <= 1'b0;
            spi_start      <= 1'b0;
            stim_go        <= 1'b0;
        end else begin
            // Self-clearing strobes
            spi_wr_en   <= 1'b0;
            spi_ptr_rst <= 1'b0;
            spi_start   <= 1'b0;
            stim_go     <= 1'b0;

            if (fe_pulse_ctr   != 0) fe_pulse_ctr   <= fe_pulse_ctr - 1'b1;
            if (chip_pulse_ctr != 0) chip_pulse_ctr <= chip_pulse_ctr - 1'b1;

            if (cmd_strobe) begin
                case (cmd_opcode)
                    8'h11: chip_pulse_ctr <= PULSE_CYCLES;
                    8'h21: fe_pulse_ctr   <= PULSE_CYCLES;
                    8'h22: fe_level       <= 1'b1;
                    8'h23: fe_level       <= 1'b0;
                    8'h31: pattern_en     <= 1'b1;
                    8'h32: pattern_en     <= 1'b0;

                    8'h41: spi_start <= 1'b1;
                    8'h42: spi_ptr_rst <= 1'b1;
                    8'h43: begin
                        spi_wr_en   <= 1'b1;
                        spi_wr_sel  <= 1'b0;
                        spi_wr_data <= cmd_payload;
                    end
                    8'h44: begin
                        spi_wr_en   <= 1'b1;
                        spi_wr_sel  <= 1'b1;
                        spi_wr_data <= cmd_payload;
                    end
                    8'h45: spi_bc_lo <= cmd_payload;
                    8'h46: spi_bit_count <= {cmd_payload[4:0], spi_bc_lo};

                    8'h60: begin
                        stim_go    <= 1'b1;
                        stim_count <= cmd_payload;
                    end
                    default: ;
                endcase
            end
        end
    end

    wire stim_fe_reset;
    assign cb_fe_reset   = fe_level | (fe_pulse_ctr != 0) | stim_fe_reset;
    assign cb_chip_reset = ~reset_done | (chip_pulse_ctr != 0);

    // =====================================================================
    // SPI programmer — data-programmable SPI output from BRAM
    // =====================================================================
    spi_programmer u_spi_prog (
        .clk(cb_clk32mhz), .rst_n(rst_n),
        .wr_en(spi_wr_en), .wr_sel(spi_wr_sel), .wr_data(spi_wr_data),
        .ptr_rst(spi_ptr_rst),
        .bit_count(spi_bit_count),
        .start(spi_start),
        .spi_clk(cb_spi_clk), .spi_latch(cb_spi_latch),
        .spi_dinl(cb_spi_dinl), .spi_dinr(cb_spi_dinr),
        .busy()
    );

    // =====================================================================
    // STIM controller — autonomous stimulation sequence
    // =====================================================================
    stim_controller u_stim (
        .clk(cb_clk32mhz), .rst_n(rst_n),
        .start(stim_go), .num_stims(stim_count),
        .stim_en(cb_stim_en), .stim_clk(cb_stim_clk),
        .stim_start(cb_stim_start), .stim_chb(cb_stim_chb),
        .fe_reset(stim_fe_reset),
        .busy()
    );

    // =====================================================================
    // Half-cycle input capture: sample ADC serial data and cb_read on the
    // FALLING edge of cb_clk32mhz. At midscale the only data transitions in
    // a group are the ADC0-ADC3 MSB edges; posedge sampling lands close to
    // those transitions in some placements (seen as MSB drops on ADC0/ADC3).
    // Falling-edge capture puts the sample point half a period (15.6 ns)
    // from the transitions — robust to placement variation. cb_read is
    // delayed identically so group alignment is preserved (the constant
    // offset is absorbed by auto-adjust).
    // =====================================================================
    reg [8:1] cb_d_n;
    reg       cb_read_n;
    always @(negedge cb_clk32mhz) begin
        cb_d_n    <= cb_d;
        cb_read_n <= cb_read;
    end

    // =====================================================================
    // 8 auto-adjust deserializers
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
    // Test-pattern injection (opcode 0x31/0x32): when enabled, each
    // channel's data is replaced by a free-running +1-per-sample ramp,
    // counted on that channel's own ch_valid — so ch_valid timing and all
    // downstream framing behavior are untouched. Verifies sample-exact
    // time advancement through framer -> FIFO -> arbiter -> USB -> host.
    // =====================================================================
    reg  [11:0] pat_cnt     [0:7];
    wire [11:0] ch_data_mux [0:7];

    genvar pi;
    generate
        for (pi = 0; pi < 8; pi = pi + 1) begin : g_pat
            always @(posedge cb_clk32mhz or negedge rst_n) begin
                if (!rst_n)
                    pat_cnt[pi] <= 12'd0;
                else if (ch_valid[pi])
                    pat_cnt[pi] <= pat_cnt[pi] + 12'd1;
            end
            assign ch_data_mux[pi] = pattern_en ? pat_cnt[pi] : ch_data[pi];
        end
    endgenerate

    // =====================================================================
    // 4 lane pipelines: pair_tdm_framer per channel pair
    // SYNC = 0xA35 + 0x111*lane, LANE_NUM = lane
    // =====================================================================
    wire [3:0]  lane_fr_valid;
    wire [63:0] lane_fr_words;
    wire [3:0]  lane_stall;

    genvar li;
    generate
        for (li = 0; li < 4; li = li + 1) begin : g_lane
            pair_tdm_framer #(
                .SYNC_PATTERN(12'hA35 + 12'h111 * li),
                .LANE_NUM(li[3:0]),
                .FIFO_DEPTH(64)
            ) u_lane (
                .clk(cb_clk32mhz), .rst_n(rst_n),
                .even_valid(ch_valid[2*li]),   .even_data(ch_data_mux[2*li]),
                .odd_valid (ch_valid[2*li+1]), .odd_data (ch_data_mux[2*li+1]),
                .fr_valid(lane_fr_valid[li]),
                .fr_word (lane_fr_words[li*16 +: 16]),
                .fifo_full(lane_stall[li]),
                .frame_ready()
            );
        end
    endgenerate

    // =====================================================================
    // Frame-granular round-robin arbiter → async FIFO
    // =====================================================================
    wire        fifo_full;
    wire        arb_wen;
    wire [15:0] arb_word;

    lane_frame_arbiter u_arb (
        .clk(cb_clk32mhz), .rst_n(rst_n),
        .fr_valid(lane_fr_valid),
        .fr_words(lane_fr_words),
        .lane_stall(lane_stall),
        .fifo_full(fifo_full),
        .out_wen(arb_wen),
        .out_word(arb_word)
    );

    // =====================================================================
    // Async FIFO: 32 MHz → FT600 clock
    //
    // D=32768 (64 KB, 32 of 56 DP16KD) gives ~4 ms of host-stall slack at
    // 16.5 MB/s. With the old 8 KB FIFO total end-to-end slack was ~1.2 ms
    // (FT600 16 KB + FIFO) and ordinary desktop scheduling jitter on the
    // host caused periodic sample drops.
    // =====================================================================
    async_fifo #(.W(16), .D(32768)) u_fifo (
        .wclk(cb_clk32mhz), .wrst_n(rst_n),
        .wen(arb_wen), .wdata(arb_word),
        .full(fifo_full),
        .rclk(ft600_clk), .rrst_n(ft_rst_n),
        .ren(fifo_ren), .rdata(fifo_rdata),
        .rdata_next(fifo_rdata_next),
        .empty(fifo_empty), .almost_empty(fifo_almost_empty)
    );

    // =====================================================================
    // UWB serial output — mirror ADC data to J6 (4 lanes + clock)
    //
    // Streaming serial framer: serializes TDM-interleaved data as it
    // arrives (no full-frame buffer), so the serial output sustains
    // zero drops. Same CRC-12 and frame format as usb_framer.
    //
    // Per lane pair: 2 sync_fifo (depth 16) buffer even/odd channels,
    // a strict-alternation TDM mux feeds one serial_framer instance.
    // Output re-registered on negedge for half-cycle setup margin.
    // =====================================================================
    wire [3:0] uwb_ser;

    genvar ui;
    generate
        for (ui = 0; ui < 4; ui = ui + 1) begin : g_uwb
            // --- Per-channel sample FIFOs ---
            wire        ev_full, ev_empty, od_full, od_empty;
            wire [11:0] ev_rdata, od_rdata;
            wire        ev_ren, od_ren;

            sync_fifo #(.W(12), .D(16)) u_ev (
                .clk(cb_clk32mhz), .rst_n(rst_n),
                .wen(ch_valid[2*ui] & ~ev_full),
                .wdata(ch_data_mux[2*ui]),
                .full(ev_full),
                .ren(ev_ren), .rdata(ev_rdata), .empty(ev_empty)
            );
            sync_fifo #(.W(12), .D(16)) u_od (
                .clk(cb_clk32mhz), .rst_n(rst_n),
                .wen(ch_valid[2*ui+1] & ~od_full),
                .wdata(ch_data_mux[2*ui+1]),
                .full(od_full),
                .ren(od_ren), .rdata(od_rdata), .empty(od_empty)
            );

            // --- Strict even/odd TDM mux ---
            reg tdm_sel;  // 0 = even next, 1 = odd next
            wire pref_ok = tdm_sel ? ~od_empty : ~ev_empty;
            wire alt_ok  = tdm_sel ? ~ev_empty : ~od_empty;
            wire tdm_empty = ~pref_ok & ~alt_ok;
            wire [11:0] tdm_rdata = (pref_ok)
                ? (tdm_sel ? od_rdata : ev_rdata)
                : (tdm_sel ? ev_rdata : od_rdata);

            wire tdm_ren;  // from serial_framer
            assign ev_ren = tdm_ren & ((~tdm_sel & pref_ok) | (tdm_sel & ~pref_ok & alt_ok));
            assign od_ren = tdm_ren & ((tdm_sel & pref_ok) | (~tdm_sel & ~pref_ok & alt_ok));

            always @(posedge cb_clk32mhz or negedge rst_n) begin
                if (!rst_n)
                    tdm_sel <= 1'b0;
                else if (tdm_ren & pref_ok)
                    tdm_sel <= ~tdm_sel;  // toggle only on preferred read
            end

            // --- Drop counter (same logic as pair_tdm_framer) ---
            wire sf_frame_end;
            wire ev_drop = ch_valid[2*ui] & ev_full;
            reg [3:0] sf_drop_cnt;

            always @(posedge cb_clk32mhz or negedge rst_n) begin
                if (!rst_n)
                    sf_drop_cnt <= 4'd0;
                else if (sf_frame_end)
                    sf_drop_cnt <= ev_drop ? 4'd1 : 4'd0;
                else if (ev_drop && sf_drop_cnt != 4'd15)
                    sf_drop_cnt <= sf_drop_cnt + 4'd1;
            end

            // --- Streaming serial framer ---
            serial_framer #(
                .SYNC_PATTERN(12'hA35 + 12'h111 * ui),
                .LANE_NUM(ui[3:0])
            ) u_sf (
                .clk(cb_clk32mhz), .rst_n(rst_n),
                .fifo_empty(tdm_empty),
                .fifo_rdata(tdm_rdata),
                .fifo_ren(tdm_ren),
                .drop_cnt(sf_drop_cnt),
                .serial_out(uwb_ser[ui]),
                .frame_end(sf_frame_end)
            );
        end
    endgenerate

    // Re-register on falling edge: data transitions mid-cycle so the
    // UWB receiver sampling on rising edge sees stable data.
    reg [3:0] uwb_out;
    always @(negedge cb_clk32mhz)
        uwb_out <= uwb_ser;

    assign serial_out = uwb_out;
    assign serial_clk = cb_clk32mhz;

    // =====================================================================
    // LEDs
    // =====================================================================
    assign led_spi = 1'b0;

    wire any_valid = ch_valid[0] | ch_valid[1] | ch_valid[2] | ch_valid[3] |
                     ch_valid[4] | ch_valid[5] | ch_valid[6] | ch_valid[7];

    reg [21:0] data_stretch = 22'd0;
    always @(posedge cb_clk32mhz) begin
        if (any_valid) data_stretch <= 22'h3FFFFF;
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
