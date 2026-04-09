"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookmarkService = exports.updateBookmarkService = exports.addBookmarkService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../utils/ApiError");
const errorMapper_1 = require("../../utils/errorMapper");
const addBookmarkService = async (studentId, questionId, description) => {
    try {
        // Check if student exists
        const student = await prisma_1.default.student.findUnique({
            where: { id: studentId }
        });
        if (!student) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
        }
        // Check if question exists
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Question not found");
        }
        // Check if already bookmarked
        const existingBookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        if (existingBookmark) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Question already bookmarked");
        }
        // Create bookmark
        const bookmark = await prisma_1.default.bookmark.create({
            data: {
                student_id: studentId,
                question_id: questionId,
                description: description || null
            },
            select: {
                id: true,
                question_id: true,
                description: true,
                created_at: true
            }
        });
        return bookmark;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Question already bookmarked");
            }
            if (error.code === "P2003") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.BAD_REQUEST, "Invalid student or question reference");
            }
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student or question not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to add bookmark");
    }
};
exports.addBookmarkService = addBookmarkService;
const updateBookmarkService = async (studentId, questionId, description) => {
    try {
        // Check if bookmark exists
        const existingBookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        if (!existingBookmark) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
        }
        // Update bookmark
        const bookmark = await prisma_1.default.bookmark.update({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            },
            data: {
                description,
                updated_at: new Date()
            },
            select: {
                id: true,
                question_id: true,
                description: true,
                created_at: true,
                updated_at: true
            }
        });
        return bookmark;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update bookmark");
    }
};
exports.updateBookmarkService = updateBookmarkService;
const deleteBookmarkService = async (studentId, questionId) => {
    try {
        // Check if bookmark exists
        const existingBookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        if (!existingBookmark) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
        }
        // Delete bookmark
        await prisma_1.default.bookmark.delete({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        return true;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to delete bookmark");
    }
};
exports.deleteBookmarkService = deleteBookmarkService;
