(() => {
  'use strict';

  const photoFiles = import.meta.glob(
    '../assets/images/*.{png,jpg,jpeg}',
    { eager: true, query: '?url', import: 'default' },
  );
  const PHOTO_NAMES = [
    'Foto1', 'Foto2', 'Foto3', 'Foto4', 'Foto6', 'Foto7',
    'foto8', 'Foto9', 'Foto10', 'Foto11', 'foto12', 'foto13',
    'foto15', 'foto16', 'foto17', 'foto18', 'foto19', 'foto20',
    'foto21', 'foto22', 'foto23', 'foto24',
  ];
  const PHOTOS = PHOTO_NAMES.map((name) => {
    const file = Object.keys(photoFiles).find((path) =>
      new RegExp(`/${name}\\.(png|jpe?g)$`, 'i').test(path),
    );
    return file ? photoFiles[file] : '';
  }).filter(Boolean);
  const TOTAL = PHOTOS.length;
  const IMG = (n) => PHOTOS[n];
  const ABS = (n) => new URL(IMG(n), document.baseURI).href;

  // Keterangan foto yang tampil di bawah kartu aktif (dan di lightbox).
  // Ubah teks di sini sesuai foto masing-masing.
  const CAPTIONS = [
    { title: 'Botol yang dikumpulkan', place: 'Aksi pemungutan' },
    { title: 'Sisa yang menjadi tanah', place: 'Pengomposan' },
    { title: 'Pilah dari sumbernya', place: 'Pemilahan' },
    { title: 'Sisa sayuran siap dikomposkan', place: 'Pengomposan' },
    { title: 'Plastik yang dikumpulkan', place: 'Aksi pemungutan' },
    { title: 'Tumpukan di ujung jalan', place: 'Permukiman' },
    { title: 'Sungai yang menanggung sisanya', place: 'Hilir' },
    { title: 'Sampah menunggu dipilah', place: 'Tempat pembuangan' },
    { title: 'Botol yang masih berguna', place: 'Bank sampah' },
    { title: 'Bak yang meluap', place: 'Tempat pembuangan' },
    { title: 'Kertas yang diselamatkan', place: 'Daur ulang' },
    { title: 'Logam untuk didaur ulang', place: 'Daur ulang' },
    { title: 'Kompos siap dipakai', place: 'Pengomposan' },
    { title: 'Plastik di dalam air', place: 'Perairan' },
    { title: 'Aksi bersama warga', place: 'Komunitas' },
    { title: 'Kantong kain pengganti plastik', place: 'Penggunaan ulang' },
    { title: 'Sampah organik terpisah', place: 'Pemilahan' },
    { title: 'Daur ulang di tangan warga', place: 'Bank sampah' },
    { title: 'Laut yang dijaga', place: 'Pesisir' },
    { title: 'Pantai yang bersih kembali', place: 'Pesisir' },
    { title: 'Edukasi pilah sampah', place: 'Edukasi' },
    { title: 'Langkah kecil, dampak besar', place: 'EcoVera' },
  ];
  const caption = (i) => (CAPTIONS[i] && CAPTIONS[i].title) || 'Dokumentasi EcoVera';
  const place = (i) => (CAPTIONS[i] && CAPTIONS[i].place) || '';

  const SIDE = 3; // jumlah kartu yang terlihat di tiap sisi
  const AUTO_MS = 5200;
  const MANUAL_MS = 7200;

  const $ = (id) => document.getElementById(id);
  const scene = $('scene');
  const world = $('world');
  const lb = $('lightbox');
  const lbImg = $('lbImg');
  const live = $('live');
  const lbCap = $('lbCap');

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let idx = 0;
  let cards = [];
  let loaded = new Set();
  let open = null;
  let closing = false;
  let hover = false;
  let autoTimer = 0;
  let drag = null;
  let resizeTimer = 0;

  /* ---------- Pemuatan gambar bertahap ---------- */
  function setImg(i) {
    loaded.add(i);
    const img = cards[i] && cards[i].querySelector('img');
    if (img && !img.src) img.src = ABS(i);
  }

  function hydrate() {
    for (let d = -SIDE - 2; d <= SIDE + 2; d++) {
      const i = (idx + d + TOTAL) % TOTAL;
      if (!loaded.has(i)) setImg(i);
    }
  }

  function warm() {
    if (navigator.connection && navigator.connection.saveData) return;
    let i = 0;
    const step = () => {
      while (i < TOTAL && loaded.has(i)) i++;
      if (i >= TOTAL) return;
      setImg(i);
      setTimeout(step, 350);
    };
    setTimeout(step, 1400);
  }

  /* ---------- Membangun tumpukan kartu ---------- */
  function build() {
    const frag = document.createDocumentFragment();
    const list = [];

    for (let i = 0; i < TOTAL; i++) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'stack-card';
      card.dataset.i = String(i);
      card.setAttribute('aria-label', `Perbesar foto ${i + 1}: ${caption(i)}`);

      const media = document.createElement('span');
      media.className = 'card-media';
      const img = document.createElement('img');
      img.alt = caption(i);
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;
      media.append(img);

      const shade = document.createElement('span');
      shade.className = 'card-shade';
      shade.setAttribute('aria-hidden', 'true');

      const meta = document.createElement('span');
      meta.className = 'card-meta';
      meta.setAttribute('aria-hidden', 'true');
      const title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = caption(i);
      const sub = document.createElement('span');
      sub.className = 'card-place';
      sub.textContent = place(i);
      meta.append(title, sub);

      card.append(media, shade, meta);
      frag.append(card);
      list.push(card);
    }

    world.textContent = '';
    world.append(frag);
    cards = list;
    render();
  }

  /* ---------- Tata letak + status ---------- */
  function render() {
    const w = innerWidth;
    const cardW = (cards[0] && cards[0].offsetWidth) || 360;
    const small = w < 700;
    const step = cardW * (small ? 0.36 : 0.42);
    const depth = small ? 80 : 140;

    cards.forEach((card, i) => {
      let d = i - idx;
      if (d > TOTAL / 2) d -= TOTAL;
      if (d < -TOTAL / 2) d += TOTAL;
      const abs = Math.abs(d);
      const show = abs <= SIDE;
      const active = d === 0;

      card.classList.toggle('is-visible', show);
      card.classList.toggle('is-hidden', !show);
      card.classList.toggle('is-active', active);
      card.tabIndex = active ? 0 : -1;

      if (active) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');

      if (!show) return;

      card.style.setProperty('--x', `${(d * step).toFixed(1)}px`);
      card.style.setProperty('--y', `${(abs * (small ? 6 : 10)).toFixed(1)}px`);
      card.style.setProperty('--z', `${(-abs * depth).toFixed(1)}px`);
      card.style.setProperty('--ry', `${(-d * 9).toFixed(1)}deg`);
      card.style.setProperty('--s', (1 - abs * 0.075).toFixed(3));
      card.style.setProperty('--o', active ? '1' : Math.max(0, 1 - abs * 0.24).toFixed(3));
      card.style.setProperty('--b', `${(abs <= 1 ? 0 : (abs - 1) * 1.5).toFixed(2)}px`);
      card.style.setProperty('--br', (1 - abs * 0.05).toFixed(3));
      card.style.zIndex = String(30 - abs);
    });

    live.textContent = `Foto ${idx + 1} dari ${TOTAL}: ${caption(idx)}`;

    hydrate();
  }

  function go(n, manual) {
    idx = (n + TOTAL) % TOTAL;
    render();
    if (manual) scheduleAuto(MANUAL_MS);
  }

  /* ---------- Autoplay ---------- */
  function scheduleAuto(delay = AUTO_MS) {
    clearTimeout(autoTimer);
    if (motion.matches || open || hover || document.visibilityState !== 'visible') return;
    autoTimer = setTimeout(() => {
      if (!open && !hover) go(idx + 1);
      scheduleAuto();
    }, delay);
  }

  /* ---------- Pratinjau foto ---------- */
  const pose = (a, b, side) =>
    `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px,${a.top + a.height / 2 - (b.top + b.height / 2)}px) ` +
    `scale(${a.width / b.width},${a.height / b.height}) rotateY(${side ? -10 : 10}deg)`;

  const lockUI = (on) => {
    document.querySelectorAll('#scene,.ui,nav.top').forEach((el) => {
      el.inert = on;
    });
  };

  const decode = async () => {
    try {
      await lbImg.decode();
    } catch {
      /* gambar gagal dimuat, biarkan bingkai kosong */
    }
  };

  function setLb(i) {
    lbImg.classList.remove('broken');
    lbImg.alt = caption(i);
    lbImg.src = IMG(i);
    lbCap.textContent = place(i) ? `${caption(i)} · ${place(i)}` : caption(i);
  }

  lbImg.addEventListener('error', () => lbImg.classList.add('broken'));

  async function openFrame(card) {
    if (open || closing) return;
    const i = Number(card.dataset.i);
    open = { card, i };
    clearTimeout(autoTimer);
    lockUI(true);
    setLb(i);
    lb.classList.add('on');
    lb.setAttribute('aria-hidden', 'false');
    $('close').focus({ preventScroll: true });
    lbImg.style.opacity = '0';
    await decode();
    if (!open || open.i !== i) return;
    const from = card.getBoundingClientRect();
    const to = lbImg.getBoundingClientRect();
    card.classList.add('hidden');
    lbImg.style.opacity = '';
    lbImg.animate(
      [
        { transform: pose(from, to, i % 2), opacity: 0.55 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: motion.matches ? 1 : 750, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'both' },
    );
  }

  async function lbGo(d) {
    if (!open) return;
    const n = (open.i + d + TOTAL) % TOTAL;
    open.card.classList.remove('hidden');
    go(n, true);
    open.card = cards[n];
    open.i = n;
    cards[n].classList.add('hidden');
    lbImg.style.opacity = '0';
    setLb(n);
    await decode();
    if (!open || open.i !== n) return;
    lbImg.style.opacity = '';
    lbImg.animate(
      [
        { opacity: 0, transform: `translateX(${d * 40}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: motion.matches ? 1 : 280, easing: 'ease-out', fill: 'both' },
    );
    new Image().src = IMG((n + 1) % TOTAL);
  }

  function closeFrame() {
    if (!open) return;
    const { card, i } = open;
    open = null;
    closing = true;
    lockUI(false);
    lb.classList.remove('on');
    lb.setAttribute('aria-hidden', 'true');
    const from = lbImg.getBoundingClientRect();
    const to = card.getBoundingClientRect();
    const anim = lbImg.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: pose(to, from, i % 2), opacity: 0.55 },
      ],
      { duration: motion.matches ? 1 : 560, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'both' },
    );
    anim.onfinish = () => {
      card.classList.remove('hidden');
      closing = false;
      card.focus({ preventScroll: true });
      scheduleAuto(2600);
    };
  }

  /* ---------- Gestur: geser, scroll, klik, keyboard ---------- */
  const onSwipe = (el, cb) => {
    let x0 = 0;
    let y0 = 0;
    let on = false;
    el.addEventListener('pointerdown', (e) => {
      x0 = e.clientX;
      y0 = e.clientY;
      on = true;
    });
    el.addEventListener('pointercancel', () => {
      on = false;
    });
    el.addEventListener('pointerup', (e) => {
      if (!on) return;
      on = false;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        el._swiped = true;
        cb(dx < 0 ? 1 : -1);
      }
    });
  };

  const eatSwipe = (el) => {
    const s = el._swiped;
    el._swiped = false;
    return s;
  };

  /* Tarik untuk memiringkan, lepas untuk pindah kartu */
  scene.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, moved: false };
    clearTimeout(autoTimer);
    world.classList.add('is-dragging');
  });

  const endDrag = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const moved = Math.abs(dx) > 8 || Math.abs(dy) > 8;
    drag = null;
    world.classList.remove('is-dragging');
    world.style.transform = '';
    if (moved) {
      scene._swiped = true;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1), true);
      else if (Math.abs(dy) > 70) go(idx + (dy < 0 ? 1 : -1), true);
    }
    scheduleAuto(MANUAL_MS);
  };

  addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) drag.moved = true;
      if (!motion.matches) {
        world.style.transform = `rotateY(${clamp(dx / 26, -10, 10).toFixed(2)}deg) rotateX(${clamp(-dy / 70, -5, 5).toFixed(2)}deg)`;
      }
      return;
    }
    if (!hover || !fine.matches || motion.matches) return;
    const rx = ((e.clientY / innerHeight) - 0.5) * -4;
    const ry = ((e.clientX / innerWidth) - 0.5) * 7;
    world.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  });

  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  scene.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    hover = true;
    clearTimeout(autoTimer);
  });

  scene.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    hover = false;
    if (!drag) world.style.transform = '';
    scheduleAuto(1800);
  });

  scene.addEventListener('click', (e) => {
    if (eatSwipe(scene)) return;
    const card = e.target.closest('.stack-card');
    if (!card) return;
    const i = Number(card.dataset.i);
    if (i !== idx) {
      go(i, true);
      return;
    }
    openFrame(card);
  });

  world.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('stack-card')) {
      e.preventDefault();
      if (Number(e.target.dataset.i) === idx) openFrame(e.target);
    }
  });

  world.addEventListener('focusin', (e) => {
    const i = e.target.dataset && e.target.dataset.i;
    if (i !== undefined && Number(i) !== idx && !open) go(Number(i), true);
  });

  let wheelAt = 0;
  scene.addEventListener(
    'wheel',
    (e) => {
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const now = performance.now();
      if (Math.abs(raw) < 16 || now - wheelAt < 520) return;
      wheelAt = now;
      go(idx + (raw > 0 ? 1 : -1), true);
    },
    { passive: true },
  );

  $('next').onclick = () => go(idx + 1, true);
  $('prev').onclick = () => go(idx - 1, true);
  $('lbNext').onclick = () => lbGo(1);
  $('lbPrev').onclick = () => lbGo(-1);
  $('close').onclick = closeFrame;

  onSwipe(lb, (d) => lbGo(d));

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFrame();
      return;
    }
    const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageDown';
    const prev = e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageUp';
    if (next || prev) {
      e.preventDefault();
      if (open) lbGo(next ? 1 : -1);
      else go(idx + (next ? 1 : -1), true);
    } else if (!open && e.key === 'Home') {
      e.preventDefault();
      go(0, true);
    } else if (!open && e.key === 'End') {
      e.preventDefault();
      go(TOTAL - 1, true);
    }
  });

  /* ---------- Resize & visibilitas ---------- */
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 140);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleAuto(2200);
    else clearTimeout(autoTimer);
  });

  motion.addEventListener?.('change', () => {
    world.style.transform = '';
    if (motion.matches) clearTimeout(autoTimer);
    else scheduleAuto();
  });

  build();
  scheduleAuto(4200);
  addEventListener('load', warm);
})();
