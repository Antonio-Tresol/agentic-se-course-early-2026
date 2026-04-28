/* =====================================================================
   slides.js — shared engine for every session deck.

   Each session*.html only needs:
     <link rel="stylesheet" href="./slides.css" />
     <div class="progress" id="progress"></div>
     [... .slide elements ...]
     <script src="./slides.js"></script>

   This script discovers the slides, builds the bottom navigation, the
   TOC drawer, and wires keyboard, click, and touch handlers.
   ===================================================================== */
(function () {
  'use strict';

  // ----- Discover slides -----
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  if (total === 0) return;

  // Make sure exactly one slide is active on first paint.
  let current = slides.findIndex((s) => s.classList.contains('active'));
  if (current < 0) {
    current = 0;
    slides[0].classList.add('active');
  }

  // ----- Build bottom navigation, including the Contents button -----
  const nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML = [
    '<button class="nav-btn nav-btn-toc" id="tocToggle" type="button" aria-label="Open slide contents">' +
      '<svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">' +
        '<path d="M0.5 1h10M0.5 4.5h10M0.5 8h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
      '</svg>' +
      '<span>Contents</span>' +
    '</button>',
    '<button class="nav-btn" id="prevBtn" type="button">&larr; Prev</button>',
    '<span class="nav-count" id="slideCount">1 / ' + total + '</span>',
    '<button class="nav-btn" id="nextBtn" type="button">Next &rarr;</button>',
  ].join('');
  document.body.appendChild(nav);
  const toggleBtn = nav.querySelector('#tocToggle');
  const slideCount = nav.querySelector('#slideCount');
  nav.querySelector('#prevBtn').addEventListener('click', () => navigate(-1));
  nav.querySelector('#nextBtn').addEventListener('click', () => navigate(1));

  // ----- Build TOC drawer -----
  const overlay = document.createElement('div');
  overlay.className = 'toc-overlay';
  overlay.id = 'tocOverlay';
  document.body.appendChild(overlay);

  const drawer = document.createElement('aside');
  drawer.className = 'toc';
  drawer.id = 'toc';
  drawer.setAttribute('aria-label', 'Slide contents');

  const titleParts = (document.title || '').split('·').map((s) => s.trim());
  const deckLabel = titleParts[0] || 'Session';
  const deckTitle = titleParts.slice(1).join(' · ') || '';

  const drawerHeader = document.createElement('div');
  drawerHeader.className = 'toc-header';
  drawerHeader.innerHTML =
    '<div class="toc-deck-label"></div>' +
    '<div class="toc-deck-title"></div>';
  drawerHeader.querySelector('.toc-deck-label').textContent = deckLabel;
  drawerHeader.querySelector('.toc-deck-title').textContent = deckTitle;
  drawer.appendChild(drawerHeader);

  const list = document.createElement('div');
  list.className = 'toc-list';
  drawer.appendChild(list);
  document.body.appendChild(drawer);

  function getSlideTitle(slide) {
    const h1 = slide.querySelector('h1');
    const h2 = slide.querySelector('h2');
    const label = slide.querySelector('.slide-label');
    const subtitle = slide.querySelector('.subtitle');
    if (h1) return h1.textContent.trim();
    if (h2) return h2.textContent.trim();
    if (label) return label.textContent.trim();
    if (subtitle) {
      const t = subtitle.textContent.trim();
      return t.length > 70 ? t.slice(0, 67) + '…' : t;
    }
    return 'Slide';
  }

  const tocItems = slides.map((slide, i) => {
    const item = document.createElement('div');
    item.className = 'toc-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    const num = document.createElement('span');
    num.className = 'toc-item-num';
    num.textContent = String(i + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.className = 'toc-item-title';
    title.textContent = getSlideTitle(slide);
    item.appendChild(num);
    item.appendChild(title);
    item.addEventListener('click', () => {
      showSlide(i);
      closeTOC();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showSlide(i);
        closeTOC();
      }
    });
    list.appendChild(item);
    return item;
  });

  // ----- Slide navigation -----
  const progress = document.getElementById('progress');

  function showSlide(n) {
    slides[current].classList.remove('active');
    current = Math.max(0, Math.min(n, total - 1));
    slides[current].classList.add('active');
    if (slideCount) slideCount.textContent = (current + 1) + ' / ' + total;
    if (progress) progress.style.width = ((current + 1) / total * 100) + '%';
    syncTOC();
  }
  function navigate(dir) { showSlide(current + dir); }

  function syncTOC() {
    tocItems.forEach((it, i) => it.classList.toggle('active', i === current));
    if (drawer.classList.contains('open') && tocItems[current]) {
      tocItems[current].scrollIntoView({ block: 'nearest' });
    }
  }
  function openTOC() {
    drawer.classList.add('open');
    overlay.classList.add('visible');
    document.body.classList.add('toc-open');
    syncTOC();
  }
  function closeTOC() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.classList.remove('toc-open');
  }
  function toggleTOC() {
    if (drawer.classList.contains('open')) closeTOC();
    else openTOC();
  }

  toggleBtn.addEventListener('click', toggleTOC);
  overlay.addEventListener('click', closeTOC);

  // ----- Keyboard shortcuts -----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); navigate(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); return; }
    if (e.key === 'Home') { e.preventDefault(); showSlide(0); return; }
    if (e.key === 'End') { e.preventDefault(); showSlide(total - 1); return; }
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      e.preventDefault();
      closeTOC();
      return;
    }
    if ((e.key === 't' || e.key === 'T') && !e.target.matches('input, textarea')) {
      e.preventDefault();
      toggleTOC();
    }
  });

  // ----- Touch swipe -----
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
  document.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) navigate(diff < 0 ? 1 : -1);
  });

  // ----- Initial paint -----
  showSlide(current);
})();
