// =========================================================
// Thunder dropdown: enhances a native <select>, keeps it in sync
// =========================================================
const DD = (() => {
  const CH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const CK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  let uid = 0;
  const all = new Set();

  function enhance(sel) {
    if (!sel) return null;
    if (sel._dd) return sel._dd;
    const id = 'ddl' + (++uid);
    const wrap = document.createElement('div');
    wrap.className = 'ds-dd';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ds-dd-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    const val = document.createElement('span');
    val.className = 'ds-dd-val';
    const ch = document.createElement('span');
    ch.className = 'ds-dd-ch';
    ch.innerHTML = CH;
    btn.append(val, ch);
    const list = document.createElement('ul');
    list.className = 'ds-dd-list';
    list.id = id;
    list.setAttribute('role', 'listbox');
    list.tabIndex = -1;

    const lab = sel.id && document.querySelector('label[for="' + sel.id + '"]');
    if (lab) {
      if (!lab.id) lab.id = sel.id + '-lbl';
      btn.id = sel.id + '-btn';
      list.setAttribute('aria-labelledby', lab.id);
      btn.setAttribute('aria-labelledby', lab.id + ' ' + btn.id);
    } else if (sel.getAttribute('aria-label')) {
      btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
    }

    sel.parentNode.insertBefore(wrap, sel);
    wrap.append(btn, list, sel);
    sel.classList.add('sr-only');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    let opts = [], items = [], cur = 0, act = 0, buf = '', bt;

    function paint() {
      val.textContent = opts[cur] ? opts[cur].text : '';
      items.forEach((li, i) => {
        li.setAttribute('aria-selected', i === cur ? 'true' : 'false');
        li.classList.toggle('active', i === act);
      });
      btn.removeAttribute('aria-activedescendant');
      if (wrap.classList.contains('open') && items[act]) btn.setAttribute('aria-activedescendant', items[act].id);
    }
    function build() {
      opts = [].slice.call(sel.options);
      list.innerHTML = '';
      items = opts.map((o, i) => {
        const li = document.createElement('li');
        li.id = id + '-o' + i;
        li.setAttribute('role', 'option');
        li.dataset.i = i;
        const t = document.createElement('span');
        t.textContent = o.text;
        li.appendChild(t);
        if (o.dataset.hint) {
          const s = document.createElement('small');
          s.textContent = o.dataset.hint;
          li.appendChild(s);
        }
        li.insertAdjacentHTML('beforeend', CK);
        if (o.disabled) li.setAttribute('aria-disabled', 'true');
        list.appendChild(li);
        return li;
      });
      cur = Math.max(0, sel.selectedIndex);
      act = cur;
      paint();
    }
    const isOpen = () => wrap.classList.contains('open');
    function open() {
      all.forEach(a => { if (a !== api) a.close(); });
      const r = btn.getBoundingClientRect();
      wrap.classList.toggle('up', window.innerHeight - r.bottom < 340 && r.top > 340);
      wrap.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      act = cur;
      paint();
      if (items[act]) items[act].scrollIntoView({ block: 'nearest' });
    }
    function close(focus) {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      paint();
      if (focus) btn.focus();
    }
    function pick(i) {
      if (!opts[i] || opts[i].disabled) return;
      cur = act = i;
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    }
    function move(to) {
      const n = items.length, s = to > act ? 1 : -1;
      let i = to;
      while (i >= 0 && i < n && opts[i].disabled) i += s;
      if (i < 0 || i >= n) return;
      act = i;
      paint();
      items[act].scrollIntoView({ block: 'nearest' });
    }

    const api = {
      wrap, isOpen, close,
      refresh: build,
      sync() { cur = Math.max(0, sel.selectedIndex); act = cur; paint(); }
    };
    all.add(api);
    sel._dd = api;
    sel.addEventListener('dd-sync', api.sync);

    btn.addEventListener('click', () => (isOpen() ? close() : open()));
    btn.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen()) open(); else move(act + (k === 'ArrowDown' ? 1 : -1));
      } else if (k === 'Home' || k === 'End') {
        if (isOpen()) { e.preventDefault(); move(k === 'Home' ? 0 : items.length - 1); }
      } else if (k === 'Enter' || k === ' ') {
        if (isOpen()) { e.preventDefault(); pick(act); }
      } else if (k === 'Escape') {
        if (isOpen()) { e.preventDefault(); e.stopPropagation(); close(true); }
      } else if (k === 'Tab') {
        if (isOpen()) close();
      } else if (k.length === 1 && !e.ctrlKey && !e.metaKey) {
        buf += k.toLowerCase();
        clearTimeout(bt);
        bt = setTimeout(() => { buf = ''; }, 600);
        const s = opts.findIndex(o => !o.disabled && o.text.toLowerCase().indexOf(buf) === 0);
        if (s > -1) {
          if (isOpen()) { act = s; paint(); items[s].scrollIntoView({ block: 'nearest' }); }
          else { cur = act = s; sel.selectedIndex = s; sel.dispatchEvent(new Event('change', { bubbles: true })); paint(); }
        }
      }
    });
    list.addEventListener('mousedown', (e) => e.preventDefault());
    list.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });
    list.addEventListener('mousemove', (e) => {
      const li = e.target.closest('li');
      if (li && !opts[+li.dataset.i].disabled && +li.dataset.i !== act) { act = +li.dataset.i; paint(); }
    });
    if (lab) lab.addEventListener('click', (e) => { e.preventDefault(); btn.focus(); });

    build();
    return api;
  }

  document.addEventListener('click', (e) => {
    all.forEach(a => { if (a.isOpen() && !a.wrap.contains(e.target)) a.close(); });
  });

  return {
    enhance,
    refresh: (s) => s && s._dd && s._dd.refresh(),
    sync: (s) => s && s._dd && s._dd.sync()
  };
})();

// State Management
let currentView = 'explore'; // 'explore', 'liked', or 'board'
let currentBoardName = '';
let filteredWallpapers = [];
let renderedCount = 0;
const itemsPerLoad = 30;

let currentCategory = 'All';
let currentFormat = 'All';
let searchQuery = '';
let currentSort = 'default';
let currentGridDensity = 'md';

// Load liked wallpapers from localStorage
let likedWallpapers = new Set(JSON.parse(localStorage.getItem('liked_wallpapers') || '[]'));

// Load custom boards from localStorage
let customBoards = JSON.parse(localStorage.getItem('custom_boards') || '{}');

// Canvas Editor State
let editModeActive = false;
let currentBlur = 0;
let currentCropRatio = 'free';
let cropOffsetPercent = 50; // 0 (left/top) to 100 (right/bottom)
let originalImage = null;

// Slideshow Autoplay State
let slideshowActive = false;
let slideshowIndex = 0;
let slideshowTimer = null;
let slideshowAutoplay = true;
const slideshowDuration = 4000; // 4 seconds
let slideshowMouseTimer = null;

