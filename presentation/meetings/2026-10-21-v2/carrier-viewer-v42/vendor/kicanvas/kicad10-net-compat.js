/* FPGA_4K adaptation to the pinned KiCanvas alpha, 2026-09-26.
 * Called at the end of KiCanvas' KicadPCB constructor, before any painting.
 * KiCad 10 stores a quoted net name on each copper item and omits the numbered
 * top-level net table. KiCanvas' original renderer expects numeric net indices.
 * This builds that internal index without changing the source PCB text or files.
 */
function fpga4k_index_named_nets(board) {
    if (board.nets.length !== 0) return; // Preserve original numbered-net support.
    const pads = board.footprints.flatMap(footprint => footprint.pads);
    const copper = [...board.segments, ...board.vias, ...board.zones];
    const hasNamedNets = pads.some(pad => typeof pad.net?.name === "string") ||
        copper.some(item => typeof item.net === "string");
    if (!hasNamedNets) return;
    const names = new Set([""]);
    for (const pad of pads) if (typeof pad.net?.name === "string") names.add(pad.net.name);
    for (const item of copper) if (typeof item.net === "string") names.add(item.net);
    const ordered = ["", ...[...names].filter(name => name !== "").sort()];
    const index = new Map(ordered.map((name, number) => [name, number]));
    board.nets = ordered.map((name, number) => ({name, number}));
    for (const pad of pads) {
        const name = typeof pad.net?.name === "string" ? pad.net.name : "";
        pad.net = {name, number: index.get(name)};
    }
    for (const item of copper) {
        const name = typeof item.net === "string" ? item.net : "";
        item.net = index.get(name);
        if (board.zones.includes(item)) item.net_name = name;
    }
}
