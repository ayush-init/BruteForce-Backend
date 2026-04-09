"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardStatsSchema = exports.adminLeaderboardSchema = exports.studentLeaderboardSchema = void 0;
const zod_1 = require("zod");
// Student leaderboard schema
exports.studentLeaderboardSchema = zod_1.z.object({
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    cityId: zod_1.z.coerce.number().int().positive().optional(),
    timeRange: zod_1.z.enum(['week', 'month', 'quarter', 'year', 'all']).default('all'),
    difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    topicSlug: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(20).default(10), // Lower limit for leaderboard
    sortBy: zod_1.z.enum(['totalSolved', 'easySolved', 'mediumSolved', 'hardSolved', 'streak', 'accuracy']).default('totalSolved'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Admin leaderboard schema (more comprehensive)
exports.adminLeaderboardSchema = zod_1.z.object({
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    cityId: zod_1.z.coerce.number().int().positive().optional(),
    timeRange: zod_1.z.enum(['week', 'month', 'quarter', 'year', 'all']).default('all'),
    difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    topicSlug: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(50).default(10),
    sortBy: zod_1.z.enum(['totalSolved', 'easySolved', 'mediumSolved', 'hardSolved', 'streak', 'accuracy', 'name', 'email', 'batch', 'city']).default('totalSolved'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    // Additional admin filters
    isActive: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    hasSolvedAny: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    minSolved: zod_1.z.coerce.number().int().positive().optional(),
    maxSolved: zod_1.z.coerce.number().int().positive().optional(),
});
// Leaderboard statistics schema
exports.leaderboardStatsSchema = zod_1.z.object({
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    cityId: zod_1.z.coerce.number().int().positive().optional(),
    timeRange: zod_1.z.enum(['week', 'month', 'quarter', 'year', 'all']).default('all'),
    difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    topicSlug: zod_1.z.string().optional(),
});
