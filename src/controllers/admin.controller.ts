import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AdminRole } from "@prisma/client";
import { getCityWiseStats } from "../services/admin.service";
import { createAdminService, getAllAdminsService, updateAdminService, deleteAdminService } from "../services/admin.service";
import { syncOneStudent } from "../services/progressSync.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getCurrentAdminController = asyncHandler(async (req: Request, res: Response) => {
            try {
                // Get admin info from middleware (extracted from token)
                const adminInfo = (req as any).admin;
                
                if (!adminInfo) {
                    throw new ApiError(401, "Admin not authenticated", [], "AUTH_ERROR");
                }
                
                // Get full admin details from database
                const admin = await prisma.admin.findUnique({
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
                    throw new ApiError(404, "Admin not found", [], "ADMIN_NOT_FOUND");
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

            } catch (error) {
    if (error instanceof ApiError) throw error;
                throw new ApiError(500, "Failed to fetch current admin", [], "SERVER_ERROR");
            }
        });

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
            try {
                const { batch_id } = req.body;

                // Validate batch_id
                if (!batch_id || isNaN(parseInt(batch_id))) {
                    throw new ApiError(400, "Valid batch_id is required", [], "VALIDATION_ERROR");
                }

                const batchId = parseInt(batch_id);

                // Check if batch exists
                const batch = await prisma.batch.findUnique({
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
                    throw new ApiError(404, "Batch not found", [], "BATCH_NOT_FOUND");
                }

                // Get total classes for this batch
                const totalClasses = await prisma.class.count({
                    where: { batch_id: batchId }
                });

                // Get total students for this batch
                const totalStudents = await prisma.student.count({
                    where: { batch_id: batchId }
                });

                // Get all questions assigned to this batch's classes
                const assignedQuestions = await prisma.questionVisibility.findMany({
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
                    homework: assignedQuestions.filter((qc: any) => qc.question.type === 'HOMEWORK').length,
                    classwork: assignedQuestions.filter((qc: any) => qc.question.type === 'CLASSWORK').length
                };

                // Calculate questions by level
                const questionsByLevel = {
                    easy: assignedQuestions.filter((qc: any) => qc.question.level === 'EASY').length,
                    medium: assignedQuestions.filter((qc: any) => qc.question.level === 'MEDIUM').length,
                    hard: assignedQuestions.filter((qc: any) => qc.question.level === 'HARD').length
                };

                // Calculate questions by platform
                const questionsByPlatform = {
                    leetcode: assignedQuestions.filter((qc: any) => qc.question.platform === 'LEETCODE').length,
                    gfg: assignedQuestions.filter((qc: any) => qc.question.platform === 'GFG').length,
                    other: assignedQuestions.filter((qc: any) => qc.question.platform === 'OTHER').length,
                    interviewbit: assignedQuestions.filter((qc: any) => qc.question.platform === 'INTERVIEWBIT').length
                };

                // Get total topics discussed for this batch
                const totalTopicsDiscussed = await prisma.topic.count({
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

            } catch (error) {
    if (error instanceof ApiError) throw error;
                throw new ApiError(500, "Failed to fetch batch statistics", [], "SERVER_ERROR");
            }
        });

export const createAdminController = asyncHandler(async (req: Request, res: Response) => {
            try {
                const adminData = req.body;

                // Validate required fields (removed username)
                if (!adminData.name || !adminData.email || !adminData.password) {
                    throw new ApiError(400, "Missing required fields: name, email, password", [], "VALIDATION_ERROR");
                }

                const newAdmin = await createAdminService(adminData);

                return res.status(201).json({
                    success: true,
                    message: "Admin created successfully",
                    data: newAdmin
                });

            } catch (error) {
    if (error instanceof ApiError) throw error;
                throw new ApiError(400, "Failed to create admin", [], "ADMIN_CREATE_ERROR");
            }
        });

export const getAllAdminsController = asyncHandler(async (req: Request, res: Response) => {
            try {
                const filters = req.query;
                
                // Default to TEACHER role if no role filter is provided (SuperAdmin context)
                if (!filters.role) {
                    filters.role = 'TEACHER';
                }
                
                const admins = await getAllAdminsService(filters);

                return res.status(200).json({
                    success: true,
                    data: admins
                });

            } catch (error) {
    if (error instanceof ApiError) throw error;
                throw new ApiError(500, "Failed to fetch admins", [], "SERVER_ERROR");
            }
        });

export const updateAdminController = asyncHandler(async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const updateData = req.body;

                if (!id || isNaN(parseInt(id as string))) {
                    throw new ApiError(400, "Valid admin ID is required", [], "VALIDATION_ERROR");
                }

                const updatedAdmin = await updateAdminService(parseInt(id as string), updateData);

                return res.status(200).json({
                    success: true,
                    message: "Admin updated successfully",
                    data: updatedAdmin
                });

            } catch (error: any) {
    if (error instanceof ApiError) throw error;
                const statusCode = error.message === 'Admin not found' ? 404 : 400;
                const errorCode = error.message === 'Admin not found' ? 'ADMIN_NOT_FOUND' : 'ADMIN_UPDATE_ERROR';
                throw new ApiError(statusCode, error.message || "Failed to update admin", [], errorCode);
            }
        });

export const deleteAdminController = asyncHandler(async (req: Request, res: Response) => {
            try {
                const { id } = req.params;

                if (!id || isNaN(parseInt(id as string))) {
                    throw new ApiError(400, "Valid admin ID is required", [], "VALIDATION_ERROR");
                }

                const result = await deleteAdminService(parseInt(id as string));

                return res.status(200).json({
                    success: true,
                    message: result.message
                });

            } catch (error: any) {
    if (error instanceof ApiError) throw error;
                const statusCode = error.message === 'Admin not found' ? 404 : 500;
                const errorCode = error.message === 'Admin not found' ? 'ADMIN_NOT_FOUND' : 'ADMIN_DELETE_ERROR';
                throw new ApiError(statusCode, error.message || "Failed to delete admin", [], errorCode);
            }
        });

export const getRolesController = asyncHandler(async (req: Request, res: Response) => {
            try {
                const roles = Object.values(AdminRole);
                return res.status(200).json({
                    success: true,
                    data: roles
                });
            } catch (error) {
    if (error instanceof ApiError) throw error;
                throw new ApiError(500, "Failed to fetch roles", [], "SERVER_ERROR");
            }
        });