// DOM Elements
const grid = document.getElementById('masonry-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const formatSelect = document.getElementById('format-select');
const themeToggleBtn = document.getElementById('theme-toggle');
const exploreTab = document.getElementById('explore-tab');
const likedTab = document.getElementById('liked-tab');
const lightbox = document.getElementById('lightbox');
const totalCountEl = document.getElementById('total-count');
const viewCountEl = document.getElementById('view-count');

// Upgrade DOM Elements
const surpriseBtn = document.getElementById('surprise-btn');
const boardsFilterRow = document.getElementById('boards-filter-row');
const boardFilterSelect = document.getElementById('filter-board-select');
const boardSelect = document.getElementById('board-select');
const boardCreateBtn = document.getElementById('board-create-btn');

const editorToggleBtn = document.getElementById('editor-toggle-btn');
const editorPanel = document.getElementById('editor-panel');
const blurSlider = document.getElementById('blur-slider');
const blurVal = document.getElementById('blur-val');
const ratioBtns = document.querySelectorAll('.ratio-btn');
const lightboxMedia = document.getElementById('lightbox-media');
const editorCanvas = document.getElementById('editor-canvas');

const panControl = document.getElementById('pan-control');
const panSlider = document.getElementById('pan-slider');
const panLabel = document.getElementById('pan-label');
const panVal = document.getElementById('pan-val');
const blurFitContainer = document.getElementById('blur-fit-container');
const blurFitCheckbox = document.getElementById('blur-fit-checkbox');

const sortSelect = document.getElementById('sort-select');
const sortSizeBtn = document.getElementById('sort-size-btn');
const sortSizeLabel = document.getElementById('sort-size-label');
const slideshowTrigger = document.getElementById('slideshow-trigger');
const lightboxSlideshowBtn = document.getElementById('lightbox-slideshow');
const densityBtns = document.querySelectorAll('.density-btn');

const slideshowOverlay = document.getElementById('slideshow-overlay');
const slideshowImg = document.getElementById('slideshow-img');
const slideshowPlayBtn = document.getElementById('slideshow-play');
const slideshowPrevBtn = document.getElementById('slideshow-prev');
const slideshowNextBtn = document.getElementById('slideshow-next');
const slideshowCloseBtn = document.getElementById('slideshow-close');
const slideshowProgressBar = document.getElementById('slideshow-progress');

// Load More Wallpapers Container Reference
const loadMoreContainer = document.getElementById('load-more-container');

// Create toast container
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

// ==========================================
// HIGH-SPEED CDN THUMBNAIL PROXY & CACHE
// Serves fast lightweight WebP thumbnails (~30-50KB) via global edge CDN (wsrv.nl)
// Preserves pristine 4K original raw URLs for downloads and progressive Lightbox upgrade.
// ==========================================
function getThumbnailUrl(rawUrl, format = '') {
  if (!rawUrl) return '';
  const isGif = (format && format.toUpperCase() === 'GIF') || rawUrl.toLowerCase().endsWith('.gif');
  if (isGif) {
    return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=480&n=-1&output=webp`;
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=640&q=80&output=webp`;
}

// Preload Next & Previous Wallpapers for 0ms delay on Arrow Keys / Navigation
function preloadAdjacentWallpapers(wp) {
  if (!wp || !filteredWallpapers.length) return;
  const idx = filteredWallpapers.findIndex(w => w.id === wp.id);
  if (idx === -1) return;

  const nextWp = filteredWallpapers[(idx + 1) % filteredWallpapers.length];
  const prevWp = filteredWallpapers[(idx - 1 + filteredWallpapers.length) % filteredWallpapers.length];

  [nextWp, prevWp].forEach(item => {
    if (item && item.url) {
      // 1. Preload thumbnail CDN WebP
      const thumb = new Image();
      thumb.src = getThumbnailUrl(item.url, item.format);
      // 2. Preload full 4K original in background
      const full = new Image();
      full.decoding = 'async';
      full.src = item.url;
    }
  });
}

// Interactive 3D Perspective Tilt with Dynamic Radial Cursor Spotlight
function attachCardTilt(item) {
  if (!item) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || ('ontouchstart' in window && window.innerWidth < 768)) {
    return;
  }

  let ticking = false;

  item.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltY = ((x - centerX) / centerX) * 6.5;
      const tiltX = -((y - centerY) / centerY) * 6.5;
      
      item.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)`;
      item.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      item.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
      ticking = false;
    });
  });

  item.addEventListener('mouseleave', () => {
    item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
  });
}

// ==========================================
// VIEWPORT-PRIORITY IMAGE LOADER
// Images showing on screen load FIRST with native fetchpriority="high".
// Off-screen images remain idle until scrolled into view.
// Clicked / opened wallpapers immediately jump to top priority!
// ==========================================
class ViewportPriorityImageLoader {
  constructor() {
    this.loadedSet = new Set();
    this.setupObserver();
  }

  setupObserver() {
    // Observes cards as they enter or near the visible screen viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const imgEl = item.querySelector('.masonry-img');
          const src = item.getAttribute('data-src') || (imgEl ? imgEl.getAttribute('data-src') : null);
          const id = item.getAttribute('data-id');
          if (imgEl && src) {
            this.loadImmediately(item, imgEl, src, id, true);
          }
          this.observer.unobserve(item);
        }
      });
    }, {
      root: null,
      rootMargin: '120px 0px 120px 0px' // triggers right before entering screen
    });
  }

  reset() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.setupObserver();
  }

  observeCard(cardElement, imgEl, src, id, isAboveFold = false) {
    if (this.loadedSet.has(id)) {
      if (imgEl) {
        imgEl.src = src;
        imgEl.classList.add('loaded');
        const parent = imgEl.closest('.masonry-img-wrapper');
        if (parent) {
          const sk = parent.querySelector('.card-skeleton');
          if (sk) sk.remove();
        }
      }
      return;
    }

    if (isAboveFold) {
      // Images currently showing on screen load FIRST!
      this.loadImmediately(cardElement, imgEl, src, id, true);
    } else {
      // Off-screen images: hold data-src and observe
      cardElement.setAttribute('data-src', src);
      cardElement.setAttribute('data-id', id);
      if (imgEl) {
        imgEl.setAttribute('data-src', src);
      }
      this.observer.observe(cardElement);
    }
  }

  loadImmediately(cardElement, imgEl, src, id, isPriority = false) {
    if (!imgEl) return;
    if (this.loadedSet.has(id) && imgEl.classList.contains('loaded')) return;

    if (cardElement && this.observer) {
      this.observer.unobserve(cardElement);
    }

    imgEl.decoding = 'async';
    if (isPriority) {
      imgEl.setAttribute('fetchpriority', 'high');
    }

    const onComplete = () => {
      this.loadedSet.add(id);
      imgEl.classList.add('loaded');
      const parent = imgEl.closest('.masonry-img-wrapper');
      if (parent) {
        const sk = parent.querySelector('.card-skeleton');
        if (sk) sk.remove();
      }
    };

    if (imgEl.src !== src) {
      if (imgEl.complete && imgEl.naturalWidth > 0 && imgEl.src === src) {
        onComplete();
      } else {
        imgEl.addEventListener('load', onComplete, { once: true });
        imgEl.addEventListener('error', onComplete, { once: true });
        imgEl.src = src;
      }
    } else if (imgEl.complete) {
      onComplete();
    }
  }

  prioritize(id, src, targetImgEl = null) {
    const card = document.querySelector(`.masonry-item[data-id="${id}"]`);
    const imgEl = targetImgEl || (card ? card.querySelector('.masonry-img') : null);
    if (imgEl && src) {
      this.loadImmediately(card, imgEl, src, id, true);
    }
  }
}

const imageLoader = new ViewportPriorityImageLoader();

// ==========================================
// DOWNLOAD OPTIONS STATE (PNG, WebP, JPG, 4K, 2K, 1080p, 720p, Mobile)
// ==========================================
let currentDownloadFormat = 'png';
let currentDownloadRes = '4k';

function updateDownloadBtnLabel() {
  const downloadBtnText = document.getElementById('download-btn-text');
  if (!downloadBtnText) return;
  const fmtText = currentDownloadFormat.toUpperCase();
  let resText = currentDownloadRes.toUpperCase();
  if (currentDownloadRes === 'mobile') resText = 'Mobile (9:16)';
  else if (currentDownloadRes === 'original') resText = 'Original Size';
  else if (currentDownloadRes === '4k') resText = '4K (UHD)';
  else if (currentDownloadRes === '2k') resText = '2K (QHD)';
  else if (currentDownloadRes === '1080p') resText = '1080p (FHD)';
  else if (currentDownloadRes === '720p') resText = '720p (HD)';

  if (currentDownloadFormat === 'original' && currentDownloadRes === 'original') {
    downloadBtnText.textContent = 'Download Original Wallpaper';
  } else {
    downloadBtnText.textContent = `Download ${resText} (${fmtText})`;
  }
}

function setupDownloadOptions() {
  const formatPills = document.getElementById('dl-format-pills');
  const resPills = document.getElementById('dl-res-pills');

  updateDownloadBtnLabel();

  if (formatPills) {
    formatPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.dl-pill');
      if (!btn) return;
      formatPills.querySelectorAll('.dl-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDownloadFormat = btn.getAttribute('data-format');
      updateDownloadBtnLabel();
    });
  }

  if (resPills) {
    resPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.dl-pill');
      if (!btn) return;
      resPills.querySelectorAll('.dl-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDownloadRes = btn.getAttribute('data-res');
      updateDownloadBtnLabel();
    });
  }
}

// ==========================================
// ULTRA-SMOOTH GPU SHARED ELEMENT TRANSITION POPUP
// High-performance translate3d + scale FLIP animation
// ==========================================
let currentActiveWp = null;
let activeTransitionClone = null;

function animatePopupOpen(wp, originCard = null, isNavigation = false) {
  if (activeTransitionClone) {
    activeTransitionClone.remove();
    activeTransitionClone = null;
  }

  const card = originCard || document.querySelector(`.masonry-item[data-id="${wp.id}"]`);
  const cardImg = card ? card.querySelector('.masonry-img') : null;
  const modalImg = lightbox.querySelector('.lightbox-img');
  const detailsPanel = lightbox.querySelector('.lightbox-details');

  const thumbUrl = getThumbnailUrl(wp.url, wp.format);
  const fastSrc = (cardImg && (cardImg.currentSrc || cardImg.src)) ? (cardImg.currentSrc || cardImg.src) : thumbUrl;

  // Prioritize loading thumbnail
  imageLoader.prioritize(wp.id, thumbUrl, cardImg);

  // Progressive blur-up: show fast cached thumbnail immediately
  modalImg.src = fastSrc;
  modalImg.alt = wp.name;
  modalImg.classList.add('loading-hd');

  // Background asynchronous upgrade to full 4K original
  const fullHd = new Image();
  fullHd.decoding = 'async';
  fullHd.src = wp.url;
  fullHd.onload = () => {
    if (currentActiveWp && currentActiveWp.id === wp.id) {
      modalImg.src = wp.url;
      modalImg.classList.remove('loading-hd');
    }
  };
  fullHd.onerror = () => {
    modalImg.classList.remove('loading-hd');
  };

  // Preload adjacent wallpapers (Next #N+1 and Prev #N-1)
  preloadAdjacentWallpapers(wp);

  if (isNavigation || !cardImg) {
    modalImg.style.opacity = '1';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    return;
  }

  const startRect = cardImg.getBoundingClientRect();
  const isVisibleInView = (startRect.width > 0 && startRect.height > 0 &&
                           startRect.bottom > 0 && startRect.top < window.innerHeight);

  if (!isVisibleInView) {
    modalImg.style.opacity = '1';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    return;
  }

  // 1. Make lightbox active so its layout is calculated
  modalImg.style.opacity = '0';
  if (detailsPanel) {
    detailsPanel.style.opacity = '0';
    detailsPanel.style.transform = 'translateX(20px)';
  }
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // 2. Measure exact target dimensions inside lightboxMedia
  const mediaBox = lightboxMedia.getBoundingClientRect();
  const availableW = Math.max(100, mediaBox.width - 32);
  const availableH = Math.max(100, mediaBox.height - 32);

  // Compute accurate aspect ratio
  const imgAspect = (cardImg.naturalWidth && cardImg.naturalHeight) 
    ? (cardImg.naturalWidth / cardImg.naturalHeight) 
    : (startRect.width / startRect.height);

  let targetW, targetH;
  if (availableW / availableH > imgAspect) {
    targetH = availableH;
    targetW = Math.round(availableH * imgAspect);
  } else {
    targetW = availableW;
    targetH = Math.round(availableW / imgAspect);
  }

  const targetLeft = Math.round(mediaBox.left + (mediaBox.width - targetW) / 2);
  const targetTop = Math.round(mediaBox.top + (mediaBox.height - targetH) / 2);

  // 3. Create GPU-accelerated transition clone positioned exactly at target
  const clone = document.createElement('img');
  clone.className = 'shared-element-transition-clone';
  clone.src = fastSrc;
  clone.style.position = 'fixed';
  clone.style.left = `${targetLeft}px`;
  clone.style.top = `${targetTop}px`;
  clone.style.width = `${targetW}px`;
  clone.style.height = `${targetH}px`;
  clone.style.objectFit = 'cover';
  clone.style.transformOrigin = '0 0';

  // Calculate inverted FLIP transform relative to startRect
  const deltaX = startRect.left - targetLeft;
  const deltaY = startRect.top - targetTop;
  const scaleX = startRect.width / targetW;
  const scaleY = startRect.height / targetH;

  clone.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`;
  clone.style.borderRadius = `${16 / Math.min(scaleX, scaleY)}px`;
  clone.style.opacity = '1';

  document.body.appendChild(clone);
  activeTransitionClone = clone;

  // 4. Trigger butter-smooth transition in double RAF
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      clone.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      clone.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';
      clone.style.borderRadius = '8px';

      if (detailsPanel) {
        detailsPanel.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease';
        detailsPanel.style.opacity = '1';
        detailsPanel.style.transform = 'translateX(0)';
      }
    });
  });

  // 5. Clean up on transition end
  const onEnd = () => {
    if (activeTransitionClone === clone) {
      modalImg.style.opacity = '1';
      clone.remove();
      activeTransitionClone = null;
    }
  };

  clone.addEventListener('transitionend', onEnd, { once: true });
  setTimeout(onEnd, 500);
}

