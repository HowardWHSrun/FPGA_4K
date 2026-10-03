import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
const status = document.getElementById('status');
const labelsRoot = document.getElementById('labels');
const leadersRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
leadersRoot.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible';
leadersRoot.setAttribute('aria-hidden', 'true');
labelsRoot.append(leadersRoot);
const gapInput = document.getElementById('gap');
let mode = new URLSearchParams(location.search).get('view') === 'connection' ? 'connection' : 'routing';
let cameraView = 'iso';
let gap = 12;
let scene, camera, renderer, controls, routing, ldo, cable, guides;
const labels = [];
const centre = { x: 129, z: 50.5 };
const local = (x, y, z) => new THREE.Vector3(x - centre.x, y, z - centre.z);

function box(group, x, y, z, w, h, d, color, opacity = 1) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05, transparent: opacity < 1, opacity }));
  mesh.position.copy(local(x, y, z));
  group.add(mesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x52727b, transparent: true, opacity: 0.45 }));
  edges.position.copy(mesh.position);
  group.add(edges);
  return mesh;
}
function label(text, point, group, modes = ['routing', 'connection']) {
  const element = document.createElement('div');
  element.className = 'model-label';
  element.innerHTML = text;
  labelsRoot.append(element);
  const connector = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  leader.setAttribute('stroke', '#6d8f9d'); leader.setAttribute('stroke-width', '1');
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('r', '2.2'); dot.setAttribute('fill', '#6d8f9d');
  connector.append(leader, dot); leadersRoot.append(connector);
  labels.push({ element, point, group, modes, connector, leader, dot });
}
function centreMark(group, x, y, z, color) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
  dot.position.copy(local(x, y, z)); group.add(dot);
}
function line(group, points, color, dashed = false) {
  const object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 1.5, gapSize: 1 })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }));
  if (dashed) object.computeLineDistances();
  group.add(object); return object;
}
function frameCamera() {
  const target = mode === 'connection' ? new THREE.Vector3(-0.5, -gap / 2, -8) : new THREE.Vector3(0, 0, 0);
  const distance = mode === 'connection' ? 88 : 53;
  const offset = cameraView === 'top' ? new THREE.Vector3(0.01, distance, 0.01)
    : cameraView === 'bottom' ? new THREE.Vector3(0.01, -distance, 0.01)
    : cameraView === 'side' ? new THREE.Vector3(distance, 0, 0)
    : mode === 'routing' ? new THREE.Vector3(0.55 * distance, 0.7 * distance, 0.65 * distance)
    : new THREE.Vector3(0.55 * distance, 0.5 * distance, 0.75 * distance);
  camera.up.set(0, 1, 0);
  if (cameraView === 'top') camera.up.set(0, 0, -1);
  if (cameraView === 'bottom') camera.up.set(0, 0, 1);
  camera.position.copy(target).add(offset);
  controls.target.copy(target); camera.lookAt(target); controls.update();
}
function updateMode(reframe = true) {
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === cameraView)));
  document.getElementById('gap-control').hidden = mode !== 'connection';
  document.getElementById('stage-note').textContent = mode === 'connection' ? 'Exploded geometric concept · cable endpoint unassigned' : 'Routing underside · connector centres only';
  if (!routing) return;
  ldo.visible = cable.visible = guides.visible = mode === 'connection';
  ldo.position.y = -gap;
  guides.clear();
  for (const [x, z] of [[130.85, 41.25], [125, 60]]) line(guides, [local(x, -0.9, z), local(x, -gap + 0.9, z)], 0x82aab8, true);
  if (reframe) frameCamera();
  window.LDO_CABLED_PREVIEW.mode = mode; window.LDO_CABLED_PREVIEW.illustrativeGapMm = gap;
  if (window.LDO_CABLED_PREVIEW.nativeLoaded) document.getElementById('stage-note').textContent = mode === 'connection' ? 'Native PCB geometry · exploded gap and cable path illustrative' : 'Native E1 routing proposal · J1/J19 housings omitted';
}
async function loadNativeGeometry() {
  try {
    const loader = new GLTFLoader();
    const [smallModel, sourceModel] = await Promise.all([
      loader.loadAsync('assets/routing-cabled-e1.glb'),
      loader.loadAsync('assets/gerald-ldo.glb')
    ]);
    routing.clear(); ldo.clear();
    smallModel.scene.scale.setScalar(1000);
    smallModel.scene.position.set(-129, 0, -50.5);
    routing.add(smallModel.scene);
    sourceModel.scene.scale.setScalar(1000);
    sourceModel.scene.rotation.x = Math.PI;
    sourceModel.scene.position.set(-181.3, -0.1, 33.7);
    ldo.add(sourceModel.scene);
    window.LDO_CABLED_PREVIEW.nativeLoaded = true;
    window.LDO_CABLED_PREVIEW.geometryOnly = false;
    window.LDO_CABLED_PREVIEW.mechanicalOnly = false;
    window.LDO_CABLED_PREVIEW.proposedElectricalRouting = true;
    window.LDO_CABLED_PREVIEW.operationallyQualified = false;
    updateMode(false);
    status.hidden = true;
  } catch (error) {
    status.hidden = false;
    status.textContent = 'Native model unavailable; simplified source-envelope concept shown.';
    console.warn('Native LDO models:', error);
  }
}
function resize() {
  const width = stage.clientWidth, height = stage.clientHeight;
  renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
}
function animate() {
  controls.update(); scene.updateMatrixWorld(true);
  const placed = [];
  for (const entry of labels) {
    const visible = entry.modes.includes(mode) && entry.group.visible;
    entry.element.hidden = !visible;
    entry.connector.style.display = visible ? '' : 'none';
    if (!visible) continue;
    const point = entry.group.localToWorld(entry.point.clone()).project(camera);
    entry.element.hidden = point.z < -1 || point.z > 1;
    if (entry.element.hidden) { entry.connector.style.display = 'none'; continue; }
    const width = entry.element.offsetWidth, height = entry.element.offsetHeight;
    const x = Math.max(width / 2 + 8, Math.min(stage.clientWidth - width / 2 - 8, (point.x + 1) * stage.clientWidth / 2));
    const projectedY = (1 - point.y) * stage.clientHeight / 2;
    let y = projectedY;
    for (const offset of [0, -52, 52, -104, 104, -156, 156]) {
      y = Math.max(height / 2 + 8, Math.min(stage.clientHeight - height / 2 - 8, projectedY + offset));
      const rect = { left: x - width / 2, right: x + width / 2, top: y - height / 2, bottom: y + height / 2 };
      if (placed.every(other => rect.right + 5 < other.left || rect.left - 5 > other.right || rect.bottom + 5 < other.top || rect.top - 5 > other.bottom)) { placed.push(rect); break; }
    }
    entry.element.style.left = x + 'px';
    entry.element.style.top = y + 'px';
    const anchorX = (point.x + 1) * stage.clientWidth / 2;
    entry.leader.setAttribute('x1', anchorX); entry.leader.setAttribute('y1', projectedY);
    entry.leader.setAttribute('x2', x); entry.leader.setAttribute('y2', y);
    entry.dot.setAttribute('cx', anchorX); entry.dot.setAttribute('cy', projectedY);
  }
  renderer.render(scene, camera);
}
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.minDistance = 18; controls.maxDistance = 240;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x88959e, 2.8));
  const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(30, 60, 50); scene.add(light);
  const bottomLight = new THREE.DirectionalLight(0xffffff, 1.4); bottomLight.position.set(-20, -40, 10); scene.add(bottomLight);
  routing = new THREE.Group(); ldo = new THREE.Group(); cable = new THREE.Group(); guides = new THREE.Group();
  scene.add(routing, ldo, cable, guides);
  box(routing, 129, 0, 50.5, 18, 1.6, 25, 0x28858a);
  for (const [name, x, z] of [['J1', 130.85, 41.25], ['J19', 125, 60]]) {
    centreMark(routing, x, -1, z, 0xffffff);
    label(name + '<small>LDO socket centre</small>', local(x, -2, z), routing, ['routing']);
    centreMark(ldo, x, 1, z, 0xebf5e8);
  }
  label('18 × 25 mm<small>Provisional small-board envelope</small>', local(130, 1, 51), routing, ['routing']);
  label('Small routing board<small>J1 / J19 underneath</small>', local(129, 2, 46), routing, ['connection']);
  box(ldo, 128.2, 0, 41.3375, 18.3, 1.51, 42.025, 0x4a7d42);
  label('Existing LDO<small>Native source · connector bodies omitted</small>', local(128.2, -1, 41.3375), ldo, ['connection']);
  centreMark(ldo, 128.2, 1, 25.33, 0xffe0a8);
  label('J2 → ASIC<small>ASIC end stays outside small board</small>', local(128.2, -1, 25.33), ldo, ['connection']);
  line(cable, [local(175, 4, 35), local(159, 5, 31), local(145, 3, 32), local(129, 2, 38), local(129, 2, 49)], 0xb58a40, true);
  label('Cable → XEM8305<small>Custom FPC · far end TBD</small>', local(159, 9, 31), cable, ['connection']);
  line(routing, [local(121.2, 1, 46.35), local(136.8, 1, 46.35)], 0xb58a40, true);
  window.LDO_CABLED_PREVIEW = { revision: 'cabled-e1', geometryOnly: true, provisionalRoutingMm: [18, 25], sourceLdoMm: [18.3, 42.025], noCablePinout: true, mode, illustrativeGapMm: gap };
  resize(); updateMode(); renderer.setAnimationLoop(animate); status.textContent = 'Loading native PCB models…'; status.hidden = false; loadNativeGeometry();
  new ResizeObserver(resize).observe(stage);
} catch (error) {
  status.textContent = '3D is unavailable in this browser. The connection diagram remains below.';
  document.getElementById('fallback').hidden = false;
  document.querySelectorAll('[data-camera],#reset,#gap').forEach(button => button.disabled = true);
  console.error('LDO geometry preview:', error);
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode; cameraView = 'iso';
  const url = new URL(location.href); url.searchParams.set('view', mode); history.replaceState(null, '', url);
  updateMode();
}));
document.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => { cameraView = button.dataset.camera; updateMode(); }));
document.getElementById('reset').addEventListener('click', () => { cameraView = 'iso'; updateMode(); });
gapInput.addEventListener('input', () => { gap = Number(gapInput.value); document.getElementById('gap-value').value = gap + ' mm'; updateMode(false); });
updateMode();
