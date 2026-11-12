import * as THREE from 'three';
import {addPcb5Bodies} from './pcb5.js?v=2';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('canvas');
const INFO={
 hdmi:{name:'HDMI Extension Board',kicker:'V37 · published CAD',role:'Hosts the XEM8310. Eight Micro-HDMI ports, one per Frontend FPGA Board, and PCIe x4 to the PC.',was:'Was: XEM8310 breakout, BRK8310 Custom'},
 xem8310:{name:'XEM8310',kicker:'Opal Kelly module',role:'FPGA module that mounts on the HDMI Extension Board (MC1–MC3).',was:''},
 frontend:{name:'Frontend FPGA Board',kicker:'8L V3 · 14 layers · every connection routed',role:'Reads its ASIC boards and sends the data over one HDMI cable.',was:'Was: Artix-7 FPGA board, 35T FPGA PCB, custom FPGA'},
 fpgaldo:{name:'FPGA-LDO PCB · Option A',kicker:'Layout V12 · four of the eight stacks',role:'One board under the Frontend FPGA Board; powers the four ASIC boards.',was:''},
 fpgaldob:{name:'FPGA-LDO PCB · Option B',kicker:'Router V2 + LDO board V2 · four of the eight stacks',role:'Same circuit on two boards: the router carries the ASIC boards, the plug-in LDO board sits under the Frontend, joined by the 120-pin J5.',was:''},
 asic:{name:'ASIC boards · top and bottom',kicker:'V3 · two bottom and two top boards per stack',role:'Two ASICs per board, each with its four-shank probe leaving the board edge. On each FPGA-LDO port a bottom board plugs in and a top board stacks on it.',was:''},
 cable:{name:'HDMI cable',kicker:'One per stack',role:'Connects a Frontend FPGA Board to one HDMI Extension Board port.',was:''},
 directldo:{name:'Direct LDO Carrier',kicker:'V6 · JLCPCB placement review',role:'Carries the XEM8305 and connects the existing LDO board directly, with no custom FPGA board. Our first board sent to fabrication.',was:'Was: XEM8305 carrier, LDO carrier'},
 xem8305:{name:'XEM8305',kicker:'Opal Kelly module',role:'FPGA module that mounts on the Direct LDO Carrier (MC1–MC3).',was:''},
 ldoexisting:{name:'Existing LDO board',kicker:'Plugs into carrier J1/J2',role:'The existing LDO board that the ASIC boards connect to.',was:''},
 sheep:{name:'Sheep (illustration)',kicker:'Low-poly model, approximate size',role:'Shows where the eight head stages sit. "Sheep" by Poly by Google, CC BY 3.0, via Poly Pizza. Not a surgical plan.',was:''},
 brain:{name:'Brain (nominal shape)',kicker:'Illustration only',role:'About 80 × 60 × 45 mm, drawn just under the scalp so the probe shanks reach it. Skull, scalp thickness and implant sites are not modelled.',was:''}
};
const SCOPE={custom:'4 Option A stacks + 4 Option B stacks → 8 HDMI cables → HDMI Extension Board + XEM8310',
 direct:'XEM8305 + Direct LDO Carrier + existing LDO board',
 head:'8 head stages on a sheep head · probe shanks point down into the brain · 8 HDMI cables leave toward the HDMI Extension Board · sheep: Poly by Google, CC BY 3.0'};
// Head view: what stays on the head permanently and what unplugs after a recording. Option B follows the
// Option B plan (router "stays on the head", plug-in LDO board on J5); the Option A split is assumed.
const PERM={stay:'Stays on the head permanently',off:'Unplugs after a recording'};

