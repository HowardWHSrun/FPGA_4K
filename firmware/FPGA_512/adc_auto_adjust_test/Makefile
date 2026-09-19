OSS_CAD  := /opt/oss-cad-suite/bin
YOSYS    := $(OSS_CAD)/yosys
NEXTPNR  := $(OSS_CAD)/nextpnr-ecp5
ECPPACK  := $(OSS_CAD)/ecppack

DEVICE   := 25k
PACKAGE  := CABGA256
SPEED    := 7

SRCS     := top_auto_adjust_test.v \
            ../fpga/adc_auto_adjust.v \
            ../decoder/UWB_Serial_Handler.v \
            ../fpga/async_fifo.v \
            ../fpga/ft600_writer.v \
            ../fpga/spi_trigger.v
LPF      := adc_auto_adjust_test.lpf
JSON     := adc_auto_adjust_test.json
CFG      := adc_auto_adjust_test.cfg
BIT      := adc_auto_adjust_test.bit

HOST_CC  := cc
HOST_LIB := -L../ft600_test -lftd3xx -Wl,-rpath,../ft600_test

.PHONY: synth prog flash clean auto_adjust_test sim

synth: $(BIT)
	@echo "Bitstream ready: $(BIT)"

# Split synth: skip `opt -undriven` which removes DP16KD cells
$(JSON): $(SRCS)
	$(YOSYS) \
	  -p "read_verilog -sv $(SRCS); \
	      synth_ecp5 -top top -run :map_ffram; \
	      opt -fast -mux_undef -fine; \
	      memory_map; \
	      opt -fine -mux_undef; \
	      synth_ecp5 -top top -run map_gates: -json $@"

$(CFG): $(JSON) $(LPF)
	$(NEXTPNR) \
	  --$(DEVICE) \
	  --package $(PACKAGE) \
	  --speed $(SPEED) \
	  --lpf $(LPF) \
	  --json $(JSON) \
	  --textcfg $@

$(BIT): $(CFG)
	$(ECPPACK) --compress $(CFG) $@

prog: $(BIT)
	$(OSS_CAD)/openFPGALoader $(BIT)

flash: $(BIT)
	$(OSS_CAD)/openFPGALoader -c dirtyJtag --fpga-part LFE5U-25F -f $(BIT)

auto_adjust_test: auto_adjust_test.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -I../adc_channel_test -o $@ auto_adjust_test.c $(HOST_LIB) -lm

sim:
	$(OSS_CAD)/iverilog -g2012 -o ../sim/tb_auto_adjust \
	    ../sim/tb_auto_adjust.v ../fpga/adc_auto_adjust.v
	$(OSS_CAD)/vvp ../sim/tb_auto_adjust

clean:
	rm -f $(JSON) $(CFG) $(BIT) auto_adjust_test
