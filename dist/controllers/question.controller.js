"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignedQuestionsController = exports.deleteQuestion = exports.updateQuestion = exports.getAllQuestions = exports.createQuestion = void 0;
const question_service_1 = require("../services/question.service");
const createQuestion = async (req, res) => {
    try {
        const question = await (0, question_service_1.createQuestionService)(req.body);
        return res.status(201).json({
            message: "Question created successfully",
            question,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.createQuestion = createQuestion;
const getAllQuestions = async (req, res) => {
    try {
        const { topicSlug, level, platform, type, search, page, limit, } = req.query;
        const result = await (0, question_service_1.getAllQuestionsService)({
            topicSlug: topicSlug,
            level: level,
            platform: platform,
            type: type,
            search: search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
        return res.json(result);
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.getAllQuestions = getAllQuestions;
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await (0, question_service_1.updateQuestionService)({
            id: Number(id),
            ...req.body,
        });
        return res.json({
            message: "Question updated successfully",
            question: updated,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await (0, question_service_1.deleteQuestionService)({
            id: Number(id),
        });
        return res.json({
            message: "Question deleted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.deleteQuestion = deleteQuestion;
const getAssignedQuestionsController = async (req, res) => {
    try {
        const data = await (0, question_service_1.getAssignedQuestionsService)(req.query);
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || "Failed to fetch questions"
        });
    }
};
exports.getAssignedQuestionsController = getAssignedQuestionsController;
