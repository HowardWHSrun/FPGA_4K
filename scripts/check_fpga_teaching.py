#!/usr/bin/env python3
"""Verify presentation labels against the frozen current-board source CSVs.

This checks explanatory-data fidelity. It does not qualify circuitry or copper.
"""
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'presentation/fpga'
CURRENT = ROOT / 'hardware/fpga-interface-study/dated/2026-09-26/routing-33x36'


def load(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rows(path):
    with path.open(newline='') as handle:
        return list(csv.DictReader(handle))


def main():
    audit = load(PAGE / 'data/Component_Necessity.json')
    labels = load(PAGE / 'pins/pin_status.json')
    runtime_data_line = (PAGE / 'pins/pin_map.js').read_text().splitlines()[0]
    assert runtime_data_line.startswith('const PIN_STATUS = ') and runtime_data_line.endswith(';')
    assert json.loads(runtime_data_line[len('const PIN_STATUS = '):-1]) == labels, 'Pin-map runtime data differs from downloadable evidence'
    snapshot = load(CURRENT / 'reports/Routing_Snapshot.json')
    source_parts = rows(CURRENT / 'reports/Component_List.csv')
    source_pins = rows(CURRENT / 'reports/All_Pin_Connections.csv')
    native = CURRENT / 'hardware/FPGA100T_33x36_Routing.kicad_pcb'
    expected_hash = sha(native)
    assert audit['boardSha256'] == labels['source']['boardSha256'] == snapshot['boardSha256'] == expected_hash
    assert audit['cadModified'] is False and audit['fabricationReady'] is False and labels['fabricationReady'] is False
    for source in audit['sourceFiles']:
        assert sha(CURRENT / source['path']) == source['sha256'], source['path']
    assert labels['source']['allPinCsvSha256'] == sha(CURRENT / 'reports/All_Pin_Connections.csv')

    parts = {part['reference']: part for part in audit['components']}
    assert len(parts) == len(audit['components']) == len(source_parts) == 130
    assert set(parts) == {row['reference'] for row in source_parts}
    groups = audit['groups']
    memberships = [ref for group in groups for ref in group['references']]
    assert Counter(memberships) == Counter(parts.keys())
    assert all(group['count'] == len(group['references']) for group in groups)
    assert audit['counts']['byStatus'] == dict(Counter(part['status'] for part in parts.values()))
    assert audit['counts']['byPrefix'] == dict(Counter(row['reference'][0] for row in source_parts))
    assert audit['counts']['byPrefix'] == {'C': 83, 'R': 33, 'U': 6, 'L': 4, 'J': 3, 'Y': 1}
    source_ids = {source['id'] for source in audit['sources']}
    for source in source_parts:
        part = parts[source['reference']]
        assert part['value'] == source['value']
        assert part['status'] in audit['statusLegend']
        for field in ['shortRole', 'whyNeeded', 'ifRemoved', 'reviewDecision']:
            assert part[field].strip(), (source['reference'], field)
        assert part['sourceIds'] and set(part['sourceIds']) <= source_ids
        original = {(row['pin'], row['net'], row['status']) for row in source_pins if row['reference'] == source['reference']}
        explained = {(row['pin'], row['net'], row['status']) for row in part['pins']}
        assert explained == original, source['reference']
    assert {part['reference'] for part in parts.values() if part['status'] == 'nonessential'} == {'R12'}

    pins = {row['id']: row for row in labels['pins']}
    assert len(pins) == len(labels['pins']) == len(source_pins) == 762
    assert set(pins) == {row['reference'] + '.' + row['pin'] for row in source_pins}
    status_map = {
        'unassigned — interface decision required': 'unassigned',
        'assigned, routing incomplete on net': 'assigned-open',
        'assigned net connected in native DRC': 'assigned-connected',
        'intentional no-connect': 'nc',
    }
    for source in source_pins:
        key = source['reference'] + '.' + source['pin']
        pin = pins[key]
        assert pin['reference'] == source['reference'] and pin['pin'] == source['pin']
        assert (pin['net'] or '') == source['net']
        assert pin['statusCode'] == status_map[source['status']]
        assert pin['rawCadStatus'] == source['status']
        assert pin['schematicNet'] == source['schematic_net']
        assert len(pin['physicalPads']) == int(source['physical_pad_records'])
        assert all(isinstance(position[field], (int, float)) for position in pin['physicalPads'] for field in ['x_mm', 'y_mm'])
    assert Counter(pin['statusCode'] for pin in pins.values()) == {'unassigned': 331, 'assigned-open': 326, 'assigned-connected': 99, 'nc': 6}
    assert Counter(pin['reference'] for pin in pins.values() if pin['statusCode'] == 'unassigned') == {'U1': 203, 'J4': 8, 'J5': 60, 'J6': 60}
    assert sum(len(pin['physicalPads']) for pin in pins.values()) == 771
    assert labels['counts']['missingAssignedConnections'] == snapshot['unconnectedItems'] == 146
    assert labels['counts']['assigned'] == 425

    # Saved NC flags describe source bytes, not approved electrical treatment.
    nc = {pin['id']: pin for pin in pins.values() if pin['statusCode'] == 'nc'}
    assert set(nc) == {'U1.L9', 'U1.L10', 'U2.4', 'U3.4', 'U4.4', 'U5.4'}
    for key in ['U1.L9', 'U1.L10']:
        assert nc[key]['validationStatus'] == 'ground_required'
        assert nc[key]['visualStatusCode'] == 'ground-required'
        assert nc[key]['rawStatusLabel'] == 'NC in saved CAD'
        assert 'GND' in nc[key]['statusLabel'] and 'UG475' in nc[key]['note']
    for key in ['U2.4', 'U3.4', 'U4.4', 'U5.4']:
        assert nc[key]['validationStatus'] == 'grounding_review'
        assert nc[key]['visualStatusCode'] == 'ground-review'
        assert 'review' in nc[key]['statusLabel'].lower()
    nc_audit = {item['reference'] + '.' + item['pin']: item for item in audit['intentionalNoConnects']}
    assert set(nc_audit) == set(nc)
    assert {key for key, item in nc_audit.items() if item['reviewState'] == 'ground-required'} == {'U1.L9', 'U1.L10'}
    assert {key for key, item in nc_audit.items() if item['reviewState'] == 'unused-output-review'} == {'U2.4', 'U3.4', 'U4.4', 'U5.4'}
    assert (PAGE / 'data/Presenter_Notes.md').is_file()
    assert (PAGE / 'pins/index.html').is_file()
    assert sha(native) == expected_hash
    print('PASS: 130 component explanations and all 762 pin labels match frozen source; 331 unassigned, 6 saved-CAD NC, 2 required ground corrections, 4 FB2 reviews; no native CAD mutation.')


if __name__ == '__main__':
    main()
