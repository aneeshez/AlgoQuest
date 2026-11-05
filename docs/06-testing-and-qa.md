# Testing and quality assurance strategy

## 1. Quality policy

Testing is required before a production claim. This documentation pass did not execute tests or confirm deployment behavior. The repository README reports existing frontend tests/build and Django checks, but those reports are not a substitute for running the release suite on the current revision.

## 2. Test layers

| Layer | What to cover | Release evidence |
| --- | --- | --- |
| Content/editorial review | Accuracy, clear language, solution correctness, objective alignment, complexity, hints, accessibility. | Signed content checklist for every published lesson and game. |
| Unit tests | Scoring rules, weekly window boundaries, badge criteria, username/nickname normalization, curriculum ordering, algorithms, level thresholds. | Deterministic test report. |
| API tests | Registration/login/logout, CSRF, permissions, progress ownership, reward idempotency, answer-key privacy, leaderboard aggregation, rate limits. | Passing backend suite with isolated test database. |
| Frontend component tests | Lesson state, feedback, navigation, nickname forms, leaderboard, errors, empty/loading states. | Passing frontend suite. |
| Browser end-to-end | New learner journey, direct section access, code run/timeout, completion, badge, weekly leaderboard, admin review. | Recorded run on supported browsers. |
| Security tests | CSRF, CORS, brute-force limits, object access, secret exposure, output escaping, nickname abuse, score tampering. | Security checklist and issue disposition. |
| Accessibility checks | Keyboard-only, focus order, screen reader names, contrast, reduced motion, zoom/reflow, error announcements. | Manual checklist plus automated scan report; manual review remains required. |
| Performance/compatibility | Pyodide startup, mobile memory, slow network, concurrent API use, Vercel function and Supabase connection limits. | Measurements from target deployment, not only local machine. |
| Operations rehearsal | Migration, seed, backup/export, restore, rollback, quota/suspension notice, account support. | Rehearsal notes with recovery times and owner. |

## 3. High-value scenarios

### Accounts and privacy

- Reject duplicate/case-variant usernames and duplicate emails.
- Verify username/password registration and login, logout, CSRF failure, and rate limiting.
- Confirm password hashes only; reject weak passwords; generic invalid-login response.
- Confirm nickname and weekly score are public only as documented; email, user ID, and private activity remain hidden.
- Confirm non-admin cannot initiate reset, publish content, or moderate a nickname.

### Learning and progress

- Anonymous users can browse all three sections.
- Every section opens directly; no prior section completion is required.
- Lesson completion is idempotent and awards a reward at most once.
- Bookmark/check responses persist only for the current account.
- Correct answer and explanation behavior works without exposing the answer key in lesson JSON.
- User data stays isolated across accounts.

### Games, rewards, leaderboard

- Every game links to its stated learning objective and gives an explanatory debrief.
- Duplicate events do not duplicate rewards; caps and throttles work.
- Weekly score includes/excludes events exactly at the configured boundary and preserves lifetime points/badges.
- Ties have a stable, documented ordering; empty leaderboard has useful guidance.
- Score tampering is recorded/limited and the UI does not imply cheat-proof results.
- Nickname report, moderation, and opt-out behavior match the final decision.

### Python editor

- Valid code produces expected output and understandable errors.
- Infinite loop is terminated; worker can be restarted; output is truncated safely.
- Huge input, unsupported package, syntax error, reload, and navigation do not break the lesson or expose app secrets.
- Running code never awards a score solely on a client-supplied numeric point amount.
- Verify keyboard use and mobile layout for the editor and game controls.

### Deployment and data

- Fresh PostgreSQL database can migrate and seed without duplicate content.
- Registration, sessions, CSRF, static assets, and API calls work from the deployed Vercel origin.
- Verify pooled connections, DB timeouts, serverless reuse, and free quota behavior.
- Test restore/rollback using a disposable database before relying on production data.

## 4. Definition of done for a change

Every feature change must include acceptance criteria, implementation, tests at the appropriate layers, content/accessibility review where relevant, migration notes if schema changes, and user-visible error/empty states. Do not mark a milestone complete because it compiles; use the milestone acceptance list and attach evidence.
