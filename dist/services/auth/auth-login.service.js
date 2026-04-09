"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.refreshAccessToken = exports.loginAdmin = exports.loginStudent = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const password_util_1 = require("../../utils/password.util");
const jwt_util_1 = require("../../utils/jwt.util");
const google_auth_library_1 = require("google-auth-library");
const emailValidation_util_1 = require("../../utils/emailValidation.util");
const ApiError_1 = require("../../utils/ApiError");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
const loginStudent = async (credentials) => {
    const { email, username, password } = credentials;
    if ((!email && !username) || !password) {
        throw new ApiError_1.ApiError(400, 'Either email or username with password are required');
    }
    // Validate email domain if email is provided
    if (email) {
        const emailValidation = (0, emailValidation_util_1.validateEmail)(email);
        if (!emailValidation.isValid) {
            throw new ApiError_1.ApiError(400, emailValidation.error);
        }
    }
    // Find student by email or username
    const student = await prisma_1.default.student.findFirst({
        where: {
            OR: [
                email ? { email } : {},
                username ? { username } : {}
            ]
        },
        include: {
            city: true,
            batch: true,
        },
    });
    if (!student || !student.password_hash) {
        throw new ApiError_1.ApiError(401, 'Invalid credentials', [], "INVALID_CREDENTIALS");
    }
    // Compare password
    const isValidPassword = await (0, password_util_1.comparePassword)(password, student.password_hash);
    if (!isValidPassword) {
        throw new ApiError_1.ApiError(401, 'Invalid credentials', [], "INVALID_CREDENTIALS");
    }
    const accessToken = (0, jwt_util_1.generateAccessToken)({
        id: student.id,
        email: student.email,
        role: 'STUDENT',
        userType: 'student',
        ...(student.batch && student.city && {
            batchId: student.batch.id,
            batchName: student.batch.batch_name,
            batchSlug: student.batch.slug,
            cityId: student.city.id,
            cityName: student.city.city_name,
        }),
    });
    const refreshToken = (0, jwt_util_1.generateRefreshToken)({
        id: student.id,
        userType: 'student',
    });
    // Update refresh token in database
    await prisma_1.default.student.update({
        where: { id: student.id },
        data: { refresh_token: refreshToken },
    });
    return {
        user: {
            id: student.id,
            name: student.name,
            email: student.email,
            username: student.username,
            city: student.city,
            batch: student.batch,
            leetcode_id: student.leetcode_id,
            gfg_id: student.gfg_id,
            cityId: student.city_id,
            cityName: student.city?.city_name || null,
            batchId: student.batch_id,
            batchName: student.batch?.batch_name || null,
            batchSlug: student.batch?.slug || null
        },
        accessToken,
        refreshToken
    };
};
exports.loginStudent = loginStudent;
const loginAdmin = async (credentials) => {
    const { email, password } = credentials;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, 'Email and password are required');
    }
    const admin = await prisma_1.default.admin.findUnique({
        where: { email },
        include: {
            batch: {
                select: {
                    id: true,
                    batch_name: true,
                    city: {
                        select: {
                            id: true,
                            city_name: true
                        }
                    }
                }
            }
        }
    });
    if (!admin || !admin.password_hash) {
        throw new ApiError_1.ApiError(401, 'Invalid credentials', [], "INVALID_CREDENTIALS");
    }
    const isValidPassword = await (0, password_util_1.comparePassword)(password, admin.password_hash);
    if (!isValidPassword) {
        throw new ApiError_1.ApiError(401, 'Invalid credentials', [], "INVALID_CREDENTIALS");
    }
    const accessToken = (0, jwt_util_1.generateAccessToken)({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        userType: 'admin',
        ...(admin.batch && admin.batch.city && {
            batchId: admin.batch.id,
            batchName: admin.batch.batch_name,
            cityId: admin.batch.city.id,
            cityName: admin.batch.city.city_name,
        }),
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
exports.loginAdmin = loginAdmin;
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError_1.ApiError(400, 'Refresh token required');
    }
    const decoded = (0, jwt_util_1.verifyRefreshToken)(refreshToken);
    let user;
    if (decoded.userType === 'admin') {
        user = await prisma_1.default.admin.findUnique({
            where: { id: decoded.id },
            include: {
                batch: {
                    select: { id: true, batch_name: true, city: { select: { id: true, city_name: true } } }
                }
            }
        });
    }
    else {
        user = await prisma_1.default.student.findUnique({
            where: { id: decoded.id },
            include: {
                batch: true,
                city: true
            }
        });
    }
    if (!user || user.refresh_token !== refreshToken) {
        throw new ApiError_1.ApiError(403, 'Invalid refresh token', [], "INVALID_TOKEN");
    }
    const newAccessToken = (0, jwt_util_1.generateAccessToken)({
        id: user.id,
        email: user.email,
        role: decoded.userType === 'admin' ? user.role : 'STUDENT',
        userType: decoded.userType,
        ...(user.batch && decoded.userType === 'admin' && user.batch.city && {
            batchId: user.batch.id,
            batchName: user.batch.batch_name,
            cityId: user.batch.city.id,
            cityName: user.batch.city.city_name,
        }),
        ...(user.batch && decoded.userType === 'student' && user.city && {
            batchId: user.batch.id,
            batchName: user.batch.batch_name,
            batchSlug: user.batch.slug,
            cityId: user.city.id,
            cityName: user.city.city_name,
        }),
    });
    return { accessToken: newAccessToken };
};
exports.refreshAccessToken = refreshAccessToken;
const googleAuth = async (idToken) => {
    if (!idToken) {
        throw new ApiError_1.ApiError(400, "ID token required");
    }
    // Verify token with Google
    async function verifyIdToken(idToken) {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return payload;
        }
        catch (error) {
            if (error instanceof ApiError_1.ApiError)
                throw error;
            console.error("Google Auth Library verifyIdToken Error:", error.message);
            throw new ApiError_1.ApiError(400, 'Failed to verify Google token: ' + error.message);
        }
    }
    const payload = await verifyIdToken(idToken);
    if (!payload?.email) {
        throw new ApiError_1.ApiError(400, "Invalid Google token");
    }
    const email = payload.email;
    const googleId = payload.sub;
    // Validate email domain
    const emailValidation = (0, emailValidation_util_1.validateEmail)(email);
    if (!emailValidation.isValid) {
        throw new ApiError_1.ApiError(400, emailValidation.error);
    }
    // Check if student exists
    const student = await prisma_1.default.student.findUnique({
        where: { email },
        include: {
            city: true,
            batch: true,
        },
    });
    if (!student) {
        throw new ApiError_1.ApiError(422, "Student not registered by admin", [], "STUDENT_NOT_REGISTERED");
    }
    // Update google_id if not set
    if (!student.google_id) {
        await prisma_1.default.student.update({
            where: { id: student.id },
            data: { google_id: googleId },
        });
    }
    const accessToken = (0, jwt_util_1.generateAccessToken)({
        id: student.id,
        email: student.email,
        role: "STUDENT",
        userType: "student",
        ...(student.batch && student.city && {
            batchId: student.batch.id,
            batchName: student.batch.batch_name,
            batchSlug: student.batch.slug,
            cityId: student.city.id,
            cityName: student.city.city_name,
        }),
    });
    const refreshToken = (0, jwt_util_1.generateRefreshToken)({
        id: student.id,
        userType: "student",
    });
    // Update refresh token in database
    await prisma_1.default.student.update({
        where: { id: student.id },
        data: { refresh_token: refreshToken },
    });
    return {
        user: {
            id: student.id,
            name: student.name,
            email: student.email,
            username: student.username,
            city: student.city,
            batch: student.batch,
            leetcode_id: student.leetcode_id,
            gfg_id: student.gfg_id,
            cityId: student.city_id,
            cityName: student.city?.city_name || null,
            batchId: student.batch_id,
            batchName: student.batch?.batch_name || null,
            batchSlug: student.batch?.slug || null
        },
        accessToken,
        refreshToken
    };
};
exports.googleAuth = googleAuth;
