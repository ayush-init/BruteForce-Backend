import { z } from 'zod';
import { emailSchema, passwordSchema, usernameSchema } from './common.validation';

// Student registration schema
export const studentRegisterSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema.shape.password,
  username: usernameSchema.shape.username.optional(),
  name: z.string().min(1, 'Name is required').max(100),
  batch_id: z.coerce.number().int().positive('Batch ID must be a positive integer'),
  city_id: z.coerce.number().int().positive('City ID must be a positive integer').optional(),
  enrollment_id: z.string().optional(),
  leetcode_id: z.string().optional(),
  gfg_id: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

// Alternative student registration that accepts firstName/lastName and transforms
export const studentRegisterWithNameTransform = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: emailSchema.shape.email,
  password: passwordSchema.shape.password,
  username: usernameSchema.shape.username.optional(),
  batch_id: z.coerce.number().int().positive('Batch ID must be a positive integer'),
  city_id: z.coerce.number().int().positive('City ID must be a positive integer').optional(),
  enrollment_id: z.string().optional(),
  leetcode_id: z.string().optional(),
  gfg_id: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
}).transform(({ firstName, lastName, ...rest }) => ({
  name: `${firstName} ${lastName}`,
  ...rest
}));

// Student login schema
export const studentLoginSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema.shape.password,
});

// Admin registration schema
export const adminRegisterSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema.shape.password,
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum(['SUPERADMIN', 'TEACHER']).default('TEACHER'),
  city_id: z.coerce.number().int().positive('City ID must be a positive integer').optional(),
  batch_id: z.coerce.number().int().positive('Batch ID must be a positive integer').optional(),
});

// Alternative admin registration that accepts firstName/lastName and transforms
export const adminRegisterWithNameTransform = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: emailSchema.shape.email,
  password: passwordSchema.shape.password,
  role: z.enum(['SUPERADMIN', 'TEACHER']).default('TEACHER'),
  city_id: z.coerce.number().int().positive('City ID must be a positive integer').optional(),
  batch_id: z.coerce.number().int().positive('Batch ID must be a positive integer').optional(),
}).transform(({ firstName, lastName, ...rest }) => ({
  name: `${firstName} ${lastName}`,
  ...rest
}));

// Admin login schema
export const adminLoginSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema.shape.password,
});

// Google OAuth schema
export const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema.shape.email,
});

// Verify OTP schema
export const verifyOtpSchema = z.object({
  email: emailSchema.shape.email,
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema.shape.email,
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: passwordSchema.shape.password,
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Type exports
export type StudentRegisterBody = z.infer<typeof studentRegisterSchema>;
export type StudentLoginBody = z.infer<typeof studentLoginSchema>;
export type AdminLoginBody = z.infer<typeof adminLoginSchema>;
export type GoogleAuthBody = z.infer<typeof googleAuthSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
