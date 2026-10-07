window.meetingCAD={};
for(const holder of document.querySelectorAll('[data-panzoom]')){
  const stage=holder.querySelector('.cad-stage'),image=stage.querySelector('img'),select=holder.querySelector('select'),readout=holder.querySelector('[data-zoom-readout]');
  const state={scale:1,x:0,y:0,source:image.getAttribute('src'),changes:0};window.meetingCAD[holder.id]=state;
  let pointer=null;
  function render(){image.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;readout.textContent=`${Math.round(state.scale*100)}%`;state.changes++;}
  function zoom(factor,px=stage.clientWidth/2,py=stage.clientHeight/2){const next=Math.max(1,Math.min(14,state.scale*factor)),ratio=next/state.scale;state.x=(state.x-(px-stage.clientWidth/2))*ratio+(px-stage.clientWidth/2);state.y=(state.y-(py-stage.clientHeight/2))*ratio+(py-stage.clientHeight/2);state.scale=next;render();}
  function reset(){state.scale=1;state.x=0;state.y=0;render();}
  select.addEventListener('change',()=>{const option=select.selectedOptions[0];image.src=option.value;image.alt=option.textContent;state.source=option.value;holder.querySelector('[data-open-source]').href=option.value;reset();});
  holder.querySelector('[data-zoom-in]').addEventListener('click',()=>zoom(1.4));holder.querySelector('[data-zoom-out]').addEventListener('click',()=>zoom(1/1.4));holder.querySelector('[data-fit]').addEventListener('click',reset);
  stage.addEventListener('wheel',e=>{const r=stage.getBoundingClientRect();zoom(e.deltaY<0?1.14:1/1.14,e.clientX-r.left,e.clientY-r.top);e.preventDefault();},{passive:false});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');stage.focus();e.preventDefault();});
  stage.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;state.x+=e.clientX-pointer.x;state.y+=e.clientY-pointer.y;pointer.x=e.clientX;pointer.y=e.clientY;render();});
  function release(){pointer=null;stage.classList.remove('dragging');}stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
  stage.addEventListener('keydown',e=>{if(['+','='].includes(e.key))zoom(1.4);else if(e.key==='-')zoom(1/1.4);else if(e.key.toLowerCase()==='r')reset();else if(e.key==='ArrowLeft')state.x-=50;else if(e.key==='ArrowRight')state.x+=50;else if(e.key==='ArrowUp')state.y-=50;else if(e.key==='ArrowDown')state.y+=50;else return;render();e.preventDefault();e.stopPropagation();});
  render();
}
for(const group of document.querySelectorAll('[data-model-switcher]')){
  const select=group.querySelector('select');select.addEventListener('change',()=>{for(const holder of group.querySelectorAll('[data-model]'))holder.hidden=holder.id!==select.value;window.dispatchEvent(new Event('meeting-slide-change'));});
}
