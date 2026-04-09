"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentProfileService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
const cache_service_1 = require("../cache.service");
const profile_heatmap_service_1 = require("./profile-heatmap.service");
const getStudentProfileService = async (studentId) => {
    try {
        // 1 Get student basic info + leaderboard (single query with all relations)
        const student = await prisma_1.default.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
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
        if (!student) {
            throw new ApiError_1.ApiError(400, "Student not found");
        }
        const batchId = student.batch_id;
        const leaderboard = student.leaderboards;
        // 2 Parallel execution: Batch counts, Recent activity, Heatmap start month
        const [batchQuestionCounts, recentActivity, heatmapStartMonth] = await Promise.all([
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
            (0, profile_heatmap_service_1.getBatchStartMonth)(batchId, student.batch?.year)
        ]);
        // 3 Check cache for heatmap
        const startMonthISO = (0, profile_heatmap_service_1.normalizeDate)(heatmapStartMonth);
        const cacheKey = cache_service_1.cacheKeys.heatmap(studentId, batchId, startMonthISO);
        let heatmap = await cache_service_1.cacheService.get(cacheKey);
        let assignedDates = null;
        let submissionCounts = null;
        if (!heatmap) {
            // 4 Fetch heatmap data sources in parallel
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1); // Include today
            const [fetchedAssignedDates, fetchedSubmissionCounts] = await Promise.all([
                (0, profile_heatmap_service_1.fetchAssignedDates)(batchId, heatmapStartMonth),
                (0, profile_heatmap_service_1.fetchSubmissionCounts)(studentId, heatmapStartMonth)
            ]);
            assignedDates = fetchedAssignedDates;
            submissionCounts = fetchedSubmissionCounts;
            // 5 Build heatmap in JavaScript
            const completedAll = (0, profile_heatmap_service_1.hasCompletedAllQuestions)(batchQuestionCounts, leaderboard);
            heatmap = (0, profile_heatmap_service_1.buildHeatmapOptimized)({
                startDate: heatmapStartMonth,
                endDate,
                assignedDates,
                submissionCounts,
                completedAll
            });
            // 6 Store in cache (5 minutes TTL)
            await cache_service_1.cacheService.set(cacheKey, heatmap, 300);
        }
        // 7 Calculate today's stats
        const todayCount = submissionCounts ? (0, profile_heatmap_service_1.getTodayCount)(submissionCounts) : 0;
        const hasQuestionResult = assignedDates ? (0, profile_heatmap_service_1.hasQuestionToday)(assignedDates) : false;
        return {
            student: {
                name: student.name,
                username: student.username,
                email: student.email,
                enrollmentId: student.enrollment_id,
                city: student.city?.city_name || null,
                cityId: student.city?.id || null,
                batch: student.batch?.batch_name || null,
                batchId: student.batch?.id || null,
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
                maxStreak: leaderboard?.max_streak || 0,
                count: todayCount,
                hasQuestion: hasQuestionResult
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
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, "Student profile retrieval failed: " +
            (error instanceof Error ? error.message : String(error)));
    }
};
exports.getStudentProfileService = getStudentProfileService;
