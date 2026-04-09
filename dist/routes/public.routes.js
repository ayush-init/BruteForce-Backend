"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const city_controller_1 = require("../controllers/city.controller");
const batch_controller_1 = require("../controllers/batch.controller");
const topic_controller_1 = require("../controllers/topic.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const topic_validation_1 = require("../validations/topic.validation");
const router = (0, express_1.Router)();
// Public routes - no authentication required
// These routes are used for dropdowns and filters
// Get all cities
router.get("/cities", city_controller_1.getAllCities);
// Get all batches
router.get("/batches", batch_controller_1.getAllBatches);
// Get topic progress by username (public profile view)
router.get("/topicprogress/:username", (0, validation_middleware_1.validateParams)(topic_validation_1.topicProgressByUsernameSchema), topic_controller_1.getTopicProgressByUsername);
// Get paginated topics for dropdown
router.get("/topics", (0, validation_middleware_1.validateQuery)(topic_validation_1.paginatedTopicsSchema), topic_controller_1.getPaginatedTopics);
exports.default = router;
