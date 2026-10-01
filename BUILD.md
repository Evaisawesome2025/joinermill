# EvaOS V0.9 — Mill floor + onboard shell (Joinermill)

**When:** 2026-10-01 ~16:16 CT  
**Canon:** `ATLAS_V09_SHIP_MUST_LATER_20261001.md` · `OFFICE_VIEW_RECOMMENDATION.md` · Mira presence rules · `ONE_RECOMMENDATION_MULTI_OWNER_ACCOUNTS.md`  
**Ship class:** Quiet Mill floor + account-model shell · $0 · **no** Clerk · **no** live email capture · **no** waitlist arm · **no** Worker stranger write · **no** decorative rainbow  

**Live:** https://joinermill.com/ · `/app/office/` · `/app/signup/` · `/app/guest/` · `/app/waitlist/`  

## MUST (this ship)

| Item | Done means |
|------|------------|
| Mill floor | Quiet desk/window · idle=idle · ≤1 earned artifact · **reject** coffee/typing/fake busy |
| Signup shell | Guest → Continue with email (magic link) · verify-before-account copy · CTA **not live** |
| V0.9 stamp | `evaos-version=0.9` on surfaces |
| Waitlist path | Canonical `/app/waitlist/` · root `/waitlist/` redirect (if staged) |
| Preserve | Guest DEMO · waitlist honesty · pricing intent · no fake live Ask |

## Approve-gated (not this cut)

Clerk magic-link · live capture · Worker JWT stranger write · paid Clerk extras

## LATER

Rainbow heartbeat until real org-activity feed · full B4 UI · checkout · multi-tenant Ask

## Non-claims

Accounts not live · waitlist not armed · Helm not for sale · continuous autonomy not sold · guest DEMO ≠ live Ask · no coffee theater.

## Deploy note (waitlist root)

Actions `pages.yml` still stages `app/` but not root `waitlist/` (OAuth lacks `workflow` scope).
Canonical: **`/app/waitlist/`**. Root redirect file exists in repo; apply stage line
`cp -a ... app waitlist _site/` when workflow scope available (see prior PAGES_YML patch).

