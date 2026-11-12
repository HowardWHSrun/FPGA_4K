import * as THREE from 'three';

// PCB-5 additions in the CAD coordinate frame (x = board x, y = height, z = board y), converted from mm to m.
// The board export carries the real Hirose DF40C-80 connectors and the side pin. The two ASIC dies are
// wire-bonded and have no footprint body, so they are drawn here (10.5 × 8.97 mm each), each with its probe:
// four shanks leaving the board edge (y = 84.47). Probe size is illustrative: 8 mm shanks at 1 mm pitch.
// lift: extra height (mm) for a thicker board; the top and bottom boards V3 are 1.6 mm, PCB-5 was drawn at 0.8 mm.
export function addPcb5Bodies(scene, lift=0){
 const add = (size,center,mat) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size.map(v=>v/1000)),mat);
  mesh.position.set(center[0]/1000,(center[1]+lift)/1000,center[2]/1000);
  scene.add(mesh);
 };
 const die = new THREE.MeshStandardMaterial({color:0x353c48,roughness:.5,metalness:.2});
 const si = new THREE.MeshStandardMaterial({color:0xb9c0c8,roughness:.35,metalness:.6});
 for(const x of [129.68,140.98]){
  add([10.5,.5,8.97],[x,1.05,79.53],die);
  add([4.4,.1,2.2],[x,1.35,83.2],si);                                  // probe base on the die
  for(let k=0;k<4;k++) add([.16,.06,8],[x-1.5+k,1.35,84.3+4],si);       // four shanks past the board edge
 }
 return scene;
}
