# Student Profile API Documentation

## 1 Student Profile API Overview

The Student Profile API provides comprehensive data needed to render the **Student Dashboard Profile page**. It aggregates multiple data modules into a single response, giving frontend developers everything needed for a complete student profile view.

### Endpoint

```http
GET /student/profile
```

### Purpose

Returns all dashboard information for a student including basic info, coding statistics, streak data, leaderboard rankings, heatmap activity, topic progress, and recent activity.

### Authentication

The API uses JWT-based authentication. The authenticated student ID is extracted from:

```javascript
req.user.id
```

This ID is used to fetch all student-specific data. The API requires the student to be authenticated and have the `STUDENT` role.

### Architecture Pattern

The API aggregates multiple modules in parallel using `Promise.all()` for optimal performance, returning a unified response object.

---

## 2 Architecture

The Student Profile API follows a clean three-layer architecture:

### File Structure

```
src/
├── controllers/
│   └── studentProfile.controller.ts
├── services/
│   └── studentProfile.service.ts
└── routes/
    └── student.routes.ts
```

### Data Flow

```
Request → Controller → Service → Database
    ↓
Controller calls Service
    ↓
Service runs multiple modules using Promise.all()
    ↓
Returns unified response
```

### Parallel Execution

The service layer uses `Promise.all()` to execute all modules concurrently:

```javascript
const [student, codingStats, streak, leaderboard, heatmap, topicProgress, recentActivity] = 
  await Promise.all([
    getStudentBasicInfo(studentId),
    getCodingStats(studentId),
    getStreakInfo(studentId),
    getLeaderboardStats(studentId),
    getHeatmapData(studentId),
    getTopicProgress(studentId),
    getRecentActivity(studentId)
  ]);
```

---

## 3 Modules in Profile API

The profile API consists of 7 independent modules:

### 1️⃣ Student Basic Information
- **Purpose**: Fetch student's personal and academic details
- **Tables Used**: `Student`, `City`, `Batch`
- **Key Feature**: Uses Prisma relations to fetch city and batch names

### 2️⃣ Coding Statistics  
- **Purpose**: Calculate problem-solving statistics
- **Tables Used**: `StudentProgress`, `Question`, `QuestionVisibility`, `Class`
- **Key Feature**: Batch-specific question totals using joins

### 3️⃣ Streak Information
- **Purpose**: Calculate current and maximum solving streaks
- **Tables Used**: `StudentProgress`
- **Key Feature**: Ignores no-question days (-1) in streak calculation

### 4️⃣ Leaderboard Statistics
- **Purpose**: Calculate student rankings across different scopes
- **Tables Used**: `Student`, `StudentProgress`, `Question`, `City`, `Batch`
- **Key Feature**: SQL window functions for ranking

### 5️⃣ Heatmap Data
- **Purpose**: Generate 365-day activity visualization
- **Tables Used**: `StudentProgress`
- **Key Feature**: Three-state logic (solved/missed/no-question)

### 6️⃣ Topic Progress
- **Purpose**: Show progress across different topics
- **Tables Used**: `Topic`, `Question`, `StudentProgress`
- **Key Feature**: Returns top 5 topics sorted by solved count

### 7️⃣ Recent Activity
- **Purpose**: Show latest problem-solving activity
- **Tables Used**: `StudentProgress`, `Question`
- **Key Feature**: Returns last 5 solved problems with timestamps

---

## 4 Student Basic Information

Returns comprehensive student profile data with relational information.

### Fields Returned

```json
{
  "name": "Ayush Chaurasiya",
  "username": "ayush_dev", 
  "email": "ayush@example.com",
  "enrollmentId": "ENR-2024-045",
  "city": "Bangalore",
  "batch": "2024",
  "github": "https://github.com/ayush",
  "linkedin": "https://linkedin.com/in/ayush",
  "leetcode": "ayush_leetcode",
  "gfg": "ayush_gfg"
}
```

### Database Relations

The service uses Prisma relations to fetch related data efficiently:

```javascript
const student = await prisma.student.findUnique({
  where: { id: studentId },
  select: {
    name: true,
    username: true,
    email: true,
    enrollment_id: true,
    city: {
      select: { city_name: true }    // City relation
    },
    batch: {
      select: { batch_name: true }   // Batch relation  
    },
    github: true,
    linkedin: true,
    leetcode_id: true,
    gfg_id: true
  }
});
```

