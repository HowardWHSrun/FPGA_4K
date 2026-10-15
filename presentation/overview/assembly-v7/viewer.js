import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('assembly');
const query=new URLSearchParams(location.search);
let architecture=query.get('architecture')==='combined'?'combined':'separate';
let focus=['asic','compact','host'].includes(query.get('focus'))?query.get('focus'):'all';
let renderer,scene,camera,controls,ready=false,active=true,dirty=true,frame=0,error=null;
let poseName='iso',separated=true,labelsOn=true,architectureToken=0;
const models={},pending={},labelRecords=[],groups={},geometry={};
const loader=new GLTFLoader();
const vectors={iso:[.72,-1.15,1.1],top:[0,-.001,1],side:[0,-1,.04]};
const paths={
  asic:'../assembly-v6/assets/ASIC_PCB5_Interactive.glb',
  fpga:'../../meetings/2026-10-14-v16/stack_viewer/assets/fpga/FPGA_V41_Interactive.glb',
  ldo:'../../meetings/2026-10-14-v16/stack_viewer/assets/ldo/LDO_V5_Interactive.glb',
  combined:'../assembly-v6/assets/Combined_V7_Interactive.glb',
  brk:'../assembly-v6/assets/BRK8305_Display.glb',
  interposer:'../assembly-v6/assets/Interposer_V4_Display.glb',
  xem:'../assembly-v6/assets/XEM8305_Display.glb'
};
const logicalLinks=new THREE.Group();logicalLinks.name='illustrative-micro-HDMI-cable';
const layout={requiredGapMm:65,compactHostGapMm:0};
const cableInfo={type:'micro-HDMI',illustrative:true,from:'fpga',to:'interposer'};
let cableCurve;
const leaderLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');leaderLayer.classList.add('label-leaders');$('board-labels').before(leaderLayer);

