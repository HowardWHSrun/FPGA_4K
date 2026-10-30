/* Board names agreed 30 October 2026. Display names do not change CAD identity. */
(() => {
 'use strict';
 const catalog=window.OVERVIEW_SLIDE_CATALOG;if(!Array.isArray(catalog))return;
 window.PCB_BOARD_NAMES=Object.freeze({direct:'Direct LDO Carrier',frontend:'Frontend FPGA Board',power:'FPGA-LDO PCB',hdmi:'HDMI Extension Board'});
 const find=id=>catalog.find(slide=>slide.id===id);
 function text(value){
  if(typeof value!=='string')return value;
  return value.replace(/\bDirect-LDO carrier\b/gi,'Direct LDO Carrier')
   .replace(/\bstandalone FPGA\b/gi,'Frontend FPGA Board')
   .replace(/\bFPGA V(41|54)\b/g,'Frontend FPGA Board V$1')
   .replace(/\bseparate LDO V(5|13)\b/gi,'FPGA-LDO PCB V$1')
   .replace(/\bnew LDO V(5|13)\b/gi,'FPGA-LDO PCB V$1')
   .replace(/\bflat LDO V13\b/gi,'flat FPGA-LDO PCB V13')
   .replace(/\bLDO V(5|13)\b/g,'FPGA-LDO PCB V$1');
 }
 function apply(){
  for(const slide of catalog){
   for(const key of ['section','title','subtitle','description','noteLabel','note'])slide[key]=text(slide[key]);
   if(slide.details)slide.details=slide.details.map(text);
   if(slide.sources)slide.sources=slide.sources.map(([label,url])=>[text(label),url]);
  }
  Object.assign(find('fpga')||{},{section:'A · Frontend FPGA Board',title:'Frontend FPGA Board · V41',subtitle:'Artix-7 35T · saved V41 routing checkpoint.'});
  if(window.powerOverviewOption==='separate')Object.assign(find('routing')||{},{section:'A · FPGA-LDO PCB',title:'FPGA-LDO PCB · V5',subtitle:'LDO power board for the Frontend FPGA Board.',noteLabel:'Unrouted placement · FPGA-LDO PCB V5'});
 }
 const originalApproach=window.setOverviewApproachContent;
 window.setOverviewApproachContent=mode=>{originalApproach(mode);apply();};
 const originalPower=window.setPowerOverviewOption;
 window.setPowerOverviewOption=key=>{
  const result=originalPower(key);apply();
  const api=window.PRESENTATION;if(result&&api?.getState().slideId==='routing')api.setSlide('routing',false);
  return result;
 };
 apply();
 document.documentElement.dataset.pcbNamingRevision='V1';
})();
