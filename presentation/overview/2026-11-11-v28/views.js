// Site root V29 views: system overview, board comments and board pages on one page (no slideshow).
(() => {
  const views = [...document.querySelectorAll('.view')];
  const load = v => v.querySelectorAll('iframe').forEach(f => { const live = f.closest('.overview-3d') ? !f.closest('[hidden]') : !!f.closest('.panel.active'); if (live && !f.getAttribute('src') && f.dataset.src) f.src = f.dataset.src; });
  const unload = v => v.querySelectorAll('iframe').forEach(f => { if (f.id === 'overview-frame' || f.id === 'print-frame') return; const u = f.getAttribute('src'); if (u && u !== 'about:blank') { if (!f.dataset.src) f.dataset.src = u; f.removeAttribute('src'); } });
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'overview';
    let id = 'overview', tab = null;
    if (h.startsWith('comments/')) { id = 'comments'; tab = h.slice(9); }
    else if (h.startsWith('board/')) id = 'board-' + h.slice(6);
    if (!document.getElementById('view-' + id)) id = 'overview';
    views.forEach(v => { const on = v.dataset.viewId === id; v.classList.toggle('active', on); if (!on) unload(v); });
    const cur = document.getElementById('view-' + id);
    if (tab) { const b = cur.querySelector('[data-view="cm-' + tab + '"]'); if (b) b.click(); }
    load(cur);
    const t = cur.querySelector('h1'); document.title = (id === 'overview' ? '' : (t ? t.textContent + ' · ' : '')) + '4K neural recording · System overview';
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.view .switch').forEach(group => group.querySelectorAll('button').forEach(btn => btn.onclick = () => {
    const view = group.closest('.view');
    group.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    view.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === btn.dataset.view));
    load(view);
    if (view.dataset.viewId === 'comments' && btn.dataset.view.startsWith('cm-')) history.replaceState(null, '', '#comments/' + btn.dataset.view.slice(3));
  }));
  document.querySelectorAll('[data-pan]').forEach(d => { let x = 0, y = 0, s = 1, st = null; const img = () => d.querySelector('.canvas img');
    const up = () => { const i = img(); i.style.setProperty('--x', x + 'px'); i.style.setProperty('--y', y + 'px'); i.style.setProperty('--s', s); };
    const fit = () => { x = 0; y = 0; s = 1; up(); };
    d.querySelector('[data-zoom=in]').onclick = () => { s = Math.min(12, s * 1.3); up(); };
    d.querySelector('[data-zoom=out]').onclick = () => { s = Math.max(.5, s / 1.3); up(); };
    d.querySelector('[data-zoom=fit]').onclick = fit;
    d.querySelector('[data-expand]').onclick = e => { d.classList.toggle('expanded'); e.target.textContent = d.classList.contains('expanded') ? 'Close' : 'Expand'; fit(); };
    const c = d.querySelector('.canvas');
    c.addEventListener('wheel', e => { e.preventDefault(); s = Math.max(.5, Math.min(12, s * (e.deltaY < 0 ? 1.12 : 1 / 1.12))); up(); }, {passive: false});
    c.addEventListener('pointerdown', e => { st = {x: e.clientX - x, y: e.clientY - y}; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => { if (!st) return; x = e.clientX - st.x; y = e.clientY - st.y; up(); });
    c.addEventListener('pointerup', () => st = null); d.addEventListener('change', fit); });
  document.querySelectorAll('select[data-swap]').forEach(s => s.onchange = e => { const i = s.closest('.drawing').querySelector('.canvas img'); i.src = e.target.value; i.alt = e.target.selectedOptions[0].textContent; });
  document.querySelectorAll('select[data-frame-swap]').forEach(s => s.onchange = () => { const p = s.closest('.native-layout-panel'), f = p.querySelector('iframe'), l = p.querySelector('a[target=_blank]'); f.dataset.src = s.value; f.src = s.value; if (l) l.href = s.value.replace('?embed=1', ''); });
  document.querySelectorAll('[data-frame-expand]').forEach(b => b.onclick = () => { const p = b.closest('.native-layout-panel'); p.classList.toggle('expanded'); b.textContent = p.classList.contains('expanded') ? 'Close' : 'Expand'; });
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return;
    document.querySelectorAll('.drawing.expanded').forEach(d => { d.classList.remove('expanded'); d.querySelector('[data-expand]').textContent = 'Expand'; });
    document.querySelectorAll('.native-layout-panel.expanded').forEach(p => { p.classList.remove('expanded'); p.querySelector('[data-frame-expand]').textContent = 'Expand'; }); });
  window.addEventListener('hashchange', route); route();
})();
