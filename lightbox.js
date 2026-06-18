/**
 * Lightbox — Gallery fullscreen viewer
 * Supports: click to open, prev/next arrows, dot nav, keyboard (← → Esc), swipe touch
 */
(function () {
  'use strict';

  let images = [];    // array of { src, alt }
  let current = 0;
  let overlay, imgEl, prevBtn, nextBtn, counterEl, hintEl;
  let touchStartX = 0;
  let isTransitioning = false;

  // ── Build overlay DOM ──────────────────────────────────────────
  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Visualizador de imagens');

    const inner = document.createElement('div');
    inner.className = 'lightbox-inner';

    // Image
    imgEl = document.createElement('img');
    imgEl.className = 'lightbox-img';
    imgEl.setAttribute('alt', '');

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', close);

    // Prev
    prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-prev';
    prevBtn.setAttribute('aria-label', 'Imagem anterior');
    prevBtn.innerHTML = '‹';
    prevBtn.addEventListener('click', () => navigate(-1));

    // Next
    nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-next';
    nextBtn.setAttribute('aria-label', 'Próxima imagem');
    nextBtn.innerHTML = '›';
    nextBtn.addEventListener('click', () => navigate(1));

    // Dot counter
    counterEl = document.createElement('div');
    counterEl.className = 'lightbox-counter';

    // Keyboard hint
    hintEl = document.createElement('div');
    hintEl.className = 'lightbox-hint';
    hintEl.textContent = '← → navegar · Esc fechar';

    inner.appendChild(imgEl);
    inner.appendChild(closeBtn);
    inner.appendChild(prevBtn);
    inner.appendChild(nextBtn);
    inner.appendChild(counterEl);
    inner.appendChild(hintEl);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Touch / swipe
    overlay.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    overlay.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // ── Collect all gallery images ─────────────────────────────────
  function collectImages() {
    images = [];
    document.querySelectorAll('.gallery-grid .gallery-item img').forEach((img) => {
      if (img.src) images.push({ src: img.src, alt: img.alt || '' });
    });
  }

  // ── Bind click on each gallery item ───────────────────────────
  function bindItems() {
    document.querySelectorAll('.gallery-grid .gallery-item').forEach((item, idx) => {
      // Only bind if it has an image
      if (item.querySelector('img')) {
        item.addEventListener('click', () => open(idx));
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Abrir imagem em tela cheia');
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(idx); }
        });
      }
    });
  }

  // ── Update dot indicators ──────────────────────────────────────
  function buildDots() {
    counterEl.innerHTML = '';
    images.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'lightbox-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => navigate(i - current));
      counterEl.appendChild(dot);
    });
  }

  function updateDots() {
    const dots = counterEl.querySelectorAll('.lightbox-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function updateArrows() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === images.length - 1;
  }

  // ── Open lightbox ──────────────────────────────────────────────
  function open(index) {
    if (!overlay) buildOverlay();
    collectImages();
    if (!images.length) return;

    current = index;
    imgEl.src = images[current].src;
    imgEl.alt = images[current].alt;
    buildDots();
    updateArrows();

    document.body.style.overflow = 'hidden';
    overlay.classList.add('active');
    overlay.focus();
  }

  // ── Close lightbox ─────────────────────────────────────────────
  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { imgEl.src = ''; }, 350);
  }

  // ── Navigate ───────────────────────────────────────────────────
  function navigate(delta) {
    if (isTransitioning) return;
    const next = current + delta;
    if (next < 0 || next >= images.length) return;

    isTransitioning = true;
    imgEl.classList.add('transitioning');

    setTimeout(() => {
      current = next;
      imgEl.src = images[current].src;
      imgEl.alt = images[current].alt;
      updateDots();
      updateArrows();

      // Trigger re-render before removing class
      requestAnimationFrame(() => {
        imgEl.classList.remove('transitioning');
        isTransitioning = false;
      });
    }, 220);
  }

  // ── Keyboard ───────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!overlay || !overlay.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'Escape')     close();
  });

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    collectImages();
    if (images.length) {
      buildOverlay();
      bindItems();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
