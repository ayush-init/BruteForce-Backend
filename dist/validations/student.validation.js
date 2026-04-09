"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentSchema = exports.studentReportSchema = exports.studentQuerySchema = exports.addStudentProgressSchema = exports.usernameParamsSchema = exports.studentIdParamsSchema = exports.updateUsernameSchema = exports.updateStudentProfileSchema = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
// Student profile update schema
exports.updateStudentProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    phone: zod_1.z.string().optional(),
    codingProfiles: zod_1.z.object({
        leetcode: zod_1.z.string().url().optional().nullable(),
        codeforces: zod_1.z.string().url().optional().nullable(),
        codechef: zod_1.z.string().url().optional().nullable(),
        hackerrank: zod_1.z.string().url().optional().nullable(),
        github: zod_1.z.string().url().optional().nullable(),
    }).optional(),
    bio: zod_1.z.string().max(500).optional(),
});
// Username update schema
exports.updateUsernameSchema = zod_1.z.object({
    username: common_validation_1.usernameSchema.shape.username,
});
// Student ID params schema
exports.studentIdParamsSchema = common_validation_1.idSchema;
// Username params schema
exports.usernameParamsSchema = common_validation_1.slugSchema;
// Student progress schema
exports.addStudentProgressSchema = zod_1.z.object({
    studentId: zod_1.z.coerce.number().int().positive(),
    topicSlug: zod_1.z.string().min(1),
    classSlug: zod_1.z.string().min(1),
    questionId: zod_1.z.coerce.number().int().positive(),
    status: zod_1.z.enum(['SOLVED', 'ATTEMPTED', 'REVIEW']),
    difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    timeTaken: zod_1.z.coerce.number().int().positive().optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
// Student query schema with filters
exports.studentQuerySchema = common_validation_1.paginationSchema.extend({
    search: zod_1.z.string().optional(),
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    cityId: zod_1.z.coerce.number().int().positive().optional(),
    sortBy: zod_1.z.enum(['name', 'email', 'batch', 'city', 'createdAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Student report schema
exports.studentReportSchema = zod_1.z.object({
    studentId: zod_1.z.coerce.number().int().positive(),
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    topicSlug: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Create student schema (admin only)
exports.createStudentSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
    username: common_validation_1.usernameSchema.shape.username,
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    batchId: zod_1.z.coerce.number().int().positive(),
    cityId: zod_1.z.coerce.number().int().positive(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6).optional(), // Optional for admin creation
});
