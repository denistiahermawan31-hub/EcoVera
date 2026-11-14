(function () {
  const track = document.getElementById("galleryTrack");
  const world = document.getElementById("galleryWorld");
  const scrollFill = document.getElementById("scrollFill");
  const frames = document.querySelectorAll(".art-frame");
  const dlg = document.getElementById("photoDialog");

  let currentProgress = 0;
  let targetProgress = 0;

  const updateTarget = () => {
    const rect = track.getBoundingClientRect();
    const maxScroll = track.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const scrolled = Math.min(Math.max(-rect.top, 0), maxScroll);
    targetProgress = scrolled / maxScroll;
  };

  const animateCamera = () => {
    currentProgress += (targetProgress - currentProgress) * 0.08;

    // Menelusuri seluruh lorong galeri sepanjang 20 foto secara mulus
    const maxZ = 9550;
    const camZ = currentProgress * maxZ;
    const sway = Math.sin(currentProgress * Math.PI * 6) * 1.8;

    world.style.transform = `translate3d(0px, 0px, ${camZ}px) rotateY(${sway}deg)`;

    if (scrollFill) {
      scrollFill.style.transform = `scaleY(${currentProgress})`;
    }

    requestAnimationFrame(animateCamera);
  };

  window.addEventListener("scroll", updateTarget, { passive: true });
  updateTarget();
  animateCamera();

  if (dlg) {
    frames.forEach((frame) => {
      const openPhoto = () => {
        dlg.querySelector(".photo").style.cssText =
          frame.querySelector(".photo").style.cssText;
        dlg.showModal();
      };
      frame.addEventListener("click", openPhoto);
      frame.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPhoto();
        }
      });
    });

    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    });
  }
})();