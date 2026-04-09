"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBatchesService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
const getAllBatchesService = async ({ city, year, }) => {
    const filters = {};
    if (city) {
        const cityData = await prisma_1.default.city.findUnique({
            where: { city_name: city },
        });
        if (!cityData) {
            throw new ApiError_1.ApiError(400, "City not found");
        }
        filters.city_id = cityData.id;
    }
    if (year) {
        filters.year = year;
    }
    const batches = await prisma_1.default.batch.findMany({
        where: filters,
        include: {
            city: true,
            _count: {
                select: {
                    students: true,
                    classes: true,
                },
            },
        },
        orderBy: { created_at: "desc" },
    });
    return batches;
};
exports.getAllBatchesService = getAllBatchesService;
