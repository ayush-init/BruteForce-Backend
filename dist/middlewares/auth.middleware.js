"use strict";
/**
 * Authentication Middleware - JWT token verification
 * Verifies Bearer tokens and extracts user information for authenticated requests
 * Provides secure authentication middleware for protected routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const ApiError_1 = require("../utils/ApiError");
/**
 * Verify JWT token and extract user information
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws ApiError if token is missing, invalid, or malformed
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Check if authorization header exists and has Bearer prefix
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError_1.ApiError(401, "No token provided or invalid token format", [], "NO_TOKEN");
    }
    // Extract token from Bearer header
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new ApiError_1.ApiError(401, "Token is required", [], "MISSING_TOKEN");
    }
    try {
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError) {
            throw error;
        }
        throw new ApiError_1.ApiError(401, "Invalid or expired token", [], "INVALID_TOKEN");
    }
};
exports.verifyToken = verifyToken;
