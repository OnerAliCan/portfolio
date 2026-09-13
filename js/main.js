/* Ali Can Öner — portfolio
   Intro, révélations, parallaxe, curseur, boutons magnétiques, thème. */
(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Thème ---------- */
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* stockage indisponible */ }
    });
  }

  /* ---------- Intro puis héro ---------- */
  const intro = document.querySelector('.intro');
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    body.classList.add('is-ready');
    if (intro) {
      intro.classList.add('is-done');
      intro.addEventListener('transitionend', () => { intro.style.visibility = 'hidden'; }, { once: true });
      setTimeout(() => { intro.style.visibility = 'hidden'; }, 1800);
    }
    countUp();
  };
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const minDelay = new Promise((r) => setTimeout(r, reduce ? 0 : 800));
  Promise.all([fontsReady, minDelay]).then(start);
  setTimeout(start, 1900); // filet de sécurité si les polices traînent

  /* ---------- Compteur du héro ---------- */
  function countUp() {
    const el = document.querySelector('[data-count]');
    if (!el) return;
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduce) { el.textContent = String(target); return; }
    const duration = 1400;
    const t0 = performance.now() + 900;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Révélation au défilement ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Barre de navigation ---------- */
  const nav = document.querySelector('.nav');
  let lastY = window.scrollY;
  const updateNav = () => {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    nav.classList.toggle('is-hidden', y > lastY && y > 200 && !nav.matches(':focus-within'));
    lastY = y;
  };

  /* ---------- Parallaxe des visuels ---------- */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const updateParallax = () => {
    if (reduce) return;
    const h = window.innerHeight;
    parallaxEls.forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > h) return;
      const centre = box.top + box.height / 2 - h / 2;
      const progress = centre / (h / 2 + box.height / 2); // -1 → 1
      const shift = progress * box.height * 0.07;
      img.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    });
  };

  let ticking = false;
  const onFrame = () => { updateNav(); updateParallax(); ticking = false; };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onFrame); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });
  onFrame();

  /* ---------- Curseur ---------- */
  const cursor = document.querySelector('.cursor');
  if (cursor && finePointer && !reduce) {
    body.classList.add('has-cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let tx = -100, ty = -100, rx = -100, ry = -100;
    const hoverables = 'a, button, [data-hover]';

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => cursor.classList.add('is-on'));
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove('is-hover');
    });

    const render = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      requestAnimationFrame(render);
    };
    render();
  }

  /* ---------- Boutons magnétiques ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.22;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Année ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
