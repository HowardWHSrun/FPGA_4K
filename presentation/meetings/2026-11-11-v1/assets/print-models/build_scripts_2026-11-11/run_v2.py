import datetime
from build_v2 import *
os.makedirs(OUT + 'models', exist_ok=True); os.makedirs(OUT + 'downloads', exist_ok=True)
WS = '/Users/howardwang/Desktop/Rice Research/FPGA PCB/2026-11-10_FPGA_Work/'
ORIG = {'fe': WS + '28_Artix_Frontend_8L_V3_Section2_HDMI_Cable_Pairs_V1/project/Artix_Frontend_8L_V3.kicad_pcb',
        'ldoa': WS + '22_FPGA_LDO_A_Layout_V12_JLC_Order_Prep/project/FPGA_LDO_A_Layout_V12.kicad_pcb',
        'router': WS + '23_FPGA_LDO_B_Fit_Test_V1_and_Layouts_V2/router/FPGA_LDO_B_Router_Layout_V2.kicad_pcb',
        'ldob': WS + '23_FPGA_LDO_B_Fit_Test_V1_and_Layouts_V2/ldo_board/FPGA_LDO_B_LDO_Layout_V2.kicad_pcb',
        'asic': WS + '03_Weekly_Presentation_V1/assets/layout-viewer/asic/ASIC_Board_PCB5.kicad_pcb',
        'hdmi': WS + '12_HDMI_Extension_Board_V37_U700_Ground_Copper/project/HDMI_Extension_Board_V37.kicad_pcb'}
def src(k): return SRC + k + '/' + os.path.basename(ORIG[k])
def edited(k):
    d = datetime.datetime.fromtimestamp(os.path.getmtime(src(k)))   # rsync -a kept the saved file's mtime
    return f'edited {d.day} {d.strftime("%b %Y, %H:%M")} CST'

fe = Board('frontend', 'Frontend FPGA Board', src('fe'), 'glb_fe.glb'); fe.auto_nominal()
ldoa = Board('fpgaldo', 'FPGA-LDO Option A', src('ldoa'), 'glb_ldoa.glb'); ldoa.auto_nominal()
router = Board('router_b', 'FPGA-LDO Option B router', src('router'), 'glb_router.glb'); router.auto_nominal()
ldob = Board('ldo_b', 'FPGA-LDO Option B LDO board', src('ldob'), 'glb_ldob.glb'); ldob.auto_nominal()
hdmi = Board('hdmi', 'HDMI Extension Board', src('hdmi'), 'glb_hdmi.glb'); hdmi.auto_nominal()
asic = Board('asic', 'ASIC board', src('asic'), 'glb_asic.glb', t_use=0.8); asic.auto_nominal()
# ASIC specifics: side pin J1 as body / lead / tail (shape as 23_.../fit/fit_b_v2.py, z extent from the KiCad model), dies as nominal 0.5 mm boxes
j1 = [b for b in asic.boxes if b[7] == 'J1'][0]; asic.boxes.remove(j1); asic.kept -= 1
jx, jy = asic.fps['J1']['at'][:2]; t = asic.t; pin_top = j1[5] - t; pin_bot = j1[4] - t
assert abs(asic.fps['J1']['at'][2]) < 1e-6
for tag, (lx0, lx1, hw, za, zb) in (('body', (0.25, 1.25, 0.5, 0.0, pin_top)), ('lead', (-0.15, j1[2] - jx, 0.15, 0.0, 0.79)), ('tail', (-0.15, 0.15, 0.15, pin_bot, 0.02))):
    asic.boxes.append([jx + lx0, jy - hw, jx + lx1, jy + hw, t + za - (0.01 if za == 0 else 0), t + zb, 'conn', 'J1 ' + tag, None]); asic.kept += 1
asic.fps['J1 body'] = asic.fps['J1 lead'] = asic.fps['J1 tail'] = asic.fps['J1']
print('ASIC pin J1 GLB box', [round(v, 2) for v in j1[:6]], 'fp at', jx, jy, 'top', round(pin_top, 2), 'bottom', round(pin_bot, 2))
for r in ('U01_BCD1', 'U01_BCD2'): asic.nominal_crtyd(r, 0.5, cat='ic', use_pads=True)
asic.notes.append('Board drawn 0.80 mm thick (deck fit profile); the saved PCB-5 file says %.2f mm.' % asic.t_file)

