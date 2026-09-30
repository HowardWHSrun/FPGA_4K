(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const sections = [...document.querySelectorAll('.gallery-section')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    sections.forEach(section => { section.hidden = button.dataset.filter !== 'all' && section.dataset.category !== button.dataset.filter; });
  }));
  const dialog = document.querySelector('#figure-dialog');
  let trigger;
  document.querySelectorAll('.figure-open').forEach(button => button.addEventListener('click', () => {
    trigger = button;
    document.querySelector('#large-figure').src = button.dataset.full;
    document.querySelector('#large-figure').alt = button.dataset.title;
    document.querySelector('#figure-title').textContent = button.dataset.title;
    document.querySelector('#figure-source').href = button.dataset.full;
    dialog.showModal();
  }));
  document.querySelector('#close-figure').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger?.focus({preventScroll: true}));
})();