### Tables Involved

- **Student**: Main student information
- **City**: Student's city (via `city_id` foreign key)
- **Batch**: Student's batch (via `batch_id` foreign key)

---

## 5 Coding Statistics

Calculates comprehensive problem-solving statistics from student progress data.

### Data Sources

Statistics are calculated from:
- **`StudentProgress`**: Track which questions student solved
- **`Question`**: Get difficulty levels and batch assignments
- **`QuestionVisibility`**: Determine questions assigned to student's batch
- **`Class`**: Link questions to specific batches

### Fields Returned

```json
{
  "totalSolved": 16,
  "easy": {
    "solved": 11,
    "total": 25
  },
  "medium": {
    "solved": 3, 
    "total": 20
  },
  "hard": {
    "solved": 2,
    "total": 10
  },
  "totalSubmissions": 16,
  "acceptanceRate": 2.16
}
```

### Difficulty Grouping

The system groups questions by difficulty level:

- **EASY**: Basic problems
- **MEDIUM**: Intermediate problems  
- **HARD**: Advanced problems

### Batch-Specific Totals

Important: `total` values represent questions **assigned to student's batch**, not all questions in database.

```sql
-- Gets batch-specific question totals
SELECT COUNT(*) FILTER (WHERE q.level = 'EASY') as easy_total
FROM "Question" q
JOIN "QuestionVisibility" qv ON qv.question_id = q.id
JOIN "Class" c ON c.id = qv.class_id
WHERE c.batch_id = ${student.batch_id}
```

---

## 6 Streak Information

Calculates student's problem-solving consistency over time.

### Fields Returned

```json
{
  "currentStreak": 5,
  "maxStreak": 12
}
```

### Streak Rules

The streak system follows these rules:

1. **Streak increases** when student solves questions on consecutive days
2. **Streak ignores days where `count = -1`** (no-question days)
3. **Streak breaks on days where `count = 0`** (missed days)

### Example Streak Calculation

```
Monday    → solved (count = 2)     ✅ streak continues
Tuesday   → solved (count = 1)     ✅ streak continues  
Wednesday → -1 (no questions)    ✅ streak continues (ignored)
Thursday  → solved (count = 3)     ✅ streak continues
Friday    → 0 (missed)            ❌ streak breaks
```

**Result**: Current streak = 3 days

### Algorithm Logic

```javascript
// Calculate current streak (from today backwards)
for (let i = 0; i < dailyCounts.length; i++) {
  const day = dailyCounts[i];
  
  if (day.count === -1) {
    continue; // Skip no-question days
  }
  
  if (day.count > 0) {
    currentStreak++; // Continue streak
  } else {
    break; // Break on missed day
  }
}
```

---

## 7 Leaderboard Statistics

Calculates student rankings across different competition scopes.

### Fields Returned

```json
{
  "globalRank": 15,
  "cityRank": 3,
  "totalScore": 145,
  "batchRank": 2
}
```

### Ranking System

Students are ranked by total score calculated from solved questions:

#### Scoring Formula

```javascript
EASY   = 10 points per question
MEDIUM = 15 points per question
HARD   = 20 points per question

totalScore = (easySolved × 10) + (mediumSolved × 15) + (hardSolved × 20)
```

#### XP Calculation

```javascript
xpPoints = totalScore * 10
```

#### Level System

```javascript
level = floor(xpPoints / 1000) + 1
```

### SQL Window Functions

The service uses advanced SQL with window functions for efficient ranking:

```sql
WITH student_stats AS (
  SELECT
    s.id as student_id,
    COUNT(*) FILTER (WHERE q.level = 'HARD') * 20 + 
    COUNT(*) FILTER (WHERE q.level = 'MEDIUM') * 15 + 
    COUNT(*) FILTER (WHERE q.level = 'EASY') * 10 as total_score
  FROM "Student" s
  JOIN "StudentProgress" sp ON sp.student_id = s.id
  JOIN "Question" q ON q.id = sp.question_id
  GROUP BY s.id
),
rankings AS (
  SELECT
    student_id,
    total_score,
    ROW_NUMBER() OVER (ORDER BY total_score DESC) as global_rank,
    ROW_NUMBER() OVER (PARTITION BY city_id ORDER BY total_score DESC) as city_rank,
    ROW_NUMBER() OVER (PARTITION BY batch_id ORDER BY total_score DESC) as batch_rank
  FROM student_stats
)
SELECT * FROM rankings WHERE student_id = ${studentId}
```