const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,4000);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
scene.add(new THREE.HemisphereLight(0xffffff,0x8c9b97,1.6));const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(80,180,100);scene.add(sun);const fill=new THREE.DirectionalLight(0xffffff,.6);fill.position.set(-120,60,-80);scene.add(fill);
const controls=new OrbitControls(camera,canvas);controls.addEventListener('change',render);controls.minDistance=.8;controls.maxDistance=2500;controls.zoomToCursor=true;controls.zoomSpeed=2.2;
const loader=new GLTFLoader();
// Separate boards: the Frontend stays on its cable; the FPGA-LDO and the ASIC boards move apart vertically.
const stacks=[];let exploded=false,explodeK=0;
function applyExplode(k){explodeK=k;for(const parts of stacks)for(const [o,y,d] of parts)o.position.y=y+d*k;boxCache=null;if(selected)highlight.box.setFromObject(selected).expandByScalar(.4);render()}
function setExploded(on){exploded=on;const from=explodeK,to=on?1:0,t0=performance.now();const step=now=>{const u=Math.min(1,(now-t0)/450),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;applyExplode(from+(to-from)*e);if(u<1)requestAnimationFrame(step)};requestAnimationFrame(step);const b=$('explode');b.setAttribute('aria-pressed',String(on));b.textContent=on?'Put boards together':'Separate boards'}
function zoomBy(f){flight=null;const v=camera.position.clone().sub(controls.target);const d=Math.max(controls.minDistance,Math.min(controls.maxDistance,v.length()*f));camera.position.copy(controls.target).add(v.setLength(d));controls.update();render()}
function zoomToPoint(x,y){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(pickables[approach].filter(o=>o.visible),true)[0];if(!hit)return;const dir=camera.position.clone().sub(hit.point),d=Math.max(6,dir.length()*.35);const toPos=hit.point.clone().add(dir.setLength(d));flight={t0:performance.now(),fromPos:camera.position.clone(),fromT:controls.target.clone(),toPos,toT:hit.point.clone()};requestAnimationFrame(fly)}
const roots={custom:new THREE.Group(),direct:new THREE.Group(),head:new THREE.Group()};scene.add(roots.custom,roots.direct,roots.head);roots.direct.visible=false;roots.head.visible=false;
const pickables={custom:[],direct:[],head:[]};let approach='custom',ready={custom:false,direct:false,head:false},loading={},selected=null,showAll=false,flight=null;
const kit={};// prepared board models from buildCustom, reused by the head view
const highlight=new THREE.Box3Helper(new THREE.Box3(),0xe9a72e);highlight.visible=false;scene.add(highlight);
const pcbMat=new THREE.MeshStandardMaterial({color:0x176849,roughness:.65}),edgeMat=new THREE.MeshStandardMaterial({color:0xb9ad80,roughness:.8}),dieMat=new THREE.MeshStandardMaterial({color:0x252a2c,roughness:.45}),connMat=new THREE.MeshStandardMaterial({color:0x24292b,roughness:.8}),goldMat=new THREE.MeshStandardMaterial({color:0xc4a35d,metalness:.65,roughness:.4}),cableMat=new THREE.MeshStandardMaterial({color:0x303d3d,roughness:.7}),tealMat=new THREE.MeshStandardMaterial({color:0x126a71,roughness:.55});

function render(){renderer.render(scene,camera);drawLabels()}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render()}
new ResizeObserver(resize).observe(stage);
// Merge native CAD faces per material so repeated stacks share buffers.
function compact(root){root.updateMatrixWorld(true);const out=new THREE.Group(),batches=new Map();root.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];if(mats.length!==1)return;let m=mats[0];if(m.transparent&&m.opacity>=.99){m=m.clone();m.transparent=false}const g=o.geometry.clone().applyMatrix4(o.matrixWorld),key=[m.type,m.color?.getHex(),m.metalness,m.roughness,m.opacity,m.transparent,m.map?.uuid||'',m.side,Object.keys(g.attributes).sort().join(','),!!g.index].join('|');if(!batches.has(key))batches.set(key,{m,geoms:[]});batches.get(key).geoms.push(g)});for(const {m,geoms} of batches.values()){const g=geoms.length===1?geoms[0]:mergeGeometries(geoms,false);if(g)out.add(new THREE.Mesh(g,m));else geoms.forEach(one=>out.add(new THREE.Mesh(one,m)))}return out}
function box(parent,size,pos,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...pos);parent.add(mesh);return mesh}
function tag(obj,key,label,list,primary=false){obj.userData.key=key;obj.userData.label=label;obj.userData.primary=primary;list.push(obj);return obj}
// Cable with a plug at each end. a = HDMI Extension Board port mouth (plug leaves toward -x); b = Frontend J3 mouth (plug leaves toward +z).
const PLUG=16;function makeCable(a,b){const g=new THREE.Group(),start=a.clone().add(new THREE.Vector3(-PLUG,0,0)),end=b.clone().add(new THREE.Vector3(0,0,PLUG)),v=end.clone().sub(start),raise=Math.max(14,v.length()*.1),curve=new THREE.CatmullRomCurve3([start,start.clone().add(new THREE.Vector3(-14,0,0)),start.clone().lerp(end,.5).add(new THREE.Vector3(-10,raise,10)),end.clone().add(new THREE.Vector3(0,0,14)),end],false,'centripetal');g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,48,1.1,8,false),cableMat));box(g,[PLUG,5.5,10.5],[a.x-PLUG/2,a.y,a.z],connMat);box(g,[10.5,5.5,PLUG],[b.x,b.y,b.z+PLUG/2],connMat);return g}
// Centre a KiCad GLB (metres, PCB X->X, PCB Y->Z, board from y=0 to thickness) on its board outline.
function nativeBoard(gltf,x,y,z,rotation=0){
 const board=compact(gltf.scene);
 board.scale.setScalar(1000);
 board.rotation.y=rotation;
 board.position.set(x,y,z);
 return board;
}

