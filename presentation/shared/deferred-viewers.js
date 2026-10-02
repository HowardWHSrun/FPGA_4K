/* Embedded models and schematics start only after an explicit open action.
 * A page keeps one viewer active; closing navigates the iframe back to blank. */
(() => {
  'use strict';
  const viewers = new Map();
  let counter = 0;

  function close(frame, focus = false) {
    const view = viewers.get(frame);
    if (!view) return;
    clearTimeout(view.timer);
    frame.removeAttribute('src');
    frame.hidden = true;
    view.placeholder.hidden = false;
    view.open.hidden = false;
    view.close.hidden = true;
    view.open.setAttribute('aria-expanded', 'false');
    view.shell.dataset.viewerState = 'closed';
    view.status.textContent = 'Loads here when you open it.';
    if (focus) view.open.focus({preventScroll: true});
  }

  function open(frame) {
    const view = viewers.get(frame);
    if (!view || !frame.dataset.src || frame.hasAttribute('src')) return;
    for (const other of viewers.keys()) if (other !== frame && other.hasAttribute('src')) close(other);
    view.shell.dataset.viewerState = 'loading';
    view.placeholder.hidden = true;
    view.open.hidden = true;
    view.close.hidden = false;
    view.open.setAttribute('aria-expanded', 'true');
    view.status.textContent = 'Loading interactive viewer…';
    frame.hidden = false;
    frame.src = frame.dataset.src;
    // Keep a useful route out if the model or a browser PDF is slow to load.
    view.timer = setTimeout(() => {
      if (view.shell.dataset.viewerState === 'loading') view.status.textContent = 'Still loading. You can also open the full viewer.';
    }, 25000);
    view.close.focus({preventScroll: true});
  }

  function setVisible(frame, visible) {
    const view = viewers.get(frame);
    if (!view) return;
    if (!visible) close(frame);
    view.shell.hidden = !visible;
  }

  function closeHidden() {
    for (const [frame, view] of viewers) {
      if (!frame.hasAttribute('src')) continue;
      const slide = view.shell.closest('.talk-slide');
      if (view.shell.closest('[hidden]') || (slide && document.body.classList.contains('presenting') && !slide.classList.contains('active'))) close(frame);
    }
  }

  function init(root = document) {
    for (const shell of root.querySelectorAll('[data-deferred-viewer]')) {
      const frame = shell.querySelector('iframe[data-src]');
      if (!frame || viewers.has(frame)) continue;
      const placeholder = shell.querySelector('.viewer-placeholder');
      const openButton = shell.querySelector('[data-viewer-open]');
      const closeButton = shell.querySelector('[data-viewer-close]');
      const status = shell.querySelector('.viewer-state');
      if (!placeholder || !openButton || !closeButton || !status) continue;
      if (!frame.id) frame.id = `deferred-viewer-${++counter}`;
      openButton.setAttribute('aria-controls', frame.id);
      openButton.setAttribute('aria-expanded', 'false');
      closeButton.setAttribute('aria-controls', frame.id);
      viewers.set(frame, {shell, placeholder, open: openButton, close: closeButton, status, timer: null});
      close(frame);
      openButton.addEventListener('click', () => open(frame));
      closeButton.addEventListener('click', () => close(frame, true));
      frame.addEventListener('load', () => {
        if (!frame.hasAttribute('src')) return;
        clearTimeout(viewers.get(frame).timer);
        shell.dataset.viewerState = 'open';
        status.textContent = 'Interactive viewer open. Close it when you are done.';
      });
      frame.addEventListener('error', () => {
        if (!frame.hasAttribute('src')) return;
        clearTimeout(viewers.get(frame).timer);
        status.textContent = 'The viewer could not load. Open the full viewer or close and try again.';
      });
    }
  }

  window.DEFERRED_VIEWERS = {init, open, close, setVisible, closeAll: () => viewers.forEach((_view, frame) => close(frame))};
  init();
  // Tabs and presentation slides can hide a loaded viewer without navigation.
  new MutationObserver(closeHidden).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['hidden', 'class']});
})();
