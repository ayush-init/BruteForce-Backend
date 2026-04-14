   # DSA Tracker Backend — API Analysis & Optimization Guide

   > **Sorted by optimization priority (most critical first)**
   > 
   > Each API is analyzed for: logic, query patterns, current performance, bottlenecks, and actionable optimization steps.

   ---

   ## 📊 Optimization Priority Summary

   | Priority | API | Route | Current Status | Est. Speedup |
   |----------|-----|-------|----------------|--------------|
   | 🔴 P0 | Student Profile (Private) | `GET /api/students/me` → profile | 5-7 DB queries, heavy heatmap | 40-60% |
   | 🔴 P0 | Student Profile (Public) | `GET /api/students/profile/:username` | 5-7 DB queries, heavy heatmap | 40-60% |
   | 🔴 P0 | Student Added Questions | `GET /api/students/addedQuestions` | Complex 4-JOIN raw SQL | 30-50% |
   | 🟠 P1 | Student Topics with Progress | `GET /api/students/topics` | 4-JOIN raw SQL per page | 25-40% |
   | 🟠 P1 | Student Leaderboard | `POST /api/students/leaderboard` | 3 raw SQL queries + city lookup | 20-35% |
   | 🟠 P1 | Admin Leaderboard | `POST /api/admin/leaderboard` | 2 raw SQL + no Redis cache | 30-50% |
   | 🟠 P1 | Class Details with Questions | `GET /api/students/topics/:topicSlug/classes/:classSlug` | 7 sequential/parallel queries | 25-35% |
   | 🟡 P2 | Topic Overview with Classes | `GET /api/students/topics/:topicSlug` | 3 queries (topic + 2 raw) | 15-25% |
   | 🟡 P2 | Student Report | Admin: student report | 5 parallel queries, N+1 risk | 20-30% |
   | 🟡 P2 | All Students (Admin) | `GET /api/admin/students` | 3 queries + rank filter subquery | 15-25% |
   | 🟡 P2 | Recent Questions | `GET /api/students/recent-questions` | 2 queries (count + findMany) | 10-20% |
   | 🟢 P3 | Admin Stats | `POST /api/admin/stats` | 5 parallel queries | 10-15% |
   | 🟢 P3 | Bookmarks | `GET /api/students/bookmarks` | JS-level filter/sort hack | 15-25% |
   | 🟢 P3 | Topic Progress by Username | `GET /api/public/topicprogress/:username` | 2 queries (student + raw) | 10-15% |
   | ⚪ P4 | Auth APIs | Various auth routes | Already optimized | 0-5% |
   | ⚪ P4 | CRUD APIs | Admin CRUD routes | Already optimized | 0-5% |

   ---

   ## 🔴 P0 — Critical: Optimize First

   ---

   ### 1. Student Profile (Private) — `GET /api/students/me` → Profile

   **File**: `src/services/students/profile-core.service.ts`

   **What it does**: Returns full student profile including coding stats, streak, leaderboard rank, heatmap data, and recent activity.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Query 1: `student.findUnique` with city, batch, leaderboards, `_count.progress` (1 query with includes)
   3. Parallel block:
      - Query 2: `batch.findUnique` (easy/medium/hard assigned counts)
      - Query 3: `studentProgress.findMany` with question includes (recent 5)
      - Query 4: `getBatchStartMonth` (raw SQL with MIN + DATE_TRUNC on QuestionVisibility)
   4. Check Redis for heatmap cache → if miss:
      - Parallel: `fetchAssignedDates` (raw SQL DISTINCT DATE on QuestionVisibility) + `fetchSubmissionCounts` (raw SQL GROUP BY DATE on StudentProgress)
      - Build heatmap in JS (O(d) loop)
   5. Cache result in Redis (15 min TTL)

   **Issues**:
   - **5-7 DB queries on cache miss** — the most query-heavy student-facing API
   - `studentProgress.findMany` with `include: { question }` loads full question objects for just 5 recent items — over-fetching
   - `getBatchStartMonth` runs `MIN(assigned_at)` with JOIN on QuestionVisibility → Class — slow aggregate on large tables
   - Heatmap data fetches (`fetchAssignedDates` + `fetchSubmissionCounts`) are 2 additional raw SQL queries even though they have their own sub-caching
   - **No batching** — each query is a separate round-trip to DB
   - The heatmap sub-cache (5 min TTL) is shorter than the profile cache (15 min TTL) — profile cache may serve stale heatmap data

   **Optimization Steps**:
   1. **Combine student + batch + leaderboard into single raw SQL query** — eliminate 3 separate Prisma calls
   2. **Replace `studentProgress.findMany` with raw SQL** — only select the 5 columns needed (question_name, level, link, sync_at)
   3. **Pre-compute batch start month** — store in Batch table instead of computing via MIN() every time
   4. **Merge heatmap queries into a single raw SQL** — combine assigned dates + submission counts in one query using UNION or CTE
   5. **Increase heatmap sub-cache TTL** to match profile cache TTL (15 min) to avoid stale data window
   6. **Consider pre-building heatmap on sync** — when student progress updates, rebuild heatmap asynchronously

   ---

   ### 2. Student Profile (Public) — `GET /api/students/profile/:username`

   **File**: `src/services/students/profile-public.service.ts`

   **What it does**: Returns public student profile (same data as private profile minus email/enrollment). Called when viewing another student's profile.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Query 1: `student.findUnique({ where: { username } })` with city, batch, leaderboards, `_count.progress`
   3. Parallel block:
      - Query 2: `batch.findUnique` (assigned counts)
      - Query 3: `studentProgress.findMany` with question includes (recent 5)
      - Query 4: Raw SQL to get first assigned date (replaces `getBatchStartMonth`)
   4. Heatmap fetch: `fetchAssignedDates` + `fetchSubmissionCounts` (2 raw SQL)
   5. Build heatmap in JS
   6. Cache result (15 min TTL)

   **Issues**:
   - **Same 5-7 DB queries as private profile** — nearly identical code, no code reuse
   - `student.findUnique({ where: { username } })` — username lookup is slower than ID lookup (no guaranteed index on username)
   - First assigned date query uses `DATE(qv.assigned_at)` — function on column prevents index usage
   - **Duplicate code** with profile-core.service.ts — any optimization needs to be applied twice

   **Optimization Steps**:
   1. **Extract shared profile logic** into a common service function used by both public and private profile
   2. **Add index on `Student.username`** if not already present — critical for username-based lookups
   3. **Replace `DATE(qv.assigned_at)` with range query** — `assigned_at >= startDate AND assigned_at < startDate + 1 day` to allow index usage
   4. **Apply same optimizations as private profile** (combine queries, raw SQL, pre-compute start month)
   5. **Consider pre-rendering public profiles** — cache aggressively since they change infrequently

   ---

   ### 3. Student Added Questions — `GET /api/students/addedQuestions`

   **File**: `src/services/questions/visibility-student.service.ts`

   **What it does**: Returns all questions assigned to a student's batch with filters (search, topic, level, platform, type, solved status), pagination, and bookmark/solved status.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Build dynamic WHERE clause from filters
   3. **Main data query** (raw SQL): 4-JOIN query
      - `QuestionVisibility → Class → Question → Topic`
      - LEFT JOIN `StudentProgress` (for isSolved)
      - LEFT JOIN `Bookmark` (for isBookmarked)
      - DISTINCT on question ID
   4. **Count query** (raw SQL): Same 4-JOIN structure for COUNT
   5. Both executed in `Promise.all`
   6. Extract filter options from paginated results (no extra query)
   7. Cache result (10 min TTL)

   **Issues**:
   - **4-JOIN + 2 LEFT JOIN query** — the most complex query in the system
   - `DISTINCT` on large result sets is expensive — PostgreSQL needs to sort/hash all rows
   - Count query repeats the entire JOIN structure just for a count
   - **Filter options derived from paginated results only** — incomplete filter dropdowns (e.g., if page 1 has no HARD questions, HARD won't appear in level filters)
   - Solved/unsolved filter uses `sp.question_id IS NOT NULL / IS NULL` — forces full scan on StudentProgress
   - **No GIN index utilization** — ILIKE search on question_name and topic_name can't use B-tree indexes efficiently
   - The `q.level = $N::text::"Level"` cast syntax may prevent index usage

   **Optimization Steps**:
   1. **Replace DISTINCT with EXISTS subquery** — avoids full sort/hash when checking for duplicates
   2. **Split count query** — use a simpler count that only joins QuestionVisibility + Class (doesn't need Topic, StudentProgress, Bookmark for counting)
   3. **Pre-compute filter options** — cache available topics/levels/platforms per batch separately (they rarely change)
   4. **Add composite index** `QuestionVisibility(class_id, question_id, type)` — covers the main access pattern
   5. **Add GIN trigram indexes** on `Question.question_name` and `Topic.topic_name` for ILIKE search (already in sql-performance-indexes.sql but verify they're created)
   6. **Remove enum cast** `::text::"Level"` — use direct string comparison or parameterized enum
   7. **Consider materialized view** for batch questions with solved/bookmarked status — refresh on sync

   ---

   ## 🟠 P1 — High: Optimize Next

   ---

   ### 4. Student Topics with Progress — `GET /api/students/topics`

   **File**: `src/services/topics/topic-progress.service.ts` → `getTopicsWithBatchProgressService`

   **What it does**: Returns paginated list of topics with per-batch class count, question count, solved count, and progress percentage for the authenticated student.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Build dynamic ORDER BY from sortBy param
   3. **Main query** (raw SQL): 4-LEFT JOIN
      - `Topic LEFT JOIN Class LEFT JOIN QuestionVisibility LEFT JOIN Question LEFT JOIN StudentProgress`
      - GROUP BY topic fields
      - COUNT DISTINCT for class_count, question_count, solved_questions
   4. **Count query** (raw SQL): Simpler LEFT JOIN for total topic count
   5. Both in `Promise.all`
   6. Map results, cache (10 min TTL)

   **Issues**:
   - **4 LEFT JOINs with COUNT DISTINCT** — expensive on large datasets
   - `COUNT(DISTINCT CASE WHEN sp.student_id IS NOT NULL THEN q.id END)` — conditional distinct count is slow
   - Count query still does LEFT JOIN with Class even though it only needs topic count
   - **Dynamic ORDER BY** uses string interpolation — potential SQL injection risk (mitigated by whitelist but still risky)
   - `WHERE 1=1` anti-pattern — adds no value, makes query harder to read

   **Optimization Steps**:
   1. **Pre-compute topic stats per batch** — store class_count and question_count in a materialized view or cache table, update on assignment changes
   2. **Replace COUNT DISTINCT with pre-aggregated data** — use Leaderboard table or batch-level aggregates for solved counts
   3. **Simplify count query** — remove LEFT JOIN Class, just count topics directly (with search filter only)
   4. **Use parameterized ORDER BY** instead of string interpolation — map sortBy to safe column references
   5. **Add composite index** `Class(batch_id, topic_id)` — currently only `Class(batch_id)` exists
   6. **Consider caching topic stats at batch level** — all students in same batch see same class/question counts

   ---

   ### 5. Student Leaderboard — `POST /api/students/leaderboard`

   **File**: `src/services/leaderboard/studentLeaderboard.service.ts`

   **What it does**: Returns top 10 leaderboard entries + student's own rank, with city/year filters.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. If city filter != 'all': Query `city.findFirst` to resolve city name → city ID
   3. Build WHERE clause using `buildLeaderboardBaseQueryByCityId`
   4. **Top 10 query** (raw SQL): 4-JOIN
      - `Leaderboard JOIN Student JOIN Batch JOIN City`
      - Score calculated inline: `(hard_solved/hard_assigned * 2000) + (medium/1500) + (easy/1000)`
   5. **Your Rank query** (raw SQL): Same 4-JOIN structure for single student
   6. Get `getCachedCityYearMapping` (in-memory cache with 1hr TTL)
   7. Cache result (5 min TTL)

   **Issues**:
   - **City name → ID lookup** (`city.findFirst`) on every request when city filter is used — should be cached
   - **Two separate raw SQL queries** (top 10 + your rank) — could be combined
   - Score calculation `(hard_solved/hard_assigned * 2000)` done inline in SQL — repeated in both queries
   - `getCachedCityYearMapping` uses in-memory cache (not Redis) — doesn't survive server restarts, not shared across instances
   - **No admin leaderboard Redis cache** (admin leaderboard service has no Redis caching at all)

   **Optimization Steps**:
   1. **Cache city name → ID mapping** in Redis (cities rarely change) — eliminate `city.findFirst` query
   2. **Combine top 10 + your rank into single query** using UNION ALL — save one DB round-trip
   3. **Pre-compute score in Leaderboard table** — store `alltime_score` column instead of calculating inline
   4. **Move city-year mapping to Redis** — replace in-memory cache with Redis-backed cache for multi-instance support
   5. **Add index** `Leaderboard(student_id)` if not present — for your-rank lookup
   6. **Consider adding** `Leaderboard(batch_year, alltime_global_rank)` composite index for filtered ranking queries

   ---

   ### 6. Admin Leaderboard — `POST /api/admin/leaderboard`

   **File**: `src/services/leaderboard/adminLeaderboard.service.ts`

   **What it does**: Returns paginated leaderboard for admin view with city/year/search filters.

   **Logic Flow**:
   1. Resolve city name → city ID (if filter applied)
   2. Build WHERE + ORDER BY clauses
   3. **Count query** (raw SQL): 4-JOIN `Leaderboard → Student → Batch → City`
   4. **Data query** (raw SQL): Same 4-JOIN with LIMIT/OFFSET
   5. Both in `Promise.all`
   6. Get `getCachedCityYearMapping`
   7. Return result — **NO Redis caching**

   **Issues**:
   - **🔴 NO REDIS CACHE** — every admin leaderboard request hits the database
   - City name → ID lookup on every request (same as student leaderboard)
   - Count query repeats all 4 JOINs just for a count — only needs Leaderboard + Student + Batch + City for WHERE
   - Score calculated inline in SQL (same as student leaderboard)
   - `getCachedCityYearMapping` uses in-memory cache only

   **Optimization Steps**:
   1. **🔴 ADD REDIS CACHING** — highest impact change. Cache with 5-min TTL like student leaderboard
   2. **Cache city name → ID** in Redis
   3. **Simplify count query** — only JOIN tables needed for WHERE clause (Leaderboard + Student + Batch + City), skip columns not in WHERE
   4. **Pre-compute score** in Leaderboard table
   5. **Move city-year mapping to Redis**

   ---

   ### 7. Class Details with Questions — `GET /api/students/topics/:topicSlug/classes/:classSlug`

   **File**: `src/services/topics/class-student.service.ts`

   **What it does**: Returns class details with paginated questions including solved/bookmarked status per question.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Request deduplication check (in-memory Map)
   3. Query 1: `topic.findUnique` by slug
   4. Query 2: `class.findFirst` by slug + batch + topic
   5. Query 3: `questionVisibility.findMany` (paginated, just question_id)
   6. Parallel block:
      - Query 4: `question.findMany` by IDs
      - Query 5: `questionVisibility.findMany` (for type)
      - Query 6: `studentProgress.findMany` (for solved status)
      - Query 7: `bookmark.findMany` (for bookmark status)
      - Query 8: `questionVisibility.count` (total)
   7. Merge data in JS using Maps
   8. Apply JS-level filter (solved/unsolved) on paginated data
   9. Cache result (10 min TTL)

   **Issues**:
   - **7-8 DB queries** for a single class page — too many round-trips
   - Query 3 fetches question IDs, then Query 4 fetches question data — **2 queries for what could be 1**
   - Query 5 fetches visibility data again (type) — already available from Query 3 if we select more fields
   - **JS-level filtering** for solved/unsolved — breaks pagination accuracy (filteredTotal is wrong)
   - Request deduplication uses in-memory Map with setTimeout cleanup — fragile, not shared across instances
   - `solvedCount` uses `studentProgress.length` which is only the count for the current page, not the whole class

   **Optimization Steps**:
   1. **Merge Queries 3+4+5 into single raw SQL** — get question data + type + visibility_id in one query with JOINs
   2. **Merge Queries 6+7 into single query** — combine StudentProgress + Bookmark lookup using LEFT JOINs
   3. **Move solved/unsolved filter to SQL** — add `LEFT JOIN StudentProgress` and filter with `WHERE sp.question_id IS/IS NOT NULL`
   4. **Replace in-memory request dedup** with Redis-based dedup or remove it (Redis cache already handles this)
   5. **Fix solvedCount** — should count ALL solved questions in the class, not just the current page
   6. **Add composite index** `StudentProgress(student_id, question_id)` and `Bookmark(student_id, question_id)` (already in sql-performance-indexes.sql)

   ---

   ## 🟡 P2 — Medium: Optimize After P1

   ---

   ### 8. Topic Overview with Classes — `GET /api/students/topics/:topicSlug`

   **File**: `src/services/topics/topic-progress.service.ts` → `getTopicOverviewWithClassesSummaryService`

   **What it does**: Returns topic details with paginated classes summary (name, total questions, solved questions per class) and overall progress.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Query 1: `topic.findFirst` by slug
   3. Query 2 (raw SQL): Paginated classes with aggregated question/solved counts
   4. Query 3 (raw SQL): Overall totals (total classes, total questions, solved questions)
   5. Map results, cache (10 min TTL)

   **Issues**:
   - **2 separate raw SQL queries** (paginated data + overall totals) — could be combined
   - Overall totals query uses INNER JOIN (excludes topics with no questions) — inconsistent with paginated query which uses LEFT JOIN
   - `COUNT(DISTINCT sp.question_id)` in overall query — expensive distinct count
   - No pre-computed aggregates — recalculates every time

   **Optimization Steps**:
   1. **Combine both queries** using CTE — compute paginated data and totals in single query
   2. **Pre-compute overall progress** — store in a cache table or materialized view, update on assignment/sync changes
   3. **Add index** `Class(topic_id, batch_id)` for the main WHERE clause
   4. **Fix INNER JOIN inconsistency** — both queries should use same JOIN type

   ---

   ### 9. Student Report — Admin: Get Student Report

   **File**: `src/services/students/student-progress.service.ts` → `getStudentReportService`

   **What it does**: Returns detailed student report with platform stats, difficulty stats, type stats, and topic-wise progress.

   **Logic Flow**:
   1. Query 1: `student.findUnique` with full include (city, batch, progress with question + topic)
   2. Parallel block:
      - Query 2: `studentProgress.findMany` (all solved questions with question data)
      - Query 3: `questionVisibility.findMany` (visibility types for solved questions — uses nested relation filter)
      - Query 4: `question.findMany` (all batch questions with visibility filter)
      - Query 5: `topic.findMany` (all topics)
   3. JS-level aggregation (platform stats, difficulty stats, type stats, topic stats)

   **Issues**:
   - **Query 1 loads ALL student progress** with full includes — then Query 2 loads it AGAIN separately (duplicate work)
   - Query 3 uses nested relation filter `question: { progress: { some: { student_id } } }` — generates correlated subquery
   - Query 4 loads ALL batch questions with nested visibility filter — another correlated subquery
   - **All aggregation done in JS** — should be done in SQL for better performance
   - No caching at all — every request hits DB

   **Optimization Steps**:
   1. **Remove Query 1's progress include** — Query 2 already fetches all progress data
   2. **Replace JS aggregation with SQL aggregation** — single raw SQL query with FILTER clauses (like admin-stats pattern)
   3. **Add Redis caching** — student reports change infrequently, cache for 10-15 min
   4. **Replace correlated subqueries** with JOINs in Queries 3 and 4
   5. **Consider pre-computing report data** on sync — store aggregated stats in a separate table

   ---

   ### 10. All Students (Admin) — `GET /api/admin/students`

   **File**: `src/services/students/student-query.service.ts` → `getAllStudentsService`

   **What it does**: Returns paginated student list with search, city, batch, rank filters.

   **Logic Flow**:
   1. If rank filters: Query Leaderboard table to get matching student IDs (raw SQL)
   2. Build WHERE clause from filters
   3. Parallel: `student.findMany` with city/batch includes + `student.count`
   4. Query Leaderboard for fetched students' rank data (raw SQL with `= ANY(array)`)
   5. Merge data in JS

   **Issues**:
   - **3 DB queries minimum, 4 with rank filters** — rank filter pre-query + main query + count + leaderboard
   - `student.findMany` with `include: { city: true, batch: true }` — fetches full city/batch objects when only names are needed
   - Leaderboard data fetched separately with `= ANY(array)` — could be JOINed
   - Rank filter query scans entire Leaderboard table for range conditions
   - **No Redis caching** — admin student list is queried frequently

   **Optimization Steps**:
   1. **Combine student + leaderboard data** using LEFT JOIN in raw SQL — eliminate separate leaderboard query
   2. **Replace `include: { city: true, batch: true }`** with `select` — only fetch city_name and batch_name
   3. **Add Redis caching** for student lists — 5 min TTL
   4. **Add composite index** `Leaderboard(alltime_global_rank)` and `Leaderboard(alltime_city_rank)` for rank range filters
   5. **Consider pre-filtering** — cache student ID lists per rank range

   ---

   ### 11. Recent Questions — `GET /api/students/recent-questions`

   **File**: `src/services/questions/recentQuestions.service.ts`

   **What it does**: Returns questions assigned to a batch in the last N days (default: today), paginated.

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Count query (raw SQL): COUNT DISTINCT on QuestionVisibility with date range + batch subquery
   3. Data query: `questionVisibility.findMany` with includes (question + topic + class), distinct on question_id
   4. Cache result (15 min TTL)

   **Issues**:
   - Count query uses subquery `class_id IN (SELECT id FROM "Class" WHERE batch_id = ?)` — should use JOIN
   - `questionVisibility.findMany` with `distinct: ['question_id']` — Prisma's DISTINCT implementation can be slow
   - `include: { question: { include: { topic } }, class }` — deep includes generate multiple queries or large JOINs
   - Date range filter uses `assigned_at >= startDate AND assigned_at <= endDate` — good, but needs index on `assigned_at`

   **Optimization Steps**:
   1. **Replace Prisma findMany with raw SQL** — single JOIN query is faster than Prisma's multi-query include strategy
   2. **Replace subquery with JOIN** in count query
   3. **Add index** `QuestionVisibility(assigned_at)` — critical for date range queries
   4. **Add composite index** `QuestionVisibility(class_id, assigned_at DESC)` — covers the main filter pattern

   ---

   ## 🟢 P3 — Low: Optimize When Time Permits

   ---

   ### 12. Admin Stats — `POST /api/admin/stats`

   **File**: `src/services/admin/admin-stats.service.ts`

   **What it does**: Returns batch statistics (total classes, students, topics, question breakdowns by type/level/platform).

   **Logic Flow**:
   1. Check batch exists
   2. Parallel: 4 queries
      - `class.count`
      - `student.count`
      - Raw SQL: COUNT DISTINCT topic_id from Class
      - Raw SQL: Single aggregation query with FILTER clauses (type, level, platform)

   **Issues**:
   - Batch existence check is redundant — if batch_id is invalid, the queries will return 0
   - No Redis caching — admin stats are queried frequently on dashboard load
   - `class.count` and `student.count` are fast but still separate round-trips
   - The raw SQL aggregation query is well-optimized (single query with FILTER) — good pattern

   **Optimization Steps**:
   1. **Add Redis caching** — 5 min TTL (stats change rarely)
   2. **Remove batch existence check** — let queries return 0 for invalid batch_id
   3. **Combine all counts into single raw SQL** — use a CTE with multiple COUNT aggregates
   4. **Pre-compute on assignment/sync changes** — update a stats cache table

   ---

   ### 13. Bookmarks — `GET /api/students/bookmarks`

   **File**: `src/services/bookmarks/bookmark-query.service.ts`

   **What it does**: Returns paginated bookmarks with sort (recent/old/solved/unsolved) and filter (all/solved/unsolved).

   **Logic Flow**:
   1. Check Redis cache → if hit, return
   2. Simple WHERE: `student_id = ?`
   3. Fetch bookmarks with `include: { question: { select: { ..., progress: { where: { student_id } } } } }`
   4. **JS-level filtering** for solved/unsolved — fetches 3x limit, filters in memory
   5. **JS-level sorting** for solved/unsolved sort
   6. JS-level pagination after filter
   7. Cache result (10 min TTL)

   **Issues**:
   - **JS-level filter/sort is a hack** — fetches 3x the needed data and discards most of it
   - `include: { question: { progress: { where: { student_id } } } }` — nested relation filter generates subquery per question
   - Pagination is inaccurate for filtered results — `effectiveTotal` is based on filtered page, not total filtered count
   - 3x buffer is arbitrary — may not be enough if many bookmarks are solved/unsolved

   **Optimization Steps**:
   1. **Move solved/unsolved filter to SQL** — LEFT JOIN StudentProgress and filter with IS NULL / IS NOT NULL
   2. **Move solved/unsolved sort to SQL** — ORDER BY CASE WHEN sp.id IS NULL THEN 1 ELSE 0 END
   3. **Remove 3x buffer hack** — proper SQL filtering gives exact pagination
   4. **Replace Prisma include with raw SQL** — single JOIN query is more efficient
   5. **Add composite index** `Bookmark(student_id, created_at DESC)` — for the main access pattern

   ---

   ### 14. Topic Progress by Username — `GET /api/public/topicprogress/:username`

   **File**: `src/services/topics/topic-progress.service.ts` → `getTopicProgressByUsernameService`

   **What it does**: Public API — returns all topics with progress for a given username (no auth required).

   **Logic Flow**:
   1. Query 1: `student.findUnique({ where: { username } })` with batch include
   2. Query 2 (raw SQL): Same 4-LEFT JOIN as student topics API but without pagination (fetches ALL topics)
   3. Sort in JS based on sortBy param

   **Issues**:
   - **No pagination** — fetches ALL topics with progress for a student
   - **No Redis caching** — every request hits DB
   - Same complex 4-LEFT JOIN as the authenticated topics API
   - Public endpoint with no rate limiting (beyond global limiter) — could be abused

   **Optimization Steps**:
   1. **Add Redis caching** — 10-15 min TTL, username-based key
   2. **Add pagination** — same as authenticated topics API
   3. **Add heavier rate limiting** — public endpoint should have stricter limits
   4. **Pre-compute topic progress** — store in a materialized view, refresh on sync

   ---

   ## ⚪ P4 — Already Optimized / Low Impact

   ---

   ### 15. Auth APIs

   **Routes**: `POST /api/auth/student/login`, `POST /api/auth/admin/login`, `POST /api/auth/student/register`, `POST /api/auth/refresh-token`, `POST /api/auth/google-login`, `POST /api/auth/forgot-password`, `POST /api/auth/verify-otp`, `POST /api/auth/reset-password`

   **Status**: ✅ Already optimized. These are one-time operations (login/register) with:
   - bcrypt hashing (necessary, not a bottleneck)
   - JWT token generation (fast, in-memory)
   - Rate limiting applied (`authLimiter`, `passwordResetLimiter`, `otpLimiter`)
   - No complex DB queries

   **No optimization needed.**

   ---

   ### 16. CRUD APIs (Admin)

   **Routes**: Topic CRUD, Question CRUD, Class CRUD, Student CRUD, Visibility CRUD, City/Batch CRUD, Admin CRUD

   **Status**: ✅ Mostly optimized. These are admin-only operations that:
   - Use simple findUnique/findFirst + create/update/delete patterns
   - Have proper validation and error handling
   - Are called infrequently (admin actions)
   - Cache invalidation is properly handled after mutations

   **Minor improvements possible**:
   - `createClassInTopicService` has a `while` loop for slug uniqueness — could use `ON CONFLICT` instead
   - `updateClassService` has the same `while` loop for slug generation
   - These are low priority since admin operations are infrequent

   ---

   ### 17. Sync APIs

   **Routes**: `POST /api/admin/students/sync/:id` (manual sync), Cron job (auto sync)

   **Files**: `src/services/progressSync/sync-core.service.ts`, `src/services/leaderboardSync/sync-core.service.ts`

   **Status**: ✅ Well-structured. Sync operations:
   - Use BullMQ queue for async processing
   - Compare real counts before processing (skip if no new solutions)
   - Bulk insert with `createMany` + `skipDuplicates`
   - Properly invalidate caches after sync
   - Leaderboard sync uses transaction with UPSERT

   **Minor issues**:
   - Leaderboard sync does full table scan (all students) — could be incremental
   - Streak calculation happens in JS during leaderboard sync — could be done in SQL
   - These are background jobs, not user-facing, so latency is less critical

   ---

   ## 🗄️ Database Index Status

   ### Existing Indexes (from `sql-performance-indexes.sql`)

   | Index | Table | Columns | Status |
   |-------|-------|---------|--------|
   | `idx_question_visibility_class_id` | QuestionVisibility | class_id | ✅ Created |
   | `idx_question_visibility_question_id` | QuestionVisibility | question_id | ✅ Created |
   | `idx_class_batch_id` | Class | batch_id | ✅ Created |
   | `idx_question_topic_id` | Question | topic_id | ✅ Created |
   | `idx_question_created_at` | Question | created_at DESC | ✅ Created |
   | `idx_student_progress_student_id` | StudentProgress | student_id | ✅ Created |
   | `idx_student_progress_question_id` | StudentProgress | question_id | ✅ Created |
   | `idx_bookmark_student_id` | Bookmark | student_id | ✅ Created |
   | `idx_bookmark_question_id` | Bookmark | question_id | ✅ Created |
   | `idx_question_visibility_class_question` | QuestionVisibility | class_id, question_id | ✅ Created |
   | `idx_student_progress_student_question` | StudentProgress | student_id, question_id | ✅ Created |
   | `idx_bookmark_student_question` | Bookmark | student_id, question_id | ✅ Created |
   | `idx_question_topic_created_at` | Question | topic_id, created_at DESC | ✅ Created |
   | `idx_class_batch_id_id` | Class | batch_id, id | ✅ Created |
   | `idx_question_name_gin` | Question | question_name (GIN trigram) | ⚠️ Requires pg_trgm |
   | `idx_topic_name_gin` | Topic | topic_name (GIN trigram) | ⚠️ Requires pg_trgm |
   | `idx_question_level` | Question | level | ✅ Created |
   | `idx_question_platform` | Question | platform | ✅ Created |
   | `idx_question_type` | Question | type | ✅ Created |

   ### Missing Indexes (Recommended)

   | Index | Table | Columns | For API | Priority |
   |-------|-------|---------|---------|----------|
   | `idx_student_username` | Student | username | Public profile lookup | 🔴 High |
   | `idx_question_visibility_assigned_at` | QuestionVisibility | assigned_at | Recent questions date filter | 🔴 High |
   | `idx_question_visibility_class_assigned` | QuestionVisibility | class_id, assigned_at DESC | Recent questions compound | 🟠 Medium |
   | `idx_class_topic_batch` | Class | topic_id, batch_id | Topic overview queries | 🟠 Medium |
   | `idx_leaderboard_student_id` | Leaderboard | student_id | Your-rank lookup | 🟠 Medium |
   | `idx_leaderboard_batch_year_rank` | Leaderboard | (via Student JOIN) | Filtered ranking | 🟡 Low |
   | `idx_bookmark_student_created` | Bookmark | student_id, created_at DESC | Bookmark sorting | 🟡 Low |
   | `idx_student_batch_id` | Student | batch_id | Admin student list | 🟡 Low |
   | `idx_student_city_id` | Student | city_id | Admin student list filter | 🟡 Low |

   ---

   ## 🔄 Redis Cache Coverage

   | API | Redis Cached | TTL | Gap |
   |-----|-------------|-----|-----|
   | `GET /api/students/me` (profile) | ✅ | 15 min | — |
   | `GET /api/students/profile/:username` | ✅ | 15 min | — |
   | `GET /api/students/addedQuestions` | ✅ | 10 min | — |
   | `GET /api/students/topics` | ✅ | 10 min | — |
   | `GET /api/students/topics/:topicSlug` | ✅ | 10 min | — |
   | `GET /api/students/topics/:tS/classes/:cS` | ✅ | 10 min | — |
   | `POST /api/students/leaderboard` | ✅ | 5 min | — |
   | `GET /api/students/recent-questions` | ✅ | 15 min | — |
   | `GET /api/students/bookmarks` | ✅ | 10 min | — |
   | `POST /api/admin/leaderboard` | ❌ | — | 🔴 **NO CACHE** |
   | `POST /api/admin/stats` | ❌ | — | 🟠 Should cache |
   | `GET /api/admin/students` | ❌ | — | 🟠 Should cache |
   | `GET /api/public/topicprogress/:username` | ❌ | — | 🟡 Should cache |
   | Admin student report | ❌ | — | 🟡 Should cache |

   ---

   ## 📋 Quick Win Checklist (Do These First)

   1. **Add Redis cache to Admin Leaderboard** — single most impactful change, saves 2 raw SQL queries per request
   2. **Add index on `Student.username`** — speeds up all username-based lookups
   3. **Add index on `QuestionVisibility.assigned_at`** — speeds up recent questions and heatmap queries
   4. **Pre-compute score in Leaderboard table** — eliminates inline calculation in every leaderboard query
   5. **Cache city name → ID mapping in Redis** — eliminates `city.findFirst` in both leaderboard APIs
   6. **Combine top 10 + your rank queries** in student leaderboard — saves 1 DB round-trip
   7. **Add Redis cache to Admin Stats** — dashboard loads frequently, stats rarely change
   8. **Move bookmark solved/unsolved filter to SQL** — eliminates 3x over-fetch hack

   ---

   ## 🏗️ Architectural Recommendations (Long Term)

   1. **Pre-compute per-batch topic stats** — Store `class_count`, `question_count` per topic-batch combination in a cache table. Update only when assignments change. Eliminates the expensive COUNT DISTINCT in topics API.

   2. **Pre-compute heatmap data on sync** — When student progress updates, rebuild heatmap asynchronously and cache. Profile API then just reads from cache.

   3. **Materialized view for batch questions** — Create a view that joins QuestionVisibility + Question + Topic with solved/bookmarked status per student. Refresh on sync.

   4. **Incremental leaderboard sync** — Instead of recalculating all students' ranks on every sync, only recalculate students who had new progress entries.

   5. **Move city-year mapping to Redis** — Replace in-memory cache with Redis-backed cache for multi-instance support and persistence across restarts.

   6. **Consider read replicas** — Offload read-heavy APIs (profile, topics, leaderboard) to a read replica to reduce load on primary DB.

   7. **Add query timeout** — Set `statement_timeout` in PostgreSQL to prevent runaway queries from blocking connections.
