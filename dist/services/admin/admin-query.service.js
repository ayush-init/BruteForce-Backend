"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdminService = exports.getAllAdminsService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
const getAllAdminsService = async (filters = {}) => {
    try {
        const { city_id, batch_id, role, search } = filters;
        // Build search filter
        let searchFilter = {};
        if (search) {
            searchFilter = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            };
        }
        const admins = await prisma_1.default.admin.findMany({
            where: {
                ...(city_id && { city_id: parseInt(city_id) }),
                ...(batch_id && { batch_id: parseInt(batch_id) }),
                ...(role && { role: role }),
                ...searchFilter
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
                updated_at: true,
                city: {
                    select: {
                        id: true,
                        city_name: true
                    }
                },
                batch: {
                    select: {
                        id: true,
                        batch_name: true,
                        year: true,
                        city_id: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        return admins;
    }
    catch (error) {
        console.error("Get admins error:", error);
        throw error;
    }
};
exports.getAllAdminsService = getAllAdminsService;
const getCurrentAdminService = async (adminId) => {
    const admin = await prisma_1.default.admin.findUnique({
        where: { id: adminId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            city_id: true,
            batch_id: true,
            city: {
                select: {
                    id: true,
                    city_name: true
                }
            },
            batch: {
                select: {
                    id: true,
                    batch_name: true,
                    year: true
                }
            },
            created_at: true
        }
    });
    if (!admin) {
        throw new ApiError_1.ApiError(404, "Admin not found", [], "ADMIN_NOT_FOUND");
    }
    return admin;
};
exports.getCurrentAdminService = getCurrentAdminService;
