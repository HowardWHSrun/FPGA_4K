/* Connect the selected FPGA system region to its board-level slide deck. */
(() => {
  const link=document.getElementById('open-fpga-design');
  if(!link)return;
  const details=document.getElementById('detail-button');
  const selected=()=>window.PRESENTATION?.getState().slideId==='fpga';
  function sync(){const on=selected();link.hidden=!on;if(details)details.hidden=on;}
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-slide="fpga"]')&&selected()){
      e.preventDefault();e.stopImmediatePropagation();location.assign(link.href);
    }
  },true);
  document.getElementById('scene')?.addEventListener('dblclick',()=>{if(selected())location.assign(link.href);});
})();
