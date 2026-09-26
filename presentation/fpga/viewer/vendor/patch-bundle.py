#!/usr/bin/env python3
"""Reproduce the pinned local KiCanvas bundle from an official downloaded bundle.

Usage: python3 patch-bundle.py /path/to/upstream-kicanvas.js /path/to/output.js
The input must match the recorded official bundle hash. No downloads, CAD edits,
or minifier/build dependencies are involved.
"""
import hashlib
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
source = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(source).hexdigest() == manifest['upstream_bundle_sha256'], 'Unexpected upstream bundle'
s = source.decode('utf-8')

def replace_exact(old, new, expected=1):
    global s
    assert s.count(old) == expected, (old[:50], s.count(old), expected)
    s = s.replace(old, new)

# Remove only the final external Google Fonts link injection.
start = s.rfind('document.body.appendChild(f`<link')
assert start > 470000 and s[start:].endswith('crossorigin="anonymous" />`);\n')
s = s[:start] + '// Local packaging: font styles are supplied by vendor/fonts.css.\n'

# Bind the SVG icon URL directly: the upstream template leaves a placeholder URL.
replace_exact(
    'return f`<svg viewBox="0 0 48 48" width="48">\n                <use xlink:href="${r}" />\n            </svg>`',
    'let i=document.createElementNS("http://www.w3.org/2000/svg","svg"),n=document.createElementNS("http://www.w3.org/2000/svg","use");i.setAttribute("viewBox","0 0 48 48"),i.setAttribute("width","48"),n.setAttribute("href",r),i.append(n);return i'
)

# Accept a named pad net (KiCad 10) alongside numbered pad nets (older KiCad).
replace_exact(
    'constructor(e){Object.assign(this,V(e,a.start("net"),a.positional("number",R.number),a.positional("name",R.string)))}};',
    'constructor(e){if(e.length===2&&typeof e[1]==="string"){this.name=e[1];this.number=0;return}Object.assign(this,V(e,a.start("net"),a.positional("number",R.number),a.positional("name",R.string)))}};'
)
# Preserve the string or number in segment, arc, via and zone net fields.
replace_exact('a.pair("net",R.number)', 'a.pair("net",R.any)', expected=4)
# Build the renderer's internal numeric index only after the complete board parses.
replace_exact(
    'this.nets.sort((r,i)=>r.number-i.number)}static{c(this,"KicadPCB")}',
    'this.nets.sort((r,i)=>r.number-i.number),fpga4k_index_named_nets(this)}static{c(this,"KicadPCB")}'
)
s += '\n' + (root / 'kicad10-net-compat.js').read_text()
output = s.encode('utf-8')
assert hashlib.sha256(output).hexdigest() == manifest['published_bundle_sha256'], 'Patched bundle hash differs'
Path(sys.argv[2]).write_bytes(output)
print(f'Verified reproduced bundle: {len(output)} bytes; SHA-256 {hashlib.sha256(output).hexdigest()}')
