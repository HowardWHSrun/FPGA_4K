// ASIC PCB visualization: native PCB-5 outline/pads with nominal die bodies.
// This is a thin-stack presentation concept, not revised native PCB artwork.
const caches = new WeakMap();

function cachedGeometry(THREE, data, thick) {
  let cache = caches.get(THREE);
  if (!cache) {
    cache = { boards: new Map(), unitBox: new THREE.BoxGeometry(1, 1, 1) };
    caches.set(THREE, cache);
  }
  const key = String(thick) + ':' + JSON.stringify(data.outline);
  if (!cache.boards.has(key)) {
    const shape = new THREE.Shape();
    data.outline.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    const board = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, steps: 1 });
    board.rotateX(-Math.PI / 2);
    board.translate(0, -thick / 2, 0);
    cache.boards.set(key, board);
  }
  return { board: cache.boards.get(key), box: cache.unitBox };
}

export function createAsicBoard(THREE, asicData, thick, materials = {}) {
  const group = new THREE.Group();
  group.name = 'PCB-5 thin-stack visual concept';
  const mask = materials.pcbMat || materials.pcb || materials.mask || new THREE.MeshStandardMaterial({ color: 0x176849, roughness: .65 });
  const edge = materials.edgeMat || materials.edge || materials.fiber || new THREE.MeshStandardMaterial({ color: 0xb9ad80, roughness: .8 });
  const die = materials.dieMat || materials.die || materials.silicon || new THREE.MeshStandardMaterial({ color: 0x252a2c, roughness: .45 });
  const gold = materials.goldMat || materials.pinMat || materials.gold || new THREE.MeshStandardMaterial({ color: 0xc4a35d, metalness: .65, roughness: .4 });
  const { board, box } = cachedGeometry(THREE, asicData, thick);
  group.add(new THREE.Mesh(board, [mask, edge]));

  // Native footprint-derived pad centers and dimensions, retained in X/Z.
  const pads = asicData.asicPads || [];
  if (pads.length) {
    const padMesh = new THREE.InstancedMesh(box, gold, pads.length);
    padMesh.name = 'Native PCB-5 ASIC bondout pads';
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3(), rotation = new THREE.Quaternion();
    pads.forEach(([x, z, width, depth], i) => {
      position.set(x, thick / 2 + .012, z);
      scale.set(width, .024, depth);
      matrix.compose(position, rotation, scale);
      padMesh.setMatrixAt(i, matrix);
    });
    padMesh.instanceMatrix.needsUpdate = true;
    group.add(padMesh);
  }

  // The source specification provides 8.1 × 7 mm die area. It does not provide
  // assembled height, exact placement or bond/encapsulation geometry.
  const dieWidth = 8.1, dieDepth = 7.0, displayHeight = .12;
  for (const [index, region] of (asicData.asicRegions || []).entries()) {
    const [left, near, right, far] = region;
    const body = new THREE.Mesh(box, die);
    body.name = `ASIC ${index + 1}: nominal 8.1 × 7 mm body`;
    body.scale.set(dieWidth, displayHeight, dieDepth);
    body.position.set((left + right) / 2, thick / 2 + displayHeight / 2, (near + far) / 2);
    group.add(body);
  }

  group.userData.asicModel = {
    source: 'PCB-5 outline and native ASIC pad geometry',
    sourcePadCount: pads.length,
    pcbThicknessMm: thick,
    nominalDieAreaMm: [dieWidth, dieDepth],
    dieDisplayHeightMm: displayHeight,
    status: 'Presentation concept; PCB, connector, die placement and assembled fit not qualified',
    omitted: 'Capacitor placement, J1, bonds and encapsulation; source connector replaced by schematic stack interface in the parent scene'
  };
  return group;
}
