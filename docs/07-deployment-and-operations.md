# Deployment and operations

## 1. Deployment intent

The first deployment is a personal, non-commercial beta for the owner and friends, with a global leaderboard for registered users. The zero-cost requirement means best-effort availability, not guaranteed uptime. Re-check provider plans and current limits before every deployment decision.

## 2. Local development

The repository README lists Node.js 20+, Python 3.12+, and npm. Start the Vite client in frontend and Django in backend. Apply migrations and seed the curriculum before using the app. Local development defaults to SQLite; deployment uses a PostgreSQL DATABASE_URL. Use separate local environment values and never commit secrets.

## 3. Selected initial deployment shape

The repository is prepared for a same-origin Vercel Services deployment: React/Vite is the `web` service, Django is the `api` service, and Supabase PostgreSQL is the database. Vercel Services is still in beta; select the Services framework for the Vercel project and confirm account access. The `vercel.json` routes `/api/*` to Django and other paths to the Vite app. As checked on 2026-11-05:

- Vercel Python is generally available and supports Django. Vercel Services can deploy the React and Django directories under one project and domain, but Services are still beta. Hobby is free for personal, non-commercial use; listed limits include 1,000,000 function invocations, 4 active CPU-hours, 360 GB-hours of provisioned memory, and 100 GB fast data transfer. Most exceeded Hobby limits pause the affected feature until the next 30-day window. No uptime SLA is included.
- Supabase Free allows two active projects across the account, 500 MB database per project, 50,000 monthly active users, and separate 5 GB cached and 5 GB uncached egress quotas. Projects with low database activity over seven days may pause; a paused project can be restored for up to one year. Free has no automatic daily database backups; use manual exports and an off-site copy.
- Render Free can run Django and static sites. A free web service sleeps after 15 idle minutes, takes about one minute to wake on a request, has 750 free instance hours per workspace per month, and has ephemeral local storage. Render says free services are for testing/hobby work, not production applications. Render Free Postgres expires after 30 days and has no backups; use Supabase if the app uses Render only for the web process.
- The first deployment can use provider subdomains without a custom domain. Keep the React app and Django API same-origin if possible so session cookies and CSRF work consistently in browsers.

