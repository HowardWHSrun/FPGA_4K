(() => {
  const native = document.getElementById('native-board');
  const three = document.getElementById('three-board');
  for (const button of document.querySelectorAll('[data-view]')) {
    button.addEventListener('click', () => {
      const showThree = button.dataset.view === '3d';
      window.DEFERRED_VIEWERS?.setVisible(native, !showThree);
      window.DEFERRED_VIEWERS?.setVisible(three, showThree);
      for (const tab of document.querySelectorAll('[data-view]')) tab.setAttribute('aria-pressed', String(tab === button));
    });
  }
  const input = document.getElementById('parts-search');
  const output = document.getElementById('parts-count');
  const rows = [...document.querySelectorAll('#purchase-parts tbody tr')];
  if (!input || !output) return;
  const total = rows.reduce((sum, row) => sum + Number(row.dataset.qty || 0), 0);
  document.getElementById('part-line-count').textContent = String(rows.length);
  document.getElementById('part-ref-count').textContent = String(total);
  const update = () => {
    const term = input.value.trim().toLocaleLowerCase();
    let shown = 0;
    for (const row of rows) {
      row.hidden = Boolean(term) && !row.textContent.toLocaleLowerCase().includes(term);
      if (!row.hidden) shown += 1;
    }
    output.value = `${shown} of ${rows.length} part lines`;
  };
  input.addEventListener('input', update);
  update();
})();
