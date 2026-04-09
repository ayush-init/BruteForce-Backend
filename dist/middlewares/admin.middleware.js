"use strict";
/**
 * Admin Middleware - Admin user information extraction
 * Extracts admin-specific data from JWT token and attaches to request object
 * Provides admin context for admin-specific routes and operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAdminInfo = void 0;
/**
 * Extract admin information from authenticated user token
 * @param req - Express request object with AdminRequest interface
 * @param res - Express response object
 * @param next - Express next function
 */
const extractAdminInfo = (req, res, next) => {
    const user = req.user;
    if (user?.userType === 'admin') {
        // Extract admin-specific info from token
        req.admin = user;
        req.defaultBatchId = user.batchId;
        req.defaultBatchName = user.batchName;
        req.defaultBatchSlug = user.batchSlug;
        req.defaultCityId = user.cityId;
        req.defaultCityName = user.cityName;
    }
    next();
};
exports.extractAdminInfo = extractAdminInfo;
