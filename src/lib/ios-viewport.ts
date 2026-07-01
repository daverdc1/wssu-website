/** Sync iOS Safari visual viewport height for stable full-screen sections. */
export const IOS_VIEWPORT_SCRIPT = `(function () {
  var root = document.documentElement;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var ios =
    coarse &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  if (!ios) return;

  root.dataset.iosViewport = "true";

  function syncViewport() {
    var vv = window.visualViewport;
    var height = vv ? vv.height : window.innerHeight;
    root.style.setProperty("--vh", height * 0.01 + "px");
  }

  syncViewport();
  window.addEventListener("resize", syncViewport, { passive: true });
  window.addEventListener("orientationchange", syncViewport, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewport, { passive: true });
  }
})();`;
