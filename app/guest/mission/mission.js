/* EvaOS V1.4 OBJECTIVE-REHEARSAL — DEMO/REPLAY only. Never fetch Worker. No timers. No fake seats. */
(function () {
  "use strict";

  if (typeof window !== "undefined") {
    window.EVAOS_GUEST_MODE = "objective-rehearsal-v14-replay";
  }

  function mount() {
    var btn = document.getElementById("obj-listinglift");
    var rail = document.getElementById("rail");
    if (!btn || !rail) return;

    btn.addEventListener("click", function () {
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      rail.hidden = false;
      try {
        rail.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        /* ignore */
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
