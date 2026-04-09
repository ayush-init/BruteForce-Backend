import { z } from 'zod';
import { paginationSchema, idSchema, slugSchema } from './common.validation';

// Create topic schema (matching Prisma Topic model)
export const createTopicSchema = z.object({
  topic_name: z.string().min(1, 'Topic name is required').max(150),
  description: z.string().max(1000).optional(),
  order: z.coerce.number().int().positive().optional(),
  photo_url: z.string().url().optional(),
});

// Update topic schema
export const updateTopicSchema = z.object({
  topic_name: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  order: z.coerce.number().int().positive().optional(),
  photo_url: z.string().url().optional(),
});

// Topic slug params schema
export const topicSlugParamsSchema = slugSchema.extend({
  topicSlug: z.string().min(1, 'Topic slug is required'),
});

// Topic query schema
export const topicQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  batchId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['topic_name', 'order', 'created_at', 'updated_at']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Topics for batch schema
export const topicsForBatchSchema = z.object({
  batchSlug: z.string().min(1, 'Batch slug is required'),
  includeProgress: z.enum(['true', 'false']).transform(val => val === 'true').default(true),
  includeClasses: z.enum(['true', 'false']).transform(val => val === 'true').default(false),
});

// Topic progress by username schema
export const topicProgressByUsernameSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

// Paginated topics schema (for dropdown)
export const paginatedTopicsSchema = paginationSchema.extend({
  search: z.string().optional(),
  sortBy: z.enum(['topic_name', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Bulk create topics schema
export const bulkCreateTopicsSchema = z.object({
  topics: z.array(z.object({
    topic_name: z.string().min(1).max(150),
    description: z.string().max(1000).optional(),
    order: z.coerce.number().int().positive(),
    photo_url: z.string().url().optional(),
  })).min(1, 'At least one topic is required'),
});

// Type exports
export type CreateTopicBody = z.infer<typeof createTopicSchema>;
export type UpdateTopicBody = z.infer<typeof updateTopicSchema>;
export type TopicSlugParams = z.infer<typeof topicSlugParamsSchema>;
export type TopicQuery = z.infer<typeof topicQuerySchema>;
export type TopicsForBatchQuery = z.infer<typeof topicsForBatchSchema>;
export type TopicProgressByUsernameParams = z.infer<typeof topicProgressByUsernameSchema>;
export type PaginatedTopicsQuery = z.infer<typeof paginatedTopicsSchema>;
export type BulkCreateTopicsBody = z.infer<typeof bulkCreateTopicsSchema>;
