// Halaman Kontak EcoVera — validasi form + animasi GSAP
(() => {
  // Ganti dengan alamat email tim yang sebenarnya
  const TO = "EcoVera@gmail.com";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  const animate = hasGsap && !reduce;

  const nav = document.querySelector("nav.top");
  if (nav) nav.classList.add("on-light");

  const form = document.querySelector(".contact-form");
  if (!form) return;

  // Alamat email tim: satu sumber di sini
  document.querySelectorAll("[data-mail]").forEach((a) => {
    a.textContent = TO;
    a.href = "mailto:" + TO;
  });

  /* ---------------- Topik, petunjuk, penghitung ---------------- */
  const topics = {
    tanya: {
      label: "Pertanyaan",
      hint: "Tanyakan apa saja seputar sampah, artikel, atau cara memakai portal ini.",
    },
    koreksi: {
      label: "Koreksi data",
      hint: "Sebutkan judul artikel, bagian yang keliru, dan sumber yang benar (jika ada).",
    },
    foto: {
      label: "Foto galeri",
      hint: "Tulis lokasi, tanggal, dan nama pemotret. Setelah aplikasi email terbuka, lampirkan fotonya di sana lalu kirim.",
    },
    lain: {
      label: "Lainnya",
      hint: "Ceritakan kebutuhanmu, misalnya kolaborasi atau masukan untuk EcoVera.",
    },
  };

  const hintEl = document.getElementById("hint-pesan");
  const pesan = form.pesan;
  const count = document.getElementById("count");

  const currentTopic = () => form.querySelector('input[name="topik"]:checked').value;

  const setHint = (animateIt) => {
    const text = topics[currentTopic()].hint;
    if (animateIt && animate) {
      gsap.to(hintEl, {
        opacity: 0,
        y: -4,
        duration: 0.15,
        onComplete: () => {
          hintEl.textContent = text;
          gsap.to(hintEl, { opacity: 1, y: 0, duration: 0.25 });
        },
      });
    } else {
      hintEl.textContent = text;
    }
  };
  setHint(false);

  form.querySelectorAll('input[name="topik"]').forEach((r) =>
    r.addEventListener("change", () => {
      setHint(true);
      if (animate) {
        gsap.fromTo(
          r.nextElementSibling,
          { scale: 0.9 },
          { scale: 1, duration: 0.45, ease: "back.out(3)" }
        );
      }
    })
  );

  const updateCount = () => {
    count.textContent = pesan.value.length + "/" + pesan.maxLength;
  };
  pesan.addEventListener("input", updateCount);
  updateCount();

  /* ---------------- Validasi & kirim ---------------- */
  const setError = (input, msg) => {
    const err = document.getElementById("err-" + input.id);
    const had = err.textContent;
    err.textContent = msg;
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    if (msg && animate) {
      if (!had) gsap.fromTo(err, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
      gsap.fromTo(
        input,
        { x: -7 },
        { x: 0, duration: 0.6, ease: "elastic.out(1, 0.25)", clearProps: "x" }
      );
    }
  };

  const rules = [
    ["nama", (v) => v.length < 2, "Isi nama Anda."],
    ["email", (v) => !/^\S+@\S+\.\S+$/.test(v), "Isi alamat email yang valid."],
    ["pesan", (v) => v.length < 10, "Tulis pesan minimal 10 karakter."],
  ];

  // Hapus error saat pengguna mulai memperbaiki
  rules.forEach(([id, bad]) =>
    form[id].addEventListener("input", () => {
      if (form[id].hasAttribute("aria-invalid") && !bad(form[id].value.trim())) {
        setError(form[id], "");
      }
    })
  );

  const note = form.querySelector(".note");
  const tick = note.querySelector(".tick");

  const showNote = () => {
    if (!animate) {
      note.style.display = "grid";
      note.classList.add("show");
      return;
    }
    gsap.set(note, { display: "grid" });
    gsap.fromTo(
      note,
      { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 },
      {
        height: "auto",
        opacity: 1,
        paddingTop: 16,
        paddingBottom: 16,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "height",
      }
    );
    gsap.fromTo(
      tick,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.6, delay: 0.25, ease: "power2.out" }
    );
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    rules.forEach(([id, bad, msg]) => {
      const input = form[id];
      const isBad = bad(input.value.trim());
      setError(input, isBad ? msg : "");
      if (isBad && !firstBad) firstBad = input;
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    const t = topics[currentTopic()];
    const subject = `[${t.label}] Pesan dari ${form.nama.value.trim()}`;
    const body = `${form.pesan.value.trim()}\n\n— ${form.nama.value.trim()} (${form.email.value.trim()})`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showNote();
  });

  /* ---------------- Daftar info: klik topik & salin email ---------------- */
  document.querySelectorAll(".c-link[data-topic]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const r = form.querySelector(`input[name="topik"][value="${a.dataset.topic}"]`);
      if (r && !r.checked) {
        r.checked = true;
        r.dispatchEvent(new Event("change", { bubbles: true }));
      }
      form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      if (matchMedia("(pointer: fine)").matches) {
        setTimeout(() => form.nama.focus({ preventScroll: true }), reduce ? 0 : 600);
      }
      if (animate) {
        gsap.fromTo(
          form,
          { boxShadow: "0 0 0 0 rgba(31,184,118,0.5)" },
          { boxShadow: "0 0 0 12px rgba(31,184,118,0)", duration: 1, ease: "power2.out", clearProps: "boxShadow" }
        );
      }
    });
  });

  const copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    const label = copyBtn.querySelector("span");
    let timer;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(TO);
      } catch (_) {
        const ta = document.createElement("textarea");
        ta.value = TO;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (__) {}
        ta.remove();
      }
      label.textContent = "Tersalin ✓";
      if (animate) {
        gsap.fromTo(copyBtn, { scale: 0.9 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
      }
      clearTimeout(timer);
      timer = setTimeout(() => (label.textContent = "Salin"), 1800);
    });
  }

  /* ---------------- Animasi GSAP ---------------- */
  if (!animate) return;

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  // Judul: kata naik satu per satu
  const h1 = document.querySelector("[data-split]");
  let words = [];
  if (h1) {
    const text = h1.textContent.trim();
    h1.setAttribute("aria-label", text);
    h1.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="sw" aria-hidden="true"><span class="sw-in">${w}</span></span>`)
      .join(" ");
    words = h1.querySelectorAll(".sw-in");
  }

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(words, { yPercent: 115, duration: 0.9, stagger: 0.1 })
    .from(".c-head .lead", { y: 18, opacity: 0, duration: 0.7 }, "-=0.5");

  // Reveal elemen .rev (kartu, tips, FAQ) bertahap saat masuk layar
  const revs = gsap.utils.toArray(".rev");
  gsap.set(revs, { opacity: 0, y: 40 });
  const revealIn = (els) =>
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      overwrite: true,
    });
  if (hasST) {
    ScrollTrigger.batch(revs, {
      start: "top 90%",
      once: true,
      onEnter: revealIn,
    });
  } else {
    revealIn(revs);
  }

  // Daftar info: ikon tergambar, teks naik bertahap, lalu efek hover
  const rowEls = gsap.utils.toArray(".c-card");
  const rows = rowEls.map((row) => ({
    row,
    icon: row.querySelector(".icon-circle"),
    text: row.querySelectorAll(".c-body > *"),
    copy: row.querySelector(".c-copy"),
    arrow: row.querySelector(".c-arrow"),
    body: row.querySelector(".c-body"),
    shapes: [...row.querySelectorAll(".icon-circle path, .icon-circle rect, .icon-circle circle")],
  }));

  rows.forEach((r) => {
    gsap.set(r.icon, { scale: 0 });
    gsap.set(r.text, { opacity: 0, y: 18 });
    if (r.copy) gsap.set(r.copy, { opacity: 0, x: 12 });
    r.shapes.forEach((s) => {
      const len = s.getTotalLength();
      gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
    });
  });

  const rowsTl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
    onComplete: () =>
      rows.forEach((r) => gsap.set(r.shapes, { clearProps: "strokeDasharray,strokeDashoffset" })),
  });
  rows.forEach((r, i) => {
    const at = i * 0.2;
    rowsTl
      .to(r.icon, { scale: 1, duration: 0.6, ease: "back.out(2.2)" }, at)
      .to(r.shapes, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, at + 0.15)
      .to(r.text, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, at + 0.1);
    if (r.copy) rowsTl.to(r.copy, { opacity: 1, x: 0, duration: 0.5 }, at + 0.35);
  });
  if (hasST) {
    ScrollTrigger.create({
      trigger: ".c-cards",
      start: "top 88%",
      once: true,
      onEnter: () => rowsTl.play(),
    });
  } else {
    rowsTl.play();
  }

  if (matchMedia("(hover: hover)").matches) {
    rows.forEach((r) => {
      const line = document.createElement("span");
      line.className = "c-line";
      r.row.appendChild(line);

      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "power3.out" } });
      tl.to(r.body, { x: 8 }, 0)
        .to(line, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, 0)
        .to(r.icon, { scale: 1.08, duration: 0.5, ease: "back.out(3)" }, 0);
      if (r.arrow) tl.to(r.arrow, { opacity: 1, x: 0 }, 0.05);

      r.row.addEventListener("mouseenter", () => tl.play());
      r.row.addEventListener("mouseleave", () => tl.reverse());
      r.row.addEventListener("focusin", () => tl.play());
      r.row.addEventListener("focusout", () => tl.reverse());
    });
  }

  // Form: kartu masuk dari kanan, lalu isi bertahap
  const formItems = form.querySelectorAll(".chips-wrap, .field, .btn");
  gsap.set(form, { opacity: 0, x: 50 });
  gsap.set(formItems, { opacity: 0, y: 20 });
  const formTl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
  });
  formTl
    .to(form, { opacity: 1, x: 0, duration: 0.9 })
    .to(formItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.09 }, "-=0.5");
  if (hasST) {
    ScrollTrigger.create({
      trigger: form,
      start: "top 88%",
      once: true,
      onEnter: () => formTl.play(),
    });
  } else {
    formTl.play();
  }

  // Label bergeser tipis saat field difokuskan
  form.querySelectorAll(".field").forEach((f) => {
    const label = f.querySelector("label");
    f.addEventListener("focusin", () => gsap.to(label, { x: 4, duration: 0.25 }));
    f.addEventListener("focusout", () => gsap.to(label, { x: 0, duration: 0.25 }));
  });
})();