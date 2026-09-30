(() => {
  const pins = [...document.querySelectorAll('.contact-pin')];
  const purpose = document.getElementById('pin-purpose');
  const labels = {
    serial: '3/5 + 6/8 → two active recording pairs. Eight serial contacts total, including reserved TX2 and inbound commands.',
    spare: '9/11 → third recording pair, physically wired and reserved in the two-lane baseline.',
    control: '12/14 ← serial commands from XEM TX0. Local FPGA logic generates the ASIC controls.',
    jtag: '1 VTREF → sense; 2 TMS ← state; 15 TDI ← data; 17 TCK ← clock; 18 TDO → readback.',
    ground: '4/7/10/13/16 → signal reference, JTAG ground and power return. Return-current qualification remains open.',
    power: '19 ← protected external 12 V, then local regulation. Source and cable rating remain open; MC3 is not the source.'
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
    purpose.textContent = selected ? labels[group] : 'Click a contact to highlight its group.';
  });
})();
