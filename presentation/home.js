/* Keep archive browsing free of model downloads; retain earlier section links. */
(() => {
  'use strict';
  const open = document.getElementById('open-system-review');
  const close = document.getElementById('close-system-review');
  const status = document.getElementById('home-load-status');
  const review = document.querySelector('.deck');
  const footer = document.getElementById('review-footer');
  const sections = new Set(['overview', 'carriers', 'routing', 'fpga', 'adapter', 'receiver']);
  let loading;
  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path + '?v=20261002-library';
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error('The assembly could not load. Refresh the page to try again.')); };
      document.head.append(script);
    });
  }
  async function showReview(scroll = true) {
    review.hidden = false;
    footer.hidden = false;
    close.hidden = false;
    document.body.dataset.reviewOpen = 'true';
    open.disabled = true;
    status.textContent = 'Opening assembly…';
    if (!loading) loading = (async () => {
      for (const path of ['presentation/model-source.js', 'presentation/compact/slides.js', 'presentation/compact/app.js', 'presentation/fpga/entry.js', 'presentation/compact/interaction.js']) await loadScript(path);
      document.getElementById('model-notes').hidden = false;
      document.getElementById('fullscreen').hidden = false;
      document.querySelector('.brand').onclick = null;
    })();
    try {
      await loading;
      status.textContent = '';
      open.textContent = 'Return to assembly →';
      if (scroll) review.scrollIntoView({behavior: 'instant', block: 'start'});
    } catch (error) {
      status.textContent = error.message;
    } finally { open.disabled = false; }
  }
  open.addEventListener('click', () => showReview());
  close.addEventListener('click', () => {
    review.hidden = true;
    footer.hidden = true;
    close.hidden = true;
    document.getElementById('model-notes').hidden = true;
    document.getElementById('fullscreen').hidden = true;
    delete document.body.dataset.reviewOpen;
    // Removing the native embedded frame releases its model and WebGL context.
    window.FPGA_ENTRY?.close();
    history.replaceState(null, '', location.pathname + location.search);
    document.title = '4K Recording System | Project library';
    open.focus({preventScroll: true});
  });
  function followSection() {
    if (sections.has(location.hash.slice(1)) && review.hidden) showReview();
  }
  window.addEventListener('hashchange', followSection);
  followSection();
})();
