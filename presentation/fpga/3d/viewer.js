import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const $=id=>document.getElementById(id), canvas=$('scene'), stage=$('stage');
const params=new URLSearchParams(location.search);
if(params.get('locked')==='1')document.querySelector('.revision').hidden=true;
let board=params.get('board')==='micro-hdmi'?'micro-hdmi':'usb-c', data, request=0, assembly, simpleGroup, labelEntries=[], selected=null;
const state={ready:false,board,view:'iso',labels:true,simplified:true};
let renderer;
try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});} catch(e) {$('loading').textContent='3D needs WebGL. Use the Front / Back views or open the native KiCad file.';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(34,1,0.1,1000);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=23;controls.maxDistance=200;controls.target.set(0,0,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x71849a,3));
const key=new THREE.DirectionalLight(0xfff6e8,4);key.position.set(-30,65,30);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-35;key.shadow.camera.right=35;key.shadow.camera.top=35;key.shadow.camera.bottom=-35;key.shadow.normalBias=.06;scene.add(key);
const fill=new THREE.DirectionalLight(0xe3efff,2.5);fill.position.set(35,25,-45);scene.add(fill);
const underside=new THREE.DirectionalLight(0xffffff,2.5);underside.position.set(-15,-45,25);scene.add(underside);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.ShadowMaterial({opacity:.10}));ground.rotation.x=-Math.PI/2;ground.position.y=-7;ground.receiveShadow=true;scene.add(ground);
const materials={body:new THREE.MeshStandardMaterial({color:0x252b32,roughness:.68,metalness:.05}),substrate:new THREE.MeshStandardMaterial({color:0x273b32,roughness:.68}),metal:new THREE.MeshStandardMaterial({color:0xaab5c0,roughness:.3,metalness:.4}),gold:new THREE.MeshStandardMaterial({color:0xc6a857,roughness:.37,metalness:.35}),cap:new THREE.MeshStandardMaterial({color:0xa98e69,roughness:.66}),inductor:new THREE.MeshStandardMaterial({color:0x3d4247,roughness:.76})};
function box(group,w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function addSimple(p){
 const [x,z,w,d]=p.body,h=p.height,g=new THREE.Group();g.userData.ref=p.ref;
 // Extents come from native F/B.Fab. Heights and interiors are explicitly illustrative.
 g.position.set(x+w/2-16.5,p.back?-.8:.8,z+d/2-18);if(p.back)g.rotation.z=Math.PI;
 if(p.ref==='U1'){
  box(g,w,.18,d,0,.43,0,materials.substrate);box(g,w-.3,.9,d-.3,0,.97,0,materials.body);
  const balls=new THREE.InstancedMesh(new THREE.SphereGeometry(.21,8,6),materials.metal,324);const m=new THREE.Matrix4();let i=0;
  for(let a=0;a<18;a++)for(let b=0;b<18;b++){m.makeTranslation((a-8.5)*.8,.2,(b-8.5)*.8);balls.setMatrixAt(i++,m);}g.add(balls);
  const mark=new THREE.Mesh(new THREE.CircleGeometry(.28,16),new THREE.MeshBasicMaterial({color:0x98a19f}));mark.rotation.x=-Math.PI/2;mark.position.set(-6.25,1.425,-6.25);g.add(mark);
 } else if(p.ref==='J4'){
  box(g,w,.2,d,0,h-.1,0,materials.metal);box(g,w,.2,d,0,.15,0,materials.metal);
  box(g,w,h,.22,0,h/2,-d/2+.11,materials.metal);box(g,w,h,.22,0,h/2,d/2-.11,materials.metal);
  box(g,.5,h,d,-w/2+.25,h/2,0,materials.body);box(g,w*.72,.45,d*.62,-w*.06,h*.46,0,materials.body);
 } else if(p.ref==='J5'||p.ref==='J6'){
  box(g,w,.6,d,0,.3,0,materials.body);box(g,w,h,d*.18,0,h/2,-d*.41,materials.body);box(g,w,h,d*.18,0,h/2,d*.41,materials.body);
  box(g,.8,h,d,-w/2+.4,h/2,0,materials.body);box(g,.8,h,d,w/2-.4,h/2,0,materials.body);
  for(let n=0;n<30;n++)for(const s of [-1,1])box(g,.18,.15,.8,(n-14.5)*.5,h-.05,s*d*.32,materials.gold);
 } else {box(g,w,h,d,0,h/2,0,p.ref.startsWith('L')?materials.inductor:p.ref.startsWith('C')?materials.cap:materials.body);}
 simpleGroup.add(g);
}
function dispose(group){group.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(!Object.values(materials).includes(o.material)){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}}});scene.remove(group);}
function setView(view){
 const aspect=stage.clientWidth/Math.max(1,stage.clientHeight);const k=Math.max(1,1/aspect);
 const poses={iso:[46,60,62],top:[0,95,.01],bottom:[0,-95,.01],side:[95,3,0]};if(!poses[view])return;
 camera.up.set(0,1,0);camera.position.fromArray(poses[view]).multiplyScalar(k);controls.target.set(0,0,0);controls.update();state.view=view;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
}
async function load(id){
 const token=++request;state.ready=false;state.board=id;board=id;selected=null;$('part').hidden=true;$('loading').hidden=false;$('loading').textContent='Loading native board geometry…';$('revision').value=id;
 try{
  const r=await fetch(`assets/${id}.json`);if(!r.ok)throw new Error('Metadata unavailable');const next=await r.json();
  const gltf=await new GLTFLoader().loadAsync(`assets/${id}.glb`);if(token!==request){dispose(gltf.scene);return;}
  if(assembly)dispose(assembly);data=next;assembly=new THREE.Group();const native=gltf.scene;native.scale.setScalar(1000);native.position.set(-16.5,-.8,-18);
  native.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.metalness=.12;m.roughness=.55;if(m.opacity>.8&&m.opacity<.85){m.color.set(0x185c48);m.opacity=1;m.transparent=false;m.depthWrite=true;}else if(m.opacity>.95&&m.opacity<1){m.opacity=1;m.transparent=false;m.depthWrite=true;}}}});assembly.add(native);
  simpleGroup=new THREE.Group();assembly.add(simpleGroup);data.parts.filter(p=>p.model==='simplified body').forEach(addSimple);simpleGroup.visible=state.simplified;scene.add(assembly);
  labelEntries=[];$('labels').replaceChildren();for(const [ref,text] of [['U1','100T · FPGA'],['J4',id==='usb-c'?'USB-C':'Micro-HDMI'],['J5','ASIC mezzanine'],['J6','ASIC mezzanine']]){
   const p=data.parts.find(p=>p.ref===ref);if(!p)continue;const el=document.createElement('span');el.className='label';el.textContent=text;$('labels').append(el);labelEntries.push({p,el,point:new THREE.Vector3(p.x-16.5,p.back?-4.3:4.3,p.y-18)});
  }
  $('title').textContent=data.title;$('coverage').textContent=`${data.library_model_count} library models · ${data.simplified_body_count} simplified bodies`;
  $('model-note').textContent=`Simplified: ${data.simplified_refs.join(', ')}. The bare SWD fixture, when present, is pads only.`;
  $('native-link').href=`../viewer/?board=${id==='usb-c'?'usb-c':'compact-routed'}`;
  $('loading').hidden=true;state.ready=true;setView('iso');
  const url=new URL(location.href);url.searchParams.set('board',id);history.replaceState(null,'',url);window.parent.postMessage({type:'fpga-3d-ready',board:id},location.origin);
 }catch(e){if(token===request){$('loading').textContent='The model could not load. Reload or inspect the native KiCad board.';console.error(e);}}
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}
new ResizeObserver(resize).observe(stage);
function zoom(f){camera.position.sub(controls.target).multiplyScalar(f).add(controls.target);controls.update();}
$('in').onclick=()=>zoom(.82);$('out').onclick=()=>zoom(1.22);$('reset').onclick=()=>setView('iso');
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('revision').onchange=e=>load(e.target.value);
$('simplified').onchange=e=>{state.simplified=e.target.checked;if(simpleGroup)simpleGroup.visible=state.simplified;};
$('label-toggle').onclick=()=>{state.labels=!state.labels;$('label-toggle').setAttribute('aria-pressed',String(state.labels));};
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
canvas.addEventListener('pointerup',e=>{
 if(!data||!assembly||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
 const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
 selected=null;for(const hit of ray.intersectObject(assembly,true)){let o=hit.object;if(!state.simplified&&simpleGroup.getObjectById(o.id))continue;while(o&&o!==assembly){selected=data.parts.find(p=>p.ref===(o.userData.ref||o.name));if(selected)break;o=o.parent;}if(selected)break;}
 $('part').replaceChildren();$('part').hidden=!selected;if(selected){const strong=document.createElement('strong');strong.textContent=`${selected.ref} · ${selected.model}`;const detail=document.createElement('span');detail.textContent=selected.value;$('part').append(strong,detail);}
});
canvas.addEventListener('keydown',e=>{
 if(e.key==='+'||e.key==='=')zoom(.85);else if(e.key==='-')zoom(1.18);else if(e.key.toLowerCase()==='f'||e.key==='0')setView('iso');else if(e.key.startsWith('Arrow')){const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(e.key==='ArrowLeft'||e.key==='ArrowRight'?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0),e.key==='ArrowLeft'||e.key==='ArrowUp'?.15:-.15);camera.position.copy(v.add(controls.target));controls.update();}else return;e.preventDefault();
});
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='fpga-3d-camera')setView(e.data.view);if(e.data?.type==='fpga-3d-labels')$('label-toggle').click();});
window.FPGA_3D={getState:()=>({...state,libraryModels:data?.library_model_count,simplifiedBodies:data?.simplified_body_count,boardSha:data?.board_sha256,camera:camera.position.toArray()}),setView};
function animate(){requestAnimationFrame(animate);controls.update();for(const {p,point,el} of labelEntries){const v=point.clone().project(camera);el.hidden=!state.labels||v.z>1||(p.back?camera.position.y>0:camera.position.y<0);el.style.left=`${(v.x*.5+.5)*stage.clientWidth}px`;el.style.top=`${(-v.y*.5+.5)*stage.clientHeight}px`;}renderer.render(scene,camera);}
resize();setView('iso');load(board);animate();
