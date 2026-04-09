"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateStudentHeatmapCache = exports.getTodayCount = exports.hasQuestionToday = exports.hasCompletedAllQuestions = exports.getBatchStartMonth = exports.getBatchStartMonthFromDates = exports.fetchSubmissionCounts = exports.fetchAssignedDates = exports.buildHeatmapOptimized = exports.normalizeDate = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const cache_service_1 = require("../cache.service");
/**
 * Date normalization to YYYY-MM-DD format
 */
const normalizeDate = (date) => {
    if (typeof date === 'string') {
        return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
};
exports.normalizeDate = normalizeDate;
/**
 * Generate date range array from start to end (inclusive)
 * All dates in YYYY-MM-DD format
 */
const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    // Ensure we start at beginning of day
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    while (current <= end) {
        dates.push((0, exports.normalizeDate)(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
};
const buildHeatmapOptimized = (input) => {
    const { startDate, endDate, assignedDates, submissionCounts, completedAll } = input;
    // Generate full date range
    const allDates = generateDateRange(startDate, endDate);
    // Build heatmap array - single pass O(d)
    const heatmap = allDates.map(date => {
        const submissions = submissionCounts.get(date) || 0;
        if (submissions > 0) {
            // Student solved questions on this day
            return { date, count: submissions };
        }
        // No submissions - check if question was assigned
        if (!assignedDates.has(date)) {
            // No question assigned - freeze day or break day
            if (completedAll) {
                return { date, count: -1 }; // Freeze day
            }
            else {
                return { date, count: 0 }; // Break day
            }
        }
        // Question assigned but no submissions
        return { date, count: 0 };
    });
    // Sort descending by date (latest first)
    return heatmap.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
exports.buildHeatmapOptimized = buildHeatmapOptimized;
/**
 * Fetch assigned dates for a batch using BATCH-LEVEL cache
 * All students in same batch share this data - massive performance gain
 * Uses index: QuestionVisibility(class_id, assigned_at)
 */
const fetchAssignedDates = async (batchId, startDate) => {
    const startDateStr = (0, exports.normalizeDate)(startDate);
    const cacheKey = cache_service_1.cacheKeys.batchAssignedDates(batchId, startDateStr);
    // Check batch-level cache first (shared by ALL students in batch)
    const cached = await cache_service_1.cacheService.get(cacheKey);
    if (cached) {
        return new Set(cached);
    }
    // Fetch from DB only once per batch
    const result = await prisma_1.default.$queryRaw `
    SELECT DISTINCT DATE(qv.assigned_at) as date
    FROM "QuestionVisibility" qv
    JOIN "Class" c ON qv.class_id = c.id
    WHERE c.batch_id = ${batchId}
    AND qv.assigned_at >= ${startDateStr}::date
    AND qv.assigned_at IS NOT NULL
  `;
    const dates = result.map(r => (0, exports.normalizeDate)(r.date));
    // Cache for 1 hour at batch level (batch assignments rarely change)
    // All students in this batch will reuse this!
    await cache_service_1.cacheService.set(cacheKey, dates, 3600);
    return new Set(dates);
};
exports.fetchAssignedDates = fetchAssignedDates;
/**
 * Fetch submission counts grouped by date with CACHING
 * Student's own submissions cached for 5 minutes
 * Uses index: StudentProgress(student_id, sync_at)
 */
const fetchSubmissionCounts = async (studentId, startDate) => {
    const startDateStr = (0, exports.normalizeDate)(startDate);
    const cacheKey = cache_service_1.cacheKeys.studentSubmissionCounts(studentId, startDateStr);
    // Check student-level cache
    const cached = await cache_service_1.cacheService.get(cacheKey);
    if (cached) {
        return new Map(cached);
    }
    const result = await prisma_1.default.$queryRaw `
    SELECT 
      DATE(sync_at) as date,
      COUNT(*) as count
    FROM "StudentProgress"
    WHERE student_id = ${studentId}
      AND sync_at >= ${startDateStr}::date
    GROUP BY DATE(sync_at)
  `;
    const counts = new Map();
    for (const row of result) {
        counts.set((0, exports.normalizeDate)(row.date), Number(row.count));
    }
    // Cache for 5 minutes (student submissions change frequently)
    // Convert Map to array for serialization
    await cache_service_1.cacheService.set(cacheKey, Array.from(counts.entries()), 300);
    return counts;
};
exports.fetchSubmissionCounts = fetchSubmissionCounts;
/**
 * Get batch start month using the already-fetched assigned dates
 * This avoids a separate slow MIN() query
 */
const getBatchStartMonthFromDates = (assignedDates, batchYear) => {
    if (assignedDates.size === 0) {
        // Fallback to batch year or today
        return batchYear ? new Date(batchYear, 0, 1) : new Date();
    }
    // Find earliest date from assigned dates
    const dates = Array.from(assignedDates).sort();
    const earliestDate = new Date(dates[0]);
    // Return first day of that month
    return new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
};
exports.getBatchStartMonthFromDates = getBatchStartMonthFromDates;
/**
 * Legacy: Get batch start month (first question assignment date) - CACHED
 * Uses optimized query with index
 */
const getBatchStartMonth = async (batchId, batchYear) => {
    const cacheKey = cache_service_1.cacheKeys.batchStartMonth(batchId);
    const cached = await cache_service_1.cacheService.get(cacheKey);
    if (cached) {
        return cached;
    }
    const result = await prisma_1.default.$queryRaw `
    SELECT DATE_TRUNC('month', MIN(qv.assigned_at)) as start_month
    FROM "QuestionVisibility" qv
    JOIN "Class" c ON qv.class_id = c.id
    WHERE c.batch_id = ${batchId}
    AND qv.assigned_at IS NOT NULL
  `;
    let startMonth;
    if (!result.length || !result[0].start_month) {
        startMonth = batchYear ? new Date(batchYear, 0, 1) : new Date();
    }
    else {
        startMonth = new Date(result[0].start_month);
    }
    // Cache for 24 hours (batch start doesn't change)
    await cache_service_1.cacheService.set(cacheKey, startMonth, 86400);
    return startMonth;
};
exports.getBatchStartMonth = getBatchStartMonth;
/**
 * Check if student completed all questions
 */
const hasCompletedAllQuestions = (batchCounts, leaderboard) => {
    if (!batchCounts || !leaderboard)
        return false;
    const totalAssigned = batchCounts.easy_assigned + batchCounts.medium_assigned + batchCounts.hard_assigned;
    const totalSolved = leaderboard.easy_solved + leaderboard.medium_solved + leaderboard.hard_solved;
    return totalSolved >= totalAssigned && totalAssigned > 0;
};
exports.hasCompletedAllQuestions = hasCompletedAllQuestions;
/**
 * Check if any question was assigned today for the batch
 */
const hasQuestionToday = (assignedDates) => {
    const today = (0, exports.normalizeDate)(new Date());
    return assignedDates.has(today);
};
exports.hasQuestionToday = hasQuestionToday;
/**
 * Get student's solved count for today from submission counts
 */
const getTodayCount = (submissionCounts) => {
    const today = (0, exports.normalizeDate)(new Date());
    return submissionCounts.get(today) || 0;
};
exports.getTodayCount = getTodayCount;
/**
 * Invalidate heatmap cache for a student
 * Call this when student solves a new question
 */
const invalidateStudentHeatmapCache = async (studentId, batchId) => {
    const pattern = `heatmap:${studentId}:${batchId}:*`;
    await cache_service_1.cacheService.delPattern(pattern);
};
exports.invalidateStudentHeatmapCache = invalidateStudentHeatmapCache;
