/* Current work inside the preserved six-section presentation. Historical slides remain unchanged. */
(() => {
  'use strict';
  const slides=window.PRESENTATION_SLIDES;
  if(!Array.isArray(slides))return;
  const byId=id=>slides.find(slide=>slide.id===id);
  const sources={
    mapping:['Current revision sources · 14 October 2026','presentation/overview/Source_Mapping.json'],
    meeting:['14 October FPGA and LDO presentation · V17','presentation/meetings/2026-10-14-v17/index.html'],
    hardware:['Original ASIC and LDO board references','hardware/overview.md'],
    assembly:['Preserved compact assembly concept','hardware/assembly/README.md'],
    fpga:['Standalone FPGA V41 · complete KiCad','presentation/overview/assets/FPGA_V41_Complete_KiCad_2026-10-14.zip'],
    separate:['Separate LDO V5 · complete KiCad','presentation/overview/assets/Separate_LDO_V5_Complete_KiCad_2026-10-14.zip'],
    combined:['Combined FPGA/shared LDO V7 · complete KiCad','presentation/overview/assets/Combined_FPGA_Shared_LDO_V7_KiCad.zip'],
    carrier:['XEM8305 carrier V17 · complete KiCad','presentation/overview/assets/Carrier_V17_Complete_KiCad.zip'],
    carrierChecks:['Carrier V17 grid and native check summary','presentation/overview/assets/Carrier_V17_Check_Summary.json'],
    combinedChecks:['Combined V7 canonical DRC','presentation/overview/assets/Combined_V7_Canonical_DRC.json']
  };
  function update(id,copy){const slide=byId(id);if(slide)Object.assign(slide,copy);}
  update('overview',{
    subtitle:'Headboard to host.',
    description:'Current work · 14 October 2026. Explore FPGA V41, separate LDO V5, combined FPGA/shared LDO V7 and XEM8305 carrier V17, with native views and complete KiCad projects.',
    facts:[['4','two-ASIC boards'],['8','ASICs in the system concept'],['4,096','recording-channel target']],
    noteLabel:'Current development paths · 14 October 2026',
    note:'The XEM8305 carrier and compact standalone FPGA are separate development paths. The compact path compares FPGA V41 + separate LDO V5 with combined FPGA/shared LDO V7.',
    details:[
      'The preserved compact B V1 model is an earlier assembly concept. Its geometry is unchanged; its source has unspecified model units and does not establish current board dimensions, connector fit or a completed assembly.',
      'The current ASIC arrangement is four 1k boards, with two 512-channel ASICs on each board: eight ASICs and a 4,096-channel recording target. The compact FPGA/LDO studies still need ASIC-board distribution and stack-adapter design.',
      'The XEM8305 carrier V17 and the standalone FPGA V41 remain separate projects. Routing + LDO presents two compact power-board options: separate LDO V5 or combined FPGA/shared LDO V7. Supply loads, thermal performance, populated fit and powered operation remain unqualified.',
      'The µHDMI adapter section preserves the dated September XEM8310/BRK8310 study. Its three-cable proposal is historical context and does not define either current development path.'
    ],
    sources:[sources.mapping,sources.meeting,sources.assembly,sources.hardware]
  });
  update('carriers',{
    subtitle:'Four 1k boards · eight ASICs.',
    description:'The current system concept uses four 1k ASIC boards, each with two 512-channel recording ASICs. The preserved assembly model shows the earlier carrier stack; compact FPGA/LDO adapters and stack retention remain to be designed.',
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
    title:'Standalone FPGA · V41',subtitle:'FPGA V41 · partial routing.',
    description:'The current 25 × 23 mm XC7A35T board connects all 116 digital mezzanine paths and the 125 MHz Abracon reference-clock path in the saved routing checkpoint. Whole-board routing remains incomplete.',
    facts:[['V41','current FPGA revision'],['25 × 23 mm','board outline'],['116 / 116','mezzanine paths routed']],
    noteLabel:'Remaining FPGA routing and qualification',
    note:'445 whole-board opens remain. Complete the remaining copper, power distribution and clock/data timing review. Clock jitter at 1.8 V, impedance, exact HDI construction and assembly acceptance remain open.',
    details:[
      'V41 uses XC7A35T-2CSG325I and a 125 MHz Abracon reference clock. The current native board and source-derived 3D depict the 25 × 23 mm standalone FPGA checkpoint.',
      'All 116 digital mezzanine paths and the reference-clock path are connected in the saved CAD. The 445 remaining whole-board opens mean this is partial routing, not a completed board.',
      'Clock/data timing and delay matching, continuous return paths, decoupling, power distribution, impedance and the exact manufacturable HDI construction require further review.',
      'The complete native package preserves historical Step41 / S41 source identifiers. The visible current revision is V41. Nominal component bodies and CAD connectivity do not establish physical mating, powered performance or factory acceptance.'
    ],
    sources:[sources.fpga,sources.mapping,sources.meeting]
  });
  update('receiver',{
    title:'XEM8305 carrier · V17',subtitle:'Carrier V17 · assembly and routing.',
    description:'The six-layer, 53 × 83 mm XEM8305 carrier is V17. Its schematic is aligned to the drawing grid; V16 electrical connectivity, copper and placement are preserved. Inspect the XEM–carrier–LDO assembly, native layout and current schematic.',
    facts:[['V17','current carrier revision'],['53 × 83 mm','board outline'],['6','copper layers']],
    noteLabel:'Carrier drawing cleanup and remaining review',
    note:'The grid-alignment check reports zero remaining grid warnings; 210 intentional unused-pin ERC findings remain. Factory acceptance, populated mating, power, USB/JTAG and ASIC bring-up remain open.',
    details:[
      'V17 cleans up the schematic drawing grid while preserving the V16 electrical netlist, PCB copper and placement. The published V16 physical viewer therefore represents the unchanged V17 geometry; the current schematic and native project download are V17.',
      'The viewer opens the XEM–carrier–LDO assembly. Its simplified module and LDO bodies and nominal mating gaps are illustrations for inspection, not evidence of populated connector seating or retention.',
      'The saved native checks report zero physical, disconnected and schematic/PCB parity findings under their retained settings. The 210 unused-pin ERC findings and hardware qualification remain explicit.',
      'The carrier retains a 53 × 83 mm outline and six copper layers. Factory review, current and thermal performance, USB/JTAG, powered ASIC operation and complete assembly acceptance remain open.'
    ],
    sources:[sources.carrier,sources.carrierChecks,sources.mapping,sources.meeting]
  });
  const adapter=byId('adapter');
  if(adapter){
    adapter.section='04 · Preserved receiver study · 29 September';
    adapter.subtitle='Dated µHDMI study · September 2026.';
    adapter.description='Preserved 29 September study: an interposer between XEM8310 and BRK8310 would connect three custom FPGA cables to GTY banks 226, 225 and 224. This earlier proposal remains separate from the current XEM8305 carrier and standalone FPGA work.';
    adapter.noteLabel='Historical three-port study · 29 September 2026';
    adapter.note='The V7 logical schematic and V8 mechanical/routing study retain their original native R7/R8 identifiers. Cable power, routing, clock/link operation and physical fit were not fabrication qualified.';
  }
  const powerOptions={
    separate:{
      title:'Separate ASIC LDO · V5',subtitle:'Separate LDO V5 · FPGA V41.',
      description:'The separate 32 × 32.5 mm power-board placement uses 32 LT3046 stages for four 1k ASIC boards. It retains two 60-contact FPGA connectors and four 80-contact ASIC interfaces. Compare it with the combined V7 option in this section.',
      facts:[['V5','separate LDO revision'],['32 × 32.5 mm','board outline'],['32','LT3046 stages']],
      noteLabel:'Unrouted placement · separate LDO V5',
      note:'731 whole-board connection gaps remain and canonical DRC is not clean. Routing, rail loads, thermal copper, grounding, provisional WLCSP lands and the ASIC distribution/stack adapters still need review.',
      details:[
        'V5 is a separate ASIC power board used with standalone FPGA V41. Its 32 LT3046 stages and four 80-contact ASIC interfaces serve the four-board, eight-ASIC system concept.',
        'The native 32 × 32.5 mm board is an unrouted placement with 731 connection gaps. The canonical DRC is not clean; saved placement is not a fabrication release.',
        'The 3D view shows FPGA V41 and separate LDO V5 with nominal alignment at their two 60-contact connectors. Illustrative separation does not establish populated fit, retention or an approved stack height.',
        'ASIC distribution/stack adapters, regulator rail loads, startup, thermal copper, grounding and provisional WLCSP lands require validation. The combined V7 option is a separate design revision with shared rails.'
      ],
      sources:[sources.separate,sources.mapping,sources.meeting]
    },
    combined:{
      title:'Combined FPGA + shared LDO · V7',subtitle:'Combined FPGA/shared LDO V7.',
      description:'The combined 30 × 30 mm placement contains the Artix-7 FPGA, eight shared LT3046 stages and four 1k ASIC-board interfaces. Each corresponding positive rail is shared across all four ASIC boards.',
      facts:[['V7','combined revision'],['30 × 30 mm','board outline'],['8','shared LT3046 stages']],
      noteLabel:'Unrouted shared-rail study · combined V7',
      note:'827 whole-board connection gaps remain and canonical DRC is not clean. Verify each shared rail can supply all eight ASICs through startup and transients, then review noise, heat, routing and the stack adapter.',
      details:[
        'V7 is the 30 × 30 mm combined FPGA/shared LDO placement. Eight LT3046 stages supply corresponding shared positive rails across the four two-ASIC boards.',
        'The native board is unrouted with 827 connection gaps. Canonical DRC is not clean. The shared supply architecture still requires per-rail current, startup, transient, noise and thermal feasibility checks for all eight ASICs.',
        'Current native front/back placement drawings and the complete schematic represent V7. No V7 3D model is published; the earlier V6 combined model is a separate 35 × 35 mm study.',
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
})();
