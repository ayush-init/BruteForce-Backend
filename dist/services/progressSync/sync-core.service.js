"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOneStudent = syncOneStudent;
const prisma_1 = __importDefault(require("../../config/prisma"));
const leetcode_service_1 = require("../external/leetcode.service");
const gfg_service_1 = require("../external/gfg.service");
const ApiError_1 = require("../../utils/ApiError");
const sync_utils_service_1 = require("./sync-utils.service");
async function syncOneStudent(studentId, compareRealCount = true) {
    // 1 Load student + already solved progress from StudentProgress table
    const student = await prisma_1.default.student.findUnique({
        where: { id: studentId },
        include: {
            progress: {
                select: { question_id: true }
            }
        }
    });
    if (!student)
        throw new ApiError_1.ApiError(400, "Student not found");
    if (!student.batch_id)
        throw new ApiError_1.ApiError(400, "Student has no batch");
    // 2 Get batch questions through proper table relationships
    // Batch -> Class -> QuestionVisibility -> Question
    const batchQuestions = await prisma_1.default.$queryRaw `
    SELECT DISTINCT q.id, q.question_link
    FROM "Question" q
    JOIN "QuestionVisibility" qv ON q.id = qv.question_id
    JOIN "Class" c ON qv.class_id = c.id
    WHERE c.batch_id = ${student.batch_id}
  `;
    // 3 Build slug -> questionId map for quick API slug to DB ID lookup
    const questionMap = new Map();
    batchQuestions.forEach(q => {
        const slug = (0, sync_utils_service_1.extractSlug)(q.question_link);
        if (slug) {
            questionMap.set(slug, q.id);
        }
    });
    // 4 Already solved set to avoid duplicate progress entries
    const solvedSet = new Set(student.progress.map(p => p.question_id));
    const newProgressEntries = [];
    // ===============================
    // LEETCODE API INTEGRATION
    // ===============================
    if (student.leetcode_id) {
        // API Response Structure:
        // {
        //   totalSolved: 150,           // Total solved on LeetCode platform
        //   submissions: [              // Recent submissions array
        //     { titleSlug: "two-sum", statusDisplay: "Accepted" },
        //     { titleSlug: "add-two-numbers", statusDisplay: "Wrong Answer" },
        //     { titleSlug: "merge-sorted-array", statusDisplay: "Accepted" }
        //   ]
        // }
        const lcData = await (0, leetcode_service_1.fetchLeetcodeData)(student.leetcode_id);
        // LOGIC BRANCH: Compare real counts or process everything
        let shouldProcessLeetcode = true;
        if (compareRealCount) {
            // Only process if student solved new questions on platform
            shouldProcessLeetcode = lcData.totalSolved > student.lc_total_solved;
        }
        else {
        }
        if (shouldProcessLeetcode) {
            // Process submissions - only "Accepted" ones count
            lcData.submissions
                .filter(sub => sub.statusDisplay === "Accepted")
                .forEach(sub => {
                // Match API slug with our question map
                const questionId = questionMap.get(sub.titleSlug);
                if (questionId && !solvedSet.has(questionId)) {
                    newProgressEntries.push({
                        student_id: student.id,
                        question_id: questionId
                    });
                    solvedSet.add(questionId); // Add to solved set to avoid duplicates in this sync
                }
            });
        }
        else {
        }
        // Always update real count in Student table
        await prisma_1.default.student.update({
            where: { id: student.id },
            data: {
                lc_total_solved: lcData.totalSolved,
                last_synced_at: new Date()
            }
        });
    }
    // ===============================
    // GEEKSFORGEEKS API INTEGRATION
    // ===============================
    if (student.gfg_id) {
        // API Response Structure:
        // {
        //   totalSolved: 200,           // Total solved on GFG platform
        //   solvedSlugs: [              // Array of solved problem slugs
        //     "reverse-a-linked-list",
        //     "binary-search-tree",
        //     "dynamic-programming-knapsack"
        //   ]
        // }
        const gfgData = await (0, gfg_service_1.fetchGfgData)(student.gfg_id);
        // LOGIC BRANCH: Compare real counts or process everything
        let shouldProcessGfg = true;
        if (compareRealCount) {
            // Only process if student solved new questions on platform
            shouldProcessGfg = gfgData.totalSolved > student.gfg_total_solved;
        }
        else {
        }
        if (shouldProcessGfg) {
            // Process all solved slugs from GFG
            gfgData.solvedSlugs.forEach(slug => {
                // Match API slug with our question map
                const questionId = questionMap.get(slug);
                if (questionId && !solvedSet.has(questionId)) {
                    newProgressEntries.push({
                        student_id: student.id,
                        question_id: questionId
                    });
                    solvedSet.add(questionId); // Add to solved set to avoid duplicates
                }
            });
        }
        else {
        }
        // Always update real count in Student table
        await prisma_1.default.student.update({
            where: { id: student.id },
            data: {
                gfg_total_solved: gfgData.totalSolved,
                last_synced_at: new Date()
            }
        });
    }
    // 5 Bulk Insert into StudentProgress table
    // Insert all new progress entries in one database query
    if (newProgressEntries.length > 0) {
        await prisma_1.default.studentProgress.createMany({
            data: newProgressEntries,
            skipDuplicates: true // Safety net to prevent any duplicates
        });
    }
    else {
    }
    return {
        message: "Sync completed",
        newSolved: newProgressEntries.length,
        hadNewSolutions: newProgressEntries.length > 0,
        compareRealCount: compareRealCount // Return which logic was used
    };
}
