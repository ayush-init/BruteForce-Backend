"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookmark = exports.updateBookmark = exports.addBookmark = exports.getBookmarks = void 0;
const bookmark_query_service_1 = require("../services/bookmarks/bookmark-query.service");
const bookmark_crud_service_1 = require("../services/bookmarks/bookmark-crud.service");
const bookmark_validation_service_1 = require("../services/bookmarks/bookmark-validation.service");
const ApiError_1 = require("../utils/ApiError");
// ==============================
// GET ALL BOOKMARKS
// ==============================
const getBookmarks = async (req, res) => {
    const student = req.student;
    if (!student) {
        throw new ApiError_1.ApiError(401, "Authentication required - student information missing");
    }
    // Validate query parameters using service
    const queryParams = (0, bookmark_validation_service_1.validateBookmarkQueryParams)(req.query);
    const result = await (0, bookmark_query_service_1.getBookmarksService)(student.id, queryParams);
    res.status(200).json({
        success: true,
        data: result
    });
};
exports.getBookmarks = getBookmarks;
// ==============================
// ADD BOOKMARK
// ==============================
const addBookmark = async (req, res) => {
    const student = req.student;
    if (!student) {
        throw new ApiError_1.ApiError(401, "Authentication required - student information missing");
    }
    // Validate bookmark data using service
    const bookmarkData = (0, bookmark_validation_service_1.validateBookmarkCreateData)(req.body);
    const bookmark = await (0, bookmark_crud_service_1.addBookmarkService)(student.id, bookmarkData.question_id, bookmarkData.description);
    res.status(201).json({
        success: true,
        data: bookmark
    });
};
exports.addBookmark = addBookmark;
// ==============================
// UPDATE BOOKMARK
// ==============================
const updateBookmark = async (req, res) => {
    const student = req.student;
    if (!student) {
        throw new ApiError_1.ApiError(401, "Authentication required - student information missing");
    }
    const { questionId } = req.params;
    // Ensure questionId is a string (not string array)
    const questionIdStr = Array.isArray(questionId) ? questionId[0] : questionId;
    // Validate question ID parameter
    if (!questionIdStr) {
        throw new ApiError_1.ApiError(400, "Question ID is required", [], "VALIDATION_ERROR");
    }
    // Validate update data using service
    const updateData = (0, bookmark_validation_service_1.validateBookmarkUpdateData)(req.body);
    // For updateBookmarkService, description is required
    if (updateData.description === undefined) {
        throw new ApiError_1.ApiError(400, "Description is required for update", [], "VALIDATION_ERROR");
    }
    const bookmark = await (0, bookmark_crud_service_1.updateBookmarkService)(student.id, Number(questionIdStr), updateData.description);
    res.status(200).json({
        success: true,
        data: bookmark
    });
};
exports.updateBookmark = updateBookmark;
// ==============================
// DELETE BOOKMARK
// ==============================
const deleteBookmark = async (req, res) => {
    const student = req.student;
    if (!student) {
        throw new ApiError_1.ApiError(401, "Authentication required - student information missing");
    }
    const { questionId } = req.params;
    // Ensure questionId is a string (not string array)
    const questionIdStr = Array.isArray(questionId) ? questionId[0] : questionId;
    // Validation
    if (!questionIdStr || isNaN(parseInt(questionIdStr))) {
        throw new ApiError_1.ApiError(400, "Invalid question ID");
    }
    await (0, bookmark_crud_service_1.deleteBookmarkService)(student.id, parseInt(questionIdStr));
    res.status(200).json({
        success: true,
        message: "Bookmark deleted successfully"
    });
};
exports.deleteBookmark = deleteBookmark;
