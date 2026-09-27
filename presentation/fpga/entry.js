/* Show native board detail for FPGA; preserve supplied STL and two-stage navigation. */
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='presentation/fpga/refinements.css?v=sept27-3d';document.head.append(style);
  const link=document.getElementById('open-fpga-design');if(!link)return;
  const details=document.getElementById('detail-button'), container=document.getElementById('scene-container');
  const frame=document.createElement('iframe');frame.id='fpga-system-3d';frame.title='Current FPGA PCB in 3D';frame.hidden=true;frame.allow='fullscreen';frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';container.append(frame);
  const top=document.querySelector('.viewer-top'),controls=document.querySelector('.viewer-controls'),caption=document.querySelector('.scene-caption');const savedCaption=caption.innerHTML;
  let activeBoard='usb-c';
  const selected=()=>window.PRESENTATION?.getState().slideId==='fpga';
  function sync(){
    const on=selected();link.hidden=!on;if(details)details.hidden=on;frame.hidden=!on;top.hidden=on;controls.hidden=on;
    for(const id of ['scene','markers','camera-name']){const el=document.getElementById(id);if(el)el.hidden=on;}
    if(on){
      if(!frame.src)frame.src='presentation/fpga/3d/?board=usb-c';
      const note=document.getElementById('slide-note');if(note)note.textContent=activeBoard==='usb-c'?'USB-C development: 268 copper connections remain open. The earlier micro-HDMI board is preserved separately. Firmware, receiver and hardware tests are still required before manufacture.':'Preserved micro-HDMI checkpoint: 0 open copper items in its audit. This does not establish hardware operation. Power, cable, timing, firmware and manufacturing acceptance remain unverified.';
      link.href=activeBoard==='usb-c'?'presentation/fpga/':'presentation/fpga/micro-hdmi.html#board';
      const fact=document.querySelectorAll('#facts .fact')[2];if(fact){fact.querySelector('strong').textContent=activeBoard==='usb-c'?'USB-C':'Micro-HDMI';fact.querySelector('span').textContent=activeBoard==='usb-c'?'development revision':'preserved checkpoint';}
      caption.innerHTML='<span>Native 33 × 36 mm PCB · component approximations identified</span><span>Board detail · assembly fit not verified</span>';
    }else caption.innerHTML=savedCaption;
  }
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='fpga-3d-ready'&&['usb-c','micro-hdmi'].includes(e.data.board)){activeBoard=e.data.board;sync();}});
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});sync();
  document.addEventListener('click',e=>{if(e.target.closest('[data-slide="fpga"]')&&selected()){e.preventDefault();e.stopImmediatePropagation();location.assign(link.href);}},true);
  document.getElementById('scene')?.addEventListener('dblclick',()=>{if(selected())location.assign(link.href);});
})();
