# Architecture and technical direction

## 1. Confirmed direction

| Concern | Decision | Benefit | Trade-off / complexity |
| --- | --- | --- | --- |
| Browser UI | React with JavaScript | Broad ecosystem and direct fit for an interactive web UI. | React state, routing, and API behavior need clear conventions. |
| Server | Python with Django and Django REST Framework | Python matches the learner language and Django provides authentication, admin, ORM, and security tools. | Separate API and client integration; verify routing, sessions, and database connections in the selected hosting shape. |
| Database | Supabase PostgreSQL | Managed PostgreSQL with a free tier and standard Django driver support. | Free projects can pause; quotas and connection limits apply. Supabase is the database here, not the selected authentication system. |
| Authentication | Django username/password sessions | Directly supports the requested username sign-in and keeps authentication in one server. | Cookie, CSRF, CORS, and account recovery need careful configuration. |
| Python execution | Pyodide in a browser Web Worker | No code-execution server cost; UI remains responsive when worker and timeout controls are used. | Browser support/startup size and platform limits; result checks are not trusted for competition-grade scores. |
| Hosting | Vercel Hobby is the leading candidate for personal, non-commercial use; Render Free is a fallback | Vercel Python is generally available and recognizes Django; Vercel Services can route a frontend and backend on one domain. | Vercel Services remain beta. Render Free has cold starts and is explicitly not for production applications. Neither free option provides a production availability guarantee. |
| Budget | $0 required for initial MVP | Fits the stated constraint. | Free tiers can pause, cap usage, or change; no dependable production SLA is assumed. |

## 2. Target system shape

Preferred deployment shape, subject to a deployment compatibility proof:

Learner browser → Vercel HTTPS site → React SPA and Django API routes → Supabase PostgreSQL

The React client handles views, animation, editor interactions, and local Python runtime. Django owns accounts, permissions, published curriculum, progress, badges, reward events, and leaderboard queries. PostgreSQL is the durable source of truth. Learner Python code and local test execution stay in the browser and are not sent to Django by default.

Use a same-origin deployment or same-origin API proxy where possible. This simplifies session cookies and CSRF. If the client and API use separate origins, explicitly configure allowed origins, credentialed requests, CSRF trusted origins, cookie SameSite/Secure settings, and production browser tests. Never use wildcard CORS with credentials.

## 3. Current repository shape

- Frontend: React 19 and Vite in frontend; Monaco editor, Pyodide, and a worker are present.
- Backend: Django/DRF in backend; current Django apps cover accounts, curriculum, progress, and gamification.
- Local development: frontend Vite dev server; backend Django development server; SQLite default.
- PostgreSQL: configured through DATABASE_URL and psycopg.
- Current endpoints include health, CSRF, me, register/login/logout, modules, lesson detail, and lesson progress.

The repository README reports that the current deployment is not production configured. The target architecture below includes requirements that are still missing and should not be read as implemented.

## 4. Hosting compatibility gate

As of 2026-11-05, Vercel's Python runtime is generally available and recognizes Django. Its Vercel Services feature can route a JavaScript frontend and Python backend on one project/domain, but Services are still beta on all plans. Before selecting this for the friends beta, build and verify a minimal vertical slice:

1. Vercel builds the existing frontend and Django monorepo as expected.
2. Django URL routing, sessions, CSRF, migrations, and static assets work in the deployed shape.
3. Django can connect to Supabase PostgreSQL through the selected pooler with SSL and bounded connections.
4. Login, logout, lesson progress, and leaderboard queries survive separate function invocations.
5. Runtime/build limits and Vercel Hobby terms still fit the use case.

If the Vercel multi-service path is unavailable or unstable, Render Free can host a single Django web service that serves the built React files from the same origin, with Supabase as the durable database. Render spins a free web service down after 15 minutes idle; its next request takes about a minute to wake it. Render explicitly says not to use its Free instances for production applications. Do not silently introduce a paid service or use Render's 30-day free Postgres database for learner data.

## 5. Serverless database behavior

Use Supabase's PostgreSQL connection string/pooler suitable for the chosen runtime. For serverless requests, Supabase recommends its shared transaction pooler; keep application connection counts low, turn off prepared statements where unsupported, require SSL, avoid long-lived stale connections, and test concurrent requests. For a persistent Render web process, confirm IPv4/IPv6 reachability and choose the matching shared pooler mode. Run migrations as a controlled release step, not concurrently on every function startup.

Do not depend on local files for durable state. Serverless local storage is temporary. User content, progress, scores, and sessions must live in PostgreSQL or another explicitly approved persistent store. Static assets can be deployed with the frontend.

## 6. Trust boundaries and score flow

The browser is an untrusted client. Django must validate identity, ownership, action shape, reward eligibility, and rate limits. Store reward events server-side with uniqueness constraints. The browser Pyodide result is still forgeable; the accepted MVP treats the public weekly leaderboard as casual. Do not add prizes or use rank for access decisions. A future verified competition requires a server-side isolated judge or server-verifiable task design.

## 7. Configuration principles

- Use environment variables for secret key, database URL, allowed hosts, origins, and email/support settings.
- Keep Vercel and Supabase secret keys out of React build variables. The browser needs no Supabase service role key because Django is the data API.
- Have separate development and deployment environments and separate database projects where practical.
- Pin and review dependency versions; upgrade with migration and regression review.
- Log request IDs and operational errors without passwords, session IDs, email contents, or learner code.
