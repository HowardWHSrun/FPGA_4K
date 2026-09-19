// =============================================================================
// stim_controller.v — Autonomous stimulation sequence controller
//
// One host command triggers a complete multi-stim sequence. All timing is
// handled internally. Streaming continues undisturbed.
//
// 32 kHz tick generator (32 MHz / 1000) drives the state machine.
// STIM_CLK toggles at 32 kHz while STIM_EN is active.
//
// Timing per stim (in 32 kHz cycles, 31.25 µs each):
//   STIM_START pulse: 1 cycle
//   Wait CHB:         127 cycles  (total 128 from start = 4 ms)
//   CHB high:         32 cycles   (1 ms)
//   Gap:              4 cycles    → next stim or wind-down
//
// Sequence envelope:
//   RST_AMP (fe_reset) asserts first, then STIM_EN + CLK start,
//   4-cycle warmup before first STIM_START. After last stim:
//   STIM_EN drops, then RST_AMP held 48 ticks (1.5 ms) more.
// =============================================================================

module stim_controller (
    input  wire       clk,          // 32 MHz
    input  wire       rst_n,
    input  wire       start,        // 1-cycle pulse
    input  wire [7:0] num_stims,    // 1–255

    output reg        stim_en,
    output reg        stim_clk,
    output reg        stim_start,
    output reg        stim_chb,
    output reg        fe_reset,     // ORed into cb_fe_reset externally

    output wire       busy
);

    // =====================================================================
    // 32 kHz tick generator: 32 MHz / 1000 = 32 kHz
    // =====================================================================
    reg [9:0] tick_ctr  = 10'd0;
    reg       tick      = 1'b0;

    // STIM_CLK phase toggle (toggles on each tick → 32 kHz square wave)
    reg       clk_phase = 1'b0;

    // =====================================================================
    // State machine
    // =====================================================================
    localparam [3:0] S_IDLE       = 4'd0,
                     S_RST_UP     = 4'd1,   // fe_reset high, wait 1 tick
                     S_PRE_EN     = 4'd2,   // stim_en + clk, 4 tick warmup
                     S_STIM_START = 4'd3,   // stim_start pulse, 1 tick
                     S_WAIT_CHB   = 4'd4,   // wait 127 ticks (4 ms total)
                     S_CHB_HIGH   = 4'd5,   // stim_chb high, 32 ticks (1 ms)
                     S_GAP        = 4'd6,   // 4 tick gap between stims
                     S_RST_TAIL   = 4'd7;   // fe_reset tail, 48 ticks (1.5 ms)

    reg [3:0] state       = S_IDLE;
    reg [7:0] cycle_ctr   = 8'd0;   // counts 32 kHz ticks within a state
    reg [7:0] stim_remain = 8'd0;   // stims left to execute

    assign busy = (state != S_IDLE);

    // Tick generator: free-runs while state != IDLE
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            tick_ctr <= 10'd0;
            tick     <= 1'b0;
        end else if (state == S_IDLE) begin
            tick_ctr <= 10'd0;
            tick     <= 1'b0;
        end else begin
            tick <= 1'b0;
            if (tick_ctr == 10'd999) begin
                tick_ctr <= 10'd0;
                tick     <= 1'b1;
            end else begin
                tick_ctr <= tick_ctr + 10'd1;
            end
        end
    end

    // Main state machine
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state       <= S_IDLE;
            stim_en     <= 1'b0;
            stim_clk    <= 1'b0;
            stim_start  <= 1'b0;
            stim_chb    <= 1'b0;
            fe_reset    <= 1'b0;
            clk_phase   <= 1'b0;
            cycle_ctr   <= 8'd0;
            stim_remain <= 8'd0;
        end else begin

            // STIM_CLK: toggle on each tick while stim_en is active
            if (tick && stim_en) begin
                clk_phase <= ~clk_phase;
                stim_clk  <= ~clk_phase;
            end
            if (!stim_en)
                stim_clk <= 1'b0;

            case (state)

            S_IDLE: begin
                stim_en    <= 1'b0;
                stim_start <= 1'b0;
                stim_chb   <= 1'b0;
                fe_reset   <= 1'b0;
                clk_phase  <= 1'b0;
                if (start && num_stims != 8'd0) begin
                    stim_remain <= num_stims;
                    fe_reset    <= 1'b1;
                    cycle_ctr   <= 8'd0;
                    state       <= S_RST_UP;
                end
            end

            // fe_reset asserted; wait 1 tick then enable stim
            S_RST_UP: begin
                if (tick) begin
                    stim_en   <= 1'b1;
                    clk_phase <= 1'b0;
                    cycle_ctr <= 8'd0;
                    state     <= S_PRE_EN;
                end
            end

            // EN + CLK running; warm up 4 ticks before first STIM_START
            S_PRE_EN: begin
                if (tick) begin
                    if (cycle_ctr == 8'd3) begin
                        stim_start <= 1'b1;
                        state      <= S_STIM_START;
                    end else begin
                        cycle_ctr <= cycle_ctr + 8'd1;
                    end
                end
            end

            // STIM_START high for 1 tick
            S_STIM_START: begin
                if (tick) begin
                    stim_start <= 1'b0;
                    cycle_ctr  <= 8'd0;
                    state      <= S_WAIT_CHB;
                end
            end

            // Wait 127 ticks after START (total 128 ticks = 4 ms from start)
            S_WAIT_CHB: begin
                if (tick) begin
                    if (cycle_ctr == 8'd126) begin
                        stim_chb  <= 1'b1;
                        cycle_ctr <= 8'd0;
                        state     <= S_CHB_HIGH;
                    end else begin
                        cycle_ctr <= cycle_ctr + 8'd1;
                    end
                end
            end

            // CHB high for 32 ticks (1 ms)
            S_CHB_HIGH: begin
                if (tick) begin
                    if (cycle_ctr == 8'd31) begin
                        stim_chb    <= 1'b0;
                        stim_remain <= stim_remain - 8'd1;
                        cycle_ctr   <= 8'd0;
                        state       <= S_GAP;
                    end else begin
                        cycle_ctr <= cycle_ctr + 8'd1;
                    end
                end
            end

            // 4-tick gap; then next stim or wind-down
            S_GAP: begin
                if (tick) begin
                    if (cycle_ctr == 8'd3) begin
                        if (stim_remain != 8'd0) begin
                            stim_start <= 1'b1;
                            state      <= S_STIM_START;
                        end else begin
                            stim_en   <= 1'b0;
                            stim_clk  <= 1'b0;
                            cycle_ctr <= 8'd0;
                            state     <= S_RST_TAIL;
                        end
                    end else begin
                        cycle_ctr <= cycle_ctr + 8'd1;
                    end
                end
            end

            // RST_AMP (fe_reset) tail: 48 ticks (1.5 ms) after EN drops
            S_RST_TAIL: begin
                stim_clk <= 1'b0;
                if (tick) begin
                    if (cycle_ctr == 8'd47) begin
                        fe_reset <= 1'b0;
                        state    <= S_IDLE;
                    end else begin
                        cycle_ctr <= cycle_ctr + 8'd1;
                    end
                end
            end

            default: state <= S_IDLE;

            endcase
        end
    end

endmodule
