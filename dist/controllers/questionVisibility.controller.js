"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionVisibilityType = exports.getAllQuestionsWithFilters = exports.removeQuestionFromClass = exports.getAssignedQuestionsOfClass = exports.assignQuestionsToClass = void 0;
const visibility_service_1 = require("../services/questions/visibility.service");
const visibility_query_service_1 = require("../services/questions/visibility-query.service");
const visibility_student_service_1 = require("../services/questions/visibility-student.service");
const visibility_validation_service_1 = require("../services/questions/visibility-validation.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
exports.assignQuestionsToClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    const topicSlugParam = req.params.topicSlug;
    const classSlug = req.params.classSlug;
    const { questions } = req.body;
    // Validate slugs and question assignments
    const { topicSlug, classSlug: validatedClassSlug } = (0, visibility_validation_service_1.validateRequiredSlugParams)(topicSlugParam, classSlug);
    const validatedQuestions = (0, visibility_validation_service_1.validateQuestionAssignments)(questions);
    const result = await (0, visibility_service_1.assignQuestionsToClassService)({
        batchId: batch.id,
        topicSlug: topicSlug,
        classSlug: validatedClassSlug,
        questions: validatedQuestions,
    });
    return res.json({
        message: "Questions assigned successfully",
        ...result,
    });
});
exports.getAssignedQuestionsOfClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    const topicSlugParam = req.params.topicSlug;
    const classSlugParam = req.params.classSlug;
    // Validate slugs and parse pagination
    const { topicSlug, classSlug } = (0, visibility_validation_service_1.validateRequiredSlugParams)(topicSlugParam, classSlugParam);
    const pagination = (0, visibility_validation_service_1.parsePaginationParams)(req.query);
    const assigned = await (0, visibility_query_service_1.getAssignedQuestionsOfClassService)({
        batchId: batch.id,
        topicSlug: topicSlug,
        classSlug: classSlug,
        page: pagination.page,
        limit: pagination.limit,
        search: pagination.search || '',
    });
    return res.json({
        message: "Assigned questions retrieved successfully",
        data: assigned.data,
        pagination: assigned.pagination,
    });
});
exports.removeQuestionFromClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    const topicSlugParam = req.params.topicSlug;
    const classSlugParam = req.params.classSlug;
    const questionIdParam = req.params.questionId;
    // Validate slugs and question ID
    const { topicSlug, classSlug } = (0, visibility_validation_service_1.validateRequiredSlugParams)(topicSlugParam, classSlugParam);
    const questionId = typeof questionIdParam === "string" ? parseInt(questionIdParam) : undefined;
    if (!questionId || isNaN(questionId) || questionId <= 0) {
        throw new ApiError_1.ApiError(400, "Invalid question ID", [], "INVALID_INPUT");
    }
    await (0, visibility_service_1.removeQuestionFromClassService)({
        batchId: batch.id,
        topicSlug: topicSlug,
        classSlug: classSlug,
        questionId: questionId,
    });
    return res.json({
        message: "Question removed successfully",
    });
});
// Student-specific controller - get all questions with filters for student's batch
exports.getAllQuestionsWithFilters = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Get student info from middleware (extractStudentInfo)
    const student = req.student;
    const batchId = req.batchId;
    const studentId = student?.id;
    if (!studentId || !batchId) {
        throw new ApiError_1.ApiError(400, "Student authentication required");
    }
    // Extract query parameters for filtering
    const { search, topic, level, platform, type, solved, page = '1', limit = '20' } = req.query;
    const filters = {
        search: search,
        topic: topic,
        level: level,
        platform: platform,
        type: type,
        solved: solved,
        page: parseInt(page),
        limit: parseInt(limit)
    };
    const questions = await (0, visibility_student_service_1.getAllQuestionsWithFiltersService)({
        studentId,
        batchId,
        filters
    });
    return res.json(questions);
});
// Update question visibility type (homework/classwork)
exports.updateQuestionVisibilityType = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    const topicSlugParam = req.params.topicSlug;
    const classSlugParam = req.params.classSlug;
    const visibilityIdParam = req.params.visibilityId;
    // Validate slugs and visibility ID
    const { topicSlug, classSlug } = (0, visibility_validation_service_1.validateRequiredSlugParams)(topicSlugParam, classSlugParam);
    if (typeof visibilityIdParam !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid visibility ID", [], "INVALID_INPUT");
    }
    const visibilityId = parseInt(visibilityIdParam);
    if (isNaN(visibilityId)) {
        throw new ApiError_1.ApiError(400, "Invalid visibility ID", [], "INVALID_INPUT");
    }
    const { type } = req.body;
    if (!type || (type !== 'HOMEWORK' && type !== 'CLASSWORK')) {
        throw new ApiError_1.ApiError(400, "Type must be HOMEWORK or CLASSWORK", [], "INVALID_INPUT");
    }
    const updated = await (0, visibility_service_1.updateQuestionVisibilityTypeService)({
        batchId: batch.id,
        topicSlug: topicSlugParam,
        classSlug: classSlugParam,
        visibilityId,
        type
    });
    return res.json({
        message: "Question visibility type updated successfully",
        data: updated
    });
});
