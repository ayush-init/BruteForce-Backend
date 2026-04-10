"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSyncWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const sync_core_service_1 = require("../services/progressSync/sync-core.service");
const batchQuestions_store_1 = require("../store/batchQuestions.store");
// Create worker for student sync jobs
exports.studentSyncWorker = new bullmq_1.Worker('student-sync', async (job) => {
    const { studentId, batchId } = job.data;
    try {
        console.log(`[WORKER] Processing sync job for student ${studentId} (batch ${batchId})`);
        // Get batch questions from memory store
        const batchData = (0, batchQuestions_store_1.getBatchQuestions)(batchId);
        if (!batchData) {
            console.log(`[WORKER] No batch questions found for batch ${batchId}, skipping student ${studentId}`);
            return;
        }
        try {
            // Add timeout safety to prevent stuck jobs
            const result = await Promise.race([
                (0, sync_core_service_1.syncOneStudent)(studentId, batchData),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Job timeout')), 10000) // 10 seconds timeout
                )
            ]);
            // Log based on the existing optimized logic results
            if (result.hadNewSolutions) {
                console.log(`[WORKER] Student ${studentId}: ${result.newSolved} new solutions added`);
            }
            else {
                console.log(`[WORKER] Student ${studentId}: No new solutions (skipped - optimized)`);
            }
            return result;
        }
        catch (error) {
            // Handle timeout specifically
            if (error.message === 'Job timeout') {
                console.error(`[WORKER] Student ${studentId}: Job timed out after 10 seconds`);
                throw error; // Re-throw for BullMQ retry
            }
            // Handle invalid usernames and API errors
            if (error.message?.includes('Invalid LeetCode username') ||
                error.message?.includes('Invalid GFG handle') ||
                error.status === 400 ||
                error.code === 'INVALID_USERNAME') {
                console.log(`[WORKER] Student ${studentId}: Invalid username/API error, skipping user`);
                return;
            }
            else {
                console.error(`[WORKER] Student ${studentId}: Sync failed -`, error.message || error);
                throw error; // Re-throw other errors for BullMQ retry
            }
        }
    }
    catch (error) {
        console.error(`[WORKER] Failed to sync student ${studentId}:`, error);
        throw error; // Re-throw to trigger BullMQ retry mechanism
    }
}, {
    connection: redis_1.redisConnection,
    concurrency: 3, // Process 3 jobs concurrently
});
// Error handling for the worker
exports.studentSyncWorker.on('error', (err) => {
    console.error('[WORKER] Student sync worker error:', err);
});
exports.studentSyncWorker.on('completed', (job, result) => {
    console.log(`[WORKER] Job ${job.id} completed for student ${job.data.studentId}`);
});
exports.studentSyncWorker.on('failed', (job, err) => {
    console.error(`[WORKER] Job ${job?.id} failed for student ${job?.data?.studentId}:`, err);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    await exports.studentSyncWorker.close();
    console.log('[WORKER] Student sync worker closed');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await exports.studentSyncWorker.close();
    console.log('[WORKER] Student sync worker closed');
    process.exit(0);
});
exports.default = exports.studentSyncWorker;
