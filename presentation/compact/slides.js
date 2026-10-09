/* Current system-review copy. Dates and engineering status remain explicit. */
(() => {
  const repo='https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/';
  const refs={
    team:['Team assignments · received Sep 18',repo+'docs/meetings/2026-09-18-follow-up.md'],
    hardware:['Supplied board references',repo+'hardware/overview.md'],
    previousFpga:['Earlier 50T board review · Sep 28',repo+'presentation/fpga/'],
    adapter:['R7 three-port KiCad schematic · Sep 29',repo+'hardware/xem8310-adapter/dated/2026-09-29/r7-three-port/README.md'],
    adapter3d:['Three-port adapter · 3D and exact pins',repo+'presentation/adapter/'],
    history:['Earlier one-port adapter history',repo+'hardware/xem8310-adapter/dated/2026-09-29/r3-interposer-candidate/README.md'],
    open:['Owners and open requirements',repo+'docs/team/owners-and-work.md'],
    meeting:['System and interface discussion · Sep 17',repo+'docs/meetings/2026-09-17.md'],
    xem:['Opal Kelly · XEM8310 expansion connectors','https://docs.opalkelly.com/xem8310/expansion-connectors/'],
    models:['Opal Kelly · XEM8310 and BRK8310 3D models','https://www.opalkelly.com/products/models/'],
    brk:['Opal Kelly · BRK8310 breakout board','https://docs.opalkelly.com/xem8310/brk8310-breakout-board/']
  };
  window.PRESENTATION_SLIDES=[
    {
      id:'overview',section:'System overview',title:'4K neural recording',subtitle:'Headboard to host.',
      description:'Current FPGA update · 5 October 2026. Open Custom FPGA for R39, fresh top/bottom views and the complete KiCad download. The separate LDO, XEM and fixture reviews retain their own dates.',
      regions:['A','C','D','E','F'],owners:[],facts:[['3','links in earlier proposal'],['8','ASICs in earlier concept'],['4,096','system channel goal']],
      noteLabel:'Earlier receiver proposal · 29 September',
      note:'Three custom FPGA boards are proposed to stream simultaneously through three µHDMI cables, one MC3 GTY bank each, into XEM8310. The XEM is currently seated directly on BRK8310.',
      details:[
        'The compact B v1 headboard is shown without changing its source geometry. The former bridge is grouped with the routing/LDO board, following Howard’s September 22 instruction.',
        'The 29 September proposal selected XC7A25T-2CSG325I, with the ASIC/carrier partition across three boards and the 4,096-channel goal unresolved. That published 25T preview is unrouted and retains the DF40 interface under review; the weekend research revision is separate.',
        'The R7 adapter schematic assigns GTY banks 226, 225 and 224 to three separate cables. An interposer would sit between the existing XEM and BRK boards. XEM USB is the initial PC link; BRK J6 PCIe is unavailable during three-link acquisition. The overview stack geometry is explanatory; open the adapter page for the manufacturer-model view.'
      ],sources:[refs.team,refs.hardware,refs.adapter,refs.adapter3d,refs.brk,refs.open]
    },
    {
      id:'carriers',section:'01 · Recording front end',title:'ASIC carrier stack',subtitle:'Gerald · ASIC and carrier design',
      description:'The original supplied stack shows four two-chip carriers, each discussed as a 1,024-channel board. Its partition across three new FPGA boards is unresolved.',
      regions:['A'],owners:[['Gerald','ASIC / carrier PCB']],facts:[['2','ASICs per carrier'],['1,024','channels per carrier'],['4','stacked carriers']],
      noteLabel:'Bonding fixture · weekend update · 3–4 October 2026',note:'I simplified the suction fixture into a one-piece frame with suction coming directly from below and removed the extra ribs. The CAD and STL/3MF files are ready for a fit-check prototype. The next step is to check the board seating, vacuum seal, and stability before using it for bonding.',
      details:[
        'The reported assignment includes the ASIC and 1,024-channel two-chip carrier designs. This is ownership and architecture, not a claim of completed 4K operation.',
        'PCB-5 is the supplied reference: approximately 22 × 17 mm, 10 copper layers, two chip footprints and an 80-contact J3 connector. These are reference-board facts, not dimensions for the compact STL.',
        'The team follow-up records a nominal 1.5 V reference and an intended 32 MHz ASIC clock. Complete supply rails, I/O limits and timing requirements remain to be specified.'
      ],sources:[refs.team,refs.hardware,refs.meeting]
    },
    {
      id:'routing',section:'02 · Routing and power',title:'Routing + LDO board',subtitle:'Zitong · Routing and power PCB',
      description:'The current E5 adapter separates the signal flex cable from the locking VDD/GND input. Current requirement, analog-ground return and physical fit remain under review.',
      regions:['C'],owners:[['Zitong','Routing / power management']],facts:[['E5','current routed adapter'],['J1 + J19','J19 intentionally NC'],['Power','separate locking input']],
      noteLabel:'LDO routing adapter · weekend update · 3–4 October 2026',note:'I finished routing the LDO adapter and added ground copper and stitching vias. Following Gerald’s suggestion, I added a separate locking VDD/GND connector, while keeping power off the signal flex cable. Both J1 and J19 are included mechanically, with J19 intentionally unconnected. The latest layout passes DRC and connectivity checks, and I’ve prepared a concise schematic and pin-to-pin guide. Before fabrication, I still need to verify the actual current requirement, analog-ground return, and cable/connector fit.',
      details:[
        'The earlier compact overview groups the former bridge and lower board as one routing/LDO region. The current panel shows E5 separately and preserves that earlier geometry in the overview.',
        'The historical LDO/routing reference is approximately 18.3 × 42 mm with 6 copper layers and nine regulator footprints. It is an example to adapt, not the finished eight-chip power design.',
        'That reference has 50-contact board-to-board connectors, while PCB-5 has an 80-contact connector. The references are not a verified mating pair.',
        'The September 17 meeting places FPGA power circuitry on the FPGA board; recording-chip regulator placement is still under review.'
      ],sources:[refs.team,refs.hardware,refs.meeting,refs.open]
    },
    {
      id:'fpga',section:'03 · Acquisition and aggregation',title:'Custom FPGA board',subtitle:'Howard · PCB     /     Jiaao · Firmware',
      description:'The current XC7A35T-2CSG325I board is R39, 41 × 41 mm, with corrected lands/silkscreen and scoped FPGA escape rules. Fresh views and the complete KiCad project are available. Routing remains incomplete.',
      regions:['D'],owners:[['Howard','FPGA PCB'],['Jiaao','FPGA programming']],facts:[['35T','current FPGA device'],['R39','5 October revision'],['Unfinished','current routing']],
      noteLabel:'FPGA PCB · R39 update · 5 October 2026',note:'Applied land and silkscreen corrections, bounded FPGA escape rules and 31 component-information updates. Physical DRC, ERC and schematic/PCB parity pass under the saved settings. Schematic connections are intact; the 1,413 PCB connections awaiting copper are expected before routing. JLCPCB construction and impedance dimensions remain unissued.',
      details:[
        'The current research board uses XC7A35T-2CSG325I. R39 retains the compact bottom-connector arrangement and existing 113 surface segments. The most-routed R34, paused R35 and historical 25T placement remain separate.',
        'The dated September 29 interface proposal gives each cable two active recording TX pairs, a third wired pair reserved in baseline firmware, and one inbound serial-control RX pair. The custom FPGA is intended to generate ASIC CLK, DATA and LATCH locally.',
        'In that dated interface proposal, cable contact 19 is the proposed 12 V feed to an entire remote FPGA/routing/ASIC assembly. Source, current limiting, inrush, return rating and local regulator sequence remain unqualified.',
        'Current R39 views depict the saved headboard alone. The earlier R37 headboard and connector-only mating-template review is preserved; populated fit and retention remain unqualified.'
      ],sources:[refs.team,refs.adapter3d,refs.previousFpga,refs.open]
    },
    {
      id:'adapter',section:'04 · FPGA receiver interface',title:'Three-port µHDMI interposer',subtitle:'Proposed board between XEM and BRK',
      description:'One proposed adapter board would intercept the XEM8310 vertical MC3 connector and connect three custom FPGA cables to GTY banks 226, 225 and 224.',
      regions:['E'],owners:[],facts:[['3','cable ports'],['3','GTY banks'],['12 V','proposed feed per cable']],
      noteLabel:'Preserved three-port study · 29 September',note:'R7 is a five-sheet logical KiCad schematic. The R8 PCB is a mechanical/routing study, not a fabrication release.',
      details:[
        'Each custom FPGA has one Type-D cable and one XEM GTY bank. Its recording TX0/TX1 pairs enter XEM RX0/RX1, its reserved TX2 pair is wired to RX2, and XEM TX0 returns serial control. R7 explicitly isolates the selected lower BRK GTY contacts to avoid high-speed Y stubs.',
        'The three links are intended to run together. Banks 224 and 225 otherwise serve the BRK J6 PCIe edge, so PCIe cannot run concurrently in this adapter mode; it remains an alternate future configuration.',
        'R7 includes independent proposed JTAG probe paths and three unresolved protected 12 V branch placeholders. R8 maps all MC1/MC2 contacts logically and has only partial physical routing; JTAG headers and 12 V protection are not placed hardware. Impedance, routing, clock and fit require further engineering.',
        'The root presentation uses explanatory receiver boxes. The adapter detail page separately shows official XEM/BRK-derived model geometry and labels the interposer candidate.'
      ],sources:[refs.adapter,refs.adapter3d,refs.xem,refs.brk,refs.models,refs.open]
    },
    {
      id:'receiver',section:'05 · XEM8305 / LDO carrier',title:'XEM8305 / LDO carrier',subtitle:'Current R11 · 9 October 2026',
      description:'R11 keeps the original 53 × 83 mm board and clean ASIC signal bundles. The six-layer carrier has underside J1/J19 sockets, an edge-facing 12 V input and lower USB-C JTAG. All 75 fitted component bodies are shown in the current views.',
      regions:['F'],owners:[],facts:[['R11','current carrier'],['6','copper layers'],['75','component bodies']],
      noteLabel:'BRK8305-derived USB-C JTAG',note:'The native BRK8305 KiCad reference was checked component by component. C522, FB503 and C528 are restored; the horizontal USB socket is retained. EEPROM programming and hardware qualification remain open.',
      details:[
        'The current R11 visuals show both board faces with all fitted component bodies represented. Package models are simplified where needed; mounting rings and test pads remain intentionally bare.',
        'Two DGND reference planes and separate signal/power layers support the retained R10 ASIC routing. All original component positions and the 53 × 83 mm form factor are preserved.',
        'Native PCB checks report zero violations, opens and schematic parity findings under retained settings. This is a static design review, not evidence of powered operation, timing, assembled fit or manufacturing approval.',
        'Earlier R5 downloads and the A1R2/R3/XEM8310 studies retain their own dates and status; their fabrication files do not describe R11.'
      ],sources:[['Current R11 carrier views and schematic','presentation/xem/carrier-r11-2026-10-09.html'],['R11 visual files and checks','presentation/downloads/#carrier-c4-8-r11'],refs.open]
    }
  ];
  for(const slide of window.PRESENTATION_SLIDES){
    slide.sources.unshift(['23 Sep meeting · priorities, actions and original diagram','presentation/meetings/2026-09-23.html']);
  }
})();
