"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_validation_1 = require("../validations/auth.validation");
const router = (0, express_1.Router)();
// ===== STUDENT AUTH (Public) =====
router.post('/student/register', rateLimiter_1.authLimiter, (0, validation_middleware_1.validateBody)(auth_validation_1.studentRegisterSchema), auth_controller_1.registerStudent);
router.post('/student/login', rateLimiter_1.authLimiter, (0, validation_middleware_1.validateBody)(auth_validation_1.studentLoginSchema), auth_controller_1.loginStudent);
router.post('/student/logout', auth_controller_1.logoutStudent);
// ===== ADMIN AUTH (Public) =====
// Note: This is for ALL admins (Superadmin, Teacher, Intern)
router.post('/admin/login', rateLimiter_1.authLimiter, (0, validation_middleware_1.validateBody)(auth_validation_1.adminLoginSchema), auth_controller_1.loginAdmin);
router.post('/admin/logout', auth_controller_1.logoutAdmin);
// ===== TOKEN REFRESH (Public) =====
router.post('/refresh-token', (0, validation_middleware_1.validateBody)(auth_validation_1.refreshTokenSchema), auth_controller_1.refreshToken);
// ===== PASSWORD RESET (Public) =====
router.post('/forgot-password', (0, validation_middleware_1.validateBody)(auth_validation_1.forgotPasswordSchema), auth_controller_1.forgotPassword);
router.post('/verify-otp', rateLimiter_1.authLimiter, (0, validation_middleware_1.validateBody)(auth_validation_1.verifyOtpSchema), auth_controller_1.verifyOtp);
router.post('/reset-password', (0, validation_middleware_1.validateBody)(auth_validation_1.resetPasswordSchema), auth_controller_1.resetPassword);
// ===== GOOGLE OAUTH (Public) =====
router.post('/google-login', (0, validation_middleware_1.validateBody)(auth_validation_1.googleAuthSchema), auth_controller_1.googleLogin);
exports.default = router;
