#!/usr/bin/env python3
"""Check active FPGA CAD packaging, not electrical or manufacturing correctness."""
import argparse
from functools import lru_cache
import json
from pathlib import Path
import re
import sys


def check(root):
    root = root.resolve()
    board_dir = root / 'hardware/fpga-board'
    project_dir = board_dir / 'hardware'
    stem = project_dir / 'Howard_FPGA_Connected_42x40'
    errors = []
    try:
        scope = json.loads((root / 'hardware/project-scope.json').read_text())
        required = scope['howard_fpga_draft']
        if type(required) is not bool:
            raise ValueError('howard_fpga_draft must be boolean')
    except (OSError, ValueError, KeyError) as exc:
        print('ERROR: invalid hardware/project-scope.json: ' + str(exc), file=sys.stderr)
        return 1
    if not required:
        if board_dir.exists():
            print('ERROR: Howard draft exists but is excluded by project-scope.json', file=sys.stderr)
            return 1
        print('PASS: branch intentionally excludes Howard personal CAD; shared references are checked by check_docs.py.')
        print('Scope: no native CAD validation; other personal projects require their own checks.')
        return 0

    @lru_cache(maxsize=None)
    def read(path):
        if not path.resolve().is_relative_to(root):
            errors.append('Dependency escapes repository: ' + str(path))
            return ''
        if not path.is_file():
            errors.append('Missing dependency: ' + str(path.relative_to(root)))
            return ''
        text = path.read_text(encoding='utf-8')
        if re.search(r'^(?:<<<<<<< |=======\s*$|>>>>>>> )', text, re.M):
            errors.append('Unresolved merge markers: ' + str(path.relative_to(root)))
        if re.search(r'/(?:Users|Volumes|home)/|[A-Za-z]:[\\/]Users[\\/]', text):
            errors.append('Workstation-specific path: ' + str(path.relative_to(root)))
        return text

    try:
        json.loads(read(stem.with_suffix('.kicad_pro')))
    except ValueError:
        errors.append('Invalid KiCad project JSON')
    board = read(stem.with_suffix('.kicad_pcb'))
    tables = {}
    for name in ['fp-lib-table', 'sym-lib-table']:
        table = read(project_dir / name)
        entries = re.findall(r'\(lib\s+\(name "([^"]+)"\).*?\(uri "([^"]+)"\)', table, re.S)
        if not entries:
            errors.append('No project-local libraries in ' + name)
        for alias, uri in entries:
            if not uri.startswith('${KIPRJMOD}/'):
                errors.append('Library must use a project-relative path: ' + alias)
                continue
            target = (project_dir / uri[len('${KIPRJMOD}/'):]).resolve()
            if not target.is_relative_to(root) or not target.exists():
                errors.append('Missing or external library: ' + alias)
            else:
                tables[(name, alias)] = target

    pending = [stem.with_suffix('.kicad_sch')]
    visited = set()
    symbols = set()
    while pending:
        sheet = pending.pop().resolve()
        if sheet in visited:
            continue
        visited.add(sheet)
        text = read(sheet)
        for child in re.findall(r'\(property "Sheetfile"\s+"([^"]+)"', text):
            pending.append(sheet.parent / child)
        symbols.update(re.findall(r'\(lib_id "([^"]+)"', text))
    for symbol in sorted(symbols):
        alias, sep, name = symbol.partition(':')
        library = tables.get(('sym-lib-table', alias))
        if not sep or library is None:
            errors.append('Symbol library not packaged: ' + symbol)
        elif not re.search(r'\(symbol\s+"' + re.escape(name) + r'"', read(library)):
            errors.append('Symbol not in packaged library: ' + symbol)

    footprints = set(re.findall(r'\(footprint "([^"]+)"', board))
    if not footprints:
        errors.append('No board footprints found')
    for footprint in sorted(footprints):
        alias, sep, name = footprint.partition(':')
        library = tables.get(('fp-lib-table', alias))
        if not sep or library is None:
            errors.append('Footprint library not packaged: ' + footprint)
        else:
            read(library / (name + '.kicad_mod'))

    for error in sorted(set(errors)):
        print('ERROR: ' + error, file=sys.stderr)
    print(f'Checked {len(visited)} schematic sheets, {len(symbols)} symbols and {len(footprints)} footprint definitions.')
    print('Scope: project dependencies, local libraries and merge/path hazards; no electrical checks or 3D model validation.')
    if errors:
        return 1
    print('PASS: active FPGA CAD packaging.')
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    sys.exit(check(args.root))
