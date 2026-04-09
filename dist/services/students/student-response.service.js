"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthenticatedStudent = exports.validateStudentId = exports.formatStudentResponse = void 0;
const ApiError_1 = require("../../utils/ApiError");
const formatStudentResponse = (student) => {
    return {
        success: true,
        data: {
            id: student.id,
            name: student.name,
            username: student.username,
            city: student.city,
            batch: student.batch,
            email: student.email,
            profileImageUrl: student.profile_image_url || undefined,
            leetcode: student.leetcode_id || undefined,
            gfg: student.gfg_id || undefined
        }
    };
};
exports.formatStudentResponse = formatStudentResponse;
const validateStudentId = (idParam) => {
    if (!idParam) {
        throw new ApiError_1.ApiError(400, "Student ID is required", [], "VALIDATION_ERROR");
    }
    const studentId = Number(idParam);
    if (isNaN(studentId) || studentId <= 0) {
        throw new ApiError_1.ApiError(400, "Invalid student ID", [], "VALIDATION_ERROR");
    }
    return studentId;
};
exports.validateStudentId = validateStudentId;
const validateAuthenticatedStudent = (user) => {
    const studentId = user?.id;
    if (!studentId) {
        throw new ApiError_1.ApiError(401, "Student not authenticated", [], "UNAUTHORIZED");
    }
    return studentId;
};
exports.validateAuthenticatedStudent = validateAuthenticatedStudent;
