"use strict";
/**
 * Topic Service - Topic management with media handling
 * Handles CRUD operations for topics including photo uploads and S3 integration
 * Provides slug generation and media cleanup on errors
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopicsBulkService = exports.deleteTopicService = exports.updateTopicService = exports.createTopicService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const transliteration_1 = require("transliteration");
const s3_service_1 = require("../../services/storage/s3.service");
const errorMapper_1 = require("../../utils/errorMapper");
const ApiError_1 = require("../../utils/ApiError");
/**
 * Create new topic with optional photo upload
 * @param data - Topic name and optional photo file
 * @returns Created topic with generated slug and photo URL
 */
const createTopicService = async ({ topic_name, photo }) => {
    let photoKey = null;
    let photoUrl = null;
    // Handle photo upload if provided
    if (photo) {
        try {
            const uploadResult = await s3_service_1.S3Service.uploadFile(photo, 'topics');
            photoUrl = uploadResult.url;
            photoKey = uploadResult.key;
        }
        catch (error) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to upload photo to S3");
        }
    }
    // Generate slug from topic name
    const baseSlug = (0, transliteration_1.slugify)(topic_name).toLowerCase();
    let finalSlug = baseSlug;
    let counter = 1;
    // Check for existing slug and generate unique one if needed
    while (await prisma_1.default.topic.findFirst({
        where: { slug: finalSlug },
    })) {
        finalSlug = `${baseSlug}-${counter++}`;
    }
    try {
        const topic = await prisma_1.default.topic.create({
            data: {
                topic_name,
                slug: finalSlug,
                photo_url: photoUrl,
            },
        });
        return topic;
    }
    catch (error) {
        // If database creation fails, clean up uploaded photo
        if (photoKey) {
            try {
                await s3_service_1.S3Service.deleteFile(photoKey);
            }
            catch (cleanupError) {
                console.error("Failed to cleanup photo after database error:", cleanupError);
            }
        }
        if (error instanceof Error && 'code' in error && error.code === "P2002") {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Topic already exists");
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to create topic");
    }
};
exports.createTopicService = createTopicService;
const updateTopicService = async ({ topicSlug, topic_name, photo, removePhoto }) => {
    // Find existing topic
    const existingTopic = await prisma_1.default.topic.findUnique({
        where: { slug: topicSlug },
    });
    if (!existingTopic) {
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Topic not found");
    }
    let newPhotoUrl = existingTopic.photo_url;
    let oldPhotoKey = null;
    // Handle photo removal
    if (removePhoto && existingTopic.photo_url) {
        // Extract key from URL
        const urlParts = existingTopic.photo_url.split('/');
        oldPhotoKey = urlParts[urlParts.length - 1];
        if (oldPhotoKey) {
            oldPhotoKey = `topics/${oldPhotoKey}`;
        }
        newPhotoUrl = null;
    }
    // Handle new photo upload
    if (photo) {
        try {
            const uploadResult = await s3_service_1.S3Service.uploadFile(photo, 'topics');
            newPhotoUrl = uploadResult.url;
            // If we had an old photo, mark its key for deletion
            if (existingTopic.photo_url) {
                const urlParts = existingTopic.photo_url.split('/');
                oldPhotoKey = `topics/${urlParts[urlParts.length - 1]}`;
            }
        }
        catch (error) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to upload photo to S3");
        }
    }
    // Handle topic name update if provided
    let finalSlug = existingTopic.slug;
    if (topic_name) {
        const duplicate = await prisma_1.default.topic.findUnique({
            where: { topic_name },
        });
        if (duplicate && duplicate.id !== existingTopic.id) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Topic already exists");
        }
        const baseSlug = (0, transliteration_1.slugify)(topic_name).toLowerCase();
        finalSlug = baseSlug;
        let counter = 1;
        while (await prisma_1.default.topic.findFirst({
            where: {
                slug: finalSlug,
                NOT: { id: existingTopic.id },
            },
        })) {
            finalSlug = `${baseSlug}-${counter++}`;
        }
    }
    try {
        const updatedTopic = await prisma_1.default.topic.update({
            where: { id: existingTopic.id },
            data: {
                ...(topic_name && { topic_name }),
                slug: finalSlug,
                photo_url: newPhotoUrl,
            },
        });
        // Clean up old photo from S3 if update was successful
        if (oldPhotoKey) {
            try {
                await s3_service_1.S3Service.deleteFile(oldPhotoKey);
            }
            catch (cleanupError) {
                console.error("Failed to cleanup old photo from S3:", cleanupError);
            }
        }
        return updatedTopic;
    }
    catch (error) {
        // If database update fails, clean up newly uploaded photo
        if (photo && newPhotoUrl && newPhotoUrl !== existingTopic.photo_url) {
            const urlParts = newPhotoUrl.split('/');
            const newPhotoKey = `topics/${urlParts[urlParts.length - 1]}`;
            try {
                await s3_service_1.S3Service.deleteFile(newPhotoKey);
            }
            catch (cleanupError) {
                console.error("Failed to cleanup new photo after database error:", cleanupError);
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update topic");
    }
};
exports.updateTopicService = updateTopicService;
const deleteTopicService = async ({ topicSlug }) => {
    const topic = await prisma_1.default.topic.findUnique({
        where: { slug: topicSlug },
    });
    if (!topic) {
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Topic not found");
    }
    const classCount = await prisma_1.default.class.count({
        where: { topic_id: topic.id },
    });
    if (classCount > 0) {
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Cannot delete topic with existing classes");
    }
    const questionCount = await prisma_1.default.question.count({
        where: { topic_id: topic.id },
    });
    if (questionCount > 0) {
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Cannot delete topic with existing questions");
    }
    // Delete topic from database
    await prisma_1.default.topic.delete({
        where: { id: topic.id },
    });
    // Clean up photo from S3 if it exists
    if (topic.photo_url) {
        try {
            const urlParts = topic.photo_url.split('/');
            const photoKey = `topics/${urlParts[urlParts.length - 1]}`;
            await s3_service_1.S3Service.deleteFile(photoKey);
        }
        catch (cleanupError) {
            console.error("Failed to cleanup photo from S3 after topic deletion:", cleanupError);
        }
    }
    return true;
};
exports.deleteTopicService = deleteTopicService;
const createTopicsBulkService = async (topics) => {
    const created = await prisma_1.default.topic.createMany({
        data: topics,
        skipDuplicates: true, // ignore duplicates
    });
    return created;
};
exports.createTopicsBulkService = createTopicsBulkService;
