"""Run independent-clock acquisition tests and an XC7 technology synthesis."""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import re
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--tools', type=Path, required=True, help='OSS CAD Suite bin directory')
args = parser.parse_args()
root = Path(__file__).resolve().parent
out = root / 'sim/output'
out.mkdir(parents=True, exist_ok=True)
sources = ['rtl/raw_capture_bank.sv', 'rtl/raw_capture_array.sv']
checks = []

def run(tool, arguments, log):
    result = subprocess.run([str(args.tools/tool), *arguments], cwd=root,
                            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (out/log).write_text(result.stdout)
    if result.returncode:
        raise RuntimeError(f'{tool} failed: see {out/log}')
    return result.stdout

for width in [4, 12]:
    image = f'sim/output/capture_{1<<width}.vvp'
    run('iverilog', ['-g2012', '-Wall', '-s', 'tb_raw_capture',
                    f'-Ptb_raw_capture.AW={width}', '-o', image,
                    *sources, 'sim/tb_raw_capture.sv'], f'compile_{width}.log')
    log = run('vvp', [image], f'simulation_{width}.log')
    expected_words = 4*8*(1<<width)
    marker = f'PASS: 4 captures, {expected_words} independently checked raw words'
    if marker not in log or 'FATAL:' in log:
        raise RuntimeError(f'Simulation did not pass at depth {1<<width}')
    checks.append({'name': 'independent_clock_capture', 'depthPerChip': 1<<width,
                   'captures': 4, 'checkedWords': expected_words, 'passed': True})

command = ('read_verilog -sv ' + ' '.join(sources) +
           '; hierarchy -check -top raw_capture_array; '
           'synth_xilinx -family xc7 -top raw_capture_array -noiopad; '
           'check; stat')
log = run('yosys', ['-Q', '-T', '-p', command], 'yosys_xc7.log')
if 'Found and reported 0 problems.' not in log:
    raise RuntimeError('Synthesis structural check did not pass')
summary = log[log.rfind('=== design hierarchy ==='):]
resources = {name: int(count) for count, name in
             re.findall(r'^\s+(\d+)\s+(BUFG|RAMB18E1|RAMB36E1)\s*$', summary, re.M)}
checks.append({'name': 'xc7_technology_synthesis', 'passed': True,
               'resources': resources, 'physicalImplementation': False})
report = {
    'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'checks': checks, 'passed': True,
    'sourceSha256': {p: hashlib.sha256((root/p).read_bytes()).hexdigest()
                     for p in [*sources, 'sim/tb_raw_capture.sv']},
    'toolDirectory': str(args.tools),
    'limitations': [
        'No Vivado placement, routing, timing closure, metastability analysis or bitstream.',
        'No ASIC control outputs, SPI/reset sequencer, JTAG transport or XEM8310 link.',
        'Input data test patterns are synthetic; no ASIC or assembled board was operated.',
        'A missing ASIC clock leaves acquisition busy until that clock resumes or reset aborts it.',
    ],
}
(root/'Verification.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({'passed': True, 'checks': checks}, indent=2))
