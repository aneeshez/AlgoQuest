# Decision log and open questions

This log captures user-confirmed decisions and proposed defaults. A proposed default is not a confirmed decision until the user accepts it.

## Confirmed decisions

| ID | Decision | Date recorded |
| --- | --- | --- |
| D-01 | AlgoQuest serves complete beginners and learners with basic programming knowledge. | 2026-11-05 |
| D-02 | Use a mix of visual explanations, tutorials, exercises, assignments, and games. | 2026-11-05 |
| D-03 | Lessons and interface start in English. | 2026-11-05 |
| D-04 | Learners use Python for DSA exercises. | 2026-11-05 |
| D-05 | Game mechanics include levels, progress, points, badges, story quests, and scenario-based games. | 2026-11-05 |
| D-06 | Course has Basics, Medium, and Advanced sections, all open in any order. | 2026-11-05 |
| D-07 | The goal is balanced DSA mastery with interview practice, not a competitive-programming-only course. | 2026-11-05 |
| D-08 | Build the app with JavaScript/React frontend and Python/Django backend. | 2026-11-05 |
| D-09 | Use Supabase PostgreSQL for persistent data. | 2026-11-05 |
| D-10 | Sign-in uses username and password; collect email for the account record. | 2026-11-05 |
| D-11 | No custom domain is available. Automated recovery email is deferred; use admin-assisted reset for the small private beta. | 2026-11-05 |
| D-12 | Python exercises run in the learner's browser. | 2026-11-05 |
| D-13 | Vercel Hobby is the leading hosting candidate for personal, non-commercial use. | 2026-11-05 |
| D-14 | Learners see one another's points and badges on a global leaderboard. | 2026-11-05 |
| D-15 | Leaderboard display uses a nickname, not login username or email. | 2026-11-05 |
| D-16 | Leaderboard ranks weekly points. | 2026-11-05 |
| D-17 | Leaderboard is casual; browser-checked code tasks can earn points, accepting that scores are not cheat-proof. Use basic abuse limits and no prizes. | 2026-11-05 |
| D-18 | Initial budget must be zero; use free tiers and do not silently introduce paid services. | 2026-11-05 |
| D-19 | Initial intended users are the owner and friends; leaderboard is visible to all app users. | 2026-11-05 |
| D-20 | Leaderboard display defaults on; every learner can hide their score and badges. Reports require sign-in and go to the restricted admin queue. | 2026-11-05 |

## Proposed defaults needing confirmation

| ID | Proposed default | Why it is useful |
| --- | --- | --- |
| P-01 | Allow self-registration, with leaderboard visibility limited to registered users. | Fits an open leaderboard while keeping private data behind accounts. |
| P-02 | Use Monday 00:00 in the configured product timezone as the weekly score boundary. | Implemented using the current Asia/Kolkata timezone; confirm this product choice before launch. |
| P-03 | Keep earned badges and lifetime points permanently; reset only the weekly leaderboard aggregation. | Preserves achievement history while giving weekly newcomers a fresh contest. |
| P-04 | (Implemented) Provide a learner hide control while still allowing course participation. | Added as a privacy control while keeping the requested global leaderboard. |
| P-05 | Use a minimum of four fully edited lessons and one aligned interactive activity per section for the first limited beta. | Keeps all three sections useful without publishing draft content. |
| P-06 | Treat Vercel Django/Python support as a deployment experiment until the project-specific proof passes. | Current runtime documentation labels Python beta. |

## Open questions and risks

1. **Signup policy:** Does the beta permit anyone to create an account, or only invited friends? The recovery plan is admin-assisted and will not scale to a broad public user base.
2. **Nickname moderation operations:** Who will review reports, and what response time is reasonable for a small friends beta? The current app accepts reports and has a Django admin review queue, but no support contact or response commitment is set.
3. **Weekly boundary:** Which timezone/week start should define a new score week? Current Django settings use Asia/Kolkata; confirm whether to retain that product behavior.
4. **Support channel:** Which private contact method should be shown for account recovery and reporting? Do not publish a personal address without an intentional choice.
5. **Content minimum:** Confirm whether the proposed four reviewed lessons per section is sufficient for a limited beta, or whether every seeded lesson must be fully authored first.
6. **Age range:** Confirm whether the app is intended for children or only teens/adults before finalizing account fields, privacy notice, and public profiles.
7. **Hosting proof:** Vercel's Django/Python runtime is beta and Vercel Hobby is personal/non-commercial with usage limits. If compatibility or terms fail, revisit the stack/availability expectation without adding paid services.
8. **Database continuity:** Supabase Free has quotas, may pause after inactivity, and does not include automatic backups in the current pricing table. Decide who exports data and how often before real learner progress matters.
9. **Score abuse:** Browser code execution cannot provide a cheat-proof public score. The accepted policy is casual points, basic caps, anomaly review, and no prizes; a competitive mode requires a separate judge design.
10. **Moderation operations:** The app now supports learner hide, limited nickname reports, and a Django admin review queue. Choose a private support contact and a reasonable response process before broad public signup.

## Current provider evidence snapshot

Verified against official provider pages on 2026-11-05. These facts can change; re-check before deployment.

- Vercel Hobby personal/non-commercial terms and usage: [Vercel Hobby plan](https://vercel.com/docs/plans/hobby).
- Vercel Django support and Python runtime beta: [Django support](https://vercel.com/changelog/zero-configuration-django-support), [Python runtime](https://vercel.com/docs/functions/runtimes/python).
- Supabase Free quotas and pause behavior: [pricing](https://supabase.com/pricing), [free Postgres FAQ](https://supabase.com/kb/faqs/platform/free-postgres-for-side-projects), [billing guide](https://supabase.com/docs/guides/platform/billing-on-supabase).
- Pyodide browser execution: [usage docs](https://pyodide.org/en/stable/usage/index.html), [Web Worker docs](https://pyodide.org/en/latest/usage/webworker.html).
