# Current checkpoint — phone and desktop readability

2026-10-06: `fix/phone-readability-20261006`, based on `ad0af760bae86702526bd935ff6fc5fc17a172f9`. Read [READABILITY.md](READABILITY.md) before integration. This changes presentation and two accurate objective-form notes, with no feature/backend/storage changes. Reviewed branch publication only; parent release task owns deployment. A separate live-preview hotfix preserves the older preview behavior and has a different base. Exact heads, review hashes and portable evidence are in the handoff STATUS.json.

The following is preserved historical context.

---

# Start here — reusable manual work instructions

2026-10-06: **new feature branches only; no main merge or deployment.** Frontend `next/reusable-instructions-20261006` extends `6a03b5da0d3d8103a87c6df3e69e71e227b4be5e`. Matching backend `next/reusable-instructions-contract-20261006` extends `31c003066eb771a21f59836110b433e68dad97c4`; changes there are documentation only. Read [REUSABLE_INSTRUCTIONS.md](REUSABLE_INSTRUCTIONS.md) for the new workflow, separate file/storage formats, migration and clean-start guarantees.

Work instructions are a separate local editor. Save/download the definition explicitly; starting fresh work asks before replacement and copies only brief/directions. It clears old results, sources, acceptance, captured target, timestamps, notes and validation. The copied owner/blocker/handoff fields do not assign work or enforce gates. Active backup v3 preserves copied directions; v1/v2 remain readable without automatic writes.

Current final source hashes, branch publication verification, test/review evidence and portable patches are in the handoff STATUS.json. Preserve all prior release, command-center, result-review and confirmation-readiness branches. Stop after reviewed feature-branch pushes. The following prior checkpoint documents the preserved result/review workflow and release boundaries.

---

## Prior checkpoint — reliable local confirmations

## Checkpoint

2026-10-06: **new feature branches only; no main merge or deployment.** Frontend `next/confirmation-readiness-20261006` extends reviewed result-review commit `633d4afd1bf5e2586fbf0deda7dab6ec9f09432d`. Backend `next/confirmation-readiness-contract-20261006` extends `70099ca9802e2928075b20c721d07d289fafb794` in [evaos-v05](https://github.com/Evaisawesome2025/evaos-v05). Backend changes remain documentation only.

A complete-path audit reproduced a delayed-import race that could apply an old acceptance confirmation to a different result. This increment fixes confirmation ownership: opening reset/restore/accept cancels a pending import, confirmations are exclusive, acceptance is bound to its exact result, and obsolete controls cannot act on replaced work. Read [READINESS.md](READINESS.md) for the reproduction, complete audit, candidate ancestry, historical public-verification blocker and first-real-user prerequisites. No additional feature was added.

Prior result-review, command-center and frozen release branches remain untouched. Frozen first-release commits are frontend `7f78c54097d70dc46d2d51b45f5e3d513f88fe67` and backend `d39936927821ce80087194eec948c7d94857037b`. The last verified published frontend source in this work trail is `4123538bf18c4eb322c20247e23656625df40169`. These reviewed increments have not been deployed by this task.

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

The 13-role directory, separate fixed examples and legacy `/app/` routes remain unchanged. Held [Joinermill PR15](https://github.com/Evaisawesome2025/joinermill/pull/15) and [EVAOS PR32](https://github.com/Evaisawesome2025/evaos-v05/pull/32) remain untouched and unmerged. Pulse belongs to a separate task; this increment neither inspects nor changes its paths, branches or deployment. No Pulse integration is introduced or tested. There are no models, new services/accounts/auth, server customer-data writes, execution, spending, outreach or synthetic delivery claims.
