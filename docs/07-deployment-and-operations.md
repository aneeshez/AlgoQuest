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

1. The personal Vercel project `aneesh23/algoquest` uses the **Services** framework and repository root. The committed `vercel.json` configures the Vite and Django service roots and same-origin rewrites.
2. The Supabase project `qozaozkyeqeelhpbxiui` stores production data. The running app uses the **transaction pooler** URI with SSL (`sslmode=require`). Django disables persistent connections and server-side cursors for transaction pooling. Never put a Supabase service-role key in the frontend.
3. The following Vercel production environment variables are configured:
   - `DJANGO_DEBUG=false`
   - `DJANGO_SECRET_KEY`: a unique randomly generated value of at least 50 characters.
   - `DJANGO_ALLOWED_HOSTS`: exact Vercel production hostname, without scheme. Django also adds Vercel's runtime `VERCEL_URL` hostname so service rewrites pass Django host validation.
   - `CSRF_TRUSTED_ORIGINS`: exact deployed origin including `https://`.
   - `DATABASE_URL`: Supabase transaction pooler URI with `sslmode=require`.
   - `CORS_ALLOWED_ORIGINS`: the same exact HTTPS origin; never use `*`.
4. The first production release is live at [https://algoquest-beta.vercel.app](https://algoquest-beta.vercel.app). Public site and API health checks return 200; the curriculum endpoint returns 10 modules and 42 lessons, and the weekly leaderboard endpoint returns 200.
5. Production migrations were applied to Supabase and the repeatable curriculum seed was verified: 28 migration records, 10 modules, and 42 lessons. Migrations are controlled release actions; do not run them automatically at serverless function startup or against a preview database.
6. Continue the friends beta and monitor provider logs and usage. Account recovery, deletion requests, moderation coverage, backup restore, editorial review, and code-runner isolation remain informal or incomplete.

## 5. Deployment release checklist

### Release verification

- Confirm current Vercel Hobby eligibility and usage limits for this personal, non-commercial friends beta.
- Verify registration, login, logout, CSRF, progress persistence, points, badges, database pooling, Pyodide assets, and leaderboard behavior from the production domain before inviting friends.
- Keep preview deployments isolated from production data.
- Use controlled migrations and repeatable published curriculum seeding.
- Recheck Supabase pause/quota behavior and the recovery plan if the free service is temporarily unavailable.

### Environment variable inventory

| Variable | Purpose | Exposure |
| --- | --- | --- |
| DJANGO_SECRET_KEY | Sign sessions and security tokens. | Server secret only. |
| DJANGO_DEBUG | Must be false in deployment. | Server configuration. |
| DJANGO_ALLOWED_HOSTS | Exact production host; Vercel's generated runtime hostname is added from `VERCEL_URL`. | Server configuration. |
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
