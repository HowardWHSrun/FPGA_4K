/* R12 overview: switch explanations without modifying native CAD. */
(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-view]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  function select(view, focus = false) {
    const selected = tabs.find(tab => tab.dataset.view === view) || tabs[0];
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== selected.getAttribute('aria-controls'); });
    if (focus) selected.focus();
    return selected.dataset.view;
  }
  function activate(view, focus = false) {
    const selected = select(view, focus);
    history.replaceState(null, '', `#${selected}`);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.view));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(tabs[next].dataset.view, true);
    });
  });
  window.addEventListener('hashchange', () => {
    const view = location.hash.slice(1);
    if (tabs.some(tab => tab.dataset.view === view)) select(view);
  });
  select(location.hash.slice(1));
})();