async function buildCustom(){
 const list=pickables.custom,root=roots.custom;
 const [hdmiG,xemG,feG,ldoG,asicG,routerBG,ldoBG,asicTG]=await Promise.all([loader.loadAsync('assets/hdmi-extension-v37.glb'),loader.loadAsync('assets/xem8310.glb'),loader.loadAsync('assets/frontend-8l-v3.glb?v=14l'),loader.loadAsync('assets/fpga-ldo-a-v12.glb'),loader.loadAsync('assets/asic-bottom-v3-0p8mm.glb'),loader.loadAsync('assets/fpga-ldo-b-router-v2.glb'),loader.loadAsync('assets/fpga-ldo-b-ldo-v2.glb'),loader.loadAsync('assets/asic-top-v3-0p8mm.glb')]);
 // HDMI Extension Board + XEM8310. MC1–MC3 coordinates are unchanged from BRK8310 Custom V1, so the earlier XEM registration applies.
 const host=new THREE.Group();host.position.set(160,0,0);root.add(host);
 const hdmi=compact(hdmiG.scene);hdmi.scale.setScalar(1000);const hb=new THREE.Box3().setFromObject(hdmi),hc=hb.getCenter(new THREE.Vector3());hdmi.position.set(-hc.x,0,-hc.z);const hdmiPart=new THREE.Group();hdmiPart.add(hdmi);host.add(tag(hdmiPart,'hdmi','HDMI Extension Board',list,true));hdmiPart.userData.anchor=[.82,.15];
 const xem=xemG.scene;xem.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];o.material=ms.map(m=>{if(m.opacity>=1&&!m.transparent)return m;const c=m.clone();c.opacity=1;c.transparent=false;c.depthWrite=true;return c});if(o.material.length===1)o.material=o.material[0]});xem.matrixAutoUpdate=false;xem.matrix.set(-1,0,0,232.326,0,0,1,7.905,0,-1,0,135.154,0,0,0,1);xem.matrix.premultiply(new THREE.Matrix4().makeTranslation(-hc.x,0,-hc.z));const xemPart=new THREE.Group();xemPart.add(xem);host.add(tag(xemPart,'xem8310','XEM8310',list,true));
 // The Option A stack uses the 70-pin connector centres for Frontend registration
 // and the 80-pin centres for PCB-5. Heights use nominal 1.5 mm DF40 mating gaps.
 const ldo=nativeBoard(ldoG,-100,0,-128.72);
 const fe=nativeBoard(feG,113.505,3.1,110.855,Math.PI);
 // ASIC boards V3 (drawn at the 0.8 mm the stack fit uses): the bottom board sits next to the FPGA-LDO connector, the top board on it.
 addPcb5Bodies(asicG.scene);addPcb5Bodies(asicTG.scene);
 const asic=nativeBoard(asicG,135.323,0,55.803,Math.PI),asicT=nativeBoard(asicTG,135.323,0,55.803,Math.PI);
 const j3=new THREE.Vector3(113.505-112.5,3.1+3.0,110.855-96.5);// J3 (112.5, 98.28) plug mouth at the board edge y = 96.5
 const asicHeights=[-4.60,-2.30,3.10,5.40];
 // Option B stack, arranged as the Option B fit test (2026-11-10 23_): LDO board top at 0, router and Frontend bottoms at 1.5,
 // ASIC boards on the router (0.8 mm boards, 1.5 mm DF40 gaps). Router and LDO board models are already centred on the stack;
 // the whole stack is shifted so the Frontend's Micro-HDMI mouth sits where the cable ends.
 const BZ=-8.525,feB=nativeBoard(feG,113.505,1.5,119.38+BZ,Math.PI),asicB=nativeBoard(asicG,135.32,0,58.52+BZ,Math.PI),asicTB=nativeBoard(asicTG,135.32,0,58.52+BZ,Math.PI);
 const centred=(g,y)=>{const o=compact(g.scene);o.scale.setScalar(1000);o.position.set(0,y,BZ);return o};
 const routerB=centred(routerBG,1.5),ldoB=centred(ldoBG,-1.6);
 const j5=new THREE.Mesh(new THREE.BoxGeometry(24.9,1.5,2.6),connMat);j5.position.set(-.217,.75,-5.8+BZ);// 120-pin J5 pair between LDO board and router (no vendor model)
 const j3B=new THREE.Vector3(113.505-112.5,1.5+1.53+1.5,119.38+BZ-96.5);
 const asicHeightsB=[-3.10,-.80,4.60,6.90];
 Object.assign(kit,{ldo,fe,asic,asicT,asicTB,feB,asicB,routerB,ldoB,j5,j3,j3B,asicHeights,asicHeightsB,edgeA:55.803-84.47,edgeB:58.52+BZ-84.47});// ASIC board edge (board y 84.47), where the shanks leave
 const ports=[53.6,66.7,79.8,92.9,106,119.1,132.2,145.3];// J617…J610 centres (13.1 mm pitch), x = 67.08
 const modules=[];
 stacks.length=0;
 for(let i=0;i<8;i++){
  const m=new THREE.Group();m.position.set(-190+(i%4)*55,0,i<4?-55:55);root.add(m);modules.push(m);
  const optB=i>=4,parts=[];
  if(!optB){
   const l=new THREE.Group();l.add(ldo.clone());m.add(tag(l,'fpgaldo','FPGA-LDO Option A',list,i===2));parts.push([l,0,-8]);
   const f=new THREE.Group();f.add(fe.clone());m.add(tag(f,'frontend','Frontend FPGA Board',list,i===1));
   const asics=new THREE.Group();asicHeights.forEach((y,k)=>{const a=(k===1||k===2?asic:asicT).clone();a.position.y=y;asics.add(a);parts.push([a,y,[-20,-14,-3,4][k]])});m.add(tag(asics,'asic','ASIC boards ×4',list,i===0));
  }else{
   const l=new THREE.Group();l.add(ldoB.clone(),j5.clone());m.add(tag(l,'fpgaldob','Option B LDO board',list,i===5));parts.push([l,0,-8]);
   const r=new THREE.Group();r.add(routerB.clone());m.add(tag(r,'fpgaldob','Option B router',list,i===6));
   const f=new THREE.Group();f.add(feB.clone());m.add(tag(f,'frontend','Frontend FPGA Board',list,false));
   const asics=new THREE.Group();asicHeightsB.forEach((y,k)=>{const a=(k===1||k===2?asicB:asicTB).clone();a.position.y=y;asics.add(a);parts.push([a,y,[-12,-6,5,10][k]])});m.add(tag(asics,'asic','ASIC boards ×4',list,false));
  }
  stacks.push(parts);
  const start=new THREE.Vector3(160+64.68-hc.x,1.6+1.5,ports[i<4?3-i:i]-hc.z),end=m.position.clone().add(optB?j3B:j3);
  const cable=makeCable(start,end);m.userData.link=i+1;root.add(tag(cable,'cable','HDMI cable '+(i+1),list,i===3));
 }
 ready.custom=true;
}

