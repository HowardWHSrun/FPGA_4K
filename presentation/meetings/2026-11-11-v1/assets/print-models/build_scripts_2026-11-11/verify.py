import json, os, sys, numpy as np, trimesh, zipfile
P = sys.argv[1]; d = json.load(open(P + 'models.json'))
def comps(m):
    par = list(range(len(m.vertices)))
    def f(a):
        while par[a] != a: par[a] = par[par[a]]; a = par[a]
        return a
    v = trimesh.grouping.unique_rows(np.round(m.vertices, 5))[1]   # merge duplicate STL vertices
    for a, b, c in v[m.faces]:
        ra, rb, rc = f(a), f(b), f(c); par[rb] = ra; par[rc] = ra
    return len({f(i) for i in set(v[m.faces].ravel())})
import cadquery as cq
ok = True
for m in d['models']:
    t = trimesh.load(P + m['stl']); s = cq.importers.importStep(P + m['step']); ns = sum(len(o.Solids()) for o in s.vals()); bb = s.vals()[0].BoundingBox()
    sz = [round(float(v), 2) for v in t.bounds[1] - t.bounds[0]]; c = comps(t)
    good = t.is_watertight and t.is_winding_consistent and c == 1 and t.volume > 0 and ns == 1 and sz == m['size'] and max(abs(bb.xlen - sz[0]), abs(bb.ylen - sz[1]), abs(bb.zlen - sz[2])) < 0.02
    ok &= bool(good)
    print('OK ' if good else 'BAD', m['key'], sz, 'watertight', t.is_watertight, 'bodies', c, 'euler', t.euler_number, 'STEP solids', ns, [round(bb.xlen, 2), round(bb.ylen, 2), round(bb.zlen, 2)])
    for g in ([m['glb']] if m['glb'] else []) + [p['glb'] for p in (m['parts'] or [])]:
        assert os.path.getsize(P + g) > 500
z = zipfile.ZipFile(P + d['zip']); print('zip', d['zip'], len(z.namelist()), 'files, test:', z.testzip())
want = {os.path.basename(m[k]) for m in d['models'] for k in ('stl', 'step')} | {'MODEL_NOTES.txt'}; print('zip matches models.json:', want == set(z.namelist())); print('ALL OK' if ok else 'FAILURES')
