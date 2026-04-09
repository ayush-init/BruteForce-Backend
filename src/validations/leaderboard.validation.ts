import { z } from 'zod';
import { paginationSchema } from './common.validation';

// Student leaderboard schema (simplified to match actual Leaderboard model fields)
export const studentLeaderboardSchema = z.object({
  batch_id: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(10), // Lower limit for leaderboard
  sortBy: z.enum(['alltime_global_rank', 'alltime_city_rank', 'max_streak', 'current_streak', 'easy_solved', 'medium_solved', 'hard_solved']).default('alltime_global_rank'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'), // Lower rank is better
});

// Admin leaderboard schema (more comprehensive)
export const adminLeaderboardSchema = z.object({
  batch_id: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sortBy: z.enum(['alltime_global_rank', 'alltime_city_rank', 'max_streak', 'current_streak', 'easy_solved', 'medium_solved', 'hard_solved', 'name', 'email']).default('alltime_global_rank'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'), // Lower rank is better
  // Additional admin filters
  minSolved: z.coerce.number().int().positive().optional(),
  maxSolved: z.coerce.number().int().positive().optional(),
});

// Leaderboard statistics schema
export const leaderboardStatsSchema = z.object({
  batch_id: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
});

// Type exports
export type StudentLeaderboardBody = z.infer<typeof studentLeaderboardSchema>;
export type AdminLeaderboardBody = z.infer<typeof adminLeaderboardSchema>;
export type LeaderboardStatsBody = z.infer<typeof leaderboardStatsSchema>;