// Head view: eight head stages of one option standing on a sheep head. Each stack is turned so the probe shanks
// (which leave the ASIC board edge in the board plane) point straight down into the brain and the Frontend's
// Micro-HDMI plug points up. Sheep size and brain shape are illustrative; implant sites are not planned.
const SHEEP_MM=200,LIFT=45;// low-poly model units → mm (about 1.3 m nose to tail); unplug lift in mm
let headOpt='A',unplugged=false,unplugK=0;const headSets={},headMovers={A:[],B:[]},headCables={A:[],B:[]};
function headStack(opt,i,list){
 const g=new THREE.Group(),parts=[];
 const add=(objs,key,label,perm,primary)=>{const p=new THREE.Group();objs.forEach(o=>p.add(o));g.add(p);tag(p,key,label,list,primary&&i===0);p.userData.perm=perm;parts.push(p);return p};
 const j3=(opt==='A'?kit.j3:kit.j3B).clone(),plug=new THREE.Mesh(new THREE.BoxGeometry(10.5,5.5,PLUG),connMat);plug.position.set(j3.x,j3.y,j3.z+PLUG/2);
 const asics=()=>(opt==='A'?kit.asicHeights:kit.asicHeightsB).map((y,k)=>{const a=(opt==='A'?(k===1||k===2?kit.asic:kit.asicT):(k===1||k===2?kit.asicB:kit.asicTB)).clone();a.position.y=y;return a});
 let asicPart;
 if(opt==='A'){add([kit.ldo.clone()],'fpgaldo','FPGA-LDO Option A','stay',true);add([kit.fe.clone(),plug],'frontend','Frontend FPGA Board','off',true);asicPart=add(asics(),'asic','ASIC boards ×4','stay',true)}
 else{add([kit.ldoB.clone(),kit.j5.clone()],'fpgaldob','Option B LDO board','off',true);add([kit.routerB.clone()],'fpgaldob','Option B router','stay',true);add([kit.feB.clone(),plug],'frontend','Frontend FPGA Board','off',true);asicPart=add(asics(),'asic','ASIC boards ×4','stay',true)}
 g.updateMatrixWorld(true);
 const all=new THREE.Box3().setFromObject(g),rest=new THREE.Box3();parts.forEach(p=>{if(p!==asicPart)rest.union(new THREE.Box3().setFromObject(p))});
 const contact=Math.min(opt==='A'?kit.edgeA:kit.edgeB,rest.min.z);// lowest edge above the shanks touches the scalp
 g.position.set(-(all.min.x+all.max.x)/2,-(all.min.y+all.max.y)/2,-contact);
 const holder=new THREE.Group();holder.rotation.x=-Math.PI/2;holder.add(g);// stack -z (probe direction) → down, +z (cable) → up
 return {holder,g,parts,j3top:new THREE.Vector3(j3.x,j3.y,j3.z+PLUG),W:all.max.x-all.min.x,T:all.max.y-all.min.y,H:all.max.z-contact};
}
async function buildHead(){
 if(!ready.custom){loading.custom=loading.custom||buildCustom();await loading.custom}
 const list=pickables.head,root=roots.head;
 const sg=await loader.loadAsync('assets/sheep-poly-by-google-cc-by-3.glb');
 const sheep=sg.scene;sheep.traverse(o=>{if(!o.isMesh)return;const m=o.material.clone();m.transparent=true;m.opacity=.5;m.depthWrite=false;o.material=m;o.renderOrder=2});
 sheep.scale.setScalar(SHEEP_MM);sheep.updateMatrixWorld(true);
 const sp=new THREE.Group();sp.add(sheep);root.add(tag(sp,'sheep','Sheep',list,true));sp.userData.anchor=[.5,.2];
 // Crown: highest point on the head midline (the head is at +z); stacks are centred there.
 const ray=new THREE.Raycaster(),surf=(x,z)=>{ray.set(new THREE.Vector3(x,5000,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(sheep,true)[0];return h?h.point.y:null};
 const sb=new THREE.Box3().setFromObject(sheep);let crown={y:-1,z:0};
 for(let z=sb.max.z-.55*(sb.max.z-sb.min.z)*.5;z<sb.max.z-20;z+=2){const y=surf(0,z);if(y!==null&&y>crown.y)crown={y,z}}
 const cz=crown.z+18;// brain sits a little in front of the poll
 // Nominal brain: 80 (long) × 60 (wide) × 45 (tall) mm, top 3 mm under the lowest scalp point above it.
 const top0=surf(0,cz)??crown.y;let low=top0;for(let dx=-27;dx<=27;dx+=9)for(let dz=-38;dz<=38;dz+=9){const y=surf(dx,cz+dz);if(y!==null)low=Math.min(low,y)}
 const brain=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),new THREE.MeshStandardMaterial({color:0xd98e98,roughness:.7,transparent:true,opacity:.9}));brain.scale.set(30,22.5,40);brain.position.set(0,low-3-22.5,cz);brain.renderOrder=1;
 const hb=new THREE.Box3(),v=new THREE.Vector3();sheep.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let k=0;k<P.count;k++){v.fromBufferAttribute(P,k).applyMatrix4(o.matrixWorld);if(v.z>cz-50&&v.y>crown.y-120)hb.expandByPoint(v)}});kit.headBox=hb;// whole head for Fit view
 const bp=new THREE.Group();bp.add(brain);root.add(tag(bp,'brain','Brain (nominal)',list,true));bp.userData.below=true;
 for(const opt of ['A','B']){
  const set=new THREE.Group();set.visible=opt===headOpt;root.add(set);headSets[opt]=set;
  let topY=-Infinity;const sites=[];
  for(let i=0;i<8;i++){
   const s=headStack(opt,i,list),col=i%2,row=i>>1;
   const x=(col?1:-1)*(s.W/2+3),z=cz+(row-1.5)*(s.T+4);
   // Each stack sits on the skull 5 mm above the brain surface (scalp removed, head cap not drawn), so the 8 mm shanks enter the brain.
   const q=1-(x/30)**2-((z-cz)/40)**2,y=brain.position.y+22.5*Math.sqrt(Math.max(0,q))+5;
   s.holder.position.set(x,y,z);set.add(s.holder);s.holder.updateMatrixWorld(true);
   s.parts.forEach(p=>{if(p.userData.perm==='off'){p.userData.baseZ=p.position.z;headMovers[opt].push(p)}});
   topY=Math.max(topY,y+s.H);sites.push([s,x]);
  }
  // Cables: up out of each Micro-HDMI plug, then back over the neck toward the HDMI Extension Board (off the head).
  sites.forEach(([s,x],i)=>{
   const a=s.g.localToWorld(s.j3top.clone()),off=(i-3.5)*3.2;
   const pts=[a,a.clone().add(new THREE.Vector3(0,18,0)),new THREE.Vector3(x*.5+off*.4,topY+40,cz-95),new THREE.Vector3(off*.6,topY+30,cz-200),new THREE.Vector3(off*.6,topY+15,cz-320)];
   const c=new THREE.Group();c.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal'),64,1.1,8,false),cableMat));
   c.userData.perm='off';set.add(tag(c,'cable','HDMI cable '+(i+1),list,i===3));headCables[opt].push(c);
  });
 }
 ready.head=true;
}
function applyUnplug(k){unplugK=k;for(const opt of ['A','B']){for(const p of headMovers[opt])p.position.z=p.userData.baseZ+LIFT*k;for(const c of headCables[opt])c.visible=k<.02}boxCache=null;if(selected)highlight.box.setFromObject(selected).expandByScalar(.4);render()}
function setUnplugged(on){unplugged=on;const from=unplugK,to=on?1:0,t0=performance.now();const step=now=>{const u=Math.min(1,(now-t0)/500),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;applyUnplug(from+(to-from)*e);if(u<1)requestAnimationFrame(step)};requestAnimationFrame(step);const b=$('unplug');b.setAttribute('aria-pressed',String(on));b.textContent=on?'Plug parts back in':'Unplug removable parts';updateLegend()}
function setHeadOpt(opt){headOpt=opt;for(const o of ['A','B'])if(headSets[o])headSets[o].visible=o===opt;document.querySelectorAll('[data-headopt]').forEach(b=>b.classList.toggle('active',b.dataset.headopt===opt));if(selected)select(null,{notify:false});boxCache=null;updateLegend();render()}
function updateLegend(){const l=$('legend');if(!l)return;const B=headOpt==='B';l.innerHTML='<strong>Option '+headOpt+' on the head</strong><p><b>'+PERM.stay+':</b> probes, 4 ASIC boards, '+(B?'router':'FPGA-LDO board')+'</p><p><b>'+PERM.off+':</b> '+(B?'LDO board (J5), ':'')+'Frontend FPGA Board, HDMI cable</p><p class="note">'+(B?'From the Option B plan: the router stays on the head, the LDO board plugs in.':'Option A split assumed: the Frontend unplugs from J1/J2.')+' Press “Unplug removable parts” to lift them off.</p>'}

