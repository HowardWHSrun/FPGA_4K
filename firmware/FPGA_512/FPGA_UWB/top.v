// =============================================================================
// top.v — 64 MHz PLL + Cycling 4-bit Counter
//
// Takes the 16 MHz input clock, multiplies it up to 64 MHz through the ECP5
// PLL, and uses that 64 MHz domain to drive a free-running 4-bit number.
// Each of the 4 bits is routed to its own pin (led[3:0]), so the LEDs display
// a binary count that cycles 0 -> 15 -> 0. The raw 64 MHz clock is also driven
// out on a dedicated pin for probing.
// =============================================================================
module top (
    input  wire       clk,          // 16 MHz input clock (Pin A7)
    output wire [3:0] data,          // Cycling 4-bit number, one bit per UWB pin
    output wire [3:0] led_board,    // Same count, slowed for the on-board LEDs
    output wire       clk_out_64    // 64 MHz PLL output clock (Pin A12)
);

    wire clk_64;
    wire pll_lock;

    // -------------------------------------------------------------------------
    // ECP5 PLL Instance (16 MHz -> 64 MHz)
    // Parameters equivalent to: ecppll -i 16 -o 64
    //   fOUT = fIN * CLKFB_DIV / CLKI_DIV = 16 * 4 / 1 = 64 MHz
    //   fVCO = fOUT * CLKOP_DIV           = 64 * 10    = 640 MHz  (in 400-800 range)
    // -------------------------------------------------------------------------
    EHXPLLL #(
        .CLKI_DIV(1),
        .CLKFB_DIV(4),
        .CLKOP_DIV(10),
        .FEEDBK_PATH("CLKOP")
    ) pll_inst (
        .CLKI(clk),
        .CLKFB(clk_64),
        .CLKOP(clk_64),
        .RST(1'b0),
        .PHASESEL0(1'b0),
        .PHASESEL1(1'b0),
        .PHASEDIR(1'b0),
        .PHASESTEP(1'b0),
        .STDBY(1'b0),
        .PLLWAKESYNC(1'b0),
        .ENCLKOP(1'b1),
        .LOCK(pll_lock)
    );

    // Drive the external pin with the raw 64 MHz clock
    assign clk_out_64 = clk_64;

    // -------------------------------------------------------------------------
    // Free-running counter in the 64 MHz domain.
    // The upper 4 bits [27:24] form the visible cycling number:
    //   each step lasts 2^24 / 64 MHz ~= 0.26 s
    //   full 0->15 cycle    2^28 / 64 MHz ~= 4.19 s
    // -------------------------------------------------------------------------
    reg [27:0] cnt_64;
    always @(negedge clk_64) begin
        if (!pll_lock) begin
            cnt_64 <= 28'd0;
        end else begin
            cnt_64 <= cnt_64 + 1'b1;
        end
    end

    // Cycling 4-bit number — full-speed bits out on the UWB header
    assign data = cnt_64[7:4];

    // Same counter, upper bits, mirrored to the on-board LEDs so the binary
    // count is slow enough to watch (bit0 toggles every 2^24/64 MHz ~= 0.26 s).
    assign led_board = cnt_64[27:24];

endmodule
