/* Show native board detail for FPGA; preserve supplied STL and two-stage navigation. */
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='presentation/fpga/refinements.css?v=sept27-3d';document.head.append(style);
  const link=document.getElementById('open-fpga-design');if(!link)return;
  const details=document.getElementById('detail-button'), container=document.getElementById('scene-container');
  const frame=document.createElement('iframe');frame.id='fpga-system-3d';frame.title='Selected FPGA PCB in 3D';frame.hidden=true;frame.allow='fullscreen';frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';container.append(frame);
  const top=document.querySelector('.viewer-top'),controls=document.querySelector('.viewer-controls'),caption=document.querySelector('.scene-caption');const savedCaption=caption.innerHTML;
  let activeBoard='fpga50t';
  const selected=()=>window.PRESENTATION?.getState().slideId==='fpga';
  function sync(){
    const on=selected();link.hidden=!on;if(details)details.hidden=on;frame.hidden=!on;top.hidden=on;controls.hidden=on;
    for(const id of ['scene','markers','camera-name']){const el=document.getElementById(id);if(el)el.hidden=on;}
    if(on){
      if(!frame.src)frame.src='presentation/fpga/3d/?board=fpga50t';
      const note=document.getElementById('slide-note');if(note)note.textContent=activeBoard==='fpga50t'?'50T micro-HDMI review: 36 × 38 mm, eight layers and 625 native ratsnest links. J4 power and the link remain unresolved; no hardware or manufacturing release.':activeBoard==='usb-c'?'100T USB-C development: 268 copper connections remain open. Firmware, receiver and hardware tests are still required before manufacture.':'Preserved routed 100T micro-HDMI checkpoint: 0 open copper items in its audit. Power, cable, timing, firmware and manufacturing acceptance remain unverified.';
      link.href=activeBoard==='fpga50t'?'presentation/fpga/#board':activeBoard==='usb-c'?'presentation/fpga/usb-c.html#board':'presentation/fpga/micro-hdmi.html#board';
      link.firstChild.textContent=activeBoard==='fpga50t'?'Open 50T PCB and parts ':activeBoard==='usb-c'?'Open USB-C board and checks ':'Open preserved 100T board and parts ';
      const facts=document.querySelectorAll('#facts .fact');if(facts[0]){facts[0].querySelector('strong').textContent=activeBoard==='fpga50t'?'50T':'100T';facts[0].querySelector('span').textContent=activeBoard==='fpga50t'?'CSG325 package':'CSG324 package';}
      if(facts[1]){facts[1].querySelector('strong').textContent=activeBoard==='fpga50t'?'36 × 38 mm':'33 × 36 mm';facts[1].querySelector('span').textContent=activeBoard==='fpga50t'?'unrouted PCB outline':activeBoard==='usb-c'?'development PCB outline':'preserved PCB outline';}
      if(facts[2]){facts[2].querySelector('strong').textContent=activeBoard==='usb-c'?'USB-C':'Micro-HDMI';facts[2].querySelector('span').textContent=activeBoard==='fpga50t'?'50T review':activeBoard==='usb-c'?'100T development':'100T checkpoint';}
      const noteLabel=document.getElementById('note-label');if(noteLabel)noteLabel.textContent='Selected board status';
      caption.innerHTML=activeBoard==='fpga50t'?'<span>Native 36 × 38 mm 50T PCB · unrouted review</span><span>3D bodies may be approximated · assembly fit unverified</span>':'<span>Native 33 × 36 mm 100T PCB · component approximations identified</span><span>Board detail · assembly fit unverified</span>';
    }else caption.innerHTML=savedCaption;
  }
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='fpga-3d-ready'&&['fpga50t','usb-c','micro-hdmi'].includes(e.data.board)){activeBoard=e.data.board;sync();}});
  new MutationObserver(sync).observe(document.getElementById('slide-title'),{childList:true,subtree:true});sync();
  document.addEventListener('click',e=>{if(e.target.closest('[data-slide="fpga"]')&&selected()){e.preventDefault();e.stopImmediatePropagation();location.assign(link.href);}},true);
  document.getElementById('scene')?.addEventListener('dblclick',()=>{if(selected())location.assign(link.href);});
})();
