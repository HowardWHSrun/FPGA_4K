#!/usr/bin/env python3
"""Run three pinned FPGA_512 behavioral benches with no hardware access."""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

from fetch_reference import ROOT, references, verify_reference

COMMON = ["fpga/adc_auto_adjust.v", "fpga/usb_framer.v", "fpga/pair_tdm_framer.v",
          "fpga/lane_frame_arbiter.v", "decoder/UWB_Serial_Handler.v"]
TESTS = {
    "tb_auto_adjust": ["sim/tb_auto_adjust.v", "fpga/adc_auto_adjust.v"],
    "tb_4lane_framed": ["sim/tb_4lane_framed.v", *COMMON],
    "tb_4lane_counter": ["sim/tb_4lane_counter.v", *COMMON],
}
LIMITATIONS = [
    "Selected behavioral modules only: no top-level PLL, clock-domain-crossing FIFO, physical IO, FT600 or USB.",
    "Synthetic values and alignment assumptions do not validate arbitrary ADC codes; the counter bench forces sample bit 11 high.",
    "No synthesis, place-and-route, timing closure, hardware programming, analog behavior, electrode mapping, or 4K integration.",
]


def assess_output(name, text):
    """Require completion and non-vacuous checks: upstream $finish can exit zero on FAIL."""
    if not re.search(r"(?m)^\s*PASS\s*$", text):
        return False
    if re.search(r"(?im)^\s*(FAIL\b|FATAL\b|ERROR\b)", text):
        return False
    if name == "tb_auto_adjust":
        total = re.search(r"TOTAL:\s*0 errors / (\d+) samples", text)
        return bool(total and int(total[1]) >= 3200)
    lanes = re.search(r"per lane: L0=(\d+) L1=(\d+) L2=(\d+) L3=(\d+)", text)
    if not lanes or min(map(int, lanes.groups())) < 10:
        return False
    if name == "tb_4lane_framed":
        return bool(re.search(r"TOTAL:\s*0 errors\s*$", text, re.MULTILINE))
    checked = re.findall(r"ch \d+: (\d+) samples checked, holds=0 skips=0 other=0", text)
    return bool(len(checked) == 8 and min(map(int, checked)) > 1000
                and re.search(r"TOTAL:\s*0 errors, drop reconciliation\s+OK", text))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tests", nargs="*", metavar="TEST", help="One or more of: " + ", ".join(TESTS))
    parser.add_argument("--reference", type=Path, help="Read-only local FPGA_512 checkout override.")
    parser.add_argument("--output", type=Path, default=ROOT / "build" / "reference-checks",
                        help="Parent for a new run folder; existing evidence is retained.")
    args = parser.parse_args()
    if any(name not in TESTS for name in args.tests):
        parser.error("Unknown test; choose from: " + ", ".join(TESTS))
    spec = references()["fpga512"]
    source = (args.reference or ROOT / spec["directory"]).expanduser().resolve()
    before = verify_reference(source, spec)
    env = dict(os.environ)
    if env.get("OSS_CAD_SUITE"):
        env["PATH"] = str(Path(env["OSS_CAD_SUITE"]).expanduser() / "bin") + os.pathsep + env.get("PATH", "")
    compiler, runtime = (shutil.which(name, path=env.get("PATH")) for name in ("iverilog", "vvp"))
    if not compiler or not runtime:
        raise RuntimeError("Install Icarus Verilog (iverilog and vvp) on PATH, or set OSS_CAD_SUITE. See docs/software.md.")
    args.output.mkdir(parents=True, exist_ok=True)
    out = Path(tempfile.mkdtemp(prefix="run-", dir=args.output))
    report = {"checked_at_utc": datetime.now(timezone.utc).isoformat(), "source": before,
              "scope": "Pinned FPGA_512 behavioral regression; no hardware access.",
              "limitations": LIMITATIONS, "tests": {}, "passed": False}
    for executable, label in ((compiler, "iverilog"), (runtime, "vvp")):
        version = subprocess.run([executable, "-V"], text=True, capture_output=True, env=env, timeout=30)
        (out / (label + "-version.log")).write_text(version.stdout + version.stderr, encoding="utf-8")
    for name in args.tests or TESTS:
        with tempfile.TemporaryDirectory(prefix="fpga512-test-") as work:
            directory = Path(work)
            (directory / "sim").mkdir()
            binary = directory / (name + ".vvp")
            command = [compiler, "-g2012", "-s", name, "-o", str(binary),
                       *(str(source / relative) for relative in TESTS[name])]
            result = {"passed": False}
            log = ""
            try:
                compiled = subprocess.run(command, cwd=directory, env=env, text=True,
                                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=120)
                log = "COMPILE\n" + compiled.stdout
                result["compile_exit"] = compiled.returncode
                if compiled.returncode == 0:
                    ran = subprocess.run([runtime, str(binary)], cwd=directory, env=env, text=True,
                                         stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=120)
                    log += "\nSIMULATION\n" + ran.stdout
                    result["simulation_exit"] = ran.returncode
                    result["passed"] = ran.returncode == 0 and assess_output(name, ran.stdout)
            except subprocess.TimeoutExpired:
                result["error"] = "Compilation or simulation exceeded the 120-second limit."
                log += "\nTIMEOUT\n"
            (out / (name + ".log")).write_text(log, encoding="utf-8")
            result["log"] = name + ".log"
            report["tests"][name] = result
            print(name + ": " + ("PASS" if result["passed"] else "FAIL"), flush=True)
    report["source_after"] = verify_reference(source, spec)
    report["passed"] = all(item["passed"] for item in report["tests"].values())
    (out / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("Evidence: " + str(out / "report.json"))
    print("Scope: behavioral reference tests only; no physical or 4K validation.")
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as exc:
        print("Reference checks could not complete: " + str(exc), file=sys.stderr)
        sys.exit(2)
