(() => {
  'use strict';
  const TOTAL = 20, SP = 560, D = 560;            // jumlah foto, jarak antar pasangan bingkai, jarak kamera ke bingkai pertama
  const PHOTOS = [
  'assets/images/Foto1.jpeg',
  'assets/images/Foto2.jpeg',
  'assets/images/Foto3.jpeg',
  'assets/images/Foto4.jpeg',
  'assets/images/Foto5.jpeg',
  'assets/images/Foto6.jpeg',
  'assets/images/Foto7.jpeg',
  'assets/images/Foto8.jpeg',
  'assets/images/Foto9.jpeg',
  'assets/images/Foto10.jpeg',
  'assets/images/Foto11.jpeg',
  'assets/images/Foto12.jpeg',
  'assets/images/Foto13.jpeg',
  'assets/images/Foto14.jpeg',
  'assets/images/Foto15.jpeg',
  'assets/images/Foto16.jpeg',
  'assets/images/Foto17.jpeg',
  'assets/images/Foto18.jpeg',
  'assets/images/Foto19.jpeg',
  'assets/images/Foto20.jpeg'
];
const IMG = n => PHOTOS[n];
const ABS = n => new URL(IMG(n), document.baseURI).href;
  const CAPTIONS = [];                             // opsional: isi judul tiap foto, mis. CAPTIONS[0] = 'Penanaman mangrove'
  const caption = i => CAPTIONS[i] || `Dokumentasi EcoVera ${i + 1}`;
  const ASPECTS = [[300, 380], [400, 290], [340, 340], [290, 390], [420, 300]];
  const AHEAD = 3, BEHIND = 1;                     // jumlah pasangan bingkai yang dimuat lebih dulu di sekitar kamera

  const $ = id => document.getElementById(id);
  const scene = $('scene'), world = $('world'), lb = $('lightbox'), lbImg = $('lbImg');
  const countEl = $('count'), capTitle = $('capTitle'), bar = $('bar'), live = $('live');
  const lbCount = $('lbCount'), lbCap = $('lbCap');
  const motion = matchMedia('(prefers-reduced-motion:reduce)');
  const ms = n => (motion.matches ? 1 : n);
  const pad = n => String(n).padStart(2, '0');
  const loaded = new Set();
  let idx = 0, frames = [], W = 1000, H = 560, portrait = false;
  let open = null, closing = false, pending = false;

  const persp = () => { scene.style.perspective = Math.max(innerWidth * (innerWidth < innerHeight ? 1.5 : .9), 800) + 'px'; };

  /* ---------- Pemuatan gambar bertahap (hemat bandwidth & cepat) ---------- */
  const setImg = i => {
    loaded.add(i);
    if (frames[i]) frames[i].style.setProperty('--img', `url("${ABS(i)}")`);
  };
  function hydrate() {
    const cur = idx >> 1;
    for (let i = 0; i < TOTAL; i++) {
      const p = i >> 1;
      if (!loaded.has(i) && p >= cur - BEHIND && p <= cur + AHEAD) setImg(i);
    }
  }
  function warm() { // sisanya dimuat pelan-pelan setelah halaman selesai, kecuali mode hemat data
    if (navigator.connection && navigator.connection.saveData) return;
    let i = 0;
    const step = () => {
      while (i < TOTAL && loaded.has(i)) i++;
      if (i >= TOTAL) return;
      setImg(i); setTimeout(step, 400);
    };
    setTimeout(step, 1200);
  }

  /* ---------- Membangun lorong ---------- */
  function build() {
    portrait = innerWidth < innerHeight;
    W = portrait ? 720 : 1000; H = portrait ? 640 : 560;
    persp();
    const L = (TOTAL / 2) * SP + D + 600, zc = -L / 2 + 500;
    const frag = document.createDocumentFragment();
    const plane = (cls, w, h, t, html) => {
      const p = document.createElement('div');
      p.className = `plane ${cls}`;
      Object.assign(p.style, { width: w + 'px', height: h + 'px', marginLeft: -w / 2 + 'px', marginTop: -h / 2 + 'px', transform: t });
      if (html) p.innerHTML = html;
      frag.appendChild(p);
    };
    plane('wall', L, H, `translate3d(${-W / 2}px,0,${zc}px) rotateY(90deg)`);
    plane('wall', L, H, `translate3d(${W / 2}px,0,${zc}px) rotateY(-90deg)`);
    plane('floor', W, L, `translate3d(0,${H / 2}px,${zc}px) rotateX(90deg)`);
    plane('ceil', W, L, `translate3d(0,${-H / 2}px,${zc}px) rotateX(-90deg)`);
    plane('end', W, H, `translate3d(0,0,${zc - L / 2}px)`,
      '<div class="end-msg"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c2-5 5-8 9-10"/></svg><b>EcoVera</b><span>Jaga bumi, mulai dari langkah kecil.</span></div>');

    const list = [];
    for (let i = 0; i < TOTAL; i++) {
      const side = i % 2, pair = i >> 1, [fw, fh] = ASPECTS[i % ASPECTS.length];
      const f = document.createElement('div');
      f.className = 'frame';
      f.tabIndex = -1; f.setAttribute('role', 'button');
      f.setAttribute('aria-label', `Perbesar foto ${i + 1}: ${caption(i)}`);
      // warna cadangan hijau alami selagi foto dimuat / bila file belum ada
      f.style.setProperty('--fallback', `linear-gradient(${140 + i * 9}deg,hsl(${90 + (i * 7) % 60} 40% ${34 + (i % 4) * 4}%),hsl(${75 + (i * 5) % 50} 55% 72%))`);
      if (loaded.has(i)) f.style.setProperty('--img', `url("${ABS(i)}")`);
      const x = side ? W / 2 - 2 : -W / 2 + 2, z = -(pair * SP) - D;
      Object.assign(f.style, {
        width: fw + 'px', height: fh + 'px', marginLeft: -fw / 2 + 'px', marginTop: -fh / 2 - 20 + 'px',
        transform: `translate3d(${x}px,0,${z}px) rotateY(${side ? -90 : 90}deg)`
      });
      f.dataset.i = i;
      frag.appendChild(f); list.push(f);
    }
    world.textContent = '';
    world.appendChild(frag);
    frames = list;
    go(idx, true);
  }

  /* ---------- Kamera ---------- */
  function sync() {
    frames.forEach((f, i) => {
      f.classList.toggle('active', i === idx);
      f.tabIndex = (i >> 1) === (idx >> 1) ? 0 : -1;   // hanya 2 bingkai terdekat yang bisa difokus keyboard
      if (i === idx) f.setAttribute('aria-current', 'true'); else f.removeAttribute('aria-current');
    });
    countEl.textContent = `${pad(idx + 1)} / ${TOTAL}`;
    bar.style.transform = `scaleX(${(idx + 1) / TOTAL})`;
    capTitle.textContent = caption(idx);
    live.textContent = `Foto ${idx + 1} dari ${TOTAL}: ${caption(idx)}`;
  }

  // Kamera maju ke pasangan bingkai berikutnya dan sedikit menoleh ke bingkai yang dituju.
  function go(n, instant) {
    const prevPair = idx >> 1;
    idx = (n + TOTAL) % TOTAL;
    const pair = idx >> 1, z = pair * SP, rot = idx % 2 ? 9 : -9;
    const dur = instant || motion.matches ? 0 : Math.min(1.8, .8 + Math.abs(pair - prevPair) * .15);
    world.style.transitionDuration = dur + 's';
    world.style.transform = `rotateY(${rot}deg) translate3d(0,0,${z}px)`;
    if (!instant) document.body.classList.add('used');
    hydrate(); sync();
  }

  /* ---------- Pratinjau foto (lightbox) ---------- */
  const pose = (a, b, side) =>
    `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px,${a.top + a.height / 2 - (b.top + b.height / 2)}px) ` +
    `scale(${a.width / b.width},${a.height / b.height}) rotateY(${side ? -80 : 80}deg)`;
  const lockUI = on => document.querySelectorAll('#scene,.ui').forEach(el => { el.inert = on; });
  const decode = async () => { try { await lbImg.decode(); } catch (_) { /* gambar gagal dimuat */ } };

  function setLb(i) {
    lbImg.classList.remove('broken');
    lbImg.alt = caption(i);
    lbImg.src = IMG(i);
    lbCount.textContent = `${pad(i + 1)} / ${TOTAL}`;
    lbCap.textContent = caption(i);
  }
  lbImg.addEventListener('error', () => lbImg.classList.add('broken'));

  async function openFrame(f) {
    if (open || closing) return;
    const i = +f.dataset.i;
    open = { f, i };
    lockUI(true);
    setLb(i);
    lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false');
    $('close').focus({ preventScroll: true });
    lbImg.style.opacity = '0';
    await decode();
    if (!open || open.i !== i) return;
    const from = f.getBoundingClientRect(), to = lbImg.getBoundingClientRect();
    f.classList.add('hidden');
    lbImg.style.opacity = '';
    lbImg.animate(
      [{ transform: pose(from, to, i % 2), opacity: .5 }, { transform: 'none', opacity: 1 }],
      { duration: ms(750), easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'both' });
  }

  async function lbGo(d) {
    if (!open) return;
    const n = (open.i + d + TOTAL) % TOTAL;
    open.f.classList.remove('hidden');
    go(n, true);                                  // kamera pindah seketika agar animasi tutup tetap akurat
    open.f = frames[n]; open.i = n;
    frames[n].classList.add('hidden');
    lbImg.style.opacity = '0';
    setLb(n);
    await decode();
    if (!open || open.i !== n) return;
    lbImg.style.opacity = '';
    lbImg.animate([{ opacity: 0, transform: `translateX(${d * 40}px)` }, { opacity: 1, transform: 'none' }],
      { duration: ms(260), easing: 'ease-out', fill: 'both' });
    new Image().src = IMG((n + 1) % TOTAL);       // siapkan foto berikutnya
  }

  function closeFrame() {
    if (!open) return;
    const { f, i } = open; open = null; closing = true;
    lockUI(false);
    lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true');
    const from = lbImg.getBoundingClientRect(), to = f.getBoundingClientRect();
    const a = lbImg.animate(
      [{ transform: 'none', opacity: 1 }, { transform: pose(to, from, i % 2), opacity: .5 }],
      { duration: ms(560), easing: 'cubic-bezier(.6,0,.3,1)', fill: 'both' });
    a.onfinish = () => {
      f.classList.remove('hidden'); closing = false;
      f.focus({ preventScroll: true });
      if (pending) { pending = false; build(); }
    };
  }

  /* ---------- Gestur: geser / scroll / tombol / keyboard ---------- */
  function onSwipe(el, cb, vertical) {
    let x0 = 0, y0 = 0, on = false;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; on = true; });
    el.addEventListener('pointercancel', () => { on = false; });
    el.addEventListener('pointerup', e => {
      if (!on) return; on = false;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) { el._swiped = true; cb(dx < 0 ? 1 : -1); }
      else if (vertical && Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.2) { el._swiped = true; cb(dy < 0 ? 1 : -1); }
    });
  }
  const eatSwipe = el => { const s = el._swiped; el._swiped = false; return s; };

  onSwipe(scene, d => go(idx + d), true);
  onSwipe(lb, d => lbGo(d), false);

  scene.addEventListener('click', e => {
    if (eatSwipe(scene)) return;
    const f = e.target.closest('.frame');
    if (f) openFrame(f);
  });
  lb.addEventListener('click', e => {
    if (eatSwipe(lb)) return;
    if (e.target === lb) closeFrame();
  });
  world.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('frame')) { e.preventDefault(); openFrame(e.target); }
  });
  world.addEventListener('focusin', e => {         // fokus keyboard ke sebuah bingkai ikut menggerakkan kamera
    const i = e.target.dataset && e.target.dataset.i;
    if (i !== undefined && +i !== idx && !open) go(+i);
  });

  let wheelAt = 0;
  scene.addEventListener('wheel', e => {
    const d = e.deltaY || e.deltaX, t = performance.now();
    if (Math.abs(d) < 20 || t - wheelAt < 650) return;
    wheelAt = t; go(idx + (d > 0 ? 1 : -1));
  }, { passive: true });

  $('next').onclick = () => go(idx + 1);
  $('prev').onclick = () => go(idx - 1);
  $('lbNext').onclick = () => lbGo(1);
  $('lbPrev').onclick = () => lbGo(-1);
  $('close').onclick = closeFrame;

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeFrame(); return; }
    const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageDown';
    const prev = e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageUp';
    if (next || prev) { e.preventDefault(); open ? lbGo(next ? 1 : -1) : go(idx + (next ? 1 : -1)); }
    else if (!open && e.key === 'Home') { e.preventDefault(); go(0); }
    else if (!open && e.key === 'End') { e.preventDefault(); go(TOTAL - 1); }
  });

  /* ---------- Resize: bangun ulang hanya saat orientasi berubah ---------- */
  let rt;
  addEventListener('resize', () => {
    persp();
    clearTimeout(rt);
    rt = setTimeout(() => {
      if ((innerWidth < innerHeight) === portrait) return;
      if (open || closing) pending = true; else build();
    }, 200);
  });

  build();
  addEventListener('load', warm);
})();