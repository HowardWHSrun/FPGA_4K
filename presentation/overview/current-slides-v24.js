/* V24: latest direct-LDO carrier; prior V23 custom assembly and carrier sources remain preserved. */
(() => {
  'use strict';
  const catalog=window.OVERVIEW_SLIDE_CATALOG;
  if(!Array.isArray(catalog))return;
  const base='hardware/xem8305-carrier/dated/2026-10-26/carrier-v1/';
  const sources=[
    ['Carrier V1 · public KiCad review package',base+'files/Carrier_V1_2026-10-26_Review.zip'],
    ['Native CAD and 80-body model verification',base+'verification.json'],
    ['Source revision and public packaging',base+'source-manifest.json'],
    ['Current circuit · native schematic',base+'schematic.svg'],
    ['All 80 component bodies',base+'components.csv'],
    ['80-body model assignment audit',base+'model-verification.csv'],
    ['Earlier carrier V42 · preserved review','hardware/xem8305-carrier/dated/2026-10-18/v42/README.md']
  ];
  const details=[
    'This is the separate Carrier_V1 from-scratch design, updated 26 October 2026 for the alternative direct-LDO path. The 53 × 83 mm board uses four copper layers. It is distinct from the earlier V42 carrier lineage, which remains preserved.',
    'All 80 component bodies have visible, resolvable native 3D models. Thirteen missing bodies were added: FTDI U3, four translators U4–U7, EEPROM U8, crystal Y1, four ferrite beads and LEDs D3/D4. The eight copper test pads and four mounting holes are body-free PCB features, bringing the native footprint count to 92.',
    'The model update preserves all component positions, pad/net assignments, routing, filled zones and silkscreen. The native board contains 649 track segments, 234 vias and 18 zones. Saved-rule KiCad checks report zero DRC findings, zero unconnected items and zero schematic/PCB parity differences.',
    'Independent checks cover native model resolution and geometry scope, U2 envelope equivalence, and an 80-component STEP assembly plus the PCB. These are CAD and model checks. They do not establish component sourcing, toleranced mating, power/thermal performance, signal integrity, manufacturing acceptance or powered operation.',
    'The public viewer uses independently authored nominal component bodies placed from the current native board. Some local models are generic package or dimension-derived representations. Supplier CAD, embedded model payloads, private reports and editor history are omitted from the public download. Read the source manifest for the exact packaging omissions.'
  ];
  const receiver={
    section:'B · Updated alternative approach',
    title:'Direct-LDO carrier · V1',
    subtitle:'All 80 component bodies verified in native 3D.',
    description:'The updated Carrier V1 connects the existing LDO assembly directly to XEM8305. Inspect its current carrier model, four-layer layout and circuit. The complete component-body model set and saved native CAD checks have been verified.',
    facts:[['80 / 80','component bodies verified'],['0 / 0 / 0','DRC / opens / parity'],['4','copper layers']],
    noteLabel:'Verified CAD and model scope · 26 October 2026',
    note:'All 80 native body-model assignments resolve and were visually checked. Powered hardware, manufacturing and toleranced assembly qualification remain open.',
    details,sources
  };
  Object.assign(catalog.find(slide=>slide.id==='receiver')||{},receiver);
  const original=window.setOverviewApproachContent;
  window.setOverviewApproachContent=mode=>{
    original(mode);
    if(mode!=='direct')return;
    Object.assign(catalog.find(slide=>slide.id==='overview')||{},receiver,{
      section:'B · Updated direct-LDO alternative',
      description:'ASIC boards connect through the existing LDO board and updated Carrier V1 to XEM8305, then to the PC. All 80 component bodies are verified in the native 3D model. Explore the current carrier, layout and schematic below.'
    });
    Object.assign(catalog.find(slide=>slide.id==='carriers')||{}, {
      section:'B · ASIC board reference',
      description:'The original PCB-5 is the recording-side board reference. The existing LDO/routing assembly connects to XEM8305 through the updated Carrier V1. The carrier’s CAD and 3D-model checks do not establish ASIC-board mating or powered bring-up.',
      details:['PCB-5 and the original LDO/routing files remain preserved source references.','Approach B now links the 26 October Carrier V1 review. Its 80 component bodies and native saved-rule CAD checks are verified; assembly fit, power, timing and hardware operation require separate validation.'],
      sources:[['Original ASIC and LDO board references','hardware/overview.md'],...sources]
    });
  };
})();
