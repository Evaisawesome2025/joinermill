# EvaOS V0.8 — Atlas guest-try + Vera UX absorb (Joinermill)

**When:** 2026-10-01 ~16:12 CT  
**Canon:** `ATLAS_V08_SHIP_MUST_LATER_20261001.md` · `ABSORB_V08_SHIP_UX_20261001.md`  
**Ship class:** Guest try (canned DEMO) + thin home CTA + pre-auth pricing honesty · $0 · **no** Worker stranger write · **no** public waitlist arm · **no** checkout  
**Live home:** https://joinermill.com/ · `/app/` · `/app/guest/` · `/app/waitlist/`  
**Deploy:** `Evaisawesome2025/joinermill` `main` → GitHub Pages

## MUST (this ship)

| Item | Done means |
|------|------------|
| Guest try-without-code | `/app/guest/` canned tour · DEMO labels · **no** Worker `fetch` |
| Thin home CTAs | **Try Eva (preview)** → `/app/guest/` · **Open dogfood** → `/app/` |
| Version stamp V0.8 | `meta evaos-version=0.8` on `/app`, `/app/guest`, `/waitlist`; kickers |
| Pre-auth pricing honesty | Home `#pricing` — Founding Owner Seat intent $49/mo · named components · not for sale |
| Freeze → named approver → hard spend cap | Guest dials + DEMO prompts (sandbox language only) |
| North Star | First stranger dollar / honest zeros — not vanity counters |
| Waitlist | Stays **not armed** (stamp bump only) |
| PoW | curl HTTPS 200 + openssl SAN before claim live |

## LATER

| Item | Gate |
|------|------|
| Worker-backed stranger Ask | AUDITOR + isolation |
| Armed waitlist / checkout / full B4 / Clerk | Owner Approves + existing gates |
| Home redesign alone / activity theater | Reject near-term |

## Non-claims

Guest DEMO ≠ live Ask · waitlist not armed · Helm not for sale · FA-01 not PASS · continuous autonomy not sold · paid_n=0 · no governance-vs-competitors slogan.


## Deploy note (waitlist path)

Actions `pages.yml` stages `app/` but not root `waitlist/` (OAuth lacks `workflow` scope to patch).
Live honesty waitlist: **`/app/waitlist/`**. Root `/waitlist/` may 404 until Glen applies:
`cp ... app waitlist _site/` (see `PAGES_YML_WAITLIST_STAGE_PATCH_20261001.md`).
