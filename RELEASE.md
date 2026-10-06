# Confirmation reliability — 2026-10-06

**Feature-branch publication only; no main merge or deployment.** This increment extends frontend `633d4afd1bf5e2586fbf0deda7dab6ec9f09432d` on `next/confirmation-readiness-20261006`; matching backend documentation extends `70099ca9802e2928075b20c721d07d289fafb794` on `next/confirmation-readiness-contract-20261006`. Prior branches are preserved.

## Reliability correction

A delayed local backup read could open import over an acceptance dialog and leave that old confirmation able to accept a newly imported result. Opening reset/restore/accept now cancels the pending import with a visible explanation; only one confirmation stays open. Acceptance is pinned to the exact result object reviewed, and replacing/clearing work closes stale dialogs. Closed confirmation controls cannot act again, and queued close events cannot steal focus from a newly selected field. Select the backup again after an interrupted import. The result/snapshot/backend schemas and privacy boundaries below are unchanged. See [READINESS.md](READINESS.md) for the audit, candidate ancestry and release gates.

## Result, provenance and owner decision

The owner enters a real output (up to 8,000 characters), its source/author/file-version note (1,000), and review feedback (2,000). Recording requires a prepared brief, result and source. First recording captures all six normalized brief fields; later updates retain that target. The owner can mark needs revision or confirm acceptance after adding explanatory feedback. Neither decision is independent verification or authenticated approval; timestamps come from the browser clock. Sources are plain text, and URLs are not fetched.

Editing the result/source clears recording and the prior decision. Feedback edits clear the decision only. Changing the current brief preserves the captured original target and shows a mismatch warning. The old decision always applies only to that original target. There is one current result, with no audit-grade signature or revision history. Reset begins a fresh record by clearing current fields, captured target, owner decision, metadata and hidden summary text.

## Local storage, exports and import

Saving is explicit, browser-only and replaces one copy on the current site origin/profile. It is not autosave, sync, cloud storage or account authentication. Reload leaves fields empty until explicit restore. Clearing the tab leaves saved copies/downloads; Remove saved copy deletes only the application key. Shared-browser users can access the copy, and browser data can be unavailable or cleared.

The existing storage key is retained. New snapshots use version 2 with exact keys: version, savedAt, draft, plan and result. Valid version 1 copies restore with an empty result; reading never upgrades/writes them. Only explicit Save writes version 2. Old application versions reject the new schema rather than discarding result data silently. Snapshot and file input caps are 128 KiB, checked before parsing, plus strict field/type/control-character/enum/state/date checks. Text remains literal through rendering and export.

Download work plan includes current intent, planning notes, actual result, source, feedback, decision, local timestamps and original review target. Incomplete drafts remain clearly labeled. Download brief only retains the original six-field format. Download backup creates a JSON file for bounded local restoration. Import reads that file in the browser, checks its schema, and requires confirmation before replacing the open tab. It does not save or transmit automatically. Imported/restored decisions remain explicitly unauthenticated user claims. Cancelled, malformed, failed or superseded imports do not replace current work. Reset clears the current tab and cancels a pending file read so stale imported data cannot repopulate it. Blocked storage or quota failures do not prevent local editing or file export/import.

The optional EVAOS format check still serializes exactly six current brief fields. Result/provenance/feedback/decisions and snapshot metadata are excluded. The unchanged handler stores/logs no body; infrastructure may retain metadata. An obsolete response cannot validate an imported/restored brief. The result flow never triggers a model, job, server-side record write or automatic request.

## Validation commands

- `npm ci && npm test` — 18 unit tests, including strict result transitions, original-target retention, import schema/types, version 1 migration, literal text and exact exports.
- Clone the matching backend alongside this checkout; run `cd worker && npm test` there — 70 tests. The shared frontend/backend brief model must remain byte-identical.
- Serve this checkout with `python3 -m http.server 8765 --bind 127.0.0.1` in a separate terminal.
- Install Chromium (`npx playwright install chromium`) or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium. Run `npm run test:browser` — the original 13 groups, command-center 12 groups, result-review 16 groups, and confirmation reliability 8 groups (49 total).
- `BRIEF_TEST_OUTPUT` selects the artifact directory. Tests intercept the Worker URL and invoke the real handler locally with synthetic data. They do not call live customer routes. Coverage includes decision/reset/back/reload/repeated clicks, exact readable and JSON exports, confirmed/cancelled/legacy/malicious/oversized imports, file-read errors/races, blocked/corrupt/quota storage, request isolation and stale checks.
- Twenty-seven axe scans cover six desktop/mobile views, desk/result widths 1440/390/320px, and reset/restore/import/accept dialogs, including interrupted confirmation states. Inspect the desktop/mobile screenshots too; automated accessibility scans do not replace human testing.

## Future release and rollback

This checkpoint ends at reviewed branch pushes. No live deployment or main merge is part of it. A later authorized release must inspect concurrent work, verify public-host access and current Worker state, preserve all deployed settings/bindings with the existing helper, deploy backend first, then verify harmless synthetic probes before Pages. Never use plain wrangler defaults or older backend main as a rollback. A push alone is not proof of a live release.

To undo this branch increment, inspect later changes and revert its commit. Do not rewrite preserved release branches, main, held PR15/32 or Pulse. For any later live rollback follow the backend's worker/RELEASE.md and monitor Pages to completion. No KV/customer data rollback is introduced.