function animatePopupClose() {
  if (activeTransitionClone) {
    activeTransitionClone.remove();
    activeTransitionClone = null;
  }

  const targetCard = currentActiveWp ? document.querySelector(`.masonry-item[data-id="${currentActiveWp.id}"]`) : null;
  const targetImg = targetCard ? targetCard.querySelector('.masonry-img') : null;
  const modalImg = lightbox.querySelector('.lightbox-img');
  const detailsPanel = lightbox.querySelector('.lightbox-details');

  if (targetImg) {
    const destRect = targetImg.getBoundingClientRect();
    const isVisible = (destRect.width > 0 && destRect.height > 0 &&
                       destRect.bottom > 0 && destRect.top < window.innerHeight);

    if (isVisible) {
      const mediaBox = lightboxMedia.getBoundingClientRect();
      const currRect = modalImg.getBoundingClientRect();
      const targetW = currRect.width > 50 ? currRect.width : (mediaBox.width - 32);
      const targetH = currRect.height > 50 ? currRect.height : (mediaBox.height - 32);
      const targetLeft = currRect.width > 50 ? currRect.left : (mediaBox.left + 16);
      const targetTop = currRect.height > 50 ? currRect.top : (mediaBox.top + 16);

      const clone = document.createElement('img');
      clone.className = 'shared-element-transition-clone';
      clone.src = modalImg.src || (currentActiveWp ? currentActiveWp.url : '');
      clone.style.position = 'fixed';
      clone.style.left = `${targetLeft}px`;
      clone.style.top = `${targetTop}px`;
      clone.style.width = `${targetW}px`;
      clone.style.height = `${targetH}px`;
      clone.style.objectFit = 'cover';
      clone.style.borderRadius = '8px';
      clone.style.transformOrigin = '0 0';
      clone.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';
      document.body.appendChild(clone);
      activeTransitionClone = clone;

      modalImg.style.opacity = '0';
      lightbox.classList.add('animating-out');

      if (detailsPanel) {
        detailsPanel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        detailsPanel.style.opacity = '0';
        detailsPanel.style.transform = 'translateX(15px)';
      }

      const closeDeltaX = destRect.left - targetLeft;
      const closeDeltaY = destRect.top - targetTop;
      const closeScaleX = destRect.width / targetW;
      const closeScaleY = destRect.height / targetH;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clone.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), border-radius 0.4s ease, opacity 0.38s ease';
          clone.style.transform = `translate3d(${closeDeltaX}px, ${closeDeltaY}px, 0) scale(${closeScaleX}, ${closeScaleY})`;
          clone.style.borderRadius = `${16 / Math.min(closeScaleX, closeScaleY)}px`;
          clone.style.opacity = '0.9';
        });
      });

      const onEnd = () => {
        if (activeTransitionClone === clone) {
          clone.remove();
          activeTransitionClone = null;
        }
        lightbox.classList.remove('active', 'animating-out');
        modalImg.style.opacity = '';
        if (detailsPanel) {
          detailsPanel.style.opacity = '';
          detailsPanel.style.transform = '';
          detailsPanel.style.transition = '';
        }
        document.body.style.overflow = '';
        history.replaceState(null, null, ' ');
        resetEditorState();
        currentActiveWp = null;
      };

      clone.addEventListener('transitionend', onEnd, { once: true });
      setTimeout(onEnd, 450);
      return;
    }
  }

  // Smooth fallback close
  lightbox.classList.add('animating-out');
  if (detailsPanel) {
    detailsPanel.style.transition = 'opacity 0.2s ease';
    detailsPanel.style.opacity = '0';
  }
  setTimeout(() => {
    lightbox.classList.remove('active', 'animating-out');
    modalImg.style.opacity = '';
    if (detailsPanel) {
      detailsPanel.style.opacity = '';
      detailsPanel.style.transform = '';
      detailsPanel.style.transition = '';
    }
    document.body.style.overflow = '';
    history.replaceState(null, null, ' ');
    resetEditorState();
    currentActiveWp = null;
  }, 260);
}


