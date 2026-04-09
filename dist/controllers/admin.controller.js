"use strict";
/**
 * Admin Controller - Admin dashboard and management endpoints
 * Handles admin statistics, role management, and admin profile operations
 * Provides administrative functionality for system management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolesController = exports.deleteAdminController = exports.updateAdminController = exports.getAllAdminsController = exports.createAdminController = exports.getAdminStats = exports.getCurrentAdminController = void 0;
const client_1 = require("@prisma/client");
const admin_stats_service_1 = require("../services/admin/admin-stats.service");
const admin_query_service_1 = require("../services/admin/admin-query.service");
const admin_crud_service_1 = require("../services/admin/admin-crud.service");
const admin_query_service_2 = require("../services/admin/admin-query.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
exports.getCurrentAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Get admin info from middleware (extracted from token)
    const adminInfo = req.admin;
    if (!adminInfo) {
        throw new ApiError_1.ApiError(401, "Admin not authenticated", [], "AUTH_ERROR");
    }
    const admin = await (0, admin_query_service_1.getCurrentAdminService)(adminInfo.id);
    return res.status(200).json({
        success: true,
        data: admin
    });
});
exports.getAdminStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { batch_id } = req.body;
        // Validate batch_id
        if (!batch_id || isNaN(parseInt(batch_id))) {
            throw new ApiError_1.ApiError(400, "Valid batch_id is required", [], "VALIDATION_ERROR");
        }
        const batchId = parseInt(batch_id);
        const stats = await (0, admin_stats_service_1.getAdminStatsService)(batchId);
        return res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(500, "Failed to fetch batch statistics", [], "SERVER_ERROR");
    }
});
exports.createAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const adminData = req.body;
        // Validate required fields (removed username)
        if (!adminData.name || !adminData.email || !adminData.password) {
            throw new ApiError_1.ApiError(400, "Missing required fields: name, email, password", [], "VALIDATION_ERROR");
        }
        const newAdmin = await (0, admin_crud_service_1.createAdminService)(adminData);
        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: newAdmin
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(400, "Failed to create admin", [], "ADMIN_CREATE_ERROR");
    }
});
exports.getAllAdminsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const filters = req.query;
        // Default to TEACHER role if no role filter is provided (SuperAdmin context)
        if (!filters.role) {
            filters.role = 'TEACHER';
        }
        const admins = await (0, admin_query_service_2.getAllAdminsService)(filters);
        return res.status(200).json({
            success: true,
            data: admins
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(500, "Failed to fetch admins", [], "SERVER_ERROR");
    }
});
exports.updateAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!id || isNaN(parseInt(id))) {
            throw new ApiError_1.ApiError(400, "Valid admin ID is required", [], "VALIDATION_ERROR");
        }
        const updatedAdmin = await (0, admin_crud_service_1.updateAdminService)(parseInt(id), updateData);
        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            data: updatedAdmin
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        const errorMessage = error instanceof Error ? error.message : "Failed to update admin";
        const statusCode = errorMessage === 'Admin not found' ? 404 : 400;
        const errorCode = errorMessage === 'Admin not found' ? 'ADMIN_NOT_FOUND' : 'ADMIN_UPDATE_ERROR';
        throw new ApiError_1.ApiError(statusCode, errorMessage, [], errorCode);
    }
});
exports.deleteAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            throw new ApiError_1.ApiError(400, "Valid admin ID is required", [], "VALIDATION_ERROR");
        }
        const result = await (0, admin_crud_service_1.deleteAdminService)(parseInt(id));
        return res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete admin";
        const statusCode = errorMessage === 'Admin not found' ? 404 : 500;
        const errorCode = errorMessage === 'Admin not found' ? 'ADMIN_NOT_FOUND' : 'ADMIN_DELETE_ERROR';
        throw new ApiError_1.ApiError(statusCode, errorMessage, [], errorCode);
    }
});
exports.getRolesController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const roles = Object.values(client_1.AdminRole);
        return res.status(200).json({
            success: true,
            data: roles
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(500, "Failed to fetch roles", [], "SERVER_ERROR");
    }
});
