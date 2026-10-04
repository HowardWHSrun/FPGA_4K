/* Small source previews, on-demand originals, and shareable library filters. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pageSize = 24;
  const fields = ['q', 'type', 'topic', 'date'];
  let entries = [];
  let filtered = [];
  let visible = pageSize;
  let filterTimer;
  let activePreview = null;
  let previewImage = null;
  let previousFocus = null;
  const icons = {'Meeting': '≡', 'Board revision': '▱', '3D viewer': '◇', 'PCB viewer': '▱', 'Report': '≡', 'Native files': '⇩', 'Schematic': '⌁', 'Reference': '≡'};

  function element(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function dateLabel(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  }
  function readState() {
    return Object.fromEntries(fields.map(name => [name, $(name).value.trim()]));
  }
  function stateFromLocation() {
    const params = new URLSearchParams(location.search);
    fields.forEach(name => {
      const value = params.get(name) || '';
      if (name === 'q' || [...$(name).options].some(option => option.value === value)) $(name).value = value;
      else $(name).value = '';
    });
  }
  function saveState() {
    const params = new URLSearchParams();
    const state = readState();
    fields.forEach(name => { if (state[name]) params.set(name, state[name]); });
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params.toString() : '') + location.hash);
  }
  function clearFilters() {
    fields.forEach(name => { $(name).value = ''; });
    update(true);
    $('q').focus();
  }
  function card(entry) {
    const item = element('article', 'card');
    item.dataset.id = entry.id;
    const isImage = Boolean(entry.image);
    const visual = element(isImage ? 'button' : 'a', 'card-preview' + (!entry.preview ? ' card-placeholder' : ''));
    if (isImage) {
      visual.type = 'button';
      visual.setAttribute('aria-label', 'Preview ' + entry.title);
      visual.addEventListener('click', () => preview(entry));
    } else {
      visual.href = entry.url;
      visual.setAttribute('aria-label', 'Open ' + entry.title);
    }
    if (entry.preview) {
      const image = element('img');
      image.src = entry.preview;
      image.alt = '';
      image.width = 560;
      image.height = 350;
      image.loading = 'lazy';
      image.decoding = 'async';
      visual.append(image);
      visual.append(element('span', 'preview-label', isImage ? 'Preview figure' : 'Open ' + (entry.type.includes('viewer') ? 'view' : 'record')));
    } else {
      const icon = element('span', 'placeholder-icon', icons[entry.type] || '≡');
      icon.setAttribute('aria-hidden', 'true');
      visual.append(icon, element('span', 'placeholder-type', entry.type), element('span', 'placeholder-topic', entry.topic));
    }
    const content = element('div', 'card-content');
    const meta = element('div', 'card-meta');
    meta.append(element('span', 'material', entry.type), element('span', '', dateLabel(entry.date)));
    const heading = element('h3');
    const link = element('a', '', entry.title);
    link.href = entry.url;
    heading.append(link);
    const summary = element('p', 'card-summary', entry.summary);
    const bottom = element('div', 'card-bottom');
    const open = element('a', '', isImage ? 'Original ↗' : (entry.type === 'Native files' ? 'Source file ↗' : 'Open ↗'));
    open.href = entry.url;
    bottom.append(element('span', '', entry.topic), open);
    content.append(meta, heading, summary, bottom);
    item.append(visual, content);
    return item;
  }
  function renderCards(append = false) {
    const start = append ? $('cards').children.length : 0;
    const fragment = document.createDocumentFragment();
    filtered.slice(start, visible).forEach(entry => fragment.append(card(entry)));
    if (!append) $('cards').replaceChildren();
    $('cards').append(fragment);
    $('empty-state').hidden = filtered.length !== 0;
    $('load-more').hidden = visible >= filtered.length;
    $('load-more').textContent = 'Show ' + Math.min(pageSize, Math.max(0, filtered.length - visible)) + ' more';
    $('shown-count').textContent = filtered.length ? 'Showing ' + Math.min(visible, filtered.length) + ' of ' + filtered.length + ' items' : '';
  }
  function update(writeLocation = false) {
    clearTimeout(filterTimer);
    const state = readState();
    const words = state.q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    filtered = entries.filter(entry => (!state.type || entry.type === state.type) && (!state.topic || entry.topic === state.topic) && (!state.date || entry.date === state.date) && words.every(word => entry.searchText.includes(word)));
    visible = pageSize;
    $('results-heading').textContent = state.q ? 'Search results' : state.type || state.topic || 'All work';
    $('result-count').textContent = filtered.length + (filtered.length === 1 ? ' item' : ' items') + (fields.some(name => state[name]) ? ' found' : ' in the library');
    document.querySelectorAll('[data-quick-type]').forEach(link => {
      const selected = link.dataset.quickType === state.type;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    renderCards();
    if (writeLocation) saveState();
  }
  function options(name, values) {
    values.forEach(value => {
      const option = element('option', '', name === 'date' ? dateLabel(value) : value);
      option.value = value;
      $(name).append(option);
    });
  }
  function cleanupPreview() {
    activePreview = null;
    if (previewImage) {
      previewImage.onload = null;
      previewImage.onerror = null;
      previewImage.removeAttribute('src');
      previewImage = null;
    }
    // Removing the original after closing releases decoded full-size image data.
    $('preview-media').replaceChildren();
    if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
  }
  function preview(entry) {
    const dialog = $('preview-dialog');
    if (typeof dialog.showModal !== 'function') { location.href = entry.image; return; }
    previousFocus = document.activeElement;
    activePreview = entry.id;
    $('preview-title').textContent = entry.title;
    $('preview-meta').textContent = dateLabel(entry.date) + ' · ' + entry.topic;
    $('preview-summary').textContent = entry.summary;
    $('preview-original').href = entry.image;
    $('preview-related').hidden = !entry.related_url;
    if (entry.related_url) $('preview-related').href = entry.related_url;
    $('preview-media').replaceChildren(element('p', 'image-loading', 'Loading the original figure…'));
    dialog.showModal();
    const image = element('img');
    previewImage = image;
    image.alt = entry.title;
    image.decoding = 'async';
    image.onload = () => { if (activePreview === entry.id) $('preview-media').replaceChildren(image); };
    image.onerror = () => { if (activePreview === entry.id) $('preview-media').replaceChildren(element('p', 'image-loading', 'The image preview could not load. Use “Open original figure” below.')); };
    image.src = entry.image;
  }
  $('close-preview').addEventListener('click', () => $('preview-dialog').close());
  $('preview-dialog').addEventListener('close', cleanupPreview);
  $('preview-dialog').addEventListener('click', event => {
    if (event.target !== $('preview-dialog')) return;
    const rect = $('preview-dialog').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('preview-dialog').close();
  });

  fetch('catalog.json')
    .then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); })
    .then(catalog => {
      entries = catalog.entries.map(entry => ({...entry, searchText: [entry.title, entry.date, entry.source_date, entry.topic, entry.type, entry.summary, entry.revision, entry.context, entry.source, entry.filename].filter(Boolean).join(' ').toLocaleLowerCase()}));
      options('type', [...new Set(entries.map(entry => entry.type))].sort());
      options('topic', [...new Set(entries.map(entry => entry.topic))].sort());
      options('date', [...new Set(entries.map(entry => entry.date))].sort((a, b) => {
        if (a === 'Preserved reference') return 1;
        if (b === 'Preserved reference') return -1;
        return b.localeCompare(a);
      }));
      $('illustration-count').textContent = entries.filter(entry => entry.type === 'Illustration').length;
      stateFromLocation();
      $('library-search').addEventListener('submit', event => { event.preventDefault(); update(true); });
      $('q').addEventListener('input', () => { clearTimeout(filterTimer); filterTimer = setTimeout(() => update(true), 160); });
      ['type', 'topic', 'date'].forEach(name => $(name).addEventListener('change', () => update(true)));
      $('reset-filters').addEventListener('click', clearFilters);
      $('empty-reset').addEventListener('click', clearFilters);
      document.querySelectorAll('[data-quick-type]').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        $('type').value = link.dataset.quickType;
        update(true);
      }));
      $('load-more').addEventListener('click', () => { visible += pageSize; renderCards(true); });
      window.addEventListener('popstate', () => { stateFromLocation(); update(); });
      document.documentElement.classList.replace('no-js', 'js');
      update();
    })
    .catch(() => {
      // A static source index is always present in the delivered HTML.
      document.documentElement.classList.remove('js');
      document.documentElement.classList.add('no-js');
      $('fallback').open = true;
    });
})();
