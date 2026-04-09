"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookmarkUpdateData = exports.validateBookmarkCreateData = exports.validateBookmarkQueryParams = void 0;
const ApiError_1 = require("../../utils/ApiError");
const validateBookmarkQueryParams = (query) => {
    const { page = 1, limit = 10, sort = 'recent', filter = 'all' } = query;
    // Validate sort parameter
    const validSorts = ['recent', 'old', 'solved', 'unsolved'];
    const sortParam = sort;
    if (!validSorts.includes(sortParam)) {
        throw new ApiError_1.ApiError(400, "Invalid sort parameter", [], "INVALID_SORT");
    }
    // Validate filter parameter
    const validFilters = ['all', 'solved', 'unsolved'];
    const filterParam = filter;
    if (!validFilters.includes(filterParam)) {
        throw new ApiError_1.ApiError(400, "Invalid filter parameter", [], "INVALID_FILTER");
    }
    // Validate and parse page
    const pageNum = Number(page);
    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError_1.ApiError(400, "Invalid page parameter", [], "INVALID_PAGE");
    }
    // Validate and parse limit
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.ApiError(400, "Invalid limit parameter (must be between 1 and 100)", [], "INVALID_LIMIT");
    }
    return {
        page: pageNum,
        limit: limitNum,
        sort: sortParam,
        filter: filterParam
    };
};
exports.validateBookmarkQueryParams = validateBookmarkQueryParams;
const validateBookmarkCreateData = (body) => {
    const { question_id, description } = body;
    // Validate question_id
    if (!question_id) {
        throw new ApiError_1.ApiError(400, "Question ID is required", [], "VALIDATION_ERROR");
    }
    if (typeof question_id !== 'number') {
        throw new ApiError_1.ApiError(400, "Question ID must be a number", [], "VALIDATION_ERROR");
    }
    if (question_id <= 0) {
        throw new ApiError_1.ApiError(400, "Question ID must be a positive number", [], "VALIDATION_ERROR");
    }
    // Validate description (optional)
    if (description !== undefined) {
        if (typeof description !== 'string') {
            throw new ApiError_1.ApiError(400, "Description must be a string", [], "VALIDATION_ERROR");
        }
        if (description.length > 500) {
            throw new ApiError_1.ApiError(400, "Description must be 500 characters or less", [], "VALIDATION_ERROR");
        }
    }
    return {
        question_id,
        description: description || undefined
    };
};
exports.validateBookmarkCreateData = validateBookmarkCreateData;
const validateBookmarkUpdateData = (body) => {
    const { question_id, description } = body;
    const updateData = {};
    // Validate question_id if provided
    if (question_id !== undefined) {
        if (!question_id) {
            throw new ApiError_1.ApiError(400, "Question ID cannot be empty", [], "VALIDATION_ERROR");
        }
        if (typeof question_id !== 'number') {
            throw new ApiError_1.ApiError(400, "Question ID must be a number", [], "VALIDATION_ERROR");
        }
        if (question_id <= 0) {
            throw new ApiError_1.ApiError(400, "Question ID must be a positive number", [], "VALIDATION_ERROR");
        }
        updateData.question_id = question_id;
    }
    // Validate description if provided
    if (description !== undefined) {
        if (typeof description !== 'string') {
            throw new ApiError_1.ApiError(400, "Description must be a string", [], "VALIDATION_ERROR");
        }
        if (description.length > 500) {
            throw new ApiError_1.ApiError(400, "Description must be 500 characters or less", [], "VALIDATION_ERROR");
        }
        updateData.description = description;
    }
    return updateData;
};
exports.validateBookmarkUpdateData = validateBookmarkUpdateData;