---

## 8 Heatmap System

Generates a 365-day visualization of student's daily problem-solving activity.

### Data Source

The heatmap is generated from:
- **Table**: `StudentProgress`
- **Field**: `sync_at` (when problem was solved)
- **Grouping**: `DATE(sync_at)` (ignores time component)

### Heatmap Day Types

The system supports three distinct day states:

#### Solved Day

Student solved one or more problems on this day.

```json
["2026-03-06", 3]
```

**Meaning**: Student solved 3 problems on March 6, 2026.

#### Missed Day

Questions were available but student solved none.

```json
["2026-03-07", 0]
```

**Meaning**: Student missed solving problems on March 7, 2026.

#### No Question Day

No questions were assigned on this day (typically weekends).

```json
["2026-03-08", -1]
```

**Meaning**: `-1` indicates no questions were assigned on March 8, 2026.

---

## 9 Heatmap Priority Logic

The heatmap uses a sophisticated priority algorithm to determine day classification.

### Priority Order

```javascript
1️⃣ if solvedCount > 0 → return solvedCount
2️⃣ else if weekend → return -1  
3️⃣ else → return 0
```

### Weekend Detection

```javascript
const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

if (dayOfWeek === 0 || dayOfWeek === 6) {
  return -1; // Weekend - no questions
}
```

### Edge Case Handling

**Important**: Even if no questions are assigned on a weekend, students can still solve previous unsolved problems.

**Example**: Student solves an old problem on Sunday
- **Input**: `solvedCount = 1`, `day = Sunday`
- **Output**: `["2026-03-08", 1]` ✅
- **NOT**: `["2026-03-08", -1]` ❌

**Logic**: Solved problems always take priority over weekend classification.

### Algorithm Implementation

```javascript
// Generate 365 days with priority logic
for (let i = 364; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  
  const dayOfWeek = date.getDay();
  const solvedCount = solvedMap.get(dateStr) || 0;
  
  let count;
  if (solvedCount > 0) {
    count = solvedCount;                    // 1️⃣ Solved takes priority
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    count = -1;                           // 2️⃣ Weekend
  } else {
    count = 0;                            // 3️⃣ Weekday missed
  }
  
  heatmap.push({ date: dateStr, count });
}
```

---

## 10 Heatmap Example Response

```json
{
  "heatmap": [
    ["2026-03-05", 2],   // Solved 2 problems
    ["2026-03-06", 1],   // Solved 1 problem
    ["2026-03-07", 0],   // Missed weekday
    ["2026-03-08", -1],  // Sunday (no questions)
    ["2026-03-09", -1],  // Monday (if no questions)
    ["2026-03-10", 3]    // Solved 3 problems
  ]
}
```

### Meaning Key

- `> 0` → Problems solved
- `0` → Missed day (questions available, none solved)
- `-1` → No question day

---

## 11 Topic Progress

Shows student's progress across different problem topics.

### Fields Returned

```json
{
  "topicProgress": [
    {
      "topic": "Arrays",
      "solved": 45,
      "total": 50
    },
    {
      "topic": "Strings", 
      "solved": 32,
      "total": 40
    }
  ]
}
```

### Selection Criteria

- **Top 5 topics only**: Returns most active topics
- **Sorted by**: `solved DESC` (most solved first)
- **Filter**: Only topics with solved questions > 0

### SQL Query

```sql
WITH topic_stats AS (
  SELECT
    t.id as topic_id,
    t.topic_name,
    COUNT(q.id) as total_questions,
    COUNT(sp.question_id) FILTER (WHERE sp.student_id = ${studentId}) as solved_questions
  FROM "Topic" t
  LEFT JOIN "Question" q ON q.topic_id = t.id
  LEFT JOIN "StudentProgress" sp ON sp.question_id = q.id
  GROUP BY t.id, t.topic_name
  HAVING COUNT(q.id) > 0
)
SELECT
  topic_name as topic,
  solved_questions as solved,
  total_questions as total
FROM topic_stats
WHERE solved_questions > 0
ORDER BY solved DESC
LIMIT 5
```

---

## 12 Recent Activity