// Header: search icon, 3-line menu, tools relocation on phones
function setupHeader() {
  const ham = document.getElementById('ham-btn');
  const menu = document.getElementById('mobile-menu');
  const sBtn = document.getElementById('search-toggle');
  const sBar = document.getElementById('search-bar');
  const sClear = document.getElementById('search-clear');
  const tools = document.getElementById('nav-tools');
  const mmTools = document.getElementById('mm-tools');
  const mmWrap = document.getElementById('mm-tools-wrap');
  if (!ham || !menu || !sBtn || !sBar || !tools || !mmTools) return;

  const toolEls = [sortSizeBtn, surpriseBtn, document.querySelector('.density-selector')].filter(Boolean);
  const mq = window.matchMedia('(max-width: 760px)');

  function placeTools() {
    const phone = mq.matches;
    const dest = phone ? mmTools : tools;
    toolEls.forEach(el => dest.appendChild(el));
    mmWrap.classList.toggle('has-tools', phone);
  }
  placeTools();
  if (mq.addEventListener) mq.addEventListener('change', placeTools);
  else if (mq.addListener) mq.addListener(placeTools);

  function setMenu(open) {
    menu.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) setSearch(false);
  }
  function setSearch(open) {
    sBar.classList.toggle('open', open);
    sBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      setMenu(false);
      setTimeout(() => searchInput.focus(), 120);
    }
  }

  ham.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  sBtn.addEventListener('click', () => setSearch(!sBar.classList.contains('open')));

  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && ['explore-tab', 'liked-tab', 'surprise-btn'].includes(b.id)) setMenu(false);
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !ham.contains(e.target)) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('open')) { setMenu(false); ham.focus(); }
    else if (sBar.classList.contains('open')) { setSearch(false); sBtn.focus(); }
  });

  function syncSearchUI() {
    const has = searchInput.value.trim() !== '';
    sBtn.classList.toggle('has-q', has);
    sClear.hidden = !has;
  }
  searchInput.addEventListener('input', syncSearchUI);
  sClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.focus();
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { setSearch(false); }
  });
  syncSearchUI();

  // keep the "+N" label right when the column count changes
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(updateLoadMoreUI, 150);
  });
}

// Initialize App
function init() {
  handleSplashScreen();
  setupTheme();
  setupFilters();
  setupHeader();
  renderBoardPills();
  populateBoardSelect();
  setupDownloadOptions();
  setupEventListeners();
  updateSortSizeBtnUI();
  filterAndRender(true);
  handleDeepLinking();
}

// Splash Loading Screen Handler
function handleSplashScreen() {
  const splash = document.getElementById('splash-screen');
  const progress = document.getElementById('splash-progress');
  if (!splash) return;

  progress.style.width = '30%';
  setTimeout(() => {
    progress.style.width = '75%';
    setTimeout(() => {
      progress.style.width = '100%';
      setTimeout(() => {
        splash.classList.add('fade-out');
      }, 200);
    }, 250);
  }, 150);
}

// Theme Setup (Default to Dark Mode, data-theme on <html>)
function setupTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  syncThemeUI();
}

function syncThemeUI() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeToggleBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
}

// Build Folder / Format dropdowns from the WALLPAPERS list
function fillFilterSelect(select, values, key) {
  const counts = {};
  WALLPAPERS.forEach(wp => { counts[wp[key]] = (counts[wp[key]] || 0) + 1; });
  select.innerHTML = '';
  values.forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    o.dataset.hint = (v === 'All' ? WALLPAPERS.length : (counts[v] || 0)).toLocaleString();
    select.appendChild(o);
  });
  select.value = 'All';
}

function setupFilters() {
  const categories = ['All', ...new Set(WALLPAPERS.map(wp => wp.category))];
  const formats = ['All', ...new Set(WALLPAPERS.map(wp => wp.format))];

  fillFilterSelect(categorySelect, categories, 'category');
  fillFilterSelect(formatSelect, formats, 'format');

  DD.enhance(categorySelect);
  DD.enhance(formatSelect);
  DD.enhance(boardFilterSelect);
  DD.enhance(sortSelect);
}

// Helper to calculate size in bytes
function getWpSizeBytes(wp) {
  if (!wp || !wp.size) return 0;
  const str = String(wp.size).trim().toLowerCase();
  const val = parseFloat(str);
  if (isNaN(val)) return 0;
  if (str.includes('gb')) return val * 1024 * 1024 * 1024;
  if (str.includes('mb')) return val * 1024 * 1024;
  if (str.includes('kb')) return val * 1024;
  return val;
}

// Synchronize Header Auto-Sort by Size Button UI
const SORT_SVG = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const SORT_ICONS = {
  none: SORT_SVG('<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>'),
  desc: SORT_SVG('<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/>'),
  asc: SORT_SVG('<path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/>')
};

function updateSortSizeBtnUI() {
  if (!sortSizeBtn) return;
  let icon = SORT_ICONS.none, label = 'Sort: Size', title = 'Sort by File Size (Toggle Largest / Smallest)', active = false;
  if (currentSort === 'size-desc') {
    icon = SORT_ICONS.desc; label = 'Size: Largest'; active = true;
    title = 'Sorted: Largest file size first (Click for Smallest)';
  } else if (currentSort === 'size-asc') {
    icon = SORT_ICONS.asc; label = 'Size: Smallest'; active = true;
    title = 'Sorted: Smallest file size first (Click for Default)';
  }
  sortSizeBtn.classList.toggle('active', active);
  sortSizeBtn.innerHTML = `${icon}<span id="sort-size-label" class="nav-label">${label}</span>`;
  sortSizeBtn.setAttribute('title', title);
  sortSizeBtn.setAttribute('aria-label', title);
  if (sortSelect && sortSelect.value !== currentSort) {
    sortSelect.value = currentSort;
  }
  DD.sync(sortSelect);
}

// Event Listeners Setup
function setupEventListeners() {
  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterAndRender(true);
  });

  // Folder / Format dropdown changes
  categorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    filterAndRender(true);
  });

  formatSelect.addEventListener('change', (e) => {
    currentFormat = e.target.value;
    filterAndRender(true);
  });

  // Sorting
  // Header Auto-Sort by Size Button Click
  if (sortSizeBtn) {
    sortSizeBtn.addEventListener('click', () => {
      if (currentSort === 'default' || currentSort === 'name-asc' || currentSort === 'name-desc') {
        currentSort = 'size-desc';
        showToast('Sorted by file size: Largest first', 'info');
      } else if (currentSort === 'size-desc') {
        currentSort = 'size-asc';
        showToast('Sorted by file size: Smallest first', 'info');
      } else {
        currentSort = 'default';
        showToast('Sorting reset to default natural order', 'info');
      }
      updateSortSizeBtnUI();
      filterAndRender(true);
    });
  }

  // Sorting Dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      updateSortSizeBtnUI();
      filterAndRender(true);
    });
  }

  // Grid Density Switcher with Fluid Transitions
  densityBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      densityBtns.forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      currentGridDensity = targetBtn.getAttribute('data-density');
      
      grid.classList.add('switching');
      setTimeout(() => {
        grid.classList.remove('grid-sm', 'grid-md', 'grid-lg');
        grid.classList.add(`grid-${currentGridDensity}`);
        setTimeout(() => {
          grid.classList.remove('switching');
          updateLoadMoreUI();
        }, 60);
      }, 100);
    });
  });

  // Theme Toggle Click (circular reveal where supported)
  themeToggleBtn.addEventListener('click', () => {
    const de = document.documentElement;
    const next = de.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const apply = () => {
      de.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (err) { /* storage blocked */ }
      syncThemeUI();
    };
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      apply();
    } else {
      const r = themeToggleBtn.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      de.classList.add('theme-swap');
      const t = document.startViewTransition(apply);
      t.ready.then(() => {
        de.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
      const done = () => de.classList.remove('theme-swap');
      t.finished.then(done, done);
    }
    showToast(`${next === 'light' ? 'Light' : 'Dark'} mode enabled`, 'info');
  });

  // Tab Navigation Click
  exploreTab.addEventListener('click', () => {
    if (currentView !== 'explore') {
      currentView = 'explore';
      exploreTab.classList.add('active');
      likedTab.classList.remove('active');
      deactivateBoardPills();
      filterAndRender(true);
    }
  });

  likedTab.addEventListener('click', () => {
    if (currentView !== 'liked') {
      currentView = 'liked';
      likedTab.classList.add('active');
      exploreTab.classList.remove('active');
      deactivateBoardPills();
      filterAndRender(true);
    }
  });

  // Surprise Me Button Click (Random Wallpaper)
  surpriseBtn.addEventListener('click', () => {
    if (WALLPAPERS.length === 0) return;
    const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
    const randomWp = WALLPAPERS[randomIndex];
    openLightbox(randomWp);
    showToast(`Surprise! Displaying "${randomWp.name}"`, 'success');
  });

  // Lightbox Close Events
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Board Creation Listener
  boardCreateBtn.addEventListener('click', createNewBoard);

  // Board Filter Dropdown Change
  boardFilterSelect.addEventListener('change', (e) => {
    const name = e.target.value;
    if (!name) return;
    exploreTab.classList.remove('active');
    likedTab.classList.remove('active');
    currentView = 'board';
    currentBoardName = name;
    filterAndRender(true);
  });

  // Editor Panel Listeners
  editorToggleBtn.addEventListener('click', toggleEditorPanel);
  blurSlider.addEventListener('input', handleBlurChange);
  panSlider.addEventListener('input', handlePanChange);
  blurFitCheckbox.addEventListener('change', () => updateCanvas());

  ratioBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      ratioBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCropRatio = e.target.getAttribute('data-ratio');
      cropOffsetPercent = 50; // Reset offset on aspect ratio changes
      panSlider.value = 50;
      panVal.textContent = '50%';
      updateCanvas();
    });
  });

  // Slideshow Triggers
  slideshowTrigger.addEventListener('click', () => startSlideshow(0));
  lightboxSlideshowBtn.addEventListener('click', () => {
    const currentId = window.location.hash.substring(1);
    const index = filteredWallpapers.findIndex(w => w.id === currentId);
    closeLightbox();
    startSlideshow(index !== -1 ? index : 0);
  });

  // Slideshow Controls
  slideshowPlayBtn.addEventListener('click', toggleSlideshowPlay);
  slideshowPrevBtn.addEventListener('click', prevSlide);
  slideshowNextBtn.addEventListener('click', nextSlide);
  slideshowCloseBtn.addEventListener('click', closeSlideshow);
  slideshowOverlay.addEventListener('mousemove', triggerSlideshowMouseMovement);

  // Key Down Events (Arrow controls, L, D, E, S, Esc)
  document.addEventListener('keydown', (e) => {
    // Lightbox Shortcuts
    if (lightbox.classList.contains('active') && !slideshowActive) {
      if (e.key === 'ArrowRight') {
        navigateWp(1);
      } else if (e.key === 'ArrowLeft') {
        navigateWp(-1);
      } else if (e.key.toLowerCase() === 'l') {
        const currentId = window.location.hash.substring(1);
        if (currentId) toggleLike(currentId);
      } else if (e.key.toLowerCase() === 'd') {
        const currentId = window.location.hash.substring(1);
        const wp = WALLPAPERS.find(w => w.id === currentId);
        if (wp) {
          if (editModeActive) {
            downloadWallpaper(wp.url, `Edited_${wp.name}.jpg`, editorCanvas, currentDownloadFormat, currentDownloadRes);
          } else {
            downloadWallpaper(wp.url, `${wp.name}.${wp.format.toLowerCase()}`, null, currentDownloadFormat, currentDownloadRes);
          }
        }
      } else if (e.key.toLowerCase() === 'e') {
        toggleEditorPanel();
      }
    }
    
    // Slideshow Shortcuts
    if (slideshowActive) {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleSlideshowPlay();
      } else if (e.key === 'Escape') {
        closeSlideshow();
      }
    }
  });
}

