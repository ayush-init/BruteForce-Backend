"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionVisibilitySchema = exports.bulkUploadQuestionsSchema = exports.assignQuestionToClassSchema = exports.addedQuestionsQuerySchema = exports.questionQuerySchema = exports.questionIdParamsSchema = exports.updateQuestionSchema = exports.createQuestionSchema = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
// Create question schema
exports.createQuestionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    description: zod_1.z.string().min(1, 'Description is required').max(5000),
    difficulty: common_validation_1.difficultyEnum,
    solutionApproach: zod_1.z.string().max(2000).optional(),
    timeComplexity: zod_1.z.string().max(50).optional(),
    spaceComplexity: zod_1.z.string().max(50).optional(),
    topicSlug: zod_1.z.string().min(1, 'Topic slug is required'),
    externalLinks: zod_1.z.array(zod_1.z.string().url()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Update question schema
exports.updateQuestionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().min(1).max(5000).optional(),
    difficulty: common_validation_1.difficultyEnum.optional(),
    solutionApproach: zod_1.z.string().max(2000).optional(),
    timeComplexity: zod_1.z.string().max(50).optional(),
    spaceComplexity: zod_1.z.string().max(50).optional(),
    externalLinks: zod_1.z.array(zod_1.z.string().url()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Question ID params schema
exports.questionIdParamsSchema = common_validation_1.idSchema;
// Question query schema
exports.questionQuerySchema = common_validation_1.paginationSchema.extend({
    search: zod_1.z.string().optional(),
    difficulty: common_validation_1.difficultyEnum.optional(),
    topicSlug: zod_1.z.string().optional(),
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    solved: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    sortBy: zod_1.z.enum(['title', 'difficulty', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Complex addedQuestions query schema (for student route)
exports.addedQuestionsQuerySchema = common_validation_1.paginationSchema.extend({
    search: zod_1.z.string().optional(),
    difficulty: common_validation_1.difficultyEnum.optional(),
    topicSlug: zod_1.z.string().optional(),
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    solved: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    visibility: common_validation_1.visibilityEnum.optional(),
    dateAdded: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['title', 'difficulty', 'createdAt', 'updatedAt', 'dateAdded']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    // Additional filters for complex queries
    classSlug: zod_1.z.string().optional(),
    isHomework: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    isClasswork: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});
// Assign question to class schema
exports.assignQuestionToClassSchema = zod_1.z.object({
    questionId: zod_1.z.coerce.number().int().positive(),
    visibilityType: common_validation_1.visibilityEnum,
    dueDate: zod_1.z.string().datetime().optional(),
});
// Bulk upload questions schema
exports.bulkUploadQuestionsSchema = zod_1.z.object({
    topicSlug: zod_1.z.string().min(1, 'Topic slug is required'),
    questions: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().min(1).max(200),
        description: zod_1.z.string().min(1).max(5000),
        difficulty: common_validation_1.difficultyEnum,
        solutionApproach: zod_1.z.string().max(2000).optional(),
        timeComplexity: zod_1.z.string().max(50).optional(),
        spaceComplexity: zod_1.z.string().max(50).optional(),
        externalLinks: zod_1.z.array(zod_1.z.string().url()).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    })).min(1, 'At least one question is required'),
});
// Question visibility update schema
exports.updateQuestionVisibilitySchema = zod_1.z.object({
    visibilityType: common_validation_1.visibilityEnum,
    dueDate: zod_1.z.string().datetime().optional(),
});
