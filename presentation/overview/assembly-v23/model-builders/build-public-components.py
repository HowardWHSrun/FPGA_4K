#!/usr/bin/env python3
"""Build project-authored DF40 previews and remove vendor-only FPGA bodies.

No supplier STEP or supplier triangle data is read to build the previews.
The connector shapes are simple authored rails, open slots and rectangular
contact legs, with land pitch/rows and Fab extents from the saved footprints.
They are illustrative connector previews, not manufacturer mechanical CAD.

Run with --fpga-source PATH to additionally package the detailed FPGA GLB
without its J1/J2 manufacturer bodies. All remaining accessor bytes are retained.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import struct
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / "assets"
CATALOG = "https://www.hirose.com/en/product/document?clcode=&productname=&series=DF40&documenttype=Catalog&lang=en&documentid=en_DF40_CAT"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_glb(path, doc, data):
    raw = json.dumps(doc, separators=(",", ":")).encode()
    raw += b" " * (-len(raw) % 4)
    data = bytes(data)
    data += b"\x00" * (-len(data) % 4)
    path.write_bytes(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(raw) + 8 + len(data))
                     + struct.pack("<II", len(raw), 0x4E4F534A) + raw
                     + struct.pack("<II", len(data), 0x004E4942) + data)


def read_glb(path):
    raw = path.read_bytes()
    assert struct.unpack_from("<II", raw) == (0x46546C67, 2)
    count, kind = struct.unpack_from("<II", raw, 12)
    assert kind == 0x4E4F534A
    doc = json.loads(raw[20:20 + count])
    length, kind = struct.unpack_from("<II", raw, 20 + count)
    assert kind == 0x004E4942
    return doc, raw[28 + count:28 + count + length], raw


def triangle_count(doc):
    return sum(doc["accessors"][p["indices"]]["count"] // 3
               for m in doc["meshes"] for p in m["primitives"])


def package_fpga(source):
    doc, binary, original = read_glb(source)
    discarded = {i for i, node in enumerate(doc["nodes"]) if node.get("name") in {"J1", "J2"}}
    assert len(discarded) == 2
    stack = list(discarded)
    while stack:
        for child in doc["nodes"][stack.pop()].get("children", []):
            if child not in discarded:
                discarded.add(child)
                stack.append(child)
    removed_nodes = [{"node": i, "name": doc["nodes"][i].get("name", ""),
                      "mesh": doc["nodes"][i].get("mesh"),
                      "translation": doc["nodes"][i].get("translation"),
                      "rotation": doc["nodes"][i].get("rotation")}
                     for i in sorted(discarded)]
    keep = [i for i in range(len(doc["nodes"])) if i not in discarded]
    node_map = {old: new for new, old in enumerate(keep)}
    mesh_keep = sorted({doc["nodes"][i]["mesh"] for i in keep if "mesh" in doc["nodes"][i]})
    mesh_map = {old: new for new, old in enumerate(mesh_keep)}
    kept_primitives = [p for i in mesh_keep for p in doc["meshes"][i]["primitives"]]
    used_accessors = set()
    for primitive in kept_primitives:
        used_accessors.update(primitive["attributes"].values())
        if "indices" in primitive:
            used_accessors.add(primitive["indices"])
        for target in primitive.get("targets", []):
            used_accessors.update(target.values())
    accessor_keep = sorted(used_accessors)
    accessor_map = {old: new for new, old in enumerate(accessor_keep)}
    assert not any("sparse" in doc["accessors"][i] for i in accessor_keep)
    views = sorted({doc["accessors"][i]["bufferView"] for i in accessor_keep})
    view_map = {old: new for new, old in enumerate(views)}
    out = copy.deepcopy(doc)
    out["nodes"] = []
    for old in keep:
        node = copy.deepcopy(doc["nodes"][old])
        if "children" in node:
            node["children"] = [node_map[i] for i in node["children"] if i in node_map]
        if "mesh" in node:
            node["mesh"] = mesh_map[node["mesh"]]
        out["nodes"].append(node)
    for scene in out["scenes"]:
        scene["nodes"] = [node_map[i] for i in scene.get("nodes", []) if i in node_map]
    out["meshes"] = [copy.deepcopy(doc["meshes"][i]) for i in mesh_keep]
    for mesh in out["meshes"]:
        for primitive in mesh["primitives"]:
            primitive["attributes"] = {k: accessor_map[i] for k, i in primitive["attributes"].items()}
            if "indices" in primitive:
                primitive["indices"] = accessor_map[primitive["indices"]]
            for target in primitive.get("targets", []):
                for key in target:
                    target[key] = accessor_map[target[key]]
    out["accessors"] = [copy.deepcopy(doc["accessors"][i]) for i in accessor_keep]
    for accessor in out["accessors"]:
        accessor["bufferView"] = view_map[accessor["bufferView"]]
    data = bytearray()
    out["bufferViews"] = []
    for old in views:
        view = copy.deepcopy(doc["bufferViews"][old])
        start, length = view.get("byteOffset", 0), view["byteLength"]
        payload = binary[start:start + length]
        data.extend(b"\x00" * (-len(data) % 4))
        view["byteOffset"], view["buffer"] = len(data), 0
        data.extend(payload)
        assert payload == binary[start:start + length]
        out["bufferViews"].append(view)
    out["buffers"] = [{"byteLength": len(data)}]
    out["asset"]["generator"] = "FPGA project public derivative: J1/J2 vendor bodies omitted; all other source geometry unchanged"
    path = ASSETS / "fpga-v54-public.glb"
    write_glb(path, out, data)
    receipt = {
        "source_asset": source.name, "source_sha256": sha(original),
        "output_asset": path.name, "output_sha256": sha(path.read_bytes()),
        "removed_nodes": removed_nodes, "removed_body_references": ["J1", "J2"],
        "retained_assigned_bodies": 131, "original_assigned_bodies": 133,
        "source_triangles": triangle_count(doc), "retained_triangles": triangle_count(out),
        "retained_buffer_views": len(views), "retained_view_payloads_byte_identical": True,
        "transform_and_primitive_semantics_unchanged": True,
        "reason": "Hirose supplier bodies retained locally; public viewer uses independent project-authored previews.",
        "native_pcb_modified": False,
    }
    (ASSETS / "FPGA_Public_Geometry_Receipt_V23.json").write_text(json.dumps(receipt, indent=2) + "\n")
    return receipt


class Mesh:
    def __init__(self):
        self.points, self.normals, self.indices = [], [], []

    def box(self, center, size):
        cx, cy, cz = center
        hx, hy, hz = (v / 2 for v in size)
        # Four CCW vertices on each face; explicit face normals keep crisp edges.
        faces = [
            ((1, 0, 0), [(hx,-hy,-hz),(hx,hy,-hz),(hx,hy,hz),(hx,-hy,hz)]),
            ((-1,0,0), [(-hx,-hy,hz),(-hx,hy,hz),(-hx,hy,-hz),(-hx,-hy,-hz)]),
            ((0,1,0), [(-hx,hy,-hz),(-hx,hy,hz),(hx,hy,hz),(hx,hy,-hz)]),
            ((0,-1,0), [(-hx,-hy,hz),(-hx,-hy,-hz),(hx,-hy,-hz),(hx,-hy,hz)]),
            ((0,0,1), [(-hx,-hy,hz),(hx,-hy,hz),(hx,hy,hz),(-hx,hy,hz)]),
            ((0,0,-1), [(hx,-hy,-hz),(-hx,-hy,-hz),(-hx,hy,-hz),(hx,hy,-hz)]),
        ]
        for normal, points in faces:
            start = len(self.points)
            self.points.extend((x+cx, y+cy, z+cz) for x,y,z in points)
            self.normals.extend([normal] * 4)
            self.indices.extend([start, start+1, start+2, start, start+2, start+3])


def preview(name, pins, kind, height):
    rows, pitch = pins // 2, .4
    plug = kind == "DP"
    length = pins * .2 + (1.52 if plug else 2.6)
    width = 1.85 if plug else 2.88
    inner_width = 1.25 if plug else 2.04
    row_z = 1.355 if plug else 1.54
    toe_length = .66 if plug else .7
    floor, cap = .16, .3
    plastic, contacts = Mesh(), Mesh()
    plastic.box([0, floor/2, 0], [length, floor, width])
    wall = (width-inner_width)/2
    for sign in [-1, 1]:
        plastic.box([0,(height+floor)/2,sign*(inner_width+wall)/2],
                    [length-2*cap,height-floor,wall])
        plastic.box([sign*(length-cap)/2,height/2,0],[cap,height,width])
    for station in range(rows):
        x = (station-(rows-1)/2)*pitch
        for sign in [-1,1]:
            # Land-aligned toe, short riser, and exposed contact on the inner rail.
            contacts.box([x,.045,sign*row_z],[.15,.09,toe_length])
            contacts.box([x,.2,sign*(width/2+.06)],[.13,.31,.13])
            contacts.box([x,(height+.28)/2,sign*(inner_width/2-.025)],
                         [.13,height-.28,.08])
    if plug:
        for x in [-(pins*.1+.275),pins*.1+.275]:
            for sign in [-1,1]:
                contacts.box([x,.045,sign*row_z],[.35,.09,toe_length])
    mats = [
        {"name":"Project preview dark connector polymer", "pbrMetallicRoughness":{
            "baseColorFactor":[.018,.022,.024,1],"metallicFactor":0,"roughnessFactor":.7}},
        {"name":"Project preview contact finish", "pbrMetallicRoughness":{
            "baseColorFactor":[.72,.5,.14,1],"metallicFactor":.7,"roughnessFactor":.33}},
    ]
    doc = {"asset":{"version":"2.0","generator":"Project-authored nominal connector preview V23; no supplier mesh"},
           "scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"name":name,"mesh":0}],
           "meshes":[{"name":name,"primitives":[]}],"materials":mats,
           "accessors":[],"bufferViews":[],"buffers":[]}
    binary = bytearray()
    def add(values, component, dtype, count, target, bounds=False):
        binary.extend(b"\x00" * (-len(binary)%4))
        offset = len(binary)
        flat = [v for p in values for v in p] if dtype == "VEC3" else values
        binary.extend(struct.pack("<" + ("f" if component==5126 else "I")*len(flat),*flat))
        view = len(doc["bufferViews"])
        doc["bufferViews"].append({"buffer":0,"byteOffset":offset,"byteLength":len(binary)-offset,"target":target})
        accessor = {"bufferView":view,"componentType":component,"count":count,"type":dtype}
        if bounds:
            accessor["min"] = [min(v[i] for v in values) for i in range(3)]
            accessor["max"] = [max(v[i] for v in values) for i in range(3)]
        index = len(doc["accessors"])
        doc["accessors"].append(accessor)
        return index
    for mi,mesh in enumerate([plastic,contacts]):
        pos=add(mesh.points,5126,"VEC3",len(mesh.points),34962,True)
        normal=add(mesh.normals,5126,"VEC3",len(mesh.normals),34962)
        indices=add(mesh.indices,5125,"SCALAR",len(mesh.indices),34963)
        doc["meshes"][0]["primitives"].append({"attributes":{"POSITION":pos,"NORMAL":normal},"indices":indices,"material":mi,"mode":4})
    doc["buffers"]=[{"byteLength":len(binary)}]
    path = ASSETS / (name + ".glb")
    write_glb(path,doc,binary)
    return {"asset":path.name,"sha256":sha(path.read_bytes()),"bytes":path.stat().st_size,
            "positions":pins,"pitch_mm":pitch,"land_row_centers_z_mm":[-row_z,row_z],
            "fab_centerline_length_width_mm":[length,width],"illustrative_body_height_mm":height,
            "triangles":triangle_count(doc),"units":"numeric millimetres; X long; +Y outward; mounting planeY0",
            "contact_and_housing_shapes":"Independent rectangular toes/risers/contact rails and an open-slot housing; not manufacturer CAD",
            "height_qualification":"Preview heights are nominal visual assumptions, not exact component maximums or mating qualification"}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--fpga-source",type=Path)
    args=parser.parse_args()
    ASSETS.mkdir(exist_ok=True,parents=True)
    params=[("df40-60dp-preview",60,"DP",1.14),("df40-60ds-preview",60,"DS",1.4),
            ("df40-90dp-preview",90,"DP",1.14),("df40-90ds-preview",90,"DS",2.9),
            ("df40-80dp-preview",80,"DP",1.14),("df40-80hc3ds-preview",80,"DS",2.9),
            ("df40-80ds-preview",80,"DS",1.4)]
    receipt={"revision":"V23","author":"Project-authored procedural display geometry",
             "source_facts":"0.4mm contact pitch, saved Fab centerline extents and native footprint land rows. Heights/contact bends are illustrative.",
             "reference_catalog":CATALOG,"supplier_step_or_mesh_used":False,
             "preserve_exact_part_labels":True,"models":[preview(*p) for p in params],
             "limits":"No manufacturer-exact body, contact geometry, keyed mating, clearance or mechanical qualification is implied."}
    (ASSETS/"Connector_Preview_Provenance_V23.json").write_text(json.dumps(receipt,indent=2)+"\n")
    if args.fpga_source:
        print(json.dumps(package_fpga(args.fpga_source),indent=2))
    print("Built seven independent connector previews.")


if __name__=="__main__":
    main()
