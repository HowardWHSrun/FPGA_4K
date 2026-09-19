# -*- coding: utf-8 -*-
"""
Created on Fri Aug 21 22:33:45 2020

@author: Yaolong Hu
"""

import time
from mcculw import ul
from mcculw.enums import DigitalIODirection
from mcculw.device_info import DaqDeviceInfo
from mcculw.ul import ULError

# In current mcculw the example helpers moved: examples.console.util ->
# examples.console.console_examples_util, and examples.props.digital.DigitalProps
# was removed in favor of mcculw.device_info.DaqDeviceInfo.
try:
    from examples.console.console_examples_util import config_first_detected_device
except ImportError:
    from console_examples_util import config_first_detected_device

use_device_detection = True

# Time to hold each half-bit, in seconds. 0.001 matches the original SPI speed
# (1 ms half-bit -> ~500 Hz clock). NOTE: on Windows, time.sleep() rounds up to the
# ~16 ms scheduler tick and each ul.d_out() over low-speed USB adds several ms of
# latency/jitter, so the actual edge timing will be coarser/less regular than 1 ms.
HALF_BIT_PERIOD = 0.001

#initialize the device
def SPI_init(board_num):

    if use_device_detection:
        ul.ignore_instacal()
        # Raises an Exception if no DAQ device is found (no longer returns a bool)
        try:
            config_first_detected_device(board_num)
        except Exception as e:
            print("Could not find device.", e)
            return
    #get digital port propoty of the SPI device
    daq_dev_info = DaqDeviceInfo(board_num)
    dio_info = daq_dev_info.get_dio_info()
    #set the port for SPI output (first port that supports output)
    port = next((p for p in dio_info.port_info if p.supports_output), None)
    if not port:
        print("Error: The DAQ device does not support digital output")
        return
    #initialize the SPI port
    try:
        if port.is_port_configurable:
            ul.d_config_port(board_num, port.type, DigitalIODirection.OUT)
    except ULError as e:
        print(e)
    finally:
        if use_device_detection:
            pass
#            ul.release_daq_device(board_num)
    return port

def run_measurement():
#    begin_time = time.time()
    board_num = 0
    #ther are output pattern of the port, wait for 1 second for the port to stabilized
    port = SPI_init(board_num)
    time.sleep(1)
    # set the bits' value
    VD = '0001'
    DACN = '11111100'
    DNCP = '11110000'
    RST = '1'
    V = '1100'
    VP = '000'
    VC = '1'
    modeswitch = '1'
    waste = '00'

    #0010, 001 - 70MHz
    #0010, 000 - 86MHz
    #0001, 000 - ~200MHz
    #1000, 000 -18MHz
    #1100, 000 - 62MHz

    
    # this example has 32 bits       
    data_32_bit = VD + DACN + DNCP + RST + V + VP + VC + modeswitch + waste
    print(data_32_bit)
    print(len(data_32_bit))
    print(data_32_bit[0])
    # generate the clock signal
    bit_0_tmp = [str((i+1)%2) for i in range(64)] #clock sequence
    clock_sig = ''.join(bit_0_tmp)
    
    print(clock_sig)
    
    data_64_bit = []
    for i in range(32):
        data_64_bit.append(data_32_bit[i])
        data_64_bit.append(data_32_bit[i])
    # print(data_64_bit)
    seq = []
    
    # for half clock cycle, the output generate half the signal level, so need to double the total bits
    
    for i in range(64):
        # This set of programming is corresponding to your hardware connection
        # we only use last 3 bits for SPI (Latch, Data and Clock)
        # so the upper 5 bits is all zeros
        tmp='00000' + str(0) + data_64_bit[i] + clock_sig[i]
        seq.append(int(tmp,2))
    # set the "Latch" output as high
    tmp='00000' + str(1) + data_64_bit[63] + clock_sig[63]
    seq.append(int(tmp,2))
    # set the "Latch" output as low
    tmp='00000' + str(0) + data_64_bit[63] + clock_sig[63]
    seq.append(int(tmp,2))
#    print(seq)
            
    for i in range(64):
        # write the data to the DAQ device output
        ul.d_out(board_num, port.type, seq[i])
        # delay for each half bit
        time.sleep(HALF_BIT_PERIOD)
    # Latch output high
    ul.d_out(board_num, port.type, seq[64])
    time.sleep(HALF_BIT_PERIOD)
    # Latch output low
    ul.d_out(board_num, port.type, seq[65])
    time.sleep(HALF_BIT_PERIOD)
    
    # ul.release_daq_device(board_num)
               
if __name__ == '__main__':
    run_measurement()
