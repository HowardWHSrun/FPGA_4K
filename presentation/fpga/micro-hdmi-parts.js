(() => {
  const input = document.getElementById('parts-search');
  const count = document.getElementById('parts-count');
  const rows = [...document.querySelectorAll('#purchase-parts tbody tr')];
  if (!input || !count || !rows.length) return;
  const update = () => {
    const term = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const row of rows) {
      row.hidden = !!term && !row.textContent.toLocaleLowerCase().includes(term);
      if (!row.hidden) visible += 1;
    }
    count.value = `${visible} of ${rows.length} part lines`;
  };
  input.addEventListener('input', update);
  update();
})();
