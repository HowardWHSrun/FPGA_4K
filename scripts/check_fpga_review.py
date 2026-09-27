#!/usr/bin/env python3
"""Check review-package coherence and links, not electrical correctness."""
import hashlib
import csv
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile
from urllib.parse import urlsplit, unquote
ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'hardware/fpga-100t-review'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def check_viewer_fallback(html, registry):
    """Keep usable no-JavaScript downloads on the same board as the registry."""
    current = [board for board in registry['boards'] if board['id'] == 'compact-routed']
    assert len(current) == 1, 'Viewer registry must contain one current board'
    current = current[0]

    class FallbackParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.links = {}
            self.options = []
            self.in_choice = False
            self.option = None

        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag == 'a' and attrs.get('id'):
                self.links.setdefault(attrs['id'], []).append(attrs.get('href'))
            if tag == 'select' and attrs.get('id') == 'board-choice':
                self.in_choice = True
            if tag == 'option' and self.in_choice:
                self.option = {'value': attrs.get('value'), 'text': '',
                               'selected': 'selected' in attrs, 'disabled': 'disabled' in attrs}
                self.options.append(self.option)

        def handle_data(self, data):
            if self.option is not None:
                self.option['text'] += data

        def handle_endtag(self, tag):
            if tag == 'option':
                self.option = None
            if tag == 'select':
                self.in_choice = False

    parsed = FallbackParser()
    parsed.feed(html)
    options = [option for option in parsed.options if option['value'] == current['id']]
    assert len(options) == 1, 'Missing or duplicate current-board fallback option'
    assert ' '.join(options[0]['text'].split()) == current['title'], 'Stale current-board fallback title'
    selected = [option for option in parsed.options if option['selected']]
    assert len(selected) <= 1, 'Ambiguous default fallback board'
    enabled = [option for option in parsed.options if not option['disabled']]
    assert enabled and (selected or enabled)[0] == options[0] and not options[0]['disabled'], 'Fallback must default to the current board'

    viewer_dir = ROOT / 'presentation/fpga/viewer'
    for element, key in [('native-file', 'native'), ('project-zip', 'zip'), ('static-view', 'svg')]:
        assert parsed.links.get(element) == [current[key]], 'Stale or missing viewer fallback: ' + element
        target = (viewer_dir / unquote(urlsplit(current[key]).path)).resolve()
        assert target.is_relative_to(ROOT) and target.is_file(), 'Missing fallback file: ' + current[key]
    native = (viewer_dir / unquote(urlsplit(current['native']).path)).resolve().relative_to(ROOT).as_posix()
    github = 'https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/' + native
    assert parsed.links.get('github-file') == [github], 'GitHub fallback must identify the registry native PCB'

def check_report_input_binding(coverage, data):
    package = (ROOT / 'presentation/fpga' / data['artifactRoot']).resolve()
    assert package.is_relative_to(ROOT)
    expected = {(package / 'reports/Routing_Snapshot.json').relative_to(ROOT).as_posix(),
                (package / 'reports/Physical_Stackup_Application.json').relative_to(ROOT).as_posix(),
                'presentation/fpga/pins/pin_status.json',
                'presentation/fpga/data/Component_Necessity.json',
                'firmware/artix7/2026-09-26/raw_capture/Verification.json'}
    assert coverage['inputHashPaths'] == 'repository-relative public files'
    assert set(coverage['inputSha256']) == expected, 'Report has missing or unexpected public input bindings'
    for relative, digest in coverage['inputSha256'].items():
        path = (ROOT / relative).resolve()
        assert path.is_relative_to(ROOT) and sha(path) == digest, 'Report input changed: ' + relative

def native_tree(text):
    stack=[]; root=None
    for token in re.findall(r'"(?:\\.|[^"\\])*"|[()]|[^\s()]+',text):
        if token=='(':
            node=[]
            if stack:stack[-1].append(node)
            else:root=node
            stack.append(node)
        elif token==')':stack.pop()
        else:stack[-1].append(json.loads(token) if token.startswith('"') else token)
    assert not stack
    return root

