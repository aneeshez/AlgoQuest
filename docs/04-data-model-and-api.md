# Data model and API plan

## 1. Data principles

- PostgreSQL is the durable source of truth in deployment; SQLite is for local development only.
- Use Django's built-in user and password hashing/session mechanisms unless a reviewed requirement requires a custom user model.
- Keep identity, profile, curriculum, progress, reward events, badges, and leaderboard queries separate.
- Store timestamps in UTC. Convert to the configured product timezone when calculating weekly windows and presenting dates.
- Use unique constraints for one progress row per learner/lesson and one reward event per learner/activity.
- Never return email, password hashes, staff flags, private progress, or answer keys from public profile/leaderboard endpoints.

## 2. Proposed entities

| Entity | Key fields | Notes |
| --- | --- | --- |
| User | id, username, email, password hash, is_active, is_staff, created_at | Django auth user. Username and email are unique after case normalization. Email is private. |
| UserProfile | user_id, nickname, total_points, longest_streak, current_streak, last_activity_date, created_at | Nickname is collected at registration and is public on the leaderboard. A visibility opt-out is still a product decision. |
| LearningSection | id, key, title, description, display_order | Basics, Medium, Advanced. All sections are accessible at launch. |
| LearningModule | id, section, title, slug, summary, difficulty, is_published | A world/topic grouping. `section` is Basics, Medium, or Advanced. |
| Lesson | id, module_id, title, slug, order, duration, objective, concept, analogy, example, steps, Python sample, check, assignment, XP value, status | Answer keys and private editorial notes are never serialized to anonymous callers. |
| LessonProgress | user_id, lesson_id, completion, bookmark, check attempts, timestamps | Unique on user and lesson. Completion is idempotent. |
| ActivityAttempt | user_id, activity_id, kind, result summary, attempt_count, created_at | Keep only what is useful for feedback and abuse review; do not store full code by default. |
| PointEvent | user_id, source_type, source_id, points, reason, created_at, idempotency_key | Append-only. Enforce one base award per activity. Weekly points are a query over events, not a destructive reset. |
| Badge | id, slug, name, description, lesson_threshold | Three initial lesson-completion milestones; criteria should be versioned as the catalog grows. |
| UserBadge | user_id, badge_id, earned_at | Unique on user and badge. |
| Scenario/Game | id, slug, objective, instructions, rules, reward, status | Store content/configuration; interactive mechanics remain frontend code where appropriate. |
| AdminActionLog | actor_id, target_user_id, action, reason, created_at | Record password-reset support, content publishing, and leaderboard moderation. Avoid secrets and old password data. |
| LeaderboardReport | reporter_id, nickname snapshot, reason, status, reviewed_by, timestamps | Needed before broad public exposure; rate-limit submissions. |

### Weekly score calculation

Weekly score is the sum of eligible PointEvent values in the active weekly window. Do not reset total lifetime points, streak history, or badges. The week boundary is not yet confirmed; proposed default is Monday 00:00 in the product timezone. A database query should define the same boundary for all users and the UI. Add indexes on PointEvent created_at/user_id and test boundary cases.

## 3. API conventions

- JSON request and response bodies; use stable, documented field names.
- Session cookies for authentication; credentialed requests must include a valid CSRF token for state changes.
- Use conventional status codes and consistent error shape, for example {detail: "..."}; do not return stack traces.
- Validate ownership and permissions on the server for every learner-specific record.
- Paginate leaderboard and history endpoints; allow bounded page size and stable tie-breaking.
- Version the API before external clients depend on it.

## 4. Current API surface observed in source

| Method/path | Current purpose |
| --- | --- |
| GET /api/health/ | Service health response. |
| GET /api/auth/csrf/ | Ensure CSRF cookie and return CSRF token. |
| GET /api/auth/me/ | Current session/account summary. |
| POST /api/auth/register/ | Create account using username, public nickname, email, and password. |
| PATCH /api/profile/ | Update the authenticated learner's public nickname; CSRF protected. |
| POST /api/auth/login/ | Sign in using username/password. |
| POST /api/auth/logout/ | End session. |
| GET /api/modules/ | List published modules and lesson summaries. |
| GET /api/lessons/{slug}/ | Fetch a published lesson. Any section can be opened without completing another section first. |
| POST /api/progress/lessons/{id}/ | Complete, bookmark, unbookmark, or check a lesson. |
| GET /api/leaderboard/ | Public current-week scores using nickname and earned badge names; excludes email and login username. The current implementation returns the first 100 scores. |

This is a source snapshot, not a guarantee that deployed routes have been verified.

## 5. Target API additions

| Method/path | Purpose and access |
| --- | --- |
| GET /api/sections/ | List Basics, Medium, Advanced and published module summaries; public read. |
| GET /api/modules/{slug}/ | Module details and lesson sequence; public read. |
| PATCH /api/profile/ | Change own nickname and leaderboard visibility; authenticated, CSRF protected. |
| GET /api/progress/summary/ | Own completion, lifetime points, badges, and recent activity; authenticated. |
| PATCH /api/profile/ | Change own nickname; add leaderboard visibility only after the opt-out decision is confirmed. |
| GET /api/badges/ and GET /api/profile/{nickname}/badges/ | Badge catalog and public badge subset; publish only approved fields. |
| POST /api/activities/{slug}/attempts/ | Record a bounded activity attempt; authenticated and rate-limited. |
| POST /api/reports/leaderboard/ | Report a nickname; authenticated, throttled, no free-form public comments by default. |
| Admin site / restricted admin API | Manage curriculum, review reports, and initiate admin-assisted account recovery. Never expose admin actions to ordinary learners. |

Do not create a code-execution endpoint in the MVP. The browser runner must not send learner source code to Django unless the learner explicitly opts into a future submission-history feature.

## 6. API security and compatibility checks

- All progress and point changes require an authenticated session and CSRF validation.
- Server computes reward eligibility and points; client-supplied point amounts are ignored.
- The client may submit a completion event for a browser-checked code task, but the server cannot prove that the code passed. Apply the documented casual-score policy and caps.
- Never include answer keys in lesson payloads. Validate check attempts server-side and rate-limit repeated guessing.
- Keep nickname normalization, uniqueness, length, allowed characters, and moderation policy consistent between serializer and database.
- Test responses for anonymous users, own account, another learner's data, and admin-only actions.
