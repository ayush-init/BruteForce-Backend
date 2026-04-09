"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassDetailsWithFullQuestions = exports.deleteClass = exports.updateClass = exports.getClassDetails = exports.createClassInTopic = exports.getClassesByTopic = void 0;
const class_service_1 = require("../services/topics/class.service");
const class_query_service_1 = require("../services/topics/class-query.service");
const class_student_service_1 = require("../services/topics/class-student.service");
const class_validation_service_1 = require("../services/classes/class-validation.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
exports.getClassesByTopic = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    // Validate topic slug and query parameters using service
    const topicSlug = (0, class_validation_service_1.validateTopicSlug)(req.params.topicSlug);
    const queryParams = (0, class_validation_service_1.validateClassQueryParams)(req.query);
    const classes = await (0, class_query_service_1.getClassesByTopicService)({
        batchId: batch.id,
        topicSlug: topicSlug,
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
    });
    return res.json(classes);
});
exports.createClassInTopic = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const batch = req.batch;
        if (!batch) {
            throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
        }
        // Validate topic slug and class data using service
        const topicSlug = (0, class_validation_service_1.validateTopicSlug)(req.params.topicSlug);
        const classData = (0, class_validation_service_1.validateClassCreateData)(req.body, req.file);
        if (!classData.class_name || !classData.description || !classData.pdf_url || !classData.pdf_file || !classData.duration_minutes || !classData.class_date) {
            throw new ApiError_1.ApiError(400, "Invalid class data");
        }
        const newClass = await (0, class_service_1.createClassInTopicService)({
            batchId: batch.id,
            topicSlug: topicSlug,
            class_name: classData.class_name,
            description: classData.description,
            pdf_url: classData.pdf_url,
            pdf_file: classData.pdf_file,
            duration_minutes: classData.duration_minutes,
            class_date: classData.class_date
        });
        return res.status(201).json({
            message: "Class created successfully",
            class: newClass,
        });
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        throw new ApiError_1.ApiError(400, error.message);
    }
});
exports.getClassDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    // Validate topic and class slugs using service
    const topicSlug = (0, class_validation_service_1.validateTopicSlug)(req.params.topicSlug);
    const classSlug = (0, class_validation_service_1.validateTopicSlug)(req.params.classSlug);
    const classDetails = await (0, class_query_service_1.getClassDetailsService)({
        batchId: batch.id,
        topicSlug: topicSlug,
        classSlug: classSlug,
    });
    return res.json(classDetails);
});
exports.updateClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    const topicSlugParam = req.params.topicSlug;
    const classSlug = req.params.classSlug;
    if (typeof topicSlugParam !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid topic slug");
    }
    if (typeof classSlug !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid class slug");
    }
    const updated = await (0, class_service_1.updateClassService)({
        batchId: batch.id,
        topicSlug: topicSlugParam,
        classSlug,
        ...req.body,
        pdf_file: req.file, // Handle PDF file upload
    });
    return res.json({
        message: "Class updated successfully",
        class: updated,
    });
});
exports.deleteClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = req.batch;
    if (!batch) {
        throw new ApiError_1.ApiError(401, "Authentication required - batch information missing");
    }
    const topicSlugParam = req.params.topicSlug;
    const classSlug = req.params.classSlug;
    if (typeof topicSlugParam !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid topic slug");
    }
    if (typeof classSlug !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid class slug");
    }
    await (0, class_service_1.deleteClassService)({
        batchId: batch.id,
        topicSlug: topicSlugParam,
        classSlug,
    });
    return res.json({
        message: "Class deleted successfully",
    });
});
// Student-specific controller - get class details with full questions array
exports.getClassDetailsWithFullQuestions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Get student info from middleware (extractStudentInfo)
    const student = req.student;
    const batchId = req.batchId;
    const { topicSlug, classSlug } = req.params;
    const studentId = student?.id;
    // Ensure slugs are strings (not string arrays)
    const topic = Array.isArray(topicSlug) ? topicSlug[0] : topicSlug;
    const cls = Array.isArray(classSlug) ? classSlug[0] : classSlug;
    if (!studentId || !batchId || !topic || !cls) {
        throw new ApiError_1.ApiError(400, "Student authentication and topic/class slugs required");
    }
    const classDetails = await (0, class_student_service_1.getClassDetailsWithFullQuestionsService)({
        studentId,
        batchId,
        topicSlug: topic,
        classSlug: cls,
        query: req.query,
    });
    return res.json(classDetails);
});
