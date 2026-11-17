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
    <a class="logo" href="index.html" aria-label="EcoVera — Buka atau tutup menu navigasi">
      <span class="logo-icon">${ecoIconSvg}</span>
      <span class="logo-text">EcoVera</span>
    </a>
    <ul id="menu">
      ${pages
        .map(
          (p) =>
            `<li><a href="${p[0]}"${p[0] === cur ? ' aria-current="page"' : ""}>${p[1]}</a></li>`,
        )
        .join("")}
    </ul>
  </nav>`,
);

// Injeksi Footer
document.body.insertAdjacentHTML(
  "beforeend",
  `<footer>
    <div>
      <a class="logo" href="index.html">EcoVera</a>
      <p>Portal edukasi dan galeri dokumentasi lingkungan tentang sampah.</p>
    </div>
    <p>Tim: [isi nama tim] — Anggota: [isi nama anggota]<br>Karya lomba Technoversary Vol. II</p>
  </footer>`,
);

const nav = document.querySelector("nav.top");
const logoBtn = nav.querySelector(".logo");
let manualExpanded = false;

// Saat scroll ke bawah: ciutkan navbar menjadi ikon logo saja
const handleScrollNav = () => {
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
  { passive: true },
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
  { threshold: 0.15 },
);

document.querySelectorAll(".rv").forEach((el) => io.observe(el));

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
      setTimeout(() => intro.remove(), 900);
    }, 1500);
  }
}
// TRANSISI PINDAH HALAMAN (EcoVera.)
if (!matchMedia("(prefers-reduced-motion:reduce)").matches) {
  // 1. Inject elemen transisi ke semua halaman secara otomatis
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="page-transition" aria-hidden="true">
      <div class="pt-brand">
        <span class="pt-word">EcoVera.</span>
      </div>
    </div>`,
  );

  const pt = document.getElementById("page-transition");

  // 2. Cek apakah halaman ini dibuka dari hasil klik pindah halaman sebelumnya
  if (sessionStorage.getItem("ev_navigating") === "1") {
    sessionStorage.removeItem("ev_navigating");
    pt.classList.add("hold"); // Langsung tutup layar saat halaman baru dimuat

    // Beri jeda 350ms agar tulisan EcoVera. terbaca, lalu buka tirai ke atas
    requestAnimationFrame(() => {
      setTimeout(() => {
        pt.classList.remove("hold");
        pt.classList.add("leave");

        // Reset posisi tirai kembali ke bawah setelah animasi selesai
        setTimeout(() => {
          pt.style.transition = "none";
          pt.classList.remove("leave");
          void pt.offsetWidth; // Force reflow
          pt.style.transition = "";
        }, 680);
      }, 350);
    });
  }

  // 3. Tangkap semua klik pada link internal (.html)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    // Abaikan link eksternal, anchor (#), mailto/tel, target _blank, atau klik tombol logo saat navbar collapsed
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");
    const isHash = href.startsWith("#");
    const isNewTab = link.target === "_blank";
    const isCollapsedLogo =
      link.classList.contains("logo") && nav.classList.contains("collapsed");

    if (
      isExternal ||
      isHash ||
      isNewTab ||
      isCollapsedLogo ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Jika klik halaman yang sedang aktif sekarang, cukup scroll ke atas dengan mulus
    const targetFile = href.split("/").pop() || "index.html";
    if (targetFile === cur && !href.includes("#")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Jalankan animasi masuk (tirai naik menutup layar), lalu pindah halaman
    e.preventDefault();
    sessionStorage.setItem("ev_navigating", "1");
    pt.classList.remove("leave", "hold");
    pt.classList.add("enter");

    setTimeout(() => {
      window.location.href = href;
    }, 680); // Waktu tunggu sesuai durasi animasi CSS (650ms)
  });

  // Antisipasi tombol Back/Forward browser (bfcache) agar layar tidak nyangkut tertutup
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      pt.classList.remove("enter", "hold", "leave");
    }
  });
}

// Parallax Halus pada Foto Hero
const hp = document.querySelector(".hero .photo");
if (hp && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  addEventListener(
    "scroll",
    () => {
      hp.style.transform = `translateY(${Math.min(scrollY, 700) * 0.15}px) scale(1.08)`;
    },
    { passive: true },
  );
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

// Validasi Form Kontak
const form = document.querySelector("form");
if (form) {
  form.onsubmit = (e) => {
    e.preventDefault();
    let ok = true;
    const chk = (id, bad, msg) => {
      const i = form[id];
      i.nextElementSibling.textContent = bad(i.value.trim())
        ? ((ok = false), msg)
        : "";
    };
    chk("nama", (v) => v.length < 2, "Isi nama Anda.");
    chk(
      "email",
      (v) => !/^\S+@\S+\.\S+$/.test(v),
      "Isi alamat email yang valid.",
    );
    chk("pesan", (v) => v.length < 10, "Tulis pesan minimal 10 karakter.");
    if (!ok) return;
    const TO = "isi-email-tim@contoh.com";
    location.href = `mailto:${TO}?subject=${encodeURIComponent(
      "Pesan dari " + form.nama.value,
    )}&body=${encodeURIComponent(form.pesan.value + "\n\n" + form.email.value)}`;
    document.querySelector(".note").style.display = "block";
  };
}
