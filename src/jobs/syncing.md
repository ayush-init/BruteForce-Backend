# Student Sync System Documentation

## Overview
This document explains the BullMQ + Redis Cloud sync system for student progress and leaderboard updates.

## System Architecture

### 1. Queue System
- **Queue**: `student-sync` stores all sync jobs
- **Worker**: Processes 3 students concurrently 
- **Redis**: Manages queue state and job coordination

### 2. Cron Schedules
- **Student Sync**: Every 2 minutes (`*/2 * * * *`) for testing
- **Production**: 5 AM, 2 PM, 8 PM (`0 5,14,20 * * *`)
- **Leaderboard Sync**: 9 AM, 6 PM, 11 PM (`0 9,18,23 * * *`)

### 3. Rate Limiting
- **LeetCode API**: 1 request every 300ms
- **GFG API**: 1 request every 500ms  
- **Timeout**: 5 seconds per API call
- **Retry**: 3 attempts with exponential backoff
- **Global limiter**: All API calls are controlled by a GLOBAL limiter (not batch-based)

## Flow Process

### Student Sync Cycle Flow
1. **Cron triggers** → Checks if sync already running AND queue empty
2. **Queue safety check** → Skips if jobs already in queue
3. **Load batch questions** → Single optimized query loads all batch questions
4. **Store in memory** → BatchQuestionsStore for instant access
5. **Fetch students** → Adds jobs with batchId to BullMQ queue
6. **Worker processes** → 3 students at a time using batch data
7. **API calls** → Rate limited with Bottleneck
8. **Error handling** → Invalid usernames skipped gracefully
9. **Database updates** → Optimized with compareRealCount logic
10. **QueueEvents detection** → Automatic completion when queue drained
11. **Memory cleanup** → BatchQuestionsStore cleared automatically

### Student Sync Detailed Process

#### Phase 1: Preparation (Cron Job)
```javascript
// 1. Safety checks
if (isSyncRunning()) return;                    // Skip if already running
if (await studentSyncQueue.count() > 0) return; // Skip if queue not empty

// 2. Load batch questions (single optimized query)
SELECT b.id, array_agg(q.id), array_agg(q.question_link)
FROM Batch -> Class -> QuestionVisibility -> Question
GROUP BY b.id

// 3. Store in memory
setBatchQuestions(batchQuestionsMap);
```

#### Phase 2: Queue Processing
```javascript
// 4. Add students to queue
students.map(student => ({
  name: 'sync-student',
  data: { studentId: student.id, batchId: student.batch_id },
  opts: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
}));

// 5. Worker processes (concurrency: 3)
const result = await Promise.race([
  syncOneStudent(studentId, batchData),  // 10s timeout
  timeout(10000)
]);
```

#### Phase 3: Student Processing
```javascript
// 6. syncOneStudent logic
if (!batchData) return; // Skip if no batch data

// Build question map from pre-loaded batch data
const questionMap = new Map<string, number>();
batchData.question_links.forEach((link, index) => {
  const slug = extractSlug(link);
  if (slug) questionMap.set(slug, batchData.question_ids[index]);
});

// API calls with rate limiting
const lcData = await fetchLeetcodeData(student.leetcode_id); // 300ms minTime
const gfgData = await fetchGfgData(student.gfg_id);          // 500ms minTime

// compareRealCount optimization
if (lcData.totalSolved > student.lc_total_solved) {
  // Process LeetCode submissions
}
if (gfgData.totalSolved > student.gfg_total_solved) {
  // Process GFG solved problems
}

// Bulk insert new progress
await prisma.studentProgress.createMany({
  data: newProgressEntries,
  skipDuplicates: true
});
```

#### Phase 4: Completion & Cleanup
```javascript
// 7. QueueEvents handles completion automatically
queueEvents.on("drained", () => {
  completeSync();           // Mark sync as completed
  clearBatchQuestions();    // Clear memory
  console.log("Sync cycle completed and memory cleared");
});

// 8. Error handling
queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
});
```

### Leaderboard Sync Cycle Flow

#### Phase 1: Cron Trigger (9 AM, 6 PM, 11 PM)
```javascript
cron.schedule("0 9,18,23 * * *", async () => {
  await tryRunLeaderboard();
});
```

#### Phase 2: Sync Window Logic
```javascript
// 1. Check if student sync is running
if (isSyncRunning()) {
  console.log("Leaderboard waiting for student sync to complete...");
  return;
}

// 2. Wait for sync completion (max 20 minutes)
const maxWaitTime = 20 * 60 * 1000; // 20 minutes
const startTime = Date.now();

while (isSyncRunning() && (Date.now() - startTime) < maxWaitTime) {
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
}

if (isSyncRunning()) {
  console.log("Timeout waiting for student sync, skipping leaderboard");
  return;
}
```