// Direct approach: assembly-model.json is Z-up, centred on the carrier at native (127.5, 67.5).
function ring(points){const p=new THREE.Path();points.forEach((v,i)=>i?p.lineTo(...v):p.moveTo(...v));p.closePath();return p}
function shape(points,holes=[]){const s=new THREE.Shape();points.forEach((p,i)=>i?s.lineTo(...p):s.moveTo(...p));s.closePath();s.holes=holes.map(ring);return s}
const palette={capacitor:'#b5a486',resistor:'#34373c',ic:'#2d333a',connector:'#d6d5c8',crystal:'#b8c2c8',inductor:'#3b4245',ferrite:'#454c4d',led:'#d9c09e',diode:'#39373a'};
function simpleBoard(model,color){const g=new THREE.Group(),b=model.board,holes=(b.holes||[]).map(h=>Array.from({length:28},(_,i)=>{const a=-i*Math.PI*2/28;return [h.center[0]+Math.cos(a)*h.diameter/2,h.center[1]+Math.sin(a)*h.diameter/2]}));const geo=new THREE.ExtrudeGeometry(shape(b.outline,holes),{depth:b.thickness,bevelEnabled:false,curveSegments:12});geo.translate(0,0,-b.thickness/2);g.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.07})));
 const bodies=new Map();for(const c of model.components||[]){if(!c.body)continue;const col=c.body.color||palette[c.body.kind]||'#b1b4b1',bg=new THREE.BoxGeometry(...c.body.size);bg.rotateZ(THREE.MathUtils.degToRad(c.body.rotation_z||0));bg.translate(...c.body.center);if(!bodies.has(col))bodies.set(col,[]);bodies.get(col).push(bg.toNonIndexed())}for(const [col,list] of bodies){const mg=mergeGeometries(list,false);if(mg)g.add(new THREE.Mesh(mg,new THREE.MeshStandardMaterial({color:col,roughness:.65})))}return g}
