import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const revision = params.get('revision') === 'r8' ? 'r8' : 'r9';
if (params.get('embed') === '1') document.body.classList.add('embed');
const canvas = $('scene'), stage = $('stage');
const state = {focus:'all', view:'iso', revision, ready:false, officialModels:0, candidateBoard:false};
let renderer;
try {renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}
catch (error) {$('loading').textContent='WebGL is unavailable. The connector route and exact pin table are on the main adapter page.'; throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(37,1,0.1,2000);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=95;controls.maxDistance=900;
scene.add(new THREE.HemisphereLight(0xffffff,0x688498,3));
const key=new THREE.DirectionalLight(0xfff8ec,3.5);key.position.set(-90,180,130);scene.add(key);
const fill=new THREE.DirectionalLight(0xd5eaff,2.2);fill.position.set(160,70,-140);scene.add(fill);
const under=new THREE.DirectionalLight(0xffffff,1.4);under.position.set(10,-80,40);scene.add(under);
const mat={xem:new THREE.MeshStandardMaterial({color:0x345e6b,metalness:.08,roughness:.7}),brk:new THREE.MeshStandardMaterial({color:0x729c8f,metalness:.04,roughness:.76}),adapter:new THREE.MeshStandardMaterial({color:0xb98b4a,metalness:.08,roughness:.7}),fpga:new THREE.MeshStandardMaterial({color:0x487c86,metalness:.04,roughness:.72}),chip:new THREE.MeshStandardMaterial({color:0x1b2d34,metalness:.06,roughness:.67}),gold:new THREE.MeshStandardMaterial({color:0xba9756,metalness:.4,roughness:.45})};
const parts={};
const descriptions={
  xem:['XEM8310 · existing','Artix UltraScale+ module. Its MC3 exposes the three proposed GTY banks; USB is the initial PC link.'],
  adapter:revision==='r9'
    ? ['R9 interposer · partial PCB','Native PCB with three Type-D receptacles, 160 MC1/MC2 contact routes and six GTY pairs. TX1 and control remain open on every cable.']
    : ['R8 interposer · earlier PCB study','Native PCB with three Type-D receptacles, 160 MC1/MC2 contact routes and one GTY pair. Most signal and power paths remain open.'],
  brk:['BRK8310 · existing','Breakout board below the proposed adapter. Its J6 PCIe lanes are unavailable while all three cable links use banks 224 and 225.'],
  fpga1:['FPGA PCB A · bank 226','Separate XC7A25T board and cable J201; two recording pairs active, third physically reserved.'],
  fpga2:['FPGA PCB B · bank 225','Separate XC7A25T board and cable J202; two recording pairs active, third physically reserved.'],
  fpga3:['FPGA PCB C · bank 224','Separate XC7A25T board and cable J203; two recording pairs active, third physically reserved.'],
  receiver:['XEM8310 + proposed adapter + BRK8310','The XEM and BRK are purchased boards. Their model geometry comes from Opal Kelly; the inserted adapter remains a design study.']
};
// The vendor STEP frame places XEM at 180 degrees in-plane over BRK. Their
// centers differ by approximately +34.8 mm X and -3.9 mm scene Z after that
// rotation. Vertical separation below is deliberately exploded, not mated.
const loc={brk:[0,-23,0],adapter:[29.86,2,-3.85],xem:[35,34,-4],fpga1:[-150,0,-86],fpga2:[-150,0,0],fpga3:[-150,0,86]};
const sizes={brk:[167.65,1.6,116.1],xem:[100,1.6,70],adapter:[110,1.6,70],fpga:[36,1.6,38]};
function box(group,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material.clone());m.position.set(x,y,z);group.add(m);return m;}
function fallback(name,group){
  const type=name.startsWith('fpga')?'fpga':name,[w,h,d]=sizes[type];
  box(group,w,h,d,0,0,0,mat[type]);
  if(type==='fpga'){
    box(group,15,1.5,15,1.3,1.55,2,mat.chip);
    box(group,8,2.5,5,w/2-4.5,1.9,0,mat.gold);
  }else if(type==='adapter'){
    for(let i=-1;i<=1;i++)box(group,8,3.2,12,-w/2+5,2,i*22,mat.chip);
    for(const z of [-19,0,19])box(group,44,2,3,9,1.8,z,mat.gold);
  }else if(type==='xem'){
    box(group,37,4,37,0,3,0,mat.chip);
    box(group,10,5,14,w/2-7,3.5,0,mat.gold);
  }else{
    box(group,47,3,13,w/2-29,2,-34,mat.chip);
    box(group,52,.2,3,-12,-1.2,d/2-13,mat.gold);
  }
}
for(const name of Object.keys(loc)){
  const group=new THREE.Group();group.name=name;group.position.fromArray(loc[name]);group.userData.part=name;
  fallback(name,group);scene.add(group);parts[name]=group;
}
const cableGroup=new THREE.Group();scene.add(cableGroup);
const cableColors=[0x4f8e9e,0x8574b2,0xcc8a5a];
for(let i=0;i<3;i++){
  const start=new THREE.Vector3(-127,2,(i-1)*86),end=new THREE.Vector3(-12,3,(i-1)*22);
  const curve=new THREE.CatmullRomCurve3([start,new THREE.Vector3(-91,4,(i-1)*89),new THREE.Vector3(-42,1,(i-1)*30),end]);
  const cable=new THREE.Mesh(new THREE.TubeGeometry(curve,48,1.25,7,false),new THREE.MeshStandardMaterial({color:cableColors[i],roughness:.85}));
  cableGroup.add(cable);
}
const labelData=[['fpga1','FPGA A · 226','fpga'],['fpga2','FPGA B · 225','fpga'],['fpga3','FPGA C · 224','fpga'],['adapter','INTERPOSER · CANDIDATE','adapter'],['xem','XEM8310 · OFFICIAL MODEL','xem'],['brk','BRK8310 · OFFICIAL MODEL','brk']];
const labels=labelData.map(([name,title,kind])=>{const el=document.createElement('span');el.className=`label ${kind}`;el.textContent=title;$('labels').append(el);return{name,el};});
function setDetail(name){const [title,detail]=descriptions[name]||['Three separate cables','Each custom FPGA gets one XEM GTY bank.'];$('selected-info').replaceChildren();const strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=title;span.textContent=detail;$('selected-info').append(strong,span);}
function setFocus(focus){state.focus=focus;const chosen=focus==='fpga'?['fpga1','fpga2','fpga3']:focus==='receiver'?['xem','adapter','brk']:[focus];
  for(const [name,group] of Object.entries(parts)){const active=focus==='all'||chosen.includes(name);group.visible=!(focus==='fpga'||focus==='receiver')||active;group.traverse(obj=>{if(obj.isMesh&&obj.material){const materials=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of materials){if(!m.userData.original){m.userData.original={opacity:m.opacity,transparent:m.transparent};}m.transparent=!active||m.userData.original.transparent;m.opacity=active?m.userData.original.opacity:.22;m.depthWrite=active;}}});}
  cableGroup.visible=focus==='all'||focus==='adapter';
  document.querySelectorAll('[data-focus]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.focus===focus)));
  setDetail(focus==='fpga'?'fpga1':focus==='all'?null:focus);
  const target=focus==='all'?new THREE.Vector3(-45,0,0):focus==='fpga'?new THREE.Vector3(-150,0,0):focus==='receiver'?new THREE.Vector3(18,0,0):parts[focus].position.clone();
  controls.target.copy(target);setView(state.view);
}
function setView(view){state.view=view;const target=controls.target.clone();const range=state.focus==='all'?350:state.focus==='fpga'?245:state.focus==='receiver'?250:state.focus==='brk'?235:165;
  const dir=view==='top'?new THREE.Vector3(.001,1,.001):view==='side'?new THREE.Vector3(-1,.13,.05):new THREE.Vector3(-.8,.6,1);
  camera.up.set(0,1,0);camera.position.copy(target).addScaledVector(dir.normalize(),range);controls.update();
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
}
document.querySelectorAll('[data-focus]').forEach(button=>button.addEventListener('click',()=>setFocus(button.dataset.focus)));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
document.querySelectorAll('[data-revision]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.revision===revision));
  button.addEventListener('click',()=>{
    if(button.dataset.revision===revision)return;
    const next=new URLSearchParams(location.search);
    next.set('revision',button.dataset.revision);
    location.search=next.toString();
  });
});
$('reset').addEventListener('click',()=>{setFocus('all');setView('iso');});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
canvas.addEventListener('pointerdown',event=>{down=[event.clientX,event.clientY];});
canvas.addEventListener('pointerup',event=>{if(!down||Math.hypot(event.clientX-down[0],event.clientY-down[1])>5)return;const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);for(const hit of raycaster.intersectObjects(Object.values(parts),true)){let obj=hit.object;while(obj&&!obj.userData.part)obj=obj.parent;if(obj?.userData.part){const n=obj.userData.part;setFocus(n.startsWith('fpga')?'fpga':n);setDetail(n);break;}}});
canvas.addEventListener('keydown',event=>{if(event.key==='0'){setFocus('all');setView('iso');event.preventDefault();}});
function loadModel(name,spec){if(!spec?.file)return Promise.resolve(false);return new GLTFLoader().loadAsync(spec.file).then(gltf=>{
  const root=gltf.scene;root.scale.setScalar(spec.units_to_mm||1);if(spec.orientation==='cad-z-up')root.rotation.x=-Math.PI/2;
  root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
  if(Math.max(size.x,size.y,size.z)>450||Math.max(size.x,size.y,size.z)<10)throw new Error(`unexpected ${name} model size`);
  const center=bounds.getCenter(new THREE.Vector3());root.position.sub(center);root.updateMatrixWorld(true);
  const group=parts[name];while(group.children.length)group.remove(group.children[0]);
  if(spec.in_plane_rotation_deg)group.rotation.y=THREE.MathUtils.degToRad(spec.in_plane_rotation_deg);
  root.traverse(obj=>{if(obj.isMesh){obj.material=Array.isArray(obj.material)?obj.material.map(m=>m.clone()):obj.material.clone();obj.userData.part=name;}});
  group.add(root);
  if(name==='fpga1'||name==='fpga2'||name==='fpga3'){
    // This library STEP body is missing from the native KiCad export; use the
    // package footprint's 15 x 15 mm body as an explicitly illustrative solid.
    box(group,15,1.4,15,1.3,1.7,2,mat.chip.clone());
  }
  if(name==='xem'||name==='brk')state.officialModels++;
  if(name==='adapter')state.candidateBoard=true;
  return true;
}).catch(error=>{console.warn(`Could not load ${name} model`,error);return false;});}
async function loadAssets(){
  try{
    const response=await fetch('assets/models.json');if(!response.ok)throw new Error('model manifest unavailable');const cfg=await response.json();
    const results=await Promise.all([
      loadModel('xem',cfg.xem),loadModel('brk',cfg.brk),loadModel('adapter',revision==='r8'?cfg.adapter_r8:cfg.adapter),
      ...['fpga1','fpga2','fpga3'].map(name=>loadModel(name,cfg.fpga))
    ]);
    state.ready=true;
    const native25T=results.slice(3).every(Boolean);
    $('loading').hidden=true;
    const routeStatus=revision==='r9'?'R9 partial PCB loaded: six pairs traced; TX1/control open; 109 unconnected, trial-rule DRC clear':'R8 partial PCB loaded: one GTY pair traced; 119 unconnected, conservative-rule DRC open';
    $('geometry-status').textContent=`${state.officialModels===2?'Official XEM and BRK geometry loaded':'XEM / BRK shown as illustrative shells'} · ${state.candidateBoard?routeStatus:'interposer placement shell only'} · ${native25T?'native unrouted 25T placement repeated three times':'FPGA board placement shells shown'} · DF40 interface under redesign; exploded separation and cables illustrative.`;
    document.querySelectorAll('.label.xem,.label.brk').forEach(el=>{if(state.officialModels<2)el.textContent=el.textContent.replace('OFFICIAL MODEL','ILLUSTRATIVE SHELL');});
    if(state.candidateBoard)document.querySelector('.label.adapter').textContent=`INTERPOSER · ${revision.toUpperCase()} PCB STUDY`;
    setFocus(state.focus);
  }catch(error){$('loading').textContent='Model assets could not load; the schematic route remains on the adapter page.';console.warn(error);}
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}
new ResizeObserver(resize).observe(stage);
function animate(){requestAnimationFrame(animate);controls.update();if(document.hidden)return;for(const {name,el} of labels){const pos=parts[name].position.clone();pos.y+=name==='brk'?13:name==='xem'?12:name==='adapter'?9:22;const p=pos.project(camera);el.hidden=!parts[name].visible||p.z>1||p.z<0;el.style.left=`${(p.x*.5+.5)*stage.clientWidth}px`;el.style.top=`${(-p.y*.5+.5)*stage.clientHeight}px`;}renderer.render(scene,camera);}
window.RECEIVER_3D={getState:()=>({...state,position:camera.position.toArray()}),setFocus,setView};
setFocus(['all','fpga','receiver','xem','adapter','brk'].includes(params.get('focus'))?params.get('focus'):'all');resize();animate();loadAssets();
