/* Static presentation and exact-STL viewer. No third-party scripts or network services. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const slides = window.PRESENTATION_SLIDES || [];
  const source = window.PRESENTATION_MODEL_SOURCE;
  const canvas = $('scene'), wrap = $('scene-container'), ctx = canvas.getContext('2d');
  const state = {slide:0,azimuth:-1.10,elevation:.57,zoom:1,labels:true,center:[36.5,0,7.5]};
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animation=0, pickBuffer=null, pickWidth=0, pickHeight=0;
  const colors = {A:[80,133,178],C:[74,151,137],D:[119,132,184],E:[194,154,95]};
  const anchors = {A:[-10,-5,14.1],C:[32,-12,6.95],D:[25,1,14.25],E:[75,0,8]};
  const markerEls = Object.fromEntries(Object.keys(anchors).map(r=>[r,document.querySelector(`[data-region="${r}"]`)]));
  const dot = (a,b) => a.reduce((sum,x,i)=>sum+x*b[i],0);
  const sub = (a,b) => a.map((x,i)=>x-b[i]);
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const normalize = a => {const d=Math.hypot(...a)||1;return a.map(x=>x/d);};
  let mesh=null, rawBytes=null, width=0, height=0, queued=false, sourceVerified=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;draw();});}
  function current(){return slides[state.slide];}
  function setSlide(value,writeHash=true){
    let i=typeof value==='number'?value:slides.findIndex(s=>s.id===value);
    if(!slides.length)return;
    state.slide=Math.max(0,Math.min(slides.length-1,i));
    const slide=current();
    $('section-label').textContent=slide.section;
    $('slide-title').textContent=slide.title;
    $('slide-subtitle').textContent=state.slide===0?slide.subtitle:slide.title;
    $('panel-kicker').textContent=state.slide===0?'Architecture & responsibility':slide.section;
    $('slide-description').textContent=slide.description;
    $('note-label').textContent=slide.noteLabel;$('slide-note').textContent=slide.note;
    $('view-label').textContent=state.slide===0?'System architecture':slide.id==='kr260'?'Downstream stage · schematic view':'Compact headboard · '+slide.title;
    $('owners').replaceChildren();
    slide.owners.forEach(([name,role])=>{const e=document.createElement('div');e.className='owner';const n=document.createElement('strong'),r=document.createElement('span');n.textContent=name;r.textContent=role;e.append(n,r);$('owners').append(e);});
    $('facts').replaceChildren();slide.facts.forEach(([value,label])=>{const e=document.createElement('div');e.className='fact';const n=document.createElement('strong'),r=document.createElement('span');n.textContent=value;r.textContent=label;e.append(n,r);$('facts').append(e);});
    $('overview-team').hidden=state.slide!==0;document.querySelector('.slide-note').hidden=state.slide===0;
    $('current-page').textContent=String(state.slide+1).padStart(2,'0');$('total-pages').textContent=String(slides.length).padStart(2,'0');
    $('previous').disabled=state.slide===0;$('next').disabled=state.slide===slides.length-1;
    document.querySelectorAll('[data-slide]').forEach(b=>{const on=b.dataset.slide===slide.id;b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    if(writeHash&&location.hash!=='#'+slide.id){try{history.pushState(null,'','#'+slide.id);}catch{location.hash=slide.id;}}
    document.title=slide.title+' | 4K Design Review';
    if(!reducedMotion&&$('panel-content').animate)$('panel-content').animate([{opacity:.25,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:270,easing:'ease-out'});
    focusCamera();queue();
  }
  function targetCamera(name='iso'){
    const presets={iso:[-1.10,.57],top:[-Math.PI/2,Math.PI/2-.001],side:[-Math.PI/2,.035]};
    const [azimuth,elevation]=presets[name]||presets.iso;
    const region=current()?.regions;
    let indices=mesh?mesh.faces.flatMap((f,i)=>region.includes(mesh.regions[i])?f:[]):[];
    const vertices=mesh?indices.map(i=>mesh.vertices[i]):[];
    const center=vertices.length?[0,1,2].map(k=>(Math.min(...vertices.map(v=>v[k]))+Math.max(...vertices.map(v=>v[k])))/2):[36.5,0,7.5];
    let zoom=1;
    if(mesh&&state.slide!==0){
      const ca=Math.cos(azimuth),sa=Math.sin(azimuth),ce=Math.cos(elevation),se=Math.sin(elevation);
      const right=[-sa,ca,0],up=[-ca*se,-sa*se,ce];
      const spans=vv=>{const x=vv.map(v=>dot(v,right)),y=vv.map(v=>dot(v,up));return [Math.max(...x)-Math.min(...x),Math.max(...y)-Math.min(...y)];};
      const all=spans(mesh.vertices),part=spans(vertices);
      const fullFit=Math.min(width*.84/(all[0]||1),height*.64/(all[1]||1));
      zoom=Math.min(3.4,Math.min(width*.60/(part[0]||1),height*.49/(part[1]||1))/fullFit);
    }
    return {azimuth,elevation,zoom,center};
  }
  function animateCamera(target){
    cancelAnimationFrame(animation);
    if(reducedMotion||!mesh){Object.assign(state,target);queue();return;}
    const from={azimuth:state.azimuth,elevation:state.elevation,zoom:state.zoom,center:state.center.slice()},start=performance.now();
    const step=now=>{const t=Math.min(1,(now-start)/580),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;for(const k of ['azimuth','elevation','zoom'])state[k]=from[k]+(target[k]-from[k])*e;state.center=from.center.map((v,i)=>v+(target.center[i]-v)*e);queue();if(t<1)animation=requestAnimationFrame(step);};
    animation=requestAnimationFrame(step);
  }
  function focusCamera(){setCamera('iso');}
  function setCamera(name){
    animateCamera(targetCamera(name));
    $('camera-name').textContent={iso:'ISOMETRIC',top:'TOP VIEW',side:'SIDE VIEW'}[name]||'ISOMETRIC';
    document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.camera===name)));
  }
  function resize(){const box=wrap.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);queue();}
  function decodeSTL(bytes){
    const v=new DataView(bytes),count=v.getUint32(80,true);
    if(bytes.byteLength!==84+count*50||count!==source.triangles)throw new Error('Unexpected STL length or facet count.');
    const vertices=[],faces=[],normals=[],regions=[],indices=new Map();
    for(let i=0;i<count;i++){
      const face=[];
      for(let j=0;j<3;j++){
        const p=[0,1,2].map(k=>v.getFloat32(84+50*i+12+12*j+4*k,true));
        if(p.some(x=>!Number.isFinite(x)))throw new Error('Non-finite model coordinate.');
        const key=p.join(',');if(!indices.has(key)){indices.set(key,vertices.length);vertices.push(p);}face.push(indices.get(key));
      }
      faces.push(face);
      const points=face.map(j=>vertices[j]);
      normals.push(normalize(cross(sub(points[1],points[0]),sub(points[2],points[0]))));
      const xs=points.map(p=>p[0]),z=points.reduce((s,p)=>s+p[2],0)/3;
      // Visualization regions from the assembly guide, not encoded electrical semantics.
      const x=points.reduce((s,p)=>s+p[0],0)/3;
      regions.push(Math.min(...xs)>=7.99999?(z>=11.44999?'D':'C'):(z>=6.4499&&z<=7.4501&&x>=-3.2501?'C':'A'));
    }
    const sourceVertexCount=vertices.length;
    // Separate schematic downstream stage. These boxes are not manufacturer CAD.
    function box(x,y,z,w,d,h,tone=1){
      const base=vertices.length;
      vertices.push([x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]);
      [[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]].forEach(f=>{const ff=f.map(i=>base+i);faces.push(ff);const pp=ff.map(i=>vertices[i]);normals.push(normalize(cross(sub(pp[1],pp[0]),sub(pp[2],pp[0]))));regions.push('E');});
    }
    box(61,-11,3,27,22,1.2);
    box(67,-5,4.2,13,10,3);
    box(63,7,4.2,6,3,2.5);box(72,7,4.2,6,3,2.5);box(81,4,4.2,5,6,2.5);
    for(let j=0;j<5;j++)box(67+j*2.6,-5,7.2,.7,10,1);
    const edges=new Map();
    faces.forEach((f,i)=>{for(let j=0;j<3;j++){const a=f[j],b=f[(j+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;if(!edges.has(key))edges.set(key,{a,b,faces:[]});edges.get(key).faces.push(i);}});
    const sharp=[...edges.values()].filter(e=>e.faces.length!==2||Math.abs(dot(normals[e.faces[0]],normals[e.faces[1]]))<.96||regions[e.faces[0]]!==regions[e.faces[1]]);
    const outlines=faces.map(()=>[]);sharp.forEach(e=>e.faces.forEach(i=>outlines[i].push(e)));
    const min=[0,1,2].map(k=>Math.min(...vertices.map(p=>p[k]))),max=[0,1,2].map(k=>Math.max(...vertices.map(p=>p[k])));
    return {vertices,faces,normals,regions,outlines,min,max,sourceVertexCount,sourceTriangles:count};
  }
  // Orthographic software depth buffer keeps hidden board/components occluded.
  // Rasterization is used rather than sorting whole triangles, which is incorrect
  // when the supplied mesh has long faces spanning overlapping assembly regions.
  const rasterCanvas=document.createElement('canvas'),rasterCtx=rasterCanvas.getContext('2d');
  function rasterize(ordered,points,light,active){
    const factor=1.25,w=Math.ceil(width*factor),h=Math.ceil(height*factor);
    if(rasterCanvas.width!==w||rasterCanvas.height!==h){rasterCanvas.width=w;rasterCanvas.height=h;}
    const image=rasterCtx.createImageData(w,h),pixels=image.data,depth=new Float32Array(w*h);depth.fill(-Infinity);pickBuffer=new Uint8Array(w*h);pickWidth=w;pickHeight=h;
    const pts=points.map(p=>[p[0]*factor,p[1]*factor,p[2]]);
    ordered.forEach(({f,i})=>{
      const a=pts[f[0]],b=pts[f[1]],c=pts[f[2]],den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if(Math.abs(den)<1e-8)return;
      const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const du=(b[1]-c[1])/den,dv=(c[1]-a[1])/den;
      const selected=active(mesh.regions[i]),base=selected?colors[mesh.regions[i]]:[204,217,207];
      const brightness=.72+.28*Math.max(0,dot(mesh.normals[i],light));
      const rgb=base.map(v=>Math.round(v*brightness));
      for(let y=y0;y<=y1;y++){
        let u=((b[1]-c[1])*(x0+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den;
        let v=((c[1]-a[1])*(x0+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den;
        for(let x=x0;x<=x1;x++,u+=du,v+=dv){
          if(u<-.00001||v<-.00001||u+v>1.00001)continue;
          const z=u*a[2]+v*b[2]+(1-u-v)*c[2],j=y*w+x;
          if(z<depth[j])continue;depth[j]=z;pickBuffer[j]=mesh.regions[i].charCodeAt(0);
          const o=j*4;pixels[o]=rgb[0];pixels[o+1]=rgb[1];pixels[o+2]=rgb[2];pixels[o+3]=255;
        }
      }
    });
    const seen=new Set();
    ordered.forEach(({i})=>mesh.outlines[i].forEach(e=>{
      const key=e.a<e.b?`${e.a},${e.b}`:`${e.b},${e.a}`;if(seen.has(key))return;seen.add(key);
      const a=pts[e.a],b=pts[e.b],steps=Math.max(1,Math.ceil(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))));
      const selected=e.faces.some(j=>active(mesh.regions[j])),rgb=selected?[52,73,95]:[161,176,190];
      for(let n=0;n<=steps;n++){
        const t=n/steps,x=Math.floor(a[0]+(b[0]-a[0])*t),y=Math.floor(a[1]+(b[1]-a[1])*t),z=a[2]+(b[2]-a[2])*t;
        if(x<0||x>=w||y<0||y>=h)continue;const j=y*w+x;
        if(z<depth[j]-.11)continue;
        const o=j*4;pixels[o]=rgb[0];pixels[o+1]=rgb[1];pixels[o+2]=rgb[2];pixels[o+3]=255;
      }
    }));
    rasterCtx.putImageData(image,0,0);ctx.drawImage(rasterCanvas,0,0,width,height);
  }
  function draw(){
    if(!ctx||!width||!height)return;
    ctx.clearRect(0,0,width,height);if(!mesh)return;
    const ca=Math.cos(state.azimuth),sa=Math.sin(state.azimuth),ce=Math.cos(state.elevation),se=Math.sin(state.elevation);
    const right=[-sa,ca,0],up=[-ca*se,-sa*se,ce],eye=[ca*ce,sa*ce,se];
    const projectRaw=p=>{const d=sub(p,state.center);return [dot(d,right),-dot(d,up),dot(d,eye)];};
    const q=mesh.vertices.map(projectRaw),xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);
    const scale=Math.min(width*.84/(Math.max(...xs)-Math.min(...xs)||1),height*.64/(Math.max(...ys)-Math.min(...ys)||1))*state.zoom;
    const ox=width/2,oy=height*.50;
    const project=p=>{const v=projectRaw(p);return [ox+v[0]*scale,oy+v[1]*scale,v[2]];};
    const points=q.map(p=>[ox+p[0]*scale,oy+p[1]*scale,p[2]]);
    ctx.save();ctx.translate(width*.49,height*.68);ctx.scale(1,.18);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,width*.35);shadow.addColorStop(0,'rgba(58,82,110,.10)');shadow.addColorStop(1,'rgba(58,82,110,0)');
    ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,width*.35,0,2*Math.PI);ctx.fill();ctx.restore();
    const active=region=>current().regions.includes(region),light=normalize([-.25,-.5,.85]);
    const visible=mesh.faces.map((f,i)=>({f,i})).filter(t=>dot(mesh.normals[t.i],eye)>-.001);
    if(state.slide!==0){
      const seen=new Set();ctx.strokeStyle='rgba(108,136,162,.10)';ctx.lineWidth=.65;
      visible.filter(t=>!active(mesh.regions[t.i])).forEach(({i})=>mesh.outlines[i].forEach(e=>{const k=e.a<e.b?e.a+','+e.b:e.b+','+e.a;if(seen.has(k))return;seen.add(k);const a=points[e.a],b=points[e.b];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}));
    }
    rasterize(visible.filter(t=>active(mesh.regions[t.i])),points,light,active);
    if(state.slide===0){
      const a=project([40,-4,11.8]),b=project([61,-4,5]),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      ctx.strokeStyle='#7c90a799';ctx.lineWidth=1.25;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.bezierCurveTo(mid[0],a[1]-22,mid[0],b[1]-22,b[0],b[1]);ctx.stroke();ctx.setLineDash([]);
      ctx.font='10px '+getComputedStyle(document.body).fontFamily;ctx.fillStyle='#74879a';ctx.textAlign='center';ctx.fillText('data / control',mid[0],mid[1]-23);ctx.textAlign='left';
    }
    const labelPositions=[];
    Object.entries(anchors).forEach(([region,anchor])=>{
      const at=project(anchor),el=markerEls[region],show=state.labels&&(state.slide===0||active(region));el.hidden=!show;if(!show)return;
      const offsets={A:[-15,-72],C:[-4,58],D:[-2,-70],E:[15,72]};
      const [dx,dy]=offsets[region],box=el.getBoundingClientRect(),half=box.width/2+10;
      let x=Math.max(half,Math.min(width-half,at[0]+dx)),y=Math.max(30,Math.min(height-32,at[1]+dy));
      for(let j=0;j<4;j++){const clash=labelPositions.some(p=>Math.abs(p.x-x)<(p.w+box.width)/2+8&&Math.abs(p.y-y)<53);if(!clash)break;y=Math.max(30,Math.min(height-32,y+(dy<0?-56:56)));x=Math.max(half,Math.min(width-half,x+(j>1?35:0)));}
      labelPositions.push({x,y,w:box.width});el.style.left=x+'px';el.style.top=y+'px';
      ctx.strokeStyle='rgba(85,109,135,.4)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(at[0],at[1]);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle=colors[region]?'rgb('+colors[region].join(',')+')':'#617086';ctx.beginPath();ctx.arc(at[0],at[1],2.3,0,Math.PI*2);ctx.fill();
    });
    canvas.dataset.rendered='true';canvas.dataset.triangles=String(mesh.sourceTriangles);canvas.dataset.model='compact_B_v1';canvas.dataset.controller='KR260_schematic';
  }
  async function loadModel(){
    try{
      if(!ctx)throw new Error('Canvas rendering is unavailable.');
      if(!source||source.encoding!=='gzip+base64')throw new Error('Model source did not load.');
      if(!window.DecompressionStream)throw new Error('Please open this presentation in a current Chrome, Edge, Firefox, or Safari browser.');
      const compressed=Uint8Array.from(atob(source.data),c=>c.charCodeAt(0));
      rawBytes=await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      if(rawBytes.byteLength!==source.bytes)throw new Error('Source byte count mismatch.');
      if(window.crypto?.subtle){const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',rawBytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==source.sha256)throw new Error('Source checksum mismatch.');sourceVerified=true;}
      mesh=decodeSTL(rawBytes);$('model-status').hidden=true;$('download-stl').disabled=false;$('markers').hidden=false;Object.assign(state,targetCamera('iso'));queue();
    }catch(error){$('model-status').textContent='The compact model could not load. '+error.message;$('model-status').classList.add('error');$('markers').hidden=true;console.error(error);}
  }
  document.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>setSlide(b.dataset.slide)));
  $('previous').onclick=()=>setSlide(state.slide-1);$('next').onclick=()=>setSlide(state.slide+1);$('back-overview').onclick=()=>setSlide(0);
  document.querySelector('.brand').onclick=e=>{e.preventDefault();setSlide(0);};
  document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>setCamera(b.dataset.camera));$('reset').onclick=()=>setCamera('iso');
  $('toggle-labels').onclick=()=>{state.labels=!state.labels;$('toggle-labels').textContent=state.labels?'Labels on':'Labels off';$('toggle-labels').setAttribute('aria-pressed',String(state.labels));queue();};
  const dialog=$('notes-dialog');
  function showNotes(){const slide=current();$('notes-title').textContent=slide.title;$('technical-notes').replaceChildren();slide.details.forEach(text=>{const p=document.createElement('p');p.textContent=text;$('technical-notes').append(p);});$('source-links').replaceChildren();slide.sources.forEach(([label,url])=>{const a=document.createElement('a');a.textContent=label+' ↗';a.href=url;a.target='_blank';a.rel='noopener';$('source-links').append(a);});dialog.showModal();}
  $('model-notes').onclick=showNotes;$('detail-button').onclick=showNotes;$('close-notes').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  $('download-stl').onclick=()=>{if(!rawBytes)return;const url=URL.createObjectURL(new Blob([rawBytes],{type:'model/stl'})),a=document.createElement('a');a.href=url;a.download=source.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();}catch(error){console.warn('Fullscreen is unavailable:',error.message);}}
  $('fullscreen').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').firstChild.textContent=document.fullscreenElement?'Exit fullscreen ':'Present ';});
  document.addEventListener('keydown',e=>{
    if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(['ArrowRight','PageDown'].includes(e.key)||(e.key===' '&&!/BUTTON|A/.test(e.target.tagName))){e.preventDefault();setSlide(state.slide+1);}
    else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();setSlide(state.slide-1);}
    else if(e.key==='Home'){e.preventDefault();setSlide(0);}
    else if(e.key==='End'){e.preventDefault();setSlide(slides.length-1);}
    else if(/^[1-9]$/.test(e.key)&&Number(e.key)<=slides.length)setSlide(Number(e.key)-1);
    else if(e.key.toLowerCase()==='r')setCamera('iso');else if(e.key.toLowerCase()==='f')fullscreen();
  });
  const pointers=new Map();let lastDistance=0,clickOrigin=null,moved=false;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;cancelAnimationFrame(animation);pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);lastDistance=0;if(pointers.size===1){clickOrigin=[e.clientX,e.clientY];moved=false;}else moved=true;});
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);
    if(clickOrigin&&Math.hypot(e.clientX-clickOrigin[0],e.clientY-clickOrigin[1])>4)moved=true;
    if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(lastDistance>0)state.zoom=Math.max(.65,Math.min(5,state.zoom*d/lastDistance));lastDistance=d;}
    else if(moved){state.azimuth+=(e.clientX-old[0])*.007;state.elevation=Math.max(-1.2,Math.min(1.56,state.elevation+(e.clientY-old[1])*.007));$('camera-name').textContent='CUSTOM VIEW';document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed','false'));}queue();
  });
  canvas.addEventListener('pointerup',e=>{if(pointers.size===1&&!moved&&pickBuffer){const r=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/width*pickWidth),y=Math.floor((e.clientY-r.top)/height*pickHeight);if(x>=0&&x<pickWidth&&y>=0&&y<pickHeight){const region=String.fromCharCode(pickBuffer[y*pickWidth+x]);const id={A:'carriers',C:'routing',D:'fpga',E:'kr260'}[region];if(id)setSlide(id);}}pointers.delete(e.pointerId);lastDistance=0;});
  ['pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);lastDistance=0;}));
  canvas.addEventListener('wheel',e=>{e.preventDefault();cancelAnimationFrame(animation);state.zoom=Math.max(.65,Math.min(5,state.zoom*Math.exp(-e.deltaY*.001)));queue();},{passive:false});
  const readHash=()=>{const i=slides.findIndex(s=>'#'+s.id===location.hash);setSlide(i<0?0:i,false);};
  window.addEventListener('hashchange',readHash);window.addEventListener('popstate',readHash);
  $('markers').hidden=true;readHash();new ResizeObserver(resize).observe(wrap);resize();loadModel();
  window.PRESENTATION={getState:()=>({...state,slideId:current()?.id,loaded:!!mesh,sourceVerified,sourceSHA256:source?.sha256,triangles:mesh?.sourceTriangles,sourceVertexCount:mesh?.sourceVertexCount,controller:'KR260 schematic; not to scale',regions:mesh?[...new Set(mesh.regions)]:[],sourceGeometryUnchanged:!!mesh&&mesh.faces.slice(0,source.triangles).every((f,i)=>f.every((j,k)=>mesh.vertices[j].every((v,n)=>v===new DataView(rawBytes).getFloat32(84+50*i+12+12*k+4*n,true)))),bounds:mesh?[mesh.min,mesh.max]:null}),setSlide,setCamera};
})();
