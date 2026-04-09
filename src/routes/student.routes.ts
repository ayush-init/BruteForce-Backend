import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { isStudent } from "../middlewares/role.middleware";
import { extractStudentInfo } from "../middlewares/student.middleware";
import { optionalAuth } from "../middlewares/optionalAuth.middleware";
import { heavyLimiter, apiLimiter } from "../middlewares/rateLimiter";
import { validateBody, validateQuery, validateParams, validateQueryAndParams } from "../middlewares/validation.middleware";
import { getTopicsWithBatchProgress, getTopicOverviewWithClassesSummary } from "../controllers/topic.controller";
import { getClassDetailsWithFullQuestions } from "../controllers/class.controller";
import { getAllQuestionsWithFilters } from "../controllers/questionVisibility.controller";
import { getStudentLeaderboard } from "../controllers/leaderboard.controller";
import { getCurrentStudent, getPublicStudentProfile, updateStudentProfile, updateUsername } from "../controllers/student.controller";
import { uploadSingle } from '../middlewares/upload.middleware';
import { uploadProfileImage, deleteProfileImage,} from '../controllers/profileImage.controller';
import { getAllBatches } from "../controllers/batch.controller";
import { getAllCities } from "../controllers/city.controller";
import { getRecentQuestions } from "../controllers/recentQuestions.controller";
import { getBookmarks, addBookmark, updateBookmark, deleteBookmark } from "../controllers/bookmark.controller";
import {
  updateStudentProfileSchema,
  updateUsernameSchema,
  usernameParamsSchema,
} from "../validations/student.validation";
import { topicSlugParamsSchema } from "../validations/topic.validation";
import { questionIdParamsSchema, addedQuestionsQuerySchema } from "../validations/question.validation";
import { studentLeaderboardSchema } from "../validations/leaderboard.validation";

const router = Router();

// Public route - optional authentication for canEdit flag
router.get("/profile/:username", optionalAuth, validateParams(usernameParamsSchema), getPublicStudentProfile);

// All routes below require authentication + STUDENT role + student info extraction
router.use(verifyToken, isStudent, extractStudentInfo);

// Current student info (lightweight - for header/homepage)
router.get("/me", getCurrentStudent);

// Update current student profile (coding profiles, etc.)
router.put("/me", validateBody(updateStudentProfileSchema), updateStudentProfile);

// Batches
router.get("/batches", getAllBatches);

// Cities
router.get("/cities", getAllCities);

// ===== TOPICS ROUTES =====
router.get("/topics", getTopicsWithBatchProgress); // All topics with batch-specific classes, total questions per batch, and topic-specific solved question count (frontend will calculate progress percentage)
router.get("/topics/:topicSlug", validateParams(topicSlugParamsSchema), getTopicOverviewWithClassesSummary); // Topic overview with classes summary (name, duration, totalQuestions, solvedQuestions)

// ===== CLASSES ROUTES =====
router.get("/topics/:topicSlug/classes/:classSlug", validateParams(topicSlugParamsSchema), getClassDetailsWithFullQuestions); // Class details with full questions array & progress

// ===== Global  QUESTIONS ROUTES =====
router.get("/addedQuestions", heavyLimiter, validateQuery(addedQuestionsQuerySchema), getAllQuestionsWithFilters); // All questions with filters and solved status
router.get("/recent-questions", getRecentQuestions); // Recently added questions (last 7 days by default)

// ===== LEADERBOARD ROUTES =====
router.post("/leaderboard", heavyLimiter, validateBody(studentLeaderboardSchema), getStudentLeaderboard); // Single student leaderboard with top 10 and personal rank

// ===== PROFILE IMAGE ROUTES =====
router.post("/profile-image", uploadSingle, uploadProfileImage);  // Upload/Update profile image
router.delete("/profile-image", deleteProfileImage);              // Delete profile image

router.patch("/username", validateBody(updateUsernameSchema), updateUsername); // Update username only

// ===== BOOKMARK ROUTES =====
router.get("/bookmarks", getBookmarks); // Get all bookmarks with pagination and filtering
router.post("/bookmarks", addBookmark); // Add new bookmark
router.put("/bookmarks/:questionId", validateParams(questionIdParamsSchema), updateBookmark); // Update bookmark description
router.delete("/bookmarks/:questionId", validateParams(questionIdParamsSchema), deleteBookmark); // Delete bookmark

export default router;