async function buildDirect(){
 const list=pickables.direct,root=roots.direct;
 const [carrierG,model]=await Promise.all([loader.loadAsync('assets/direct-ldo-carrier-v6.glb'),fetch('assets/assembly-model.json').then(r=>r.json())]);
 const carrier=compact(carrierG.scene);carrier.scale.setScalar(1000);carrier.position.set(-127.5,-.8,-67.5);const cp=new THREE.Group();cp.add(carrier);root.add(tag(cp,'directldo','Direct LDO Carrier',list,true));cp.userData.anchor=[.9,.85];
 const asm=new THREE.Group();asm.rotation.x=-Math.PI/2;root.add(asm);
 for(const b of model.boards){if(b.id==='carrier')continue;const g=simpleBoard(b.model,b.id==='xem'?'#244d73':'#356447');const t=b.seated_transform;g.position.set(...t.translation);g.position.z+=b.id==='xem'?14:-20;// 14/12 mm illustration spacing, as on the website assembly view
 g.rotation.set(...t.rotation_xyz.map(THREE.MathUtils.degToRad));const holder=new THREE.Group();holder.add(g);asm.add(tag(holder,b.id==='xem'?'xem8305':'ldoexisting',b.id==='xem'?'XEM8305':'Existing LDO board',list,true));if(b.id!=='xem')holder.userData.below=true}
 ready.direct=true;
}

