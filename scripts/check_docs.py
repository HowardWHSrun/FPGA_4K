#!/usr/bin/env python3
"""Read-only, offline documentation and imported-copy checks (Python 3.9+).

This checks links and file integrity, not electrical correctness, timing closure,
fabrication readiness, hardware operation, or the truth of engineering claims.
It never fetches references, executes project programs, or writes files.
"""

import argparse
import hashlib
import html
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "external", "tmp", "build", ".venv", "__pycache__"}
MAX_BYTES = 95 * 1024 * 1024
WORKSTATION_PATH = re.compile(
    r"(?:/(?:Users|home|Volumes)/[^\s<>)\]`]+|/private/var/folders/[^\s<>)\]`]+"
    r"|/mnt/data/[^\s<>)\]`]+|file://[^\s<>)\]`]+|[A-Za-z]:[\\/]Users[\\/][^\s<>)\]`]+)"
)
# Deliberately narrow patterns: this is a basic leak check, not a security audit.
SECRETS = [
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----")),
    ("GitHub token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b")),
    ("AWS access key", re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b")),
    ("Slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{24,}\b")),
]


def inside(path, root):
    try:
        path.resolve().relative_to(root)
        return True
    except (ValueError, OSError, RuntimeError):
        return False


def blank(match):
    return re.sub(r"[^\n]", " ", match.group(0))


def without_code(text, inline=True):
    """Mask fenced/indented code and inline code while retaining line numbers."""
    result = []
    fence = None
    for line in text.splitlines(keepends=True):
        if fence:
            closing = re.match(r"^ {0,3}(" + re.escape(fence[0]) + r"{" + str(fence[1]) + r",})\s*$", line)
            result.append(re.sub(r"[^\n]", " ", line))
            if closing:
                fence = None
        else:
            opening = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
            if opening:
                fence = (opening[1][0], len(opening[1]))
                result.append(re.sub(r"[^\n]", " ", line))
            elif line.startswith("    ") or line.startswith("\t"):
                result.append(re.sub(r"[^\n]", " ", line))
            else:
                result.append(line)
    clean = "".join(result)
    return re.sub(r"(?<!`)(`+)(?!`)([\s\S]*?)(?<!`)\1(?!`)", blank, clean) if inline else clean


def destination(text, position):
    """Read a Markdown destination, including angles and balanced parentheses."""
    while position < len(text) and text[position].isspace():
        position += 1
    if position >= len(text):
        return ""
    angled = text[position] == "<"
    if angled:
        position += 1
    chars = []
    depth = 0
    while position < len(text):
        char = text[position]
        if char == "\\" and position + 1 < len(text):
            chars.append(text[position + 1])
            position += 2
            continue
        if angled:
            if char == ">":
                break
        else:
            if char == "(":
                depth += 1
            elif char == ")":
                if depth == 0:
                    break
                depth -= 1
            elif char.isspace() and depth == 0:
                break
        chars.append(char)
        position += 1
    return html.unescape("".join(chars))


def links(text):
    clean = without_code(text)
    for match in re.finditer(r"(?<!\\)\]\(", clean):
        yield destination(clean, match.end()), clean.count("\n", 0, match.start()) + 1
    # Checking definition destinations also covers reference and shortcut links.
    for match in re.finditer(r"(?m)^ {0,3}\[[^\]\n]+\]:[ \t]*", clean):
        yield destination(clean, match.end()), clean.count("\n", 0, match.start()) + 1
    for match in re.finditer(r"\b(?:href|src)\s*=\s*([\"'])(.*?)\1", clean, re.IGNORECASE):
        yield html.unescape(match[2]), clean.count("\n", 0, match.start()) + 1


def anchors(text):
    # GFM-style headings and explicit HTML anchors; no JavaScript is evaluated.
    clean = without_code(text, inline=False)
    found = set(re.findall(r"\b(?:id|name)=[\"']([^\"']+)[\"']", clean))
    duplicates = {}
    lines = clean.splitlines()
    for number, line in enumerate(lines):
        match = re.match(r"^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$", line)
        title = match[1] if match else None
        if title is None and number + 1 < len(lines) and line.strip():
            if re.match(r"^ {0,3}(?:=+|-+)\s*$", lines[number + 1]):
                title = line.strip()
        if title is None:
            continue
        title = re.sub(r"!?\[([^\]]+)\]\([^)]*\)", r"\1", title)
        title = html.unescape(re.sub(r"<[^>]+>", "", title)).lower()
        title = re.sub(r"\*+|~+|`+", "", title)
        slug = re.sub(r"[^\w\-\s]", "", title, flags=re.UNICODE)
        slug = re.sub(r"\s", "-", slug.strip())
        count = duplicates.get(slug, 0)
        duplicates[slug] = count + 1
        found.add(slug + ("-" + str(count) if count else ""))
    return found


