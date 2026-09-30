/* Keep the native 3D canvases fitted when presentation mode changes. */
(() => {
  const frames = [...document.querySelectorAll('.talk-model')];
  const fit = () => frames.forEach(frame => {
    try { frame.contentWindow?.dispatchEvent(new Event('resize')); } catch (_) { /* A standalone viewer still resizes itself. */ }
  });
  frames.forEach(frame => frame.addEventListener('load', fit));
  new MutationObserver(fit).observe(document.body, {attributes:true, attributeFilter:['class']});
})();
