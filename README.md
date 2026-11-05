# AlgoQuest

An interactive DSA learning platform for beginners. The repository is organized as a React/Vite client and a Django REST API.

## Product and technical documentation

The product requirements, curriculum design, architecture, data model/API plan, security and privacy requirements, QA strategy, deployment operations, milestones, decisions, and open questions are documented in the [AlgoQuest documentation package](docs/README.md).

## Current status

Foundation plus a working learning and practice MVP: responsive marketing landing page, learner dashboard with backend-backed XP and curriculum completion, ten API-backed curriculum worlds grouped into open Basics/Medium/Advanced sections, lesson bookmarks/checks/completion, idempotent lesson XP, daily activity streaks, three lesson milestone badges, a nickname-based weekly leaderboard, eight interactive mini-games, a saved three-step story quest, and a Monaco coding arena with Pyodide in a terminable browser worker. Thirty-four lessons have authored teaching material (all Basics and Medium lessons and four Advanced lessons); the remaining eight seed entries need editorial expansion. Logged-in learners can earn 10 casual XP per coding task per day, capped at 40 daily, and 15 XP once for completing the story quest; coding rewards rely on visible browser checks and are not cheat-proof. Hidden judge tests are not connected. Leaderboard opt-out/reporting, more story quests, daily missions, assignment history, full analytics, and admin content workflows remain to be implemented. This is not a deployed service and has no production secrets configured.

## Run locally

Requirements: Node.js 20+, Python 3.12+, and npm.

```powershell
cd frontend
npm install
npm run dev
```

In a second terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_curriculum
python manage.py runserver
```

The web client runs at `http://localhost:5173`; API health is at `http://127.0.0.1:8000/api/health/`.

To verify the current implementation:

```powershell
cd frontend
npm test
npm run build
```

```powershell
cd backend
python manage.py test
python manage.py check
```

Set `DATABASE_URL` to a PostgreSQL connection string to use PostgreSQL. Set a strong `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` before deployment.

## Architecture

- `frontend/src/app`: application shell and page routing
- `frontend/src/components`: shared UI building blocks (expanding in upcoming phases)
- `frontend/src/features`: feature modules (learning, games, coding, profile)
- `backend/apps`: Django domains for accounts, curriculum, progress, and gamification
- `backend/config`: environment-aware settings, API routing, and server entry points
- `backend/apps/curriculum/management/commands/seed_curriculum.py`: repeatable ten-world curriculum seed data

Browser code execution runs in a Pyodide Web Worker with a 2.5 second execution timeout, a 30 second runtime-load timeout, and bounded captured output. The Django API never executes learner code. Current checks are visible examples; a future secure judge can add hidden tests in a separate sandbox service.

## Roadmap

1. Foundation, responsive shell, and landing page (initial slice complete)
2. Session authentication and learner profile/XP persistence (initial slice complete; streak accounting remains)
3. Ten-world roadmap and tutorial engine (initial slice complete; expand lesson quality and assessments)
4. Eight interactive mini-games (MVP interactions complete; progression persistence remains)
5. Coding arena and Pyodide worker (visible examples complete; submission history and secure hidden judge remain)
6. XP, streaks, achievements, daily missions, and leaderboards (lesson XP, streak advancement, starter badges, and weekly leaderboard complete; broader gamification remains)
7. Admin content tools and learner analytics (remaining)
8. Responsive/security review, automated checks, and deployment documentation (automated local checks complete; production review and deployment remain)
