# AUDIT — Challenge: User Zero live loop (not DEMO)

**ID:** AUDIT-20261001-1806-USERZERO-LIVE-CHALLENGE  
**Timestamp:** 2026-10-01 ~18:06 CT  
**Auditor:** Gage · AUDITOR  
**Subject:** OWNER direction — User Zero live loop (not DEMO); Eva preflight ask: FAIL-if-replay + IdP/Clerk gates  
**Type:** Pre-design / pre-ship challenge (no live User Zero surface verified this packet)  
**Verdict:** **CHALLENGE — live-loop claim BLOCKED until PoW gates**  
**Prior:** AUDIT-20261001-1755 (mission-runner) · AUDIT-20261001-1758 (rehearsal PWW · threshold NOT CLEARED) · AUDITOR_PRE_SHIP_BUG_GATE §§1–13  
**Risk escalate:** **true if** ship claims “live / real work / User Zero” while still DEMO/REPLAY

## Bottom line
**User Zero live loop is a different product class than OBJECTIVE-REHEARSAL.** Rehearsal may stay DEMO forever. A live claim requires **new work for a real bound identity**, not a dated SAMPLE replay. Claiming “real work” while the rail still maps to `/app/guest/sample/` (2026-09-29) is an automatic **FAIL** under threshold honesty (§12) and REAL>FAKE. Clerk magic-link remains **draft Approve packet only** (`A-CLERK-MAGIC-LINK-V09` · Decision blank) — enabling accounts without Owner Approve + email-verify-before-create = **FAIL**.

## One-liner risk
**If the UI says live/User Zero/real work but the deliverable is still a REPLAY of SAMPLE PoW, that is coffee theater with a new costume — automatic FAIL.**

## MUST FAIL (claim real work but still replay)

| FAIL | Trigger |
|------|---------|
| **Threshold honesty (§12)** | Copy/CTA/owner update claims “org went to work live” / “User Zero live” while path is DEMO/REPLAY or evidence = pre-V1.4 SAMPLE |
| **Just-now lie** | Timestamps or “completed” imply this session; artifact date still 2026-09-29 (or other frozen SAMPLE) |
| **Label strip** | DEMO/REPLAY/SAMPLE labels removed or buried while behavior unchanged |
| **Objective free-text → SAMPLE** | Stranger types arbitrary goal; output is always GramCeramics ListingLift |
| **Fake accept** | Approve looks accepted / job “queued” with no Worker/job PoW + no bound owner |
| **Mill theater** | Seats/rainbow/busy for User Zero without real activity feed |
| **paid_n / customer claim** | Implies paid or completed customer job from replay |
| **Self-certify clean ship** | Glen told “clean” without Bug gate 1–13 PASS/PWW |

## What WOULD count as live (minimum PoW)

All of:
1. **Bound identity** for User Zero (see Clerk gates below) — or explicit dogfood Glen-as-UZ with access-code path labeled dogfood (not stranger-live).  
2. **New work artifact** whose provenance date/path is **this run** (commit, outbox id, Worker job id, or file hash) — not deep-link-only to V1.3 SAMPLE.  
3. **Causal pair** objective text (or canned UZ brief) ↔ that new artifact.  
4. **Approve freeze real** for consequential acts — disabled teach-gate alone ≠ live loop.  
5. **Bug gate 1–13** PASS or PWW before clean-ship claim.

Until then: language must stay **DEMO/REPLAY/rehearsal** — threshold remains **NOT CLEARED**.

## IdP / Clerk gates (standing)

| Gate | Status / rule |
|------|----------------|
| **A-CLERK-MAGIC-LINK-V09** | **Draft only** — not Glen APPROVE filled · **must not** enable public account-create |
| **Email VERIFIED before account create** | Owner hard gate 2026-09-30 · red line #3 · unverified row = **automatic FAIL** |
| **No fake Create Account JSON** | Pages/git store of leads/accounts = **FAIL** |
| **Worker JWT / workspace_id** | Required before stranger write stamped to a tenant |
| **Spend** | Leaving Clerk free tier = separate spend Approve |
| **Not in Clerk cut** | Waitlist arm · checkout · open stranger Worker write without session |
| **Multi-owner model** | Shape APPROVED 2026-09-30; **Clerk enable** still separate |
| **GitHub login for customers** | Forbidden |

**Negative tests AUDITOR will demand before any “accounts live” PASS:**
- Signup without magic-link verify → **no** Owner/Workspace row · **no** owner session  
- Guest/mission path still cannot Worker-write without session  
- Disabled Approve still cannot accept  
- Hedstrom absent · secrets absent from client

## Recommended Eva path (challenge, not design lock)

| Option | AUDITOR stance |
|--------|----------------|
| **A. Stay rehearsal** — polish DEMO; never claim User Zero live | **OK** without Clerk |
| **B. Dogfood User Zero = Glen** — real objective → real new artifact under access-code `/app/` | **OK** if labeled dogfood · Bug gate · no stranger-live claim |
| **C. Stranger User Zero live** | **BLOCKED** until Clerk Approve + email-verify PoW + new-artifact PoW + Bug gate 1–13 · separate stranger-write enable |

Do **not** mix B’s real work with A’s SAMPLE deep-link and call it C.

## Pre-Glen-submit cue (Eva said she’ll run Bug gate)

Before submit cue, packet must include:
1. Explicit claim class: **DEMO** vs **dogfood-live** vs **stranger-live**  
2. Evidence URLs + SHA  
3. Non-claims (Clerk/waitlist/checkout/Worker)  
4. If stranger-live: Clerk Approve id + verify-before-create negative test PoW  
5. AUDITOR Bug gate 1–13 result (**this challenge is not that audit**)

## Non-claims
No ship authorized · Clerk not enabled · threshold not cleared · continuous autonomy not sold · this packet ≠ Bug gate PASS.

## Final status
**CHALLENGE — live-loop claim BLOCKED until PoW gates**

*— End AUDIT-20261001-1806-USERZERO-LIVE-CHALLENGE —*
