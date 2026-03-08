"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCityService = exports.updateCityService = exports.getAllCitiesService = exports.createCityService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const slugify_1 = require("../utils/slugify");
const createCityService = async ({ city_name, }) => {
    if (!city_name) {
        throw new Error("City name is required");
    }
    const existingName = await prisma_1.default.city.findUnique({
        where: { city_name },
    });
    if (existingName) {
        throw new Error("City already exists");
    }
    const baseSlug = (0, slugify_1.generateSlug)(city_name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma_1.default.city.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
    }
    const city = await prisma_1.default.city.create({
        data: {
            city_name,
            slug,
        },
    });
    return city;
};
exports.createCityService = createCityService;
//  GET ALL CITIES
const getAllCitiesService = async () => {
    const cities = await prisma_1.default.city.findMany({
        orderBy: { created_at: "desc" },
    });
    return cities;
};
exports.getAllCitiesService = getAllCitiesService;
const updateCityService = async ({ id, city_name, }) => {
    if (!city_name) {
        throw new Error("City name is required");
    }
    const existingCity = await prisma_1.default.city.findUnique({
        where: { id },
    });
    if (!existingCity) {
        throw new Error("City not found");
    }
    const duplicateName = await prisma_1.default.city.findUnique({
        where: { city_name },
    });
    if (duplicateName && duplicateName.id !== existingCity.id) {
        throw new Error("City name already in use");
    }
    const baseSlug = (0, slugify_1.generateSlug)(city_name);
    let newSlug = baseSlug;
    let counter = 1;
    while (await prisma_1.default.city.findFirst({
        where: {
            slug: newSlug,
            NOT: { id: existingCity.id },
        },
    })) {
        newSlug = `${baseSlug}-${counter++}`;
    }
    const updatedCity = await prisma_1.default.city.update({
        where: { id: existingCity.id },
        data: {
            city_name,
            slug: newSlug,
        },
    });
    return updatedCity;
};
exports.updateCityService = updateCityService;
const deleteCityService = async ({ id, }) => {
    const city = await prisma_1.default.city.findUnique({
        where: { id },
    });
    if (!city) {
        throw new Error("City not found");
    }
    const batchCount = await prisma_1.default.batch.count({
        where: { city_id: city.id },
    });
    if (batchCount > 0) {
        throw new Error("Cannot delete city with active batches");
    }
    const studentCount = await prisma_1.default.student.count({
        where: { city_id: city.id },
    });
    if (studentCount > 0) {
        throw new Error("Cannot delete city with active students");
    }
    await prisma_1.default.city.delete({
        where: { id: city.id },
    });
    return true;
};
exports.deleteCityService = deleteCityService;
