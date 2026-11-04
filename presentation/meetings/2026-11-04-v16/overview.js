(() => {
  const frame = document.getElementById('overview-frame');
  const buttons = [...document.querySelectorAll('.approach-switch button')];
  let approach = 'custom';
  const post = msg => frame.contentWindow && frame.contentWindow.postMessage(msg, location.origin);
  function setApproach(next) {
    approach = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.approach === next)));
    document.querySelectorAll('.name-list').forEach(l => l.hidden = l.dataset.list !== next);
    document.querySelectorAll('.name-list button[data-key]').forEach(b => b.classList.remove('active'));
    if (!frame.src) frame.dataset.src = 'assets/overview-3d/index.html?embed=1&approach=' + next;
    else post({type: 'overview-set-approach', value: next});
  }
  buttons.forEach(b => b.onclick = () => setApproach(b.dataset.approach));
  document.querySelectorAll('.name-list button[data-key]').forEach(b => b.onclick = () => {
    document.querySelectorAll('.name-list button[data-key]').forEach(x => x.classList.toggle('active', x === b));
    post({type: 'overview-focus', key: b.dataset.key});
  });
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== frame.contentWindow) return;
    const d = e.data || {};
    if (d.type === 'overview-select') document.querySelectorAll('.name-list button[data-key]').forEach(b => b.classList.toggle('active', b.dataset.key === d.key));
    if (d.type === 'overview-hello' || (d.type === 'overview-approach' && d.value !== approach)) post({type: 'overview-set-approach', value: approach});
  });
})();
