# Atlas — User Zero real loop · Clerk final review

**When:** 2026-10-01 ~18:06 CT · **Path:** `USER-ZERO-REAL-LOOP` · joinermill.com dogfood  
**Ask:** OWNER APPROVE (~18:05 CT) — Clerk magic-link **IF still best** after final review; Eva may change IdP. Goal ≠ Clerk; goal = **User Zero real loop**.  
**User Zero:** Glen  
**Prove:** real objective → understand → plan → delegate → specialist work → audit → evidence → Approve if consequential → result  
**Hard no:** simulated work · fake activity · predetermined DEMO (guest REPLAY stays guest-only)  
**Baseline:** V1.4 OBJECTIVE-REHEARSAL LIVE (DEMO) · Clerk **not** live · waitlist **not** · Worker Ask durable + bearer dogfood  
**Authority:** Decision for Eva execute · spend stay **$0** unless free-tier IdP fails (then stop/re-card) · Gage bug-hunt before clean-ship claim

---

## Verdict: **DEFER Clerk · SHIP loop on existing dogfood auth**

**Clerk is not the bottleneck for User Zero.** Glen already authenticates to live Ask via dogfood **access code / OWNER_BEARER** on https://joinermill.com/app/ against `evaos-v05-ask` (`write_enabled:true` VERIFIED). Adding Clerk before a real objective→result PoW is IdP cargo-cult.

**Still best later:** Clerk (or equivalent) email magic-link remains the right **multi-owner / stranger onboard** IdP per `ONE_RECOMMENDATION_MULTI_OWNER_ACCOUNTS.md` + verify-first requirement — **after** User Zero proves the loop, or when replacing bearer for a second Owner. Portable `owner_id` / `workspace_id` behind Worker; IdP swappable.

**Reject now:** Custom roll-your-own magic-link (unearned security/ops tax). Reject blocking User Zero on Clerk create. Reject calling guest `/app/guest/mission/` REPLAY a User Zero proof.

---

## ONE path — `USER-ZERO-REAL-LOOP`

Wire the full loop on **authenticated dogfood** `/app/` (bearer). Every stage must leave **real** artifacts (issues/files/commits/URLs) Eva and Gage can re-fetch — not a scripted rail.

### MUST / LATER (≤8)

1. **MUST — Auth for User Zero:** Keep dogfood access-code / bearer on `/app/`. **Do not** require Clerk to start this cut. Signup shell stays not-live: https://joinermill.com/app/signup/  
2. **MUST — Objective intake:** On `/app/`, Glen submits a **real** objective → durable record (Worker and/or GH) with `objective_id` + timestamp + raw text. No canned objective picker on dogfood.  
3. **MUST — Real pipeline:** For that objective: understand → plan → delegate to **named** specialists → **real** work products (files/PRs/evidence URLs). No fake Mill busy · no predetermined DEMO on this path.  
4. **MUST — Audit + evidence:** Surface plan + specialist outputs + short audit note on dogfood (or linked PoW page under `/app/`). Guest REPLAY is **not** evidence for this claim.  
5. **MUST — Consequential Approve:** Send / spend / publish / binding price freeze until Glen Approves on dogfood UI (or existing Approve packet flow) — then execute only what was Approved.  
6. **MUST — Gage pre-ship bug-hunt** (functional + honesty + evidence + safety) with the verifiable URL pack below before any clean-ship claim (`AUDITOR_PRE_SHIP_BUG_GATE.md`).  
7. **LATER — Clerk magic-link (prefer free tier):** When opening Owner beyond Glen or retiring bearer — email verified **before** Owner/Workspace row; Worker JWT; no waitlist arm / checkout in that card; Max $0 unless free tier blocks → re-card.  
8. **LATER / still gated:** Stranger Worker write · waitlist arm · checkout · guest free-text live org · rainbow heartbeat without real feed.

---

## Verifiable URLs for Gage (bug-hunt pack)

| URL | Expect now | Expect after this ship |
|-----|------------|-------------------------|
| https://joinermill.com/app/ | 200 · access-code dogfood · live Ask (bearer) | + real objective intake + evidence/Approve UI |
| https://evaos-v05-ask.joinermill-ask.workers.dev/health | 200 · `write_enabled:true` | unchanged or documented |
| https://joinermill.com/app/signup/ | 200 · CTA **not live** | still not live (Clerk deferred) |
| https://joinermill.com/app/guest/ | 200 · DEMO / V1.4 | still DEMO — **not** User Zero PoW |
| https://joinermill.com/app/guest/mission/ | 200 · REPLAY rail | still REPLAY |
| https://joinermill.com/app/guest/sample/ | 200 · SAMPLE artifact | unchanged |
| https://joinermill.com/#trust | 200 · honesty board | optional one evidence line **only** if User Zero PoW is public-safe |
| *(post-ship)* objective evidence URL Eva publishes under `/app/` | — | Gage re-fetches live |

**Privacy:** Public pages must not leak access codes or Glen’s full name (Glen only).

---

## Success

Glen (User Zero) gives a real objective in EvaOS dogfood and later sees **earned** plan + specialist work + audit + Approve-gated consequential result — with Gage able to re-verify the URLs. Clerk absence is **not** a fail for this cut.

*— End ATLAS_USER_ZERO_REAL_LOOP_MUST_LATER_20261001 —*
