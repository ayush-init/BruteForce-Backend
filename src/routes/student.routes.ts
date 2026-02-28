import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { isStudent } from "../middlewares/role.middleware";
import prisma from "../config/prisma";

// ==========================================
// IMPORT ALL STUDENT CONTROLLERS
// ==========================================

// Profile controllers
// import {
//   getProfile,
//   updateProfile,
//   completeProfile
// } from "../controllers/student/profile.controller";

// // Question controllers
// import {
//   getAssignedQuestions,
//   getQuestionById,
//   markQuestionSolved,
//   getQuestionsByClass
// } from "../controllers/student/question.controller";

// // Progress controllers
// import {
//   getMyProgress,
//   getProgressByTopic,
//   getProgressByLevel,
//   getRecentlySolved
// } from "../controllers/student/progress.controller";

// // Dashboard controllers
// import {
//   getDashboard,
//   getMyStats
// } from "../controllers/student/dashboard.controller";

// // Leaderboard controllers
// import {
//   getBatchLeaderboard,
//   getCityLeaderboard,
//   getMyRank
// } from "../controllers/student/leaderboard.controller";

// // Class controllers
// import {
//   getMyClasses,
//   getClassDetails
// } from "../controllers/student/class.controller";

// // Bookmark controllers
// import {
//   addBookmark,
//   removeBookmark,
//   getMyBookmarks
// } from "../controllers/student/bookmark.controller";
// import prisma from "../config/prisma";

const router = Router();

// All routes require authentication + STUDENT role
router.use(verifyToken, isStudent);

// ==========================================
// 👤 PROFILE MANAGEMENT
// ==========================================

// router.get("/profile", getProfile);
// Usage: GET /api/student/profile
// Returns: { id, name, email, city, batch, leetcode_id, gfg_id, is_profile_complete }

// router.patch("/profile", updateProfile);
// Usage: PATCH /api/student/profile
// Body: { city_id?, batch_id?, leetcode_id?, gfg_id?, enrollment_id? }
// Updates profile and marks as complete if city + batch are set

// router.post("/profile/complete", completeProfile);
// Usage: POST /api/student/profile/complete
// Body: { city_id, batch_id, enrollment_id? }
// First-time profile completion (mandatory: city + batch)

// ==========================================
// 📚 VIEW ASSIGNED QUESTIONS
// ==========================================

// router.get("/questions", getAssignedQuestions);
// Usage: GET /api/student/questions
// GET /api/student/questions?topic_id=1
// GET /api/student/questions?level=EASY
// GET /api/student/questions?platform=LEETCODE
// Returns: All questions assigned to student's batch with solved status

// router.get("/questions/:questionId", getQuestionById);
// Usage: GET /api/student/questions/1
// Returns: Single question details with solved status

// router.get("/classes/:classId/questions", getQuestionsByClass);
// Usage: GET /api/student/classes/1/questions
// Returns: All questions assigned to a specific class

// ==========================================
// ✅ MARK QUESTIONS AS SOLVED
// ==========================================

// router.post("/questions/:questionId/solve", markQuestionSolved);
// Usage: POST /api/student/questions/1/solve
// Body: {} (empty or optional metadata)
// Marks question as solved (creates record in StudentProgress)

router.delete("/questions/:questionId/solve", async (req, res) => {
  // Usage: DELETE /api/student/questions/1/solve
  // Unmarks question as solved (deletes from StudentProgress)
  // For accidental marks or testing
  try {
    const { questionId } = req.params;
    const studentId = req.user!.id;

    await prisma.studentProgress.delete({
      where: {
        student_id_question_id: {
          student_id: studentId,
          question_id: parseInt(questionId)
        }
      }
    });

    res.json({ message: "Question unmarked as solved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to unmark question" });
  }
});

// ==========================================
// 📊 PROGRESS TRACKING
// ==========================================

// router.get("/progress", getMyProgress);
// Usage: GET /api/student/progress
// Returns: {
//   total_solved: 20,
//   by_level: { EASY: 8, MEDIUM: 10, HARD: 2 },
//   by_platform: { LEETCODE: 15, GFG: 5 },
//   by_topic: { "Arrays": 10, "Linked Lists": 5 },
//   by_type: { HOMEWORK: 12, CLASSWORK: 8 }
// }

