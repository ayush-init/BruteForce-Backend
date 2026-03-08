"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
// City controllers
const city_controller_1 = require("../controllers/city.controller");
// Batch controllers
const batch_controller_1 = require("../controllers/batch.controller");
// Admin management
const auth_controller_1 = require("../controllers/auth.controller");
const prisma_1 = __importDefault(require("../config/prisma"));
const router = (0, express_1.Router)();
// All routes require authentication + SUPERADMIN role
router.use(auth_middleware_1.verifyToken, role_middleware_1.isSuperAdmin);
// ===== CITY =====
router.post("/cities", city_controller_1.createCity);
router.get("/cities", city_controller_1.getAllCities);
router.patch("/cities/:id", city_controller_1.updateCity);
router.delete("/cities/:id", city_controller_1.deleteCity);
// ===== BATCH =====
router.post("/batches", batch_controller_1.createBatch);
router.get("/batches", batch_controller_1.getAllBatches);
router.patch("/batches/:id", batch_controller_1.updateBatch);
router.delete("/batches/:id", batch_controller_1.deleteBatch);
// ===== ADMIN =====
// ===== ADMIN MANAGEMENT (Create Teachers/Interns) =====
router.post("/admins", auth_controller_1.registerAdmin);
// router.get("/admins", getAllAdmins);
// router.patch("/admins/:id", updateAdmin);
// router.delete("/admins/:id", deleteAdmin);
// ===== SYSTEM STATS =====
router.get("/stats", async (req, res) => {
    try {
        const [totalCities, totalBatches, totalStudents, totalAdmins, totalQuestions, totalTopics] = await Promise.all([
            prisma_1.default.city.count(),
            prisma_1.default.batch.count(),
            prisma_1.default.student.count(),
            prisma_1.default.admin.count(),
            prisma_1.default.question.count(),
            prisma_1.default.topic.count()
        ]);
        res.json({
            stats: {
                totalCities,
                totalBatches,
                totalStudents,
                totalAdmins,
                totalQuestions,
                totalTopics
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
exports.default = router;