function requestDraw(){if(renderer&&ready&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
function draw(){frame=0;if(!active||document.hidden)return;const moving=controls.update();if(dirty||moving){renderer.render(scene,camera);updateLabels();dirty=false;}if(moving)requestDraw();}
function visibleBox(object){object.updateWorldMatrix(true,true);const box=new THREE.Box3();object.traverseVisible(node=>{if(!node.isMesh||!node.geometry)return;if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));});return box;}
function sceneBounds(){const box=new THREE.Box3();for(const group of [...Object.values(groups),logicalLinks])if(group.visible)box.union(visibleBox(group));return box;}
function fitBounds(){return focus==='all'?sceneBounds():visibleBox(groups[focus]);}
function fit(keepDirection=true){
  if(!ready)return;const box=fitBounds();if(box.isEmpty())return;
  const center=box.getCenter(new THREE.Vector3());
  let direction=keepDirection?camera.position.clone().sub(controls.target).normalize():new THREE.Vector3(...vectors[poseName]).normalize();
  if(direction.lengthSq()<.5)direction=new THREE.Vector3(...vectors.iso).normalize();
  const right=new THREE.Vector3().crossVectors(camera.up,direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();
  let minR=Infinity,maxR=-Infinity,minU=Infinity,maxU=-Infinity;
  const fitGroups=focus==='all'?[...Object.values(groups),logicalLinks]:[groups[focus]];
  for(const group of fitGroups){group.updateWorldMatrix(true,true);group.traverseVisible(node=>{
    if(!node.isMesh||!node.geometry)return;if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();const b=node.geometry.boundingBox;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
      const point=new THREE.Vector3(x,y,z).applyMatrix4(node.matrixWorld).sub(center),r=point.dot(right),u=point.dot(up);
      minR=Math.min(minR,r);maxR=Math.max(maxR,r);minU=Math.min(minU,u);maxU=Math.max(maxU,u);
    }
  });}
  const width=maxR-minR,height=maxU-minU;center.addScaledVector(right,(minR+maxR)/2).addScaledVector(up,(minU+maxU)/2);
  const aspect=Math.max(.1,stage.clientWidth/Math.max(1,stage.clientHeight));
  const size=Math.max(height,width/aspect,10)*(focus==='all'?1.28:1.32);
  camera.top=size/2;camera.bottom=-size/2;camera.left=-size*aspect/2;camera.right=size*aspect/2;camera.zoom=1;
  controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,500);camera.updateProjectionMatrix();controls.update();
  document.documentElement.dataset.fit=focus;document.documentElement.dataset.bounds=JSON.stringify({min:box.min.toArray(),max:box.max.toArray()});
  dirty=true;requestDraw();
}
function setPose(name){if(!vectors[name])return;poseName=name;document.querySelectorAll('[data-pose]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pose===name)));$('pose-name').textContent=name==='iso'?'ISOMETRIC':name.toUpperCase();fit(false);}
function setFocus(value){if(!['all','asic','compact','host'].includes(value))return;focus=value;document.querySelectorAll('[data-focus]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.focus===value)));fit();}
function selectSection(section){if(parent!==window)parent.postMessage({type:'overview-select-section',section},location.origin);else{const url=new URL('../../../',location.href);url.searchParams.set('approach','custom');url.hash=section;location.assign(url.href);}}
function makeLabel(id,title,subtitle,section,color,object,anchor){const button=document.createElement('button');button.className='board-label';button.dataset.board=id;button.style.setProperty('--board-color',color);button.setAttribute('aria-label',title+(subtitle?' '+subtitle:'')+'. Open '+section+' details');button.append(document.createTextNode(title));if(subtitle){const small=document.createElement('span');small.className='label-version';small.textContent=subtitle;button.append(small);}button.onclick=()=>selectSection(section);$('board-labels').append(button);labelRecords.push({id,element:button,object,anchor});}
function addCompactLabel(id,object){const record={fpga:['FPGA V41','fpga','#797fb0'],ldo:['LDO V5','routing','#51a08b'],combined:['FPGA / LDO V7','routing','#797fb0']}[id];if(!record)return;makeLabel(id,record[0],'',record[1],record[2],object,box=>new THREE.Vector3(id==='ldo'?box.min.x:box.max.x,id==='ldo'?box.min.y:box.max.y,box.max.z+2));}
function updateLabels(){
  const w=stage.clientWidth,h=stage.clientHeight,placed=[];leaderLayer.replaceChildren();leaderLayer.setAttribute('viewBox','0 0 '+w+' '+h);
  for(const record of labelRecords){const {element,object,anchor}=record;let visible=labelsOn&&object.visible;for(let p=object.parent;p;p=p.parent)visible=visible&&p.visible;
    if(focus!=='all'&&record.id.split('-')[0]!==focus&&!(focus==='compact'&&['fpga','ldo','combined'].includes(record.id))&&!(focus==='host'&&['brk','interposer','xem'].includes(record.id)))visible=false;
    if(!visible){element.hidden=true;continue;}const box=visibleBox(object);if(box.isEmpty()){element.hidden=true;continue;}
    const p=anchor?anchor(box):box.getCenter(new THREE.Vector3()).setZ(box.max.z+2);p.project(camera);
    if(p.z<-1||p.z>1||p.x<-1.3||p.x>1.3||p.y<-1.3||p.y>1.3){element.hidden=true;continue;}
    element.hidden=false;const ew=element.offsetWidth,eh=element.offsetHeight;
    let x=THREE.MathUtils.clamp((p.x*.5+.5)*w,ew/2+7,w-ew/2-7),y=THREE.MathUtils.clamp((-p.y*.5+.5)*h-eh*.8,eh/2+7,h-eh/2-25);
    for(let attempt=0;attempt<9;attempt++){if(!placed.some(other=>Math.abs(x-other.x)<(ew+other.w)/2+4&&Math.abs(y-other.y)<(eh+other.h)/2+4))break;y+=(attempt%2===0?-1:1)*(eh+5)*(Math.floor(attempt/2)+1);y=THREE.MathUtils.clamp(y,eh/2+6,h-eh/2-24);}
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',String((p.x*.5+.5)*w));line.setAttribute('y1',String((-p.y*.5+.5)*h));line.setAttribute('x2',String(x));line.setAttribute('y2',String(y));leaderLayer.append(line);element.style.left=x+'px';element.style.top=y+'px';placed.push({x,y,w:ew,h:eh});
  }
  const pixelsPerMm=h/(camera.top-camera.bottom)*camera.zoom;const mm=[20,10,5,1].find(v=>v*pixelsPerMm<w*.3)||1;$('scale-line').style.width=(mm*pixelsPerMm)+'px';$('scale-label').textContent=mm+' mm';
}
function disposeLinks(){logicalLinks.traverse(node=>{node.geometry?.dispose();if(node.material)for(const mat of Array.isArray(node.material)?node.material:[node.material])mat.dispose();});logicalLinks.clear();}
function positionAssemblies(){
  // Rigid display rotations point the source J3/J600 openings into the cable gap.
  // Their internal board registrations and all native meshes remain unchanged.
  groups.host.rotation.z=Math.PI;groups.host.position.set(0,0,0);
  const hostCenter=visibleBox(groups.host).getCenter(new THREE.Vector3());
  groups.host.position.set(70-hostCenter.x,-hostCenter.y,0);
  const hostBox=visibleBox(groups.host);
  groups.compact.rotation.z=Math.PI;groups.compact.position.set(0,0,0);
  const compactLocal=visibleBox(groups.compact);
  groups.compact.position.x=hostBox.min.x-70-compactLocal.max.x;
  const compactBox=visibleBox(groups.compact);
  groups.asic.position.set(0,0,0);const asicLocal=visibleBox(groups.asic);
  groups.asic.position.x=compactBox.min.x-18-asicLocal.max.x;
  const gap=hostBox.min.x-compactBox.max.x;
  Object.assign(layout,{compactHostGapMm:gap,compactBounds:{min:compactBox.min.toArray(),max:compactBox.max.toArray()},hostBounds:{min:hostBox.min.toArray(),max:hostBox.max.toArray()},displayRotationZDegrees:180});
  document.documentElement.dataset.compactHostGapMm=String(gap);
}
function updateLinks(){
  disposeLinks();
  const compact=architecture==='combined'?models.combined:models.fpga;
  let start;
  if(architecture==='combined')start=compact.localToWorld(new THREE.Vector3(.0994,.00277,.1058));
  else{const b=visibleBox(compact.getObjectByName('J3'));start=new THREE.Vector3(b.max.x,(b.min.y+b.max.y)/2,(b.min.z+b.max.z)/2);}
  const portBox=visibleBox(models.interposer.getObjectByName('J600'));
  const end=new THREE.Vector3(portBox.min.x,(portBox.min.y+portBox.max.y)/2,(portBox.min.z+portBox.max.z)/2);
  const forwardY=Math.min(start.y,end.y)-22;
  cableCurve=new THREE.CubicBezierCurve3(start,new THREE.Vector3(start.x+22,forwardY,start.z+5),new THREE.Vector3(end.x-22,forwardY,end.z+5),end);
  const jacket=new THREE.MeshStandardMaterial({color:0x354957,roughness:.74,metalness:.08});
  const cable=new THREE.Mesh(new THREE.TubeGeometry(cableCurve,72,1.15,12,false),jacket);cable.name='micro-HDMI-cable-jacket';logicalLinks.add(cable);
  Object.assign(cableInfo,{from:architecture==='combined'?'combined':'fpga',sourceReference:'J3',to:'interposer',targetReference:'J600',startMm:start.toArray(),endMm:end.toArray(),scope:'Illustrative cable curve at source connector face bounds; no qualified plug, cable length, bend radius or mating datum.'});
  document.documentElement.dataset.cableType=cableInfo.type;
  document.documentElement.dataset.cableFrom=cableInfo.from;
  document.documentElement.dataset.cableTo=cableInfo.to;
}
function updateAssembly(refit=true){
  if(models.fpga){models.fpga.visible=architecture==='separate';models.fpga.position.set(-115.5,114.75,1.505002+(separated?8:0));}
  if(models.ldo){models.ldo.visible=architecture==='separate';models.ldo.position.set(-116,116.25,-.995);}
  if(models.combined){models.combined.visible=architecture==='combined';models.combined.position.set(-115,115,0);}
  if(models.interposer)models.interposer.position.z=separated?10:0;
  if(models.xem)models.xem.position.z=separated?20:0;
  $('architecture').value=architecture;$('separation').setAttribute('aria-pressed',String(separated));$('labels').setAttribute('aria-pressed',String(labelsOn));
  const visibleModels=architecture==='separate'?9:8;
  document.documentElement.dataset.architecture=architecture;document.documentElement.dataset.modelcount=String(visibleModels);document.documentElement.dataset.separated=String(separated);
  positionAssemblies();updateLinks();if(refit)fit();dirty=true;requestDraw();
}
async function loadModel(id){
  if(models[id])return models[id];if(pending[id])return pending[id];
  pending[id]=(async()=>{
    const response=await fetch(new URL(paths[id],import.meta.url));if(!response.ok)throw new Error('Could not load '+id+' board model ('+response.status+').');
    const bytes=await response.arrayBuffer(),gltf=await loader.parseAsync(bytes,new URL(paths[id],import.meta.url).href),model=gltf.scene;model.name=id;
    let triangles=0,meshes=0;model.traverse(node=>{if(/K-DOT/i.test(node.name))node.visible=false;if(node.isMesh){meshes++;triangles+=(node.geometry.index?.count??node.geometry.attributes.position.count)/3;for(const material of Array.isArray(node.material)?node.material:[node.material]){material.side=THREE.DoubleSide;material.metalness=Math.min(material.metalness??0,.3);material.roughness=Math.max(material.roughness??.5,.42);}}});
    geometry[id]={meshes,triangles,bytes:bytes.byteLength};
    if(['asic','fpga','ldo','combined'].includes(id)){model.scale.setScalar(1000);model.rotation.x=Math.PI/2;}
    if(id!=='asic'){(id==='fpga'||id==='ldo'||id==='combined'?groups.compact:groups.host).add(model);models[id]=model;addCompactLabel(id,model);}
    return model;
  })();return pending[id];
}
async function setArchitecture(value,notify=false){
  if(!['separate','combined'].includes(value))return;architecture=value;const token=++architectureToken;$('status').hidden=false;$('status').textContent='Loading '+(value==='combined'?'combined V7 board…':'FPGA V41 and LDO V5…');
  try{await Promise.all((value==='combined'?['combined']:['fpga','ldo']).map(loadModel));if(token!==architectureToken)return;updateAssembly(true);$('status').hidden=true;if(notify&&parent!==window)parent.postMessage({type:'overview-power-option',value},location.origin);}
  catch(e){showError(e);}
}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);if(ready)fit();}
function showError(e){error=e.message;document.documentElement.dataset.sceneReady='false';$('status').hidden=false;$('status').dataset.error='true';$('status').textContent=error+' Reload this view to try again.';console.error(e);}
function getState(){return{ready,error,active,architecture,layout,cable:cableInfo,focus,pose:poseName,separated,labels:labelsOn,modelCount:architecture==='separate'?9:8,versions:{asic:'PCB-5',fpga:'V41',ldo:'V5',combined:'V7',interposer:'V4',brk:'BRK8305',xem:'XEM8305'},loadedModels:Object.keys(geometry),geometry,visible:Object.fromEntries(Object.entries(models).map(([id,m])=>[id,m.visible])),camera:camera?.position.toArray(),target:controls?.target.toArray(),bounds:ready?{min:sceneBounds().min.toArray(),max:sceneBounds().max.toArray()}:null};}
window.currentAssemblyViewer={getState,fit:()=>setFocus('all'),setFocus,setPose,setArchitecture,setSeparation:value=>{separated=Boolean(value);updateAssembly();}};
document.querySelectorAll('[data-pose]').forEach(button=>button.onclick=()=>setPose(button.dataset.pose));
document.querySelectorAll('[data-focus]').forEach(button=>button.onclick=()=>setFocus(button.dataset.focus));
$('architecture').onchange=event=>setArchitecture(event.target.value,true);
$('separation').onclick=()=>{separated=!separated;updateAssembly();};$('labels').onclick=()=>{labelsOn=!labelsOn;updateAssembly(false);};
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin)return;const data=event.data;if(data?.type==='presentation-slide-active'){active=Boolean(data.active);if(active){resize();dirty=true;requestDraw();}else if(frame){cancelAnimationFrame(frame);frame=0;}}else if(data?.type==='overview-power-option')setArchitecture(data.value);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestDraw();});
canvas.addEventListener('keydown',event=>{if(!ready||!['+','=','-','r','R'].includes(event.key))return;event.preventDefault();event.stopPropagation();if(event.key.toLowerCase()==='r')setPose('iso');else{camera.zoom=THREE.MathUtils.clamp(camera.zoom*(event.key==='-'?1/1.2:1.2),.25,20);camera.updateProjectionMatrix();dirty=true;requestDraw();}});

