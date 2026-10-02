/* Optional native placement viewer in the preserved system presentation. */
(() => {
  'use strict';
  const link = document.getElementById('open-fpga-design');
  if (!link) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet'; style.href = 'presentation/fpga/refinements.css?v=20261002'; document.head.append(style);
  const schematic = document.getElementById('open-schematic-design');
  const container = document.getElementById('scene-container');
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'button fpga-native-toggle'; toggle.hidden = true;
  toggle.textContent = 'Open native 25T placement in 3D →';
  toggle.style.cssText = 'position:absolute;left:18px;bottom:18px;z-index:5;background:#17273d;color:#fff;max-width:calc(100% - 36px)';
  container.append(toggle);
  let frame;
  const caption = document.querySelector('.scene-caption');
  const savedCaption = caption.innerHTML;
  const selected = () => window.PRESENTATION?.getState().slideId === 'fpga';
  function close() {
    frame?.remove(); frame = null;
    toggle.textContent = 'Open native 25T placement in 3D →';
    toggle.setAttribute('aria-expanded', 'false');
    for (const id of ['scene', 'markers', 'camera-name']) document.getElementById(id).hidden = false;
    document.querySelector('.viewer-top').hidden = false;
    document.querySelector('.viewer-controls').hidden = false;
    caption.innerHTML = savedCaption;
  }
  toggle.addEventListener('click', () => {
    if (frame) { close(); return; }
    frame = document.createElement('iframe');
    frame.id = 'fpga-system-3d';
    frame.title = 'Dated 29 September unrouted XC7A25T PCB placement';
    frame.allow = 'fullscreen';
    frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';
    frame.src = 'presentation/adapter/assembly.html?embed=1&focus=fpga';
    container.append(frame);
    toggle.textContent = 'Close native 3D view'; toggle.setAttribute('aria-expanded', 'true');
    for (const id of ['scene', 'markers', 'camera-name']) document.getElementById(id).hidden = true;
    document.querySelector('.viewer-top').hidden = true;
    document.querySelector('.viewer-controls').hidden = true;
    caption.innerHTML = '<span>29 September 25T placement · historical three-board study</span><span>Unrouted review; assembly fit unqualified</span>';
  });
  function sync() {
    const slide = window.PRESENTATION?.getState().slideId;
    link.hidden = !selected(); toggle.hidden = !selected();
    if (!selected() && frame) close();
    if (schematic) {
      schematic.hidden = slide !== 'fpga' && slide !== 'adapter';
      schematic.href = 'presentation/schematic/?board=' + (slide === 'fpga' ? 'fpga25t' : 'adapter');
      schematic.firstChild.textContent = slide === 'fpga' ? 'View FPGA schematic ' : 'View adapter schematic ';
    }
    if (selected()) {
      link.href = 'presentation/fpga/current-25t.html';
      link.firstChild.textContent = 'Open dated 25T FPGA review ';
    }
  }
  window.FPGA_ENTRY = {close};
  new MutationObserver(sync).observe(document.getElementById('slide-title'), {childList: true, subtree: true});
  sync();
})();
