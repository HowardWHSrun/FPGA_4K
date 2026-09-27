// Eight independent ASIC capture domains with one stable-buffer read interface.
// This is a capture engine, not an ASIC startup program or a JTAG transport.
// Input word per chip: {SYNC, READ, DATA8, ..., DATA1}. No ADC decoding assumed.
module raw_capture_array #(
    parameter integer ADDR_WIDTH = 12
) (
    input wire control_clk,
    input wire arst_n,
    input wire arm,
    input wire [7:0] sample_clk,
    input wire [79:0] sample_words,
    output reg busy = 1'b0,
    output reg capture_valid = 1'b0,
    output reg arm_accepted = 1'b0,
    output reg arm_rejected = 1'b0,
    output wire [7:0] chip_done,
    input wire read_enable,
    input wire [2:0] read_chip,
    input wire [ADDR_WIDTH-1:0] read_address,
    output wire [9:0] read_data,
    output reg read_valid = 1'b0
);
    (* ASYNC_REG = "TRUE" *) reg [1:0] reset_pipe = 2'b00;
    reg request_toggle = 1'b0;
    reg arm_previous = 1'b0;
    wire [7:0] completed_toggle;
    (* ASYNC_REG = "TRUE" *) reg [7:0] done_meta = 8'b0;
    (* ASYNC_REG = "TRUE" *) reg [7:0] done_sync = 8'b0;
    (* ASYNC_REG = "TRUE" *) reg [7:0] done_stable = 8'b0;
    reg [2:0] selected_chip = 3'b0;
    wire [9:0] bank_data [0:7];
    wire arm_edge = arm && !arm_previous;
    wire accept_arm = reset_pipe[1] && arm_edge && !busy;
    wire accept_read = reset_pipe[1] && capture_valid && !busy &&
                       !accept_arm && read_enable;

    // A done bit is meaningful only for the requested acquisition. Before the
    // first arm chip_done is zero; a completed capture retains its done flags.
    assign chip_done = (busy || capture_valid) ?
                       ~(done_stable ^ {8{request_toggle}}) : 8'b0;
    assign read_data = bank_data[selected_chip];

    always @(posedge control_clk or negedge arst_n)
        if (!arst_n) reset_pipe <= 2'b00;
        else reset_pipe <= {reset_pipe[0], 1'b1};

    always @(posedge control_clk) begin
        if (!reset_pipe[1]) begin
            request_toggle <= 1'b0;
            arm_previous <= 1'b0;
            busy <= 1'b0;
            capture_valid <= 1'b0;
            arm_accepted <= 1'b0;
            arm_rejected <= 1'b0;
            read_valid <= 1'b0;
            selected_chip <= 3'b0;
            done_meta <= 8'b0;
            done_sync <= 8'b0;
            done_stable <= 8'b0;
        end else begin
            done_meta <= completed_toggle;
            arm_previous <= arm;
            done_sync <= done_meta;
            done_stable <= done_sync;
            arm_accepted <= accept_arm;
            arm_rejected <= arm_edge && busy;
            read_valid <= accept_read;
            if (accept_read) selected_chip <= read_chip;
            if (accept_arm) begin
                request_toggle <= ~request_toggle;
                busy <= 1'b1;
                capture_valid <= 1'b0;
            end else if (busy && (&chip_done)) begin
                busy <= 1'b0;
                capture_valid <= 1'b1;
            end
        end
    end

    genvar chip;
    generate for (chip = 0; chip < 8; chip = chip + 1) begin: banks
        raw_capture_bank #(.ADDR_WIDTH(ADDR_WIDTH), .WORD_WIDTH(10)) capture (
            .sample_clk(sample_clk[chip]), .arst_n(arst_n),
            .request_toggle(request_toggle),
            .sample_data(sample_words[chip*10 +: 10]),
            .completed_toggle(completed_toggle[chip]),
            .read_clk(control_clk),
            .read_enable(accept_read && read_chip == chip),
            .read_address(read_address), .read_data(bank_data[chip])
        );
    end endgenerate
endmodule
