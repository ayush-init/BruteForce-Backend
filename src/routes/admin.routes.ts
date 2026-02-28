import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { isAdmin, isTeacherOrAbove } from "../middlewares/role.middleware";

// ==========================================
// IMPORT ALL CONTROLLERS (Uncomment as you build)
// ==========================================

// City controllers
import { 
  getAllCities, 
  // getCityById 
} from "../controllers/admin/city.controller";

// Batch controllers
import { 
  // getAllBatches,
  // getBatchById,
  getBatchesByCity 
} from "../controllers/admin/batch.controller";

// Topic controllers
import { 
  createTopic, 
  getAllTopics, 
  // getTopicById,
  // updateTopic,
  // deleteTopic
} from "../controllers/admin/topic.controller";

// Question controllers
// import {
//   createQuestion,
//   getAllQuestions,
//   getQuestionById,
//   getQuestionsByTopic,
//   updateQuestion,
//   deleteQuestion
// } from "../controllers/admin/question.controller";

// Class controllers
// import {
//   createClassForBatch,
//   getClassesByBatch,
//   getClassById,
//   updateClass,
//   deleteClass
// } from "../controllers/admin/class.controller";

// Assignment controllers
// import {
//   assignQuestionsToClass,
//   getQuestionsForClass,
//   unassignQuestionFromClass
// } from "../controllers/admin/assignment.controller";

// Student controllers
// import {
//   getStudentsByBatch,
//   getStudentById,
//   getStudentProgress
// } from "../controllers/admin/student.controller";

// Analytics controllers
// import {
//   getBatchAnalytics,
//   getClassAnalytics
// } from "../controllers/admin/analytics.controller";

const router = Router();

// All routes require authentication + ADMIN role
router.use(verifyToken, isAdmin);

// ==========================================
// 🌍 STEP 1: SELECT CITY
// ==========================================

router.get("/cities", getAllCities);
// Usage: GET /api/admin/cities

// router.get("/cities/:cityId", getCityById);
// Usage: GET /api/admin/cities/1

// ==========================================
// 🎓 STEP 2: SELECT BATCH IN THAT CITY
// ==========================================

router.get("/cities/:cityId/batches", getBatchesByCity);
// Usage: GET /api/admin/cities/1/batches

// router.get("/cities/:cityId/batches/:batchId", getBatchById);
// Usage: GET /api/admin/cities/1/batches/1

// ==========================================
// 👨‍🎓 VIEW STUDENTS IN THIS BATCH
// ==========================================

// router.get("/cities/:cityId/batches/:batchId/students", getStudentsByBatch);
// Usage: GET /api/admin/cities/1/batches/1/students

// router.get("/cities/:cityId/batches/:batchId/students/:studentId", getStudentById);
// Usage: GET /api/admin/cities/1/batches/1/students/1

// router.get("/cities/:cityId/batches/:batchId/students/:studentId/progress", getStudentProgress);
// Usage: GET /api/admin/cities/1/batches/1/students/1/progress

// ==========================================
// 🏫 CREATE & MANAGE CLASSES IN THIS BATCH
// ==========================================

// router.get("/cities/:cityId/batches/:batchId/classes", getClassesByBatch);
// Usage: GET /api/admin/cities/1/batches/1/classes

// router.post("/cities/:cityId/batches/:batchId/classes", createClassForBatch);
// Usage: POST /api/admin/cities/1/batches/1/classes
// Body: { topic_id, class_number, class_date, pdf_url, description, duration_minutes }

// router.get("/cities/:cityId/batches/:batchId/classes/:classId", getClassById);
// Usage: GET /api/admin/cities/1/batches/1/classes/1

// router.patch("/cities/:cityId/batches/:batchId/classes/:classId", isTeacherOrAbove, updateClass);
// Usage: PATCH /api/admin/cities/1/batches/1/classes/1
// Body: { class_number?, pdf_url?, description?, duration_minutes? }

// router.delete("/cities/:cityId/batches/:batchId/classes/:classId", isTeacherOrAbove, deleteClass);
// Usage: DELETE /api/admin/cities/1/batches/1/classes/1

// ==========================================
// 🔗 ASSIGN QUESTIONS TO A CLASS
// ==========================================

// router.get("/cities/:cityId/batches/:batchId/classes/:classId/questions", getQuestionsForClass);
// Usage: GET /api/admin/cities/1/batches/1/classes/1/questions

// router.post("/cities/:cityId/batches/:batchId/classes/:classId/assign-questions", assignQuestionsToClass);
// Usage: POST /api/admin/cities/1/batches/1/classes/1/assign-questions
// Body: { question_ids: [1, 2, 3, 4, 5] }

// router.delete("/cities/:cityId/batches/:batchId/classes/:classId/questions/:questionId", isTeacherOrAbove, unassignQuestionFromClass);
// Usage: DELETE /api/admin/cities/1/batches/1/classes/1/questions/5

// ==========================================
// 📊 BATCH ANALYTICS
// ==========================================

// router.get("/cities/:cityId/batches/:batchId/analytics", getBatchAnalytics);
// Usage: GET /api/admin/cities/1/batches/1/analytics

// router.get("/cities/:cityId/batches/:batchId/classes/:classId/analytics", getClassAnalytics);
// Usage: GET /api/admin/cities/1/batches/1/classes/1/analytics

// ==========================================
// 📚 TOPIC MANAGEMENT (Global)
// ==========================================

router.get("/topics", getAllTopics);
// Usage: GET /api/admin/topics

router.post("/topics", isTeacherOrAbove, createTopic);
// Usage: POST /api/admin/topics
// Body: { topic_name }

// router.get("/topics/:topicId", getTopicById);
// Usage: GET /api/admin/topics/1

// router.patch("/topics/:topicId", isTeacherOrAbove, updateTopic);
// Usage: PATCH /api/admin/topics/1
// Body: { topic_name }

// router.delete("/topics/:topicId", isTeacherOrAbove, deleteTopic);
// Usage: DELETE /api/admin/topics/1

// ==========================================
// ❓ QUESTION MANAGEMENT (Global)
// ==========================================

// router.get("/questions", getAllQuestions);
// Usage: GET /api/admin/questions?topic_id=1&level=EASY

// router.post("/questions", createQuestion);
// Usage: POST /api/admin/questions
// Body: { question_name, question_link, platform, level, type, topic_id }

// router.get("/questions/topic/:topicId", getQuestionsByTopic);
// Usage: GET /api/admin/questions/topic/1

// router.get("/questions/:questionId", getQuestionById);
// Usage: GET /api/admin/questions/1

// router.patch("/questions/:questionId", isTeacherOrAbove, updateQuestion);
// Usage: PATCH /api/admin/questions/1
// Body: { level?, type?, question_name? }

// router.delete("/questions/:questionId", isTeacherOrAbove, deleteQuestion);
// Usage: DELETE /api/admin/questions/1

// ==========================================
// 🔍 CONVENIENCE ROUTES
// ==========================================

// router.get("/batches", getAllBatches);
// Usage: GET /api/admin/batches

export default router;