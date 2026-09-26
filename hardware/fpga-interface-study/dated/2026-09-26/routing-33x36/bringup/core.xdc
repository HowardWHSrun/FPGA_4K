# Full-system development: only the existing user clock is assigned.
# No117-signal ASIC or differential-link ball assignment is claimed here.
set_property PACKAGE_PIN P17 [get_ports clk_32mhz]
set_property IOSTANDARD LVCMOS18 [get_ports clk_32mhz]
create_clock -name clk_32mhz -period 31.250 [get_ports clk_32mhz]
set_property CFGBVS GND [current_design]
set_property CONFIG_VOLTAGE 1.8 [current_design]
set_property BITSTREAM.CONFIG.UNUSEDPIN Pullnone [current_design]
set_property BITSTREAM.CONFIG.SPI_BUSWIDTH 1 [current_design]
set_property BITSTREAM.CONFIG.CONFIGRATE 3 [current_design]
set_property BITSTREAM.STARTUP.STARTUPCLK Cclk [current_design]
# Future bank16 outputs require IOSTANDARD LVDS_25 and correct bonded P/N pairs.
# The former user LED is removed; no user_led pin constraint is present.
