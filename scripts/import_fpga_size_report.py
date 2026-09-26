#!/usr/bin/env python3
"""Import the dated33x36 placement and LaTeX report without replacing earlier CAD."""
import argparse,hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REL='hardware/fpga-interface-study/dated/2026-09-26/size-and-pin-report'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--source',type=Path,required=True);a=ap.parse_args();src=a.source.resolve();dest=ROOT/REL;records=[]
 assert (src/'layout_v2/hardware/FPGA100T_33x36_Placement.kicad_pcb').is_file()
 assert sha(src/'layout_v2/hardware/FPGA100T_33x36_Placement.kicad_pcb')=='e2aa37d7b569608729ed44e2d7946d30d108c2124e244e9707d49e6ca25df3de'
 selected=[src/'START_HERE.md',src/'FPGA100T_LaTeX_Report_Source.zip',src/'output/pdf/FPGA100T_Size_Components_Pinout.pdf']
 selected += [p for group in ['data','report'] for p in (src/group).rglob('*') if p.is_file()]
 selected += [src/'scripts/build_report.py']
 layout=src/'layout_v2'
 selected += [p for group in ['hardware','libraries','reports','output'] for p in (layout/group).rglob('*') if p.is_file() and p.suffix not in ['.kicad_prl','.log','.lck']]
 selected += [layout/n for n in ['README.md','START_HERE.md','Mezzanine_Contact_Proposal.csv']]
 for p in sorted(set(selected)):
  rel=p.relative_to(src).as_posix();b=p.read_bytes();original=sha(p)
  if p.suffix in ['.md','.json']:
   b=b.decode().replace(str(src.parents[1])+'/', '').encode()
  q=dest/rel;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(b)
  records.append({'path':rel,'source_sha256':original,'sha256':sha(q),'bytes':len(b),'transformation':'workstation prefix removed from evidence text' if sha(q)!=original else 'unchanged copy'})
 # Native ZIP omits workstation-specific automation and UI state; CAD/library bytes stay exact.
 pub=dest/'layout_v2';items=sorted(p for p in pub.rglob('*') if p.is_file() and p.name not in ['Package_Manifest.json','FPGA100T_33x36_Placement.zip'])
 pm={'primary_project':'hardware/FPGA100T_33x36_Placement.kicad_pro','primary_board_sha256':sha(pub/'hardware/FPGA100T_33x36_Placement.kicad_pcb'),'packaging':'Native CAD and libraries unchanged; evidence paths portable; local automation scripts and UI state omitted. No integrated schematic exists.','files':[{'path':p.relative_to(pub).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in items]}
 m=pub/'Package_Manifest.json';m.write_text(json.dumps(pm,indent=2)+'\n');items.append(m)
 zpath=pub/'FPGA100T_33x36_Placement.zip'
 with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED) as z:
  for p in items:z.write(p,'FPGA100T_33x36_Placement/'+p.relative_to(pub).as_posix())
  assert z.testzip() is None
 for p in [m,zpath]:records.append({'path':p.relative_to(dest).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size,'transformation':'portable package generated; native CAD and libraries unchanged'})
 meta={'date':'2026-09-26','scope':'33x36 placement and complete pin report; not fabrication ready','board_sha256':pm['primary_board_sha256'],'fabrication_ready':False,'files':records}
 own=dest/'manifest.json';own.write_text(json.dumps(meta,indent=2)+'\n')
 records.append({'path':'manifest.json','sha256':sha(own),'bytes':own.stat().st_size,'transformation':'generated import manifest'})
 # Include new files in both existing provenance registries.
 ip=ROOT/'hardware/fpga-interface-study/manifest.json';im=json.loads(ip.read_text());prefix='dated/2026-09-26/size-and-pin-report/'
 im['files']=[r for r in im['files'] if not r['path'].startswith(prefix)]
 im['files'] += [{**r,'path':prefix+r['path']} for r in records];ip.write_text(json.dumps(im,indent=2)+'\n')
 gp=ROOT/'sources/manifest.json';g=json.loads(gp.read_text());g['files']=[r for r in g['files'] if not r['path'].startswith(REL+'/')]
 for r in records:g['files'].append({**r,'path':REL+'/'+r['path'],'origin':'2026-09-26_FPGA_Work/05_Size_And_Pin_Report/'+r['path'],'status':'unrouted placement and explanatory report, not manufacturing release','note':'Separate dated33x36 candidate; no completed routing or integrated schematic.'})
 gp.write_text(json.dumps(g,indent=2,ensure_ascii=False)+'\n')
 print('Imported',len(records),'dated files; ZIP',len(items),'members; nativeSHA',pm['primary_board_sha256'])
if __name__=='__main__':main()
