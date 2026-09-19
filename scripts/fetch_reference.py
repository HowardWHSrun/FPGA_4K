#!/usr/bin/env python3
"""Fetch an exact reference commit, or verify an existing checkout without edits."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "references" / "repositories.json"


def references():
    return json.loads(REGISTER.read_text(encoding="utf-8"))["references"]


def git(path, *args):
    # Do not run local Git hooks or refresh the existing checkout's index.
    env = dict(os.environ, GIT_OPTIONAL_LOCKS="0", GIT_TERMINAL_PROMPT="0")
    result = subprocess.run(
        ["git", "-c", "core.hooksPath=" + os.devnull, "-C", str(path), *args],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, timeout=300,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.decode("utf-8", errors="replace").strip())
    return result.stdout


def verify_reference(path, spec):
    """Check HEAD and actual worktree bytes against every blob in the pinned tree.

    Read-only: no fetch/reset/clean, no dependence on index stat caching, and no
    assumption that skip-worktree or assume-unchanged flags imply clean files.
    Untracked files are left alone and are never inputs to the test runner.
    """
    path = Path(path).resolve()
    actual = git(path, "rev-parse", "HEAD").decode().strip()
    if actual != spec["commit"]:
        raise RuntimeError("Reference HEAD differs from the required commit; existing checkout left unchanged.")
    records = git(path, "ls-tree", "-r", "-z", spec["commit"]).split(b"\0")
    checked = 0
    for record in records:
        if not record:
            continue
        metadata, raw_name = record.split(b"\t", 1)
        mode, kind, expected = metadata.split()
        name = os.fsdecode(raw_name)
        if kind != b"blob":
            raise RuntimeError("Nested reference/submodule requires separate review: " + name)
        item = path / name
        if mode == b"120000":
            if not item.is_symlink():
                raise RuntimeError("Reference symlink differs: " + name)
            data = os.fsencode(os.readlink(item))
        else:
            if item.is_symlink() or not item.is_file() or not item.resolve().is_relative_to(path):
                raise RuntimeError("Reference file missing or redirected: " + name)
            data = item.read_bytes()
        digest = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
        if digest != expected.decode():
            raise RuntimeError("Reference content differs from the pinned Git blob: " + name)
        checked += 1
    if not checked:
        raise RuntimeError("Pinned tree contained no checked files.")
    return {"commit": actual, "files_checked": checked, "worktree_matches_commit": True}


def fetch_one(name, spec, verify_only=False, override=None):
    target = Path(override).expanduser().resolve() if override else ROOT / spec["directory"]
    if target.exists() or target.is_symlink():
        report = verify_reference(target, spec)
        print(name + ": verified existing checkout; " + json.dumps(report))
        return
    if verify_only or override:
        raise RuntimeError("Reference does not exist: " + str(target))
    target.parent.mkdir(parents=True, exist_ok=True)
    # Reserve a new directory; never repurpose an existing user's checkout.
    target.mkdir(exist_ok=False)
    print(name + ": fetching pinned upstream commit into " + str(target), flush=True)
    git(target, "init", "--quiet")
    git(target, "remote", "add", "origin", spec["url"])
    git(target, "fetch", "--quiet", "--depth=1", "origin", spec["commit"])
    git(target, "-c", "core.autocrlf=false", "checkout", "--quiet", "--detach", spec["commit"])
    print(name + ": " + json.dumps(verify_reference(target, spec)))


def main():
    registry = references()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reference", choices=[*registry, "all"], nargs="?", default="fpga512")
    parser.add_argument("--verify-only", action="store_true", help="Do not access the network or create files.")
    parser.add_argument("--path", type=Path, help="Verify a local checkout instead; never fetch into it.")
    args = parser.parse_args()
    if args.path and args.reference == "all":
        parser.error("--path requires one named reference")
    for name in registry if args.reference == "all" else [args.reference]:
        fetch_one(name, registry[name], args.verify_only, args.path)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as exc:
        print("Reference setup failed: " + str(exc), file=sys.stderr)
        print("Existing checkouts were not reset or cleaned. A new failed fetch may leave a partial directory; inspect it before retrying.", file=sys.stderr)
        sys.exit(2)
