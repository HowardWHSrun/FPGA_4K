(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const image=$('carrier-image'),stage=document.querySelector('.carrier-stage'),status=$('image-status'),surface=$('routing-surface'),canvas=$('carrier-3d');
  const prefix='assets/';
  const views={};
  let mode='routing',baseZoom=1,zoom=1,x=0,y=0,svg=null,routingPromise=null,modelPromise=null,model=null,selectedNet='',gesture=null,multiPointer=false;
  const pointers=new Map();
  let nativeFrame=null;
  const nativeApi=()=>nativeFrame?.contentWindow?.nativePcbViewer;
  const target=()=>mode==='routing'?surface:image;
  const paint=()=>{target().style.transform=`translate(${x}px,${y}px) scale(${zoom})`;};
  function fitEmbed(){}
  function reset(){
    if(mode==='rotate3d'){model?.command('view','iso');return;}
    if(mode==='routing'&&nativeFrame){nativeApi()?.fit();return;}
    zoom=baseZoom;x=0;y=0;paint();
  }
  function change(factor,point){
    if(mode==='rotate3d'){model?.command('zoom',1/factor);return;}
    if(mode==='routing'&&nativeFrame){nativeApi()?.zoom(factor);return;}
    const next=Math.max(.5,Math.min(mode==='routing'?24:8,zoom*factor)),ratio=next/zoom;
    if(point){const r=stage.getBoundingClientRect(),px=point[0]-r.left-r.width/2,py=point[1]-r.top-r.height/2;x=px-(px-x)*ratio;y=py-(py-y)*ratio;}
    zoom=next;paint();
  }
  function clearNet(){selectedNet='';nativeApi()?.clearNet();$('clear-net').hidden=true;$('net-picker').value='';$('net-selection').textContent='Click a track or pad to highlight its net';}
  function highlight(net){selectedNet=net||'';nativeApi()?.highlight(selectedNet);$('net-selection').textContent=selectedNet||'Click a track or pad to highlight its net';$('clear-net').hidden=!selectedNet;}
  function updateLayers(){const layers=[...document.querySelectorAll('[data-layer-toggle]:checked')].map(i=>i.dataset.layerToggle);nativeApi()?.setLayers(layers);nativeApi()?.planes($('show-planes').checked);}
  async function loadRouting(){
    if(routingPromise)return routingPromise;
    routingPromise=new Promise((resolve,reject)=>{
      nativeFrame=document.createElement('iframe');nativeFrame.id='native-pcb-frame';nativeFrame.title='Native KiCad carrier layout and routing';nativeFrame.src='native/index.html?embed=1';surface.replaceChildren(nativeFrame);
      const timeout=setTimeout(()=>{status.textContent='Native layout is taking longer to load. Reload this view.';status.hidden=false;reject(new Error('Native routing load timed out'));},55000);
      const ready=event=>{if(event.source!==nativeFrame.contentWindow||event.data?.type!=='native-pcb-ready')return;clearTimeout(timeout);window.removeEventListener('message',ready);if(mode==='routing')status.hidden=true;resolve();};window.addEventListener('message',ready);
    }).catch(error=>{routingPromise=null;if(mode==='routing'){status.textContent='Native routing could not load. Try reloading the page.';status.hidden=false;}console.warn(error.message);});
    return routingPromise;
  }
  async function select(key){
    if(!views[key]&&!['routing','rotate3d'].includes(key))return;
    mode=key;stage.dataset.mode=key;$('views').dataset.mode=key;pointers.clear();gesture=null;stage.classList.remove('dragging');
    image.hidden=!views[key];surface.hidden=key!=='routing';canvas.hidden=key!=='rotate3d';$('routing-controls').hidden=key!=='routing';$('pose-controls').hidden=key!=='rotate3d';$('assembly-controls').hidden=key!=='rotate3d';
    document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===key)));
    status.hidden=true;
    if(key==='routing'){
      baseZoom=1;reset();$('view-caption').textContent='V16 · native KiCad layout';$('interaction-help').textContent='Layers · Parts · Nets';
      if(!nativeApi()?.getState().ready){status.textContent='Loading native KiCad layout…';status.hidden=false;}await loadRouting();requestAnimationFrame(()=>nativeApi()?.fit());
    }else if(key==='rotate3d'){
      $('view-caption').textContent='XEM + V16 carrier + LDO · attachment view';$('interaction-help').textContent='Drag to rotate · right-drag to pan · scroll/pinch to zoom';
      try{modelPromise??=import('./assembly-3d.js');model=await modelPromise;if(mode==='rotate3d')await model.open();}catch(error){if(mode==='rotate3d'){status.textContent='3D unavailable here. Reload or switch to routing.';status.hidden=false;}console.warn(error.message);}
    }else{
      const view=views[key];baseZoom=key.endsWith('3d')?1.25:1;reset();image.src=prefix+view[0];image.alt=view[1]+' CAD-rendered review';$('view-caption').textContent=view[1];$('interaction-help').textContent='Drag to pan · scroll/pinch to zoom';
    }
    stage.dispatchEvent(new CustomEvent('carrier-mode',{detail:{mode}}));fitEmbed();
  }
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.view)));
  document.querySelectorAll('[data-pose]').forEach(button=>button.addEventListener('click',()=>model?.command('view',button.dataset.pose)));
  document.querySelectorAll('[data-layer-toggle],#show-planes,#show-references').forEach(input=>input.addEventListener('change',updateLayers));$('clear-net').addEventListener('click',clearNet);$('net-picker').addEventListener('change',()=>highlight($('net-picker').value));
  $('zoom-in').addEventListener('click',()=>change(1.3));$('zoom-out').addEventListener('click',()=>change(1/1.3));$('reset-view').addEventListener('click',reset);$('show-xem').addEventListener('change',()=>model?.command('assembly'));$('show-carrier').addEventListener('change',()=>model?.command('assembly'));$('show-ldo').addEventListener('change',()=>model?.command('assembly'));$('assembly-gap').addEventListener('input',()=>{ $('gap-value').textContent=$('assembly-gap').value+' mm';model?.command('assembly');});
  stage.addEventListener('wheel',event=>{if(mode==='rotate3d')return;event.preventDefault();change(Math.exp(-event.deltaY*.0015),[event.clientX,event.clientY]);},{passive:false});
  function beginGesture(){
    const points=[...pointers.values()];
    if(points.length===1)gesture={type:'pan',origin:points[0],x,y};
    else if(points.length>=2)gesture={type:'pinch',distance:Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]),center:[(points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2]};
    else gesture=null;
  }
  stage.addEventListener('pointerdown',event=>{if(mode==='rotate3d'||event.button!==0)return;stage.focus({preventScroll:true});if(!pointers.size)multiPointer=false;pointers.set(event.pointerId,[event.clientX,event.clientY]);multiPointer||=pointers.size>1;beginGesture();stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',event=>{
    if(mode==='rotate3d'||!pointers.has(event.pointerId))return;
    pointers.set(event.pointerId,[event.clientX,event.clientY]);if(!gesture)return;
    if(gesture.type==='pan'){x=gesture.x+event.clientX-gesture.origin[0];y=gesture.y+event.clientY-gesture.origin[1];paint();}
    else{const points=[...pointers.values()],distance=Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]),center=[(points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2];if(gesture.distance>0)change(distance/gesture.distance,gesture.center);x+=center[0]-gesture.center[0];y+=center[1]-gesture.center[1];paint();gesture.distance=distance;gesture.center=center;}
  });
  function end(event){
    if(mode==='routing'&&!multiPointer&&gesture?.type==='pan'&&Math.hypot(event.clientX-gesture.origin[0],event.clientY-gesture.origin[1])<4){const hit=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-net]');if(hit&&surface.contains(hit))highlight(hit.dataset.net);}
    pointers.delete(event.pointerId);beginGesture();if(!pointers.size)stage.classList.remove('dragging');
  }
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);beginGesture();stage.classList.remove('dragging');});
  stage.addEventListener('lostpointercapture',event=>{if(pointers.delete(event.pointerId))beginGesture();});
  stage.addEventListener('keydown',event=>{
    if(mode==='rotate3d')return;
    if(['+','=','-','r','R','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='-')change(1/1.3);else if(['+','='].includes(event.key))change(1.3);else if(event.key==='Escape')clearNet();else if(event.key.toLowerCase()==='r')reset();else{x+=event.key==='ArrowLeft'?30:event.key==='ArrowRight'?-30:0;y+=event.key==='ArrowUp'?30:event.key==='ArrowDown'?-30:0;paint();}}
  });
  image.addEventListener('error',()=>{if(views[mode]){status.textContent='Image unavailable. Try another view or reload the page.';status.hidden=false;}});image.addEventListener('load',()=>{if(views[mode])status.hidden=true;});
  new ResizeObserver(fitEmbed).observe(document.querySelector('.render-toolbar'));new ResizeObserver(fitEmbed).observe($('routing-controls'));window.addEventListener('resize',fitEmbed);
  function setGap(value){$('assembly-gap').value=Math.max(0,Math.min(35,Number(value)));$('gap-value').textContent=$('assembly-gap').value+' mm';model?.command('assembly');}
  $('seat-stack').addEventListener('click',()=>setGap(0));$('separate-stack').addEventListener('click',()=>setGap(20));
  const api={select,highlight,clearNet,setGap,setLayers(layers){document.querySelectorAll('[data-layer-toggle]').forEach(input=>input.checked=layers.includes(input.dataset.layerToggle));updateLayers();},planes(value){$('show-planes').checked=Boolean(value);updateLayers();},pose(value){model?.command('view',value);},show(part,value){const input=$('show-'+part);if(input){input.checked=Boolean(value);model?.command('assembly');}},getState(){return {revision:'R16',mode,selectedNet,separationMm:Number($('assembly-gap').value),layers:nativeApi()?.getState().layers||[...document.querySelectorAll('[data-layer-toggle]:checked')].map(i=>i.dataset.layerToggle),nativePcb:nativeApi()?.getState(),assemblyReady:canvas.dataset.assemblyReady==='true'};}};
  window.carrierViewer=api;
  window.addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='carrier-viewer')return;const {command,value}=event.data;if(command==='view')select(value==='assembly'?'rotate3d':value);else if(command==='pose')api.pose(value);else if(command==='layers'&&Array.isArray(value))api.setLayers(value);else if(command==='net')loadRouting().then(()=>highlight(String(value||'')));else if(command==='planes')api.planes(value);else if(command==='gap')setGap(value);else if(command==='show'&&value)api.show(value.part,value.visible);});
  select(new URLSearchParams(location.search).get('view')==='routing'?'routing':'rotate3d').then(()=>parent.postMessage({type:'carrier-viewer-ready',revision:'R16',state:api.getState()},location.origin));

})();