// Keyboard arrow index navigator
function navigateWp(direction) {
  const currentId = window.location.hash.substring(1);
  if (!currentId) return;
  const currentIndex = filteredWallpapers.findIndex(w => w.id === currentId);
  if (currentIndex === -1) return;
  
  let nextIndex = currentIndex + direction;
  if (nextIndex >= filteredWallpapers.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = filteredWallpapers.length - 1;
  
  openLightbox(filteredWallpapers[nextIndex], null, true);
}

// Deep Linking Handler (Priority opens first)
function handleDeepLinking() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#wp_')) {
    const wpId = hash.substring(1);
    const targetWp = WALLPAPERS.find(w => w.id === wpId);
    if (targetWp) {
      imageLoader.prioritize(targetWp.id, targetWp.url);
      setTimeout(() => openLightbox(targetWp), 300);
    }
  }
}

// Render Custom Boards dropdown
function renderBoardPills() {
  const boardNames = Object.keys(customBoards);
  if (boardNames.length === 0) {
    boardsFilterRow.style.display = 'none';
    return;
  }

  boardsFilterRow.style.display = 'flex';
  boardFilterSelect.innerHTML = '';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'Select a board';
  boardFilterSelect.appendChild(none);
  boardNames.forEach(name => {
    const o = document.createElement('option');
    o.value = name;
    o.textContent = name;
    o.dataset.hint = String(customBoards[name].length);
    boardFilterSelect.appendChild(o);
  });
  boardFilterSelect.value = (currentView === 'board' && customBoards[currentBoardName]) ? currentBoardName : '';
  DD.refresh(boardFilterSelect);
}

function deactivateBoardPills() {
  boardFilterSelect.value = '';
  DD.sync(boardFilterSelect);
}

// Populate Dropdown selector inside the Lightbox
function populateBoardSelect() {
  boardSelect.innerHTML = `
    <option value="">-- Add to Board --</option>
    <option value="Favorites">Liked Wallpapers</option>
  `;
  
  Object.keys(customBoards).forEach(boardName => {
    const option = document.createElement('option');
    option.value = boardName;
    option.textContent = boardName;
    boardSelect.appendChild(option);
  });
}

// Board Creation Prompt Logic
function createNewBoard() {
  const boardName = prompt('Enter a name for your new Board/Collection:');
  if (!boardName) return;
  
  const trimmed = boardName.trim();
  if (trimmed === '') return;

  if (trimmed.toLowerCase() === 'favorites') {
    showToast('Use the "Liked Wallpapers" options instead', 'info');
    return;
  }

  if (customBoards[trimmed]) {
    showToast('A board with this name already exists', 'info');
    return;
  }

  customBoards[trimmed] = [];
  localStorage.setItem('custom_boards', JSON.stringify(customBoards));
  
  populateBoardSelect();
  renderBoardPills();
  showToast(`Board "${trimmed}" created successfully!`, 'success');
}