def manifest(root, errors):
    path = root / "sources/manifest.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        errors.append("sources/manifest.json: cannot read manifest: " + str(exc))
        return set()
    if not isinstance(data, dict) or data.get("schema_version") != 1 or not isinstance(data.get("files"), list):
        errors.append("sources/manifest.json: expected schema_version 1 and a files array")
        return set()
    if not isinstance(data.get("imported_at"), str):
        errors.append("sources/manifest.json: imported_at must be a date string")
    imported = set()
    for number, entry in enumerate(data["files"], 1):
        label = "sources/manifest.json entry " + str(number)
        if not isinstance(entry, dict):
            errors.append(label + ": expected an object")
            continue
        relative = entry.get("path")
        if not isinstance(relative, str) or not relative or "\\" in relative:
            errors.append(label + ": path must be a nonempty repository-relative POSIX path")
            continue
        parts = PurePosixPath(relative).parts
        target = root / relative
        if PurePosixPath(relative).is_absolute() or ".." in parts or any(part in EXCLUDED for part in parts) or not inside(target, root):
            errors.append(label + ": unsafe or excluded path: " + relative)
            continue
        if relative in imported:
            errors.append(label + ": duplicate path: " + relative)
        imported.add(relative)
        for key in ("origin", "status", "transformation", "note"):
            if not isinstance(entry.get(key), str):
                errors.append(label + ": " + key + " must be a string")
        expected = entry.get("sha256")
        if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", expected):
            errors.append(label + ": invalid sha256 for " + relative)
            continue
        size = entry.get("bytes")
        if type(size) is not int or size < 0:
            errors.append(label + ": bytes must be a nonnegative integer for " + relative)
        try:
            actual_size = target.stat().st_size
            digest = hashlib.sha256()
            with target.open("rb") as source:
                for chunk in iter(lambda: source.read(1024 * 1024), b""):
                    digest.update(chunk)
        except OSError as exc:
            errors.append(label + ": cannot read " + relative + ": " + str(exc))
            continue
        if actual_size != size:
            errors.append(relative + ": manifest byte count differs (expected " + str(size) + ", found " + str(actual_size) + ")")
        if digest.hexdigest() != expected.lower():
            errors.append(relative + ": SHA-256 differs from manifest")
        original = entry.get("source_sha256")
        if original is not None:
            if not isinstance(original, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", original):
                errors.append(label + ": invalid source_sha256")
            elif original.lower() != expected.lower() and str(entry.get("transformation") or "").strip().lower() in ("", "none", "unchanged", "unchanged copy", "identity"):
                errors.append(relative + ": source/import hashes differ without a documented transformation")
    return imported


def repository_files(root, errors):
    files = []
    for directory, names, filenames in os.walk(root, followlinks=False):
        current = Path(directory)
        for name in names + filenames:
            path = current / name
            relative = path.relative_to(root).as_posix()
            if name == ".git" and current != root:
                errors.append(relative + ": nested Git metadata must not be imported")
            if path.is_symlink() and not inside(path, root):
                errors.append(relative + ": symlink points outside the repository")
        names[:] = sorted(name for name in names if name not in EXCLUDED and not (current / name).is_symlink())
        for name in sorted(filenames):
            path = current / name
            if name not in EXCLUDED and inside(path, root):
                files.append(path)
    try:
        tracked = subprocess.run(["git", "-C", str(root), "ls-files", "--cached", "-z"],
                                 check=True, capture_output=True, timeout=15).stdout
        for name in tracked.decode("utf-8", errors="replace").split("\0"):
            if name and PurePosixPath(name).name == ".DS_Store":
                errors.append(name + ": tracked .DS_Store file must be removed")
    except (OSError, subprocess.SubprocessError):
        errors.append("Cannot inspect tracked files with git; run this in a Git checkout with git installed")
    return files


def check_link(root, source, raw, line, errors, anchor_cache):
    if not raw:
        return
    label = source.relative_to(root).as_posix() + ":" + str(line)
    try:
        parsed = urlsplit(raw)
    except ValueError:
        errors.append(label + ": invalid link destination")
        return
    if re.match(r"^[A-Za-z]:[\\/]", raw):
        errors.append(label + ": absolute local link must use a repository-relative path: " + raw)
        return
    # Web, mail, DOI, and other remote links cannot be verified offline.
    if parsed.scheme and parsed.scheme.lower() != "file":
        return
    if parsed.netloc and parsed.scheme.lower() != "file":
        return
    relative = unquote(parsed.path)
    if parsed.scheme.lower() == "file" or relative.startswith(("/", "\\")) or re.match(r"^[A-Za-z]:", relative):
        errors.append(label + ": absolute local link must use a repository-relative path: " + raw)
        return
    target = source.parent / relative if relative else source
    if not inside(target, root):
        errors.append(label + ": link escapes the repository: " + raw)
        return
    if not target.exists():
        errors.append(label + ": missing local link target: " + raw)
        return
    fragment = unquote(parsed.fragment)
    if fragment and target.suffix.lower() == ".md" and target.is_file():
        resolved = target.resolve()
        if resolved not in anchor_cache:
            anchor_cache[resolved] = anchors(target.read_text(encoding="utf-8"))
        if fragment not in anchor_cache[resolved] and fragment.removeprefix("user-content-") not in anchor_cache[resolved]:
            errors.append(label + ": missing Markdown heading/anchor: " + raw)


def check(root):
    root = root.resolve()
    errors = []
    imported = manifest(root, errors)
    # Imported assets must survive a normal clone; editor locks and other ignored
    # files can exist locally without ever entering the published Git tree.
    if imported:
        try:
            ignored = subprocess.run(
                ["git", "-C", str(root), "check-ignore", "--stdin"],
                input="\n".join(sorted(imported)) + "\n", text=True,
                capture_output=True, timeout=15,
            )
            if ignored.returncode not in (0, 1):
                errors.append("Cannot inspect manifest paths against Git ignore rules")
            for name in ignored.stdout.splitlines():
                errors.append(name + ": manifest asset is ignored by Git and will be missing from a normal clone")
        except (OSError, subprocess.SubprocessError):
            errors.append("Cannot inspect manifest paths against Git ignore rules")
    files = repository_files(root, errors)
    markdown_count = 0
    anchor_cache = {}
    for path in files:
        relative = path.relative_to(root).as_posix()
        try:
            size = path.stat().st_size
            if size > MAX_BYTES:
                errors.append(relative + ": file exceeds the 95 MiB limit")
                continue
            content = path.read_bytes()
            if b"\0" in content[:8192]:
                continue
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                continue
            for description, pattern in SECRETS:
                match = pattern.search(text)
                if match:
                    line = text.count("\n", 0, match.start()) + 1
                    # Do not echo the candidate secret in logs.
                    errors.append(relative + ":" + str(line) + ": possible " + description)
            if path.suffix.lower() != ".md":
                continue
            markdown_count += 1
            if relative not in imported:
                for match in WORKSTATION_PATH.finditer(text):
                    line = text.count("\n", 0, match.start()) + 1
                    errors.append(relative + ":" + str(line) + ": workstation-specific absolute path in authored documentation")
            for destination_text, line in links(text):
                check_link(root, path, destination_text, line, errors, anchor_cache)
        except (OSError, UnicodeError, ValueError) as exc:
            errors.append(relative + ": cannot check file: " + str(exc))
    for error in sorted(set(errors)):
        print("ERROR: " + error, file=sys.stderr)
    print("Checked " + str(markdown_count) + " Markdown files and " + str(len(imported)) + " manifest entries.")
    print("Scope: documentation links and copy integrity only; no hardware or electrical validation.")
    if errors:
        print("FAIL: " + str(len(set(errors))) + " documentation/integrity issue(s).", file=sys.stderr)
        return 1
    print("PASS: documentation and imported-copy checks.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="Repository root (default: this script's parent repository).")
    args = parser.parse_args()
    return check(args.root.resolve())


if __name__ == "__main__":
    sys.exit(main())
