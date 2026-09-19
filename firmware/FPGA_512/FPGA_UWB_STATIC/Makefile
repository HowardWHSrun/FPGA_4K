# Toolchain binaries
YOSYS      := yosys
NEXTPNR    := nextpnr-ecp5
ECPPACK    := ecppack
PROGRAMMER := openFPGALoader

# Design files
DESIGN     := top

# Static 4-bit output value (decimal 0-15). Override with: make VALUE=9
VALUE      ?= 0

# Configuration Mode (Defaults to default, override with: make MODE=SPI)
MODE       ?= default
LPF        := bringup_$(MODE).lpf

# Intermediate and output files
JSON       := $(DESIGN).json
CFG        := $(DESIGN).config
BIT        := $(DESIGN).bit

.PHONY: all prog clean

# Default target: builds the bitstream
all: $(BIT)

# 1. Synthesis (Yosys) - top-level module within the file is named "top"
#    -DVALUE=<n> sets the static 4-bit number baked into the bitstream.
$(JSON): $(DESIGN).v
	$(YOSYS) -p "read_verilog -DVALUE=$(VALUE) $(DESIGN).v; synth_ecp5 -top top -json $@"

# 2. Place & Route (nextpnr-ecp5 for LFE5U-25F CABGA256)
$(CFG): $(JSON) $(LPF)
	$(NEXTPNR) --25k --package CABGA256 --json $(JSON) --lpf $(LPF) --textcfg $@

# 3. Pack Bitstream (ecppack)
$(BIT): $(CFG)
	$(ECPPACK) --spimode fast-read $(CFG) $@

# 4. Program directly to SPI Flash using DirtyJTAG
prog: $(BIT)
	$(PROGRAMMER) -c dirtyJtag --fpga-part LFE5U-25F -f $(BIT)

# Windows-friendly cleanup rule
clean:
	@if exist $(JSON) del /f $(JSON)
	@if exist $(CFG) del /f $(CFG)
	@if exist $(BIT) del /f $(BIT)
