// Simulation-only pass-through models, excluded from Vivado implementation.
module IBUF(input I, output O); assign O=I; endmodule
module BUFG(input I, output O); assign O=I; endmodule
