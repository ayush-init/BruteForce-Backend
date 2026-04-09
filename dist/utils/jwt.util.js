"use strict";
/**
 * JWT Utility - Token generation and verification
 * Handles access token and refresh token operations with proper error handling
 * Provides secure JWT-based authentication for the DSA Tracker application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("./ApiError");
/**
 * Generate access token with 15-minute expiration
 * @param payload - User information to encode in token
 * @returns JWT access token string
 * @throws ApiError if token generation fails
 */
const generateAccessToken = (payload) => {
    try {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError_1.ApiError(500, "ACCESS_TOKEN_SECRET environment variable is not set", [], "MISSING_SECRET");
        }
        return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Failed to generate access token", [], "TOKEN_GENERATION_ERROR");
    }
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate refresh token with 7-day expiration
 * @param payload - User information to encode in token
 * @returns JWT refresh token string
 * @throws ApiError if token generation fails
 */
const generateRefreshToken = (payload) => {
    try {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new ApiError_1.ApiError(500, "REFRESH_TOKEN_SECRET environment variable is not set", [], "MISSING_SECRET");
        }
        return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Failed to generate refresh token", [], "TOKEN_GENERATION_ERROR");
    }
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify and decode access token
 * @param token - JWT access token to verify
 * @returns Decoded token payload
 * @throws ApiError if token is invalid or verification fails
 */
const verifyAccessToken = (token) => {
    try {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError_1.ApiError(500, "ACCESS_TOKEN_SECRET environment variable is not set", [], "MISSING_SECRET");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new ApiError_1.ApiError(401, "Invalid or expired access token", [], "INVALID_TOKEN");
        }
        throw new ApiError_1.ApiError(500, "Failed to verify access token", [], "TOKEN_VERIFICATION_ERROR");
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify and decode refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload
 * @throws ApiError if token is invalid or verification fails
 */
const verifyRefreshToken = (token) => {
    try {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new ApiError_1.ApiError(500, "REFRESH_TOKEN_SECRET environment variable is not set", [], "MISSING_SECRET");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new ApiError_1.ApiError(401, "Invalid or expired refresh token", [], "INVALID_TOKEN");
        }
        throw new ApiError_1.ApiError(500, "Failed to verify refresh token", [], "TOKEN_VERIFICATION_ERROR");
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
