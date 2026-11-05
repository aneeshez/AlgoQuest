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

The workspace contains a React/Vite frontend and Django API, ten curriculum worlds, eight interactive mini-games, a saved three-step story quest, a Monaco editor, and Pyodide in a terminable worker. Thirty-four lessons now have authored teaching material: all 14 Basics lessons, all 16 Medium lessons, and four in Advanced; the other eight seeded lessons remain drafts. Session-based Django authentication is in place; SQLite is the local default, with PostgreSQL configurable through `DATABASE_URL`. The learning path groups worlds as Basics (1–3), Medium (4–7), and Advanced (8–10), and section/lesson access is open in any order. A model migration backfills section membership for existing curriculum records. Registration collects a public nickname that learners can update; lesson completion awards XP, advances a daily streak, and can award three milestone badges; a public weekly leaderboard uses nickname, weekly XP, and earned badge names. Successful visible code checks award 10 XP per task per day, with a 40 XP daily cap; completing the story quest awards 15 XP once. Leaderboard opt-out/reporting, additional story quests, daily missions, assignment history, admin content workflows, and full analytics remain unfinished.

The implementation milestones so far passed the current Django suite (18 tests), Django system and migration checks, the frontend suite (5 tests), and the Vite production build. These checks cover the current code only; they do not replace browser end-to-end, security, accessibility, database-hosting, or deployment verification. Treat the project as under development, not as a production-ready release. See the milestones for remaining work.

## How to use these documents

Build and review against the requirements and acceptance criteria. Update the decision log when a product choice changes. Re-check provider limits and deployment compatibility immediately before deployment; free plans and beta runtimes can change. No provider choice or this documentation package alone establishes production readiness.
