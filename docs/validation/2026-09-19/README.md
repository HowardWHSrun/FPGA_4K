# Reference verification — September 19, 2026

The documented fetch and default simulation command were run against a freshly downloaded **FPGA_512 commit `767e82528780005cbcb37b3e926197755bac622e`**. All 198 tracked files matched their Git blobs before and after execution. No hardware was accessed and no bitstream was built.

| Check | Observed result | Evidence |
|---|---|---|
| Auto-adjust | 3,200 samples, zero errors, PASS | [Log](tb_auto_adjust.log) |
| Four-lane framing | 40 frames, 10 per lane, zero errors, PASS | [Log](tb_4lane_framed.log) |
| Counter and overflow | 128 frames, 32 per lane, zero errors, drop reconciliation OK, PASS | [Log](tb_4lane_counter.log) |

[Machine-readable result](report.json) · [Icarus version](iverilog-version.log) · [runtime version](vvp-version.log)

The local run used Python 3.9.6, Git 2.54.0 and Icarus 14 development. Use [the software guide](../../software.md) to reproduce it. The tests validate selected behavioral modules with synthetic stimuli. They do not validate arbitrary ADC values, electrical timing, top-level PLL/CDC/USB, the physical channel map, Artix-7 implementation, stimulation or 4K end-to-end operation.

Document/source checks also passed before upload. The linked logs record this dated run; a later commit or tool change requires fresh results rather than relabeling these logs.
