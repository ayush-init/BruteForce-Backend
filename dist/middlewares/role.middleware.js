"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudent = exports.isTeacherOrAbove = exports.isSuperAdmin = exports.isAdmin = void 0;
const client_1 = require("@prisma/client");
const isAdmin = (req, res, next) => {
    if (req.user?.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};
exports.isAdmin = isAdmin;
const isSuperAdmin = (req, res, next) => {
    if (req.user?.userType !== 'admin' || req.user?.role !== client_1.AdminRole.SUPERADMIN) {
        return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
const isTeacherOrAbove = (req, res, next) => {
    if (req.user?.userType !== 'admin' ||
        (req.user?.role !== client_1.AdminRole.SUPERADMIN && req.user?.role !== client_1.AdminRole.TEACHER)) {
        return res.status(403).json({ error: 'Access denied. Teacher or Superadmin only.' });
    }
    next();
};
exports.isTeacherOrAbove = isTeacherOrAbove;
const isStudent = (req, res, next) => {
    if (req.user?.userType !== 'student') {
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
};
exports.isStudent = isStudent;
