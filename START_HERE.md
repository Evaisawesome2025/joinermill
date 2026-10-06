# Start here — local result and owner review

## Checkpoint

2026-10-06: **new feature branches only; no main merge or deployment.** Frontend `next/result-review-20261006` extends reviewed command-center commit `a30ccbe885a1fd5523d7450c593638dab8ee2d8c`. Backend `next/result-review-contract-20261006` extends `3f47c08e82191d8fe34b45e3c0950c639e17a9cb` in [evaos-v05](https://github.com/Evaisawesome2025/evaos-v05). Its changes are documentation only; the stateless six-field endpoint is unchanged.

Prior command-center branches and frozen release branches remain untouched. Frozen first-release commits are frontend `7f78c54097d70dc46d2d51b45f5e3d513f88fe67` and backend `d39936927821ce80087194eec948c7d94857037b`. The last verified published frontend source in this work trail is `4123538bf18c4eb322c20247e23656625df40169`. These reviewed increments have not been deployed by this task.

## Use the vertical slice

1. Prepare your actual six-field brief, including desired deliverable and success criteria. The desk's next-action/missing-input notes remain available.
2. Enter a real result or deliverable text and a source/author/file-version note. **Record result for this brief** captures the current normalized brief as the original review target. It changes this tab only; it does not save or send anything.
3. Compare the result with the captured brief, add feedback, and mark **Needs revision** or explicitly confirm **Accepted by owner**. This is an owner assertion, not independent verification, authenticated identity, AI judgment or proof every criterion was met. Browser-clock timestamps are untrusted local metadata.
4. Editing the result or source clears recording and the decision; record the revised text again. Editing feedback clears the decision. The original target stays fixed. If you change the current brief, a warning and export explicitly limit the old decision to its captured brief. There is one current result, not a revision history. Reset the tab to start a separate project.
5. Use **Save in this browser** to replace the local browser snapshot. Reload never automatically restores it. Clear draft empties the current tab, including hidden result/brief content; saved copies and downloads remain until separately removed. Shared-browser users may restore the saved copy.
6. Download a readable plan/review or a JSON backup. Import validates a bounded backup locally, then asks before replacing the open tab. It neither sends nor saves automatically. Imported decisions and timestamps are user-provided claims, not authenticated approvals.

The optional format-check button still sends exactly six current brief fields. Planning notes, actual results, provenance, feedback, captured targets and owner decisions are excluded. No URL in a result is fetched. The unchanged handler stores/logs no body; infrastructure may retain request metadata. A format check does not assess the result or change the owner decision.

## Reproduce and hand off

Read [RELEASE_STATUS.json](RELEASE_STATUS.json), [RELEASE.md](RELEASE.md) and [RELEASE_LOG.md](RELEASE_LOG.md). Fetch remote state before editing. Use `npm ci && npm test` and the documented local browser command with the matching backend checked out alongside this repository. Keep the shared six-field model byte-identical. All tests/screenshots use synthetic inputs. Desktop/mobile evidence is in [docs/screenshots](docs/screenshots); the portable handoff contains the independent review, exact remote commit IDs, source patches, test logs and artifact hashes.

Stop at reviewed feature-branch publication. A later authorized release session must verify public-host network access, current remote/deployed state and a fresh safe Worker baseline; use its preserving deployment helper, then verify backend before Pages. No editor/network/Library recovery retries are part of this increment. No live rollback is needed now; inspect later work and revert only this increment's branch commit if necessary. Never force-reset main or frozen branches.

## Preserved boundaries

The 13-role directory, separate fixed examples and legacy `/app/` routes remain unchanged. Held [Joinermill PR15](https://github.com/Evaisawesome2025/joinermill/pull/15) and [EVAOS PR32](https://github.com/Evaisawesome2025/evaos-v05/pull/32) remain untouched and unmerged. Pulse stays a separate completed **UNSCORED** prototype, absent from this checkout and undeployed. There are no models, new services/accounts/auth, server customer-data writes, execution, spending, outreach or synthetic delivery claims.
