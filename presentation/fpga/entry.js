/* Connect the selected FPGA region to its board-level review; preserve the two-stage navigation. */
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='presentation/fpga/refinements.css?v=sept21-v2';document.head.append(style);
  const link=document.getElementById('open-fpga-design');
  if(!link)return;
  const details=document.getElementById('detail-button');
  const selected=()=>window.PRESENTATION?.getState().slideId==='fpga';
  function sync(){const on=selected();link.hidden=!on;if(details)details.hidden=on;if(on){const note=document.getElementById('slide-note');if(note)note.textContent='The current 100T design remains incomplete. Open the fourth review for the three native CAD checkpoints, 18 uncertainties and the evidence needed to resolve them.';}}
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-slide="fpga"]')&&selected()){
      e.preventDefault();e.stopImmediatePropagation();location.assign(link.href);
    }
  },true);
  document.getElementById('scene')?.addEventListener('dblclick',()=>{if(selected())location.assign(link.href);});
})();
