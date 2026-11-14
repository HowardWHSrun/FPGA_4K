"""Printable actual-size models, rebuild V2 (for the 11 Nov 2026 weekly deck).
Method as 2026-11-04 05_Head_Fit_Print_Models_V1/scripts/build.py: board outline + thickness from each
.kicad_pcb (Edge.Cuts), axis-aligned boxes around the 3D bodies of the parts that set the outer size
(from a fresh kicad-cli 10.0.6 GLB export of a scratch copy), nominal boxes where a part has no 3D model.
Coordinates inside this script: board-native KiCad x/y (mm), z up with the board's bottom face at 0.
Output frame: X right, Y toward the reference board's north edge (KiCad 3D view), Z up.
"""
import sys, os, json, math, hashlib, re, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, trimesh, manifold3d as mf
from kpcb import parse, edges, area, footprints, thickness, find, one, xy, xform
from glb import load, walk
np.seterr(all='ignore')
ROOT = os.path.expanduser('~/kicad_work/print_models_2026-11-13/')
SRC, GLB, OUT = ROOT + 'src/', ROOT + 'out/', ROOT + 'build/'
os.makedirs(OUT, exist_ok=True)
COL = {'board': (23, 104, 73), 'ic': (45, 51, 58), 'conn': (214, 213, 200), 'passive': (150, 140, 120),
       'plug': (60, 70, 75), 'fill': (120, 150, 140)}
GAP = 1.5                                  # Hirose DF40C mated stacking height, mm
H_NOM = [('MPS_QFN-18', 1.6), ('MP5077', 0.80), ('Winbond_WLCSP', 0.55), ('Abracon_AX3', 1.00), ('YXC_SMD2016', 0.80),
         ('SOT886', 0.50), ('WSON6', 0.80)]   # nominal package heights, same table as 23_.../fit/fit_b.py

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()
def glb_boxes(path):
    js, b = load(path); res = {}
    for nm, p, _, _ in walk(js, b):
        p = p * 1000
        if not np.isfinite(p).all() or len(p) == 0: continue
        named = [x for x in nm if x and not x.startswith('=>')]
        ref = named[0] if named else '?'
        a = res.setdefault(ref, [np.full(3, 1e9), np.full(3, -1e9)])
        a[0] = np.minimum(a[0], p.min(0)); a[1] = np.maximum(a[1], p.max(0))
    return res
def kind(ref, val):
    r = ref.rstrip('0123456789_').upper()
    if r.startswith('J') or r.startswith('MC') or 'CONN' in (val or '').upper(): return 'conn'
    if r.startswith(('U', 'Y', 'X', 'L', 'Q', 'D', 'SW', 'F')): return 'ic'
    return 'passive'
def keep_default(ref, h, a, mn):
    if ref.startswith('TP'): return False
    if a >= 6.0: return True
    return h >= 0.55 and mn >= 0.6
def pad_boxes(brd):
    out = {}
    for n in find(brd, 'footprint'):
        a = one(n, 'at'); at = (float(a[1]), float(a[2]), float(a[3]) if len(a) > 3 and a[3] != 'unlocked' else 0.0)
        ref = [p[2] for p in find(n, 'property') if p[1] == 'Reference'][0]
        bb = None
        for p in find(n, 'pad'):
            pa = one(p, 'at'); c = xform(xy(pa), at); s = one(p, 'size'); w, h = float(s[1]), float(s[2])
            ang = float(pa[3]) if len(pa) > 3 else 0.0
            if round(ang / 90) % 2: w, h = h, w
            q = [c[0] - w / 2, c[1] - h / 2, c[0] + w / 2, c[1] + h / 2]
            bb = q if bb is None else [min(bb[0], q[0]), min(bb[1], q[1]), max(bb[2], q[2]), max(bb[3], q[3])]
        out[ref] = bb
    return out

