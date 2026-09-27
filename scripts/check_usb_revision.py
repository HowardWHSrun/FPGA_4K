#!/usr/bin/env python3
"""Check published USB-C evidence consistency, not electrical qualification."""
from pathlib import Path
import csv
import hashlib
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from check_hardware import check as check_dependencies

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'hardware/fpga-interface-study/dated/2026-09-27/usb-c-revision'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())


def check():
    assert check_dependencies(ROOT, PACKAGE / 'hardware/FPGA100T_33x36_Routing') == 0
    audit = read(PACKAGE / 'reports/USB_C_Native_Audit.json')
    assert audit['fabrication_ready'] is False
    assert not audit['endpoint_errors'] and not audit['asic_assignment_errors']
    assert not audit['footprint_centers_outside_outline']
    assert audit['physical_DRC_errors'] == 0 and audit['schematic_parity_count'] == 0
    assert not audit['SMD_via_copper_overlaps']
    assert audit['asic_assigned'] == 116
    assert 0 <= audit['asic_nets_without_DRC_opens'] <= audit['asic_endpoint_connected_count'] <= 116
    assert len(audit['asic_endpoint_open_nets']) == 116 - audit['asic_endpoint_connected_count']
    assert audit['dimensions_mm'] == [33, 36]
    assert audit['copper_layers'] == 12
    for name, digest in audit['source_files'].items():
        assert sha(PACKAGE / name) == digest, name
    assert sha(PACKAGE / 'hardware/FPGA100T_33x36_Routing.kicad_pcb') == audit['board_sha256']
    for key, name in [('manifest', 'component_manifest_resolved.json'),
                      ('netlist', 'USB_C_Revision.net'), ('erc', 'USB_C_ERC.json'),
                      ('drc', 'USB_C_DRC.json')]:
        assert sha(PACKAGE / 'reports' / name) == audit[key + '_sha256'], name

    manifest = read(PACKAGE / 'reports/component_manifest_resolved.json')['components']
    physical = {ref: part for ref, part in manifest.items() if part.get('footprint')}
    assert len(physical) == audit['footprints']
    assert sum(not p.get('exclude_from_bom') for p in physical.values()) == audit['fitted_components']
    rows = list(csv.DictReader((PACKAGE / 'reports/USB_C_All_Pin_Connections.csv').open()))
    endpoints = {(r['reference'], r['pin']): r for r in rows}
    assert len(rows) == len(endpoints) == audit['logical_numbered_endpoints']
    assert {r['reference'] for r in rows} == set(physical)
    assert sum(r['intentional_nc'] == 'True' for r in rows) == audit['intentional_nc_count']
    assert audit['intentional_nc_by_component'] == {ref: sorted(c.get('no_connect', [])) for ref, c in physical.items() if c.get('no_connect')}
    component_rows = list(csv.DictReader((PACKAGE / 'reports/USB_C_Component_List.csv').open()))
    assert len(component_rows) == len(physical)
    for row in component_rows:
        part = physical[row['reference']]
        assert row['mpn'] == part.get('mpn', '') and row['footprint'] == part['footprint']
        assert row['value'] == part['value'] and (row['fitted'] == 'True') == (not part.get('exclude_from_bom'))
    xml = ET.parse(PACKAGE / 'reports/USB_C_Revision.net').getroot()
    nets = {(n.get('ref'), n.get('pin')): (net.get('name') or '').lstrip('/')
            for net in xml.findall('./nets/net') for n in net.findall('node')}
    for ref, part in physical.items():
        pins = set(part.get('pins', {})) | set(part.get('no_connect', []))
        assert pins == {pin for r, pin in endpoints if r == ref}, ref
        for pin in pins:
            row = endpoints[ref, pin]
            assert row['net'] == nets.get((ref, pin), ''), (ref, pin)
            expected = part.get('pins', {}).get(pin)
            if expected:
                assert row['net'] == expected, (ref, pin)
            else:
                assert not row['net'] or row['net'].startswith('unconnected-'), (ref, pin)
            assert (row['intentional_nc'] == 'True') == (pin in part.get('no_connect', []))
    assignments = list(csv.DictReader((PACKAGE / 'assignment/ASIC_Interface_Assignment.csv').open()))
    digital = [r for r in assignments if r['interface_kind'] == 'fpga_candidate']
    assert len(digital) == 116 and len(assignments) == 117
    for row in digital:
        for field in ['fpga_endpoint', 'connector_endpoint']:
            assert endpoints[tuple(row[field].split('.'))]['net'] == row['signal']
    analog = [r for r in assignments if r['interface_kind'] == 'analog_external_reserved']
    assert len(analog) == 1 and analog[0]['signal'] == 'AC_IN_SHARED'
    assert endpoints[tuple(analog[0]['connector_endpoint'].split('.'))]['net'] == 'AC_IN_ANALOG_RESERVED'
    assert 'A13' in physical['U1']['no_connect']
    assert physical['J4']['mpn'] == 'USB4081-03-A'
    assert set(physical['J4']['no_connect']) == {'A8', 'B8'}
    assert physical['U6']['mpn'] == 'MX25U6432FZBI02'
    assert physical['U6']['footprint'] == 'CoreSupport:Macronix_USON8_3x4_Floating_Metal'
    assert set(physical['J5']['no_connect']) == {'32', '34'}
    assert set(physical['J6']['no_connect']) == {'37'}
    assert nets['U1', 'E6'] == nets['J6', '59'] == 'ASIC3_READ'
    assert nets['J5', '32'].startswith('unconnected-')

    erc = read(PACKAGE / 'reports/USB_C_ERC.json')
    findings = [v for sheet in erc['sheets'] for v in sheet.get('violations', [])]
    for severity in ['errors', 'warnings']:
        assert sum(v['severity'] == severity[:-1] for v in findings) == audit['ERC_' + severity]
    drc = read(PACKAGE / 'reports/USB_C_DRC.json')
    for key, field in [('violations', 'physical_DRC_count'),
                       ('unconnected_items', 'assigned_net_open_count'),
                       ('schematic_parity', 'schematic_parity_count')]:
        assert len(drc.get(key, [])) == audit[field], field

    assert sum(v.get('severity') == 'error' for v in drc.get('violations', [])) == audit['physical_DRC_errors']
    assert sum(v.get('severity') == 'warning' for v in drc.get('violations', [])) == audit['physical_DRC_warnings']

    provenance = read(PACKAGE / 'output/Current_View_Provenance.json')
    assert provenance['source_sha256'] == audit['board_sha256'] and provenance['source_unchanged']
    for side, values in provenance['sides'].items():
        assert sha(PACKAGE / 'output' / ('Current_' + side.title() + '.svg')) == values['styled_sha256']
        assert values['geometry_elements_unchanged'] > 0
    assert provenance['schematic_pdf']['pages_verified'] == 26
    assert sha(PACKAGE / 'output' / provenance['schematic_pdf']['path']) == provenance['schematic_pdf']['sha256']

    package_manifest = read(PACKAGE / 'Package_Manifest.json')
    assert package_manifest['board_sha256'] == audit['board_sha256']
    for name, record in package_manifest['files'].items():
        assert sha(PACKAGE / name) == record['sha256'], name
    with zipfile.ZipFile(PACKAGE / 'FPGA100T_USB_C_Development.zip') as archive:
        prefix = 'FPGA100T_USB_C_Development/'
        expected = set(package_manifest['files']) | {'Package_Manifest.json'}
        assert {n.removeprefix(prefix) for n in archive.namelist()} == expected
        for name in expected:
            assert archive.read(prefix + name) == (PACKAGE / name).read_bytes(), name
    for path in PACKAGE.rglob('*'):
        assert 'PRIVATE' not in path.name and 'Pasted text' not in path.name
        if path.is_file() and path.suffix in {'.md', '.json', '.net', '.txt', '.log', '.kicad_sch', '.kicad_pcb'}:
            assert not re.search(r'/Users/|/Volumes/|/home/', path.read_text()), path

    registry = read(ROOT / 'presentation/fpga/viewer/boards.json')
    assert registry['default_board'] == 'usb-c'
    board = next(b for b in registry['boards'] if b['id'] == 'usb-c')
    assert board['sha256'] == audit['board_sha256'] and board['manufacturing_ready'] is False
    assert board['unconnected_items'] == audit['assigned_net_open_count']
    for viewer_key, audit_key in [('footprints', 'footprints'), ('pads', 'pads'), ('segments', 'tracks'),
                                  ('vias', 'vias'), ('zones', 'zones'), ('nets', 'nets'), ('copperLayers', 'copper_layers')]:
        assert board['expected'][viewer_key] == audit[audit_key], viewer_key
    page = ROOT / 'presentation/fpga/index.html'
    assert page.read_bytes() == page.with_name('usb-c.html').read_bytes()
    for name in re.findall(r'data-file="([^"]+)"', page.read_text()):
        assert (PACKAGE / name).is_file(), name
    assert page.with_name('micro-hdmi.html').is_file()
    print(f'USB-C publication coherent: {audit["footprints"]} footprints, '
          f'{len(endpoints)} endpoints, 116 ASIC assignments; '
          f'{audit["assigned_net_open_count"]} open copper items. Not manufacturing qualification.')


if __name__ == '__main__':
    check()
