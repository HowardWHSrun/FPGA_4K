#!/usr/bin/env python3
"""Import the checked 2026-09-28 compact 50T review into the FPGA site.

Without --apply this prints a native-CAD reconciliation and changes no files.
Run only after the CAD owner freezes the source and names its final DRC JSON.
The previous 50T GTP-power revision stays at its existing dated URL.
"""

import argparse
import csv
import hashlib
import html
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import zipfile


REPO = Path(__file__).resolve().parents[1]
DEST = REPO / "hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact"
CLI = Path("/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli")
KICAD_PYTHON = Path("/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3")
STEM = "FPGA50T_8L_Unrouted"
CSV = REPO / "sources/engineering/2026-09-28/Micro_HDMI_50T_Grouped_Purchasing_Draft.csv"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_sexpr(source):
    tokens = re.findall(r'"(?:\\.|[^"\\])*"|[()]|[^\s()]+', source)
    root, stack = [], []
    for token in tokens:
        if token == "(":
            item = []
            if stack:
                stack[-1].append(item)
            else:
                root.append(item)
            stack.append(item)
        elif token == ")":
            if not stack:
                raise ValueError("Unbalanced KiCad expression")
            stack.pop()
        else:
            stack[-1].append(json.loads(token) if token.startswith('"') else token)
    if stack or len(root) != 1:
        raise ValueError("Invalid KiCad expression")
    return root[0]


def children(node, name):
    return [item for item in node if isinstance(item, list) and item and item[0] == name]


def child(node, name):
    return next(iter(children(node, name)), None)


def board_facts(path):
    board = parse_sexpr(path.read_text())
    if board[0] != "kicad_pcb":
        raise ValueError("Not a KiCad PCB")
    fps = children(board, "footprint")
    refs = {}
    for fp in fps:
        ref = next((p[2] for p in children(fp, "property") if p[1] == "Reference"), None)
        value = next((p[2] for p in children(fp, "property") if p[1] == "Value"), "")
        if not ref or ref in refs:
            raise ValueError(f"Missing or duplicate board reference: {ref}")
        at = child(fp, "at")
        layer = child(fp, "layer")
        model = child(fp, "model")
        refs[ref] = {
            "ref": ref, "value": value, "footprint": fp[1],
            "x": float(at[1]), "y": float(at[2]),
            "rotation": float(at[3]) if len(at) > 3 else 0,
            "back": bool(layer and layer[1] == "B.Cu"),
            "declared_model": model[1] if model else "",
            "pads": len(children(fp, "pad")), "node": fp,
        }
    edge = [n for n in board[1:] if isinstance(n, list) and n and
            n[0] in {"gr_line", "gr_rect"} and (child(n, "layer") or [None, None])[1] == "Edge.Cuts"]
    points = []
    for n in edge:
        for kind in ("start", "end"):
            point = child(n, kind)
            if point:
                points.append((float(point[1]), float(point[2])))
    if not points:
        raise ValueError("No Edge.Cuts outline")
    minx, maxx = min(p[0] for p in points), max(p[0] for p in points)
    miny, maxy = min(p[1] for p in points), max(p[1] for p in points)
    layer_table = child(board, "layers") or []
    copper = [n for n in layer_table if isinstance(n, list) and len(n) > 1 and
              isinstance(n[1], str) and n[1].endswith(".Cu")]
    net_names = {
        net[1] for fp in fps for pad in children(fp, "pad")
        if (net := child(pad, "net"))
    }
    return {
        "refs": refs, "footprints": len(fps),
        "pads": sum(fp["pads"] for fp in refs.values()),
        "segments": len(children(board, "segment")) + len(children(board, "arc")),
        "vias": len(children(board, "via")),
        "zones": len(children(board, "zone")),
        "embedded_footprint_zones": sum(len(children(fp, "zone")) for fp in fps),
        "nets": len(net_names) + 1,  # KiCad also numbers the empty net 0.
        "fpgaPads": refs["U1"]["pads"],
        "copperLayers": len(copper),
        "dimensions_mm": [round(maxx-minx, 4), round(maxy-miny, 4)],
        "center_mm": [round((minx+maxx)/2, 4), round((miny+maxy)/2, 4)],
    }


def export_bom(schematic, out, exclude_dnp):
    cmd = [str(CLI), "sch", "export", "bom",
           "--fields", "Reference,Value,Footprint,MPN,QUANTITY,DNP,EXCLUDE_FROM_BOARD",
           "--labels", "Refs,Value,Footprint,MPN,Qty,DNP,NoBoard",
           "-o", str(out)]
    if exclude_dnp:
        cmd.append("--exclude-dnp")
    subprocess.run(cmd + [str(schematic)], check=True, capture_output=True, text=True)
    return list(csv.DictReader(out.open(newline="")))


def native_ratsnest_count(board):
    code = (
        "import pcbnew,sys; "
        "b=pcbnew.LoadBoard(sys.argv[1]); "
        "print(b.GetConnectivity().GetUnconnectedCount(False))"
    )
    run = subprocess.run([str(KICAD_PYTHON), "-c", code, str(board)],
                         check=True, capture_output=True, text=True)
    return int(run.stdout.strip().splitlines()[-1])


def replace_netlist_source(source, replacement):
    """KiCad exports either XML or S-expression netlists across local versions."""
    xml, xml_count = re.subn(r"<source>[^<]*</source>",
                             lambda _: f"<source>{replacement}</source>", source, count=1)
    if xml_count:
        return xml
    sexpr, sexpr_count = re.subn(r'\(source "(?:\\.|[^"\\])*"\)',
                                 lambda _: f'(source "{replacement}")', source, count=1)
    if sexpr_count:
        return sexpr
    raise ValueError("KiCad netlist has no recognized source field")


def legacy_catalog():
    rows = list(csv.DictReader(CSV.open(newline="")))
    by_ref, by_mpn = {}, {}
    for row in rows:
        by_mpn.setdefault(row["cad_mpn"], row)
        for ref in row["references"].split("; "):
            by_ref[ref] = row
    return by_ref, by_mpn


def purchasing_rows(bom, board_refs):
    old_refs, old_mpns = legacy_catalog()
    new_sources = {
        "SiT9396AA-02A3-1800-125.000000": (
            "125 MHz LVDS GTP reference candidate",
            "Verify 125 MHz phase noise, 1.8 V rail noise and GTP input timing before ordering.",
            "https://www.sitime.com/parts/sit9396aa-02a3-1800-125000000"),
        "GRM188R61A106MAALD": (
            "GTP reference oscillator supply bypass",
            "Check effective capacitance at bias and placement beside Y2.",
            "https://www.murata.com/products/productdetail?partno=GRM188R61A106MAAL%23"),
        "APTD1608LSURCK": (
            "Red input-present test LED",
            "Raw input indication only; confirm supply voltage, current, brightness and polarity.",
            "https://www.kingbrightusa.com/images/catalog/SPEC/APTD1608LSURCK.pdf"),
        "APTD1608LZGCK": (
            "Green FPGA-DONE test LED",
            "DONE indication only; verify Q1 drive, current, brightness and polarity.",
            "https://www.kingbrightusa.com/images/catalog/SPEC/APTD1608LZGCK.pdf"),
        "DMN52D0U-7": (
            "FPGA-DONE LED low-side switch",
            "Verify 1.8 V gate drive and LED turn-on margin on the bench.",
            "https://www.diodes.com/datasheet/download/DMN52D0U.pdf"),
        "CRCW06033K30FKEA": (
            "Separate test-LED current limits",
            "Current and power depend on the unresolved cable input voltage.",
            "https://www.vishay.com/docs/20035/dcrcwe3.pdf"),
        "CRCW0402470KFKED": (
            "FPGA-DONE switch gate pull-down",
            "Check Q1 default-off behavior and DONE startup timing.",
            "https://www.vishay.com/docs/20035/dcrcwe3.pdf"),
    }
    groups = {}
    for item in bom:
        ref = item["Refs"].strip()
        if item["NoBoard"] or ref.startswith(("TP", "#")) or not item["Footprint"]:
            continue
        if ref not in board_refs:
            raise ValueError(f"Fitted BOM reference missing from PCB: {ref}")
        key = (item["Value"], item["MPN"], item["Footprint"])
        groups.setdefault(key, []).append(ref)
    rows = []
    for (value, mpn, footprint), refs in groups.items():
        precedent = old_mpns.get(mpn) or old_refs.get(refs[0], {})
        exact = bool(mpn) and "TBD" not in mpn
        function = precedent.get("functions", "")
        if any(ref in {"J5", "J7"} for ref in refs):
            function = "Two 60-contact ASIC mezzanine receptacles"
            status = "Mechanical approval pending"
            note = "Two rigid DF40T pairs need spacing, alignment and mate review before ordering."
            datasheet = "https://www.hirose.com/en/product/p/CL0684-4270-0-51"
        else:
            status = "Candidate exact code" if exact else "Exact code TBD"
            note = ("Check the exact ordering suffix, supplier stock and electrical fit before purchase."
                    if exact else "Select and verify an exact ordering part before purchase.")
            datasheet = old_mpns.get(mpn, {}).get("datasheet", "")
        if refs == ["U1"]:
            function, status = "XC7A50T FPGA", "Exact code TBD"
            note = "Select and qualify the full speed and temperature suffix."
            datasheet = "https://docs.amd.com/v/u/en-US/ds181_Artix_7_Data_Sheet"
        elif refs == ["J4"]:
            function, status = "Custom micro-HDMI cable interface", "Electrical review pending"
            note = ("The inherited CAD value/LINK_12V label is not a qualified supply; neither 12 V "
                    "nor the earlier 5 V proposal is approved. Confirm cable, contact current, "
                    "protection, voltage and receiver.")
            datasheet = "https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/productspecificationpdf/467/46765/PS-46765-003-001.pdf"
        elif refs == ["U6"]:
            function, datasheet = "Single-image configuration flash", "https://www.macronix.com/en-us/products/NOR-Flash/Serial-NOR-Flash/Pages/spec.aspx?p=MX25U3232F"
        elif refs == ["U8"]:
            function, datasheet = "Configuration level translator", "https://www.ti.com/product/TXU0304"
        elif refs == ["U9"]:
            function, datasheet = "Configuration rail supervisor", "https://www.ti.com/product/TLV803E"
        elif all(ref.startswith("D") for ref in refs):
            function = ("FPGA test LED indicators" if "LED" in (value + footprint).upper()
                        else "Board protection diode")
        elif not function:
            prefix = re.match(r"[A-Za-z]+", refs[0]).group()
            function = {"C": "Local bypass or signal coupling",
                        "R": "Bias, termination or LED current setting",
                        "L": "Power inductor", "Y": "GTP reference clock",
                        "J": "Board connector", "U": "Support IC",
                        "FB": "Ferrite bead"}.get(prefix, "Board component")
        if mpn in new_sources:
            function, note, datasheet = new_sources[mpn]
        rows.append({
            "quantity_per_board": len(refs), "references": "; ".join(refs),
            "value": value, "cad_mpn": mpn, "footprint": footprint,
            "functions": function, "purchase_status": status,
            "engineering_open_item": note, "datasheet": datasheet,
        })
    def key(row):
        ref = row["references"].split(";")[0]
        m = re.match(r"([A-Za-z]+)(\d+)", ref)
        return ({"U": 0, "J": 1, "Y": 2, "D": 3, "L": 4, "FB": 5, "C": 6, "R": 7}.get(m[1], 8), int(m[2]))
    return sorted(rows, key=key)


