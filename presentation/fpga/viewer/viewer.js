const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const embedded = params.get('embed') === '1';
let board, nativeViewer, boardApp;
let generation = 0;
const diagnostics = window.pcbViewerDiagnostics = { ready: false, nativeCounts: null, sourceHash: null, error: null };

function inside(root, selector) {
  const match = root.querySelector(selector);
  if (match) return match;
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) {
      const nested = inside(element.shadowRoot, selector);
      if (nested) return nested;
    }
  }
  return null;
}
function setStatus(message) { $('#load-status').textContent = message; }
function fitBoard() { if (nativeViewer) { nativeViewer.zoom_to_board(); nativeViewer.draw(); } }
function showError(error) {
  diagnostics.ready = false;
  diagnostics.error = String(error?.message ?? error);
  $('#canvas-host').setAttribute('aria-busy', 'false');
  setStatus('Interactive view unavailable. The original files remain available.');
  const alert = $('#load-error');
  alert.replaceChildren(document.createTextNode('The interactive board could not load. '));
  const fallback = document.createElement('a');
  fallback.href = board?.svg || board?.zip || '../../../hardware/fpga-100t-review/FPGA100T_Review_Project.zip';
  fallback.textContent = board?.svg ? 'Open the static vector view' : 'Download the complete KiCad project';
  alert.append(fallback, document.createTextNode(' or use the native files below. Reload this page to retry.'));
  alert.hidden = false;
  document.querySelectorAll('[data-needs-board]').forEach(button => button.disabled = true);
}
function nativeCounts(doc) {
  return {
    footprints: doc.footprints.length,
    pads: doc.footprints.reduce((sum, footprint) => sum + footprint.pads.length, 0),
    segments: doc.segments.length,
    vias: doc.vias.length,
    zones: doc.zones.length,
    fpgaPads: doc.footprints.find(footprint => footprint.reference === 'U1')?.pads.length ?? 0,
    copperLayers: doc.layers.filter(layer => layer.canonical_name.endsWith('.Cu')).length,
    nets: doc.nets.length,
  };
}
async function waitForNative(embed, token) {
  const deadline = performance.now() + 45000;
  while (performance.now() < deadline) {
    if (token !== generation) return null;
    const element = inside(embed.shadowRoot || embed, 'kc-board-viewer');
    if (element?.loaded && element.viewer?.document && element.viewer?.viewport?.camera) return element;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Native board load timed out.');
}
async function loadBoard(selected) {
  const token = ++generation;
  board = selected;
  diagnostics.ready = false;
  diagnostics.error = null;
  diagnostics.board = board.id;
  nativeViewer = null;
  boardApp = null;
  $('#load-error').hidden = true;
  $('#board-choice').value = board.id;
  $('#board-description').textContent = board.description;
  $('#native-file').href = board.native;
  $('#project-zip').href = board.zip;
  const pathname = new URL(board.native, location.href).pathname;
  const path = pathname.slice(pathname.indexOf('/hardware/') + '/hardware/'.length);
  $('#github-file').href = `https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/hardware/${path}`;
  $('#static-view').hidden = !board.svg;
  if (board.svg) $('#static-view').href = board.svg;
  $('#standalone').href = `./?board=${board.id}`;
  $('#identity').textContent = `${board.native.split('/').at(-1)} · SHA-256 ${board.sha256}`;
  $('#canvas-host').setAttribute('aria-busy', 'true');
  document.querySelectorAll('[data-needs-board]').forEach(button => button.disabled = true);
  setStatus('Checking and loading the native KiCad file…');
  try {
    const response = await fetch(board.native);
    if (!response.ok) throw new Error(`Native file returned HTTP ${response.status}.`);
    const bytes = await response.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== board.sha256) throw new Error('Native file differs from the reviewed source hash.');
    if (token !== generation) return;
    diagnostics.sourceHash = hash;
    await import('./vendor/kicanvas.js');
    // The published KiCanvas alpha uses a sprite URL that does not resolve when embedded.
    // Pin it to the unchanged local upstream SVG; native CAD data is never transformed.
    customElements.get('kc-ui-icon').sprites_url = new URL('./vendor/sprites.svg', import.meta.url).href;
    const embed = document.createElement('kicanvas-embed');
    embed.setAttribute('src', board.native);
    embed.setAttribute('controls', 'full');
    embed.setAttribute('controlslist', 'nooverlay');
    $('#canvas-host').replaceChildren(embed);
    const nativeElement = await waitForNative(embed, token);
    if (!nativeElement || token !== generation) return;
    nativeViewer = nativeElement.viewer;
    boardApp = inside(embed.shadowRoot, 'kc-board-app');
    const counts = nativeCounts(nativeViewer.document);
    for (const [key, value] of Object.entries(board.expected)) {
      if (counts[key] !== value) throw new Error(`Native ${key} count differs from the reviewed board.`);
    }
    diagnostics.nativeCounts = counts;
    // Pinned alpha adapter: fit the outline, rather than the default A4 drawing sheet.
    // These observed methods are checked by scripts/check_fpga_viewer.mjs on all boards.
    nativeElement.theme = 'kicad';
    nativeElement.update_theme();
    nativeViewer.paint();
    for (const layer of nativeViewer.layers.in_ui_order()) {
      layer.visible = ['F.Cu', 'F.SilkS', 'Edge.Cuts'].includes(layer.name);
    }
    const layerPanel = inside(embed.shadowRoot, 'kc-board-layers-panel');
    layerPanel?.update_item_states();
    nativeViewer.page_opacity = 0;
    fitBoard();
    document.querySelectorAll('[data-needs-board]').forEach(button => button.disabled = false);
    $('#canvas-host').setAttribute('aria-busy', 'false');
    setStatus(`${board.title} · ${counts.footprints} parts · ${counts.segments} tracks · Ctrl + scroll to zoom`);
    diagnostics.ready = true;
    document.dispatchEvent(new CustomEvent('pcbviewer:ready', {detail: diagnostics}));
  } catch (error) { if (token === generation) showError(error); }
}
$('#fit').addEventListener('click', fitBoard);
$('#zoom-in').addEventListener('click', () => { if (nativeViewer) { nativeViewer.viewport.camera.zoom *= 1.35; nativeViewer.draw(); } });
$('#zoom-out').addEventListener('click', () => { if (nativeViewer) { nativeViewer.viewport.camera.zoom /= 1.35; nativeViewer.draw(); } });
$('#flip').addEventListener('click', () => nativeViewer?.flip_view());
for (const [button, activity] of [['layers', 'layers'], ['parts', 'footprints'], ['nets', 'nets']]) {
  $(`#${button}`).addEventListener('click', () => boardApp?.change_activity(activity));
}
$('#fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('#viewer-shell').requestFullscreen();
  } catch {
    setStatus('Full screen is unavailable here. Open the full viewer for more space.');
  }
});
document.addEventListener('fullscreenchange', () => {
  $('#fullscreen').textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  requestAnimationFrame(() => requestAnimationFrame(fitBoard));
});
if (!document.fullscreenEnabled) $('#fullscreen').hidden = true;
try {
  const response = await fetch('./boards.json');
  if (!response.ok) throw new Error('Board index unavailable.');
  const {boards} = await response.json();
  const selected = boards.find(item => item.id === params.get('board')) || boards[0];
  $('#board-choice').addEventListener('change', () => {
    const choice = boards.find(item => item.id === $('#board-choice').value);
    const url = new URL(location.href);
    url.searchParams.set('board', choice.id);
    history.replaceState(null, '', url);
    loadBoard(choice);
  });
  await loadBoard(selected);
} catch (error) { showError(error); }
