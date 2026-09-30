(() => {
  const pins = [...document.querySelectorAll('.contact-pin')];
  const purpose = document.getElementById('pin-purpose');
  const labels = {
    serial: '3/5 + 6/8 → recording pairs. R10 copper routes exist; a complete working link is not yet demonstrated.',
    spare: '9 / 11 · Reserved.',
    control: '12/14 ← serial commands from XEM TX0. Local FPGA logic generates the ASIC controls.',
    jtag: '1 VTREF → sense; 2 TMS ← state; 15 TDI ← data; 17 TCK ← clock; 18 TDO → readback.',
    ground: '4/7/10/13/16 → signal reference + power return. All five ground pads per port remain unrouted in R10.',
    power: '19 ← proposed protected external 12 V. Three branch circuits and routes remain open; see the 12 V plan.'
  };
  for (const pin of pins) pin.addEventListener('click', () => {
    const selected = pin.getAttribute('aria-pressed') !== 'true';
    const group = pin.dataset.group;
    for (const other of pins) {
      other.classList.toggle('dimmed', selected && other.dataset.group !== group);
      other.setAttribute('aria-pressed', String(selected && other === pin));
    }
    purpose.className = 'pin-purpose' + (selected ? ' ' + group : '');
    if (selected) purpose.dataset.group = group;
    else delete purpose.dataset.group;
    purpose.textContent = selected ? labels[group] : '19 assigned · R10: 8 routed per port / 11 open.';
  });
})();
