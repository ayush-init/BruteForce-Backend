"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortingSchema = exports.dateRangeSchema = exports.roleEnum = exports.visibilityEnum = exports.difficultyEnum = exports.batchFilterSchema = exports.searchQuerySchema = exports.urlSchema = exports.usernameSchema = exports.passwordSchema = exports.emailSchema = exports.slugSchema = exports.idSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
// Common pagination schema
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(50).default(10),
});
// Common ID schema
exports.idSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
// Common slug schema
exports.slugSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1).max(100),
});
// Common email schema
exports.emailSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
// Common password schema
exports.passwordSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
// Common username schema
exports.usernameSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(30, 'Username must be at most 30 characters long')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});
// Common URL schema
exports.urlSchema = zod_1.z.object({
    url: zod_1.z.string().url('Invalid URL format'),
});
// Common search query schema
exports.searchQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
});
// Common batch filter schema
exports.batchFilterSchema = zod_1.z.object({
    batchId: zod_1.z.coerce.number().int().positive().optional(),
});
// Common difficulty enum
exports.difficultyEnum = zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']);
// Common visibility enum
exports.visibilityEnum = zod_1.z.enum(['CLASSWORK', 'HOMEWORK']);
// Common role enum
exports.roleEnum = zod_1.z.enum(['SUPERADMIN', 'ADMIN', 'TEACHER', 'INTERN']);
// Common date range schema
exports.dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Common sorting schema
exports.sortingSchema = zod_1.z.object({
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
