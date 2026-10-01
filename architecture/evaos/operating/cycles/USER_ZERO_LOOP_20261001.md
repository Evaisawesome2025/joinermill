# USER_ZERO_LOOP — dogfood prep (V1.5)

**When:** 2026-10-01 ~18:08 CT · **Owner:** Eva (Delivery) · Glen APPROVED ~18:05 CT (loop goal) · Atlas lock DEFER Clerk  
**Canon:** `ATLAS_USER_ZERO_REAL_LOOP_MUST_LATER_20261001.md` · Gage AUDIT-20261001-1806 path B  
**North star:** Glen submits real objective → org works → evidence → Approve if consequential → result

## IdP decision (final review)

| Option | Verdict |
|--------|---------|
| **Clerk magic-link now** | **DEFER** — not the User Zero bottleneck; Glen already authenticates via dogfood bearer |
| **Dogfood bearer on /app/** | **SHIP** — smallest real wire; bound identity = Glen access code |
| Custom roll-your-own magic-link | **REJECT** — unearned security/ops tax |
| Guest DEMO as User Zero proof | **REJECT** — Gage automatic FAIL |

Clerk remains correct **later** for multi-owner / stranger onboard (verify-first) per `ONE_RECOMMENDATION_MULTI_OWNER_ACCOUNTS.md`. Portable owner_id/workspace_id behind Worker.

**Spend:** $0 · no Clerk create · no paid plan.

## What shipped (prep wire)

1. /app/ Objective panel — free-text → same Ask Worker (`OBJECTIVE: …`) · pending shows OBJECTIVE + intent_id + CT stamp  
2. /app/ Consequential Approve panel — idle until outbox `approves[]` · Accept/Reject local record (durable write-back LATER)  
3. Honesty stamp V1.5 · claim class dogfood · Clerk deferred · guest DEMO separate  
4. Signup shell untouched (not live)

## Ask / outbox verification (before Glen cue)

| Check | Result |
|-------|--------|
| GET /health | 200 `write_enabled:true` |
| POST no auth | 401 unauthorized |
| OPTIONS CORS joinermill.com | 204 |
| SELFTEST authenticated | 201 SENT intent `15a045037eeb4de7…` · GH #15 · process ANSWERED |
| Product dual-write selftest | Skipped (correct — owner threads only) |

## What is NOT claimed

- User Zero success (needs Glen’s real objective + NEW artifact this run)  
- Stranger-live · Clerk enabled · waitlist · checkout · Mill theater  
- Guest mission REPLAY as live org work

## Next

1. Gage Bug gate 1–13 on public surface change (this V1.5)  
2. After PASS/PWW → Eva cues Glen: paste access code → submit first real objective on https://joinermill.com/app/  
3. Org executes real pipeline · evidence on /app/ · Approve freeze if consequential  
4. Only then claim User Zero PoW

## Blockers for Glen (Clerk path — N/A this cut)

Clerk dashboard steps **not required** this cut. If later enabling Clerk: Glen must create free-tier app, allow origins joinermill.com, magic-link email — Eva stops if paid plan needed.

*— End USER_ZERO_LOOP_20261001 —*
