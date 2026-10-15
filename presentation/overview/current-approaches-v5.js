/* Choose one hardware path. Keep the same live array used by the compact app. */
(() => {
 'use strict';
 const slides=window.PRESENTATION_SLIDES,catalog=window.OVERVIEW_SLIDE_CATALOG;
 if(!Array.isArray(slides)||!Array.isArray(catalog))return;
 const byId=new Map(catalog.map(slide=>[slide.id,slide]));
 const routes={custom:['overview','carriers','routing','fpga','adapter'],direct:['overview','carriers','receiver']};
 const routeFor=id=>({routing:'custom',fpga:'custom',adapter:'custom',ldo:'custom',combined:'custom',receiver:'direct',carrier:'direct'})[id];
 function readMode(){const requested=new URL(location.href).searchParams.get('approach');return routeFor(location.hash.slice(1))||(Object.hasOwn(routes,requested)?requested:'custom');}
 function apply(mode){
  window.overviewApproach=mode;
  document.body.dataset.overviewApproach=mode;
  window.setOverviewApproachContent(mode);
  slides.splice(0,slides.length,...routes[mode].map(id=>byId.get(id)));
  document.querySelectorAll('[data-approach]').forEach(el=>el.hidden=el.dataset.approach!==mode);
  document.querySelectorAll('[data-choose-approach]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.chooseApproach===mode)));
  routes[mode].forEach((id,index)=>{const number=document.querySelector('.system-nav [data-slide="'+id+'"]>span');if(number)number.textContent=String(index).padStart(2,'0');});
  const label=mode==='direct'?'Direct-LDO approach':'Custom FPGA approach';
  document.getElementById('overview-nav-context').textContent=label;
  document.getElementById('adapter-overview-title').textContent='Selected path · '+label;
 }
 function writeMode(mode,method='replaceState',hash=location.hash){const url=new URL(location.href);url.searchParams.set('approach',mode);url.hash=hash;history[method](null,'',url);}
 // Apply before compact/app.js initializes its hash, navigation and scene.
 apply(readMode());writeMode(window.overviewApproach);
 function readLocation(){const mode=readMode();if(mode!==window.overviewApproach)apply(mode);writeMode(mode);}
 window.addEventListener('hashchange',readLocation,true);
 window.addEventListener('popstate',readLocation,true);
 document.addEventListener('DOMContentLoaded',()=>{
  const api=window.PRESENTATION;if(!api)return;
  // API deep links (including aliases) choose their own route. Core shortcuts use
  // the filtered live array, so their page counts and endpoints remain correct.
  const originalSetSlide=api.setSlide;
  api.setSlide=(id,writeHash=true)=>{
   const mode=typeof id==='string'?routeFor(id):null;
   if(mode&&mode!==window.overviewApproach){apply(mode);writeMode(mode);}
   originalSetSlide(id,writeHash);
  };
  document.querySelectorAll('[data-choose-approach]').forEach(button=>button.addEventListener('click',()=>{
   const mode=button.dataset.chooseApproach;
   if(mode===window.overviewApproach)return;
   apply(mode);writeMode(mode,'pushState','#overview');originalSetSlide('overview',false);
  }));
 });
})();
