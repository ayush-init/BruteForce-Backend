import { z } from 'zod';

// Common pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// Common ID schema
export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Common slug schema
export const slugSchema = z.object({
  slug: z.string().min(1).max(100),
});

// Common email schema
export const emailSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Common password schema
export const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Common username schema
export const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be at most 30 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

// Common URL schema
export const urlSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

// Common search query schema
export const searchQuerySchema = z.object({
  search: z.string().optional(),
});

// Common batch filter schema
export const batchFilterSchema = z.object({
  batchId: z.coerce.number().int().positive().optional(),
});

// Common difficulty enum (matching Prisma Level enum)
export const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

// Common visibility enum (matching Prisma QuestionType enum - order matters)
export const visibilityEnum = z.enum(['HOMEWORK', 'CLASSWORK']);

// Common role enum (matching Prisma AdminRole enum)
export const roleEnum = z.enum(['SUPERADMIN', 'TEACHER']);

// Common date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Common sorting schema
export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type Pagination = z.infer<typeof paginationSchema>;
export type IdParams = z.infer<typeof idSchema>;
export type SlugParams = z.infer<typeof slugSchema>;
export type EmailBody = z.infer<typeof emailSchema>;
export type PasswordBody = z.infer<typeof passwordSchema>;
export type UsernameBody = z.infer<typeof usernameSchema>;
export type UrlBody = z.infer<typeof urlSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type BatchFilter = z.infer<typeof batchFilterSchema>;
export type Difficulty = z.infer<typeof difficultyEnum>;
export type Visibility = z.infer<typeof visibilityEnum>;
export type Role = z.infer<typeof roleEnum>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Sorting = z.infer<typeof sortingSchema>;
