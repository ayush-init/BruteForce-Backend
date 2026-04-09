"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStudentsService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../utils/ApiError");
const getAllStudentsService = async (query) => {
    try {
        const { search, city, batchSlug, sortBy = "created_at", order = "desc", page = 1, limit = 10, minGlobalRank, maxGlobalRank, minCityRank, maxCityRank } = query;
        // --- PAGINATION SAFETY ---
        const parsedPage = Math.max(1, Number(page) || 1);
        let parsedLimit = Number(limit) || 10;
        // Cap limit to max 100
        if (parsedLimit > 100) {
            parsedLimit = 100;
        }
        if (parsedLimit < 1) {
            parsedLimit = 10;
        }
        const skip = (parsedPage - 1) * parsedLimit;
        const take = parsedLimit;
        // Check if rank filters are provided
        const hasRankFilters = minGlobalRank || maxGlobalRank || minCityRank || maxCityRank;
        // --- STEP 1: Get student IDs matching rank filters (if any) ---
        let rankFilteredStudentIds = null;
        if (hasRankFilters) {
            const rankConditions = [];
            const rankParams = [];
            let paramIndex = 1;
            if (minGlobalRank) {
                rankConditions.push(`alltime_global_rank >= $${paramIndex}`);
                rankParams.push(Number(minGlobalRank));
                paramIndex++;
            }
            if (maxGlobalRank) {
                rankConditions.push(`alltime_global_rank <= $${paramIndex}`);
                rankParams.push(Number(maxGlobalRank));
                paramIndex++;
            }
            if (minCityRank) {
                rankConditions.push(`alltime_city_rank >= $${paramIndex}`);
                rankParams.push(Number(minCityRank));
                paramIndex++;
            }
            if (maxCityRank) {
                rankConditions.push(`alltime_city_rank <= $${paramIndex}`);
                rankParams.push(Number(maxCityRank));
                paramIndex++;
            }
            const leaderboardFilterQuery = `
                SELECT student_id
                FROM "Leaderboard"
                WHERE ${rankConditions.join(' AND ')}
            `;
            const leaderboardFiltered = await prisma_1.default.$queryRawUnsafe(leaderboardFilterQuery, ...rankParams);
            rankFilteredStudentIds = leaderboardFiltered.map(entry => entry.student_id);
            // Early return if no students match rank filters
            if (rankFilteredStudentIds.length === 0) {
                return {
                    students: [],
                    pagination: {
                        page: parsedPage,
                        limit: take,
                        total: 0,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPreviousPage: parsedPage > 1
                    }
                };
            }
        }
        const where = {};
        // --- APPLY RANK FILTER TO WHERE (if applicable) ---
        if (rankFilteredStudentIds) {
            where.id = { in: rankFilteredStudentIds };
        }
        // search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
                { enrollment_id: { contains: search, mode: "insensitive" } },
            ];
        }
        // city filter
        if (city) {
            where.city = {
                city_name: city,
            };
        }
        // batch filter
        if (batchSlug) {
            where.batch = {
                slug: batchSlug,
            };
        }
        // dynamic sorting
        let orderBy = {
            [sortBy]: order === "asc" ? "asc" : "desc"
        };
        // special case -> total solved questions
        if (sortBy === "totalSolved") {
            orderBy = {
                progress: {
                    _count: order === "asc" ? "asc" : "desc"
                }
            };
        }
        // --- STEP 2: Fetch students + count + leaderboard in parallel ---
        const [students, totalCount] = await Promise.all([
            // Get students with pagination
            prisma_1.default.student.findMany({
                where,
                include: {
                    city: true,
                    batch: true,
                    _count: {
                        select: {
                            progress: true
                        }
                    }
                },
                orderBy,
                skip,
                take
            }),
            // Get total count for pagination
            prisma_1.default.student.count({ where })
        ]);
        // Get leaderboard data for the fetched students (PARALLEL)
        const studentIds = students.map(s => s.id);
        let leaderboardData = [];
        if (studentIds.length > 0) {
            leaderboardData = await prisma_1.default.$queryRaw `
                SELECT 
                    student_id,
                    alltime_global_rank as global_rank,
                    alltime_city_rank as city_rank,
                    easy_solved,
                    medium_solved,
                    hard_solved
                FROM "Leaderboard"
                WHERE student_id = ANY(${studentIds}::int[])
            `;
        }
        // Create a map for quick lookup
        const leaderboardMap = new Map(leaderboardData.map(entry => [entry.student_id, entry]));
        // Format response (NO in-memory filtering - all filtering done at DB)
        const formatted = students.map((student) => {
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                username: student.username,
                enrollment_id: student.enrollment_id,
                profile_image_url: student.profile_image_url,
                leetcode_id: student.leetcode_id,
                gfg_id: student.gfg_id,
                totalSolved: student._count.progress
            };
        });
        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / take);
        const hasNextPage = parsedPage < totalPages;
        const hasPreviousPage = parsedPage > 1;
        return {
            students: formatted,
            pagination: {
                page: parsedPage,
                limit: take,
                total: totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        };
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ApiError_1.ApiError(400, "Duplicate entry found", [], "DUPLICATE_ENTRY");
            }
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(404, "Record not found", [], "NOT_FOUND_ERROR");
            }
        }
        throw new ApiError_1.ApiError(500, "Failed to fetch students", [], "SERVER_ERROR");
    }
};
exports.getAllStudentsService = getAllStudentsService;
