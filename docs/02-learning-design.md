# Learning design and curriculum

## 1. Learning approach

AlgoQuest teaches DSA through short explanations followed by visible examples, retrieval practice, code, and reflection. The course assumes Python is the learner coding language, but the first lessons also explain basic programming ideas for learners who are new to coding.

### Lesson pattern

Every authored lesson should include:

1. A specific outcome written as “After this, you can…”.
2. A plain-language explanation with new terms defined.
3. An everyday analogy, followed by a note about where the analogy stops being accurate.
4. A tiny Python example with meaningful names and comments.
5. A step-by-step trace showing how values or pointers change.
6. A visual or interactive demonstration when it makes state easier to see.
7. A one-question understanding check with explanation for every answer.
8. A small assignment with sample input/output and a hint ladder.
9. A reflection prompt asking learners to explain why the approach works and its time/space cost.
10. A related game or scenario when one strengthens the same objective.

Keep one new idea per lesson. Use worked examples before asking learners to solve a blank-page problem. Hints should be optional, progressively specific, and never shame a learner for using them.

## 2. Course structure

### Starter content coverage

The seed data currently provides twelve authored starter lessons: Variables and values, Loops and repetition, Big O notation, and Conditions and decisions in Basics; Dictionaries as lookup tables, Set membership, Frequency counting, and Hash maps and collisions in Medium; Binary tree anatomy, Depth-first traversal, Graph representations, and Breadth-first search in Advanced. The remaining seed entries are drafts and must not be represented as fully edited lessons. Automated checks confirm that these twelve Python examples compile and that their checks have four options with valid answer indices; editorial review against the full lesson pattern above remains outstanding.

The top-level navigation contains Basics, Medium, and Advanced. Sections are all open from the start; learners can follow the recommended route or choose a topic. Show prerequisite suggestions without locking content. Add a short placement/self-check to recommend a starting point, not to block access.

The existing seed data has ten worlds. The following map preserves that base while grouping it into the three user-selected sections.

| Section | Worlds | Topic coverage |
| --- | --- | --- |
| Basics | 1–4 | Programming foundations; Big O and space; arrays, strings, search, sorting and pointer patterns; dictionaries, sets and frequency counting. |
| Medium | 5–8 | Recursion and call stack; backtracking; linked lists; stacks, queues and deques; trees, traversal, binary search trees, heaps and priority queues. |
| Advanced | 9–10 | Graph representations, BFS/DFS, paths and cycles; greedy reasoning; dynamic programming, memoization and tabulation. Expand this section before claiming broad advanced mastery to include union-find, minimum spanning trees, Dijkstra, topological sorting, tries, and range-query structures. |

### Suggested lesson sequence

**Basics:** values and variables, conditions, loops, functions, tracing, lists/strings, linear search, sorting intuition, binary search, time and space growth, dictionaries and sets.

**Medium:** linked-list references and operations, stack/queue choice, recursion and base cases, tree traversals, heaps, two pointers, sliding windows, greedy choices, and backtracking.

**Advanced:** graph modeling, BFS/DFS, topological ordering, shortest paths, union-find, dynamic programming state design, memoization versus tabulation, and interview-style mixed problems.

The advanced expansion items are a proposed content requirement. The current repository seed covers only part of this list.

## 3. Difficulty and practice

- Label activities Easy, Standard, and Stretch. These labels describe task difficulty, not learner ability.
- Use a progression of predict → trace → complete a scaffold → solve independently → explain complexity.
- Include a few canonical problems per concept and fresh variants so learners practice transfer instead of memorizing answers.
- Mix untimed learning tasks with optional timed challenges. Do not use speed to gate core material.
- Let learners retry. Track attempts for learner reflection, but award points once per eligible activity unless a design explicitly grants capped replay points.
- Offer recap lessons and spaced review prompts for important patterns.

## 4. Games and story quests

The selected game vocabulary is levels, progress, points, badges, story quests, and scenario-based games. Every game must state its target concept and provide a debrief that connects the game action to the underlying algorithm.

Example quest structure:

| Story beat | Learning activity |
| --- | --- |
| The observatory loses its index | Compare linear search with binary search on ordered records. |
| The courier network is blocked | Model locations as a graph and trace BFS. |
| The archive repeats clues | Use a dictionary/set to avoid repeated work. |
| The cave branches into choices | Use recursion and backtracking with a visible call/choice trace. |
| The workshop has limited supplies | Build a dynamic-programming state and compare choices. |

Games should be short, keyboard usable, pauseable, and playable without a timer. Scenario text must not obscure the task or require specialized cultural knowledge.

## 5. Rewards and leaderboard rules

- Award points for meaningful actions: completing a reviewed lesson, passing an explanation check, completing an assignment, or finishing a game objective.
- Award each base activity reward once. Store an immutable reward event with activity, learner, amount, and timestamp.
- Levels use lifetime points; weekly points are calculated from reward events within the current week. Preserve earned badges across weeks.
- The global leaderboard shows nickname, weekly points, and selected badges. Email is never shown.
- The weekly competition is casual. No prizes, paid benefits, or claims that rank equals skill.
- Browser-checked code task results can be forged. Apply daily/weekly point caps, duplicate-event protection, rate limits, and simple anomaly review. These measures reduce abuse but do not make code scores cheat-proof.
- Proposed default: leaderboard week starts Monday 00:00 in the configured product timezone. Confirm the timezone and reset boundary before implementation.
- Provide a report/administrative hide path for abusive nicknames. A learner-facing opt-out is recommended and remains an open product decision.

## 6. Editorial quality bar

Before publishing a lesson, a reviewer should confirm: one measurable objective; correct Python and algorithm behavior; accurate complexity discussion; examples that include edge cases; accessible diagrams; useful wrong-answer explanations; a runnable activity with a safe timeout; and consistent terminology across Basics, Medium, and Advanced. Do not publish generic placeholder text as finished instruction.

## 7. Content acceptance targets

For a public MVP, each of the three sections must have a complete overview and at least four fully edited lessons, one assignment per lesson, one relevant interactive activity per section, and a cumulative assessment. The recommended route should cover the core ten-world seed. The exact lesson count can grow; quality and objective coverage take precedence over a large count of draft lessons.
