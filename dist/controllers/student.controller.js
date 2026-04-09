"use strict";
/**
 * Student Controller - Comprehensive student management endpoints
 * Handles student CRUD operations, profile management, username operations, and progress tracking
 * Consolidates student-related functionality from multiple controllers for better organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsername = exports.checkUsernameAvailability = exports.updateStudentProfile = exports.getPublicStudentProfile = exports.getStudentProfile = exports.addStudentProgressController = exports.createStudentController = exports.getStudentReportController = exports.getAllStudentsController = exports.deleteStudentDetails = exports.updateStudentDetails = exports.getCurrentStudent = void 0;
const student_service_1 = require("../services/students/student.service");
const student_progress_service_1 = require("../services/students/student-progress.service");
const student_query_service_1 = require("../services/students/student-query.service");
const student_response_service_1 = require("../services/students/student-response.service");
const profile_core_service_1 = require("../services/students/profile-core.service");
const profile_public_service_1 = require("../services/students/profile-public.service");
const username_service_1 = require("../services/students/username.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
/**
 * Get current authenticated student profile
 * Returns formatted student data for header/homepage display
 */
exports.getCurrentStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Validate authentication using service
    const studentId = (0, student_response_service_1.validateAuthenticatedStudent)(req.user);
    if (!studentId) {
        throw new ApiError_1.ApiError(401, "Authentication required");
    }
    const student = await (0, student_service_1.getCurrentStudentService)(studentId);
    // Format response using service
    return res.status(200).json((0, student_response_service_1.formatStudentResponse)(student));
});
exports.updateStudentDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Validate student ID using service
    const studentId = (0, student_response_service_1.validateStudentId)(req.params.id);
    if (!studentId) {
        throw new ApiError_1.ApiError(400, "Invalid student ID");
    }
    const student = await (0, student_service_1.updateStudentDetailsService)(studentId, req.body);
    return res.json({
        message: "Student updated successfully",
        data: student
    });
});
exports.deleteStudentDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Validate student ID using service
    const studentId = (0, student_response_service_1.validateStudentId)(req.params.id);
    if (!studentId) {
        throw new ApiError_1.ApiError(400, "Invalid student ID");
    }
    await (0, student_service_1.deleteStudentDetailsService)(studentId);
    return res.status(200).json({
        message: "Student deleted permanently"
    });
});
exports.getAllStudentsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, student_query_service_1.getAllStudentsService)(req.query);
    return res.status(200).json(result);
});
exports.getStudentReportController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username } = req.params;
    const usernameStr = Array.isArray(username) ? username[0] : username;
    const result = await (0, student_progress_service_1.getStudentReportService)(usernameStr);
    return res.status(200).json(result);
});
exports.createStudentController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await (0, student_service_1.createStudentService)(req.body);
    return res.status(201).json({
        message: "Student created successfully",
        data: student
    });
});
exports.addStudentProgressController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { student_id, question_id } = req.body;
    if (!student_id || !question_id) {
        throw new ApiError_1.ApiError(400, "student_id and question_id are required", [], "REQUIRED_FIELD");
    }
    const progress = await (0, student_progress_service_1.addStudentProgressService)(Number(student_id), Number(question_id));
    return res.status(201).json({
        message: "Student progress added successfully",
        data: progress
    });
});
// Profile-related controllers
exports.getStudentProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            throw new ApiError_1.ApiError(500, "Failed to get student profile", [], "INTERNAL_SERVER_ERROR");
        }
        const profile = await (0, profile_core_service_1.getStudentProfileService)(studentId);
        res.json(profile);
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        console.error("Profile error:", error);
        throw new ApiError_1.ApiError(500, error instanceof Error ? error.message : "Failed to get student profile", [], "INTERNAL_SERVER_ERROR");
    }
});
exports.getPublicStudentProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user?.id; // From optional auth middleware
        if (!username || Array.isArray(username)) {
            throw new ApiError_1.ApiError(400, "Username is required", [], "REQUIRED_FIELD");
        }
        const profile = await (0, profile_public_service_1.getPublicStudentProfileService)(username);
        // Add canEdit flag if current user is viewing their own profile
        const canEdit = currentUserId && profile.student.id === currentUserId;
        res.json({ ...profile, canEdit });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        console.error("Public profile error:", error);
        throw new ApiError_1.ApiError(500, "Failed to get public student profile", [], "INTERNAL_SERVER_ERROR");
    }
});
/**
 * Update current student's coding platform profiles
 * Updates LeetCode, GFG, GitHub, LinkedIn, and username information
 */
exports.updateStudentProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const studentId = req.user?.id;
        // Add validation for studentId
        if (!studentId) {
            throw new ApiError_1.ApiError(401, "Student ID not found");
        }
        const { leetcode_id, gfg_id, github, linkedin, username } = req.body;
        const updated = await (0, student_service_1.updateStudentDetailsService)(studentId, {
            leetcode_id,
            gfg_id,
            github,
            linkedin,
            username
        });
        res.json({
            message: "Profile updated successfully",
            student: updated
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(500, "Failed to update profile");
    }
});
// Username-related controllers
/**
 * Check if username is available for registration
 * Supports optional userId to exclude current user from check
 */
exports.checkUsernameAvailability = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { username, userId } = req.query;
        if (!username || typeof username !== 'string') {
            throw new ApiError_1.ApiError(400, "Username parameter is required", [], "REQUIRED_FIELD");
        }
        const result = await (0, username_service_1.checkUsernameAvailabilityService)({ username, userId: userId });
        return res.json(result);
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(500, "Failed to check username availability");
    }
});
exports.updateUsername = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            throw new ApiError_1.ApiError(401, "Authentication required");
        }
        const { username } = req.body;
        const updated = await (0, username_service_1.updateUsernameService)(studentId, username);
        return res.json({
            message: "Username updated successfully",
            student: updated
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(500, "Failed to update username");
    }
});
