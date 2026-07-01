/** Keeps CSS viewport units in sync with iOS Safari's dynamic chrome. */
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

    if (!vv) {
      root.style.setProperty("--safari-ui-gap", "0px");
      return;
    }

    var gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.setProperty("--safari-ui-gap", Math.min(gap, 160) + "px");
  }

  syncViewport();
  window.addEventListener("resize", syncViewport, { passive: true });
  window.addEventListener("orientationchange", syncViewport, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewport, { passive: true });
    window.visualViewport.addEventListener("scroll", syncViewport, { passive: true });
  }
})();`;