function boxesOf(objs){return objs.map(o=>new THREE.Box3().setFromObject(o)).filter(b=>!b.isEmpty())}
function frame(boxes,dir,animate=true){const bounds=boxes.reduce((a,b)=>a.union(b),new THREE.Box3());if(bounds.isEmpty())return;const center=bounds.getCenter(new THREE.Vector3()),d0=dir.clone().normalize(),q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(d0,new THREE.Vector3(),new THREE.Vector3(0,1,0))).invert(),tanV=Math.tan(camera.fov*Math.PI/360),tanH=tanV*camera.aspect;let d=0;for(const b of boxes)for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z).sub(center).applyQuaternion(q);d=Math.max(d,p.z+Math.abs(p.x)/tanH,p.z+Math.abs(p.y)/tanV)}d*=1.0;const toPos=center.clone().addScaledVector(d0,d);camera.near=Math.max(.05,d/2000);camera.far=d*20+800;camera.updateProjectionMatrix();if(!animate){controls.target.copy(center);camera.position.copy(toPos);controls.update();render();return}flight={t0:performance.now(),fromPos:camera.position.clone(),fromT:controls.target.clone(),toPos,toT:center};requestAnimationFrame(fly)}
function fly(now){if(!flight)return;const k=Math.min(1,(now-flight.t0)/650),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;camera.position.lerpVectors(flight.fromPos,flight.toPos,e);controls.target.lerpVectors(flight.fromT,flight.toT,e);controls.update();render();if(k<1)requestAnimationFrame(fly);else flight=null}
function fitAll(animate=true){if(approach==='head'){const b=boxesOf([headSets[headOpt],...pickables.head.filter(o=>o.userData.key==='brain')]).reduce((a,c)=>a.union(c),new THREE.Box3());if(kit.headBox)b.union(kit.headBox);frame([b],new THREE.Vector3(1,.45,.35),animate);return}frame(boxesOf(roots[approach].children.filter(o=>o.visible)),approach==='custom'?new THREE.Vector3(.1,.95,1):new THREE.Vector3(1,.3,.75),animate)}

function drawLabels(){const overlay=$('labels');overlay.replaceChildren();const items=[];for(const o of pickables[approach]){const isSel=selected===o;if(!isSel&&!(showAll&&o.userData.primary))continue;items.push([o,isSel])}
 for(const [o,isSel] of items){const b=new THREE.Box3().setFromObject(o),a=o.userData.anchor||[.5,.5],p=new THREE.Vector3(b.min.x+(b.max.x-b.min.x)*a[0],(o.userData.below?b.min.y-3:b.max.y+1),b.min.z+(b.max.z-b.min.z)*a[1]).project(camera);if(p.z<-1||p.z>1)continue;const e=document.createElement('span');e.textContent=isSel?(INFO[o.userData.key].name+(o.userData.label.match(/\d+$/)&&o.userData.key==='cable'?' '+o.userData.label.match(/\d+$/)[0]:'')):o.userData.label;if(isSel)e.className='selected';e.style.left=((p.x+1)*stage.clientWidth/2)+'px';e.style.top=((1-p.y)*stage.clientHeight/2)+'px';if(o.userData.below)e.style.transform='translate(-50%,15%)';overlay.appendChild(e)}}