Displays the student's latest problem-solving activity.

### Fields Returned

```json
{
  "recentActivity": [
    {
      "problemTitle": "Two Sum",
      "difficulty": "Easy",
      "solvedAt": "2026-03-06T10:23:00Z"
    },
    {
      "problemTitle": "Binary Search",
      "difficulty": "Medium", 
      "solvedAt": "2026-03-05T15:45:00Z"
    }
  ]
}
```

### Selection Criteria

- **Last 5 solved problems**: Most recent activity
- **Ordered by**: `sync_at DESC` (newest first)
- **Includes**: Problem title, difficulty, and exact timestamp

### SQL Query

```sql
SELECT
  q.question_name as problem_title,
  q.level as difficulty,
  sp.sync_at as solved_at
FROM "StudentProgress" sp
JOIN "Question" q ON q.id = sp.question_id
WHERE sp.student_id = ${studentId}
ORDER BY sp.sync_at DESC
LIMIT 5
```

---

## 13 Final API Response Example

The complete API response combines all modules into a single object:

```json
{
  "student": {
    "name": "Ayush Chaurasiya",
    "username": "ayush_dev",
    "email": "ayush@example.com",
    "enrollmentId": "ENR-2024-045",
    "city": "Bangalore",
    "batch": "2024",
    "github": "https://github.com/ayush",
    "linkedin": "https://linkedin.com/in/ayush",
    "leetcode": "ayush_leetcode",
    "gfg": "ayush_gfg"
  },
  "codingStats": {
    "totalSolved": 16,
    "easy": {
      "solved": 11,
      "total": 25
    },
    "medium": {
      "solved": 3,
      "total": 20
    },
    "hard": {
      "solved": 2,
      "total": 10
    },
    "totalSubmissions": 16,
    "acceptanceRate": 2.16
  },
  "streak": {
    "currentStreak": 5,
    "maxStreak": 12
  },
  "leaderboard": {
    "globalRank": 15,
    "cityRank": 3,
    "batchRank": 2,
    "totalScore": 145
  },
  "heatmap": [
    ["2026-03-05", 2],
    ["2026-03-06", 1],
    ["2026-03-07", 0],
    ["2026-03-08", -1],
    ["2026-03-09", -1],
    ["2026-03-10", 3]
  ],
  "topicProgress": [
    {
      "topic": "Arrays",
      "solved": 45,
      "total": 50
    },
    {
      "topic": "Strings",
      "solved": 32,
      "total": 40
    }
  ],
  "recentActivity": [
    {
      "problemTitle": "Two Sum",
      "difficulty": "Easy",
      "solvedAt": "2026-03-06T10:23:00Z"
    }
  ]
}
```

---

## 14 Debug / Testing Routes

For development and debugging, the API provides individual module testing endpoints:

### Available Test Routes

```http
GET /student/test/basic      # Test student basic info only
GET /student/test/stats      # Test coding statistics only
GET /student/test/streak      # Test streak calculation only
GET /student/test/leaderboard # Test leaderboard stats only
GET /student/test/heatmap     # Test heatmap data only
GET /student/test/topic       # Test topic progress only
GET /student/test/activity    # Test recent activity only
```

### Usage

Each test route calls the **same service functions** used in the main profile endpoint, allowing developers to:

- Test individual modules in isolation
- Debug specific calculation issues
- Verify data transformations
- Performance test individual components

### Example

```bash
# Test heatmap logic only
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/student/test/heatmap

# Response: Only heatmap array
{
  "heatmap": [
    ["2026-03-05", 2],
    ["2026-03-06", 1],
    ...
  ]
}
```

---

## 15 Performance Design

The Student Profile API is engineered for optimal performance:

### Database Efficiency

- **Single Query per Module**: Each module uses one optimized SQL query
- **Aggregation in Database**: Complex calculations done in SQL, not JavaScript
- **Efficient Joins**: Uses proper indexing and relation queries
- **Limited Data Ranges**: Heatmap uses 365-day window, not entire history

### Parallel Execution

```javascript
// All 7 modules execute concurrently
const [student, codingStats, streak, leaderboard, heatmap, topicProgress, recentActivity] = 
  await Promise.all([...]);
```

**Benefits**:
- **Reduced Latency**: Total time = slowest module, not sum of all
- **Database Connection Pooling**: Efficient connection usage
- **Non-blocking**: No module waits for others