for b in (fe, ldoa, router, ldob, asic, hdmi):
    big = [(r, b.fps[r]['lib'].split(':')[-1]) for r in b.nomodel if r not in [x[7] for x in b.boxes] and not r.startswith(('TP', 'FID')) and b.fps[r]['crtyd']]
    print(f'--- {b.key}: outline {b.x1 - b.x0:.2f} x {b.y1 - b.y0:.2f}, t file {b.t_file} used {b.t}, holes {len(b.holes)}, cut-outs {len(b.loops)}, boxes {len(b.boxes)}, small parts left out {b.dropped}')
    print('    nominal:', b.nominal); print('    no model and not drawn:', big)

gbx = glb_boxes(GLB + 'glb_fe.glb')
for r in ('U5', 'U6', 'C4', 'U14', 'U1', 'C10'):
    f = fe.fps[r]; xs = [p[0] for p in f['crtyd']]; ys = [p[1] for p in f['crtyd']]; lo, hi = gbx[r]
    print('  crtyd check', r, f['layer'], 'crtyd centre', round((min(xs) + max(xs)) / 2, 2), round((min(ys) + max(ys)) / 2, 2), 'GLB centre', round((lo[0] + hi[0]) / 2, 2), round((lo[2] + hi[2]) / 2, 2))
manifest = {'generated': time.strftime('%Y-%m-%d %H:%M CST'), 'units': 'mm', 'models': {}, 'sources': {k: dict(path=ORIG[k].replace(WS, '2026-11-10_FPGA_Work/'), sha256=sha(src(k)), edited=edited(k)) for k in ORIG}}

def single(b, fname):
    E = to_out(Place(b).elems(), b.cx, b.cy); info = emit(fname, E); write_glb(fname, E)
    info.update(board_mm=[round(b.x1 - b.x0, 2), round(b.y1 - b.y0, 2), round(b.t, 3)], boxes=len(b.boxes), small_parts_left_out=b.dropped, nominal=b.nominal, notes=b.notes)
    manifest['models'][b.key] = info; return info
S = {}
S['frontend'] = single(fe, 'Frontend_8L_V3')
S['fpgaldo'] = single(ldoa, 'FPGA_LDO_A_V12')
S['router_b'] = single(router, 'FPGA_LDO_B_Router_V2')
S['ldo_b'] = single(ldob, 'FPGA_LDO_B_LDO_Board_V2')
S['asic'] = single(asic, 'ASIC_PCB5_0p8mm')
S['hdmi'] = single(hdmi, 'HDMI_Extension_V37')

# ================= stacks =================
def rot180(X, Y): return lambda x, y: (X - x, Y - y)
def pc(b, ref): p = b.pads[ref]; return (p[0] + p[2]) / 2, (p[1] + p[3]) / 2
PLUG = dict(w=11.0, h=5.5, l=20.0, cable=4.5, stub=15.0, centre_above_board=1.5)
def plug_place(fe_place):
    j3 = [b for b in fe.boxes if b[7] == 'J3'][0]; cx = (j3[0] + j3[2]) / 2; mouth = j3[1]; zc = fe.t + PLUG['centre_above_board']
    class P: pass
    p = P(); p.label = 'Micro-HDMI cable plug'; p.sub = 'nominal size, not a vendor model'; p.b = None
    def elems():
        E = []
        for (hw, y0, y1, hh) in ((PLUG['w'] / 2, mouth - PLUG['l'], mouth + 0.02, PLUG['h'] / 2), (PLUG['cable'] / 2, mouth - PLUG['l'] - PLUG['stub'], mouth - PLUG['l'] + 0.02, PLUG['cable'] / 2)):
            E.append(dict(type='box', r=fe_place.rect(cx - hw, y0, cx + hw, y1), z0=fe_place.dz + zc - hh, z1=fe_place.dz + zc + hh, cat='plug', ref='plug', df40=False))
        return E
    p.elems = elems; return p

