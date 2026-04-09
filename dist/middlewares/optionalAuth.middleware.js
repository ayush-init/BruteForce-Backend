"use strict";
/**
 * Optional Authentication Middleware - Optional JWT verification
 * Provides optional authentication that doesn't block requests if no token is provided
 * Useful for routes that work with or without authentication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = void 0;
const jwt_util_1 = require("../utils/jwt.util");
/**
 * Optional authentication middleware - continues regardless of auth status
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // No token provided, continue without authentication
        return next();
    }
    // Extract token from Bearer header
    const token = authHeader.split(" ")[1];
    if (!token) {
        // No token provided, continue without authentication
        return next();
    }
    try {
        // Verify token using our JWT utility
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        // Attach user to request with same structure as other middleware
        req.user = decoded;
        next();
    }
    catch (error) {
        // Invalid token, continue without authentication
        // This is optional auth, so we don't throw errors
        next();
    }
};
exports.optionalAuth = optionalAuth;
