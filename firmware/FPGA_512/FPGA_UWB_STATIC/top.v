// =============================================================================
// top.v — 64 MHz PLL + Static 4-bit Number  (FPGA_UWB_STATIC)
//
// Variant of FPGA_UWB/top.v where the 4-bit output is a fixed value you choose
// at build time instead of a free-running count. The same number is driven onto
// both the UWB header (data[3:0]) and the on-board LEDs (led_board[3:0]).
//
// Set the value (decimal 0-15) one of two ways:
//
//   1. From the command line (preferred):
//        make VALUE=9
//      which passes -DVALUE=9 to Yosys.
//
//   2. By editing the `define VALUE default below.
//
// The PLL and clk_out_64 pin are kept identical to the counter version so the
// same pin constraints apply and the 64 MHz clock stays probeable.
// =============================================================================

// Default when no -DVALUE=<n> is given on the Yosys command line.
`ifndef VALUE
  `define VALUE 0
`endif

module top #(
    // 4-bit number driven onto data[] and led_board[]. Decimal 0-15.
    parameter [3:0] OUT_VALUE = `VALUE
) (
    input  wire       clk,          // 16 MHz input clock (Pin A7)
    output wire [3:0] data,         // Static 4-bit number, one bit per UWB pin
    output wire [3:0] led_board,    // Same number on the on-board LEDs
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
    // Static output. Registered once in the 64 MHz domain so the pins come up
    // clean rather than driving the parameter straight into the IO buffers;
    // held at 0 until the PLL reports lock.
    // -------------------------------------------------------------------------
    reg [3:0] value_q;
    always @(posedge clk_64) begin
        if (!pll_lock)
            value_q <= 4'd0;
        else
            value_q <= OUT_VALUE;
    end

    assign data      = value_q;
    assign led_board = value_q;

endmodule
