"use strict";
/**
 * Progress Controller - Student progress synchronization endpoints
 * Handles manual sync operations for student progress from external platforms
 * Provides progress tracking and synchronization management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualSync = void 0;
const sync_core_service_1 = require("../services/progressSync/sync-core.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
/**
 * Manual sync of student progress from external platforms
 * @param req - Request with student ID in params
 * @param res - Response with sync results
 */
exports.manualSync = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Validate student ID parameter
    if (!id || isNaN(Number(id))) {
        throw new ApiError_1.ApiError(400, "Valid student ID is required", [], "INVALID_STUDENT_ID");
    }
    const studentId = Number(id);
    const result = await (0, sync_core_service_1.syncOneStudent)(studentId);
    return res.status(200).json({
        success: true,
        message: "Student progress synchronized successfully",
        data: result
    });
});
