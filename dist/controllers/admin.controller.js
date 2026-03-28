"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolesController = exports.deleteAdminController = exports.updateAdminController = exports.getAllAdminsController = exports.createAdminController = exports.getAdminStats = exports.getCurrentAdminController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const admin_service_1 = require("../services/admin.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getCurrentAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        // Get admin info from middleware (extracted from token)
        const adminInfo = req.admin;
        if (!adminInfo) {
            return res.status(401).json({
                success: false,
                message: "Admin not authenticated"
            });
        }
        //Ading line
        // Get full admin details from database
        const admin = await prisma_1.default.admin.findUnique({
            where: { id: adminInfo.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                city_id: true,
                batch_id: true,
                city: {
                    select: {
                        id: true,
                        city_name: true
                    }
                },
                batch: {
                    select: {
                        id: true,
                        batch_name: true,
                        year: true
                    }
                }
            }
        });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                cityId: admin.city_id,
                batchId: admin.batch_id,
                city: admin.city,
                batch: admin.batch
            }
        });
    }
    catch (error) {
        console.error("Get current admin error:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch current admin"
        });
    }
});
exports.getAdminStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { batch_id } = req.body;
        // Validate batch_id
        if (!batch_id || isNaN(parseInt(batch_id))) {
            return res.status(400).json({
                success: false,
                message: "Valid batch_id is required"
            });
        }
        const batchId = parseInt(batch_id);
        // Check if batch exists
        const batch = await prisma_1.default.batch.findUnique({
            where: { id: batchId },
            include: {
                city: {
                    select: {
                        city_name: true
                    }
                }
            }
        });
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found"
            });
        }
        // Get total classes for this batch
        const totalClasses = await prisma_1.default.class.count({
            where: { batch_id: batchId }
        });
        // Get total students for this batch
        const totalStudents = await prisma_1.default.student.count({
            where: { batch_id: batchId }
        });
        // Get all questions assigned to this batch's classes
        const assignedQuestions = await prisma_1.default.questionVisibility.findMany({
            where: {
                class: {
                    batch_id: batchId
                }
            },
            include: {
                question: {
                    select: {
                        level: true,
                        platform: true,
                        type: true
                    }
                }
            }
        });
        const totalQuestions = assignedQuestions.length;
        // Calculate questions by type
        const questionsByType = {
            homework: assignedQuestions.filter((qc) => qc.question.type === 'HOMEWORK').length,
            classwork: assignedQuestions.filter((qc) => qc.question.type === 'CLASSWORK').length
        };
        // Calculate questions by level
        const questionsByLevel = {
            easy: assignedQuestions.filter((qc) => qc.question.level === 'EASY').length,
            medium: assignedQuestions.filter((qc) => qc.question.level === 'MEDIUM').length,
            hard: assignedQuestions.filter((qc) => qc.question.level === 'HARD').length
        };
        // Calculate questions by platform
        const questionsByPlatform = {
            leetcode: assignedQuestions.filter((qc) => qc.question.platform === 'LEETCODE').length,
            gfg: assignedQuestions.filter((qc) => qc.question.platform === 'GFG').length,
            other: assignedQuestions.filter((qc) => qc.question.platform === 'OTHER').length,
            interviewbit: assignedQuestions.filter((qc) => qc.question.platform === 'INTERVIEWBIT').length
        };
        // Get total topics discussed for this batch
        const totalTopicsDiscussed = await prisma_1.default.topic.count({
            where: {
                classes: {
                    some: {
                        batch_id: batchId
                    }
                }
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                batch_id: batchId,
                batch_name: batch.batch_name,
                city: batch.city.city_name,
                year: batch.year,
                total_classes: totalClasses,
                total_questions: totalQuestions,
                total_students: totalStudents,
                questions_by_type: questionsByType,
                questions_by_level: questionsByLevel,
                questions_by_platform: questionsByPlatform,
                total_topics_discussed: totalTopicsDiscussed
            }
        });
    }
    catch (error) {
        console.error("Batch stats error:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch batch statistics"
        });
    }
});
exports.createAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const adminData = req.body;
        // Validate required fields (removed username)
        if (!adminData.name || !adminData.email || !adminData.password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, email, password"
            });
        }
        const newAdmin = await (0, admin_service_1.createAdminService)(adminData);
        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: newAdmin
        });
    }
    catch (error) {
        console.error("Create admin error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to create admin"
        });
    }
});
exports.getAllAdminsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const filters = req.query;
        // Default to TEACHER role if no role filter is provided (SuperAdmin context)
        if (!filters.role) {
            filters.role = 'TEACHER';
        }
        const admins = await (0, admin_service_1.getAllAdminsService)(filters);
        return res.status(200).json({
            success: true,
            data: admins
        });
    }
    catch (error) {
        console.error("Get admins error:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch admins"
        });
    }
});
exports.updateAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Valid admin ID is required"
            });
        }
        const updatedAdmin = await (0, admin_service_1.updateAdminService)(parseInt(id), updateData);
        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            data: updatedAdmin
        });
    }
    catch (error) {
        console.error("Update admin error:", error);
        const statusCode = error.message === 'Admin not found' ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update admin"
        });
    }
});
exports.deleteAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Valid admin ID is required"
            });
        }
        const result = await (0, admin_service_1.deleteAdminService)(parseInt(id));
        return res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error("Delete admin error:", error);
        const statusCode = error.message === 'Admin not found' ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to delete admin"
        });
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
        console.error("Get roles error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch roles"
        });
    }
});
