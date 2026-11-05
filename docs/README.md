# AlgoQuest documentation

This package defines the product, learning experience, architecture, security, QA, operations, and launch criteria for AlgoQuest. It records the choices made in the product interview and distinguishes the intended MVP from the existing implementation.

## Start here

1. [Product requirements](01-product-requirements.md)
2. [Learning design and curriculum](02-learning-design.md)
3. [Architecture](03-architecture.md)
4. [Data model and API plan](04-data-model-and-api.md)
5. [Security and privacy](05-security-and-privacy.md)
6. [Testing and QA](06-testing-and-qa.md)
7. [Deployment and operations](07-deployment-and-operations.md)
8. [Milestones and acceptance criteria](08-milestones-and-acceptance.md)
9. [Decision log and open questions](09-decisions-and-open-questions.md)

## Product at a glance

AlgoQuest is an English-language web app for learning data structures and algorithms through clear lessons, visual explanations, Python practice, assignments, and scenario-based games. It supports absolute beginners as well as learners who already know programming. Learners can enter Basics, Medium, or Advanced in any order. The intended curriculum aims for balanced DSA mastery with interview practice.

The chosen direction is a React and JavaScript client, a Django and Python API, Supabase PostgreSQL, username and password accounts, browser-based Python execution, and Vercel Hobby as the leading hosting candidate for a personal, non-commercial launch. The initial budget is zero. The global weekly leaderboard is casual, uses nicknames, and is not a verified measure of skill.

## Existing project status

The workspace already contains a React/Vite frontend and Django API. The repository README reports a working foundation with ten curriculum worlds, three fully authored introductory lessons, eight interactive games, a Monaco editor, and Pyodide in a terminable worker. Read-only inspection of the source shows session-based Django authentication and an SQLite local default with PostgreSQL configurable through DATABASE_URL. The README also reports that achievements, a leaderboard, assignments history, admin content workflows, and full analytics remain incomplete; the seeded lessons beyond the three introductory lessons are drafts. The code currently gates worlds sequentially, which conflicts with the confirmed product decision that every section be available in any order.

This documentation pass did not run tests, security checks, or deployment checks. Treat the status above as a snapshot from the repository README and source review, not as a release sign-off. See the milestones for the gaps between the current foundation and the desired MVP.

## How to use these documents

Build and review against the requirements and acceptance criteria. Update the decision log when a product choice changes. Re-check provider limits and deployment compatibility immediately before deployment; free plans and beta runtimes can change. No provider choice or this documentation package alone establishes production readiness.
