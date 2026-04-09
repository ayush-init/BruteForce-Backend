"use strict";
/**
 * Student Service - Core student data management
 * Handles student CRUD operations, authentication, and profile updates
 * Provides database operations for student lifecycle management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentStudentService = exports.deleteStudentDetailsService = exports.updateStudentDetailsService = exports.createStudentService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usernameGenerator_1 = require("../../utils/usernameGenerator");
const client_1 = require("@prisma/client");
const errorMapper_1 = require("../../utils/errorMapper");
const ApiError_1 = require("../../utils/ApiError");
const createStudentService = async (data) => {
    try {
        const { name, email, username, password, enrollment_id, batch_id, leetcode_id, gfg_id } = data;
        // Only require name and email, username will be generated if not provided
        if (!name || !email) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.BAD_REQUEST, "Name and email are required");
        }
        // Generate username if not provided
        let finalUsername = username;
        if (!finalUsername) {
            const usernameResult = await (0, usernameGenerator_1.generateUsername)(name, enrollment_id);
            finalUsername = usernameResult.finalUsername;
        }
        // batch exist check karo
        const batch = await prisma_1.default.batch.findUnique({
            where: { id: batch_id },
            select: {
                id: true,
                city_id: true
            }
        });
        if (!batch) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Batch not found");
        }
        let password_hash = null;
        if (password) {
            password_hash = await bcryptjs_1.default.hash(password, 10);
        }
        const student = await prisma_1.default.student.create({
            data: {
                name,
                email,
                username: finalUsername,
                password_hash,
                enrollment_id,
                batch_id,
                city_id: batch.city_id, // city automatically batch se
                leetcode_id,
                gfg_id
            }
        });
        return student;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const field = error.meta?.target;
                if (field?.includes("email"))
                    throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Email already exists", [], "EMAIL_ALREADY_EXISTS");
                if (field?.includes("username"))
                    throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Username already exists");
                if (field?.includes("enrollment_id"))
                    throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Enrollment ID already exists");
                if (field?.includes("google_id"))
                    throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Google account already linked");
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Duplicate field detected");
            }
            if (error.code === "P2003") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.BAD_REQUEST, "Invalid batch reference");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to create student");
    }
};
exports.createStudentService = createStudentService;
const updateStudentDetailsService = async (id, body) => {
    try {
        const student = await prisma_1.default.student.findUnique({
            where: { id }
        });
        if (!student) {
            throw new ApiError_1.ApiError(400, "Student not found");
        }
        const updateData = { ...body };
        const updatedStudent = await prisma_1.default.student.update({
            where: { id },
            data: updateData
        });
        return updatedStudent;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
            }
            if (error.code === "P2002") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Email, Username or Enrollment ID already exists");
            }
            if (error.code === "P2003") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.BAD_REQUEST, "Invalid city or batch reference");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update student");
    }
};
exports.updateStudentDetailsService = updateStudentDetailsService;
const deleteStudentDetailsService = async (id) => {
    try {
        const student = await prisma_1.default.student.findUnique({
            where: { id }
        });
        if (!student) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
        }
        await prisma_1.default.student.delete({
            where: { id }
        });
        return true;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to delete student");
    }
};
exports.deleteStudentDetailsService = deleteStudentDetailsService;
const getCurrentStudentService = async (studentId) => {
    const student = await prisma_1.default.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            name: true,
            username: true,
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
            },
            email: true,
            profile_image_url: true,
            leetcode_id: true,
            gfg_id: true
        }
    });
    if (!student) {
        throw new ApiError_1.ApiError(404, "Student not found", [], "STUDENT_NOT_FOUND");
    }
    return student;
};
exports.getCurrentStudentService = getCurrentStudentService;
