/* Current dated reviews in the overview. Earlier native viewers remain in history. */
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='presentation/fpga/refinements.css?v=weekend-20261004';document.head.append(style);
  const link=document.getElementById('open-fpga-design');if(!link)return;
  const schematic=document.getElementById('open-schematic-design');
  const container=document.getElementById('scene-container');
  const frame=document.createElement('iframe');frame.id='fpga-system-3d';frame.hidden=true;frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';container.append(frame);
  const top=document.querySelector('.viewer-top'),controls=document.querySelector('.viewer-controls'),caption=document.querySelector('.scene-caption');
  const savedCaption=caption.innerHTML;
  const reviews={
    fpga:{url:'presentation/fpga/current-35t.html',title:'Current XC7A35T R39 board review',caption:'XC7A35T · R39 · 5 October 2026',status:'Pre-routing corrections applied · routing incomplete'},
    routing:{url:'presentation/ldo-backup/current-e5.html',title:'Current LDO routing adapter E5 review',caption:'LDO routing adapter · E5 · 4 October 2026',status:'Separate locking power header · qualification pending'},
    receiver:{url:'presentation/xem/carrier-r12-2026-10-09.html',title:'Current XEM8305 / LDO carrier R12 · interactive routing and 3D',caption:'XEM8305 / LDO carrier · R12 · 9 October 2026',status:'Six routing layers · drag, zoom and rotate · hardware qualification pending'}
  };
  let shown='';
  function sync(){
    const slide=window.PRESENTATION?.getState().slideId,review=reviews[slide],on=Boolean(review);
    link.hidden=slide!=='fpga';frame.hidden=!on;top.hidden=on;controls.hidden=on;
    if(schematic){schematic.hidden=slide!=='adapter';schematic.href='presentation/schematic/?board=adapter';schematic.firstChild.textContent='View adapter schematic ';}
    for(const id of ['scene','markers','camera-name']){const el=document.getElementById(id);if(el)el.hidden=on;}
    if(on){
      if(shown!==slide){frame.src=review.url+'?embed=1';frame.title=review.title;shown=slide;}
      caption.replaceChildren();
      for(const text of [review.caption,review.status]){const span=document.createElement('span');span.textContent=text;caption.append(span);}
    }else caption.innerHTML=savedCaption;
  }
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});sync();
})();
