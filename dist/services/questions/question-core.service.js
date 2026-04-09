"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestionService = exports.updateQuestionService = exports.createQuestionService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
const question_utils_service_1 = require("./question-utils.service");
const createQuestionService = async ({ question_name, question_link, topic_id, platform, level = "MEDIUM", }) => {
    if (!question_name || !question_link || !topic_id) {
        throw new ApiError_1.ApiError(400, "All required fields must be provided");
    }
    // Validate topic
    const topic = await prisma_1.default.topic.findUnique({
        where: { id: topic_id },
    });
    if (!topic) {
        throw new ApiError_1.ApiError(400, "Topic not found");
    }
    // Auto detect platform if not provided
    const finalPlatform = platform ?? (0, question_utils_service_1.detectPlatform)(question_link);
    // Prevent duplicate question link (must be unique across all topics)
    const duplicate = await prisma_1.default.question.findFirst({
        where: {
            question_link,
        },
    });
    if (duplicate) {
        throw new ApiError_1.ApiError(400, "Question link already exists", [], "QUESTION_LINK_EXISTS");
    }
    const question = await prisma_1.default.question.create({
        data: {
            question_name,
            question_link,
            topic_id,
            platform: finalPlatform,
            level,
        },
    });
    return question;
};
exports.createQuestionService = createQuestionService;
const updateQuestionService = async ({ id, question_name, question_link, topic_id, level, platform, }) => {
    const existing = await prisma_1.default.question.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError_1.ApiError(400, "Question not found");
    }
    const finalTopicId = topic_id ?? existing.topic_id;
    // Validate topic if changed
    if (topic_id) {
        const topic = await prisma_1.default.topic.findUnique({
            where: { id: topic_id },
        });
        if (!topic) {
            throw new ApiError_1.ApiError(400, "Topic not found");
        }
    }
    const finalLink = question_link ?? existing.question_link;
    // Prevent duplicate link (must be unique across all topics)
    const duplicate = await prisma_1.default.question.findFirst({
        where: {
            question_link: finalLink,
            NOT: { id: existing.id },
        },
    });
    if (duplicate) {
        throw new ApiError_1.ApiError(400, "Question link already exists", [], "QUESTION_LINK_EXISTS");
    }
    const updated = await prisma_1.default.question.update({
        where: { id },
        data: {
            question_name: question_name ?? existing.question_name,
            question_link: finalLink,
            topic_id: finalTopicId,
            level: level ?? existing.level,
            platform: platform ?? existing.platform,
        },
    });
    return updated;
};
exports.updateQuestionService = updateQuestionService;
const deleteQuestionService = async ({ id, }) => {
    const existing = await prisma_1.default.question.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError_1.ApiError(400, "Question not found");
    }
    const visibilityCount = await prisma_1.default.questionVisibility.count({
        where: { question_id: id },
    });
    if (visibilityCount > 0) {
        throw new ApiError_1.ApiError(400, "Cannot delete question assigned to classes");
    }
    const progressCount = await prisma_1.default.studentProgress.count({
        where: { question_id: id },
    });
    if (progressCount > 0) {
        throw new ApiError_1.ApiError(400, "Cannot delete question with student progress");
    }
    await prisma_1.default.question.delete({
        where: { id },
    });
    return true;
};
exports.deleteQuestionService = deleteQuestionService;
