// Slide 2 Comments buttons (and ?comments=<board> from the main page) open slide 3 on that board's tab.
(() => {
  const pick = k => { const b = document.querySelector('.comments-slide [data-view="cm-' + k + '"]'); if (b) b.click(); };
  document.addEventListener('click', e => { const a = e.target.closest('[data-board-comments]'); if (a) pick(a.dataset.boardComments); });
  const q = new URLSearchParams(location.search).get('comments');
  if (q) window.addEventListener('DOMContentLoaded', () => setTimeout(() => pick(q), 0));
})();
