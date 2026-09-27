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
CURRENT = (PAGE / json.loads((PAGE / 'review-data.json').read_text())['artifactRoot']).resolve()


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
    assert len(parts) == len(audit['components']) == len(source_parts) == snapshot['components']
    assert set(parts) == {row['reference'] for row in source_parts}
    groups = audit['groups']
    memberships = [ref for group in groups for ref in group['references']]
    assert Counter(memberships) == Counter(parts.keys())
    assert all(group['count'] == len(group['references']) for group in groups)
    assert audit['counts']['byStatus'] == dict(Counter(part['status'] for part in parts.values()))
    assert audit['counts']['byPrefix'] == dict(Counter(row['reference'][0] for row in source_parts))
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
    assert len(pins) == len(labels['pins']) == len(source_pins) == snapshot['canonicalPins']
    assert set(pins) == {row['reference'] + '.' + row['pin'] for row in source_pins}
    status_map = {
        'unassigned — interface decision required': 'unassigned',
        'assigned, routing incomplete on net': 'assigned-open',
        'assigned net connected in native DRC': 'assigned-connected',
        'intentional no-connect': 'unassigned',
        'analog reserved — external source required; no FPGA connection': 'analog-reserved',
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
    assert Counter(pin['reference'] for pin in pins.values() if pin['statusCode'] == 'unassigned') == {'U1': 87, 'J4': 8, 'J6': 3}
    assert sum(len(pin['physicalPads']) for pin in pins.values()) == snapshot['numberedPhysicalPads']
    assert labels['counts']['missingAssignedConnections'] == snapshot['unconnectedItems']
    assert labels['counts']['assigned'] == snapshot['endpointsVerified']
    assert labels['counts']['unassigned'] == snapshot['unassignedEndpoints'] == 98
    assert labels['counts']['cadNoConnect'] == 1
    assert {r['reference']+'.'+r['pin'] for r in audit['intentionalNoConnects']} == {'U1.A13'}
    assert pins['U1.A13']['cadNoConnect'] and pins['U1.A13']['statusCode']=='unassigned'
    grounds = {'U1.L9','U1.L10','U2.4','U3.4','U4.4','U5.4'}
    assert set(labels['groundCorrectionEndpoints']) == grounds
    assert all(pins[key]['net'] == 'GND' and pins[key]['groundCorrectionApplied'] for key in grounds)
    assigned = [pin for pin in pins.values() if pin.get('nativeAssignmentProvisional')]
    assert len(assigned) == 232 and len({pin['net'] for pin in assigned}) == 116
    assert len({pin['net'] for pin in assigned if pin['statusCode'] == 'assigned-connected'}) == snapshot['asicNetsRouted']
    assert pins['J5.46']['statusCode']=='analog-reserved' and pins['J5.46']['net']=='AC_IN_ANALOG_RESERVED'
    assert pins['J5.46']['validationStatus']=='analog_external_source_required'
    assert all(pin['validationStatus']=='provisional_digital_1v5_polarity_unverified' for pin in assigned if pin['net']=='IMP_TST_SHARED')
    if 'R112' not in parts:
        assert pins['U1.P13']['net'] == 'GND' and 'R112' in audit['removedFromPreviousAudit']
    assert (PAGE / 'data/Presenter_Notes.md').is_file()
    assert (PAGE / 'pins/index.html').is_file()
    assert sha(native) == expected_hash
    print(f"PASS: {len(parts)} component explanations and {len(pins)} pin labels match native evidence; 116 candidate FPGA nets + one analog reservation, {snapshot['asicNetsRouted']} copper-connected, 98 unassigned endpoints (one NC subset), six GND corrections; no native CAD mutation.")


if __name__ == '__main__':
    main()
