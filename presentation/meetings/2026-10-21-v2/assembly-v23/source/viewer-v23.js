import * as THREE from 'three';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {OrbitControls} from '../vendor/OrbitControls.js';
import {createSheepHead} from './sheep-head-v23.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('canvas'),labels=$('labels');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance',logarithmicDepthBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.setClearColor(0,0);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.05,5000);
camera.position.set(320,260,410);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.minDistance=.3;controls.maxDistance=1800;controls.zoomSpeed=.9;controls.addEventListener('change',render);
scene.add(new THREE.HemisphereLight(0xffffff,0x777269,1.6));
for(const [x,y,z,intensity] of [[100,250,160,2.1],[-120,80,-180,.9]]){const l=new THREE.DirectionalLight(0xffffff,intensity);l.position.set(x,y,z);scene.add(l);}
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mask=mat(0x21694c,.5),fiber=mat(0xa8a477,.9),silicon=mat(0x4a4f5b,.4,.2),gold=mat(0xc7a057,.3,.6),plastic=mat(0x17191b,.8),metal=mat(0xb5bfc2,.35,.65);
const headMats={};for(const n of ['skin','wool','innerEar','eye','iris','nose','skull','brain','visual','portRim'])headMats[n]=mat(0);
headMats.skin.color.setRGB(.029926,.029926,.029926);headMats.wool.color.setRGB(.64,.64,.64);
headMats.innerEar.color.set(0x715b59);headMats.eye.color.set(0x11100f);headMats.iris.color.set(0x685138);headMats.nose.color.set(0x262321);headMats.skull.color.set(0xd7cbb0);headMats.brain.color.set(0xc49b98);headMats.visual.color.set(0xbd8885);headMats.portRim.color.set(0xc1b397);
headMats.visual.transparent=true;headMats.visual.opacity=.3;headMats.visual.depthWrite=false;
const head=createSheepHead(THREE,headMats);scene.add(head.group);
const module=new THREE.Group(),host=new THREE.Group(),originalAsic=new THREE.Group();scene.add(module,host,originalAsic);host.position.set(-275,-35,-65);originalAsic.visible=false;head.group.visible=false;
const boardGroups={},boardModels={},pickables=[];const linkLines=new THREE.Group(),support=new THREE.Group(),marks=new THREE.Group(),partProxy=new THREE.Group();scene.add(linkLines,support,marks,partProxy);partProxy.matrixAutoUpdate=false;let proxySource=null,proxyMeshes=[];
const cableMaterial=mat(0x141618,.9);cableMaterial.transparent=true;const guideMat=new THREE.LineDashedMaterial({color:0x5f8c95,dashSize:1,gapSize:.65,transparent:true,opacity:.7});const probeGuideMat=guideMat.clone();
const sketchMat=new THREE.LineBasicMaterial({color:0x2b4c6b,depthTest:false}),measureMat=mat(sketchMat.color);
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let native,asic,hostMeta,interposerSource,fpgaCoverage,progress=0,focusKey='scene',tracked=null,trackedRotation=null,selectedPart=null,ready=false,needsViewportFit=false,playing=false,playStart=0,playFrom=0,rafId=0,strokes=[],measure=[],gesture=null,assemblyCurve=null,isolationPreference=null,outsideGuides=0;
const names={scene:'All electronics',module:'Head electronics',1:'ASIC 1 concept',2:'ASIC 2 concept',3:'ASIC 3 concept',4:'ASIC 4 concept',LDO:'LDO V13',FPGA:'FPGA V60',host:'XEM host assembly',xem:'XEM8305',interposer:'Interposer V20',brk:'BRK8305','asic-reference':'Original ASIC source PCB'};
const scopes={FPGA:'Exact V60 native board and 142 native component bodies plus two nominal DF40 connector previews. TP1–TP13 are copper-only. Packages include nominal and manufacturer-derived geometry. V60 remains partially routed.',LDO:'Detailed V13 component export with independently generated connector previews at the native footprint centers. RN250/RN450 have no assigned body model. Other drawing-derived packages remain nominal.',host:'Official BRK8305 and XEM8305 geometry with the current V20 native interposer. The middle board has its own assembly step. V20 has 20 stock body models plus six nominal connector previews; 22 packaged parts have no assigned body, including J1.',xem:'Full preserved official XEM8305 source geometry and original material colors.',brk:'Full preserved official BRK8305 source geometry. Source omissions, including some unmodeled headers, remain.',interposer:'V20 native board, routed copper, 20 stock bodies and six nominal connector previews and current six stack connectors. 22 packaged source bodies are absent, including Yamaichi J1; pads and silkscreen remain. The cable endpoint is schematic at J1’s footprint, not a measured opening. Manufacturing and hardware qualification remain open.','asic-reference':'Original PCB-5 source for inspection: original parts/copper are shown. ASIC dies have no source body model. J3 is a nominal connector preview. This original populated board is not substituted into the proposed stack.'};
const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);},phase=(p,a,b)=>smooth((p-a)/(b-a));
const getJSON=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p+' '+r.status);return r.json();};
const loader=new GLTFLoader();let loaded=0,plannedModels=13;const uiControls=[...document.querySelectorAll('button,select,input')];uiControls.forEach(e=>e.disabled=true);
// Preserve every native triangle, material and reference while combining CAD face primitives.
function compactNativeModel(source){
 source.updateMatrixWorld(true);const output=new THREE.Group(),container=source.children.length===1?source.children[0]:source;
 for(const nativePart of container.children){const group=new THREE.Group();group.name=nativePart.name;const batches=new Map();nativePart.traverse(node=>{if(!node.isMesh)return;const materials=Array.isArray(node.material)?node.material:[node.material];if(materials.length!==1)throw new Error('Unexpected multi-material native primitive');const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld),material=materials[0],key=material.uuid+'|'+Object.keys(geometry.attributes).sort().join(',')+'|'+Boolean(geometry.index);if(!batches.has(key))batches.set(key,{material,geometries:[]});batches.get(key).geometries.push(geometry);});for(const {material,geometries}of batches.values()){const geometry=geometries.length===1?geometries[0]:mergeGeometries(geometries,false);if(!geometry)throw new Error('Native component geometry could not be combined');const mesh=new THREE.Mesh(geometry,material);mesh.name=nativePart.name;group.add(mesh);}output.add(group);}return output;
}
async function loadModel(file,key,parent,scale,position,rotationX=0){
  const gltf=await loader.loadAsync(file),model=['FPGA','interposer'].includes(key)?compactNativeModel(gltf.scene):gltf.scene;model.scale.setScalar(scale);model.position.set(...position);model.rotation.x=rotationX;parent.add(model);boardModels[key]=model;
  const meta=hostMeta?.boards?.[key]?.nodes;const overrides=(key==='interposer'&&!hostMeta.boards.interposer.asset.includes('v4'))?{}:({brk:{108:'MC1',109:'MC2',110:'MC3'},xem:{203:'MC2',204:'MC3',434:'MC1'},interposer:{5:'JX2',12:'JX3',32:'JX1',132:'JB3',136:'JB1',141:'JB2'}})[key]||{};
  model.traverse(o=>{o.userData.owner=key;const nodeIndex=gltf.parser.associations.get(o)?.nodes;o.userData.sourceRef=overrides[nodeIndex]||meta?.find(v=>v.node===nodeIndex)?.component_reference;if(o.isMesh){o.userData.sourceNode=nodeIndex;let n=o;const nodes=[];while(n&&n!==model){const a=gltf.parser.associations.get(n)?.nodes;if(a!==undefined){nodes.push(a);const record=meta?.find(v=>v.node===a);const displayRef=overrides[a]||record?.component_reference;if(displayRef&&(!o.userData.partName||overrides[a]))o.userData.partName=displayRef;if(record?.prototype&&!o.userData.prototype)o.userData.prototype=record.prototype;}n=n.parent;}
    // Appearance corrections are scoped to source material/node identities.
    // Geometry, land patterns and component placements remain untouched.
    const materials=Array.isArray(o.material)?o.material:[o.material];
    const finished=materials.map(m=>{
      const mi=gltf.parser.associations.get(m)?.materials,raw=gltf.parser.json.materials?.[mi];
      const brkMask=key==='brk'&&nodes.some(i=>[3,4,5].includes(i))&&[2,3].includes(mi);
      const inferredMetal=key==='interposer'&&raw?.pbrMetallicRoughness?.metallicFactor===undefined;
      if(!brkMask&&!inferredMetal&&m.opacity>=1)return m;
      const c=m.clone();
      if(brkMask){c.color.set(0x21694c);c.roughness=.65;c.metalness=0;}
      else if(inferredMetal){c.metalness=.05;c.roughness=.65;}
      if(m.opacity<1){c.opacity=1;c.transparent=false;c.depthWrite=true;if(m.color.g>m.color.r*1.5&&m.color.g>m.color.b*1.2){c.color.set(0x21694c);c.roughness=.65;c.metalness=0;}}
      return c;
    });o.material=Array.isArray(o.material)?finished:finished[0];
    pickables.push(o);}});
  loaded++;$('loading').textContent=`Detailed CAD models ${loaded}/${plannedModels}`;return model;
}
async function loadConnector(file){const gltf=await loader.loadAsync(file);loaded++;$('loading').textContent=`Detailed CAD models ${loaded}/${plannedModels}`;return gltf.scene;}
function attachConnector(template,owner,ref,position,rotation=[0,0,0],parent=boardGroups[owner]){const g=template.clone(true);g.name=ref;g.position.set(...position);g.rotation.set(...rotation);g.userData.partRoot=true;parent.add(g);g.traverse(o=>{o.userData.owner=owner;o.userData.partName=ref;if(o.isMesh)pickables.push(o);});return g;}
function addBox(parent,pos,size,material,owner){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),material);o.position.set(...pos);o.userData.owner=owner;parent.add(o);if(owner)pickables.push(o);return o;}
function conceptAsic(id){
  const g=new THREE.Group();module.add(g);boardGroups[id]=g;g.userData.owner=id;
  const shape=new THREE.Shape();asic.outline.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:1.6,bevelEnabled:false,steps:1});geometry.rotateX(-Math.PI/2);geometry.translate(0,-.8,0);
  const pcb=new THREE.Mesh(geometry,[mask,fiber]);pcb.userData.owner=id;g.add(pcb);pickables.push(pcb);
  const pads=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),gold,asic.asicPads.length),matrix=new THREE.Matrix4();
  asic.asicPads.forEach((p,i)=>{matrix.compose(new THREE.Vector3(p[0],.825,p[1]),new THREE.Quaternion(),new THREE.Vector3(p[2],.04,p[3]));pads.setMatrixAt(i,matrix);});pads.userData.owner=id;g.add(pads);pickables.push(pads);
  for(const r of asic.asicRegions)addBox(g,[(r[0]+r[2])/2,.805,(r[1]+r[3])/2],[r[2]-r[0],.015,r[3]-r[1]],silicon,id);
  return g;
}
const showSheep=()=>$('sheep').checked;
const assemblyProgress=()=>Math.min(100,progress/(showSheep()?.88:1));
const hostOffsets=p=>({lower:38*(1-phase(p,48,64)),upper:40*(1-phase(p,64,80))});
function phaseName(){
  const p=assemblyProgress();
  if(showSheep()&&progress>88)return progress<99.9?'Module approaches schematic head position':'On-head assembly concept';
  return p<.1?'Separate electronics':p<18?'Connect the two ASIC pairs':p<34?'Mate ASIC pairs to the middle LDO':p<48?'Mate FPGA through two 60-contact pairs':p<64?'Seat interposer onto BRK8305':p<80?'Seat XEM8305 onto interposer':p<99.9?'Connect FPGA cable to interposer':'Electronics assembled';
}
function updateMilestones(){
  names.scene=showSheep()?'Electronics + sheep':'All electronics';$('focus').options[0].textContent=names.scene;
  $('head-milestone').hidden=!showSheep();$('cutaway').disabled=!showSheep();
  document.querySelectorAll('[data-stage]').forEach(b=>{b.dataset.progress=+b.dataset.stage*(showSheep()?.88:1);b.classList.toggle('active',Math.abs(progress-+b.dataset.progress)<.1);});
  $('head-milestone').classList.toggle('active',showSheep()&&Math.abs(progress-100)<.1);
}
function moduleTarget(){const port=native.ldo.footprints.find(p=>p.reference==='J301').position_xz_mm;return head.mountAnchor.clone().add(new THREE.Vector3(0,port[1]+5.8+asic.asicSize[1]/2+8,0));}
function updatePose(){
  if(!ready)return;const oldAnchor=tracked?.clone(),oldRotation=trackedRotation?.clone();
  const p=assemblyProgress();const g12=3+16*(1-phase(p,0,18)),g34=3+16*(1-phase(p,2,18)),g2L=3+15*(1-phase(p,18,34)),gL3=3+15*(1-phase(p,20,34)),gFL=1.5+21*(1-phase(p,34,48));
  boardGroups.LDO.position.y=0;boardGroups['2'].position.y=-(1.3+g2L);boardGroups['1'].position.y=boardGroups['2'].position.y-1.6-g12;boardGroups['3'].position.y=1.3+gL3;boardGroups['4'].position.y=boardGroups['3'].position.y+1.6+g34;boardGroups.FPGA.position.y=1.31+gFL;
  const {lower,upper}=hostOffsets(p);boardGroups.brk.position.y=0;boardGroups.interposer.position.y=lower;boardGroups.xem.position.y=lower+upper;
  const approach=showSheep()?phase(progress,88,100):0;module.position.lerpVectors(new THREE.Vector3(-115,5,15),moduleTarget(),approach);module.quaternion.slerpQuaternions(new THREE.Quaternion(),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2),approach);
  scene.updateMatrixWorld(true);updateCable(p);updateSupport(approach);applyVisibility();
  const focusObject=selectedPart?.object||getFocusObject(focusKey);
  if(focusKey!=='scene'&&focusObject){tracked=new THREE.Box3().setFromObject(focusObject).getCenter(new THREE.Vector3());trackedRotation=focusObject.getWorldQuaternion(new THREE.Quaternion());if(oldAnchor){const rotation=oldRotation?trackedRotation.clone().multiply(oldRotation.invert()):new THREE.Quaternion();camera.position.sub(oldAnchor).applyQuaternion(rotation).add(tracked);controls.target.sub(oldAnchor).applyQuaternion(rotation).add(tracked);camera.lookAt(controls.target);}}
  $('progress').value=progress;$('progress-value').textContent=progress.toFixed(1)+'%';const phaseText=phaseName();if($('phase').textContent!==phaseText)$('phase').textContent=phaseText;
  updateMilestones();$('gap-status').textContent=`Nominal host PCB gaps · BRK ↔ interposer ${(5+lower).toFixed(1)} mm · interposer ↔ XEM ${(5+upper).toFixed(1)} mm`;render();
}
function disposeGroup(group){for(const o of [...group.children]){group.remove(o);o.geometry?.dispose();}}
function updateCable(p){
  disposeGroup(linkLines);const t=phase(p,80,100);if(t<.005)return;
  // Opening plane measured from the saved Molex J3 mesh, not the footprint origin.
  const from=boardGroups.FPGA.localToWorld(new THREE.Vector3(-.5,2.30,-13.37));
  const fromDir=new THREE.Vector3(0,0,-1).applyQuaternion(boardGroups.FPGA.getWorldQuaternion(new THREE.Quaternion()));
  const end=boardGroups.interposer.localToWorld(new THREE.Vector3(...interposerSource.cable_port.board_local_anchor_xyz_mm));
  const outDir=new THREE.Vector3(...interposerSource.cable_port.exit_direction_xyz).applyQuaternion(boardGroups.interposer.getWorldQuaternion(new THREE.Quaternion()));
  const mid=from.clone().lerp(end,.5);mid.y=Math.max(from.y,end.y)+48;
  assemblyCurve=new THREE.CatmullRomCurve3([from,from.clone().addScaledVector(fromDir,10),mid,end.clone().addScaledVector(outDir,12),end]);
  cableMaterial.opacity=t;linkLines.add(new THREE.Mesh(new THREE.TubeGeometry(assemblyCurve,88,.95,8,false),cableMaterial));
}
function updateSupport(t){
  disposeGroup(support);outsideGuides=0;if(t<.01)return;const a=head.mountAnchor,y0=a.y+4,y1=moduleTarget().y+35;const supportOpacity=smooth(t/.25);metal.transparent=true;metal.opacity=supportOpacity;guideMat.opacity=.7*supportOpacity;
  for(const x of [-17,17])for(const z of [-15,15]){const curve=new THREE.LineCurve3(new THREE.Vector3(a.x+x,y0,a.z+z),new THREE.Vector3(a.x+x,y1,a.z+z));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,1,.5,6,false),metal);support.add(o);}
  for(const y of [y0,y1]){const points=[[-17,-15],[17,-15],[17,15],[-17,15],[-17,-15]].map(([x,z])=>new THREE.Vector3(a.x+x,y,a.z+z));support.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),guideMat));}
  probeGuideMat.opacity=.7*smooth((t-.8)/.2);if(t>.8)for(const id of ['1','2','3','4']){const b=boardGroups[id],from=b.localToWorld(new THREE.Vector3(0,0,asic.asicSize[1]/2));const direction=new THREE.Vector3(0,0,1).applyQuaternion(module.quaternion);let length=18;const outside=((from.x-a.x)/18)**2+((from.z-a.z)/16)**2>1;if(outside){outsideGuides++;if(direction.y<0)length=Math.min(length,Math.max(0,(from.y-a.y-2)/-direction.y));}const target=from.clone().addScaledVector(direction,length);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([from,target]),probeGuideMat);line.computeLineDistances();support.add(line);}
}
function getFocusObject(key){return key==='module'?module:key==='host'?host:key==='asic-reference'?originalAsic:boardGroups[key];}
function applyVisibility(){
  const isolated=$('isolate').checked&&focusKey!=='scene';
  const componentOnly=isolated&&proxySource;
  head.group.visible=showSheep()&&!isolated;support.visible=showSheep()&&!isolated;linkLines.visible=!isolated;
  module.visible=!isolated||focusKey==='module'||['1','2','3','4','LDO','FPGA'].includes(focusKey);
  for(const key of ['1','2','3','4','LDO','FPGA'])if(boardGroups[key])boardGroups[key].visible=!isolated||focusKey==='module'||key===focusKey;
  host.visible=!isolated||['host','xem','brk','interposer'].includes(focusKey);
  for(const key of ['brk','interposer','xem'])if(boardGroups[key])boardGroups[key].visible=!isolated||focusKey==='host'||key===focusKey;
  originalAsic.visible=focusKey==='asic-reference';
  partProxy.visible=!!componentOnly;if(componentOnly){module.visible=false;host.visible=false;originalAsic.visible=false;}
}
function rebuildPartProxy(part){
  for(const child of [...partProxy.children])partProxy.remove(child);proxyMeshes=[];proxySource=null;
  if(!part||!/^(?:U|R|C|D|Q|J[XB]?|JP|L|Y|RN|MC)\d|^Proposed/.test(part.name))return;
  proxySource=part.object;const clone=part.object.clone(true),sourceMeshes=[];part.object.traverse(o=>{if(o.isMesh)sourceMeshes.push(o);});let i=0;clone.traverse(o=>{if(o.isMesh){o.userData.proxySource=sourceMeshes[i++];proxyMeshes.push(o);}});partProxy.add(clone);updatePartProxy();
}
function updatePartProxy(){if(proxySource?.parent){partProxy.matrix.copy(proxySource.parent.matrixWorld);partProxy.matrixWorldNeedsUpdate=true;}}
function sceneBoxes(){
  const boxes=[host,module].map(o=>new THREE.Box3().setFromObject(o));
  if(showSheep()){boxes.push(new THREE.Box3().setFromObject(head.group));const p=moduleTarget();boxes.push(new THREE.Box3(p.clone().add(new THREE.Vector3(-32,-20,-35)),p.clone().add(new THREE.Vector3(32,50,35))));}
  return boxes;
}
function sceneBounds(){return sceneBoxes().reduce((all,b)=>all.union(b),new THREE.Box3());}
function frameObject(obj,forceDirection=false){
  if(stage.clientWidth<1||stage.clientHeight<1){needsViewportFit=true;return;}
  const box=obj?new THREE.Box3().setFromObject(obj):sceneBounds();if(box.isEmpty())return;
  const center=box.getCenter(new THREE.Vector3()),aspect=stage.clientWidth/stage.clientHeight;
  let dir=camera.position.clone().sub(controls.target).normalize();if(forceDirection)dir.set(-.65,.58,1).normalize();
  const right=new THREE.Vector3(0,1,0).cross(dir).normalize(),up=dir.clone().cross(right).normalize(),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=2;
  for(const b of obj?[box]:sceneBoxes())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z).sub(center);distance=Math.max(distance,Math.abs(p.dot(right))/(tan*aspect)+p.dot(dir),Math.abs(p.dot(up))/tan+p.dot(dir));}
  controls.target.copy(center);camera.position.copy(center).addScaledVector(dir,distance*1.15);camera.updateProjectionMatrix();controls.update();tracked=focusKey==='scene'?null:center.clone();trackedRotation=focusKey==='scene'?null:(selectedPart?.object||getFocusObject(focusKey))?.getWorldQuaternion(new THREE.Quaternion());render();
}
function focus(key,part=null,persist=true,frame=true){
  focusKey=key;selectedPart=part;$('focus').value=key;originalAsic.visible=key==='asic-reference';
  rebuildPartProxy(part);
  $('flip').disabled=key==='scene';
  if(frame)$('isolate').checked=key!=='scene'&&(isolationPreference??true);applyVisibility();
  $('selected-title').textContent=part?`${names[key]} · ${part.name}`:names[key];
  $('selected-detail').textContent=scopes[key]||(['1','2','3','4'].includes(key)?'Proposed stacking ASIC revision: original outline/pad geometry, nominal connector previews and schematic die regions. Original source PCB is available separately under Inspect; its J1/capacitor placement does not fit this redesign.':'Select any board or part; timeline progress is preserved while inspecting.');
  if(part)$('selected-detail').textContent+=' Double-click or use Fit view for a component close-up.';
  if(frame)frameObject(part?.object||getFocusObject(key),true);else{tracked=new THREE.Box3().setFromObject(part?.object||getFocusObject(key)).getCenter(new THREE.Vector3());trackedRotation=(part?.object||getFocusObject(key)).getWorldQuaternion(new THREE.Quaternion());render();}if(persist)save();
}
function updateClipping(){
  if(!ready)return;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  const roots=partProxy.visible?[partProxy]:[...Object.values(boardGroups).filter(visible),...(head.group.visible?[head.group]:[]),...(originalAsic.visible?[originalAsic]:[]),...(linkLines.visible?[linkLines]:[])];
  let nearest=Infinity,farthest=1;
  for(const o of roots){const b=new THREE.Box3().setFromObject(o);if(b.isEmpty())continue;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const depth=-new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse).z;nearest=Math.min(nearest,depth);farthest=Math.max(farthest,depth);}}
  const d=camera.position.distanceTo(controls.target);camera.near=Math.max(.005,nearest>0?Math.min(nearest*.25,d*.5):d/5000);camera.far=Math.max(camera.near*10,farthest*1.3,d*2,20);camera.updateProjectionMatrix();
}
function render(){if(!renderer||stage.clientWidth<1||stage.clientHeight<1)return;updatePartProxy();updateClipping();renderer.render(scene,camera);if(ready)drawLabels();}
function svg(name,attrs,text){const o=document.createElementNS('http://www.w3.org/2000/svg',name);for(const[k,v]of Object.entries(attrs))o.setAttribute(k,v);if(text)o.textContent=text;labels.appendChild(o);return o;}
function drawLabels(){
  labels.replaceChildren();const w=stage.clientWidth,h=stage.clientHeight;labels.setAttribute('viewBox',`0 0 ${w} ${h}`);
  if(focusKey==='scene'){for(const [key,title,x,y] of [['module','ASICs / LDO / FPGA',w-160,27],['host','XEM / interposer / BRK',14,h-25]]){const p=new THREE.Box3().setFromObject(getFocusObject(key)).getCenter(new THREE.Vector3()).project(camera);svg('line',{x1:(p.x+1)*w/2,y1:(1-p.y)*h/2,x2:x,y2:y+5});svg('text',{x,y},title);}}
  else if(focusKey==='host'&&!selectedPart){
    svg('text',{x:14,y:25},'BRK8305 → interposer → XEM8305');
    for(const [key,text,y] of [['xem','XEM8305',55],['interposer','Interposer',82],['brk','BRK8305',109]]){const p=new THREE.Box3().setFromObject(boardGroups[key]).getCenter(new THREE.Vector3()).project(camera);svg('line',{x1:(p.x+1)*w/2,y1:(1-p.y)*h/2,x2:w-118,y2:y});svg('text',{x:w-112,y},text);}
  }else svg('text',{x:14,y:25},$('selected-title').textContent);
  if(measure.length===2)svg('text',{x:14,y:h-20},'Scene distance '+new THREE.Vector3(...measure[0]).distanceTo(new THREE.Vector3(...measure[1])).toFixed(2)+' mm');
}
function pause(){playing=false;if(rafId)cancelAnimationFrame(rafId);rafId=0;$('play').textContent='Play sequence';}
function tick(now){rafId=0;if(!playing)return;progress=Math.min(100,playFrom+(now-playStart)/260);updatePose();if(progress<100)rafId=requestAnimationFrame(tick);else{pause();save();}}
function save(){try{localStorage.setItem('assembly-meeting-v2-state',JSON.stringify({progress,focus:focusKey,isolate:$('isolate').checked,isolationPreference,cutaway:$('cutaway').checked,sheep:showSheep(),camera:camera.position.toArray(),target:controls.target.toArray(),viewportAspect:camera.aspect,strokes:strokes.slice(-10),measure}));}catch{}}
function setPointer(e){const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function hit(e){setPointer(e);const h=ray.intersectObjects(pickables.filter(visible).concat(partProxy.visible?proxyMeshes:[]),false)[0];if(h?.object.userData.proxySource)h.object=h.object.userData.proxySource;return h;}
function surface(e){const h=hit(e);if(h)return h.point.clone();return ray.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),controls.target),new THREE.Vector3());}
function partFromHit(h){let o=h.object,owner=o.userData.owner,name=o.userData.partName||o.name;let candidate=o;for(let p=o.parent;p&&p!==boardModels[owner];p=p.parent){if(p.userData.owner!==owner)break;if(p.userData.partRoot){candidate=p;name=p.name;}else if(p.userData.sourceRef&&p.userData.sourceRef===o.userData.partName){candidate=p;name=p.userData.sourceRef;}else if(p.name&&/^(?:U|R|C|D|Q|J[XB]?|JP|L|Y|MC|RN)\d/.test(p.name)){candidate=p;name=p.name;}}
  return {owner,name:name||'PCB surface',object:candidate};}
