import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const stage=document.querySelector('.carrier-stage'),canvas=document.getElementById('carrier-3d'),status=document.getElementById('image-status');
const asset=new URL('assets/',import.meta.url);
let renderer,scene,camera,controls,promise,frame=0,dirty=true,ready=false,baseDistance=3.8;
let carrier,xem,ldo,asic,probe,asicMate,guides,geometry,ldoGeometry,asicGeometry,assemblyRoot,world;
let currentPose='iso';
const active=()=>stage.dataset.mode==='rotate3d';
function requestDraw(){if(ready&&active()&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
function draw(){frame=0;if(!active()||document.hidden)return;const moving=controls.update();if(dirty||moving){renderer.render(scene,camera);dirty=false;}if(moving)requestDraw();}
function visibleBounds(direction){
 const bounds=new THREE.Box3(),back=direction?.clone()||camera?.position.clone().sub(controls.target)||new THREE.Vector3(1,.55,-1.1);if(back.lengthSq()<1e-10)back.set(1,.55,-1.1);back.normalize();
 const right=new THREE.Vector3().crossVectors(camera?.up||new THREE.Vector3(0,1,0),back).normalize(),up=new THREE.Vector3().crossVectors(back,right).normalize();
 if(world)world.updateMatrixWorld(true);else assemblyRoot?.updateMatrixWorld(true);
 for(const root of [carrier,xem,ldo,asic,probe,asicMate])if(root?.visible)root.traverseVisible(o=>{
  if(o.isSprite){const center=o.getWorldPosition(new THREE.Vector3()),scale=o.getWorldScale(new THREE.Vector3());for(const x of [-.5,.5])for(const y of [-.5,.5])bounds.expandByPoint(center.clone().addScaledVector(right,x*scale.x).addScaledVector(up,y*scale.y));}
  else if(o.isMesh){o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}
 });return bounds;
}
function fitDistance(bounds,direction){
 const center=bounds.getCenter(new THREE.Vector3()),back=direction.clone().normalize();
 const right=new THREE.Vector3().crossVectors(camera.up,back).normalize(),up=new THREE.Vector3().crossVectors(back,right).normalize();
 const tanHalfV=Math.tan(camera.fov*Math.PI/360),tanHalfH=tanHalfV*camera.aspect;let distance=0;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const corner=new THREE.Vector3(x,y,z).sub(center),depth=corner.dot(back);
  distance=Math.max(distance,depth+Math.abs(corner.dot(right))*1.08/tanHalfH,depth+Math.abs(corner.dot(up))*1.08/tanHalfV,depth+camera.near*1.1);
 }
 return distance;
}
function fitPose(value=currentPose){
 const poses={iso:[1,.55,-1.1],top:[0,1,.001],bottom:[0,-1,.001],side:[1,.08,0]};if(!poses[value])return;
 currentPose=value;camera.up.set(0,1,0);const direction=new THREE.Vector3().fromArray(poses[value]).normalize(),bounds=visibleBounds(direction);if(bounds.isEmpty())return;
 controls.target.copy(bounds.getCenter(new THREE.Vector3()));baseDistance=fitDistance(bounds,direction);
 camera.position.copy(direction).multiplyScalar(baseDistance).add(controls.target);controls.update();
 document.querySelectorAll('[data-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pose===value)));
}
function fitCurrentDirection(){
 const direction=camera.position.clone().sub(controls.target).normalize(),bounds=visibleBounds(direction);if(bounds.isEmpty())return;
 controls.target.copy(bounds.getCenter(new THREE.Vector3()));baseDistance=fitDistance(bounds,direction);camera.position.copy(controls.target).addScaledVector(direction,baseDistance);controls.update();dirty=true;requestDraw();
}
function resize(){
 if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 if(ready){const bounds=visibleBounds();if(!bounds.isEmpty()){const next=fitDistance(bounds,camera.position.clone().sub(controls.target).normalize());camera.position.sub(controls.target).multiplyScalar(next/baseDistance).add(controls.target);baseDistance=next;}}
 dirty=true;requestDraw();
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
function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});group.clear();}
function ribbon(group,points,width,color){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p.map(v=>v/1000))));
 const vertices=[],indices=[];const segments=48;
 for(let i=0;i<=segments;i++){const p=curve.getPoint(i/segments);vertices.push(p.x-width/2000,p.y,p.z,p.x+width/2000,p.y,p.z);if(i<segments){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.65,metalness:.16}));group.add(mesh);return mesh;
}
function connectorPreview(group,c,planeY,sign=1){
 const body=meshBox(group,[c.length_mm,1.0,c.width_mm],[c.x,planeY+sign*.5,c.z],0x2b2b29);body.rotation.y=(c.angle_deg||0)*Math.PI/180;
 const contacts=meshBox(group,[c.length_mm-.8,.12,.55],[c.x,planeY+sign*1.03,c.z],0xc5a365);contacts.rotation.y=body.rotation.y;
}
function buildProbe(){
 const group=new THREE.Group();group.name='512_channel_probe_schematic';const p=asicGeometry.probe;
 ribbon(group,p.flex_path_mm,p.flex_width_mm,0xc1953f);
 for(let i=0;i<7;i++){const offset=(i-3)*p.flex_width_mm/9;ribbon(group,p.flex_path_mm.map(v=>[v[0]+offset,v[1]+.035,v[2]]),.045,0xe5d190);}
 const end=p.flex_path_mm.at(-1);meshBox(group,[p.flex_width_mm+1,.65,2],[end[0],end[1],end[2]],0x313738);
 const shape=new THREE.Shape();shape.moveTo(-p.shank_width_mm/2000,0);shape.lineTo(p.shank_width_mm/2000,0);shape.lineTo(.12/1000,p.shank_length_mm/1000);shape.lineTo(0,(p.shank_length_mm+2)/1000);shape.lineTo(-.12/1000,p.shank_length_mm/1000);shape.closePath();
 const shank=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.08/1000,bevelEnabled:false}),new THREE.MeshStandardMaterial({color:0x454c50,metalness:.25,roughness:.55,side:THREE.DoubleSide}));shank.rotation.x=Math.PI/2;shank.position.set(end[0]/1000,end[1]/1000,end[2]/1000);group.add(shank);
 group.add(label('512-channel probe · schematic',[end[0],end[1]-2,end[2]+p.shank_length_mm+5],38));return group;
}
function updateAsicAttachment(gap){
 const a=asicGeometry,showAsic=document.getElementById('show-asic').checked,showProbe=document.getElementById('show-probe').checked;
 asic.visible=showAsic;probe.visible=showAsic&&showProbe;
 const y=(a.board.origin_y_mm+a.board.gap_offset_factor*gap)/1000;
 asic.position.set(a.board.origin_xz_mm[0]/1000,y,a.board.origin_xz_mm[1]/1000);probe.position.copy(asic.position);probe.rotation.copy(asic.rotation);
 disposeGroup(asicMate);asicMate.visible=showAsic&&ldo.visible;
 const from=[a.ldo_interface.x,a.ldo_interface.plane_y_mm-gap,a.ldo_interface.z];
 const port=new THREE.Vector3(...a.asic_interface.position_mm.map(v=>v/1000)).applyEuler(asic.rotation).add(asic.position);const to=port.toArray().map(v=>v*1000);
 if(asicMate.visible){
  connectorPreview(asicMate,a.ldo_interface,from[1],1);
  if(gap>0){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from.map(v=>v/1000)),port]),new THREE.LineDashedMaterial({color:0x8a6e2e,dashSize:.001,gapSize:.0008}));line.computeLineDistances();asicMate.add(line);}
  asicMate.add(label('J2 / J2 · nominal 50-contact mate',[from[0]+11,(from[1]+to[1])/2,from[2]-3],35));
 }
 canvas.dataset.asicVisible=String(showAsic);canvas.dataset.probeVisible=String(probe.visible);canvas.dataset.probeChannels='512';canvas.dataset.asicIllustrationOffsetMm=String(a.board.gap_offset_factor*gap);canvas.dataset.asicInterface='source-referenced nominal 50-contact mating';
}
function updateAssembly(){
 if(!xem)return;const visible=document.getElementById('show-xem').checked,gap=Number(document.getElementById('assembly-gap').value);
 const ldoVisible=document.getElementById('show-ldo').checked;
 carrier.visible=document.getElementById('show-carrier').checked;xem.visible=visible;xem.position.y=gap/1000;ldo.visible=ldoVisible;ldo.position.y=-gap/1000;guides.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});guides.clear();guides.visible=(visible||ldoVisible)&&gap>0;
 if(gap>0)for(const [g,isVisible,startY,endY] of [[geometry,visible,geometry.carrier_top_mm,geometry.bottom_mm+gap],[ldoGeometry,ldoVisible,0,ldoGeometry.bottom_mm+ldoGeometry.thickness_mm-gap]])if(isVisible)for(const c of g.connectors){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(c.x/1000,startY/1000,c.y/1000),new THREE.Vector3(c.x/1000,endY/1000,c.y/1000)]),new THREE.LineDashedMaterial({color:0x8a6e2e,dashSize:.001,gapSize:.001}));line.computeLineDistances();guides.add(line);guides.add(label(c.name,[c.x,(startY+endY)/2,c.y],10));}
 updateAsicAttachment(gap);
 if(active()){const names=[visible?'XEM':null,carrier.visible?'V42 carrier':null,ldoVisible?'LDO':null,asic.visible?'ASIC PCB':null,probe.visible?'512-channel probe':null].filter(Boolean);document.getElementById('view-caption').textContent=names.join(' + ')+(names.length>1?(gap?' · separated '+gap+' mm for inspection':' · nominal seated position'):'');}canvas.dataset.carrierVisible=String(carrier.visible);canvas.dataset.xemVisible=String(visible);canvas.dataset.ldoVisible=String(ldoVisible);canvas.dataset.separationMm=String(gap);canvas.dataset.xemIllustrationOffsetMm=String(xem.position.y*1000);canvas.dataset.ldoIllustrationOffsetMm=String(ldo.position.y*1000);dirty=true;requestDraw();
}
export function command(type,value){
 if(!ready)return;
 if(type==='assembly'){const wasFitted=Math.abs(camera.position.distanceTo(controls.target)/baseDistance-1)<.02;updateAssembly();if(wasFitted)fitCurrentDirection();return;}
 if(type==='view'){fitPose(value); }else if(type==='zoom'){const direction=camera.position.clone().sub(controls.target),distance=Math.max(controls.minDistance,Math.min(controls.maxDistance,direction.length()*value));direction.setLength(distance);camera.position.copy(controls.target).add(direction);controls.update();}
 dirty=true;requestDraw();
}
async function init(){
 status.textContent='Loading carrier, ASIC PCB and 512-channel probe…';status.hidden=false;
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.02,50);controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=.6;controls.maxDistance=15;controls.addEventListener('change',()=>{dirty=true;requestDraw();});controls.addEventListener('start',requestDraw);
 scene.add(new THREE.HemisphereLight(0xffffff,0x65758b,2.4));for(const [intensity,p] of [[2.8,[2,4,3]],[2.2,[-3,2,-3]],[2.2,[1,-3,2]]]){const light=new THREE.DirectionalLight(0xffffff,intensity);light.position.fromArray(p);scene.add(light);}
 const [loaded,res,ldoRes,asicRes]=await Promise.all([new GLTFLoader().loadAsync(new URL('Carrier_V42_Interactive.glb',asset).href),fetch(new URL('XEM_Viewer_Geometry.json',asset)),fetch(new URL('LDO_Viewer_Geometry.json',asset)),fetch(new URL('ASIC_Probe_Assembly_V1.json',asset))]);if(!res.ok||!ldoRes.ok||!asicRes.ok)throw new Error('Attachment geometry unavailable');geometry=await res.json();ldoGeometry=await ldoRes.json();asicGeometry=await asicRes.json();
 const modelResponse=await fetch(new URL(asicGeometry.board.asset,asset));if(!modelResponse.ok)throw new Error('ASIC source board unavailable');const bytes=await modelResponse.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);const hash=[...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');if(hash!==asicGeometry.board.sha256)throw new Error('ASIC source model hash changed');const loadedAsic=await new GLTFLoader().parseAsync(bytes,asset.href);
 assemblyRoot=new THREE.Group();carrier=loaded.scene;carrier.name='Carrier_V42_native_public';assemblyRoot.add(carrier);xem=buildAttachment(geometry);assemblyRoot.add(xem);ldo=buildAttachment(ldoGeometry);assemblyRoot.add(ldo);guides=new THREE.Group();assemblyRoot.add(guides);
 asic=new THREE.Group();asic.name='One_ASIC_source_board_512_interface';const rawAsic=loadedAsic.scene;rawAsic.position.fromArray(asicGeometry.board.asset_translation_mm.map(v=>v/1000));asic.add(rawAsic);asic.rotation.y=asicGeometry.board.rotation_y_deg*Math.PI/180;assemblyRoot.add(asic);
 connectorPreview(asic,{x:0,z:0,length_mm:12.6,width_mm:3.38,angle_deg:0},0,-1);
 for(const feature of asicGeometry.nominal_features||[])meshBox(asic,feature.size_mm,feature.center_mm,feature.color);
 asic.add(label('ASIC PCB · one-ASIC source',[0,asicGeometry.board.thickness_mm+5,7],31));probe=buildProbe();assemblyRoot.add(probe);asicMate=new THREE.Group();assemblyRoot.add(asicMate);updateAssembly();
 assemblyRoot.updateMatrixWorld(true);const bounds=visibleBounds(),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0)throw new Error('Empty assembly');
 assemblyRoot.position.sub(center);world=new THREE.Group();world.add(assemblyRoot);world.scale.setScalar(2/span);scene.add(world);
 carrier.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=THREE.DoubleSide;m.metalness=Math.min(m.metalness??0,.35);m.roughness=Math.max(m.roughness??.5,.4);}});
 ready=true;canvas.dataset.nativePcbSha256=geometry.source_pcb_sha256;canvas.dataset.componentBodies='82';canvas.dataset.asicPcbSha256=asicGeometry.source_pcb_sha256;canvas.dataset.asicModelSha256=asicGeometry.board.sha256;canvas.dataset.assemblyReady='true';new ResizeObserver(resize).observe(stage);resize();updateAssembly();command('view','iso');if(active())status.hidden=true;
}
export function getState(){return{ready,pose:currentPose,sourceASICPCB:asicGeometry?.source_pcb_sha256,probeChannels:512,probeRepresentation:'schematic; no probe CAD',interfaceRepresentation:'source-referenced nominal 50-contact seating; electrical and physical qualification open',visible:{xem:!!xem?.visible,carrier:!!carrier?.visible,ldo:!!ldo?.visible,asic:!!asic?.visible,probe:!!probe?.visible},camera:camera?.position.toArray(),target:controls?.target.toArray(),zoom:camera?baseDistance/camera.position.distanceTo(controls.target):null,bounds:ready?{min:visibleBounds().min.toArray(),max:visibleBounds().max.toArray()}:null};}
export async function open(){if(!promise)promise=init().catch(error=>{promise=null;ready=false;controls?.dispose();renderer?.dispose();throw error;});await promise;resize();updateAssembly();dirty=true;requestDraw();if(active())status.hidden=true;}
stage.addEventListener('carrier-mode',()=>{if(active()){resize();dirty=true;requestDraw();}else if(frame){cancelAnimationFrame(frame);frame=0;}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else requestDraw();});
canvas.addEventListener('keydown',event=>{if(!ready)return;if(['+','=','-','r','R','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='-')command('zoom',1.3);else if(['+','='].includes(event.key))command('zoom',1/1.3);else if(event.key.toLowerCase()==='r')command('view','iso');else{const vector=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(vector);s.theta+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;s.phi=THREE.MathUtils.clamp(s.phi+(event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0),.02,Math.PI-.02);camera.position.setFromSpherical(s).add(controls.target);controls.update();dirty=true;requestDraw();}}});
