"use strict";
/**
 * Role Middleware - Role-based access control
 * Provides role-based authorization for different user types and admin levels
 * Ensures only authorized users can access specific routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudent = exports.isTeacherOrAbove = exports.isSuperAdmin = exports.isAdmin = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../utils/ApiError");
/**
 * Restrict access to admin users only
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws ApiError if user is not an admin
 */
const isAdmin = (req, res, next) => {
    if (req.user?.userType !== 'admin') {
        throw new ApiError_1.ApiError(403, 'Access denied. Admin only.', [], 'INSUFFICIENT_PERMISSIONS');
    }
    next();
};
exports.isAdmin = isAdmin;
/**
 * Restrict access to superadmin users only
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws ApiError if user is not a superadmin
 */
const isSuperAdmin = (req, res, next) => {
    if (req.user?.userType !== 'admin' || req.user?.role !== client_1.AdminRole.SUPERADMIN) {
        throw new ApiError_1.ApiError(403, 'Access denied. Superadmin only.', [], 'INSUFFICIENT_PERMISSIONS');
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
/**
 * Restrict access to teachers and superadmins
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws ApiError if user is not a teacher or superadmin
 */
const isTeacherOrAbove = (req, res, next) => {
    if (req.user?.userType !== 'admin' ||
        (req.user?.role !== client_1.AdminRole.SUPERADMIN && req.user?.role !== client_1.AdminRole.TEACHER)) {
        throw new ApiError_1.ApiError(403, 'Access denied. Teacher or Superadmin only.', [], 'INSUFFICIENT_PERMISSIONS');
    }
    next();
};
exports.isTeacherOrAbove = isTeacherOrAbove;
/**
 * Restrict access to student users only
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws ApiError if user is not a student
 */
const isStudent = (req, res, next) => {
    if (req.user?.userType !== 'student') {
        throw new ApiError_1.ApiError(403, 'Access denied. Students only.', [], 'INSUFFICIENT_PERMISSIONS');
    }
    next();
};
exports.isStudent = isStudent;