async function init(){
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-100,100,60,-60,.1,1800);camera.up.set(0,0,1);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minZoom=.25;controls.maxZoom=20;controls.enablePan=true;controls.addEventListener('change',()=>{dirty=true;requestDraw();});controls.addEventListener('start',requestDraw);
  scene.add(new THREE.HemisphereLight(0xffffff,0x80929f,2.7));const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(-80,-100,160);scene.add(key);const fill=new THREE.DirectionalLight(0xffffff,1.1);fill.position.set(80,70,90);scene.add(fill);
  groups.asic=new THREE.Group();groups.compact=new THREE.Group();groups.compact.position.x=-28;groups.host=new THREE.Group();groups.host.position.set(45-41.5,26.5,0);scene.add(groups.asic,groups.compact,groups.host,logicalLinks);
  const common=await Promise.all(['asic','brk','interposer','xem'].map(loadModel));
  const reference=common[0],asicBox=visibleBox(reference),center=asicBox.getCenter(new THREE.Vector3());
  [[-105,-15],[-78,-15],[-105,15],[-78,15]].forEach(([x,y],index)=>{const board=reference.clone(true);board.position.set(x-center.x,y-center.y,-asicBox.min.z);board.name='asic-'+(index+1);groups.asic.add(board);models[board.name]=board;makeLabel(board.name,'ASIC '+(index+1),'PCB-5 reference','carriers','#5d91b5',board,box=>new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y+1,box.max.z+1));});
  await Promise.all((architecture==='combined'?['combined']:['fpga','ldo']).map(loadModel));
  makeLabel('brk','BRK8305','','adapter','#678b9d',models.brk,box=>new THREE.Vector3(box.max.x,box.min.y,box.max.z));
  makeLabel('interposer','Interposer V4','','adapter','#b59b65',models.interposer,box=>new THREE.Vector3(box.max.x,box.max.y,box.max.z));
  makeLabel('xem','XEM8305','','adapter','#607d90',models.xem,box=>new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,box.max.z+2));
  makeLabel('cable','micro-HDMI cable','Illustrative route','adapter','#496577',logicalLinks,()=>cableCurve.getPoint(.5).add(new THREE.Vector3(0,0,5)));
  ready=true;document.documentElement.dataset.sceneReady='true';$('status').hidden=true;updateAssembly(false);new ResizeObserver(resize).observe(stage);resize();setFocus(focus);setPose('iso');
  if(parent!==window)parent.postMessage({type:'overview-assembly-ready',state:getState()},location.origin);
}
init().catch(showError);
