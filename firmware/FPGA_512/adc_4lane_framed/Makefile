OSS_CAD  := /opt/oss-cad-suite/bin
YOSYS    := $(OSS_CAD)/yosys
NEXTPNR  := $(OSS_CAD)/nextpnr-ecp5
ECPPACK  := $(OSS_CAD)/ecppack

DEVICE   := 25k
PACKAGE  := CABGA256
SPEED    := 7

SRCS     := top_4lane_framed.v \
            ../fpga/adc_auto_adjust.v \
            ../fpga/pair_tdm_framer.v \
            ../fpga/lane_frame_arbiter.v \
            ../fpga/usb_framer.v \
            ../fpga/async_fifo.v \
            ../fpga/ft600_writer.v \
            ../fpga/spi_programmer.v \
            ../fpga/stim_controller.v \
            ../fpga/serial_framer.v \
            ../decoder/UWB_Serial_Handler.v
LPF      := adc_4lane_framed.lpf
JSON     := adc_4lane_framed.json
CFG      := adc_4lane_framed.cfg
BIT      := adc_4lane_framed.bit

HOST_CC  := cc
HOST_LIB := -L../ft600_test -lftd3xx -Wl,-rpath,../ft600_test

.PHONY: synth prog flash clean

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

lane_test: lane_test.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -O2 -I../adc_channel_test -o $@ lane_test.c $(HOST_LIB) -lm

board_cmd: board_cmd.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -I../adc_channel_test -o $@ board_cmd.c $(HOST_LIB)

wave_record: wave_record.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -O2 -I../adc_channel_test -o $@ wave_record.c $(HOST_LIB)

pattern_check: pattern_check.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -O2 -I../adc_channel_test -o $@ pattern_check.c $(HOST_LIB)

# Uses the official D3XX header/lib (/usr/local) for the async read API
adc_daemon: adc_daemon.c
	$(HOST_CC) -O2 -pthread -I/usr/local/include -o $@ adc_daemon.c \
	  -L/usr/local/lib -lftd3xx -Wl,-rpath,/usr/local/lib

adc_ctl: adc_ctl.c
	$(HOST_CC) -O2 -o $@ adc_ctl.c

usb_capture: usb_capture.c ../adc_channel_test/ftd3xx.h
	$(HOST_CC) -O2 -I../adc_channel_test -o $@ usb_capture.c $(HOST_LIB)

clean:
	rm -f $(JSON) $(CFG) $(BIT) lane_test board_cmd wave_record pattern_check adc_daemon adc_ctl usb_capture
