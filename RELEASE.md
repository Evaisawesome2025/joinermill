# Editable work briefs — October 2026

The homepage now builds a real specification from six editable fields: objective, inputs, deliverable, constraints, success checklist and stop rule. Review and plain-text export use the person's actual text. Separate examples and the unchanged 13-specialist directory are illustrative. Nothing is executed and checklist items remain unverified.

Drafting is memory-only: no localStorage, cookies, automatic server save or import. Reload/reset clears the draft. Navigation preserves it. Download explicitly saves a text file to the person's device. The optional **Send brief for format check** button sends all six fields to the existing EVAOS Worker; it does deterministic structure validation, normalization and a matching export checksum. The new handler stores/logs no content, though infrastructure may retain request metadata. Editing cancels pending checks and invalidates prior verification. An unavailable server never blocks local review/download.

## Validation

- `npm ci && npm test`: deterministic model/export tests.
- Start `python3 -m http.server 8765 --bind 127.0.0.1` from this checkout.
- Check out the coordinated evaos-v05 repository alongside this checkout.
- `npx playwright install chromium`, then `npm run test:browser`. An existing Chromium can be selected using `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
- Browser regression tests use synthetic data, exercise the real backend handler locally, capture desktop/mobile screenshots, and run axe accessibility checks. `BRIEF_TEST_OUTPUT` optionally selects the artifact directory.

No real customer records, credentials, paid services or external business actions are used. The shared `preview/brief-model.js` must remain byte-identical to backend `worker/src/brief-model.js`.

## Publication and rollback

Deploy and verify the backward-compatible backend first; see its worker/RELEASE.md. Publish this site's reviewed commit to main through the existing GitHub Pages path. Verify the exact remote SHA, successful Pages deployment and live browser behavior; a push alone is not success. The existing alternate Actions staging workflow also includes preview assets so re-enabling it cannot omit the workspace.

To undo only this release, inspect later work, `git revert <release-commit>`, push the reviewed revert and monitor Pages to successful completion. Do not force-reset main or modify held PR15. The corresponding backend must preserve held PR32 and existing live Worker settings and bindings.
