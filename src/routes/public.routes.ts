import { Router } from "express";
import { getAllCities } from "../controllers/city.controller";
import { getAllBatches } from "../controllers/batch.controller";
import { getTopicProgressByUsername, getPaginatedTopics } from "../controllers/topic.controller";
import { validateParams, validateQuery } from "../middlewares/validation.middleware";
import { topicProgressByUsernameSchema, paginatedTopicsSchema } from "../validations/topic.validation";

const router = Router();

// Public routes - no authentication required
// These routes are used for dropdowns and filters

// Get all cities
router.get("/cities", getAllCities);

// Get all batches
router.get("/batches", getAllBatches);

// Get topic progress by username (public profile view)
router.get("/topicprogress/:username", validateParams(topicProgressByUsernameSchema), getTopicProgressByUsername);

// Get paginated topics for dropdown
router.get("/topics", validateQuery(paginatedTopicsSchema), getPaginatedTopics);

export default router;
