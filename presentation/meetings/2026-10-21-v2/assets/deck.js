const slides=[...document.querySelectorAll('.slide')];
let active=Math.max(0,slides.findIndex(s=>s.id===location.hash.slice(1)));
const count=document.getElementById('slide-count');
function tellFrames(){
  document.querySelectorAll('iframe').forEach(frame=>{
    const shown=frame.closest('.slide')===slides[active]&&!frame.closest('[hidden]');
    try{frame.contentWindow.postMessage({type:'presentation-slide-active',active:shown},location.origin);if(shown)frame.contentWindow.dispatchEvent(new Event('resize'));}catch{}
  });
}
function show(index){
  active=Math.max(0,Math.min(slides.length-1,index));document.body.classList.remove('focused');
  slides.forEach((s,i)=>{s.classList.toggle('active',i===active);if(document.body.classList.contains('presenting'))s.setAttribute('aria-hidden',String(i!==active));else s.removeAttribute('aria-hidden')});
  const needed=document.body.classList.contains('presenting')?slides[active].querySelectorAll('iframe'):document.querySelectorAll('iframe');
  needed.forEach(frame=>{if(!frame.closest('[hidden]')&&!frame.getAttribute('src'))frame.src=frame.dataset.src;});
  const images=document.body.classList.contains('presenting')?slides[active].querySelectorAll('img[data-src]'):document.querySelectorAll('img[data-src]');
  images.forEach(image=>{if(!image.getAttribute('src'))image.src=image.dataset.src;});
  count.textContent=`${active+1} / ${slides.length}`;history.replaceState(null,'',`#${slides[active].id}`);
  document.getElementById('focus-view').hidden=!slides[active].classList.contains('interactive');
  document.getElementById('focus-view').textContent='Expand view';document.getElementById('focus-view').setAttribute('aria-pressed','false');
  if(document.body.classList.contains('presenting'))window.scrollTo(0,0);
  window.dispatchEvent(new Event('meeting-slide-change'));requestAnimationFrame(tellFrames);
}
function present(){document.body.classList.toggle('presenting');document.getElementById('present').textContent=document.body.classList.contains('presenting')?'Overview':'Present';show(active);if(!document.body.classList.contains('presenting'))slides[active].scrollIntoView();}
document.getElementById('present').onclick=present;
document.getElementById('previous').onclick=()=>show(active-1);document.getElementById('next').onclick=()=>show(active+1);
document.getElementById('notes').onclick=()=>{document.body.classList.toggle('notes-visible');document.getElementById('notes').setAttribute('aria-pressed',String(document.body.classList.contains('notes-visible')));};
document.getElementById('focus-view').onclick=()=>{document.body.classList.toggle('focused');const on=document.body.classList.contains('focused');document.getElementById('focus-view').textContent=on?'Back to slide':'Expand view';document.getElementById('focus-view').setAttribute('aria-pressed',String(on));requestAnimationFrame(tellFrames);};
document.getElementById('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
document.addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea,select,.native-stage'))return;
  if(e.key===' '&&e.target.closest('button,a'))return;
  if(['ArrowRight','PageDown'].includes(e.key)){show(active+1);e.preventDefault();}
  else if(['ArrowLeft','PageUp'].includes(e.key)){show(active-1);e.preventDefault();}
  else if(e.key.toLowerCase()==='n'){document.getElementById('notes').click();e.preventDefault();}
  else if(e.key.toLowerCase()==='p'){present();e.preventDefault();}
  else if(e.key==='Home'){show(0);e.preventDefault();}
  else if(e.key==='End'){show(slides.length-1);e.preventDefault();}
});
window.addEventListener('hashchange',()=>{const i=slides.findIndex(s=>s.id===location.hash.slice(1));if(i>=0)show(i)});
for(const iframe of document.querySelectorAll('iframe'))iframe.addEventListener('load',()=>{
  tellFrames();
  try{iframe.contentDocument.addEventListener('keydown',e=>{if(['PageDown','PageUp'].includes(e.key)||e.altKey&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();show(active+(['PageDown','ArrowRight'].includes(e.key)?1:-1));}});}catch{}
});
document.querySelectorAll('[data-fpga-view]').forEach(button=>button.onclick=()=>{
  const is3d=button.dataset.fpgaView==='3d';
  document.getElementById('fpga-3d-panel').hidden=!is3d;
  document.getElementById('fpga-routing-panel').hidden=is3d;
  document.querySelectorAll('[data-fpga-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const panel=document.getElementById(is3d?'fpga-3d-panel':'fpga-routing-panel');
  panel.querySelectorAll('iframe').forEach(frame=>{if(!frame.getAttribute('src'))frame.src=frame.dataset.src;});
  requestAnimationFrame(tellFrames);
});
window.meetingCAD={};
for(const panel of document.querySelectorAll('[data-panzoom]')){
  const stage=panel.querySelector('.native-stage'),image=stage.querySelector('img, [data-panzoom-content]'),readout=panel.querySelector('[data-zoom-readout]');
  const state={scale:1,x:0,y:0};window.meetingCAD[panel.id]=state;let pointer=null;
  function render(){image.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;readout.textContent=`${Math.round(state.scale*100)}%`;}
  function zoom(factor,px=stage.clientWidth/2,py=stage.clientHeight/2){const next=Math.max(1,Math.min(18,state.scale*factor)),r=next/state.scale;state.x=(state.x-(px-stage.clientWidth/2))*r+(px-stage.clientWidth/2);state.y=(state.y-(py-stage.clientHeight/2))*r+(py-stage.clientHeight/2);state.scale=next;render();}
  const fit=()=>{state.scale=1;state.x=0;state.y=0;render();};
  panel.querySelector('[data-zoom-in]').onclick=()=>zoom(1.4);panel.querySelector('[data-zoom-out]').onclick=()=>zoom(1/1.4);panel.querySelector('[data-fit]').onclick=fit;
  stage.addEventListener('wheel',e=>{const r=stage.getBoundingClientRect();zoom(e.deltaY<0?1.14:1/1.14,e.clientX-r.left,e.clientY-r.top);e.preventDefault()},{passive:false});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');stage.focus();e.preventDefault()});
  stage.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;state.x+=e.clientX-pointer.x;state.y+=e.clientY-pointer.y;pointer.x=e.clientX;pointer.y=e.clientY;render()});
  const release=()=>{pointer=null;stage.classList.remove('dragging')};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
  stage.addEventListener('keydown',e=>{if(['+','='].includes(e.key))zoom(1.4);else if(e.key==='-')zoom(1/1.4);else if(e.key.toLowerCase()==='r')fit();else return;e.preventDefault();e.stopPropagation()});render();
}
window.meetingDeck={show,slides:slides.length,get active(){return active},present};show(active);
