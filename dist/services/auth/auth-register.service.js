"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStudent = exports.registerAdmin = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const admin_crud_service_1 = require("../admin/admin-crud.service");
const password_util_1 = require("../../utils/password.util");
const jwt_util_1 = require("../../utils/jwt.util");
const emailValidation_util_1 = require("../../utils/emailValidation.util");
const passwordValidator_util_1 = require("../../utils/passwordValidator.util");
const ApiError_1 = require("../../utils/ApiError");
const registerAdmin = async (data) => {
    const { currentUserRole, ...adminData } = data;
    // Only SUPERADMIN can create admins
    if (currentUserRole !== 'SUPERADMIN') {
        throw new ApiError_1.ApiError(403, 'Only Super Admin can register new admins', [], "FORBIDDEN");
    }
    // Create admin using the existing service
    const admin = await (0, admin_crud_service_1.createAdminService)(adminData);
    // Generate tokens
    const accessToken = (0, jwt_util_1.generateAccessToken)({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        userType: 'admin',
    });
    const refreshToken = (0, jwt_util_1.generateRefreshToken)({
        id: admin.id,
        userType: 'admin',
    });
    // Update refresh token in database
    await prisma_1.default.admin.update({
        where: { id: admin.id },
        data: { refresh_token: refreshToken },
    });
    return {
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
        accessToken,
        refreshToken
    };
};
exports.registerAdmin = registerAdmin;
const registerStudent = async (data) => {
    const { name, email, username, password, enrollment_id, batch_id, leetcode_id, gfg_id } = data;
    // Validation
    if (!name || !email || !username || !password || !batch_id) {
        throw new ApiError_1.ApiError(400, 'Name, email, username, password, and batch_id are required', [], "REQUIRED_FIELD");
    }
    // Validate email domain
    const emailValidation = (0, emailValidation_util_1.validateEmail)(email);
    if (!emailValidation.isValid) {
        throw new ApiError_1.ApiError(400, emailValidation.error, [], "INVALID_EMAIL");
    }
    // Check existing user
    const existingStudent = await prisma_1.default.student.findFirst({
        where: {
            OR: [{ email }, { username }, { enrollment_id }],
        },
    });
    if (existingStudent) {
        throw new ApiError_1.ApiError(400, 'Email, username, or enrollment_id already exists', [], "USER_EXISTS");
    }
    // Get batch information to fetch city_id
    const batch = await prisma_1.default.batch.findUnique({
        where: { id: batch_id },
        include: { city: true }
    });
    if (!batch) {
        throw new ApiError_1.ApiError(400, 'Invalid batch_id', [], "BATCH_NOT_FOUND");
    }
    // Validate password strength
    (0, passwordValidator_util_1.validatePasswordForAuth)(password);
    // Hash password
    const password_hash = await (0, password_util_1.hashPassword)(password);
    // Create student
    const student = await prisma_1.default.student.create({
        data: {
            name,
            email,
            username,
            password_hash,
            enrollment_id,
            batch_id,
            city_id: batch.city_id,
            leetcode_id,
            gfg_id,
        },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            enrollment_id: true,
            batch_id: true,
            city_id: true,
            leetcode_id: true,
            gfg_id: true,
            created_at: true,
            batch: {
                select: {
                    id: true,
                    batch_name: true,
                    slug: true,
                    year: true
                }
            },
            city: {
                select: {
                    id: true,
                    city_name: true
                }
            }
        },
    });
    return student;
};
exports.registerStudent = registerStudent;
