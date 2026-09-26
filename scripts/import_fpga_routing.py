#!/usr/bin/env python3
"""Publish only the canonical frozen 33x36 routing project and hash-bound evidence.

Does not run routing, hardware actions, or manufacturing release checks. Run only
once Routing_Snapshot.json and native exports identify the final frozen board.
"""
import argparse,hashlib,json,re,shutil,tempfile,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REL='hardware/fpga-interface-study/dated/2026-09-26/routing-33x36'
NAME='FPGA100T_33x36_Routing'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,data):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
def schemas(hardware):
 pending=[NAME+'.kicad_sch'];seen=set()
 while pending:
  name=pending.pop()
  assert name not in ('.','..') and '/' not in name and '\\' not in name,name
  if name in seen:continue
  p=hardware/name;assert p.is_file(),p;seen.add(name)
  pending.extend(re.findall(r'\(property "Sheetfile" "([^"]+)"',p.read_text()))
 return sorted(seen)
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--source',required=True,type=Path,help='Dated06_33x36_Routing directory');args=ap.parse_args();source=args.source.resolve();current=source/'current';hardware=current/'hardware';dest=ROOT/REL
 snapshot=json.loads((source/'reports/Routing_Snapshot.json').read_text());board=hardware/(NAME+'.kicad_pcb');boardhash=sha(board)
 assert snapshot['boardSha256']==boardhash,'Stale snapshot:board hash differs'
 assert snapshot['components']==130 and snapshot['boardMm']==[33,36]
 assert not any(snapshot[k] for k in ['fabricationReady','fullBoardComplete','electricalOperationVerified'])
 drc=json.loads((source/'reports/Native_DRC.json').read_text());assert len(drc['violations'])==snapshot['drcViolations'] and len(drc['schematic_parity'])==snapshot['parityIssues'] and len(drc['unconnected_items'])==snapshot['unconnectedItems']
 assert snapshot['drcViolations']==0 and snapshot['parityIssues']==0,'Cannot publish known physical/parity errors as accepted routing snapshot'
 provenance=json.loads((source/'output/Current_View_Provenance.json').read_text());assert provenance['source_sha256']==boardhash and provenance['source_unchanged']
 linked=schemas(hardware);assert len(linked)==snapshot['schematicPages']==21
 records=[];dest.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix='routing-stage-',dir=dest.parent) as tmp:
  stage=Path(tmp)
  def copy(src,rel,portable=False):
   original=sha(src);b=src.read_bytes()
   if portable:
    t=b.decode().replace(str(source)+'/', '').replace(str(source.parents[1])+'/', '')
    for folder in ['hardware','libraries','bringup','reports']:t=t.replace('current/'+folder+'/',folder+'/')
    if src.suffix=='.md':t=t.replace('../current/','../').replace('(current/','(')
    b=t.encode()
   q=stage/rel;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(b)
   records.append({'path':rel,'sha256':sha(q),'source_sha256':original,'bytes':len(b),'transformation':'portable evidence links/workstation prefixes only' if sha(q)!=original else 'unchanged copy'})
  for name in [NAME+'.kicad_pcb',NAME+'.kicad_pro','fp-lib-table','sym-lib-table',*linked]:copy(hardware/name,'hardware/'+name)
  rule=hardware/(NAME+'.kicad_dru')
  if rule.exists():copy(rule,'hardware/'+rule.name)
  for p in sorted((current/'libraries').rglob('*')):
   if p.is_file() and p.suffix in ['.kicad_sym','.kicad_mod','.step','.stp','.wrl'] and not any(part.startswith('.') for part in p.relative_to(current/'libraries').parts):copy(p,p.relative_to(current).as_posix())
  for p in sorted((current/'bringup').glob('*')):
   if p.is_file() and p.suffix in ['.xdc','.v','.sv','.tcl','.md']:copy(p,p.relative_to(current).as_posix(),p.suffix=='.md')
  for name in ['component_manifest_resolved.json','schematic_instances.json',NAME+'.net','BOM_Development.csv']:
   p=current/'reports'/name
   if p.exists():copy(p,'reports/'+name,p.suffix in ['.json','.md'])
  for name in ['Routing_Snapshot.json','Routing_Review.md','Native_DRC.json','Native_ERC.json','Native_Readback.json','Final_Pin_Audit.json','Source_Continuity.json','Merge_Provenance.json','Final_Connectivity.json','Final_Native_Audit.json','All_Pin_Connections.csv','Component_List.csv','Net_Endpoints.csv','Placement_Changes.json','Power_Routing_Review.md','Ground_Escape_Review.md','Final_Power_Review.md','Final_Rail_Invariant_Check.json','Final_Power_Readback.json','Final_Independent_Audit.md','Final_Independent_Audit.json','Final_Independent_DRC.json','Final_Frozen_Readback.json','Final_Geometry.json','Schematic_Readability_Adjustment.json','Board_Annotation_Update.json','Final_Island_Readback.json','Annotation_Independent_Confirmation.json','Package_And_ASIC_Count_Audit.json']:
   p=source/'reports'/name
   if p.exists():copy(p,'reports/'+name,True)
  for name in ['Current_Front.svg','Current_Back.svg',NAME+'.svg',NAME+'.png',NAME+'_Schematic.pdf','Current_View_Provenance.json']:
   p=source/'output'/name
   if p.exists():copy(p,'output/'+name,p.suffix=='.json')
  for required in ['reports/Routing_Snapshot.json','reports/Routing_Review.md','reports/Native_DRC.json','reports/Native_ERC.json','reports/component_manifest_resolved.json','reports/Native_Readback.json','reports/All_Pin_Connections.csv','reports/Component_List.csv','reports/Net_Endpoints.csv','reports/Placement_Changes.json','reports/Power_Routing_Review.md','reports/Ground_Escape_Review.md','output/'+NAME+'_Schematic.pdf','output/Current_Front.svg','output/Current_Back.svg','output/'+NAME+'.svg']:
   assert (stage/required).is_file(),required
  report_files=['FPGA100T_33x36_Routing_Component_Pin_Report.tex','output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf','FPGA100T_33x36_Routing_Report_Source.zip','Report_Verification.json','Report_Coverage.json']
  has_report=(source/'report/Report_Verification.json').exists()
  if has_report:
   coverage=json.loads((source/'report/Report_Coverage.json').read_text())
   assert coverage['board_sha256']==boardhash and coverage['components_documented']==130 and coverage['canonical_endpoints_documented']==762 and coverage['functional_nets_documented']==48
   assert coverage['missing_endpoints']==[] and coverage['duplicate_endpoint_rows']==0
   for rel in report_files:
    assert (source/'report'/rel).is_file(),rel
    copy(source/'report'/rel,'report/'+rel,rel.endswith('.json'))
  readme=f'''# Current33 ×36 mm FPGA routing development

26 September2026. Open [the complete native KiCad project](hardware/{NAME}.kicad_pro) with this folder intact. This is the current smallest design:130 physical parts, both mezzanines,1.8 V configuration and2.5 V bank 16. Earlier variants remain historical references.

[Current routing review](reports/Routing_Review.md) · [Measured snapshot](reports/Routing_Snapshot.json) · [Native DRC](reports/Native_DRC.json) · [Native ERC](reports/Native_ERC.json) · [All component pins](reports/All_Pin_Connections.csv) · [Component list](reports/Component_List.csv) · [Net endpoints](reports/Net_Endpoints.csv) · [21-sheet native schematic](output/{NAME}_Schematic.pdf) · [Front/back view](output/{NAME}.svg).

Saved board SHA-256: `{boardhash}`. The frozen source reports {snapshot['tracks']} track segments, {snapshot['vias']} vias and {snapshot['zones']} zones, with {snapshot['unconnectedItems']} unconnected items on assigned nets. Those counts exclude unassigned application signals. Native physical DRC and schematic parity are both zero. This is not electrical or manufacturing qualification.

The117 ASIC signals and eight custom-link data contacts remain unassigned. All120 numbered mezzanine contacts are open. The matching21-page native schematic, local symbols/footprints and existing-clock XDC are included. ASIC pad limits/timing, power entry and cable, the receiver, full firmware, SI/PI/thermal and fabrication/assembly review remain unfinished. The earlier31-page LaTeX report describes the128-component placement-only snapshot and is not this revision's connectivity report.

Library provenance: cached KiCad assets retain their original source fields and KiCad library licensing. Converter and connector footprints derive from the manufacturer documents identified in their properties. Missing standard3D models do not prevent editing or establish mating clearance. Native CAD is copied byte-for-byte; evidence paths are made portable. Experimental candidate boards, scripts, editor state, lock files and caches are excluded. No manufacturing package is released.
'''
  for a,b in [('Current33','Current 33'),('×36','× 36'),('September2026','September 2026'),('design:130','design: 130'),('mezzanines,1.8','mezzanines, 1.8'),('and2.5','and 2.5'),('The117','The 117'),('All120','All 120'),('matching21','matching 21'),('earlier31','earlier 31'),('the128','the 128'),('standard3D','standard 3D')]:readme=readme.replace(a,b)
  if has_report:readme=readme.replace('Library provenance:', '[Current component and pin report (LaTeX PDF)](report/output/pdf/FPGA100T_33x36_Routing_Component_Pin_Report.pdf) · [Portable editable report source](report/FPGA100T_33x36_Routing_Report_Source.zip) · [Report coverage](report/Report_Coverage.json). This report describes the current 130-component board.\n\nLibrary provenance:')
  (stage/'README.md').write_text(readme)
  records.append({'path':'README.md','sha256':sha(stage/'README.md'),'bytes':(stage/'README.md').stat().st_size,'transformation':'generated current snapshot guide'})
  pm={'primary_project':'hardware/'+NAME+'.kicad_pro','primary_board_sha256':boardhash,'fabrication_ready':False,'files':[{k:r[k] for k in ['path','sha256','bytes']} for r in records]};dump(stage/'Package_Manifest.json',pm)
  records.append({'path':'Package_Manifest.json','sha256':sha(stage/'Package_Manifest.json'),'bytes':(stage/'Package_Manifest.json').stat().st_size,'transformation':'generated portable package manifest'})
  with zipfile.ZipFile(stage/(NAME+'.zip'),'w',zipfile.ZIP_DEFLATED) as z:
   for r in records:
    info=zipfile.ZipInfo(NAME+'/'+r['path'],(2026,9,26,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,(stage/r['path']).read_bytes())
   assert z.testzip() is None
  zpath=stage/(NAME+'.zip');records.append({'path':zpath.name,'sha256':sha(zpath),'bytes':zpath.stat().st_size,'transformation':'deterministic complete native project package'})
  meta={'date':snapshot['date'],'kind':'current-smallest-fpga-routing-development','board_sha256':boardhash,'native_CAD_changed_during_packaging':False,'fabrication_ready':False,'files':records};dump(stage/'manifest.json',meta)
  # Refuse unknown files in a prior target; never silently package stale candidates.
  expected={p.relative_to(stage).as_posix() for p in stage.rglob('*') if p.is_file()}
  if dest.exists():assert not {p.relative_to(dest).as_posix() for p in dest.rglob('*') if p.is_file()}-expected,'Unexpected files in publication target'
  shutil.copytree(stage,dest,dirs_exist_ok=True)
 # Canonical published data is copied from measured snapshot, not hardcoded routing claims.
 data={**snapshot,'artifactRoot':'../../'+REL+'/'};dump(ROOT/'presentation/fpga/review-data.json',data)
 views=ROOT/'presentation/fpga/assets'
 for side in ['front','back']:shutil.copy2(dest/f'output/Current_{side.title()}.svg',views/f'current-{side}.svg')
 shutil.copy2(dest/'output/Current_View_Provenance.json',views/'current-view-provenance.json')
 indexpath=ROOT/'presentation/fpga/viewer/boards.json';index=json.loads(indexpath.read_text());existing=[b for b in index['boards'] if b['id']!='compact-routed']
 for b in existing:
  if b['id']=='core':b['title']='Earlier core ·40 ×36 mm'
  if b['id']=='compact-v2':b['title']='Earlier33 ×36 mm placement ·128 parts'
 expected={'footprints':snapshot['components'],'pads':snapshot['padRecords'],'segments':snapshot['tracks'],'vias':snapshot['vias'],'zones':snapshot['zones'],'fpgaPads':324,'copperLayers':snapshot.get('copperLayers',6),'nets':snapshot.get('nativeNets',snapshot.get('nativeCounts',{}).get('nets'))};assert isinstance(expected['nets'],int)
 item={'id':'compact-routed','title':'Current33 ×36 mm · routing development','description':f"130 parts; corrected1.8 V boot and2.5 V link-bank rails, both ASIC mezzanines and a matching schematic. {snapshot['unconnectedItems']} assigned-net connection items remain;117 ASIC assignments and the data link are unfinished.",'native':'../../../'+REL+'/hardware/'+NAME+'.kicad_pcb','zip':'../../../'+REL+'/'+NAME+'.zip','svg':'../../../'+REL+'/output/'+NAME+'.svg','sha256':boardhash,'expected':expected,'unconnected_items':snapshot['unconnectedItems'],'manufacturing_ready':False,'dimensions_mm':snapshot['boardMm']}
 for b in [item,*existing]:
  for key in ['title','description']:
   b[key]=b[key].replace('Current33','Current 33').replace('Earlier33','Earlier 33').replace('×36','× 36').replace('·40','· 40').replace('·128','· 128').replace('corrected1.8','corrected 1.8').replace('and2.5','and 2.5').replace('remain;117','remain; 117')
 index['boards']=[item,*existing];index['audit']='../../../'+REL+'/reports/Routing_Snapshot.json';dump(indexpath,index)
 dump(ROOT/'presentation/fpga/manifest.json',{'kind':'fpga-professor-review','updated':snapshot['date'],'entry':'presentation/fpga/index.html','data':'presentation/fpga/review-data.json','source':REL,'artifact_manifest':REL+'/manifest.json','historical_page':'presentation/fpga/history-2026-09-24.html','board_sha256':boardhash,'fabrication_ready':False})
 own=dest/'manifest.json';records.append({'path':'manifest.json','sha256':sha(own),'bytes':own.stat().st_size,'transformation':'generated current routing import manifest'})
 ip=ROOT/'hardware/fpga-interface-study/manifest.json';im=json.loads(ip.read_text());im['current_routing']={'path':'dated/2026-09-26/routing-33x36','board_sha256':boardhash,'status':'current smallest routing development; not fabrication release'};prefix='dated/2026-09-26/routing-33x36/';im['files']=[r for r in im['files'] if not r['path'].startswith(prefix)]+[{**r,'path':prefix+r['path']} for r in records];dump(ip,im)
 gp=ROOT/'sources/manifest.json';g=json.loads(gp.read_text());g['files']=[r for r in g['files'] if not r['path'].startswith(REL+'/')]
 g['files'] += [{**r,'path':REL+'/'+r['path'],'origin':'2026-09-26_FPGA_Work/06_33x36_Routing','status':'current routing development; not manufacturing release','note':'One 33 × 36 board; matched schematic and measured snapshot. Application assignments remain open.'} for r in records]
 g['fpga_interface_study']={'manifest':'hardware/fpga-interface-study/manifest.json','status':'current smallest routing development and preserved earlier unqualified studies'}
 g['fpga_presentation']={'manifest':'presentation/fpga/manifest.json','entry':'presentation/fpga/index.html','source':REL,'status':'current smallest 33x36 routing development; not fabrication-ready'};dump(gp,g)
 library=ROOT/'docs/library.md';text=library.read_text();marker='<!-- CURRENT_FPGA_ROUTING -->';block=marker+'\n- [Current33 ×36 mm routing board](../presentation/fpga/index.html): [complete130-component native KiCad project](../'+REL+'/'+NAME+'.zip) and [measured routing review](../'+REL+'/reports/Routing_Review.md). Corrected rails and both mezzanines are integrated; full routing, application interfaces and qualification remain unfinished. Earlier checkpoints are preserved in the collapsed history section.\n<!-- /CURRENT_FPGA_ROUTING -->'
 block=block.replace('Current33','Current 33').replace('×36','× 36').replace('complete130','complete 130')
 if marker in text:text=re.sub(r'<!-- CURRENT_FPGA_ROUTING -->.*?<!-- /CURRENT_FPGA_ROUTING -->',lambda _:block,text,flags=re.S)
 else:text=text.replace('## Team workflow and editable design','## Team workflow and editable design\n\n'+block)
 text=re.sub(r'- \[Current100T review and five native checkpoints\].*?\n','',text).replace('- [Current 100T review and five native checkpoints](../presentation/fpga/index.html): core, rail revision, mezzanine fit and smaller placement remain separate. [Fourth-review uncertainty list](../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md).','- [Earlier native checkpoints](../presentation/fpga/index.html#design-history) and [fourth-review uncertainty list](../hardware/fpga-interface-study/fourth_check/Uncertainty_Register.md) remain dated reference evidence.')
 library.write_text(text)
 print(f'Imported {len(records)} canonical routing files; {len(linked)} schematic pages; PCB {boardhash}; {snapshot["unconnectedItems"]} unconnected items.')
if __name__=='__main__':main()
