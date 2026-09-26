#!/usr/bin/env python3
"""Publish selected interface-study evidence separately from the current core."""
import argparse,hashlib,json,re,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'hardware/fpga-interface-study'
REL=DEST.relative_to(ROOT).as_posix()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--source',type=Path,required=True,help='FPGA_100T_CSG324 root');a=p.parse_args();source=a.source.resolve();records=[]
 selected=['release_audit/mezzanine/Mezzanine_Fit.png','release_audit/mezzanine/Mezzanine_Fit.svg','release_audit/mezzanine/Mezzanine_Contact_Proposal.csv','release_audit/mezzanine/Mezzanine_Proposal.json','release_audit/mezzanine/Independent_Mezzanine_Review.md','release_audit/mezzanine/Independent_Mezzanine_Review.json','release_audit/mezzanine/Mezzanine_Fit_DRC.json','release_audit/Full_System_Interface_Proposal.md','release_audit/Power_Electrical_Release_Audit.md','release_audit/Double_Check_Review.md','release_audit/double_check/CAD_Independent_Double_Check.json','release_audit/double_check/CAD_Core_ERC_All_Categories.json','reports/AC_IN_IMP_TST_Primary_Source_Review.md','reports/AC_IN_IMP_TST_Reference_Endpoints.json','reports/Current_Design_Bringup_Status.md','release_audit/Triple_Check_Review.md']
 selected += ['release_audit/triple_check/'+name for name in ['Pin_Boot_Review.md','Pin_Boot_Review.json','Electrical_Review.md','Electrical_Review.json','CAD_Review.md','CAD_Review.json','J4_Edge_Review.svg','CAD_minimal_core_DRC.json','CAD_full_system_DRC.json','CAD_mezzanine_DRC.json','CAD_minimal_core_ERC_All.json','CAD_full_system_ERC_All.json','Package_Independent_Review.md','Package_Independent_Review.json']]
 selected += ['release_audit/review_projects/'+name for name in ['FPGA100T_Rail_Revision.zip','FPGA100T_Mezzanine_Study.zip','Package_Verification.json']]
 for rel in selected:
  src=source/rel;outrel=rel.removeprefix('release_audit/').replace('reports/','research/');out=DEST/outrel;out.parent.mkdir(parents=True,exist_ok=True);content=src.read_bytes();sourcehash=sha(src)
  if src.suffix=='.md':
   text=content.decode().replace('../reports/AC_IN_IMP_TST_Primary_Source_Review.md','research/AC_IN_IMP_TST_Primary_Source_Review.md')
   text=text.replace('../../Original%20Sources/09_Manufacturer_Documentation/Datasheets/AMD/DS181_Power_and_Electrical_Limits.pdf','https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet')
   text=text.replace('../reports/Current_Design_Bringup_Status.md','research/Current_Design_Bringup_Status.md')
   text=text.replace('../../bringup/README.md','../research/Current_Design_Bringup_Status.md')
   text=text.replace('../double_check/ASIC_Review.md','../research/AC_IN_IMP_TST_Primary_Source_Review.md')
   content=text.encode()
  if src.suffix=='.json':
   content=content.decode().replace(str(source)+'/', 'FPGA_100T_CSG324/').encode()
  out.write_bytes(content);records.append({'path':outrel,'sha256':sha(out),'source_sha256':sourcehash,'bytes':len(content),'transformation':'portable reference links or workstation paths only' if sha(out)!=sourcehash else 'unchanged copy'})
 review=json.loads((DEST/'mezzanine/Independent_Mezzanine_Review.json').read_text());board=source/'release_audit/mezzanine/FPGA100T_Mezzanine_Fit.kicad_pcb';assert sha(board)==review['board_sha256']
 (DEST/'README.md').write_text('''# Full-system interface studies — not a release

This folder supplements the current core snapshot; it does not replace its native CAD. [The full-system development proposal](Full_System_Interface_Proposal.md) describes the proposed receiver, cable and power contract.

[The mezzanine view](mezzanine/Mezzanine_Fit.svg) depicts an intentionally unrouted 128-part placement study within 40 × 36 mm. The current core and this layout are different native revisions. All 120 new signal pads are unassigned. [The contact CSV](mezzanine/Mezzanine_Contact_Proposal.csv) proposes 117 named signals and three reserved contacts; all FPGA balls are TBD. [The independent review](mezzanine/Independent_Mezzanine_Review.md) records geometry, source-drawing ambiguity and mating-orientation limits. C92/R122, cable damping/protection and the full-system routing are not included in this fit study.

[AC_IN / IMP_TST source research](research/AC_IN_IMP_TST_Primary_Source_Review.md) explains why their electrical classification remains unresolved. [The power audit](Power_Electrical_Release_Audit.md) is dated design-review evidence: it identified the input-capacitor deficiency. The current core and fit study have adopted the corrected 1206 capacitors; later bank-rail and protection changes remain separate work.

[The second independent check](Double_Check_Review.md) corrects the historical FPGA-wiring evidence, identifies powered-cable LVDS/JTAG margin gaps and discloses all-category schematic checks. Direct DC coupling is not qualified; a carrier-side common-mode solution and startup interlock remain design work.

[The third independent check](Triple_Check_Review.md) reconciles all 324 FPGA pins and the 117-signal count, identifies the J4 edge-placement discrepancy and obsolete bring-up instructions, and refines cable assumptions. It records fresh checks of all three distinct native designs. [Current bring-up status](research/Current_Design_Bringup_Status.md) replaces the historical procedure for these derivatives.

Separate review-only downloads now include the [rail revision](review_projects/FPGA100T_Rail_Revision.zip) and [mezzanine placement](review_projects/FPGA100T_Mezzanine_Study.zip), with local libraries. The latter has a packaging-only relative footprint-table correction; native CAD bytes are unchanged. [Independent archive checks](triple_check/Package_Independent_Review.md) document source correspondence and scope. Neither archive is a fabrication release.

Source: FPGA_100T_CSG324 local engineering development, 2026-09-26. Native files were inspected read-only; this web folder publishes selected evidence, not a fabrication package. Manufacturer PDFs remain linked at their primary sources. Private conversations/audio, experimental scripts and caches are excluded. The manifest records byte hashes; Markdown link destinations and generated-report workstation paths are adjusted for portability; source hashes are retained.
''')
 f=DEST/'README.md';records.append({'path':'README.md','sha256':sha(f),'bytes':f.stat().st_size,'transformation':'generated packaging notes'})
 manifest={'date':'2026-09-26','scope':'Separate unqualified interface proposals and placement study','board_sha256':review['board_sha256'],'not_current_core_CAD':True,'fabrication_ready':False,'files':records};(DEST/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 gp=ROOT/'sources/manifest.json';g=json.loads(gp.read_text());g['files']=[r for r in g['files'] if not r['path'].startswith(REL+'/')]
 for r in records:g['files'].append({'path':REL+'/'+r['path'],'origin':'FPGA_100T_CSG324 engineering interface studies 2026-09-26','status':'proposal / placement study, not fabrication release','note':'Separate from the current core copper snapshot.','transformation':r['transformation'],**{k:v for k,v in r.items() if k in ['sha256','source_sha256','bytes']}})
 g['fpga_interface_study']={'manifest':REL+'/manifest.json','status':'unqualified proposal and unrouted placement study'};gp.write_text(json.dumps(g,indent=2,ensure_ascii=False)+'\n')
 print('Imported',len(records),'interface-study files; PCB',review['board_sha256'])
if __name__=='__main__':main()
