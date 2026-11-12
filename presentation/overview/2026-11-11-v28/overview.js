// Site root overview V28: copy of the 11 Nov deck overview.js with repo-root asset paths.
(() => {
  const frame = document.getElementById('overview-frame');
  const printFrame = document.getElementById('print-frame');
  const overviewBox = frame.closest('.overview-3d'), printBox = printFrame.closest('.overview-3d');
  const buttons = [...document.querySelectorAll('.approach-switch button')];
  let approach = 'custom', printModel = 'stack';
  const post = msg => frame.contentWindow && frame.contentWindow.postMessage(msg, location.origin);
  const postPrint = msg => printFrame.contentWindow && printFrame.contentWindow.postMessage(msg, location.origin);
  function markPrint(key) { document.querySelectorAll('.name-list button[data-print]').forEach(b => b.classList.toggle('active', b.dataset.print === key)); }
  function setApproach(next) {
    approach = next;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.approach === next)));
    document.querySelectorAll('.name-list').forEach(l => l.hidden = l.dataset.list !== (next === 'head' ? 'custom' : next));
    document.querySelectorAll('.name-list button[data-key]').forEach(b => b.classList.remove('active'));
    const print = next === 'print';
    overviewBox.hidden = print; printBox.hidden = !print;
    if (print) {
      // Printable actual-size models: separate viewer, loaded on first use.
      if (!printFrame.getAttribute('src')) printFrame.src = 'presentation/meetings/2026-11-11-v1/assets/print-models/index.html?embed=1&v=2&model=' + printModel;
      markPrint(printModel);
      return;
    }
    if (!frame.getAttribute('src')) frame.src = 'presentation/meetings/2026-11-11-v1/assets/overview-3d/index.html?embed=1&approach=' + next;
    else post({type: 'overview-set-approach', value: next});
  }
  buttons.forEach(b => b.onclick = () => {
    setApproach(b.dataset.approach);
    const u = new URL(location.href); u.searchParams.set('approach', b.dataset.approach); history.replaceState(null, '', u);
  });
  document.querySelectorAll('.name-list button[data-key]').forEach(b => b.onclick = () => {
    document.querySelectorAll('.name-list button[data-key]').forEach(x => x.classList.toggle('active', x === b));
    post({type: 'overview-focus', key: b.dataset.key});
  });
  document.querySelectorAll('.name-list button[data-print]').forEach(b => b.onclick = () => {
    printModel = b.dataset.print; markPrint(printModel);
    postPrint({type: 'print-set-model', key: printModel});
  });
  window.addEventListener('message', e => {
    if (e.origin !== location.origin) return;
    const d = e.data || {};
    if (e.source === printFrame.contentWindow) {
      if (d.type === 'print-model') { printModel = d.key; markPrint(d.key); }
      return;
    }
    if (e.source !== frame.contentWindow) return;
    if (d.type === 'overview-select') document.querySelectorAll('.name-list button[data-key]').forEach(b => b.classList.toggle('active', b.dataset.key === d.key));
    if (d.type === 'overview-hello' || (d.type === 'overview-approach' && d.value !== approach)) post({type: 'overview-set-approach', value: approach});
  });
  // ?approach=head|direct|print preselects that view; custom is the default.
  const initial = new URLSearchParams(location.search).get('approach');
  if (['head', 'direct', 'print'].includes(initial)) setApproach(initial);
})();
