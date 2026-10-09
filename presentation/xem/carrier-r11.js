(() => {
  'use strict';
  const image=document.getElementById('carrier-image'),stage=document.querySelector('.carrier-stage'),status=document.getElementById('image-status');
  const prefix='assets/2026-10-09/carrier-r11/';
  const views={bottom3d:['Carrier_R11_Bottom_3D.png','R11 · underside 3D','R11 underside 3D: J1 and J19, edge-facing barrel jack, converter, USB-C JTAG and all underside components.'],top3d:['Carrier_R11_Top_3D.png','R11 · top 3D','R11 top 3D: the three XEM8305 module sockets, top bypass parts and four mounting rings.'],bottom:['Carrier_R11_Bottom.png','R11 · underside','R11 flat underside view, showing the 70 fitted underside components and both LDO mezzanine sockets.'],top:['Carrier_R11_Top.png','R11 · top','R11 flat top view, showing MC1, MC2, MC3 and the two top bypass capacitors.']};
  let baseZoom=1.25,zoom=baseZoom,x=0,y=0,drag=null;
  const paint=()=>image.style.transform=`translate(${x}px,${y}px) scale(${zoom})`;
  const reset=()=>{zoom=baseZoom;x=0;y=0;paint();};
  function select(key){const v=views[key];if(!v)return;baseZoom=key.endsWith('3d')?1.25:1;reset();image.src=prefix+v[0];image.alt=v[2];document.getElementById('view-caption').textContent=v[1];document.getElementById('full-image').href=prefix+v[0];document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===key)));status.hidden=true;}
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.view)));
  const change=d=>{zoom=Math.max(1,Math.min(4,zoom+d));if(zoom===1){x=0;y=0;}paint();};
  document.getElementById('zoom-in').addEventListener('click',()=>change(.3));document.getElementById('zoom-out').addEventListener('click',()=>change(-.3));document.getElementById('reset-view').addEventListener('click',reset);
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=[e.clientX-x,e.clientY-y];stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',e=>{if(!drag||zoom===1)return;x=e.clientX-drag[0];y=e.clientY-drag[1];paint();});
  const end=()=>{drag=null;stage.classList.remove('dragging');};['pointerup','pointercancel','lostpointercapture'].forEach(t=>stage.addEventListener(t,end));
  stage.addEventListener('keydown',e=>{if(['+','=','-','r','R'].includes(e.key)){e.preventDefault();if(e.key==='-')change(-.3);else if(e.key.toLowerCase()==='r')reset();else change(.3);}});
  image.addEventListener('error',()=>{status.textContent='Image unavailable. Try the full-image link or reload.';status.hidden=false;});image.addEventListener('load',()=>status.hidden=true);paint();
})();