Sources checked:

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel Python generally available](https://vercel.com/changelog/python-on-vercel-is-now-generally-available)
- [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Services (beta)](https://vercel.com/docs/services)
- [Supabase pricing](https://supabase.com/pricing)
- [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Supabase backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase billing and free-plan quotas](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Render free service limits](https://render.com/docs/free)
- [Render Django deployment](https://render.com/docs/deploy-django)

These are a dated snapshot, not a promise. Vercel, Render, and Supabase may change prices, quotas, pausing behavior, or terms. Confirm exact limits in provider dashboards before deployment. Do not add a payment method or enable paid usage if the account must remain strictly free.

## 4. Deployment procedure

1. Create or choose a personal Vercel project connected to this GitHub repository. Set the project framework to **Services**, keep the repository root as the project root, and confirm Vercel Services access. The committed `vercel.json` configures the Vite and Django service roots and same-origin rewrites.
2. Create or choose a Supabase project on the Free plan. Copy the **transaction pooler** URI from Database Settings for the running app and use SSL (`sslmode=require`). Django disables persistent connections and server-side cursors for transaction pooling. Never put a Supabase service-role key in the frontend.
3. Set these Vercel production environment variables before the first deployment:
   - `DJANGO_DEBUG=false`
   - `DJANGO_SECRET_KEY`: a unique randomly generated value of at least 50 characters.
   - `DJANGO_ALLOWED_HOSTS`: exact Vercel production hostname, without scheme.
   - `CSRF_TRUSTED_ORIGINS`: exact deployed origin including `https://`.
   - `DATABASE_URL`: Supabase transaction pooler URI with `sslmode=require`.
   - `CORS_ALLOWED_ORIGINS`: the same exact HTTPS origin; never use `*`.
4. Deploy a preview and verify `/api/health/`, registration, sign-in, sign-out, profile updates, lesson completion, points, leaderboard, Pyodide asset loading, and direct refresh on a nested client route.
5. Before production registration, set the production environment values in a local release shell. Use Supabase's direct or session-pooler connection for the one-time migration (not the transaction pooler) and run `./release.ps1` from `backend/`. This runs deployment checks, applies migrations, and idempotently seeds the curriculum. Do not migrate automatically at serverless function startup or against a preview database.
6. Review provider logs and usage after release. Keep the app limited to the friends beta while account recovery, deletion requests, moderation coverage, backup restore, and code-runner isolation remain informal.

The Vercel Hobby workspace is signed in through the browser, but it has no AlgoQuest project. The local Vercel CLI is not yet authorized, and no Supabase database URL or production secrets are configured in this workspace. `backend/.env.example` documents the required variables but contains placeholders only.

## 5. Deployment release checklist

### Before first deploy

- Confirm Vercel Hobby personal/non-commercial eligibility for the intended use and Vercel Services access for this account. If unavailable, use a deployment shape that preserves same-origin sessions and CSRF.
- Validate the checked-in `vercel.json` using the current CLI and a preview deployment. Do not invite learners until the preview proves login, logout, CSRF, curriculum, progress, and leaderboard behavior.
- Create separate development and launch Supabase projects if within the two-project free limit; do not use production data in previews.
- Configure Django environment values: strong DJANGO_SECRET_KEY, DEBUG false, exact ALLOWED_HOSTS, DATABASE_URL, exact CSRF_TRUSTED_ORIGINS, and exact CORS_ALLOWED_ORIGINS if separate origins are required.
- Configure secure cookies, HTTPS/proxy behavior, static assets, host redirects, and error pages.
- Use the Supabase serverless-appropriate connection method, SSL, and bounded pool sizes. Never place database credentials in frontend environment variables.
- Run schema migrations once as a controlled release action. Seed only repeatable, published content. Avoid concurrent migration at function startup.
- Deploy a vertical slice and verify registration, login, CSRF, progress persistence, database pooling, Pyodide assets, and leaderboard query from the provider subdomain before inviting friends.
- Test service pause/quota messaging and how learners are informed if the free service is temporarily unavailable.

### Environment variable inventory

| Variable | Purpose | Exposure |
| --- | --- | --- |
| DJANGO_SECRET_KEY | Sign sessions and security tokens. | Server secret only. |
| DJANGO_DEBUG | Must be false in deployment. | Server configuration. |
| DJANGO_ALLOWED_HOSTS | Exact backend hostnames. | Server configuration. |
| DATABASE_URL | PostgreSQL/pooler connection string. | Server secret only. |
| CSRF_TRUSTED_ORIGINS | Trusted HTTPS origins for state-changing requests. | Server configuration. |
| CORS_ALLOWED_ORIGINS | Exact frontend origin(s), only if cross-origin requests are needed. | Server configuration. |
| SUPPORT_CONTACT | Private support channel for admin-assisted recovery and reports. | Public text only if intentionally displayed. |

Do not add a Supabase service-role key to the frontend. Django should be the only application component with database credentials.

## 6. Data operations and recovery

- Free Supabase does not include automatic backups in the current pricing table. Schedule manual encrypted PostgreSQL exports to a location controlled by the project owner, and test restoring to a disposable database.
- Record export date, schema version, and restore steps. Do not store raw database exports in the public repository or an unencrypted shared folder.
- Before a schema change, export data and review migration reversibility. Test forward migration and restore/rollback against a copy.
- Keep curriculum seeding repeatable and version-controlled. Store authored content in the database or an approved content source; define how edits are reviewed and promoted.
- If a free database pauses or reaches quota, communicate the outage, restore/upgrade only with explicit budget approval, and never silently enable paid usage.
- Define data deletion and export handling before opening registration broadly.

## 7. Monitoring and support

For the small beta, review provider usage, database size, failed logins, API errors, nickname reports, and restore readiness weekly. Use provider dashboards and privacy-minimal logs. Keep an incident note with date, symptoms, affected learners, action taken, and follow-up. Do not promise an SLA.

## 8. Fallback plan

If the Vercel one-origin proof fails, use the documented Render fallback only for a limited friends beta that accepts cold starts and best-effort availability. Do not split the React and Django sites across unrelated domains until cross-site cookie and browser privacy behavior has been verified. Recheck the zero-cost, session, database, and availability requirements before selecting any alternative.

## 9. Production-readiness gate

Do not describe AlgoQuest as production-ready until the release suite passes, security review findings are resolved, restore has been rehearsed, deployment/runtime behavior is verified, all course content is reviewed, account recovery and moderation have owners, privacy/deletion behavior is documented, and the team accepts the actual hosting availability. The current repository is not deployed and has no production secrets configured according to its README.
