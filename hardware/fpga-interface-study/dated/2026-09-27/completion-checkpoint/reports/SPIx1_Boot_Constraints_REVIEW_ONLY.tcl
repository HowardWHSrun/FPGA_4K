# 2026-09-27: REVIEW ONLY, not an implemented or bench-qualified bitstream.
# Source after opening the correctly constrained XC7A100T-1CSG324I design.
# Hardware: fixed M[2:0]=001; U1.L14/M14 intentionally NC; R106/R107 absent.
set_property CONFIG_MODE SPIx1 [current_design]
set_property CONFIG_VOLTAGE 1.8 [current_design]
set_property CFGBVS GND [current_design]
set_property BITSTREAM.CONFIG.SPI_BUSWIDTH 1 [current_design]
set_property BITSTREAM.CONFIG.SPI_32BIT_ADDR No [current_design]
set_property BITSTREAM.CONFIG.EXTMASTERCCLK_EN Disable [current_design]
set_property BITSTREAM.CONFIG.CONFIGRATE 3 [current_design]
set_property BITSTREAM.CONFIG.SPI_FALL_EDGE No [current_design]
set_property BITSTREAM.STARTUP.STARTUPCLK Cclk [current_design]
set_property BITSTREAM.CONFIG.PERSIST No [current_design]
# Retain AMD's default unused SelectIO pull-down explicitly; dedicated strap
# pins are not controlled by this property. Review all assigned application I/O.
set_property BITSTREAM.CONFIG.UNUSEDPIN Pulldown [current_design]
# No functional top-level ports may be assigned to the omitted L14/M14 balls.
# The full design must keep flash CS inactive after startup when unused.
# Preserve CRC and JTAG availability; do not add disable/security fuse settings.
# Example only, after validated timing/bitstream generation (not executed here):
# write_cfgmem -format mcs -interface SPIx1 -size 16 -loadbit "up 0x0 application.bit" application.mcs
# The exact MX25U12835FM2I-10G programming loader must operate in SPI x1.
# End programming ready, normal SPI command mode, QE=0; never enter QPI/quad.
# Confirm identity, status, image readback, power readiness and cold/warm boot.
