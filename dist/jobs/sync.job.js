"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSyncJob = startSyncJob;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../config/prisma"));
const studentSync_queue_1 = require("../queues/studentSync.queue");
const leaderboardWindow_service_1 = require("../services/leaderboardSync/leaderboardWindow.service");
const syncStatus_1 = require("../utils/syncStatus");
const batchQuestions_store_1 = require("../store/batchQuestions.store");
function startSyncJob() {
    console.log("[CRON] Sync cron job system started");
    // Student Sync Cron: 5 AM, 2 PM, 8 PM
    // cron.schedule("0 5,14,20 * * *", async () => {
    node_cron_1.default.schedule("*/2 * * * *", async () => {
        const maxRetries = 3;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                // Check if sync is already running
                if ((0, syncStatus_1.isSyncRunning)()) {
                    console.log(`[CRON] Sync already running, skipping this cycle`);
                    return;
                }
                console.log(`[CRON] Student sync cycle started (attempt ${attempt + 1}/${maxRetries})`);
                // Check if queue is empty before starting new sync
                const queueCount = await studentSync_queue_1.studentSyncQueue.count();
                if (queueCount > 0) {
                    console.log(`[CRON] Queue not empty (${queueCount} jobs), skipping new sync`);
                    return;
                }
                // Set sync status
                (0, syncStatus_1.startSync)();
                // Load all batch questions once per sync cycle
                console.log(`[CRON] Loading batch questions for optimized sync`);
                const batchQuestionsQuery = await prisma_1.default.$queryRaw `
          SELECT 
            b.id as batch_id,
            array_agg(DISTINCT q.id) as question_ids,
            array_agg(DISTINCT q.question_link) as question_links
          FROM "Batch" b
          JOIN "Class" c ON c.batch_id = b.id
          JOIN "QuestionVisibility" qv ON qv.class_id = c.id
          JOIN "Question" q ON q.id = qv.question_id
          WHERE EXISTS (
            SELECT 1 FROM "Student" s WHERE s.batch_id = b.id
          )
          GROUP BY b.id
        `;
                // Convert to Map and store in memory
                const batchQuestionsMap = new Map();
                batchQuestionsQuery.forEach(batch => {
                    batchQuestionsMap.set(batch.batch_id, {
                        question_ids: batch.question_ids || [],
                        question_links: batch.question_links || []
                    });
                });
                (0, batchQuestions_store_1.setBatchQuestions)(batchQuestionsMap);
                console.log(`[CRON] Loaded questions for ${batchQuestionsMap.size} batches`);
                // Get all students with batch assignments
                const students = await prisma_1.default.student.findMany({
                    where: {
                        batch_id: { not: null }
                    },
                    select: {
                        id: true,
                        batch_id: true
                    }
                });
                console.log(`[CRON] Adding ${students.length} students to sync queue`);
                // Add all students to queue in bulk with batchId
                const jobs = students.map(student => ({
                    name: 'sync-student',
                    data: { studentId: student.id, batchId: student.batch_id },
                    opts: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 1000
                        }
                    }
                }));
                await studentSync_queue_1.studentSyncQueue.addBulk(jobs);
                console.log(`[CRON]❤️❤️❤️❤️ Successfully added ${students.length} students to sync queue`);
                break;
            }
            catch (error) {
                attempt++;
                console.error(`[CRON] Student sync attempt ${attempt} failed:`, error);
                if (attempt >= maxRetries) {
                    console.error("[CRON] All student sync attempts failed");
                    break;
                }
                // Exponential backoff: 2s, 4s, 8s
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`[CRON] Retrying student sync in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    });
    // Leaderboard Sync Cron: 9 AM, 6 PM, 11 PM
    node_cron_1.default.schedule("0 9,18,23 * * *", async () => {
        try {
            console.log("[CRON] Leaderboard sync cycle started");
            await (0, leaderboardWindow_service_1.tryRunLeaderboard)();
            console.log("[CRON] Leaderboard sync cycle completed");
        }
        catch (error) {
            console.error("[CRON] Leaderboard sync failed:", error);
        }
    });
    console.log("[CRON] Student sync: 5 AM, 2 PM, 8 PM (0 5,14,20 * * *)");
    console.log("[CRON] Leaderboard sync: 9 AM, 6 PM, 11 PM (0 9,18,23 * * *)");
    console.log("[CRON] Queue-based system with rate limiting and retry logic initialized");
}
