# ADC 512-Channel Frontend Development Kit

This bundle lets you develop against the 512-channel ADC pipeline without
hardware. A 1-minute recording from the real chip is included; the daemon
replays it in a loop at real-time pace, serving the same Unix socket API
that live hardware uses.

## Quick Start

```bash
# 1. Install the FTDI D3XX library (needed to link the daemon)
#    macOS: copy libftd3xx.dylib to /usr/local/lib and ftd3xx.h to /usr/local/include
#    Linux: see https://ftdichip.com/drivers/d3xx-drivers/

# 2. Build
cd adc_4lane_framed
make adc_daemon adc_ctl

# 3. Run the daemon in replay mode (loops the recording forever)
./adc_daemon --file /tmp/adc_1min.bin

# 4. In another terminal, verify it's working
./adc_ctl stats

# 5. Launch the live Python UI (optional, requires matplotlib + numpy)
python3 adc_live.py
```

The daemon listens on `/tmp/adc_daemon.sock`. Your frontend connects there.

---

## System Overview

```
512 channels = 8 data lines (D1-D8) x 64 amplifiers
Sample rate  = 15,625 Hz per channel
Resolution   = 12-bit ADC, stored as 16-bit signed PCM
Total data   = 16.5 MB/s raw USB, ~16 MB/s decoded
```

The FPGA deserializes 8 ADC serial streams into 4 framed lanes (2 channels
per lane), interleaves them into a single USB stream, and the daemon decodes
it into 512-channel "slices" at 15,625 Hz.

---

## Daemon Socket API

Connect to Unix socket `/tmp/adc_daemon.sock` (stream). The protocol is
line-based text. Send a command terminated by `\n`, read lines until you
see `ok` or `err`.

### Commands

| Command | Syntax | Response |
|---------|--------|----------|
| Board control | `cmd <name>` | `ok` |
| Start recording | `record start <path> <chans>` | `ok recording N channels -> <path>` |
| Stop recording | `record stop` | `ok recorded N slices (Xs, M ch) -> <path> (errors=E drops=D)` |
| Statistics | `stats` | Multi-line report, ends with `ok` |
| Plot stream | `plot <chans> <decim> [minmax]` | `ok plot N channels decim D [minmax]` then binary |
| Shutdown | `quit` | `ok shutting down` |

Unknown commands return: `err unknown verb (cmd/record/stats/plot/quit)`

### Board Commands (`cmd <name>`)

| Name | Opcode | Effect |
|------|--------|--------|
| `chip-reset` | 0x11 | Pulse ADC chip reset |
| `fe-pulse` | 0x21 | Pulse front-end reset |
| `fe-on` | 0x22 | FE reset high (test mode, outputs midscale ~2048) |
| `fe-off` | 0x23 | FE reset low (normal operation) |
| `pattern-on` | 0x31 | Inject +1 ramp pattern (replaces real ADC data) |
| `pattern-off` | 0x32 | Back to real ADC data |
| `spi` | 0x41 | Run SPI init sequence |

In replay mode, board commands are acknowledged but have no effect (no hardware).

### Channel Selection Syntax

Used by `record start` and `plot`:

- `all` -- all 512 channels (0-511)
- `0-63` -- range (inclusive)
- `0-63,320,384-447` -- comma-separated ranges and singles

### Stats Response Format

```
up 62.9 s  in 990.0 MB (15.7 MB/s)  slices 981875 (62.8 s)  ring 5%  overruns 0  hunt 0
lane 0: frames=245468 crc=0 seq=0 lane_id=0 drops=60
lane 1: frames=245468 crc=0 seq=0 lane_id=0 drops=60
lane 2: frames=245468 crc=0 seq=0 lane_id=0 drops=81
lane 3: frames=245468 crc=0 seq=0 lane_id=0 drops=75
read gaps >1.5/3/6/12ms: 0/0/0/0  max 0.00 ms  out-max 0.00 ms
partial 0  filler 0
ok
```

### Async Events

While in text mode (before switching to `plot`), the daemon pushes async
events to all connected clients. These are lines starting with `!`:

```
!drops lane=2 n=5 total=37       FPGA-side sample drops (FIFO overflow)
!crc lane=0 total=3              CRC-12 mismatch (corrupted frame)
!seq lane=1 total=2              Sequence gap (missing frame)
!lane_id lane=3 total=1          Bad LANE_ID field
!usb read error status=-3        USB pipe error
```

