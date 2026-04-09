import { Router } from 'express';
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  logoutStudent,
  logoutAdmin,
  refreshToken,
  googleLogin,
  forgotPassword,
  resetPassword,
  verifyOtp,
} from '../controllers/auth.controller';
import { passwordResetLimiter, otpLimiter } from '../utils/rateLimit.util';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validation.middleware';
import {
  studentRegisterSchema,
  studentLoginSchema,
  adminLoginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validations/auth.validation';

const router = Router();

// ===== STUDENT AUTH (Public) =====
router.post('/student/register', authLimiter, validateBody(studentRegisterSchema), registerStudent);
router.post('/student/login', authLimiter, validateBody(studentLoginSchema), loginStudent);
router.post('/student/logout', logoutStudent);

// ===== ADMIN AUTH (Public) =====
// Note: This is for ALL admins (Superadmin, Teacher, Intern)
router.post('/admin/login', authLimiter, validateBody(adminLoginSchema), loginAdmin);
router.post('/admin/logout', logoutAdmin);

// ===== TOKEN REFRESH (Public) =====
router.post('/refresh-token', validateBody(refreshTokenSchema), refreshToken);

// ===== PASSWORD RESET (Public) =====
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', authLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

// ===== GOOGLE OAUTH (Public) =====
router.post('/google-login', validateBody(googleAuthSchema), googleLogin);

export default router;