// Filter and render list
function filterAndRender(reset = true) {
  if (reset) {
    grid.innerHTML = '';
    renderedCount = 0;
    imageLoader.reset();
  }

  filteredWallpapers = WALLPAPERS.filter(wp => {
    const matchesSearch = searchQuery === '' || 
      wp.name.toLowerCase().includes(searchQuery) ||
      wp.category.toLowerCase().includes(searchQuery) ||
      wp.format.toLowerCase().includes(searchQuery);

    const matchesCategory = currentCategory === 'All' || wp.category === currentCategory;
    const matchesFormat = currentFormat === 'All' || wp.format === currentFormat;

    let matchesView = true;
    if (currentView === 'liked') {
      matchesView = likedWallpapers.has(wp.id);
    } else if (currentView === 'board') {
      const boardWps = customBoards[currentBoardName] || [];
      matchesView = boardWps.includes(wp.id);
    }

    return matchesSearch && matchesCategory && matchesFormat && matchesView;
  });

  // Apply Sorting (with Natural Numeric Sorting, Requirement 3)
  if (currentSort === 'name-asc') {
    filteredWallpapers.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (currentSort === 'name-desc') {
    filteredWallpapers.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (currentSort === 'size-asc') {
    filteredWallpapers.sort((a, b) => getWpSizeBytes(a) - getWpSizeBytes(b));
  } else if (currentSort === 'size-desc') {
    filteredWallpapers.sort((a, b) => getWpSizeBytes(b) - getWpSizeBytes(a));
  } else {
    // Default natural order: 1, 2, 3 ... 132
    filteredWallpapers.sort((a, b) => {
      if (a.category !== b.category) {
        if (a.category === 'Anime Wallpapers') return -1;
        if (b.category === 'Anime Wallpapers') return 1;
        if (a.category === 'Anime Backgrounds') return -1;
        if (b.category === 'Anime Backgrounds') return 1;
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  // Update Stats
  totalCountEl.textContent = WALLPAPERS.length;
  viewCountEl.textContent = filteredWallpapers.length;

  if (filteredWallpapers.length === 0) {
    renderEmptyState();
    updateLoadMoreUI();
  } else {
    const emptyState = grid.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    renderNextBatch();
  }
}

// Render empty state template
function renderEmptyState() {
  let emptyDesc = 'We couldn\'t find any matching wallpapers. Try adjusting your filters or search terms.';
  if (currentView === 'liked') {
    emptyDesc = 'You haven\'t liked any wallpapers yet. Go back to Explore and click the heart icon on your favorites!';
  } else if (currentView === 'board') {
    emptyDesc = `This board is empty. Open any wallpaper and add it to "${currentBoardName}"!`;
  }

  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon"><i class="fas fa-image-slash"></i></div>
      <div class="empty-title">No Wallpapers Found</div>
      <div class="empty-desc">${emptyDesc}</div>
    </div>
  `;
}

// Number of columns the grid currently shows
function getGridColumns() {
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  return Math.max(1, cols);
}

// ~30 wallpapers per load, rounded up so the grid always ends on a full row.
// New wallpapers then start on a fresh row at the bottom instead of filling gaps at the side.
function getBatchSize() {
  const cols = getGridColumns();
  const target = Math.ceil((renderedCount + itemsPerLoad) / cols) * cols;
  return Math.max(1, target - renderedCount);
}

// Render next slice of wallpapers (about 30 per batch, full rows)
function renderNextBatch() {
  const batchSize = getBatchSize();
  const nextBatch = filteredWallpapers.slice(renderedCount, renderedCount + batchSize);
  
  if (nextBatch.length === 0) {
    updateLoadMoreUI();
    return;
  }

  const fragment = document.createDocumentFragment();

  nextBatch.forEach((wp, index) => {
    const isLiked = likedWallpapers.has(wp.id);
    const item = document.createElement('div');
    item.className = 'masonry-item animate-in';
    item.setAttribute('data-id', wp.id);
    
    // Staggered cascade entrance timing (0 to 29)
    const cascadeIndex = index % 30;
    item.style.setProperty('--stagger', cascadeIndex);
    
    const isGif = wp.format === 'GIF';
    const thumbUrl = getThumbnailUrl(wp.url, wp.format);
    
    item.innerHTML = `
      <div class="card-tilt-glow"></div>
      <div class="masonry-img-wrapper">
        ${isGif ? '<div class="gif-badge">GIF</div>' : ''}
        <div class="card-skeleton"></div>
        <img class="masonry-img" data-src="${thumbUrl}" alt="${wp.name}" decoding="async" />
      </div>
      <div class="card-overlay">
        <div class="overlay-top">
          <button class="overlay-btn like-btn ${isLiked ? 'liked' : ''}" title="${isLiked ? 'Unlike' : 'Like'}">
            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="overlay-btn download-btn" title="Quick Download (4K Original)">
            <i class="fas fa-arrow-down"></i>
          </button>
        </div>
        <div class="overlay-bottom">
          <h3 class="overlay-title">${wp.name}</h3>
          <div class="overlay-meta">
            <span class="overlay-category">${wp.category}</span>
            <span class="overlay-size">${wp.format} • ${wp.size}</span>
          </div>
        </div>
      </div>
    `;

    // Interactive 3D Perspective Tilt on Card Hover
    attachCardTilt(item);

    // Viewport image loading with CDN fail-safe fallback
    const cardImg = item.querySelector('.masonry-img');
    cardImg.onerror = () => {
      // If CDN proxy fails or is blocked, seamlessly load original raw URL
      if (cardImg.src !== wp.url) {
        cardImg.src = wp.url;
      }
    };

    const isAboveFold = (renderedCount === 0 && index < 10);
    imageLoader.observeCard(item, cardImg, thumbUrl, wp.id, isAboveFold);

    // Click card opens Lightbox with smooth shared element popup animation
    item.addEventListener('click', (e) => {
      if (e.target.closest('.overlay-btn')) return;
      openLightbox(wp, item);
    });

    const likeBtn = item.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      likeBtn.classList.add('pop');
      setTimeout(() => likeBtn.classList.remove('pop'), 400);
      toggleLike(wp.id, likeBtn);
    });

    const downloadBtn = item.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadBtn.classList.add('downloading');
      const icon = downloadBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-spinner fa-spin';
      downloadWallpaper(wp.url, `${wp.name}.${wp.format.toLowerCase()}`)
        .finally(() => {
          setTimeout(() => {
            downloadBtn.classList.remove('downloading');
            if (icon) icon.className = 'fas fa-arrow-down';
          }, 800);
        });
    });

    fragment.appendChild(item);
  });

  grid.appendChild(fragment);
  renderedCount += nextBatch.length;

  // Update Load More Button & Stats
  updateLoadMoreUI();
}

// Update the Load More Wallpapers controls & counter
function updateLoadMoreUI() {
  const container = document.getElementById('load-more-container');
  if (!container) return;

  const total = filteredWallpapers.length;
  if (total === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  if (renderedCount >= total) {
    container.innerHTML = `
      <div class="all-loaded-indicator">
        <i class="fas fa-check-circle"></i>
        <span>All ${total.toLocaleString()} wallpapers loaded</span>
      </div>
    `;
  } else {
    const remaining = total - renderedCount;
    const nextCount = Math.min(getBatchSize(), remaining);
    container.innerHTML = `
      <button id="load-more-btn" class="load-more-btn" title="Load next ${nextCount} wallpapers">
        <i class="fas fa-plus-circle"></i>
        <span>Load More Wallpapers</span>
        <span class="load-more-badge">+${nextCount}</span>
      </button>
      <div class="load-more-status" id="load-more-status">
        Showing <strong>${renderedCount.toLocaleString()}</strong> of <strong>${total.toLocaleString()}</strong> wallpapers
      </div>
    `;

    const btn = document.getElementById('load-more-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        renderNextBatch();
      });
    }
  }
}

// Toggle Wallpaper Liking (Optimistic UI)
function toggleLike(id, btnElement) {
  const isLiked = likedWallpapers.has(id);
  const wp = WALLPAPERS.find(w => w.id === id);

  if (btnElement) {
    btnElement.classList.add('pop');
    setTimeout(() => btnElement.classList.remove('pop'), 400);
  }

  if (isLiked) {
    likedWallpapers.delete(id);
    if (btnElement) {
      btnElement.classList.remove('liked');
      btnElement.querySelector('i').className = 'far fa-heart';
      btnElement.setAttribute('title', 'Like');
    }
    showToast(`Removed "${wp.name}" from favorites`, 'info');
  } else {
    likedWallpapers.add(id);
    if (btnElement) {
      btnElement.classList.add('liked');
      btnElement.querySelector('i').className = 'fas fa-heart';
      btnElement.setAttribute('title', 'Unlike');
    }
    showToast(`Added "${wp.name}" to favorites`, 'success');
  }

  localStorage.setItem('liked_wallpapers', JSON.stringify(Array.from(likedWallpapers)));

  if (currentView === 'liked') {
    setTimeout(() => filterAndRender(false), 400);
  }
}

// Custom Boards: Add Wallpaper to Specific Board
function addWallpaperToBoard(wpId, boardName) {
  if (boardName === 'Favorites') {
    toggleLike(wpId);
    return;
  }

  const boardWps = customBoards[boardName];
  if (boardWps.includes(wpId)) {
    customBoards[boardName] = boardWps.filter(id => id !== wpId);
    showToast(`Removed from "${boardName}"`, 'info');
  } else {
    boardWps.push(wpId);
    showToast(`Added to "${boardName}"`, 'success');
  }

  localStorage.setItem('custom_boards', JSON.stringify(customBoards));
  renderBoardPills();
  
  if (currentView === 'board' && currentBoardName === boardName) {
    setTimeout(() => filterAndRender(false), 400);
  }
}

// High Quality Canvas Resizer & Multi-Format Exporter (PNG, WebP, JPG, 4K, 2K, 1080p, 720p, Mobile)
async function downloadWallpaper(url, filename, canvasElement = null, formatOverride = null, resOverride = null) {
  const chosenFormat = formatOverride || currentDownloadFormat;
  const chosenRes = resOverride || currentDownloadRes;

  showToast(`Preparing ${chosenRes.toUpperCase()} (${chosenFormat.toUpperCase()})...`, 'info');

  try {
    // If user edited with the canvas editor (blur / custom crop)
    if (canvasElement) {
      let mimeType = 'image/jpeg';
      let ext = 'jpg';
      let quality = 0.95;
      if (chosenFormat === 'png') { mimeType = 'image/png'; ext = 'png'; }
      else if (chosenFormat === 'webp') { mimeType = 'image/webp'; ext = 'webp'; }
      
      canvasElement.toBlob(blob => {
        if (blob) {
          saveBlobFile(blob, filename.replace(/\.[^.]+$/, `.${ext}`));
          showToast('Edited wallpaper downloaded!', 'success');
        } else {
          fallbackDirectDownload(canvasElement.toDataURL('image/jpeg', 0.95), filename);
        }
      }, mimeType, quality);
      return;
    }

    // Direct download if original format and original resolution
    if (chosenRes === 'original' && (chosenFormat === 'original' || !chosenFormat)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const blob = await response.blob();
        saveBlobFile(blob, filename);
        showToast('Download completed!', 'success');
        return;
      } catch (err) {
        fallbackDirectDownload(url, filename);
        return;
      }
    }

    // Load original image to canvas for re-scaling and re-encoding
    const img = await loadImageForExport(url);
    const origW = img.naturalWidth || img.width || 1920;
    const origH = img.naturalHeight || img.height || 1080;

    let targetW = origW;
    let targetH = origH;

    const resMap = {
      '4k': { maxW: 3840, maxH: 2160 },
      '2k': { maxW: 2560, maxH: 1440 },
      '1080p': { maxW: 1920, maxH: 1080 },
      '720p': { maxW: 1280, maxH: 720 },
      'mobile': { targetW: 1080, targetH: 1920, isMobile: true }
    };

    if (chosenRes in resMap) {
      const cfg = resMap[chosenRes];
      if (cfg.isMobile) {
        targetW = cfg.targetW;
        targetH = cfg.targetH;
      } else {
        const scale = Math.min(cfg.maxW / origW, cfg.maxH / origH);
        targetW = Math.max(1, Math.round(origW * scale));
        targetH = Math.max(1, Math.round(origH * scale));
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (chosenRes === 'mobile') {
      const aspectImg = origW / origH;
      const aspectTarget = targetW / targetH;
      let drawW, drawH, drawX, drawY;

      if (aspectImg > aspectTarget) {
        drawH = targetH;
        drawW = origW * (targetH / origH);
        drawX = (targetW - drawW) / 2;
        drawY = 0;
      } else {
        drawW = targetW;
        drawH = origH * (targetW / origW);
        drawX = 0;
        drawY = (targetH - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }

    // Determine output MIME & extension
    let mimeType = 'image/png';
    let ext = 'png';
    let quality = 0.95;

    if (chosenFormat === 'webp') {
      mimeType = 'image/webp';
      ext = 'webp';
      quality = 0.95;
    } else if (chosenFormat === 'jpg' || chosenFormat === 'jpeg') {
      mimeType = 'image/jpeg';
      ext = 'jpg';
      quality = 0.93;
    } else if (chosenFormat === 'original') {
      const origExt = filename.split('.').pop().toLowerCase();
      if (origExt === 'png') { mimeType = 'image/png'; ext = 'png'; }
      else if (origExt === 'webp') { mimeType = 'image/webp'; ext = 'webp'; }
      else { mimeType = 'image/jpeg'; ext = 'jpg'; }
    }

    const baseName = filename.replace(/\.[^.]+$/, '');
    const outName = `${baseName}_${chosenRes.toUpperCase()}.${ext}`;

    canvas.toBlob(blob => {
      if (blob) {
        saveBlobFile(blob, outName);
        showToast(`Downloaded ${outName} successfully!`, 'success');
      } else {
        fallbackDirectDownload(url, filename);
      }
    }, mimeType, quality);

  } catch (error) {
    console.error('Download error:', error);
    fallbackDirectDownload(url, filename);
  }
}

function saveBlobFile(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
}

function fallbackDirectDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Download started in a new tab', 'info');
}

function loadImageForExport(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const blobImg = new Image();
          blobImg.onload = () => resolve(blobImg);
          blobImg.onerror = reject;
          blobImg.src = blobUrl;
        })
        .catch(reject);
    };
    img.src = url;
  });
}

// Lightbox Logic
function openLightbox(wp, originCard = null, isNavigation = false) {
  currentActiveWp = wp;
  const isLiked = likedWallpapers.has(wp.id);
  
  lightbox.querySelector('.detail-category').textContent = wp.category;
  lightbox.querySelector('.detail-title').textContent = wp.name;
  
  // Set attributes info
  document.getElementById('info-format').textContent = wp.format;
  document.getElementById('info-size').textContent = wp.size;
  document.getElementById('info-path').textContent = wp.path;
  
  window.location.hash = wp.id;

  // Set Board Select dropdown values
  setupBoardSelectorForWallpaper(wp.id);

  // Setup Lightbox Action listeners
  const lightboxDownloadBtn = document.getElementById('lightbox-download');
  const lightboxLikeBtn = document.getElementById('lightbox-like');

  const newDownloadBtn = lightboxDownloadBtn.cloneNode(true);
  const newLikeBtn = lightboxLikeBtn.cloneNode(true);
  
  lightboxDownloadBtn.parentNode.replaceChild(newDownloadBtn, lightboxDownloadBtn);
  lightboxLikeBtn.parentNode.replaceChild(newLikeBtn, lightboxLikeBtn);

  // Sync button text with current format and resolution
  updateDownloadBtnLabel();

  if (isLiked) {
    newLikeBtn.classList.add('liked');
    newLikeBtn.innerHTML = '<i class="fas fa-heart"></i> Liked';
  } else {
    newLikeBtn.classList.remove('liked');
    newLikeBtn.innerHTML = '<i class="far fa-heart"></i> Favorite';
  }

  newDownloadBtn.addEventListener('click', () => {
    newDownloadBtn.classList.add('downloading');
    const dlText = document.getElementById('download-btn-text');
    if (dlText) dlText.textContent = 'Preparing 4K Download...';

    const p = editModeActive
      ? downloadWallpaper(wp.url, `Edited_${wp.name}.jpg`, editorCanvas, currentDownloadFormat, currentDownloadRes)
      : downloadWallpaper(wp.url, `${wp.name}.${wp.format.toLowerCase()}`, null, currentDownloadFormat, currentDownloadRes);

    Promise.resolve(p).finally(() => {
      setTimeout(() => {
        newDownloadBtn.classList.remove('downloading');
        updateDownloadBtnLabel();
      }, 800);
    });
  });

  newLikeBtn.addEventListener('click', () => {
    newLikeBtn.classList.add('pop');
    setTimeout(() => newLikeBtn.classList.remove('pop'), 400);
    toggleLike(wp.id);
    const updatedLiked = likedWallpapers.has(wp.id);
    
    if (updatedLiked) {
      newLikeBtn.classList.add('liked');
      newLikeBtn.innerHTML = '<i class="fas fa-heart"></i> Liked';
      boardSelect.value = 'Favorites';
    } else {
      newLikeBtn.classList.remove('liked');
      newLikeBtn.innerHTML = '<i class="far fa-heart"></i> Favorite';
      boardSelect.value = '';
    }

    const cardEl = document.querySelector(`.masonry-item[data-id="${wp.id}"]`);
    if (cardEl) {
      const cardLikeBtn = cardEl.querySelector('.like-btn');
      if (updatedLiked) {
        cardLikeBtn.classList.add('liked');
        cardLikeBtn.querySelector('i').className = 'fas fa-heart';
      } else {
        cardLikeBtn.classList.remove('liked');
        cardLikeBtn.querySelector('i').className = 'far fa-heart';
      }
    }
  });

  boardSelect.onchange = (e) => {
    const selectedBoard = e.target.value;
    if (selectedBoard) {
      addWallpaperToBoard(wp.id, selectedBoard);
    }
  };

  resetEditorState();

  if (wp.format === 'GIF') {
    editorToggleBtn.style.display = 'none';
  } else {
    editorToggleBtn.style.display = 'block';
    originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';
    originalImage.src = wp.url;
  }

  // Trigger Shared Element Popup Animation (Requirement 5) & Load First (Requirement 3)
  animatePopupOpen(wp, originCard, isNavigation);
}

function closeLightbox() {
  animatePopupClose();
}

function setupBoardSelectorForWallpaper(wpId) {
  let matchedBoard = '';
  if (likedWallpapers.has(wpId)) {
    matchedBoard = 'Favorites';
  } else {
    for (const name of Object.keys(customBoards)) {
      if (customBoards[name].includes(wpId)) {
        matchedBoard = name;
        break;
      }
    }
  }
  boardSelect.value = matchedBoard;
}

// Canvas Editor Panel Actions
function toggleEditorPanel() {
  editModeActive = !editModeActive;
  
  if (editModeActive) {
    editorToggleBtn.classList.add('active');
    editorToggleBtn.innerHTML = '<i class="fas fa-check"></i> Close Editor';
    editorPanel.classList.add('active');
    lightboxMedia.classList.add('canvas-preview-active');
    updateCanvas();
  } else {
    resetEditorState();
  }
}

// Reset Editor State
function resetEditorState() {
  editModeActive = false;
  currentBlur = 0;
  currentCropRatio = 'free';
  cropOffsetPercent = 50;
  originalImage = null;
  
  editorToggleBtn.classList.remove('active');
  editorToggleBtn.innerHTML = '<i class="fas fa-magic"></i> Edit Wallpaper (Crop & Blur)';
  editorPanel.classList.remove('active');
  lightboxMedia.classList.remove('canvas-preview-active');
  
  blurSlider.value = 0;
  blurVal.textContent = '0px';
  panSlider.value = 50;
  panVal.textContent = '50%';
  panControl.style.display = 'none';
  blurFitContainer.style.display = 'none';
  blurFitCheckbox.checked = false;

  ratioBtns.forEach(btn => {
    if (btn.getAttribute('data-ratio') === 'free') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function handleBlurChange(e) {
  currentBlur = parseInt(e.target.value, 10);
  blurVal.textContent = `${currentBlur}px`;
  updateCanvas();
}

function handlePanChange(e) {
  cropOffsetPercent = parseInt(e.target.value, 10);
  panVal.textContent = `${cropOffsetPercent}%`;
  updateCanvas();
}

// Render dynamic center-crop, Gaussian blur, crop pan slider offsets, and Blurred Fit logic onto canvas
function updateCanvas() {
  if (!originalImage || !originalImage.complete) {
    setTimeout(updateCanvas, 50);
    return;
  }

  const imgW = originalImage.naturalWidth;
  const imgH = originalImage.naturalHeight;

  // Decide if panning offset sliders need to be visible
  updateEditorControlsVisibility(imgW, imgH);

  // Calculate cropping bounds
  const crop = getCropBounds(imgW, imgH, currentCropRatio);

  editorCanvas.width = crop.w;
  editorCanvas.height = crop.h;

  const ctx = editorCanvas.getContext('2d');
  ctx.clearRect(0, 0, crop.w, crop.h);

  // Check if Blurred Fit Portrait is enabled
  const doBlurFit = blurFitCheckbox.checked && 
    (currentCropRatio === '9:16' || currentCropRatio === '1:1') && 
    (imgW > imgH);

  if (doBlurFit) {
    // 1. Draw blurred, zoomed background
    ctx.save();
    ctx.filter = `blur(${Math.max(currentBlur, 24)}px)`; // enforce minimum blur for fitting
    
    // Zoom/fill backdrop math: crop center portrait slice of landscape image
    const bgRatio = crop.w / crop.h;
    let bgW, bgH;
    if (imgW / imgH > bgRatio) {
      bgH = imgH;
      bgW = imgH * bgRatio;
    } else {
      bgW = imgW;
      bgH = imgW / bgRatio;
    }
    const bgX = (imgW - bgW) / 2;
    const bgY = (imgH - bgH) / 2;
    
    // Draw blurred back
    ctx.drawImage(originalImage, bgX, bgY, bgW, bgH, 0, 0, crop.w, crop.h);
    ctx.restore();

    // 2. Draw clean unblurred desktop foreground in center
    ctx.save();
    if (currentBlur > 0) {
      ctx.filter = `blur(${currentBlur}px)`;
    } else {
      ctx.filter = 'none';
    }

    const scale = crop.w / imgW;
    const fgH = imgH * scale;
    const fgY = (crop.h - fgH) / 2;
    
    ctx.drawImage(originalImage, 0, 0, imgW, imgH, 0, fgY, crop.w, fgH);
    ctx.restore();

  } else {
    // Standard Draw logic (Blur + Crop Position Pan offsets)
    if (currentBlur > 0) {
      ctx.filter = `blur(${currentBlur}px)`;
    } else {
      ctx.filter = 'none';
    }

    const pad = currentBlur * 2;
    ctx.drawImage(
      originalImage, 
      crop.x - pad, 
      crop.y - pad, 
      crop.w + pad * 2, 
      crop.h + pad * 2, 
      -pad, 
      -pad, 
      crop.w + pad * 2, 
      crop.h + pad * 2
    );
  }
}

// Dynamically toggles sliders depending on crop bounds prying axes
function updateEditorControlsVisibility(imgW, imgH) {
  if (currentCropRatio === 'free') {
    panControl.style.display = 'none';
    blurFitContainer.style.display = 'none';
    return;
  }

  let targetRatio = 1;
  if (currentCropRatio === '16:9') targetRatio = 16 / 9;
  else if (currentCropRatio === '9:16') targetRatio = 9 / 16;
  else if (currentCropRatio === '1:1') targetRatio = 1;

  const imgRatio = imgW / imgH;

  // 1. Pan controls visibility
  if (Math.abs(imgRatio - targetRatio) < 0.05) {
    panControl.style.display = 'none'; // ratios match, no panning needed
  } else {
    panControl.style.display = 'flex';
    if (imgRatio > targetRatio) {
      panLabel.textContent = 'Slide Left / Right';
    } else {
      panLabel.textContent = 'Slide Up / Down';
    }
  }

  // 2. Blurred Fit Portrait controls visibility (Landscape image fitted into Portrait crop)
  const isPortraitCrop = currentCropRatio === '9:16' || currentCropRatio === '1:1';
  if (isPortraitCrop && imgW > imgH) {
    blurFitContainer.style.display = 'flex';
  } else {
    blurFitContainer.style.display = 'none';
    blurFitCheckbox.checked = false;
  }
}

// Center crop calculation helper with panning offsets
function getCropBounds(w, h, ratioStr) {
  if (ratioStr === 'free') {
    return { x: 0, y: 0, w: w, h: h };
  }

  let targetRatio = 1;
  if (ratioStr === '16:9') targetRatio = 16 / 9;
  else if (ratioStr === '9:16') targetRatio = 9 / 16;
  else if (ratioStr === '1:1') targetRatio = 1;

  let cropW, cropH;
  if (w / h > targetRatio) {
    cropH = h;
    cropW = h * targetRatio;
  } else {
    cropW = w;
    cropH = w / targetRatio;
  }

  // Position panner math using cropOffsetPercent (value 0 to 100)
  const offsetFraction = cropOffsetPercent / 100;
  let cropX = (w - cropW) / 2;
  let cropY = (h - cropH) / 2;

  if (w / h > targetRatio) {
    cropX = (w - cropW) * offsetFraction; // slide left-to-right
  } else {
    cropY = (h - cropH) * offsetFraction; // slide up-to-down
  }

  return { x: cropX, y: cropY, w: cropW, h: cropH };
}

// Fullscreen Slideshow Loop Manager
function startSlideshow(startIndex = 0) {
  if (filteredWallpapers.length === 0) return;
  
  slideshowActive = true;
  slideshowIndex = startIndex;
  slideshowAutoplay = true;
  
  slideshowPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
  slideshowOverlay.classList.add('active');
  slideshowOverlay.classList.remove('idle');
  document.body.style.overflow = 'hidden';
  
  showSlide(slideshowIndex);
  resetSlideshowTimer();
}

function showSlide(index) {
  slideshowIndex = index;
  const wp = filteredWallpapers[slideshowIndex];
  
  // Set image source
  slideshowImg.classList.remove('active');
  setTimeout(() => {
    slideshowImg.src = wp.url;
    slideshowImg.alt = wp.name;
    slideshowImg.onload = () => {
      slideshowImg.classList.add('active');
    };
  }, 100);

  // Update hash deep linking in background
  window.location.hash = wp.id;
}

function nextSlide() {
  showSlide((slideshowIndex + 1) % filteredWallpapers.length);
  if (slideshowAutoplay) resetSlideshowTimer();
}

function prevSlide() {
  showSlide((slideshowIndex - 1 + filteredWallpapers.length) % filteredWallpapers.length);
  if (slideshowAutoplay) resetSlideshowTimer();
}

function toggleSlideshowPlay() {
  slideshowAutoplay = !slideshowAutoplay;
  if (slideshowAutoplay) {
    slideshowPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    resetSlideshowTimer();
    showToast('Slideshow resumed', 'info');
  } else {
    slideshowPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    clearInterval(slideshowTimer);
    slideshowProgressBar.style.transition = 'none';
    slideshowProgressBar.style.width = '0%';
    showToast('Slideshow paused', 'info');
  }
}

function resetSlideshowTimer() {
  clearInterval(slideshowTimer);
  
  // Animate CSS progress bar
  slideshowProgressBar.style.transition = 'none';
  slideshowProgressBar.style.width = '0%';
  
  // Trigger bar animation
  setTimeout(() => {
    slideshowProgressBar.style.transition = `width ${slideshowDuration}ms linear`;
    slideshowProgressBar.style.width = '100%';
  }, 50);

  slideshowTimer = setInterval(() => {
    nextSlide();
  }, slideshowDuration);
}

function closeSlideshow() {
  slideshowActive = false;
  clearInterval(slideshowTimer);
  slideshowOverlay.classList.remove('active');
  document.body.style.overflow = '';
  
  // Sync back to lightbox with deep-linking
  const currentWp = filteredWallpapers[slideshowIndex];
  if (currentWp) {
    openLightbox(currentWp);
  }
}

// Mouse idle auto-hider for slideshow
function triggerSlideshowMouseMovement() {
  slideshowOverlay.classList.remove('idle');
  clearTimeout(slideshowMouseTimer);
  
  slideshowMouseTimer = setTimeout(() => {
    if (slideshowActive && slideshowAutoplay) {
      slideshowOverlay.classList.add('idle');
    }
  }, 2500);
}

// Toast Alert Messages
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Run on window load
window.addEventListener('DOMContentLoaded', init);
