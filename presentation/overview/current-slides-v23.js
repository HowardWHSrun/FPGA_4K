/* Current work inside the preserved six-section presentation. Historical slides remain unchanged. */
(() => {
  'use strict';
  const slides=window.PRESENTATION_SLIDES;
  if(!Array.isArray(slides))return;
  const catalog=slides.slice();
  catalog.forEach(slide=>{slide.owners=[];});
  window.OVERVIEW_SLIDE_CATALOG=catalog;
  const byId=id=>catalog.find(slide=>slide.id===id);
  const sources={
    mapping:['Saved revision sources · 15 October 2026','presentation/overview/Source_Mapping.json'],
    meeting:['14 October FPGA and LDO presentation · V17','presentation/meetings/2026-10-14-v17/index.html'],
    meetingV8:['28 October whole-system and HDMI review · V8','presentation/meetings/2026-10-28-v8/index.html'],
    meetingNotes:['28 October presenter notes · V8','presentation/meetings/2026-10-28-v8/Presenter_Notes_V8.md'],
    system:['Eight-stack system viewer','presentation/meetings/2026-10-28-v8/assets/system-viewer/index.html'],
    systemProvenance:['System snapshots, nominal geometry and PCIe scope','presentation/meetings/2026-10-28-v8/assets/system-viewer/PROVENANCE.md'],
    hdmi:['19-contact HDMI discussion schematic','presentation/meetings/2026-10-28-v8/assets/hdmi/HDMI_Port_19_Contacts_V7.svg'],
    breakoutLayout:['HDMI Extension Board · 27 October native placement snapshot','presentation/meetings/2026-10-28-v8/assets/layout-viewer/breakout/index.html'],
    breakoutSources:['Meeting native PCB sources and hashes','presentation/meetings/2026-10-28-v8/assets/layout-viewer/SOURCE_MANIFEST_V8.json'],
    breakoutSchematic:['HDMI Extension Board · four-sheet meeting schematic','presentation/meetings/2026-10-28-v8/assets/breakout/schematic-v1.pdf'],
    hardware:['Original ASIC and LDO board references','hardware/overview.md'],
    assembly:['Preserved compact assembly concept','hardware/assembly/README.md'],
    fpga:['Frontend FPGA Board V41 · complete KiCad','presentation/overview/assets/FPGA_V41_Complete_KiCad_2026-10-14.zip'],
    separate:['FPGA-LDO PCB V5 · complete KiCad','presentation/overview/assets/Separate_LDO_V5_Complete_KiCad_2026-10-14.zip'],
    combined:['Combined FPGA/shared LDO V7 · complete KiCad','presentation/overview/assets/Combined_FPGA_Shared_LDO_V7_KiCad.zip'],
    carrier:['XEM8305 carrier V42 · public KiCad review package','hardware/xem8305-carrier/dated/2026-10-18/v42/Carrier_V42_Public_KiCad_Review.zip'],
    carrierChecks:['Carrier V42 native verification summary','hardware/xem8305-carrier/dated/2026-10-18/v42/verification/Public_V42_Native_Checks.json'],
    carrierStatus:['V42 changes, sourcing and review status','hardware/xem8305-carrier/dated/2026-10-18/v42/Review_Context.md'],
    carrierFactory:['Stackup, 13 capped vias and assembly requirements','hardware/xem8305-carrier/dated/2026-10-18/v42/Factory_Review_Requirements.md'],
    carrierPdf:['Carrier V42 · schematic PDF','hardware/xem8305-carrier/dated/2026-10-18/v42/output/pdf/Carrier_V42_Schematic.pdf'],
    carrierBom:['V42 assembly BOM · 82 parts / 39 MPN groups','hardware/xem8305-carrier/dated/2026-10-18/v42/output/assembly/V42_JLC_BOM_Full_82_Parts_39_MPNs.csv'],
    carrierCpl:['V42 assembly placements · 82 parts','hardware/xem8305-carrier/dated/2026-10-18/v42/output/assembly/V42_JLC_CPL_Full_82_Parts_Centroids.csv'],
    combinedChecks:['Combined V7 canonical DRC','presentation/overview/assets/Combined_V7_Canonical_DRC.json']
  };
  function update(id,copy){const slide=byId(id);if(slide)Object.assign(slide,copy);}
  update('overview',{
    subtitle:'Two routes to the same goal.',
    description:'The custom path connects eight Frontend FPGA Board / FPGA-LDO PCB / ASIC stacks by eight HDMI cables to the HDMI Extension Board and XEM8310, with a PCIe x4 path to the PC. The separate Direct LDO Carrier path connects XEM8305 to the existing LDO board.',
    facts:[['8','frontend stacks'],['8','HDMI links'],['x4','electrical PCIe to PC']],
    noteLabel:'A common recording goal · two hardware approaches',
    note:'Custom topology follows the 28 October meeting V8. Its repeated stacks, cables and PC connection are illustrative; the saved Frontend FPGA Board and power-board files retain their earlier revisions and unfinished status.',
    details:[
      'The preserved compact B V1 model is an earlier assembly concept. Its geometry is unchanged; its source has unspecified model units and does not establish current board dimensions, connector fit or a completed assembly.',
      'The meeting V8 scene repeats eight frontend stacks. Each illustrative stack combines a Frontend FPGA Board, FPGA-LDO PCB and four PCB-5-derived two-ASIC boards. Replication conveys topology; native ASIC pass-through, distribution and stack hardware remain unfinished.',
      'Approach A uses XEM8310 with the HDMI Extension Board, eight HDMI cable links and an electrical PCIe x4 path to the PC. The board retains a physical x8-length edge; no cable, riser or enclosure fit is selected.',
      'Approach B uses the existing LDO board directly with XEM8305 through carrier V42. It is a parallel alternative to the compact custom FPGA/LDO arrangement. Populated mating, powered operation, ASIC bring-up and hardware qualification remain open for both approaches.',
      'The HDMI Extension Board section uses the 27 October placement snapshot retained in meeting V8: 247 footprints and no routed copper. It is not a claim about later active CAD. Earlier XEM8305 interposer and September three-cable studies remain separate history.'
    ],
    sources:[sources.meetingV8,sources.meetingNotes,sources.system,sources.systemProvenance,sources.hdmi,sources.mapping,sources.meeting,sources.assembly,sources.hardware]
  });
  update('carriers',{
    title:'ASIC boards · PCB-5',subtitle:'Four ASIC boards per illustrative stack · eight stacks.',
    description:'The custom system follows meeting V8: eight Frontend FPGA Board / FPGA-LDO PCB / ASIC stacks connect to XEM8310 through eight HDMI links and the HDMI Extension Board. Each stack shows four PCB-5-derived boards with two ASICs each. ASIC distribution and stack retention remain to be designed.',
    facts:[['2','ASICs per reference board'],['4','ASIC boards per stack'],['8','illustrative frontend stacks']],
    noteLabel:'ASIC connection and bonding-fixture review',
    note:'PCB-5 is the two-ASIC, 80-contact source reference. The existing bonding-fixture files remain a separate fit-check study. Board seating, vacuum seal, stability and populated stack fit require physical validation.',
    details:[
      'The meeting V8 system scene repeats the four-board ASIC stack eight times, one per Frontend FPGA Board and FPGA-LDO PCB. This is an interface and assembly concept, not evidence of completed multi-stack acquisition.',
      'The original PCB-5 reference has two ASIC footprints and an 80-contact interface. Its dimensions and geometry do not establish the dimensions of the preserved compact assembly model.',
      'Meeting geometry uses a Frontend FPGA Board V60 model and detailed FPGA-LDO PCB V13 model. These retained models and the separate V5 / combined V7 native power studies predate the HDMI interface update. Distribution adapters, mating direction, retention and assembled clearances remain engineering work.',
      'The earlier team reference records nominal supply/interface values. Full ASIC rail limits, timing, current requirements and per-stack eight-chip startup behavior remain to be verified against the original specifications and measurements.'
    ],
    sources:[sources.hardware,sources.meetingV8,sources.systemProvenance,sources.mapping,sources.meeting,['Bonding-fixture files and fit-check study','presentation/library/?q=bonding']]
  });
  update('fpga',{
    section:'A · Custom FPGA approach',title:'Saved Frontend FPGA Board checkpoint · V41',subtitle:'Saved routing checkpoint · V41.',
    description:'The saved 25 × 23 mm XC7A35T board connects all 116 digital mezzanine paths and the 125 MHz Abracon reference-clock path in the saved routing checkpoint. Whole-board routing remains incomplete.',
    facts:[['V41','saved FPGA revision'],['25 × 23 mm','board outline'],['116 / 116','mezzanine paths routed']],
    noteLabel:'Remaining FPGA routing and qualification',
    note:'445 whole-board opens remain. Complete the remaining copper, power distribution and clock/data timing review. Clock jitter at 1.8 V, impedance, exact HDI construction and assembly acceptance remain open.',
    details:[
      'The custom path now follows meeting V8: eight Frontend FPGA Boards connect by eight HDMI cables to the HDMI Extension Board and XEM8310, then by PCIe x4 to the PC. The saved V41 native files below predate this interface update and are unchanged. Meeting V8 uses a retained V60 model that also predates the current interface schematic.',
      'V41 uses XC7A35T-2CSG325I and a 125 MHz Abracon reference clock. The saved native board and source-derived 3D depict the 25 × 23 mm standalone FPGA checkpoint.',
      'All 116 digital mezzanine paths and the reference-clock path are connected in the saved CAD. The 445 remaining whole-board opens mean this is partial routing, not a completed board.',
      'Clock/data timing and delay matching, continuous return paths, decoupling, power distribution, impedance and the exact manufacturable HDI construction require further review.',
      'The complete native package preserves historical Step41 / S41 source identifiers. The visible current revision is V41. Nominal component bodies and CAD connectivity do not establish physical mating, powered performance or factory acceptance.'
    ],
    sources:[sources.fpga,sources.mapping,sources.meeting,sources.meetingV8,sources.meetingNotes,sources.hdmi,sources.systemProvenance]
  });
  update('receiver',{
    section:'B · Parallel alternative',title:'Direct-LDO carrier · V42',subtitle:'Current carrier routing and assembly review.',
    description:'Carrier V42 connects the existing LDO assembly directly to XEM8305. Inspect all six copper layers or the current schematic below, then download the native review files. The board remains 53 × 83 mm.',
    facts:[['V42','current carrier revision'],['53 × 83 mm','board outline'],['6','copper layers']],
    noteLabel:'Five-board assembly quote · review still open',
    note:'The saved V41 quote has 35 of 39 groups matched; four need procurement. It has not been updated to V42. JLC must confirm the exact stackup, 13 selected filled/capped vias and assembly details. Nothing has been ordered or paid.',
    details:[
      'V42 moves only D601 to the underside at (141, 55) mm so all three rail-presence LEDs can be seen from the exposed side of the stacked assembly. Only its indicator branch and local clearances change. The 742 track segments, 313 vias, 651 pads and 21 zones come from the actual V42 PCB; unrelated routing and all other fitted placements are preserved from V41.',
      'Saved native checks report zero physical or silkscreen findings, zero disconnected items and zero schematic/PCB parity findings. Fifty inherited library warnings and 210 unused-connector-pin ERC findings remain explicit; 606 schematic pins are preserved. These static checks do not establish powered behavior or hardware qualification.',
      'The saved V41 five-board quote has 35 of 39 component groups matched and has not been updated to V42. MC1, MC2/MC3, U10 and FB500–FB502 still require procurement. Inventory and prices are not reserved; no order or payment has been placed.',
      'Factory review must approve exact JLC06161H-2116 construction and 13 selected thermal vias with nonconductive epoxy fill, planarization and copper caps: nine at U10 and four at U501. Panel rails, manual assembly of J4 and JP1, and five separate shunts remain to be confirmed.',
      'Review power and ground return paths, USB/JTAG and power protection, connector mating and component orientation before release. Current/load limits, startup, thermal performance, signal/power integrity and populated operation still require engineering and bench validation. This carrier is separate from the custom FPGA and new LDO studies.'
    ],
    sources:[sources.carrier,sources.carrierPdf,sources.carrierChecks,sources.carrierStatus,sources.carrierFactory,sources.carrierBom,sources.carrierCpl]
  });
  update('adapter',{
    section:'A · XEM8310 host interface',title:'HDMI Extension Board · saved V1',subtitle:'27 October placement snapshot · 247 footprints · unrouted.',
    description:'The HDMI Extension Board breaks XEM8310 out to eight provisional HDMI ports for the eight Frontend FPGA Board / FPGA-LDO PCB / ASIC stacks. Its electrical PCIe x4 link provides the planned PC path. These views retain the 27 October snapshot used by meeting V8.',
    facts:[['8','provisional HDMI ports'],['247','saved footprints'],['0','routed segments in snapshot']],
    noteLabel:'Meeting V8 snapshot · design remains open',note:'The retained placement has no routed copper. Connector spacing, electrical design, power-module footprint, physical fit, HDMI interface decisions and PCIe implementation remain under review. No native CAD changes are made here.',
    details:['Meeting V8 presents BRK8310-derived Custom V1, now named HDMI Extension Board. The retained native PCB has 247 footprints, 1,390 pads, four copper layers and zero segments, vias or zones. These counts describe the saved 27 October placement, not later local routing work.','Four schematic sheets group the overview, PCIe x4, frontend ports/power and USB JTAG. J101–J108 provide the eight provisional HDMI cable interfaces. Review their signals, power budget, cable and connector contract before updating the Frontend FPGA Board.','The system viewer adds XEM8310 at a nominal 5 mm PCB-surface gap and eight replicated frontend stacks. Some bodies are nominal envelopes; cable paths and the PC slot are illustrative. The electrical x4 design retains an x8-length edge, with no selected riser, cable or enclosure fit.','The older BRK8305 / interposer V4 / XEM8305 host and the September three-cable study remain historical designs. Neither is the current eight-HDMI custom topology; the Direct LDO Carrier remains the separate XEM8305 / existing-LDO path.'],
    sources:[sources.meetingV8,sources.meetingNotes,sources.breakoutLayout,sources.breakoutSources,sources.breakoutSchematic,sources.hdmi,sources.systemProvenance,['Earlier XEM8305 host models and provenance','presentation/overview/assembly-v8/README.md'],sources.mapping,['Preserved September study','overview-2026-10-15-v5.html#adapter']]
  });
  const powerOptions={
    separate:{
      section:'A · Saved power-board checkpoint',title:'Saved FPGA-LDO PCB · V5',subtitle:'Saved FPGA-LDO PCB V5 · Frontend FPGA Board V41.',
      description:'The saved separate 32 × 32.5 mm power-board placement uses 32 LT3046 stages for four 1k ASIC boards. It retains two 60-contact FPGA connectors and four 80-contact ASIC interfaces. Compare it with the combined V7 option in this section.',
      facts:[['V5','saved LDO revision'],['32 × 32.5 mm','board outline'],['32','LT3046 stages']],
      noteLabel:'Unrouted placement · FPGA-LDO PCB V5',
      note:'731 whole-board connection gaps remain and canonical DRC is not clean. Routing, rail loads, thermal copper, grounding, provisional WLCSP lands and the ASIC distribution/stack adapters still need review.',
      details:[
        'The eight-stack custom topology comes from meeting V8. Its system illustration uses the retained FPGA-LDO PCB V13 model; the saved native V5 package below predates the HDMI interface update and remains unchanged. This page does not replicate or reroute that native design for eight stacks.',
        'V5 is a separate ASIC power board used with Frontend FPGA Board V41. Its 32 LT3046 stages and four 80-contact ASIC interfaces serve the four-board, eight-ASIC system concept.',
        'The native 32 × 32.5 mm board is an unrouted placement with 731 connection gaps. The canonical DRC is not clean; saved placement is not a fabrication release.',
        'The 3D view shows Frontend FPGA Board V41 and FPGA-LDO PCB V5 with nominal alignment at their two 60-contact connectors. Illustrative separation does not establish populated fit, retention or an approved stack height.',
        'ASIC distribution/stack adapters, regulator rail loads, startup, thermal copper, grounding and provisional WLCSP lands require validation. The combined V7 option is a separate design revision with shared rails.'
      ],
      sources:[sources.separate,sources.mapping,sources.meeting,sources.meetingV8,sources.systemProvenance]
    },
    combined:{
      section:'A · Saved power-board checkpoint',title:'Saved combined board · V7',subtitle:'Saved FPGA/shared LDO V7.',
      description:'The saved combined 30 × 30 mm placement contains the Artix-7 FPGA, eight shared LT3046 stages and four 1k ASIC-board interfaces. Each corresponding positive rail is shared across all four ASIC boards.',
      facts:[['V7','saved combined revision'],['30 × 30 mm','board outline'],['8','shared LT3046 stages']],
      noteLabel:'Unrouted shared-rail study · combined V7',
      note:'827 whole-board connection gaps remain and canonical DRC is not clean. Verify each shared rail can supply all eight ASICs through startup and transients, then review noise, heat, routing and the stack adapter.',
      details:[
        'Combined V7 remains a distinct saved power option that predates the eight-HDMI topology in meeting V8. The meeting system uses separate Frontend FPGA Board and FPGA-LDO PCB model snapshots; it does not validate or revise the combined V7 native design for that topology.',
        'V7 is the 30 × 30 mm combined FPGA/shared LDO placement. Eight LT3046 stages supply corresponding shared positive rails across the four two-ASIC boards.',
        'The native board is unrouted with 827 connection gaps. Canonical DRC is not clean. The shared supply architecture still requires per-rail current, startup, transient, noise and thermal feasibility checks for all eight ASICs.',
        'Current native front/back placement drawings and the complete schematic represent V7. The current native 3D export also represents V7, including all 181 assigned component-body groups. The earlier V6 combined model remains a separate 35 × 35 mm study.',
        'Signal/power routing, ASIC distribution, stack adapters, connector fit, retention and assembled thermal performance remain open. The separate V5 power board remains a distinct option.'
      ],
      sources:[sources.combined,sources.combinedChecks,sources.mapping,sources.meeting,sources.meetingV8,sources.systemProvenance]
    }
  };
  window.setPowerOverviewOption=key=>{
    if(!Object.hasOwn(powerOptions,key))return false;
    window.powerOverviewOption=key;
    update('routing',powerOptions[key]);
    if(window.PRESENTATION?.getState().slideId==='routing')window.PRESENTATION.setSlide('routing',false);
    return key;
  };
  window.setPowerOverviewOption('separate');
  const carrierReference={...byId('carriers')};
  const overviewOptions={
    custom:{
      section:'A · Eight-HDMI custom FPGA system',title:'XEM8310 + eight frontend stacks',subtitle:'Eight HDMI links · PCIe x4 to the PC.',
      description:'Inspect the 28 October meeting structure: eight Frontend FPGA Board / FPGA-LDO PCB / ASIC stacks connect through eight HDMI cables to the HDMI Extension Board and XEM8310. The breakout PCIe x4 path connects the host to the PC. Focus the host, one frontend stack or one link to inspect the arrangement.',
      facts:[['8','frontend stacks'],['8','HDMI cable links'],['x4','electrical PCIe to PC']],
      noteLabel:'Meeting V8 topology · saved model snapshots',
      note:'Stack replication, thinner ASIC profiles, connector gaps, cables and the PC connection are illustrative. The HDMI Extension Board placement is unrouted; interface, routing, mechanical fit and powered operation remain open.',
      details:[
        'Meeting V8 repeats eight stacks with the same source geometry. Each combines a Frontend FPGA Board V60 display model, detailed FPGA-LDO PCB V13 and four PCB-5-derived ASIC boards. The frontend model predates the current interface schematic; it is not a PCB updated for the new HDMI connection.',
        'XEM8310 mates to the HDMI Extension Board in the nominal host assembly. Eight curves connect its J101–J108 ports one-to-one with the frontend stacks. The board is the 247-footprint, unrouted 27 October snapshot retained by the meeting; later active CAD is separate.',
        'The PC connection is electrical PCIe x4 with a physical x8-length edge. The tower, slot and connecting path show intended system context; they do not select a cable, riser or enclosure arrangement.',
        'ASIC boards use the original PCB-5 outline and bondout-pad positions with nominal die bodies. The thinner 0.8 mm profile and 1.5 mm ASIC-board gaps are display concepts. Capacitor relocation, pass-through connectors, physical retention and native ASIC-board redesign remain future work.',
        'The Frontend FPGA Board V41 and FPGA-LDO PCB V5 / combined V7 sections retain their earlier native files and unfinished routing status. Meeting V8 supplies the current topology and model context only; no CAD, netlist or component placement is changed. The Direct LDO Carrier remains the separate XEM8305 / existing-LDO approach.'
      ],
      sources:[sources.meetingV8,sources.meetingNotes,sources.system,sources.systemProvenance,sources.hdmi,['Earlier assembly V23 model coverage and sources','presentation/overview/assembly-v23/README.md'],['Earlier full-size assembly viewer','presentation/overview/assembly-v23/index.html'],['Preserved earlier assembly V8','presentation/overview/assembly-v8/README.md'],sources.hardware,sources.mapping]
    },
    direct:{section:'B · Parallel direct-LDO approach',title:'Direct-LDO carrier · V42',subtitle:'Current V42 assembly, routing and schematic.',description:'ASIC boards connect through the existing LDO board and carrier V42 directly to XEM8305, then to the PC. Rotate the current V42 carrier with the XEM8305 and existing LDO attachment, then inspect its native routing or schematic.',facts:[['V42','direct-LDO carrier'],['53 × 83 mm','carrier outline'],['6','copper layers']],noteLabel:'Assembly quote in progress · fabrication review pending',note:'Five assembled boards are being quoted. The saved V41 quote has 35 of 39 groups matched; four need procurement, and V42 is not uploaded there yet. Exact stackup, 13 selected filled/capped vias and assembly acceptance remain open. Nothing is ordered or paid.',details:['All three rail-presence LEDs are now on the underside: nominal 12 V input (D600), buck converter 3.3 V before JP1 (D602), and the LDO 3.3 V feed after JP1 (D601). They help trace power availability; they are not precision power-good monitors.','V42 moves D601 to the exposed underside alongside the other two indicators. Its current-limited branch and local clearances are the only routing changes; all other fitted component placements and unrelated routing are retained from V41. The native board has 742 segments, 313 vias, 651 pads and 21 zones. The 3D view uses current V42 placement and copper with nominal XEM8305/LDO attachment geometry; Layout opens exact V42 native copper. Drag Illustration spacing to separate the boards visually; 0 mm means nominal seating, not a qualified stack height.','Saved native checks report zero physical/silkscreen findings, zero opens and zero schematic/PCB parity findings. Fifty inherited library warnings and 210 unused-connector-pin ERC findings remain explicit; 606 schematic pins are preserved. Static checks do not establish powered or manufacturing acceptance.','Before fabrication, review power/ground returns, USB/JTAG and protection, connector fit and placement. Factory confirmation is required for exact JLC06161H-2116, 13 selected epoxy-filled/copper-capped thermal vias, panel rails, manual J4/JP1 assembly and shunts. MC1, MC2/MC3, U10 and FB500–FB502 need procurement. Powered load, startup, thermal and signal/power integrity validation remain open.'],sources:[sources.carrier,sources.carrierPdf,sources.carrierChecks,sources.carrierStatus,sources.carrierFactory,sources.carrierBom,sources.carrierCpl]}
  };
  window.setOverviewApproachContent=mode=>{
    update('overview',overviewOptions[mode]);
    update('carriers',mode==='direct'?{...carrierReference,section:'B · ASIC board reference',facts:[['2','ASIC footprints in PCB-5'],['80','reference interface contacts'],['Reference','board geometry']],subtitle:'ASIC boards in the existing LDO assembly.',description:'The ASIC carrier is the recording-side board reference. In this approach, the existing LDO/routing assembly connects to XEM8305 through direct-LDO carrier V42. Exact ASIC-board mating and bring-up remain under review.',noteLabel:'Existing assembly · source reference',note:'Inspect the original ASIC and LDO board files for their interfaces. Populated fit, power, timing and hardware operation require validation.',details:['The original PCB-5 ASIC carrier and LDO/routing files are preserved source references. Their presence does not establish a completed, qualified assembly.','This route connects the existing LDO assembly directly to XEM8305 through carrier V42. Confirm ASIC-board compatibility, populated mating and signal/power behavior against the source requirements and hardware.'],sources:[sources.hardware,sources.carrier,sources.mapping]}:carrierReference);
  };
})();
