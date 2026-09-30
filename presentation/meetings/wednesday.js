(() => {
  const slides = [...document.querySelectorAll('.talk-slide')];
  const sections = [...document.querySelectorAll('.review-section')];
  const present = document.querySelector('#present');
  const controls = document.querySelector('.presentation-controls');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const counter = document.querySelector('#slide-counter');
  let index = 0;
  let presenting = false;
  let returnScroll = 0;
  const show = (number) => {
    index = Math.max(0, Math.min(slides.length - 1, number));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    counter.textContent = `${index + 1} / ${slides.length} · ${slides[index].dataset.title}`;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    window.scrollTo({top: 0, behavior: 'instant'});
  };
  const toggle = async (enabled) => {
    presenting = enabled;
    if (enabled) {
      returnScroll = window.scrollY;
      const matching = slides.findIndex(slide => {
        const box = slide.getBoundingClientRect();
        return box.bottom > 160;
      });
      document.body.classList.add('presenting');
      controls.hidden = false;
      present.setAttribute('aria-pressed', 'true');
      show(matching < 0 ? 0 : matching);
      document.querySelector('#exit-presentation').focus({preventScroll: true});
      try { await document.documentElement.requestFullscreen?.(); } catch (_) { /* The layout still works without fullscreen. */ }
    } else {
      document.body.classList.remove('presenting');
      controls.hidden = true;
      present.setAttribute('aria-pressed', 'false');
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch (_) { /* Restore the reading view either way. */ }
      }
      present.focus({preventScroll: true});
      window.scrollTo({top: returnScroll, behavior: 'instant'});
    }
  };
  present.addEventListener('click', () => toggle(!presenting));
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  document.querySelector('#exit-presentation').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', event => {
    if (!presenting || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.key === 'Escape') { event.preventDefault(); toggle(false); }
    if (['ArrowRight', 'PageDown'].includes(event.key) || (event.key === ' ' && event.target.tagName !== 'BUTTON' && event.target.tagName !== 'A')) { event.preventDefault(); show(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && presenting) toggle(false);
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!presenting || !link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    const slide = target?.classList.contains('talk-slide') ? target : target?.querySelector('.talk-slide');
    const targetIndex = slides.indexOf(slide);
    if (targetIndex >= 0) { event.preventDefault(); show(targetIndex); }
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (presenting) return;
      const active = entries.find(entry => entry.isIntersecting);
      if (!active) return;
      document.querySelectorAll('aside a').forEach(link => {
        if (link.getAttribute('href') === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin: '-15% 0px -65% 0px'});
    sections.forEach(section => observer.observe(section));
  }
})();
