/* Read-only viewer of the published KiCad plots. No CAD geometry is regenerated. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('embed') === '1') document.documentElement.dataset.embed = '1';
  const root = '../../../hardware/xem8305-carrier/dated/2026-10-18/v41/';
  const plots = root + 'output/layers/CARRIER_XEM8305_V41_Sourcing_Alternates-';
  const repo = 'https://github.com/HowardWHSrun/FPGA_4K/blob/presentation/hardware/xem8305-carrier/dated/2026-10-18/v41/';
  const layers = {
    'F.Cu': { file:'F_Cu', title:'L1 · top copper', description:'Outer-layer tracks, component pads and local copper pours. The saved zones include DGND, XEM_1V8 and VDCIN. Inspect the copper around each pad and the vias that carry its connection into the board.' },
    'In1.Cu': { file:'In1_Cu', title:'L2 · DGND reference plane', description:'A broad DGND pour provides a nearby return reference for routing on the upper layers. It is useful even with few routed tracks: connections enter through ground vias and through-hole pads. The openings and voids are the actual saved fill, not missing artwork.' },
    'In2.Cu': { file:'In2_Cu', title:'L3 · inner signal routing', description:'An internal routing layer used to carry signal connections between via transitions. Compare it with L2 and L4 while tracing a route. The plot alone does not demonstrate a continuous return path at every transition.' },
    'In3.Cu': { file:'In3_Cu', title:'L4 · power distribution', description:'Inner tracks and saved VDCIN, BUCK_3V3 and LDO_3V3 pours distribute power between supply sections and connector loads. These are distinct nets: similar-looking copper regions must not be interpreted as one supply.' },
    'In4.Cu': { file:'In4_Cu', title:'L5 · DGND reference plane', description:'A second broad DGND pour references routing on the lower side of the stack. Ground vias connect return copper across layers. Few tracks on this plane are expected; electrical usefulness depends on its continuity and the placement of return connections.' },
    'B.Cu': { file:'B_Cu', title:'L6 · bottom copper', description:'The busiest outer routing layer, including the USB/JTAG area and routes to the XEM connectors. Saved pours include DGND, VDCIN, BUCK_3V3 and LDO_3V3. Use Bottom silkscreen for component-reference context.' }
  };
  const $ = id => document.getElementById(id);
  const stage = $('stage'), board = $('board'), copper = $('copper');
  let active = layers[params.get('layer')] ? params.get('layer') : 'F.Cu';
  let mirror = params.get('side') === 'bottom', zoom = 1, panX = 0, panY = 0, baseScale = 1;
  let drag = null, request = 0;

  document.querySelectorAll('[data-file]').forEach(a => a.href = root + a.dataset.file);
  $('context-link').href = repo + 'Review_Context.md';
  $('factory-link').href = repo + 'Factory_Review_Requirements.md';
  const setStatus = (text, error = false) => { $('status').textContent = text; $('status').hidden = false; $('status').toggleAttribute('data-error', error); };

  function draw() {
    board.style.transform = `translate(-50%,-50%) translate(${panX}px,${panY}px) scale(${zoom})`;
    $('board-orientation').style.transform = mirror ? 'scaleX(-1)' : '';
    $('scale-line').style.width = `${10 * baseScale * zoom}px`;
    $('orientation').setAttribute('aria-pressed', String(mirror));
    $('orientation').textContent = mirror ? 'Underside view' : 'Top view';
    $('view-name').textContent = mirror ? 'Looking from underside · mirrored' : 'Looking from top · not mirrored';
  }
  function resize() {
    baseScale = Math.max(.25, Math.min((stage.clientWidth - 70) / 52.9844, (stage.clientHeight - 48) / 82.9818));
    board.style.width = `${52.9844 * baseScale}px`;
    board.style.height = `${82.9818 * baseScale}px`;
    draw();
  }
  function fit() { zoom = 1; panX = 0; panY = 0; draw(); }
  function zoomTo(value, x = 0, y = 0) {
    const next = Math.max(1, Math.min(14, value)), ratio = next / zoom;
    panX = x - (x - panX) * ratio;
    panY = y - (y - panY) * ratio;
    zoom = next;
    draw();
  }
  function silk() {
    const image = $('silk');
    image.hidden = !$('show-silk').checked;
    if (!image.hidden) image.src = plots + $('silk-side').value + '_Silkscreen.svg';
  }
  function selectLayer(name) {
    active = name;
    const data = layers[name], currentRequest = ++request;
    setStatus('Loading native V41 layer…');
    document.querySelectorAll('[data-layer]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layer === name)));
    $('layer-title').textContent = data.title;
    $('layer-description').textContent = data.description;
    $('layer-name').textContent = data.title.split(' · ')[0] + ' · ' + name;
    const url = plots + data.file + '.svg';
    copper.onload = () => { if (currentRequest === request) $('status').hidden = true; };
    copper.onerror = () => { if (currentRequest === request) setStatus('The V41 plot could not load. Open the selected SVG below, or download the KiCad review ZIP.', true); };
    copper.src = url;
    copper.alt = 'Saved V41 native KiCad plot: ' + data.title;
    $('original-svg').href = url;
    if (name === 'B.Cu') $('silk-side').value = 'B';
    else if (name === 'F.Cu') $('silk-side').value = 'F';
    silk();
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('layer', name);
    history.replaceState(null, '', '?' + nextParams.toString());
  }
  document.querySelectorAll('[data-layer]').forEach(b => b.addEventListener('click', () => selectLayer(b.dataset.layer)));
  $('show-silk').addEventListener('change', silk);
  $('silk-side').addEventListener('change', silk);
  $('orientation').addEventListener('click', () => { mirror = !mirror; panX = -panX; draw(); });
  $('zoom-in').addEventListener('click', () => zoomTo(zoom * 1.4));
  $('zoom-out').addEventListener('click', () => zoomTo(zoom / 1.4));
  $('reset-view').addEventListener('click', fit);
  const regions = { ldo:[30,8,3], regulator:[17,30,3.1], usb:[29,66,2.8], connectors:[27,61,1.4] };
  document.querySelectorAll('[data-region]').forEach(b => b.addEventListener('click', () => {
    const [x,y,z] = regions[b.dataset.region];
    zoom = z;
    panX = (26.4922 - x) * baseScale * zoom * (mirror ? -1 : 1);
    panY = (41.4909 - y) * baseScale * zoom;
    draw();
  }));
  stage.addEventListener('pointerdown', e => { if (e.button !== 0) return; drag = {x:e.clientX,y:e.clientY,px:panX,py:panY,id:e.pointerId}; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; panX = drag.px + e.clientX - drag.x; panY = drag.py + e.clientY - drag.y; draw(); });
  const release = e => { if (drag?.id === e.pointerId) drag = null; };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomTo(zoom * Math.exp(-e.deltaY * .0015), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
  }, { passive:false });
  stage.addEventListener('keydown', e => {
    let used = true;
    if (e.key === '+' || e.key === '=') zoomTo(zoom * 1.4);
    else if (e.key === '-') zoomTo(zoom / 1.4);
    else if (e.key === '0') fit();
    else if (e.key === 'ArrowLeft') panX += 25;
    else if (e.key === 'ArrowRight') panX -= 25;
    else if (e.key === 'ArrowUp') panY += 25;
    else if (e.key === 'ArrowDown') panY -= 25;
    else used = false;
    if (used) { e.preventDefault(); draw(); }
  });
  new ResizeObserver(resize).observe(stage);
  selectLayer(active);
  resize();
})();
