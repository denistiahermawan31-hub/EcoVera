const pages = [
  ["index.html", "Home"],
  ["about.html", "About"],
  ["content.html", "Artikel"],
  ["gallery.html", "Galeri"],
  ["contact.html", "Contact"],
];

const cur = location.pathname.split("/").pop() || "index.html";

// Ikon SVG EcoVera (daun geometris minimalis)
const ecoIconSvg = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
`;

// Injeksi Skip Link & Navbar
document.body.insertAdjacentHTML(
  "afterbegin",
  `<a href="#main" style="position:absolute;left:-999px">Lewati ke konten</a>
  <nav class="top" aria-label="Navigasi utama">
    <a class="logo" href="index.html" aria-label="EcoVera — Beranda">
      <span class="logo-icon">${ecoIconSvg}</span>
      <span class="logo-text">EcoVera</span>
    </a>
    <ul id="menu">
      ${pages
        .map(
          (p) =>
            `<li><a href="${p[0]}"${p[0] === cur ? ' aria-current="page"' : ""}>${p[1]}</a></li>`
        )
        .join("")}
    </ul>
  </nav>`
);

// Injeksi Footer — sama seperti footer homepage
document.body.insertAdjacentHTML(
  "beforeend",
  `<footer class="home-footer">
    <div class="footer-top">
      <div>
        <a class="footer-logo" href="index.html">EcoVera</a>
        <p>Portal edukasi dan galeri dokumentasi lingkungan tentang sampah.</p>
      </div>
      <nav class="footer-nav" aria-label="Navigasi footer">
        ${pages.map((p) => `<a href="${p[0]}">${p[1]}</a>`).join("")}
      </nav>
      <a class="footer-contact" href="contact.html">Hubungi kami <span aria-hidden="true">↗</span></a>
    </div>
    <div class="footer-bottom">
      <p>Tim: Strawberry Flavour</p>
      <p>Karya lomba Technoversary Vol. II</p>
    </div>
  </footer>`
);

const nav = document.querySelector("nav.top");
const logoBtn = nav.querySelector(".logo");
let manualExpanded = false;

// Saat scroll ke bawah: ciutkan navbar menjadi ikon logo saja
const handleScrollNav = () => {
  nav.classList.toggle("is-solid", window.scrollY > 60);

  if (window.scrollY > 60) {
    if (!manualExpanded) {
      nav.classList.add("collapsed");
    }
  } else {
    manualExpanded = false;
    nav.classList.remove("collapsed");
  }
};

handleScrollNav();
window.addEventListener("scroll", handleScrollNav, { passive: true });

// Saat ikon logo ditekan dalam kondisi mengecil: munculkan kembali menu navbar
logoBtn.addEventListener("click", (e) => {
  if (nav.classList.contains("collapsed")) {
    e.preventDefault();
    manualExpanded = true;
    nav.classList.remove("collapsed");
  }
});

// Jika user scroll lagi setelah membuka manual, kembali mengecil
let lastScrollY = window.scrollY;
window.addEventListener(
  "scroll",
  () => {
    if (manualExpanded && Math.abs(window.scrollY - lastScrollY) > 40) {
      manualExpanded = false;
      if (window.scrollY > 60) {
        nav.classList.add("collapsed");
      }
    }
    lastScrollY = window.scrollY;
  },
  { passive: true }
);

// Scroll Reveal
const io = new IntersectionObserver(
  (e) =>
    e.forEach((x) => {
      if (x.isIntersecting) {
        x.target.classList.add("in");
        io.unobserve(x.target);
      }
    }),
  { threshold: 0.15 }
);

document
  .querySelectorAll("main > section, body > section")
  .forEach((el) => el.classList.add("rv"));

document.querySelectorAll(".rv").forEach((el) => io.observe(el));

// Hero: ganti frasa terakhir tanpa mengubah kalimat pembuka
const changingHeroText = document.querySelector(".hero-changing");
if (changingHeroText) {
  const heroPhrases = [
    "Berpikir ke Mana Perginya Sampahmu?",
    "Membayangkan Bumi Tanpa Sampah?",
    "Tahu Berapa Lama Sampah Terurai?",
    "Melihat Nilai di Balik Sampah?",
    "Membayangkan Bumi yang Lebih Bersih?",
  ];
  let phraseIndex = 0;

  setInterval(() => {
    phraseIndex = (phraseIndex + 1) % heroPhrases.length;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      changingHeroText.textContent = heroPhrases[phraseIndex];
      return;
    }

    changingHeroText.classList.add("is-changing");
    setTimeout(() => {
      changingHeroText.textContent = heroPhrases[phraseIndex];
      changingHeroText.classList.remove("is-changing");
    }, 250);
  }, 3000);
}

// Layar Pembuka (#intro)
const intro = document.getElementById("intro");
if (intro) {
  if (
    sessionStorage.getItem("ev") ||
    matchMedia("(prefers-reduced-motion:reduce)").matches
  ) {
    intro.remove();
  } else {
    intro
      .querySelectorAll("span")
      .forEach((s, i) => (s.style.animationDelay = i * 70 + "ms"));
    setTimeout(() => {
      intro.classList.add("out");
      sessionStorage.setItem("ev", 1);
      setTimeout(() => intro.remove(), 800);
    }, 1500);
  }
}

// Parallax Halus pada Foto Hero
const hp = document.querySelector(".hero .photo");
if (hp && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  addEventListener(
    "scroll",
    () => {
      hp.style.transform = `translateY(${Math.min(scrollY, 700) * 0.15}px) scale(1.08)`;
    },
    { passive: true }
  );
}

// Hero: lingkaran reveal foto alternatif mengikuti cursor
(() => {
  const hero = document.querySelector(".hero");
  const media = hero && hero.querySelector(".hero-media");
  if (!media) return;
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const posK = reduce ? 1 : 0.14; // kelembutan gerak lingkaran
  const radK = reduce ? 1 : 0.12; // kelembutan muncul / hilang
  let tx = 0, ty = 0, x = 0, y = 0, r = 0, tr = 0, raf = 0;
  const baseR = () => Math.max(25, Math.min(innerWidth * 0.10, 70));

  const paint = () => {
    media.style.setProperty("--hx", x.toFixed(1) + "px");
    media.style.setProperty("--hy", y.toFixed(1) + "px");
    media.style.setProperty("--hr", r.toFixed(1) + "px");
  };
  const tick = () => {
    x += (tx - x) * posK;
    y += (ty - y) * posK;
    r += (tr - r) * radK;
    if (tr === 0 && r < 0.5) r = 0;
    paint();
    const settled =
      Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3 && Math.abs(tr - r) < 0.3;
    raf = settled ? 0 : requestAnimationFrame(tick);
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const aim = (e) => {
    const b = media.getBoundingClientRect();
    tx = e.clientX - b.left;
    ty = e.clientY - b.top;
  };
  const show = (e) => {
    aim(e);
    if (r < 1) { x = tx; y = ty; } // tumbuh tepat dari posisi cursor
    tr = baseR();
    run();
  };
  const hide = () => { tr = 0; run(); };

  hero.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") show(e); });
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch" && tr === 0) return;
    aim(e);
    if (tr === 0) tr = baseR();
    run();
  });
  hero.addEventListener("pointerleave", hide);
  // Layar sentuh: lingkaran muncul saat ditekan/digeser, hilang saat dilepas atau mulai scroll
  hero.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") show(e); });
  hero.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") hide(); });
  hero.addEventListener("pointercancel", hide);
})();


// Butterfly cursor for the legacy HTML pages using this shared script.
if (
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const wingPath =
    "M0 0 C-4-13 -17-16 -18-6 C-19 2 -8 5 0 0 Z M0 1 C-4 11 -14 14 -15 6 C-16 0 -7-2 0 1 Z";
  const cursor = document.createElement("div");
  cursor.className = "fly";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = `
    <svg viewBox="0 0 40 40">
      <g transform="translate(20 20)">
        <g class="wing wing-left"><path d="${wingPath}" fill="#FFFFFF"/></g>
        <g class="wing wing-right"><path d="${wingPath}" fill="#FFFFFF"/></g>
        <rect x="-.9" y="-8" width="1.8" height="17" rx=".9" fill="#FFFFFF"/>
      </g>
    </svg>
  `;
  document.body.append(cursor);
  document.body.classList.add("butterfly-cursor-enabled");

  const leftWing = cursor.querySelector(".wing-left");
  const rightWing = cursor.querySelector(".wing-right");
  const ease = 0.07;
  const flap = 9;
  const wander = 14;
  let mouseX = 0;
  let mouseY = 0;
  let x = 0;
  let y = 0;
  let rotation = 0;

  const handlePointerMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  };

  const animate = (time) => {
    const wanderX = Math.sin(time / 900) * wander;
    const wanderY = Math.cos(time / 1150) * wander * 0.7;
    const deltaX = mouseX + wanderX - x;
    const deltaY = mouseY + wanderY - y;
    x += deltaX * ease;
    y += deltaY * ease;
    rotation += (Math.max(-34, Math.min(deltaX * 1.4, 34)) - rotation) * 0.1;

    const open = Math.abs(Math.sin((time / 1000) * flap));
    leftWing.setAttribute("transform", `scale(${-0.25 - open * 0.75} 1)`);
    rightWing.setAttribute("transform", `scale(${0.25 + open * 0.75} 1)`);
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    window.requestAnimationFrame(animate);
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.requestAnimationFrame(animate);
}

// Lightbox Galeri
const dlg = document.querySelector("dialog");
if (dlg) {
  document.querySelectorAll(".grid figure").forEach((f) => {
    f.tabIndex = 0;
    const o = () => {
      dlg.querySelector(".photo").style.cssText =
        f.querySelector(".photo").style.cssText;
      dlg.querySelector("p").textContent =
        f.querySelector("figcaption").textContent;
      dlg.showModal();
    };
    f.onclick = o;
    f.onkeydown = (e) => {
      if (e.key === "Enter") o();
    };
  });
}

// Catatan: validasi & pengiriman form kontak sekarang ada di js/contact.js