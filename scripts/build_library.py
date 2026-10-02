#!/usr/bin/env python3
"""Build a source-grounded static library and small previews without changing originals.

Requires Python 3.9+, Node.js and sharp for thumbnail generation. The Codex bundled
runtime is discovered when available; otherwise set --node and --sharp-module.
All other work uses Python's standard library. Output is deterministic for a fixed
source tree and sharp version. --check validates the committed catalog and hashes.
"""

import argparse
from collections import Counter
import hashlib
import html
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import quote, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "presentation/library"
VISUAL_INDEX = "presentation/meetings/assets/2026-09-30/visual-index.json"
THUMB_WIDTH, THUMB_HEIGHT = 560, 350
RUNTIME = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".svg", ".webp"}
EXCLUDED_IMAGES = {"review-icon.svg", "sprites.svg"}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def dump(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def rel_url(path):
    return "../../" + quote(path, safe="/-._~")


def source_url(path):
    # GitHub Pages does not render repository Markdown as a reading view.
    if path.endswith(".md"):
        return "https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/" + quote(path, safe="/-._~")
    return rel_url(path)


def normalized_meeting_link(value):
    """Rebase old visual-index links from their original meetings directory."""
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return value
    target = (ROOT / "presentation/meetings" / unquote(parsed.path)).resolve()
    relative = target.relative_to(ROOT).as_posix()
    url = rel_url(relative) + ("/" if parsed.path.endswith("/") and relative != "." else "")
    if parsed.query:
        url += "?" + parsed.query
    if parsed.fragment:
        url += "#" + parsed.fragment
    return url


def source_date(path):
    match = re.search(r"20\d{2}-\d{2}-\d{2}", path)
    return match.group(0) if match else "Preserved reference"


def topic_for(path):
    lowered = path.lower()
    if "sheets/" in lowered or "schematic/" in lowered:
        return "Schematics"
    if "xem8310-adapter" in lowered or "adapter/" in lowered or "xem/" in lowered:
        return "XEM adapter"
    if "pins/" in lowered or "micro_hdmi_contacts" in lowered:
        return "Pins & interfaces"
    if "slides/" in lowered or "hardware/assembly/" in lowered or "hardware/previews/" in lowered:
        return "ASIC & assembly"
    if "firmware/" in lowered or "docs/team/" in lowered:
        return "Software & workflow"
    if "meetings/" in lowered and "assets/" not in lowered:
        return "Meetings & decisions"
    if "xem" in lowered or "brk8310" in lowered:
        return "XEM adapter"
    return "FPGA boards"


def human_name(path):
    value = Path(path).stem
    value = re.sub(r"[_-]+", " ", value)
    value = value.replace("FPGA100T", "100T").replace("FPGA50T", "50T").replace("FPGA25T", "25T")
    value = value.replace("Current ", "").replace("current ", "")
    return value[:1].upper() + value[1:]


def revision_for(path):
    lower = path.lower()
    adapter = re.search(r"(?:/|_)r(\d+)(?:[-_/]|\b)", lower)
    if adapter:
        return "R" + adapter.group(1)
    for key, label in (("25t", "25T"), ("50t", "50T"), ("100t", "100T")):
        if key in lower:
            return label + (" USB-C" if "usb-c" in lower else "")
    if "size_optimization/candidate" in lower:
        return "37.5 × 36 mm placement"
    if "layout_v2" in lower:
        return "33 × 36 mm placement"
    return ""


def context_for(path):
    lower = path.lower()
    if "r12-single-link" in lower:
        return "R12 single-link engineering draft · routing in progress"
    if "25t" in lower:
        return "25T dated engineering review · PCB unrouted"
    if "r10-hdi" in lower:
        return "Preserved R10 three-port HDI study · unqualified"
    if "xem8310-adapter" in lower:
        return "Preserved XEM adapter study · not a fabrication release"
    if "50t" in lower:
        return "Historical 50T study · separate from the selected 25T design"
    if "100t" in lower or "fpga-interface-study" in lower:
        return "Historical FPGA study · retain this source's own revision and audit"
    if "meetings" in lower:
        return "Dated meeting material · reported discussion or proposal"
    if "firmware" in lower:
        return "Development source or reference · hardware operation not established"
    return "Preserved source reference · date and engineering status may be incomplete"


def related_for(path):
    lower = path.lower()
    if "r12-single-link/sheets/" in lower:
        sheet = int(re.search(r"sheet-(\d+)", lower).group(1))
        return "../schematic/?board=adapter-r12&sheet=" + str(sheet)
    if "xc7a25t-schematic/sheets/" in lower:
        sheet = int(re.search(r"sheet-(\d+)", lower).group(1))
        return "../schematic/?board=fpga25t&sheet=" + str(sheet)
    if "schematic/overview" in lower:
        return "../schematic/simple.html"
    if "r12-single-link" in lower:
        return "../adapter/assembly.html?revision=r12"
    return ""


def make_entry(data, key=None):
    source = data["source"]
    path = ROOT / source
    if not path.is_file():
        raise ValueError("Missing published source: " + source)
    entry = dict(data)
    entry["id"] = hashlib.sha256((key or source).encode()).hexdigest()[:16]
    entry.setdefault("date", source_date(source))
    entry.setdefault("source_date", entry["date"])
    entry.setdefault("topic", topic_for(source))
    entry.setdefault("revision", revision_for(source))
    entry.setdefault("context", context_for(source))
    entry.setdefault("url", source_url(source))
    if entry.get("query"):
        entry["url"] += "?" + entry.pop("query")
    entry["sha256"] = digest(path)
    entry["bytes"] = path.stat().st_size
    entry["filename"] = path.name
    return entry


def image_entry(path, provenance=None):
    source = str(path)
    data = {"source": source, "type": "Illustration", "title": human_name(source),
            "summary": context_for(source), "image": rel_url(source), "preview_source": source}
    if provenance:
        data["date"] = provenance["date"]
        data["summary"] = provenance["status"]
        data["provenance"] = dict(provenance)
        # The old index sometimes uses a PNG for its preview but an SVG as the
        # full source. Preserve that deliberate original-format choice.
        full = provenance.get("full", rel_url(source))
        full_path = (ROOT / "presentation/meetings" / unquote(urlsplit(full).path)).resolve()
        data["full_source"] = full_path.relative_to(ROOT).as_posix()
        data["image"] = normalized_meeting_link(full)
        data["url"] = data["image"]
        data["full_source_sha256"] = digest(full_path)
        data["full_source_bytes"] = full_path.stat().st_size
        data["title"] = provenance["title"].replace("Current ", "").replace("current ", "")
        if provenance["category"] == "pins":
            data["topic"] = "Pins & interfaces"
        if provenance["category"] == "reference":
            data["topic"] = "ASIC & assembly"
        if provenance["category"] == "schematic":
            data["topic"] = "Schematics"
        detail = provenance.get("detail", "")
        if detail:
            data["related_url"] = normalized_meeting_link(detail)
        if source.endswith("Current_Three_Cable_Assembly.png"):
            data["title"] = "Three-cable assembly · September 30 proposal"
            data["summary"] = "Historical three-board / R10 assembly proposal · fit unqualified"
        if "r10-hdi-feasibility" in source:
            data["summary"] = "Preserved R10 three-port HDI feasibility study · fit and circuit unqualified"
    elif "r12-single-link/sheets/" in source:
        sheet_number = int(re.search(r"sheet-(\d+)", source).group(1))
        sheets = json.loads((ROOT / "presentation/schematic/sheets.json").read_text(encoding="utf-8"))["adapter-r12"]["sheets"]
        data["title"] = "R12 {:02d} · ".format(sheet_number) + sheets[sheet_number - 1]["title"]
    elif "presentation/schematic/overview/" in source:
        titles = {"data": "R12 recording and command connections", "jtag": "R12 programming connections", "power": "R12 proposed power connections"}
        data["title"] = titles.get(path.stem, human_name(source))
    elif source == "presentation/meetings/assets/2026-10-02/LDO_connector_identification.png":
        data["title"] = "J1 + J19 · LDO connector identification"
        data["topic"] = "ASIC & assembly"
        data["summary"] = "October 2 source-coordinate drawing of the confirmed adapter-facing J1/J19 pair. Mating contact numbering and installed heights remain unverified."
        data["revision"] = "J1 J19 XEM8305 one-chip backup"
        data["related_url"] = "../meetings/2026-10-02.html#interfaces"
    revision = revision_for(source)
    if revision and revision.lower() not in data["title"].lower():
        data["title"] += " · " + revision
    if related_for(source):
        data["related_url"] = related_for(source)
    return make_entry(data)


def collect():
    index = json.loads((ROOT / VISUAL_INDEX).read_text(encoding="utf-8"))
    figures = index["figures"]
    entries = []
    seen = set()
    for figure in figures:
        source = figure["path"]
        if digest(ROOT / source) != figure["sha256"]:
            raise ValueError("Original figure hash changed: " + source)
        entries.append(image_entry(Path(source), figure))
        seen.add(source)
    # Supplement the September 30 index with all other published figure files,
    # including R12 sheets and newer interface diagrams. Exclude UI-only sprites.
    for top in ("hardware", "presentation", "sources"):
        for path in sorted((ROOT / top).rglob("*")):
            source = path.relative_to(ROOT).as_posix()
            if not path.is_file() or path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            if source.startswith("presentation/library/") or "/vendor/" in source or path.name in EXCLUDED_IMAGES:
                continue
            if source not in seen:
                entries.append(image_entry(Path(source)))
                seen.add(source)
    curated = json.loads((DEST / "entries.json").read_text(encoding="utf-8"))
    for data in curated:
        entries.append(make_entry(data, data["source"] + "?" + data.get("query", "")))
        seen.add(data["source"])
    # Project PDFs, native packages, source presentations and Word notes are all
    # cataloged. Component manufacturer evidence remains reachable in reports.
    for top in ("hardware", "sources"):
        for path in sorted((ROOT / top).rglob("*")):
            source = path.relative_to(ROOT).as_posix()
            if not path.is_file() or path.suffix.lower() not in {".pdf", ".zip", ".pptx", ".docx", ".stl"}:
                continue
            if "/reports/evidence/" in source or source in seen:
                continue
            kind = "Native files" if path.suffix.lower() in {".zip", ".pptx", ".docx", ".stl"} else "Report"
            entries.append(make_entry({"source": source, "title": human_name(source), "type": kind,
                                       "summary": context_for(source) + " · " + path.suffix[1:].upper()}))
            seen.add(source)
    # Engineering report notes are searchable without importing internal/private
    # histories or vendor documents. The filename and first heading stay grounded.
    for top in ("hardware", "sources/engineering"):
        for path in sorted((ROOT / top).rglob("*.md")):
            source = path.relative_to(ROOT).as_posix()
            if source in seen or "/libraries/" in source or "/project/" in source or "LICENSE" in path.name:
                continue
            if path.name in {"README.md", "START_HERE.md"}:
                # Revision guides contain native project/audit links; retain them
                # as board records while avoiding nested package instructions.
                if path.name != "README.md" or "/dated/" not in source:
                    continue
                if path.parent.name in {"report", "power_review", "purchasing", "layout_v2"}:
                    continue
                kind = "Board revision"
            else:
                kind = "Report"
            text = path.read_text(encoding="utf-8")
            heading = re.search(r"^#\s+(.+)", text, re.M)
            title = heading.group(1).strip() if heading else human_name(source)
            title = title.replace("Current ", "Dated ").replace("current ", "dated ")
            revision = revision_for(source)
            if revision and revision.lower() not in title.lower():
                title += " · " + revision
            entries.append(make_entry({"source": source, "title": title, "type": kind,
                                       "summary": context_for(source)}))
            seen.add(source)
    priority = {"Meeting": 0, "Board revision": 1, "3D viewer": 2, "Report": 3, "Schematic": 4,
                "PCB viewer": 5, "Native files": 6, "Reference": 7, "Illustration": 8}
    # Known dates descend; incomplete source dates stay visibly distinct at end.
    entries.sort(key=lambda e: (e["date"] if re.fullmatch(r"20\d{2}-\d{2}-\d{2}", e["date"]) else "",), reverse=True)
    for date in {e["date"] for e in entries}:
        group = [e for e in entries if e["date"] == date]
        group.sort(key=lambda e: (priority.get(e["type"], 99), e["title"].casefold(), e["source"]))
        indexes = [i for i, e in enumerate(entries) if e["date"] == date]
        for i, entry in zip(indexes, group):
            entries[i] = entry
    return entries, figures


def generate_thumbnails(entries, node, sharp_module):
    thumbs = DEST / "thumbs"
    thumbs.mkdir(parents=True, exist_ok=True)
    jobs = {}
    for entry in entries:
        source = entry.pop("preview_source", None)
        if not source:
            continue
        path = ROOT / source
        sha = digest(path)
        name = hashlib.sha256(source.encode()).hexdigest()[:16] + "-" + sha[:12] + ".webp"
        output = thumbs / name
        entry["preview"] = "thumbs/" + name
        entry["preview_source"] = source
        entry["preview_source_sha256"] = sha
        jobs[name] = {"source": str(path), "output": str(output)}
    pending = [job for job in jobs.values() if not Path(job["output"]).is_file()]
    if pending:
        javascript = r"""
const sharp = require(process.argv[1]);
const jobs = JSON.parse(require('fs').readFileSync(0,'utf8'));
(async function(){
  for (let offset=0; offset<jobs.length; offset+=2) {
    await Promise.all(jobs.slice(offset,offset+2).map(async job => {
      await sharp(job.source,{limitInputPixels:false})
        .resize({width:560,height:350,fit:'contain',background:'#ffffff'})
        .flatten({background:'#ffffff'}).webp({quality:80,effort:4}).toFile(job.output);
    }));
  }
})().catch(error=>{console.error(error.message);process.exit(1);});
"""
        completed = subprocess.run([node, "-e", javascript, sharp_module], input=json.dumps(pending),
                                   text=True, capture_output=True)
        if completed.returncode:
            raise RuntimeError("Thumbnail generation failed: " + completed.stderr.strip())
    # Only remove stale files owned by this generator, never the sources.
    for path in thumbs.glob("*.webp"):
        if path.name not in jobs:
            path.unlink()
    for entry in entries:
        if entry.get("preview"):
            entry["preview_bytes"] = (DEST / entry["preview"]).stat().st_size
    return jobs


def write_fallback(entries):
    groups = {}
    for entry in entries:
        groups.setdefault(entry["type"], []).append(entry)
    lines = ["<!-- Generated by scripts/build_library.py. Source links work without JavaScript. -->"]
    for kind, group in sorted(groups.items()):
        lines.append("<h2>" + html.escape(kind) + "</h2><ul>")
        for entry in group:
            lines.append('<li><a href="' + html.escape(entry["url"], quote=True) + '">' + html.escape(entry["title"]) +
                         "</a> <span>· " + html.escape(entry["date"]) + " · " + html.escape(entry["topic"]) + "</span></li>")
        lines.append("</ul>")
    fallback = "\n".join(lines)
    template = (DEST / "index.template.html").read_text(encoding="utf-8")
    (DEST / "index.html").write_text(template.replace("<!-- LIBRARY_FALLBACK -->", fallback), encoding="utf-8")


def validate(entries, figures):
    ids = [e["id"] for e in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Catalog IDs must be unique")
    sources = {e["source"] for e in entries if e["type"] == "Illustration"}
    if not {f["path"] for f in figures}.issubset(sources):
        raise ValueError("A September 30 indexed figure is missing")
    for entry in entries:
        for key in ("id", "title", "date", "topic", "type", "summary", "url", "source", "sha256"):
            if not entry.get(key):
                raise ValueError("Missing " + key + " in " + entry.get("source", "entry"))
        # Source and local URL checks also prevent accidental ../ escape when
        # future catalog inputs add paths.
        (ROOT / entry["source"]).resolve().relative_to(ROOT)
        if digest(ROOT / entry["source"]) != entry["sha256"]:
            raise ValueError("Catalog source hash mismatch: " + entry["source"])
        if entry.get("preview") and not (DEST / entry["preview"]).is_file():
            raise ValueError("Missing generated thumbnail: " + entry["preview"])
        if entry.get("full_source"):
            (ROOT / entry["full_source"]).resolve().relative_to(ROOT)
            if digest(ROOT / entry["full_source"]) != entry["full_source_sha256"]:
                raise ValueError("Catalog full-source hash mismatch: " + entry["full_source"])
        for key in ("url", "image", "related_url", "preview"):
            value = entry.get(key)
            if not value:
                continue
            url = urlsplit(value)
            if not url.scheme and not url.netloc:
                target = (DEST / unquote(url.path)).resolve()
                target.relative_to(ROOT)
                if not target.exists():
                    raise ValueError("Missing local " + key + ": " + value)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate existing catalog, coverage and original hashes")
    parser.add_argument("--node", default=str(RUNTIME / "node/bin/node") if (RUNTIME / "node/bin/node").exists() else (shutil.which("node") or "node"))
    parser.add_argument("--sharp-module", default=str(RUNTIME / "node/node_modules/sharp") if (RUNTIME / "node/node_modules/sharp").exists() else "sharp")
    args = parser.parse_args()
    if args.check:
        catalog = json.loads((DEST / "catalog.json").read_text(encoding="utf-8"))
        figures = json.loads((ROOT / VISUAL_INDEX).read_text(encoding="utf-8"))["figures"]
        validate(catalog["entries"], figures)
        print("Library check passed: {} entries; all {} source-index figures retained.".format(len(catalog["entries"]), len(figures)))
        return
    entries, figures = collect()
    jobs = generate_thumbnails(entries, args.node, args.sharp_module)
    validate(entries, figures)
    catalog = {"schema_version": 1, "organized": "2026-10-02", "source_visual_index": VISUAL_INDEX,
               "source_visual_count": len(figures), "entry_count": len(entries), "entries": entries}
    dump(DEST / "catalog.json", catalog)
    write_fallback(entries)
    original_bytes = sum(Path(job["source"]).stat().st_size for job in jobs.values())
    thumbnail_bytes = sum(Path(job["output"]).stat().st_size for job in jobs.values())
    report = {"entry_count": len(entries), "types": dict(sorted(Counter(e["type"] for e in entries).items())),
              "topics": dict(sorted(Counter(e["topic"] for e in entries).items())), "source_visual_count": len(figures),
              "thumbnail_count": len(jobs), "thumbnail_dimensions": [THUMB_WIDTH, THUMB_HEIGHT],
              "original_image_bytes": original_bytes, "thumbnail_bytes": thumbnail_bytes,
              "thumbnail_reduction_percent": round((1 - thumbnail_bytes / original_bytes) * 100, 2),
              "original_sources_modified": False, "initial_cards": 24,
              "source_date_policy": "Keep indexed source dates; infer additional dated-file dates only from published paths. Undated material is labeled Preserved reference.",
              "catalog_sha256": digest(DEST / "catalog.json")}
    dump(DEST / "build-report.json", report)
    readme = DEST / "README.md"
    if readme.exists():
        stats = ("The generated catalog contains **{entry_count} records**, including **{images} illustrations** and **{viewers} 3D viewer entry points**. "
                 "All **{source_visual_count} figures** from the original September 30 index are retained. "
                 "The **{thumbnail_count} previews** total **{preview_mb:.2f} MB**, compared with **{original_mb:.2f} MB** of original image files "
                 "(**{thumbnail_reduction_percent}% smaller**); only 24 cards are created initially. "
                 "Exact counts, byte totals and source-date policy are recorded in [build-report.json](build-report.json).".format(
                     **report, images=report["types"].get("Illustration", 0), viewers=report["types"].get("3D viewer", 0),
                     preview_mb=thumbnail_bytes / 1_000_000, original_mb=original_bytes / 1_000_000))
        text = readme.read_text(encoding="utf-8")
        text = re.sub(r"(?<=<!-- LIBRARY_STATS_START -->\n).*?(?=\n<!-- LIBRARY_STATS_END -->)", stats, text, flags=re.S)
        readme.write_text(text, encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, RuntimeError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
