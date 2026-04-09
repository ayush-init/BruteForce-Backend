"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLeaderboardBaseQueryByCityId = buildLeaderboardBaseQueryByCityId;
exports.getCachedYears = getCachedYears;
exports.getCachedCityYearMapping = getCachedCityYearMapping;
exports.getAvailableYears = getAvailableYears;
exports.handleLeaderboardError = handleLeaderboardError;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ApiError_1 = require("../../utils/ApiError");
// Cache configuration
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const metadataCache = {
    years: null,
    cityYearMap: null,
};
/**
 * Build base WHERE and ORDER BY clauses using city_id (optimized for JWT data)
 */
function buildLeaderboardBaseQueryByCityId(year, cityId, search) {
    const params = [year];
    let whereClause = `WHERE b.year = $1`;
    let paramIndex = 2;
    let orderByClause = `ORDER BY l.alltime_global_rank ASC`;
    // City filter by ID (integer comparison - much faster than string)
    if (cityId && cityId > 0) {
        whereClause += ` AND s.city_id = $${paramIndex}`;
        params.push(cityId);
        paramIndex++;
        orderByClause = `ORDER BY l.alltime_city_rank ASC`;
    }
    // Search filter (optional)
    if (search) {
        whereClause += ` AND (s.name ILIKE $${paramIndex} OR s.username ILIKE $${paramIndex + 1})`;
        params.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
    }
    return {
        whereClause,
        orderByClause,
        params,
        nextParamIndex: paramIndex,
    };
}
/**
 * Get cached available years
 */
async function getCachedYears() {
    const now = Date.now();
    if (metadataCache.years && metadataCache.years.expiresAt > now) {
        return metadataCache.years.data;
    }
    const years = await prisma_1.default.batch.findMany({
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "desc" },
    });
    const yearList = years.map((y) => y.year);
    metadataCache.years = {
        data: yearList,
        expiresAt: now + CACHE_TTL,
    };
    return yearList;
}
/**
 * Get cached city-year mapping
 */
async function getCachedCityYearMapping() {
    const now = Date.now();
    if (metadataCache.cityYearMap && metadataCache.cityYearMap.expiresAt > now) {
        return metadataCache.cityYearMap.data;
    }
    const query = `
    SELECT DISTINCT
      c.city_name,
      b.year
    FROM "City" c
    JOIN "Student" s ON s.city_id = c.id
    JOIN "Batch" b ON b.id = s.batch_id
    WHERE s.id IS NOT NULL
      AND b.year IS NOT NULL
    ORDER BY c.city_name, b.year DESC
  `;
    const results = (await prisma_1.default.$queryRawUnsafe(query));
    // Group by city
    const cityMap = {};
    results.forEach((row) => {
        if (!cityMap[row.city_name]) {
            cityMap[row.city_name] = [];
        }
        if (!cityMap[row.city_name].includes(row.year)) {
            cityMap[row.city_name].push(row.year);
        }
    });
    // Get all available years for "All Cities"
    const allYears = await getCachedYears();
    // Build final array
    const cityYearArray = [
        { city_name: "All Cities", available_years: allYears },
        ...Object.entries(cityMap)
            .map(([city_name, years]) => ({
            city_name,
            available_years: [...new Set(years)].sort((a, b) => b - a),
        }))
            .sort((a, b) => a.city_name.localeCompare(b.city_name)),
    ];
    metadataCache.cityYearMap = {
        data: cityYearArray,
        expiresAt: now + CACHE_TTL,
    };
    return cityYearArray;
}
/**
 * Get available years directly from DB (for validation)
 */
async function getAvailableYears() {
    return getCachedYears();
}
/**
 * Handle leaderboard errors consistently
 */
function handleLeaderboardError(error, context) {
    console.error(`${context} error:`, error);
    if (error instanceof ApiError_1.ApiError) {
        throw error;
    }
    // Handle Prisma errors
    if (error.code === 'P2025') {
        throw new ApiError_1.ApiError(404, "Data not found", [], "NOT_FOUND");
    }
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connection')) {
        throw new ApiError_1.ApiError(503, "Database connection failed", [], "DB_CONNECTION_ERROR");
    }
    // Handle timeout errors
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        throw new ApiError_1.ApiError(504, "Request timeout", [], "TIMEOUT_ERROR");
    }
    // Generic error handling
    throw new ApiError_1.ApiError(500, `${context} failed`, [], "INTERNAL_ERROR");
}
