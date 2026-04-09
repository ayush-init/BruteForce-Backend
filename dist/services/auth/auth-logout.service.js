"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAdmin = exports.logoutStudent = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logoutStudent = async (studentId) => {
    if (studentId) {
        await prisma_1.default.student.update({
            where: { id: studentId },
            data: { refresh_token: null }
        });
    }
};
exports.logoutStudent = logoutStudent;
const logoutAdmin = async (adminId) => {
    if (adminId) {
        await prisma_1.default.admin.update({
            where: { id: adminId },
            data: { refresh_token: null }
        });
    }
};
exports.logoutAdmin = logoutAdmin;