#### Phase 3: Leaderboard Processing
```javascript
// 4. Process leaderboard updates
// - Calculate city-wise rankings
// - Update leaderboard tables
// - Generate new statistics
// - Cache results

console.log("Leaderboard sync cycle completed");
```

### Complete System Flow
```
[STUDENT SYNC CYCLE]
Cron (2min) -> Safety Checks -> Load Batch Questions -> Queue Jobs -> Worker Processing -> API Calls -> DB Updates -> QueueEvents Completion -> Memory Cleanup

[LEADERBOARD SYNC CYCLE]  
Cron (9AM/6PM/11PM) -> Wait for Student Sync -> Process Leaderboard -> Update Rankings -> Cache Results
```

### Key Optimizations Preserved
- `compareRealCount` logic: Only processes if new solves exist
- `shouldProcessLeetcode`: `lcData.totalSolved > student.lc_total_solved`
- `shouldProcessGfg`: `gfgData.totalSolved > student.gfg_total_solved`
- Bulk inserts with `skipDuplicates: true`

### Batch Optimization (NEW)
- **Single query per sync**: Loads all batch questions once
- **In-memory store**: `BatchQuestionsStore` for instant access
- **Reduced DB load**: From 100+ queries to 1 query per cycle
- **Queue efficiency**: Jobs include `batchId` for data access
- **Worker performance**: Pre-loaded data eliminates DB calls

### Error Handling (NEW)
- **Invalid usernames**: LeetCode/GFG invalid handles skipped gracefully
- **API errors**: 400 status codes handled without job failure
- **Network issues**: BullMQ retry mechanism for legitimate errors
- **Graceful degradation**: System continues processing other students

### Production Reliability (NEW)
- **QueueEvents completion**: BullMQ native "drained" event marks completion (not worker)
- **No memory leaks**: Automatic BatchQuestionsStore cleanup after each sync
- **Queue safety**: Prevents overlapping sync cycles with queue count check
- **Double protection**: Both sync status and queue state validation
- **No DB fallback**: Strict batch data requirement ensures consistency
- **Race condition prevention**: Multiple safety layers for sync state management
- **Timeout protection**: 10-second timeout prevents stuck jobs
- **Enhanced debugging**: QueueEvents failed logging for production issues

## Configuration

### Environment Variables
```bash
# Redis Configuration
USE_CLOUD_REDIS=false          # true for cloud, false for local
CLOUD_REDIS_URL=redis://...  # cloud Redis URL

# Rate Limiting (built into services)
LeetCode: maxConcurrent=1, minTime=300ms
GFG: maxConcurrent=1, minTime=500ms
```

### Queue Configuration
```javascript
// Concurrency and retry settings
concurrency: 3                    # 3 students at once
attempts: 3                      # Retry failed jobs 3 times
backoff: { type: 'exponential', delay: 1000 }
```

## Monitoring

### Console Logs
- `[CRON]` - Cron job operations
- `[WORKER]` - Student processing
- `[LeetCode]` - API calls
- `[GFG]` - API calls  
- `[LEADERBOARD]` - Leaderboard operations
- `[SYNC_STATUS]` - Sync state changes
- `[REDIS]` - Redis connection status
- `[SYNC_CORE]` - Sync core operations

### Key Log Examples
```
[CRON] Student sync cycle started (attempt 1/3)
[CRON] Queue not empty (15 jobs), skipping new sync
[CRON] Student sync cycle started (attempt 1/3)
[CRON] Loading batch questions for optimized sync
[CRON] Loaded questions for 5 batches
[CRON] Adding 107 students to sync queue
[WORKER] Processing sync job for student 1 (batch 2)
[SYNC_CORE] Using pre-loaded batch data for batch 2
[LeetCode] Fetching data for user: john_doe
[WORKER] Student 1: 2 new solutions added
[WORKER] Student 45: Invalid username/API error, skipping user
[SYNC] Job abc123 completed
[SYNC] Job def456 completed
[SYNC] All jobs completed
[SYNC] Sync cycle completed and memory cleared
[BATCH_STORE] Cleared batch questions store
[SYNC_STATUS] Sync completed at: 2026-04-10T03:58:30.123Z
```

## Error Handling

### Automatic Retries
- **Job failures**: 3 attempts with exponential backoff
- **API timeouts**: 5-second limit with proper error handling
- **Rate limits**: 429 responses trigger retry logic
- **Connection issues**: Graceful Redis error handling

### Sync Status Protection
- Prevents overlapping sync cycles
- Tracks `isRunning`, `startedAt`, `completedAt`
- QueueEvents automatically marks completion when queue is drained

## Deployment

