(() => {
  'use strict';
  const ENDPOINT = 'https://fpga-team-questions.hwr.chatgpt.site/api/presentation-comments';
  const DECK = '2026-10-28-fpga';
  const $ = id => document.getElementById(id);
  const button = $('comments'), panel = $('comments-panel'), form = $('comment-form');
  const nameInput = $('comment-name'), bodyInput = $('comment-body'), feedback = $('comment-feedback');
  const list = $('comments-list'), status = $('comments-load-status'), retry = $('comments-retry');
  const slides = [...document.querySelectorAll('.slide')].map((element, index) => ({
    id: element.dataset.commentSlide,
    index,
    title: element.querySelector('h1').textContent.trim(),
    element
  }));
  const slideMap = new Map(slides.map(slide => [slide.id, slide]));
  const draftKey = DECK + '-comment-drafts', nameKey = DECK + '-comment-name';
  let comments = [], current = null, sending = false, requestNumber = 0, pendingRequest = null;
  const storage = {
    get(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  let drafts;
  try { drafts = JSON.parse(storage.get(draftKey, '{}')); } catch { drafts = {}; }
  if (!drafts || typeof drafts !== 'object' || Array.isArray(drafts)) drafts = {};
  nameInput.value = storage.get(nameKey, '').slice(0, 80);

  function activeSlide() { return slides.find(slide => slide.element.classList.contains('active')) || slides[0]; }
  function updateLength() { $('comment-length').textContent = bodyInput.value.length + ' / 2000'; }
  function saveDraft() {
    if (current) drafts[current.id] = bodyInput.value.slice(0, 2000);
    storage.set(draftKey, JSON.stringify(drafts));
    storage.set(nameKey, nameInput.value.slice(0, 80));
  }
  function syncContext() {
    const next = activeSlide();
    if (current?.id !== next.id) {
      saveDraft();
      current = next;
      bodyInput.value = typeof drafts[current.id] === 'string' ? drafts[current.id].slice(0, 2000) : '';
      feedback.hidden = true;
    }
    $('comment-context').textContent = 'Comment on slide ' + (current.index + 1) + ': ' + current.title;
    updateLength();
  }
  function setFeedback(message, error = false) {
    feedback.textContent = message;
    feedback.classList.toggle('error', error);
    feedback.setAttribute('role', error ? 'alert' : 'status');
    feedback.hidden = !message;
  }
  function normalize(row) {
    if (!row || typeof row.id !== 'string' || typeof row.body !== 'string' || row.deck !== DECK || !slideMap.has(row.slide)) return null;
    return {
      id: row.id,
      slide: row.slide,
      name: typeof row.name === 'string' && row.name.trim() ? row.name.trim().slice(0, 80) : 'Anonymous',
      body: row.body.slice(0, 2000),
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : ''
    };
  }
  function readableDate(value) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(undefined, {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(date) : '';
  }
  function render() {
    list.replaceChildren();
    const count = comments.length;
    $('comments-count').textContent = String(count);
    $('comments-count').hidden = false;
    button.setAttribute('aria-label', 'Comments, ' + count + ' shared ' + (count === 1 ? 'comment' : 'comments'));
    if (!count) {
      const empty = document.createElement('p');
      empty.className = 'comments-empty';
      empty.textContent = 'No comments yet. Add the first one.';
      list.append(empty);
      return;
    }
    for (const comment of comments) {
      const slide = slideMap.get(comment.slide);
      const article = document.createElement('article');
      article.className = 'comment-entry';
      const meta = document.createElement('div');
      meta.className = 'comment-meta';
      const name = document.createElement('strong');
      name.textContent = comment.name;
      const time = document.createElement('time');
      time.dateTime = comment.createdAt;
      time.textContent = readableDate(comment.createdAt);
      meta.append(name, time);
      const link = document.createElement('a');
      link.className = 'comment-slide-link';
      link.href = '#slide-' + (slide.index + 1);
      link.textContent = 'Slide ' + (slide.index + 1) + ' · ' + slide.title;
      link.addEventListener('click', () => closePanel());
      const body = document.createElement('p');
      body.className = 'comment-text';
      body.textContent = comment.body;
      article.append(meta, link, body);
      list.append(article);
    }
  }
  async function fetchJson(url, options = {}) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {...options, credentials:'omit', cache:'no-store', signal:controller.signal});
      let data;
      try { data = await response.json(); } catch { throw new Error('The comments service returned an unreadable response. Please try again.'); }
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error.slice(0, 200) : 'The comments service is unavailable. Please try again.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Could not reach shared comments. Please try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  async function loadComments() {
    const number = ++requestNumber;
    list.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading shared comments…';
    status.hidden = false;
    retry.hidden = true;
    try {
      const data = await fetchJson(ENDPOINT + '?deck=' + encodeURIComponent(DECK), {headers:{Accept:'application/json'}});
      if (number !== requestNumber) return;
      if (!Array.isArray(data.comments)) throw new Error('The comments service returned an unreadable response. Please try again.');
      comments = data.comments.map(normalize).filter(Boolean).sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      render();
      status.hidden = true;
    } catch (error) {
      if (number !== requestNumber) return;
      status.textContent = error.message;
      status.hidden = false;
      retry.hidden = false;
    } finally { if (number === requestNumber) list.setAttribute('aria-busy', 'false'); }
  }
  function closePanel() {
    saveDraft();
    if (typeof panel.close === 'function') panel.close(); else panel.removeAttribute('open');
    button.setAttribute('aria-expanded', 'false');
    button.focus({preventScroll:true});
  }
  function openPanel() {
    syncContext();
    if (typeof panel.showModal === 'function') panel.showModal(); else panel.setAttribute('open', '');
    button.setAttribute('aria-expanded', 'true');
    bodyInput.focus({preventScroll:true});
    loadComments();
  }
  button.addEventListener('click', openPanel);
  $('comments-close').addEventListener('click', closePanel);
  panel.addEventListener('cancel', event => { event.preventDefault(); closePanel(); });
  panel.addEventListener('close', () => { saveDraft(); button.setAttribute('aria-expanded','false'); });
  panel.addEventListener('click', event => {
    if (event.target !== panel) return;
    const bounds = panel.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
  });
  $('comments-refresh').addEventListener('click', loadComments);
  retry.addEventListener('click', loadComments);
  nameInput.addEventListener('input', () => { pendingRequest = null; saveDraft(); });
  bodyInput.addEventListener('input', () => { pendingRequest = null; updateLength(); saveDraft(); });
  window.addEventListener('presentation-slide-change', syncContext);
  window.addEventListener('beforeunload', saveDraft);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const body = bodyInput.value.trim();
    if (!body) { setFeedback('Please write a comment.', true); bodyInput.focus(); return; }
    const target = {...current};
    const name = nameInput.value.trim().slice(0,80);
    const signature = JSON.stringify([target.id,name,body]);
    if (!pendingRequest || pendingRequest.signature !== signature) pendingRequest = {id:crypto.randomUUID(),signature};
    const payload = {deck:DECK,slide:target.id,slideTitle:target.title,name,body,website:$('comment-website').value,requestId:pendingRequest.id};
    saveDraft();
    sending = true;
    $('comment-submit').disabled = true;
    $('comment-submit').textContent = 'Posting…';
    setFeedback('');
    try {
      const data = await fetchJson(ENDPOINT, {method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(payload)});
      const saved = normalize(data.comment);
      if (!saved) throw new Error('The comments service did not confirm your comment. Please try again.');
      comments = [saved, ...comments.filter(comment => comment.id !== saved.id)];
      render();
      if ((drafts[target.id] || '').trim() === payload.body) drafts[target.id] = '';
      storage.set(draftKey, JSON.stringify(drafts));
      if (pendingRequest?.id === payload.requestId) pendingRequest = null;
      if (current.id === target.id) {
        if (bodyInput.value.trim() === payload.body) bodyInput.value = '';
        updateLength();
        setFeedback('Posted.');
      }
      loadComments();
    } catch (error) { setFeedback(error.message, true); }
    finally {
      sending = false;
      $('comment-submit').disabled = false;
      $('comment-submit').textContent = 'Post comment';
    }
  });
  syncContext();
})();
