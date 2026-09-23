/* Presentation-only finishing layer. Does not alter the model or board-level review. */
(() => {
  'use strict';
  const api=window.PRESENTATION;
  const slides=window.PRESENTATION_SLIDES;
  if(!api||!Array.isArray(slides))return;
  const purpose={overview:'Headboard to host.',carriers:'Two ASICs per carrier.',routing:'One routing and power board.',fpga:'Acquisition and aggregation.',kr260:'Reception, control and streaming.'};
  const nav=document.querySelector('.system-nav');
  const announce=document.createElement('div');
  announce.className='selection-announcement';announce.setAttribute('role','status');announce.setAttribute('aria-live','polite');
  document.body.append(announce);
  let last='';
  function sync(){
    const id=api.getState().slideId,slide=slides.find(s=>s.id===id);
    if(!slide)return;
    document.body.dataset.section=id;
    const heading=document.getElementById('slide-subtitle');
    if(heading&&purpose[id])heading.textContent=purpose[id];
    const ownerText=slide.owners.map(([n,r])=>n+': '+r).join('; ');
    document.getElementById('scene').setAttribute('aria-label',slide.title+(ownerText?'. '+ownerText:'')+'. Drag to rotate; scroll to zoom. Select a labeled board or use the section navigation.');
    if(id!==last){
      announce.textContent=slide.title+(ownerText?'. '+ownerText:'');
      const active=nav?.querySelector('[data-slide="'+id+'"]');
      if(active&&nav.scrollWidth>nav.clientWidth){
        const a=active.getBoundingClientRect(),n=nav.getBoundingClientRect();
        nav.scrollTo({left:nav.scrollLeft+a.left-n.left-(n.width-a.width)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }
      last=id;
    }
  }
  document.querySelectorAll('[data-slide]').forEach(button=>{
    const slide=slides.find(s=>s.id===button.dataset.slide);if(!slide)return;
    const owners=slide.owners.map(([name,role])=>name+' — '+role).join('; ');
    button.setAttribute('aria-label',slide.title+(owners?'. '+owners:'')+'. Select section.');
    if(button.closest('.markers'))button.title=slide.title+(owners?' · '+owners:'');
    function highlight(on){document.querySelectorAll('[data-slide="'+slide.id+'"]').forEach(el=>el.classList.toggle('is-hovered',on));}
    button.addEventListener('pointerenter',()=>highlight(true));button.addEventListener('pointerleave',()=>highlight(false));
    button.addEventListener('focus',()=>highlight(true));button.addEventListener('blur',()=>highlight(false));
  });
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||event.defaultPrevented||document.querySelector('dialog[open]')||document.fullscreenElement)return;
    if(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||event.target.isContentEditable)return;
    api.setSlide('overview');
  });
  if(nav)new ResizeObserver(()=>{
    const active=nav.querySelector('[data-slide="'+api.getState().slideId+'"]');
    if(active&&nav.scrollWidth>nav.clientWidth){
      const a=active.getBoundingClientRect(),n=nav.getBoundingClientRect();
      nav.scrollTo({left:nav.scrollLeft+a.left-n.left-(n.width-a.width)/2,behavior:'instant'});
    }
  }).observe(nav);
  sync();document.body.dataset.presentationRevision='review-v2.1';
})();
