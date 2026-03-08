"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicOverviewWithClassesSummary = exports.getTopicsWithBatchProgress = exports.createTopicsBulk = exports.deleteTopic = exports.updateTopic = exports.getTopicsForBatch = exports.getAllTopics = exports.createTopic = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const topic_service_1 = require("../services/topic.service");
const createTopic = async (req, res) => {
    try {
        const { topic_name } = req.body;
        const topic = await (0, topic_service_1.createTopicService)({ topic_name });
        return res.status(201).json({
            message: "Topic created successfully",
            topic,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.createTopic = createTopic;
// Get All Topics
const getAllTopics = async (_req, res) => {
    try {
        const topics = await (0, topic_service_1.getAllTopicsService)();
        return res.json(topics);
    }
    catch (error) {
        return res.status(500).json({
            error: "Failed to fetch topics",
        });
    }
};
exports.getAllTopics = getAllTopics;
const getTopicsForBatch = async (req, res) => {
    try {
        const batch = req.batch;
        const topics = await (0, topic_service_1.getTopicsForBatchService)({
            batchId: batch.id,
        });
        return res.json(topics);
    }
    catch (error) {
        return res.status(500).json({
            error: "Failed to fetch topics for batch",
        });
    }
};
exports.getTopicsForBatch = getTopicsForBatch;
const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topic_name } = req.body;
        const topic = await (0, topic_service_1.updateTopicService)({
            id: Number(id),
            topic_name,
        });
        return res.json({
            message: "Topic updated successfully",
            topic,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.updateTopic = updateTopic;
const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        await (0, topic_service_1.deleteTopicService)({
            id: Number(id),
        });
        return res.json({
            message: "Topic deleted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
        });
    }
};
exports.deleteTopic = deleteTopic;
const createTopicsBulk = async (req, res) => {
    try {
        const { topics } = req.body;
        if (!topics || !Array.isArray(topics)) {
            return res.status(400).json({
                error: "Topics must be an array",
            });
        }
        // Slug generate helper
        const generateSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, "-");
        const formattedTopics = topics.map((topic_name) => ({
            topic_name,
            slug: generateSlug(topic_name),
        }));
        const created = await prisma_1.default.topic.createMany({
            data: formattedTopics,
            skipDuplicates: true, // ignore duplicates
        });
        return res.status(201).json({
            message: "Topics uploaded successfully",
            count: created.count,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
};
exports.createTopicsBulk = createTopicsBulk;
// Student-specific controller - get topics with batch progress
const getTopicsWithBatchProgress = async (req, res) => {
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
        const topics = await (0, topic_service_1.getTopicsWithBatchProgressService)({
            studentId,
            batchId,
        });
        return res.json(topics);
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || "Failed to fetch topics with progress",
        });
    }
};
exports.getTopicsWithBatchProgress = getTopicsWithBatchProgress;
// Student-specific controller - get topic overview with classes summary
const getTopicOverviewWithClassesSummary = async (req, res) => {
    try {
        // Get student info from middleware (extractStudentInfo)
        const student = req.student;
        const batchId = req.batchId;
        const { topicSlug } = req.params;
        const studentId = student?.id;
        // Ensure topicSlug is a string (not string array)
        const slug = Array.isArray(topicSlug) ? topicSlug[0] : topicSlug;
        if (!studentId || !batchId || !slug) {
            return res.status(400).json({
                error: "Student authentication and topic slug required",
            });
        }
        const topicOverview = await (0, topic_service_1.getTopicOverviewWithClassesSummaryService)({
            studentId,
            batchId,
            topicSlug: slug,
        });
        return res.json(topicOverview);
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || "Failed to fetch topic overview",
        });
    }
};
exports.getTopicOverviewWithClassesSummary = getTopicOverviewWithClassesSummary;
