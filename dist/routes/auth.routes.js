"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// ===== STUDENT AUTH (Public) =====
router.post('/student/register', auth_controller_1.registerStudent);
router.post('/student/login', auth_controller_1.loginStudent);
router.post('/student/logout', auth_controller_1.logoutStudent);
// ===== ADMIN AUTH (Public) =====
// Note: This is for ALL admins (Superadmin, Teacher, Intern)
router.post('/admin/login', auth_controller_1.loginAdmin);
router.post('/admin/logout', auth_controller_1.logoutAdmin);
exports.default = router;
