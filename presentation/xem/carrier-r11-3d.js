import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const stage=document.querySelector('.carrier-stage'),canvas=document.getElementById('carrier-3d'),status=document.getElementById('image-status');
let renderer,scene,camera,controls,promise,frame=0,dirty=true,ready=false,baseDistance=3.6;
const active=()=>stage.dataset.mode==='rotate3d';
function requestDraw(){if(ready&&active()&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
function draw(){frame=0;if(!active()||document.hidden)return;const moving=controls.update();if(dirty||moving){renderer.render(scene,camera);dirty=false;}if(moving)requestDraw();}
function resize(){
  if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const next=3.6*Math.max(1,1/camera.aspect);camera.position.sub(controls.target).multiplyScalar(next/baseDistance).add(controls.target);baseDistance=next;dirty=true;requestDraw();
}
export function command(type,value){
  if(!ready)return;
  if(type==='view'){
    const poses={iso:[1,-1.35,1.25],top:[0,1,.001],bottom:[0,-1,.001],side:[1,.03,0]};
    if(!poses[value])return;camera.up.set(0,1,0);controls.target.set(0,0,0);camera.position.fromArray(poses[value]).normalize().multiplyScalar(baseDistance);controls.update();
    document.querySelectorAll('[data-pose]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pose===value)));
  }else if(type==='zoom'){
    const direction=camera.position.clone().sub(controls.target),distance=Math.max(controls.minDistance,Math.min(controls.maxDistance,direction.length()*value));direction.setLength(distance);camera.position.copy(controls.target).add(direction);controls.update();
  }
  dirty=true;requestDraw();
}
async function init(){
  status.textContent='Loading rotatable board…';status.hidden=false;
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.02,50);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=.6;controls.maxDistance=15;
  controls.addEventListener('change',()=>{dirty=true;requestDraw();});controls.addEventListener('start',requestDraw);
  scene.add(new THREE.HemisphereLight(0xffffff,0x65758b,2.4));
  for(const [color,intensity,position] of [[0xfff6e8,2.8,[2,4,3]],[0xe5efff,2.2,[-3,2,-3]],[0xffffff,2.2,[1,-3,2]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.fromArray(position);scene.add(light);}
  const loaded=await new GLTFLoader().loadAsync(new URL('assets/2026-10-09/carrier-r11/Carrier_R11_Interactive.glb',import.meta.url).href);
  const model=loaded.scene;model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(span)||span<=0)throw new Error('Empty board geometry');
  const group=new THREE.Group();model.position.sub(center);group.add(model);group.scale.setScalar(2/span);scene.add(group);
  model.traverse(object=>{if(object.isMesh)for(const mat of Array.isArray(object.material)?object.material:[object.material]){mat.side=THREE.DoubleSide;mat.metalness=Math.min(mat.metalness??0,.35);mat.roughness=Math.max(mat.roughness??.5,.4);}});
  ready=true;new ResizeObserver(resize).observe(stage);resize();command('view','iso');
  if(active())status.hidden=true;
}
export async function open(){
  if(!promise)promise=init().catch(error=>{promise=null;ready=false;controls?.dispose();renderer?.dispose();throw error;});
  await promise;resize();dirty=true;requestDraw();if(active())status.hidden=true;
}
stage.addEventListener('carrier-mode',()=>{if(active()){resize();dirty=true;requestDraw();}else if(frame){cancelAnimationFrame(frame);frame=0;}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else requestDraw();});
canvas.addEventListener('keydown',event=>{
  if(!ready)return;
  if(['+','=','-','r','R','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
    event.preventDefault();event.stopPropagation();
    if(event.key==='-')command('zoom',1.3);else if(['+','='].includes(event.key))command('zoom',1/1.3);else if(event.key.toLowerCase()==='r')command('view','iso');
    else{const vector=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(vector);spherical.theta+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;spherical.phi=THREE.MathUtils.clamp(spherical.phi+(event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0),.02,Math.PI-.02);camera.position.setFromSpherical(spherical).add(controls.target);controls.update();dirty=true;requestDraw();}
  }
});
