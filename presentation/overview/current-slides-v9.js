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
    mapping:['Current revision sources · 15 October 2026','presentation/overview/Source_Mapping.json'],
    meeting:['14 October FPGA and LDO presentation · V17','presentation/meetings/2026-10-14-v17/index.html'],
    hardware:['Original ASIC and LDO board references','hardware/overview.md'],
    assembly:['Preserved compact assembly concept','hardware/assembly/README.md'],
    fpga:['Standalone FPGA V41 · complete KiCad','presentation/overview/assets/FPGA_V41_Complete_KiCad_2026-10-14.zip'],
    separate:['Separate LDO V5 · complete KiCad','presentation/overview/assets/Separate_LDO_V5_Complete_KiCad_2026-10-14.zip'],
    combined:['Combined FPGA/shared LDO V7 · complete KiCad','presentation/overview/assets/Combined_FPGA_Shared_LDO_V7_KiCad.zip'],
    carrier:['XEM8305 carrier V41 · public KiCad review package','hardware/xem8305-carrier/dated/2026-10-18/v41/Carrier_V41_Public_KiCad_Review.zip'],
    carrierChecks:['Carrier V41 native verification summary','hardware/xem8305-carrier/dated/2026-10-18/v41/verification/Public_V41_Native_Checks.json'],
    carrierStatus:['V41 changes, sourcing and review status','hardware/xem8305-carrier/dated/2026-10-18/v41/Review_Context.md'],
    carrierFactory:['Stackup, 13 capped vias and assembly requirements','hardware/xem8305-carrier/dated/2026-10-18/v41/Factory_Review_Requirements.md'],
    carrierPdf:['Carrier V41 · schematic PDF','hardware/xem8305-carrier/dated/2026-10-18/v41/output/pdf/Carrier_V41_Schematic.pdf'],
    carrierBom:['V41 assembly BOM · 82 parts / 39 MPN groups','hardware/xem8305-carrier/dated/2026-10-18/v41/output/assembly/V41_JLC_BOM_Full_82_Parts_39_MPNs.csv'],
    carrierCpl:['V41 assembly placements · 82 parts','hardware/xem8305-carrier/dated/2026-10-18/v41/output/assembly/V41_JLC_CPL_Full_82_Parts_Centroids.csv'],
    combinedChecks:['Combined V7 canonical DRC','presentation/overview/assets/Combined_V7_Canonical_DRC.json']
  };
  function update(id,copy){const slide=byId(id);if(slide)Object.assign(slide,copy);}
  update('overview',{
    subtitle:'Two routes to the same goal.',
    description:'We are developing two approaches in parallel: compact custom FPGA electronics with new LDO designs, and an XEM8305 carrier that connects directly to the existing LDO board. Explore either route below.',
    facts:[['4','two-ASIC boards'],['8','ASICs in the system concept'],['4,096','recording-channel target']],
    noteLabel:'A common recording goal · two hardware approaches',
    note:'The carrier V41 is the parallel direct-LDO alternative. The custom FPGA route studies FPGA V41 + new LDO V5, or combined FPGA/shared LDO V7. Both use XEM8305 in different arrangements; neither is hardware-qualified.',
    details:[
      'The preserved compact B V1 model is an earlier assembly concept. Its geometry is unchanged; its source has unspecified model units and does not establish current board dimensions, connector fit or a completed assembly.',
      'The current ASIC arrangement is four 1k boards, with two 512-channel ASICs on each board: eight ASICs and a 4,096-channel recording target. The compact FPGA/LDO studies still need ASIC-board distribution and stack-adapter design.',
      'Approach A connects compact custom FPGA electronics by micro-HDMI to an XEM8305 host interface. Its latest interposer V4 sits between BRK8305 and XEM8305 and does not connect to the previous LDO board. The compact power options are standalone FPGA V41 + new LDO V5, or combined FPGA/shared LDO V7. The interface is under development.',
      'Approach B uses the existing LDO board directly with XEM8305 through carrier V41. It is a parallel alternative to the compact custom FPGA/LDO arrangement. Populated mating, powered operation, ASIC bring-up and hardware qualification remain open for both approaches.',
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
    section:'A · Custom FPGA approach',title:'Standalone FPGA · V41',subtitle:'FPGA V41 · partial routing.',
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
    section:'B · Parallel alternative',title:'Direct-LDO carrier · V41',subtitle:'Current carrier routing and assembly review.',
    description:'Carrier V41 connects the existing LDO assembly directly to XEM8305. Inspect all six copper layers or the current schematic below, then download the native review files. The board remains 53 × 83 mm.',
    facts:[['V41','current carrier revision'],['53 × 83 mm','board outline'],['6','copper layers']],
    noteLabel:'Five-board assembly quote · review still open',
    note:'35 of 39 component groups match in the saved quote; four need procurement. JLC must confirm the exact stackup, 13 selected filled/capped vias and assembly details. Nothing has been ordered or paid.',
    details:[
      'V41 updates ten component references across six manufacturer-part groups for sourcing. Its 738 track segments, 312 vias, 651 pads and 21 zones, including fills, are unchanged from V40. This viewer uses plots exported from the actual V41 PCB.',
      'Saved native checks report zero physical or silkscreen findings, zero disconnected items and zero schematic/PCB parity findings. Fifty inherited library warnings and 210 unused-connector-pin ERC findings remain explicit; 606 schematic pins are preserved. These static checks do not establish powered behavior or hardware qualification.',
      'The five-board quote has 35 of 39 component groups matched. MC1, MC2/MC3, U10 and FB500–FB502 still require procurement. Inventory and prices are not reserved; no order or payment has been placed.',
      'Factory review must approve exact JLC06161H-2116 construction and 13 selected thermal vias with nonconductive epoxy fill, planarization and copper caps: nine at U10 and four at U501. Panel rails, manual assembly of J4 and JP1, and five separate shunts remain to be confirmed.',
      'Review power and ground return paths, USB/JTAG and power protection, connector mating and component orientation before release. Current/load limits, startup, thermal performance, signal/power integrity and populated operation still require engineering and bench validation. This carrier is separate from the custom FPGA and new LDO studies.'
    ],
    sources:[sources.carrier,sources.carrierPdf,sources.carrierChecks,sources.carrierStatus,sources.carrierFactory,sources.carrierBom,sources.carrierCpl]
  });
  update('adapter',{
    section:'A · Cabled host interface',title:'XEM8305 interposer · V4',subtitle:'BRK8305 → interposer V4 → XEM8305.',
    description:'The current 83 × 53 mm interposer placement sits between BRK8305 and XEM8305. The custom FPGA electronics connect by micro-HDMI; this interposer has no connection to the previous LDO board.',
    facts:[['V4','physical placement'],['83 × 53 mm','interposer outline'],['435','unrouted connections']],
    noteLabel:'Nominal assembly · routing in progress',note:'The registered 3D uses nominal 5 mm PCB-face gaps. Connector seating, cable clearance, routing, power and powered operation remain unqualified. The newer power-foundation schematic is a separate capture checkpoint.',
    details:['The host stack combines the official BRK8305 and XEM8305 geometry with the current interposer V4 physical placement. The source board geometry is retained.','The interposer is unrouted, with 435 opens and 18 physical DRC findings in its placement checkpoint. It is separate from carrier V41, which connects to the existing LDO in approach B.','Display derivatives retain registered board coordinates. BRK source omits several connector and switch bodies; XEM decorative geometry is omitted. Some interposer bodies are nominal package envelopes. No cable plug, ASIC adapter or standoff is invented.','The newer one-page power-foundation schematic does not change this V4 physical placement. The September XEM8310/BRK8310 study remains in the preserved V5 overview.'],
    sources:[['Current assembly models and provenance','presentation/overview/assembly-v8/README.md'],sources.mapping,['Preserved September study','overview-2026-10-15-v5.html#adapter']]
  });
  const powerOptions={
    separate:{
      section:'A · Custom FPGA approach · power option',title:'Separate ASIC LDO · V5',subtitle:'Separate LDO V5 · FPGA V41.',
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
      section:'A · Custom FPGA approach · power option',title:'Combined FPGA + shared LDO · V7',subtitle:'Combined FPGA/shared LDO V7.',
      description:'The combined 30 × 30 mm placement contains the Artix-7 FPGA, eight shared LT3046 stages and four 1k ASIC-board interfaces. Each corresponding positive rail is shared across all four ASIC boards.',
      facts:[['V8','combined revision'],['30 × 30 mm','board outline'],['8','shared LT3046 stages']],
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
    custom:{section:'A · Custom FPGA approach',title:'Custom FPGA approach',subtitle:'Compact FPGA + new LDO electronics.',description:'ASIC boards connect through new LDO and custom FPGA electronics, then a cabled XEM8305 interface to the PC. Compare standalone FPGA V41 + separate LDO V5 with combined FPGA/shared LDO V7.',facts:[['4','two-ASIC boards in the concept'],['V41','standalone FPGA'],['V5 / V7','power-board options']],noteLabel:'Custom FPGA development',note:'Routing, ASIC distribution, power feasibility, cabled host integration and hardware qualification remain open.',details:['This approach develops compact custom FPGA and new ASIC power electronics. The separate option is FPGA V41 plus LDO V5; the combined option is FPGA/shared LDO V7.','The cabled XEM8305 host interface uses the interposer between BRK8305 and XEM8305. The current V4 interposer does not connect to the previous LDO board.','The overview combines four source PCB-5 boards, current FPGA/LDO electronics and the BRK8305–interposer V4–XEM8305 host stack. Use the power selector for separate V41/V5 or combined V7. The compact FPGA/LDO electronics remain physically separate from the host stack and connect by an illustrative micro-HDMI cable; the source model notes retain omissions and qualification limits.'],sources:[['Current 3D assembly and model provenance','presentation/overview/assembly-v8/README.md'],sources.fpga,sources.separate,sources.combined,sources.mapping]},
    direct:{section:'B · Parallel direct-LDO approach',title:'Direct-LDO carrier · V41',subtitle:'Current routing, schematic and review files.',description:'ASIC boards connect through the existing LDO board and carrier V41 directly to XEM8305, then to the PC. Inspect the actual V41 routing one copper layer at a time, or open the current schematic.',facts:[['V41','direct-LDO carrier'],['53 × 83 mm','carrier outline'],['6','copper layers']],noteLabel:'Assembly quote in progress · fabrication review pending',note:'Five assembled boards are being quoted. 35 of 39 component groups match; four need procurement. Exact stackup, 13 selected filled/capped vias and assembly acceptance remain open. Nothing is ordered or paid.',details:['V41 changes ten references across six sourcing groups while preserving every V40 track, via, pad and filled zone: 738 segments, 312 vias, 651 pads and 21 zones. The layout opens current V41 plots rather than an earlier assembly illustration.','Saved native checks report zero physical/silkscreen findings, zero opens and zero schematic/PCB parity findings. Fifty inherited library warnings and 210 unused-connector-pin ERC findings remain explicit; 606 schematic pins are preserved. Static checks do not establish powered or manufacturing acceptance.','Before fabrication, review power/ground returns, USB/JTAG and protection, connector fit and placement. Factory confirmation is required for exact JLC06161H-2116, 13 selected epoxy-filled/copper-capped thermal vias, panel rails, manual J4/JP1 assembly and shunts. MC1, MC2/MC3, U10 and FB500–FB502 need procurement. Powered load, startup, thermal and signal/power integrity validation remain open.'],sources:[sources.carrier,sources.carrierPdf,sources.carrierChecks,sources.carrierStatus,sources.carrierFactory,sources.carrierBom,sources.carrierCpl]}
  };
  window.setOverviewApproachContent=mode=>{
    update('overview',overviewOptions[mode]);
    update('carriers',mode==='direct'?{...carrierReference,section:'B · ASIC board reference',facts:[['2','ASIC footprints in PCB-5'],['80','reference interface contacts'],['Reference','board geometry']],subtitle:'ASIC boards in the existing LDO assembly.',description:'The ASIC carrier is the recording-side board reference. In this approach, the existing LDO/routing assembly connects to XEM8305 through direct-LDO carrier V41. Exact ASIC-board mating and bring-up remain under review.',noteLabel:'Existing assembly · source reference',note:'Inspect the original ASIC and LDO board files for their interfaces. Populated fit, power, timing and hardware operation require validation.',details:['The original PCB-5 ASIC carrier and LDO/routing files are preserved source references. Their presence does not establish a completed, qualified assembly.','This route connects the existing LDO assembly directly to XEM8305 through carrier V41. Confirm ASIC-board compatibility, populated mating and signal/power behavior against the source requirements and hardware.'],sources:[sources.hardware,sources.carrier,sources.mapping]}:carrierReference);
  };
})();
