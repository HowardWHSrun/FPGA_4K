(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const image=$('carrier-image'),stage=document.querySelector('.carrier-stage'),status=$('image-status'),surface=$('routing-surface'),canvas=$('carrier-3d');
  const prefix='assets/2026-10-09/carrier-r12/';
  const views={bottom3d:['Carrier_R12_Bottom_3D.png','R12 · underside image'],top3d:['Carrier_R12_Top_3D.png','R12 · top image'],bottom:['Carrier_R12_Bottom.png','R12 · flat underside image'],top:['Carrier_R12_Top.png','R12 · flat top image']};
  let mode='routing',baseZoom=1,zoom=1,x=0,y=0,svg=null,routingPromise=null,modelPromise=null,model=null,selectedNet='',gesture=null,multiPointer=false;
  const pointers=new Map();
  const target=()=>mode==='routing'?surface:image;
  const paint=()=>{target().style.transform=`translate(${x}px,${y}px) scale(${zoom})`;};
  function fitEmbed(){
    if(!document.documentElement.classList.contains('embedded'))return;
    const elements=[document.querySelector('.render-toolbar'),$('routing-controls'),$('pose-controls'),document.querySelector('#views > .caption')];
    const chrome=elements.reduce((sum,el)=>sum+(el.hidden?0:el.getBoundingClientRect().height),0)+24;
    document.documentElement.style.setProperty('--viewer-chrome',`${chrome}px`);
  }
  function reset(){
    if(mode==='rotate3d'){model?.command('view','iso');return;}
    zoom=baseZoom;x=0;y=0;paint();
  }
  function change(factor,point){
    if(mode==='rotate3d'){model?.command('zoom',1/factor);return;}
    const next=Math.max(.5,Math.min(mode==='routing'?24:8,zoom*factor)),ratio=next/zoom;
    if(point){const r=stage.getBoundingClientRect(),px=point[0]-r.left-r.width/2,py=point[1]-r.top-r.height/2;x=px-(px-x)*ratio;y=py-(py-y)*ratio;}
    zoom=next;paint();
  }
  function clearNet(){selectedNet='';if(svg)svg.querySelectorAll('[data-net]').forEach(el=>el.classList.remove('net-muted','net-selected'));$('clear-net').hidden=true;$('net-selection').textContent='Click a track or pad to highlight its net';}
  function highlight(net){
    if(!net){clearNet();return;}selectedNet=net;
    svg.querySelectorAll('[data-net]').forEach(el=>{const same=el.dataset.net===net;el.classList.toggle('net-muted',!same);el.classList.toggle('net-selected',same);});
    $('net-selection').textContent=net;$('clear-net').hidden=false;
  }
  function updateLayers(){
    if(!svg)return;
    document.querySelectorAll('[data-layer-toggle]').forEach(input=>svg.querySelectorAll('[data-layer]').forEach(group=>{if(group.dataset.layer===input.dataset.layerToggle)group.style.display=input.checked?'inline':'none';}));
    svg.querySelectorAll('[data-kind="zone"]').forEach(el=>el.style.display=$('show-planes').checked?'inline':'none');
    svg.querySelectorAll('[data-kind="reference"], [data-kind="references"]').forEach(el=>el.style.display=$('show-references').checked?'inline':'none');
    if(selectedNet)highlight(selectedNet);
    fitEmbed();
  }
  async function loadRouting(){
    if(routingPromise)return routingPromise;
    routingPromise=(async()=>{
      const response=await fetch(prefix+'Carrier_R12_Routing.svg');if(!response.ok)throw new Error('Routing data unavailable');
      const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
      if(parsed.querySelector('parsererror'))throw new Error('Invalid routing data');
      const root=parsed.documentElement;
      if(root.localName!=='svg'||root.querySelector('script,foreignObject,image,iframe'))throw new Error('Unexpected routing content');
      root.querySelectorAll('*').forEach(el=>Array.from(el.attributes).forEach(attr=>{if(/^on/i.test(attr.name)||/href$/i.test(attr.name))el.removeAttribute(attr.name);}));
      svg=document.importNode(root,true);svg.setAttribute('role','img');svg.setAttribute('aria-label','R12 six-layer native routing, top-view coordinates');surface.replaceChildren(svg);updateLayers();
      if(mode==='routing')status.hidden=true;
    })().catch(error=>{routingPromise=null;if(mode==='routing'){status.textContent='Routing could not load. Try reloading or open the SVG link.';status.hidden=false;}console.warn(error.message);});
    return routingPromise;
  }
  async function select(key){
    if(!views[key]&&!['routing','rotate3d'].includes(key))return;
    mode=key;stage.dataset.mode=key;pointers.clear();gesture=null;stage.classList.remove('dragging');
    image.hidden=!views[key];surface.hidden=key!=='routing';canvas.hidden=key!=='rotate3d';$('routing-controls').hidden=key!=='routing';$('pose-controls').hidden=key!=='rotate3d';
    document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===key)));
    status.hidden=true;const full=$('full-image');
    if(key==='routing'){
      baseZoom=1;reset();$('view-caption').textContent='R12 · routing · top-view coordinates';full.href=prefix+'Carrier_R12_Routing.svg';full.textContent='Open routing SVG ↗';$('interaction-help').textContent='Drag to pan · scroll/pinch to zoom · click a net';
      if(!svg){status.textContent='Loading native routing…';status.hidden=false;}await loadRouting();
    }else if(key==='rotate3d'){
      $('view-caption').textContent='R12 · rotatable 3D · 75 component bodies';full.href=prefix+'Carrier_R12_Interactive.glb';full.textContent='Download 3D model ↗';$('interaction-help').textContent='Drag to rotate · right-drag to pan · scroll/pinch to zoom';
      try{modelPromise??=import('./carrier-r12-3d.js?v=20261009-clearance1');model=await modelPromise;if(mode==='rotate3d')await model.open();}catch(error){if(mode==='rotate3d'){status.textContent='3D unavailable here. Use the image or routing tabs.';status.hidden=false;}console.warn(error.message);}
    }else{
      const view=views[key];baseZoom=key.endsWith('3d')?1.25:1;reset();image.src=prefix+view[0];image.alt=view[1]+' CAD-rendered review';$('view-caption').textContent=view[1];full.href=prefix+view[0];full.textContent='Open full image ↗';$('interaction-help').textContent='Drag to pan · scroll/pinch to zoom';
    }
    stage.dispatchEvent(new CustomEvent('carrier-mode',{detail:{mode}}));fitEmbed();
  }
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.view)));
  document.querySelectorAll('[data-pose]').forEach(button=>button.addEventListener('click',()=>model?.command('view',button.dataset.pose)));
  document.querySelectorAll('[data-layer-toggle],#show-planes,#show-references').forEach(input=>input.addEventListener('change',updateLayers));$('clear-net').addEventListener('click',clearNet);
  $('zoom-in').addEventListener('click',()=>change(1.3));$('zoom-out').addEventListener('click',()=>change(1/1.3));$('reset-view').addEventListener('click',reset);
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
  image.addEventListener('error',()=>{if(views[mode]){status.textContent='Image unavailable. Try the full-image link.';status.hidden=false;}});image.addEventListener('load',()=>{if(views[mode])status.hidden=true;});
  new ResizeObserver(fitEmbed).observe(document.querySelector('.render-toolbar'));new ResizeObserver(fitEmbed).observe($('routing-controls'));window.addEventListener('resize',fitEmbed);
  select(new URLSearchParams(location.search).get('view')==='3d'?'rotate3d':'routing');
})();
