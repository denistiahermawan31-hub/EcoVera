// EcoVera — About page interactions and scroll storytelling.
// Progressive enhancement: without GSAP (or with reduced motion) every section
// is fully readable, and the hero reveal still works through the button.
(() => {
  "use strict";

  const root = document.querySelector(".about");
  if (!root) return;

  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => Array.from(scope.querySelectorAll(selector));
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -----------------------------------------------------------------------
     Hero: tap / click reveal (works on small screens, reduced motion, and
     even when the GSAP CDN is unavailable).
     ----------------------------------------------------------------------- */
  const hero = $(".ab-hero");
  const revealBtn = $(".ab-reveal-btn");
  let setRevealed = () => {};

  if (hero && revealBtn) {
    const label = $(".ab-reveal-label", revealBtn);

    setRevealed = (on) => {
      hero.classList.toggle("is-revealed", on);
      revealBtn.setAttribute("aria-pressed", String(on));
      if (label) label.textContent = on ? "Kembali ke taman" : "Lihat jejak sampah";
    };

    revealBtn.addEventListener("click", () => {
      setRevealed(!hero.classList.contains("is-revealed"));
    });
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger || reduceQuery.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  const splitWords = (element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;

      const fragment = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "ab-w";
          span.textContent = part;
          fragment.appendChild(span);
        }
      });
      node.parentNode.replaceChild(fragment, node);
    });
  };

  /* -----------------------------------------------------------------------
     Hero entrance
     ----------------------------------------------------------------------- */
  const heroIntro = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroIntro
    .from(
      ".ab-hero-line > span",
      { yPercent: 112, duration: 1.1, stagger: 0.1 },
      0
    )
    .from(".ab-hero-lead", { y: 18, opacity: 0, duration: 0.8 }, 0.34)
    .from(
      ".ab-hero-notes, .ab-hero-foot",
      { y: 16, opacity: 0, duration: 0.8, stagger: 0.1 },
      0.62
    );

  /* -----------------------------------------------------------------------
     Hero pinned wipe: clean park → littered park (desktop only).
     The mobile / reduced-motion equivalent is the reveal button above.
     ----------------------------------------------------------------------- */
  mm.add("(min-width: 900px)", () => {
    setRevealed(false);
    hero.classList.add("is-scrubbed");

    const wipe = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=140%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    wipe
      .to(hero, { "--reveal": "100%", duration: 1 }, 0)
      .fromTo(".ab-hero-media", { scale: 1.06 }, { scale: 1, duration: 1 }, 0)
      .to(".ab-hero-title", { yPercent: -6, opacity: 0.16, duration: 0.5 }, 0.18)
      .to(".ab-hero-lead", { y: -10, opacity: 0.12, duration: 0.4 }, 0.18)
      .to(".ab-hero-note-clean", { opacity: 0, y: -8, duration: 0.16 }, 0.4)
      .to(".ab-hero-note-litter", { opacity: 1, y: 0, duration: 0.22 }, 0.58)
      .to(".ab-hero-cue", { opacity: 0, duration: 0.2 }, 0.35)
      .to(".ab-hero-progress i", { scaleX: 1, duration: 1 }, 0);

    return () => {
      hero.classList.remove("is-scrubbed");
      gsap.set(hero, { clearProps: "--reveal" });
      gsap.set(".ab-hero-media", { clearProps: "transform" });
      gsap.set(
        ".ab-hero-title, .ab-hero-lead, .ab-hero-note-clean, .ab-hero-note-litter, .ab-hero-cue, .ab-hero-progress i",
        { clearProps: "all" }
      );
    };
  });

  /* -----------------------------------------------------------------------
     Manifesto: word-by-word scrub
     ----------------------------------------------------------------------- */
  const statement = $("[data-split-words]");
  if (statement) {
    const accessibleText = statement.textContent.replace(/\s+/g, " ").trim();
    statement.setAttribute("aria-label", accessibleText);
    splitWords(statement);

    const words = $$(".ab-w", statement);
    if (words.length) {
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.06,
          scrollTrigger: {
            trigger: statement,
            start: "top 82%",
            end: "bottom 58%",
            scrub: 0.8,
          },
        }
      );
    }
  }

  /* -----------------------------------------------------------------------
     Generic content reveal (used sparingly, not on every element)
     ----------------------------------------------------------------------- */
  const reveals = $$("[data-reveal]");
  if (reveals.length) {
    gsap.set(reveals, { opacity: 0, y: 26 });
    ScrollTrigger.batch(reveals, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          overwrite: true,
        }),
    });
  }

  /* -----------------------------------------------------------------------
     Story: masked image reveals + gentle inner parallax
     ----------------------------------------------------------------------- */
  $$("[data-reveal-frame]").forEach((frame) => {
    gsap.fromTo(
      frame,
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.15,
        ease: "power3.inOut",
        scrollTrigger: { trigger: frame, start: "top 86%", once: true },
      }
    );

    const image = frame.querySelector("img");
    if (!image) return;

    gsap.fromTo(
      image,
      { scale: 1.12 },
      {
        scale: 1,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: frame, start: "top 86%", once: true },
      }
    );

    gsap.to(image, {
      yPercent: 5,
      ease: "none",
      scrollTrigger: {
        trigger: frame,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  });

  const storyText = $(".ab-story-text");
  if (storyText) {
    gsap.from(storyText.children, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: storyText, start: "top 84%", once: true },
    });
  }

  /* -----------------------------------------------------------------------
     Focus index: staggered rows + cursor-following preview on desktop
     ----------------------------------------------------------------------- */
  const indexRows = $$(".ab-index-row");
  if (indexRows.length) {
    gsap.set(indexRows, { opacity: 0, y: 24 });
    ScrollTrigger.batch(indexRows, {
      start: "top 92%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          overwrite: true,
        }),
    });
  }

  mm.add(
    "(min-width: 901px) and (hover: hover) and (pointer: fine)",
    () => {
      const section = $(".ab-focus");
      const preview = $(".ab-focus-preview");
      if (!section || !preview || !indexRows.length) return;

      let currentSource = "";
      preview.style.display = "block";
      gsap.set(preview, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.94 });

      const moveX = gsap.quickTo(preview, "x", { duration: 0.45, ease: "power3" });
      const moveY = gsap.quickTo(preview, "y", { duration: 0.45, ease: "power3" });

      const move = (event) => {
        const bounds = section.getBoundingClientRect();
        moveX(event.clientX - bounds.left);
        moveY(event.clientY - bounds.top);
      };

      const show = (row) => {
        const thumb = row.querySelector(".ab-index-thumb");
        const source = thumb && thumb.getAttribute("src");
        if (source && source !== currentSource) {
          preview.style.backgroundImage = 'url("' + source + '")';
          currentSource = source;
        }
        gsap.killTweensOf(preview, "opacity,scale");
        gsap.to(preview, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        });
      };

      const hide = () => {
        gsap.killTweensOf(preview, "opacity,scale");
        gsap.to(preview, {
          opacity: 0,
          scale: 0.94,
          duration: 0.25,
          ease: "power2.out",
        });
      };

      const onEnter = (event) => {
        move(event);
        show(event.currentTarget);
      };

      indexRows.forEach((row) => {
        row.addEventListener("pointerenter", onEnter);
        row.addEventListener("pointerleave", hide);
        row.addEventListener("focus", hide);
      });
      section.addEventListener("pointermove", move);

      return () => {
        indexRows.forEach((row) => {
          row.removeEventListener("pointerenter", onEnter);
          row.removeEventListener("pointerleave", hide);
          row.removeEventListener("focus", hide);
        });
        section.removeEventListener("pointermove", move);
        preview.style.display = "";
        preview.style.backgroundImage = "";
        gsap.set(preview, { clearProps: "opacity,transform" });
      };
    }
  );

  /* -----------------------------------------------------------------------
     Showcase: pinned horizontal sequence on desktop.
     Without this class the section stays a vertical photo essay, and on
     touch screens CSS turns it into a native swipe carousel.
     ----------------------------------------------------------------------- */
  mm.add("(min-width: 900px)", () => {
    const section = $(".ab-showcase");
    if (!section) return;

    const viewport = $(".ab-showcase-viewport", section);
    const track = $(".ab-showcase-track", section);
    const progress = $(".ab-showcase-progress i", section);
    if (!viewport || !track) return;

    section.classList.add("is-horizontal");

    const distance = () =>
      Math.max(0, track.scrollWidth - viewport.clientWidth);

    const tween = gsap.to(track, { x: () => -distance(), ease: "none" });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => "+=" + (distance() + window.innerHeight * 0.25),
      pin: true,
      scrub: 0.9,
      anticipatePin: 1,
      animation: tween,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progress) gsap.set(progress, { scaleX: self.progress });
      },
    });

    return () => {
      section.classList.remove("is-horizontal");
      trigger.kill();
      tween.kill();
      gsap.set(track, { clearProps: "transform" });
      if (progress) gsap.set(progress, { clearProps: "transform" });
    };
  });

  /* -----------------------------------------------------------------------
     Values: sticky index synced to the active principle
     ----------------------------------------------------------------------- */
  mm.add("(min-width: 900px)", () => {
    const values = $$(".ab-value");
    const current = $(".ab-values-current");
    const line = $(".ab-values-line b");
    if (!values.length || !current) return;

    let activeIndex = -1;

    const setActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      current.textContent = String(index + 1).padStart(2, "0");
      values.forEach((item, i) => item.classList.toggle("is-active", i === index));
      if (line) {
        gsap.to(line, {
          scaleX: (index + 1) / values.length,
          duration: 0.5,
          ease: "power2.out",
          overwrite: true,
        });
      }
    };

    const triggers = values.map((item, index) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top 62%",
        end: "bottom 62%",
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
      })
    );

    setActive(0);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      values.forEach((item) => item.classList.remove("is-active"));
      if (line) gsap.set(line, { clearProps: "transform" });
    };
  });

  /* -----------------------------------------------------------------------
     Layout refresh after fonts / images settle
     ----------------------------------------------------------------------- */
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }
})();
