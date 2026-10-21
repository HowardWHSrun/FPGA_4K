function updateFrames(){
  const current=document.querySelector('.slide.active');
  document.querySelectorAll('iframe').forEach(frame=>{
    const visible=frame.closest('.slide')===current&&!frame.closest('[hidden]');
    try{frame.contentWindow.postMessage({type:'presentation-slide-active',active:visible},location.origin);if(visible)frame.contentWindow.dispatchEvent(new Event('resize'));}catch{}
  });
}
document.querySelectorAll('[data-panel-target]').forEach(button=>button.addEventListener('click',()=>{
  const slide=button.closest('.slide');
  slide.querySelectorAll('[data-panel]').forEach(panel=>{
    panel.hidden=panel.dataset.panel!==button.dataset.panelTarget;
    if(!panel.hidden){
      panel.querySelectorAll('iframe[data-src]').forEach(frame=>{if(!frame.getAttribute('src'))frame.src=frame.dataset.src;});
      panel.querySelectorAll('img[data-src]').forEach(image=>{if(!image.getAttribute('src'))image.src=image.dataset.src;});
    }
  });
  slide.querySelectorAll('[data-panel-target]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  requestAnimationFrame(updateFrames);
}));
document.querySelectorAll('[data-figure-select]').forEach(select=>select.addEventListener('change',()=>{
  const panel=select.closest('[data-panzoom]'),image=panel.querySelector('img'),option=select.selectedOptions[0];
  image.dataset.src=option.value;image.src=option.value;image.alt=option.dataset.caption;
  panel.querySelector('[data-open-drawing]').href=option.value;
  panel.querySelector('[data-figure-caption]').textContent=option.dataset.caption;
  panel.querySelector('[data-fit]').click();
}));
window.addEventListener('meeting-slide-change',()=>requestAnimationFrame(updateFrames));
