# Milestones and acceptance criteria

Milestones are ordered around reviewable outcomes. Some foundation work already exists; each item still needs current-revision verification before it can be called complete. Do not skip quality gates to meet a date.

## M0. Product and hosting proof

**Outcome:** remaining launch assumptions are decided and the chosen free hosting path is technically feasible.

- Confirm registration policy, nickname visibility/opt-out, weekly reset timezone, support channel, and minimum content count.
- Deploy a minimal Vercel Django + React slice and connect to a disposable Supabase database.
- Verify session cookies, CSRF, migration strategy, static files, and database pool behavior.

**Accept when:** a clean browser can register, log in, load a lesson, write progress, and log out on the deployed preview, and all actual limits/terms are recorded. If this fails, revisit hosting before building against it.

## M1. Product foundation and account flows

**Outcome:** learners can create accounts, use the app safely, and navigate the three sections.

- Align account fields, separate nickname from username, and document admin-assisted recovery.
- Add Basics, Medium, Advanced navigation and remove sequential section locks.
- Keep account email private; add privacy text and support route.

**Accept when:** new and returning account paths work; all sections are open; account data is isolated; recovery actions are staff-only and audited.

## M2. Curriculum and assessment quality

**Outcome:** learners can complete a coherent balanced DSA path from foundations to interview practice.

- Map the seed worlds into the three sections and set prerequisite hints without locks.
- Fully edit all launch lessons; replace generic seeded placeholders.
- Add examples, dry runs, checks, hint ladders, assignments, and cumulative assessments.
- Review Python outputs, correctness, complexity, accessibility, and editorial consistency.

**Accept when:** every section meets the content acceptance target in the learning-design document and an independent reviewer can complete each assignment from the supplied instructions.

## M3. Games and browser Python practice

**Outcome:** games, story quests, assignments, and code practice reinforce stated concepts.

- Connect current games to lessons/objectives; add scenario quests for uncovered objectives.
- Keep Pyodide in a bounded Web Worker; display startup, success, error, timeout, and retry states.
- Review origin isolation, secret exposure, output escaping, mobile performance, and worker lifecycle.

**Accept when:** each section has an aligned interactive activity, key browser safety scenarios pass, and no learner code is sent to the API without explicit consent.

## M4. Points, badges, levels, and weekly leaderboard

**Outcome:** learners see progress and can participate in the casual global weekly leaderboard.

- Implement immutable point events, idempotent rewards, lifetime level calculation, and badges.
- Add nickname, public leaderboard, weekly aggregation, stable ties, reporting/moderation, and point caps.
- Explain that code-derived points are not cheat-proof and have no prizes.

**Accept when:** weekly boundary tests pass; duplicate requests do not duplicate scores; public responses omit email; a learner cannot view or edit another learner's private progress; nickname report/hide works.

## M5. Administration, privacy, and support

**Outcome:** the owner can maintain content and handle basic account/community issues safely.

- Add admin workflows for content review/publishing, account-assisted reset, and nickname reports.
- Add learner data export/deletion request handling and a privacy notice.
- Confirm whether self-registration is public or restricted to invites for the initial beta.

**Accept when:** admin actions are permission-checked and audited; reset does not disclose an old/shared password; public profile fields are explicit; deletion path is tested.

## M6. Release QA and operational rehearsal

**Outcome:** evidence supports a limited beta release.

- Run backend, frontend, end-to-end, security, accessibility, browser compatibility, and performance checks.
- Review dependencies and deployment settings; set DEBUG false and verify all secrets.
- Exercise database export/restore and a migration rollback plan.
- Re-check Vercel and Supabase terms/limits and confirm no auto-recharge.
- Write a short learner-facing beta notice explaining free-tier interruptions and score limitations.

**Accept when:** all critical tests pass or have explicitly accepted, non-blocking issues; no unresolved critical/high security issue remains; restore works; content and account support have owners; and the owner understands the free-tier outage risk.

## Launch decision

The launch is a limited personal beta only after M0–M6 acceptance. A broader public release needs a new review of self-registration, email recovery, moderation capacity, child/privacy requirements, abuse response, provider terms, backups, availability, and operating budget. A passed test suite is necessary but does not alone prove production readiness.
