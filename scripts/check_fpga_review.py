#!/usr/bin/env python3
"""Check review-package coherence and links, not electrical correctness."""
import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile
ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'hardware/fpga-100t-review'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    manifest = json.loads((PACKAGE / 'manifest.json').read_text())
    data = json.loads((ROOT / 'presentation/fpga/review-data.json').read_text())
    status = json.loads((PACKAGE / 'reports/Wiring_Status.json').read_text())
    audit = json.loads((PACKAGE / 'reports/Final_Snapshot_Audit.json').read_text())
    geometry = json.loads((PACKAGE / 'reports/Geometry.json').read_text())
    board = PACKAGE / 'hardware/FPGA100T_Minimal.kicad_pcb'
    assert sha(board) == data['boardSha256'] == manifest['board_sha256'] == status['board_sha256'] == audit['board_sha256'] == geometry['sha256']
    assert not data['fabricationReady'] and not data['fullBoardComplete'] and not data['electricalOperationVerified']
    for record in manifest['files']:
        target = PACKAGE / record['path']
        assert target.is_file() and sha(target) == record['sha256'], record['path']
        assert target.stat().st_size == record['bytes'], record['path']
    for path, expected in audit['files'].items():
        assert sha(PACKAGE / path) == expected, path
    maps = {'components':'footprints', 'tracks':'track_segments', 'vias':'through_vias', 'zones':'copper_zones', 'unconnectedItems':'unconnected_items', 'drcViolations':'DRC_geometric_violations', 'parityIssues':'schematic_parity_issues', 'endpointsVerified':'schematic_intended_physical_endpoints', 'ercOpenPins':'ERC_open_pins', 'ercWarnings':'ERC_symbol_type_warnings'}
    for web, report in maps.items():
        assert data[web] == status[report], web
    assert data['boardMm'] == geometry['board_mm']
    assert data['components'] == len(geometry['footprints'])
    assert data['schematicPages'] == len(list((PACKAGE / 'hardware').glob('*.kicad_sch')))
    for table in ['fp-lib-table', 'sym-lib-table']:
        text = (PACKAGE / 'hardware' / table).read_text()
        for name in re.findall(r'\(uri "\$\{KIPRJMOD\}/([^\"]+)"\)', text):
            assert (PACKAGE / 'hardware' / name).exists(), name
    root = (PACKAGE / 'hardware/FPGA100T_Minimal.kicad_sch').read_text()
    for name in re.findall(r'\(property "Sheetfile" "([^"]+)"', root):
        assert (PACKAGE / 'hardware' / name).exists(), name
    ET.parse(PACKAGE / 'reports/FPGA100T_Minimal.net')
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
            assert (ROOT / 'presentation/fpga' / link.split('#')[0]).resolve().exists(), link
    print(f'PASS: {len(manifest["files"])} artifact hashes, exact ZIP contents, {data["schematicPages"]} sheets, local libraries, report/data/PCB snapshot agreement and local links.')
    print('Limit: package coherence only; not ERC/DRC rerun, electrical operation, timing or fabrication approval.')

if __name__ == '__main__':
    main()
