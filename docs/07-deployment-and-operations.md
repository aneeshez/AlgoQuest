# Deployment and operations

## 1. Deployment intent

The first deployment is a personal, non-commercial beta for the owner and friends, with a global leaderboard for registered users. The zero-cost requirement means best-effort availability, not guaranteed uptime. Re-check provider plans and current limits before every deployment decision.

## 2. Local development

The repository README lists Node.js 20+, Python 3.12+, and npm. Start the Vite client in frontend and Django in backend. Apply migrations and seed the curriculum before using the app. Local development defaults to SQLite; deployment uses a PostgreSQL DATABASE_URL. Use separate local environment values and never commit secrets.

## 3. Leading deployment option

Candidate: React/Vite and Django on Vercel Hobby with Supabase PostgreSQL. As checked on 2026-11-05:

- Vercel documents Django support and a Python runtime, but the Python runtime documentation labels it beta. Prove compatibility with this monorepo and the exact session/database flows before relying on it.
- Vercel Hobby is for personal, non-commercial use. It has included usage limits; the deployment can be paused when limits are exceeded. It is not an uptime SLA.
- Supabase Free lists two active projects, 500 MB database size, 5 GB egress, and up to 50,000 monthly active users. Free projects may pause after one week of low activity. Automatic backups are not included on Free.
- A no-custom-domain deployment can use provider subdomains, but browser session, CSRF, CORS, and redirect behavior must be tested on the actual deployed URLs.

Sources checked:

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel Django support announcement](https://vercel.com/changelog/zero-configuration-django-support)
- [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python)
- [Supabase pricing](https://supabase.com/pricing)
- [Supabase free project behavior](https://supabase.com/kb/faqs/platform/free-postgres-for-side-projects)
- [Supabase billing and free-plan quotas](https://supabase.com/docs/guides/platform/billing-on-supabase)

These are a dated snapshot, not a promise. Vercel and Supabase may change prices, quotas, pausing behavior, or terms. Confirm exact limits in the provider dashboards and current docs immediately before deployment. Disable auto-recharge and avoid entering a payment method if the account must remain strictly free.

## 4. Deployment release checklist

### Before first deploy

- Confirm Vercel Hobby personal/non-commercial eligibility for the intended use.
- Create separate development and launch Supabase projects if within the two-project free limit; do not use production data in previews.
- Configure Django environment values: strong DJANGO_SECRET_KEY, DEBUG false, exact ALLOWED_HOSTS, DATABASE_URL, exact CSRF_TRUSTED_ORIGINS, and exact CORS_ALLOWED_ORIGINS if separate origins are required.
- Configure secure cookies, HTTPS/proxy behavior, static assets, host redirects, and error pages.
- Use the Supabase serverless-appropriate connection method, SSL, and bounded pool sizes. Never place database credentials in frontend environment variables.
- Run schema migrations once as a controlled release action. Seed only repeatable, published content. Avoid concurrent migration at function startup.
- Deploy a vertical slice and verify registration, login, CSRF, progress persistence, database pooling, Pyodide assets, and leaderboard query from the real domain.
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

## 5. Data operations and recovery

- Free Supabase does not include automatic backups in the current pricing table. Schedule manual encrypted PostgreSQL exports to a location controlled by the project owner, and test restoring to a disposable database.
- Record export date, schema version, and restore steps. Do not store raw database exports in the public repository or an unencrypted shared folder.
- Before a schema change, export data and review migration reversibility. Test forward migration and restore/rollback against a copy.
- Keep curriculum seeding repeatable and version-controlled. Store authored content in the database or an approved content source; define how edits are reviewed and promoted.
- If a free database pauses or reaches quota, communicate the outage, restore/upgrade only with explicit budget approval, and never silently enable paid usage.
- Define data deletion and export handling before opening registration broadly.

## 6. Monitoring and support

For the small beta, review provider usage, database size, failed logins, API errors, nickname reports, and restore readiness weekly. Use provider dashboards and privacy-minimal logs. Keep an incident note with date, symptoms, affected learners, action taken, and follow-up. Do not promise an SLA.

## 7. Fallback plan

If Vercel Django support fails compatibility, do not assume Netlify can host the Django backend; its documented function workflow is JavaScript/TypeScript and Go. A separate Django host can be considered, but a free Render web service currently sleeps after 15 idle minutes and Render describes free services as non-production. Any fallback must be rechecked against the zero-cost, session, database, and availability requirements before it is selected.

## 8. Production-readiness gate

Do not describe AlgoQuest as production-ready until the release suite passes, security review findings are resolved, restore has been rehearsed, deployment/runtime behavior is verified, all course content is reviewed, account recovery and moderation have owners, privacy/deletion behavior is documented, and the team accepts the actual hosting availability. The current repository is not deployed and has no production secrets configured according to its README.
