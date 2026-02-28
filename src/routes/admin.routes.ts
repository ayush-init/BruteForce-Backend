import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { isSuperAdmin, isTeacherOrAbove } from "../middlewares/role.middleware";
import { createCity, getAllCities } from "../controllers/admin/city.controller";
import { createBatch, getBatchesByCity } from "../controllers/admin/batch.controller";
import { registerAdmin } from "../controllers/auth.controller";
import { createTopic, getAllTopics } from "../controllers/admin/topic.controller";

const router = Router();

// City
router.post("/cities", verifyToken, isSuperAdmin, createCity);
router.get("/cities", verifyToken, getAllCities);

// Batch
router.post("/batches", verifyToken, isSuperAdmin, createBatch);
router.get("/batches/:city_id", verifyToken, getBatchesByCity);


//teacher
router.post( "/admins", verifyToken, isSuperAdmin, registerAdmin);


// Topics
router.post("/topics", verifyToken, isTeacherOrAbove, createTopic);
router.get("/topics", verifyToken, getAllTopics);




export default router;