# Work desk checkpoint — October 2026

**Branch only; no main merge or deployment in this increment.** Branch `next/command-center-20261005` extends frozen frontend commit `7f78c54097d70dc46d2d51b45f5e3d513f88fe67`. The earlier reviewed six-field release is also not deployed in this work trail.

## Behavior and privacy

The review screen is a work desk showing the person's objective, intended deliverable and stop rule. Editable next-action and unresolved-input notes stay local. A note is not a task assignment, readiness score, AI recommendation or evidence of completed work. The unchanged 13-specialist directory and fixed examples remain separate.

Drafts stay in the open tab unless the person explicitly saves a browser copy or downloads a text file. Manual browser save stores one versioned snapshot in localStorage on the current origin/profile, including six brief fields, two notes and save time. It does not sync, autosave or automatically restore after reload. Restore warns before replacing a nonempty open draft. Server-check status is never saved. Clearing the draft also clears hidden summary nodes but deliberately leaves the separately saved copy; removal deletes only the application's snapshot key. Shared browser users may access the copy; browser site-data deletion removes it.

Snapshots are capped at 64 KiB before parsing, require an exact versioned schema and use the existing brief field caps. Next action is capped at 600 characters, unresolved inputs at 1,600. Corrupt/unsupported snapshots cannot restore; storage read/write/quota/removal failures are visible while the current draft remains available. Values render as text. There is no arbitrary-file import or customer-data database.

Download work plan includes exact planning notes plus either the canonical complete brief or explicit incomplete-field labels. Download brief retains the existing canonical six-field export. The optional **Send brief for format check** action sends just the six brief fields, never planning notes or save metadata. The unchanged handler performs deterministic validation and returns a matching export checksum; it stores/logs no body. Infrastructure may retain request metadata. Stale/interrupted checks cannot mark restored work as verified. Availability of the server never blocks local use.

## Reproduce validation

- `npm ci && npm test` runs both unit suites (9 tests).
- Check out `evaos-v05` alongside this checkout, at frozen `d39936927821ce80087194eec948c7d94857037b` or its documentation-only next branch. From that repository run `cd worker && npm test` (70 tests).
- From this checkout, start `python3 -m http.server 8765 --bind 127.0.0.1` in a separate terminal.
- Install Chromium with `npx playwright install chromium`, then run `npm run test:browser`. Alternatively set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an already installed Chromium.
- `BRIEF_TEST_OUTPUT` optionally sets the screenshots/JSON output directory. Browser suites run 13 existing groups and 12 desk/storage groups. They invoke the real Worker handler locally with synthetic data, intercept the remote URL, and assert exact exports, six-field request isolation, navigation, repeated clicks, cancelled checks, reset, explicit restore, blocked/corrupt/oversized storage, and keyboard/mobile behavior.
- Automated axe scans cover six views at desktop/mobile widths, the work desk at 1440/390/320px, and both restore/reset dialogs (17 scans). Automated checks do not replace human accessibility testing. Inspect the saved desktop/mobile screenshots as well.

No real records, credentials, paid services or external business actions are involved in these tests. `preview/brief-model.js` must match backend `worker/src/brief-model.js` byte for byte. This increment changes no backend runtime, configuration, deployment helper or preserved production source.

## Future publication and rollback

No publication beyond reviewed feature branches is authorized for this checkpoint. Before any later deployment, inspect concurrent changes and the current Worker version/settings, resolve authorized network access, and use the backend's reviewed preserving helper. Never plain `wrangler deploy`: checked-in configuration lacks part of live setup. Verify backend harmless synthetic requests first, then use existing GitHub Pages publication. Verify exact remote commits, terminal CI/deployment results and actual live behavior; a push alone proves none of those.

If a later release needs undoing, inspect later commits and revert only this release's changes, then monitor Pages to completion. Backend rollback must preserve settings and existing live routes using worker/RELEASE.md. Do not force-reset main, touch held PR15/PR32, or deploy Pulse.
