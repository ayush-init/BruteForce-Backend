import { Router } from 'express';
import {
  registerStudent,
  loginStudent,
  loginAdmin,
} from '../controllers/auth.controller';

const router = Router();

// ===== STUDENT AUTH (Public) =====
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);

// ===== ADMIN AUTH (Public) =====
// Note: This is for ALL admins (Superadmin, Teacher, Intern)
router.post('/admin/login', loginAdmin);

// ===== OPTIONAL: Google OAuth (Add later) =====
// router.post('/google', googleOAuth);

export default router;