def fills(pairs):
    E = []
    for A, B, z0, z1 in pairs:
        E.append(dict(type='poly', pts=A.pts(A.b.outline), pts2=B.pts(B.b.outline), z0=z0, z1=z1, cat='fill', ref='fill', df40=False))
    return E

def overlaps(places, cx, cy):
    G = [to_out(p.elems(), cx, cy) for p in places]; hits = []
    def bb(e): return (e['lo'], e['hi']) if e['type'] == 'box' else (np.array([*e['pts'].min(0), e['z0']]), np.array([*e['pts'].max(0), e['z1']]))
    for i in range(len(G)):
        for j in range(i + 1, len(G)):
            for a in G[i]:
                for b in G[j]:
                    (la, ha), (lb, hb) = bb(a), bb(b); ov = np.minimum(ha, hb) - np.maximum(la, lb)
                    if not (ov > 0.02).all(): continue
                    if a['df40'] and b['df40'] and abs((la + ha - lb - hb)[:2]).max() / 2 < 0.5: continue      # mated pair
                    m = solid(a) ^ solid(b); v = m.volume()
                    if v < 1e-3: continue
                    q = m.bounding_box(); d = [round(q[3] - q[0], 2), round(q[4] - q[1], 2), round(q[5] - q[2], 2)]
                    kindh = 'interference'
                    if 'plug' in (a['ref'], b['ref']) and 'J3' in (a['ref'], b['ref']): kindh = 'intended: plug face seated 0.02 mm into the receptacle box so the model is one solid'
                    elif (a['df40'] or b['df40']) and 'board' in (a['ref'], b['ref']) and d[2] <= 0.05: kindh = 'model artefact: KiCad DF40C-80DS body is drawn 1.44 mm tall starting 0.09 mm off the board, 0.03 mm more than the 1.5 mm mated gap'
                    hits.append(dict(a=f'{places[i].label} {a["ref"]}', b=f'{places[j].label} {b["ref"]}', overlap_xyz_mm=d, volume_mm3=round(v, 3), kind=kindh))
    return hits

def stack(tag, fname, places, fillpairs, ref, partprefix, title):
    cx, cy = ref.cx, ref.cy
    E = [e for p in places for e in to_out(p.elems(), cx, cy)]
    Enp = [e for p in places if p.b is not None for e in to_out(p.elems(), cx, cy)]
    lo, hi = bounds(Enp); noplug = [round(float(v), 2) for v in hi - lo]
    info = emit(fname, E); info['size_without_plug'] = noplug
    parts = []
    for i, p in enumerate(places):
        n = f'{partprefix}_part_{i}'; write_glb(n, to_out(p.elems(), cx, cy)); parts.append(dict(glb=f'models/{n}.glb', name=p.label, sub=p.sub))
    info['parts'] = parts
    info['levels_z_mm'] = {p.label: [round(p.dz, 3), round(p.dz + p.b.t, 3)] for p in places if p.b is not None}
    info['overlaps'] = overlaps(places, cx, cy)
    Ef = E + to_out(fills(fillpairs), cx, cy)
    solid_info = emit(fname + '_Solid', Ef); write_glb(fname + '_Solid', Ef)
    manifest['models'][tag] = info; manifest['models'][tag + '_solid'] = solid_info
    print('  without plug', noplug, 'levels', info['levels_z_mm']); print('  overlaps:'); [print('    ', h['a'], '|', h['b'], h['overlap_xyz_mm'], h['kind'][:14]) for h in info['overlaps']]
    return info, solid_info