class Board:
    """outline: native pts; holes: [(centre, dia)] ; loops: inner cut-outs; boxes: [x0,y0,x1,y1,z0,z1,cat,ref,flags]"""
    def __init__(s, key, name, pcb, glbname, t_use=None, keep=keep_default):
        s.key, s.name, s.pcb = key, name, pcb; s.notes = []; s.nominal = []
        brd = parse(open(pcb).read()); s.t_file = thickness(brd); s.t = t_use if t_use else s.t_file
        loops = edges(brd); loops.sort(key=lambda l: -abs(area(l)))
        assert math.dist(loops[0][0], loops[0][-1]) < 0.02, 'outline not closed'
        s.outline = np.array(loops[0][:-1]); s.loops = [np.array(l[:-1]) for l in loops[1:]]
        s.x0, s.y0 = s.outline.min(0); s.x1, s.y1 = s.outline.max(0)
        s.cx, s.cy = (s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2
        s.fps = {f['ref']: f for f in footprints(brd)}; s.pads = pad_boxes(brd)
        s.holes = []
        for f in s.fps.values():
            for c, d in f['holes']:
                if d >= 2.0 or 'Mounting' in f['lib'] or 'Standoff' in f['lib']: s.holes.append((c, d))
        s.boxes = []; s.kept = s.dropped = 0; s.nomodel = []
        gb = glb_boxes(GLB + glbname) if glbname else {}
        for ref, f in s.fps.items():
            if ref in gb:
                lo, hi = gb[ref]; sz = hi - lo           # GLB axes: x, up, native y
                if not keep(ref, sz[1], sz[0] * sz[2], min(sz[0], sz[2])): s.dropped += 1; continue
                z0, z1 = lo[1], hi[1]
                if z1 > s.t_file / 2: z0 += s.t - s.t_file; z1 += s.t - s.t_file    # top-side body follows the top face
                s.add(lo[0], lo[2], hi[0], hi[2], z0, z1, kind(ref, f['val']), ref)
            else: s.nomodel.append(ref)
    def add(s, x0, y0, x1, y1, z0, z1, cat, ref, df40=None):
        if min(x1 - x0, y1 - y0, z1 - z0) <= 0.02: return
        if abs(z0 - s.t) <= 0.2: z0 = s.t - 0.01          # seat on the board (KiCad copper/mask leaves < 0.2 mm)
        if abs(z1) <= 0.2 and z0 < 0: z1 = 0.01
        s.boxes.append([x0, y0, x1, y1, z0, z1, cat, ref, df40]); s.kept += 1
    def nominal_df40(s, ref):
        f = s.fps[ref]; m = re.search(r'DF40C-(\d+)(DS|DP)', f['lib']); n, ty = int(m.group(1)), m.group(2)
        L = (18.60 if ty == 'DS' else 17.52) + (n - 80) / 2 * 0.4; W = 3.38 if ty == 'DS' else 2.97; H = 1.44 if ty == 'DS' else 1.14
        p = s.pads[ref]; cx, cy = (p[0] + p[2]) / 2, (p[1] + p[3]) / 2
        lx, ly = (L, W) if p[2] - p[0] > p[3] - p[1] else (W, L)
        top = f['layer'] == 'F.Cu'; z0, z1 = (s.t, s.t + H) if top else (-H, 0.0)
        s.add(cx - lx / 2, cy - ly / 2, cx + lx / 2, cy + ly / 2, z0, z1, 'conn', ref)
        s.nominal.append(f'{ref} DF40C-{n}{ty}: nominal {L:.2f} x {W:.2f} x {H:.2f} mm box (KiCad DF40C-80 model envelope scaled by pin count); no 3D model resolved')
    def nominal_crtyd(s, ref, h, shrink=0.25, cat=None, use_pads=False):
        f = s.fps[ref]
        if use_pads or not f['crtyd']: r = list(s.pads[ref]); shrink = 0.0; src = 'pad extent'
        else:
            xs = [p[0] for p in f['crtyd']]; ys = [p[1] for p in f['crtyd']]; r = [min(xs), min(ys), max(xs), max(ys)]; src = f'courtyard less {shrink} mm'
        top = f['layer'] == 'F.Cu'; z0, z1 = (s.t, s.t + h) if top else (-h, 0.0)
        s.add(r[0] + shrink, r[1] + shrink, r[2] - shrink, r[3] - shrink, z0, z1, cat or kind(ref, f['val']), ref)
        s.nominal.append(f'{ref} ({f["lib"].split(":")[-1]}): nominal {h:.2f} mm tall box on the {src}; no 3D model resolved')
    def auto_nominal(s):
        for ref in list(s.nomodel):
            lib = s.fps[ref]['lib']
            if 'DF40C' in lib: s.nominal_df40(ref); continue
            for k, h in H_NOM:
                if k in lib:
                    f = s.fps[ref]; xs = [p[0] for p in f['crtyd']]; ys = [p[1] for p in f['crtyd']]
                    w, d = max(xs) - min(xs) - 0.5, max(ys) - min(ys) - 0.5
                    if keep_default(ref, h, w * d, min(w, d)): s.nominal_crtyd(ref, h)
                    else: s.dropped += 1
                    break

# ---------- placement ----------
class Place:
    def __init__(s, board, tr=None, dz=0.0, label=None, sub=''):
        s.b, s.tr, s.dz = board, tr or (lambda x, y: (x, y)), dz; s.label = label or board.name; s.sub = sub
    def pts(s, a): return np.array([s.tr(x, y) for x, y in a])
    def rect(s, x0, y0, x1, y1):
        a, b = s.tr(x0, y0), s.tr(x1, y1); return min(a[0], b[0]), min(a[1], b[1]), max(a[0], b[0]), max(a[1], b[1])
    def elems(s):
        """list of dicts in the placement's world frame (native-style x/y, z up)"""
        b = s.b; E = [dict(type='poly', pts=s.pts(b.outline), holes=[(s.tr(*c), d) for c, d in b.holes], loops=[s.pts(l) for l in b.loops],
                           z0=s.dz, z1=s.dz + b.t, cat='board', ref='board', df40=None)]
        for x0, y0, x1, y1, z0, z1, cat, ref, df in b.boxes:
            r = s.rect(x0, y0, x1, y1); E.append(dict(type='box', r=r, z0=z0 + s.dz, z1=z1 + s.dz, cat=cat, ref=ref, df40='DF40' in b.fps[ref]['lib'] if ref in b.fps else False))
        return E

def to_out(E, cx, cy, zoff=0.0):
    """world native-style -> output frame (x - cx, -(y - cy), z + zoff)"""
    O = []
    for e in E:
        e = dict(e)
        if e['type'] == 'box':
            x0, y0, x1, y1 = e['r']; e['lo'] = np.array([x0 - cx, -(y1 - cy), e['z0'] + zoff]); e['hi'] = np.array([x1 - cx, -(y0 - cy), e['z1'] + zoff])
        else:
            f = lambda P: np.array([(x - cx, -(y - cy)) for x, y in P])
            e['pts'] = f(e['pts']); e['loops'] = [f(l) for l in e.get('loops', [])]; e['holes'] = [((c[0] - cx, -(c[1] - cy)), d) for c, d in e.get('holes', [])]
            if 'pts2' in e: e['pts2'] = f(e['pts2'])
            e['z0'] += zoff; e['z1'] += zoff
        O.append(e)
    return O

# ---------- solids ----------
def circ(c, d, n=48): return np.array([(c[0] + d / 2 * math.cos(2 * math.pi * i / n), c[1] + d / 2 * math.sin(2 * math.pi * i / n)) for i in range(n)])
def solid(e):
    if e['type'] == 'box': return mf.Manifold.cube(tuple((e['hi'] - e['lo']).tolist())).translate(tuple(e['lo'].tolist()))
    cs = mf.CrossSection([e['pts']] + list(e.get('loops', [])) + [circ(c, d) for c, d in e.get('holes', [])], mf.FillRule.EvenOdd)
    if 'pts2' in e: cs = mf.CrossSection([e['pts']], mf.FillRule.EvenOdd) ^ mf.CrossSection([e['pts2']], mf.FillRule.EvenOdd)
    return mf.Manifold.extrude(cs, e['z1'] - e['z0']).translate((0, 0, e['z0']))
def tm(m):
    mesh = m.to_mesh(); return trimesh.Trimesh(np.array(mesh.vert_properties)[:, :3], np.array(mesh.tri_verts), process=False)
def write_glb(name, E):
    scene = trimesh.Scene(); by = {}
    for e in E: by.setdefault(e['cat'], []).append(solid(e))
    for c, ms in by.items():
        mm = tm(mf.Manifold.batch_boolean(ms, mf.OpType.Add))
        mm.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(name=c, baseColorFactor=list(COL.get(c, (128, 128, 128))) + [255], metallicFactor=0.0, roughnessFactor=0.8))
        scene.add_geometry(mm, node_name=c, geom_name=c)
    scene.export(OUT + 'models/' + name + '.glb')
