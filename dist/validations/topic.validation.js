"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateTopicsSchema = exports.paginatedTopicsSchema = exports.topicProgressByUsernameSchema = exports.topicsForBatchSchema = exports.topicQuerySchema = exports.topicSlugParamsSchema = exports.updateTopicSchema = exports.createTopicSchema = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
// Create topic schema
exports.createTopicSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Topic name is required').max(100),
    description: zod_1.z.string().max(1000).optional(),
    duration: zod_1.z.coerce.number().int().positive('Duration must be a positive integer (in hours)'),
    order: zod_1.z.coerce.number().int().positive().optional(),
    photo: zod_1.z.string().url().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Update topic schema
exports.updateTopicSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(1000).optional(),
    duration: zod_1.z.coerce.number().int().positive().optional(),
    order: zod_1.z.coerce.number().int().positive().optional(),
    photo: zod_1.z.string().url().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Topic slug params schema
exports.topicSlugParamsSchema = common_validation_1.slugSchema.extend({
    topicSlug: zod_1.z.string().min(1, 'Topic slug is required'),
});
// Topic query schema
exports.topicQuerySchema = common_validation_1.paginationSchema.extend({
    search: zod_1.z.string().optional(),
    batchId: zod_1.z.coerce.number().int().positive().optional(),
    sortBy: zod_1.z.enum(['name', 'order', 'duration', 'createdAt', 'updatedAt']).default('order'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
// Topics for batch schema
exports.topicsForBatchSchema = zod_1.z.object({
    batchSlug: zod_1.z.string().min(1, 'Batch slug is required'),
    includeProgress: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').default(true),
    includeClasses: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').default(false),
});
// Topic progress by username schema
exports.topicProgressByUsernameSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
});
// Paginated topics schema (for dropdown)
exports.paginatedTopicsSchema = common_validation_1.paginationSchema.extend({
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['name', 'order']).default('order'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
// Bulk create topics schema
exports.bulkCreateTopicsSchema = zod_1.z.object({
    topics: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(1000).optional(),
        duration: zod_1.z.coerce.number().int().positive(),
        order: zod_1.z.coerce.number().int().positive(),
        photo: zod_1.z.string().url().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    })).min(1, 'At least one topic is required'),
});
