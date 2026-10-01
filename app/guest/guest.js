/* EvaOS V1.3 — guest canned tour + work-sample beat. DEMO only. Never fetch Worker. No secrets. */
(function () {
  "use strict";

  var SAMPLE_HREF = "/app/guest/sample/";

  var PROMPTS = [
    {
      id: "sample",
      label: "Show me a real work sample",
      primary: true,
      you: "Show me a real work sample Eva actually produced.",
      demo:
        "DEMO: One inspectable SAMPLE — ListingLift rewrite for a public GramCeramics pottery-mug listing (built 2026-09-29 from public Etsy copy). Not sent to the shop. Not your live job. Not live Ask.",
      artifactHref: SAMPLE_HREF,
      artifactLabel: "Inspect the SAMPLE deliverable"
    },
    {
      id: "north",
      label: "What is the North Star?",
      you: "What are you optimizing for?",
      demo:
        "DEMO: First stranger dollar with honest zeros — not vanity company counts or run counters. Joinermill scores progress toward a verified paid stranger outcome under owner Approves."
    },
    {
      id: "freeze",
      label: "What freezes until I Approve?",
      you: "What freezes until I Approve?",
      demo:
        "DEMO: Consequential acts freeze by default — send, spend, publish/deploy, and binding price/strategy. The named Approver is you (the owner). Eva does not self-approve money, mail, or public ship."
    },
    {
      id: "cap",
      label: "What happens at a spend cap?",
      you: "What happens when spend hits a cap?",
      demo:
        "DEMO: Soft warn near the limit; at 100% the spend path pauses and new burn is blocked until you explicitly override. Hard cap language is product doctrine — this reply is canned, not a live meter."
    },
    {
      id: "price",
      label: "What does a seat cost?",
      you: "What does a Founding Owner Seat cost?",
      demo:
        "DEMO: Intent is $49/mo or $490/yr for a Helm Founding Owner Seat (invite-only when opened). Named components: seat + supervised path; Eva does not hold your card. No checkout URL on this site; waitlist capture is not armed."
    },
    {
      id: "live",
      label: "Is this live Eva?",
      you: "Am I talking to live Eva right now?",
      demo:
        "DEMO: No. This is a canned sandbox tour. Nothing is sent to the live Ask Worker. Dogfood Ask at /app/ still needs an owner access code. The work sample page is frozen SAMPLE HTML — still not live chat."
    }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderExchange(item) {
    var stage = document.getElementById("tour-stage");
    var label = document.getElementById("tour-label");
    if (!stage) return;
    stage.textContent = "";
    var you = el("div", "bubble you");
    you.appendChild(el("span", "who", "You"));
    you.appendChild(el("p", null, item.you));
    var eva = el("div", "bubble demo");
    eva.appendChild(el("span", "who", "Eva · DEMO"));
    eva.appendChild(el("p", null, item.demo));
    if (item.artifactHref) {
      var actions = el("p", "demo-artifact");
      var link = el("a", "btn", item.artifactLabel || "Open sample");
      link.href = item.artifactHref;
      actions.appendChild(link);
      eva.appendChild(actions);
    }
    stage.appendChild(you);
    stage.appendChild(eva);
    if (label) label.hidden = false;
  }

  function mount() {
    var host = document.getElementById("tour-prompts");
    if (!host) return;
    PROMPTS.forEach(function (item) {
      var btn = el("button", "prompt-btn" + (item.primary ? " prompt-primary" : ""), item.label);
      btn.type = "button";
      btn.setAttribute("aria-label", "Show DEMO reply: " + item.label);
      btn.addEventListener("click", function () {
        host.querySelectorAll(".prompt-btn").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        renderExchange(item);
      });
      btn.setAttribute("aria-pressed", "false");
      host.appendChild(btn);
    });
  }

  if (typeof window !== "undefined") {
    window.EVAOS_GUEST_MODE = "canned-demo-v13-work-artifact";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
