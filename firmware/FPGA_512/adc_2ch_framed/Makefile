OSS_CAD  := /opt/oss-cad-suite/bin
YOSYS    := $(OSS_CAD)/yosys
NEXTPNR  := $(OSS_CAD)/nextpnr-ecp5
ECPPACK  := $(OSS_CAD)/ecppack

DEVICE   := 25k
PACKAGE  := CABGA256
SPEED    := 7

SRCS     := top_2ch_framed.v \
            ../fpga/adc_auto_adjust.v \
            ../fpga/pair_tdm_framer.v \
            ../fpga/usb_framer.v \
            ../fpga/async_fifo.v \
            ../fpga/ft600_writer.v \
            ../fpga/spi_trigger.v \
            ../decoder/UWB_Serial_Handler.v
LPF      := adc_2ch_framed.lpf
JSON     := adc_2ch_framed.json
CFG      := adc_2ch_framed.cfg
BIT      := adc_2ch_framed.bit

HOST_CC  := cc
HOST_LIB := -L../ft600_test -lftd3xx -Wl,-rpath,../ft600_test

.PHONY: synth prog flash clean usb_frame_reader

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

usb_frame_reader: usb_frame_reader.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -I../adc_channel_test -o $@ usb_frame_reader.c $(HOST_LIB) -lm

channel_verify: channel_verify.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -I../adc_channel_test -o $@ channel_verify.c $(HOST_LIB) -lm

pair_test: pair_test.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -I../adc_channel_test -o $@ pair_test.c $(HOST_LIB) -lm

clean:
	rm -f $(JSON) $(CFG) $(BIT) usb_frame_reader channel_verify pair_test
