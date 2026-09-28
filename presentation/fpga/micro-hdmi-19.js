(() => {
  const pins = [...document.querySelectorAll('.pin[data-pin], .std-pin[data-pin]')];
  const rows = [...document.querySelectorAll('tbody tr[data-pin]')];
  const detail = document.getElementById('pin-detail');
  const pinButtons = new Map(pins.map(pin => [pin.dataset.pin, pin]));
  const tableRows = new Map(rows.map(row => [row.dataset.pin, row]));
  const pdf = document.getElementById('molex-pdf');
  const pdfDetails = document.querySelector('.pdf-details');
  const pdfButtons = [...document.querySelectorAll('[data-pdf-page]')];
  const pdfUrl = 'https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/467/46765/467650301_sd.pdf';

  let selected = '19';

  function preview(number) {
    for (const element of [...pins, ...rows]) {
      if (element.dataset.pin === number) element.dataset.highlight = 'true';
      else delete element.dataset.highlight;
    }
  }

  function clearPreview() {
    for (const element of [...pins, ...rows]) delete element.dataset.highlight;
  }

  function select(number, updateUrl = true) {
    const row = tableRows.get(number);
    if (!row || !pinButtons.has(number)) return;
    selected = number;

    for (const pin of pins) {
      const active = pin.dataset.pin === number;
      pin.dataset.selected = String(active);
      pin.setAttribute('aria-pressed', String(active));
    }
    for (const candidate of rows) candidate.dataset.selected = String(candidate.dataset.pin === number);

    const role = row.querySelector('.role').textContent.trim();
    const functionName = row.querySelector('td:nth-child(2) strong').textContent.trim();
    const description = row.querySelector('td:nth-child(2) small').textContent.trim();
    const status = row.querySelector('td:nth-child(4)').textContent.trim();
    detail.querySelector('strong').textContent = `${number} · ${role}: ${functionName}`;
    detail.querySelector('p').textContent = description;
    detail.querySelector('.detail-status').textContent = status;
    detail.querySelector('.detail-status').dataset.kind = row.querySelector('.role').classList[1].replace('role-', '');

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('pin', number);
      history.replaceState(null, '', url);
    }
  }

  for (const pin of pins) {
    pin.addEventListener('pointerenter', () => preview(pin.dataset.pin));
    pin.addEventListener('pointerleave', clearPreview);
    pin.addEventListener('focus', () => preview(pin.dataset.pin));
    pin.addEventListener('blur', clearPreview);
    pin.addEventListener('click', () => select(pin.dataset.pin));
  }
  for (const row of rows) {
    row.addEventListener('pointerenter', () => preview(row.dataset.pin));
    row.addEventListener('pointerleave', clearPreview);
    row.addEventListener('click', () => select(row.dataset.pin));
  }

  for (const button of pdfButtons) {
    button.addEventListener('click', () => {
      const page = button.dataset.pdfPage;
      for (const control of pdfButtons) control.setAttribute('aria-pressed', String(control === button));
      pdf.title = page === '2'
        ? 'Molex 46765 original sales drawing, sheet 2 front mating-face view'
        : 'Molex 46765 original sales drawing, sheet 4 Type-D pin table and PCB layout';
      pdf.src = `${pdfUrl}#page=${page}&view=FitH`;
    });
  }

  pdfDetails.addEventListener('toggle', () => {
    if (pdfDetails.open && !pdf.getAttribute('src')) pdf.src = pdf.dataset.src;
  });

  const fromUrl = new URLSearchParams(location.search).get('pin');
  select(tableRows.has(fromUrl) ? fromUrl : selected, false);
})();
