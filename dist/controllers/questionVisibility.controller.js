"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllQuestionsWithFilters = exports.removeQuestionFromClass = exports.getAssignedQuestionsOfClass = exports.assignQuestionsToClass = void 0;
const questionVisibility_service_1 = require("../services/questionVisibility.service");
const assignQuestionsToClass = async (req, res) => {
    try {
        const batch = req.batch;
        const topicSlugParam = req.params.topicSlug;
        const classSlug = req.params.classSlug;
        if (typeof topicSlugParam !== "string") {
            return res.status(400).json({
                error: "Invalid topic slug",
            });
        }
        if (typeof classSlug !== "string") {
            return res.status(400).json({
                error: "Invalid class slug",
            });
        }
        const { question_ids } = req.body;
        // Validation 1: Check if question_ids is provided
        if (!question_ids) {
            return res.status(400).json({
                error: "question_ids field is required",
            });
        }
        // Validation 2: Check if question_ids is an array
        if (!Array.isArray(question_ids)) {
            return res.status(400).json({
                error: "question_ids must be an array",
            });
        }
        // Validation 3: Check if array is not empty
        if (question_ids.length === 0) {
            return res.status(400).json({
                error: "question_ids array cannot be empty",
            });
        }
        // Validation 4: Check if all elements are numbers
        if (!question_ids.every(id => typeof id === 'number' && id > 0)) {
            return res.status(400).json({
                error: "All question_ids must be positive numbers",
            });
        }
        // Validation 5: Check for duplicate question IDs in request
        const duplicateIds = question_ids.filter((id, index) => question_ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            return res.status(400).json({
                error: `Duplicate question IDs found in request: ${duplicateIds.join(', ')}`,
            });
        }
        const result = await (0, questionVisibility_service_1.assignQuestionsToClassService)({
            batchId: batch.id,
            topicSlug: topicSlugParam,
            classSlug,
            questionIds: question_ids,
        });
        return res.json({
            message: "Questions assigned successfully",
            ...result,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.assignQuestionsToClass = assignQuestionsToClass;
const getAssignedQuestionsOfClass = async (req, res) => {
    try {
        const batch = req.batch;
        const topicSlugParam = req.params.topicSlug;
        const classSlug = req.params.classSlug;
        if (typeof topicSlugParam !== "string") {
            return res.status(400).json({
                error: "Invalid topic slug",
            });
        }
        if (typeof classSlug !== "string") {
            return res.status(400).json({
                error: "Invalid class slug",
            });
        }
        const assigned = await (0, questionVisibility_service_1.getAssignedQuestionsOfClassService)({
            batchId: batch.id,
            topicSlug: topicSlugParam,
            classSlug,
        });
        return res.json({
            message: "Assigned questions retrieved successfully",
            data: assigned,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.getAssignedQuestionsOfClass = getAssignedQuestionsOfClass;
const removeQuestionFromClass = async (req, res) => {
    try {
        const batch = req.batch;
        const topicSlugParam = req.params.topicSlug;
        const classSlug = req.params.classSlug;
        const questionIdParam = req.params.questionId;
        if (typeof questionIdParam !== "string") {
            return res.status(400).json({
                error: "Invalid question ID",
            });
        }
        const questionId = parseInt(questionIdParam);
        if (typeof topicSlugParam !== "string") {
            return res.status(400).json({
                error: "Invalid topic slug",
            });
        }
        if (typeof classSlug !== "string") {
            return res.status(400).json({
                error: "Invalid class slug",
            });
        }
        if (isNaN(questionId)) {
            return res.status(400).json({
                error: "Invalid question ID",
            });
        }
        await (0, questionVisibility_service_1.removeQuestionFromClassService)({
            batchId: batch.id,
            topicSlug: topicSlugParam,
            classSlug,
            questionId,
        });
        return res.json({
            message: "Question removed successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.removeQuestionFromClass = removeQuestionFromClass;
// Student-specific controller - get all questions with filters for student's batch
const getAllQuestionsWithFilters = async (req, res) => {
    try {
        // Get student info from middleware (extractStudentInfo)
        const student = req.student;
        const batchId = req.batchId;
        const studentId = student?.id;
        if (!studentId || !batchId) {
            return res.status(400).json({
                error: "Student authentication required",
            });
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
        const questions = await (0, questionVisibility_service_1.getAllQuestionsWithFiltersService)({
            studentId,
            batchId,
            filters
        });
        return res.json(questions);
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || "Failed to fetch questions",
        });
    }
};
exports.getAllQuestionsWithFilters = getAllQuestionsWithFilters;
