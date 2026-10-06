import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const preview=document.querySelector('[data-preview-model]');
const canvas=preview.querySelector('canvas'),stage=preview.querySelector('.preview-stage'),status=preview.querySelector('[role="status"]'),fallback=preview.querySelector('.preview-fallback'),loadButton=preview.querySelector('[data-preview-load]');
const state={ready:false,loading:false,model:preview.dataset.previewModel,view:'iso',zoom:1,renders:0};
window.reviewPreview=state;
const modelPaths={
  'xem8305-direct-r2':'assets/2026-10-05/xem8305-direct/xem8305-direct-r2.glb',
  'fpga35t-r39':'assets/2026-10-05/fpga35t-r39.glb',
  'fpga35t-r37':'assets/2026-10-04/fpga35t-r37.glb',
  'ldo-e5':'assets/2026-10-04/ldo-e5.glb',
  'xem8305-a1r2':'assets/2026-10-04/xem8305-a1r2.glb',
  'bonding-v6':'assets/2026-10-04/bonding-v6.glb'
};
let renderer,controls,camera,model,scene,baseDistance=1,dirty=true,frame=0,inView=true;
function cancelDraw(){if(frame){cancelAnimationFrame(frame);frame=0;}}
function requestDraw(){
  if(state.ready&&inView&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);
}
function draw(){
  frame=0;
  if(!state.ready||!inView||document.hidden)return;
  const moving=controls.update();
  if(dirty||moving){renderer.render(scene,camera);state.renders+=1;state.renderCalls=renderer.info.render.calls;dirty=false;}
  if(moving)requestDraw();
}
function setView(view='iso'){
  const poses={iso:[1,.95,1.35],top:[0,1,.001],bottom:[0,-1,.001],side:[1,.03,0]};
  if(!poses[view])return;
  camera.up.set(0,1,0);camera.position.fromArray(poses[view]).normalize().multiplyScalar(baseDistance);controls.target.set(0,0,0);controls.update();state.view=view;state.zoom=1;
  preview.querySelectorAll('[data-preview-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.previewView===view)));dirty=true;requestDraw();
}
function zoom(factor){if(!state.ready)return;camera.position.multiplyScalar(factor);controls.update();state.zoom=baseDistance/camera.position.length();dirty=true;requestDraw();}
async function init(){
  if(state.ready||state.loading)return;
  state.loading=true;if(loadButton)loadButton.disabled=true;
  status.hidden=false;status.textContent='Loading the current board. You can rotate and zoom once it opens.';
  try{
    if(!modelPaths[state.model])throw new Error('Unknown preview model');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    // The R2 copper/mask layers are micrometres apart. Its normalized span is
    // two units and controls remain 1.4–12 units away; a bounded depth range
    // keeps those real surfaces distinguishable without changing geometry.
    const depthRange=state.model==='xem8305-direct-r2'?[.05,50]:[.001,10000];
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,...depthRange);
    controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;
    controls.addEventListener('change',()=>{state.camera=camera.position.toArray();dirty=true;requestDraw();});
    controls.addEventListener('start',requestDraw);controls.addEventListener('end',requestDraw);
    scene.add(new THREE.HemisphereLight(0xffffff,0x687c91,2.7));
    for(const [color,intensity,pos] of [[0xfff7ed,3,[2,4,3]],[0xe4efff,2,[-3,2,-3]],[0xffffff,1.7,[1,-3,2]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.fromArray(pos);scene.add(light);}
    const url=new URL(modelPaths[state.model],import.meta.url);
    const loaded=await new GLTFLoader().loadAsync(url.href);model=loaded.scene;
    // Center and normalize for inspection without changing the stored CAD-derived asset.
    model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0)throw new Error('Empty preview');
    const group=new THREE.Group();group.add(model);model.position.sub(center);group.scale.setScalar(2/span);scene.add(group);
    model.traverse(obj=>{if(obj.isMesh){for(const mat of (Array.isArray(obj.material)?obj.material:[obj.material])){mat.side=THREE.DoubleSide;if(mat.opacity>.75){mat.opacity=1;mat.transparent=false;mat.depthWrite=true;}mat.metalness=Math.min(mat.metalness??0,.25);mat.roughness=Math.max(mat.roughness??.6,.45);}}});
    controls.minDistance=1.4;controls.maxDistance=12;state.ready=true;state.loading=false;fallback.hidden=true;status.hidden=true;canvas.hidden=false;if(loadButton)loadButton.hidden=true;
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();baseDistance=3.8*Math.max(1,1/camera.aspect);if(state.zoom===1)setView(state.view);dirty=true;requestDraw();}
    new ResizeObserver(resize).observe(stage);resize();setView('iso');
  }catch(error){
    state.loading=false;status.hidden=false;status.textContent='3D preview unavailable here. The dated review image is shown below.';canvas.hidden=true;fallback.hidden=false;if(loadButton){loadButton.disabled=false;loadButton.textContent='Retry 3D view';}controls?.dispose();renderer?.dispose();console.warn('Review preview:',error.message);
  }
}
new IntersectionObserver(entries=>{inView=entries.some(entry=>entry.isIntersecting);if(inView){dirty=true;requestDraw();}else cancelDraw();}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelDraw();else{dirty=true;requestDraw();}});
preview.querySelectorAll('[data-preview-view]').forEach(button=>button.addEventListener('click',()=>{if(state.ready)setView(button.dataset.previewView);}));
preview.querySelector('[data-preview-reset]').addEventListener('click',()=>{if(state.ready)setView();});
preview.querySelector('[data-preview-in]').addEventListener('click',()=>zoom(.82));preview.querySelector('[data-preview-out]').addEventListener('click',()=>zoom(1.22));
canvas.addEventListener('keydown',event=>{
  if(!state.ready)return;
  if(event.key==='+'||event.key==='='){zoom(.82);event.preventDefault();}else if(event.key==='-'){zoom(1.22);event.preventDefault();}else if(event.key.toLowerCase()==='r'){setView();event.preventDefault();}
  else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
    const spherical=new THREE.Spherical().setFromVector3(camera.position);if(event.key==='ArrowLeft')spherical.theta-=.15;if(event.key==='ArrowRight')spherical.theta+=.15;if(event.key==='ArrowUp')spherical.phi=Math.max(.03,spherical.phi-.12);if(event.key==='ArrowDown')spherical.phi=Math.min(Math.PI-.03,spherical.phi+.12);camera.position.setFromSpherical(spherical);controls.update();dirty=true;requestDraw();event.preventDefault();
  }
});
if(loadButton)loadButton.addEventListener('click',init);else init();
