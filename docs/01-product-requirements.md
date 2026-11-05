# AlgoQuest product requirements

**Status:** Product baseline for MVP planning. Open questions are listed in the decision log.

## 1. Vision

Make DSA understandable and rewarding for learners starting from zero, while still giving learners with basic programming knowledge a useful route to deeper skills. Lessons should connect concepts to small examples, visible state changes, practical coding, and memorable game scenarios.

## 2. Audience and outcomes

### Primary learners

- Absolute beginners who may need a short Python and problem-solving foundation before DSA.
- Learners who already know programming and want structured DSA practice.
- The first deployment is intended for the owner and friends; the product direction includes a leaderboard visible to all registered users.

### Learner outcomes

By completing the core curriculum, a learner should be able to explain common data structures and algorithms, choose an approach for a problem, implement it in readable Python, trace it on examples, estimate time and auxiliary-space complexity, and practice common interview patterns.

The course must not promise that finishing a short course makes a learner a professional. Completion is evidence of course activity; mastery requires repeated independent problem solving.

## 3. Product principles

1. Teach one idea at a time, define new terms, and show a concrete example before using abstractions.
2. Give useful feedback that explains why an answer works or fails and suggests a next step.
3. Treat games as practice for a named learning objective, not as decoration.
4. Let learners choose a section without a forced sequence. Provide optional prerequisite guidance and a recommended route.
5. Reward consistent learning and problem-solving attempts. Avoid making speed the only measure of success.
6. Keep account email and other private data out of public profiles and the leaderboard.
7. Keep the first launch free to operate, while clearly documenting availability and abuse limitations.

## 4. MVP scope

### In scope

- Responsive web experience with English interface and lesson content.
- Public landing page and course discovery.
- Three accessible sections: Basics, Medium, Advanced; learners may enter any section at any time.
- Guided tutorials with plain-language explanation, analogy, worked example, dry run, Python sample, knowledge check, and assignment.
- Browser-based Python editor and execution using Pyodide in a Web Worker, with execution and output limits.
- Interactive mini-games, story quests, and scenario-based challenges aligned to curriculum objectives.
- Username and password registration and sign-in; email collected for account records, but no automated reset email in the no-domain MVP.
- Learner progress, bookmarks, completion, points, levels, and badges.
- Global weekly leaderboard for registered users, using a nickname and weekly points. The competition is casual and has no prizes.
- Small admin role to manage curriculum and perform a verified, admin-assisted password reset.
- Clear privacy notice, support instructions, and account deletion request process.

### Not in the initial scope

- Paid services, custom domain, custom SMTP, or guaranteed uptime.
- A secure server-side code judge or hidden test suite.
- Cash prizes, high-stakes rankings, multiplayer real-time play, or direct messaging.
- Multiple learner languages or multiple exercise languages.
- Claims of professional qualification or guaranteed interview success.

## 5. User roles

| Role | Main capabilities |
| --- | --- |
| Visitor | View product information and published curriculum previews; register or sign in. |
| Learner | Study any section, run Python locally in the browser, complete activities, save progress, earn rewards, and view the global weekly leaderboard. |
| Admin | Review accounts and content, publish or unpublish lessons, investigate reports, and perform an identity-checked password reset without seeing the old password. |

The registration policy is not yet confirmed. The working assumption is self-registration, with leaderboard visibility limited to registered learners.

## 6. Core user journeys

### A. New learner starts at an appropriate level

1. Visitor lands on the site and sees who it is for, what is taught, and that Python runs in the browser.
2. Visitor browses the three sections and can open any one.
3. Learner creates an account with a unique username, email, password, and separate nickname.
4. Learner chooses a section or accepts a recommended first lesson.
5. Learner reads a short lesson, traces an example, answers a check, and optionally runs code.
6. The app gives specific feedback and records progress and eligible points.

### B. Learner practices through a game or assignment

