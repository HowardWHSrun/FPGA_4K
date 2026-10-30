/* Latest board previews inside the original overview layout. */
(() => {
 'use strict';
 const api=window.PRESENTATION;if(!api)return;
 const $=id=>document.getElementById(id),meeting='presentation/meetings/2026-10-14-v16/';
 const image=id=>'presentation/overview/'+(id==='carrier-schematic'?'image-viewer-v11.html':'image-viewer.html')+'?asset='+id+'&v='+(id==='carrier-schematic'?'20261018-v11':'20261015-v8');
 const assembly='presentation/overview/assembly-v8/index.html?v=20261015-v8';
 const systemMeeting='presentation/meetings/2026-10-28-v8/';
 const overviewAssembly=systemMeeting+'assets/system-viewer/index.html?embed=1';
 const reviews={
  assembly:{name:'XEM8310 · eight HDMI links',caption:'8 Frontend FPGA Board / FPGA-LDO PCB / ASIC stacks → HDMI Extension Board + XEM8310 → PCIe x4 → PC',scope:'28 October meeting topology · saved model snapshots · cable and populated fit remain unqualified',views:{'3d':overviewAssembly}},
  currentAsic:{name:'ASIC stack · 28 October concept',caption:'One frontend stack · four PCB-5-derived ASIC boards, FPGA-LDO PCB and Frontend FPGA Board',scope:'Thinner board and connector spacing are illustrative · eight stacks in the system view',views:{'3d':overviewAssembly}},
  adapter:{name:'HDMI Extension Board · meeting snapshot',caption:'XEM8310 · J101–J108 · eight HDMI links · PCIe x4 to PC',scope:'27 October V1 placement used in the 28 October meeting · 247 footprints · unrouted',views:{'3d':overviewAssembly,layout:systemMeeting+'assets/layout-viewer/breakout/index.html?embed=1',schematic:'presentation/overview/image-viewer.html?board=hdmi-extension&asset=hdmi-overview&v=20261030-custom-v1'}},
  asicReference:{name:"ASIC carrier · source reference",caption:"Original PCB-5 · two ASIC footprints",scope:"Board reference · populated mating and hardware operation unqualified",views:{'3d':'presentation/overview/asic-reference-v5.html'}},
  fpga:{name:'Saved Frontend FPGA Board V41',caption:'25 × 23 mm · V41 routing checkpoint',scope:'116/116 digital mezzanine paths · 445 whole-board opens',download:'presentation/overview/assets/FPGA_V41_Complete_KiCad_2026-10-14.zip',views:{'3d':meeting+'fpga_3d/index.html',layout:meeting+'fpga_viewer/index.html?embed=1',schematic:image('fpga-schematic')}},
  separate:{name:'Saved FPGA-LDO PCB V5',caption:'32 × 32.5 mm · 32 LT3046 stages',scope:'Unrouted placement · physical ASIC distribution/adapter open',download:'presentation/overview/assets/Separate_LDO_V5_Complete_KiCad_2026-10-14.zip',views:{'3d':meeting+'stack_viewer/index.html?architecture=separate',layout:meeting+'ldo_viewer/index.html?embed=1',schematic:image('ldo-schematic')}},
  combined:{name:'Saved combined FPGA + shared LDO V7',caption:'30 × 30 mm · 8 shared LT3046 stages',scope:'Unrouted · shared-load/noise/thermal feasibility open',download:'presentation/overview/assets/Combined_FPGA_Shared_LDO_V7_KiCad.zip',views:{'3d':assembly+'&architecture=combined&focus=compact',layout:image('combined-layout'),schematic:image('combined-schematic')}},
  receiver:{name:'Direct LDO Carrier · V3',caption:'30 October 2026 · current four-layer carrier routing',scope:'80 fitted parts · native DRC / opens / parity 0 / 0 / 0 · JLC acceptance and sourcing pending',download:'hardware/xem8305-carrier/dated/2026-10-30/carrier-v3/Carrier_V3_KiCad.zip',views:{'3d':'presentation/overview/carrier-assembly-v2/index.html?embed=1&view=3d',layout:'presentation/overview/carrier-v3/layout.html?embed=1&v=20261030-v3',schematic:'presentation/overview/carrier-v3/schematic.html?embed=1&v=20261030-v3'}}
 };
 const top=document.querySelector('.viewer-top'),label=$('view-label'),camera=top.querySelector('.segmented'),controls=document.querySelector('.viewer-controls'),caption=document.querySelector('.scene-caption'),savedCaption=caption.innerHTML;
 const frame=document.createElement('iframe');frame.id='current-board-preview';frame.hidden=true;frame.allowFullscreen=true;$('scene-container').append(frame);
 const tabs=document.createElement('div');tabs.className='current-view-tabs';tabs.hidden=true;tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Current board view');
 for(const [key,text] of [['3d','3D'],['layout','Layout'],['schematic','Schematic']]){const button=document.createElement('button');button.dataset.currentView=key;button.textContent=text;button.onclick=()=>{viewByBoard[active]=key;sync();};tabs.append(button);}
 const power=document.createElement('label');power.className='current-power-choice';power.hidden=true;power.innerHTML='<select id="power-architecture" aria-label="Power board option"><option value="separate">FPGA-LDO PCB · V5</option><option value="combined">Combined FPGA + shared LDO · V7</option></select>';
 top.append(power,tabs);
 const viewByBoard={assembly:'3d',currentAsic:'3d',adapter:'3d',asicReference:'3d',fpga:'3d',separate:'3d',combined:'layout',receiver:'layout'};let active='',powerOption='separate';
 let systemFocus='',systemObserver;
 function focusSystemView(){
  const mode={assembly:'all',currentAsic:'frontend',adapter:'host'}[active];
  try{
   const doc=frame.contentDocument;
   if(!mode||!doc?.URL.includes('/2026-10-28-v8/assets/system-viewer/'))return;
   if(doc.body?.dataset.ready==='true'){
    systemObserver?.disconnect();
    if(systemFocus!==mode){doc.getElementById(mode)?.click();systemFocus=mode;}
   }else if(doc.body){
    systemObserver?.disconnect();systemObserver=new MutationObserver(focusSystemView);
    systemObserver.observe(doc.body,{attributes:true,attributeFilter:['data-ready']});
   }
  }catch{/* The full-size viewer retains its own view controls. */}
 }
 $('power-architecture').onchange=event=>{setPower(event.target.value);};
 function setPower(value){powerOption=value;$('power-architecture').value=value;window.setPowerOverviewOption?.(value);sync();}
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.type==='overview-power-option'&&['separate','combined'].includes(event.data.value))setPower(event.data.value);
  if(event.data?.type==='overview-select-section'&&['carriers','fpga','routing','adapter'].includes(event.data.section))api.setSlide(event.data.section);
  if(event.data?.type==='native-pcb-key'&&window.overviewApproach==='custom'&&active==='adapter'&&viewByBoard.adapter==='layout'&&!document.querySelector('dialog[open]')){
   const key=event.data.key;
   if(key==='Escape')api.setSlide('overview');
   else if(['ArrowLeft','PageUp'].includes(key))api.setSlide(api.getState().slide-1);
   else if(['ArrowRight','PageDown'].includes(key))api.setSlide(api.getState().slide+1);
  }
 });
 function link(id,url,text,on){const el=$(id);if(!el)return;el.hidden=!on;if(on){el.href=url;el.firstChild.textContent=text+' ';}}
 function sync(){
  const section=api.getState().slideId;active=section==='overview'?(window.overviewApproach==='direct'?'receiver':'assembly'):section==='carriers'?(window.overviewApproach==='direct'?'asicReference':'currentAsic'):section==='routing'?powerOption:section;const review=reviews[active],on=Boolean(review);
  document.body.classList.toggle('carrier-inspection',active==='receiver');
  document.body.classList.toggle('assembly-inspection',active==='assembly');
  frame.hidden=!on;$('scene-container').classList.toggle('current-preview-active',on);tabs.hidden=!on||Object.keys(review?.views||{}).length===1;camera.hidden=on;controls.hidden=on;power.hidden=section!=='routing';top.classList.toggle('current-preview',on);
  for(const id of ['scene','markers','camera-name','model-status'])$(id).hidden=on||(id==='model-status'&&api.getState().loaded);
  link('open-adapter-design',systemMeeting+'index.html#slide-3','Open 28 October HDMI Extension Board review',section==='adapter');
  link('open-fpga-design',reviews.fpga.download,'Download Frontend FPGA Board V41 · complete KiCad',section==='fpga');
  link('open-ldo-design',reviews[powerOption].download,'Download '+reviews[powerOption].name+' · complete KiCad',section==='routing');
  link('open-receiver-design',reviews.receiver.download,'Download Direct LDO Carrier V3 · KiCad project',section==='receiver'||section==='overview'&&window.overviewApproach==='direct');
  const manufacturing=$('carrier-manufacturing-links');if(manufacturing)manufacturing.hidden=active!=='receiver';
  if(on){
   const view=viewByBoard[active];label.textContent=active==='receiver'&&view==='3d'?'Assembly reference · 26 October 2026':review.name;
   tabs.querySelectorAll('button').forEach(button=>{button.hidden=!review.views[button.dataset.currentView];button.setAttribute('aria-pressed',String(view===button.dataset.currentView));});
   const url=review.views[view];if(frame.getAttribute('src')!==url){systemFocus='';systemObserver?.disconnect();frame.src=url;}frame.title=review.name+' · '+view;focusSystemView();
   const text=active==='receiver'&&view==='3d'?['Earlier Carrier V1 + XEM8305 + LDO · assembly reference','30 October Carrier V3 is in the Layout and Schematic tabs']: [review.caption,review.scope];
   caption.replaceChildren(...text.map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
   link('open-schematic-design',url,'Open current view full size',true);
  }else{caption.innerHTML=savedCaption;link('open-schematic-design','presentation/schematic/?board=adapter','View historical adapter schematic',section==='adapter');}
  try{if(frame.contentDocument)frame.contentDocument.documentElement.dataset.overviewSection=section;}catch{}
  frame.contentWindow?.postMessage({type:'presentation-slide-active',active:on},location.origin);
  window.currentOverviewState={version:'V25',approach:window.overviewApproach,section,board:on?active:null,view:on?viewByBoard[active]:null,powerOption,source:on?frame.getAttribute('src'):null};
 }
 frame.addEventListener('load',()=>{systemFocus='';focusSystemView();frame.contentWindow?.postMessage({type:'presentation-slide-active',active:!frame.hidden},location.origin);});
 new MutationObserver(sync).observe($('slide-title'),{childList:true,subtree:true});
 // Preserve current and earlier section URLs without changing the six-section navigation.
 const aliases={carrier:'receiver',ldo:'routing',combined:'routing'};
 function alias(){const key=location.hash.slice(1);if(aliases[key]){if(key==='combined'||key==='ldo'){powerOption=key==='combined'?'combined':'separate';$('power-architecture').value=powerOption;window.setPowerOverviewOption?.(powerOption);}api.setSlide(aliases[key],false);sync();}}
 window.addEventListener('hashchange',alias);alias();sync();
 document.addEventListener('DOMContentLoaded',()=>{document.body.dataset.presentationRevision='overview-v25';},{once:true});
})();

