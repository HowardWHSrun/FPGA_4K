`timescale 1ns/1ps
module tb_rx_mux_1ch;
    localparam N_CH = 1;
    reg clk = 0;
    always #15.625 clk = ~clk;
    reg rst_n = 0;
    reg data_in = 0;
    reg next_amps_in = 0;
    wire [3:0] out_valid;
    wire [47:0] out_word;
    wire [3:0] out_chsel;

    rx_process_mux #(.N_CH(1),.N_ADC_PER_GP(4),.ADC_BITS(12),.ZERO_CYCLES(11),
        .GROUP_CYCLES(64),.N_GROUPS(16),.SAMPS_PER_FR(64),.RX_FIFO_DEPTH(16),.TX_FIFO_DEPTH(16)
    ) uut (.clk(clk),.rst_n(rst_n),.data_in(data_in),.sync_in(1'b0),
        .next_amps_in(next_amps_in),.out_valid(out_valid),.out_word(out_word),.out_chsel(out_chsel));

    reg [5:0] cyc_cnt = 0;
    integer group_cnt = 0;
    // 0x800 = bit11 only. Bits arrive in order bit0,bit1,...,bit11
    // All 4 ADCs get the same value so which_adc doesn't matter
    wire [11:0] test_val = 12'h800;

    always @(posedge clk) begin
        if (!rst_n) begin cyc_cnt<=0; group_cnt<=0; next_amps_in<=0; data_in<=0;
        end else begin
            next_amps_in <= 0;
            if (cyc_cnt == 63) begin cyc_cnt<=0; next_amps_in<=1; group_cnt<=group_cnt+1; end
            else cyc_cnt <= cyc_cnt+1;
            if (cyc_cnt >= 11 && cyc_cnt < 59) begin
                data_in <= test_val[(cyc_cnt - 11) / 4];
            end else data_in <= 0;
        end
    end

    integer total=0, errors=0;
    always @(posedge clk) begin
        if (out_valid[0]) begin
            total = total + 1;
            if (out_word[11:0] !== 12'h800) begin
                errors = errors + 1;
                if (errors <= 5) $display("N_CH=1 ERROR: t=%0t got=0x%03h group=%0d cyc=%0d", $time, out_word[11:0], group_cnt, cyc_cnt);
            end
        end
    end

    initial begin
        rst_n=0; #200; @(posedge clk); rst_n=1;
        wait(group_cnt >= 100); #1000;
        $display("N_CH=1: %0d errors / %0d words", errors, total);
        if (errors == 0) $display("PASS");
        else $display("FAIL");
        $finish;
    end
endmodule