def render_rows(rows):
    out = []
    for row in rows:
        esc = lambda key: html.escape(str(row[key]), quote=True)
        source = (f'<a href="{esc("datasheet")}" target="_blank" rel="noopener">Source ↗</a>'
                  if row["datasheet"] else "Manufacturer source TBD")
        out.append(
            f'<tr data-qty="{row["quantity_per_board"]}" data-refs="{esc("references")}">'
            f'<td>{esc("functions")}</td><td><span class="part-mpn">{esc("cad_mpn")}</span>'
            f'<span class="part-value">{esc("value")}</span></td>'
            f'<td>{row["quantity_per_board"]}</td><td>{esc("references")}</td>'
            f'<td><span class="part-status">{esc("purchase_status")}</span>'
            f'{esc("engineering_open_item")}</td><td>{source}</td></tr>')
    return "\n".join(out)


def system_purchasing_rows(summary):
    rows = [
        {"additional_item": "Routing-board mating plugs", "quantity": "2",
         "current_candidate": "Hirose DF40TC-60DP-0.4V(51)",
         "open_item": "Pair with J5/J7 receptacles; rigid-board spacing, alignment and assembly approval pending.",
         "source_url": "https://www.hirose.com/en/product/p/CL0684-4281-0-51", "review_report": ""},
        {"additional_item": "Routing-board PCB and ASICs", "quantity": "1 routing board; 8 ASICs proposed; spares TBD",
         "current_candidate": "Matching routing design and ASIC ordering code TBD",
         "open_item": "The FPGA board BOM cannot specify the ASIC or routing-board parts; obtain the carrier design and approved ASIC code.",
         "source_url": "", "review_report": "reports/DF40T_Ground_Return_Review.md"},
        {"additional_item": "Custom micro-HDMI cable and strain relief", "quantity": "1 cable set; spares TBD",
         "current_candidate": "Custom 19-contact wiring, not standard HDMI",
         "open_item": "Confirm 3 TX/1 RX channel map, shield, length, supply voltage, contact current and 100% continuity test.",
         "source_url": "", "review_report": ""},
        {"additional_item": "Receiver adapter / downstream interface", "quantity": "1 prototype; exact electronics TBD",
         "current_candidate": "Compatible GTP receiver and control link",
         "open_item": "Confirm receiver input, reference clock, AC coupling, ESD and firmware.",
         "source_url": "", "review_report": ""},
        {"additional_item": "JTAG programmer and voltage adapter", "quantity": "1 tool set",
         "current_candidate": "1.8 V compatible JTAG candidate",
         "open_item": "Select exact probe, keyed adapter and bring-up cable; confirm I/O voltage before use.",
         "source_url": "", "review_report": ""},
        {"additional_item": "Edge I/O test fixture and J6 shunt", "quantity": "1 fixture; 1 shunt; spares TBD",
         "current_candidate": "1.5 V compatible probes, ground return and keyed INIT_B jumper",
         "open_item": "Match the final edge-pad pitch and J6 header before ordering; fixture and jumper are outside the fitted PCB BOM.",
         "source_url": "", "review_report": ""},
    ]
    if not summary["fitted_clock_references"]:
        rows.append({"additional_item": "FPGA GTP reference clock source", "quantity": "1 source; implementation TBD",
                     "current_candidate": "Qualify on-board oscillator or approved external reference",
                     "open_item": "Set link rate, frequency, jitter budget, voltage and GTP input topology before sourcing.",
                     "source_url": "", "review_report": ""})
    rows.extend([
        {"additional_item": "Routing-board ASIC LDO power feed", "quantity": "TBD",
         "current_candidate": "Separate supply/return path and routing-board rail parts",
         "open_item": "No DF40T supply contacts are spare. Select feed hardware, LDOs and protection after load budgets; J4.19 0.8 A is only a contact rating.",
         "source_url": "", "review_report": "reports/Power_Budget_and_Routing_Feed_Audit.md"},
        {"additional_item": "Input supply and protection", "quantity": "1 source; protection BOM TBD",
         "current_candidate": "Supply voltage, connector protection, current limiting and backfeed control TBD",
         "open_item": "Neither 5 V nor 12 V whole-headstage power is qualified. Verify total FPGA plus ASIC load, inrush, cable loss and startup sequence.",
         "source_url": "", "review_report": "reports/Power_Budget_and_Routing_Feed_Audit.md"},
        {"additional_item": "PCB fabrication and assembly", "quantity": "1 prototype lot; spares TBD",
         "current_candidate": "Eight-layer board, stencil and assembly",
         "open_item": "Fabricator stackup, controlled impedance, via process, thermal and assembly reviews pending.",
         "source_url": "", "review_report": ""},
    ])
    return rows


def render_system_rows(rows, bundle):
    out = []
    for row in rows:
        cells = [html.escape(row[key]) for key in ("additional_item", "quantity", "current_candidate", "open_item")]
        link = row["source_url"] or (f'{bundle}/{row["review_report"]}' if row["review_report"] else "")
        if link:
            cells[-1] += f' <a href="{html.escape(link, quote=True)}">Source ↗</a>'
        out.append("<tr>" + "".join(f"<td>{cell}</td>" for cell in cells) + "</tr>")
    return "\n".join(out)


