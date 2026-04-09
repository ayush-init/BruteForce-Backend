"use strict";
/**
 * Question Controller - Question management and bulk operations
 * Handles CRUD operations for questions, bulk CSV uploads, and assignment management
 * Consolidates question functionality from multiple controllers for better organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUploadQuestions = exports.getAssignedQuestionsController = exports.deleteQuestion = exports.updateQuestion = exports.getAllQuestions = exports.createQuestion = void 0;
const question_core_service_1 = require("../services/questions/question-core.service");
const question_query_service_1 = require("../services/questions/question-query.service");
const questionBulk_service_1 = require("../services/questions/questionBulk.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
exports.createQuestion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const question = await (0, question_core_service_1.createQuestionService)(req.body);
    return res.status(201).json({
        message: "Question created successfully",
        question,
    });
});
exports.getAllQuestions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { topicSlug, level, platform, search, page, limit, } = req.query;
    const result = await (0, question_query_service_1.getAllQuestionsService)({
        topicSlug: topicSlug,
        level: level,
        platform: platform,
        search: search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
    });
    return res.json(result);
});
exports.updateQuestion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updated = await (0, question_core_service_1.updateQuestionService)({
        id: Number(id),
        ...req.body,
    });
    return res.json({
        message: "Question updated successfully",
        question: updated,
    });
});
exports.deleteQuestion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, question_core_service_1.deleteQuestionService)({
        id: Number(id),
    });
    return res.json({
        message: "Question deleted successfully",
    });
});
exports.getAssignedQuestionsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, question_query_service_1.getAssignedQuestionsService)(req.query);
    return res.status(200).json({
        success: true,
        data
    });
});
exports.bulkUploadQuestions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.ApiError(400, "CSV file is required");
    }
    const { topic_id } = req.body;
    if (!topic_id || topic_id === "undefined" || topic_id === "null") {
        throw new ApiError_1.ApiError(400, "Topic is required");
    }
    const parsedTopicId = Number(topic_id);
    if (isNaN(parsedTopicId) || parsedTopicId <= 0) {
        throw new ApiError_1.ApiError(400, "Invalid Topic ID");
    }
    const result = await (0, questionBulk_service_1.bulkUploadQuestionsService)(req.file.buffer, parsedTopicId);
    return res.json({
        message: "Bulk upload successful",
        ...result,
    });
});
