#!/usr/bin/env python3
"""Read-only coherence checks for the frozen dated placement and complete pin report."""
import collections,hashlib,json,zipfile
from pathlib import Path
R=Path(__file__).resolve().parents[1]
P=R/'hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads((P/p).read_text())
m=read('manifest.json')
for f in m['files']:assert sha((P/f['path']).read_bytes())==f['sha256'],f['path']
board=P/'layout_v2/hardware/FPGA100T_33x36_Placement.kicad_pcb'
d=read('data/Pin_Component_Audit.json');q=read('data/Final_Verification.json');coverage=read('data/Report_Coverage.json')
assert sha(board.read_bytes())==d['board_sha256']==q['board_sha256']==m['board_sha256']
assert d['board_mm']==[33,36] and not d['tracks'] and not d['zones']
eps={(e['ref'],e['pin']):e for e in d['endpoints']}
assert len(eps)==len(d['endpoints'])==758 and len(d['component_ledger'])==128 and len(d['raw_pad_records'])==807
assert collections.Counter(e['state'] for e in eps.values())=={'assigned':421,'unassigned':331,'intentional NC':6}
assert len(d['net_members'])==47 and coverage['electrical_endpoints_documented']==758 and not coverage['missing'] and not coverage['duplicate']
assert len([e for e in eps.values() if e['ref'] in ['J5','J6'] and e['state']=='unassigned'])==120
drc=read('data/Independent_DRC.json');assert not drc['violations'] and not drc['ignored_checks'] and len(drc['unconnected_items'])==383
pdf=(P/'output/pdf/FPGA100T_Size_Components_Pinout.pdf').read_bytes();assert pdf.startswith(b'%PDF') and sha(pdf)==q['pdf_sha256'] and q['pdf_pages']==31
with zipfile.ZipFile(P/'layout_v2/FPGA100T_33x36_Placement.zip') as z:
 assert z.testzip() is None
 for f in read('layout_v2/Package_Manifest.json')['files']:
  assert sha(z.read('FPGA100T_33x36_Placement/'+f['path']))==f['sha256'],f['path']
 assert z.read('FPGA100T_33x36_Placement/hardware/FPGA100T_33x36_Placement.kicad_pcb')==board.read_bytes()
 assert not any(n.endswith(('.lck','.kicad_prl')) for n in z.namelist())
with zipfile.ZipFile(P/'FPGA100T_LaTeX_Report_Source.zip') as z:
 assert z.testzip() is None
 for f in ['report/FPGA100T_Size_Components_Pinout.tex','report/figures/Compact_Placement.png','data/Pin_Component_Audit.json']:
  assert z.read('FPGA100T_LaTeX_Report/'+f)==(P/f).read_bytes(),f
viewer=json.loads((R/'presentation/fpga/viewer/boards.json').read_text())
v=next(b for b in viewer['boards'] if b['id']=='compact-v2')
assert v['sha256']==d['board_sha256'] and v['dimensions_mm']==[33,36] and not v['manufacturing_ready']
print('PASS: dated placement/report hashes,128 components,758 endpoints,807 pads,47 nets, native/source ZIPs and viewer identity.')
print('Scope: artifact coherence and saved DRC evidence; not new electrical or manufacturing validation.')
