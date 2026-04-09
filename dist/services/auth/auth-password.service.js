"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOTP = exports.sendPasswordResetOTP = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const otp_util_1 = require("../../utils/otp.util");
const email_util_1 = require("../../utils/email.util");
const emailValidation_util_1 = require("../../utils/emailValidation.util");
const passwordValidator_util_1 = require("../../utils/passwordValidator.util");
const password_util_1 = require("../../utils/password.util");
const ApiError_1 = require("../../utils/ApiError");
const sendPasswordResetOTP = async (email) => {
    if (!email) {
        throw new ApiError_1.ApiError(400, 'Email is required');
    }
    // Validate email domain
    const emailValidation = (0, emailValidation_util_1.validateEmail)(email);
    if (!emailValidation.isValid) {
        throw new ApiError_1.ApiError(400, emailValidation.error);
    }
    // Check if user exists (student or admin)
    let user = null;
    user = await prisma_1.default.student.findUnique({ where: { email } });
    if (!user) {
        user = await prisma_1.default.admin.findUnique({ where: { email } });
    }
    if (!user) {
        throw new ApiError_1.ApiError(404, 'No account found with this email address');
    }
    // Generate and save OTP
    const otp = (0, otp_util_1.generateOTP)();
    console.log(`Generated OTP for ${email}: ${otp}`);
    await (0, otp_util_1.saveOTP)(email, otp);
    console.log('OTP saved to database');
    // Send OTP email
    console.log('Attempting to send OTP email...');
    await (0, email_util_1.sendOTPEmail)(email, otp, user?.name);
    console.log('OTP email sent successfully!');
    return {
        message: 'OTP sent to your email address',
        otp // Return OTP for testing
    };
};
exports.sendPasswordResetOTP = sendPasswordResetOTP;
const verifyOTP = async (email, otp) => {
    if (!email || !otp) {
        throw new ApiError_1.ApiError(400, 'Email and OTP are required');
    }
    // Validate email domain
    const emailValidation = (0, emailValidation_util_1.validateEmail)(email);
    if (!emailValidation.isValid) {
        throw new ApiError_1.ApiError(400, emailValidation.error);
    }
    // Verify OTP
    console.log(`Attempting to validate OTP: ${otp} for email: ${email}`);
    const isValidOTP = await (0, otp_util_1.validateOTP)(email, otp);
    console.log(`OTP validation result: ${isValidOTP}`);
    if (!isValidOTP) {
        throw new ApiError_1.ApiError(400, 'Invalid or expired OTP');
    }
    return {
        message: 'OTP verified successfully',
        valid: true
    };
};
exports.verifyOTP = verifyOTP;
const resetPassword = async (email, otp, newPassword) => {
    if (!email || !otp || !newPassword) {
        throw new ApiError_1.ApiError(400, 'Email, OTP, and new password are required');
    }
    // Validate email domain
    const emailValidation = (0, emailValidation_util_1.validateEmail)(email);
    if (!emailValidation.isValid) {
        throw new ApiError_1.ApiError(400, emailValidation.error);
    }
    // Validate password strength
    (0, passwordValidator_util_1.validatePasswordForAuth)(newPassword);
    // Verify OTP
    console.log(`Attempting to validate OTP: ${otp} for email: ${email}`);
    const isValidOTP = await (0, otp_util_1.validateOTP)(email, otp);
    console.log(`OTP validation result: ${isValidOTP}`);
    if (!isValidOTP) {
        throw new ApiError_1.ApiError(400, 'Invalid or expired OTP');
    }
    // Mark OTP as used
    await prisma_1.default.passwordResetOTP.updateMany({
        where: {
            email,
            is_used: false
        },
        data: { is_used: true }
    });
    // Find user
    let user = null;
    user = await prisma_1.default.student.findUnique({ where: { email } });
    let userType = '';
    if (user) {
        userType = 'student';
    }
    else {
        user = await prisma_1.default.admin.findUnique({ where: { email } });
        if (user) {
            userType = 'admin';
        }
    }
    if (!user) {
        throw new ApiError_1.ApiError(404, 'User not found');
    }
    // Check if new password is same as current password
    if (user.password_hash) {
        const isSamePassword = await (0, password_util_1.comparePassword)(newPassword, user.password_hash);
        if (isSamePassword) {
            throw new ApiError_1.ApiError(400, 'New password cannot be the same as your current password');
        }
    }
    // Hash new password
    const password_hash = await (0, password_util_1.hashPassword)(newPassword);
    // Update password based on user type
    if (userType === 'student') {
        await prisma_1.default.student.update({
            where: { email },
            data: { password_hash }
        });
    }
    else {
        await prisma_1.default.admin.update({
            where: { email },
            data: { password_hash }
        });
    }
    return {
        message: 'Password reset successful. You can now login with your new password.'
    };
};
exports.resetPassword = resetPassword;
