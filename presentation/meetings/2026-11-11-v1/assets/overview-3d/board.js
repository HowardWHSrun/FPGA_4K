import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {addPcb5Bodies} from './pcb5.js?v=3';

const boards = {
 hdmi: ['HDMI Extension Board · V37','hdmi-extension-v37.glb','Pre-fab review fixes; nine voltage test holes at J920'],
 frontend: ['Frontend FPGA Board · 8L V3','frontend-8l-v3.glb?v=14l','14 layers · every connection routed'],
 ldo: ['FPGA-LDO Option A · V12','fpga-ldo-a-v12.glb','JLC-checked · vendor connector models · local review'],
 asic: ['ASIC board · PCB-5','asic-pcb5-real.glb','0.8 mm board · Hirose DF40C-80 connectors · two ASIC dies with probes (probe size illustrative)'],
 asic_top: ['ASIC board · top · V4','asic-top-v4.glb','1.6 mm board in the file · Hirose DF40C-80 connectors · two ASIC dies with probes (probe size illustrative)'],
 asic_bottom: ['ASIC board · bottom · V4','asic-bottom-v4.glb','1.6 mm board in the file · Hirose DF40C-80 connectors · two ASIC dies with probes (probe size illustrative)'],
 ldob_router: ['FPGA-LDO Option B · router V2','fpga-ldo-b-router-v2.glb','On the head · J5 (120-pin) has no vendor model yet'],
 ldob_ldo: ['FPGA-LDO Option B · LDO board V2','fpga-ldo-b-ldo-v2.glb','Plug-in board · J5 (120-pin) has no vendor model yet']
};
const views = {iso:[.8,1.1,1.25],top:[0,1,.001],bottom:[0,-1,.001]};
const key = new URLSearchParams(location.search).get('board');
const config = Object.hasOwn(boards,key) ? boards[key] : boards.hdmi;
const [title,filename,detail] = config;
const loading = document.getElementById('loading');
document.title = title;
document.getElementById('title').textContent = title;
document.getElementById('detail').textContent = detail;

async function showBoard(){
 const canvas = document.getElementById('canvas');
 const stage = document.getElementById('stage');
 const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(35,1,.01,10000);
 const controls = new OrbitControls(camera,canvas);
 const render = () => renderer.render(scene,camera);
 controls.addEventListener('change',render);
 scene.add(new THREE.HemisphereLight(0xffffff,0xa6b8c3,2.3));
 for(const position of [[75,120,80],[-45,-90,-60]]){
  const light = new THREE.DirectionalLight(0xffffff,1.8);
  light.position.set(...position);
  scene.add(light);
 }
 const gltf = await new GLTFLoader().loadAsync('assets/'+filename);
 const board = gltf.scene;
 if(key==='asic') addPcb5Bodies(board);
 if(key==='asic_top'||key==='asic_bottom') addPcb5Bodies(board,0.8);
 board.scale.setScalar(1000);
 scene.add(board);
 const bounds = new THREE.Box3().setFromObject(board);
 const sphere = bounds.getBoundingSphere(new THREE.Sphere());
 let activeView = 'iso';
 function fit(view){
  activeView = view;
  const halfFov = THREE.MathUtils.degToRad(camera.fov/2);
  const limiting = Math.min(halfFov,Math.atan(Math.tan(halfFov)*camera.aspect));
  const offset = new THREE.Vector3(...(view==='iso' && key==='ldo' ? [.8,-1.1,1.25] : views[view])).normalize().multiplyScalar(sphere.radius / Math.sin(limiting) * 1.08);
  controls.target.copy(sphere.center);
  camera.position.copy(sphere.center).add(offset);
  controls.update();
  render();
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.view===view)));
 }
 function resize(){
  const {width,height} = stage.getBoundingClientRect();
  if(width<1 || height<1) return;
  renderer.setSize(width,height,false);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  fit(activeView);
 }
 new ResizeObserver(resize).observe(stage);
 document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => fit(button.dataset.view));
 resize();
 loading.hidden = true;
 document.body.dataset.ready = 'true';
}
showBoard().catch(error => {
 loading.textContent = 'Unable to load the 3D model. Open the deck through its local launcher.';
 console.error(error);
});
