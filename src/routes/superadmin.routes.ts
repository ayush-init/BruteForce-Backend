import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../middlewares/role.middleware";

// City controllers
import { 
  createCity, 
  getAllCities, 
  //getCityById,
  //updateCity,
  //deleteCity 
} from "../controllers/admin/city.controller";

// Batch controllers
import { 
  createBatch, 
 // getAllBatches,
  //getBatchById,
  //updateBatch,
  //deleteBatch
} from "../controllers/admin/batch.controller";

// Admin management
import { registerAdmin } from "../controllers/auth.controller";
import prisma from "../config/prisma";

const router = Router();

// All routes require authentication + SUPERADMIN role
router.use(verifyToken, isSuperAdmin);

// ===== CITY MANAGEMENT =====
router.post("/cities", createCity);
router.get("/cities", getAllCities);
// router.get("/cities/:id", getCityById);
// router.patch("/cities/:id", updateCity);
// router.delete("/cities/:id", deleteCity);

// ===== BATCH MANAGEMENT =====
router.post("/batches", createBatch);
// router.get("/batches", getAllBatches);
// router.get("/batches/:id", getBatchById);
// router.patch("/batches/:id", updateBatch);
// router.delete("/batches/:id", deleteBatch);

// ===== ADMIN MANAGEMENT (Create Teachers/Interns) =====
router.post("/admins", registerAdmin);

// ===== SYSTEM STATS =====
router.get("/stats", async (req, res) => {
  try {
    const [
      totalCities,
      totalBatches,
      totalStudents,
      totalAdmins,
      totalQuestions,
      totalTopics
    ] = await Promise.all([
      prisma.city.count(),
      prisma.batch.count(),
      prisma.student.count(),
      prisma.admin.count(),
      prisma.question.count(),
      prisma.topic.count()
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;