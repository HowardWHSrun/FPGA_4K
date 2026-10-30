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
    description:'We are developing two approaches in parallel: compact custom FPGA electronics with new LDO designs, and an XEM8305 carrier that connects directly to the existing LDO board. Explore either route below.',
    facts:[['4','two-ASIC boards'],['8','ASICs in the system concept'],['4,096','recording-channel target']],
    noteLabel:'A common recording goal · two hardware approaches',
    note:'The carrier V42 is the parallel direct-LDO alternative. The custom FPGA route studies Frontend FPGA Board V41 + new LDO V5, or combined FPGA/shared LDO V7. Both use XEM8305 in different arrangements; neither is hardware-qualified.',
    details:[
      'The preserved compact B V1 model is an earlier assembly concept. Its geometry is unchanged; its source has unspecified model units and does not establish current board dimensions, connector fit or a completed assembly.',
      'The current ASIC arrangement is four 1k boards, with two 512-channel ASICs on each board: eight ASICs and a 4,096-channel recording target. The compact FPGA/LDO studies still need ASIC-board distribution and stack-adapter design.',
      'Approach A connects compact custom FPGA electronics by micro-HDMI to an XEM8305 host interface. Its latest interposer V4 sits between BRK8305 and XEM8305 and does not connect to the previous LDO board. The compact power options are Frontend FPGA Board V41 + new LDO V5, or combined FPGA/shared LDO V7. The interface is under development.',
      'Approach B uses the existing LDO board directly with XEM8305 through carrier V42. It is a parallel alternative to the compact custom FPGA/LDO arrangement. Populated mating, powered operation, ASIC bring-up and hardware qualification remain open for both approaches.',
      'The µHDMI adapter section preserves the dated September XEM8310/BRK8310 study. Its three-cable proposal is historical context and does not define either current development path.'
    ],
    sources:[sources.mapping,sources.meeting,sources.assembly,sources.hardware]
  });
  update('carriers',{
    title:'ASIC boards · PCB-5',subtitle:'Four 1k boards · eight ASICs.',
    description:'The current system concept uses four 1k ASIC boards, each with two 512-channel recording ASICs. The 3D view uses four copies of the original PCB-5 source board. Compact FPGA/LDO adapters and stack retention remain to be designed.',
    facts:[['2','ASICs per board'],['1,024','recording channels per board'],['4','ASIC boards']],
    noteLabel:'ASIC connection and bonding-fixture review',
    note:'PCB-5 is the two-ASIC, 80-contact source reference. The existing bonding-fixture files remain a separate fit-check study. Board seating, vacuum seal, stability and populated stack fit require physical validation.',
    details:[
      'Four boards with two ASICs each provide the intended eight-ASIC, 4,096-recording-channel arrangement. This is a system target and interface plan, not evidence of completed acquisition.',
      'The original PCB-5 reference has two ASIC footprints and an 80-contact interface. Its dimensions and geometry do not establish the dimensions of the preserved compact assembly model.',
      'The separate V5 and combined V7 LDO studies retain four 80-contact ASIC interfaces. Distribution adapters, mating direction, retention and assembled clearances remain engineering work.',
      'The earlier team reference records nominal supply/interface values. Full ASIC rail limits, timing, current requirements and eight-chip startup behavior remain to be verified against the original specifications and measurements.'
    ],
    sources:[sources.hardware,sources.mapping,sources.meeting,['Bonding-fixture files and fit-check study','presentation/library/?q=bonding']]
  });
  update('fpga',{
    section:'A · Custom FPGA approach',title:'Saved Frontend FPGA Board checkpoint · V41',subtitle:'Saved routing checkpoint · V41.',
    description:'The saved 25 × 23 mm XC7A35T board connects all 116 digital mezzanine paths and the 125 MHz Abracon reference-clock path in the saved routing checkpoint. Whole-board routing remains incomplete.',
    facts:[['V41','saved FPGA revision'],['25 × 23 mm','board outline'],['116 / 116','mezzanine paths routed']],
    noteLabel:'Remaining FPGA routing and qualification',
    note:'445 whole-board opens remain. Complete the remaining copper, power distribution and clock/data timing review. Clock jitter at 1.8 V, impedance, exact HDI construction and assembly acceptance remain open.',
    details:[
      'V41 uses XC7A35T-2CSG325I and a 125 MHz Abracon reference clock. The saved native board and source-derived 3D depict the 25 × 23 mm standalone FPGA checkpoint.',
      'All 116 digital mezzanine paths and the reference-clock path are connected in the saved CAD. The 445 remaining whole-board opens mean this is partial routing, not a completed board.',
      'Clock/data timing and delay matching, continuous return paths, decoupling, power distribution, impedance and the exact manufacturable HDI construction require further review.',
      'The complete native package preserves historical Step41 / S41 source identifiers. The visible current revision is V41. Nominal component bodies and CAD connectivity do not establish physical mating, powered performance or factory acceptance.'
    ],
    sources:[sources.fpga,sources.mapping,sources.meeting]
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
    section:'A · Cabled host interface',title:'Saved host checkpoint · V4',subtitle:'Preserved BRK8305 → V4 → XEM8305.',
    description:'The saved 83 × 53 mm interposer placement sits between BRK8305 and XEM8305. The custom FPGA electronics connect by micro-HDMI; this interposer has no connection to the previous LDO board.',
    facts:[['V4','saved physical placement'],['83 × 53 mm','interposer outline'],['435','unrouted connections']],
    noteLabel:'Nominal assembly · routing in progress',note:'The registered 3D uses nominal 5 mm PCB-face gaps. Connector seating, cable clearance, routing, power and powered operation remain unqualified. The newer power-foundation schematic is a separate capture checkpoint.',
    details:['The host stack combines the official BRK8305 and XEM8305 geometry with the saved interposer V4 physical placement. The source board geometry is retained.','The interposer is unrouted, with 435 opens and 18 physical DRC findings in its placement checkpoint. It is separate from carrier V42, which connects to the existing LDO in approach B.','Display derivatives retain registered board coordinates. BRK source omits several connector and switch bodies; XEM decorative geometry is omitted. Some interposer bodies are nominal package envelopes. No cable plug, ASIC adapter or standoff is invented.','The V12 placement snapshot is shown separately in Overview; it does not change this preserved V4 checkpoint. The September XEM8310/BRK8310 study remains in the preserved V5 overview.'],
    sources:[['Saved assembly models and provenance','presentation/overview/assembly-v8/README.md'],sources.mapping,['Preserved September study','overview-2026-10-15-v5.html#adapter']]
  });
  const powerOptions={
    separate:{
      section:'A · Saved power-board checkpoint',title:'Saved FPGA-LDO PCB · V5',subtitle:'Saved FPGA-LDO PCB V5 · Frontend FPGA Board V41.',
      description:'The saved separate 32 × 32.5 mm power-board placement uses 32 LT3046 stages for four 1k ASIC boards. It retains two 60-contact FPGA connectors and four 80-contact ASIC interfaces. Compare it with the combined V7 option in this section.',
      facts:[['V5','saved LDO revision'],['32 × 32.5 mm','board outline'],['32','LT3046 stages']],
      noteLabel:'Unrouted placement · FPGA-LDO PCB V5',
      note:'731 whole-board connection gaps remain and canonical DRC is not clean. Routing, rail loads, thermal copper, grounding, provisional WLCSP lands and the ASIC distribution/stack adapters still need review.',
      details:[
        'V5 is a separate ASIC power board used with Frontend FPGA Board V41. Its 32 LT3046 stages and four 80-contact ASIC interfaces serve the four-board, eight-ASIC system concept.',
        'The native 32 × 32.5 mm board is an unrouted placement with 731 connection gaps. The canonical DRC is not clean; saved placement is not a fabrication release.',
        'The 3D view shows Frontend FPGA Board V41 and FPGA-LDO PCB V5 with nominal alignment at their two 60-contact connectors. Illustrative separation does not establish populated fit, retention or an approved stack height.',
        'ASIC distribution/stack adapters, regulator rail loads, startup, thermal copper, grounding and provisional WLCSP lands require validation. The combined V7 option is a separate design revision with shared rails.'
      ],
      sources:[sources.separate,sources.mapping,sources.meeting]
    },
    combined:{
      section:'A · Saved power-board checkpoint',title:'Saved combined board · V7',subtitle:'Saved FPGA/shared LDO V7.',
      description:'The saved combined 30 × 30 mm placement contains the Artix-7 FPGA, eight shared LT3046 stages and four 1k ASIC-board interfaces. Each corresponding positive rail is shared across all four ASIC boards.',
      facts:[['V7','saved combined revision'],['30 × 30 mm','board outline'],['8','shared LT3046 stages']],
      noteLabel:'Unrouted shared-rail study · combined V7',
      note:'827 whole-board connection gaps remain and canonical DRC is not clean. Verify each shared rail can supply all eight ASICs through startup and transients, then review noise, heat, routing and the stack adapter.',
      details:[
        'V7 is the 30 × 30 mm combined FPGA/shared LDO placement. Eight LT3046 stages supply corresponding shared positive rails across the four two-ASIC boards.',
        'The native board is unrouted with 827 connection gaps. Canonical DRC is not clean. The shared supply architecture still requires per-rail current, startup, transient, noise and thermal feasibility checks for all eight ASICs.',
        'Current native front/back placement drawings and the complete schematic represent V7. The current native 3D export also represents V7, including all 181 assigned component-body groups. The earlier V6 combined model remains a separate 35 × 35 mm study.',
        'Signal/power routing, ASIC distribution, stack adapters, connector fit, retention and assembled thermal performance remain open. The separate V5 power board remains a distinct option.'
      ],
      sources:[sources.combined,sources.combinedChecks,sources.mapping,sources.meeting]
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
      section:'A · Custom FPGA assembly study',title:'Custom FPGA assembly',subtitle:'From the ASIC stack to the host.',
      description:'Use one progress control to assemble the ASIC/LDO/FPGA stack, seat the interposer onto BRK8305, then seat XEM8305. Pause anywhere to inspect a board or component. Sheep context is optional and off by default.',
      facts:[['V54','FPGA placement'],['V13','flat middle LDO'],['V12','interposer snapshot']],
      noteLabel:'Assembly study · populated fit remains open',
      note:'The ASIC pass-through revision is a concept. Public connector previews use nominal project-authored geometry; exact supplier CAD stays local. Routing, electrical integration and populated fit remain unqualified.',
      details:[
        'The compact module uses four same-facing ASIC board concepts with flat FPGA-LDO PCB V13 between the middle boards and Frontend FPGA Board V54 at the LDO interface. Probe-facing edges remain exposed. This is an assembly study, not a finished ASIC pass-through PCB.',
        'The separate host combines the retained BRK8305 and XEM8305 source geometry with the saved interposer V12 placement snapshot. Each host board moves in its own seating stage. The cable endpoint follows the moving interposer J1 opening.',
        'One timeline covers the electronics sequence. Show sheep adds the final schematic head approach while preserving the electronics assembly stage. Select a board or double-click a component to inspect it while scrubbing; Other side exposes its reverse face.',
        'Available package models retain their source geometry. The public connector previews are nominal project-authored geometry with supplier references rather than redistributed supplier CAD. V12 has 27 assigned bodies; 23 packaged source bodies remain absent, with pads and silkscreen retained. Model coverage records distinguish these omissions from the completed display geometry.',
        'The board sections below preserve their saved Frontend FPGA Board V41, LDO V5/combined V7 and host V4 checkpoints. Their native source files and prior routing status have not been replaced by this illustration. The parallel direct-LDO carrier V42 is unchanged. Connector engagement, electrical compatibility, powered operation and animal fit are not established by this animation.'
      ],
      sources:[['Assembly V23 model coverage and sources','presentation/overview/assembly-v23/README.md'],['Open the full-size assembly viewer','presentation/overview/assembly-v23/index.html'],['Preserved earlier assembly V8','presentation/overview/assembly-v8/README.md'],sources.hardware,sources.mapping]
    },
    direct:{section:'B · Parallel direct-LDO approach',title:'Direct-LDO carrier · V42',subtitle:'Current V42 assembly, routing and schematic.',description:'ASIC boards connect through the existing LDO board and carrier V42 directly to XEM8305, then to the PC. Rotate the current V42 carrier with the XEM8305 and existing LDO attachment, then inspect its native routing or schematic.',facts:[['V42','direct-LDO carrier'],['53 × 83 mm','carrier outline'],['6','copper layers']],noteLabel:'Assembly quote in progress · fabrication review pending',note:'Five assembled boards are being quoted. The saved V41 quote has 35 of 39 groups matched; four need procurement, and V42 is not uploaded there yet. Exact stackup, 13 selected filled/capped vias and assembly acceptance remain open. Nothing is ordered or paid.',details:['All three rail-presence LEDs are now on the underside: nominal 12 V input (D600), buck converter 3.3 V before JP1 (D602), and the LDO 3.3 V feed after JP1 (D601). They help trace power availability; they are not precision power-good monitors.','V42 moves D601 to the exposed underside alongside the other two indicators. Its current-limited branch and local clearances are the only routing changes; all other fitted component placements and unrelated routing are retained from V41. The native board has 742 segments, 313 vias, 651 pads and 21 zones. The 3D view uses current V42 placement and copper with nominal XEM8305/LDO attachment geometry; Layout opens exact V42 native copper. Drag Illustration spacing to separate the boards visually; 0 mm means nominal seating, not a qualified stack height.','Saved native checks report zero physical/silkscreen findings, zero opens and zero schematic/PCB parity findings. Fifty inherited library warnings and 210 unused-connector-pin ERC findings remain explicit; 606 schematic pins are preserved. Static checks do not establish powered or manufacturing acceptance.','Before fabrication, review power/ground returns, USB/JTAG and protection, connector fit and placement. Factory confirmation is required for exact JLC06161H-2116, 13 selected epoxy-filled/copper-capped thermal vias, panel rails, manual J4/JP1 assembly and shunts. MC1, MC2/MC3, U10 and FB500–FB502 need procurement. Powered load, startup, thermal and signal/power integrity validation remain open.'],sources:[sources.carrier,sources.carrierPdf,sources.carrierChecks,sources.carrierStatus,sources.carrierFactory,sources.carrierBom,sources.carrierCpl]}
  };
  window.setOverviewApproachContent=mode=>{
    update('overview',overviewOptions[mode]);
    update('carriers',mode==='direct'?{...carrierReference,section:'B · ASIC board reference',facts:[['2','ASIC footprints in PCB-5'],['80','reference interface contacts'],['Reference','board geometry']],subtitle:'ASIC boards in the existing LDO assembly.',description:'The ASIC carrier is the recording-side board reference. In this approach, the existing LDO/routing assembly connects to XEM8305 through direct-LDO carrier V42. Exact ASIC-board mating and bring-up remain under review.',noteLabel:'Existing assembly · source reference',note:'Inspect the original ASIC and LDO board files for their interfaces. Populated fit, power, timing and hardware operation require validation.',details:['The original PCB-5 ASIC carrier and LDO/routing files are preserved source references. Their presence does not establish a completed, qualified assembly.','This route connects the existing LDO assembly directly to XEM8305 through carrier V42. Confirm ASIC-board compatibility, populated mating and signal/power behavior against the source requirements and hardware.'],sources:[sources.hardware,sources.carrier,sources.mapping]}:carrierReference);
  };
})();
