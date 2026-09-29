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
      description:'Select a board to explore its function, owner and current design questions.',
      regions:['A','C','D','E','F'],owners:[],facts:[['3','proposed FPGA links'],['8','ASICs in earlier concept'],['4,096','system channel goal']],
      noteLabel:'Current receiver direction',
      note:'Three custom FPGA boards are proposed to stream simultaneously through three µHDMI cables, one MC3 GTY bank each, into XEM8310. The XEM is currently seated directly on BRK8310.',
      details:[
        'The compact B v1 headboard is shown without changing its source geometry. The former bridge is grouped with the routing/LDO board, following Howard’s September 22 instruction.',
        'The selected custom FPGA is XC7A25T-2CSG325I. The ASIC/carrier partition across three FPGA boards and its distribution of the 4,096-channel goal are unresolved. The 25T PCB remains unrouted, with its DF40 interface under redesign.',
        'The R7 adapter schematic assigns GTY banks 226, 225 and 224 to three separate cables. An interposer would sit between the existing XEM and BRK boards. XEM USB is the initial PC link; BRK J6 PCIe is unavailable during three-link acquisition. The overview stack geometry is explanatory; open the adapter page for the manufacturer-model view.'
      ],sources:[refs.team,refs.hardware,refs.adapter,refs.adapter3d,refs.brk,refs.open]
    },
    {
      id:'carriers',section:'01 · Recording front end',title:'ASIC carrier stack',subtitle:'Gerald · ASIC and carrier design',
      description:'The original supplied stack shows four two-chip carriers, each discussed as a 1,024-channel board. Its partition across three new FPGA boards is unresolved.',
      regions:['A'],owners:[['Gerald','ASIC / carrier PCB']],facts:[['2','ASICs per carrier'],['1,024','channels per carrier'],['4','stacked carriers']],
      noteLabel:'Interface to resolve',note:'Gerald supplies the authoritative chip pin map; determine how the earlier carrier stack maps to three FPGA boards with Zitong and Howard.',
      details:[
        'The reported assignment includes the ASIC and 1,024-channel two-chip carrier designs. This is ownership and architecture, not a claim of completed 4K operation.',
        'PCB-5 is the supplied reference: approximately 22 × 17 mm, 10 copper layers, two chip footprints and an 80-contact J3 connector. These are reference-board facts, not dimensions for the compact STL.',
        'The team follow-up records a nominal 1.5 V reference and an intended 32 MHz ASIC clock. Complete supply rails, I/O limits and timing requirements remain to be specified.'
      ],sources:[refs.team,refs.hardware,refs.meeting]
    },
    {
      id:'routing',section:'02 · Routing and power',title:'Routing + LDO board',subtitle:'Zitong · Routing and power PCB',
      description:'The original supplied compact model groups the connecting section with its routing/power board. How this upstream design feeds three FPGA boards is open.',
      regions:['C'],owners:[['Zitong','Routing / power management']],facts:[['B + C','one routing/LDO region'],['Signals','carrier → FPGA'],['Power','regulation / distribution']],
      noteLabel:'Interface to resolve',note:'Reconcile connector pin maps, grounds and I/O levels. Confirm rail requirements and regulator placement with the adjacent boards.',
      details:[
        'The former bridge and lower board share one label, selection and color. Geometry is preserved; no separate bridge part is introduced.',
        'The historical LDO/routing reference is approximately 18.3 × 42 mm with 6 copper layers and nine regulator footprints. It is an example to adapt, not the finished eight-chip power design.',
        'That reference has 50-contact board-to-board connectors, while PCB-5 has an 80-contact connector. The references are not a verified mating pair.',
        'The September 17 meeting places FPGA power circuitry on the FPGA board; recording-chip regulator placement is still under review.'
      ],sources:[refs.team,refs.hardware,refs.meeting,refs.open]
    },
    {
      id:'fpga',section:'03 · Acquisition and aggregation',title:'Custom FPGA board',subtitle:'Howard · PCB     /     Jiaao · Firmware',
      description:'Each XC7A25T board receives ASIC data, generates local ASIC controls and sends recording data over its own custom µHDMI cable.',
      regions:['D'],owners:[['Howard','FPGA PCB'],['Jiaao','FPGA programming']],facts:[['25T','selected device'],['3','separate boards'],['Unrouted','current PCB']],
      noteLabel:'Selected board status',note:'The XC7A25T-2CSG325I device is selected. The current native PCB is unrouted and retains rigid DF40 connectors that must be redesigned.',
      details:[
        'The selected 25T has the same CSG325 package positions as the previous 50T placement. The separate 28 September 50T website remains an earlier PCB review, not the selected device.',
        'Each cable has two active recording TX pairs, a third wired pair reserved in baseline firmware, and one inbound serial-control RX pair. The custom FPGA is intended to generate ASIC CLK, DATA and LATCH locally.',
        'Cable contact 19 is the proposed 12 V feed to an entire remote FPGA/routing/ASIC assembly. Source, current limiting, inrush, return rating and local regulator sequence remain unqualified.',
        'The 25T placement shown on the adapter page is exported from native KiCad. Its U1 body is simplified because the matching package STEP was unavailable. The PCB has no routed tracks; DF40 mating and full assembly fit remain open.'
      ],sources:[refs.team,refs.adapter3d,refs.previousFpga,refs.open]
    },
    {
      id:'adapter',section:'04 · FPGA receiver interface',title:'Three-port µHDMI interposer',subtitle:'Proposed board between XEM and BRK',
      description:'One proposed adapter board would intercept the XEM8310 vertical MC3 connector and connect three custom FPGA cables to GTY banks 226, 225 and 224.',
      regions:['E'],owners:[],facts:[['3','cable ports'],['3','GTY banks'],['12 V','proposed feed per cable']],
      noteLabel:'Design status',note:'R7 is a five-sheet logical KiCad schematic. The R8 PCB is a mechanical/routing study, not a fabrication release.',
      details:[
        'Each custom FPGA has one Type-D cable and one XEM GTY bank. Its recording TX0/TX1 pairs enter XEM RX0/RX1, its reserved TX2 pair is wired to RX2, and XEM TX0 returns serial control. R7 explicitly isolates the selected lower BRK GTY contacts to avoid high-speed Y stubs.',
        'The three links are intended to run together. Banks 224 and 225 otherwise serve the BRK J6 PCIe edge, so PCIe cannot run concurrently in this adapter mode; it remains an alternate future configuration.',
        'R7 includes independent proposed JTAG probe paths and three unresolved protected 12 V branch placeholders. R8 maps all MC1/MC2 contacts logically and has only partial physical routing; JTAG headers and 12 V protection are not placed hardware. Impedance, routing, clock and fit require further engineering.',
        'The root presentation uses explanatory receiver boxes. The adapter detail page separately shows official XEM/BRK-derived model geometry and labels the interposer candidate.'
      ],sources:[refs.adapter,refs.adapter3d,refs.xem,refs.brk,refs.models,refs.open]
    },
    {
      id:'receiver',section:'05 · Downstream receiver',title:'XEM8310 on BRK8310',subtitle:'Existing lab hardware',
      description:'XEM8310 is the selected receiver FPGA module, currently seated directly on BRK8310. Its USB/FrontPanel interface is the initial PC path.',
      regions:['F'],owners:[],facts:[['XEM8310','receiver FPGA'],['BRK8310','existing breakout'],['USB','initial PC route']],
      noteLabel:'Present and proposed',note:'Today: XEM directly on BRK. The proposed three-port adapter would be inserted between them, changing stack height and assigning all three MC3 GTY banks to the cables.',
      details:[
        'XEM8310 contains an Artix UltraScale+ FPGA, GTY transceivers and FrontPanel USB. The project uses it in a controller role; it is not a conventional MCU. BRK8310 is a separate breakout board.',
        'BRK J1 Bulls Eye exposes bank 226. BRK J6 is a PCIe computer card edge using banks 224/225. With all three µHDMI links active, J6 has no concurrent PCIe GTY path.',
        'The initial data connection to the PC is XEM USB. The actual three-link gateware, sustained USB/host/storage rate, 12 V distribution and assembled connector fit remain unproven.',
        'Opal Kelly supplies actual XEM8310 and BRK8310 STEP models. The adapter detail view uses derived meshes from those sources for orientation, while the unbuilt interposer and cable positions remain candidate geometry.'
      ],sources:[refs.brk,refs.xem,refs.models,refs.adapter3d,refs.open]
    }
  ];
  for(const slide of window.PRESENTATION_SLIDES){
    slide.sources.unshift(['23 Sep meeting · priorities, actions and original diagram','presentation/meetings/2026-09-23.html']);
  }
})();