1. Learner chooses a game, scenario, or assignment linked to a lesson objective.
2. The app explains the goal, constraints, and success criteria.
3. Learner tries, receives immediate feedback, and can retry with a hint.
4. The app records activity and reward event subject to per-activity and weekly caps.
5. Learner can review the explanation and continue to a related lesson.

### C. Learner checks progress and leaderboard

1. Learner sees personal progress, earned badges, total learning points, and weekly points.
2. Learner opens the global leaderboard and sees nicknames, badges, and current-week scores for registered learners.
3. The app states that scores are casual and browser-checked code results can be manipulated.
4. Learner can change their nickname or hide their entry; signed-in learners can report another nickname for staff review.

### D. Learner needs password help

1. Learner contacts the admin through a support channel shown in the app.
2. Admin verifies the learner using an agreed method that does not rely on the forgotten password.
3. Admin initiates a reset so the learner sets a new password; no existing password is displayed or shared.
4. The system invalidates prior sessions where possible and records the administrative action.

This process is appropriate only for a small private beta. It is a scalability and availability risk if registration becomes open to a broad public audience.

## 7. Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Show the three course sections and allow direct entry into each, without prerequisite locks. | Must |
| FR-02 | Explain concepts with plain language, examples, step traces, Python code, checks, and assignments. | Must |
| FR-03 | Provide accessible lessons and scenario games that map to explicit learning objectives. | Must |
| FR-04 | Run learner Python code in a browser worker with wall-time, memory/output, and worker-termination safeguards. | Must |
| FR-05 | Provide unique username, email, password, and nickname fields; use Django password handling and sessions. | Must |
| FR-06 | Persist learner progress and prevent duplicate reward grants for the same activity. | Must |
| FR-07 | Award points through documented activity rules, with server-side caps and audit events where feasible. | Must |
| FR-08 | Show the global current-week leaderboard using nickname, weekly score, and earned badges; never expose email. | Must |
| FR-09 | Reset weekly leaderboard score by calculating a week window; preserve lifetime progress and badges. | Must; reset details proposed |
| FR-10 | Provide learner-facing account data and support guidance, and a documented account deletion path. | Must |
| FR-11 | Allow an admin to create, edit, review, publish, and unpublish curriculum content. | Must before broad public launch |
| FR-12 | Give beginner-friendly feedback, optional hints, and retry paths rather than only a pass/fail signal. | Must |
| FR-13 | Provide basic nickname/content moderation and a way to report inappropriate leaderboard display names. | Must before broad public launch |
| FR-14 | Provide a weekly leaderboard privacy control and explain what information is public. | Must |

## 8. Non-functional requirements

- **Cost:** no required paid service for the MVP; disable auto-recharge and paid upgrades. Treat free-tier suspension or quota exhaustion as service interruption.
- **Availability:** best-effort personal beta. Do not promise an uptime percentage on free plans. Define an always-available production objective only after choosing funded hosting and backup plans.
- **Security:** HTTPS in deployment, secure session cookies, CSRF protection, server-side validation, hashed passwords, rate limits, secret management, and least-privilege admin access.
- **Privacy:** collect minimum personal data. Public leaderboard displays nickname, weekly points, and badges only. Email is private.
- **Accessibility:** keyboard operation, visible focus, semantic headings/controls, readable contrast, reduced-motion support, and understandable error messages are release requirements.
- **Performance:** ordinary lesson/API views should feel responsive on a typical broadband or mobile connection. Pyodide cold load must show progress and must not freeze the page.
- **Reliability:** migrations are repeatable, reward events are idempotent, and failures preserve saved learner progress.
- **Maintainability:** keep course data editable without requiring frontend rebuilds; document API contracts and provider setup.
- **Compatibility:** support current evergreen desktop and mobile browsers; record tested versions at release.

## 9. MVP acceptance summary

The MVP is acceptable only when each section is available directly, the promised minimum content is complete and reviewed, accounts/progress persist in PostgreSQL, Pyodide is constrained and does not block the UI, weekly scores and badges behave as specified, public privacy boundaries are enforced, and the deployment and rollback procedures have been exercised. See the detailed milestone checklist.
