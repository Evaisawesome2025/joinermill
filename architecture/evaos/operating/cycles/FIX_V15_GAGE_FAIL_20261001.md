# FIX — Gage FAIL AUDIT-20261001-1812-V15-USERZERO-DOGFOOD

**When:** 2026-10-01 ~18:16 CT  
**Class:** Gage FAIL remediations · not User Zero success · Glen submit cue stays **BLOCKED** until PASS/PWW  
**Prior tip before fix:** `623a676` (PoW stamp only; Trust still topped V1.4 `05a2636`)

## FAIL blockers fixed

1. **Trust Proof SHA** — `#trust` Proof now cites V1.5 ship content `ad36cb4` (USER-ZERO dogfood prep · Objective intake · Approve freeze · Clerk deferred). Home enter-note bumped V1.4 → V1.5.
2. **`/waitlist/` 404** — Root cause: Actions workflow `Deploy GitHub Pages` staged `_site` **without** `waitlist/`, then finished after legacy `pages-build-deployment` and overwrote the full-root publish (so `/waitlist/` became custom 404). Remediation this cut:
   - Disabled Actions workflow `Deploy GitHub Pages` (id 371574905) so legacy branch publish from `main` `/` serves `waitlist/index.html` again (meta-refresh → `/app/waitlist/` · not collecting).
   - Soft debt remains meta≠301.
   - **Before re-enabling Actions:** add `waitlist` to the Stage `cp -a …` list in `.github/workflows/pages.yml` (needs OAuth `workflow` scope — not available on current `gh` token). Until then leave Actions disabled or legacy will keep losing `/waitlist/`.

## Out of scope (unchanged)

- No Clerk enable · no waitlist collect · no checkout · no stranger write  
- No CTA densify · guest DEMO/REPLAY separate  
- Glen submit cue **not** issued

## PoW checks (post-deploy)

- `https://joinermill.com/#trust` shows ship `ad36cb4` (V1.5)
- `https://joinermill.com/waitlist/` not 404 (meta-refresh or 200 body → `/app/waitlist/`)
- `https://joinermill.com/app/` still Objective submit (dogfood)

## Re-audit

Eva pings Gage with this note + live URLs + tip SHA of this fix commit.

*— End FIX_V15_GAGE_FAIL_20261001 —*
