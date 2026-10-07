import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
window.meetingModels={};
for(const holder of document.querySelectorAll('[data-model]')){
  const stage=holder.querySelector('.viewer'),canvas=stage.querySelector('canvas'),fallback=stage.querySelector('img'),status=stage.querySelector('.status'),load=holder.querySelector('[data-load]');
  const state={ready:false,loading:false,renders:0};window.meetingModels[holder.dataset.model]=state;
  let scene,camera,controls,renderer,baseDistance=4,dirty=true,frame=0,visible=true;
  const isActive=()=>!document.body.classList.contains('presenting')||holder.closest('.slide')?.classList.contains('active');
  function request(){if(state.ready&&visible&&isActive()&&!document.hidden&&!frame)frame=requestAnimationFrame(draw)}
  function draw(){frame=0;if(!state.ready||!visible||!isActive()||document.hidden)return;const moving=controls.update();if(dirty||moving){renderer.render(scene,camera);dirty=false;state.renders++}if(moving)request()}
  function view(name='iso'){const poses={iso:[1,1,1.2],top:[0,1,.001],bottom:[0,-1,.001],side:[1,.08,0]};camera.up.set(0,1,0);camera.position.fromArray(poses[name]).normalize().multiplyScalar(baseDistance);controls.target.set(0,0,0);controls.update();state.view=name;holder.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));dirty=true;request()}
  async function init(){if(state.ready||state.loading)return;state.loading=true;load.disabled=true;status.textContent='Loading the native board model…';try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.02,100);controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.addEventListener('change',()=>{dirty=true;request()});scene.add(new THREE.HemisphereLight(0xffffff,0x77858b,2.5));for(const pos of [[3,4,3],[-3,2,-2],[1,-3,1]]){const light=new THREE.DirectionalLight(0xffffff,2);light.position.fromArray(pos);scene.add(light)}
    const gltf=await new GLTFLoader().loadAsync(holder.dataset.model);const model=gltf.scene;model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0)throw Error('Empty model');const group=new THREE.Group();model.position.sub(center);group.add(model);group.scale.setScalar(2/span);scene.add(group);
    model.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=THREE.DoubleSide;m.metalness=Math.min(m.metalness??0,.25);m.roughness=Math.max(m.roughness??.6,.45)}});
    controls.minDistance=1.5;controls.maxDistance=12;state.ready=true;state.loading=false;fallback.hidden=true;canvas.hidden=false;status.hidden=true;load.hidden=true;
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();baseDistance=3.9*Math.max(1,1/camera.aspect);view(state.view||'iso')}
    new ResizeObserver(resize).observe(stage);resize();view();
  }catch(e){state.loading=false;state.error=e.message;status.textContent='3D could not load. The native KiCad render remains available.';load.disabled=false;load.textContent='Retry 3D';fallback.hidden=false;canvas.hidden=true;renderer?.dispose();controls?.dispose()}}
  load.addEventListener('click',init);holder.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(state.ready)view(b.dataset.view)}));holder.querySelector('[data-reset]').addEventListener('click',()=>{if(state.ready)view()});
  canvas.addEventListener('keydown',e=>{if(!state.ready)return;if(['+','=','-'].includes(e.key)){camera.position.multiplyScalar(e.key==='-'?1.15:.85);controls.update();dirty=true;request();e.preventDefault()}else if(e.key.toLowerCase()==='r'){view();e.preventDefault()}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){const s=new THREE.Spherical().setFromVector3(camera.position);if(e.key==='ArrowLeft')s.theta-=.15;if(e.key==='ArrowRight')s.theta+=.15;if(e.key==='ArrowUp')s.phi=Math.max(.03,s.phi-.12);if(e.key==='ArrowDown')s.phi=Math.min(Math.PI-.03,s.phi+.12);camera.position.setFromSpherical(s);controls.update();dirty=true;request();e.preventDefault()}});
  new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);request()}).observe(stage);document.addEventListener('visibilitychange',request);window.addEventListener('meeting-slide-change',()=>{dirty=true;request()});
}
