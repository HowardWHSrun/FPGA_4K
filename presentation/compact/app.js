/* Static presentation and exact-STL viewer. No third-party scripts or network services. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const slides = window.PRESENTATION_SLIDES || [];
  const source = window.PRESENTATION_MODEL_SOURCE;
  const canvas = $('scene'), wrap = $('scene-container'), ctx = canvas.getContext('2d');
  const state = {slide:0,azimuth:-1.10,elevation:.57,zoom:1,labels:true};
  const colors = {A:[44,137,139],B:[211,162,79],C:[82,154,126],D:[86,121,166]};
  const anchors = {A:[-9,1,14.1],B:[5.5,-8,7.45],C:[32,-12,6.95],D:[25,0,14.25]};
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
    $('section-label').textContent=String(state.slide+1).padStart(2,'0')+' / '+slide.section;
    $('slide-title').replaceChildren();
    slide.title.forEach((line,k)=>{if(k)$('slide-title').append(document.createElement('br'));$('slide-title').append(document.createTextNode(line));});
    $('slide-subtitle').textContent=slide.subtitle;
    $('slide-description').textContent=slide.description;
    $('note-label').textContent=slide.noteLabel;
    $('slide-note').textContent=slide.note;
    $('current-page').textContent=String(state.slide+1).padStart(2,'0');
    $('total-pages').textContent=String(slides.length).padStart(2,'0');
    $('previous').disabled=state.slide===0;$('next').disabled=state.slide===slides.length-1;
    document.querySelectorAll('.region-nav [data-slide]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.slide===slide.id)));
    if(writeHash&&location.hash!=='#'+slide.id){try{history.pushState(null,'','#'+slide.id);}catch{location.hash=slide.id;}}
    document.title=(state.slide===0?'4K Recording System':slide.title.join(' '))+' | PCB Design Review';
    queue();
  }
  function setCamera(name){
    const cameras={iso:[-1.10,.57],top:[-Math.PI/2,Math.PI/2-.001],side:[-Math.PI/2,.025]};
    [state.azimuth,state.elevation]=cameras[name]||cameras.iso;state.zoom=1;
    $('camera-name').textContent={iso:'ISOMETRIC',top:'TOP VIEW',side:'SIDE VIEW'}[name]||'ISOMETRIC';
    document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.camera===name)));
    queue();
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
      regions.push(Math.max(...xs)<=3.00001?'A':Math.min(...xs)<7.99999?'B':z>=11.44999?'D':'C');
    }
    const edges=new Map();
    faces.forEach((f,i)=>{for(let j=0;j<3;j++){const a=f[j],b=f[(j+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;if(!edges.has(key))edges.set(key,{a,b,faces:[]});edges.get(key).faces.push(i);}});
    const sharp=[...edges.values()].filter(e=>e.faces.length!==2||Math.abs(dot(normals[e.faces[0]],normals[e.faces[1]]))<.96||regions[e.faces[0]]!==regions[e.faces[1]]);
    const outlines=faces.map(()=>[]);sharp.forEach(e=>e.faces.forEach(i=>outlines[i].push(e)));
    const min=[0,1,2].map(k=>Math.min(...vertices.map(p=>p[k]))),max=[0,1,2].map(k=>Math.max(...vertices.map(p=>p[k])));
    return {vertices,faces,normals,regions,outlines,min,max};
  }
  // Orthographic software depth buffer keeps hidden board/components occluded.
  // Rasterization is used rather than sorting whole triangles, which is incorrect
  // when the supplied mesh has long faces spanning overlapping assembly regions.
  const rasterCanvas=document.createElement('canvas'),rasterCtx=rasterCanvas.getContext('2d');
  function rasterize(ordered,points,light,active){
    const factor=1.5,w=Math.ceil(width*factor),h=Math.ceil(height*factor);
    if(rasterCanvas.width!==w||rasterCanvas.height!==h){rasterCanvas.width=w;rasterCanvas.height=h;}
    const image=rasterCtx.createImageData(w,h),pixels=image.data,depth=new Float32Array(w*h);depth.fill(-Infinity);
    const pts=points.map(p=>[p[0]*factor,p[1]*factor,p[2]]);
    ordered.forEach(({f,i})=>{
      const a=pts[f[0]],b=pts[f[1]],c=pts[f[2]],den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if(Math.abs(den)<1e-8)return;
      const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const du=(b[1]-c[1])/den,dv=(c[1]-a[1])/den;
      const selected=active(mesh.regions[i]),base=selected?colors[mesh.regions[i]]:[204,217,207];
      const brightness=.67+.33*Math.max(0,dot(mesh.normals[i],light));
      const rgb=base.map(v=>Math.round(v*brightness));
      for(let y=y0;y<=y1;y++){
        let u=((b[1]-c[1])*(x0+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den;
        let v=((c[1]-a[1])*(x0+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den;
        for(let x=x0;x<=x1;x++,u+=du,v+=dv){
          if(u<-.00001||v<-.00001||u+v>1.00001)continue;
          const z=u*a[2]+v*b[2]+(1-u-v)*c[2],j=y*w+x;
          if(z<depth[j])continue;depth[j]=z;
          const o=j*4;pixels[o]=rgb[0];pixels[o+1]=rgb[1];pixels[o+2]=rgb[2];pixels[o+3]=255;
        }
      }
    });
    const seen=new Set();
    ordered.forEach(({i})=>mesh.outlines[i].forEach(e=>{
      const key=e.a<e.b?`${e.a},${e.b}`:`${e.b},${e.a}`;if(seen.has(key))return;seen.add(key);
      const a=pts[e.a],b=pts[e.b],steps=Math.max(1,Math.ceil(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))));
      const selected=e.faces.some(j=>active(mesh.regions[j])),rgb=selected?[36,84,83]:[144,167,153];
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
    ctx.clearRect(0,0,width,height);
    // Viewer background only: not a dimensional grid.
    ctx.strokeStyle='rgba(56,105,82,.055)';ctx.lineWidth=.7;
    for(let x=20;x<width;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
    for(let y=16;y<height;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    if(!mesh)return;
    const ca=Math.cos(state.azimuth),sa=Math.sin(state.azimuth),ce=Math.cos(state.elevation),se=Math.sin(state.elevation);
    const right=[-sa,ca,0],up=[-ca*se,-sa*se,ce],eye=[ca*ce,sa*ce,se];
    const center=mesh.min.map((x,k)=>(x+mesh.max[k])/2);
    const projectRaw=p=>{const d=sub(p,center);return [dot(d,right),-dot(d,up),dot(d,eye)];};
    const q=mesh.vertices.map(projectRaw),xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const scale=Math.min(width*.84/(maxX-minX||1),height*.73/(maxY-minY||1))*state.zoom;
    const ox=width/2-(maxX+minX)/2*scale,oy=height*.49-(maxY+minY)/2*scale;
    const project=p=>{const v=projectRaw(p);return [ox+v[0]*scale,oy+v[1]*scale,v[2]];};
    const points=q.map(p=>[ox+p[0]*scale,oy+p[1]*scale,p[2]]);
    ctx.save();ctx.translate(width*.51,height*.70);ctx.scale(1,.23);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,width*.36);shadow.addColorStop(0,'rgba(42,79,58,.13)');shadow.addColorStop(1,'rgba(42,79,58,0)');
    ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,width*.36,0,2*Math.PI);ctx.fill();ctx.restore();
    const light=normalize([-.25,-.5,.85]),active=region=>current().regions.includes(region);
    const ordered=mesh.faces.map((f,i)=>({f,i,depth:f.reduce((s,j)=>s+points[j][2],0)/3})).filter(t=>dot(mesh.normals[t.i],eye)>-.001).sort((a,b)=>a.depth-b.depth);
    rasterize(ordered,points,light,active);
    Object.entries(anchors).forEach(([region,anchor])=>{
      const at=project(anchor),el=markerEls[region];
      const x=Math.max(20,Math.min(width-20,at[0])),y=Math.max(20,Math.min(height-20,at[1]+(['A','D'].includes(region)?-24:25)));
      el.style.left=x+'px';el.style.top=y+'px';el.style.opacity=active(region)?'1':'.35';el.hidden=!state.labels;
      if(state.labels){ctx.strokeStyle=active(region)?'rgba(35,76,73,.45)':'rgba(35,76,73,.18)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(at[0],at[1]);ctx.lineTo(x,y);ctx.stroke();}
    });
    canvas.dataset.rendered='true';canvas.dataset.triangles=String(mesh.faces.length);canvas.dataset.model='compact_B_v1';
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
      mesh=decodeSTL(rawBytes);$('model-status').hidden=true;$('download-stl').disabled=false;$('markers').hidden=false;queue();
    }catch(error){$('model-status').textContent='The compact model could not load. '+error.message;$('model-status').classList.add('error');$('markers').hidden=true;console.error(error);}
  }
  document.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>setSlide(b.dataset.slide)));
  $('previous').onclick=()=>setSlide(state.slide-1);$('next').onclick=()=>setSlide(state.slide+1);$('back-overview').onclick=()=>setSlide(0);
  document.querySelector('.brand').onclick=e=>{e.preventDefault();setSlide(0);};
  document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>setCamera(b.dataset.camera));$('reset').onclick=()=>setCamera('iso');
  $('toggle-labels').onclick=()=>{state.labels=!state.labels;$('toggle-labels').textContent=state.labels?'Labels on':'Labels off';$('toggle-labels').setAttribute('aria-pressed',String(state.labels));queue();};
  const dialog=$('notes-dialog');$('model-notes').onclick=()=>dialog.showModal();$('close-notes').onclick=()=>dialog.close();
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
  const pointers=new Map();let lastDistance=0;
  canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);lastDistance=0;});
  canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(lastDistance>0)state.zoom=Math.max(.6,Math.min(2.1,state.zoom*d/lastDistance));lastDistance=d;}else{state.azimuth+=(e.clientX-old[0])*.008;state.elevation=Math.max(-1.2,Math.min(1.56,state.elevation+(e.clientY-old[1])*.008));$('camera-name').textContent='CUSTOM VIEW';document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed','false'));}queue();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);lastDistance=0;}));
  canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.6,Math.min(2.1,state.zoom*Math.exp(-e.deltaY*.001)));queue();},{passive:false});
  const readHash=()=>{const i=slides.findIndex(s=>'#'+s.id===location.hash);setSlide(i<0?0:i,false);};
  window.addEventListener('hashchange',readHash);window.addEventListener('popstate',readHash);
  $('markers').hidden=true;readHash();new ResizeObserver(resize).observe(wrap);resize();loadModel();
  window.PRESENTATION={getState:()=>({...state,slideId:current()?.id,loaded:!!mesh,sourceVerified,sourceSHA256:source?.sha256,triangles:mesh?.faces.length,bounds:mesh?[mesh.min,mesh.max]:null}),setSlide,setCamera};
})();
