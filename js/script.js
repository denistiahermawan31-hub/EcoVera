const pages = [
  ["index.html", "Home"],
  ["about.html", "About"],
  ["content.html", "Artikel"],
  ["gallery.html", "Galeri"],
  ["contact.html", "Contact"],
];

const cur = location.pathname.split("/").pop() || "index.html";
document.body.insertAdjacentHTML(
  "afterbegin",
  `<a href="#main" style="position:absolute;left:-999px">Lewati ke konten</a><nav class="top" aria-label="Navigasi utama"><a class="logo" href="index.html">EcoVera</a><button class="burger" aria-expanded="false" aria-controls="menu">Menu</button><ul id="menu">${pages.map((p) => `<li><a href="${p[0]}"${p[0] === cur ? ' aria-current="page"' : ""}>${p[1]}</a></li>`).join("")}</ul></nav>`,
);

document.body.insertAdjacentHTML(
  "beforeend",
  `<footer><div><a class="logo" href="index.html">EcoVera</a><p>Portal edukasi dan galeri dokumentasi lingkungan tentang sampah.</p></div><p>Tim: [isi nama tim] — Anggota: [isi nama anggota]<br>Karya lomba Technoversary Vol. II</p></footer>`,
);

const nav = document.querySelector("nav.top"),
  btn = nav.querySelector(".burger"),
  menu = nav.querySelector("ul");
const solid = () =>
  nav.classList.toggle(
    "solid",
    scrollY > 40 || !document.querySelector(".hero"),
  );

solid();
addEventListener("scroll", solid, { passive: true });
btn.onclick = () => {
  const o = menu.classList.toggle("open");
  btn.setAttribute("aria-expanded", o);
};

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
const intro = document.getElementById("intro");
if (intro) {
  if (
    sessionStorage.getItem("ev") ||
    matchMedia("(prefers-reduced-motion:reduce)").matches
  )
    intro.remove();
  else {
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

const hp = document.querySelector(".hero .photo");
if (hp && !matchMedia("(prefers-reduced-motion:reduce)").matches)
  addEventListener(
    "scroll",
    () => {
      hp.style.transform = `translateY(${Math.min(scrollY, 700) * 0.15}px) scale(1.08)`;
    },
    { passive: true },
  );

const dlg = document.querySelector("dialog");
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

const form = document.querySelector("form");
if (form)
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
    location.href = `mailto:${TO}?subject=${encodeURIComponent("Pesan dari " + form.nama.value)}&body=${encodeURIComponent(form.pesan.value + "\n\n" + form.email.value)}`;
    document.querySelector(".note").style.display = "block";
  };
