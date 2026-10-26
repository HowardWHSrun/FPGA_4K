/* Public nominal geometry authored from the current native PCB; no supplier meshes. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const assetBase='../../../hardware/xem8305-carrier/dated/2026-10-26/carrier-v1/';
const $=id=>document.getElementById(id);
const stage=$('stage'),canvas=$('carrier-canvas'),drawing=$('drawing'),status=$('model-status');
const state={ready:false,error:null,revision:'V1',view:'3d',pose:'iso',layoutSide:'front',selectedReference:'',bodyCount:0,verifiedBodies:0,featureCount:0,sourceSHA256:null,publicGeometry:'independently authored nominal package geometry'};
const params=new URLSearchParams(location.search);
let data,renderer,scene,camera,controls,bodyGroup,tracksGroup,selection,resizeObserver;
const meshes=[],componentMap=new Map();
let drawingScale=1,drawingX=0,drawingY=0,drawingDrag=null,active=true;
window.carrierV1Viewer={getState:()=>({...state}),setView:view=>setView(view),setPose:pose=>setPose(pose)};

function ring(points){const path=new THREE.Path();points.forEach((p,i)=>i?path.lineTo(...p):path.moveTo(...p));path.closePath();return path;}
function shape(points,holes=[]){const s=new THREE.Shape();points.forEach((p,i)=>i?s.lineTo(...p):s.moveTo(...p));s.closePath();s.holes=holes.map(ring);return s;}
function material(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.6,...extra});}
const solder=material('#cfba81',{metalness:.65,roughness:.35,side:THREE.DoubleSide});
const copper=material('#4c8368',{metalness:.25,roughness:.65,side:THREE.DoubleSide});
const palette={capacitor:'#b0a18a',resistor:'#34363c',ic:'#2b3035',connector:'#d6d5c8',crystal:'#b8c2c8',inductor:'#3b4245',ferrite:'#454c4d',led:'#d9c09e',diode:'#39373a'};
function bodyColor(c){return palette[c.body.kind]||(/^(J|MC)/.test(c.ref)?'#d5d8cb':/^U/.test(c.ref)?'#30353a':'#aaa99d');}
function merged(items,mat,parent){if(!items.length)return;const geometry=mergeGeometries(items,false);for(const g of items)g.dispose();parent.add(new THREE.Mesh(geometry,mat));}
function padGeometry(p){const [w,h]=p.size;let g;
 if(p.shape==='round'&&Math.abs(w-h)<.02)g=new THREE.CircleGeometry(w/2,16);
 else if(p.shape==='rect')g=new THREE.PlaneGeometry(w,h);
 else {const r=Math.min(w,h)/2,s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);g=new THREE.ShapeGeometry(s,6);}
 g.rotateZ(THREE.MathUtils.degToRad(p.rotation_z||0));g.translate(...p.center);return g;
}
function build(){
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#e3e9ed');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.1,1600);camera.up.set(0,1,0);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=25;controls.maxDistance=500;controls.target.set(0,0,0);
 scene.add(new THREE.HemisphereLight('#ffffff','#5a6878',3));const key=new THREE.DirectionalLight('#fff8e9',3);key.position.set(50,100,140);scene.add(key);const back=new THREE.DirectionalLight('#d8e8ff',2);back.position.set(-60,-30,-100);scene.add(back);
 const outline=shape(data.board.outline,data.board.holes.map(h=>Array.from({length:32},(_,i)=>{const a=-i*Math.PI*2/32;return [h.center[0]+Math.cos(a)*h.diameter/2,h.center[1]+Math.sin(a)*h.diameter/2];})));
 const boardG=new THREE.ExtrudeGeometry(outline,{depth:data.board.thickness,bevelEnabled:false,curveSegments:16});boardG.translate(0,0,-data.board.thickness/2);
 scene.add(new THREE.Mesh(boardG,material('#285b4c',{roughness:.8,metalness:.08})));
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(boardG,30),new THREE.LineBasicMaterial({color:'#163e34',transparent:true,opacity:.6}));scene.add(edge);
 bodyGroup=new THREE.Group();scene.add(bodyGroup);tracksGroup=new THREE.Group();scene.add(tracksGroup);tracksGroup.visible=false;
 const pads=[];for(const c of [...data.components,...data.features])for(const p of c.pads||[])pads.push(padGeometry(p));
 // Normalize indexed/nonindexed planes before merging them for a small draw-call count.
 merged(pads.map(g=>g.index?g.toNonIndexed():g),solder,scene);
 for(const c of data.components){
  componentMap.set(c.ref,c);const g=new THREE.BoxGeometry(...c.body.size);const mesh=new THREE.Mesh(g,material(bodyColor(c),{metalness:c.body.kind==='crystal'?.6:.1}));mesh.position.set(...c.body.center);mesh.userData.ref=c.ref;bodyGroup.add(mesh);meshes.push(mesh);
  // A simple recessed stripe makes the connector orientation visible without supplier CAD.
  if(/^(J1|J2|MC)/.test(c.ref)){const s=c.body.size;const groove=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.25,s[0]*.78),Math.max(.25,s[1]*.34),.08),material('#4b5352'));groove.position.set(c.body.center[0],c.body.center[1],c.body.center[2]+(c.side==='back'?-1:1)*(s[2]/2+.04));bodyGroup.add(groove);}
 }
 const trackGeo=[];for(const t of data.tracks){const a=new THREE.Vector3(...t.a),b=new THREE.Vector3(...t.b),d=new THREE.Vector3().subVectors(b,a);if(d.length()<.001)continue;const g=new THREE.CylinderGeometry(t.width/2,t.width/2,d.length(),6,1,true);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize())));g.translate(...a.add(b).multiplyScalar(.5).toArray());trackGeo.push(g.toNonIndexed());}
 merged(trackGeo,copper,tracksGroup);
 const zoneGeo=[];for(const z of data.zones||[])for(const p of z.polygons){if(p.outline.length<3)continue;const g=new THREE.ShapeGeometry(shape(p.outline,p.holes),1);g.translate(0,0,z.z);zoneGeo.push(g.index?g.toNonIndexed():g);}merged(zoneGeo,material('#3b745e',{side:THREE.DoubleSide,roughness:.9}),tracksGroup);
 const viaGeo=[];for(const v of data.vias){for(const side of [-1,1]){const g=new THREE.RingGeometry(v.drill/2,v.diameter/2,10);g.translate(v.center[0],v.center[1],side*(data.board.thickness/2+.018));viaGeo.push(g.toNonIndexed());}}merged(viaGeo,solder,scene);
 selection=new THREE.Box3Helper(new THREE.Box3(),0xe9ac36);selection.visible=false;scene.add(selection);
 resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();setPose('iso');
 const pointer={x:0,y:0};canvas.addEventListener('pointerdown',e=>{pointer.x=e.clientX;pointer.y=e.clientY;});canvas.addEventListener('pointerup',e=>{if(Math.hypot(pointer.x-e.clientX,pointer.y-e.clientY)>5)return;const r=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(meshes)[0];if(hit)selectComponent(hit.object.userData.ref);});
 const animate=()=>{requestAnimationFrame(animate);if(active&&state.view==='3d'){controls.update();renderer.render(scene,camera);}};animate();
}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function setPose(pose){if(!['iso','top','bottom'].includes(pose))return;state.pose=pose;document.querySelectorAll('[data-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pose===pose)));if(!camera)return;controls.target.set(0,0,0);const aspect=stage.clientWidth/Math.max(stage.clientHeight,1),distance=Math.max(175,105/aspect);if(pose==='top')camera.position.set(0,0,distance);else if(pose==='bottom')camera.position.set(0,0,-distance);else camera.position.set(distance*.55,distance*.5,-distance*.8);camera.up.set(0,1,0);camera.lookAt(controls.target);controls.update();}
function updateDrawing(){drawing.style.transform=`translate(${drawingX}px,${drawingY}px) scale(${drawingScale})`;}
function fit(){if(state.view==='3d')setPose(state.pose);else {drawingScale=1;drawingX=0;drawingY=0;if(state.view==='schematic'){/* Fit the occupied circuit area of the preserved A0 sheet; the complete SVG remains available by zooming out. */const sheet={w:1188.9994,h:840.9940},content={x:24,y:44,w:602,h:582},base=Math.min(stage.clientWidth/sheet.w,stage.clientHeight/sheet.h);drawingScale=.94*Math.min(stage.clientWidth/(content.w*base),stage.clientHeight/(content.h*base));drawingX=-drawingScale*base*(content.x+content.w/2-sheet.w/2);drawingY=-drawingScale*base*(content.y+content.h/2-sheet.h/2);}updateDrawing();}}
function setView(view){if(!['3d','layout','schematic'].includes(view))return;state.view=view;document.body.dataset.view=view;document.querySelectorAll('button[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));canvas.hidden=view!=='3d';$('drawing-stage').hidden=view==='3d';$('poses').hidden=view!=='3d';$('layout-sides').hidden=view!=='layout';$('tracks-choice').hidden=view!=='3d';$('component-picker').closest('section').hidden=view==='schematic';$('view-title').textContent=view==='3d'?'Carrier V1 · nominal public 3D':view==='layout'?`Current native layout · ${state.layoutSide}`:'Current native schematic';$('view-help').textContent=view==='3d'?'Drag to rotate · right-drag to pan · scroll to zoom · select a component':'Drag to pan · scroll or use + / − to zoom';if(view!=='3d'){drawing.src=assetBase+(view==='schematic'?'schematic.svg':'layout-'+state.layoutSide+'.svg');drawing.alt=view==='schematic'?'Carrier V1 complete native schematic':`Carrier V1 native ${state.layoutSide} layout`;fit();}else resize();}
function selectComponent(ref){state.selectedReference=ref;$('component-picker').value=ref;const c=componentMap.get(ref);if(!c){if(selection)selection.visible=false;$('component-detail').textContent='80 body models checked in the native project; 8 bare test pads and 4 mounting holes are PCB features.';return;}const detail=$('component-detail');detail.replaceChildren();const strong=document.createElement('strong');strong.textContent=c.ref;detail.append(strong,document.createTextNode(`${c.value} · ${c.side==='back'?'component side':'front'} · ${c.footprint} · native model verified`));const mesh=meshes.find(m=>m.userData.ref===ref);if(mesh&&selection){selection.box.setFromObject(mesh);selection.box.expandByScalar(.25);selection.visible=true;selection.updateMatrixWorld(true);}if(camera&&c.body){const sign=c.side==='back'?-1:1;if(Math.sign(camera.position.z)!==sign)setPose(sign===1?'top':'bottom');}}
function zoom(factor){if(state.view==='3d'){const delta=camera.position.clone().sub(controls.target).multiplyScalar(1/factor);camera.position.copy(controls.target).add(delta);controls.update();}else{drawingScale=Math.max(.5,Math.min(16,drawingScale*factor));updateDrawing();}}
for(const b of document.querySelectorAll('button[data-view]'))b.onclick=()=>setView(b.dataset.view);
for(const b of document.querySelectorAll('[data-pose]'))b.onclick=()=>setPose(b.dataset.pose);
for(const b of document.querySelectorAll('[data-layout-side]'))b.onclick=()=>{state.layoutSide=b.dataset.layoutSide;document.querySelectorAll('[data-layout-side]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setView('layout');};
$('component-picker').onchange=e=>selectComponent(e.target.value);$('show-tracks').onchange=e=>{if(tracksGroup)tracksGroup.visible=e.target.checked;};$('zoom-in').onclick=()=>zoom(1.2);$('zoom-out').onclick=()=>zoom(1/1.2);$('reset').onclick=fit;
$('drawing-stage').addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.12:1/1.12);},{passive:false});$('drawing-stage').addEventListener('pointerdown',e=>{drawingDrag={x:e.clientX,y:e.clientY,startX:drawingX,startY:drawingY};e.currentTarget.setPointerCapture(e.pointerId);});$('drawing-stage').addEventListener('pointermove',e=>{if(!drawingDrag)return;drawingX=drawingDrag.startX+e.clientX-drawingDrag.x;drawingY=drawingDrag.startY+e.clientY-drawingDrag.y;updateDrawing();});$('drawing-stage').addEventListener('pointerup',()=>{drawingDrag=null;});$('drawing-stage').addEventListener('pointercancel',()=>{drawingDrag=null;});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='presentation-slide-active')active=Boolean(e.data.active);});
try{
 const response=await fetch(assetBase+'public-model.json');if(!response.ok)throw Error('Carrier data '+response.status);data=await response.json();state.bodyCount=data.components.length;state.verifiedBodies=data.components.filter(c=>c.native_model_verified).length;state.featureCount=data.features.length;state.sourceSHA256=data.source_PCB_sha256;
 $('verified-count').textContent=`${state.verifiedBodies} / ${state.bodyCount}`;$('source-hash').textContent=state.sourceSHA256;
 for(const c of data.components){const option=document.createElement('option');option.value=c.ref;option.textContent=`${c.ref} · ${c.value}`;$('component-picker').append(option);}
 build();setView(params.get('view')||'3d');status.hidden=true;state.ready=true;document.body.dataset.ready='true';
}catch(error){state.error=error.message;status.textContent='Unable to load the interactive model. The native layout, schematic and review files remain available below.';console.error(error);}
