# Interactive PCB layout viewers V8

The layout method is reused from the 21 October V2 meeting: the locally pinned KiCanvas renderer reads the native KiCad PCB directly, with layer presets, layer visibility, filled planes, silkscreen, component inspection, net highlighting, fit, zoom and flip. The dependency includes the existing KiCad 10 named-net compatibility adapter and original license notices.

Each `board.json` records source identity, SHA-256 and native geometry counts, which the viewer checks before becoming ready. Both delivered PCB files are unchanged copies of the exact snapshots represented by the previous October 28 deck. Breakout remains the unrouted placement snapshot; newer routed work remains separate. Carrier is the retained 27 October snapshot. Visualization does not alter engineering status.

Open through HTTP, not `file://`. Vendor files are local.
