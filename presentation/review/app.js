/* Presentation-only geometry. Original STL and indexed source remain unchanged. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('assembly-canvas');
  const ctx = canvas.getContext('2d');
  const model = window.ASSEMBLY_MODEL;
  if (!ctx || !model || !Array.isArray(model.vertices) || !Array.isArray(model.faces)) {
    $('canvas-error').hidden = false;
    return;
  }
  const sourceSnapshot = JSON.stringify(model);
  const EPS = 1e-7;
  const colors = {A:[76,137,183],B:[219,174,82],C:[65,158,146],D:[143,119,190]};
  const info = {
    A:['ASIC CARRIER STACK','Four carrier boards, with two ASICs per board in the discussed arrangement. Geometry is conceptual; the electrical implementation will be covered in the team’s section.'],
    B:['CONNECTING BRIDGE','The connecting section is part of the routing PCB. This view studies a shorter free span; it does not select or resize an electrical connector footprint.'],
    C:['ROUTING & POWER','The lower board region is part of the routing-PCB workstream. B + C are discussed together; detailed power and signal handoffs will be added next.'],
    D:['FPGA PCB','The upper board region represents the FPGA PCB. Its position is conceptual; the model does not specify the FPGA device, pinout or completed implementation.']
  };
  const slides = [
    ['assembly','01 / SYSTEM OVERVIEW','Start with the whole assembly.','A common physical view for the ASIC, routing and FPGA workstreams.'],
    ['connector','02 / CONNECTOR REFINEMENT','A shorter connection. Same board regions.','Explore the compact layout while keeping the original geometry available for comparison.'],
    ['sections','03 / PRESENTATION BUILD-OUT','Build the details around this view.','The overview is ready; detailed technical sections are reserved for the team’s content.']
  ];
  const state = {slide:0,variant:'compact',ratio:.5,selected:null,labels:true,ghost:false,az:.48,el:.47,zoom:1};
  let W=0,H=0,DPR=1,dirty=false,faces=[],hitFaces=[],hitLabels=[];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const norm=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
  const centroid=p=>p[0].map((_,i)=>p.reduce((s,v)=>s+v[i],0)/p.length);
  const normal=p=>norm(cross(sub(p[1],p[0]),sub(p[2],p[0])));
  function role(p){
    const c=centroid(p);
    if(c[0]>=18-EPS) return c[2]>=11.45-EPS?'D':'C';
    if(c[2]>=6.45-EPS && c[2]<=7.45+EPS && c[0]>=-3.25-EPS) return 'B';
    return 'A';
  }
  // Split triangles at both cut planes before mapping; never distort the fixed ASIC region.
  function clip(poly,x,keepGreater){
    const out=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i], b=poly[(i+1)%poly.length];
      const ai=keepGreater?a[0]>=x-EPS:a[0]<=x+EPS;
      const bi=keepGreater?b[0]>=x-EPS:b[0]<=x+EPS;
      if(ai)out.push(a.slice());
      if(ai!==bi){const t=(x-a[0])/(b[0]-a[0]);out.push([x,a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2])]);}
    }
    return out.filter((p,i)=>i===0||Math.hypot(...sub(p,out[i-1]))>EPS);
  }
  function splitTriangle(p){
    if(Math.max(...p.map(v=>v[0]))<=3+EPS || Math.min(...p.map(v=>v[0]))>=18-EPS) return [p];
    const polygons=[clip(p,3,false),clip(clip(p,3,true),18,false),clip(p,18,true)];
    const tris=[];
    polygons.forEach(poly=>{for(let k=1;k<poly.length-1;k++){
      const tri=[poly[0],poly[k],poly[k+1]];
      if(Math.hypot(...cross(sub(tri[1],tri[0]),sub(tri[2],tri[0])))>EPS)tris.push(tri);
    }});
    return tris;
  }
  const baseFaces=[];
  model.faces.forEach(f=>{
    const p=f.map(i=>model.vertices[i].slice());
    splitTriangle(p).forEach(t=>baseFaces.push({p:t,role:role(t),center:centroid(t)}));
  });
  function mapVertex(p,ratio){
    const x=p[0]<=3?p[0]:p[0]>=18?p[0]-15*(1-ratio):3+(p[0]-3)*ratio;
    return [x,p[1],p[2]];
  }
  function edgeKey(a,b){const ka=a.map(x=>x.toFixed(5)).join(','),kb=b.map(x=>x.toFixed(5)).join(',');return ka<kb?ka+'|'+kb:kb+'|'+ka;}
  function prepare(){
    const ratio=state.variant==='original'?1:state.ratio;
    faces=baseFaces.map(f=>({...f,p:f.p.map(v=>mapVertex(v,ratio))}));
    const edges=new Map();
    faces.forEach(f=>{
      f.n=normal(f.p);
      f.edgeKeys=f.p.map((p,i)=>edgeKey(p,f.p[(i+1)%3]));
      f.edgeKeys.forEach(k=>{if(!edges.has(k))edges.set(k,[]);edges.get(k).push(f.n);});
    });
    faces.forEach(f=>{f.drawEdge=f.edgeKeys.map(k=>{
      const ns=edges.get(k);
      return ns.length===1||ns.some(n=>Math.abs(n[0]*f.n[0]+n[1]*f.n[1]+n[2]*f.n[2])<.995);
    });});
    requestDraw();
  }
  function scale(){return Math.min((W-55)/74,(H-120)/34)*state.zoom;}
  function project(p){
    const x=p[0]-13.75,y=p[1],z=p[2]-7.6;
    const ca=Math.cos(state.az),sa=Math.sin(state.az),ce=Math.cos(state.el),se=Math.sin(state.el),s=scale();
    return [W*.5+s*(ca*x-sa*y),H*.47+s*(se*(sa*x+ca*y)-ce*z),ce*(sa*x+ca*y)+se*z];
  }
  function path(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function fillColor(f){
    let color=colors[f.role].slice();
    // Darken raised abstract components; this does not add or infer actual part numbers.
    const c=f.center;
    const component=(f.role==='A' && c[0]<-5.7 && [1.45,4.45,10.45,13.45].some(z=>c[2]>z+EPS&&c[2]<=z+.66)) || (f.role==='D'&&c[2]>12.45+EPS) || (f.role==='C'&&c[2]>7.45+EPS);
    if(component)color=color.map(v=>v*.66);
    const lighting=.76+.25*Math.max(0,-.25*f.n[0]-.4*f.n[1]+.88*f.n[2]);
    color=color.map(v=>clamp(v*lighting,0,255));
    if(state.selected&&state.selected!==f.role) color=color.map((v,i)=>v*.25+[229,236,242][i]*.75);
    return color.map(v=>Math.round(v));
  }
  function drawGrid(){
    ctx.save();ctx.strokeStyle='#9babbe22';ctx.lineWidth=.65;
    for(let x=-20;x<=55;x+=5){const a=project([x,-22,-1]),b=project([x,22,-1]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    for(let y=-20;y<=20;y+=5){const a=project([-20,y,-1]),b=project([55,y,-1]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    const p=project([14,0,-1]);const gradient=ctx.createRadialGradient(p[0],p[1],8,p[0],p[1],W*.35);gradient.addColorStop(0,'#14284017');gradient.addColorStop(1,'#14284000');ctx.fillStyle=gradient;ctx.save();ctx.translate(p[0],p[1]);ctx.scale(1,.25);ctx.beginPath();ctx.arc(0,0,W*.36,0,Math.PI*2);ctx.fill();ctx.restore();ctx.restore();
  }
  function drawGhost(){
    // Original board envelopes only: no confusing ghost triangles or fabricated dimensions.
    const loops=[[[18,-12,11.45],[50,-12,11.45],[50,12,11.45],[18,12,11.45]],[[18,-12,6.45],[50,-12,6.45],[50,12,6.45],[18,12,6.45]]];
    ctx.save();ctx.strokeStyle='#4d607d88';ctx.setLineDash([5,5]);ctx.lineWidth=1.4;
    loops.forEach(p=>{path(p.map(project));ctx.stroke();});
    const p=project([50,12,11.45]);ctx.setLineDash([]);ctx.font='10px system-ui';ctx.fillStyle='#53677e';ctx.fillText('original envelope',clamp(p[0]-75,14,W-125),clamp(p[1]+20,75,H-100));ctx.restore();
  }
  function drawLabels(){
    hitLabels=[];
    if(!state.labels)return;
    const ratio=state.variant==='original'?1:state.ratio;
    const labels=[['A','ASIC carriers',[-10,-6,14.1],-58,-47],['B','Bridge',[9,-9.8,7.45],-18,47],['C','Routing / power',[45,-12,7.45],45,60],['D','FPGA PCB',[36,4,13.6],38,-62]];
    const occupied=[];
    labels.forEach(([r,title,v,dx,dy])=>{
      const p=project(mapVertex(v,ratio));
      ctx.font='600 11px system-ui';
      const w=ctx.measureText(title).width+44,h=29;
      let x=clamp(p[0]+dx-w*.5,12,W-w-12),y=clamp(p[1]+dy-h*.5,66,H-h-100);
      for(let tries=0;tries<5;tries++){
        const overlaps=occupied.some(b=>x<b.x+b.w+6&&x+w+6>b.x&&y<b.y+b.h+6&&y+h+6>b.y);
        if(!overlaps)break;
        y=clamp(y+(dy<0?-34:34),64,H-h-96);
        if(tries>=2)x=clamp(x+(dx<0?-36:36),12,W-w-12);
      }
      occupied.push({x,y,w,h});
      ctx.save();ctx.globalAlpha=state.selected&&state.selected!==r?.52:1;
      ctx.strokeStyle='#667c9299';ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(clamp(p[0],x,x+w),clamp(p[1],y,y+h));ctx.stroke();
      ctx.fillStyle='#243b50';ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,Math.PI*2);ctx.fill();
      roundRect(x,y,w,h,6);ctx.fillStyle=state.selected===r?'#203b48':'#15293eed';ctx.fill();
      ctx.fillStyle=`rgb(${colors[r].join(',')})`;roundRect(x+6,y+6,18,17,4);ctx.fill();ctx.font='700 10px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(r,x+15,y+18);ctx.textAlign='left';ctx.font='500 11px system-ui';ctx.fillStyle='#f1f5fb';ctx.fillText(title,x+31,y+19);ctx.restore();
      hitLabels.push({x,y,w,h,role:r});
    });
  }
  // A software depth buffer avoids painter-order artifacts where long PCB triangles overlap.
  // No external renderer or network dependency is needed, including for offline presentation.
  const meshCanvas=document.createElement('canvas');
  const meshCtx=meshCanvas.getContext('2d');
  let image=null,depth=null,pick=null,RW=0,RH=0;
  const RS=1.6;
  function rasterize(items){
    const rw=Math.ceil(W*RS),rh=Math.ceil(H*RS);
    if(rw!==RW||rh!==RH){RW=rw;RH=rh;meshCanvas.width=RW;meshCanvas.height=RH;image=meshCtx.createImageData(RW,RH);depth=new Float32Array(RW*RH);pick=new Uint8Array(RW*RH);}
    image.data.fill(0);depth.fill(-Infinity);pick.fill(0);
    const pixels=image.data;
    items.forEach(f=>{
      const [a,b,c]=f.screen.map(p=>[p[0]*RS,p[1]*RS,p[2]]);
      const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if(Math.abs(den)<1e-8)return;
      const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(RW-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(RH-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const col=fillColor(f),roleId=f.role.charCodeAt(0)-64;
      const ux=(b[1]-c[1])/den,uy=(c[0]-b[0])/den,vx=(c[1]-a[1])/den,vy=(a[0]-c[0])/den;
      for(let y=minY;y<=maxY;y++){
        let u=ux*(minX+.5-c[0])+uy*(y+.5-c[1]);
        let v=vx*(minX+.5-c[0])+vy*(y+.5-c[1]);
        for(let x=minX;x<=maxX;x++,u+=ux,v+=vx){
          const w=1-u-v;if(u<-.00001||v<-.00001||w<-.00001)continue;
          const z=u*a[2]+v*b[2]+w*c[2],i=y*RW+x;
          if(z<=depth[i])continue;
          depth[i]=z;pick[i]=roleId;const k=i*4;
          pixels[k]=col[0];pixels[k+1]=col[1];pixels[k+2]=col[2];pixels[k+3]=255;
        }
      }
    });
    meshCtx.putImageData(image,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(meshCanvas,0,0,W,H);
  }
  function draw(){
    dirty=false;if(!W||!H)return;
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);drawGrid();
    const view=[Math.sin(state.az)*Math.cos(state.el),Math.cos(state.az)*Math.cos(state.el),Math.sin(state.el)];
    hitFaces=faces.filter(f=>f.n.reduce((a,n,i)=>a+n*view[i],0)>1e-8).map(f=>({...f,screen:f.p.map(project)}));
    hitFaces.sort((a,b)=>centroid(a.screen)[2]-centroid(b.screen)[2]);
    rasterize(hitFaces);
    if(state.ghost&&state.variant==='compact')drawGhost();drawLabels();
  }
  function requestDraw(){if(!dirty){dirty=true;requestAnimationFrame(draw);}}
  function resize(){const rect=canvas.getBoundingClientRect();W=rect.width;H=rect.height;DPR=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);requestDraw();}
  function setRegion(r){
    state.selected=state.selected===r?null:r;
    document.querySelectorAll('[data-region]').forEach(b=>{b.classList.toggle('selected',b.dataset.region===state.selected);b.setAttribute('aria-pressed',String(b.dataset.region===state.selected));});
    const d=$('region-detail');d.replaceChildren();const k=document.createElement('span');k.className='detail-kicker';const p=document.createElement('p');
    if(state.selected){k.textContent=info[state.selected][0];p.textContent=info[state.selected][1];}else{k.textContent='READING THE MODEL';p.textContent='B + C belong to the routing-PCB workstream. The downstream receiver and PC are outside this assembly.';}
    d.append(k,p);requestDraw();
  }
  function setVariant(variant){
    state.variant=variant;
    $('compact-button').classList.toggle('selected',variant==='compact');$('compact-button').setAttribute('aria-pressed',String(variant==='compact'));
    $('original-button').classList.toggle('selected',variant==='original');$('original-button').setAttribute('aria-pressed',String(variant==='original'));
    $('revision-name').textContent=variant==='compact'?'Compact bridge study':'Original supplied STL';
    $('model-label').textContent=variant==='compact'?'SHORTENED BRIDGE · PROVISIONAL':'ORIGINAL SUPPLIED GEOMETRY';
    $('variant-note').textContent=variant==='compact'?'Derived shortened bridge · illustrative span · exact revised CAD pending':'Unmodified source geometry · provisional dimensions · units unspecified';
    prepare();
  }
  function setSlide(i,updateHash=true){
    state.slide=clamp(i,0,slides.length-1);const s=slides[state.slide];
    $('eyebrow').textContent=s[1];$('page-title').textContent=s[2];$('subtitle').textContent=s[3];
    ['assembly','connector','discussion'].forEach((n,j)=>$(n+'-panel').hidden=j!==state.slide);
    document.querySelectorAll('[data-slide]').forEach(b=>{const active=Number(b.dataset.slide)===state.slide;b.classList.toggle('selected',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    $('previous').disabled=state.slide===0;$('next').disabled=state.slide===2;$('slide-counter').textContent=String(state.slide+1).padStart(2,'0')+' / 03';
    if(state.selected)setRegion(state.selected);
    if(state.slide===1){setVariant('compact');setRegion('B');}
    if(updateHash){try{history.replaceState(null,'','#'+s[0]);}catch(_){location.hash=s[0];}}
    requestDraw();
  }
  function setView(view){
    if(view==='top'){state.az=0;state.el=Math.PI/2-.001;}else if(view==='side'){state.az=0;state.el=.001;}else{state.az=.48;state.el=.47;}
    document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});requestDraw();
  }
  function inTriangle(p,t){const sign=(a,b,c)=>(a[0]-c[0])*(b[1]-c[1])-(b[0]-c[0])*(a[1]-c[1]);const d=[sign(p,t[0],t[1]),sign(p,t[1],t[2]),sign(p,t[2],t[0])];return !(d.some(x=>x<0)&&d.some(x=>x>0));}
  let pointer=null;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||e.pointerId!==pointer.id)return;
    state.az+=(e.clientX-pointer.x)*.008;state.el=clamp(state.el+(e.clientY-pointer.y)*.008,-1.35,1.55);pointer.x=e.clientX;pointer.y=e.clientY;
    document.querySelectorAll('[data-view]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});requestDraw();
  });
  function finishPointer(e,cancelled=false){
    if(!pointer||e.pointerId!==pointer.id)return;
    if(!cancelled&&Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)<5){
      const rect=canvas.getBoundingClientRect(),p=[e.clientX-rect.left,e.clientY-rect.top];
      const label=hitLabels.find(b=>p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h);
      if(label)setRegion(label.role);else{const px=clamp(Math.floor(p[0]*RS),0,RW-1),py=clamp(Math.floor(p[1]*RS),0,RH-1),id=pick?pick[py*RW+px]:0;if(id)setRegion(String.fromCharCode(id+64));else if(state.selected)setRegion(state.selected);}
    }
    pointer=null;canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerup',e=>finishPointer(e));canvas.addEventListener('pointercancel',e=>finishPointer(e,true));
  canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=clamp(state.zoom*Math.exp(-e.deltaY*.001),.6,2.5);requestDraw();},{passive:false});
  document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>setRegion(b.dataset.region)));
  document.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>setSlide(Number(b.dataset.slide))));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('previous').onclick=()=>setSlide(state.slide-1);$('next').onclick=()=>setSlide(state.slide+1);
  $('compact-button').onclick=()=>setVariant('compact');$('original-button').onclick=()=>setVariant('original');
  $('labels-toggle').onclick=()=>{state.labels=!state.labels;$('labels-toggle').setAttribute('aria-pressed',String(state.labels));$('labels-toggle').textContent=state.labels?'Labels on':'Labels off';requestDraw();};
  $('ghost-toggle').onclick=()=>{state.ghost=!state.ghost;$('ghost-toggle').setAttribute('aria-pressed',String(state.ghost));$('ghost-toggle').textContent=state.ghost?'Hide original envelope':'Show original envelope';requestDraw();};
  $('bridge-ratio').oninput=e=>{state.ratio=Number(e.target.value)/100;$('ratio-output').value=Math.round(state.ratio*100)+'%';setVariant('compact');};
  $('zoom-out').onclick=()=>{state.zoom=clamp(state.zoom*.88,.6,2.5);requestDraw();};
  $('zoom-in').onclick=()=>{state.zoom=clamp(state.zoom/ .88,.6,2.5);requestDraw();};
  $('reset-view').onclick=()=>{state.zoom=1;setView('iso');};
  const dialog=$('sources-dialog');$('sources-button').onclick=()=>dialog.showModal();$('close-sources').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(_){$('fullscreen').title='Fullscreen unavailable in this browser; use the browser’s fullscreen command.';}}
  $('fullscreen').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');resize();});
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||dialog.open||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
    if(e.key==='ArrowRight'){e.preventDefault();setSlide(state.slide+1);}else if(e.key==='ArrowLeft'){e.preventDefault();setSlide(state.slide-1);}else if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();}else if(e.key.toLowerCase()==='r'){$('reset-view').click();}
  });
  window.addEventListener('hashchange',()=>{const i=slides.findIndex(s=>'#'+s[0]===location.hash);if(i>=0)setSlide(i,false);});
  new ResizeObserver(resize).observe(canvas.parentElement);
  window.assemblyPresentation=Object.freeze({
    getState:()=>({...state,sourceTriangles:model.faces.length,displayTriangles:faces.length}),
    checkGeometry:()=>({sourceUnchanged:JSON.stringify(model)===sourceSnapshot,fixedSideUnchanged:model.vertices.filter(p=>p[0]<=3).every(p=>JSON.stringify(p)===JSON.stringify(mapVertex(p,state.ratio))),downstreamRigid:model.vertices.filter(p=>p[0]>=18).every(p=>{const q=mapVertex(p,state.ratio);return Math.abs(q[0]-p[0]+15*(1-state.ratio))<EPS&&q[1]===p[1]&&q[2]===p[2];}),originalMappingIdentity:model.vertices.every(p=>JSON.stringify(p)===JSON.stringify(mapVertex(p,1)))})
  });
  const initial=slides.findIndex(s=>'#'+s[0]===location.hash);setSlide(initial<0?0:initial,false);setVariant('compact');resize();
})();
