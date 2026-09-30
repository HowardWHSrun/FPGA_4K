const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const board = params.get('board') === 'fpga25t' ? 'fpga25t' : 'adapter';
if (params.get('embed') === '1') document.body.classList.add('embed');
const stage = $('stage'), paper = $('paper'), wrap = $('paper-wrap');
let config, page = 0, zoom = 1, ratio = 420 / 297, pointer;
const zoomSteps = [1, 1.5, 2, 3, 4, 6, 8];
function sizeSheet(center = false) {
  const base = Math.max(120, Math.min(stage.clientWidth - 32, (stage.clientHeight - 32) * ratio));
  const width = base * zoom, height = width / ratio;
  paper.style.width = `${width}px`;
  paper.style.height = `${height}px`;
  wrap.style.width = `${Math.max(stage.clientWidth, width + 32)}px`;
  wrap.style.height = `${Math.max(stage.clientHeight, height + 32)}px`;
  $('zoom-value').textContent = `${Math.round(zoom * 100)}%`;
  $('zoom-out').disabled = zoom <= 1;
  $('zoom-in').disabled = zoom >= 8;
  if (center) { stage.scrollLeft = (wrap.clientWidth - stage.clientWidth) / 2; stage.scrollTop = (wrap.clientHeight - stage.clientHeight) / 2; }
}
function setZoom(value) { zoom = Math.max(1, Math.min(8, value)); sizeSheet(true); }
function zoomBy(direction) {
  const steps = direction > 0 ? zoomSteps : [...zoomSteps].reverse();
  setZoom(steps.find(value => direction > 0 ? value > zoom : value < zoom) ?? zoom);
}
function showPage(index) {
  page = Math.max(0, Math.min(config.sheets.length - 1, index));
  const sheet = config.sheets[page];
  $('sheet').value = String(page);
  $('previous').disabled = page === 0;
  $('next').disabled = page === config.sheets.length - 1;
  $('loading').hidden = false;
  paper.alt = `${config.title}, sheet ${page + 1}: ${sheet.title}`;
  paper.src = sheet.file;
  zoom = 1; sizeSheet(true);
  const next = new URLSearchParams(location.search); next.set('board', board); next.set('sheet', String(page + 1));
  history.replaceState(null, '', `${location.pathname}?${next}`);
}
paper.addEventListener('load', () => { ratio = paper.naturalWidth / paper.naturalHeight; $('loading').hidden = true; sizeSheet(true); });
paper.addEventListener('error', () => { $('loading').textContent = 'This sheet could not load. Use Open PDF to view the complete schematic.'; });
$('previous').addEventListener('click', () => showPage(page - 1));
$('next').addEventListener('click', () => showPage(page + 1));
$('sheet').addEventListener('change', event => showPage(Number(event.target.value)));
$('zoom-in').addEventListener('click', () => zoomBy(1));
$('zoom-out').addEventListener('click', () => zoomBy(-1));
$('fit').addEventListener('click', () => setZoom(1));
stage.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
  pointer = {id: event.pointerId, x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop};
  stage.setPointerCapture(event.pointerId); stage.classList.add('dragging'); event.preventDefault();
});
stage.addEventListener('pointermove', event => { if (!pointer) return; stage.scrollLeft = pointer.left - event.clientX + pointer.x; stage.scrollTop = pointer.top - event.clientY + pointer.y; });
function release() { pointer = undefined; stage.classList.remove('dragging'); }
stage.addEventListener('pointerup', release); stage.addEventListener('pointercancel', release);
stage.addEventListener('keydown', event => {
  if (!config) return;
  if (event.key === 'ArrowRight') showPage(page + 1);
  else if (event.key === 'ArrowLeft') showPage(page - 1);
  else if (event.key === '+' || event.key === '=') zoomBy(1);
  else if (event.key === '-') zoomBy(-1);
  else if (event.key === '0') setZoom(1);
  else return;
  event.preventDefault();
});
new ResizeObserver(() => sizeSheet()).observe(stage);
try {
  const response = await fetch('sheets.json'); if (!response.ok) throw new Error('manifest unavailable');
  const all = await response.json(); config = all[board];
  document.title = `${config.title} schematic | FPGA 4K`;
  $('title').textContent = config.title; $('status').textContent = config.status;
  $('back').href = config.back; $('pdf').href = config.pdf;
  if (document.body.classList.contains('embed')) $('pdf').target = '_blank';
  config.sheets.forEach((sheet, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `${String(index + 1).padStart(2, '0')} / ${sheet.title}`; $('sheet').append(option); });
  showPage((Number(params.get('sheet')) || 1) - 1);
} catch (error) { $('loading').textContent = 'Schematic viewer could not load. Open the board page for its PDF.'; console.error(error); }
window.SCHEMATIC_VIEWER = {getState: () => ({board, page: page + 1, zoom, count: config?.sheets.length}), showPage, setZoom};
