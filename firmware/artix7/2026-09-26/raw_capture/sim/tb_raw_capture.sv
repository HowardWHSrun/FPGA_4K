`timescale 1ns/1ps
module tb_raw_capture #(parameter integer AW = 4);
    localparam integer DEPTH = 1 << AW;
    reg control_clk = 0;
    always #5 control_clk = ~control_clk;
    reg arst_n = 0;
    reg arm = 0;
    reg [7:0] running = 8'hff;
    wire [7:0] sample_clk;
    wire [79:0] sample_words;
    wire busy, capture_valid, arm_accepted, arm_rejected;
    wire [7:0] chip_done;
    reg read_enable = 0;
    reg [2:0] read_chip = 0;
    reg [AW-1:0] read_address = 0;
    wire [9:0] read_data;
    wire read_valid;
    reg [9:0] expected [0:8*DEPTH-1];
    integer count [0:7];
    integer verified_words = 0;
    integer transactions = 0;
    integer i, j;

    raw_capture_array #(.ADDR_WIDTH(AW)) dut (.*);

    // Incommensurate periods and phase offsets exercise all eight CDCs.
    // Data changes only on rising edges, so the falling-edge sample is known.
    genvar c;
    generate for (c=0; c<8; c=c+1) begin: stimulus
        reg clock = 0;
        reg [9:0] word = c*61;
        assign sample_clk[c] = clock;
        assign sample_words[c*10 +: 10] = word;
        initial begin
            #(c+1);
            forever begin
                #(7+c*2);
                if (running[c]) clock = ~clock;
                else clock = 0;
            end
        end
        always @(posedge clock) word <= word + 10'd3;
        always @(negedge clock) begin
            if (arst_n && dut.banks[c].capture.reset_pipe[1] &&
                dut.banks[c].capture.busy) begin
                if (count[c] >= DEPTH) $fatal(1, "Buffer overrun chip %0d", c);
                expected[c*DEPTH+count[c]] = word;
                count[c] = count[c]+1;
            end
        end
    end endgenerate

    task reset_design;
        begin
            @(negedge control_clk); arst_n=0; arm=0; read_enable=0;
            repeat(12) @(negedge control_clk);
            for(integer k=0;k<8;k=k+1) count[k]=0;
            arst_n=1;
            repeat(15) @(negedge control_clk);
            if (busy || capture_valid || read_valid || chip_done)
                $fatal(1, "Invalid state after reset");
        end
    endtask

    task request_capture;
        begin
            for(integer k=0;k<8;k=k+1) count[k]=0;
            @(negedge control_clk); arm=1;
            @(negedge control_clk);
            if (!arm_accepted || !busy || capture_valid)
                $fatal(1, "Arm not accepted correctly");
            arm=0;
        end
    endtask

    task wait_complete;
        integer timeout;
        begin
            timeout=0;
            while (!capture_valid && timeout<DEPTH*8+2000) begin
                @(negedge control_clk); timeout=timeout+1;
            end
            if (!capture_valid || busy || chip_done!=8'hff)
                $fatal(1, "Capture failed or completed before all clocks");
            for(integer k=0;k<8;k=k+1)
                if(count[k]!=DEPTH) $fatal(1,"Wrong depth chip %0d: %0d",k,count[k]);
        end
    endtask

    task read_capture;
        begin
            // Reverse chip/address order proves independent addressing.
            for(integer k=7;k>=0;k=k-1) begin
                for(integer a=DEPTH-1;a>=0;a=a-1) begin
                    @(negedge control_clk);
                    read_enable=1; read_chip=k; read_address=a;
                    @(posedge control_clk); #1;
                    if(!read_valid || read_data!==expected[k*DEPTH+a])
                        $fatal(1,"Read mismatch chip %0d addr %0d: %h != %h",k,a,read_data,expected[k*DEPTH+a]);
                    verified_words=verified_words+1;
                end
            end
            @(negedge control_clk); read_enable=0;
            transactions=transactions+1;
        end
    endtask

    initial begin
        for(i=0;i<8;i=i+1) count[i]=0;
        reset_design();
        read_enable=1;
        @(negedge control_clk);
        if(read_valid) $fatal(1,"Read accepted before capture");
        read_enable=0;

        // Missing clock must keep the capture incomplete, never fake success.
        running[7]=0;
        request_capture();
        repeat(150) @(negedge control_clk);
        if(!busy || capture_valid || chip_done[7] || count[7]!=0)
            $fatal(1,"Absent chip clock not handled correctly");
        arm=1; read_enable=1;
        @(negedge control_clk);
        if(!arm_rejected || arm_accepted || read_valid)
            $fatal(1,"Busy arm/read not rejected");
        arm=0; read_enable=0; running[7]=1;
        wait_complete();
        read_capture();

        // Rearm in the opposite toggle phase, including an overlapping read.
        read_enable=1;
        request_capture();
        if(read_valid) $fatal(1,"Read accepted during rearm");
        read_enable=0;
        wait_complete();
        read_capture();

        // Reset aborts a partial acquisition; the next capture starts cleanly.
        request_capture();
        repeat(8) @(negedge control_clk);
        reset_design();
        request_capture();
        wait_complete();
        read_capture();
        // A stopped clock during reset must not retain a stale done toggle.
        running[7]=0;
        reset_design();
        request_capture();
        repeat(150) @(negedge control_clk);
        if(!busy || capture_valid || chip_done[7])
            $fatal(1,"Stale completion survived reset with absent clock");
        running[7]=1;
        arm=1; // A held command must not trigger another acquisition later.
        wait_complete();
        repeat(8) @(negedge control_clk);
        if(busy || !capture_valid) $fatal(1,"Held arm retriggered capture");
        arm=0;
        read_capture();
        $display("PASS: %0d captures, %0d independently checked raw words; missing-clock, busy/rearm, reset and read guards",transactions,verified_words);
        $finish;
    end
    initial begin #20000000; $fatal(1,"Global timeout"); end
endmodule
