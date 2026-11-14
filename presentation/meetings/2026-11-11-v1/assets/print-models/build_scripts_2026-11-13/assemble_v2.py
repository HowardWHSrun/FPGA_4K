import json, os, shutil, zipfile
R = os.path.expanduser('~/kicad_work/print_models_2026-11-13/'); B = R + 'build/'
DECK = '/Users/howardwang/kicad_work/site/FPGA_4K_headcad/presentation/meetings/2026-11-11-v1/assets/print-models/'
M = json.load(open(B + 'manifest.json'))['models']; ed = json.load(open(B + 'edited.json'))['edited']
old = json.load(open(DECK + 'models.json'))
keep = {m['key']: m for m in old['models'] if m['key'] in ('directldo', 'ldoexisting')}
for m in keep.values():
    for k in ('glb', 'stl', 'step'): shutil.copy2(DECK + m[k], B + m[k])
f = lambda v: f'{v:.2f}'
def x(s): return ' × '.join(f(v) for v in s)
def entry(key, name, group, version, where, file, note, parts=None, glb=True):
    i = M[key]
    return dict(key=key, name=name, group=group, version=version, where=where, glb=None if parts else f'models/{file}.glb',
                stl=f'downloads/{file}.stl', step=f'downloads/{file}.step', size=i['size'], note=note, parts=parts)
HEAD, BENCH = 'On the head', 'Bench (not on the head)'
a, b = M['stack'], M['stack_b']
vA = f'Frontend 14 layers V7 ({ed["fe"]}) · FPGA-LDO A layout V16 ({ed["ldoa"]}) · ASIC boards V7 ({ed["asic"]})'
vB = f'Frontend 14 layers V7 ({ed["fe"]}) · router and LDO board layouts V2 ({ed["router"]}) · ASIC boards V7 ({ed["asic"]})'
models = [
 entry('stack', 'Option A head stack', HEAD, vA, 'Frontend 14L V7 + FPGA-LDO A V16 + 4 ASIC boards V7 + HDMI plug', 'Option_A_Head_Stack_V16',
       f'Saved CAD outlines, 1.5 mm DF40C mated gaps, 0.8 mm ASIC boards, nominal plug. Without the plug: {x(a["size_without_plug"])} mm. No part clashes (the ASIC side pin J1 is not fitted).', parts=a['parts']),
 entry('stack_solid', 'Option A stack, printable block', HEAD, vA, 'Same stack with the gaps between boards filled, prints as one piece', 'Option_A_Head_Stack_V16_Solid',
       'Gaps between mated boards filled. Same outside size as the Option A stack.'),
 entry('stack_b', 'Option B head stack', HEAD, vB, 'Frontend 14L V7 + LDO board V2 + router V2 + 4 ASIC boards V7 + HDMI plug', 'Option_B_Head_Stack_V2_FE_V7',
       f'Arranged as the fit test (router on the LDO board J5, ASIC boards on the router), 1.5 mm DF40C mated gaps, 0.8 mm ASIC boards, nominal plug. Without the plug: {x(b["size_without_plug"])} mm. Option B is on hold.', parts=b['parts']),
 entry('stack_b_solid', 'Option B stack, printable block', HEAD, vB, 'Same stack with the gaps between boards filled, prints as one piece', 'Option_B_Head_Stack_V2_FE_V7_Solid',
       'Gaps between mated boards filled. Same outside size as the Option B stack.'),
 entry('frontend', 'Frontend FPGA Board', HEAD, f'14 layers V7 · {ed["fe"]}', '14 layers V7 · top of the stack', 'Frontend_14L_V7',
       f'14 layers V7. Board {x(M["frontend"]["board_mm"])} mm; the Micro-HDMI socket overhangs the edge. C4 and C59 are not fitted. J1/J2 and the power modules without a model are nominal boxes.'),
 entry('fpgaldo', 'FPGA-LDO Option A', HEAD, f'Layout V16 · {ed["ldoa"]}', 'Layout V16 · under the Frontend', 'FPGA_LDO_A_V16',
       f'Layout V16. Board {x(M["fpgaldo"]["board_mm"])} mm. Part boxes from the KiCad 3D bodies.'),
 entry('router_b', 'FPGA-LDO Option B router', HEAD, f'Layout V2 · {ed["router"]}', 'Layout V2 · carries the ASIC boards', 'FPGA_LDO_B_Router_V2',
       f'Layout V2. Board {x(M["router_b"]["board_mm"])} mm. J5 (120 pins) is a nominal box (no 3D model).'),
 entry('ldo_b', 'FPGA-LDO Option B LDO board', HEAD, f'Layout V2 · {ed["ldob"]}', 'Layout V2 · under the Frontend and router', 'FPGA_LDO_B_LDO_Board_V2',
       f'Layout V2. Board {x(M["ldo_b"]["board_mm"])} mm. J5 (120 pins) is a nominal box (no 3D model).'),
 entry('asic', 'ASIC board', HEAD, f'V7 · {ed["asic"]}', 'V7 · four per stack (top and bottom boards share the outline)', 'ASIC_Board_V7',
       'V7 outline 21.97 × 17.03 mm, 0.8 mm thick as saved. Dies are nominal 0.5 mm boxes; DF40 connectors from the Hirose models. J1 is not fitted.'),
 entry('hdmi', 'HDMI Extension Board', BENCH, f'V37 · {ed["hdmi"]}', 'V37 · by the PC', 'HDMI_Extension_V37',
       f'V37. Board {x(M["hdmi"]["board_mm"][:2])} mm with the two 3.2 mm holes MH2/MH3. The separate XEM8310 module is not included.'),
 keep['directldo'], keep['ldoexisting']]
ZIP = 'downloads/FPGA_Head_Fit_Models_2026-11-13_V3.zip'
json.dump({'models': models, 'zip': ZIP}, open(B + 'models.json', 'w'), indent=2, ensure_ascii=False)
notes = """Printable actual-size models, set V3 (built 13 Nov 2026): Frontend 14L V7, FPGA-LDO A V16, ASIC boards V7
Units: millimetres. Print at 100 %. STL for printing, STEP for CAD. Every file is one closed solid.
Frame: X right, Y toward the reference board's north edge (KiCad 3D view), Z up.
Simplified fit envelopes: board outline at its thickness plus boxes around the parts that set the outer size.
Connector gaps (1.5 mm Hirose DF40C mated height), the Micro-HDMI plug (11 x 5.5 x 20 mm, 4.5 mm cable stub)
and the bodies of parts without a 3D model are nominal. ASIC boards are 0.8 mm thick. No tolerances.
Physical fit is not verified. See README_2026-11-13.md beside the viewer for sources and findings.
"""
open(B + 'downloads/MODEL_NOTES.txt', 'w').write(notes)
if os.path.exists(B + ZIP): os.remove(B + ZIP)
with zipfile.ZipFile(B + ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for m in models:
        for k in ('stl', 'step'): z.write(B + m[k], os.path.basename(m[k]))
    z.write(B + 'downloads/MODEL_NOTES.txt', 'MODEL_NOTES.txt')
print(len(models), 'models;', len(zipfile.ZipFile(B + ZIP).namelist()), 'files in zip', os.path.getsize(B + ZIP))
for m in models: print(m['key'], '|', m['name'], '|', m['where'], '|', os.path.basename(m['stl']), os.path.basename(m['step']), '|', m['size'], '|', m['version'])
