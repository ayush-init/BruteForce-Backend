"use strict";
/**
 * Student Middleware - Student user information extraction
 * Extracts student-specific data from JWT token and attaches to request object
 * Provides student context for student-specific routes and operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStudentInfo = void 0;
/**
 * Extract student information from authenticated user token
 * @param req - Express request object with StudentRequest interface
 * @param res - Express response object
 * @param next - Express next function
 */
const extractStudentInfo = (req, res, next) => {
    const user = req.user;
    if (user?.userType === 'student') {
        // Extract student-specific info from token
        req.student = user;
        req.studentId = user.id;
        req.batchId = user.batchId;
        req.batchName = user.batchName;
        req.batchSlug = user.batchSlug;
        req.cityId = user.cityId;
        req.cityName = user.cityName;
    }
    next();
};
exports.extractStudentInfo = extractStudentInfo;