// router.get("/progress/topics", getProgressByTopic);
// Usage: GET /api/student/progress/topics
// Returns: [
//   { topic_name: "Arrays", total_questions: 25, solved: 10, percentage: 40 },
//   { topic_name: "Linked Lists", total_questions: 20, solved: 5, percentage: 25 }
// ]

// router.get("/progress/levels", getProgressByLevel);
// Usage: GET /api/student/progress/levels
// Returns: {
//   EASY: { total: 50, solved: 30, percentage: 60 },
//   MEDIUM: { total: 40, solved: 15, percentage: 37.5 },
//   HARD: { total: 10, solved: 2, percentage: 20 }
// }

// router.get("/progress/recent", getRecentlySolved);
// Usage: GET /api/student/progress/recent?limit=10
// Returns: [
//   { question_name: "Two Sum", level: "EASY", solved_at: "2025-02-01..." },
//   { question_name: "Best Time to Buy Stock", level: "MEDIUM", solved_at: "2025-02-01..." }
// ]

// ==========================================
// 🏠 DASHBOARD
// ==========================================

// router.get("/dashboard", getDashboard);
// Usage: GET /api/student/dashboard
// Returns: {
//   profile: { name, batch, city },
//   stats: {
//     total_solved: 20,
//     rank_in_batch: 5,
//     rank_in_city: 25,
//     streak: 7
//   },
//   progress: {
//     by_level: {...},
//     by_topic: {...}
//   },
//   recent_solved: [...],
//   upcoming_classes: [...],
//   pending_questions: [...]
// }

// router.get("/stats", getMyStats);
// Usage: GET /api/student/stats
// Returns: {
//   total_solved: 20,
//   rank_in_batch: 5,
//   rank_in_city: 25,
//   percentile_in_batch: 90,
//   streak_days: 7,
//   last_solved_at: "2025-02-01..."
// }

// ==========================================
// 🏆 LEADERBOARD
// ==========================================

// router.get("/leaderboard/batch", getBatchLeaderboard);
// Usage: GET /api/student/leaderboard/batch
// Returns: [
//   { rank: 1, student: { name, username }, solved_count: 45 },
//   { rank: 2, student: { name, username }, solved_count: 40 },
//   { rank: 5, student: { name: "You", username }, solved_count: 20, is_me: true }
// ]

// router.get("/leaderboard/city", getCityLeaderboard);
// Usage: GET /api/student/leaderboard/city
// Returns: City-wide leaderboard with current student highlighted

// router.get("/leaderboard/rank", getMyRank);
// Usage: GET /api/student/leaderboard/rank
// Returns: {
//   rank_in_batch: 5,
//   total_in_batch: 50,
//   rank_in_city: 25,
//   total_in_city: 200,
//   percentile_batch: 90,
//   percentile_city: 87.5
// }

// ==========================================
// 🏫 MY CLASSES
// ==========================================

// router.get("/classes", getMyClasses);
// Usage: GET /api/student/classes
// Returns: [
//   { 
//     id: 1, 
//     class_number: "Class 1", 
//     topic: { topic_name: "Arrays" },
//     class_date: "2025-02-05...",
//     pdf_url: "...",
//     total_questions: 10,
//     solved_questions: 7,
//     completion_percentage: 70
//   }
// ]

// router.get("/classes/:classId", getClassDetails);
// Usage: GET /api/student/classes/1
// Returns: {
//   id: 1,
//   class_number: "Class 1",
//   topic: { topic_name: "Arrays" },
//   class_date: "2025-02-05...",
//   pdf_url: "...",
//   description: "...",
//   questions: [
//     { id: 1, question_name: "Two Sum", level: "EASY", is_solved: true },
//     { id: 2, question_name: "Best Time to Buy", level: "MEDIUM", is_solved: false }
//   ]
// }

// ==========================================
// 🔖 BOOKMARKS
// ==========================================

// router.post("/bookmarks/:questionId", addBookmark);
// Usage: POST /api/student/bookmarks/1
// Adds question to bookmarks

// router.delete("/bookmarks/:questionId", removeBookmark);
// Usage: DELETE /api/student/bookmarks/1
// Removes question from bookmarks