### SQL Optimizations

- **Window Functions**: Efficient ranking without subqueries
- **Conditional Aggregation**: `COUNT(*) FILTER (WHERE...)` for performance
- **Date Indexing**: `sync_at` indexed for fast date queries
- **Batch Processing**: Heatmap processes 365 days in single query

### Memory Efficiency

- **Map Usage**: O(1) lookups for date-based operations
- **Streaming**: Large result sets processed as streams
- **Minimal Data Transfer**: Only required fields selected

---

## 16 Error Handling

Each module has dedicated error handling with specific error messages:

### Module-Specific Errors

```javascript
// Student Basic Info
"Student basic info retrieval failed: " + error.message

// Coding Statistics  
"Coding stats calculation failed: " + error.message

// Streak Information
"Error occurred in STREAK module: " + error.message

// Leaderboard Stats
"Leaderboard stats calculation failed: " + error.message

// Heatmap Data
"Error occurred in HEATMAP module: " + error.message

// Topic Progress
"Topic progress calculation failed: " + error.message

// Recent Activity
"Recent activity retrieval failed: " + error.message
```

### Error Propagation

- **Service Layer**: Catches and re-throws with context
- **Controller Layer**: Logs error and returns 500 status
- **Client Response**: Clean error messages without stack traces

---

## 17 Database Schema Reference

### Key Tables

#### Student
```sql
CREATE TABLE "Student" (
  id                  INTEGER PRIMARY KEY,
  name                VARCHAR(100),
  email               VARCHAR(150) UNIQUE,
  username            VARCHAR(100) UNIQUE,
  enrollment_id        VARCHAR(100) UNIQUE,
  city_id             INTEGER,
  batch_id            INTEGER,
  github              VARCHAR(100),
  linkedin            VARCHAR(150),
  leetcode_id         VARCHAR(100),
  gfg_id              VARCHAR(100),
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP
);
```

#### StudentProgress
```sql
CREATE TABLE "StudentProgress" (
  id          INTEGER PRIMARY KEY,
  student_id  INTEGER,
  question_id INTEGER,
  sync_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, question_id)
);
```

#### Question
```sql
CREATE TABLE "Question" (
  id            INTEGER PRIMARY KEY,
  question_name VARCHAR(255),
  question_link VARCHAR(255) UNIQUE,
  platform      VARCHAR(20) DEFAULT 'LEETCODE',
  level         VARCHAR(10) DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
  topic_id      INTEGER,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

#### Topic
```sql
CREATE TABLE "Topic" (
  id          INTEGER PRIMARY KEY,
  topic_name  VARCHAR(150) UNIQUE,
  slug        VARCHAR(80) UNIQUE,
  description  TEXT,
  "order"     INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

#### City & Batch
```sql
CREATE TABLE "City" (
  id         INTEGER PRIMARY KEY,
  city_name  VARCHAR(100) UNIQUE,
  slug       VARCHAR(120) UNIQUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Batch" (
  id          INTEGER PRIMARY KEY,
  batch_name  VARCHAR(50),
  year        INTEGER,
  city_id     INTEGER,
  slug        VARCHAR(80) UNIQUE,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 18 Usage Examples

### Frontend Integration

```javascript
// Fetch student profile
const response = await fetch('/student/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await response.json();

// Use data in components
setStudentInfo(profile.student);
setCodingStats(profile.codingStats);
setStreakData(profile.streak);
setLeaderboardData(profile.leaderboard);
setHeatmapData(profile.heatmap);
setTopicProgress(profile.topicProgress);
setRecentActivity(profile.recentActivity);
```

### React Component Example

```jsx
function StudentProfile() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  if (!profile) return <Loading />;

  return (
    <div>
      <StudentInfo student={profile.student} />
      <CodingStats stats={profile.codingStats} />
      <StreakDisplay streak={profile.streak} />
      <LeaderboardRanking ranking={profile.leaderboard} />
      <HeatmapActivity data={profile.heatmap} />
      <TopicProgress topics={profile.topicProgress} />
      <RecentActivity activities={profile.recentActivity} />
    </div>
  );
}
```

---

This documentation provides a complete understanding of the Student Profile API, its architecture, data flow, algorithms, and usage patterns for developers working with the DSA Tracker system.
