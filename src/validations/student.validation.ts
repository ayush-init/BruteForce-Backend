import { z } from 'zod';
import { paginationSchema, idSchema, slugSchema, usernameSchema, emailSchema } from './common.validation';

// Student profile update schema (matching Prisma Student model)
export const updateStudentProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.shape.email.optional(),
  username: usernameSchema.shape.username.optional(),
  leetcode_id: z.string().max(100).optional(),
  gfg_id: z.string().max(100).optional(),
  github: z.string().max(100).optional(),
  linkedin: z.string().max(150).optional(),
  city_id: z.coerce.number().int().positive().optional(),
  batch_id: z.coerce.number().int().positive().optional(),
});

// Alternative profile update that accepts firstName/lastName and transforms
export const updateStudentProfileWithNameTransform = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: emailSchema.shape.email.optional(),
  username: usernameSchema.shape.username.optional(),
  leetcode_id: z.string().max(100).optional(),
  gfg_id: z.string().max(100).optional(),
  github: z.string().max(100).optional(),
  linkedin: z.string().max(150).optional(),
  city_id: z.coerce.number().int().positive().optional(),
  batch_id: z.coerce.number().int().positive().optional(),
}).transform(({ firstName, lastName, ...rest }) => ({
  name: `${firstName} ${lastName}`,
  ...rest
}));

// Username update schema
export const updateUsernameSchema = z.object({
  username: usernameSchema.shape.username,
});

// Student ID params schema
export const studentIdParamsSchema = idSchema;

// Username params schema
export const usernameParamsSchema = slugSchema;

// Student progress schema (simplified - actual StudentProgress model only has student_id, question_id)
export const addStudentProgressSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  question_id: z.coerce.number().int().positive(),
});

// Student query schema with filters
export const studentQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  batch_id: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['name', 'email', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Student report schema
export const studentReportSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  batch_id: z.coerce.number().int().positive().optional(),
  topicSlug: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Create student schema (admin only) - matching StudentData interface
export const createStudentSchema = z.object({
  email: emailSchema.shape.email,
  username: usernameSchema.shape.username.optional(),
  name: z.string().min(1).max(100),
  password: z.string().min(6),
  enrollment_id: z.string().optional(),
  batch_id: z.coerce.number().int().positive(),
  city_id: z.coerce.number().int().positive().optional(),
  leetcode_id: z.string().max(100).optional(),
  gfg_id: z.string().max(100).optional(),
  github: z.string().max(100).optional(),
  linkedin: z.string().max(150).optional(),
});

// Type exports
export type UpdateStudentProfileBody = z.infer<typeof updateStudentProfileSchema>;
export type UpdateUsernameBody = z.infer<typeof updateUsernameSchema>;
export type StudentIdParams = z.infer<typeof studentIdParamsSchema>;
export type UsernameParams = z.infer<typeof usernameParamsSchema>;
export type AddStudentProgressBody = z.infer<typeof addStudentProgressSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
export type StudentReportBody = z.infer<typeof studentReportSchema>;
export type CreateStudentBody = z.infer<typeof createStudentSchema>;
