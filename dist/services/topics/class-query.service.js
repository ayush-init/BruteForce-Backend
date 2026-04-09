"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassDetailsService = exports.getClassesByTopicService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
const getClassesByTopicService = async ({ batchId, topicSlug, page = 1, limit = 20, search = '', }) => {
    if (!topicSlug) {
        throw new ApiError_1.ApiError(400, "Invalid topic slug");
    }
    // Build where clause
    const whereClause = {
        batch_id: batchId,
        topic: {
            slug: topicSlug,
        },
    };
    // Add search filter if provided
    if (search) {
        whereClause.class_name = {
            contains: search,
            mode: 'insensitive'
        };
    }
    // Get total count for pagination
    const total = await prisma_1.default.class.count({
        where: whereClause,
    });
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    const classes = await prisma_1.default.class.findMany({
        where: whereClause,
        include: {
            topic: true, // so we can validate topic existence
            _count: {
                select: {
                    questionVisibility: true,
                },
            },
        },
        orderBy: {
            class_date: "asc",
        },
        skip,
        take: limit,
    });
    // If no classes found, we must check whether topic exists
    if (classes.length === 0 && !search) {
        const topicExists = await prisma_1.default.topic.findUnique({
            where: { slug: topicSlug },
        });
        if (!topicExists) {
            throw new ApiError_1.ApiError(400, "Topic not found");
        }
    }
    const formatted = classes.map((cls) => ({
        id: cls.id,
        class_name: cls.class_name,
        slug: cls.slug,
        description: cls.description,
        pdf_url: cls.pdf_url,
        duration_minutes: cls.duration_minutes,
        class_date: cls.class_date,
        questionCount: cls._count.questionVisibility,
        created_at: cls.created_at,
    }));
    return {
        data: formatted,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};
exports.getClassesByTopicService = getClassesByTopicService;
const getClassDetailsService = async ({ batchId, topicSlug, classSlug, }) => {
    if (!classSlug) {
        throw new ApiError_1.ApiError(400, "Invalid class slug");
    }
    if (!topicSlug) {
        throw new ApiError_1.ApiError(400, "Invalid topic slug");
    }
    // Find topic first
    const topic = await prisma_1.default.topic.findUnique({
        where: { slug: topicSlug },
    });
    if (!topic) {
        throw new ApiError_1.ApiError(400, "Topic not found");
    }
    const cls = await prisma_1.default.class.findFirst({
        where: {
            slug: classSlug,
            batch_id: batchId,
            topic_id: topic.id, // Add topic validation
        },
        include: {
            topic: {
                select: {
                    id: true,
                    topic_name: true,
                    slug: true,
                },
            },
            _count: {
                select: {
                    questionVisibility: true,
                },
            },
        },
    });
    if (!cls) {
        throw new ApiError_1.ApiError(400, "Class not found in this topic and batch");
    }
    return {
        id: cls.id,
        class_name: cls.class_name,
        slug: cls.slug,
        description: cls.description,
        pdf_url: cls.pdf_url,
        duration_minutes: cls.duration_minutes,
        class_date: cls.class_date,
        questionCount: cls._count.questionVisibility,
        topic: cls.topic,
        created_at: cls.created_at,
    };
};
exports.getClassDetailsService = getClassDetailsService;
