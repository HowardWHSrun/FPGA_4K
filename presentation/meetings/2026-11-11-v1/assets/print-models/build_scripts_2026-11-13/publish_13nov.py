#!/usr/bin/env python3
"""publish_13nov.py DECK: print set V3 + 3D system overview on Frontend 14L V7 / FPGA-LDO A V16 / ASIC V7 (13 Nov 2026)."""
import sys, os, json, shutil, glob
D = sys.argv[1]; N = os.path.expanduser('~/kicad_work/print_models_2026-11-13/'); B = N + 'build/'; PM = D + '/assets/print-models/'
def edit(p, pairs):
    s = open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (os.path.basename(p), a[:90]); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='\n').write(s)
for f in glob.glob(B + 'models/*.glb'): shutil.copy2(f, PM + 'models/')
for f in glob.glob(B + 'downloads/*'): shutil.copy2(f, PM + 'downloads/')
shutil.copy2(B + 'models.json', PM + 'models.json')
os.makedirs(PM + 'build_scripts_2026-11-13', exist_ok=True)
for f in glob.glob(N + 'scripts/*.py'): shutil.copy2(f, PM + 'build_scripts_2026-11-13/')
shutil.copy2(B + 'manifest.json', PM + 'build_scripts_2026-11-13/manifest.json')
edit(PM + 'viewer.js', [("models.json?v=20261111-v2", "models.json?v=20261113-v3")])
M = {m['key']: m for m in json.load(open(B + 'models.json'))['models']}
x = lambda k: ' × '.join('%.2f' % v for v in M[k]['size'])
edit(D + '/index.html', [
 ('Frontend 8L V3 + FPGA-LDO A V12 + 4 ASIC boards + HDMI plug · 24.12 × 78.64 × 15.17 mm', M['stack']['where'] + ' · ' + x('stack') + ' mm'),
 ('Same stack with the gaps between boards filled, prints as one piece · 24.12 × 78.64 × 15.17 mm', 'Same stack with the gaps between boards filled, prints as one piece · ' + x('stack_solid') + ' mm'),
 ('Frontend 8L V3 + LDO board V2 + router V2 + 4 ASIC boards + HDMI plug · 27.90 × 84.45 × 13.77 mm', M['stack_b']['where'] + ' · ' + x('stack_b') + ' mm'),
 ('Same stack with the gaps between boards filled, prints as one piece · 27.90 × 84.45 × 13.77 mm', 'Same stack with the gaps between boards filled, prints as one piece · ' + x('stack_b_solid') + ' mm'),
 ('8L V3 · top of the stack · 22.59 × 26.04 × 5.87 mm', M['frontend']['where'] + ' · ' + x('frontend') + ' mm'),
 ('Layout V12 · under the Frontend · 22.64 × 36.76 × 4.40 mm', M['fpgaldo']['where'] + ' · ' + x('fpgaldo') + ' mm'),
 ('PCB-5 · four per stack · 23.79 × 17.03 × 3.77 mm', 'V7 · four per stack · ' + x('asic') + ' mm'),
 ('print-models/downloads/Option_A_Head_Stack_V12_Solid.', 'print-models/downloads/Option_A_Head_Stack_V16_Solid.'),
 ('print-models/downloads/Option_A_Head_Stack_V12.', 'print-models/downloads/Option_A_Head_Stack_V16.'),
 ('print-models/downloads/Option_B_Head_Stack_V2_Solid.', 'print-models/downloads/Option_B_Head_Stack_V2_FE_V7_Solid.'),
 ('print-models/downloads/Option_B_Head_Stack_V2.', 'print-models/downloads/Option_B_Head_Stack_V2_FE_V7.'),
 ('print-models/downloads/Frontend_8L_V3.', 'print-models/downloads/Frontend_14L_V7.'),
 ('print-models/downloads/FPGA_LDO_A_V12.', 'print-models/downloads/FPGA_LDO_A_V16.'),
 ('print-models/downloads/ASIC_PCB5_0p8mm.', 'print-models/downloads/ASIC_Board_V7.'),
 ('print-models/downloads/FPGA_Head_Fit_Models_2026-11-11_V2.zip', 'print-models/downloads/FPGA_Head_Fit_Models_2026-11-13_V3.zip'),
 ('assets/overview-3d/index.html?embed=1&amp;v=asicv4', 'assets/overview-3d/index.html?embed=1&amp;v=v7')])
O = D + '/assets/overview-3d/'
edit(O + 'viewer.js', [("loader.loadAsync('assets/frontend-8l-v3.glb?v=14l'),loader.loadAsync('assets/fpga-ldo-a-v12.glb'),loader.loadAsync('assets/asic-bottom-v4-0p8mm.glb')",
                        "loader.loadAsync('assets/frontend-14l-v7.glb'),loader.loadAsync('assets/fpga-ldo-a-v16.glb'),loader.loadAsync('assets/asic-bottom-v7.glb')"),
                       ("loader.loadAsync('assets/asic-top-v4-0p8mm.glb')", "loader.loadAsync('assets/asic-top-v7.glb')"),
                       ("// ASIC boards V3 (drawn at the 0.8 mm the stack fit uses)", "// ASIC boards V7 (0.8 mm as saved; same outline and connector positions as V4)")])
edit(O + 'index.html', [('viewer.js?v=20261111-asicv4', 'viewer.js?v=20261113-v7')])
edit(O + 'board.html', [('board.js?v=20261111-asic4', 'board.js?v=20261113-v7')])
print('published print set V3 and 3D overview V7 into', D)
