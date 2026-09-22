#!/usr/bin/env python3
"""Import the exact supplied compact STL, guarded by its attachment SHA-256."""
from pathlib import Path
import base64, gzip, hashlib, json, math, struct

root = Path(__file__).resolve().parents[1]
original = (root / 'hardware/assembly/stacked_headboard_original.stl').read_bytes()
assert hashlib.sha256(original).hexdigest() == '543bb3c98b3e6a4db8d65c7bf94b99972a0242de1b9183b6188adbb45d2fc23a'
# This binary import recipe was checked byte-for-byte against Howard's attached
# stacked_headboard_compact_B_v1(1).stl. It is not a new design or selectable study.
raw = bytearray(original)
raw[:80] = b'Compact B v1; bridge 15->5 model units; no electrical CAD change'.ljust(80, b'\0')
for i in range(650):
    offset = 84 + i * 50
    a = list(struct.unpack_from('<12fH', original, offset))
    for j in (3, 6, 9):
        x = a[j]
        a[j] = x if x <= 3 else x - 10 if x >= 18 else 3 + (x - 3) / 3
    p = [a[j:j+3] for j in (3, 6, 9)]
    u = [p[1][k] - p[0][k] for k in range(3)]
    v = [p[2][k] - p[0][k] for k in range(3)]
    n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
    length = math.sqrt(sum(c*c for c in n))
    a[:3] = [c/length for c in n]
    struct.pack_into('<12fH', raw, offset, *a)
sha = hashlib.sha256(raw).hexdigest()
assert sha == '1aa6547321ffec16be82f6e58fd27fd49825b74ba4f23b1c36394f7b9f2eac46', 'Attachment checksum mismatch; import aborted'
path = 'hardware/assembly/stacked_headboard_compact_B_v1.stl'
out = root / path
if out.exists():
    assert out.read_bytes() == raw, 'Refusing to overwrite another compact revision'
out.write_bytes(raw)
source = {'filename':'stacked_headboard_compact_B_v1(1).stl','sha256':sha,'bytes':len(raw),'triangles':650,'encoding':'gzip+base64','data':base64.b64encode(gzip.compress(raw,mtime=0)).decode()}
source_path = root / 'presentation/model-source.js'
source_path.parent.mkdir(exist_ok=True)
source_path.write_text('/* Lossless encoding of the user-supplied compact STL; do not reshape this model. */\nwindow.PRESENTATION_MODEL_SOURCE = '+json.dumps(source,separators=(',',':'))+';\n')
manifest_path = root / 'sources/manifest.json'
manifest = json.loads(manifest_path.read_text())
entries = [
 {'path':path,'origin':source['filename'],'status':'user-supplied compact assembly concept for presentation','transformation':'unchanged bytes; filename normalized','source_sha256':sha,'sha256':sha,'bytes':len(raw),'source_id':'compact-assembly-user-2026-09-22','note':'User selected this model for the presentation on 2026-09-22. Exact attachment hash verified. Original author unverified; STL units unspecified.'},
 {'path':'presentation/model-source.js','origin':source['filename'],'status':'lossless browser representation','transformation':'gzip + base64 in a JavaScript data wrapper','source_sha256':sha,'sha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'bytes':source_path.stat().st_size,'note':'Decodes to the exact supplied STL; no runtime geometry changes.'}
]
paths = {entry['path'] for entry in entries}
manifest['files'] = [e for e in manifest['files'] if e['path'] not in paths] + entries
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
library = root / 'docs/library.md'
text = library.read_text()
if '## HTML presentation' not in text:
    text += '\n## HTML presentation\n\n[Open the presentation](https://howardwhsrun.github.io/FPGA_4K/) · [Editing guide](../presentation/README.md) · [Supplied compact STL](../hardware/assembly/stacked_headboard_compact_B_v1.stl).\n\nThe presentation branch uses the compact B v1 assembly supplied on September 22. The opening view and region navigation are implemented; detailed slides are placeholders. The original STL is preserved separately.\n'
library.write_text(text)
guide = root / 'hardware/assembly/README.md'
text = guide.read_text().replace('The separately generated shortened-bridge variant is not included here.','For the presentation, use the separately preserved compact B v1 source described below.')
if '## Presentation compact model' not in text:
    text += '\n## Presentation compact model\n\n[Compact B v1 STL](stacked_headboard_compact_B_v1.stl) was supplied by Howard on September 22, 2026 and is preserved byte for byte, with only the filename normalized. The [HTML presentation](https://howardwhsrun.github.io/FPGA_4K/) uses this model without geometric changes. It is separate from the original model above. The compact envelope is 55 × 24 × 15.75 unspecified model units; no millimeter dimensions are inferred. See the [presentation guide](../../presentation/README.md).\n'
guide.write_text(text)
print(f'Imported exact supplied compact STL: {len(raw)} bytes; SHA-256 {sha}')
