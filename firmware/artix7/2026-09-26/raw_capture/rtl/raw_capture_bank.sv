// One finite raw capture, written on the falling edge of one ASIC clock.
// Memory is not reset. Read it only after the completion handshake has crossed
// into the reader clock domain; do not rearm until the old capture may be lost.
module raw_capture_bank #(
    parameter integer ADDR_WIDTH = 12,
    parameter integer WORD_WIDTH = 10
) (
    input wire sample_clk,
    input wire arst_n,
    input wire request_toggle,
    input wire [WORD_WIDTH-1:0] sample_data,
    output reg completed_toggle = 1'b0,
    input wire read_clk,
    input wire read_enable,
    input wire [ADDR_WIDTH-1:0] read_address,
    output reg [WORD_WIDTH-1:0] read_data
);
    localparam integer DEPTH = 1 << ADDR_WIDTH;
    (* ram_style = "block" *) reg [WORD_WIDTH-1:0] memory [0:DEPTH-1];
    (* ASYNC_REG = "TRUE" *) reg [1:0] reset_pipe = 2'b00;
    (* ASYNC_REG = "TRUE" *) reg [2:0] request_pipe = 3'b000;
    reg seen_toggle = 1'b0;
    reg busy = 1'b0;
    reg [ADDR_WIDTH-1:0] write_address = {ADDR_WIDTH{1'b0}};

    // Asynchronous assertion, synchronous release in the sample domain.
    always @(negedge sample_clk or negedge arst_n)
        if (!arst_n) reset_pipe <= 2'b00;
        else reset_pipe <= {reset_pipe[0], 1'b1};

    always @(negedge sample_clk or negedge arst_n) begin
        if (!arst_n) begin
            request_pipe <= 3'b000;
            seen_toggle <= 1'b0;
            busy <= 1'b0;
            write_address <= {ADDR_WIDTH{1'b0}};
            completed_toggle <= 1'b0;
        end else if (!reset_pipe[1]) begin
            request_pipe <= 3'b000;
            seen_toggle <= 1'b0;
            busy <= 1'b0;
            write_address <= {ADDR_WIDTH{1'b0}};
            completed_toggle <= 1'b0;
        end else begin
            request_pipe <= {request_pipe[1:0], request_toggle};
            if (!busy && request_pipe[2] != seen_toggle) begin
                seen_toggle <= request_pipe[2];
                write_address <= {ADDR_WIDTH{1'b0}};
                busy <= 1'b1;
            end else if (busy) begin
                if (&write_address) begin
                    busy <= 1'b0;
                    completed_toggle <= seen_toggle;
                end else begin
                    write_address <= write_address + 1'b1;
                end
            end
        end
    end

    // Keep the RAM itself free of reset logic for block-RAM inference.
    always @(negedge sample_clk)
        if (arst_n && reset_pipe[1] && busy)
            memory[write_address] <= sample_data;

    // Separate synchronous reader port. The array wrapper prevents read/write
    // overlap, including a new arm coincident with a read request.
    always @(posedge read_clk)
        if (read_enable) read_data <= memory[read_address];
endmodule
