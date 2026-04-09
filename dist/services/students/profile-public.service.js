"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicStudentProfileService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
const cache_service_1 = require("../cache.service");
const profile_heatmap_service_1 = require("./profile-heatmap.service");
const getPublicStudentProfileService = async (username) => {
    const startTime = Date.now();
    const timings = {};
    // 1 Get student basic info + leaderboard (single query with all relations)
    const t1 = Date.now();
    const student = await prisma_1.default.student.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            enrollment_id: true,
            github: true,
            linkedin: true,
            leetcode_id: true,
            gfg_id: true,
            profile_image_url: true,
            batch_id: true,
            city: { select: { id: true, city_name: true } },
            batch: { select: { id: true, batch_name: true, year: true } },
            leaderboards: true,
            _count: { select: { progress: true } }
        }
    });
    timings.studentQuery = Date.now() - t1;
    if (!student) {
        throw new ApiError_1.ApiError(404, "Student not found");
    }
    const studentId = student.id;
    const batchId = student.batch_id;
    const leaderboard = student.leaderboards;
    // 2 Parallel execution: Batch counts, Recent activity, Assigned dates
    // Note: Skip getBatchStartMonth - we'll compute it from assigned dates
    const t2 = Date.now();
    const [batchQuestionCounts, recentActivity, assignedDatesForStartMonth] = await Promise.all([
        prisma_1.default.batch.findUnique({
            where: { id: batchId },
            select: { easy_assigned: true, medium_assigned: true, hard_assigned: true, year: true }
        }),
        prisma_1.default.studentProgress.findMany({
            where: { student_id: studentId },
            include: {
                question: { select: { question_name: true, level: true, question_link: true } }
            },
            orderBy: { sync_at: "desc" },
            take: 5
        }),
        // Fetch ALL assigned dates to determine start month (avoids slow MIN() query)
        prisma_1.default.$queryRaw `
        SELECT DISTINCT DATE(qv.assigned_at) as date
        FROM "QuestionVisibility" qv
        JOIN "Class" c ON qv.class_id = c.id
        WHERE c.batch_id = ${batchId}
        AND qv.assigned_at IS NOT NULL
        ORDER BY DATE(qv.assigned_at) ASC
        LIMIT 1
      `
    ]);
    // Compute start month from first assigned date (avoids slow MIN() query)
    let heatmapStartMonth;
    if (assignedDatesForStartMonth.length > 0 && assignedDatesForStartMonth[0].date) {
        const firstDate = new Date(assignedDatesForStartMonth[0].date);
        heatmapStartMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    }
    else {
        heatmapStartMonth = student.batch?.year
            ? new Date(student.batch.year, 0, 1)
            : new Date();
    }
    timings.parallelQueries = Date.now() - t2;
    // 3 Check cache for heatmap
    const t3 = Date.now();
    const startMonthISO = (0, profile_heatmap_service_1.normalizeDate)(heatmapStartMonth);
    const cacheKey = cache_service_1.cacheKeys.heatmap(studentId, batchId, startMonthISO);
    let heatmap = await cache_service_1.cacheService.get(cacheKey);
    timings.cacheCheck = Date.now() - t3;
    if (!heatmap) {
        // 4 Fetch heatmap data sources in parallel
        const t4 = Date.now();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1); // Include today
        const [assignedDates, submissionCounts] = await Promise.all([
            (0, profile_heatmap_service_1.fetchAssignedDates)(batchId, heatmapStartMonth),
            (0, profile_heatmap_service_1.fetchSubmissionCounts)(studentId, heatmapStartMonth)
        ]);
        timings.heatmapDataFetch = Date.now() - t4;
        // 5 Build heatmap in JavaScript
        const t5 = Date.now();
        const completedAll = (0, profile_heatmap_service_1.hasCompletedAllQuestions)(batchQuestionCounts, leaderboard);
        heatmap = (0, profile_heatmap_service_1.buildHeatmapOptimized)({
            startDate: heatmapStartMonth,
            endDate,
            assignedDates,
            submissionCounts,
            completedAll
        });
        timings.heatmapBuild = Date.now() - t5;
        // 6 Store in cache (5 minutes TTL)
        const t6 = Date.now();
        await cache_service_1.cacheService.set(cacheKey, heatmap, 300);
        timings.cacheStore = Date.now() - t6;
    }
    else {
        timings.cacheHit = 1;
    }
    timings.total = Date.now() - startTime;
    // Profile API timings tracked for performance monitoring
    return {
        student: {
            id: student.id,
            name: student.name,
            username: student.username,
            enrollmentId: student.enrollment_id,
            city: student.city?.city_name || null,
            batch: student.batch?.batch_name || null,
            year: student.batch?.year || null,
            github: student.github,
            linkedin: student.linkedin,
            leetcode: student.leetcode_id,
            gfg: student.gfg_id,
            profileImageUrl: student.profile_image_url
        },
        codingStats: {
            totalSolved: student._count.progress,
            totalAssigned: (batchQuestionCounts?.easy_assigned || 0) + (batchQuestionCounts?.medium_assigned || 0) + (batchQuestionCounts?.hard_assigned || 0),
            easy: {
                assigned: batchQuestionCounts?.easy_assigned || 0,
                solved: leaderboard?.easy_solved || 0
            },
            medium: {
                assigned: batchQuestionCounts?.medium_assigned || 0,
                solved: leaderboard?.medium_solved || 0
            },
            hard: {
                assigned: batchQuestionCounts?.hard_assigned || 0,
                solved: leaderboard?.hard_solved || 0
            }
        },
        streak: {
            currentStreak: leaderboard?.current_streak || 0,
            maxStreak: leaderboard?.max_streak || 0
        },
        leaderboard: {
            globalRank: leaderboard?.alltime_global_rank || 0,
            cityRank: leaderboard?.alltime_city_rank || 0
        },
        heatmap: heatmap.map((h) => ({
            date: h.date,
            count: Number(h.count)
        })),
        heatmapStartMonth: startMonthISO,
        recentActivity: recentActivity.map((a) => ({
            question_name: a.question.question_name,
            question_link: a.question.question_link,
            difficulty: a.question.level,
            solvedAt: a.sync_at
        }))
    };
};
exports.getPublicStudentProfileService = getPublicStudentProfileService;
