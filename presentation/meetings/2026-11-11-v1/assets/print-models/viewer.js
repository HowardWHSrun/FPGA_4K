// Printable actual-size models (4 Nov 2026). GLBs are Z-up millimetres in the KiCad 3D frame
// (X right, Y toward the board's north edge); the root is turned so Z points up on screen.
import * as THREE from 'three';
import {GLTFLoader} from '../overview-3d/vendor/GLTFLoader.js';
import {OrbitControls} from '../overview-3d/vendor/OrbitControls.js';

const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('canvas'),labels=$('labels'),tip=$('tip');
const embedded=document.documentElement.classList.contains('embedded');
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,5000);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xffffff,0x8c9b97,1.9));const sun=new THREE.DirectionalLight(0xffffff,1.7);sun.position.set(60,160,90);scene.add(sun);const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(-120,50,-80);scene.add(fill);
const controls=new OrbitControls(camera,canvas);controls.addEventListener('change',render);
const loader=new GLTFLoader(),cache=new Map();
const root=new THREE.Group();root.rotation.x=-Math.PI/2;scene.add(root);
let data=null,current=null,showDims=true,pickables=[],dimLabels=[],grid=null,boxHelper=null,hovered=null;

function render(){renderer.render(scene,camera);placeLabels()}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render()}
new ResizeObserver(resize).observe(stage);
function loadGLB(url){if(!cache.has(url))cache.set(url,loader.loadAsync(url).then(g=>g.scene));return cache.get(url).then(s=>s.clone(true))}
function tidy(obj){obj.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.side=THREE.DoubleSide;o.material.metalness=0;o.material.roughness=.75}})}

function makeGrid(box){
 const size=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3());
 const span=Math.ceil((Math.max(size.x,size.z)+20)/10)*10,g=new THREE.Group();
 const fine=new THREE.GridHelper(span,span,0xc9d3d3,0xd9e1e1),coarse=new THREE.GridHelper(span,span/10,0x8fa4a6,0x8fa4a6);
 fine.material.transparent=coarse.material.transparent=true;fine.material.opacity=.55;coarse.material.opacity=.9;
 g.add(fine,coarse);g.position.set(Math.round(c.x/10)*10,box.min.y-.02,Math.round(c.z/10)*10);return g}

function dimLabel(text,pos){const el=document.createElement('span');el.textContent=text;labels.appendChild(el);dimLabels.push({el,pos,dim:true});return el}
function placeLabels(){const w=stage.clientWidth,h=stage.clientHeight;for(const l of dimLabels){const v=l.pos.clone().project(camera);const vis=v.z<1&&(l.dim?showDims:true);l.el.style.display=vis?'':'none';l.el.style.left=((v.x+1)/2*w)+'px';l.el.style.top=((1-v.y)/2*h)+'px'}}

async function show(key){
 const m=data.models.find(x=>x.key===key)||data.models[0];current=m;
 document.querySelectorAll('#items button').forEach(b=>b.classList.toggle('active',b.dataset.key===m.key));
 $('m-name').textContent=m.name;$('m-size').textContent=`${m.size.map(v=>v.toFixed(1)).join(' × ')} mm`;$('m-version').textContent=m.version;$('note').textContent=m.note;
 $('dl-stl').href=m.stl;$('dl-step').href=m.step;$('loading').hidden=false;
 const group=new THREE.Group();pickables=[];
 if(m.parts){const objs=await Promise.all(m.parts.map(p=>loadGLB(p.glb)));objs.forEach((o,i)=>{tidy(o);const g=new THREE.Group();g.add(o);g.userData=m.parts[i];group.add(g);pickables.push(g)})}
 else{const o=await loadGLB(m.glb);tidy(o);group.add(o)}
 if(current!==m)return;
 root.clear();root.add(group);labels.textContent='';dimLabels=[];
 if(grid)scene.remove(grid);if(boxHelper)scene.remove(boxHelper);
 root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(group);
 grid=makeGrid(box);scene.add(grid);
 boxHelper=new THREE.Box3Helper(box,0xd08a1c);boxHelper.visible=showDims;scene.add(boxHelper);
 const s=box.getSize(new THREE.Vector3()),mn=box.min,mx=box.max;
 // world X = model X (width), world -Z = model Y (depth), world Y = model Z (height)
 dimLabel(`${s.x.toFixed(1)} mm`,new THREE.Vector3((mn.x+mx.x)/2,mn.y,mx.z));
 dimLabel(`${s.z.toFixed(1)} mm`,new THREE.Vector3(mx.x,mn.y,(mn.z+mx.z)/2));
 dimLabel(`${s.y.toFixed(1)} mm`,new THREE.Vector3(mx.x,(mn.y+mx.y)/2,mn.z));
 $('loading').hidden=true;fit(box);
 if(embedded)parent.postMessage({type:'print-model',key:m.key},location.origin);
}
function fit(box){box=box||new THREE.Box3().setFromObject(root);const c=box.getCenter(new THREE.Vector3()),r=box.getSize(new THREE.Vector3()).length()/2;const d=r/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*1.05;
 camera.position.copy(c).add(new THREE.Vector3(.75,.62,1).normalize().multiplyScalar(d));camera.near=d/100;camera.far=d*20;camera.updateProjectionMatrix();controls.target.copy(c);controls.update();render()}

const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
function pick(e){if(!pickables.length)return null;const r=canvas.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);const hit=ray.intersectObjects(pickables,true)[0];if(!hit)return null;let o=hit.object;while(o&&!pickables.includes(o))o=o.parent;return o}
canvas.addEventListener('pointermove',e=>{const p=pick(e);canvas.classList.toggle('pick',!!p);if(p!==hovered){if(hovered)hovered.traverse(o=>{if(o.isMesh)o.material.emissive?.setHex(0)});hovered=p;if(p)p.traverse(o=>{if(o.isMesh)o.material.emissive?.setHex(0x3a2a00)});render()}
 if(p){tip.hidden=false;tip.textContent=`${p.userData.name} · ${p.userData.sub}`;const r=stage.getBoundingClientRect();tip.style.left=(e.clientX-r.left)+'px';tip.style.top=(e.clientY-r.top)+'px'}else tip.hidden=true});
canvas.addEventListener('pointerleave',()=>{tip.hidden=true});
$('fit').onclick=()=>fit();
$('dims').onclick=()=>{showDims=!showDims;$('dims').setAttribute('aria-pressed',String(showDims));if(boxHelper)boxHelper.visible=showDims;render()};
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;const d=e.data||{};if(d.type==='print-set-model'&&data)show(d.key);if(d.type==='presentation-slide-active'&&d.active)resize()});

data=await (await fetch('models.json?v=20261113-v3')).json();
$('zip').href=data.zip;
let lastGroup='';const items=$('items');
for(const m of data.models){if(m.group!==lastGroup){const g=document.createElement('p');g.className='group';g.textContent=m.group;items.appendChild(g);lastGroup=m.group}
 const b=document.createElement('button');b.dataset.key=m.key;if(m.group.startsWith('Bench'))b.className='bench';b.innerHTML=`<strong></strong><small></small>`;b.querySelector('strong').textContent=m.name;b.querySelector('small').textContent=`${m.size.map(v=>v.toFixed(1)).join(' × ')} mm · ${m.where}`;b.onclick=()=>show(m.key);items.appendChild(b)}
show(new URLSearchParams(location.search).get('model')||'stack');
if(embedded)parent.postMessage({type:'print-hello'},location.origin);