---

## Binary Plot Stream Protocol

After sending `plot <chans> <decim> [minmax]` and receiving the `ok` line,
the connection switches to binary. The daemon pushes packets continuously.

### Packet Format

All fields are **little-endian**.

```
Offset  Size   Field      Description
0       u32    magic      0x41444350 ("ADCP")
4       u32    seq        Monotonic packet sequence number
8       u16    n_ch       Number of int16 values per time bin
10      u16    n_slices   Number of time bins in this packet
12      ...    data       int16[n_slices][n_ch]
```

**Total packet size** = 12 + n_slices * n_ch * 2 bytes.

### Normal Mode

`n_ch` = number of selected channels. Each value is one int16 PCM sample.

### Minmax Mode

`n_ch` = 2 * number of selected channels. Values are `{min, max}` pairs:

```
data[slice][2*c + 0] = min over <decim> input slices
data[slice][2*c + 1] = max over <decim> input slices
```

This gives a peak-detect envelope that prevents aliasing in scroll views.

### Flow Control

If your client falls behind (>8192 slices), the daemon skips ahead. It never
blocks. Slow clients miss data but don't affect other clients or recording.

### Parsing Example (Python)

```python
import socket, struct, numpy as np

SOCK = "/tmp/adc_daemon.sock"

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect(SOCK)
s.sendall(b"plot 0-63 8 minmax\n")

# Read text reply
reply = b""
while b"\n" not in reply:
    reply += s.recv(4096)
assert reply.startswith(b"ok")

# Read binary packets
def recv_exact(sock, n):
    buf = bytearray()
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("socket closed")
        buf += chunk
    return bytes(buf)

while True:
    hdr = recv_exact(s, 12)
    magic, seq, n_ch, n_slices = struct.unpack('<IIHH', hdr)
    assert magic == 0x41444350
    raw = recv_exact(s, n_slices * n_ch * 2)
    data = np.frombuffer(raw, dtype='<i2').reshape(n_slices, n_ch)
    # data shape: (n_slices, 128) in minmax mode for 64 channels
    # columns: [ch0_min, ch0_max, ch1_min, ch1_max, ...]
```

---

## Channel Mapping

512 channels = 8 data lines x 64 amplifiers.

```
wav_channel = line * 64 + amplifier

Lane 0, even channel -> line 0 (D1) -> channels   0 -  63
Lane 0, odd channel  -> line 1 (D2) -> channels  64 - 127
Lane 1, even channel -> line 2 (D3) -> channels 128 - 191
Lane 1, odd channel  -> line 3 (D4) -> channels 192 - 255
Lane 2, even channel -> line 4 (D5) -> channels 256 - 319
Lane 2, odd channel  -> line 5 (D6) -> channels 320 - 383
Lane 3, even channel -> line 6 (D7) -> channels 384 - 447
Lane 3, odd channel  -> line 7 (D8) -> channels 448 - 511
```

Each amplifier step (0-63) is a different electrode in the neural probe array.
One "slice" = one sample from all 512 channels = one complete amplifier sweep.

---

## Sample Encoding

### 12-bit ADC to 16-bit PCM

```
pcm = (adc_12bit - 2048) << 4
```

- ADC midscale: 2048 (zero input)
- 1 ADC LSB = 16 PCM counts
- Reversible: `adc = (pcm >> 4) + 2048`

### Voltage Calibration

```
volts = pcm * 3.0 / 4096.0 / 100.0 / 16.0
      = pcm * 4.5776e-6
```

- ADC full-scale: 3 V
- ADC resolution: 4096 counts (12-bit)
- Amplifier gain: 100x
- PCM shift factor: 16 (from the `<< 4`)

**Full-scale input range: +/-15.36 mV**

---

## Raw USB Frame Format

If you're building your own decoder (instead of using the daemon), the
recording file contains the raw USB byte stream. Each 16-bit word (little-
endian) has a 4-bit tag in bits [15:12] and a 12-bit payload in bits [11:0].

### Frame Structure (132 words per lane)

```
Word  0      tag=0xF  SYNC_PATTERN     Lane 0: 0xA35, Lane 1: 0xB46,
                                        Lane 2: 0xC57, Lane 3: 0xD68
Word  1      tag=0xE  LANE_ID          {drop_cnt[3:0], lane[1:0], ~complement}
Word  2      tag=0xD  CYCLE_CNT        Rolling 12-bit frame counter (0-4095)
Words 3-130  tag=0x0  DATA             128 x 12-bit ADC samples
Word  131    tag=0xC  CRC-12           ITU-T poly 0x80F over words 0-130
```