const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let boxCache=null;
function pickAt(x,y){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);if(!boxCache||boxCache.approach!==approach)boxCache={approach,list:pickables[approach].map(o=>[o,new THREE.Box3().setFromObject(o).expandByScalar(.6)])};let best=null,bd=Infinity,fallback=null,fd=Infinity,enc=null;for(const [o,b] of boxCache.list){let vis=true;o.traverseAncestors(a=>{if(!a.visible)vis=false});if(!o.visible||!vis)continue;const hit=ray.ray.intersectBox(b,new THREE.Vector3());if(!hit)continue;const k=o.userData.key;if(k==='pc'||k==='hdmi'||k==='directldo'||k==='sheep'){const d=hit.distanceTo(ray.ray.origin)+(k==='pc'?40:0);if(d<fd){fd=d;fallback=o}continue}const h=ray.intersectObject(o,true)[0];if(h&&h.distance<bd){bd=h.distance;best=o}}if(best&&fallback){const fh=(fallback.userData.key==='pc'||fallback.userData.key==='sheep')?null:ray.intersectObject(fallback,true)[0];if(fh&&fh.distance<bd)return fallback}return best||fallback||enc}
function select(o,{focus=false,notify=true}={}){selected=o;if(!o){highlight.visible=false;$('card').hidden=true;render();if(notify)parent.postMessage({type:'overview-select',key:null},location.origin);return}const k=o.userData.key,info=INFO[k];highlight.box.setFromObject(o).expandByScalar(.4);highlight.visible=true;$('card-kicker').textContent=info.kicker;$('card-name').textContent=info.name+(k==='cable'?' '+o.userData.label.match(/\d+$/)[0]:'');$('card-role').textContent=info.role;$('card-was').textContent=approach==='head'&&o.userData.perm?PERM[o.userData.perm]+'.':info.was;$('card').hidden=false;$('hint').hidden=true;if(focus){const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3());frame([b.expandByScalar(Math.max(1.5,Math.max(s.x,s.z)*.08))],new THREE.Vector3(.7,.9,1))}render();if(notify)parent.postMessage({type:'overview-select',key:k},location.origin)}
let down=null;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};flight=null});
canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(down.x-e.clientX,down.y-e.clientY)>5){down=null;return}down=null;select(pickAt(e.clientX,e.clientY))});
let hoverPending=false;canvas.addEventListener('pointermove',e=>{if(e.buttons||hoverPending)return;hoverPending=true;requestAnimationFrame(()=>{hoverPending=false;const o=ready[approach]?pickAt(e.clientX,e.clientY):null,tip=$('tip');canvas.classList.toggle('pick',!!o);if(o){const r=stage.getBoundingClientRect();tip.textContent=INFO[o.userData.key].name;tip.style.left=(e.clientX-r.left)+'px';tip.style.top=(e.clientY-r.top)+'px';tip.hidden=false}else tip.hidden=true})});
canvas.addEventListener('pointerleave',()=>{$('tip').hidden=true});
$('card-close').onclick=()=>select(null);
$('names').onclick=()=>{showAll=!showAll;$('names').setAttribute('aria-pressed',String(showAll));render()};
$('explode').onclick=()=>setExploded(!exploded);$('zin').onclick=()=>zoomBy(.6);$('zout').onclick=()=>zoomBy(1/.6);canvas.addEventListener('dblclick',e=>zoomToPoint(e.clientX,e.clientY));
$('fit').onclick=()=>{select(null,{notify:true});fitAll()};

async function setApproach(next){approach=next;document.querySelectorAll('[data-approach]').forEach(b=>b.classList.toggle('active',b.dataset.approach===next));for(const k in roots)roots[k].visible=k===next;document.body.classList.toggle('head-mode',next==='head');if(next==='head')updateLegend();selected=null;highlight.visible=false;$('card').hidden=true;$('scope').textContent=SCOPE[next];boxCache=null;render();
 if(!ready[next]){$('loading').hidden=false;$('loading').textContent='Loading boards…';try{loading[next]=loading[next]||(next==='custom'?buildCustom():next==='head'?buildHead():buildDirect());await loading[next]}catch(err){console.error(err);$('loading').textContent='Unable to load models: '+err.message;return}if(approach!==next)return}
 $('loading').hidden=true;document.body.dataset.ready=next;fitAll(false);parent.postMessage({type:'overview-approach',value:next},location.origin)}
document.querySelectorAll('[data-approach]').forEach(b=>b.onclick=()=>setApproach(b.dataset.approach));
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;const d=e.data||{};if(d.type==='overview-set-approach'&&d.value!==approach&&SCOPE[d.value])setApproach(d.value);if(d.type==='overview-focus'){const o=pickables[approach].find(p=>p.userData.key===d.key&&p.userData.primary)||pickables[approach].find(p=>p.userData.key===d.key);if(o)select(o,{focus:true,notify:false})}if(d.type==='overview-fit'){select(null,{notify:false});fitAll()}});
window.overviewViewer={getState:()=>({approach,ready:{...ready},selected:selected?.userData.key||null,pickables:pickables[approach].length,calls:renderer.info.render.calls}),headInfo:()=>{const f=b=>[b.min.toArray().map(Math.round),b.max.toArray().map(Math.round)];const br=pickables.head.find(o=>o.userData.key==='brain');return ready.head?{brain:f(new THREE.Box3().setFromObject(br)),stacks:f(new THREE.Box3().setFromObject(headSets[headOpt])),asic:f(new THREE.Box3().setFromObject(pickables.head.find(o=>o.userData.key==='asic'&&o.visible!==false&&o.parent.parent.parent===headSets[headOpt]))),head:f(kit.headBox)}:null}};
document.querySelectorAll('[data-headopt]').forEach(b=>b.onclick=()=>setHeadOpt(b.dataset.headopt));$('unplug').onclick=()=>setUnplugged(!unplugged);
const startApproach=new URLSearchParams(location.search).get('approach');resize();setApproach(SCOPE[startApproach]?startApproach:'custom');if(parent!==window)parent.postMessage({type:'overview-hello'},location.origin);
