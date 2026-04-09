import { z } from 'zod';
import { paginationSchema, idSchema, slugSchema } from './common.validation';

// Database enums (matching Prisma schema)
const levelEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
const platformEnum = z.enum(['LEETCODE', 'GFG', 'OTHER', 'INTERVIEWBIT']);
const questionTypeEnum = z.enum(['HOMEWORK', 'CLASSWORK']);

// Create question schema (matching Prisma Question model)
export const createQuestionSchema = z.object({
  question_name: z.string().min(1, 'Question name is required').max(255),
  question_link: z.string().min(1, 'Question link is required').url(),
  topic_id: z.coerce.number().int().positive('Topic ID must be a positive integer'),
  platform: platformEnum.optional(),
  level: levelEnum.default('MEDIUM'),
});

// Update question schema
export const updateQuestionSchema = z.object({
  question_name: z.string().min(1).max(255).optional(),
  question_link: z.string().min(1).url().optional(),
  topic_id: z.coerce.number().int().positive().optional(),
  platform: platformEnum.optional(),
  level: levelEnum.optional(),
});

// Question ID params schema
export const questionIdParamsSchema = idSchema;

// Question query schema
export const questionQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  level: levelEnum.optional(),
  topicId: z.coerce.number().int().positive().optional(),
  platform: platformEnum.optional(),
  sortBy: z.enum(['question_name', 'level', 'created_at', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Complex addedQuestions query schema (for student route)
export const addedQuestionsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  level: levelEnum.optional(),
  topicSlug: z.string().optional(),
  batchId: z.coerce.number().int().positive().optional(),
  solved: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  type: questionTypeEnum.optional(),
  dateAdded: z.string().datetime().optional(),
  sortBy: z.enum(['question_name', 'level', 'created_at', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  // Additional filters for complex queries
  classSlug: z.string().optional(),
  isHomework: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  isClasswork: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});

// Assign question to class schema
export const assignQuestionToClassSchema = z.object({
  questionId: z.coerce.number().int().positive(),
  type: questionTypeEnum,
});

// Bulk upload questions schema
export const bulkUploadQuestionsSchema = z.object({
  topic_id: z.coerce.number().int().positive('Topic ID must be a positive integer'),
  questions: z.array(z.object({
    question_name: z.string().min(1).max(255),
    question_link: z.string().min(1).url(),
    level: levelEnum.default('MEDIUM'),
    platform: platformEnum.optional(),
  })).min(1, 'At least one question is required'),
});

// Question visibility update schema
export const updateQuestionVisibilitySchema = z.object({
  type: questionTypeEnum,
});

// Type exports
export type CreateQuestionBody = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionBody = z.infer<typeof updateQuestionSchema>;
export type QuestionIdParams = z.infer<typeof questionIdParamsSchema>;
export type QuestionQuery = z.infer<typeof questionQuerySchema>;
export type AddedQuestionsQuery = z.infer<typeof addedQuestionsQuerySchema>;
export type AssignQuestionToClassBody = z.infer<typeof assignQuestionToClassSchema>;
export type BulkUploadQuestionsBody = z.infer<typeof bulkUploadQuestionsSchema>;
export type UpdateQuestionVisibilityBody = z.infer<typeof updateQuestionVisibilitySchema>;