def write_purchasing_exports(rows, summary):
    folder = DEST / "purchasing"
    folder.mkdir(parents=True, exist_ok=True)
    fields = list(rows[0])
    with (folder / "Fitted_50T_Grouped_BOM.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    (folder / "Fitted_50T_Grouped_BOM.json").write_text(json.dumps({
        "board_sha256": summary["board_sha256"], "status": "candidate to source; do not order",
        "quantity_basis": "one fitted FPGA PCB", "grouped_lines": len(rows),
        "fitted_buyable_references": summary["fitted_buyable_references"], "rows": rows,
    }, indent=2, ensure_ascii=False) + "\n")
    systems = system_purchasing_rows(summary)
    with (folder / "System_Purchasing_Plan.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(systems[0]))
        writer.writeheader()
        writer.writerows(systems)
    (folder / "System_Purchasing_Plan.json").write_text(json.dumps({
        "board_sha256": summary["board_sha256"], "status": "planning items; do not order",
        "quantity_basis": "one prototype system; TBD rows require selection", "rows": systems,
    }, indent=2, ensure_ascii=False) + "\n")
    (folder / "README.md").write_text(
        "# Compact 50T purchasing review — 28 September 2026\n\n"
        "The fitted board CSV and JSON are generated from KiCad's native schematic BOM and "
        "checked against physical PCB references. Copper-only test pads are excluded. "
        "The system CSV and JSON cover matching routing-board plugs, cable, receiver, programmer, "
        "ASIC carrier, test fixture, power feed and fabrication outside that board BOM. "
        "Candidate codes and quantities are "
        "for review; **do not order** until the electrical and mechanical gates close.\n\n"
        f"Board SHA-256: `{summary['board_sha256']}`. "
        f"Native connectivity has {summary['unconnected']} ratsnest links and zero routed copper.\n")


def update_table(rows):
    page = REPO / "presentation/fpga/index.html"
    source = page.read_text()
    pattern = re.compile(r'(<table id="purchase-parts">.*?<tbody>).*?(</tbody></table>)', re.S)
    updated, count = pattern.subn(lambda m: m[1] + "\n" + render_rows(rows) + "\n" + m[2], source)
    if count != 1:
        raise ValueError("Featured purchasing table is missing or ambiguous")
    page.write_text(updated)


def body_bounds(fp):
    """A small display-only bounding box from the saved fabrication outline."""
    node = fp["node"]
    points = []
    for kind in ("fp_line", "fp_rect"):
        for line in children(node, kind):
            layer = child(line, "layer")
            if not layer or layer[1] not in {"F.Fab", "B.Fab"}:
                continue
            for end in ("start", "end"):
                p = child(line, end)
                if p:
                    points.append((float(p[1]), float(p[2])))
    if len(points) < 2:
        for pad in children(node, "pad"):
            at = child(pad, "at")
            if at:
                points.append((float(at[1]), float(at[2])))
    if not points:
        return [fp["x"] - .8, fp["y"] - .8, 1.6, 1.6]
    angle = math.radians(fp["rotation"])
    c, s = math.cos(angle), math.sin(angle)
    rotated = [(fp["x"] + x*c + y*s, fp["y"] - x*s + y*c) for x, y in points]
    minx, maxx = min(x for x, y in rotated), max(x for x, y in rotated)
    miny, maxy = min(y for x, y in rotated), max(y for x, y in rotated)
    margin = .15
    return [round(minx-margin, 4), round(miny-margin, 4),
            round(max(maxx-minx+2*margin, .6), 4),
            round(max(maxy-miny+2*margin, .6), 4)]


def build_3d_metadata(facts, board_rel, board_hash, unrouted):
    old = json.loads((REPO / "presentation/fpga/3d/assets/fpga50t.json").read_text())
    original = {p["ref"]: p for p in old["parts"]}
    parts = []
    for ref, fp in sorted(facts["refs"].items()):
        previous = original.get(ref, {})
        part = {key: fp[key] for key in ("ref", "value", "x", "y", "back", "rotation")}
        part["footprint"] = fp["footprint"].split(":")[-1]
        if ref.startswith("TP") or fp["value"] == "PCB test pad":
            part["model"] = "bare pad or mounting hole"
        elif (previous.get("model") == "KiCad library" and
              previous.get("footprint") == part["footprint"]):
            part["model"] = "KiCad library"
            part["library"] = previous["library"]
        else:
            part["model"] = "simplified body"
            part["body"] = body_bounds(fp)
            part["height"] = previous.get("height", 1.3 if ref.startswith(("J", "U", "Y")) else .8)
        parts.append(part)
    simplified = [p["ref"] for p in parts if p["model"] == "simplified body"]
    bare = [p["ref"] for p in parts if p["model"] == "bare pad or mounting hole"]
    missing = [{"reference": ref, "declared_model": fp["declared_model"]}
               for ref, fp in facts["refs"].items() if ref in simplified and fp["declared_model"]]
    meta = {
        "id": "fpga50t", "title": "XC7A50T · compact two-60 unrouted review",
        "source": board_rel, "board_sha256": board_hash,
        "dimensions_mm": facts["dimensions_mm"] + [1.6],
        "board_center_mm": facts["center_mm"], "parts": parts,
        "library_model_count": len(parts)-len(simplified)-len(bare),
        "simplified_body_count": len(simplified), "bare_fixture_count": len(bare),
        "simplified_refs": simplified, "bare_refs": bare,
        "missing_step_models": missing,
        "model": "fpga50t.glb",
        "routing_status": f"{unrouted} native ratsnest links · 0 tracks/vias · not for manufacture",
    }
    return meta


def publish_native_assets(facts, board, board_hash, unrouted, drc_reported, meta):
    rel = "hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact"
    viewer = REPO / "presentation/fpga/viewer"
    assets = REPO / "presentation/fpga/3d/assets"
    svg = viewer / "fpga50t-front.svg"
    subprocess.run([
        str(CLI), "pcb", "export", "svg", "--mode-single", "--fit-page-to-board",
        "--exclude-drawing-sheet", "--layers", "F.Cu,F.Silkscreen,Edge.Cuts",
        "-o", str(svg), str(board)
    ], check=True, capture_output=True, text=True)
    image = svg.read_text()
    image = re.sub(r'width="[^"]+" height="[^"]+" viewBox=', 'width="100%" height="100%" viewBox=', image, count=1)
    image = "\n".join(line.rstrip() for line in image.splitlines()) + "\n"
    svg.write_text(image)
    known_library_refs = [p["ref"] for p in meta["parts"] if p["model"] == "KiCad library"]
    model_dir = Path("/Applications/KiCad/KiCad.app/Contents/SharedSupport/3dmodels")
    env = dict(os.environ, KICAD10_3DMODEL_DIR=str(model_dir))
    glb = assets / "fpga50t.glb"
    subprocess.run([
        str(CLI), "pcb", "export", "glb", "--force", "--no-dnp",
        "--include-pads", "--include-soldermask", "--include-silkscreen",
        "--user-origin", "0x0mm", "--component-filter", ",".join(known_library_refs),
        "-o", str(glb), str(board)
    ], check=True, capture_output=True, text=True, env=env)
    meta["glb_sha256"] = sha(glb)
    meta["model_source"] = (
        "KiCad 10 installed models for known references; changed or missing "
        "models use labeled simplified bodies for review."
    )
    (assets / "fpga50t.json").write_text(json.dumps(meta, indent=2) + "\n")
    provenance = assets / "provenance.json"
    data = json.loads(provenance.read_text())
    data["boards"]["fpga50t"] = {k: v for k, v in meta.items() if k != "parts"}
    provenance.write_text(json.dumps(data, indent=2) + "\n")
    registry = viewer / "boards.json"
    data = json.loads(registry.read_text())
    entry = next(b for b in data["boards"] if b["id"] == "fpga50t")
    entry.update({
        "title": f"50T micro-HDMI · {facts['dimensions_mm'][0]:g} × {facts['dimensions_mm'][1]:g} mm · unrouted review",
        "description": (
            f"Compact XC7A50T review with two 60-contact DF40T ASIC connectors, "
            f"{facts['footprints']} footprints and {unrouted} native ratsnest links. "
            "Eight copper layers, no tracks or vias; mechanical mating, power, link and manufacturing checks remain open."
        ),
        "native": f"../../../{rel}/project/hardware/{STEM}.kicad_pcb",
        "project": f"../../../{rel}/project/hardware/{STEM}.kicad_pro",
        "zip": f"../../../{rel}/FPGA50T_Two_60_Compact_Review_2026-09-28.zip",
        "sha256": board_hash,
        "dimensions_mm": facts["dimensions_mm"],
        "expected": {k: facts[k] for k in (
            "footprints", "pads", "segments", "vias", "zones",
            "fpgaPads", "copperLayers", "nets")},
        "unconnected_items": unrouted,
        "drc_reported_unconnected_items": drc_reported,
        "manufacturing_ready": False,
        "package_manifest": f"{rel}/manifest.json",
        "publication_status": "Compact 50T unrouted engineering review; not for manufacture",
    })
    registry.write_text(json.dumps(data, indent=2) + "\n")


def package_manifest():
    files = []
    if (DEST / "README.md").is_file():
        item = DEST / "README.md"
        files.append({"path": "README.md", "sha256": sha(item), "bytes": item.stat().st_size})
    for folder in ("project", "reports", "validation", "output", "purchasing"):
        if (DEST / folder).is_dir():
            for item in sorted((DEST / folder).rglob("*")):
                if item.is_file():
                    files.append({"path": item.relative_to(DEST).as_posix(), "sha256": sha(item),
                                  "bytes": item.stat().st_size})
    manifest = {
        "date": "2026-09-28", "status": "Unrouted review; not for manufacture or ordering",
        "project_derivative": "68 of 69 local Step15 project files; optional .kicad_prl omitted",
        "files": files,
    }
    (DEST / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


def make_package_portable(source_schematic):
    reports = DEST / "reports"
    if reports.is_dir():
        for report in reports.glob("*.json"):
            data = json.loads(report.read_text())
            if report.name == "Escape_Corridor_Map.json":
                data["source_board"] = "Step07 saved PCB checkpoint in the dated local review"
            elif report.name == "Step14_North_South_Escape_Map.json":
                data["source_board"] = f"../project/hardware/{STEM}.kicad_pcb"
            report.write_text(json.dumps(data, indent=2) + "\n")
        for item in reports.glob("*.md"):
            source = item.read_text()
            def portable_link(match):
                label, target = match.group(1), match.group(2)
                if target.startswith(("http:", "https:", "#", "mailto:")):
                    return match.group(0)
                if (item.parent / target).resolve().is_file():
                    return match.group(0)
                return label + " (local source; not included in web package)"
            source = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", portable_link, source)
            item.write_text(source)
    for item in (DEST / "validation").iterdir():
        if item.suffix not in {".net", ".json", ".csv"}:
            continue
        source = item.read_text()
        source = source.replace(str(source_schematic), f"../project/hardware/{STEM}.kicad_sch")
        if item.name == "Step14_Final_Native_Ratsnest.json":
            data = json.loads(source)
            data["source_board"] = f"../project/hardware/{STEM}.kicad_pcb"
            source = json.dumps(data, indent=2) + "\n"
        if item.name == "Step15_Project_SHA256_Manifest.json":
            data = json.loads(source)
            data["project_roots"] = {
                "active": "../project",
                "step14": "historical Step14 local checkpoint; not included in this web package",
                "step15": "../project",
            }
            source = json.dumps(data, indent=2) + "\n"
        if item.suffix == ".net":
            replacement = ("Step14 historical overview schematic; workstation path redacted"
                           if item.name == "Step15_Baseline_Step14_Netlist.net" else
                           f"../project/hardware/{STEM}.kicad_sch")
            source = replace_netlist_source(source, replacement)
        if "/Users/" in source or "/private/var/" in source:
            raise ValueError(f"Validation record contains workstation paths: {item.name}")
        item.write_text(source)


def replace_once(source, before, after, label):
    if source.count(before) != 1:
        raise ValueError(f"Cannot find unique {label} in featured page")
    return source.replace(before, after, 1)


def update_featured_copy(summary, drc_name, erc_name):
    page = REPO / "presentation/fpga/index.html"
    text = page.read_text()
    dims = f"{summary['dimensions_mm'][0]:g} × {summary['dimensions_mm'][1]:g}"
    count, unrouted, dnp = summary["footprints"], summary["unconnected"], len(summary["dnp"])
    bundle = "../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact"
    old_bundle = "../../hardware/fpga-interface-study/dated/2026-09-28/50t-gtp-power"
    text = replace_once(text, "XC7A50T-CSG325 · 43 × 49 mm",
                        f"XC7A50T-CSG325 · {dims} mm", "board dimension")
    text = replace_once(text, "Eight copper layers · 0 tracks · 499 unrouted connections",
                        f"Eight copper layers · 0 tracks · {unrouted} native ratsnest links*",
                        "open connection count")
    text = replace_once(text,
        "The native schematic has 141 components; the PCB has 145 footprints including four mounting holes. Six schematic items are marked do not populate. The purchasing table below covers the fitted, buyable PCB references and keeps the exclusions clear.",
        f"The compact native PCB has {count} footprints, two 60-contact ASIC connectors and no mounting holes. "
        f"The schematic marks {dnp} items do not populate. The table below reconciles every fitted, "
        "buyable PCB reference; copper test pads have no purchase line.",
        "board description")
    text = replace_once(text, "<dt>43 × 49</dt>", f"<dt>{dims}</dt>", "fact dimension")
    text = replace_once(text, "<dt>499</dt>", f"<dt>{unrouted}</dt>", "fact reported open items")
    text = replace_once(text, "<dd>open copper connections</dd>",
                        "<dd>native ratsnest links*</dd>", "open-item caption")
    text = replace_once(text,
        '<p class="caution"><strong>Power and cable:</strong> J4 is a custom micro-HDMI-shaped connection. Its native input is <code>LINK_12V</code>; the later contact proposal calls for protected 5 V. The mismatch needs a schematic and load review before hardware use.</p>',
        '<p class="caution"><strong>Power and cable:</strong> The micro-HDMI pinout is a custom candidate. '
        'J4.19 is named <code>LINK_12V</code> in native CAD, while an earlier proposal considered 5 V; '
        'neither whole-headstage supply is qualified. Set the voltage, load budget, cable/contact current, '
        'protection and separate ASIC LDO feed before applying power. '
        f'<a href="{bundle}/reports/Power_Budget_and_Routing_Feed_Audit.md">Read the power audit ↗</a></p>',
        "power caution")
    text = replace_once(text, '<strong>6</strong><span>schematic DNP items excluded</span>',
                        f'<strong>{dnp}</strong><span>schematic DNP items excluded</span>',
                        "DNP count")
    text = replace_once(text,
        "This table comes from the 28 September 50T project. Mounting holes and copper-only test pads have no purchase line. U6 flash and Y1 oscillator are among the do-not-populate items. No components or boards have been ordered.",
        "This table is generated from the compact native schematic and checked against PCB references. "
        f"Copper-only pads and {dnp} DNP schematic items are excluded. "
        "No components or boards have been ordered.",
        "purchasing note")
    text = replace_once(text,
        "Carrier-side DF40 mate, custom passive micro-HDMI cable and strain relief. Confirm the exact J5 mating series and continuity of all 19 contacts and shell.",
        "Two carrier-side DF40T plugs, a custom passive micro-HDMI cable and strain relief. "
        "Confirm both rigid mating alignments and all 19 cable contacts and shield.",
        "matching connector note")
    systems = f'''<div class="table-wrap"><table id="system-parts"><thead><tr>
<th scope="col">Additional item</th><th scope="col">Quantity</th>
<th scope="col">Current candidate</th><th scope="col">What must be settled</th></tr></thead><tbody>
{render_system_rows(system_purchasing_rows(summary), bundle)}
</tbody></table></div><p class="fine-print">The FPGA and all fitted on-board flash, clock, LEDs and passives are counted above in the native per-board table. All rows here are system planning items, not a purchase authorization. <a href="{bundle}/purchasing/System_Purchasing_Plan.csv">Download system CSV ↓</a> · <a href="{bundle}/purchasing/System_Purchasing_Plan.json">JSON ↓</a></p>'''
    text, count_systems = re.subn(r'<div class="needs-grid">.*?</div>(?=</section>)', systems, text, count=1, flags=re.S)
    if count_systems != 1:
        raise ValueError("Cannot replace system needs")
    text = text.replace(
        "These are needed to build and test the intended one-cable system but have no approved purchase quantity or exact part selection in the present PCB draft.",
        "These items are outside the fitted FPGA PCB BOM. Known prototype quantities are shown; unresolved selections and quantities stay TBD.")
    text = replace_once(text,
        "Check J4 footprint and cable drawing; resolve J5’s native DF40C footprint against the later DF40T mating direction.",
        "Approve both DF40T mating pairs, their spacing and alignment, plus J4 and the custom cable drawing.",
        "connector decision")
    text = text.replace(old_bundle + "/FPGA50T_GTP_Power_Review_2026-09-28.zip",
                        bundle + "/FPGA50T_Two_60_Compact_Review_2026-09-28.zip")
    text = text.replace(old_bundle + "/output/FPGA50T_GTP_Power_Review.pdf",
                        bundle + "/output/FPGA50T_Compact_Review.pdf")
    text = text.replace("5 V R2 proposal vs native 12 V ↗", "Supply voltage unqualified ↗")
    text = text.replace(
        '<div class="parts-actions"><a class="primary" href="../../sources/engineering/2026-09-28/Micro_HDMI_50T_Grouped_Purchasing_Draft.csv" download>Download grouped CSV ↓</a>',
        f'<div class="parts-actions"><a class="primary" href="{bundle}/purchasing/Fitted_50T_Grouped_BOM.csv" download>Download fitted BOM CSV ↓</a>'
        f'<a href="{bundle}/purchasing/Fitted_50T_Grouped_BOM.json">BOM JSON ↓</a>')
    text = text.replace(
        'Choose 5 V or 12 V, quantify full board and ASIC load, then revise J4 input protection, cable and rail calculations together.',
        'Select the whole-headstage supply voltage after the FPGA and ASIC load budgets, then revise J4 input protection, cable and rail calculations together.')
    text = text.replace(old_bundle + "/validation/GTP_Final_DRC.json",
                        bundle + "/validation/" + drc_name)
    text = text.replace("PCB · 13-sheet schematic · libraries ↗",
                        "PCB · overview + 13 detail sheets · libraries ↗")
    text = text.replace("<strong>13-sheet PDF</strong>", "<strong>14-page PDF</strong>")
    text = text.replace("GTP supplies on sheet 13 ↗", "Corrected Step15 schematic ↗")
    text = text.replace("499 unrouted · not a release",
                        f"{unrouted} native ratsnest links* · not a release")
    text = replace_once(text, '</div></section>\n</main><footer>',
        '</div><p class="fine-print">The web ZIP is a 68-file portable derivative of the '
        '69-file local Step15 project: only optional KiCad <code>.kicad_prl</code> UI preferences '
        'are omitted, and all other project-file hashes match. '
        f'<a href="{bundle}/README.md">Read the package provenance ↗</a></p></section>\n</main><footer>',
        'portable ZIP provenance')
    clock_note = ("The fitted Y2 125 MHz LVDS reference is a candidate" if
                  "Y2" in summary["fitted_clock_references"] else
                  "The FPGA reference clock source remains unqualified")
    retired_clock_note = (
        f'<p class="fine-print"><strong>Removed legacy clock island:</strong> '
        'Y1, R119, C102 and C103 are absent from this fitted revision; Y2 remains the '
        '125 MHz GTP-clock candidate. '
        f'<a href="{bundle}/reports/Step13_Legacy_Clock_Retirement.md">Read the Step13 cleanup ↗</a></p>'
        if summary["legacy_clock_island_removed"] else "")
    size_note = (
        f"The {dims} mm Edge.Cuts outline is 17.37% smaller in area than the 38.5 × 43 mm placement. "
        "J4's courtyard intentionally extends about 1.245 mm beyond the east board edge; "
        "shell, cable and assembly clearances still need approval. This is not a minimum routable size. "
        if summary["dimensions_mm"] == [36.0, 38.0] else
        f"The {dims} mm outline is a checked placement envelope. Neither placement establishes "
        "a minimum routable size or connector fit. "
    )
    text = text.replace(
        '</dl><p class="caution">',
        '</dl><p><strong>Micro-HDMI/GTP candidate:</strong> The native schematic assigns three '
        'recording TX pairs and one control RX pair to J4 through on-board series coupling. '
        f'{clock_note}; the receiver, cable and lane rate remain unverified. '
        f'<a href="{bundle}/reports/Step09_GTP_Link_Handoff.md">Review contact chain ↗</a></p>'
        '<p><strong>ASIC clock candidate:</strong> Y2 could also feed a fabric MMCM to generate '
        '32 MHz for eight ASIC outputs after FPGA configuration. This is a calculated topology, '
        'not implemented HDL or a timing guarantee; check ASIC startup needs. '
        f'<a href="{bundle}/reports/ASIC_Clock_Source_Candidate.md">Read the clock study ↗</a></p>'
        '<p><strong>Layered escape plan:</strong> ASIC contacts are assigned to proposed '
        'L1/L3/L6 corridors for later breakout; L2/L5/L7 are reserved for ground returns and '
        'L4 for power in the proposed stack. '
        'These are planning assignments, not traces. '
        f'<a href="{bundle}/reports/Step14_North_South_Escape_Map.csv">Open final contact-by-layer map ↗</a></p>'
        '<p><strong>Routing-distance screen:</strong> Swapping the two DF40T sites reduced '
        'opposite north/south source-half balls from 72 to 44 of 116, while opposite east/west '
        'source-half balls rose from 39 to 77. These are geometry warnings, not routed crossings. '
        f'<a href="{bundle}/reports/Step14_Layer_By_Layer_Escape_Study.md">Read the Step14 escape study ↗</a></p>'
        '<p><strong>Connector returns:</strong> The current two-60 map has three GND contacts '
        'and keeps all 116 digital signals allocated. Ground redistribution and separate ASIC '
        'LDO supply/return need routing-board and ASIC-owner approval before routing. '
        f'<a href="{bundle}/reports/DF40T_Ground_Return_Review.md">Read the return-path review ↗</a></p>'
        '<p class="caution">', 1)
    text = text.replace(
        '<p class="caution">',
        f'<p class="fine-print">* KiCad native connectivity reports {unrouted} ratsnest links. '
        f'The DRC JSON shows only {summary["drc_reported_unconnected"]} unconnected items and '
        'appears capped for some debug-pad nets. There are zero routed tracks or vias.</p>'
        '<p class="caution">', 1)
    text = text.replace(
        '<p class="caution">',
        f'<p class="caution"><strong>Schematic ERC:</strong> KiCad reports '
        f'{summary["erc_error_count"]} errors and {summary["erc_warning_count"]} warnings '
        f'({summary["erc_ignored_check_count"]} project check types ignored). '
        f'<a href="{bundle}/validation/{erc_name}">Read the native ERC report ↗</a> '
        'These review findings remain open; placement alone does not validate electrical operation.</p>'
        '<p class="caution">', 1)
    text = text.replace(
        '<p class="caution"><strong>Power and cable:',
        f'<p class="fine-print"><strong>Board size:</strong> {size_note}'
        f'<a href="{bundle}/reports/Step14_Compact_Geometry_Handoff.md">Read the Step14 geometry study ↗</a></p>'
        '<p class="fine-print"><strong>Placement trial:</strong> A west-side J4 exploratory copy '
        'shortened straight-line FPGA-to-connector distances but had 81 physical DRC findings. '
        'It is invalid as a board layout and is retained only as a routing-distance comparison. '
        f'<a href="{bundle}/reports/MicroHDMI_East_West_Placement_Study.md">Read the study ↗</a></p>'
        '<p class="fine-print"><strong>Parity and assembly note:</strong> Step11 corrected '
        'FPGA ball F13 (M2_0) from an inherited PCB 1.8 V assignment to its schematic GND strap. '
        'U9’s restored 0.25 mm center land passes the current 0.15 mm clearance rule provisionally; '
        'fabricator and assembly approval remain open. '
        f'<a href="{bundle}/reports/Step11_Parity_Handoff.md">Read the checked handoff ↗</a></p>'
        '<p class="fine-print"><strong>Step15 schematic labels:</strong> The overview now names '
        'the 36 × 38 mm outline and leaves the custom input voltage TBD. This edits annotations '
        'only; the board, fitted BOM and electrical netlist stay unchanged. '
        f'<a href="{bundle}/reports/Step15_Overview_Annotation_Handoff.md">Read the clarification ↗</a></p>'
        + retired_clock_note +
        '<p class="caution"><strong>Power and cable:', 1)
    escape_figure = (f'<figure class="escape-figure"><img '
        f'src="{bundle}/reports/Step14_North_South_Escape_Overview.svg" '
        'alt="Step14 board-scale proposal assigning 116 ASIC source balls to L1, L3 and L6, '
        'with J5 southwest and J7 northeast." loading="lazy">'
        '<figcaption><strong>Step14 layer escape proposal.</strong> The colored assignments '
        'show no routed copper. The 44 north/south and 77 east/west opposite-half counts are '
        'route-feasibility warnings, not trace crossings. '
        f'<a href="{bundle}/reports/Step14_North_South_Escape_Map.csv">See the contact map ↗</a>'
        '</figcaption></figure>')
    text = replace_once(text, '</aside></div></section>\n<section id="parts"',
                        '</aside></div>' + escape_figure + '</section>\n<section id="parts"',
                        'layer escape figure')
    page.write_text(text)
    (REPO / "presentation/fpga/current.json").write_text(json.dumps(summary, indent=2) + "\n")


def update_summary_links(summary, meta):
    """Refresh short current-status pointers while leaving historical records intact."""
    dims = f"{summary['dimensions_mm'][0]:g} × {summary['dimensions_mm'][1]:g}"
    n, lines, open_count = (summary["fitted_buyable_references"],
                            summary["grouped_lines"], summary["unconnected"])
    drc_count = summary["drc_reported_unconnected"]
    updated = {
        "index.html": [
            ("131 fitted parts to source", f"{n} fitted parts to source"),
        ],
        "presentation/fpga/3d/index.html": [
            ("43 × 49 mm", f"{dims} mm"),
        ],
        "presentation/fpga/README.md": [
            ("131 fitted parts", f"{n} fitted parts"),
            ("43 × 49 mm outline and 145 footprints", f"{dims} mm outline and {summary['footprints']} footprints"),
            ("38-line grouped parts CSV", f"{lines}-line grouped parts CSV"),
            ("131 fitted buyable references", f"{n} fitted buyable references"),
            ("six DNP items, four copper test pads and four mounting holes are excluded",
             f"{len(summary['dnp'])} DNP items and copper-only test pads are excluded"),
            ("J5's CAD footprint remains DF40C while the later direction is DF40T.",
             "Two DF40T 60-contact connector pairs are a mechanical review candidate."),
            ("The native J4 input says `LINK_12V` while the separate R2 proposal evaluates protected 5 V; ",
             "The J4.19 `LINK_12V` label is inherited; neither 12 V nor the earlier 5 V proposal is a qualified supply. The cable and receiver still need electrical approval; "),
            ("The [50T 19-contact proposal](micro-hdmi-19.html) is a cable plan for the featured 50T board, not an implemented native link.",
             "The [50T 19-contact proposal](micro-hdmi-19.html) records the candidate cable plan; the current native schematic and unrouted PCB remain the engineering review."),
            ("38-line/131-reference", f"{lines}-line/{n}-reference"),
        ],
        "presentation/fpga/viewer/README.md": [
            ("43 × 49 mm; 145 footprints", f"{dims} mm; {summary['footprints']} footprints"),
            ("499 open connections", f"{open_count} native ratsnest links"),
            ("Native J4 power net remains `LINK_12V`; the separate 5 V proposal is not yet implemented.",
             "The native J4.19 net is `LINK_12V`, but neither 12 V nor the earlier 5 V proposal is a qualified whole-headstage supply. The custom cable and power contract remain under review."),
            ("50t-gtp-power/project", "50t-two-60-compact/project"),
            ("The [native audit](../../../hardware/fpga-interface-study/dated/2026-09-28/50t-gtp-power/validation/GTP_PCB_Final_Audit.json) records 499 open connections, no routed tracks or vias, and four keepouts. The saved CAD still uses a DF40C connector and a `LINK_12V` input; the separately proposed DF40T and 5 V changes are not implemented.",
             f"The [current native audit](../../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/validation/Website_Import_Audit.json) counts {open_count} ratsnest links. The DRC JSON shows only {drc_count} unconnected items and appears capped for debug-pad nets. There are no routed tracks or vias; J5/J7 are two 60-contact DF40T review connectors."),
        ],
        "presentation/fpga/3d/README.md": [
            ("43 × 49 mm unrouted 50T", f"{dims} mm unrouted 50T"),
            ("50t-gtp-power/project", "50t-two-60-compact/project"),
            ("| 50T unrouted micro-HDMI | 123 | 14 | 8 test pads/mounting holes |",
             f"| 50T unrouted micro-HDMI | {meta['library_model_count']} | {meta['simplified_body_count']} | {meta['bare_fixture_count']} bare test pads |"),
            ("The 50T Y1 oscillator has a degenerate fabrication outline, so its body uses the nominal 3.2 × 2.5 mm footprint size.",
             "Some 50T components use display-only fabrication-outline bodies where exact STEP models are unavailable."),
            ("For the 50T export, installed KiCad library models for U1 (CSG325), Y1 (oscillator) and J5 (DF40C) were unavailable; those bodies are explicitly simplified.",
             "The current 50T export labels components whose exact library models were unavailable or changed; their bodies are simplified for review."),
            ("The native schematic and PCB bytes are unchanged.",
             "The native schematic and PCB are copied byte for byte into the dated publication package."),
        ],
        "presentation/fpga/entry.js": [
            ("43 × 49 mm", f"{dims} mm"),
            ("499 unrouted connections", f"{open_count} native ratsnest links"),
        ],
        "presentation/compact/slides.js": [
            ("43 × 49 mm", f"{dims} mm"),
            ("145 footprints and 499 unrouted connections",
             f"{summary['footprints']} footprints and {open_count} native ratsnest links"),
            ("one 120-contact ASIC-facing connector", "two 60-contact DF40T ASIC-facing connectors"),
            ("The 19-contact data link is still a separate proposal; the native J4 input is LINK_12V while the later power proposal is 5 V.",
             "The 19-contact link is an unrouted review candidate; native J4.19 says LINK_12V, but 12 V and the earlier 5 V proposal both remain unqualified. Confirm the custom cable, power contract and receiver."),
        ],
        "sources/README.md": [
            ("38-line CSV", f"{lines}-line CSV"),
            ("131 fitted parts", f"{n} fitted parts"),
        ],
        "docs/team/owners-and-work.md": [
            ("131-part draft list", f"{n}-part draft list"),
        ],
        "presentation/fpga/viewer/index.html": [
            ("50t-gtp-power/project/hardware", "50t-two-60-compact/project/hardware"),
            ("50T micro-HDMI · 43 × 49 mm · unrouted review",
             f"50T micro-HDMI · {dims} mm · unrouted review"),
            ("viewer.js?v=20260928-fpga50t-445d3a8c",
             f"viewer.js?v=20260928-fpga50t-{summary['board_sha256'][:8]}"),
            ("this viewer does not display its 499 missing connections as a fabrication verdict.",
             f"KiCad native connectivity reports {open_count} ratsnest links; its DRC JSON lists only "
             f"{drc_count} items and appears capped. This viewer is for inspection, not a fabrication verdict."),
        ],
        "presentation/fpga/micro-hdmi.html": [
            ("131-part sourcing list", f"{n}-part sourcing list"),
            ("The <a href=\"micro-hdmi-19.html\">19-pin contact proposal</a> evaluates 5 V, while the native 50T CAD still names the input `LINK_12V`.",
             "The <a href=\"micro-hdmi-19.html\">19-pin contact proposal</a> remains a historical cable study; the compact native 50T review is separately available."),
        ],
        "docs/library.md": [
            ("50T 43 × 49 mm", f"50T {dims} mm"),
            ("131 fitted parts", f"{n} fitted parts"),
            ("38-line purchasing draft", f"{lines}-line purchasing draft"),
            ("499 unrouted connections", f"{open_count} native ratsnest links"),
        ],
        "README.md": [
            ("38-line purchasing draft", f"{lines}-line purchasing draft"),
            ("131 fitted components", f"{n} fitted components"),
            ("131 fitted component candidates", f"{n} fitted component candidates"),
            ("499 unrouted connections", f"{open_count} native ratsnest links"),
        ],
    }
    old_zip = "50t-gtp-power/FPGA50T_GTP_Power_Review_2026-09-28.zip"
    new_zip = "50t-two-60-compact/FPGA50T_Two_60_Compact_Review_2026-09-28.zip"
    for rel, changes in updated.items():
        path = REPO / rel
        if not path.is_file():
            continue
        text = path.read_text()
        for before, after in changes:
            text = text.replace(before, after)
        text = text.replace(old_zip, new_zip)
        if rel == "presentation/fpga/viewer/README.md":
            replacement = (
                "The [current native audit](../../../hardware/fpga-interface-study/dated/2026-09-28/"
                f"50t-two-60-compact/validation/Website_Import_Audit.json) counts {open_count} ratsnest links. "
                f"The DRC JSON shows only {drc_count} unconnected items and appears capped for debug-pad nets. "
                "There are no routed tracks or vias; J5/J7 are two 60-contact DF40T review connectors."
            )
            text, changed = re.subn(
                r'The \[native audit\]\([^)]*\) records.*?not implemented\.',
                replacement, text, count=1, flags=re.S)
            if changed != 1:
                raise ValueError("Viewer README needs an updated native-audit paragraph")
        path.write_text(text)
    engineering = REPO / "sources/engineering/2026-09-28/README.md"
    if engineering.is_file():
        text = engineering.read_text()
        lead = (
            f"The [50T grouped purchasing draft](Micro_HDMI_50T_Grouped_Purchasing_Draft.csv) "
            f"is regenerated from the compact [native 50T board]"
            f"(../../../hardware/fpga-interface-study/dated/2026-09-28/50t-two-60-compact/manifest.json). "
            f"Its {lines} grouped lines cover {n} fitted buyable references, with each reference counted once. "
            f"{len(summary['dnp'])} schematic DNP items and copper-only test pads are excluded. "
            "J5/J7 are two 60-contact DF40T receptacles; their mating geometry awaits approval. "
            "Power, cable and receiver remain open, and this is not an approved purchase cart."
        )
        text, nlead = re.subn(
            r'(## Featured 50T fitted-parts inventory\n\n).*?(?=\n\n## Separate 100T)',
            lambda m: m[1] + lead, text, count=1, flags=re.S)
        if nlead != 1:
            raise ValueError("Engineering purchasing introduction not found")
        text, nproposal = re.subn(
            r'This is a \*\*custom link proposal.*?(?=\n\nThe source for connector numbering)',
            "The R1 and R2 contact maps are preserved candidate history. The current native 50T schematic and PCB "
            "show the latest assignment state, but no high-speed copper is routed. Neither map is a verified cable or receiver design. "
            "A normal Type-D HDMI device must not be connected to this custom interface.",
            text, count=1, flags=re.S)
        if nproposal != 1:
            raise ValueError("Engineering cable proposal note not found")
        engineering.write_text(text)


def update_source_manifest(summary):
    path = REPO / "sources/manifest.json"
    data = json.loads(path.read_text())
    existing = {entry["path"]: entry for entry in data["files"]}
    changed = [
        CSV.relative_to(REPO).as_posix(),
        "presentation/fpga/viewer/fpga50t-front.svg",
        "presentation/fpga/3d/assets/fpga50t.glb",
        "presentation/fpga/3d/assets/fpga50t.json",
        "presentation/fpga/3d/assets/provenance.json",
        "presentation/fpga/viewer/boards.json",
        "presentation/fpga/current.json",
        "presentation/fpga/index.html",
        "presentation/fpga/fpga50t.css",
        "presentation/fpga/README.md",
        "presentation/fpga/3d/README.md",
        "presentation/fpga/3d/index.html",
        "presentation/fpga/viewer/README.md",
        "presentation/fpga/viewer/index.html",
        "presentation/fpga/viewer/viewer.js",
        "presentation/fpga/micro-hdmi.html",
        "presentation/fpga/entry.js",
        "presentation/compact/slides.js",
        "sources/engineering/2026-09-28/README.md",
        "sources/README.md",
        "docs/team/owners-and-work.md",
        "scripts/import_fpga50t_compact.py",
        "index.html",
        "README.md",
        "docs/library.md",
    ]
    changed.extend(p.relative_to(REPO).as_posix() for p in DEST.rglob("*") if p.is_file())
    for rel in changed:
        target = REPO / rel
        if not target.is_file():
            continue
        entry = existing.get(rel)
        if entry is None:
            entry = {"path": rel}
            data["files"].append(entry)
            existing[rel] = entry
        entry.update({
            "origin": "2026-09-28 compact XC7A50T native review and site importer",
            "status": "unrouted engineering review; not for manufacture or purchase",
            "transformation": "native copy or labeled web derivative; see compact package manifest",
            "note": "Source and display remain tied to the compact board hash.",
            "bytes": target.stat().st_size,
            "sha256": sha(target),
        })
        entry.pop("source_sha256", None)
    data["fpga_presentation"] = {
        "manifest": (DEST / "manifest.json").relative_to(REPO).as_posix(),
        "entry": "presentation/fpga/index.html",
        "source": DEST.relative_to(REPO).as_posix(),
        "board_id": "fpga50t",
        "board_sha256": summary["board_sha256"],
        "status": "compact 50T unrouted review; two 60-contact DF40T pairs; not for manufacture or purchase",
    }
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Dated compact review folder with project/, reports/, validation/")
    parser.add_argument("--drc", type=Path, required=True, help="Final KiCad DRC JSON from this exact PCB")
    parser.add_argument("--erc", type=Path, help="Final KiCad ERC JSON, if available")
    parser.add_argument("--netlist", type=Path, help="Final exported native netlist, if available")
    parser.add_argument("--apply", action="store_true", help="Copy reviewed CAD and update website")
    args = parser.parse_args()
    source = args.source.resolve()
    source_board = source / "project/hardware" / f"{STEM}.kicad_pcb"
    source_schematic = source_board.with_suffix(".kicad_sch")
    if not source_board.is_file() or not source_schematic.is_file():
        parser.error("Source must contain the complete compact 50T project")
    if args.apply and not args.erc:
        parser.error("A matching native ERC JSON is required for website publication")
    if args.apply and not args.netlist:
        parser.error("The final Step15 netlist is required for website publication")
    if args.netlist:
        baseline = source / "validation/Step15_Baseline_Step14_Netlist.net"
        if not baseline.is_file():
            parser.error("Step15 baseline netlist is required")
        if (replace_netlist_source(args.netlist.resolve().read_text(), "redacted") !=
            replace_netlist_source(baseline.read_text(), "redacted")):
            parser.error("Step15 and Step14 electrical netlist bodies differ")
    erc_data = json.loads(args.erc.resolve().read_text()) if args.erc else None
    if erc_data and not {"error", "warning"} <= set(erc_data["included_severities"]):
        parser.error("ERC report must include both error and warning severities")
    erc_findings = [v for sheet in erc_data["sheets"] for v in sheet.get("violations", [])] if erc_data else []
    drc = json.loads(args.drc.resolve().read_text())
    if drc["violations"] or drc["schematic_parity"]:
        parser.error("Final native DRC must have zero physical and parity findings")
    facts = board_facts(source_board)
    step14_map_path = source / "reports/Step14_North_South_Escape_Map.json"
    if not step14_map_path.is_file():
        parser.error("Final Step14 map JSON is required")
    step14_map = json.loads(step14_map_path.read_text())
    if (step14_map.get("source_board_sha256") != sha(source_board) or
        step14_map.get("board_outline_size_mm") != facts["dimensions_mm"] or
        step14_map.get("digital_contact_count") != 116 or
        step14_map.get("source_balls_opposite_connector_half", {}).get("total") != 44 or
        step14_map.get("source_balls_opposite_connector_east_west_half", {}).get("total") != 77):
        parser.error("Step14 north/south escape map does not match the frozen PCB")
    if facts["segments"] or facts["vias"]:
        parser.error("This release is explicitly unrouted")
    if facts["zones"]:
        parser.error("This review has no top-level copper zones")
    if facts["copperLayers"] != 8 or facts["fpgaPads"] != 324:
        parser.error("Unexpected FPGA package or copper-layer count")
    if set(facts["refs"]) & {"H1", "H2", "H3", "H4"}:
        parser.error("Old mounting holes reappeared")
    if not {"J5", "J7"} <= set(facts["refs"]):
        parser.error("Two ASIC mezzanine connectors are required")
    if any(facts["refs"][ref]["pads"] != 60 for ref in ("J5", "J7")):
        parser.error("J5/J7 must each have 60 physical contacts")
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        bom = export_bom(source_schematic, temp / "fitted.csv", True)
        all_bom = export_bom(source_schematic, temp / "all.csv", False)
        rows = purchasing_rows(bom, facts["refs"])
    fitted_refs = {item["Refs"].strip() for item in bom if not item["NoBoard"]}
    if "U6" not in fitted_refs:
        parser.error("The single-image configuration flash U6 must be fitted")
    led_refs = [item["Refs"].strip() for item in bom
                if re.fullmatch(r"D\d+", item["Refs"].strip())
                and "LED" in (item["Value"] + item["Footprint"]).upper()]
    clock_refs = [item["Refs"].strip() for item in bom
                  if re.fullmatch(r"Y\d+", item["Refs"].strip()) and not item["NoBoard"]]
    all_refs = {item["Refs"].strip() for item in all_bom}
    legacy_clock_island_removed = not ({"Y1", "R119", "C102", "C103"} & all_refs)
    if len(led_refs) != 2:
        parser.error(f"Expected two fitted FPGA test LEDs; found {led_refs}")
    fitted = sum(int(row["quantity_per_board"]) for row in rows)
    dnp = [r["Refs"] for r in all_bom if r["DNP"]]
    native_open = native_ratsnest_count(source_board)
    summary = {
        "board_sha256": sha(source_board),
        "dimensions_mm": facts["dimensions_mm"],
        "footprints": facts["footprints"], "pads": facts["pads"],
        "nets": facts["nets"], "zones": facts["zones"],
        "embedded_footprint_zones": facts["embedded_footprint_zones"],
        "copper_layers": facts["copperLayers"],
        "segments": facts["segments"], "vias": facts["vias"],
        "unconnected": native_open,
        "unconnected_scope": "KiCad pcbnew GetUnconnectedCount(False) native connectivity count",
        "drc_reported_unconnected": len(drc["unconnected_items"]),
        "drc_report_scope": "DRC JSON item list appears capped; do not use as exhaustive count",
        "fitted_buyable_references": fitted, "grouped_lines": len(rows),
        "fitted_test_led_references": led_refs,
        "fitted_clock_references": clock_refs,
        "legacy_clock_island_removed": legacy_clock_island_removed,
        "erc_error_count": sum(v["severity"] == "error" for v in erc_findings) if erc_data else None,
        "erc_warning_count": sum(v["severity"] == "warning" for v in erc_findings) if erc_data else None,
        "erc_ignored_check_count": len(erc_data["ignored_checks"]) if erc_data else None,
        "schematic_symbols": len(all_bom),
        "dnp": dnp, "board_references": sorted(facts["refs"]),
        "source_folder": source.name,
        "destination": DEST.relative_to(REPO).as_posix(),
    }
    print(json.dumps(summary, indent=2))
    if not args.apply:
        return
    for name in ("Power_Budget_and_Routing_Feed_Audit.md", "Escape_Corridor_Map.csv",
                 "Escape_Corridor_Overview.svg", "Step09_GTP_Link_Handoff.md",
                 "Step11_Parity_Handoff.md",
                 "Step13_Legacy_Clock_Retirement.md",
                 "ASIC_Clock_Source_Candidate.md",
                 "DF40T_Ground_Return_Review.md",
                 "MicroHDMI_East_West_Placement_Study.md",
                 "Board_Size_Constraint_Study.md",
                 "Step14_Compact_Geometry_Handoff.md", "Step14_Layer_By_Layer_Escape_Study.md",
                 "Step14_North_South_Escape_Map.csv", "Step14_North_South_Escape_Overview.svg",
                 "Step15_Overview_Annotation_Handoff.md"):
        if not (source / "reports" / name).is_file():
            parser.error(f"Required review report is missing: {name}")
    for item in (source / "project").rglob("*"):
        if not item.is_file():
            continue
        rel = item.relative_to(source / "project")
        if (rel.parts[0] not in {"hardware", "libraries"} and rel.as_posix() != "README.md") or \
           "private_source" in {part.lower() for part in rel.parts}:
            parser.error(f"Unexpected project file in publication copy: {rel}")
        if item.suffix.lower() in {".mp3", ".m4a", ".wav", ".aac", ".mp4", ".mov"}:
            parser.error(f"Media file must not enter the public CAD package: {rel}")
    if DEST.exists():
        parser.error(f"Destination exists: {DEST}; preserve existing snapshot and review before replacing")
    DEST.mkdir(parents=True)
    shutil.copytree(source / "project", DEST / "project",
                    ignore=shutil.ignore_patterns("*.lck", "*-backups", "*.kicad_prl", "__pycache__"))
    reports = source / "reports"
    if reports.is_dir():
        (DEST / "reports").mkdir()
        for item in reports.iterdir():
            if item.is_file() and item.suffix in {".md", ".csv", ".svg", ".png", ".json"}:
                shutil.copy2(item, DEST / "reports" / item.name)
    final_drc = DEST / "validation" / args.drc.name
    final_drc.parent.mkdir(exist_ok=True)
    shutil.copy2(args.drc.resolve(), final_drc)
    for evidence in (args.erc, args.netlist):
        if evidence:
            shutil.copy2(evidence.resolve(), final_drc.parent / evidence.name)
    for name in ("Step14_Final_Full_DRC.json", "Step14_Final_ERC.json",
                 "Step14_Final_Native_Ratsnest.json", "Step14_Pad_Net_And_Placement.json",
                 "Step14_Complete_Project_Hashes.json", "Step14b_Silk_Change.json",
                 "Step15_Project_SHA256_Manifest.json", "Step15_Project_SHA256_Manifest.csv",
                 "Step15_Baseline_Step14_Netlist.net"):
        evidence = source / "validation" / name
        if not evidence.is_file():
            parser.error(f"Required Step14 validation record is missing: {name}")
        shutil.copy2(evidence, final_drc.parent / name)
    old_registry = json.loads((REPO / "presentation/fpga/viewer/boards.json").read_text())
    old_featured = next(board for board in old_registry["boards"] if board["id"] == "fpga50t")
    in_worktree = (REPO / ".git").exists()
    git_head = (subprocess.run(["git", "rev-parse", "HEAD"], cwd=REPO,
                               check=True, capture_output=True, text=True).stdout.strip()
                if in_worktree else "isolated rehearsal without Git metadata")
    git_status = (subprocess.run(["git", "status", "--short"], cwd=REPO,
                                 check=True, capture_output=True, text=True).stdout.splitlines()
                  if in_worktree else [])
    git_branch = (subprocess.run(["git", "branch", "--show-current"], cwd=REPO,
                                 check=True, capture_output=True, text=True).stdout.strip()
                  if in_worktree else "isolated rehearsal")
    (final_drc.parent / "Website_Preimport_State.json").write_text(json.dumps({
        "site_head_before_import": git_head,
        "site_branch_before_import": git_branch,
        "featured_board_sha256_before_import": old_featured["sha256"],
        "tracked_and_untracked_work_before_import": git_status,
        "previous_review_preserved_at": "hardware/fpga-interface-study/dated/2026-09-28/50t-gtp-power",
    }, indent=2) + "\n")
    copied_board = DEST / "project/hardware" / f"{STEM}.kicad_pcb"
    if sha(copied_board) != summary["board_sha256"]:
        raise ValueError("Source board changed during import; stop and re-freeze CAD")
    fresh_drc = final_drc.parent / "Website_Fresh_DRC.json"
    subprocess.run([
        str(CLI), "pcb", "drc", "--format", "json", "--schematic-parity",
        "--severity-all", "-o", str(fresh_drc), str(copied_board),
    ], check=True, capture_output=True, text=True)
    fresh = json.loads(fresh_drc.read_text())
    if fresh["violations"] or fresh["schematic_parity"]:
        raise ValueError("Copied board has native DRC or schematic parity findings")
    if native_ratsnest_count(copied_board) != summary["unconnected"]:
        raise ValueError("Copied board connectivity changed during import")
    if len(fresh["unconnected_items"]) != summary["drc_reported_unconnected"]:
        raise ValueError("Copied board DRC item list differs from supplied validation")
    make_package_portable(source_schematic)
    for item in DEST.rglob("*"):
        if not item.is_file():
            continue
        rel = item.relative_to(DEST)
        if "private_source" in {part.lower() for part in rel.parts} or item.suffix.lower() in {
            ".mp3", ".m4a", ".wav", ".aac", ".mp4", ".mov"}:
            raise ValueError(f"Private or media file entered website package: {rel}")
        if item.suffix.lower() in {".md", ".json", ".csv", ".net", ".kicad_pro", ".kicad_sch"}:
            body = item.read_text(errors="replace")
            if "/Users/" in body or "/private/var/" in body:
                raise ValueError(f"Workstation path entered website package: {rel}")
    output = DEST / "output"
    output.mkdir(exist_ok=True)
    subprocess.run([
        str(CLI), "sch", "export", "pdf",
        "-o", str(output / "FPGA50T_Compact_Review.pdf"),
        str(DEST / "project/hardware" / f"{STEM}.kicad_sch"),
    ], check=True, capture_output=True, text=True)
    # KiCad may create an ignored, machine-local preferences file while exporting.
    # Keep the portable review package and its manifest free of that file.
    for preferences in DEST.rglob("*.kicad_prl"):
        preferences.unlink()
    step15_manifest = json.loads((source / "validation/Step15_Project_SHA256_Manifest.json").read_text())
    expected_project = {item["relative_path"]: item["sha256_step15"]
                        for item in step15_manifest["files"] if not item["relative_path"].endswith(".kicad_prl")}
    actual_project = {item.relative_to(DEST / "project").as_posix(): sha(item)
                      for item in (DEST / "project").rglob("*") if item.is_file()}
    if len(step15_manifest["files"]) != 69 or len(actual_project) != 68 or actual_project != expected_project:
        raise ValueError("Portable 68-file project differs from Step15 beyond the optional .kicad_prl omission")
    (DEST / "README.md").write_text(
        "# Compact 50T website review package — 28 September 2026\n\n"
        "The native PCB is a 36 × 38 mm unrouted review, not a manufacturing release. "
        "The project/ tree and downloadable KiCad ZIP contain 68 of the 69 files in the local "
        "Step15 checkpoint. Only `hardware/FPGA50T_8L_Unrouted.kicad_prl`, an optional KiCad "
        "UI-preference file, is omitted. Every other project file matches the Step15 per-file "
        "SHA-256 manifest. The original local 69-file checkpoint remains separate.\n\n"
        f"Native PCB SHA-256: `{summary['board_sha256']}`. "
        "The schematic overview captions were clarified in Step15 without changing the PCB, "
        "electrical netlist or fitted BOM. See `reports/Step15_Overview_Annotation_Handoff.md` "
        "and the site validation files. The purchasing tables are candidates to source, not orders.\n")
    (DEST / "validation/Website_Import_Audit.json").write_text(json.dumps(summary, indent=2) + "\n")
    write_purchasing_exports(rows, summary)
    package_manifest()
    with zipfile.ZipFile(DEST / "FPGA50T_Two_60_Compact_Review_2026-09-28.zip", "w", zipfile.ZIP_DEFLATED) as archive:
        for item in (DEST / "project").rglob("*"):
            if item.is_file():
                archive.write(item, item.relative_to(DEST))
    with CSV.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    update_table(rows)
    board_rel = (DEST / "project/hardware" / f"{STEM}.kicad_pcb").relative_to(REPO).as_posix()
    meta = build_3d_metadata(facts, board_rel, summary["board_sha256"], summary["unconnected"])
    publish_native_assets(facts, DEST / "project/hardware" / f"{STEM}.kicad_pcb",
                          summary["board_sha256"], summary["unconnected"],
                          summary["drc_reported_unconnected"], meta)
    # Board SVG/GLB export also recreates KiCad's local preferences file.
    for preferences in DEST.rglob("*.kicad_prl"):
        preferences.unlink()
    update_featured_copy(summary, "Website_Fresh_DRC.json", args.erc.name)
    update_summary_links(summary, meta)
    update_source_manifest(summary)
    print("Imported immutable dated CAD project and updated featured viewer, 3D and purchasing page.")


if __name__ == "__main__":
    main()