A_ = asic.t
# ---- Option A: FPGA-LDO A V12 at z 0 ----
L = ldoa.t
fj, lj = pc(fe, 'J1'), pc(ldoa, 'J1'); fj2, lj2 = pc(fe, 'J2'), pc(ldoa, 'J2')
trF = rot180(fj[0] + lj[0], fj[1] + lj[1]); e2 = np.subtract(trF(*fj2), lj2); print('Option A: Frontend J2 lands on FPGA-LDO J2 within', np.round(e2, 3))
aj, l3 = pc(asic, 'J3'), pc(ldoa, 'J3'); trA = rot180(aj[0] + l3[0], aj[1] + l3[1])
print('Option A: ASIC J3 centre', np.round(aj, 3), 'J4', np.round(pc(asic, 'J4'), 3), '-> LDO J3', np.round(l3, 3), 'J4', np.round(pc(ldoa, 'J4'), 3))
pL = Place(ldoa, None, 0.0, 'FPGA-LDO Option A', 'Layout V12')
pF = Place(fe, trF, L + GAP, 'Frontend FPGA Board', '8L V3 · on the FPGA-LDO J1/J2')
u1 = Place(asic, trA, L + GAP, 'ASIC board 1', 'above the FPGA-LDO J3'); u2 = Place(asic, trA, L + GAP + A_ + GAP, 'ASIC board 2', 'above ASIC board 1')
d1 = Place(asic, trA, -GAP - A_, 'ASIC board 3', 'below the FPGA-LDO J4'); d2 = Place(asic, trA, -GAP - A_ - GAP - A_, 'ASIC board 4', 'below ASIC board 3')
placesA = [pL, pF, u1, u2, d1, d2, plug_place(pF)]
fillA = [(pL, pF, L, L + GAP), (pL, u1, L, L + GAP), (u1, u2, u1.dz + A_, u2.dz), (d1, pL, d1.dz + A_, 0.0), (d2, d1, d2.dz + A_, d1.dz)]
SA = stack('stack', 'Option_A_Head_Stack_V12', placesA, fillA, ldoa, 'Option_A_V12', 'Option A head stack')

# ---- Option B: LDO board V2 at z 0, arrangement of 23_.../fit/fit_b.py ----
tL, tR = ldob.t, router.t
lj = pc(ldob, 'J1'); trFb = rot180(fj[0] + lj[0], fj[1] + lj[1]); print('Option B: Frontend J2 lands on LDO board J2 within', np.round(np.subtract(trFb(*fj2), pc(ldob, 'J2')), 3))
print('Option B: J5 router', np.round(pc(router, 'J5'), 3), 'LDO board', np.round(pc(ldob, 'J5'), 3))
r3 = pc(router, 'J3'); trAb = rot180(aj[0] + r3[0], aj[1] + r3[1])
zR = tL + GAP
qL = Place(ldob, None, 0.0, 'FPGA-LDO Option B LDO board', 'Layout V2')
qR = Place(router, None, zR, 'FPGA-LDO Option B router', 'Layout V2 · on the LDO board J5')
qF = Place(fe, trFb, tL + GAP, 'Frontend FPGA Board', '8L V3 · on the LDO board J1/J2')
v1 = Place(asic, trAb, zR + tR + GAP, 'ASIC board 1', 'above the router J3'); v2 = Place(asic, trAb, zR + tR + GAP + A_ + GAP, 'ASIC board 2', 'above ASIC board 1')
w1 = Place(asic, trAb, zR - GAP - A_, 'ASIC board 3', 'below the router J4'); w2 = Place(asic, trAb, zR - GAP - A_ - GAP - A_, 'ASIC board 4', 'below ASIC board 3')
placesB = [qL, qR, qF, v1, v2, w1, w2, plug_place(qF)]
fillB = [(qL, qF, tL, tL + GAP), (qL, qR, tL, zR), (qR, v1, zR + tR, v1.dz), (v1, v2, v1.dz + A_, v2.dz), (w1, qR, w1.dz + A_, zR), (w2, w1, w2.dz + A_, w1.dz)]
SB = stack('stack_b', 'Option_B_Head_Stack_V2', placesB, fillB, ldob, 'Option_B_V2', 'Option B head stack')
manifest['plug_nominal_mm'] = PLUG; manifest['df40_mated_gap_mm'] = GAP
json.dump(manifest, open(OUT + 'manifest.json', 'w'), indent=1)
json.dump({'edited': {k: edited(k) for k in ORIG}}, open(OUT + 'edited.json', 'w'))
