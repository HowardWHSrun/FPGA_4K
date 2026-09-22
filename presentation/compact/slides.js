/* Edit this array to add the team's slide content. IDs are shareable URL hashes.
   Only the overview and region-navigation scaffold are populated at this stage. */
window.PRESENTATION_SLIDES = [
  {id:'overview',section:'OVERALL ASSEMBLY',title:['4K recording','system.'],subtitle:'Overall PCB assembly',description:'The compact structure, from the ASIC-carrier stack to the routing and FPGA boards.',regions:['A','B','C','D'],noteLabel:'ASSEMBLY OVERVIEW',note:'Select a region to highlight it in the model.'},
  {id:'carriers',section:'REGION A',title:['ASIC-carrier','stack.'],subtitle:'Recording front end',description:'Region A identifies the four stacked ASIC-carrier boards in the assembly concept.',regions:['A'],noteLabel:'SECTION PLACEHOLDER',note:'Board details and the team’s update will be added here.'},
  {id:'routing',section:'REGIONS B + C',title:['Routing &','connection.'],subtitle:'Compact B revision',description:'Region B is the compact connecting section. Region C is the lower routing-board region.',regions:['B','C'],noteLabel:'SECTION PLACEHOLDER',note:'Routing, power, and connector details will be added here.'},
  {id:'fpga',section:'REGION D',title:['FPGA','board.'],subtitle:'Upper board region',description:'Region D identifies the FPGA board above the routing-board region.',regions:['D'],noteLabel:'SECTION PLACEHOLDER',note:'PCB and FPGA development details will be added here.'}
];
