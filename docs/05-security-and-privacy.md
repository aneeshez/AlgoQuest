# Security and privacy requirements

## 1. Security posture

The product is an educational app with public accounts and a global leaderboard. A free deployment and browser code runner do not provide a security or availability guarantee. Security controls must be implemented and verified before public registration.

## 2. Account and session security

- Use Django's authentication helpers and password hashers; never store or log raw passwords.
- Apply strong password validation, generic sign-in errors, rate limiting, and protection against brute force and username enumeration.
- Use HTTPS in deployment, HttpOnly and Secure session cookies, appropriate SameSite settings, CSRF protection, and logout/session invalidation.
- If frontend and API are cross-origin, allow only the exact deployed origin and test credentialed cookies and CSRF end-to-end. Avoid wildcard CORS.
- Keep the email private. It is collected with account registration but is not displayed in public APIs.
- The MVP has no automated email reset. Admin-assisted recovery requires identity verification, an auditable reset action, forced change to a new password, and invalidation of previous sessions. Never disclose or set a shared reusable password.
- This recovery model is suitable only for a small group. Add a reliable email service or another self-service mechanism before broad public signup.

## 3. Public nickname and leaderboard privacy

- Use a separate nickname; do not publish username or email by default.
- Public leaderboard fields are limited to nickname, current-week points, and selected earned badges.
- Validate nickname length and characters. Nicknames can be reported by signed-in learners; reports are restricted to the admin site, where staff can change status and hide a learner by disabling leaderboard visibility.
- Leaderboard visibility defaults on to match the selected global leaderboard, and each learner can turn it off from the leaderboard page. Hidden learners are excluded from public scores and badge lists.
- Report requests require sign-in, use a random UUID reference instead of exposing an account ID, allow one report per target per reporter, and are limited to five reports per reporter per day. Review abuse controls before broad public signup.
- Provide a data export/deletion request path and document what deletion removes. Preserve only data required for security or legally required operations, with a stated retention period.
- Minimize analytics and avoid third-party trackers in the no-cost MVP unless explicitly justified and disclosed.

## 4. Browser Python execution

Pyodide runs code in the user's browser. A Web Worker and timeout protect UI responsiveness; they do not make learner code trustworthy or prove a score. Requirements:

- Keep execution in a dedicated worker and terminate it on time limit, cancellation, navigation, or malformed output.
- Bound execution time, captured output, input size, and concurrent work. Show a loading state for runtime startup.
- Do not expose session tokens, privileged API keys, admin interfaces, or secret test data to the code runner.
- Treat code output and editor content as untrusted text; escape rendered output and never inject it as HTML.
- Review whether the runner can reach authenticated app APIs or external network endpoints. Prefer an isolated origin/context with no application credentials; restrict privileged communication to a narrow message protocol.
- Test worker termination, infinite loops, huge output, malformed code, browser refresh, and mobile memory pressure.
- Do not call worker isolation a secure server sandbox. The learner controls their own browser and can alter client-side scoring.

## 5. Leaderboard integrity and abuse

The user chose a casual public leaderboard that can award points for browser code tasks. State this clearly in the interface. Use idempotency keys, per-activity reward limits, weekly caps, request throttles, and audit logs. Detect impossible award rates for admin review. Do not use scores for prizes, access control, hiring decisions, or certification. A future competitive mode needs isolated server-side code evaluation or tasks whose result is verifiable on the server.

## 6. API and infrastructure controls

- Validate types, lengths, formats, ownership, and allowed actions at the server boundary.
- Use database constraints and transactions for progress and reward consistency.
- Require staff-only permissions for content publishing, account support, and nickname moderation.
- Keep Django secret key, Supabase database credentials, and any email credentials in deployment secret storage. Never put server secrets in Vite client environment variables or source control.
- Use the least-privileged database credential available; rotate secrets after any exposure.
- Enforce SSL to PostgreSQL and select a serverless-compatible connection pooler with bounded connections.
- Avoid logging password input, CSRF/session cookies, full email contents, or submitted code. Redact personal data and set log retention.
- Add a shared production rate-limit store or enforce limits at a trusted edge. Django's default local-memory cache is process-local and does not coordinate across serverless instances.
- Set DEBUG off, exact allowed hosts/origins, secure cookie flags, and correct proxy HTTPS settings before deployment.

## 7. Security review and release blockers

Before public access, review account flows, CSRF/CORS, database permissions, leaderboard privacy, nickname moderation, admin access, code-runner isolation, rate limits, dependency vulnerabilities, deletion behavior, and secret handling. Resolve public signup versus admin-assisted recovery. Record findings and fixes; documentation alone is not evidence that these controls are implemented.
