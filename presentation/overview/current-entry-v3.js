/* Latest board previews inside the original overview layout. */
(() => {
 'use strict';
 const api=window.PRESENTATION;if(!api)return;
 const $=id=>document.getElementById(id),meeting='presentation/meetings/2026-10-14-v16/';
 const image=id=>'presentation/overview/image-viewer.html?asset='+id+'&v=20261014-v3';
 const reviews={
  fpga:{name:'FPGA V41',caption:'25 × 23 mm · V41 routing checkpoint',scope:'116/116 digital mezzanine paths · 445 whole-board opens',download:'presentation/overview/assets/FPGA_V41_Complete_KiCad_2026-10-14.zip',views:{'3d':meeting+'fpga_3d/index.html',layout:meeting+'fpga_viewer/index.html?embed=1',schematic:image('fpga-schematic')}},
  separate:{name:'Separate LDO V5',caption:'32 × 32.5 mm · 32 LT3046 stages',scope:'Unrouted placement · physical ASIC distribution/adapter open',download:'presentation/overview/assets/Separate_LDO_V5_Complete_KiCad_2026-10-14.zip',views:{'3d':meeting+'stack_viewer/index.html?architecture=separate',layout:meeting+'ldo_viewer/index.html?embed=1',schematic:image('ldo-schematic')}},
  combined:{name:'Combined FPGA + shared LDO V7',caption:'30 × 30 mm · 8 shared LT3046 stages',scope:'Unrouted · shared-load/noise/thermal feasibility open',download:'presentation/overview/assets/Combined_FPGA_Shared_LDO_V7_KiCad.zip',views:{layout:image('combined-layout'),schematic:image('combined-schematic')}},
  receiver:{name:'XEM8305 carrier V17',caption:'53 × 83 mm · six-layer carrier V17',scope:'V17 schematic/project · unchanged V16 physical geometry',download:'presentation/overview/assets/Carrier_V17_Complete_KiCad.zip',views:{'3d':meeting+'carrier_viewer/index.html?embed=1',layout:meeting+'carrier_viewer/native/index.html?embed=1',schematic:image('carrier-schematic')}}
 };
 const top=document.querySelector('.viewer-top'),label=$('view-label'),camera=top.querySelector('.segmented'),controls=document.querySelector('.viewer-controls'),caption=document.querySelector('.scene-caption'),savedCaption=caption.innerHTML;
 const frame=document.createElement('iframe');frame.id='current-board-preview';frame.hidden=true;frame.allowFullscreen=true;$('scene-container').append(frame);
 const tabs=document.createElement('div');tabs.className='current-view-tabs';tabs.hidden=true;tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Current board view');
 for(const [key,text] of [['3d','3D'],['layout','Layout'],['schematic','Schematic']]){const button=document.createElement('button');button.dataset.currentView=key;button.textContent=text;button.onclick=()=>{viewByBoard[active]=key;sync();};tabs.append(button);}
 const power=document.createElement('label');power.className='current-power-choice';power.hidden=true;power.innerHTML='<select id="power-architecture" aria-label="Power board option"><option value="separate">Separate LDO · V5</option><option value="combined">Combined FPGA + shared LDO · V7</option></select>';
 top.append(power,tabs);
 const viewByBoard={fpga:'3d',separate:'3d',combined:'layout',receiver:'3d'};let active='',powerOption='separate';
 $('power-architecture').onchange=event=>{powerOption=event.target.value;window.setPowerOverviewOption?.(powerOption);sync();};
 function link(id,url,text,on){const el=$(id);if(!el)return;el.hidden=!on;if(on){el.href=url;el.firstChild.textContent=text+' ';}}
 function sync(){
  const section=api.getState().slideId;active=section==='routing'?powerOption:section;const review=reviews[active],on=Boolean(review);
  frame.hidden=!on;$('scene-container').classList.toggle('current-preview-active',on);tabs.hidden=!on;camera.hidden=on;controls.hidden=on;power.hidden=section!=='routing';top.classList.toggle('current-preview',on);
  for(const id of ['scene','markers','camera-name','model-status'])$(id).hidden=on||(id==='model-status'&&api.getState().loaded);
  link('open-fpga-design',reviews.fpga.download,'Download FPGA V41 · complete KiCad',section==='fpga');
  link('open-ldo-design',reviews[powerOption].download,'Download '+reviews[powerOption].name+' · complete KiCad',section==='routing');
  link('open-receiver-design',reviews.receiver.download,'Download carrier V17 · complete KiCad',section==='receiver');
  if(on){
   const view=viewByBoard[active];label.textContent=review.name;
   tabs.querySelectorAll('button').forEach(button=>{button.hidden=!review.views[button.dataset.currentView];button.setAttribute('aria-pressed',String(view===button.dataset.currentView));});
   const url=review.views[view];if(frame.getAttribute('src')!==url)frame.src=url;frame.title=review.name+' · '+view;
   caption.replaceChildren(...[review.caption,review.scope].map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
   link('open-schematic-design',url,'Open current view full size',true);
  }else{caption.innerHTML=savedCaption;link('open-schematic-design','presentation/schematic/?board=adapter','View historical adapter schematic',section==='adapter');}
  frame.contentWindow?.postMessage({type:'presentation-slide-active',active:on},location.origin);
  window.currentOverviewState={version:'V3',section,board:on?active:null,view:on?viewByBoard[active]:null,powerOption,source:on?frame.getAttribute('src'):null};
 }
 frame.addEventListener('load',()=>frame.contentWindow?.postMessage({type:'presentation-slide-active',active:!frame.hidden},location.origin));
 new MutationObserver(sync).observe($('slide-title'),{childList:true,subtree:true});
 // Preserve current and earlier section URLs without changing the six-section navigation.
 const aliases={carrier:'receiver',ldo:'routing',combined:'routing'};
 function alias(){const key=location.hash.slice(1);if(aliases[key]){if(key==='combined'||key==='ldo'){powerOption=key==='combined'?'combined':'separate';$('power-architecture').value=powerOption;window.setPowerOverviewOption?.(powerOption);}api.setSlide(aliases[key],false);sync();}}
 window.addEventListener('hashchange',alias);alias();sync();
})();
