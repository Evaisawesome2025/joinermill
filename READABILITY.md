# Readability patch for the complete local workspace candidate

This branch extends frontend `ad0af760bae86702526bd935ff6fc5fc17a172f9` (reusable instructions). It improves text size/contrast, heading and quote hierarchy, mobile navigation/form layout, and real text enlargement reflow. The quote has a real space after “forward.”; the objective step appears above its label. The objective notes now accurately distinguish explicit browser saving/downloads from no automatic saving or transmission while drafting.

Product edits are only `index.html` and `preview/preview.css`. No scripts, storage formats, validation contract, backend runtime, directory roles, examples or legacy app routes change. `tests/readability.cjs` adds computed font-size, long-label and fixed-viewport doubled-text regressions; `package.json` includes it in the existing browser suite.

The newer branch is **not a patch for current live preview main**. A separate minimal branch `fix/live-readability-20261006`, based on `4123538bf18c4eb322c20247e23656625df40169`, keeps that preview’s original open-tab/fixed-example disclosures. Integrate the branch appropriate to the release source; never apply both blindly.

Validation:25 frontend unit tests,70 unchanged backend tests,64 existing browser groups plus6 readability groups, and36 existing axe scans. Separate fresh-context review directly inspects phone/desktop renders, actual200% text enlargement, long labels, keyboard focus and computed contrast across7 views. Exact reviewed hashes, final results and before/after screenshots are in the portable handoff. Synthetic data only; no external requests in readability tests.

The original user screenshots were inspected by a separate parent visual worker. This worker’s supported Library materialization failed and was not retried; it personally inspected local before/after renders. Do not claim direct inspection of the original bytes here.

Publication authority for this increment is branch push only. Parent release task owns main integration, backend/publication sequencing, staged-assets verification and live checks. Earlier network blockers in historical documents are observations from their respective sessions, not evidence of current live failure. Recheck current remote/deployed state before publishing. Preserve heldPR15/PR32 and all concurrent branches; Pulse stays excluded.

To reproduce: serve this repository at127.0.0.1:8765, keep backend `c23ce45671e9d8bc9d153d65b277caae2f1513a2` alongside at `../evaos-v05` for existing integration tests, then run `npm test` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser`. No new service, credential or model call is needed.

Rollback after any later integration: revert only this patch on top of the then-current release source and reverify; never force-reset main or other branches.
