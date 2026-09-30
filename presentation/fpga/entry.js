/* Display the selected 25T placement in the root FPGA section. The earlier
 * 50T, routed 100T and USB-C board pages remain separate historical reviews. */
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='presentation/fpga/refinements.css?v=sept29-25t';document.head.append(style);
  const link=document.getElementById('open-fpga-design');if(!link)return;
  const schematic=document.getElementById('open-schematic-design');
  const container=document.getElementById('scene-container');
  const frame=document.createElement('iframe');frame.id='fpga-system-3d';frame.title='Selected unrouted XC7A25T PCB placement, repeated for three proposed FPGA links';frame.hidden=true;frame.allow='fullscreen';frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';container.append(frame);
  const top=document.querySelector('.viewer-top'),controls=document.querySelector('.viewer-controls'),caption=document.querySelector('.scene-caption');
  const savedCaption=caption.innerHTML;
  const selected=()=>window.PRESENTATION?.getState().slideId==='fpga';
  function sync(){
    const on=selected();link.hidden=!on;frame.hidden=!on;top.hidden=on;controls.hidden=on;
    const slide=window.PRESENTATION?.getState().slideId;
    if(schematic){
      schematic.hidden=slide!=='fpga'&&slide!=='adapter';
      schematic.href=`presentation/schematic/?board=${slide==='fpga'?'fpga25t':'adapter'}`;
      schematic.firstChild.textContent=slide==='fpga'?'View FPGA schematic ':'View adapter schematic ';
    }
    for(const id of ['scene','markers','camera-name']){const el=document.getElementById(id);if(el)el.hidden=on;}
    if(on){
      if(!frame.src)frame.src='presentation/adapter/assembly.html?embed=1&focus=fpga';
      link.href='presentation/fpga/current-25t.html';
      link.firstChild.textContent='Open selected 25T FPGA section ';
      caption.innerHTML='<span>Native-derived XC7A25T placement · three separate boards</span><span>Unrouted PCB · DF40 connector interface under redesign</span>';
    }else caption.innerHTML=savedCaption;
  }
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});sync();
})();
