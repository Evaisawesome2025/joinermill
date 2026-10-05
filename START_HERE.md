# Start here — Joinermill editable brief workspace

## Release state

2026-10-05: implementation reviewed and tests passing; **publication pending verification**. This document does not claim the update is live. Previous verified frontend release: `4123538bf18c4eb322c20247e23656625df40169`. Coordinated backend repository: [evaos-v05](https://github.com/Evaisawesome2025/evaos-v05).

## What works

The new workspace uses six editable fields supplied by the person: objective, available inputs, deliverable, constraints, success checklist and stop rule. It prepares a reviewable brief and downloads the exact plain-text specification, with unchecked criteria. This is deterministic brief software, not AI judgment, an agent run or proof that the proposed work is done.

Examples remain separate from the person's draft. The directory retains 13 specialist roles, with no invented presence, activity or assignment. Drafts live only in the open tab: switching views preserves them; reset/reload clears them. There is no automatic save, storage import, customer database write or account flow. A download creates a file only at the person's request. The optional format-check button explicitly sends the six fields to the existing EVAOS service; its handler stores/logs no body. Infrastructure may retain request metadata.

## Resume work

1. Read [RELEASE.md](RELEASE.md) and [RELEASE_LOG.md](RELEASE_LOG.md). Inspect current remote main before editing; preserve concurrent work.
2. Run `npm ci && npm test`. The coordinated backend's `worker/src/brief-model.js` must match this repository's `preview/brief-model.js` byte for byte.
3. Follow RELEASE.md to run browser regression tests with the backend cloned alongside this repository. The test uses synthetic content only. Test output is local and ignored by Git.
4. Review capability/privacy labels, keyboard/mobile behavior and export fidelity before publication. Deploy backend first; publish frontend through existing GitHub Pages. Verify exact commits, successful deployment and live browser behavior.

Tests at the implementation checkpoint: frontend 2/2 unit tests; 13 browser regression groups; zero axe violations across six views at desktop and mobile widths; 320px reflow check; no page errors with browser storage blocked. Backend 70/70 tests. These are tests, not evidence of AI or autonomous work.

## Preserve these boundaries

- Held [Joinermill PR15](https://github.com/Evaisawesome2025/joinermill/pull/15) and [EVAOS PR32](https://github.com/Evaisawesome2025/evaos-v05/pull/32) remain unmerged and untouched.
- Pulse is an isolated, completed controller prototype reported as **UNSCORED**. Its artifacts are not present in these release checkouts and this update neither ships it nor claims production autonomy. Obtain its actual reviewed artifacts before any separate work.
- No model calls, paid infrastructure, new services, background execution, outreach, spending or publishing on behalf of a site visitor are provided by the brief workflow.
- Legacy `/app/` paths remain separate and unchanged. This release upgrades the homepage workspace.

## Known limits and rollback

The checker validates shape and length only. It cannot assess the user's plan, truth of supplied text, or completed checklist evidence. Drafts are not recoverable after reload without a downloaded copy; there is no import in this release. The server check is optional and may be unavailable or rate-limited; local review/export remains useful.

The previous frontend source is commit `4123538bf18c4eb322c20247e23656625df40169`. After publication, revert only the release commit(s) following inspection of later changes; do not force-reset main. Monitor the resulting Pages deployment to successful completion. Backend rollback instructions are in its worker/RELEASE.md and preserve existing state.

Next useful work: observe the real brief workflow with non-sensitive examples, then address specific usability findings. Any execution, persistent customer storage or new service is a separate scoped decision.
