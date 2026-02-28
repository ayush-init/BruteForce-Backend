import { Router } from 'express';
import {
  registerStudent,
  loginStudent,
  loginAdmin,
} from '../controllers/auth.controller';

const router = Router();

// Student routes
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);

// Admin routes
router.post('/admin/login', loginAdmin);

export default router;