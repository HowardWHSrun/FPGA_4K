import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const preview=document.querySelector('[data-preview-model]');
const canvas=preview.querySelector('canvas'),stage=preview.querySelector('.preview-stage'),status=preview.querySelector('[role="status"]'),fallback=preview.querySelector('.preview-fallback');
const state={ready:false,model:preview.dataset.previewModel,view:'iso',zoom:1};
window.reviewPreview=state;
let renderer,controls,camera,model,scene,baseDistance=1,dirty=true;
function setView(view='iso'){
  const poses={iso:[1,.95,1.35],top:[0,1,.001],bottom:[0,-1,.001],side:[1,.03,0]};
  if(!poses[view])return;
  camera.up.set(0,1,0);camera.position.fromArray(poses[view]).normalize().multiplyScalar(baseDistance);controls.target.set(0,0,0);controls.update();state.view=view;state.zoom=1;
  preview.querySelectorAll('[data-preview-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.previewView===view)));dirty=true;
}
function zoom(factor){if(!state.ready)return;camera.position.multiplyScalar(factor);controls.update();state.zoom=baseDistance/camera.position.length();dirty=true;}
async function init(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.001,10000);
    controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.addEventListener('change',()=>{state.camera=camera.position.toArray();dirty=true;});
    scene.add(new THREE.HemisphereLight(0xffffff,0x687c91,2.7));
    for(const [color,intensity,pos] of [[0xfff7ed,3,[2,4,3]],[0xe4efff,2,[-3,2,-3]],[0xffffff,1.7,[1,-3,2]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.fromArray(pos);scene.add(light);}
    const url=new URL(`assets/2026-10-04/${state.model}.glb`,import.meta.url);
    const loaded=await new GLTFLoader().loadAsync(url.href);model=loaded.scene;
    // Center and normalize for inspection without altering the stored source asset.
    model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0)throw new Error('Empty preview');
    const group=new THREE.Group();group.add(model);model.position.sub(center);group.scale.setScalar(2/span);scene.add(group);
    model.traverse(obj=>{if(obj.isMesh){for(const mat of (Array.isArray(obj.material)?obj.material:[obj.material])){mat.side=THREE.DoubleSide;if(mat.opacity>.75){mat.opacity=1;mat.transparent=false;mat.depthWrite=true;}mat.metalness=Math.min(mat.metalness??0,.25);mat.roughness=Math.max(mat.roughness??.6,.45);}}});
    controls.minDistance=1.4;controls.maxDistance=12;state.ready=true;fallback.hidden=true;status.hidden=true;canvas.hidden=false;
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();baseDistance=3.8*Math.max(1,1/camera.aspect);if(state.zoom===1)setView(state.view);dirty=true;}
    new ResizeObserver(resize).observe(stage);resize();setView('iso');
    function render(){requestAnimationFrame(render);controls.update();if(dirty){renderer.render(scene,camera);dirty=false;}}render();
  }catch(error){status.hidden=false;status.textContent='3D preview unavailable here. The dated review image is shown below.';canvas.hidden=true;fallback.hidden=false;console.warn('Review preview:',error.message);}
}
preview.querySelectorAll('[data-preview-view]').forEach(button=>button.addEventListener('click',()=>{if(state.ready)setView(button.dataset.previewView);}));
preview.querySelector('[data-preview-reset]').addEventListener('click',()=>{if(state.ready)setView();});
preview.querySelector('[data-preview-in]').addEventListener('click',()=>zoom(.82));preview.querySelector('[data-preview-out]').addEventListener('click',()=>zoom(1.22));
canvas.addEventListener('keydown',event=>{
  if(!state.ready)return;
  if(event.key==='+'||event.key==='='){zoom(.82);event.preventDefault();}else if(event.key==='-'){zoom(1.22);event.preventDefault();}else if(event.key.toLowerCase()==='r'){setView();event.preventDefault();}
  else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
    const spherical=new THREE.Spherical().setFromVector3(camera.position);if(event.key==='ArrowLeft')spherical.theta-=.15;if(event.key==='ArrowRight')spherical.theta+=.15;if(event.key==='ArrowUp')spherical.phi=Math.max(.03,spherical.phi-.12);if(event.key==='ArrowDown')spherical.phi=Math.min(Math.PI-.03,spherical.phi+.12);camera.position.setFromSpherical(spherical);controls.update();dirty=true;event.preventDefault();
  }
});
init();
