/* Assembly-first presentation. No dependencies, analytics, or external requests.
 * Region roles: hardware/assembly/README.md. Compact transform is provisional.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const model = window.ASSEMBLY_MODEL;
  const canvas = $('scene'), wrap = $('canvas-wrap'), ctx = canvas.getContext('2d');
  if (!ctx || !model || !Array.isArray(model.vertices) || !Array.isArray(model.faces)) {
    $('load-error').hidden = false; return;
  }
  const BASE = {start:3, end:18, length:15};
  const state = {focus:0,compact:true,bridge:5,az:-1.10,el:.60,zoom:1,labels:true};
  const sections = [
    {hash:'overview',eyebrow:'01 / SYSTEM OVERVIEW',title:'Start with<br>the assembly.',text:'A shared view of the ASIC-carrier stack, compact routing connection, and FPGA board.',label:'PRESENTATION STARTING POINT',note:'Use this model to introduce the architecture. Detailed board sections will be added next.'},
    {hash:'asic',eyebrow:'02 / REGION A',title:'The recording<br>front end.',text:'Four ASIC-carrier boards are stacked in the discussion model, with two ASICs per board.',label:'ASIC-CARRIER SECTION / TO BUILD',note:'This region is ready for the team’s carrier design, interfaces, and current progress. No new implementation claims are added here.'},
    {hash:'routing',eyebrow:'03 / REGIONS B + C',title:'A more compact<br>connection.',text:'The connecting section and lower board form the routing region. The compact study brings the two sides closer together.',label:'CONNECTION REVISION / PROVISIONAL',note:'Region B is shortened for discussion. Confirm the earlier CAD revision, physical connector choice, and clearances before treating this as a design decision.'},
    {hash:'fpga',eyebrow:'04 / REGION D',title:'The FPGA<br>board.',text:'The upper board is the FPGA region. This is the entry point for the PCB and logic workstreams.',label:'FPGA SECTION / TO BUILD',note:'The next iteration can add the board design, signal interfaces, firmware, and bring-up plan from the team’s supplied content.'}
  ];
  const colors = {A:[49,134,137],B:[202,152,68],C:[87,157,137],D:[92,126,173]};
  const groups = model.faces.map(face => {
    const v=face.map(i=>model.vertices[i]), xs=v.map(p=>p[0]), zs=v.map(p=>p[2]);
    if(Math.max(...xs)<=3.00001) return 'A';
    if(Math.min(...xs)<17.99999) return 'B';
    return zs.reduce((a,b)=>a+b,0)/3>=11.45-.00001?'D':'C';
  });
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const normalize=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
  const normals=model.faces.map(f=>normalize(cross(sub(model.vertices[f[1]],model.vertices[f[0]]),sub(model.vertices[f[2]],model.vertices[f[0]]))));
  const edgeMap=new Map();
  model.faces.forEach((f,i)=>{for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;if(!edgeMap.has(key))edgeMap.set(key,{a,b,faces:[]});edgeMap.get(key).faces.push(i);}});
  const sharpEdges=[...edgeMap.values()].filter(e=>e.faces.length!==2||Math.abs(dot(normals[e.faces[0]],normals[e.faces[1]]))<.96||groups[e.faces[0]]!==groups[e.faces[1]]);
  const faceEdges=new Map();
  sharpEdges.forEach(e=>e.faces.forEach(i=>{if(!faceEdges.has(i))faceEdges.set(i,[]);faceEdges.get(i).push(e);}));
  const markerPoints={A:[-7,-3,15.75],B:[10.5,-5,7.45],C:[42,-10.5,7.45],D:[34,0,14.25]};
  let width=0,height=0,scheduled=false;
  function tx(x){if(!state.compact)return x;if(x<=BASE.start)return x;if(x>=BASE.end)return x-(BASE.length-state.bridge);return BASE.start+(x-BASE.start)*state.bridge/BASE.length;}
  function transform(p){return [tx(p[0]),p[1],p[2]];}
  function active(g){return state.focus===0||(state.focus===1&&g==='A')||(state.focus===2&&(g==='B'||g==='C'))||(state.focus===3&&g==='D');}
  function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;draw();});}
  function draw(){
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const ca=Math.cos(state.az),sa=Math.sin(state.az),ce=Math.cos(state.el),se=Math.sin(state.el);
    const right=[-sa,ca,0],up=[-ca*se,-sa*se,ce],eye=[ca*ce,sa*ce,se];
    const center=[(tx(-15)+tx(50))/2,0,7.5];
    const transformed=model.vertices.map(transform);
    const projectRaw=p=>{const d=sub(p,center);return [dot(d,right),-dot(d,up),dot(d,eye)];};
    const coords=transformed.map(projectRaw);
    const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);
    const spanX=Math.max(...xs)-Math.min(...xs),spanY=Math.max(...ys)-Math.min(...ys);
    const fit=Math.min(width*.81/Math.max(spanX,1),height*.67/Math.max(spanY,1));
    const scale=fit*state.zoom,offsetX=width/2-(Math.max(...xs)+Math.min(...xs))/2*scale,offsetY=height*.5-(Math.max(...ys)+Math.min(...ys))/2*scale;
    const project=p=>{const q=projectRaw(p);return [offsetX+q[0]*scale,offsetY+q[1]*scale,q[2]];};
    const pts=coords.map(p=>[offsetX+p[0]*scale,offsetY+p[1]*scale,p[2]]);
    // A light drafting grid belongs to the viewer, not to the source geometry.
    ctx.strokeStyle='rgba(70,112,94,.065)';ctx.lineWidth=.7;
    for(let x=20;x<width;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
    for(let y=12;y<height;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    ctx.save();ctx.translate(width*.52,height*.7);ctx.scale(1,.22);const grad=ctx.createRadialGradient(0,0,0,0,0,width*.36);grad.addColorStop(0,'rgba(49,77,65,.11)');grad.addColorStop(1,'rgba(49,77,65,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,width*.36,0,Math.PI*2);ctx.fill();ctx.restore();
    const light=normalize([-.25,-.45,.86]);
    const visible=model.faces.map((f,i)=>({f,i,depth:f.reduce((s,j)=>s+pts[j][2],0)/3})).filter(t=>dot(normals[t.i],eye)>-.001).sort((a,b)=>a.depth-b.depth);
    visible.forEach(({f,i})=>{
      const region=groups[i],isActive=active(region),n=normals[i];
      const lum=.63+.37*Math.max(0,dot(n,light));
      const rgb=(isActive?colors[region]:[204,216,211]).map(c=>Math.round(c*lum));
      ctx.beginPath();f.forEach((j,k)=>k?ctx.lineTo(pts[j][0],pts[j][1]):ctx.moveTo(pts[j][0],pts[j][1]));ctx.closePath();
      ctx.fillStyle=`rgb(${rgb.join(',')})`;ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.5;ctx.stroke();
      ctx.strokeStyle=isActive?'rgba(22,54,60,.42)':'rgba(87,117,110,.22)';ctx.lineWidth=.65;
      (faceEdges.get(i)||[]).forEach(e=>{ctx.beginPath();ctx.moveTo(pts[e.a][0],pts[e.a][1]);ctx.lineTo(pts[e.b][0],pts[e.b][1]);ctx.stroke();});
    });
    Object.entries(markerPoints).forEach(([name,p])=>{
      const at=project(transform(p)),el=document.querySelector(`[data-marker="${name}"]`);
      let x=at[0],y=at[1]-(name==='A'||name==='D'?24:0);
      if(name==='B')y+=22;if(name==='C')y+=18;
      x=Math.max(19,Math.min(width-19,x));y=Math.max(22,Math.min(height-22,y));
      el.style.left=x+'px';el.style.top=y+'px';el.style.opacity=active(name)?'1':'.38';el.hidden=!state.labels;
      if(state.labels){ctx.strokeStyle=active(name)?'rgba(39,73,75,.40)':'rgba(39,73,75,.15)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(at[0],at[1]);ctx.lineTo(x,y);ctx.stroke();}
    });
    canvas.dataset.rendered='true';canvas.dataset.triangles=String(model.faces.length);canvas.dataset.variant=state.compact?'compact':'original';
  }
  function resize(){const r=wrap.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);queue();}
  new ResizeObserver(resize).observe(wrap);
  function setFocus(i,updateHash=true){state.focus=Math.max(0,Math.min(sections.length-1,i));const s=sections[state.focus];$('eyebrow').textContent=s.eyebrow;$('headline').innerHTML=s.title;$('lede').textContent=s.text;$('note-label').textContent=s.label;$('focus-note').textContent=s.note;$('step-count').textContent=String(state.focus+1).padStart(2,'0');$('prev').disabled=state.focus===0;$('next').disabled=state.focus===sections.length-1;document.querySelectorAll('.region-card').forEach(b=>{const on=Number(b.dataset.focus)===state.focus;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});if(updateHash)history.replaceState(null,'','#'+s.hash);queue();}
  document.querySelectorAll('[data-focus]').forEach(b=>b.addEventListener('click',()=>setFocus(Number(b.dataset.focus))));
  $('prev').onclick=()=>setFocus(state.focus-1);$('next').onclick=()=>setFocus(state.focus+1);$('overview').onclick=()=>setFocus(0);document.querySelector('.brand').onclick=e=>{e.preventDefault();setFocus(0);};
  function camera(name){const cams={iso:[-1.10,.60],top:[-Math.PI/2,Math.PI/2-.001],side:[-Math.PI/2,.025]};[state.az,state.el]=cams[name]||cams.iso;state.zoom=1;$('orientation').textContent={iso:'ISOMETRIC',top:'TOP VIEW',side:'SIDE VIEW'}[name]||'ISOMETRIC';document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('selected',b.dataset.camera===name));queue();}
  document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>camera(b.dataset.camera));$('reset').onclick=()=>camera('iso');
  function variant(compact){state.compact=compact;$('compact').classList.toggle('selected',compact);$('original').classList.toggle('selected',!compact);$('compact').setAttribute('aria-pressed',String(compact));$('original').setAttribute('aria-pressed',String(!compact));$('revision-title').textContent=compact?'Compact connection study':'Original reference geometry';$('revision-caption').textContent=compact?'New provisional shortening of region B—not the recovered earlier revision.':'Original positions restored. Dimensions remain provisional; STL units are unspecified.';queue();}
  $('compact').onclick=()=>variant(true);$('original').onclick=()=>variant(false);$('labels').onclick=()=>{state.labels=!state.labels;$('labels').textContent=state.labels?'Labels on':'Labels off';$('labels').setAttribute('aria-pressed',String(state.labels));queue();};
  const dialog=$('source-dialog');$('notes').onclick=()=>dialog.showModal();$('close-notes').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  $('bridge-length').oninput=e=>{state.bridge=Math.max(3,Math.min(15,Number(e.target.value)));$('bridge-output').textContent=String(state.bridge);variant(true);};
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();}catch(e){console.warn('Fullscreen is unavailable in this browser context.',e);}}
  $('fullscreen').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');});
  document.addEventListener('keydown',e=>{if(dialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();setFocus(state.focus+1);}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();setFocus(state.focus-1);}else if(e.key==='Home'){e.preventDefault();setFocus(0);}else if(/^[1-4]$/.test(e.key))setFocus(Number(e.key)-1);else if(e.key.toLowerCase()==='r')camera('iso');else if(e.key.toLowerCase()==='f')fullscreen();});
  const pointers=new Map();let lastDistance=0;
  canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);lastDistance=0;});
  canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],dist=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(lastDistance>0)state.zoom=Math.max(.65,Math.min(2.2,state.zoom*dist/lastDistance));lastDistance=dist;}else{state.az+=(e.clientX-old[0])*.008;state.el=Math.max(-.8,Math.min(1.55,state.el+(e.clientY-old[1])*.008));$('orientation').textContent='CUSTOM VIEW';document.querySelectorAll('[data-camera]').forEach(b=>b.classList.remove('selected'));}queue();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);lastDistance=0;}));
  canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.65,Math.min(2.2,state.zoom*Math.exp(-e.deltaY*.001)));queue();},{passive:false});
  window.addEventListener('hashchange',()=>{const i=sections.findIndex(s=>'#'+s.hash===location.hash);if(i>=0)setFocus(i,false);});
  const start=sections.findIndex(s=>'#'+s.hash===location.hash);setFocus(start>=0?start:0,false);resize();
  // Small public diagnostic surface for smoke tests; no hardware-control functions.
  window.PRESENTATION={getState:()=>({...state}),setFocus,variant,camera,transformX:tx,triangleCount:model.faces.length};
})();
