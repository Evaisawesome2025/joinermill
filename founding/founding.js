/* B3 founding preview — read public outbox only. No POST. No email capture. */
(function (factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document !== "undefined") api.mount();
})(function () {
  "use strict";

  function isPublicEvidenceUrl(url) {
    if (typeof url !== "string") return false;
    var u = url.trim();
    if (!/^https:\/\/[^\s]+$/i.test(u)) return false;
    if (/\/app\/guest\//i.test(u)) return false;
    if (/\b(DEMO|REPLAY)\b/i.test(u)) return false;
    return true;
  }

  function collectEvidence(data) {
    var threads = (data && data.threads) || [];
    var items = [];
    var seen = {};
    threads.forEach(function (thread) {
      var cards = thread && thread.evidence;
      if (!Array.isArray(cards)) return;
      cards.forEach(function (card) {
        if (!card || typeof card.url !== "string") return;
        var url = card.url.trim();
        if (!isPublicEvidenceUrl(url) || seen[url]) return;
        seen[url] = true;
        var title = card.title ? String(card.title).trim() : "";
        items.push({
          title: title || url,
          url: url,
          when: String(card.opened_ct || (thread && thread.answered_ct) || "")
        });
      });
    });
    return items;
  }

  function presenceLine(data) {
    var presence = (data && data.presence) || [];
    if (!presence.length) return "Operator status: idle.";
    var busy = presence.some(function (person) {
      return person && person.status && person.status !== "idle";
    });
    return busy
      ? "Operator status: a recorded job is in progress."
      : "Operator status: idle.";
  }

  function mount() {
    var empty = document.getElementById("evidence-empty");
    var list = document.getElementById("evidence-list");
    var status = document.getElementById("evidence-status");
    if (!empty || !list) return;

    fetch("/app/outbox/threads.json", { credentials: "omit", cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("outbox");
        return response.json();
      })
      .then(function (data) {
        if (status) status.textContent = presenceLine(data);
        var items = collectEvidence(data);
        if (!items.length) return;
        empty.hidden = true;
        list.hidden = false;
        items.forEach(function (item) {
          var li = document.createElement("li");
          var link = document.createElement("a");
          link.href = item.url;
          link.rel = "noopener noreferrer";
          link.textContent = item.title;
          li.appendChild(link);
          if (item.when) {
            var when = document.createElement("span");
            when.className = "evidence-when";
            when.textContent = " · " + item.when;
            li.appendChild(when);
          }
          list.appendChild(li);
        });
      })
      .catch(function () {
        if (status) status.textContent = "The public outbox could not be read just now.";
      });
  }

  return {
    isPublicEvidenceUrl: isPublicEvidenceUrl,
    collectEvidence: collectEvidence,
    presenceLine: presenceLine,
    mount: mount
  };
});
