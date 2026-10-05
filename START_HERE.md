# Start here — Joinermill work desk

## Current checkpoint

2026-10-05: **feature-branch work only; not deployed or merged to main.** This increment is on `next/command-center-20261005`, based on frozen reviewed release commit `7f78c54097d70dc46d2d51b45f5e3d513f88fe67`. The frozen `release/editable-brief-20261005` branch remains unchanged. The last verified published frontend source is `4123538bf18c4eb322c20247e23656625df40169`; this document makes no new live claim.

The matching backend branch is `next/command-center-contract-20261005` in [evaos-v05](https://github.com/Evaisawesome2025/evaos-v05), based on frozen `d39936927821ce80087194eec948c7d94857037b`. This second increment changes backend documentation only: its existing six-field contract is sufficient. The first release's backend and frontend remain undeployed in this work trail.

## What a person can do

Write the six-field brief, review its actual objective, intended deliverable and stop rule, then record a next action and unresolved inputs. The notes are the person's own plan, not inferred assignments or verified results. Download the complete work plan, or download a clearly labeled incomplete plan while still drafting. The original six-field brief export remains available.

Use **Save in this browser** to keep one bounded snapshot on this browser profile and site origin. Saving is manual, edits are not autosaved, and reload never restores content automatically. Restore replaces the open draft only after confirmation when it contains text. A snapshot includes the brief, two planning notes and save timestamp; it excludes backend verification state. Clear draft empties the open tab; the saved copy remains until **Remove saved copy**. Downloads remain on the person's device. Browser data may be cleared or unavailable, and a shared browser profile can access the copy. There is no account sync or import from arbitrary files.

The optional format-check button sends only the six brief fields to EVAOS after an explicit click. Planning notes and local save metadata are excluded. The handler does not store or log bodies; infrastructure may retain request metadata. It checks structure and export bytes, not the plan's quality or whether work is complete. Local review and downloads work without that check.

## Resume and verify

1. Read [RELEASE_STATUS.json](RELEASE_STATUS.json), [RELEASE.md](RELEASE.md) and [RELEASE_LOG.md](RELEASE_LOG.md). Fetch and inspect remote state before any change; preserve concurrent work.
2. Run `npm ci && npm test`. Clone the coordinated backend alongside this repository and use the matching frozen backend or its documentation-only next branch. Keep `preview/brief-model.js` byte-identical to its `worker/src/brief-model.js`.
3. Serve this checkout on localhost port 8765 and run `npm run test:browser`; see RELEASE.md for browser setup. All tests use synthetic content and a local invocation of the Worker handler, not customer records or live server processing.
4. Review the checkpoint screenshots in [docs/screenshots](docs/screenshots). The portable review evidence and final branch commit hashes are supplied with the handoff. Repository status describes the code checkpoint and does not imply deployment.
5. Stop after reviewed branch publication. A later release session must first verify network access and current remote/deployed state, then review the release candidate before deploying the backend and publishing Pages. Do not treat these branch instructions as a request to deploy now.

## Boundaries and recovery

The 13-role directory and separate fixed examples remain; neither is a presence feed or executed team. This is deterministic brief software, not AI judgment or agent execution. No model calls, paid infrastructure, new services, server-side customer persistence, background jobs, outreach or spending are provided.

Held [Joinermill PR15](https://github.com/Evaisawesome2025/joinermill/pull/15) and [EVAOS PR32](https://github.com/Evaisawesome2025/evaos-v05/pull/32) remain untouched and unmerged. Pulse remains a separate completed **UNSCORED** prototype; it is absent from this checkout and is not deployed. Legacy `/app/` paths are unchanged.

Nothing was deployed by this increment, so no live rollback is needed. To undo this increment on its branch, inspect later changes and revert its commit; do not force-reset or rewrite frozen branches. Future live rollback instructions remain in RELEASE.md and the backend's worker/RELEASE.md. Never deploy the older backend main as rollback: it lacks some already deployed routes.
