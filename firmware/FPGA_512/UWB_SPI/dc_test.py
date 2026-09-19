# -*- coding: utf-8 -*-
"""
DC (static) output test for the MCC USB-1024LS.

Purpose: take timing (time.sleep / USB latency / Windows tick) completely out of
the picture so you can verify wiring and grounding with a DMM.

It drives ONE Port A bit high at a time, holding each state long enough to meter,
then drives the whole port low. On the USB-1024LS, Port A bit N -> physical pin
(21 + N):
    bit 0 -> A0 -> pin 21  (Clock in SPI_uwb.py)
    bit 1 -> A1 -> pin 22  (Data)
    bit 2 -> A2 -> pin 23  (Latch)
Reference all measurements to a GND pin (29, 31, or 40).

Expected result if wiring/ground are good:
    the selected pin reads ~5 V and every other Port A pin reads ~0 V.
If every pin reads the same, that's a grounding/wiring problem, not the code.

Run from the UWB_SPI directory:  python dc_test.py
"""

import time

from mcculw import ul
from mcculw.enums import DigitalIODirection
from mcculw.device_info import DaqDeviceInfo
from mcculw.ul import ULError

# In current mcculw the example helper moved to console_examples_util.
try:
    from examples.console.console_examples_util import config_first_detected_device
except ImportError:
    from console_examples_util import config_first_detected_device

use_device_detection = True

# How long to hold each state so you have time to probe with a DMM (seconds).
HOLD_SECONDS = 8


def SPI_init(board_num):
    """Detect the device, configure the first output-capable port, return it."""
    if use_device_detection:
        ul.ignore_instacal()
        try:
            config_first_detected_device(board_num)
        except Exception as e:
            print("Could not find device.", e)
            return None

    daq_dev_info = DaqDeviceInfo(board_num)
    dio_info = daq_dev_info.get_dio_info()
    port = next((p for p in dio_info.port_info if p.supports_output), None)
    if not port:
        print("Error: The DAQ device does not support digital output")
        return None

    try:
        if port.is_port_configurable:
            ul.d_config_port(board_num, port.type, DigitalIODirection.OUT)
    except ULError as e:
        print(e)
    return port


def dc_test():
    board_num = 0
    port = SPI_init(board_num)
    if port is None:
        return

    # Let the port settle after configuration.
    time.sleep(1)

    # (bit value, description) for each state to hold and measure.
    steps = [
        (0b000, "ALL LOW  -> pins 21, 22, 23 all ~0 V"),
        (0b001, "bit0 HIGH -> pin 21 (Clock) ~5 V, pins 22/23 ~0 V"),
        (0b010, "bit1 HIGH -> pin 22 (Data)  ~5 V, pins 21/23 ~0 V"),
        (0b100, "bit2 HIGH -> pin 23 (Latch) ~5 V, pins 21/22 ~0 V"),
        (0b111, "bits 0-2 HIGH -> pins 21/22/23 ~5 V, pins 24-28 ~0 V"),
    ]

    print("Measure each pin against a GND pin (29, 31, or 40).\n")
    for value, description in steps:
        ul.d_out(board_num, port.type, value)
        print("Writing 0b{:03b} to {}: {}".format(value, port.type.name, description))
        print("  holding {} s...".format(HOLD_SECONDS))
        time.sleep(HOLD_SECONDS)

    # Leave the port in a known low state.
    ul.d_out(board_num, port.type, 0b000)
    print("\nDone. Port driven low.")

    # ul.release_daq_device(board_num)


if __name__ == "__main__":
    dc_test()