/* Route context, one updates entry point, and responsive embedded controls. */
(() => {
 'use strict';
 const api=window.PRESENTATION;if(!api)return;
 const updates=document.getElementById('updates-dialog');
 document.getElementById('open-updates').onclick=()=>updates.showModal();
 document.getElementById('close-updates').onclick=()=>updates.close();
 updates.addEventListener('click',event=>{
  if(event.target.closest('a[href^="#"]'))updates.close();
  if(event.target!==updates)return;
  const rect=updates.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)updates.close();
 });
 // Keep the compact application's presentation shortcuts out of the modal.
 document.addEventListener('keydown',event=>{if(updates.open)event.stopImmediatePropagation();},true);
 const context={overview:'Two parallel approaches',carriers:'ASIC board reference',routing:'A · Custom FPGA approach',fpga:'A · Custom FPGA approach',adapter:'A · XEM8310 / eight HDMI links',receiver:'B · Parallel direct-LDO approach'};
 let previous='';
 function sync(){
  const section=api.getState().slideId;
  document.getElementById('approach-label').textContent=section==='overview'?(window.overviewApproach==='direct'?'B · Parallel direct-LDO approach':'A · Custom FPGA approach'):context[section]||'';
  if(section!==previous)document.querySelector('.story').scrollTop=0;
  if(!['overview','carriers','adapter','fpga','routing','receiver'].includes(section)&&!(window.overviewApproach==='direct'&&['overview','carriers'].includes(section)))document.getElementById('view-label').textContent='Earlier assembly concept';
  previous=section;
 }
 new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});sync();
 document.querySelector('.system-nav').addEventListener('click',event=>{
  if(event.target.closest('[data-slide]')&&matchMedia('(max-width:1099px),(max-height:649px)').matches)document.querySelector('.heading').scrollIntoView({block:'start',behavior:'instant'});
 });
 const frame=document.getElementById('current-board-preview');
 frame.addEventListener('load',()=>{
  try{
   const doc=frame.contentDocument;if(!doc)return;
   doc.documentElement.dataset.overviewEmbed=frame.getAttribute('src')?.includes('assembly-v23/')?'V23':frame.getAttribute('src')?.includes('carrier-assembly-v2/')?'V25':frame.getAttribute('src')?.includes('carrier-v1/')?'V24':'V11';
   doc.documentElement.dataset.overviewSection=api.getState().slideId;
   if(frame.getAttribute('src')?.includes('/2026-10-28-v8/'))return;
   if(frame.getAttribute('src')?.includes('carrier-v3/')||['V23','V24','V25'].includes(doc.documentElement.dataset.overviewEmbed)||doc.getElementById('overview-embed-style'))return;
   const link=doc.createElement('link');link.id='overview-embed-style';link.rel='stylesheet';link.href=new URL('presentation/overview/embedded-controls-v11.css?v=20261018-v11',document.baseURI).href;doc.head.append(link);
  }catch{/* A standalone cross-origin viewer retains its own controls. */}
 });
})();