function rebuildMarks(){disposeGroup(marks);for(const s of strokes)if(s.length>1){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(s.map(p=>new THREE.Vector3(...p))),sketchMat);line.renderOrder=10;marks.add(line);}if(measure.length){const points=measure.map(p=>new THREE.Vector3(...p));if(points.length===2)marks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),sketchMat));for(const p of points){const dot=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),measureMat);dot.position.copy(p);marks.add(dot);}}}
canvas.addEventListener('pointerdown',e=>{if(!ready||e.button!==0)return;const mode=$('tool').value;gesture={x:e.clientX,y:e.clientY,mode};if(mode!=='orbit'){controls.enabled=false;canvas.setPointerCapture(e.pointerId);if(mode==='draw'){const p=surface(e)||controls.target;gesture.plane=new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),p);strokes.push([p.toArray()]);if(strokes.length>10)strokes.shift();}}});
canvas.addEventListener('pointermove',e=>{if(gesture?.mode==='draw'){setPointer(e);const p=ray.ray.intersectPlane(gesture.plane,new THREE.Vector3());if(p){const s=strokes.at(-1);s.push(p.toArray().map(n=>Math.round(n*100)/100));if(s.length>100)strokes[strokes.length-1]=s.filter((_,i)=>i%2===0);rebuildMarks();render();}}});
canvas.addEventListener('pointerup',e=>{if(!gesture)return;const moved=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y);if(gesture.mode==='orbit'&&moved<5){const h=hit(e);if(h){const p=partFromHit(h);focus(p.owner,p,true,false);}}else if(gesture.mode==='measure'&&moved<5){const p=surface(e);if(p){if(measure.length===2)measure=[];measure.push(p.toArray());rebuildMarks();render();}}gesture=null;controls.enabled=$('tool').value==='orbit';save();});
canvas.addEventListener('dblclick',e=>{if(!ready)return;if($('tool').value!=='orbit')return;const h=hit(e);if(h){const p=partFromHit(h);focus(p.owner,p);}});
canvas.addEventListener('pointercancel',()=>{gesture=null;controls.enabled=$('tool').value==='orbit';save();});
$('progress').addEventListener('input',e=>{pause();progress=+e.target.value;updatePose();});$('progress').addEventListener('change',save);
$('play').onclick=()=>{if(playing){pause();save();return;}if(progress>=100)progress=0;playFrom=progress;playStart=performance.now();playing=true;$('play').textContent='Pause';rafId=requestAnimationFrame(tick);};
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{pause();progress=+b.dataset.progress;updatePose();save();});
$('head-milestone').onclick=()=>{pause();progress=100;updatePose();save();};
$('focus').onchange=e=>focus(e.target.value);$('context').onclick=()=>focus('scene');$('host-view').onclick=()=>{isolationPreference=true;focus('host');};$('fit').onclick=()=>frameObject(selectedPart?.object||getFocusObject(focusKey),true);
$('flip').onclick=()=>{const o=getFocusObject(focusKey);if(!o)return;const normal=new THREE.Vector3(0,1,0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));const offset=camera.position.clone().sub(controls.target).reflect(normal);camera.position.copy(controls.target).add(offset);controls.update();save();};
$('zoom-in').onclick=()=>{camera.position.sub(controls.target).multiplyScalar(.72).add(controls.target);controls.update();save();};$('zoom-out').onclick=()=>{camera.position.sub(controls.target).multiplyScalar(1.38).add(controls.target);controls.update();save();};
$('sheep').onchange=()=>{pause();const oldAssembly=Math.min(100,progress/(!showSheep()?.88:1));progress=oldAssembly*(showSheep()?.88:1);if(showSheep()){isolationPreference=false;$('isolate').checked=false;}updateMilestones();updatePose();if(showSheep()||focusKey==='scene')focus('scene');else save();};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){pause();save();}});
$('cutaway').onchange=e=>{head.setCutaway(e.target.checked);render();save();};
$('isolate').onchange=()=>{isolationPreference=$('isolate').checked;applyVisibility();render();save();};
$('tool').onchange=e=>{controls.enabled=e.target.value==='orbit';$('ink-actions').hidden=e.target.value==='orbit'&&!strokes.length&&!measure.length;$('hint').textContent=e.target.value==='draw'?'Sketch in the scene · marks are illustrative':e.target.value==='measure'?'Select two surfaces · scene distances, not anatomical measurements':'Drag to orbit · scroll / pinch to zoom · click a part · double-click for close-up';};
$('undo').onclick=()=>{if(measure.length)measure.pop();else strokes.pop();rebuildMarks();render();save();};$('clear').onclick=()=>{strokes=[];measure=[];$('ink-actions').hidden=$('tool').value==='orbit';rebuildMarks();render();save();};controls.addEventListener('end',save);
new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(w<1||h<1){needsViewportFit=true;return;}renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(ready&&needsViewportFit){needsViewportFit=false;frameObject(selectedPart?.object||getFocusObject(focusKey),true);}else render();}).observe(stage);
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='presentation-slide-active'&&!event.data.active){pause();save();}});
function fpgaParts(){const assigned=new Set(fpgaCoverage?.models?.map(p=>p.reference)||[]);return boardModels.FPGA?boardModels.FPGA.children.flatMap(root=>assigned.has(root.name)?[root]:root.children.filter(n=>assigned.has(n.name))):[];}
function focusComponent(ref,isolate=true){const object=fpgaParts().find(p=>p.name===ref);if(!object)return false;isolationPreference=isolate;focus('FPGA',{owner:'FPGA',name:ref,object});$('fpga-part').value=ref;return true;}
function viewerState(){return{ready,progress,focus:focusKey,selectedPart:selectedPart?.name||null,isolate:$('isolate').checked,playing,visibleBoards:Object.entries(boardGroups).filter(([,o])=>visible(o)).map(([key])=>key),camera:camera.position.toArray(),target:controls.target.toArray(),fpgaRevision:'V60',fpgaPartCount:fpgaParts().length,fpgaPartReferences:fpgaParts().map(o=>o.name),renderCalls:renderer.info.render.calls,renderTriangles:renderer.info.render.triangles};}
window.assemblyViewer={getState:viewerState,focusBoard(key='scene',isolate=key!=='scene'){if(!ready||!Object.hasOwn(names,key))return false;isolationPreference=isolate;focus(key);return true;},focusComponent,overview(){if(!ready)return;focus('scene');}};
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='assembly-focus'||!ready)return;const {focus:requested='scene',component,isolate=requested!=='scene'}=event.data;if(component&&requested==='FPGA')focusComponent(component,isolate);else window.assemblyViewer.focusBoard(requested,isolate);});
$('fpga-closeup').onclick=()=>{isolationPreference=true;focus('FPGA');$('fpga-part').value='';};
$('fpga-part').onchange=e=>{if(e.target.value)focusComponent(e.target.value,true);};
async function init(){
  [native,asic,hostMeta,interposerSource,fpgaCoverage]=await Promise.all([getJSON('data/board-layout.json'),getJSON('data/asic-layout.json'),getJSON('data/host-models.json'),getJSON('data/interposer-v20.json'),getJSON('data/fpga-v60-coverage.json')]);hostMeta.boards.interposer=interposerSource.board;
  const port=native.ldo.footprints.find(p=>p.reference==='J301').position_xz_mm;
  for(const id of ['1','2','3','4']){const g=conceptAsic(id);g.position.x=port[0];g.position.z=port[1]+5.8;}
  for(const id of ['LDO','FPGA']){const g=new THREE.Group();g.userData.owner=id;module.add(g);boardGroups[id]=g;}
  boardGroups.FPGA.position.x=native.fpga.normalization_center_native_xy_mm[0]+.5-native.ldo.normalization_center_native_xy_mm[0];boardGroups.FPGA.position.z=native.fpga.normalization_center_native_xy_mm[1]+1.5-native.ldo.normalization_center_native_xy_mm[1];
  for(const key of ['brk','interposer','xem']){const g=new THREE.Group();g.userData.owner=key;host.add(g);boardGroups[key]=g;}
  await Promise.all([
    loadModel('assets/fpga-v60-public.glb','FPGA',boardGroups.FPGA,1000,[-113,-.765,-109.25]),
    loadModel('assets/ldo-v13-detailed.glb','LDO',boardGroups.LDO,1000,[-114,-.455,-115.125]),
    ...['brk','xem'].map(key=>loadModel(hostMeta.boards[key].asset,key,boardGroups[key],1,[-41.5,0,-26.5],-Math.PI/2)),
    loadModel(interposerSource.registration.asset,'interposer',boardGroups.interposer,interposerSource.registration.scale,interposerSource.registration.position_xyz_mm),
    loadModel('assets/asic-pcb5-source.glb','asic-reference',originalAsic,1000,[0,-.755,0])
  ]);
  const [dp60,dp90,ds90,dp80,hc80,base80,ds60]=await Promise.all(['60dp','90dp','90ds','80dp','80hc3ds','80ds','60ds'].map(s=>loadConnector(`assets/df40-${s}-preview.glb`)));
  // V60 native GLB already contains J1/J2 source bodies; do not duplicate them.
  for(const ref of ['J1','J2','J101','J301'])boardModels.LDO.traverse(o=>{if(o.name===ref)o.visible=false;});
  attachConnector(dp60,'LDO','J1 · DF40C-60DP project preview',[8.75,.54,-4.545],[0,Math.PI/2,0]);
  attachConnector(dp60,'LDO','J2 · DF40C-60DP project preview',[-.35,.54,5.725]);
  attachConnector(dp90,'LDO','J301 · DF40C-90DP project preview',[-1,.54,12.125]);
  attachConnector(dp90,'LDO','J101 · DF40C-90DP project preview',[-1,-.54,12.125],[Math.PI,0,0]);
  for(const [lo,hi]of [['1','2'],['3','4']]){attachConnector(dp80,lo,'Proposed 80DP · project preview',[asic.port80[0],.84,-5.8]);attachConnector(hc80,hi,'Proposed HC(3.0)-80DS · project preview',[asic.port80[0],-.84,-5.8],[Math.PI,0,0]);}
  attachConnector(ds90,'2','Proposed HC(3.0)-90DS · project preview',[0,.84,-5.8]);
  attachConnector(ds90,'3','Proposed HC(3.0)-90DS · project preview',[0,-.84,-5.8],[Math.PI,0,0]);
  attachConnector(base80,'asic-reference','J3 · DF40C-80DS project preview',[.216912,-.84,-4.9462],[0,0,Math.PI],originalAsic);
  originalAsic.position.set(-115,5,85);
  const expectedRefs=fpgaCoverage.models.map(p=>p.reference).sort(),actualRefs=fpgaParts().map(p=>p.name).sort();if(JSON.stringify(expectedRefs)!==JSON.stringify(actualRefs))throw new Error('FPGA source-model reference coverage mismatch');
  $('fpga-part').replaceChildren(new Option('Choose FPGA component…',''),...fpgaParts().sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).map(p=>new Option(p.name,p.name)));
  ready=true;uiControls.forEach(e=>e.disabled=false);let stored;try{stored=JSON.parse(localStorage.getItem('assembly-meeting-v2-state'));}catch{}const validPoint=p=>Array.isArray(p)&&p.length===3&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<10000);
  if(stored){$('sheep').checked=!!stored.sheep;progress=THREE.MathUtils.clamp(Number.isFinite(stored.progress)?stored.progress:0,0,100);isolationPreference=typeof stored.isolationPreference==='boolean'?stored.isolationPreference:null;$('cutaway').checked=!!stored.cutaway;head.setCutaway(!!stored.cutaway);if(Array.isArray(stored.strokes))strokes=stored.strokes.slice(-10).map(s=>Array.isArray(s)?s.filter(validPoint).slice(0,100):[]);if(Array.isArray(stored.measure))measure=stored.measure.filter(validPoint).slice(0,2);}
  const meetingParams=new URLSearchParams(location.search),fullScene=meetingParams.get('fullscene')==='1';
  if(fullScene){stored={focus:'scene',isolate:false};isolationPreference=true;$('sheep').checked=false;$('cutaway').checked=false;head.setCutaway(false);strokes=[];measure=[];progress=0;}
  if(meetingParams.has('progress'))progress=THREE.MathUtils.clamp(Number(meetingParams.get('progress'))||0,0,100);
  const meetingFocus=fullScene?'scene':meetingParams.get('focus');if(Object.hasOwn(names,meetingFocus)){const isolate=meetingFocus!=='scene'&&meetingParams.get('isolate')!=='0';stored={...stored,focus:meetingFocus,isolate};isolationPreference=meetingFocus==='scene'?true:isolate;delete stored.camera;delete stored.target;}
  rebuildMarks();$('ink-actions').hidden=!strokes.length&&!measure.length;updateMilestones();updatePose();focus(Object.hasOwn(names,stored?.focus)?stored.focus:'scene',null,false);if(typeof stored?.isolate==='boolean'){$('isolate').checked=stored.isolate;applyVisibility();}if(validPoint(stored?.camera)&&validPoint(stored?.target)){camera.position.fromArray(stored.camera);controls.target.fromArray(stored.target);controls.update();const differentAspect=Number.isFinite(stored.viewportAspect)?Math.abs(Math.log(camera.aspect/stored.viewportAspect))>.2:stage.clientWidth<600;if(differentAspect)frameObject(getFocusObject(focusKey),true);}
  $('loading').hidden=true;$('progress').disabled=false;$('play').disabled=false;document.body.dataset.ready='true';render();
}
init().catch(error=>{console.error(error);$('loading').textContent='Model loading failed: '+error.message;$('loading').setAttribute('role','alert');});