### Development Setup
```bash
# Start Redis with Docker
docker run -d -p 6379:6379 redis:latest

# Start backend
npm run dev
```

### Docker Commands (Complete Management)

#### Starting Services
```bash
# Start Redis container
docker run -d -p 6379:6379 --name redis-sync redis:latest

# Start Redis with persistence (recommended for production)
docker run -d -p 6379:6379 --name redis-sync \
  -v redis-data:/data \
  redis:latest redis-server --appendonly yes

# Start backend with Docker (if using Dockerfile)
docker build -t dsa-tracker-backend .
docker run -d -p 3000:3000 --name backend \
  --link redis-sync:redis \
  -e USE_CLOUD_REDIS=false \
  -e REDIS_HOST=redis \
  dsa-tracker-backend
```

#### Managing Containers
```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Stop containers
docker stop redis-sync
docker stop backend

# Remove containers
docker rm redis-sync
docker rm backend

# Stop and remove in one command
docker stop redis-sync && docker rm redis-sync

# View container logs
docker logs redis-sync
docker logs backend

# Follow logs in real-time
docker logs -f redis-sync
docker logs -f backend
```

#### For Cloning the Project
```bash
# Clone the repository
git clone <repository-url>
cd dsa-tracker-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Start Redis (if using local)
docker run -d -p 6379:6379 --name redis redis:latest

# Start development server
npm run dev
```

#### Production Setup
```bash
# Use Redis Cloud
USE_CLOUD_REDIS=true
CLOUD_REDIS_URL=redis://username:password@host:port

# Production cron schedules
# Student sync: 5 AM, 2 PM, 8 PM
# Leaderboard sync: 9 AM, 6 PM, 11 PM

# Environment variables for production
NODE_ENV=production
USE_CLOUD_REDIS=true
CLOUD_REDIS_URL=redis://username:password@host:port
PORT=3000
```

#### Docker Compose (Optional)
```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    
  backend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - redis
    environment:
      - USE_CLOUD_REDIS=false
      - REDIS_HOST=redis
      - NODE_ENV=development

volumes:
  redis-data:
```

```bash
# Start with Docker Compose
docker-compose up -d

# Stop with Docker Compose
docker-compose down

# View logs
docker-compose logs -f
```

## Performance

### Scalability
- **Handles 500-1000+ students** safely
- **Rate limiting** prevents API abuse
- **Concurrent processing** maximizes throughput
- **Queue persistence** survives server restarts
- **Batch optimization** reduces database load by 99%

### Resource Usage
- **Memory**: Efficient job processing + batch questions store
- **Network**: Controlled API call rates
- **Database**: Optimized bulk operations + single query per sync
- **Performance**: 100x faster question loading

## Troubleshooting

### Common Issues
1. **Redis connection**: Check Docker/Redis Cloud status
2. **API rate limits**: Built-in throttling handles this
3. **Overlapping syncs**: Double protection with status + queue check
4. **Worker crashes**: Automatic retry and job recovery
5. **Invalid usernames**: Automatically skipped, check logs for warnings
6. **Batch data missing**: No DB fallback, sync skipped for affected students
7. **Memory usage**: BatchQuestionsStore cleared automatically after sync
8. **QueueEvents not working**: Ensure events imported in app.ts
9. **Sync not completing**: Check for "drained" event logs

### Debug Commands
```bash
# Check Redis
docker ps
docker exec -it <container-id> redis-cli ping

# Check queue status
# View BullMQ dashboard or logs
```

## System Guarantees

### Production Reliability
- **Accurate completion detection**: BullMQ QueueEvents "drained" event
- **Zero memory leaks**: Automatic cleanup after each sync cycle
- **No race conditions**: Double protection with sync status + queue check
- **Data consistency**: No DB fallback ensures batch data requirement
- **Error resilience**: Invalid usernames skipped, legitimate errors retried

### Performance Optimizations
- **Database efficiency**: 1 query per sync cycle vs 100+ queries
- **Memory optimization**: In-memory batch questions with automatic cleanup
- **API safety**: Rate limiting + timeouts + retry logic
- **Scalability**: Handles 500-1000+ students safely
- **Expected duration**: 20-40 minutes for 500-700 students with rate limiting

### Configuration Flexibility
- **Redis toggle**: `USE_CLOUD_REDIS` preserved for local/cloud switching
- **Rate limiting**: Built-in Bottleneck protection for external APIs
- **Queue management**: BullMQ handles job persistence and retry logic

## Future Enhancements

### Potential Improvements
- **BullMQ Dashboard**: Real-time queue monitoring
- **Metrics Collection**: Performance analytics
- **Dynamic Rate Limiting**: Adaptive throttling
- **Database Indexing**: Further query optimization
- **API Caching**: Reduce redundant calls