// router.get("/bookmarks", getMyBookmarks);
// Usage: GET /api/student/bookmarks
// Returns: [
//   { 
//     id: 1, 
//     question: { 
//       question_name: "Two Sum", 
//       level: "EASY", 
//       platform: "LEETCODE",
//       is_solved: true 
//     },
//     bookmarked_at: "2025-02-01..."
//   }
// ]

// ==========================================
// 🔍 SEARCH & FILTERS
// ==========================================

router.get("/questions/search", async (req, res) => {
  // Usage: GET /api/student/questions/search?q=two%20sum
  // Searches questions by name
  try {
    const { q } = req.query;
    const studentId = req.user!.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { batch_id: true }
    });

    if (!student?.batch_id) {
      return res.status(400).json({ error: "Please complete your profile first" });
    }

    const questions = await prisma.question.findMany({
      where: {
        question_name: {
          contains: q as string,
          mode: 'insensitive'
        },
        visibility: {
          some: {
            batch_id: student.batch_id
          }
        }
      },
      include: {
        topic: true,
        progress: {
          where: { student_id: studentId }
        }
      },
      take: 20
    });

    const questionsWithStatus = questions.map(q => ({
      ...q,
      is_solved: q.progress.length > 0
    }));

    res.json({ questions: questionsWithStatus });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

// ==========================================
// 📈 ANALYTICS (Student's own data)
// ==========================================

router.get("/analytics/weekly", async (req, res) => {
  // Usage: GET /api/student/analytics/weekly
  // Returns: Questions solved per day for last 7 days
  try {
    const studentId = req.user!.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const progress = await prisma.studentProgress.findMany({
      where: {
        student_id: studentId,
        solved_at: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        solved_at: 'asc'
      }
    });

    // Group by day
    const dailyStats = progress.reduce((acc: any, item) => {
      const date = item.solved_at.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({ weekly_progress: dailyStats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/analytics/monthly", async (req, res) => {
  // Usage: GET /api/student/analytics/monthly
  // Returns: Questions solved per day for last 30 days
  try {
    const studentId = req.user!.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progress = await prisma.studentProgress.findMany({
      where: {
        student_id: studentId,
        solved_at: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        solved_at: 'asc'
      }
    });

    const dailyStats = progress.reduce((acc: any, item) => {
      const date = item.solved_at.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({ monthly_progress: dailyStats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ==========================================
// 🎯 PENDING/UPCOMING
// ==========================================

router.get("/questions/pending", async (req, res) => {
  // Usage: GET /api/student/questions/pending
  // Returns: Questions assigned but not yet solved
  try {
    const studentId = req.user!.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { batch_id: true }
    });

    if (!student?.batch_id) {
      return res.status(400).json({ error: "Please complete your profile first" });
    }

    // Get all assigned questions
    const assignedQuestions = await prisma.question.findMany({
      where: {
        visibility: {
          some: {
            batch_id: student.batch_id
          }
        }
      },
      include: {
        topic: true
      }
    });

    // Get solved question IDs
    const solvedQuestionIds = await prisma.studentProgress.findMany({
      where: { student_id: studentId },
      select: { question_id: true }
    }).then(items => items.map(i => i.question_id));

    // Filter out solved questions
    const pendingQuestions = assignedQuestions.filter(
      q => !solvedQuestionIds.includes(q.id)
    );

    res.json({ 
      pending_questions: pendingQuestions,
      count: pendingQuestions.length 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending questions" });
  }
});

router.get("/classes/upcoming", async (req, res) => {
  // Usage: GET /api/student/classes/upcoming
  // Returns: Upcoming classes (future class_date)
  try {
    const studentId = req.user!.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { batch_id: true }
    });

    if (!student?.batch_id) {
      return res.status(400).json({ error: "Please complete your profile first" });
    }

    const upcomingClasses = await prisma.class.findMany({
      where: {
        batch_id: student.batch_id,
        class_date: {
          gte: new Date()
        }
      },
      include: {
        topic: true,
        _count: {
          select: {
            questionVisibility: true
          }
        }
      },
      orderBy: {
        class_date: 'asc'
      },
      take: 5
    });

    res.json({ upcoming_classes: upcomingClasses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming classes" });
  }
});

export default router;