def nodes(tree,key):return [a for a in tree if isinstance(a,list) and a and a[0]==key]
def first(tree,key):return next(iter(nodes(tree,key)),None)

def check_current(data):
    package=(ROOT/'presentation/fpga'/data['artifactRoot']).resolve()
    name='FPGA100T_33x36_Routing'; board=package/'hardware'/(name+'.kicad_pcb')
    meta=json.loads((package/'manifest.json').read_text());snapshot=json.loads((package/'reports/Routing_Snapshot.json').read_text())
    assert sha(board)==data['boardSha256']==snapshot['boardSha256']==meta['board_sha256']
    if 'completion-checkpoint' in data['artifactRoot']:
        presentation=json.loads((ROOT/'presentation/fpga/manifest.json').read_text())
        learning=presentation['learning_report']; report_folder=ROOT/learning['path']
        assert learning['board_sha256']==data['boardSha256'], 'Current learning report belongs to a different PCB'
        assert sha(report_folder/learning['pdf'])==learning['pdf_sha256']
        assert sha(report_folder/learning['source'])==learning['source_sha256']
        coverage=json.loads((report_folder/'Report_Coverage.json').read_text())
        reviewed=json.loads((report_folder/'Report_Verification.json').read_text())
        assert coverage['boardSha256']==reviewed['boardSha256']==data['boardSha256']
        assert coverage['sourceSha256']==reviewed['sourceSha256']==learning['source_sha256']
        assert reviewed['pdfSha256']==learning['pdf_sha256']
        assert coverage['components']==learning['components']==data['components']
        assert coverage['canonicalPins']==learning['canonical_pins']==data['canonicalPins']
        assert reviewed['nativeLatexCompilationPassed'] and reviewed['visualInspectionPassed']
        assert reviewed['pageCount']==learning['pages']>0
        check_report_input_binding(coverage, data)
        assert coverage['components'] == 125 and coverage['canonicalPins'] == 752
        assert not coverage['fabricationReady']
    assert not meta['fabrication_ready'] and not meta['native_CAD_changed_during_packaging']
    for record in meta['files']:
        p=package/record['path'];assert p.is_file() and sha(p)==record['sha256'] and p.stat().st_size==record['bytes'],record['path']
    provenance=json.loads((package/'reports/Native_Run_Provenance.json').read_text())
    packaged={item['path']:item for item in meta['files']}
    if 'completion-checkpoint' in data['artifactRoot']:
        applied_stackup = json.loads((package / 'reports/Physical_Stackup_Application.json').read_text())
        assert packaged['reports/Physical_Stackup_Application.json']['source_sha256'] == data['physicalStackupApplicationSha256']
        assert applied_stackup['selection'] == data['physicalStackupSelection']
        if data['copperLayers'] == 12:
            assert applied_stackup['applied'] and applied_stackup['after_sha256'] == data['boardSha256']
    assert provenance['board_sha256']==sha(board) and provenance['all_checks_from_saved_native_files']
    assert provenance['manifest_sha256']==packaged['reports/component_manifest_resolved.json']['source_sha256']
    for relative_path,digest in provenance['native_report_sha256'].items():
        assert packaged['reports/'+relative_path]['source_sha256']==digest,relative_path
    for relative_path,digest in provenance['schematic_sha256'].items():
        assert packaged['hardware/'+relative_path]['sha256']==digest,relative_path
    for relative_path,digest in provenance['project_and_library_sha256'].items():
        assert packaged[relative_path]['source_sha256']==digest,relative_path
    firmware=ROOT/'firmware/artix7/2026-09-26/raw_capture'
    capture=json.loads((firmware/'Verification.json').read_text())
    assert capture['passed'] and len(capture['sourceSha256'])==3
    for relative_path,digest in capture['sourceSha256'].items():
        assert sha(firmware/relative_path)==digest,relative_path
    full_depth=next(check for check in capture['checks'] if check.get('depthPerChip')==4096)
    assert full_depth['passed'] and full_depth['captures']==4 and full_depth['checkedWords']==131072
    synthesis=next(check for check in capture['checks'] if check['name']=='xc7_technology_synthesis')
    assert synthesis['passed'] and synthesis['physicalImplementation'] is False
    assert synthesis['resources']=={'BUFG':9,'RAMB18E1':24}
    for key,value in snapshot.items():
        if key!='artifactRoot':assert data[key]==value,key
    tree=native_tree(board.read_text());fps=nodes(tree,'footprint')
    counts={'footprints':len(fps),'pads':sum(len(nodes(f,'pad')) for f in fps),'segments':len(nodes(tree,'segment'))+len(nodes(tree,'arc')),'vias':len(nodes(tree,'via')),'zones':len(nodes(tree,'zone'))}
    for raw,field in [('footprints','components'),('pads','padRecords'),('segments','tracks'),('vias','vias'),('zones','zones')]:assert counts[raw]==data[field],field
    assert data['boardMm']==[33,36] and data['schematicPages']==21
    expected=json.loads((package/'reports/component_manifest_resolved.json').read_text())['components']; refs=set();assigned=0;pinmap={}
    xml=ET.parse(package/'reports'/(name+'.net')).getroot();xmlnets={(n.get('ref'),n.get('pin')):net.get('name') for net in xml.findall('./nets/net') for n in net.findall('node')}
    for f in fps:
        ref=next(a[2] for a in nodes(f,'property') if a[1]=='Reference');refs.add(ref);seen=set()
        for pad in nodes(f,'pad'):
            pin=str(pad[1]);net=first(pad,'net');actual=net[1] if net else ''
            if not pin or pin in seen:continue
            seen.add(pin);target=expected[ref]['pins'].get(pin);pinmap[ref,pin]=target or ''
            if target:
                assert actual==target==xmlnets[ref,pin],(ref,pin,actual,target);assigned+=1
            else:assert not actual or actual.startswith('unconnected-'),(ref,pin,actual)
    assert refs=={r for r in expected if not r.startswith('#')} and assigned==data['endpointsVerified']
    if 'completion-checkpoint' in data['artifactRoot']:
        assert len(refs) == 125 and len(pinmap) == 752
        assert not {'R12', 'R106', 'R107', 'R112', 'R113'} & refs
        assert pinmap['U1', 'L14'] == pinmap['U1', 'M14'] == ''
        assert {'L14', 'M14'} <= set(expected['U1']['no_connect'])
        assert pinmap['U6', '3'] == pinmap['R101', '2'] == 'FLASH_DQ2'
        assert pinmap['U6', '7'] == pinmap['R102', '2'] == 'FLASH_DQ3'
        assert pinmap['U1', 'P11'] == pinmap['U1', 'P13'] == 'GND'
        assert pinmap['U1', 'P12'] == pinmap['R111', '2'] == 'CFG_M0'
        assert pinmap['R111', '1'] == 'VCCAUX_1V8' and expected['R111']['value'] == '1k'
        assert pinmap['J6', '60'] == pinmap['U1', 'C5'] == 'ASIC4_DATA1'
        assert pinmap['J6', '58'] == pinmap['U1', 'L4'] == 'ASIC8_DATA4'
        assert {(ref, pin) for (ref, pin), net in pinmap.items() if ref in ('J5', 'J6') and not net} == {('J5', '34'), ('J6', '37'), ('J6', '59')}
        assert expected['J5']['no_connect'] == expected['J6']['no_connect'] == []
    drc=json.loads((package/'reports/Native_DRC.json').read_text());assert len(drc['violations'])==data['drcViolations']==0 and len(drc['schematic_parity'])==data['parityIssues']==0 and len(drc['unconnected_items'])==data['unconnectedItems']
    assert drc['ignored_checks']==data['ignoredChecks']
    assert sha(package/'reports/Native_DRC.json')==data['snapshotSha256']
    erc=json.loads((package/'reports/Native_ERC.json').read_text());issues=[v for sheet in erc['sheets'] for v in sheet['violations']]
    assert sum(v['type']=='pin_not_connected' for v in issues)==data['ercOpenPins']
    assert sum(v['severity']=='warning' for v in issues)==data['ercWarnings']
    if 'completion-checkpoint' in data['artifactRoot']:
        assert Counter((v['type'], v['severity']) for v in issues) == {('pin_not_connected', 'error'): 19, ('pin_to_pin', 'error'): 4, ('isolated_pin_label', 'warning'): 1}
        assert (data['ercOpenPins'], data['ercOtherErrors'], data['ercWarnings']) == (19, 4, 1)
        fb2 = []
        opens = []
        for issue in issues:
            descriptions = [item['description'] for item in issue['items']]
            if issue['type'] == 'pin_to_pin':
                matches = [re.match(r'Symbol (U[2-5]) Pin 4 \[FB2,', text) for text in descriptions]
                found = [match[1] for match in matches if match]
                assert len(found) == 1 and any('Power output' in text for text in descriptions)
                assert pinmap[found[0], '4'] == 'GND'
                fb2 += found
            elif issue['type'] == 'pin_not_connected':
                assert len(descriptions) == 1
                match = re.match(r'Symbol (\S+) Pin (\S+) \[', descriptions[0])
                assert match
                opens.append(match[1] + '.' + match[2])
            else:
                assert descriptions == ["Global Label 'AC_IN_ANALOG_RESERVED'"]
        labels = json.loads((ROOT / 'presentation/fpga/pins/pin_status.json').read_text())
        assert set(opens) == {pin['id'] for pin in labels['pins'] if pin['statusCode'] == 'unassigned'}
        assert len(opens) == 19 and sorted(fb2) == ['U2', 'U3', 'U4', 'U5']
    with (package/'reports/All_Pin_Connections.csv').open() as f:pinrows=list(csv.DictReader(f))
    assert len(pinrows)==data['canonicalPins'] and {(r['reference'],r['pin']):r['net'] for r in pinrows}==pinmap
    with (package/'reports/Component_List.csv').open() as f:components=list(csv.DictReader(f))
    assert len(components)==data['components'] and {r['reference'] for r in components}==refs
    for c in components:assert c['value']==expected[c['reference']]['value']
    with (package/'reports/Net_Endpoints.csv').open() as f:netrows=list(csv.DictReader(f))
    assert len(netrows)==data['functionalNets']
    for n in netrows:
        assert set(n['endpoints'].split('; '))=={ref+'.'+pin for (ref,pin),name in pinmap.items() if name==n['net']}
        assert int(n['unconnected_items'])==data['remainingByNet'].get(n['net'],0)
    for table in ['fp-lib-table','sym-lib-table']:
        for rel in re.findall(r'\(uri "\$\{KIPRJMOD\}/([^\"]+)"\)',(package/'hardware'/table).read_text()):assert (package/'hardware'/rel).exists(),rel
    schemas=list((package/'hardware').glob('*.kicad_sch'));assert len(schemas)==21
    libraries={}
    for table in ['fp-lib-table','sym-lib-table']:
        for lib in nodes(native_tree((package/'hardware'/table).read_text()),'lib'):
            alias=first(lib,'name')[1];uri=first(lib,'uri')[1];assert uri.startswith('${KIPRJMOD}/')
            libraries[table,alias]=(package/'hardware'/uri.removeprefix('${KIPRJMOD}/')).resolve()
            assert libraries[table,alias].is_relative_to(package.resolve()) and libraries[table,alias].exists()
    for f in fps:
        alias,footprint_name=f[1].split(':',1);assert (libraries['fp-lib-table',alias]/(footprint_name+'.kicad_mod')).is_file(),f[1]
    for sch in schemas:
        for symbol in re.findall(r'\(lib_id "([^"]+)"',sch.read_text()):
            alias,symbol_name=symbol.split(':',1);library=libraries['sym-lib-table',alias]
            assert re.search(r'\(symbol\s+"'+re.escape(symbol_name)+r'"',library.read_text()),symbol
    for sch in schemas:
        for rel in re.findall(r'\(property "Sheetfile" "([^"\n]+)"',sch.read_text()):assert (sch.parent/rel).is_file(),rel
    assert len(list((package/'hardware').glob('*.kicad_pcb')))==len(list((package/'hardware').glob('*.kicad_pro')))==1
    with zipfile.ZipFile(package/(name+'.zip')) as z:
        assert z.testzip() is None
        forbidden=['.lck','.kicad_prl','.py','.pyc','.mjs','.log']
        assert not any(n.endswith(tuple(forbidden)) or '/cache/' in n or '/scripts/' in n for n in z.namelist())
        for n in z.namelist():assert not n.startswith('/') and '..' not in Path(n).parts
        for record in json.loads((package/'Package_Manifest.json').read_text())['files']:
            assert z.read(name+'/'+record['path'])==(package/record['path']).read_bytes(),record['path']
    views=ROOT/'presentation/fpga/assets';v=json.loads((views/'current-view-provenance.json').read_text());assert v['source_sha256']==sha(board) and v['source_unchanged']
    for side in ['front','back']:
        assert sha(views/f'current-{side}.svg')==v['sides'][side]['styled_sha256'];ET.parse(views/f'current-{side}.svg')
    assert v['schematic_pdf']['pages_verified']==21 and sha(package/'output'/(name+'_Schematic.pdf'))==v['schematic_pdf']['sha256']
    ET.parse(package/'output'/(name+'.svg'))
    historical=ROOT/'hardware/fpga-interface-study/dated/2026-09-26/routing-33x36'
    report=historical/'report';verification=json.loads((report/'Report_Verification.json').read_text());stem='FPGA100T_33x36_Routing_Component_Pin_Report'
    assert verification['board_sha256']==sha(historical/'hardware/FPGA100T_33x36_Routing.kicad_pcb')
    assert verification['report_tex_sha256']==sha(report/(stem+'.tex')) and verification['report_pdf_sha256']==sha(report/'output/pdf'/(stem+'.pdf'))
    assert verification['components_searchable']==130 and verification['canonical_endpoints_searchable']==762 and verification['functional_nets_searchable']==48
    assert not any(verification['missing_identifiers'].values()) and not verification['duplicate_endpoint_rows_in_primary_tables']
    with zipfile.ZipFile(report/'FPGA100T_33x36_Routing_Report_Source.zip') as archive:
        assert archive.testzip() is None and not any(n.endswith(('.py','.aux','.log','.out')) for n in archive.namelist())
    for name_,hash_ in v['schematic_pdf']['native_sources'].items():assert sha(package/'hardware'/name_)==hash_
    viewer_registry=json.loads((ROOT/'presentation/fpga/viewer/boards.json').read_text())
    check_viewer_fallback((ROOT/'presentation/fpga/viewer/index.html').read_text(), viewer_registry)
    viewer=next(b for b in viewer_registry['boards'] if b['id']=='compact-routed')
    assert viewer['sha256']==sha(board) and viewer['dimensions_mm']==[33,36] and not viewer['manufacturing_ready']
    for key,value in counts.items():assert viewer['expected'][key]==value,key
    assert viewer['unconnected_items']==data['unconnectedItems']
    with (package/'bringup/ASIC_Interface_Assignment.csv').open() as f:assignments=list(csv.DictReader(f))
    assert len(assignments)==117
    for row in assignments:
        if row['interface_kind']=='analog_external_reserved':
            assert not row['fpga_endpoint'] and pinmap['J5','46']=='AC_IN_ANALOG_RESERVED'
            continue
        for key in ['fpga_endpoint','connector_endpoint']:
            ref,pin=row[key].split('.',1);assert pinmap[ref,pin]==row['signal']
    done={r['signal'] for r in assignments if r['interface_kind']=='fpga_candidate' and r['signal'] not in data['remainingByNet']}
    assert len(done)==data['asicNetsRouted'] and done==set(data['asicRoutedSignals'])
    assert data['asicNetsAssigned']==116 and data['asicAnalogReservedContacts']==1 and data['unassignedEndpoints']==102 and data['intentionalNoConnectEndpoints']==83
    assert sum(v['severity']=='error' and v['type']!='pin_not_connected' for v in issues)==data['ercOtherErrors']
    assert erc['ignored_checks']==data['ercIgnoredChecks']
    print(f"PASS: current {data['components']}-part snapshot, {data['canonicalPins']} native endpoints, 116 candidate FPGA assignments + one analog reservation / {data['asicNetsRouted']} copper-connected nets, 21-sheet PDF, portable ZIP and matched viewer/SVG hashes.")

