// =============================================================================
// spi_programmer.v — Data-programmable SPI output from BRAM
//
// Replaces spi_trigger.v. Host loads L/R channel bit data into BRAM via
// command interface, then triggers execution. Shifts out MSB-first at
// 500 kHz (CPOL=0, CPHA=1: data set during LOW phase, chip latches on
// falling edge). After all bits: SPI_LATCH pulses high for one SPI period.
//
// BRAM: two 512-byte arrays (4096 bits max per channel). Yosys infers
// DP16KD via the split-synth recipe in the Makefile.
// =============================================================================

module spi_programmer (
    input  wire        clk,          // 32 MHz
    input  wire        rst_n,

    // BRAM write interface (from command decoder, same clock domain)
    input  wire        wr_en,        // 1-cycle strobe: write one byte
    input  wire        wr_sel,       // 0 = L channel, 1 = R channel
    input  wire [7:0]  wr_data,
    input  wire        ptr_rst,      // reset write pointers to 0

    // Configuration
    input  wire [12:0] bit_count,    // total bits to shift out (1..8191)

    // Control
    input  wire        start,        // 1-cycle pulse: begin SPI sequence

    // SPI outputs
    output reg         spi_clk,
    output reg         spi_latch,
    output reg         spi_dinl,     // L channel data
    output reg         spi_dinr,     // R channel data

    // Status
    output wire        busy
);

    // =====================================================================
    // BRAM storage (Yosys infers DP16KD)
    // =====================================================================
    (* ram_style = "block" *) reg [7:0] mem_l [0:511];
    (* ram_style = "block" *) reg [7:0] mem_r [0:511];

    // Write pointers (auto-increment on each write)
    reg [8:0] wr_ptr_l = 9'd0;
    reg [8:0] wr_ptr_r = 9'd0;

    always @(posedge clk) begin
        if (ptr_rst) begin
            wr_ptr_l <= 9'd0;
            wr_ptr_r <= 9'd0;
        end else if (wr_en) begin
            if (!wr_sel) begin
                mem_l[wr_ptr_l] <= wr_data;
                wr_ptr_l <= wr_ptr_l + 1'b1;
            end else begin
                mem_r[wr_ptr_r] <= wr_data;
                wr_ptr_r <= wr_ptr_r + 1'b1;
            end
        end
    end

    // Synchronous BRAM read (1-cycle latency)
    reg [8:0]  rd_addr = 9'd0;
    reg [7:0]  mem_l_rd, mem_r_rd;
    always @(posedge clk) begin
        mem_l_rd <= mem_l[rd_addr];
        mem_r_rd <= mem_r[rd_addr];
    end

    // =====================================================================
    // SPI state machine
    // =====================================================================
    localparam [5:0] HALF_PERIOD = 6'd32;  // 32 MHz / (2 * 500 kHz) = 32

    localparam [2:0] S_IDLE     = 3'd0,
                     S_LOAD     = 3'd1,   // wait 1 cycle for BRAM read
                     S_CLK_LOW  = 3'd2,   // data set up, clock low
                     S_CLK_HIGH = 3'd3,   // clock high, data stable
                     S_LATCH    = 3'd4,   // latch pulse
                     S_DONE     = 3'd5;

    reg [2:0]  state     = S_IDLE;
    reg [5:0]  phase_ctr = 6'd0;    // counts half-period clocks
    reg [12:0] bit_ctr   = 13'd0;   // which bit (0 to bit_count-1)
    reg [2:0]  bit_in_byte = 3'd0;  // 0..7
    reg [7:0]  shift_l, shift_r;    // shift registers (MSB-first)

    assign busy = (state != S_IDLE);

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state     <= S_IDLE;
            spi_clk   <= 1'b0;
            spi_latch <= 1'b0;
            spi_dinl  <= 1'b0;
            spi_dinr  <= 1'b0;
        end else begin
            case (state)

            S_IDLE: begin
                spi_clk   <= 1'b0;
                spi_latch <= 1'b0;
                spi_dinl  <= 1'b0;
                spi_dinr  <= 1'b0;
                if (start && bit_count != 13'd0) begin
                    rd_addr <= 9'd0;
                    bit_ctr <= 13'd0;
                    phase_ctr <= 6'd0;
                    state <= S_LOAD;
                end
            end

            // Wait 1 cycle for BRAM read latency, then capture byte
            S_LOAD: begin
                if (phase_ctr == 6'd0) begin
                    phase_ctr <= 6'd1;
                end else begin
                    shift_l     <= mem_l_rd;
                    shift_r     <= mem_r_rd;
                    bit_in_byte <= 3'd0;
                    phase_ctr   <= 6'd0;
                    state       <= S_CLK_LOW;
                end
            end

            // Data on outputs, clock LOW — wait half period then rise
            S_CLK_LOW: begin
                spi_dinl <= shift_l[7];
                spi_dinr <= shift_r[7];
                spi_clk  <= 1'b0;
                if (phase_ctr == HALF_PERIOD - 1) begin
                    spi_clk   <= 1'b1;  // rising edge
                    phase_ctr <= 6'd0;
                    state     <= S_CLK_HIGH;
                end else begin
                    phase_ctr <= phase_ctr + 6'd1;
                end
            end

            // Clock HIGH — wait half period then fall (chip latches)
            S_CLK_HIGH: begin
                spi_clk <= 1'b1;
                if (phase_ctr == HALF_PERIOD - 1) begin
                    spi_clk   <= 1'b0;  // falling edge — chip latches
                    shift_l   <= {shift_l[6:0], 1'b0};
                    shift_r   <= {shift_r[6:0], 1'b0};
                    bit_ctr   <= bit_ctr + 13'd1;
                    bit_in_byte <= bit_in_byte + 3'd1;
                    phase_ctr <= 6'd0;

                    if (bit_ctr + 13'd1 == bit_count) begin
                        // Last bit done
                        state <= S_LATCH;
                    end else if (bit_in_byte == 3'd7) begin
                        // Need next byte from BRAM
                        rd_addr <= rd_addr + 9'd1;
                        state   <= S_LOAD;
                    end else begin
                        state <= S_CLK_LOW;
                    end
                end else begin
                    phase_ctr <= phase_ctr + 6'd1;
                end
            end

            // Latch pulse for one full SPI period (2 * HALF_PERIOD)
            S_LATCH: begin
                spi_clk   <= 1'b0;
                spi_latch <= 1'b1;
                if (phase_ctr == 2 * HALF_PERIOD - 1) begin
                    spi_latch <= 1'b0;
                    state     <= S_DONE;
                end else begin
                    phase_ctr <= phase_ctr + 6'd1;
                end
            end

            S_DONE: begin
                spi_latch <= 1'b0;
                spi_dinl  <= 1'b0;
                spi_dinr  <= 1'b0;
                state     <= S_IDLE;
            end

            default: state <= S_IDLE;

            endcase
        end
    end

endmodule
