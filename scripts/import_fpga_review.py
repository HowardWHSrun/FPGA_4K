#!/usr/bin/env python3
"""Package an explicitly supplied, verified core snapshot for the review website.

Copies native CAD unchanged; publishes only a whitelist of project evidence.
It does not run hardware verification or grant a manufacturing release.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'hardware/fpga-100t-review'
REL = TARGET.relative_to(ROOT).as_posix()

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def dump(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True, help='Path to minimal_core')
    args = parser.parse_args()
    source = args.source.resolve()
    status = json.loads((source / 'reports/Wiring_Status.json').read_text())
    audit = json.loads((source / 'reports/Final_Snapshot_Audit.json').read_text())
    geometry = json.loads((source / 'reports/Geometry.json').read_text())
    board = source / 'hardware/FPGA100T_Minimal.kicad_pcb'
    board_hash = digest(board)
    assert board_hash == status['board_sha256'] == audit['board_sha256'] == geometry['sha256'], 'Stale board evidence: regenerate reports before importing'
    assert not status['fabrication_ready'] and not status['electrical_operation_verified'], 'This importer is explicitly for an unqualified review snapshot'
    for path, expected in audit['files'].items():
        assert digest(source / path) == expected, 'Stale snapshot evidence: ' + path
    drc = json.loads((source / 'reports/DRC_Minimal_Final.json').read_text())
    assert len(drc['unconnected_items']) == status['unconnected_items']
    assert len(drc.get('violations', [])) == status['DRC_geometric_violations']
    assert len(drc.get('schematic_parity', [])) == status['schematic_parity_issues']
    records = []
    TARGET.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='fpga-review-', dir=TARGET.parent) as temp:
        stage = Path(temp)
        def copy(src, dest, sanitize=False):
            out = stage / dest
            out.parent.mkdir(parents=True, exist_ok=True)
            content = src.read_bytes()
            original = hashlib.sha256(content).hexdigest()
            if sanitize:
                text = content.decode('utf-8')
                text = text.replace(str(source) + '/', '')
                # Evidence can contain earlier workspace paths. Retain only the filename.
                text = re.sub(r'/(?:Users|home|Volumes)/[^"\n<>]*?/([^/"\n<>]+)(?=["\n<>])', r'[source-workspace]/\1', text)
                content = text.encode('utf-8')
            out.write_bytes(content)
            records.append({'path': dest, 'sha256': digest(out), 'source_sha256': original, 'bytes': len(content), 'transformation': 'workstation paths made portable; engineering values unchanged' if original != digest(out) else 'unchanged copy'})
        for src in sorted((source / 'hardware').iterdir()):
            if src.suffix in ('.kicad_sch', '.kicad_pcb', '.kicad_pro') or src.name in ('fp-lib-table', 'sym-lib-table'):
                copy(src, 'hardware/' + src.name)
        for src in sorted((source / 'libraries').rglob('*')):
            if src.is_file() and src.suffix in ('.kicad_sym', '.kicad_mod'):
                copy(src, src.relative_to(source).as_posix())
        for name in ['Wiring_Status.json', 'Final_Snapshot_Audit.json', 'DRC_Minimal_Final.json', 'ERC_Minimal.json', 'Geometry.json', 'BOM_Core_Draft.csv', 'FPGA100T_Minimal.net', 'Independent_Minimal_Connectivity_Audit.json', 'Netlist_Manifest_Check.json', 'Removed_Access_Hardware.json']:
            copy(source / 'reports' / name, 'reports/' + name, sanitize=True)
        for name in ['FPGA100T_Minimal_Schematic.pdf', 'FPGA100T_Minimal_PCB.png', 'FPGA100T_Minimal_PCB.svg']:
            copy(source / 'output' / name, 'output/' + name)
        for name in ['ASIC_117_Signal_Baseline.csv', 'Package_All_324_Balls.csv']:
            copy(source.parent / 'pinout' / name, 'pinout/' + name)
        copy(source.parent / 'sources/xc7a100tcsg324pkg.csv', 'sources/xc7a100tcsg324pkg.csv')
        readme = '''# FPGA100T review snapshot — not for manufacture

Open `hardware/FPGA100T_Minimal.kicad_pro` in KiCad 10 with the complete folder intact. All hierarchical sheets and project-local libraries are included. Native CAD bytes are unchanged from the audited source snapshot; reports replace workstation paths with portable references. Views are engineering exports, not photographs or operating-hardware evidence.

The current 40 × 36 mm outline describes the core only. The release scope includes all 117 ASIC signals and the XEM8310 data/power/programming link. Their contact allocation and complete copper are not finished. Do not fabricate this snapshot. See the website's validation and release sections and `reports/Wiring_Status.json` for actual remaining work.

The fixed mode straps select SPI boot (M2:M1:M0 = 001); dedicated JTAG is taken to the custom Type-D port. J1, J2, J3, SW1, D1, R120 and test points were removed to reduce size. This custom powered port is not compatible with ordinary HDMI equipment. The XEM8310 carrier/adapter power contract is being designed and requires qualification.

Library provenance: FPGA and cached CoreSupport assets derive from KiCad 10.0.6 symbol/footprint libraries and retain their source fields. KiCad library assets use CC-BY-SA-4.0 with the KiCad libraries exception; see https://www.kicad.org/libraries/license/. PowerDraft package geometry was drawn from TI TPS62135 RGX0011A and Coilcraft XFL4020 manufacturer documentation. The custom LinkPort uses the Molex 46765 family mechanical footprint; exact orderable connector and cable remain subject to interface/DFM review. AMD's package CSV is included as a package-reference source. No additional license grant is asserted for manufacturer or lab material.

The 117-signal CSV records the corrected September 24 application count; package balls/contact fields remain unassigned. It is not a complete pinout or connector contract. The independently audited earlier connectivity snapshot is dated evidence; the current authoritative board hash and endpoint checks are in `Final_Snapshot_Audit.json` and `Wiring_Status.json`.

Excluded: personal chat/audio, rejected layout candidates, caches, routing experiments, unrelated firmware and local reference checkouts. Standard KiCad 3D models are not bundled; this does not prevent editing the project and missing 3D models do not establish mechanical fit.
'''
        (stage / 'README.md').write_text(readme)
        with zipfile.ZipFile(stage / 'FPGA100T_Review_Project.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
            for path in sorted(stage.rglob('*')):
                if path.is_file() and path.suffix != '.zip':
                    info = zipfile.ZipInfo('FPGA100T_Review/' + path.relative_to(stage).as_posix(), (2026, 9, 26, 0, 0, 0))
                    info.compress_type = zipfile.ZIP_DEFLATED
                    info.external_attr = 0o644 << 16
                    archive.writestr(info, path.read_bytes())
        for name in ['README.md', 'FPGA100T_Review_Project.zip']:
            p = stage / name
            records.append({'path': name, 'sha256': digest(p), 'bytes': p.stat().st_size, 'transformation': 'generated review packaging'})
        manifest = {'kind': 'unqualified-full-board-review-core-snapshot', 'date': status['date'], 'source': 'FPGA_100T_CSG324/minimal_core', 'board_sha256': board_hash, 'native_CAD_changed_during_packaging': False, 'release_scope': 'Full FPGA board: 117 ASIC signals and XEM8310 link mandatory', 'fabrication_ready': False, 'files': records}
        dump(stage / 'manifest.json', manifest)
        if TARGET.exists():
            shutil.rmtree(TARGET)
        shutil.copytree(stage, TARGET)
    sides = collections.Counter(f['side'] for f in geometry['footprints'])
    data = {'date': status['date'], 'artifactRoot': '../../' + REL + '/', 'boardSha256': board_hash, 'snapshotSha256': audit['snapshot_sha256'], 'boardMm': geometry['board_mm'], 'components': status['footprints'], 'front': sides['front'], 'back': sides['back'], 'schematicPages': len(list((TARGET / 'hardware').glob('*.kicad_sch'))), 'padRecords': status['pad_records'], 'tracks': status['track_segments'], 'vias': status['through_vias'], 'zones': status['copper_zones'], 'routedSignalNets': status['routed_signal_net_count'], 'unconnectedItems': status['unconnected_items'], 'drcViolations': status['DRC_geometric_violations'], 'parityIssues': status['schematic_parity_issues'], 'endpointsVerified': status['schematic_intended_physical_endpoints'], 'ercOpenPins': status['ERC_open_pins'], 'ercWarnings': status['ERC_symbol_type_warnings'], 'ignoredChecks': status['ignored_checks'], 'drcExclusions': status['DRC_exclusions'], 'routedSignals': status['routed_signal_nets'], 'remainingByNet': status['remaining_by_net'], 'fabricationReady': False, 'electricalOperationVerified': False, 'fullBoardComplete': False, 'sourceKiCadVersion': drc['kicad_version']}
    dump(ROOT / 'presentation/fpga/review-data.json', data)
    dump(ROOT / 'presentation/fpga/manifest.json', {'kind': 'fpga-professor-review', 'updated': status['date'], 'entry': 'presentation/fpga/index.html', 'data': 'presentation/fpga/review-data.json', 'source': REL, 'artifact_manifest': REL + '/manifest.json', 'historical_page': 'presentation/fpga/history-2026-09-24.html', 'board_sha256': board_hash, 'fabrication_ready': False})
    global_path = ROOT / 'sources/manifest.json'
    global_manifest = json.loads(global_path.read_text())
    global_manifest['fpga_presentation'] = {'manifest': 'presentation/fpga/manifest.json', 'entry': 'presentation/fpga/index.html', 'source': REL, 'status': 'full-board engineering review; core snapshot only; not fabrication-ready'}
    global_manifest['files'] = [f for f in global_manifest['files'] if not f['path'].startswith(REL + '/')]
    for record in records:
        global_manifest['files'].append({'path': REL + '/' + record['path'], 'origin': 'FPGA_100T_CSG324/minimal_core review snapshot ' + status['date'], 'status': 'engineering review, not fabrication release', 'transformation': record['transformation'], 'note': 'Current core snapshot; full 117-signal board and XEM8310 integration required.', **{k: v for k, v in record.items() if k in ('sha256', 'source_sha256', 'bytes')}})
    dump(global_path, global_manifest)
    print(f'Packaged {len(records)} files; {status["footprints"]} components; {status["unconnected_items"]} unconnected; PCB {board_hash}')

if __name__ == '__main__':
    main()