def main():
    manifest = json.loads((PACKAGE / 'manifest.json').read_text())
    data = json.loads((ROOT / 'presentation/fpga/review-data.json').read_text())
    status = json.loads((PACKAGE / 'reports/Wiring_Status.json').read_text())
    audit = json.loads((PACKAGE / 'reports/Final_Snapshot_Audit.json').read_text())
    geometry = json.loads((PACKAGE / 'reports/Geometry.json').read_text())
    board = PACKAGE / 'hardware/FPGA100T_Minimal.kicad_pcb'
    assert sha(board) == manifest['board_sha256'] == status['board_sha256'] == audit['board_sha256'] == geometry['sha256']
    assert not data['fabricationReady'] and not data['fullBoardComplete'] and not data['electricalOperationVerified']
    for record in manifest['files']:
        target = PACKAGE / record['path']
        assert target.is_file() and sha(target) == record['sha256'], record['path']
        assert target.stat().st_size == record['bytes'], record['path']
    for path, expected in audit['files'].items():
        assert sha(PACKAGE / path) == expected, path
    historical = next(b for b in json.loads((ROOT / 'presentation/fpga/viewer/boards.json').read_text())['boards'] if b['id'] == 'core')
    assert historical['sha256'] == sha(board)
    for field, key in [('footprints','footprints'),('pads','pad_records'),('segments','track_segments'),('vias','through_vias'),('zones','copper_zones')]:
        assert historical['expected'][field] == status[key], field
    for field, key in [('components','footprints'),('tracks','track_segments'),('vias','through_vias'),('unconnected_items','unconnected_items'),('intended_pin_endpoints_verified','schematic_intended_physical_endpoints')]:
        assert audit[field] == status[key], field
    assert historical['dimensions_mm'] == geometry['board_mm'] == [40,36]
    assert status['footprints'] == len(geometry['footprints']) == 126
    assert len(list((PACKAGE / 'hardware').glob('*.kicad_sch'))) == 20
    for table in ['fp-lib-table', 'sym-lib-table']:
        text = (PACKAGE / 'hardware' / table).read_text()
        for name in re.findall(r'\(uri "\$\{KIPRJMOD\}/([^\"]+)"\)', text):
            assert (PACKAGE / 'hardware' / name).exists(), name
    root = (PACKAGE / 'hardware/FPGA100T_Minimal.kicad_sch').read_text()
    for name in re.findall(r'\(property "Sheetfile" "([^"]+)"', root):
        assert (PACKAGE / 'hardware' / name).exists(), name
    ET.parse(PACKAGE / 'reports/FPGA100T_Minimal.net')
    views = ROOT / 'presentation/fpga/assets'
    provenance = json.loads((views / 'core-view-provenance.json').read_text())
    assert provenance['source_sha256'] == sha(board) and provenance['source_unchanged']
    for side in ['front', 'back']:
        exported = views / f'core-{side}.svg'
        assert sha(exported) == provenance['sides'][side]['styled_sha256'], side
        ET.parse(exported)
    with zipfile.ZipFile(PACKAGE / 'FPGA100T_Review_Project.zip') as archive:
        assert archive.testzip() is None
        names = set(archive.namelist())
        for path in PACKAGE.rglob('*'):
            if path.is_file() and path.name not in ['manifest.json', 'FPGA100T_Review_Project.zip']:
                name = 'FPGA100T_Review/' + path.relative_to(PACKAGE).as_posix()
                assert name in names and archive.read(name) == path.read_bytes(), name
    html = (ROOT / 'presentation/fpga/index.html').read_text()
    for field in re.findall(r'data-field="([^"]+)"', html):
        assert field in data or field in ['dimensions', 'ignoredCount', 'exclusionCount'], field
    for link in re.findall(r'(?:href|src)="([^"]+)"', html):
        if not link.startswith(('https:', '#')):
            assert (ROOT / 'presentation/fpga' / unquote(urlsplit(link).path)).resolve().exists(), link
    compact = ROOT / 'hardware/fpga-interface-study/size_optimization/candidate'
    result = json.loads((compact / 'reports/Candidate_Validation.json').read_text())
    independent = json.loads((compact.parent / 'independent_candidate/Independent_Candidate_Review.json').read_text())
    placed = compact / 'hardware/FPGA100T_37p5x36_Placement.kicad_pcb'
    view = next(b for b in json.loads((ROOT / 'presentation/fpga/viewer/boards.json').read_text())['boards'] if b['id'] == 'compact')
    assert sha(placed) == result['candidate_sha256'] == independent['candidate_sha256'] == view['sha256']
    assert result['board_mm'] == view['dimensions_mm'] == [37.5, 36]
    assert not result['fabrication_ready'] and independent['passed'] and not independent['failures']
    assert result['footprints'] == independent['footprints'] == 128
    assert result['checked_pad_records'] == independent['pad_count'] == 807
    assert result['tracks'] == result['vias'] == result['zones'] == 0
    drc = json.loads((compact / 'reports/Candidate_DRC.json').read_text())
    assert not drc['violations'] and not drc['ignored_checks'] and len(drc['unconnected_items']) == 383
    for rel in ['Compact_Front.svg', 'Compact_Back.svg', 'Compact_Placement.svg']:
        ET.parse(compact / 'output' / rel)
    with zipfile.ZipFile(compact / 'FPGA100T_Compact_Study.zip') as archive:
        assert archive.testzip() is None
        matches = [n for n in archive.namelist() if n.endswith('/hardware/FPGA100T_37p5x36_Placement.kicad_pcb')]
        assert len(matches) == 1
        prefix = matches[0].split('/hardware/')[0] + '/'
        for folder in ['hardware', 'libraries']:
            for f in (compact / folder).rglob('*'):
                if f.is_file():
                    assert archive.read(prefix + f.relative_to(compact).as_posix()) == f.read_bytes(), str(f)
        for name in archive.namelist():
            assert not name.startswith('/') and '..' not in Path(name).parts
    with zipfile.ZipFile(ROOT / 'hardware/fpga-interface-study/review_projects/FPGA100T_Mezzanine_Study.zip') as archive:
        names = [n for n in archive.namelist() if n.endswith('.kicad_pro')]
        assert len(names) == 1
        source_rules = json.loads(archive.read(names[0]))['board']['design_settings']
    rules = json.loads((compact / 'hardware/FPGA100T_37p5x36_Placement.kicad_pro').read_text())['board']['design_settings']
    assert rules == source_rules, 'Smaller placement changed saved design rules'
    check_current(data)
    print(f'PASS: {len(manifest["files"])} historical core hashes, exact ZIP contents,20 legacy sheets, local libraries and historical report/PCB agreement; current page links.')
    print('PASS: smaller candidate hash/geometry/report agreement, complete native ZIP and unchanged baseline design rules.')
    print('Limit: package coherence only; not ERC/DRC rerun, electrical operation, timing or fabrication approval.')

if __name__ == '__main__':
    main()
