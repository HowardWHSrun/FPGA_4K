import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const stage=document.querySelector('.carrier-stage'),canvas=document.getElementById('carrier-3d'),status=document.getElementById('image-status');
const asset=new URL('assets/',import.meta.url);
let renderer,scene,camera,controls,promise,frame=0,dirty=true,ready=false,baseDistance=3.8;
let carrier,xem,ldo,guides,geometry,ldoGeometry,assemblyRoot;
const active=()=>stage.dataset.mode==='rotate3d';
function requestDraw(){if(ready&&active()&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
function draw(){frame=0;if(!active()||document.hidden)return;const moving=controls.update();if(dirty||moving){renderer.render(scene,camera);dirty=false;}if(moving)requestDraw();}
function resize(){
  if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const next=3.8*Math.max(1,1/camera.aspect);camera.position.sub(controls.target).multiplyScalar(next/baseDistance).add(controls.target);baseDistance=next;dirty=true;requestDraw();
}
function meshBox(group,size,at,color){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size.map(n=>n/1000)),new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.1}));mesh.position.set(...at.map(n=>n/1000));group.add(mesh);return mesh;}
function label(text,at,width=22){
 const cv=document.createElement('canvas');cv.width=768;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle='#f7fafc';ctx.fillRect(0,0,768,128);ctx.fillStyle='#17384b';ctx.font='500 44px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,64);
 const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:true}));sprite.position.set(...at.map(n=>n/1000));sprite.scale.set(width/1000,width/6000,1);return sprite;
}
function buildAttachment(g){
 const group=new THREE.Group();group.name=g.name||'XEM8305_simplified_nominal_attachment';
 const points=g.outline_mm,shape=new THREE.Shape();shape.moveTo(points[0][0]/1000,-points[0][1]/1000);for(const p of points.slice(1))shape.lineTo(p[0]/1000,-p[1]/1000);shape.closePath();
 for(const hole of g.holes){const path=new THREE.Path();path.absarc(hole.x/1000,-hole.y/1000,hole.diameter/2000,0,Math.PI*2,true);shape.holes.push(path);}
 const board=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:g.thickness_mm/1000,bevelEnabled:false,steps:1,curveSegments:24}),new THREE.MeshStandardMaterial({color:g.board_color||0x1c456d,roughness:.72}));board.rotation.x=-Math.PI/2;board.position.y=g.bottom_mm/1000;group.add(board);
 const mateTop=g.connection_face==='top',mateLevel=mateTop?g.bottom_mm+g.thickness_mm:g.bottom_mm,mateSign=mateTop?1:-1;
 for(const c of g.connectors){
  const angle=c.angle_deg*Math.PI/180,marker=meshBox(group,[c.length_mm,1.2,c.width_mm],[c.x,mateLevel+mateSign*.6,c.y],0x272b31);marker.rotation.y=angle;
  const contact=meshBox(group,[c.length_mm-.8,.15,.65],[c.x,mateLevel+mateSign*1.25,c.y],0xc2a15e);contact.rotation.y=angle;
 }
 group.add(label(g.label||'XEM8305 · reference body',[g.label_x,g.label_z??g.bottom_mm+g.thickness_mm+7,g.label_y],g.label_width||30));
 for(const feature of g.features||[])meshBox(group,feature.size_mm,feature.center_mm,feature.color||0x33363a);
 return group;
}
function updateAssembly(){
 if(!xem)return;const visible=document.getElementById('show-xem').checked,gap=Number(document.getElementById('assembly-gap').value);
 const ldoVisible=document.getElementById('show-ldo').checked;
 carrier.visible=document.getElementById('show-carrier').checked;xem.visible=visible;xem.position.y=gap/1000;ldo.visible=ldoVisible;ldo.position.y=-gap/1000;guides.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});guides.clear();guides.visible=(visible||ldoVisible)&&gap>0;
 if(gap>0)for(const [g,isVisible,startY,endY] of [[geometry,visible,geometry.carrier_top_mm,geometry.bottom_mm+gap],[ldoGeometry,ldoVisible,0,ldoGeometry.bottom_mm+ldoGeometry.thickness_mm-gap]])if(isVisible)for(const c of g.connectors){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(c.x/1000,startY/1000,c.y/1000),new THREE.Vector3(c.x/1000,endY/1000,c.y/1000)]),new THREE.LineDashedMaterial({color:0x8a6e2e,dashSize:.001,gapSize:.001}));line.computeLineDistances();guides.add(line);guides.add(label(c.name,[c.x,(startY+endY)/2,c.y],10));}
 if(active()){const names=[visible?'XEM':null,carrier.visible?'V41 carrier':null,ldoVisible?'LDO':null].filter(Boolean);document.getElementById('view-caption').textContent=names.join(' + ')+(names.length>1?(gap?' · separated '+gap+' mm for inspection':' · nominal seated position'):'');}canvas.dataset.carrierVisible=String(carrier.visible);canvas.dataset.xemVisible=String(visible);canvas.dataset.ldoVisible=String(ldoVisible);canvas.dataset.separationMm=String(gap);dirty=true;requestDraw();
}
export function command(type,value){
 if(!ready)return;
 if(type==='assembly'){updateAssembly();return;}
 if(type==='view'){
  const poses={iso:[1,.55,-1.1],top:[0,1,.001],bottom:[0,-1,.001],side:[1,.08,0]};if(!poses[value])return;
  camera.up.set(0,1,0);controls.target.set(0,0,0);camera.position.fromArray(poses[value]).normalize().multiplyScalar(baseDistance);controls.update();document.querySelectorAll('[data-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pose===value)));
 }else if(type==='zoom'){const direction=camera.position.clone().sub(controls.target),distance=Math.max(controls.minDistance,Math.min(controls.maxDistance,direction.length()*value));direction.setLength(distance);camera.position.copy(controls.target).add(direction);controls.update();}
 dirty=true;requestDraw();
}
async function init(){
 status.textContent='Loading XEM, carrier and LDO attachment…';status.hidden=false;
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.02,50);controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=.6;controls.maxDistance=15;controls.addEventListener('change',()=>{dirty=true;requestDraw();});controls.addEventListener('start',requestDraw);
 scene.add(new THREE.HemisphereLight(0xffffff,0x65758b,2.4));for(const [intensity,p] of [[2.8,[2,4,3]],[2.2,[-3,2,-3]],[2.2,[1,-3,2]]]){const light=new THREE.DirectionalLight(0xffffff,intensity);light.position.fromArray(p);scene.add(light);}
 const [loaded,res,ldoRes]=await Promise.all([new GLTFLoader().loadAsync(new URL('Carrier_V41_Interactive.glb',asset).href),fetch(new URL('XEM_Viewer_Geometry.json',asset)),fetch(new URL('LDO_Viewer_Geometry.json',asset))]);if(!res.ok||!ldoRes.ok)throw new Error('Attachment geometry unavailable');geometry=await res.json();ldoGeometry=await ldoRes.json();
 assemblyRoot=new THREE.Group();carrier=loaded.scene;carrier.name='Carrier_V41_native_public';assemblyRoot.add(carrier);xem=buildAttachment(geometry);assemblyRoot.add(xem);ldo=buildAttachment(ldoGeometry);assemblyRoot.add(ldo);guides=new THREE.Group();assemblyRoot.add(guides);
 assemblyRoot.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(assemblyRoot),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0)throw new Error('Empty assembly');
 assemblyRoot.position.sub(center);const world=new THREE.Group();world.add(assemblyRoot);world.scale.setScalar(2/span);scene.add(world);
 carrier.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=THREE.DoubleSide;m.metalness=Math.min(m.metalness??0,.35);m.roughness=Math.max(m.roughness??.5,.4);}});
 ready=true;canvas.dataset.nativePcbSha256=geometry.source_pcb_sha256;canvas.dataset.componentBodies='82';canvas.dataset.assemblyReady='true';new ResizeObserver(resize).observe(stage);resize();updateAssembly();command('view','iso');if(active())status.hidden=true;
}
export async function open(){if(!promise)promise=init().catch(error=>{promise=null;ready=false;controls?.dispose();renderer?.dispose();throw error;});await promise;resize();updateAssembly();dirty=true;requestDraw();if(active())status.hidden=true;}
stage.addEventListener('carrier-mode',()=>{if(active()){resize();dirty=true;requestDraw();}else if(frame){cancelAnimationFrame(frame);frame=0;}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else requestDraw();});
canvas.addEventListener('keydown',event=>{if(!ready)return;if(['+','=','-','r','R','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='-')command('zoom',1.3);else if(['+','='].includes(event.key))command('zoom',1/1.3);else if(event.key.toLowerCase()==='r')command('view','iso');else{const vector=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(vector);s.theta+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;s.phi=THREE.MathUtils.clamp(s.phi+(event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0),.02,Math.PI-.02);camera.position.setFromSpherical(s).add(controls.target);controls.update();dirty=true;requestDraw();}}});
