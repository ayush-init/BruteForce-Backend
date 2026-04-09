"use strict";
/**
 * Authentication Controller - User authentication endpoints
 * Handles user registration, login, and authentication token management
 * Provides secure access control for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.logoutAdmin = exports.logoutStudent = exports.googleLogin = exports.refreshToken = exports.loginAdmin = exports.registerAdmin = exports.loginStudent = exports.registerStudent = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const auth_login_service_1 = require("../services/auth/auth-login.service");
const auth_logout_service_1 = require("../services/auth/auth-logout.service");
const auth_password_service_1 = require("../services/auth/auth-password.service");
const auth_register_service_1 = require("../services/auth/auth-register.service");
// Student Registration
exports.registerStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await (0, auth_register_service_1.registerStudent)(req.body);
    res.status(201).json({
        message: 'Student registered successfully',
        user: student,
    });
});
// Student Login
exports.loginStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { user, accessToken, refreshToken } = await (0, auth_login_service_1.loginStudent)(req.body);
    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
    res.json({
        message: 'Login successful',
        accessToken,
        user,
    });
});
// Admin/Teacher Registration
exports.registerAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { user, accessToken, refreshToken } = await (0, auth_register_service_1.registerAdmin)({
        ...req.body,
        currentUserRole: req.user?.role
    });
    res.status(201).json({
        message: 'Admin registered successfully',
        accessToken,
        user,
    });
});
// Admin Login
exports.loginAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { user, accessToken, refreshToken } = await (0, auth_login_service_1.loginAdmin)(req.body);
    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
    res.json({
        message: 'Login successful',
        accessToken,
        user,
    });
});
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken } = await (0, auth_login_service_1.refreshAccessToken)(refreshToken);
    res.json({ accessToken });
});
exports.googleLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { idToken } = req.body;
    const { user, accessToken, refreshToken } = await (0, auth_login_service_1.googleAuth)(idToken);
    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
    res.json({
        message: "Google login successful",
        accessToken,
        user,
    });
});
// Student Logout
exports.logoutStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = req.student;
    if (!student) {
        throw new ApiError_1.ApiError(401, "Authentication required - student information missing");
    }
    await (0, auth_logout_service_1.logoutStudent)(student.id);
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.json({
        message: "Student logout successful",
    });
});
// Admin Logout
exports.logoutAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = req.admin;
    if (!admin) {
        throw new ApiError_1.ApiError(401, "Authentication required - admin information missing");
    }
    await (0, auth_logout_service_1.logoutAdmin)(admin.id);
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.json({
        message: "Admin logout successful",
    });
});
// Forgot Password - Send OTP
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const result = await (0, auth_password_service_1.sendPasswordResetOTP)(email);
    res.json(result);
});
// Verify OTP - Only validate OTP, don't reset password
exports.verifyOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    const result = await (0, auth_password_service_1.verifyOTP)(email, otp);
    res.json(result);
});
// Reset Password - Verify OTP and reset password
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await (0, auth_password_service_1.resetPassword)(email, otp, newPassword);
    res.json(result);
});