The 4 lanes are interleaved frame-granularly: you'll see a complete 132-word
frame from one lane, then a complete frame from the next, round-robin.

### SYNC Words (16-bit, as seen in the file)

```
Lane 0: 0xFA35
Lane 1: 0xFB46
Lane 2: 0xFC57
Lane 3: 0xFD68
```

### LANE_ID Decoding

```
hi = (word >> 6) & 0x3F
lo = word & 0x3F
valid = (lo == (~hi & 0x3F)) && ((hi & 0x3) == lane)
drop_count = (hi >> 2) & 0xF    // 0 = no drops, saturates at 15
```

### CRC-12

Polynomial `0x80F` (ITU-T). Table-driven for performance:

```c
unsigned short crc_tab[4096];
void crc12_init(void) {
    for (int x = 0; x < 4096; x++) {
        unsigned short crc = x;
        for (int i = 0; i < 12; i++)
            crc = (crc & 0x800) ? ((crc << 1) ^ 0x80F) & 0xFFF
                                : (crc << 1) & 0xFFF;
        crc_tab[x] = crc;
    }
}
unsigned short crc12(unsigned short crc, unsigned short word) {
    return crc_tab[(crc ^ word) & 0xFFF];
}
```

Seed: 0. Accumulate over words 0-130 (payload only, mask with `& 0xFFF`).
Compare result against word 131's payload.

### Data Word Layout (words 3-130)

```
Word  3 = even channel, amplifier  0
Word  4 = odd  channel, amplifier  0
Word  5 = even channel, amplifier  1
Word  6 = odd  channel, amplifier  1
...
Word 129 = even channel, amplifier 63
Word 130 = odd  channel, amplifier 63

amplifier = (word_index - 3) / 2
is_odd    = (word_index - 3) % 2
line      = 2 * lane + is_odd
wav_ch    = line * 64 + amplifier
```

---

## Recording File

The included `adc_1min.bin` is a 990 MB raw capture (~63 seconds, 1 kHz sine
on all channels). Validation results:

```
Lane  Frames    CRC err   Seq gaps  Drops
  0    983040         0         0     60
  1    983041         0         0     60
  2    983040         0         0     81
  3    983040         0         0     75

Total: 3,932,161 frames, 62.91 s
```

Zero CRC errors, zero sequence gaps. The small number of drops (276 total,
~4/sec) are FPGA-side FIFO overflows caused by USB scheduling jitter during
the original capture. They are baked into the recording and reported via the
LANE_ID drop_count field.

When the daemon replays the file, it loops at the end. You'll see one `!seq`
event per lane at the wrap point (CYCLE_CNT jumps backward). This is normal.

---

## Build Dependencies

| Dependency | Purpose | Install |
|------------|---------|---------|
| libftd3xx | FT600 USB driver (link only, not used in replay) | [FTDI D3XX](https://ftdichip.com/drivers/d3xx-drivers/) |
| gcc/clang | C compiler | Xcode CLI tools (macOS) or `build-essential` (Linux) |
| Python 3 | Live UI | `python3` |
| matplotlib | Plot rendering | `pip3 install matplotlib` |
| numpy | Array math | `pip3 install numpy` |

### Makefile Targets

```bash
make adc_daemon      # Main daemon (links libftd3xx)
make adc_ctl         # CLI tool (no dependencies)
make usb_capture     # Raw USB capture tool (needs hardware)
make wave_record     # WAV recorder (needs hardware)
```

---

## Constants Reference

```
SAMPLE_RATE     = 15625 Hz
N_CHANNELS      = 512
N_LINES         = 8 (D1-D8)
N_AMPS          = 64 (per line)
N_LANES         = 4
PLOT_MAGIC      = 0x41444350 ("ADCP")
CRC_POLY        = 0x80F
SOCK_PATH       = "/tmp/adc_daemon.sock"
VOLT_PER_PCM    = 4.5776e-6 V/count
FULL_SCALE      = +/-15.36 mV (input-referred)
USB_THROUGHPUT   = 16.5 MB/s
FRAME_WORDS     = 132 (per lane)
DATA_WORDS      = 128 (per frame)
```
