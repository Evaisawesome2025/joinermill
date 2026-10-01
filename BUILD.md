# EvaOS V1.5 — User Zero dogfood prep (Joinermill)

**When:** 2026-10-01 ~18:08 CT  
**Canon:** `ATLAS_USER_ZERO_REAL_LOOP_MUST_LATER_20261001.md` · USER-ZERO-REAL-LOOP  
**Gage:** AUDIT-20261001-1806 path **(B)** dogfood Glen-as-UZ · Bug gate 1–13 required before Glen submit cue / clean claim  
**Ship class:** Dogfood wire · $0 · Clerk **deferred** · **not** User Zero success claim

**Live:** https://joinermill.com/app/ · Worker https://evaos-v05-ask.joinermill-ask.workers.dev/health

## MUST (this ship)

| Item | Done means |
|------|------------|
| Auth | Keep dogfood access-code / bearer · signup not-live |
| Objective intake | Free-text on /app/ → Worker Ask with `OBJECTIVE:` prefix · durable intent_id + CT stamp in pending |
| Approve freeze | Dogfood panel · idle until Eva posts `approves[]` in outbox · no fake accepted |
| Guest separate | /app/guest/* remains DEMO/REPLAY · not User Zero PoW |
| IdP | Clerk deferred · documented |

## Honesty / non-claims

- Claim class: **dogfood** (Glen) — not stranger-live  
- User Zero **not** claimed until Glen submits a real objective and a **NEW** artifact exists this run  
- Guest REPLAY / SAMPLE ≠ User Zero evidence  
- Clerk / waitlist / checkout / stranger write still gated  
- `paid_n=0`

## Verified before ship

- Worker /health `write_enabled:true`
- Unauthorized POST → 401
- CORS Origin joinermill.com → 204
- Authenticated SELFTEST 20261001-1808 → 201 SENT · GH #15 · process ANSWERED (ops outbox; selftest not product-pushed)

## LATER

Clerk magic-link (free tier) when opening Owner beyond Glen · durable Approve write-back · longer objective body if Worker MAX_BODY raised
