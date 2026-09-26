(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const viewport = get('viewport');
  const image = get('board-image');
  const transform = get('board-transform');
  const state = {mode: 'front', zoom: 1, x: 0, y: 0};
  const touches = new Map();
  const limits = {min: 0.5, max: 12};
  let previous = null;
  let imageRequest = 0;
  const views = {
    front: {src: 'assets/core-front.svg', caption: 'KiCad export · front copper + fabrication · inner layers omitted', alt: 'Front of the actual current XC7A100T core PCB, with its existing copper and component geometry'},
    back: {src: 'assets/core-back.svg', caption: 'KiCad export · mirrored back copper + fabrication · inner layers omitted', alt: 'Mirrored back of the actual current XC7A100T core PCB, with its existing copper and component geometry'}
  };
  function updateTransform() {
    transform.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
    get('zoom-value').textContent = `${Math.round(state.zoom * 100)}%`;
  }
  function fit() {
    state.zoom = 1;
    state.x = 0;
    state.y = 0;
    updateTransform();
  }
  function zoom(factor, anchor) {
    const before = state.zoom;
    const after = Math.max(limits.min, Math.min(limits.max, before * factor));
    if (anchor) {
      const bounds = viewport.getBoundingClientRect();
      const centerX = transform.offsetLeft + transform.offsetWidth / 2;
      const centerY = transform.offsetTop + transform.offsetHeight / 2;
      const x = anchor[0] - bounds.left - centerX;
      const y = anchor[1] - bounds.top - centerY;
      state.x = x - (x - state.x) * after / before;
      state.y = y - (y - state.y) * after / before;
    }
    state.zoom = after;
    updateTransform();
  }
  async function selectView(mode) {
    if (!['front', 'back', 'native'].includes(mode)) return;
    state.mode = mode;
    for (const name of ['front', 'back', 'native']) get(name).setAttribute('aria-pressed', String(name === mode));
    viewport.hidden = mode === 'native';
    get('native-panel').hidden = mode !== 'native';
    get('view-help').textContent = mode === 'native' ? 'Layers · components · nets' : 'Drag to pan · scroll to zoom';
    if (mode === 'native') {
      const frame = get('native-frame');
      if (!frame.src) frame.src = frame.dataset.src;
      get('view-caption').textContent = 'Current core · read-only native KiCad board';
      get('board-enlarge').href = 'viewer/?board=core';
      get('board-enlarge').textContent = 'Full viewer ↗';
      return;
    }
    const requested = ++imageRequest;
    image.src = views[mode].src;
    image.alt = views[mode].alt;
    get('view-caption').textContent = views[mode].caption;
    get('board-enlarge').href = '../../hardware/fpga-100t-review/output/FPGA100T_Minimal_PCB.svg';
    get('board-enlarge').textContent = 'Both sides ↗';
    get('image-state').textContent = 'Loading current KiCad layout…';
    get('image-state').hidden = false;
    fit();
    try {
      await image.decode();
      if (requested === imageRequest) get('image-state').hidden = true;
    } catch {
      if (requested === imageRequest) get('image-state').textContent = 'The layout could not be loaded. Open the native KiCad viewer or download the complete project.';
    }
  }
  for (const mode of ['front', 'back', 'native']) get(mode).addEventListener('click', () => selectView(mode));
  get('zoom-in').addEventListener('click', () => zoom(1.25));
  get('zoom-out').addEventListener('click', () => zoom(0.8));
  get('fit').addEventListener('click', fit);
  function gesture() {
    const points = [...touches.values()];
    if (points.length >= 2) return {x: (points[0][0] + points[1][0]) / 2, y: (points[0][1] + points[1][1]) / 2, distance: Math.hypot(points[0][0] - points[1][0], points[0][1] - points[1][1])};
    return points.length ? {x: points[0][0], y: points[0][1], distance: 0} : null;
  }
  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('button, a') || event.button !== 0) return;
    touches.set(event.pointerId, [event.clientX, event.clientY]);
    previous = gesture();
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('dragging');
    viewport.focus({preventScroll: true});
  });
  viewport.addEventListener('pointermove', event => {
    if (!touches.has(event.pointerId)) return;
    touches.set(event.pointerId, [event.clientX, event.clientY]);
    const next = gesture();
    if (previous && next) {
      state.x += next.x - previous.x;
      state.y += next.y - previous.y;
      if (previous.distance > 0 && next.distance > 0) zoom(next.distance / previous.distance, [next.x, next.y]);
      else updateTransform();
    }
    previous = next;
  });
  function finishPointer(event) {
    touches.delete(event.pointerId);
    previous = gesture();
    if (!touches.size) viewport.classList.remove('dragging');
  }
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(event, finishPointer);
  viewport.addEventListener('wheel', event => {
    event.preventDefault();
    const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    zoom(Math.exp(-event.deltaY * units * 0.0015), [event.clientX, event.clientY]);
  }, {passive: false});
  viewport.addEventListener('keydown', event => {
    if (event.target.closest('button, a')) return;
    if (event.key === '+' || event.key === '=') zoom(1.25);
    else if (event.key === '-') zoom(0.8);
    else if (event.key === '0' || event.key.toLowerCase() === 'f') fit();
    else if (event.key === 'ArrowLeft') state.x -= 35;
    else if (event.key === 'ArrowRight') state.x += 35;
    else if (event.key === 'ArrowUp') state.y -= 35;
    else if (event.key === 'ArrowDown') state.y += 35;
    else return;
    event.preventDefault();
    updateTransform();
  });
  const present = get('present-board');
  present.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else window.open('viewer/?board=core', '_blank', 'noopener');
    } catch {
      window.open('viewer/?board=core', '_blank', 'noopener');
    }
  });
  document.addEventListener('fullscreenchange', () => {present.textContent = document.fullscreenElement ? 'Exit present ⛶' : 'Present ⛶';});
  window.FPGA_BOARD = Object.freeze({getState: () => ({...state}), fit, selectView});
  selectView('front');
})();
