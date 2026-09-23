/* Short presentation copy; implementation detail and evidence live in slide notes.
 * The inspected CAD remains the 200T draft. The 50T is an evaluation candidate.
 */
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='refinements.css?v=50t-review-v1';document.head.append(style);
  const b='https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/';
  const refs={
    board:[b+'hardware/fpga-board/README.md','Saved FPGA draft · 21 Sep'],
    bom:[b+'sources/fpga-draft-2026-09-21/BOM_Draft.csv','Draft BOM · not final'],
    reports:[b+'sources/fpga-draft-2026-09-21/README.md','Dated checks and limitations'],
    meeting:[b+'presentation/fpga/meeting-2026-09-21.md','21 Sep · meeting digest'],
    update:[b+'presentation/fpga/direction-2026-09-22.md','22 Sep · current direction and source checks'],
    team:[b+'docs/meetings/2026-09-18-follow-up.md','Earlier roles and ASIC clock'],
    reference:['https://github.com/controlpaths/cp_som_one/blob/main/README.md','Controlpaths · CP SOM One'],
    article:['https://www.controlpaths.com/2023/10/28/designing-a-fpga-som/','CP SOM One · original design explanation'],
    packages:['https://docs.amd.com/v/u/en-US/7-series-product-selection-guide','AMD XMP101 · Artix-7 package table, page 3'],
    pinout:['https://docs.amd.com/v/u/en-US/ug475_7Series_Pkg_Pinout','AMD UG475 · package and pinout'],
    pcb:['https://docs.amd.com/v/u/en-US/ug483_7Series_PCB','AMD UG483 · PCB design guide'],
    prototype:['https://digilent.com/shop/cmod-a7-35t-breadboardable-artix-7-fpga-module/','Digilent Cmod A7 · limited-I/O prototype example']
  };
  window.FPGA_SLIDES=[
    {
      id:'layout',name:'Current draft',title:'Current FPGA PCB',subtitle:'Howard + Zitong',
      description:'Power and schematic/layout reference: Controlpaths’ CP SOM One.',
      side:'front',document:'Howard_FPGA_Connected_42x40.kicad_pcb',
      facts:[['42 × 40','current board · mm'],['200T','saved draft'],['TBD','FPGA selection']],
      points:[['Adapt the reference','Keep useful circuitry; revise it for our system.'],['Reduce board area','Evaluate the smaller FPGA before reworking placement.']],
      noteLabel:'Working proposal',note:'Board functions and component choices are still being finalized.',
      notes:[
        'Howard reports that he and Zitong are currently working together, using CP SOM One as the main power/schematic/layout reference. This is a September 22 project update, not a claim of identical circuits or a new exclusive-layout reservation. Jiaao remains the FPGA-logic collaborator.',
        'The displayed and native-inspection files remain the September 21 XC7A200T-1SBG484C draft. No FPGA replacement, power redesign or routing change was performed in this presentation update.',
        'CP SOM One is an open-source Artix-7 SOM reference. Its author describes an FGG484-based design with three TLV62565 regulators. The saved project instead lists an ADP5052 candidate; the reference relationship must not be described as exact electrical equivalence.',
        'The import records 214 positions, a 41-sheet hierarchy, 703 track segments, 128 vias and six filled zones. The 22-net programming scope was routed at import. These details are retained here rather than crowding the slide.',
        'Reference attribution does not establish that every component is needed, approved or suitable for the smaller package. The final function list comes first.'
      ],sources:[refs.update,refs.reference,refs.article,refs.board,refs.bom]
    },
    {
      id:'interfaces',name:'Smaller FPGA',title:'Resolve the FPGA pin budget',subtitle:'23 Sep · device selection remains open',
      description:'The meeting reports the 106-I/O option as insufficient for approximately 120 required I/O.',
      side:'front',document:'U1_unit_01.kicad_sch',
      facts:[['10 × 10','package body · mm'],['106','package user I/O'],['0.5 mm','BGA ball pitch']],
      points:[['Check fit','Map every pin; synthesize the planned logic for 50T.'],['Revise the design','Rework footprint, banks, power and routing—not a drop-in swap.']],
      noteLabel:'Candidate only',note:'Confirm the complete pin map, resources, low power and stock before choosing the FPGA/package.',
      notes:[
        'AMD XMP101 v1.8, page 3, lists XC7A50T in CPG236: 10 × 10 mm, 0.5 mm ball pitch, 106 user I/O and 2 GTP transceivers. The 10 × 10 mm claim is package-specific, not true of every XC7A50T ordering code. Speed and temperature grade are not selected.',
        'The same package table lists the current 200T SBG484 package at 19 × 19 mm, 285 user I/O and 4 GTP transceivers. These are component body sizes, not complete PCB dimensions. The present PCB outline is 42 × 40 mm.',
        'The 50T has fewer logic and memory resources than the 200T. No project synthesis, placement, timing-closure or power result demonstrates that 50T is adequate yet.',
        'Proposed decision gate: review the exact package pinout and bank voltages; assign recording, control, clock and configuration signals; run synthesis and implementation with the intended constraints; verify the chosen link architecture. Only then commit to a smaller native layout.',
        'Two package GTP channels do not prove a working two-lane link. GTP and ordinary differential SelectIO use different pins, clocking and electrical requirements. The receiver and cable must support the selected implementation.'
      ],sources:[refs.packages,refs.pinout,refs.update,refs.bom]
    },
    {
      id:'recording',name:'Functions',title:'Finalize the board functions',subtitle:'Define the minimum system.',
      description:'Capture data, provide timing, and handle control.',
      side:'front',document:'Howard_FPGA_Connected_42x40.kicad_sch',
      facts:[['Record','ASIC → KR260'],['Control','KR260 → ASIC'],['Startup','boot + recovery']],
      points:[['Recording','Capture and forward chip data.'],['Timing + stimulation','Generate clocks and translate commands; agree the first-version scope.']],
      noteLabel:'Still open',note:'Confirm buffering, triggers and optional processing before finalizing parts.',
      notes:[
        'Howard says the board functions are still being finalized. This slide is the rough intended scope, not a completed firmware implementation or frozen requirement set.',
        'The September 21 discussion separates recording and stimulation. The downstream platform would store/schedule waveforms; the FPGA would translate packets and generate the required chip-side signals.',
        'The preference was to avoid extra FPGA-board bulk-data RAM unless justified. This does not eliminate internal buffering or the separate requirement for configuration storage.',
        'Trigger semantics, packet timing, recording/stimulation overlap and any optional filtering or other processing need explicit requirements. Intended simultaneous behavior is not a demonstrated result.',
        'Jiaao coordinates the FPGA logic and David the downstream software. Howard and Zitong need the agreed function and interface requirements before freezing circuitry.'
      ],sources:[refs.update,refs.meeting,refs.team]
    },
    {
      id:'cable',name:'I/O + link',title:'Close the pin and cable budget',subtitle:'Pins before placement.',
      description:'The discussed 88 recording lines are not the complete interface.',
      side:'front',document:'Howard_FPGA_Connected_42x40.kicad_sch',
      facts:[['106','CPG236 user I/O'],['88','recording lines discussed'],['18','gross difference only']],
      points:[['Count everything','Add controls, clocks and any shared configuration/debug signals.'],['Choose the link','Agree signaling, receiver, return-control path and cable pinout.']],
      noteLabel:'Feasibility check',note:'18 is not confirmed spare I/O. Micro-HDMI specifies the connector, not the protocol.',
      notes:[
        'The arithmetic 106 − 88 = 18 is only a first screening calculation. The 88 figure is the recording-output count discussed in the meeting, not a verified final pin ledger.',
        'Not every remaining user I/O is interchangeable: banks share supply constraints; clocks, differential pairs and configuration use can restrict assignment. Check the actual package pinout. Dedicated JTAG or GTP pins must be accounted for separately rather than blindly subtracted from general-purpose I/O.',
        'Stimulation/control inputs are additional to the 88 recording outputs. Whether the smaller package can support the complete system is unresolved.',
        'Two differential recording lanes and a separate control path over a micro-HDMI cable were discussed, with an off-head adapter to KR260. Neither the lane rate nor the receiver route is finalized.',
        'Decide whether the link uses SelectIO/LVDS or GTP and verify the corresponding electrical and protocol requirements. Speculative meeting rates and SLVS-EC connector labeling do not establish compatibility.'
      ],sources:[refs.packages,refs.pinout,refs.meeting,refs.update]
    },
    {
      id:'power',name:'Power',title:'Recheck power and placement',subtitle:'Use the reference as a starting point.',
      description:'Recalculate supplies and layout for the selected FPGA and functions.',
      side:'back',document:'U4_unit_01.kicad_sch',
      facts:[['Reference','CP SOM One'],['Current','ADP5052 draft'],['Next','rail + layout review']],
      points:[['Regulators','CP SOM One uses TLV62565; our saved draft differs.'],['Power + assembly','Review loads, startup, decoupling and fine-pitch BGA escape.']],
      noteLabel:'Not finalized',note:'A smaller package does not establish lower system power or a finished smaller PCB.',
      notes:[
        'The CP SOM One author describes three TLV62565 converters for its logic-only supplies and says additional supplies are needed for DDR or transceiver use. It is a reference architecture, not a validated power budget for this project.',
        'The saved project BOM lists U4 as ADP5052ACPZ-R7 with a proposed, unqualified power design. The new user update does not establish that this device has been replaced by the CP SOM One regulator scheme.',
        'For the chosen 50T package and planned logic, recalculate rail loads and startup requirements, then review regulator compensation, decoupling and placement. Transceiver use must be included in that plan.',
        'The CPG236 ball pitch is 0.5 mm. BGA escape, PCB stackup and assembly capability need review with the fabricator; no fixed layer count or universal need for microvias is assumed.',
        'Existing unresolved details include ADP5052 land pattern/thermal-via design, R112 near-pad via treatment, L1 placement and the C84 bypass proposal. The import reports are historical, not a newly completed electrical review.'
      ],sources:[refs.article,refs.bom,refs.board,refs.packages,refs.pcb]
    },
    {
      id:'startup',name:'Boot + clock',title:'Keep startup and recovery clear',subtitle:'Flash, JTAG and clocking.',
      description:'Boot storage is separate from recording-data RAM.',
      side:'back',document:'device_U2.kicad_sch',
      facts:[['U2','boot-flash candidate'],['J4','custom JTAG'],['Y1','oscillator TBD']],
      points:[['Keep only what is needed','Review memory and support parts against the agreed functions.'],['Programming through the cable','Investigate the method before removing dedicated recovery access.']],
      noteLabel:'Clock plan open',note:'The intended 32 MHz ASIC clock does not select the FPGA oscillator.',
      notes:[
        'U2 is a proposed S25FL256SAGMFI000 configuration flash. Exact model/pin behavior and the configuration mode still need review; this is not the bulk-data RAM reservation.',
        'J4 is a custom 2 × 3, 1.27 mm JTAG header. It needs a documented adapter; VTREF senses target voltage, and standard Digilent/ARM pinout compatibility is not claimed.',
        'Programming through the downstream platform and cable is a question from September 21, not implemented functionality. Preserve a recoverable programming path until boot and update behavior have been demonstrated.',
        'Y1 is only an oscillator reservation. Its frequency, voltage and part number must follow the acquisition/link clock plan. The earlier 32 MHz clarification concerns the ASIC clock.',
        'Changing the FPGA package requires a fresh check of configuration pins, straps and supported storage mode. Reference-board wiring is not a substitute for the selected part’s pin review.'
      ],sources:[refs.meeting,refs.bom,refs.team,refs.pinout]
    },
    {
      id:'bringup',name:'Prototype',title:'Prototype before the miniature layout',subtitle:'Development module + adapter PCB.',
      description:'Proposed route: test logic and interfaces before committing the small board.',
      side:'front',document:'Howard_FPGA_Connected_42x40.kicad_pcb',
      facts:[['Logic','simulate + synthesize'],['Bench','module + adapter'],['PCB','power + layout tests']],
      points:[['Breadboard?','A module can support simple tests—not the bare 0.5 mm BGA.'],['Full-system prototype','Use enough exposed I/O, the right banks/link, and PCB-routed connections.']],
      noteLabel:'Question for the team',note:'Which available board/module can exercise our actual pin count and link?',
      notes:[
        'The user asks whether the board can be prototyped. The proposed development-module-plus-adapter route is engineering guidance, not a prototype already built or a selected purchase.',
        'A bare CPG236 FPGA is a fine-pitch BGA and is not directly compatible with a solderless breadboard. It needs a soldered PCB with appropriate power, decoupling, clocking and configuration support.',
        'As an existence example, Digilent offers a breadboardable Cmod A7 module. Its manufacturer lists 44 digital I/O on DIP pins and eight on Pmod. Even these 52 signals are fewer than the 88 recording outputs discussed, before control; it is a reduced-scope learning/logic example, not the proposed full-4K prototype.',
        'Use an available Artix-7 evaluation board or module only after checking exposed I/O, bank voltage, clocking and the actual high-speed interface. It need not be physically small for an initial bench prototype. A board with a different device/package does not prove the final 50T pinout or timing.',
        'Recommendation: simulate and synthesize for the candidate device, bench-test generated data and return control through a suitable adapter, then build an assembled test PCB to validate custom power/startup and physical routing. Keep high-speed paths on a designed PCB/interconnect, not loose breadboard jumpers.',
        'The dated import remains incomplete: 270 unconnected PCB items, 661 unresolved schematic pins and 21 undriven power pins. Some rules were disabled and generic passive pin types limit ERC. No hardware validation or fresh ERC/DRC was performed for these slides.'
      ],sources:[refs.update,refs.prototype,refs.packages,refs.pcb,refs.reports]
    },
    {
      id:'decisions',name:'Next steps',title:'What we need to resolve next',subtitle:'Howard + Zitong · board design',
      description:'Minimum board → FPGA/stock → controller/link → EMI and protection.',
      side:'front',document:'Howard_FPGA_Connected_42x40.kicad_sch',
      facts:[['Define','functions + pins'],['Select','FPGA + package'],['Test','prototype route']],
      points:[['Before re-layout','Confirm the complete pin map, logic fit and cable interface.'],['Then revise','Update power, footprint and placement; finalize parts after review.']],
      noteLabel:'Current status',note:'23 Sep: evaluate USB 3.0, Opal Kelly, USB-C vs micro-HDMI, SPI commands and shielding. Final BOM remains open.',
      notes:[
        'Howard explicitly reports current joint work with Zitong and asks to evaluate a smaller XC7A50T. This does not mean the 50T is already selected, the schematic is ported, or the new layout works.',
        'Suggested closure artifacts: a minimum function list; package-specific pin/bank table; candidate-device utilization/timing results; link/clock requirements; rail budget; prototype selection and measurable bench criteria.',
        'Jiaao should be involved in firmware resource/timing estimates and David in the downstream link/control contract. Gerald supplies authoritative ASIC pin/timing information. These are coordination suggestions, not new GitHub assignments.',
        'If CPG236 cannot satisfy the complete I/O or implementation requirements, reconsider the package or architecture before spending effort on a compact layout. A 15 × 15 mm CSG325 package is a possible comparison point, but not an approved fallback.',
        'All eight main slides have been shortened. Detailed component qualifications, historical counts and earlier meeting context remain behind Slide notes & sources. Native CAD and compact assembly geometry are unchanged.'
      ],sources:[refs.update,refs.meeting,refs.packages,refs.board,refs.team]
    }
  ];
  for (const slide of window.FPGA_SLIDES) {
    slide.sources.unshift(['../meetings/2026-09-23.html','23 Sep · current meeting and original sources']);
    slide.notes.unshift('September 23 update: FPGA/package selection remains open. The meeting reports approximately 120 required I/O and says the 106-I/O 50T option is insufficient. The supplied diagram retains an older 100–110 total-pin estimate; reconcile the complete map. Approximately 30 × 30 mm is a size target to investigate, and procurement of at least 100 devices is a requested check, not confirmed stock. Earlier September 22 candidate details below remain dated context.');
  }
  window.FPGA_REVIEW_COPY={revision:'50t-review-v1',currentHardware:'XC7A200T-1SBG484C',candidate:'XC7A50T / CPG236',candidateSelected:false,pcbCollaborators:['Howard','Zitong']};
})();
