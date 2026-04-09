"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCityYearMapping = exports.getAvailableCities = exports.getAvailableYears = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getAvailableYears = async () => {
    const years = await prisma_1.default.batch.findMany({
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' }
    });
    return years.map(y => y.year);
};
exports.getAvailableYears = getAvailableYears;
const getAvailableCities = async () => {
    const cities = await prisma_1.default.city.findMany({
        select: { city_name: true },
        orderBy: { city_name: 'asc' }
    });
    return cities.map(c => c.city_name);
};
exports.getAvailableCities = getAvailableCities;
// New function to get city-year mapping
const getCityYearMapping = async () => {
    try {
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
        console.log("Executing city-year mapping query:", query);
        const results = await prisma_1.default.$queryRawUnsafe(query);
        console.log("City-year mapping query results:", results);
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
        // Get all available years
        const availableYears = await (0, exports.getAvailableYears)();
        // Convert to array format with "All Cities" included
        const cityYearArray = [
            { city_name: "All Cities", available_years: availableYears },
            ...Object.entries(cityMap)
                .map(([city, years]) => ({
                city_name: city,
                available_years: [...new Set(years)].sort((a, b) => b - a)
            }))
                .sort((a, b) => {
                // Put "All Cities" first, then sort alphabetically
                if (a.city_name === "All Cities")
                    return -1;
                if (b.city_name === "All Cities")
                    return 1;
                return a.city_name.localeCompare(b.city_name);
            })
        ];
        console.log("Final city-year array:", cityYearArray);
        return cityYearArray;
    }
    catch (error) {
        console.error("Error in getCityYearMapping:", error);
        throw error;
    }
};
exports.getCityYearMapping = getCityYearMapping;