def write_stl(name, E):
    fused = mf.Manifold.batch_boolean([solid(e) for e in E], mf.OpType.Add)
    t = tm(fused); t.export(OUT + 'downloads/' + name + '.stl')
    b = t.bounds
    return dict(size=[round(float(v), 2) for v in b[1] - b[0]], bounds=[[round(float(v), 2) for v in b[0]], [round(float(v), 2) for v in b[1]]],
                volume_cm3=round(float(fused.volume()) / 1000, 3), watertight=bool(t.is_watertight), bodies=len(fused.decompose()), triangles=int(len(t.faces)), genus=int(fused.genus()))
def write_step(name, E):
    import cadquery as cq
    shapes = []
    def prism(pts, z0, z1): return cq.Workplane('XY', origin=(0, 0, z0)).polyline([tuple(map(float, p)) for p in pts]).close().extrude(z1 - z0)
    for e in E:
        if e['type'] == 'box':
            sz = e['hi'] - e['lo']; shapes.append(cq.Solid.makeBox(*map(float, sz), pnt=cq.Vector(*map(float, e['lo']))))
        else:
            w = prism(e['pts'], e['z0'], e['z1'])
            if 'pts2' in e: w = w.intersect(prism(e['pts2'], e['z0'], e['z1']))
            for l in e.get('loops', []): w = w.cut(prism(l, e['z0'] - 1, e['z1'] + 1))
            for c, d in e.get('holes', []): w = w.cut(cq.Workplane('XY', origin=(float(c[0]), float(c[1]), e['z0'] - 1)).circle(d / 2).extrude(e['z1'] - e['z0'] + 2))
            shapes += w.vals() if 'pts2' in e else [w.val()]
    fused = shapes[0].fuse(*shapes[1:]).clean() if len(shapes) > 1 else shapes[0]
    ns = len(fused.Solids()); ok = bool(fused.isValid())
    cq.exporters.export(cq.Workplane().add(fused), OUT + 'downloads/' + name + '.step')
    bb = fused.BoundingBox()
    return dict(step_solids=ns, step_valid=ok, step_size=[round(bb.xlen, 2), round(bb.ylen, 2), round(bb.zlen, 2)], step_volume_cm3=round(fused.Volume() / 1000, 3))
def bounds(E):
    lo = np.full(3, 1e9); hi = np.full(3, -1e9)
    for e in E:
        if e['type'] == 'box': a, b = e['lo'], e['hi']
        else: a = np.array([*e['pts'].min(0), e['z0']]); b = np.array([*e['pts'].max(0), e['z1']])
        lo = np.minimum(lo, a); hi = np.maximum(hi, b)
    return lo, hi
def emit(name, E):
    t0 = time.time(); info = write_stl(name, E); info.update(write_step(name, E)); info['file'] = name
    print(f'{name}: {info["size"]} wt={info["watertight"]} bodies={info["bodies"]} step_solids={info["step_solids"]} valid={info["step_valid"]} step_size={info["step_size"]} vol {info["volume_cm3"]}/{info["step_volume_cm3"]} ({time.time() - t0:.0f}s)', flush=True)
    return info
