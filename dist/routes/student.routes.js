"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const student_middleware_1 = require("../middlewares/student.middleware");
const optionalAuth_middleware_1 = require("../middlewares/optionalAuth.middleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const topic_controller_1 = require("../controllers/topic.controller");
const class_controller_1 = require("../controllers/class.controller");
const questionVisibility_controller_1 = require("../controllers/questionVisibility.controller");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const student_controller_1 = require("../controllers/student.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const profileImage_controller_1 = require("../controllers/profileImage.controller");
const batch_controller_1 = require("../controllers/batch.controller");
const city_controller_1 = require("../controllers/city.controller");
const recentQuestions_controller_1 = require("../controllers/recentQuestions.controller");
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const router = (0, express_1.Router)();
// Public route - optional authentication for canEdit flag
router.get("/profile/:username", optionalAuth_middleware_1.optionalAuth, student_controller_1.getPublicStudentProfile);
// All routes below require authentication + STUDENT role + student info extraction
router.use(auth_middleware_1.verifyToken, role_middleware_1.isStudent, student_middleware_1.extractStudentInfo);
// Current student info (lightweight - for header/homepage)
router.get("/me", student_controller_1.getCurrentStudent);
// Update current student profile (coding profiles, etc.)
router.put("/me", student_controller_1.updateStudentProfile);
// Batches
router.get("/batches", batch_controller_1.getAllBatches);
// Cities
router.get("/cities", city_controller_1.getAllCities);
// ===== TOPICS ROUTES =====
router.get("/topics", topic_controller_1.getTopicsWithBatchProgress); // All topics with batch-specific classes, total questions per batch, and topic-specific solved question count (frontend will calculate progress percentage)
router.get("/topics/:topicSlug", topic_controller_1.getTopicOverviewWithClassesSummary); // Topic overview with classes summary (name, duration, totalQuestions, solvedQuestions)
// ===== CLASSES ROUTES =====
router.get("/topics/:topicSlug/classes/:classSlug", class_controller_1.getClassDetailsWithFullQuestions); // Class details with full questions array & progress
// ===== Global  QUESTIONS ROUTES =====
router.get("/addedQuestions", rateLimiter_1.heavyLimiter, questionVisibility_controller_1.getAllQuestionsWithFilters); // All questions with filters and solved status
router.get("/recent-questions", recentQuestions_controller_1.getRecentQuestions); // Recently added questions (last 7 days by default)
// ===== LEADERBOARD ROUTES =====
router.post("/leaderboard", rateLimiter_1.heavyLimiter, leaderboard_controller_1.getStudentLeaderboard); // Single student leaderboard with top 10 and personal rank
// ===== PROFILE IMAGE ROUTES =====
router.post("/profile-image", upload_middleware_1.uploadSingle, profileImage_controller_1.uploadProfileImage); // Upload/Update profile image
router.delete("/profile-image", profileImage_controller_1.deleteProfileImage); // Delete profile image
router.patch("/username", student_controller_1.updateUsername); // Update username only
// ===== BOOKMARK ROUTES =====
router.get("/bookmarks", bookmark_controller_1.getBookmarks); // Get all bookmarks with pagination and filtering
router.post("/bookmarks", bookmark_controller_1.addBookmark); // Add new bookmark
router.put("/bookmarks/:questionId", bookmark_controller_1.updateBookmark); // Update bookmark description
router.delete("/bookmarks/:questionId", bookmark_controller_1.deleteBookmark); // Delete bookmark
exports.default = router;
