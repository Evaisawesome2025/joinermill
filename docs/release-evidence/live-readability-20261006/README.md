# Frontend readability publication — 2026-10-06

The independent readability hotfix is published at **https://joinermill.com/**. GitHub Pages deployment succeeded and all nine checked public entrypoint/preview/font files exactly match the release. **Direct live Chromium rendering remains unverified because navigation failed TLS certificate validation before document load.** Local desktop/mobile render and regression checks passed against those byte-identical files.

- Reviewed source: `0bb01ed52c2284f61d40cb53cc95faf9913d56f5`.
- Previous main / rollback source: `4123538bf18c4eb322c20247e23656625df40169`.
- Published commit: `4bc82d2dd07d2cf6a404d519655a98fa94776ec6`.
- Main push confirmed: `2026-10-06T03:47:05Z`.
- [Exact Pages run 37410610389](https://github.com/Evaisawesome2025/joinermill/actions/runs/37410610389): successful; deploy job completed `2026-10-06T03:48:05Z`.
- Rollback branch: `rollback/live-readability-20261006`, pointing to the previous main. A rollback, if needed, should restore the previous site tree in a new forward commit; do not force-reset a concurrently advanced main.
- This receipt is committed on `release/live-readability-20261006`; the receipt itself does not trigger another main deployment.

Only `index.html`, `preview/preview.css`, and `.github/workflows/pages.yml` differ from the previous production source. The workflow addition includes the already-existing `preview/` assets in its staging list; its disabled state is unchanged. Active Pages remains legacy `main:/`. JavaScript, templates, CSP (`connect-src 'none'`), storage behavior, and backend dependencies are unchanged.

## Validation

- [Independent review](INDEPENDENT_REVIEW.md) and [exact staging check](STAGING_CHECK.json): all 37 staged files match source; all four preview files and required fonts are included.
- [Local regression](LOCAL_VERIFICATION.json): six functional groups; 32 layout/reflow checks at widths 320, 390, 768, and 1440 with 16px/32px root text; eight axe scans with zero violations; no page errors, unexpected requests, or failed responses.
- Actual local screenshots inspected: [mobile](LOCAL_workspace-390.png), [desktop](LOCAL_workspace-1440.png), [mobile enlarged text](LOCAL_workspace-390-enlarged.png), [desktop enlarged text](LOCAL_workspace-1440-enlarged.png). These are explicitly local renders, not successful live browser navigation.
- [Live hashes](LIVE_HASHES.json), `03:49:18.597544–03:49:20.468941 UTC`: nine normal unauthenticated GETs; all HTTP 200, CONNECT 200, curl exit 0, TLS verification result 0, no redirects, and exact SHA-256 matches. Checked root HTML, preview HTML/CSS/JavaScript/roster, favicon, and three fonts.
- [Pages run](PAGES_RUN.json), [jobs](PAGES_JOBS.json), [build](PAGES_BUILD.json), [configuration](PAGES_CONFIG.json), and [workflow states](WORKFLOWS.json) provide the provider-side receipt.

## Remaining verification limitations

The direct Chromium attempt at `03:48:36.722–03:48:37.858 UTC` failed with `net::ERR_CERT_AUTHORITY_INVALID` before loading the document. See [browser failure](LIVE_BROWSER_BLOCK.json) and [public certificate metadata](BROWSER_TRUST_DIAGNOSIS.json). The current environment CA is already present in the existing NSS store; the precise validation cause is unresolved. No certificate checks were disabled, trust settings changed, alternate proxy used, or browser identity changed. The remaining condition for direct live desktop/mobile screenshots is successful Chromium TLS validation through the approved environment path.

The provider artifact uploaded successfully, but its storage download endpoint returned HTTP 403 on one download attempt. No retry or alternate route was attempted; no signed download URL is retained. See [artifact limitation](PAGES_ARTIFACT_CHECK.json). Local exact staging and live file hash checks provide the available asset evidence.

## Held scope

No Worker request, upload, activation, rollback, Pulse write, held PR15/PR32 merge, credential change, or security configuration change occurred in this frontend release. Backend main remains `c15db296c5a7dbf2cb5df40ba8fbe9443e578570`. Full candidate `7d443073b718e71a3a771c5c073e7a3b53889394` remains held. Backend error-1010 support submission remains pending user approval and was not sent.

The machine-readable summary is [DEPLOYMENT_RECEIPT.json](DEPLOYMENT_RECEIPT.json). [verify.cjs](verify.cjs) records the browser harness; its dependency paths reflect this execution workspace. Synthetic objectives were used only in page memory and local downloads.
