import json, os, shutil, zipfile
R = os.path.expanduser('~/kicad_work/print_models_2026-11-11/'); B = R + 'build/'
DECK = '/Users/howardwang/Desktop/Rice Research/FPGA PCB/2026-11-10_FPGA_Work/03_Weekly_Presentation_V1/assets/print-models/'
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
vA = f'Frontend 8L V3 ({ed["fe"]}) · FPGA-LDO A layout V12 ({ed["ldoa"]})'
vB = f'Frontend 8L V3 ({ed["fe"]}) · router and LDO board layouts V2 ({ed["router"]})'
models = [
 entry('stack', 'Option A head stack', HEAD, vA, 'Frontend 8L V3 + FPGA-LDO A V12 + 4 ASIC boards + HDMI plug', 'Option_A_Head_Stack_V12',
       f'Saved CAD outlines, 1.5 mm DF40C mated gaps, ASIC boards drawn 0.8 mm thick, nominal plug. Without the plug: {x(a["size_without_plug"])} mm. In the model the ASIC side-pin tails reach 0.2 mm past the 1.5 mm gap.', parts=a['parts']),
 entry('stack_solid', 'Option A stack, printable block', HEAD, vA, 'Same stack with the gaps between boards filled, prints as one piece', 'Option_A_Head_Stack_V12_Solid',
       'Gaps between mated boards filled. Same outside size as the Option A stack.'),
 entry('stack_b', 'Option B head stack', HEAD, vB, 'Frontend 8L V3 + LDO board V2 + router V2 + 4 ASIC boards + HDMI plug', 'Option_B_Head_Stack_V2',
       f'Arranged as the fit test (router on the LDO board J5, ASIC boards on the router), 1.5 mm DF40C mated gaps, ASIC boards drawn 0.8 mm thick, nominal plug. Without the plug: {x(b["size_without_plug"])} mm. In the model the ASIC side-pin tails reach 0.2 mm past the 1.5 mm gap.', parts=b['parts']),
 entry('stack_b_solid', 'Option B stack, printable block', HEAD, vB, 'Same stack with the gaps between boards filled, prints as one piece', 'Option_B_Head_Stack_V2_Solid',
       'Gaps between mated boards filled. Same outside size as the Option B stack.'),
 entry('frontend', 'Frontend FPGA Board', HEAD, f'8L V3 · {ed["fe"]}', '8L V3 · top of the stack', 'Frontend_8L_V3',
       f'8L V3. Board {x(M["frontend"]["board_mm"])} mm; the Micro-HDMI socket overhangs the edge by 0.62 mm. J1/J2 and the five power modules are nominal boxes (no 3D model).'),
 entry('fpgaldo', 'FPGA-LDO Option A', HEAD, f'Layout V12 · {ed["ldoa"]}', 'Layout V12 · under the Frontend', 'FPGA_LDO_A_V12',
       f'Layout V12. Board {x(M["fpgaldo"]["board_mm"])} mm. Part boxes from the KiCad 3D bodies.'),
 entry('router_b', 'FPGA-LDO Option B router', HEAD, f'Layout V2 · {ed["router"]}', 'Layout V2 · carries the ASIC boards', 'FPGA_LDO_B_Router_V2',
       f'Layout V2. Board {x(M["router_b"]["board_mm"])} mm. J5 (120 pins) is a nominal box (no 3D model).'),
 entry('ldo_b', 'FPGA-LDO Option B LDO board', HEAD, f'Layout V2 · {ed["ldob"]}', 'Layout V2 · under the Frontend and router', 'FPGA_LDO_B_LDO_Board_V2',
       f'Layout V2. Board {x(M["ldo_b"]["board_mm"])} mm. J5 (120 pins) is a nominal box (no 3D model).'),
 entry('asic', 'ASIC board', HEAD, 'PCB-5 · 0.8 mm fit profile', 'PCB-5 · four per stack', 'ASIC_PCB5_0p8mm',
       'PCB-5 outline 21.97 × 17.03 mm, drawn 0.8 mm thick (the saved file says 1.6 mm). Dies and both DF40 connectors are nominal boxes; the side pin is taken from its KiCad model.'),
 entry('hdmi', 'HDMI Extension Board', BENCH, f'V37 · {ed["hdmi"]}', 'V37 · by the PC', 'HDMI_Extension_V37',
       f'V37. Board {x(M["hdmi"]["board_mm"][:2])} mm with the two 3.2 mm holes MH2/MH3. The separate XEM8310 module is not included.'),
 keep['directldo'], keep['ldoexisting']]
ZIP = 'downloads/FPGA_Head_Fit_Models_2026-11-11_V2.zip'
json.dump({'models': models, 'zip': ZIP}, open(B + 'models.json', 'w'), indent=2, ensure_ascii=False)
notes = """Printable actual-size models, 11 November 2026 meeting set V2 (built 10 Nov 2026)
Units: millimetres. Print at 100 %. STL for printing, STEP for CAD. Every file is one closed solid.
Frame: X right, Y toward the reference board's north edge (KiCad 3D view), Z up.
Simplified fit envelopes: board outline at its thickness plus boxes around the parts that set the outer size.
Connector gaps (1.5 mm Hirose DF40C mated height), the Micro-HDMI plug (11 x 5.5 x 20 mm, 4.5 mm cable stub)
and the bodies of parts without a 3D model are nominal. ASIC boards are drawn 0.8 mm thick. No tolerances.
Physical fit is not verified. See README_2026-11-11.md beside the viewer for sources and findings.
"""
open(B + 'downloads/MODEL_NOTES.txt', 'w').write(notes)
if os.path.exists(B + ZIP): os.remove(B + ZIP)
with zipfile.ZipFile(B + ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for m in models:
        for k in ('stl', 'step'): z.write(B + m[k], os.path.basename(m[k]))
    z.write(B + 'downloads/MODEL_NOTES.txt', 'MODEL_NOTES.txt')
print(len(models), 'models;', len(zipfile.ZipFile(B + ZIP).namelist()), 'files in zip', os.path.getsize(B + ZIP))
for m in models: print(m['key'], '|', m['name'], '|', m['where'], '|', os.path.basename(m['stl']), os.path.basename(m['step']), '|', m['size'], '|', m['version'])
