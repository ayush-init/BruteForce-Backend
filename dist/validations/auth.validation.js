"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.resetPasswordSchema = exports.verifyOtpSchema = exports.forgotPasswordSchema = exports.googleAuthSchema = exports.adminLoginSchema = exports.studentLoginSchema = exports.studentRegisterSchema = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
// Student registration schema
exports.studentRegisterSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
    password: common_validation_1.passwordSchema.shape.password,
    username: common_validation_1.usernameSchema.shape.username,
    firstName: zod_1.z.string().min(1, 'First name is required').max(50),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50),
    batchId: zod_1.z.coerce.number().int().positive('Batch ID must be a positive integer'),
    cityId: zod_1.z.coerce.number().int().positive('City ID must be a positive integer'),
    phone: zod_1.z.string().optional(),
});
// Student login schema
exports.studentLoginSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
    password: common_validation_1.passwordSchema.shape.password,
});
// Admin login schema
exports.adminLoginSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
    password: common_validation_1.passwordSchema.shape.password,
});
// Google OAuth schema
exports.googleAuthSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Google token is required'),
});
// Forgot password schema
exports.forgotPasswordSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
});
// Verify OTP schema
exports.verifyOtpSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits'),
});
// Reset password schema
exports.resetPasswordSchema = zod_1.z.object({
    email: common_validation_1.emailSchema.shape.email,
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits'),
    newPassword: common_validation_1.passwordSchema.shape.password,
});
// Refresh token schema
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
